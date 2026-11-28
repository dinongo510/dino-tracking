// DINO-013 — Đọc dữ liệu cho dashboard 1 khách, bảng tổng nhóm, bài theo dõi, xuất CSV. RLS của Supabase vẫn áp dụng
// (khách chỉ đọc được dữ liệu của mình) — không dùng view/hàm security definer.
import { sb } from '../supabaseClient.js';
import { addDays, todayISO } from './plan.js';
import { EXPORT_TABLES } from './dashboard.js';

const must = ({ data, error }) => { if (error) throw error; return data; };

/** Toàn bộ dữ liệu cần để vẽ dashboard của 1 khách (khách < 10 người → tính phía máy) */
export async function dashData(clientId) {
  const d = await sb();
  const q = (t, cols = '*') => d.from(t).select(cols).eq('client_id', clientId);
  const [client, measurements, scans, phases, sessions, feedback, checks, slots, items, logs, tracked, alerts, checkins] = await Promise.all([
    d.from('profiles').select('id, full_name, status').eq('id', clientId).single().then(must),
    q('measurements', 'measured_on, weight_kg, waist_cm, hip_cm').then(must),
    q('inbody_scans', 'scanned_on, weight_kg, smm_kg, pbf_pct, ffm_kg').then(must),
    q('phases', 'id, name, order_no, weeks, start_date, end_date, status').then(must),
    q('sessions', 'id, phase_id, scheduled_on, week_no').then(must),
    q('session_feedback', 'session_id, completed').then(must),
    q('meal_checks', 'check_date, level').then(must),
    q('meal_slots', 'id').then(must),
    q('block_items', 'id, exercise_id, hr_zone').then(must),
    q('set_logs', 'block_item_id, reps, load_kg, distance_m, duration_sec, done, logged_at').then(must),
    q('tracked_lifts', 'exercise_id, order_no').order('order_no').then(must).catch(() => []),
    q('alerts', 'id, kind, message').is('resolved_at', null).then(must).catch(() => []),
    q('weekly_checkins', 'week_start, created_at, coach_reply').order('week_start', { ascending: false }).limit(1).then(must).catch(() => []),
  ]);
  const pub = new Set(phases.filter((p) => p.status !== 'draft').map((p) => p.id));
  return {
    client, measurements, scans, phases: phases.filter((p) => p.status !== 'draft'),
    sessions: sessions.filter((s) => pub.has(s.phase_id)),
    doneIds: new Set(feedback.filter((f) => f.completed).map((f) => f.session_id)),
    checks, slotsCount: slots.length, items, logs, tracked: tracked.map((t) => t.exercise_id), alerts, lastCheckin: checkins[0] || null,
  };
}

/** Coach chọn 3–5 bài theo dõi cho khách (thay toàn bộ danh sách cũ) */
export async function saveTracked(clientId, exerciseIds) {
  const d = await sb();
  must(await d.from('tracked_lifts').delete().eq('client_id', clientId));
  if (exerciseIds.length) must(await d.from('tracked_lifts').insert(exerciseIds.map((exercise_id, i) => ({ client_id: clientId, exercise_id, order_no: i + 1 }))));
}

/** Dữ liệu 14 ngày gần nhất của mọi khách để dựng bảng tổng nhóm (1 lượt truy vấn mỗi bảng) */
export async function groupData(clientIds, today = todayISO()) {
  if (!clientIds.length) return {};
  const d = await sb(), from = addDays(today, -20);
  const inC = (t, cols) => d.from(t).select(cols).in('client_id', clientIds);
  const [phases, sessions, checks, slots, meas, alerts, cis] = await Promise.all([
    inC('phases', 'id, client_id, name, weeks, start_date, end_date, status').then(must),
    inC('sessions', 'id, client_id, phase_id, scheduled_on').gte('scheduled_on', addDays(today, -6)).lte('scheduled_on', today).then(must),
    inC('meal_checks', 'client_id, check_date, level').gte('check_date', addDays(today, -6)).lte('check_date', today).then(must),
    inC('meal_slots', 'id, client_id').then(must),
    inC('measurements', 'client_id, measured_on, weight_kg').gte('measured_on', from).then(must),
    inC('alerts', 'client_id').is('resolved_at', null).then(must).catch(() => []),
    inC('weekly_checkins', 'client_id, week_start, created_at').then(must).catch(() => []),
  ]);
  const pub = new Set(phases.filter((p) => p.status !== 'draft').map((p) => p.id));
  const ss = sessions.filter((s) => pub.has(s.phase_id));
  const fb = ss.length ? must(await d.from('session_feedback').select('session_id, completed').in('session_id', ss.map((s) => s.id))) : [];
  const done = new Set(fb.filter((f) => f.completed).map((f) => f.session_id));
  const by = (rows, id) => rows.filter((r) => r.client_id === id);
  return Object.fromEntries(clientIds.map((id) => {
    const last = by(cis, id).map((c) => c.created_at?.slice(0, 10) || c.week_start).sort().pop() || null;
    return [id, { phases: by(phases, id), sessions: by(ss, id), doneIds: done, checks: by(checks, id), slotsCount: by(slots, id).length,
      measurements: by(meas, id), alerts: by(alerts, id).length, lastCheckin: last }];
  }));
}

/** Mọi bảng của 1 khách → [{name, rows}] (bảng không đọc được thì bỏ qua, ví dụ ghi chú nội bộ khi khách tự xuất) */
export async function exportTables(clientId) {
  const d = await sb();
  const out = await Promise.all(EXPORT_TABLES.map(async ([t, key]) => {
    const { data, error } = await d.from(t).select('*').eq(key, clientId);
    return error ? null : { name: t, rows: data || [] };
  }));
  return out.filter(Boolean);
}
