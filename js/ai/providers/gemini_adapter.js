/**
 * DINO-005C Phase 1 — Gemini Provider Adapter
 * Browser calls a same-origin Vercel function; the function calls Google.
 */
class DinoGeminiAdapter {
  constructor(modelRegistry) {
    this.registry = modelRegistry;
  }

  async generate({ apiKey, modelAlias = "dino-default", systemInstruction, userQuery, context }) {
    if (!apiKey) throw Object.assign(new Error("API Key chưa được cấu hình."), { code: "NO_API_KEY" });
    const model = this.registry.resolve(modelAlias);
    const prompt = [
      systemInstruction,
      "CURRENT USER CONTEXT (PRIVATE, USER-SCOPED; DO NOT MIX WITH OTHER USERS):",
      JSON.stringify(context, null, 2),
      "USER QUESTION:",
      String(userQuery || "")
    ].join("\n\n");

    let response;
    try {
      response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey
        },
        body: JSON.stringify({ model: model.model, input: prompt })
      });
    } catch (cause) {
      const err = new Error("Không thể kết nối DINO API proxy. Hãy kiểm tra mạng hoặc thử tải lại trang.");
      err.code = "PROXY_NETWORK_ERROR";
      err.cause = cause;
      throw err;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error?.message || `DINO API proxy failed (HTTP ${response.status}).`;
      const err = new Error(msg);
      err.apiError = {
        httpStatus: response.status,
        code: data?.error?.code || null,
        upstreamStatus: data?.error?.upstreamStatus || null
      };
      err.httpStatus = response.status;
      err.code = data?.error?.code || "PROXY_ERROR";
      throw err;
    }

    const outputText = data.output_text || "";
    if (typeof outputText !== "string" || !outputText.trim()) {
      const err = new Error("Gemini không trả về phản hồi văn bản.");
      err.code = "EMPTY_RESPONSE";
      throw err;
    }
    return outputText.trim();
  }
}
if (typeof window !== "undefined") window.DinoGeminiAdapter = DinoGeminiAdapter;
