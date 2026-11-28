// DINO-009 — Đọc/ghi giáo án trên Supabase. Lưu theo kiểu "chỉ sửa phần thay đổi" (giữ nguyên id)
// để kết quả tập của khách (set_logs, DINO-010) không bị xóa dây chuyền khi coach sửa buổi.
import { sb } from '../supabaseClient.js';
import { uid, sessionDate, phaseEnd } from './plan.js';

const SESSION_COLS = ['week_no', 'day_no', 'scheduled_on', 'title', 'session_type', 'coach_note'];
const BLOCK_COLS = ['order_no', 'label', 'block_type', 'rounds', 'work_sec', 'rest_sec', 'time_cap_sec', 'note'];
const ITEM_COLS = ['exercise_id', 'order_no', 'sets', 'reps_min', 'reps_max', 'load_kg', 'pct_1rm', 'target_rpe', 'tempo', 'rest_sec', 'distance_m', 'duration_sec', 'target_pace', 'hr_zone', 'progression_rule', 'note'];
const only = (o, cols) => Object.fromEntries(cols.map((k) => [k, o[k] === undefined ? null : o[k]]));
const must = ({ data, error }) => { if (error) throw error; return data; };

/** Toàn bộ giáo án của 1 khách, ghép thành cây. publishedOnly: chỉ giai đoạn đã phát hành (phía khách). */
export async function loadPlan(clientId, { publishedOnly = false } = {}) {
  const db = await sb();
  const q = (t, ...ord) => { let x = db.from(t).select('*').eq('client_id', clientId); for (const o of ord) x = x.order(o); return x; };
  const [programs, phases, sessions, blocks, items] = await Promise.all([
    q('programs', 'created_at'), q('phases', 'order_no'), q('sessions', 'week_no', 'day_no'), q('session_blocks', 'order_no'), q('block_items', 'order_no'),
  ]).then((rs) => rs.map(must));
  const itemsBy = groupBy(items, 'block_id'), blocksBy = groupBy(blocks, 'session_id'), sessBy = groupBy(sessions, 'phase_id');
  for (const b of blocks) b.items = itemsBy[b.id] || [];
  for (const s of sessions) s.blocks = blocksBy[s.id] || [];
  const ph = phases.filter((p) => !publishedOnly || p.status !== 'draft');
  for (const p of ph) p.sessions = sessBy[p.id] || [];
  for (const pr of programs) pr.phases = ph.filter((p) => p.program_id === pr.id);
  return publishedOnly ? programs.filter((p) => p.phases.length) : programs;
}
function groupBy(rows, key) { const g = {}; for (const r of rows) (g[r[key]] ||= []).push(r); return g; }

export async function createProgram(clientId, { name, model, start_date }) {
  return must(await (await sb()).from('programs').insert({ id: uid(), client_id: clientId, name, model, start_date, status: 'draft' }).select().single());
}
export async function updateProgram(id, patch) { must(await (await sb()).from('programs').update(patch).eq('id', id)); }

export async function createPhase(clientId, program, { name, goal, weeks, start_date, handover_note }) {
  const order_no = (program.phases?.length || 0) + 1;
  const row = { id: uid(), client_id: clientId, program_id: program.id, order_no, name, goal: goal || null, weeks, start_date, end_date: phaseEnd(start_date, weeks), handover_note: handover_note || null, status: 'draft' };
  return must(await (await sb()).from('phases').insert(row).select().single());
}
/** Sửa giai đoạn; đổi ngày bắt đầu → tính lại ngày của mọi buổi */
export async function updatePhase(phase, patch) {
  const db = await sb();
  const oldStart = phase.start_date, next = { ...phase, ...patch };
  must(await db.from('phases').update({ ...patch, end_date: phaseEnd(next.start_date, next.weeks) }).eq('id', phase.id));
  if (patch.start_date !== undefined && patch.start_date !== oldStart && phase.sessions?.length) {
    const rows = phase.sessions.map((s) => ({ id: s.id, client_id: s.client_id, phase_id: phase.id, ...only(s, SESSION_COLS), scheduled_on: sessionDate(next.start_date, s.week_no, s.day_no) }));
    must(await db.from('sessions').upsert(rows, { onConflict: 'id' }));
  }
}
export async function deletePhase(id) { must(await (await sb()).from('phases').delete().eq('id', id)); }

/** Thêm các buổi (cây chưa có id) vào giai đoạn. Trả về các buổi đã tạo. */
export async function insertSessions(clientId, phase, trees) {
  if (!trees.length) return [];
  const db = await sb();
  const S = [], B = [], I = [];
  for (const t of trees) {
    const sid = uid();
    S.push({ id: sid, client_id: clientId, phase_id: phase.id, ...only(t, SESSION_COLS), scheduled_on: t.scheduled_on ?? sessionDate(phase.start_date, t.week_no, t.day_no) });
    (t.blocks || []).forEach((b, bi) => {
      const bid = uid();
      B.push({ id: bid, client_id: clientId, session_id: sid, ...only({ ...b, order_no: bi + 1 }, BLOCK_COLS) });
      (b.items || []).forEach((it, ii) => I.push({ id: uid(), client_id: clientId, block_id: bid, ...only({ ...it, order_no: ii + 1 }, ITEM_COLS) }));
    });
  }
  must(await db.from('sessions').insert(S));
  if (B.length) must(await db.from('session_blocks').insert(B));
  if (I.length) must(await db.from('block_items').insert(I));
  return S;
}

/** Lưu 1 buổi đã sửa: cập nhật/ thêm/ xóa đúng phần thay đổi, giữ id cũ. prev = bản trước khi sửa. */
export async function saveSession(cur, prev) {
  const db = await sb();
  const cid = cur.client_id;
  must(await db.from('sessions').update(only(cur, SESSION_COLS)).eq('id', cur.id));
  const B = [], I = [];
  cur.blocks.forEach((b, bi) => {
    b.id ||= uid();
    B.push({ id: b.id, client_id: cid, session_id: cur.id, ...only({ ...b, order_no: bi + 1 }, BLOCK_COLS) });
    b.items.forEach((it, ii) => { it.id ||= uid(); I.push({ id: it.id, client_id: cid, block_id: b.id, ...only({ ...it, order_no: ii + 1 }, ITEM_COLS) }); });
  });
  const keepB = new Set(B.map((x) => x.id)), keepI = new Set(I.map((x) => x.id));
  const delB = (prev?.blocks || []).map((b) => b.id).filter((id) => !keepB.has(id));
  const delI = (prev?.blocks || []).flatMap((b) => b.items.map((i) => i.id)).filter((id) => !keepI.has(id));
  if (delI.length) must(await db.from('block_items').delete().in('id', delI));
  if (delB.length) must(await db.from('session_blocks').delete().in('id', delB));
  if (B.length) must(await db.from('session_blocks').upsert(B, { onConflict: 'id' }));
  if (I.length) must(await db.from('block_items').upsert(I, { onConflict: 'id' }));
}
export async function deleteSessions(ids) { if (ids.length) must(await (await sb()).from('sessions').delete().in('id', ids)); }

export async function setPhaseStatus(phase, program, status) {
  const db = await sb();
  must(await db.from('phases').update({ status }).eq('id', phase.id));
  if (status === 'published' && program.status !== 'published') must(await db.from('programs').update({ status: 'published' }).eq('id', program.id));
}

export async function listTemplates() {
  return must(await (await sb()).from('program_templates').select('id, name, goal, model, weeks, payload').order('name'));
}
export async function saveTemplate(coachId, payload) {
  return must(await (await sb()).from('program_templates').upsert({ coach_id: coachId, name: payload.name, goal: payload.goal, model: payload.model, weeks: payload.weeks, payload }, { onConflict: 'coach_id,name' }));
}

export async function latestOhsa(clientId) {
  const { data } = await (await sb()).from('assessments').select('ohsa, assessed_on').eq('client_id', clientId).order('assessed_on', { ascending: false }).order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data;
}

/** 1 buổi kèm khối, bài và giai đoạn chứa nó */
export async function loadSession(id) {
  const db = await sb();
  const s = must(await db.from('sessions').select('*').eq('id', id).single());
  const [phase, blocks] = await Promise.all([
    db.from('phases').select('*').eq('id', s.phase_id).single().then(must),
    db.from('session_blocks').select('*').eq('session_id', id).order('order_no').then(must),
  ]);
  const items = blocks.length ? must(await db.from('block_items').select('*').in('block_id', blocks.map((b) => b.id)).order('order_no')) : [];
  for (const b of blocks) b.items = items.filter((i) => i.block_id === b.id);
  s.blocks = blocks;
  return { session: s, phase };
}

/** Buổi tập của khách trong 1 ngày (chỉ giai đoạn đã phát hành) */
export async function sessionsOn(clientId, iso) {
  const db = await sb();
  const ss = must(await db.from('sessions').select('id, title, session_type, phase_id, scheduled_on').eq('client_id', clientId).eq('scheduled_on', iso));
  if (!ss.length) return [];
  const ph = must(await db.from('phases').select('id, status').in('id', [...new Set(ss.map((s) => s.phase_id))]));
  const ok = new Set(ph.filter((p) => p.status !== 'draft').map((p) => p.id));
  return ss.filter((s) => ok.has(s.phase_id));
}

/** Buổi đã phát hành của khách trong khoảng ngày [from, to] (DINO-011b: Buổi kế tiếp, % tập 7 ngày) */
export async function publishedSessions(clientId, from, to) {
  const db = await sb();
  const ss = must(await db.from('sessions').select('id, title, session_type, phase_id, scheduled_on, week_no, day_no').eq('client_id', clientId).gte('scheduled_on', from).lte('scheduled_on', to).order('scheduled_on'));
  if (!ss.length) return [];
  const ph = must(await db.from('phases').select('id, status').in('id', [...new Set(ss.map((s) => s.phase_id))]));
  const ok = new Set(ph.filter((p) => p.status !== 'draft').map((p) => p.id));
  return ss.filter((s) => ok.has(s.phase_id));
}
