// DINO-012 — Báo cáo giai đoạn (Coach + Khách): đầu–cuối, ảnh 2 mốc, buổi tập, top tăng 1RM, km, tuân thủ ăn,
// tóm tắt Coach + nhận xét Khách → hai bên "Đồng ý" → Coach "Tạo giai đoạn tiếp"
import { render, $, esc, toast, busy, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from '../coach/home.js';
import { clientTabs } from '../client/home.js';
import { loadExercises } from '../../lib/exercises.js';
import { todayISO } from '../../lib/plan.js';
import { phaseReport } from '../../lib/checkin.js';
import { getReview, saveReview, reportData, createNextPhase } from '../../lib/checkinStore.js';
import { signedUrls } from '../../lib/files.js';
import { renderChat } from './chat.js';

const n1 = (x) => (x == null ? '—' : String(Math.round(x * 10) / 10).replace('.', ','));

export async function phaseReportView({ params, profile }) {
  const coach = profile.role === 'coach';
  if (coach) coachTabs(); else clientTabs();
  const db = await sb();
  const { data: phase, error } = await db.from('phases').select('*').eq('id', params.id).single();
  if (error) throw error;
  if (!coach && phase.status === 'draft') { render('<div class="card"><p>Giai đoạn này chưa được phát hành.</p></div>'); return; }
  const [rv, data, exList, { data: client }] = await Promise.all([getReview(phase.id), reportData(phase.client_id, phase), loadExercises(),
    db.from('profiles').select('id, full_name, coach_id').eq('id', phase.client_id).single()]);
  const r = phaseReport({ phase, ...data, exById: new Map(exList.map((e) => [e.id, e])), today: todayISO() });
  const urls = await signedUrls([r.photos.start?.storage_path, r.photos.end?.storage_path].filter(Boolean)).catch(() => ({}));
  const arrow = (row) => (row.diff == null || row.diff === 0 ? '' : `${row.diff < 0 ? '↓' : '↑'} ${n1(Math.abs(row.diff))}`);
  const good = (row) => row.diff != null && row.diff !== 0 && row.better && ((row.better === 'down') === (row.diff < 0));
  const agreedC = !!rv?.coach_agreed_at, agreedK = !!rv?.client_agreed_at;
  const back = coach ? `#/coach/client/${phase.client_id}/plan?phase=${phase.id}` : '#/client/plan';

  render(`<div id="pv">
    <p class="small"><a href="${back}">← ${coach ? 'Giáo án' : 'Lịch tập'}</a></p>
    <h1>Báo cáo giai đoạn</h1>
    <p class="muted small" style="margin-top:-4px">${esc(client?.full_name || '')} · ${esc(phase.name)} · ${fmtDate(phase.start_date)} → ${fmtDate(phase.end_date)}</p>
    ${rv?.status === 'agreed' ? '<div class="card card--hi"><strong>Hai bên đã thống nhất ✓</strong></div>' : ''}
    ${r.missing.length ? `<div class="card card--flag"><strong>Còn thiếu dữ liệu cuối giai đoạn</strong>
      <p class="small" style="margin:4px 0 0">${esc(r.missing.join(', '))}. ${coach ? 'Nhắc khách cập nhật để so sánh chính xác.' : '<a href="#/client/body">Cập nhật ở tab Cơ thể →</a>'}</p></div>` : ''}

    <h2>Cơ thể: đầu → cuối</h2>
    <div class="card">${r.body.length ? `<ul class="list">${r.body.map((b) => `<li><span>${esc(b.label)}</span>
      <span class="small" style="text-align:right">${n1(b.start)} → <strong>${n1(b.end)}</strong> ${b.unit}
        ${arrow(b) ? `<span class="badge ${good(b) ? 'badge--ok' : ''}" style="margin-left:6px">${arrow(b)}</span>` : ''}</span></li>`).join('')}</ul>` : '<p class="muted small">Chưa có số đo / InBody trong giai đoạn.</p>'}</div>

    ${r.photos.start ? `<h2>Ảnh trước / sau (chính diện)</h2>
    <div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      ${[['start', 'Đầu'], ['end', 'Cuối']].map(([k, l]) => `<figure style="margin:0">${r.photos[k] && urls[r.photos[k].storage_path] ? `<img src="${urls[r.photos[k].storage_path]}" alt="Ảnh ${l.toLowerCase()} giai đoạn" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:12px">` : '<div class="muted small" style="aspect-ratio:3/4;border:1px dashed var(--line);border-radius:12px;display:flex;align-items:center;justify-content:center">Chưa có ảnh</div>'}
        <figcaption class="small muted" style="text-align:center;margin-top:4px">${l}${r.photos[k] ? ' · ' + fmtDate(r.photos[k].taken_on) : ''}</figcaption></figure>`).join('')}
    </div>` : ''}

    <h2>Tập luyện &amp; dinh dưỡng</h2>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px">
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Buổi đã tập</div><div style="font-size:22px;font-weight:800">${r.sessionsDone}<span class="small muted">/${r.sessionsDue}</span></div></div>
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Chạy</div><div style="font-size:22px;font-weight:800">${n1(r.km)}<span class="small muted"> km</span></div></div>
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Ăn đúng TB</div><div style="font-size:22px;font-weight:800">${r.eatPct ?? '—'}${r.eatPct != null ? '%' : ''}</div></div>
    </div>
    <div class="card"><strong>Top tăng sức mạnh (1RM ước tính)</strong>
      ${r.topGains.length ? `<ul class="list">${r.topGains.map((g) => `<li><span>${esc(g.name)}</span><span class="small">${n1(g.from)} → <strong>${n1(g.to)}</strong> kg <span class="badge badge--ok">↑ ${g.pct}%</span></span></li>`).join('')}</ul>`
        : '<p class="small muted" style="margin:6px 0 0">Chưa đủ dữ liệu tạ ở đầu và cuối giai đoạn để so sánh.</p>'}</div>

    <h2>Nhận xét &amp; thống nhất</h2>
    <form id="rf" class="card stack">
      <label class="field" style="margin:0"><span>Tóm tắt của Coach</span><textarea name="coach_summary" rows="3" ${coach ? '' : 'readonly'} placeholder="${coach ? 'Kết quả chính, điều làm tốt, điều cần cải thiện…' : 'Coach chưa viết'}">${esc(rv?.coach_summary || '')}</textarea></label>
      <label class="field" style="margin:0"><span>Quyết định cho giai đoạn tới</span><textarea name="next_decisions" rows="3" ${coach ? '' : 'readonly'} placeholder="${coach ? 'Mục tiêu, số buổi/tuần, thay đổi kcal…' : 'Coach chưa viết'}">${esc(rv?.next_decisions || '')}</textarea></label>
      <label class="field" style="margin:0"><span>Nhận xét của Khách</span><textarea name="client_feedback" rows="3" ${coach ? 'readonly' : ''} placeholder="${coach ? 'Khách chưa viết' : 'Bạn thấy giai đoạn này thế nào? Muốn thay đổi gì?'}">${esc(rv?.client_feedback || '')}</textarea></label>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn" name="save">Lưu</button>
        <button type="button" class="btn btn--primary" id="agree" ${(coach ? agreedC : agreedK) ? 'disabled' : ''}>${(coach ? agreedC : agreedK) ? 'Bạn đã đồng ý ✓' : 'Đồng ý'}</button>
      </div>
      <div class="small muted">Coach: ${agreedC ? '<span style="color:var(--tint)">đã đồng ý ✓</span>' : 'chưa đồng ý'} · Khách: ${agreedK ? '<span style="color:var(--tint)">đã đồng ý ✓</span>' : 'chưa đồng ý'} · Coach sửa tóm tắt sau khi khách đồng ý thì khách đồng ý lại.</div>
    </form>
    ${coach && rv?.status === 'agreed' ? '<button class="btn btn--primary btn--block" id="next" style="min-height:54px">Tạo giai đoạn tiếp (bản nháp) →</button>' : ''}
    <div id="chat"></div>
  </div>`);

  const reload = () => phaseReportView({ params, profile });
  const payload = (f) => coach ? { coach_summary: f.coach_summary.value.trim() || null, next_decisions: f.next_decisions.value.trim() || null } : { client_feedback: f.client_feedback.value.trim() || null };
  const base = { client_id: phase.client_id, phase_id: phase.id };
  $('#rf').addEventListener('submit', async (e) => {
    e.preventDefault();
    await busy(e.submitter, async () => { try { await saveReview({ ...base, ...payload(e.target) }); toast('Đã lưu.'); reload(); } catch (err) { toast(viError(err), 'error'); } });
  });
  $('#agree').addEventListener('click', async (e) => {
    const f = $('#rf');
    if (coach && !f.coach_summary.value.trim()) return toast('Viết tóm tắt trước khi đồng ý.', 'error');
    await busy(e.currentTarget, async () => {
      try { await saveReview({ ...base, ...payload(f), [coach ? 'coach_agreed_at' : 'client_agreed_at']: new Date().toISOString() }); toast('Đã đồng ý.'); reload(); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
  $('#next')?.addEventListener('click', async (e) => {
    if (!confirm('Tạo giai đoạn tiếp: chép tuần 1 của giai đoạn này, sinh các tuần sau theo quy tắc tăng tải, để ở bản nháp. Tiếp tục?')) return;
    await busy(e.currentTarget, async () => {
      try { const ph = await createNextPhase(phase.client_id, phase); toast('Đã tạo giai đoạn mới (nháp).'); location.hash = `#/coach/client/${phase.client_id}/plan?phase=${ph.id}`; }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
  await renderChat($('#chat'), { clientId: phase.client_id, contextId: phase.id, type: 'phase', title: 'Trao đổi về giai đoạn', me: profile.id,
    names: { [profile.id]: 'Bạn', [phase.client_id]: client?.full_name || 'Khách', [client?.coach_id]: 'Coach' } });
}
