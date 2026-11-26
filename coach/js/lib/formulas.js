// =====================================================================
// DINO COACH — formulas.js  (ES module thuần, không phụ thuộc DOM/Supabase)
// Vị trí đề xuất: /coach/js/lib/formulas.js  · Status: PROPOSED
// Mọi kết quả là GỢI Ý — coach duyệt trước khi áp cho khách (Đặc tả mục 5).
// =====================================================================

const round = (x, d = 0) => Math.round(x * 10 ** d) / 10 ** d;

// ---------- 5.1 NĂNG LƯỢNG ----------
export const ACTIVITY_FACTORS = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725, athlete: 1.9 };

export function ageFromDob(dob, today = new Date()) {
  const d = new Date(dob);
  let a = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
  return a;
}

/** Mifflin-St Jeor. sex: 'male' | 'female' */
export function bmrMifflin({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return round(sex === 'male' ? base + 5 : base - 161);
}

/** Katch-McArdle — dùng khi có FFM từ InBody */
export function bmrKatch({ ffmKg }) {
  return round(370 + 21.6 * ffmKg);
}

/** Chọn công thức: có FFM → Katch, không → Mifflin */
export function bmrAuto({ sex, weightKg, heightCm, age, ffmKg }) {
  return ffmKg
    ? { formula: 'katch', bmr: bmrKatch({ ffmKg }) }
    : { formula: 'mifflin', bmr: bmrMifflin({ sex, weightKg, heightCm, age }) };
}

export function tdee(bmr, activityFactor) {
  return round(bmr * activityFactor);
}

const GOAL_ADJ = { fat_loss: -0.175, recomp: 0, muscle_gain: 0.075, performance: 0 };
const PROTEIN_G_PER_KG = { fat_loss: 2.2, recomp: 2.0, muscle_gain: 1.8, performance: 1.8 };

/**
 * Kcal + macro mục tiêu.
 * fat: 0.8 g/kg nhưng không dưới 20% kcal; carb = phần còn lại (không âm).
 */
export function nutritionTargets({ tdee: t, goal, weightKg, overrides = {} }) {
  const kcal = round(overrides.kcal ?? t * (1 + (GOAL_ADJ[goal] ?? 0)), -1);
  const protein = round(overrides.proteinG ?? PROTEIN_G_PER_KG[goal] * weightKg);
  const fatMin = (kcal * 0.2) / 9;
  const fat = round(overrides.fatG ?? Math.max(0.8 * weightKg, fatMin));
  const carb = Math.max(0, round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, proteinG: protein, fatG: fat, carbG: carb };
}

// ---------- 5.2 MEAL PLAN ----------
export const DEFAULT_SLOTS = [
  { name: 'Sáng', pct: 30 }, { name: 'Trưa', pct: 35 }, { name: 'Tối', pct: 25 }, { name: 'Phụ', pct: 10 },
];

export function splitKcal(kcal, slots = DEFAULT_SLOTS) {
  const total = slots.reduce((s, x) => s + x.pct, 0);
  return slots.map((s) => ({ ...s, kcal: round((kcal * s.pct) / total) }));
}

/** Tổng dinh dưỡng của 1 phương án: items = [{food:{kcal,protein_g,carb_g,fat_g}, qty}] */
export function optionTotals(items) {
  const t = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 };
  for (const { food, qty } of items) {
    t.kcal += food.kcal * qty; t.proteinG += (food.protein_g || 0) * qty;
    t.carbG += (food.carb_g || 0) * qty; t.fatG += (food.fat_g || 0) * qty;
  }
  return { kcal: round(t.kcal), proteinG: round(t.proteinG, 1), carbG: round(t.carbG, 1), fatG: round(t.fatG, 1) };
}

/** Phương án hợp lệ nếu kcal trong ±tol và protein ≥ minProteinShare × protein mục tiêu của bữa */
export function optionFits(totals, slotKcal, slotProteinG, tol = 0.1, minProteinShare = 0.8) {
  return Math.abs(totals.kcal - slotKcal) <= slotKcal * tol && totals.proteinG >= slotProteinG * minProteinShare;
}

const CHECK_SCORE = { on: 1, near: 0.5, off: 0 };
/** Tỉ lệ tuân thủ (0–100). checks = [{level}], expected = số bữa lẽ ra phải check */
export function adherencePct(checks, expected) {
  if (!expected) return null;
  const pts = checks.reduce((s, c) => s + (CHECK_SCORE[c.level] ?? 0), 0);
  return round((pts / expected) * 100);
}

// ---------- 5.3 ĐIỀU CHỈNH KCAL ----------
/** Trung bình cân 7 ngày gần nhất tính đến ngày `end` (entries: [{date:'YYYY-MM-DD', weightKg}]) */
export function weeklyAvg(entries, end) {
  const e = new Date(end), s = new Date(e); s.setDate(e.getDate() - 6);
  const w = entries.filter((x) => { const d = new Date(x.date); return d >= s && d <= e; }).map((x) => x.weightKg);
  return w.length ? round(w.reduce((a, b) => a + b, 0) / w.length, 2) : null;
}

/**
 * avgs: trung bình cân 3 tuần liên tiếp [w-2, w-1, w0]; adherence: % tuần gần nhất.
 * Trả về { action: 'none'|'decrease'|'increase'|'talk', deltaKcal, reason }
 */
export function kcalAdjustment({ goal, avgs, adherence }) {
  if (avgs.length < 3 || avgs.some((x) => x == null)) return { action: 'none', deltaKcal: 0, reason: 'Chưa đủ 3 tuần dữ liệu cân' };
  if (adherence < 80) return { action: 'talk', deltaKcal: 0, reason: 'Tuân thủ < 80%: cần trao đổi, chưa đổi kcal' };
  const [a, b, c] = avgs;
  const flat = Math.abs(b - a) / a < 0.002 && Math.abs(c - b) / b < 0.002; // < 0,2%/tuần
  const weeklyRate = (c - b) / b;
  if (goal === 'fat_loss') {
    if (flat) return { action: 'decrease', deltaKcal: -150, reason: 'Cân đứng 2 tuần' };
    if (weeklyRate < -0.01) return { action: 'increase', deltaKcal: 100, reason: 'Giảm > 1% cân/tuần' };
  }
  if (goal === 'muscle_gain') {
    if (flat || weeklyRate < 0) return { action: 'increase', deltaKcal: 150, reason: 'Cân không tăng 2 tuần' };
    if (weeklyRate > 0.005) return { action: 'decrease', deltaKcal: -100, reason: 'Tăng > 0,5% cân/tuần' };
  }
  return { action: 'none', deltaKcal: 0, reason: 'Đúng hướng' };
}

// ---------- 5.5 SỨC MẠNH & TĂNG TẢI ----------
export const e1rm = (kg, reps) => (reps <= 0 ? 0 : reps === 1 ? kg : round(kg * (1 + reps / 30), 1));
export const volumeLoad = (sets) => sets.reduce((s, x) => s + (x.reps || 0) * (x.loadKg || 0), 0);
export const kgFromPct = (oneRm, pct, step = 2.5) => round((oneRm * pct) / 100 / step) * step;

const LOWER = new Set(['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors']);
export const isLowerBody = (primaryMuscles = []) => primaryMuscles.some((m) => LOWER.has(m));

/**
 * Gợi ý tải buổi kế tiếp cho 1 bài (double progression).
 * item: {reps_min, reps_max, load_kg, progression_rule}; logs: [{reps, loadKg, rpe}]
 */
export function suggestNextLoad({ item, logs, primaryMuscles }) {
  const rule = item.progression_rule || { type: 'none' };
  if (!logs.length || rule.type !== 'double') return null;
  const load = item.load_kg ?? logs[0].loadKg;
  const hitTop = logs.every((l) => l.reps >= item.reps_max && (l.rpe == null || l.rpe <= 8));
  const missed = logs.filter((l) => l.reps < item.reps_min).length;
  if (hitTop) {
    const inc = isLowerBody(primaryMuscles) ? rule.lower_kg ?? 5 : rule.upper_kg ?? 2.5;
    return { loadKg: load + inc, reason: `Đạt ${item.reps_max} rep mọi hiệp, RPE ≤ 8` };
  }
  if (missed >= 2) return { loadKg: round(load * 0.95 / 2.5) * 2.5, reason: `Hụt ${item.reps_min} rep ở ${missed} hiệp` };
  return { loadKg: load, reason: 'Giữ tải' };
}

export const DUP_DEFAULTS = { heavy: [3, 5], medium: [6, 10], light: [12, 15] };

/**
 * Sinh tham số tuần w (1-based) từ tuần 1 theo quy tắc. Trả về các trường block_item cần ghi đè.
 * deloadLastWeek: tuần cuối giảm 40% số hiệp, RPE −2.
 */
export function generateWeek({ base, rule, week, totalWeeks, deloadLastWeek = true, dayNo }) {
  const out = { sets: base.sets, reps_min: base.reps_min, reps_max: base.reps_max,
    load_kg: base.load_kg, pct_1rm: base.pct_1rm, target_rpe: base.target_rpe };
  const i = week - 1;
  switch (rule?.type) {
    case 'linear_weekly':
      if (rule.step_kg != null && base.load_kg != null) out.load_kg = base.load_kg + rule.step_kg * i;
      if (rule.step_pct != null && base.pct_1rm != null) out.pct_1rm = base.pct_1rm + rule.step_pct * i;
      break;
    case 'rpe_wave':
      out.target_rpe = rule.weeks[i % rule.weeks.length];
      break;
    case 'dup': {
      const kind = rule.days?.[String(dayNo)];
      if (kind && DUP_DEFAULTS[kind]) [out.reps_min, out.reps_max] = DUP_DEFAULTS[kind];
      break;
    }
  }
  if (deloadLastWeek && week === totalWeeks && totalWeeks > 1) {
    out.sets = Math.max(1, Math.round((base.sets || 1) * 0.6));
    if (out.target_rpe != null) out.target_rpe = Math.max(5, out.target_rpe - 2);
    if (rule?.type === 'linear_weekly') { out.load_kg = base.load_kg; out.pct_1rm = base.pct_1rm; }
  }
  return out;
}

// ---------- CHẠY ----------
/** pace "m:ss" mỗi km */
export function pacePerKm(distanceM, durationSec) {
  if (!distanceM || !durationSec) return null;
  const s = Math.round(durationSec / (distanceM / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ---------- CẢNH BÁO (DINO-010 mục 2.5) ----------
/** recentFeedback: buổi đã xong, mới nhất trước: [{session_rpe, pain}] */
export function alertsFromFeedback(recentFeedback) {
  const out = [];
  const [last, prev] = recentFeedback;
  if (last?.pain?.length) out.push({ kind: 'pain', message: `Khách báo đau: ${last.pain.map((p) => `${p.area} (${p.level}/5)`).join(', ')}` });
  if (last?.session_rpe >= 9.5 && prev?.session_rpe >= 9.5) out.push({ kind: 'high_rpe', message: 'RPE buổi ≥ 9,5 hai buổi liên tiếp' });
  return out;
}

/** weeklyKm: [4 tuần trước..., tuần này] (≥ 5 phần tử) */
export function runningLoadAlert(weeklyKm) {
  if (weeklyKm.length < 5) return null;
  const cur = weeklyKm.at(-1), prev4 = weeklyKm.slice(-5, -1);
  const avg = prev4.reduce((a, b) => a + b, 0) / 4;
  return avg > 0 && cur > avg * 1.1 ? { kind: 'run_load', message: `Km tuần ${round(cur, 1)} > 110% TB 4 tuần (${round(avg, 1)})` } : null;
}

export function missedSessionsAlert(scheduledLastWeek, completedLastWeek) {
  const missed = scheduledLastWeek - completedLastWeek;
  return missed >= 2 ? { kind: 'missed', message: `Bỏ ${missed} buổi tuần trước` } : null;
}
