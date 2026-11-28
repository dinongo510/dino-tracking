// DINO-015 — Khởi động & chỉnh tư thế theo chuẩn NASM CEx 4 bước (hàm thuần).
// 1. Inhibit (Ức chế / lăn foam / SMR): ~30–60s mỗi bài
// 2. Lengthen (Kéo giãn tĩnh): ~30s mỗi bài
// 3. Activate (Kích hoạt cô lập): 10–15 lần, giữ 2s
// 4. Integrate (Tích hợp động): 8–10 lần, kiểm soát

export const STEPS = ['inhibit', 'lengthen', 'activate', 'integrate'];

export const STEP_META = {
  inhibit: { label: '1. Ức chế (Lăn foam / SMR)', dose: '45 giây', sec: 45 },
  lengthen: { label: '2. Kéo giãn (Static stretch)', dose: '30 giây', sec: 30 },
  activate: { label: '3. Kích hoạt (Activation)', dose: '12 lần', sec: 45 },
  integrate: { label: '4. Tích hợp (Integration)', dose: '10 lần', sec: 60 },
};

export const PAIN_TO_OHSA = {
  'Gối trái': ['ohsa:knees_in', 'ohsa:feet_turn_out'],
  'Gối phải': ['ohsa:knees_in', 'ohsa:feet_turn_out'],
  'Lưng dưới': ['ohsa:low_back_arch', 'ohsa:forward_lean'],
  'Lưng trên': ['ohsa:arms_forward'],
  'Vai trái': ['ohsa:arms_forward'],
  'Vai phải': ['ohsa:arms_forward'],
  'Cổ': ['ohsa:arms_forward'],
  'Cổ chân': ['ohsa:feet_turn_out'],
  'Hông': ['ohsa:knees_in', 'ohsa:forward_lean'],
};

export const GENERAL_BY_TYPE = {
  run: ['ohsa:feet_turn_out', 'ohsa:forward_lean'],
  upper: ['ohsa:arms_forward'],
  lower: ['ohsa:knees_in', 'ohsa:feet_turn_out'],
  strength: ['ohsa:knees_in', 'ohsa:forward_lean', 'ohsa:low_back_arch'],
  hyrox: ['ohsa:feet_turn_out', 'ohsa:knees_in', 'ohsa:forward_lean'],
  circuit: ['ohsa:knees_in', 'ohsa:arms_forward'],
  corrective: ['ohsa:knees_in', 'ohsa:forward_lean'],
  mixed: ['ohsa:knees_in', 'ohsa:arms_forward'],
};

/**
 * Sinh kế hoạch khởi động 5–8 phút (300–480 giây):
 * @param {Object} options
 * @param {Object} [options.ohsa] - Bù trừ OHSA của khách { knees_in: true, ... }
 * @param {string} [options.sessionType] - Loại buổi tập ('strength'|'run'|'hyrox'|'upper'|'lower'...)
 * @param {Array<string>} [options.pain] - Danh sách vùng đau ('Gối trái', ...)
 * @param {Array<Object>} options.exercises - Thư viện bài tập (có corrective_step và tags)
 * @returns {Array<{step: string, label: string, items: Array<{exercise_id: string, name_vi: string, dose: string, tags?: Array<string>}>, sec: number}>}
 */
export function warmupPlan({ ohsa = {}, sessionType = 'strength', pain = [], exercises = [] } = {}) {
  const ohsaCodes = Object.entries(ohsa || {}).filter(([, v]) => v).map(([k]) => 'ohsa:' + k);
  const painList = Array.isArray(pain) ? pain : [];
  const painTags = painList.flatMap((p) => PAIN_TO_OHSA[p] || []);

  const stNorm = String(sessionType || '').toLowerCase();
  const genTags = GENERAL_BY_TYPE[stNorm] || GENERAL_BY_TYPE.strength;

  const correctives = exercises.filter((e) => e.corrective_step);
  const usedIds = new Set();

  const plan = STEPS.map((step) => {
    const meta = STEP_META[step];
    const pool = correctives.filter((e) => e.corrective_step === step);

    // Tính điểm ưu tiên cho bài trong bước này
    const scored = pool.map((e) => {
      const tags = e.tags || [];
      let score = 0;
      // OHSA của khách
      for (const t of tags) if (ohsaCodes.includes(t)) score += 10;
      // Vùng đau từ readiness: ưu tiên cao cho bước inhibit & lengthen
      for (const t of tags) {
        if (painTags.includes(t)) {
          score += (step === 'inhibit' || step === 'lengthen') ? 15 : 5;
        }
      }
      // Khởi động chung theo loại buổi
      for (const t of tags) if (genTags.includes(t)) score += 2;
      return { e, score };
    }).sort((a, b) => b.score - a.score || a.e.name_vi.localeCompare(b.e.name_vi, 'vi'));

    // Số lượng bài: cơ bản mỗi bước 1–2 bài.
    // Nếu có đau: thêm 1 bài ở inhibit hoặc lengthen
    let targetCount = 2;
    if (step === 'integrate') {
      targetCount = (painList.length > 0 || ohsaCodes.length > 2) ? 2 : 1;
    } else if (step === 'inhibit' && painList.length > 0) {
      targetCount = 2;
    }

    const picked = [];
    for (const { e } of scored) {
      if (picked.length >= targetCount) break;
      if (!usedIds.has(e.id)) {
        picked.push(e);
        usedIds.add(e.id);
      }
    }
    // Nếu chưa đủ và còn bài trong pool thì cho phép lấy
    if (picked.length < 1 && scored.length > 0) {
      picked.push(scored[0].e);
      usedIds.add(scored[0].e.id);
    }

    const items = picked.map((e) => ({
      exercise_id: e.id,
      name_vi: e.name_vi,
      dose: meta.dose,
      tags: e.tags || [],
    }));

    const sec = items.length * meta.sec;
    return {
      step,
      label: meta.label,
      items,
      sec,
    };
  });

  // Kiểm tra tổng thời lượng đảm bảo trong khoảng 5–8 phút (300–480 giây)
  let totalSec = plan.reduce((s, p) => s + p.sec, 0);

  // Nếu thiếu thời lượng (< 300s): bổ sung thêm bài vào integrate hoặc lengthen
  if (totalSec < 300) {
    for (const p of plan) {
      if (totalSec >= 300) break;
      const meta = STEP_META[p.step];
      const avail = correctives.filter((e) => e.corrective_step === p.step && !usedIds.has(e.id));
      if (avail.length > 0) {
        const extra = avail[0];
        p.items.push({ exercise_id: extra.id, name_vi: extra.name_vi, dose: meta.dose, tags: extra.tags || [] });
        usedIds.add(extra.id);
        p.sec += meta.sec;
        totalSec += meta.sec;
      }
    }
  }

  // Nếu vượt 480s (8 phút): giảm bớt từ cuối
  if (totalSec > 480) {
    for (let i = plan.length - 1; i >= 0; i--) {
      if (totalSec <= 480) break;
      if (plan[i].items.length > 1) {
        const removed = plan[i].items.pop();
        usedIds.delete(removed.exercise_id);
        const meta = STEP_META[plan[i].step];
        plan[i].sec -= meta.sec;
        totalSec -= meta.sec;
      }
    }
  }

  return plan;
}
