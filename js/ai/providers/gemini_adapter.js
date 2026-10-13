/**
 * DINO-005C Phase 1 — Gemini Provider Adapter
 * Uses Google's current Interactions API and Gemini 3.8 Flash.
 */
class DinoGeminiAdapter {
  constructor(modelRegistry) {
    this.registry = modelRegistry;
  }

  async generate({ apiKey, modelAlias = "dino-default", systemInstruction, userQuery, context }) {
    if (!apiKey) throw Object.assign(new Error("API Key chưa được cấu hình."), { code: "NO_API_KEY" });
    const model = this.registry.resolve(modelAlias);
    const endpoint = "https://generativelanguage.googleapis.com/v1beta2/interactions";
    const prompt = [
      systemInstruction,
      "CURRENT USER CONTEXT (PRIVATE, USER-SCOPED; DO NOT MIX WITH OTHER USERS):",
      JSON.stringify(context, null, 2),
      "USER QUESTION:",
      String(userQuery || "")
    ].join("\n\n");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        model: model.model,
        input: prompt
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const msg = data.error?.message || data.message || `HTTP ${response.status}`;
      const err = new Error(msg);
      err.apiError = {
        httpStatus: response.status,
        status: data.error?.status || null,
        reason: data.error?.details?.find?.(d => d.reason)?.reason || null
      };
      err.httpStatus = response.status;
      err.code = response.status === 401 ? "AUTHENTICATION" :
        response.status === 429 ? "RATE_LIMIT" :
        response.status === 403 ? "FORBIDDEN" :
        response.status === 404 ? "MODEL_NOT_FOUND" :
        response.status === 400 ? "BAD_REQUEST" : "PROVIDER_ERROR";
      throw err;
    }

    const data = await response.json();
    const outputText = data.output_text ||
      (Array.isArray(data.steps) ? data.steps
        .filter(step => step.type === "model_output")
        .flatMap(step => step.content || [])
        .filter(item => item.type === "text" && typeof item.text === "string")
        .map(item => item.text)
        .join("\n") : "");
    if (!outputText.trim()) {
      const err = new Error("Gemini không trả về phản hồi văn bản. Trạng thái: " + (data.status || "unknown"));
      err.code = "EMPTY_RESPONSE";
      err.apiError = { status: data.status || null };
      throw err;
    }
    return outputText.trim();
  }
}
if (typeof window !== "undefined") window.DinoGeminiAdapter = DinoGeminiAdapter;
