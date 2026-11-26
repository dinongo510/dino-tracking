// DINO-009 — Giáo án theo chu kỳ: hàm thuần (test được bằng Node) + đọc/ghi Supabase
// Cây dữ liệu: program → phases → sessions → blocks → items (block_items)
import { generateWeek } from './formulas.js';

export const DAY_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const MODEL_VI = { linear: 'Tuyến tính', undulating: 'Phi tuyến tính (DUP)', block: 'Block', custom: 'Tự do' };
export const GOAL_VI = { fat_loss: 'Giảm mỡ', recomp: 'Recomp / sức khỏe', muscle_gain: 'Tăng cơ', performance: 'Thành tích' };
export const SESSION_TYPE_VI = { strength: 'Sức mạnh', run: 'Chạy', hyrox: 'HYROX', circuit: 'Circuit', corrective: 'Corrective', mixed: 'Kết hợp' };
export const BLOCK_VI = { straight: 'Thường', superset: 'Superset', circuit: 'Circuit', emom: 'EMOM', amrap: 'AMRAP', for_time: 'For time', run: 'Chạy', hyrox: 'HYROX', corrective: 'Corrective' };
export const BLOCK_FIELDS = { // trường riêng của khối hiện trên form
  straight: [], superset: [], corrective: [], run: [],
  circuit: ['rounds', 'work_sec', 'rest_sec'], hyrox: ['rounds', 'rest_sec'],
  emom: ['time_cap_sec'], amrap: ['time_cap_sec'], for_time: ['time_cap_sec'],
};
export const RULE_PRESETS = {
  none: { type: 'none' },
  double: { type: 'double', upper_kg: 2.5, lower_kg: 5 },
  linear_kg: { type: 'linear_weekly', step_kg: 2.5 },
  linear_pct: { type: 'linear_weekly', step_pct: 2.5 },
  rpe_wave: { type: 'rpe_wave', weeks: [7, 7.5, 8, 6] },
};
export const RULE_VI = { none: 'Giữ nguyên', double: 'Tăng tải kép (theo kết quả)', linear_kg: '+2,5 kg mỗi tuần', linear_pct: '+2,5 %1RM mỗi tuần', rpe_wave: 'Sóng RPE 7–7,5–8–6', dup_heavy: 'DUP: ngày nặng (3–5)', dup_medium: 'DUP: ngày vừa (6–10)', dup_light: 'DUP: ngày nhẹ (12–15)' };

export const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }));

// ---------- Ngày tháng (ISO yyyy-mm-dd, không lệch múi giờ) ----------
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export const sessionDate = (phaseStart, week, day) => (phaseStart ? addDays(phaseStart, (week - 1) * 7 + (day - 1)) : null);
export const phaseEnd = (start, weeks) => (start ? addDays(start, weeks * 7 - 1) : null);
/** Thứ Hai của tuần chứa ngày iso */
export function mondayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = CN
  return addDays(iso, wd === 0 ? -6 : 1 - wd);
}
export const todayISO = (now = new Date()) => new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// ---------- Quy tắc tăng tải ↔ lựa chọn trên form ----------
export function ruleKey(rule, dayNo) {
  if (!rule || rule.type === 'none') return 'none';
  if (rule.type === 'double') return 'double';
  if (rule.type === 'linear_weekly') return rule.step_pct != null ? 'linear_pct' : 'linear_kg';
  if (rule.type === 'rpe_wave') return 'rpe_wave';
  if (rule.type === 'dup') return 'dup_' + (rule.days?.[String(dayNo)] || 'medium');
  return 'none';
}
export function ruleFromKey(key, dayNo) {
  if (key.startsWith('dup_')) return { type: 'dup', days: { [String(dayNo)]: key.slice(4) } };
  return structuredClone(RULE_PRESETS[key] || RULE_PRESETS.none);
}

// ---------- Hiển thị 1 bài: "4 × 6–8 · 80 kg · RPE 8 · nghỉ 2:00" ----------
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export function itemSummary(it) {
  const p = [];
  const reps = it.reps_min != null ? (it.reps_max != null && it.reps_max !== it.reps_min ? `${it.reps_min}–${it.reps_max}` : `${it.reps_min}`) : null;
  if (it.sets && reps) p.push(`${it.sets} × ${reps}`); else if (it.sets && it.sets > 1) p.push(`${it.sets} hiệp`);
  if (it.distance_m) p.push(it.distance_m >= 1000 ? `${(it.distance_m / 1000).toLocaleString('vi-VN')} km` : `${it.distance_m} m`);
  if (it.duration_sec) p.push(it.duration_sec >= 120 ? `${Math.round(it.duration_sec / 60)} phút` : `${it.duration_sec} giây`);
  if (it.load_kg != null) p.push(`${it.load_kg} kg`);
  if (it.pct_1rm != null) p.push(`${it.pct_1rm}% 1RM`);
  if (it.target_rpe != null) p.push(`RPE ${it.target_rpe}`);
  if (it.target_pace) p.push(`pace ${it.target_pace}`);
  if (it.hr_zone) p.push(`vùng tim ${it.hr_zone}`);
  if (it.tempo) p.push(`tempo ${it.tempo}`);
  if (it.rest_sec) p.push(`nghỉ ${mmss(it.rest_sec)}`);
  return p.join(' · ');
}
export function blockSummary(b) {
  const p = [BLOCK_VI[b.block_type] || b.block_type];
  if (b.rounds) p.push(`${b.rounds} vòng`);
  if (b.work_sec) p.push(`${b.work_sec}s làm`);
  if (b.rest_sec) p.push(`${b.rest_sec}s nghỉ`);
  if (b.time_cap_sec) p.push(`${Math.round(b.time_cap_sec / 60)} phút`);
  return p.join(' · ');
}

// ---------- Sinh tuần 2…N từ tuần 1 ----------
const ITEM_KEYS = ['exercise_id', 'order_no', 'sets', 'reps_min', 'reps_max', 'load_kg', 'pct_1rm', 'target_rpe', 'tempo', 'rest_sec', 'distance_m', 'duration_sec', 'target_pace', 'hr_zone', 'progression_rule', 'note'];
const BLOCK_KEYS = ['order_no', 'label', 'block_type', 'rounds', 'work_sec', 'rest_sec', 'time_cap_sec', 'note'];
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

/**
 * week1: các buổi tuần 1 (mỗi buổi có blocks[].items[]). Trả về cây các buổi tuần 2…weeks (chưa có id).
 * Mỗi bài tính theo progression_rule của nó (formulas.generateWeek); tuần cuối deload nếu bật.
 */
export function generateWeeks(week1, weeks, { deload = true, phaseStart = null } = {}) {
  const out = [];
  for (let w = 2; w <= weeks; w++) {
    for (const s of week1) {
      out.push({
        week_no: w, day_no: s.day_no, title: s.title, session_type: s.session_type, coach_note: s.coach_note ?? null,
        scheduled_on: sessionDate(phaseStart, w, s.day_no),
        blocks: (s.blocks || []).map((b) => ({
          ...pick(b, BLOCK_KEYS),
          items: (b.items || []).map((it) => {
            const base = { sets: it.sets, reps_min: it.reps_min, reps_max: it.reps_max, load_kg: it.load_kg ?? null, pct_1rm: it.pct_1rm ?? null, target_rpe: it.target_rpe ?? null };
            const next = generateWeek({ base, rule: it.progression_rule || { type: 'none' }, week: w, totalWeeks: weeks, deloadLastWeek: deload, dayNo: s.day_no });
            const row = { ...pick(it, ITEM_KEYS), ...next };
            for (const k of ['load_kg', 'pct_1rm', 'target_rpe']) if (row[k] == null) delete row[k];
            return row;
          }),
        })),
      });
    }
  }
  return out;
}

// ---------- Mẫu giáo án (program_templates.payload) ↔ cây ----------
/** exByName: Map(name_vi chuẩn hóa → exercise). Trả về { phase, sessions, missing } */
export function templateToTree(payload, exByName, norm = (s) => s) {
  const missing = new Set();
  const sessions = (payload.sessions || []).map((s) => ({
    week_no: 1, day_no: s.day, title: s.title, session_type: s.type || 'strength', coach_note: s.note ?? null,
    blocks: (s.blocks || []).map((b, bi) => ({
      order_no: bi + 1, label: b.label ?? null, block_type: b.type || 'straight',
      rounds: b.rounds ?? null, work_sec: b.work_sec ?? null, rest_sec: b.rest_sec ?? null, time_cap_sec: b.time_cap_sec ?? null, note: b.note ?? null,
      items: (b.items || []).map((it, ii) => {
        const ex = exByName.get(norm(it.exercise));
        if (!ex) missing.add(it.exercise);
        const row = { order_no: ii + 1, exercise_id: ex?.id ?? null, _name: it.exercise, sets: it.sets ?? null, reps_min: it.reps_min ?? null, reps_max: it.reps_max ?? null,
          rest_sec: it.rest_sec ?? null, progression_rule: it.progression_rule || { type: 'none' }, note: it.note ?? null };
        for (const [k, t] of [['target_rpe', 'target_rpe'], ['pct', 'pct_1rm'], ['pct_1rm', 'pct_1rm'], ['load_kg', 'load_kg'], ['distance_m', 'distance_m'], ['duration_sec', 'duration_sec'], ['hr_zone', 'hr_zone'], ['target_pace', 'target_pace'], ['tempo', 'tempo']]) if (it[k] != null) row[t] = it[k];
        return row;
      }),
    })),
  }));
  return { phase: { name: payload.name, goal: payload.goal ?? null, weeks: payload.weeks || 4, handover_note: payload.handover_note ?? null }, model: payload.model || 'custom', sessions, missing: [...missing] };
}

export function treeToTemplate(phase, model, week1, exById) {
  return {
    name: phase.name, goal: phase.goal ?? null, model: model || 'custom', weeks: phase.weeks, handover_note: phase.handover_note ?? null,
    sessions: week1.map((s) => ({
      day: s.day_no, title: s.title, type: s.session_type, ...(s.coach_note ? { note: s.coach_note } : {}),
      blocks: (s.blocks || []).map((b) => ({
        type: b.block_type, label: b.label, ...Object.fromEntries(['rounds', 'work_sec', 'rest_sec', 'time_cap_sec', 'note'].filter((k) => b[k] != null).map((k) => [k, b[k]])),
        items: (b.items || []).map((it) => ({
          exercise: exById.get(it.exercise_id)?.name_vi || '(bài đã xóa)',
          ...Object.fromEntries(ITEM_KEYS.filter((k) => !['exercise_id', 'order_no'].includes(k) && it[k] != null).map((k) => [k, it[k]])),
        })),
      })),
    })),
  };
}

// ---------- Corrective từ OHSA ----------
const STEP_DEFAULTS = {
  inhibit: { sets: 1, duration_sec: 45, note: '30–60 giây mỗi điểm đau' },
  lengthen: { sets: 1, duration_sec: 30, note: 'Giữ 30 giây' },
  activate: { sets: 2, reps_min: 12, reps_max: 15, note: 'Giữ 2 giây ở đỉnh' },
  integrate: { sets: 2, reps_min: 10, reps_max: 12, note: 'Chậm, kiểm soát' },
};
/** ohsa: {feet_turn_out:true,...}; trả về items (mỗi bước tối đa `perStep` bài, không trùng) */
export function correctiveFromOhsa(ohsa, exercises, perStep = 2) {
  const codes = Object.entries(ohsa || {}).filter(([, v]) => v).map(([k]) => 'ohsa:' + k);
  if (!codes.length) return [];
  const items = [];
  for (const step of ['inhibit', 'lengthen', 'activate', 'integrate']) {
    const cand = exercises.filter((e) => e.corrective_step === step && (e.tags || []).some((t) => codes.includes(t)))
      .map((e) => ({ e, score: (e.tags || []).filter((t) => codes.includes(t)).length }))
      .sort((a, b) => b.score - a.score || a.e.name_vi.localeCompare(b.e.name_vi, 'vi'))
      .slice(0, perStep);
    for (const { e } of cand) items.push({ exercise_id: e.id, rest_sec: 0, progression_rule: { type: 'none' }, ...STEP_DEFAULTS[step] });
  }
  return items.map((it, i) => ({ ...it, order_no: i + 1 }));
}

/** HYROX: chèn "Chạy compromised 1 km" trước mỗi trạm (nếu chưa có) */
export function interleaveCompromised(items, runExercise) {
  if (!runExercise) return items;
  const out = [];
  for (const it of items) {
    if (it.exercise_id === runExercise.id) continue;
    out.push({ exercise_id: runExercise.id, sets: 1, distance_m: 1000, rest_sec: 0, progression_rule: { type: 'none' } }, it);
  }
  return out.map((it, i) => ({ ...it, order_no: i + 1 }));
}
