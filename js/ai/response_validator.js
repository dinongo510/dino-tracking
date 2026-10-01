/**
 * DINO-005C Phase 1 — Response Validator
 */
class DinoAIResponseValidator {
  validate(text, context) {
    const answer = String(text || "").trim();
    if (!answer) return { valid: false, reason: "EMPTY_RESPONSE", text: "" };

    // The validator does not rewrite the model's coaching advice.
    // It blocks explicit attempts to treat AI output as an authority that mutates DINO state.
    const authorityViolation = /(tự động|tôi sẽ)\\s+(đổi|sửa|ghi đè|thay đổi)s+(giáo án|prescription|lịch sử|actual performance|dosage|liều|laterality)/i.test(answer);
    if (authorityViolation) return { valid: false, reason: "AUTHORITY_VIOLATION", text: "" };

    return { valid: true, reason: "VALID", text: answer };
  }
}
if (typeof window !== "undefined") window.DinoAIResponseValidator = DinoAIResponseValidator;
