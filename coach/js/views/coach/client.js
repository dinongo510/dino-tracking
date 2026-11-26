// DINO-007 — Trang chi tiết khách (Coach): cờ đỏ · hồ sơ · gợi ý · số đo/InBody · OHSA + corrective
import { render, $, esc, toast, busy, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { renderBody } from '../shared/body.js';
import { renderPhotos } from '../shared/photos.js';
import { STEPS, getVal, deriveFlag, coachHints, suggestActivityFactor } from '../../lib/intake.js';
import { ageFromDob } from '../../lib/formulas.js';

export const OHSA = [
  ['feet_turn_out', 'Bàn chân xoay ngoài', 'Soleus, bụng ngoài bắp chân, đầu ngắn nhị đầu đùi', 'Bụng trong bắp chân, hamstring trong, gracilis, sartorius'],
  ['knees_in', 'Gối đổ vào trong', 'Nhóm khép, TFL, vastus lateralis', 'Mông nhỡ, mông lớn, VMO'],
  ['forward_lean', 'Đổ người trước quá mức', 'Soleus, bắp chân, gập hông, cơ bụng', 'Chày trước, mông lớn, dựng sống'],
  ['low_back_arch', 'Võng lưng dưới', 'Gập hông, dựng sống, xô', 'Mông lớn, hamstring, core sâu'],
  ['arms_forward', 'Tay đổ về trước', 'Xô, tròn lớn, ngực lớn/nhỏ', 'Thang giữa/dưới, trám, chóp xoay'],
];
const STEP_ORDER = ['inhibit', 'lengthen', 'activate', 'integrate'];
const STEP_VI = { inhibit: '1. Ức chế (lăn foam)', lengthen: '2. Kéo giãn', activate: '3. Kích hoạt', integrate: '4. Tích hợp' };
const GOAL_VI = { fat_loss: 'Giảm mỡ', recomp: 'Recomp / sức khỏe', muscle_gain: 'Tăng cơ', performance: 'Thành tích' };

/** Bài corrective mặc định cho các bù trừ đã chọn (theo tag ohsa:* của DINO-008) */
export async function correctiveFor(codes) {
  if (!codes.length) return {};
  const { data, error } = await (await sb()).from('exercises').select('id, name_vi, corrective_step, tags')
    .overlaps('tags', codes.map((c) => 'ohsa:' + c));
  if (error) throw error;
  const byStep = {};
  for (const e of data) (byStep[e.corrective_step] ||= []).push(e);
  return byStep;
}

export async function coachClientView({ params, profile }) {
  coachTabs();
  const db = await sb();
  const id = params.id;
  const [{ data: c, error }, { data: h }, { data: a }] = await Promise.all([
    db.from('profiles').select('*').eq('id', id).single(),
    db.from('health_intakes').select('*').eq('client_id', id).maybeSingle(),
    db.from('assessments').select('*').eq('client_id', id).order('assessed_on', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const { data: note } = await db.from('coach_notes').select('notes').eq('client_id', id).maybeSingle();
  if (error) throw error;
  const flags = h ? deriveFlag(h) : [];
  const hints = h ? coachHints(h) : [];
  const summary = h ? [
    ['Tuổi', h.dob ? ageFromDob(h.dob) : '—'], ['Giới tính', h.sex === 'male' ? 'Nam' : h.sex === 'female' ? 'Nữ' : '—'],
    ['Chiều cao', h.height_cm ? h.height_cm + ' cm' : '—'], ['Mục tiêu', GOAL_VI[h.goal] || 'Chưa chốt — chọn bên dưới'],
    ['Hệ số vận động gợi ý', h.activity_factor ?? suggestActivityFactor(h)], ['Liên hệ khẩn cấp', h.emergency_contact || '—'],
    ['Chấn thương', h.injuries || '—'], ['Bệnh lý / thuốc', [h.medical, h.medications].filter(Boolean).join(' · ') || '—'],
  ] : [];
  const sel = new Set(Object.entries(a?.ohsa || {}).filter(([, v]) => v).map(([k]) => k));

  render(`
    <p class="small"><a href="#/coach">← Danh sách khách</a></p>
    <h1>${esc(c.full_name || '(chưa có tên)')}</h1><p class="muted small">${esc(c.phone || '')} · từ ${fmtDate(c.created_at)}</p>
    <a class="btn btn--primary" href="#/coach/client/${id}/plan" style="margin:4px 0 8px">Giáo án tập luyện →</a>
    ${flags.length ? `<div class="card card--flag"><strong style="color:var(--danger)">Cờ đỏ — liên hệ khách trước khi giao bài</strong><ul class="small">${flags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>` : ''}
    ${!h ? '<div class="card"><p class="muted">Khách chưa điền hồ sơ.</p></div>' : !h.updated_at ? '<div class="card"><p class="muted">Khách đang điền hồ sơ dở.</p></div>' : ''}

    ${h ? `<h2>Tóm tắt</h2><div class="card"><ul class="list">${summary.map(([k, v]) => `<li><span class="muted small">${esc(k)}</span><span style="text-align:right">${esc(v)}</span></li>`).join('')}</ul>
      <details style="margin-top:8px"><summary class="small">Xem toàn bộ hồ sơ</summary>${STEPS.map((s) => `<h2 class="small">${esc(s.title)}</h2><ul class="list small">${s.fields.filter((f) => f.key && !f.key.startsWith('profile.') && !f.key.startsWith('measure.')).map((f) => {
        let v = getVal(h, f.key); if (v == null || v === '') return ''; if (f.options) v = (f.options.find(([k]) => k === String(v)) || [, v])[1];
        return `<li style="display:block"><div class="muted">${esc(f.label)}</div><div>${esc(v)}</div></li>`; }).join('')}</ul>`).join('')}
        <p class="no-print"><button class="btn small" onclick="print()">In phiếu</button></p></details></div>` : ''}

    ${h ? `<h2>Mục tiêu (Coach chốt)</h2><form id="gf" class="card">
      <p class="small muted">Khách tự chấm (0–10): ${['fat_loss','muscle_gain','performance','health'].map((k) => `${esc({fat_loss:'Giảm cân',muscle_gain:'Tăng cơ',performance:'Thành tích',health:'Sức khỏe'}[k])} ${esc(h.goal_ratings?.[k] ?? '–')}`).join(' · ')}</p>
      <div class="row"><select name="goal" style="flex:1"><option value="">— Chọn mục tiêu —</option>${Object.entries(GOAL_VI).map(([k, l]) => `<option value="${k}"${h.goal === k ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <button class="btn btn--primary">Lưu</button></div></form>` : ''}
    ${hints.length ? `<h2>Gợi ý từ hồ sơ</h2><div class="card"><ul class="small">${hints.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}

    <h2>Ghi chú nội bộ <span class="badge">Khách không thấy</span></h2>
    <form id="nf" class="card"><textarea name="n" rows="3">${esc(note?.notes || '')}</textarea>
      <button class="btn small" style="margin-top:8px">Lưu ghi chú</button></form>

    <h2>Đánh giá OHSA ${a ? `<span class="muted small">(gần nhất ${fmtDate(a.assessed_on)})</span>` : ''}</h2>
    <form id="of" class="card">
      ${OHSA.map(([k, l]) => `<label class="row" style="min-height:44px"><input type="checkbox" name="${k}"${sel.has(k) ? ' checked' : ''}> ${esc(l)}</label>`).join('')}
      <label class="field"><span>Ghi chú</span><input class="input" name="note" value="${esc(a?.note || '')}"></label>
      <button class="btn btn--primary">Lưu đánh giá mới</button>
    </form>
    <div id="corr"></div>

    <div id="body"></div>
    <div id="photos"></div>`);

  $('#gf')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const goal = e.target.goal.value || null;
    if (!goal) return toast('Chọn một mục tiêu.', 'error');
    await busy(e.submitter, async () => {
      const { error: err } = await db.from('health_intakes').update({ goal }).eq('client_id', id);
      if (err) return toast(viError(err), 'error');
      toast('Đã chốt mục tiêu.'); coachClientView({ params, profile });
    });
  });

  $('#nf').addEventListener('submit', async (e) => {
    e.preventDefault();
    await busy(e.submitter, async () => {
      const { error: err } = await db.from('coach_notes').upsert({ client_id: id, notes: e.target.n.value, updated_at: new Date().toISOString() }, { onConflict: 'client_id' });
      toast(err ? viError(err) : 'Đã lưu ghi chú.', err ? 'error' : 'info');
    });
  });

  const drawCorr = async (codes) => {
    const box = $('#corr');
    if (!codes.length) { box.innerHTML = ''; return; }
    const by = await correctiveFor(codes);
    box.innerHTML = `<div class="card"><strong>Gợi ý corrective</strong>
      ${OHSA.filter(([k]) => codes.includes(k)).map(([, l, over, under]) => `<p class="small" style="margin-top:8px"><strong>${esc(l)}</strong><br>
        <span class="muted">Hoạt động quá mức:</span> ${esc(over)}<br><span class="muted">Kém hoạt động:</span> ${esc(under)}</p>`).join('')}
      ${STEP_ORDER.map((s) => by[s]?.length ? `<p class="small" style="margin:8px 0 2px"><strong>${STEP_VI[s]}</strong></p><p class="small">${by[s].map((e) => esc(e.name_vi)).join(' · ')}</p>` : '').join('')}
      ${Object.keys(by).length ? '' : '<p class="muted small">Chưa có bài corrective trong thư viện (chạy migration 0002).</p>'}
      <p class="muted small">Đưa khối này vào buổi khởi động ở DINO-009 (“Lấy từ OHSA”).</p></div>`;
  };
  drawCorr([...sel]);

  $('#of').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, ohsa = Object.fromEntries(OHSA.map(([k]) => [k, f[k].checked]));
    await busy(e.submitter, async () => {
      const { error: err } = await db.from('assessments').insert({ client_id: id, ohsa, note: f.note.value || null });
      if (err) return toast(viError(err), 'error');
      toast('Đã lưu đánh giá.'); drawCorr(OHSA.map(([k]) => k).filter((k) => ohsa[k]));
    });
  });

  await renderBody($('#body'), id, profile.id);
  await renderPhotos($('#photos'), id, profile.id);
}
