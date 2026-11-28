// DINO-012 — Đọc/ghi check-in tuần + báo cáo giai đoạn
import { sb } from '../supabaseClient.js';
import { addDays, sessionDate, generateWeeks } from './plan.js';
import { createPhase, insertSessions, loadPlan } from './planStore.js';

const must = ({ data, error }) => { if (error) throw error; return data; };
const db = () => sb();

export async function listCheckins(clientId) {
  return must(await (await db()).from('weekly_checkins').select('*').eq('client_id', clientId).order('week_start', { ascending: false }));
}
export async function getCheckin(id) { return must(await (await db()).from('weekly_checkins').select('*').eq('id', id).single()); }
export async function saveCheckin(row) {
  return must(await (await db()).from('weekly_checkins').upsert(row, { onConflict: 'client_id,week_start' }).select().single());
}
export async function replyCheckin(id, coach_reply) {
  must(await (await db()).from('weekly_checkins').update({ coach_reply }).eq('id', id));
}
/** Check-in chưa được coach trả lời (Hộp việc) */
export async function unrepliedCheckins() {
  return must(await (await db()).from('weekly_checkins').select('id, client_id, week_start, avg_weight_kg, sessions_pct, eat_pct, created_at').is('coach_reply', null).order('created_at', { ascending: false }));
}

/** Số liệu nền cho 1 khách trong khoảng ngày: cân, buổi đã phát hành + hoàn thành, check ăn, số bữa, mục tiêu */
export async function clientSnapshot(clientId, from, to) {
  const d = await db();
  const [meas, ss, checks, slots, target, intake] = await Promise.all([
    d.from('measurements').select('measured_on, weight_kg').eq('client_id', clientId).gte('measured_on', from).lte('measured_on', to).then(must),
    d.from('sessions').select('id, phase_id, scheduled_on').eq('client_id', clientId).gte('scheduled_on', from).lte('scheduled_on', to).then(must),
    d.from('meal_checks').select('check_date, level').eq('client_id', clientId).gte('check_date', from).lte('check_date', to).then(must),
    d.from('meal_slots').select('id').eq('client_id', clientId).then(must),
    d.from('nutrition_targets').select('*').eq('client_id', clientId).eq('status', 'approved').order('valid_from', { ascending: false }).order('created_at', { ascending: false }).limit(1).maybeSingle().then(must),
    d.from('health_intakes').select('goal').eq('client_id', clientId).maybeSingle().then(must),
  ]);
  let sessions = ss;
  if (ss.length) {
    const ph = must(await d.from('phases').select('id, status').in('id', [...new Set(ss.map((s) => s.phase_id))]));
    const ok = new Set(ph.filter((p) => p.status !== 'draft').map((p) => p.id));
    sessions = ss.filter((s) => ok.has(s.phase_id));
  }
  const fb = sessions.length ? must(await d.from('session_feedback').select('session_id, completed').in('session_id', sessions.map((s) => s.id))) : [];
  return { measurements: meas, sessions, doneIds: new Set(fb.filter((f) => f.completed).map((f) => f.session_id)), checks, slotsCount: slots.length, target, goal: intake?.goal || null };
}

// ---------- Báo cáo giai đoạn ----------
export async function getReview(phaseId) {
  return must(await (await db()).from('phase_reviews').select('*').eq('phase_id', phaseId).maybeSingle());
}
export async function saveReview(row) {
  return must(await (await db()).from('phase_reviews').upsert(row, { onConflict: 'phase_id' }).select().single());
}
/** Mọi dữ liệu để dựng báo cáo 1 giai đoạn */
export async function reportData(clientId, phase) {
  const d = await db();
  const from = addDays(phase.start_date, -7), to = addDays(phase.end_date, 3);
  const [measurements, scans, photos, sessions, checks, slots] = await Promise.all([
    d.from('measurements').select('*').eq('client_id', clientId).gte('measured_on', from).lte('measured_on', to).then(must),
    d.from('inbody_scans').select('*').eq('client_id', clientId).gte('scanned_on', from).lte('scanned_on', to).then(must),
    d.from('progress_photos').select('*').eq('client_id', clientId).gte('taken_on', from).lte('taken_on', to).then(must),
    d.from('sessions').select('id, week_no, scheduled_on').eq('phase_id', phase.id).then(must),
    d.from('meal_checks').select('check_date, level').eq('client_id', clientId).gte('check_date', phase.start_date).lte('check_date', phase.end_date).then(must),
    d.from('meal_slots').select('id').eq('client_id', clientId).then(must),
  ]);
  let logs = [], doneIds = new Set();
  if (sessions.length) {
    const ids = sessions.map((s) => s.id);
    const [blocks, fb] = await Promise.all([
      d.from('session_blocks').select('id, session_id').in('session_id', ids).then(must),
      d.from('session_feedback').select('session_id, completed').in('session_id', ids).then(must),
    ]);
    doneIds = new Set(fb.filter((f) => f.completed).map((f) => f.session_id));
    if (blocks.length) {
      const items = must(await d.from('block_items').select('id, block_id, exercise_id').in('block_id', blocks.map((b) => b.id)));
      if (items.length) {
        const sl = must(await d.from('set_logs').select('block_item_id, reps, load_kg, distance_m, done').in('block_item_id', items.map((i) => i.id)));
        const wk = new Map(sessions.map((s) => [s.id, s.week_no]));
        const bs = new Map(blocks.map((b) => [b.id, b.session_id]));
        const it = new Map(items.map((i) => [i.id, i]));
        logs = sl.map((l) => { const i = it.get(l.block_item_id); return { ...l, exercise_id: i.exercise_id, week_no: wk.get(bs.get(i.block_id)) }; });
      }
    }
  }
  return { measurements, scans, photos, sessions, doneIds, logs, checks, slotsCount: slots.length };
}

/** Tạo giai đoạn tiếp: chép tuần 1 của giai đoạn cũ, sinh các tuần sau theo quy tắc tăng tải, để ở trạng thái nháp */
export async function createNextPhase(clientId, phase) {
  const programs = await loadPlan(clientId);
  const program = programs.find((p) => p.id === phase.program_id);
  const old = program.phases.find((p) => p.id === phase.id);
  const start = addDays(phase.end_date, 1);
  const ph = await createPhase(clientId, program, { name: `Giai đoạn ${program.phases.length + 1}`, goal: phase.goal, weeks: phase.weeks, start_date: start, handover_note: null });
  const w1 = (old?.sessions || []).filter((s) => s.week_no === 1).map((s) => ({ ...s, id: undefined, scheduled_on: sessionDate(start, 1, s.day_no) }));
  if (w1.length) {
    await insertSessions(clientId, ph, w1);
    await insertSessions(clientId, ph, generateWeeks(w1, ph.weeks, { phaseStart: start }));
  }
  return ph;
}
