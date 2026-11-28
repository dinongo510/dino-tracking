// DINO-013 — Dashboard: hàm thuần (test bằng Node). Công thức gốc ở formulas.js, thống kê tuần dùng lại checkin.js.
import { weeklyAvg, e1rm } from './formulas.js';
import { addDays, mondayOf, todayISO } from './plan.js';
import { weekStats } from './checkin.js';
import { adherenceRange } from './nutrition.js';
import { MUSCLE_VI } from './exercises.js';

export const RANGE_VI = { phase: 'Giai đoạn này', '3m': '3 tháng', all: 'Toàn bộ' };
const num = (x) => (x == null || x === '' ? null : Number(x));
const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

/** Giai đoạn đang chạy (đã phát hành) hôm nay, nếu không có thì giai đoạn gần nhất đã bắt đầu */
export function currentPhase(phases, today) {
  const ok = phases.filter((p) => p.status !== 'draft' && p.start_date && p.start_date <= today).sort((a, b) => b.start_date.localeCompare(a.start_date));
  return ok.find((p) => !p.end_date || p.end_date >= today) || ok[0] || null;
}

/** Ngày bắt đầu của bộ lọc thời gian. dataStart = ngày có dữ liệu sớm nhất (cho "Toàn bộ"). */
export function rangeStart(range, today, phases, dataStart) {
  if (range === '3m') return addDays(today, -90);
  if (range === 'all') return dataStart && dataStart < today ? dataStart : addDays(today, -27);
  const ph = currentPhase(phases, today);
  return ph?.start_date || addDays(today, -27);
}

export function mondaysBetween(from, to) {
  const out = []; for (let m = mondayOf(from); m <= to; m = addDays(m, 7)) out.push(m);
  return out;
}

/** Mốc chuyển giai đoạn (đường dọc): giai đoạn bắt đầu sau ngày đầu của khoảng xem */
export const phaseMarkers = (phases, from, to) => phases.filter((p) => p.status !== 'draft' && p.start_date > from && p.start_date <= to)
  .map((p) => ({ x: p.start_date, label: `GĐ${p.order_no ?? ''}` }));

// ---------- Cơ thể ----------
/** Cân từng lần + đường TB 7 ngày (TB tính cả lần cân trước ngày đầu khoảng xem) */
export function weightSeries(measurements, from, to) {
  const e = measurements.filter((m) => m.weight_kg != null).map((m) => ({ date: m.measured_on, weightKg: Number(m.weight_kg) }));
  const pts = e.filter((p) => p.date >= from && p.date <= to).sort((a, b) => a.date.localeCompare(b.date));
  const days = [...new Set(pts.map((p) => p.date))];
  return { points: pts.map((p) => ({ x: p.date, y: p.weightKg })), avg7: days.map((d) => ({ x: d, y: weeklyAvg(e, d) })) };
}
const seriesOf = (rows, dateKey, key, from, to) => rows.filter((r) => r[key] != null && r[dateKey] >= from && r[dateKey] <= to)
  .sort((a, b) => a[dateKey].localeCompare(b[dateKey])).map((r) => ({ x: r[dateKey], y: Number(r[key]) }));
export const circSeries = (meas, from, to) => ({ waist: seriesOf(meas, 'measured_on', 'waist_cm', from, to), hip: seriesOf(meas, 'measured_on', 'hip_cm', from, to) });
export const inbodySeries = (scans, from, to) => ({ smm: seriesOf(scans, 'scanned_on', 'smm_kg', from, to), ffm: seriesOf(scans, 'scanned_on', 'ffm_kg', from, to), pbf: seriesOf(scans, 'scanned_on', 'pbf_pct', from, to) });

// ---------- Tập luyện ----------
/** Ghép set_logs với block_items → dòng {exercise_id, day (giờ máy), reps, load_kg, distance_m, duration_sec, hr_zone} */
export function logRows(setLogs, items) {
  const it = new Map(items.map((i) => [i.id, i]));
  return setLogs.filter((l) => l.done !== false && it.has(l.block_item_id)).map((l) => {
    const i = it.get(l.block_item_id);
    return { exercise_id: i.exercise_id, day: l.logged_at ? todayISO(new Date(l.logged_at)) : null, reps: num(l.reps), load_kg: num(l.load_kg), distance_m: num(l.distance_m), duration_sec: num(l.duration_sec), hr_zone: i.hr_zone ?? null };
  }).filter((r) => r.day);
}
const inWeek = (day, m) => day >= m && day < addDays(m, 7);
const isLift = (r) => r.load_kg > 0 && r.reps > 0;

/** Bài theo dõi mặc định khi coach chưa chọn: các bài có tạ được ghi nhiều hiệp nhất */
export function autoTracked(rows, n = 3) {
  const cnt = {};
  for (const r of rows) if (isLift(r)) { const c = (cnt[r.exercise_id] ||= { n: 0, kg: 0 }); c.n++; c.kg = Math.max(c.kg, r.load_kg); }
  return Object.entries(cnt).sort((a, b) => b[1].n - a[1].n || b[1].kg - a[1].kg).slice(0, n).map(([id]) => id);
}
/** Bài khách đã ghi có tạ (để coach chọn bài theo dõi) */
export const liftedExercises = (rows) => [...new Set(rows.filter(isLift).map((r) => r.exercise_id))];

/** 1RM ước tính (Epley) cao nhất mỗi tuần cho từng bài */
export function e1rmWeekly(rows, exIds, mondays) {
  return exIds.map((id) => ({ id, points: mondays.map((m) => {
    const v = rows.filter((r) => r.exercise_id === id && isLift(r) && inWeek(r.day, m)).reduce((a, r) => Math.max(a, e1rm(r.load_kg, r.reps)), 0);
    return { x: m, y: v ? r1(v) : null };
  }) }));
}

/** Tổng khối lượng tạ (rep × kg) mỗi tuần theo nhóm cơ chính; giữ `top` nhóm lớn nhất, còn lại gộp "Khác" */
export function volumeByMuscle(rows, exById, mondays, top = 4) {
  const group = (id) => { const m = exById.get(id)?.primary_muscles?.[0]; return m ? (MUSCLE_VI[m] || m) : 'Khác'; };
  const tot = {}, per = {};
  for (const r of rows) {
    if (!isLift(r)) continue;
    const j = mondays.findIndex((m) => inWeek(r.day, m)); if (j < 0) continue;
    const g = group(r.exercise_id), v = r.reps * r.load_kg;
    tot[g] = (tot[g] || 0) + v; (per[g] ||= Array(mondays.length).fill(0))[j] += v;
  }
  const names = Object.keys(tot).sort((a, b) => tot[b] - tot[a]);
  const keep = names.filter((g) => g !== 'Khác').slice(0, top), rest = names.filter((g) => !keep.includes(g));
  const series = keep.map((g) => ({ name: g, values: per[g].map(Math.round) }));
  if (rest.length) series.push({ name: 'Khác', values: mondays.map((_, j) => Math.round(rest.reduce((a, g) => a + per[g][j], 0))), color: '#8a8a93' });
  return series;
}

/** Chạy theo tuần: km + pace TB (giây/km). Có ghi vùng tim (hr_zone ≤ 2) thì pace chỉ tính buổi easy. */
export function runWeekly(rows, mondays) {
  const runs = rows.filter((r) => r.distance_m > 0);
  const easyOnly = runs.some((r) => r.hr_zone != null && r.hr_zone <= 2);
  const km = mondays.map((m) => r1(runs.filter((r) => inWeek(r.day, m)).reduce((a, r) => a + r.distance_m, 0) / 1000));
  const pace = mondays.map((m) => {
    const rs = runs.filter((r) => inWeek(r.day, m) && r.duration_sec > 0 && (!easyOnly || (r.hr_zone != null && r.hr_zone <= 2)));
    const d = rs.reduce((a, r) => a + r.distance_m, 0), t = rs.reduce((a, r) => a + r.duration_sec, 0);
    return { x: m, y: d ? Math.round(t / (d / 1000)) : null };
  });
  return { km, pace, easyOnly, any: runs.length > 0 };
}

/** % buổi hoàn thành + % ăn đúng mỗi tuần (tuần chưa tới → null) */
export function adherenceWeekly({ sessions, doneIds, checks, slotsCount, mondays, today }) {
  const out = mondays.map((m) => (m > today ? { sessionsPct: null, eatPct: null } : weekStats({ sessions, doneIds, checks, slotsCount, weekStart: m, today })));
  return { sessions: out.map((o) => o.sessionsPct), eat: out.map((o) => o.eatPct) };
}

// ---------- DINO-016: Sơ đồ cơ, Tần suất 14 ngày & Bảng PR ----------
/** Số hiệp có tạ theo nhóm cơ (nhóm chính = 1 hiệp, nhóm phụ = 0,5 hiệp) */
export function muscleSets(rows, exById, from, to) {
  const sets = {};
  for (const r of rows) {
    if (!isLift(r)) continue;
    if (from && r.day < from) continue;
    if (to && r.day > to) continue;
    const ex = exById.get(r.exercise_id);
    if (!ex) continue;
    for (const m of (ex.primary_muscles || [])) {
      sets[m] = (sets[m] || 0) + 1;
    }
    for (const m of (ex.secondary_muscles || [])) {
      sets[m] = (sets[m] || 0) + 0.5;
    }
  }
  return sets;
}

export const MATRIX_MUSCLES = [
  { key: 'chest', label: 'Ngực', match: ['chest'] },
  { key: 'back', label: 'Lưng / Xô', match: ['lats', 'middle back', 'lower back', 'traps'] },
  { key: 'shoulders', label: 'Vai', match: ['shoulders'] },
  { key: 'arms', label: 'Tay', match: ['biceps', 'triceps', 'forearms'] },
  { key: 'quads', label: 'Đùi trước', match: ['quadriceps'] },
  { key: 'posterior_legs', label: 'Đùi sau / Mông', match: ['hamstrings', 'glutes', 'calves'] },
  { key: 'core', label: 'Bụng / Lõi', match: ['abdominals'] },
];

/** Ma trận tần suất nhóm cơ trong 14 ngày gần nhất */
export function frequencyMatrix14(rows, exById, today = todayISO()) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, -13 + i));
  const matrix = {};
  for (const m of MATRIX_MUSCLES) matrix[m.key] = Array(14).fill(false);

  for (const r of rows) {
    if (!r.day) continue;
    const di = days.indexOf(r.day);
    if (di < 0) continue;
    const ex = exById.get(r.exercise_id);
    const ms = [...(ex?.primary_muscles || []), ...(ex?.secondary_muscles || [])];
    if (r.distance_m > 0) ms.push('quadriceps', 'calves', 'hamstrings');
    for (const m of MATRIX_MUSCLES) {
      if (m.match.some((k) => ms.includes(k))) {
        matrix[m.key][di] = true;
      }
    }
  }
  return { days, muscles: MATRIX_MUSCLES, matrix };
}

/**
 * Tổng hợp kỷ lục cá nhân (PR):
 * - Tạ: 1RM ước tính (Epley) cao nhất, mức tạ nặng nhất
 * - Chạy: cự ly dài nhất, pace tốt nhất (buổi ≥ 5 km)
 * - Đánh dấu isNew nếu lập trong vòng 14 ngày
 */
export function personalRecords(rows, exById, today = todayISO()) {
  const prs = [];
  const liftByEx = {};
  const runs = [];

  for (const r of rows) {
    if (isLift(r)) {
      (liftByEx[r.exercise_id] ||= []).push(r);
    } else if (r.distance_m > 0) {
      runs.push(r);
    }
  }

  for (const [exId, list] of Object.entries(liftByEx)) {
    const ex = exById.get(exId);
    const name = ex?.name_vi || 'Bài tập';
    let best1rm = null;
    let maxLoad = null;

    for (const r of list) {
      const e = e1rm(r.load_kg, r.reps);
      if (!best1rm || e > best1rm.val) {
        best1rm = { val: e, load_kg: r.load_kg, reps: r.reps, day: r.day };
      }
      if (!maxLoad || r.load_kg > maxLoad.load_kg || (r.load_kg === maxLoad.load_kg && r.reps > maxLoad.reps)) {
        maxLoad = { load_kg: r.load_kg, reps: r.reps, day: r.day };
      }
    }

    if (best1rm) {
      const isNew = daysBetween(best1rm.day, today) <= 14;
      prs.push({
        exercise_id: exId,
        name_vi: name,
        type: '1rm',
        label: '1RM ước tính',
        value: r1(best1rm.val),
        unit: 'kg',
        detail: `${best1rm.load_kg} kg × ${best1rm.reps} rep`,
        day: best1rm.day,
        isNew,
      });
    }

    if (maxLoad && (maxLoad.load_kg !== best1rm?.load_kg || maxLoad.reps !== best1rm?.reps)) {
      const isNew = daysBetween(maxLoad.day, today) <= 14;
      prs.push({
        exercise_id: exId,
        name_vi: name,
        type: 'max_load',
        label: 'Tạ nặng nhất',
        value: maxLoad.load_kg,
        unit: 'kg',
        detail: `${maxLoad.load_kg} kg × ${maxLoad.reps} rep`,
        day: maxLoad.day,
        isNew,
      });
    }
  }

  if (runs.length) {
    let maxDist = null;
    let bestPace5k = null;

    for (const r of runs) {
      if (!maxDist || r.distance_m > maxDist.distance_m) {
        maxDist = r;
      }
      if (r.distance_m >= 5000 && r.duration_sec > 0) {
        const p = r.duration_sec / (r.distance_m / 1000);
        if (!bestPace5k || p < bestPace5k.pace) {
          bestPace5k = { pace: p, r };
        }
      }
    }

    if (maxDist) {
      const km = r1(maxDist.distance_m / 1000);
      const isNew = daysBetween(maxDist.day, today) <= 14;
      prs.push({
        exercise_id: 'run_dist',
        name_vi: 'Chạy: Cự ly dài nhất',
        type: 'run_dist',
        label: 'Cự ly dài nhất',
        value: km,
        unit: 'km',
        detail: `${km} km`,
        day: maxDist.day,
        isNew,
      });
    }

    if (bestPace5k) {
      const km = r1(bestPace5k.r.distance_m / 1000);
      const isNew = daysBetween(bestPace5k.r.day, today) <= 14;
      const m = Math.floor(bestPace5k.pace / 60), s = Math.round(bestPace5k.pace % 60);
      prs.push({
        exercise_id: 'run_pace',
        name_vi: 'Chạy: Pace tốt nhất (≥ 5 km)',
        type: 'run_pace',
        label: 'Pace tốt nhất (≥ 5 km)',
        value: Math.round(bestPace5k.pace),
        unit: 'giây/km',
        detail: `${m}:${String(s).padStart(2, '0')}/km (${km} km)`,
        day: bestPace5k.r.day,
        isNew,
      });
    }
  }

  prs.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.day.localeCompare(a.day));
  return prs.slice(0, 10);
}

// ---------- Ô tóm tắt + bảng tổng nhóm ----------
/** Cân TB 7 ngày hôm nay và chênh lệch so với 14 ngày trước: ▲ ≥ +0,3 kg · ▼ ≤ −0,3 kg · — đứng */
export function weightTrend(measurements, today) {
  const e = measurements.filter((m) => m.weight_kg != null).map((m) => ({ date: m.measured_on, weightKg: Number(m.weight_kg) }));
  const now = weeklyAvg(e, today), prev = weeklyAvg(e, addDays(today, -14));
  const d = now != null && prev != null ? r1(now - prev) : null;
  return { now: r1(now), diff: d, arrow: d == null ? null : d >= 0.3 ? '▲' : d <= -0.3 ? '▼' : '—' };
}

/** % buổi 7 ngày, % ăn 7 ngày (giống trang Hôm nay của khách) */
export function last7({ sessions, doneIds, checks, slotsCount, today }) {
  const from = addDays(today, -6), ss = sessions.filter((s) => s.scheduled_on >= from && s.scheduled_on <= today);
  return {
    trainPct: ss.length ? Math.round((ss.filter((s) => doneIds.has(s.id)).length / ss.length) * 100) : null,
    eatPct: adherenceRange(checks.filter((c) => c.check_date >= from && c.check_date <= today), slotsCount, 7),
  };
}

/** 1 dòng bảng tổng nhóm */
export function groupRow({ client, phases = [], sessions = [], doneIds = new Set(), checks = [], slotsCount = 0, measurements = [], alerts = 0, lastCheckin = null, pkg = [], today }) {
  const ph = currentPhase(phases, today);
  const week = ph?.start_date ? Math.min(ph.weeks || 99, Math.floor(daysBetween(ph.start_date, today) / 7) + 1) : null;
  const { trainPct, eatPct } = last7({ sessions, doneIds, checks, slotsCount, today });
  const tr = weightTrend(measurements, today);
  const since = lastCheckin ? daysBetween(lastCheckin, today) : null;
  const reasons = [];
  if (alerts) reasons.push(`${alerts} cảnh báo`);
  reasons.push(...pkg);                                     // DINO-014: gói sắp hết / hết hạn / còn nợ / đã khóa
  if (trainPct != null && trainPct < 70) reasons.push(`tập ${trainPct}%`);
  if (eatPct != null && eatPct < 70) reasons.push(`ăn ${eatPct}%`);
  if (since == null || since > 8) reasons.push(since == null ? 'chưa check-in' : `${since} ngày chưa check-in`);
  return { id: client.id, name: client.full_name || '(chưa có tên)', status: client.status, phone: client.phone, created_at: client.created_at,
    phaseName: ph?.name || null, week, weeks: ph?.weeks || null, trainPct, eatPct, trend: tr, alerts, lastCheckin, since, reasons, pkgWarn: pkg.length > 0, mode: client.coach_mode || 'online' };
}

/** Sắp theo "cần chú ý": cảnh báo → gói sắp hết/hết hạn → tuân thủ thấp (< 70%) → lâu chưa check-in; khách tạm dừng/kết thúc xuống cuối */
export function sortByAttention(rows) {
  const low = (r) => Math.min(r.trainPct ?? 100, r.eatPct ?? 100);
  const key = (r) => [r.status === 'active' ? 0 : 1, r.alerts > 0 ? 0 : 1, -r.alerts, r.pkgWarn ? 0 : 1, low(r) < 70 ? 0 : 1, low(r), -(r.since ?? 9999)];
  return [...rows].sort((a, b) => { const x = key(a), y = key(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]; return a.name.localeCompare(b.name, 'vi'); });
}

// ---------- Xuất CSV (.zip) ----------
const cell = (v) => {
  if (v == null) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
/** CSV có BOM UTF-8 (Google Sheets / Excel đọc đúng tiếng Việt) */
export function toCsv(rows) {
  const cols = []; for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  return '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n') + '\r\n';
}

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

/** File zip không nén (store) — files: [{name, text}] → Uint8Array. Tên file UTF-8. */
export function zipStore(files, now = new Date()) {
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const hdr = (size) => { const b = new Uint8Array(size); return [b, new DataView(b.buffer)]; };
  for (const f of files) {
    const name = enc.encode(f.name), data = enc.encode(f.text), crc = crc32(data);
    const [lh, lv] = hdr(30);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true);
    lv.setUint16(10, time, true); lv.setUint16(12, date, true); lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true); lv.setUint16(28, 0, true);
    parts.push(lh, name, data);
    const [ch, cv] = hdr(46);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
    cv.setUint16(12, time, true); cv.setUint16(14, date, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true); cv.setUint32(42, off, true);
    central.push(ch, name);
    off += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((a, b) => a + b.length, 0);
  const [end, ev] = hdr(22);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, cdSize, true); ev.setUint32(16, off, true);
  const all = [...parts, ...central, end], out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
  let p = 0; for (const b of all) { out.set(b, p); p += b.length; }
  return out;
}

/** Bảng xuất khi sao lưu 1 khách (key = cột lọc theo khách) */
export const EXPORT_TABLES = [
  ['profiles', 'id'], ['health_intakes', 'client_id'], ['measurements', 'client_id'], ['inbody_scans', 'client_id'], ['progress_photos', 'client_id'],
  ['assessments', 'client_id'], ['coach_notes', 'client_id'], ['programs', 'client_id'], ['phases', 'client_id'], ['sessions', 'client_id'],
  ['session_blocks', 'client_id'], ['block_items', 'client_id'], ['set_logs', 'client_id'], ['session_feedback', 'client_id'], ['messages', 'client_id'],
  ['nutrition_targets', 'client_id'], ['meal_slots', 'client_id'], ['meal_options', 'client_id'], ['meal_checks', 'client_id'],
  ['weekly_checkins', 'client_id'], ['phase_reviews', 'client_id'], ['alerts', 'client_id'], ['tracked_lifts', 'client_id'],
];
/** Tên file zip: dino-coach_<ten-khong-dau>_<ngay>.zip */
export const exportName = (name, today) => `dino-coach_${String(name || 'khach').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}_${today}.zip`;
