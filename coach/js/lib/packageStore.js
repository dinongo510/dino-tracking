// DINO-014 — Đọc/ghi gói tập, buổi đã dùng, hình thức coaching
import { sb } from '../supabaseClient.js';

const must = ({ data, error }) => { if (error) throw error; return data; };

/** Gói + số buổi đã dùng của 1 hoặc nhiều khách → { packages, uses, usedById } */
export async function loadPackages(clientIds) {
  const ids = [].concat(clientIds);
  if (!ids.length) return { packages: [], uses: [], usedById: {} };
  const d = await sb();
  const [packages, uses] = await Promise.all([
    d.from('packages').select('*').in('client_id', ids).order('start_date', { ascending: false }).then(must),
    d.from('package_uses').select('*').in('client_id', ids).order('used_on', { ascending: false }).then(must),
  ]);
  const usedById = {};
  for (const u of uses) usedById[u.package_id] = (usedById[u.package_id] || 0) + 1;
  return { packages, uses, usedById };
}

export async function savePackage(row) {
  const d = await sb(), r = { ...row, updated_at: new Date().toISOString() };
  if (row.id) { must(await d.from('packages').update(r).eq('id', row.id)); return r; }
  return must(await d.from('packages').insert(r).select().single());
}
export async function deletePackage(id) { must(await (await sb()).from('packages').delete().eq('id', id)); }

/** Trừ 1 buổi (gắn buổi PT nếu có). Buổi đã trừ rồi → không trừ lần 2. */
export async function addUse({ client_id, package_id, session_id = null, used_on, note = null }) {
  const d = await sb();
  if (session_id) {
    const had = must(await d.from('package_uses').select('id').eq('session_id', session_id));
    if (had.length) return null;
  }
  return must(await d.from('package_uses').insert({ client_id, package_id, session_id, used_on, note }).select().single());
}
export async function deleteUse(id) { must(await (await sb()).from('package_uses').delete().eq('id', id)); }
export async function useForSession(sessionId) {
  return must(await (await sb()).from('package_uses').select('*').eq('session_id', sessionId).maybeSingle());
}

export async function setCoachMode(clientId, coach_mode) {
  must(await (await sb()).from('profiles').update({ coach_mode }).eq('id', clientId));
}
