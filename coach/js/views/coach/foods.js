// DINO-011 — Kho món (Coach): tìm, thêm/sửa/xóa, dán CSV có xem trước
import { render, $, esc, toast, busy } from '../../ui.js';
import { viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { norm } from '../../lib/exercises.js';
import { GROUP_VI, parseFoodCsv } from '../../lib/nutrition.js';
import { listFoods, saveFood, deleteFood, upsertFoods } from '../../lib/nutritionStore.js';

export async function coachFoodsView() {
  coachTabs();
  let foods = await listFoods();
  render(`<div id="fv">
    <p class="small"><a href="#/coach/library">← Thư viện bài tập</a></p>
    <div class="row row--between"><h1 style="margin:0">Kho món ăn</h1><span class="small muted" id="fc"></span></div>
    <div class="row" style="gap:6px;margin:8px 0;flex-wrap:wrap">
      <input class="input" id="fq" placeholder="Tìm món (không cần dấu)…" style="flex:1;min-width:200px">
      <select id="fg"><option value="">Mọi nhóm</option>${Object.entries(GROUP_VI).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      <button class="btn" id="fadd">+ Món</button><button class="btn btn--ghost" id="fcsv">Dán CSV</button>
    </div>
    <div class="card"><ul class="list" id="fl"></ul></div>
    <p class="small muted">Giá trị dinh dưỡng là tham khảo (Bảng thành phần thực phẩm Việt Nam – Viện Dinh dưỡng, USDA FoodData Central). Món nấu sẵn sai số ±20%.</p>

    <dialog id="dfo"><form method="dialog" id="ffo" class="stack" style="min-width:min(92vw,460px)">
      <h2 style="margin:0" id="fot">Món mới</h2>
      <label class="field"><span>Tên món</span><input class="input" name="name_vi" required></label>
      <div class="row" style="gap:6px"><label class="field" style="flex:2"><span>Khẩu phần</span><input class="input" name="serving" placeholder="100 g chín / 1 chén / 1 tô" required></label>
        <label class="field" style="flex:1"><span>Gram</span><input class="input" type="number" step="any" min="0" name="grams"></label></div>
      <label class="field"><span>Nhóm</span><select name="food_group"><option value="">—</option>${Object.entries(GROUP_VI).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
      <div class="row" style="gap:6px">${[['kcal', 'Kcal'], ['protein_g', 'Đạm'], ['carb_g', 'Tinh bột'], ['fat_g', 'Béo']].map(([k, l]) => `<label class="field" style="flex:1"><span>${l}</span><input class="input" type="number" step="any" min="0" name="${k}" ${k === 'kcal' ? 'required' : ''}></label>`).join('')}</div>
      <label class="field"><span>Nguồn</span><input class="input" name="source" placeholder="TPTP VN / USDA / nhãn sản phẩm"></label>
      <div class="row"><button type="button" class="btn btn--ghost" id="fdel" hidden>Xóa món</button><span style="flex:1"></span><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary">Lưu</button></div>
    </form></dialog>

    <dialog id="dcsv"><div class="stack" style="min-width:min(92vw,640px)">
      <h2 style="margin:0">Dán danh sách món</h2>
      <p class="small muted" style="margin:0">Mỗi dòng 1 món, cách nhau bằng dấu chấm phẩy (hoặc copy thẳng từ Excel/Google Sheets):<br><code>tên;khẩu phần;kcal;đạm;tinh bột;béo;nguồn</code> — ví dụ <code>Bún bò Huế;1 tô;480;25;60;14;quán TP.HCM</code>. Trùng tên sẽ cập nhật món cũ.</p>
      <textarea id="csvIn" rows="7" placeholder="Dán vào đây…"></textarea>
      <div id="csvPrev"></div>
      <div class="row"><button class="btn btn--ghost" data-close>Đóng</button><span style="flex:1"></span><button class="btn" id="csvChk">Xem trước</button><button class="btn btn--primary" id="csvSave" disabled>Lưu</button></div>
    </div></dialog></div>`);

  const draw = () => {
    const q = norm($('#fq').value), g = $('#fg').value;
    const list = foods.filter((f) => (!q || norm(f.name_vi).includes(q)) && (!g || f.food_group === g));
    $('#fc').textContent = `${list.length}/${foods.length} món`;
    $('#fl').innerHTML = list.slice(0, 200).map((f) => `<li><button class="btn btn--ghost" data-edit="${f.id}" style="flex:1;justify-content:flex-start;text-align:left">
      <span><strong>${esc(f.name_vi)}</strong> <span class="small muted">· ${esc(f.serving)}${f.food_group ? ' · ' + esc(GROUP_VI[f.food_group] || f.food_group) : ''}</span>
      <div class="small">${Math.round(f.kcal)} kcal · P ${f.protein_g ?? '–'} · C ${f.carb_g ?? '–'} · F ${f.fat_g ?? '–'}</div></span></button></li>`).join('') || '<li class="small muted">Không có món phù hợp.</li>';
  };
  $('#fq').oninput = draw; $('#fg').onchange = draw; draw();
  document.querySelectorAll('dialog [data-close]').forEach((b) => (b.onclick = () => b.closest('dialog').close()));

  // ---------- Thêm / sửa ----------
  const dfo = $('#dfo'), ffo = $('#ffo');
  let editing = null;
  const open = (f) => {
    editing = f; ffo.reset(); $('#fot').textContent = f ? 'Sửa món' : 'Món mới'; $('#fdel').hidden = !f;
    if (f) for (const k of ['name_vi', 'serving', 'grams', 'food_group', 'kcal', 'protein_g', 'carb_g', 'fat_g', 'source']) ffo[k].value = f[k] ?? '';
    dfo.showModal();
  };
  $('#fadd').onclick = () => open(null);
  $('#fl').onclick = (e) => { const b = e.target.closest('[data-edit]'); if (b) open(foods.find((f) => f.id === b.dataset.edit)); };
  ffo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const n = (k) => (ffo[k].value === '' ? null : Number(ffo[k].value));
    const row = { ...(editing ? { id: editing.id } : {}), name_vi: ffo.name_vi.value.trim(), serving: ffo.serving.value.trim(), grams: n('grams'), food_group: ffo.food_group.value || null,
      kcal: n('kcal'), protein_g: n('protein_g'), carb_g: n('carb_g'), fat_g: n('fat_g'), source: ffo.source.value.trim() || null };
    await busy(e.submitter, async () => { try { await saveFood(row); foods = await listFoods(); dfo.close(); draw(); toast('Đã lưu món.'); } catch (err) { toast(/duplicate|unique/i.test(err.message) ? 'Đã có món trùng tên.' : viError(err), 'error'); } });
  });
  $('#fdel').onclick = async (e) => {
    if (!confirm(`Xóa "${editing.name_vi}"? Phương án ăn đang dùng món này sẽ hiện "(món đã xóa)".`)) return;
    await busy(e.currentTarget, async () => { try { await deleteFood(editing.id); foods = await listFoods(); dfo.close(); draw(); toast('Đã xóa món.'); } catch (err) { toast(viError(err), 'error'); } });
  };

  // ---------- Dán CSV ----------
  let parsed = null;
  $('#fcsv').onclick = () => { $('#csvIn').value = ''; $('#csvPrev').innerHTML = ''; $('#csvSave').disabled = true; $('#dcsv').showModal(); };
  $('#csvChk').onclick = () => {
    parsed = parseFoodCsv($('#csvIn').value);
    const names = new Set(foods.map((f) => f.name_vi));
    $('#csvPrev').innerHTML = `<p class="small"><strong>${parsed.rows.length}</strong> món hợp lệ (${parsed.rows.filter((r) => names.has(r.name_vi)).length} trùng tên → cập nhật)${parsed.errors.length ? ` · <span style="color:var(--danger)">${parsed.errors.length} dòng lỗi</span>` : ''}</p>
      ${parsed.errors.length ? `<ul class="small" style="color:var(--danger)">${parsed.errors.map((er) => `<li>Dòng ${er.line}: ${esc(er.reason)} — <code>${esc(er.text.slice(0, 60))}</code></li>`).join('')}</ul>` : ''}
      <div style="max-height:220px;overflow:auto"><table class="small" style="width:100%"><tr class="muted"><th style="text-align:left">Tên</th><th>Khẩu phần</th><th>Kcal</th><th>P</th><th>C</th><th>F</th></tr>
      ${parsed.rows.map((r) => `<tr><td>${esc(r.name_vi)}${names.has(r.name_vi) ? ' <span class="badge">cập nhật</span>' : ''}</td><td>${esc(r.serving)}</td><td>${r.kcal}</td><td>${r.protein_g ?? ''}</td><td>${r.carb_g ?? ''}</td><td>${r.fat_g ?? ''}</td></tr>`).join('')}</table></div>`;
    $('#csvSave').disabled = !parsed.rows.length;
  };
  $('#csvSave').onclick = async (e) => {
    await busy(e.currentTarget, async () => {
      try { const saved = await upsertFoods(parsed.rows); foods = await listFoods(); $('#dcsv').close(); draw(); toast(`Đã lưu ${saved.length} món.`); }
      catch (err) { toast(viError(err), 'error'); }
    });
  };
}
