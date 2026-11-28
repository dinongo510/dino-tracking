// DINO-010 — Đọc/ghi phiếu buổi tập, phản hồi, tin nhắn (realtime), cảnh báo
import { sb } from '../supabaseClient.js';
import { queuePut, queueRead, queueDrop } from './sessionLog.js';

const must = ({ data, error }) => { if (error) throw error; return data; };
const LOG_COLS = ['client_id', 'block_item_id', 'set_no', 'reps', 'load_kg', 'rpe', 'distance_m', 'duration_sec', 'avg_hr', 'done'];
const clean = (r) => Object.fromEntries(LOG_COLS.map((k) => [k, r[k] ?? null]));

export async function loadLogs(itemIds) {
  if (!itemIds.length) return {};
  const rows = must(await (await sb()).from('set_logs').select('*').in('block_item_id', itemIds).order('set_no'));
  const by = {};
  for (const r of rows) (by[r.block_item_id] ||= []).push(r);
  // hiệp còn trong hàng chờ (chưa đồng bộ) đè lên bản trên máy chủ
  for (const r of Object.values(queueRead(localStorage))) {
    if (!itemIds.includes(r.block_item_id)) continue;
    const arr = (by[r.block_item_id] ||= []), i = arr.findIndex((x) => x.set_no === r.set_no);
    if (i >= 0) arr[i] = { ...arr[i], ...r }; else arr.push(r);
  }
  return by;
}

/** Lưu 1 hiệp. Mất mạng → vào hàng chờ, trả về false. */
export async function saveLog(row) {
  const r = clean(row);
  queuePut(localStorage, r);
  if (!navigator.onLine) return false;
  try { must(await (await sb()).from('set_logs').upsert(r, { onConflict: 'block_item_id,set_no' })); queueDrop(localStorage, [r]); return true; }
  catch (err) { if (/fetch|network/i.test(err?.message || '')) return false; queueDrop(localStorage, [r]); throw err; }
}
/** Đồng bộ hàng chờ; trả về số hiệp còn chưa đồng bộ */
export async function flushPending() {
  const rows = Object.values(queueRead(localStorage));
  if (!rows.length || !navigator.onLine) return rows.length;
  try { must(await (await sb()).from('set_logs').upsert(rows.map(clean), { onConflict: 'block_item_id,set_no' })); queueDrop(localStorage, rows); return 0; }
  catch { return rows.length; }
}
export const pendingCount = () => Object.keys(queueRead(localStorage)).length;

export async function loadFeedback(sessionId) {
  return must(await (await sb()).from('session_feedback').select('*').eq('session_id', sessionId).maybeSingle());
}
export async function saveFeedback(row) {
  return must(await (await sb()).from('session_feedback').upsert(row, { onConflict: 'session_id' }).select().single());
}
export async function feedbackFor(clientId) {
  return must(await (await sb()).from('session_feedback').select('session_id, completed, coach_reviewed, session_rpe, pain, created_at').eq('client_id', clientId));
}

// ---------- Tin nhắn theo buổi ----------
export async function listMessages(sessionId) {
  return must(await (await sb()).from('messages').select('*').eq('context_type', 'session').eq('context_id', sessionId).order('created_at'));
}
export async function sendMessage(clientId, sessionId, body) {
  return must(await (await sb()).from('messages').insert({ client_id: clientId, context_type: 'session', context_id: sessionId, body }).select().single());
}
/** Đánh dấu đã đọc mọi tin của người kia trong buổi */
export async function markRead(sessionId, me) {
  const db = await sb();
  must(await db.from('messages').update({ read_at: new Date().toISOString() }).eq('context_type', 'session').eq('context_id', sessionId).neq('author_id', me).is('read_at', null));
}
/** Tin chưa đọc (người kia gửi) — theo buổi: { [session_id]: số tin } */
export async function unreadBySession(me, clientId = null) {
  let q = (await sb()).from('messages').select('context_id, client_id, author_id, body, created_at').eq('context_type', 'session').neq('author_id', me).is('read_at', null);
  if (clientId) q = q.eq('client_id', clientId);
  const rows = must(await q);
  const by = {};
  for (const r of rows) (by[r.context_id] ||= []).push(r);
  return by;
}
/** Nghe tin mới của 1 buổi (Supabase Realtime). Trả về hàm hủy. */
export async function watchMessages(sessionId, onInsert) {
  const db = await sb();
  const ch = db.channel('msg-' + sessionId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `context_id=eq.${sessionId}` }, (p) => onInsert(p.new))
    .subscribe();
  return () => db.removeChannel(ch);
}

// ---------- Cảnh báo ----------
export async function openAlerts() {
  return must(await (await sb()).from('alerts').select('*').is('resolved_at', null).order('created_at', { ascending: false }));
}
export async function addAlerts(rows) {
  if (rows.length) must(await (await sb()).from('alerts').upsert(rows, { onConflict: 'client_id,kind,ref_key', ignoreDuplicates: true }));
}
export async function resolveAlert(id) {
  must(await (await sb()).from('alerts').update({ resolved_at: new Date().toISOString() }).eq('id', id));
}

/** Bài cùng tên ở buổi kế tiếp (sau ngày của buổi này) của khách */
export async function nextItemFor(clientId, session, exerciseId) {
  const db = await sb();
  const ss = must(await db.from('sessions').select('id, title, week_no, day_no, scheduled_on, phase_id').eq('client_id', clientId).gt('scheduled_on', session.scheduled_on).order('scheduled_on').limit(30));
  if (!ss.length) return null;
  const bl = must(await db.from('session_blocks').select('id, session_id').in('session_id', ss.map((s) => s.id)));
  if (!bl.length) return null;
  const its = must(await db.from('block_items').select('id, block_id, load_kg').eq('exercise_id', exerciseId).in('block_id', bl.map((b) => b.id)));
  for (const s of ss) {
    const it = its.find((i) => bl.find((b) => b.id === i.block_id)?.session_id === s.id);
    if (it) return { item: it, session: s };
  }
  return null;
}
export async function setItemLoad(itemId, load_kg) { must(await (await sb()).from('block_items').update({ load_kg }).eq('id', itemId)); }
export async function markReviewed(sessionId) { must(await (await sb()).from('session_feedback').update({ coach_reviewed: true }).eq('session_id', sessionId)); }
