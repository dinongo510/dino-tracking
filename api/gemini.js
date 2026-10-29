/**
 * DINO-005C — Same-origin Gemini API proxy.
 *
 * Browser -> same-origin Vercel function -> Google Gemini Interactions API.
 * The user's API key is forwarded for this request only; it is never persisted
 * or intentionally logged by this function.
 */
const ALLOWED_MODELS = new Set(["gemini-3.8-flash"]);
const MAX_INPUT_CHARS = 200_000;

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "Only POST is supported." } });
  }

  // Same-origin browser requests only. This is a CSRF/drive-by-abuse guard,
  // not a replacement for authentication or quota controls.
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) {
    return res.status(403).json({ error: { code: "ORIGIN_REQUIRED", message: "A same-origin browser request is required." } });
  }
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    return res.status(403).json({ error: { code: "INVALID_ORIGIN", message: "Invalid request origin." } });
  }
  if (originHost !== host) {
    return res.status(403).json({ error: { code: "CROSS_ORIGIN_BLOCKED", message: "Cross-origin requests are not allowed." } });
  }

  const apiKey = String(req.headers["x-gemini-api-key"] || "").trim();
  if (!apiKey) {
    return res.status(400).json({ error: { code: "NO_API_KEY", message: "Gemini API key is required." } });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const model = String(body.model || "");
  const input = typeof body.input === "string" ? body.input : "";
  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: { code: "MODEL_NOT_ALLOWED", message: "The requested model is not allowed." } });
  }
  if (!input.trim() || input.length > MAX_INPUT_CHARS) {
    return res.status(400).json({ error: { code: "INVALID_INPUT", message: "Input is empty or exceeds the allowed size." } });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({ model, input }),
      signal: controller.signal
    });

    const raw = await upstream.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { error: { message: "Gemini returned a non-JSON response." } };
    }

    if (!upstream.ok) {
      const status = [400, 401, 403, 404, 429].includes(upstream.status) ? upstream.status : 502;
      const upstreamMessage = data?.error?.message || data?.message || `Gemini request failed (HTTP ${upstream.status}).`;
      return res.status(status).json({
        error: {
          code: upstream.status === 401 ? "AUTHENTICATION" :
            upstream.status === 403 ? "FORBIDDEN" :
            upstream.status === 404 ? "MODEL_NOT_FOUND" :
            upstream.status === 429 ? "RATE_LIMIT" :
            upstream.status === 400 ? "BAD_REQUEST" : "PROVIDER_ERROR",
          message: upstreamMessage,
          upstreamStatus: upstream.status
        }
      });
    }

    const outputText = data.output_text ||
      (Array.isArray(data.steps) ? data.steps
        .filter(step => step.type === "model_output")
        .flatMap(step => step.content || [])
        .filter(item => item.type === "text" && typeof item.text === "string")
        .map(item => item.text)
        .join("\n") : "");

    if (typeof outputText !== "string" || !outputText.trim()) {
      return res.status(502).json({
        error: { code: "EMPTY_RESPONSE", message: "Gemini returned no text response.", upstreamStatus: upstream.status }
      });
    }

    return res.status(200).json({ output_text: outputText.trim() });
  } catch (err) {
    if (err && err.name === "AbortError") {
      return res.status(504).json({ error: { code: "UPSTREAM_TIMEOUT", message: "Gemini request timed out." } });
    }
    return res.status(502).json({ error: { code: "UPSTREAM_UNAVAILABLE", message: "Could not reach Gemini. Check network or try again." } });
  } finally {
    clearTimeout(timeout);
  }
};
