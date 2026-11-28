// DINO-012 — Check-in tuần + báo cáo giai đoạn: hàm thuần (test bằng Node). Công thức gốc ở formulas.js.
import { weeklyAvg, kcalAdjustment, e1rm } from './formulas.js';
import { addDays, mondayOf } from './plan.js';
import { carbFrom, adherenceRange } from './nutrition.js';

export const SCORE_VI = { sleep: ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'], stress: ['Rất thấp', 'Thấp', 'Vừa', 'Cao', 'Rất cao'], energy: ['Rất mệt', 'Mệt', 'Bình thường', 'Khỏe', 'Rất khỏe'] };
const dow = (iso) => new Date(iso + 'T00:00:00Z').getUTCDay(); // 0 = CN

/** Tuần cần check-in hôm nay (thứ 7, CN: tuần này; thứ 2, 3: tuần trước nếu còn thiếu), null nếu không cần */
export function checkinWeekFor(today, doneWeeks = new Set()) {
  const d = dow(today), thisWk = mondayOf(today);
  if (d === 6 || d === 0) return doneWeeks.has(thisWk) ? null : thisWk;
  if (d === 1 || d === 2) { const prev = addDays(thisWk, -7); return doneWeeks.has(prev) ? null : prev; }
  return null;
}

/** Cân TB từng tuần (mỗi phần tử = TB 7 ngày kết thúc Chủ nhật của tuần đó) */
export function weekAvgs(measurements, weekStarts) {
  const e = measurements.filter((m) => m.weight_kg != null).map((m) => ({ date: m.measured_on, weightKg: Number(m.weight_kg) }));
  return weekStarts.map((w) => weeklyAvg(e, addDays(w, 6)));
}

/** % buổi tập hoàn thành và % ăn đúng của 1 tuần (chỉ tính tới hôm nay) */
export function weekStats({ sessions, doneIds, checks, slotsCount, weekStart, today }) {
  const end = addDays(weekStart, 6) < today ? addDays(weekStart, 6) : today;
  const ss = sessions.filter((s) => s.scheduled_on >= weekStart && s.scheduled_on <= end);
  const days = Math.max(0, Math.round((Date.parse(end) - Date.parse(weekStart)) / 864e5) + 1);
  const ck = checks.filter((c) => c.check_date >= weekStart && c.check_date <= end);
  return {
    sessionsPct: ss.length ? Math.round((ss.filter((s) => doneIds.has(s.id)).length / ss.length) * 100) : null,
    eatPct: adherenceRange(ck, slotsCount, days),
  };
}

/** Đề xuất kcal (3 tuần cân TB cũ → mới + tuân thủ ăn) và mục tiêu mới nếu cần đổi */
export function kcalProposal({ goal, avgs, adherence, target }) {
  const a = kcalAdjustment({ goal, avgs, adherence: adherence ?? 0 });
  if (!target || !a.deltaKcal) return { ...a, next: null };
  const kcal = target.kcal + a.deltaKcal;
  return { ...a, next: { kcal, protein_g: target.protein_g, fat_g: target.fat_g, carb_g: carbFrom(kcal, target.protein_g, target.fat_g) } };
}

// ---------- Báo cáo giai đoạn ----------
const near = (rows, dateKey, from, to, pick) => {
  const inside = rows.filter((r) => r[dateKey] >= from && r[dateKey] <= to && pick(r));
  return inside.sort((a, b) => a[dateKey].localeCompare(b[dateKey]));
};
const num = (x) => (x == null ? null : Number(x));
const diff = (a, b) => (a == null || b == null ? null : Math.round((b - a) * 10) / 10);

/**
 * phase {start_date, end_date}; measurements/scans/photos của khách; sessions (của giai đoạn) + doneIds;
 * logs [{exercise_id, week_no, reps, load_kg, distance_m, done}]; checks + slotsCount; exById.
 * Mốc đầu = lần đo sớm nhất từ 7 ngày trước khi bắt đầu tới hết giai đoạn; mốc cuối = lần đo muộn nhất trong giai đoạn (+3 ngày).
 */
export function phaseReport({ phase, measurements = [], scans = [], photos = [], sessions = [], doneIds = new Set(), logs = [], checks = [], slotsCount = 0, exById = new Map(), today }) {
  const from = addDays(phase.start_date, -7), to = addDays(phase.end_date, 3);
  const ms = near(measurements, 'measured_on', from, to, () => true), sc = near(scans, 'scanned_on', from, to, () => true);
  const m0 = ms[0], m1 = ms.length > 1 ? ms[ms.length - 1] : null, s0 = sc[0], s1 = sc.length > 1 ? sc[sc.length - 1] : null;
  const row = (label, unit, a, b, better) => ({ label, unit, start: a, end: b, diff: diff(a, b), better });
  const body = [
    row('Cân nặng', 'kg', num(m0?.weight_kg ?? s0?.weight_kg), num(m1?.weight_kg ?? s1?.weight_kg), null),
    row('Vòng eo', 'cm', num(m0?.waist_cm), num(m1?.waist_cm), 'down'),
    row('Vòng mông', 'cm', num(m0?.hip_cm), num(m1?.hip_cm), null),
    row('Cơ xương (SMM)', 'kg', num(s0?.smm_kg), num(s1?.smm_kg), 'up'),
    row('Mỡ (PBF)', '%', num(s0?.pbf_pct), num(s1?.pbf_pct), 'down'),
    row('Khối không mỡ (FFM)', 'kg', num(s0?.ffm_kg), num(s1?.ffm_kg), 'up'),
  ].filter((r) => r.start != null || r.end != null);

  const ph = near(photos, 'taken_on', from, to, (p) => p.angle === 'front');
  const photoPair = { start: ph[0] || null, end: ph.length > 1 ? ph[ph.length - 1] : null };

  const weeks = Math.max(...sessions.map((s) => s.week_no || 1), 1);
  const early = (w) => w <= Math.min(2, weeks), late = (w) => w >= Math.max(weeks - 1, 1);
  const best = {};
  for (const l of logs) {
    if (l.done === false || !l.load_kg || !l.reps) continue;
    const v = e1rm(Number(l.load_kg), Number(l.reps)), b = (best[l.exercise_id] ||= { first: 0, last: 0 });
    if (early(l.week_no)) b.first = Math.max(b.first, v);
    if (late(l.week_no) && weeks > 1) b.last = Math.max(b.last, v);
  }
  const topGains = Object.entries(best).filter(([, b]) => b.first && b.last && b.last > b.first)
    .map(([id, b]) => ({ name: exById.get(id)?.name_vi || 'Bài tập', from: Math.round(b.first * 10) / 10, to: Math.round(b.last * 10) / 10, pct: Math.round(((b.last - b.first) / b.first) * 100) }))
    .sort((a, b) => b.pct - a.pct).slice(0, 3);
  const km = Math.round(logs.filter((l) => l.done !== false).reduce((s, l) => s + (Number(l.distance_m) || 0), 0) / 100) / 10;

  const end = phase.end_date < today ? phase.end_date : today;
  const days = Math.max(0, Math.round((Date.parse(end) - Date.parse(phase.start_date)) / 864e5) + 1);
  const ck = checks.filter((c) => c.check_date >= phase.start_date && c.check_date <= end);
  const due = sessions.filter((s) => s.scheduled_on && s.scheduled_on <= end);

  const lastWeek = addDays(phase.end_date, -6);
  const missing = [];
  if (!ms.some((m) => m.measured_on >= lastWeek) && !sc.some((s) => s.scanned_on >= lastWeek)) missing.push('số đo / cân cuối giai đoạn');
  if (sc.length && !sc.some((s) => s.scanned_on >= lastWeek)) missing.push('InBody cuối giai đoạn');
  if (!ph.some((p) => p.taken_on >= lastWeek)) missing.push('ảnh tiến độ cuối giai đoạn');

  return {
    body, photos: photoPair, topGains, km,
    sessionsDone: due.filter((s) => doneIds.has(s.id)).length, sessionsDue: due.length, sessionsTotal: sessions.length,
    eatPct: adherenceRange(ck, slotsCount, days), missing,
  };
}

/** Báo cáo mở cho khách khi giai đoạn còn ≤ 3 ngày (hoặc đã qua), hoặc khi coach đã tạo báo cáo */
export const reportOpen = (phase, today, hasReview) => hasReview || (phase.end_date && addDays(phase.end_date, -3) <= today);
