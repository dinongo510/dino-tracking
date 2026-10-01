/**
 * DINO-005C Phase 1 — AI Gateway
 * Provider-agnostic boundary + explicit status.
 */
class DinoAIGateway {
  constructor({ registry, adapters }) {
    this.registry = registry;
    this.adapters = adapters;
    this.status = "AI_OFFLINE";
  }

  getStatus() { return this.status; }

  async generate({ apiKey, modelAlias, task, userQuery, context, systemInstruction }) {
    if (!apiKey) {
      this.status = "AI_OFFLINE";
      throw Object.assign(new Error("AI_OFFLINE"), { code: "AI_OFFLINE" });
    }
    const model = this.registry.resolve(modelAlias);
    const adapter = this.adapters[model.provider];
    if (!adapter) {
      this.status = "AI_ERROR";
      throw Object.assign(new Error("Không có provider adapter cho model hiện tại."), { code: "ADAPTER_MISSING" });
    }
    try {
      this.status = "AI_CONNECTED";
      const text = await adapter.generate({
        apiKey, modelAlias, task, userQuery, context, systemInstruction
      });
      return { text, status: "AI_CONNECTED", provider: model.provider, model: model.model, task };
    } catch (err) {
      this.status = err.code === "AI_OFFLINE" ? "AI_OFFLINE" : "AI_ERROR";
      throw err;
    }
  }
}
if (typeof window !== "undefined") window.DinoAIGateway = DinoAIGateway;
