// DINO-010 — Coach xem phiếu buổi tập: mục tiêu vs thực tế, khối lượng, e1RM, gợi ý tăng tải, "Đã xem", chat
import { render, $, esc, toast, busy } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { loadExercises } from '../../lib/exercises.js';
import { DAY_VI, itemSummary, blockSummary } from '../../lib/plan.js';
import { loadSession } from '../../lib/planStore.js';
import { grade, sessionStats, suggestions, rowKind, toClock, pace } from '../../lib/sessionLog.js';
import { loadLogs, loadFeedback, markReviewed, nextItemFor, setItemLoad } from '../../lib/logStore.js';
import { useForSession } from '../../lib/packageStore.js';
import { renderChat } from '../shared/chat.js';

const dm = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');
const COLOR = { hit: 'var(--ok-bg)', over: 'hsl(calc(var(--h) + 38) 85% 60% / .12)', under: 'rgba(255,255,255,.03)' };
const GRADE_VI = { hit: '✓ Đạt', over: '↑ Vượt', under: '✕ Hụt' };

export async function coachReviewView({ params, profile }) {
  coachTabs();
  const [{ session: s, phase }, exList] = await Promise.all([loadSession(params.id), loadExercises()]);
  const exById = new Map(exList.map((e) => [e.id, e]));
  const items = s.blocks.flatMap((b) => b.items);
  const [logs, fb, { data: client }] = await Promise.all([loadLogs(items.map((i) => i.id)), loadFeedback(s.id),
    (await sb()).from('profiles').select('id, full_name').eq('id', s.client_id).single()]);
  const st = sessionStats(s, logs, exById), sug = suggestions(s, logs, exById);
  const use = s.mode === 'pt' ? await useForSession(s.id).catch(() => null) : null;
  const anyLog = Object.values(logs).some((a) => a.some((l) => l.done !== false));

  render(`<div id="rv">
    <p class="small"><a href="#/coach/inbox">← Hộp việc</a> · <a href="#/coach/client/${s.client_id}/plan?phase=${phase.id}">Giáo án</a> · <a href="#/coach/session/${s.id}">Sửa buổi này</a></p>
    <h1 style="margin-bottom:0">${esc(client?.full_name || 'Khách')} · ${esc(s.title || 'Buổi tập')}</h1>
    <p class="muted small">${DAY_VI[s.day_no - 1]} ${dm(s.scheduled_on)} · tuần ${s.week_no} · ${esc(phase.name)}</p>
    ${s.mode === 'pt' ? `<div class="card card--hi row row--between" style="flex-wrap:wrap"><span><strong style="color:var(--tint)">Buổi PT tại chỗ</strong>
      <span class="small muted">· ${use ? `đã trừ gói ngày ${dm(use.used_on)} ✓` : 'chưa trừ gói'}</span></span>
      <a class="btn btn--primary small" href="#/client/session/${s.id}">${fb?.completed ? 'Sửa kết quả' : 'Ghi kết quả buổi PT →'}</a></div>` : ''}

    <div class="card ${fb?.pain?.length ? 'card--flag' : ''}">
      ${fb?.completed ? `<div class="row row--between"><strong>Khách đã hoàn thành ✓</strong>
          ${fb.coach_reviewed ? '<span class="badge badge--ok">Đã xem</span>' : '<button class="btn btn--primary small" id="seen">Đã xem</button>'}</div>
        <ul class="list small" style="margin-top:6px">
          <li><span class="muted">RPE cả buổi</span><strong>${fb.session_rpe ?? '—'}</strong></li>
          <li><span class="muted">Đau</span><strong style="${fb.pain?.length ? 'color:var(--danger)' : ''}">${fb.pain?.length ? esc(fb.pain.map((p) => `${p.area} ${p.level}/5`).join(', ')) : 'Không'}</strong></li>
          ${fb.note ? `<li><span class="muted">Ghi chú</span><span>${esc(fb.note)}</span></li>` : ''}</ul>`
        : `<p class="muted">${anyLog ? 'Khách đang ghi dở, chưa bấm hoàn thành.' : 'Khách chưa ghi buổi này.'}</p>`}
    </div>

    ${anyLog ? `<div class="card"><div class="row" style="gap:16px;flex-wrap:wrap">
        <div><div class="small muted">Khối lượng tạ</div><strong>${st.volume.toLocaleString('vi-VN')} kg</strong></div>
        ${st.km ? `<div><div class="small muted">Chạy</div><strong>${st.km.toLocaleString('vi-VN')} km</strong></div>` : ''}
        <div><div class="small muted">Hiệp đạt / vượt / hụt</div><strong>${st.counts.hit} / ${st.counts.over} / ${st.counts.under}</strong></div></div>
      ${st.best.length ? `<p class="small" style="margin:8px 0 0">1RM ước tính (Epley): ${st.best.slice(0, 3).map((b) => `<strong>${esc(b.ex?.name_vi || '')}</strong> ${b.e1rm} kg <span class="muted">(${b.kg} kg × ${b.reps})</span>`).join(' · ')}</p>` : ''}</div>` : ''}

    ${sug.length ? `<h2>Gợi ý tải buổi sau</h2><div class="card"><ul class="list">${sug.map((g, i) => `<li>
        <div style="flex:1"><strong>${esc(g.ex?.name_vi || '')}</strong>: ${g.current} → <strong>${g.loadKg} kg</strong>
          <div class="small muted">${esc(g.reason)}</div><div class="small" data-next="${i}"></div></div>
        ${g.change ? `<button class="btn small" data-apply="${i}">Áp dụng</button>` : '<span class="small muted">Giữ tải</span>'}</li>`).join('')}</ul>
      <p class="small muted">Chỉ là gợi ý. Bấm "Áp dụng" để đổi tải của bài này ở buổi kế tiếp có bài đó.</p></div>` : ''}

    <h2>Chi tiết</h2>
    ${s.blocks.map((b) => `<div class="card"><strong>${esc(b.label ? b.label + '. ' : '')}${esc(blockSummary(b))}</strong>
      ${b.items.map((it) => { const ex = exById.get(it.exercise_id), kind = rowKind(b, it, ex), ls = (logs[it.id] || []).filter((l) => l.done !== false).sort((a, c) => a.set_no - c.set_no);
        return `<div style="margin-top:10px"><strong>${esc(ex?.name_vi || 'Bài tập')}</strong> <span class="small muted">· mục tiêu ${esc(itemSummary(it))}</span>
          ${ls.length ? `<table style="width:100%;border-collapse:collapse;margin-top:4px" class="small"><tbody>${ls.map((l) => { const g = grade(it, l);
            const val = kind === 'run' ? `${l.distance_m ?? '–'} m · ${toClock(l.duration_sec) || '–'}${pace(l.distance_m, l.duration_sec) ? ' · ' + pace(l.distance_m, l.duration_sec) + '/km' : ''}${l.avg_hr ? ' · HR ' + l.avg_hr : ''}`
              : kind === 'timed' ? `${l.duration_sec ?? '–'} giây` : `${l.reps ?? '–'} rep${l.load_kg != null ? ' × ' + Number(l.load_kg) + ' kg' : ''}${l.rpe != null ? ' · RPE ' + Number(l.rpe) : ''}`;
            return `<tr style="background:${COLOR[g] || ''}"><td style="padding:4px 6px;width:56px">Hiệp ${l.set_no}</td><td style="padding:4px 6px">${val}</td><td style="padding:4px 6px;text-align:right">${GRADE_VI[g] || ''}</td></tr>`; }).join('')}</tbody></table>`
            : '<div class="small muted">Chưa ghi.</div>'}</div>`; }).join('')}</div>`).join('')}
    <div id="chat"></div></div>`);

  $('#seen')?.addEventListener('click', async (e) => {
    await busy(e.currentTarget, async () => { try { await markReviewed(s.id); toast('Đã đánh dấu xem.'); coachReviewView({ params, profile }); } catch (err) { toast(viError(err), 'error'); } });
  });
  $('#rv').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-apply]'); if (!b) return;
    const g = sug[+b.dataset.apply], out = document.querySelector(`[data-next="${b.dataset.apply}"]`);
    await busy(b, async () => {
      try {
        const nx = await nextItemFor(s.client_id, s, g.item.exercise_id);
        if (!nx) { out.textContent = 'Không tìm thấy buổi sau nào có bài này.'; return; }
        await setItemLoad(nx.item.id, g.loadKg);
        out.innerHTML = `✓ Đã đặt ${g.loadKg} kg cho <a href="#/coach/session/${nx.session.id}">tuần ${nx.session.week_no} · ${DAY_VI[nx.session.day_no - 1]} ${dm(nx.session.scheduled_on)}</a>`;
        toast('Đã áp dụng cho buổi sau.');
      } catch (err) { toast(viError(err), 'error'); }
    });
  });
  await renderChat($('#chat'), { clientId: s.client_id, sessionId: s.id, me: profile.id, names: { [profile.id]: 'Bạn', [s.client_id]: client?.full_name || 'Khách' } });
}
