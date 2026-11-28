// DINO-011 — Tab "Ăn" (Khách): mục tiêu ngày, chọn phương án mỗi bữa, check Đúng / Gần đúng / Lệch + ảnh + ghi chú
import { render, $, esc, toast } from '../../ui.js';
import { viError } from '../../supabaseClient.js';
import { clientTabs } from './home.js';
import { addDays, todayISO, DAY_VI } from '../../lib/plan.js';
import { LEVEL_VI, slotTargets, totalsOf, adherenceRange } from '../../lib/nutrition.js';
import { loadNutrition, listChecks, saveCheck } from '../../lib/nutritionStore.js';
import { uploadClientImage, signedUrls } from '../../lib/files.js';

const LEVEL_ICON = { on: '✓', near: '≈', off: '✕' };
const fmtQty = (q) => String(q).replace('.', ',');
const dowVi = (iso) => { const d = new Date(iso + 'T00:00:00Z').getUTCDay(); return DAY_VI[(d + 6) % 7]; };

export async function clientEatView({ profile }) {
  clientTabs();
  const today = todayISO();
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  const day = qs.get('d') && qs.get('d') <= today ? qs.get('d') : today;
  const [N, checks7] = await Promise.all([loadNutrition(profile.id, { approvedOnly: true }), listChecks(profile.id, addDays(today, -6), today)]);
  if (!N.target || !N.slots.length) {
    render(`<h1>Ăn</h1><div class="card"><p><strong>Chưa có thực đơn.</strong></p><p class="small muted">Coach đang tính mục tiêu và lên thực đơn cho bạn. Khi xong, mục tiêu ngày và các phương án cho từng bữa sẽ hiện ở đây.</p></div>`);
    return;
  }
  const foodById = new Map(N.foods.map((f) => [f.id, f]));
  const st = slotTargets(N.target, N.slots);
  const checks = checks7.filter((c) => c.check_date === day);
  const urls = await signedUrls(checks.map((c) => c.photo_path)).catch(() => ({}));
  const adh = adherenceRange(checks7, N.slots.length, 7);
  const t = N.target;

  render(`<div id="ev">
    <h1>Ăn</h1>
    <div class="row row--between" style="margin-bottom:8px">
      <a class="btn btn--ghost small" href="#/client/eat?d=${addDays(day, -1)}">← Hôm trước</a>
      <strong>${day === today ? 'Hôm nay' : dowVi(day)} ${day.slice(8, 10)}/${day.slice(5, 7)}</strong>
      ${day < today ? `<a class="btn btn--ghost small" href="#/client/eat?d=${addDays(day, 1)}">Hôm sau →</a>` : '<span style="width:90px"></span>'}
    </div>
    <div class="card"><div class="row" style="gap:16px;flex-wrap:wrap;justify-content:space-between">
      <div><div class="small muted">Mục tiêu ngày</div><strong style="font-size:22px">${t.kcal} kcal</strong></div>
      <div class="small">Đạm <strong>${t.protein_g} g</strong> · Tinh bột <strong>${t.carb_g} g</strong> · Béo <strong>${t.fat_g} g</strong></div></div>
      ${adh != null ? `<div style="margin-top:10px"><div class="small row row--between"><span>Tuân thủ 7 ngày</span><strong>${adh}%</strong></div>
        <div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden"><div style="height:100%;width:${Math.min(adh, 100)}%;background:var(--grad);box-shadow:0 0 12px var(--glow)"></div></div></div>` : ''}
    </div>
    <p class="small muted">Mỗi bữa: chọn phương án bạn ăn, rồi bấm <strong>Đúng</strong> / <strong>Gần đúng</strong> / <strong>Lệch</strong>. Ảnh và ghi chú không bắt buộc.</p>
    ${N.slots.map((s, i) => { const c = checks.find((x) => x.slot_id === s.id), chosen = c?.option_id || s.options[0]?.id; return `<div class="card" data-slot="${s.id}">
      <div class="row row--between"><strong>${esc(s.name)}</strong><span class="small muted">~${st[i].kcal} kcal · đạm ${st[i].proteinG} g</span></div>
      <div class="stack" style="margin-top:6px">${s.options.map((o) => { const tot = totalsOf(o.items, foodById); return `<label class="row" style="gap:8px;align-items:flex-start;padding:6px;border-radius:8px;${o.id === chosen ? 'background:var(--bg)' : ''}">
        <input type="radio" name="opt-${s.id}" value="${o.id}"${o.id === chosen ? ' checked' : ''} style="margin-top:4px">
        <span><strong>${esc(o.label || 'Phương án')}</strong><div class="small">${o.items.map((it) => `${esc(foodById.get(it.food_id)?.name_vi || '')} ×${fmtQty(it.qty)}${foodById.get(it.food_id)?.serving ? ` <span class="muted">(${esc(foodById.get(it.food_id).serving)})</span>` : ''}`).join(' · ')}</div>
          <div class="small muted">${tot.kcal} kcal · P ${tot.proteinG} · C ${tot.carbG} · F ${tot.fatG}</div></span></label>`; }).join('') || '<p class="small muted">Coach chưa thêm phương án cho bữa này.</p>'}</div>
      <div class="row" style="gap:6px;margin-top:8px">${['on', 'near', 'off'].map((l) => `<button class="btn small${c?.level === l ? ' lvl--' + l : ''}" data-level="${l}" aria-pressed="${c?.level === l}" style="flex:1">${LEVEL_ICON[l]} ${LEVEL_VI[l]}</button>`).join('')}</div>
      <div class="row" style="gap:6px;margin-top:6px;align-items:center">
        <label class="btn btn--ghost small" style="cursor:pointer">📷 Ảnh<input type="file" accept="image/*" capture="environment" data-photo hidden></label>
        ${c?.photo_path && urls[c.photo_path] ? `<img src="${urls[c.photo_path]}" alt="Ảnh bữa ${esc(s.name)}" style="width:48px;height:48px;object-fit:cover;border-radius:6px">` : ''}
        <input class="input" data-note placeholder="Ghi chú (ăn thêm gì, đổi món…)" value="${esc(c?.note || '')}" style="flex:1">
      </div>
    </div>`; }).join('')}</div>`);

  const ctx = (el) => { const card = el.closest('[data-slot]'); const s = N.slots.find((x) => x.id === card.dataset.slot);
    return { card, s, c: checks.find((x) => x.slot_id === s.id), opt: card.querySelector('input[type=radio]:checked')?.value || null }; };
  async function save(el, patch, msg) {
    const { s, c, opt } = ctx(el);
    const row = { client_id: profile.id, check_date: day, slot_id: s.id, option_id: opt, level: c?.level, photo_path: c?.photo_path ?? null, note: c?.note ?? null, ...patch };
    if (!row.level) { toast('Bấm Đúng / Gần đúng / Lệch trước nhé.', 'error'); return false; }
    const saved = await saveCheck(row);
    const i = checks.findIndex((x) => x.slot_id === s.id); if (i >= 0) checks[i] = saved; else checks.push(saved);
    if (msg) toast(msg);
    return true;
  }
  $('#ev').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-level]'); if (!b) return;
    const l = b.dataset.level;
    b.parentElement.querySelectorAll('[data-level]').forEach((x) => { const on = x === b; x.classList.remove('lvl--on', 'lvl--near', 'lvl--off'); if (on) x.classList.add('lvl--' + l); x.setAttribute('aria-pressed', String(on)); });
    try { await save(b, { level: l }); } catch (err) { toast(viError(err), 'error'); }
  });
  $('#ev').addEventListener('change', async (e) => {
    const el = e.target;
    try {
      if (el.type === 'radio') { const { c } = ctx(el); if (c) await save(el, { option_id: el.value }); }
      else if (el.matches('[data-note]')) await save(el, { note: el.value.trim() || null }, 'Đã lưu ghi chú.');
      else if (el.matches('[data-photo]') && el.files[0]) {
        if (!ctx(el).c) { toast('Bấm Đúng / Gần đúng / Lệch trước, rồi thêm ảnh.', 'error'); el.value = ''; return; }
        toast('Đang tải ảnh…');
        const { path } = await uploadClientImage(profile.id, el.files[0], { subdir: 'meals', prefix: day });
        await save(el, { photo_path: path }, 'Đã lưu ảnh bữa ăn.');
        clientEatView({ profile });
      }
    } catch (err) { toast(viError(err), 'error'); }
  });
}
