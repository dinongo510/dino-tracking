// DINO-008 — Thư viện bài tập (Coach): tìm, lọc, sửa, thêm, dán danh sách hàng loạt
import { render, $, esc, toast, busy } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { loadExercises, clearExerciseCache, filterExercises, parseImport, CATEGORY_VI, MUSCLE_VI, EQUIP_VI, STEP_VI, vi } from '../../lib/exercises.js';

const PAGE = 40;
const csv = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const opts = (map, cur) => Object.entries(map).map(([k, l]) => `<option value="${esc(k)}"${k === cur ? ' selected' : ''}>${esc(l)}</option>`).join('');

export async function coachLibraryView() {
  coachTabs();
  let list = await loadExercises();
  const st = { q: '', category: '', muscle: '', equipment: '', tag: '', featuredOnly: false, shown: PAGE };
  const editId = new URLSearchParams(location.hash.split('?')[1] || '').get('edit');

  render(`
    <p class="small" style="margin:0"><a href="#/coach/foods">Kho món ăn →</a> · <a href="#/tools">Công cụ hỗ trợ →</a></p>
    <div class="row row--between"><h1>Thư viện bài tập</h1>
      <div class="row"><button class="btn small" id="imp">Dán danh sách</button><button class="btn btn--primary small" id="add">+ Bài mới</button></div></div>
    <input class="input" id="q" type="search" placeholder="Tìm bài (gõ không dấu cũng được): squat, day nguc, xo…" autocomplete="off" style="margin:8px 0">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">
      <select id="fc"><option value="">Mọi nhóm</option>${opts(CATEGORY_VI)}</select>
      <select id="fm"><option value="">Mọi nhóm cơ</option>${opts(MUSCLE_VI)}</select>
      <select id="fe"><option value="">Mọi dụng cụ</option>${opts(Object.fromEntries(Object.entries(EQUIP_VI).filter(([k]) => k !== 'medicine_ball')))}</select>
      <select id="ft"><option value="">Mọi nhãn</option><option value="ohsa:">Corrective theo OHSA</option><option value="hyrox">HYROX</option><option value="run">Chạy</option><option value="dino_core">Bài cốt lõi của Dino</option></select>
    </div>
    <label class="row small" style="margin:8px 0"><input type="checkbox" id="ff"> Chỉ bài hay dùng ★</label>
    <p class="small muted" id="cnt"></p>
    <div class="card" style="padding:4px 12px"><ul class="list" id="ls"></ul></div>
    <p class="center" style="padding:12px 0"><button class="btn" id="more" hidden>Xem thêm</button></p>

    <dialog id="de"><form method="dialog" id="ef">
      <h2 id="et">Sửa bài</h2>
      <label class="field"><span>Tên tiếng Việt *</span><input class="input" name="name_vi" required></label>
      <label class="field"><span>Tên tiếng Anh</span><input class="input" name="name_en"></label>
      <div class="row"><label class="field" style="flex:1"><span>Nhóm</span><select name="category"><option value="">—</option>${opts(CATEGORY_VI)}</select></label>
        <label class="field" style="flex:1"><span>Bước corrective</span><select name="corrective_step"><option value="">—</option>${opts(STEP_VI)}</select></label></div>
      <label class="field"><span>Cơ chính (cách nhau dấu phẩy: ${esc(Object.keys(MUSCLE_VI).slice(0, 5).join(', '))}…)</span><input class="input" name="primary_muscles"></label>
      <label class="field"><span>Dụng cụ (dấu phẩy: barbell, dumbbell, cable, machine, kettlebell, body only…)</span><input class="input" name="equipment"></label>
      <label class="field"><span>Lưu ý kỹ thuật (cue)</span><textarea name="cues" rows="3"></textarea></label>
      <label class="field"><span>Link video YouTube</span><input class="input" name="video_url" type="url" placeholder="https://youtu.be/…"></label>
      <label class="field"><span>Nhãn (dấu phẩy)</span><input class="input" name="tags"></label>
      <label class="row" style="margin-bottom:12px"><input type="checkbox" name="featured"> Bài hay dùng ★ (hiện đầu danh sách)</label>
      <div class="row"><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary" style="flex:1">Lưu</button></div>
    </form></dialog>

    <dialog id="di"><form method="dialog" id="if">
      <h2>Dán danh sách bài</h2>
      <p class="small muted">Mỗi dòng: <code>tên tiếng Anh;tên tiếng Việt;link video;cue</code> (cue không bắt buộc). Có thể dán thẳng từ Google Sheets (cột cách nhau bằng tab).
        Bài khớp tên sẽ được cập nhật và đánh dấu ★; bài chưa có sẽ được tạo mới.</p>
      <textarea id="it" rows="8" placeholder="Barbell Full Squat;Squat tạ đòn;https://youtu.be/xxxx;Siết core, gối theo mũi chân"></textarea>
      <div class="row" style="margin:8px 0"><button type="button" class="btn" id="ip">Xem trước</button></div>
      <div id="ipv" class="small"></div>
      <div class="row" style="margin-top:8px"><button type="button" class="btn btn--ghost" data-close>Đóng</button><button class="btn btn--primary" id="isave" style="flex:1" disabled>Lưu</button></div>
    </form></dialog>`);

  const draw = () => {
    const rows = filterExercises(list, st);
    $('#cnt').textContent = `${rows.length} bài${rows.length !== list.length ? ` / ${list.length}` : ''}`;
    $('#ls').innerHTML = rows.slice(0, st.shown).map((e) => `
      <li style="justify-content:flex-start">
        ${e.image_urls?.[0] ? `<img src="${esc(e.image_urls[0])}" alt="" loading="lazy" style="width:56px;height:56px;object-fit:cover;border-radius:8px;background:#fff;flex:none">`
          : `<div style="width:56px;height:56px;border-radius:8px;background:var(--surface-2);flex:none;display:flex;align-items:center;justify-content:center" class="small muted">${esc((vi(CATEGORY_VI, e.category) || '').slice(0, 6))}</div>`}
        <a href="#/exercise/${esc(e.id)}" style="flex:1;color:var(--text);text-decoration:none;min-width:0">
          <strong>${e.featured ? '★ ' : ''}${esc(e.name_vi)}</strong>
          <div class="small muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.name_en || '')}${(e.primary_muscles || []).length ? ' · ' + esc(e.primary_muscles.map((m) => vi(MUSCLE_VI, m)).join(', ')) : ''}</div></a>
        <button class="btn btn--ghost small" data-edit="${esc(e.id)}">Sửa</button></li>`).join('') || '<li class="muted">Không có bài nào khớp.</li>';
    $('#more').hidden = rows.length <= st.shown;
    document.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => openEdit(list.find((x) => x.id === b.dataset.edit))));
  };
  const reload = async () => { clearExerciseCache(); list = await loadExercises(true); draw(); };

  $('#q').addEventListener('input', (e) => { st.q = e.target.value; st.shown = PAGE; draw(); });
  [['#fc', 'category'], ['#fm', 'muscle'], ['#fe', 'equipment'], ['#ft', 'tag']].forEach(([s, k]) => $(s).addEventListener('change', (e) => { st[k] = e.target.value; st.shown = PAGE; draw(); }));
  $('#ff').addEventListener('change', (e) => { st.featuredOnly = e.target.checked; draw(); });
  $('#more').onclick = () => { st.shown += PAGE; draw(); };

  // ---- Sửa / thêm bài ----
  const de = $('#de'), ef = $('#ef');
  let editing = null;
  const openEdit = (e) => {
    editing = e || null;
    $('#et').textContent = e ? 'Sửa bài' : 'Bài mới';
    ef.reset();
    ef.name_vi.value = e?.name_vi || ''; ef.name_en.value = e?.name_en || '';
    ef.category.value = e?.category || ''; ef.corrective_step.value = e?.corrective_step || '';
    ef.primary_muscles.value = (e?.primary_muscles || []).join(', '); ef.equipment.value = (e?.equipment || []).join(', ');
    ef.cues.value = e?.cues || ''; ef.video_url.value = e?.video_url || ''; ef.tags.value = (e?.tags || []).join(', ');
    ef.featured.checked = !!e?.featured;
    de.showModal();
  };
  de.querySelector('[data-close]').onclick = () => de.close();
  $('#add').onclick = () => openEdit(null);
  ef.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const row = {
      name_vi: ef.name_vi.value.trim(), name_en: ef.name_en.value.trim() || null,
      category: ef.category.value || null, corrective_step: ef.corrective_step.value || null,
      primary_muscles: csv(ef.primary_muscles.value), equipment: csv(ef.equipment.value),
      cues: ef.cues.value.trim() || null, video_url: ef.video_url.value.trim() || null,
      tags: csv(ef.tags.value), featured: ef.featured.checked,
    };
    if (!row.name_vi) return toast('Cần tên tiếng Việt.', 'error');
    if (row.video_url && !/^https?:\/\//i.test(row.video_url)) return toast('Link video phải bắt đầu bằng http.', 'error');
    await busy(ev.submitter, async () => {
      const db = await sb();
      const { error } = editing ? await db.from('exercises').update(row).eq('id', editing.id)
        : await db.from('exercises').insert({ ...row, is_custom: true, source: 'dino' });
      if (error) return toast(viError(error), 'error');
      de.close(); toast(editing ? 'Đã lưu bài.' : 'Đã thêm bài.'); await reload();
    });
  });

  // ---- Dán danh sách ----
  const di = $('#di');
  let parsed = [];
  di.querySelector('[data-close]').onclick = () => di.close();
  $('#imp').onclick = () => { $('#it').value = ''; $('#ipv').innerHTML = ''; $('#isave').disabled = true; di.showModal(); };
  $('#ip').onclick = () => {
    parsed = parseImport($('#it').value, list);
    const upd = parsed.filter((r) => r.match && !r.error).length, add = parsed.filter((r) => !r.match && !r.error).length, bad = parsed.filter((r) => r.error).length;
    $('#ipv').innerHTML = parsed.length ? `<p><strong>${upd}</strong> bài cập nhật · <strong>${add}</strong> bài mới${bad ? ` · <span style="color:var(--danger)">${bad} dòng lỗi (bỏ qua)</span>` : ''}</p>
      <ul class="list" style="max-height:220px;overflow:auto">${parsed.map((r) => `<li style="display:block;min-height:0;padding:6px 0">
        <span class="badge ${r.error ? 'badge--danger' : r.match ? 'badge--ok' : 'badge--warn'}">${r.error ? 'Lỗi' : r.match ? 'Cập nhật' : 'Mới'}</span>
        ${esc(r.vi || r.match?.name_vi || '')} <span class="muted">${esc(r.en)}</span>${r.error ? ` — ${esc(r.error)}` : ''}</li>`).join('')}</ul>` : '<p class="muted">Chưa có dòng nào.</p>';
    $('#isave').disabled = !(upd + add);
  };
  $('#if').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const ok = parsed.filter((r) => !r.error);
    await busy($('#isave'), async () => {
      const db = await sb();
      let done = 0;
      for (const r of ok) {
        const patch = { featured: true };
        if (r.vi) patch.name_vi = r.vi;
        if (r.video) patch.video_url = r.video;
        if (r.cues) patch.cues = r.cues;
        const { error } = r.match ? await db.from('exercises').update(patch).eq('id', r.match.id)
          : await db.from('exercises').insert({ ...patch, name_en: r.en || null, name_vi: r.vi, category: 'strength', is_custom: true, source: 'dino' });
        if (error) { toast(`Lỗi ở "${r.vi || r.en}": ${viError(error)} — đã lưu ${done} bài.`, 'error'); await reload(); return; }
        done++;
      }
      di.close(); toast(`Đã lưu ${done} bài.`); await reload();
    });
  });

  draw();
  if (editId) { const e = list.find((x) => x.id === editId); if (e) openEdit(e); }
}
