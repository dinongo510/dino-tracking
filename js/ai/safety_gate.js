/**
 * DINO-005C Phase 1 — Deterministic Safety / Authority Boundary
 */
class DinoAISafetyGate {
  before(context) {
    return {
      allowed: true,
      reason: "AI_ALLOWED",
      rules: [
        "AI is explanatory/reasoning layer, never prescription authority.",
        "DINO-005B remains deterministic ground truth.",
        "AI must not mutate prescription, actual performance, workout history, or corrective dosage/laterality.",
        "SAFETY_BLOCKED and NEEDS_LATERALITY remain authoritative."
      ]
    };
  }
  after(text, context) {
    const answer = String(text || "");
    const blockedMutation = /(đổi|sửa|thay đổi|override|ghi đè)\\s+(giáo án|prescription|dosage|liều|laterality|trái|phải)/i.test(answer);
    return { valid: !blockedMutation, text: answer, reason: blockedMutation ? "POSSIBLE_AUTHORITY_VIOLATION" : "VALID" };
  }
}
if (typeof window !== "undefined") window.DinoAISafetyGate = DinoAISafetyGate;
