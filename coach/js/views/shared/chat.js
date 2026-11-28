// DINO-010 — Chat theo buổi tập (khách ↔ coach), tin mới hiện ngay qua Supabase Realtime
import { esc, toast } from '../../ui.js';
import { viError } from '../../supabaseClient.js';
import { listMessages, sendMessage, markRead, watchMessages } from '../../lib/logStore.js';

let stopWatch = null;
addEventListener('hashchange', () => { if (stopWatch) { stopWatch(); stopWatch = null; } });

const hhmm = (iso) => new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

/** el: phần tử chứa · names: { [id]: tên } */
export async function renderChat(el, { clientId, sessionId, me, names }) {
  el.innerHTML = `<h2>Trao đổi về buổi này</h2>
    <div class="card"><div id="msgs" class="stack" style="max-height:360px;overflow:auto"></div>
      <form id="mf" class="row" style="gap:6px;margin-top:8px">
        <textarea name="body" rows="1" placeholder="Nhắn cho ${me === clientId ? 'Coach' : 'khách'}…" style="flex:1;resize:vertical" required></textarea>
        <button class="btn btn--primary">Gửi</button></form></div>`;
  const box = el.querySelector('#msgs'), seen = new Set();
  const add = (m) => {
    if (seen.has(m.id)) return; seen.add(m.id);
    const mine = m.author_id === me;
    box.querySelector('.empty')?.remove();
    box.insertAdjacentHTML('beforeend', `<div data-msg="${esc(m.id)}" style="align-self:${mine ? 'flex-end' : 'flex-start'};max-width:85%;padding:8px 10px;border-radius:12px;background:${mine ? 'var(--accent)' : 'var(--bg)'};color:${mine ? '#fff' : 'var(--text)'}">
      <div class="small" style="opacity:.8">${esc(names[m.author_id] || (mine ? 'Bạn' : ''))} · ${hhmm(m.created_at)}</div>${esc(m.body).replace(/\n/g, '<br>')}</div>`);
    box.scrollTop = box.scrollHeight;
  };
  const list = await listMessages(sessionId);
  if (!list.length) box.innerHTML = '<p class="small muted empty">Chưa có tin nào.</p>';
  list.forEach(add);
  markRead(sessionId, me).catch(() => {});
  if (stopWatch) stopWatch();
  stopWatch = await watchMessages(sessionId, (m) => { add(m); if (m.author_id !== me) markRead(sessionId, me).catch(() => {}); });

  const f = el.querySelector('#mf');
  f.body.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) f.requestSubmit(); });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = f.body.value.trim(); if (!body) return;
    const btn = e.submitter; btn.disabled = true;
    try { add(await sendMessage(clientId, sessionId, body)); f.body.value = ''; }
    catch (err) { toast(viError(err), 'error'); }
    finally { btn.disabled = false; }
  });
}
