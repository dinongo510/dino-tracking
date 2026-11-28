// DINO-011 — Dinh dưỡng của 1 khách (Coach): mục tiêu → thực đơn theo bữa → nhật ký ăn
import { render, $, esc, toast, busy, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { norm } from '../../lib/exercises.js';
import { addDays, todayISO } from '../../lib/plan.js';
import { LEVEL_VI, GROUP_VI, SLOT_CODE, latestBody, computeTargets, carbFrom, slotTargets, totalsOf, fits, fitReason, suggestOptions, applyDayPlan, scaleItems, defaultSlots, adherenceRange } from '../../lib/nutrition.js';
import { loadNutrition, loadBodyAndIntake, approveTarget, insertSlots, updateSlot, deleteSlot, insertOption, deleteOption, replacePlan, listTemplates, listChecks } from '../../lib/nutritionStore.js';
import { signedUrls } from '../../lib/files.js';

const GOAL_VI = { fat_loss: 'Giảm mỡ', recomp: 'Recomp / sức khỏe', muscle_gain: 'Tăng cơ', performance: 'Thành tích' };
const LEVEL_COLOR = { on: '#2e7d32', near: '#f9a825', off: '#c62828' };
const dm = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const fmtQty = (q) => String(q).replace('.', ',');

export async function coachNutritionView({ params, profile }) {
  coachTabs();
  const clientId = params.id;
  const today = todayISO(), from = addDays(today, -6);
  const [{ data: client }, N, B, T, checks] = await Promise.all([
    (await sb()).from('profiles').select('id, full_name').eq('id', clientId).single(),
    loadNutrition(clientId), loadBodyAndIntake(clientId), listTemplates(), listChecks(clientId, from, today),
  ]);
  const foodById = new Map(N.foods.map((f) => [f.id, f]));
  const body = latestBody(B.measurements, B.scans);
  const sug = computeTargets(B.intake, body);
  const cur = N.target;
  const st = cur ? slotTargets(cur, N.slots) : [];
  const itemsText = (items) => items.map((i) => `${esc(foodById.get(i.food_id)?.name_vi || '(món đã xóa)')} ×${fmtQty(i.qty)}`).join(' · ');
  const totText = (t) => `${t.kcal} kcal · P ${t.proteinG} · C ${t.carbG} · F ${t.fatG}`;
  const reload = () => coachNutritionView({ params, profile });
  const v = (k) => (cur ? cur[k] : sug[{ kcal: 'kcal', protein_g: 'proteinG', carb_g: 'carbG', fat_g: 'fatG' }[k]]) ?? '';

  // Nhật ký 7 ngày
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i)).reverse();
  const urls = await signedUrls(checks.map((c) => c.photo_path)).catch(() => ({}));
  const adh = adherenceRange(checks, N.slots.length, 7);

  render(`<div id="nv">
    <p class="small"><a href="#/coach/client/${clientId}">← ${esc(client?.full_name || 'Khách')}</a> · <a href="#/coach/foods">Kho món</a></p>
    <h1>Dinh dưỡng</h1>

    <h2>1. Mục tiêu ngày</h2>
    <div class="card">
      <ul class="list small">
        <li><span class="muted">Cân nặng</span><strong>${body.weightKg ? `${body.weightKg} kg <span class="muted">(${fmtDate(body.weightDate)})</span>` : '—'}</strong></li>
        <li><span class="muted">FFM (InBody)</span><strong>${body.ffmKg ? `${body.ffmKg} kg` : '—'}</strong></li>
        <li><span class="muted">Giới · tuổi · cao</span><strong>${B.intake.sex === 'male' ? 'Nam' : B.intake.sex === 'female' ? 'Nữ' : '—'} · ${sug.age ?? '—'} · ${B.intake.height_cm ?? '—'} cm</strong></li>
        <li><span class="muted">Vận động · mục tiêu</span><strong>× ${B.intake.activity_factor ?? 1.375} · ${esc(GOAL_VI[B.intake.goal] || '—')}</strong></li>
        ${sug.missing?.length ? `<li><span style="color:var(--danger)">Thiếu: ${esc(sug.missing.join(', '))} — bổ sung ở hồ sơ / số đo để app tự tính.</span></li>`
          : `<li><span class="muted">Công thức gợi ý</span><strong>${sug.formula === 'katch' ? 'Katch-McArdle (có FFM)' : 'Mifflin-St Jeor'} · BMR ${sug.bmr} · TDEE ${sug.tdee}</strong></li>
             <li><span class="muted">App đề xuất</span><strong>${sug.kcal} kcal · P ${sug.proteinG} · C ${sug.carbG} · F ${sug.fatG}</strong></li>`}
      </ul>
      <form id="tf" class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px;align-items:flex-end">
        ${[['kcal', 'Kcal'], ['protein_g', 'Đạm (g)'], ['fat_g', 'Béo (g)'], ['carb_g', 'Tinh bột (g)']].map(([k, l]) => `
          <label class="field" style="flex:1;min-width:90px;margin:0"><span>${l}</span><input class="input" type="number" min="0" step="1" name="${k}" value="${v(k)}" required></label>`).join('')}
        <button class="btn btn--primary">Duyệt mục tiêu</button>
      </form>
      <p class="small muted" style="margin:6px 0 0">Sửa kcal / đạm / béo thì tinh bột tự tính lại. ${cur ? `Đang áp dụng từ ${fmtDate(cur.valid_from)}.` : 'Khách chưa có mục tiêu được duyệt.'}</p>
      ${N.targets.length > 1 ? `<details style="margin-top:6px"><summary class="small">Lịch sử (${N.targets.length})</summary><ul class="list small">${N.targets.map((t) => `<li><span>${fmtDate(t.valid_from)}</span><span>${t.kcal} kcal · P ${t.protein_g} · C ${t.carb_g} · F ${t.fat_g}</span></li>`).join('')}</ul></details>` : ''}
    </div>

    <h2>2. Thực đơn theo bữa</h2>
    ${!cur ? '<div class="card"><p class="muted">Duyệt mục tiêu ở trên trước, rồi mới lên thực đơn.</p></div>' : `
    <div class="card row" style="gap:6px;flex-wrap:wrap">
      <select id="dpSel" style="flex:1;min-width:220px"><option value="">— Áp thực đơn mẫu cả ngày —</option>${T.days.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select>
      <button class="btn small" id="dpApply">Áp cho khách</button>
      ${!N.slots.length ? '<button class="btn btn--ghost small" id="mkSlots">Tạo 4 bữa trống (Sáng 30 · Trưa 35 · Tối 25 · Phụ 10)</button>' : ''}
    </div>
    ${N.slots.map((s, i) => { const t = st[i]; return `<div class="card" data-slot="${s.id}">
      <div class="row row--between" style="gap:6px;flex-wrap:wrap"><strong>${esc(s.name)}</strong>
        <span class="small">mục tiêu <strong>${t.kcal} kcal · đạm ≥ ${Math.round(t.proteinG * 0.8)} g</strong></span>
        <label class="small row" style="gap:4px">% kcal <input class="input" type="number" min="0" max="100" step="0.5" data-pct value="${s.kcal_pct}" style="width:70px;padding:4px"></label>
        <button class="btn btn--ghost small" data-delslot>✕</button></div>
      <ul class="list" style="margin-top:6px">${s.options.map((o) => { const tot = totalsOf(o.items, foodById), ok = fits(tot, t); return `<li>
        <div style="flex:1"><strong>${esc(o.label || 'Phương án')}</strong> <span class="badge ${ok ? 'badge--ok' : ''}" style="${ok ? '' : 'background:#c62828;color:#fff'}">${ok ? '✓ vừa khung' : `✗ ${esc(fitReason(tot, t) || 'lệch khung')}`}</span>
          <div class="small">${itemsText(o.items)}</div><div class="small muted">${totText(tot)}</div></div>
        <button class="btn btn--ghost small" data-delopt="${o.id}">✕</button></li>`; }).join('') || '<li class="small muted">Chưa có phương án.</li>'}</ul>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
        <button class="btn small" data-build>+ Phương án</button>
        <button class="btn btn--ghost small" data-suggest>Gợi ý phương án</button>
        <select data-mt style="max-width:220px"><option value="">+ Từ mẫu bữa…</option>${T.meals.filter((m) => SLOT_CODE[m.slot] === s.name || !Object.values(SLOT_CODE).includes(s.name)).map((m) => `<option value="${m.id}">${esc(m.name)} (${Math.round(m.kcal)} kcal)</option>`).join('')}</select>
      </div>
      <div data-sug></div>
    </div>`; }).join('')}
    ${N.slots.length ? `<p class="small muted">Tổng % kcal các bữa: ${N.slots.reduce((a, s) => a + Number(s.kcal_pct), 0)}%. Mỗi bữa nên có 2–4 phương án để khách chọn.</p>` : ''}`}

    <h2>3. Nhật ký ăn 7 ngày ${adh != null ? `<span class="badge ${adh >= 80 ? 'badge--ok' : ''}">Tuân thủ ${adh}%</span>` : ''}</h2>
    <div class="card"><ul class="list">${days.map((d) => { const cs = checks.filter((c) => c.check_date === d); return `<li style="align-items:flex-start">
      <strong style="width:52px">${dm(d)}</strong>
      <div style="flex:1">${N.slots.map((s) => { const c = cs.find((x) => x.slot_id === s.id); return `<div class="small" style="display:flex;gap:6px;align-items:center;margin:2px 0">
        <span style="width:44px">${esc(s.name)}</span>${c ? `<span class="badge" style="background:${LEVEL_COLOR[c.level]};color:#fff">${LEVEL_VI[c.level]}</span>${c.note ? `<span class="muted">${esc(c.note)}</span>` : ''}
        ${c.photo_path && urls[c.photo_path] ? `<a href="${urls[c.photo_path]}" target="_blank"><img src="${urls[c.photo_path]}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px"></a>` : ''}` : '<span class="muted">—</span>'}</div>`; }).join('') || '<span class="small muted">Chưa có bữa.</span>'}</div></li>`; }).join('')}</ul></div>

    <dialog id="dob"><form method="dialog" id="fob" class="stack" style="min-width:min(92vw,560px)">
      <h2 style="margin:0">Phương án — <span id="obSlot"></span></h2>
      <input class="input" name="label" placeholder="Tên phương án (ví dụ: Cơm gà)">
      <input class="input" id="obQ" placeholder="Tìm món (không cần dấu)…" autocomplete="off">
      <ul class="list" id="obRes" style="max-height:180px;overflow:auto"></ul>
      <div id="obRows" class="stack"></div>
      <p class="small" id="obTot"></p>
      <div class="row"><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary" style="flex:1">Lưu phương án</button></div>
    </form></dialog></div>`);

  // ---------- Mục tiêu ----------
  const tf = $('#tf');
  ['kcal', 'protein_g', 'fat_g'].forEach((k) => tf[k].addEventListener('input', () => { tf.carb_g.value = carbFrom(+tf.kcal.value, +tf.protein_g.value, +tf.fat_g.value); }));
  tf.addEventListener('submit', async (e) => {
    e.preventDefault();
    const row = { client_id: clientId, valid_from: today, formula: sug.formula || null, bmr: sug.bmr || null, tdee: sug.tdee || null,
      kcal: +tf.kcal.value, protein_g: +tf.protein_g.value, carb_g: +tf.carb_g.value, fat_g: +tf.fat_g.value };
    const diff = row.kcal - (row.protein_g * 4 + row.carb_g * 4 + row.fat_g * 9);
    if (Math.abs(diff) > 50 && !confirm(`Kcal (${row.kcal}) lệch ${Math.round(diff)} so với tổng macro. Vẫn duyệt?`)) return;
    await busy(e.submitter, async () => { try { await approveTarget(row); toast('Đã duyệt mục tiêu — khách thấy ngay ở tab Ăn.'); reload(); } catch (err) { toast(viError(err), 'error'); } });
  });
  if (!cur) return;

  // ---------- Thực đơn ----------
  $('#mkSlots')?.addEventListener('click', async (e) => {
    await busy(e.currentTarget, async () => { try { await insertSlots(clientId, defaultSlots()); reload(); } catch (err) { toast(viError(err), 'error'); } });
  });
  $('#dpApply').addEventListener('click', async (e) => {
    const dp = T.days.find((d) => d.id === $('#dpSel').value);
    if (!dp) return toast('Chọn một thực đơn mẫu trước.', 'error');
    if (N.slots.length && !confirm(`Thay toàn bộ ${N.slots.length} bữa hiện tại bằng "${dp.name}" (nhân theo ${cur.kcal} kcal)?`)) return;
    const plan = applyDayPlan(dp, new Map(T.meals.map((m) => [m.id, m])), cur.kcal);
    await busy(e.currentTarget, async () => { try { await replacePlan(clientId, N.slots, plan, foodById); toast(`Đã áp "${dp.name}" × ${(cur.kcal / dp.kcal).toFixed(2).replace('.', ',')}.`); reload(); } catch (err) { toast(viError(err), 'error'); } });
  });

  const slotOf = (el) => { const id = el.closest('[data-slot]')?.dataset.slot; const i = N.slots.findIndex((s) => s.id === id); return { slot: N.slots[i], t: st[i] }; };
  $('#nv').addEventListener('change', async (e) => {
    const { slot } = slotOf(e.target); if (!slot) return;
    if (e.target.matches('[data-pct]')) { try { await updateSlot(slot.id, { kcal_pct: Number(e.target.value) }); toast('Đã lưu % kcal.'); reload(); } catch (err) { toast(viError(err), 'error'); } }
    if (e.target.matches('[data-mt]') && e.target.value) {
      const m = T.meals.find((x) => x.id === e.target.value), { t } = slotOf(e.target);
      try { await insertOption(clientId, slot.id, { label: m.name, items: scaleItems(m.items, t.kcal / Number(m.kcal)) }, foodById); toast(`Đã thêm "${m.name}" (nhân theo ${t.kcal} kcal).`); reload(); } catch (err) { toast(viError(err), 'error'); }
    }
  });
  $('#nv').addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const { slot, t } = slotOf(b);
    if (b.dataset.delopt) { if (!confirm('Xóa phương án này?')) return; try { await deleteOption(b.dataset.delopt); reload(); } catch (err) { toast(viError(err), 'error'); } }
    else if (b.hasAttribute('data-delslot')) { if (!confirm(`Xóa bữa "${slot.name}" và ${slot.options.length} phương án?`)) return; try { await deleteSlot(slot.id); reload(); } catch (err) { toast(viError(err), 'error'); } }
    else if (b.hasAttribute('data-suggest')) {
      const box = b.closest('[data-slot]').querySelector('[data-sug]'), g = suggestOptions(N.foods, t);
      box.innerHTML = g.length ? `<ul class="list" style="margin-top:6px">${g.map((x, i) => `<li><div style="flex:1"><strong>${esc(x.label)}</strong><div class="small">${itemsText(x.items)}</div><div class="small muted">${totText(x.tot)}</div></div>
        <button class="btn small" data-pick="${i}">Chọn</button></li>`).join('')}</ul>` : '<p class="small muted">Kho món chưa đủ món đạm / tinh bột để gợi ý vừa khung này.</p>';
      box._sug = g;
    } else if (b.dataset.pick != null) {
      const x = b.closest('[data-sug]')._sug[+b.dataset.pick];
      await busy(b, async () => { try { await insertOption(clientId, slot.id, { label: x.label, items: x.items }, foodById); toast('Đã thêm phương án.'); reload(); } catch (err) { toast(viError(err), 'error'); } });
    } else if (b.hasAttribute('data-build')) openBuilder(slot, t);
  });

  // ---------- Hộp soạn phương án ----------
  const dob = $('#dob'), fob = $('#fob');
  dob.querySelector('[data-close]').onclick = () => dob.close();
  let rows = [], bSlot = null, bT = null;
  const drawRows = () => {
    $('#obRows').innerHTML = rows.map((r, i) => `<div class="row" style="gap:6px"><span style="flex:1">${esc(foodById.get(r.food_id)?.name_vi)} <span class="small muted">(${esc(foodById.get(r.food_id)?.serving || '')})</span></span>
      <input class="input" type="number" min="0.5" step="0.5" value="${r.qty}" data-q="${i}" style="width:80px;padding:4px"> <button type="button" class="btn btn--ghost small" data-rm="${i}">✕</button></div>`).join('') || '<p class="small muted">Tìm và bấm vào món để thêm.</p>';
    const tot = totalsOf(rows, foodById);
    $('#obTot').innerHTML = `Tổng: <strong>${totText(tot)}</strong> · khung ${bT.kcal} kcal ±10%, đạm ≥ ${Math.round(bT.proteinG * 0.8)} g → ${fits(tot, bT) ? '<strong style="color:#2e7d32">✓ vừa</strong>' : `<strong style="color:#c62828">✗ ${esc(fitReason(tot, bT) || 'lệch')}</strong>`}`;
  };
  const drawRes = () => {
    const q = norm($('#obQ').value);
    const list = N.foods.filter((f) => !q || norm(f.name_vi).includes(q)).slice(0, 30);
    $('#obRes').innerHTML = list.map((f) => `<li><button type="button" class="btn btn--ghost small" data-add="${f.id}" style="width:100%;justify-content:flex-start;text-align:left">${esc(f.name_vi)} <span class="small muted">· ${esc(f.serving)} · ${Math.round(f.kcal)} kcal · P ${f.protein_g ?? 0}${f.food_group ? ' · ' + esc(GROUP_VI[f.food_group] || f.food_group) : ''}</span></button></li>`).join('');
  };
  function openBuilder(slot, t) { bSlot = slot; bT = t; rows = []; fob.reset(); $('#obSlot').textContent = `${slot.name} (${t.kcal} kcal)`; drawRes(); drawRows(); dob.showModal(); $('#obQ').focus(); }
  $('#obQ').oninput = drawRes;
  $('#obRes').onclick = (e) => { const b = e.target.closest('[data-add]'); if (!b) return; const ex = rows.find((r) => r.food_id === b.dataset.add); if (ex) ex.qty += 1; else rows.push({ food_id: b.dataset.add, qty: 1 }); drawRows(); };
  $('#obRows').onchange = (e) => { if (e.target.dataset.q != null) { rows[+e.target.dataset.q].qty = Number(e.target.value) || 0.5; drawRows(); } };
  $('#obRows').onclick = (e) => { const b = e.target.closest('[data-rm]'); if (b) { rows.splice(+b.dataset.rm, 1); drawRows(); } };
  fob.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!rows.length) return toast('Thêm ít nhất 1 món.', 'error');
    await busy(e.submitter, async () => { try { await insertOption(clientId, bSlot.id, { label: fob.label.value.trim() || rows.map((r) => foodById.get(r.food_id)?.name_vi).slice(0, 2).join(' + '), items: rows }, foodById); dob.close(); toast('Đã lưu phương án.'); reload(); } catch (err) { toast(viError(err), 'error'); } });
  });
}
