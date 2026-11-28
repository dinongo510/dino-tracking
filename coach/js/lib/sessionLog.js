// DINO-010 — Phiếu buổi tập: hàm thuần (test bằng Node). Không gọi Supabase ở file này.
import { e1rm, volumeLoad, suggestNextLoad, pacePerKm } from './formulas.js';

export const PAIN_AREAS = ['Cổ', 'Vai trái', 'Vai phải', 'Khuỷu tay', 'Cổ tay', 'Lưng trên', 'Lưng dưới', 'Hông', 'Gối trái', 'Gối phải', 'Cổ chân', 'Khác'];
export const ROUND_BLOCKS = new Set(['circuit', 'hyrox']);           // mỗi vòng 1 dòng
export const TOTAL_BLOCKS = new Set(['amrap', 'emom', 'for_time']);   // 1 dòng tổng
export const PENDING_KEY = 'dcoach_pending_logs';

/** Kiểu dòng ghi: 'run' (cự ly/thời gian/HR) · 'timed' (giây) · 'reps' (rep/kg) */
export function rowKind(block, item, ex) {
  if (ex?.category === 'run' || block.block_type === 'run' || (item.distance_m && !item.reps_min)) return 'run';
  if (item.duration_sec && !item.reps_min) return 'timed';
  return 'reps';
}
export function rowCount(block, item) {
  if (TOTAL_BLOCKS.has(block.block_type)) return 1;
  if (ROUND_BLOCKS.has(block.block_type) && block.rounds) return Math.max(block.rounds, 1);
  return Math.max(item.sets || 1, 1);
}

/** Dòng của 1 bài = mục tiêu, ghép với log đã có (theo set_no). Điền sẵn reps_min (không phải max) để "không sửa gì" không kích hoạt tăng tải. */
export function buildRows(block, item, logs = []) {
  const by = new Map(logs.map((l) => [l.set_no, l]));
  return Array.from({ length: rowCount(block, item) }, (_, i) => {
    const n = i + 1, l = by.get(n);
    const target = { set_no: n, reps: item.reps_min ?? item.reps_max ?? null, load_kg: item.load_kg ?? null, rpe: null,
      distance_m: item.distance_m ?? null, duration_sec: item.duration_sec ?? null, avg_hr: null };
    return l && l.done !== false ? { ...target, ...strip(l), done: true } : { ...target, done: false };
  });
}
const strip = (l) => Object.fromEntries(['reps', 'load_kg', 'rpe', 'distance_m', 'duration_sec', 'avg_hr'].filter((k) => l[k] != null).map((k) => [k, Number(l[k])]));

/** So với mục tiêu: 'hit' | 'over' | 'under' | null */
export function grade(item, log) {
  if (!log || log.done === false) return null;
  if (item.reps_min != null && log.reps != null) {
    if (log.reps < item.reps_min) return 'under';
    if (log.reps > (item.reps_max ?? item.reps_min) || (item.load_kg != null && log.load_kg > item.load_kg)) return 'over';
    if (item.load_kg != null && log.load_kg != null && log.load_kg < item.load_kg) return 'under';
    return 'hit';
  }
  if (item.distance_m && log.distance_m != null) return log.distance_m < item.distance_m * 0.95 ? 'under' : 'hit';
  if (item.duration_sec && log.duration_sec != null) return log.duration_sec < item.duration_sec * 0.9 ? 'under' : 'hit';
  return 'hit';
}

/** "m:ss" ↔ giây */
export const toClock = (s) => (s == null ? '' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);
export function fromClock(str) {
  if (str == null || String(str).trim() === '') return null;
  const p = String(str).trim().split(':').map(Number);
  if (p.some((x) => !Number.isFinite(x))) return null;
  return p.length === 1 ? Math.round(p[0] * 60) : p.length === 2 ? p[0] * 60 + p[1] : p[0] * 3600 + p[1] * 60 + p[2];
}
export const pace = (distanceM, durationSec) => pacePerKm(distanceM, durationSec);

/** Thống kê buổi: khối lượng tạ, e1RM tốt nhất mỗi bài, đếm đạt/hụt/vượt, km chạy */
export function sessionStats(session, logsByItem, exById) {
  let volume = 0, km = 0; const counts = { hit: 0, over: 0, under: 0 }, best = [];
  for (const b of session.blocks) for (const it of b.items) {
    const logs = (logsByItem[it.id] || []).filter((l) => l.done !== false);
    volume += volumeLoad(logs.map((l) => ({ reps: l.reps, loadKg: l.load_kg })));
    km += logs.reduce((s, l) => s + (l.distance_m || 0), 0) / 1000;
    for (const l of logs) { const g = grade(it, l); if (g) counts[g]++; }
    const top = logs.filter((l) => l.load_kg && l.reps).map((l) => ({ v: e1rm(Number(l.load_kg), l.reps), l }))
      .sort((a, c) => c.v - a.v)[0];
    if (top) best.push({ item: it, ex: exById.get(it.exercise_id), e1rm: top.v, kg: Number(top.l.load_kg), reps: top.l.reps });
  }
  return { volume: Math.round(volume), km: Math.round(km * 100) / 100, counts, best: best.sort((a, c) => c.e1rm - a.e1rm) };
}

/** Gợi ý tải buổi sau cho các bài có quy tắc "double" */
export function suggestions(session, logsByItem, exById) {
  const out = [];
  for (const b of session.blocks) for (const it of b.items) {
    const logs = (logsByItem[it.id] || []).filter((l) => l.done !== false && l.reps != null)
      .map((l) => ({ reps: l.reps, loadKg: l.load_kg != null ? Number(l.load_kg) : null, rpe: l.rpe != null ? Number(l.rpe) : null }));
    if (!logs.length) continue;
    const ex = exById.get(it.exercise_id);
    const base = it.load_kg ?? logs[0].loadKg;
    if (base == null) continue;
    const s = suggestNextLoad({ item: { ...it, load_kg: base }, logs, primaryMuscles: ex?.primary_muscles || [] });
    if (s) out.push({ item: it, ex, current: base, ...s, change: Math.round((s.loadKg - base) * 100) / 100 });
  }
  return out;
}

// ---------- Hàng chờ khi mất mạng ----------
const keyOf = (r) => `${r.block_item_id}#${r.set_no}`;
export function queueRead(store) { try { return JSON.parse(store.getItem(PENDING_KEY) || '{}'); } catch { return {}; } }
export function queuePut(store, row) { const q = queueRead(store); q[keyOf(row)] = row; store.setItem(PENDING_KEY, JSON.stringify(q)); }
export function queueDrop(store, rows) { const q = queueRead(store); for (const r of rows) delete q[keyOf(r)]; store.setItem(PENDING_KEY, JSON.stringify(q)); }

// ---------- Cảnh báo tính phía coach ----------
/** sessions: [{id, scheduled_on, adhoc}] của tuần trước (đã phát hành); doneIds: Set id buổi đã hoàn thành; DINO-017: bỏ qua adhoc */
export function missedLastWeek(sessions, doneIds) {
  const scheduled = sessions.filter((s) => !s.adhoc);
  const missed = scheduled.filter((s) => !doneIds.has(s.id)).length;
  return missed >= 2 ? { kind: 'missed', message: `Bỏ ${missed}/${scheduled.length} buổi tuần trước` } : null;
}
/** km theo tuần: logs [{distance_m, day}] + danh sách 5 thứ Hai (cũ → mới) */
export function weeklyKm(logs, mondays) {
  return mondays.map((m, i) => {
    const end = mondays[i + 1] || '9999-12-31';
    return logs.filter((l) => l.day >= m && l.day < end).reduce((s, l) => s + (l.distance_m || 0), 0) / 1000;
  });
}

/**
 * Đồng hồ cho khối: trả về { segments:[{label, sec, round}], countUp:boolean, cap }.
 * circuit/hyrox có work_sec: làm/nghỉ × số vòng · emom: mỗi phút 1 chặng · amrap: đếm ngược · for_time/hyrox (không work_sec): bấm giờ đi lên.
 */
export function timerPlan(block) {
  const rounds = Math.max(block.rounds || 1, 1);
  if ((block.block_type === 'circuit' || block.block_type === 'hyrox') && block.work_sec) {
    const seg = [];
    for (let r = 1; r <= rounds; r++) {
      seg.push({ label: 'LÀM', sec: block.work_sec, round: r });
      if (block.rest_sec && r < rounds) seg.push({ label: 'NGHỈ', sec: block.rest_sec, round: r });
    }
    return { segments: seg, countUp: false };
  }
  if (block.block_type === 'emom' && block.time_cap_sec) {
    const n = Math.max(Math.round(block.time_cap_sec / 60), 1);
    return { segments: Array.from({ length: n }, (_, i) => ({ label: 'PHÚT', sec: 60, round: i + 1 })), countUp: false };
  }
  if (block.block_type === 'amrap' && block.time_cap_sec) return { segments: [{ label: 'AMRAP', sec: block.time_cap_sec, round: 1 }], countUp: false };
  return { segments: [], countUp: true, cap: block.time_cap_sec || null };
}
