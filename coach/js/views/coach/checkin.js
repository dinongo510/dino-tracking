// DINO-012 — Coach xem + trả lời check-in tuần; đề xuất kcal (kcalAdjustment) → "Áp dụng" tạo mục tiêu mới
import { render, $, esc, toast, busy, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { addDays, todayISO } from '../../lib/plan.js';
import { SCORE_VI, weekAvgs, kcalProposal } from '../../lib/checkin.js';
import { getCheckin, replyCheckin, clientSnapshot, listCheckins } from '../../lib/checkinStore.js';
import { approveTarget } from '../../lib/nutritionStore.js';
import { renderChat } from '../shared/chat.js';

const dm = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const kg = (x) => (x == null ? '—' : (Math.round(x * 10) / 10).toString().replace('.', ',') + ' kg');
const ACTION_VI = { decrease: 'Giảm kcal', increase: 'Tăng kcal', talk: 'Cần trao đổi', none: 'Giữ nguyên' };

export async function coachCheckinView({ params, profile }) {
  coachTabs();
  const ci = await getCheckin(params.id);
  const w = ci.week_start, weeks = [addDays(w, -14), addDays(w, -7), w];
  const [{ data: client }, snap, history] = await Promise.all([
    (await sb()).from('profiles').select('id, full_name').eq('id', ci.client_id).single(),
    clientSnapshot(ci.client_id, addDays(w, -20), addDays(w, 6)),
    listCheckins(ci.client_id),
  ]);
  const avgs = weekAvgs(snap.measurements, weeks);
  if (ci.avg_weight_kg != null) avgs[2] = Number(ci.avg_weight_kg); // khách tự sửa cân TB tuần này
  const prop = kcalProposal({ goal: snap.goal, avgs, adherence: ci.eat_pct, target: snap.target });
  const rows = [['sleep', 'Giấc ngủ', 'sleep_score'], ['stress', 'Stress', 'stress_score'], ['energy', 'Năng lượng', 'energy_score']];

  render(`<div id="kv">
    <p class="small"><a href="#/coach/inbox">← Hộp việc</a> · <a href="#/coach/client/${ci.client_id}">${esc(client?.full_name || 'Khách')}</a> · <a href="#/coach/client/${ci.client_id}/nutrition">Dinh dưỡng</a></p>
    <h1>Check-in · ${esc(client?.full_name || 'Khách')}</h1>
    <p class="muted small" style="margin-top:-4px">Tuần ${dm(w)} – ${dm(addDays(w, 6))} · gửi ${fmtDate(ci.created_at)}</p>

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px">
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Buổi tập</div><div style="font-size:22px;font-weight:800">${ci.sessions_pct ?? '—'}${ci.sessions_pct != null ? '%' : ''}</div></div>
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Ăn đúng</div><div style="font-size:22px;font-weight:800">${ci.eat_pct ?? '—'}${ci.eat_pct != null ? '%' : ''}</div></div>
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Cân TB</div><div style="font-size:22px;font-weight:800">${ci.avg_weight_kg != null ? String(Number(ci.avg_weight_kg)).replace('.', ',') : '—'}</div></div>
    </div>

    <div class="card"><ul class="list small">
      ${rows.map(([k, l, col]) => `<li><span class="muted">${l}</span><strong>${ci[col] ?? '—'}/5${ci[col] ? ` · ${SCORE_VI[k][ci[col] - 1]}` : ''}</strong></li>`).join('')}
      <li><span class="muted">Khó nhất</span><span>${esc(ci.hardest || '—')}</span></li>
      ${ci.client_note ? `<li><span class="muted">Ghi chú</span><span>${esc(ci.client_note)}</span></li>` : ''}
    </ul></div>

    <h2>Đề xuất kcal</h2>
    <div class="card ${prop.next ? 'card--hi' : ''}">
      <div class="small muted">Cân TB 3 tuần: ${weeks.map((x, i) => `${dm(x)} <strong style="color:var(--text)">${kg(avgs[i])}</strong>`).join(' → ')}</div>
      <div class="row row--between" style="margin-top:8px"><strong>${ACTION_VI[prop.action] || prop.action}${prop.deltaKcal ? ` ${prop.deltaKcal > 0 ? '+' : ''}${prop.deltaKcal} kcal` : ''}</strong>
        <span class="badge ${prop.action === 'talk' ? 'badge--hot' : prop.next ? 'badge--ok' : ''}">${esc(prop.reason)}</span></div>
      ${snap.target ? `<p class="small" style="margin:8px 0 0">Mục tiêu hiện tại: ${snap.target.kcal} kcal · P ${snap.target.protein_g} · C ${snap.target.carb_g} · F ${snap.target.fat_g}${prop.next ? ` → <strong>${prop.next.kcal} kcal · P ${prop.next.protein_g} · C ${prop.next.carb_g} · F ${prop.next.fat_g}</strong>` : ''}</p>` : '<p class="small muted" style="margin:8px 0 0">Khách chưa có mục tiêu dinh dưỡng được duyệt.</p>'}
      ${prop.next ? '<button class="btn btn--primary" id="apply" style="margin-top:10px">Áp dụng mục tiêu mới từ hôm nay</button>' : ''}
      <p class="small muted" style="margin:8px 0 0">Chỉ là đề xuất theo quy tắc (cân đứng 2 tuần + tuân thủ ≥ 80%…). Bạn quyết định.</p>
    </div>

    <h2>Trả lời khách</h2>
    <form id="rf" class="card stack">
      <textarea name="reply" rows="4" placeholder="Nhận xét tuần này, điều chỉnh tuần sau…">${esc(ci.coach_reply || '')}</textarea>
      <button class="btn btn--primary">${ci.coach_reply ? 'Cập nhật trả lời' : 'Gửi trả lời'}</button>
      ${ci.replied_at ? `<span class="small muted">Đã trả lời ${fmtDate(ci.replied_at)}</span>` : ''}
    </form>
    <div id="chat"></div>
    ${history.length > 1 ? `<h2>Các tuần khác</h2><div class="card"><ul class="list">${history.filter((h) => h.id !== ci.id).slice(0, 8).map((h) => `<li><a href="#/coach/checkin/${h.id}" style="flex:1;color:var(--text);text-decoration:none">Tuần ${dm(h.week_start)}
      <div class="small muted">${h.avg_weight_kg != null ? String(Number(h.avg_weight_kg)).replace('.', ',') + ' kg · ' : ''}buổi ${h.sessions_pct ?? '—'}% · ăn ${h.eat_pct ?? '—'}%${h.coach_reply ? '' : ' · <span style="color:var(--tint)">chưa trả lời</span>'}</div></a></li>`).join('')}</ul></div>` : ''}
  </div>`);

  $('#apply')?.addEventListener('click', async (e) => {
    if (!confirm(`Đổi mục tiêu thành ${prop.next.kcal} kcal từ hôm nay? Khách thấy ngay ở tab Ăn.`)) return;
    await busy(e.currentTarget, async () => {
      try {
        await approveTarget({ client_id: ci.client_id, valid_from: todayISO(), formula: snap.target.formula, bmr: snap.target.bmr, tdee: snap.target.tdee, ...prop.next });
        toast('Đã áp dụng mục tiêu mới.'); coachCheckinView({ params, profile });
      } catch (err) { toast(viError(err), 'error'); }
    });
  });
  $('#rf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = e.target.reply.value.trim(); if (!text) return toast('Nhập nội dung trả lời.', 'error');
    await busy(e.submitter, async () => {
      try { await replyCheckin(ci.id, text); toast('Đã gửi trả lời — khách thấy ngay.'); coachCheckinView({ params, profile }); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
  await renderChat($('#chat'), { clientId: ci.client_id, contextId: ci.id, type: 'checkin', title: 'Trao đổi về check-in', me: profile.id, names: { [profile.id]: 'Bạn', [ci.client_id]: client?.full_name || 'Khách' } });
}

/** Danh sách check-in của 1 khách (từ trang chi tiết khách) */
export async function coachCheckinListView({ params }) {
  coachTabs();
  const [{ data: client }, list] = await Promise.all([(await sb()).from('profiles').select('full_name').eq('id', params.id).single(), listCheckins(params.id)]);
  render(`<p class="small"><a href="#/coach/client/${params.id}">← ${esc(client?.full_name || 'Khách')}</a></p>
    <h1>Check-in tuần</h1>
    <div class="card">${list.length ? `<ul class="list">${list.map((c) => `<li><a href="#/coach/checkin/${c.id}" style="flex:1;color:var(--text);text-decoration:none">Tuần ${dm(c.week_start)} – ${dm(addDays(c.week_start, 6))}
      <div class="small muted">${c.avg_weight_kg != null ? String(Number(c.avg_weight_kg)).replace('.', ',') + ' kg · ' : ''}buổi ${c.sessions_pct ?? '—'}% · ăn ${c.eat_pct ?? '—'}% · ngủ ${c.sleep_score ?? '—'} · stress ${c.stress_score ?? '—'}</div></a>
      ${c.coach_reply ? '<span class="badge badge--ok">Đã trả lời</span>' : '<span class="badge badge--hot">Chờ trả lời</span>'}</li>`).join('')}</ul>`
      : '<p class="muted">Khách chưa gửi check-in nào. Thẻ nhắc hiện trên trang Hôm nay của khách vào thứ 7 và Chủ nhật.</p>'}</div>`);
}
