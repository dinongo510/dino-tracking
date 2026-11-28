// DINO-015 — Đánh giá độ sẵn sàng (Readiness) trước buổi tập (hàm thuần, không import supabase).
// 4 tiêu chí đánh giá (thang 1–5):
// - sleep: Giấc ngủ đêm qua (1: Rất tệ, 5: Rất sâu / đủ giấc) — chiều thuận
// - energy: Mức năng lượng (1: Kiệt sức, 5: Rất sung sức) — chiều thuận
// - soreness: Mức mỏi cơ (1: Không mỏi chút nào, 5: Rất mỏi / ê ẩm) — chiều nghịch (5 là tệ nhất)
// - stress: Căng thẳng thần kinh (1: Rất thoải mái, 5: Rất căng thẳng) — chiều nghịch (5 là tệ nhất)

/**
 * Tính điểm readiness 0–100 từ 4 điểm 1–5:
 * soreness và stress được đảo chiều: điểm tốt = 6 - giá trị (1 -> 5, 5 -> 1).
 * Tổng điểm thô = sleep + (6 - soreness) + (6 - stress) + energy (từ 4 đến 20).
 * Chuẩn hóa 0–100: Math.round(((tổng - 4) / 16) * 100).
 */
export function readinessScore({ sleep = 3, soreness = 3, stress = 3, energy = 3 } = {}) {
  const s = Math.max(1, Math.min(5, Number(sleep) || 3));
  const so = Math.max(1, Math.min(5, Number(soreness) || 3));
  const st = Math.max(1, Math.min(5, Number(stress) || 3));
  const e = Math.max(1, Math.min(5, Number(energy) || 3));
  const goodSoreness = 6 - so;
  const goodStress = 6 - st;
  const rawSum = s + goodSoreness + goodStress + e; // 4..20
  return Math.round(((rawSum - 4) / 16) * 100);
}

/**
 * Phân cấp level:
 * - 'green': score >= 70 và không có vùng đau
 * - 'yellow': score 50..69 và không có vùng đau
 * - 'red': score < 50 hoặc có ít nhất 1 vùng đau
 */
export function readinessLevel(score, pain = []) {
  if (pain && Array.isArray(pain) && pain.length > 0) return 'red';
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

/**
 * Gợi ý điều chỉnh cường độ buổi tập theo level (đúng theo brief):
 */
export function adjustment(level) {
  if (level === 'green') return 'Tập như kế hoạch';
  if (level === 'yellow') return 'Giảm 1 hiệp ở bài chính, RPE mục tiêu −1';
  return 'Buổi nhẹ: giữ kỹ thuật, bỏ hiệp nặng nhất / thay bằng mobility — nhắn Coach nếu đau';
}

export const LEVEL_LABEL_VI = {
  green: 'Sẵn sàng cao (Xanh)',
  yellow: 'Cần chú ý (Vàng)',
  red: 'Cảnh báo mỏi/đau (Đỏ)',
};
