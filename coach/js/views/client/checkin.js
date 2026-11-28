// DINO-012 — Check-in tuần (Khách): cân TB, ngủ / stress / năng lượng 1–5, điều khó nhất, ghi chú → coach trả lời + chat
import { render, $, esc, toast, busy } from '../../ui.js';
import { viError } from '../../supabaseClient.js';
import { clientTabs } from './home.js';
import { addDays, mondayOf, todayISO } from '../../lib/plan.js';
import { SCORE_VI, checkinWeekFor, weekAvgs, weekStats } from '../../lib/checkin.js';
import { listCheckins, saveCheckin, clientSnapshot } from '../../lib/checkinStore.js';
import { renderChat } from '../shared/chat.js';

const dm = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const num = (x) => (x == null ? '' : String(Math.round(x * 10) / 10));
const ROWS = [['sleep', 'Giấc ngủ', 'sleep_score'], ['stress', 'Mức stress', 'stress_score'], ['energy', 'Năng lượng', 'energy_score']];

export async function clientCheckinView({ profile }) {
  clientTabs();
  const today = todayISO(), me = profile.id;
  const all = await listCheckins(me);
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  const week = qs.get('w') || checkinWeekFor(today, new Set(all.map((c) => c.week_start))) || mondayOf(today);
  const ci = all.find((c) => c.week_start === week) || null;
  const snap = await clientSnapshot(me, addDays(week, -14), addDays(week, 6));
  const [, , avg] = weekAvgs(snap.measurements, [addDays(week, -14), addDays(week, -7), week]);
  const st = weekStats({ ...snap, weekStart: week, today });
  const editing = !ci || qs.get('edit') === '1';
  const vals = { sleep_score: ci?.sleep_score, stress_score: ci?.stress_score, energy_score: ci?.energy_score };

  render(`<div id="cv">
    <p class="small"><a href="#/client">← Hôm nay</a></p>
    <h1>Check-in tuần</h1>
    <p class="muted small" style="margin-top:-4px">Tuần ${dm(week)} – ${dm(addDays(week, 6))} · khoảng 1 phút</p>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px">
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Buổi tập tuần này</div><div style="font-size:23px;font-weight:800">${st.sessionsPct ?? '—'}${st.sessionsPct != null ? '%' : ''}</div></div>
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Ăn đúng tuần này</div><div style="font-size:23px;font-weight:800">${st.eatPct ?? '—'}${st.eatPct != null ? '%' : ''}</div></div>
    </div>
    ${editing ? `<form id="cf" class="card card--hi stack">
      <label class="field" style="margin:0"><span>Cân trung bình tuần (kg)${avg != null ? ' — app tính từ các lần cân, sửa nếu cần' : ''}</span>
        <input class="input" name="w" type="number" step="0.1" min="20" max="300" inputmode="decimal" value="${num(ci?.avg_weight_kg ?? avg)}" placeholder="Ví dụ 68,4"></label>
      ${ROWS.map(([k, l, col]) => `<div><div class="small muted" style="margin-bottom:6px">${l}</div>
        <div class="row" style="gap:6px" role="radiogroup" aria-label="${l}">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="btn${vals[col] === n ? ' lvl--on' : ''}" data-score="${col}" data-v="${n}" aria-pressed="${vals[col] === n}" title="${SCORE_VI[k][n - 1]}" style="flex:1;padding:0;min-width:0">${n}</button>`).join('')}</div>
        <div class="small muted" style="display:flex;justify-content:space-between;margin-top:2px"><span>${SCORE_VI[k][0]}</span><span>${SCORE_VI[k][4]}</span></div></div>`).join('')}
      <label class="field" style="margin:0"><span>Điều khó nhất tuần qua?</span><textarea name="hardest" rows="2" placeholder="Ví dụ: tăng ca, ăn ngoài nhiều, đau gối…">${esc(ci?.hardest || '')}</textarea></label>
      <label class="field" style="margin:0"><span>Ghi chú cho Coach</span><textarea name="note" rows="2">${esc(ci?.client_note || '')}</textarea></label>
      <button class="btn btn--primary btn--block" style="min-height:54px">${ci ? 'Cập nhật check-in' : 'Gửi check-in'}</button>
    </form>` : `<div class="card card--hi">
      <div class="row row--between"><strong>Đã gửi check-in ✓</strong><a class="small" href="#/client/checkin?w=${week}&edit=1">Sửa</a></div>
      <ul class="list small" style="margin-top:6px">
        <li><span class="muted">Cân TB</span><strong>${ci.avg_weight_kg != null ? num(Number(ci.avg_weight_kg)).replace('.', ',') + ' kg' : '—'}</strong></li>
        ${ROWS.map(([k, l, col]) => `<li><span class="muted">${l}</span><strong>${ci[col] ?? '—'}${ci[col] ? ` · ${SCORE_VI[k][ci[col] - 1]}` : ''}</strong></li>`).join('')}
        ${ci.hardest ? `<li><span class="muted">Khó nhất</span><span>${esc(ci.hardest)}</span></li>` : ''}
        ${ci.client_note ? `<li><span class="muted">Ghi chú</span><span>${esc(ci.client_note)}</span></li>` : ''}
      </ul></div>
      <div class="card"><strong>Coach trả lời</strong>
        <p style="margin:6px 0 0;${ci.coach_reply ? '' : 'color:var(--muted)'}">${ci.coach_reply ? esc(ci.coach_reply).replace(/\n/g, '<br>') : 'Coach sẽ trả lời trong 24 giờ.'}</p></div>
      <div id="chat"></div>`}
    ${all.filter((c) => c.week_start !== week).length ? `<h2>Các tuần trước</h2><div class="card"><ul class="list">${all.filter((c) => c.week_start !== week).slice(0, 8).map((c) => `<li><a href="#/client/checkin?w=${c.week_start}" style="flex:1;color:var(--text);text-decoration:none">Tuần ${dm(c.week_start)}
      <div class="small muted">${c.avg_weight_kg != null ? String(Number(c.avg_weight_kg)).replace('.', ',') + ' kg · ' : ''}${c.coach_reply ? 'Coach đã trả lời' : 'Chờ coach trả lời'}</div></a></li>`).join('')}</ul></div>` : ''}
  </div>`);

  if (!editing) {
    await renderChat($('#chat'), { clientId: me, contextId: ci.id, type: 'checkin', title: 'Trao đổi về check-in', me, names: { [me]: 'Bạn', [profile.coach_id]: 'Coach' } });
    return;
  }
  $('#cf').addEventListener('click', (e) => {
    const b = e.target.closest('[data-score]'); if (!b) return;
    vals[b.dataset.score] = Number(b.dataset.v);
    b.parentElement.querySelectorAll('[data-score]').forEach((x) => { const on = x === b; x.classList.toggle('lvl--on', on); x.setAttribute('aria-pressed', String(on)); });
  });
  $('#cf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    if (ROWS.some(([, , col]) => !vals[col])) return toast('Chấm điểm giấc ngủ, stress và năng lượng (1–5) nhé.', 'error');
    await busy(e.submitter, async () => {
      try {
        await saveCheckin({ client_id: me, week_start: week, avg_weight_kg: f.w.value ? Number(f.w.value) : null, ...vals,
          hardest: f.hardest.value.trim() || null, client_note: f.note.value.trim() || null, sessions_pct: st.sessionsPct, eat_pct: st.eatPct });
        toast('Đã gửi check-in. Coach sẽ trả lời sớm.');
        const h = `#/client/checkin?w=${week}`;
        if (location.hash === h) clientCheckinView({ profile }); else location.hash = h;
      } catch (err) { toast(viError(err), 'error'); }
    });
  });
}
