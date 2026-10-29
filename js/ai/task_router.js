/**
 * DINO-005C Phase 1 — Task / Intent Router
 * General-purpose conversation remains a first-class intent.
 */
class DinoAITaskRouter {
  classify(query) {
    const q = String(query || "").toLowerCase();
    if (/prehab|corrective|đau|gối|vai|lưng|gù|võng|scapular/.test(q)) return "PREHAB_EXPLANATION";
    if (/tăng tạ|overload|progressive|mức tạ|1rm|rir|rpe/.test(q)) return "PROGRESSION_QUERY";
    if (/form|kỹ thuật|cue|thực hiện|tư thế/.test(q)) return "FORM_CUE";
    if (/chạy|run|pace|km|zone|threshold|marathon|half/.test(q)) return "RUNNING_ANALYSIS";
    if (/hồi phục|recovery|ngủ|mệt|fatigue|stress/.test(q)) return "RECOVERY";
    if (/tiến độ|audit|thống kê|dữ liệu|volume|lịch sử/.test(q)) return "LOG_ANALYSIS";
    if (/giáo án|buổi tập|bài tập|tập/.test(q)) return "GENERAL_COACHING";
    return "GENERAL";
  }
}
if (typeof window !== "undefined") window.DinoAITaskRouter = DinoAITaskRouter;
