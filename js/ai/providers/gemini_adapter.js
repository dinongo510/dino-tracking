/**
 * DINO-005C Phase 1 — Gemini Provider Adapter
 */
class DinoGeminiAdapter {
  constructor(modelRegistry) {
    this.registry = modelRegistry;
  }

  async generate({ apiKey, modelAlias = "dino-default", systemInstruction, userQuery, context }) {
    if (!apiKey) throw Object.assign(new Error("API Key chưa được cấu hình."), { code: "NO_API_KEY" });
    const model = this.registry.resolve(modelAlias);
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model.model) + ":generateContent?key=" + encodeURIComponent(apiKey);

    const prompt = [
      systemInstruction,
      "CURRENT USER CONTEXT (PRIVATE, USER-SCOPED; DO NOT MIX WITH OTHER USERS):",
      JSON.stringify(context, null, 2),
      "USER QUESTION:",
      String(userQuery || "")
    ].join("\n\n");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1200 }
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const msg = data.error?.message || `HTTP ${response.status}`;
      const err = new Error(msg);
      err.httpStatus = response.status;
      err.code = response.status === 429 ? "RATE_LIMIT" :
        response.status === 403 ? "FORBIDDEN" :
        response.status === 404 ? "MODEL_NOT_FOUND" :
        response.status === 400 ? "BAD_REQUEST" : "PROVIDER_ERROR";
      throw err;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw Object.assign(new Error("Gemini không trả về phản hồi văn bản hợp lệ."), { code: "EMPTY_RESPONSE" });
    return text;
  }
}
if (typeof window !== "undefined") window.DinoGeminiAdapter = DinoGeminiAdapter;
