/**
 * DINO-005C Phase 1 — Model Registry
 * Registry only; no provider SDK leakage.
 */
class DinoAIModelRegistry {
  constructor() {
    this.models = {
      "dino-default": {
        alias: "dino-default",
        provider: "gemini",
        model: "gemini-2.5-flash",
        capabilities: ["general", "coaching", "analysis"]
      }
    };
  }
  resolve(alias = "dino-default") {
    return this.models[alias] || this.models["dino-default"];
  }
}
if (typeof window !== "undefined") window.DinoAIModelRegistry = DinoAIModelRegistry;
