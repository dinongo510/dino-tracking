// DINO-007 mục 2.4 — Ảnh tiến trình 3 góc + so sánh 2 mốc (khách và coach cùng dùng)
import { $, esc, toast, busy, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { uploadClientImage, signedUrls, removeImages } from '../../lib/files.js';

const ANGLES = [['front', 'Trước'], ['side', 'Nghiêng'], ['back', 'Sau']];
const today = () => new Date().toISOString().slice(0, 10);

function groupByDate(rows) {
  const g = {};
  for (const r of rows) { const d = (g[r.taken_on] ||= {}); if (!d[r.angle]) d[r.angle] = r; } // giữ ảnh mới nhất mỗi góc
  return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1)); // mới nhất trước
}

const img = (url, alt) => url
  ? `<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:10px;background:var(--surface-2)">`
  : `<div class="small muted" style="aspect-ratio:3/4;display:flex;align-items:center;justify-content:center;border:1px dashed var(--line);border-radius:10px">Chưa có</div>`;

/** Vẽ phần ảnh tiến trình vào `el`. myId: người đang xem (để biết ai được xóa). */
export async function renderPhotos(el, clientId, myId) {
  const db = await sb();
  const { data: rows, error } = await db.from('progress_photos').select('*').eq('client_id', clientId)
    .order('taken_on', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  const groups = groupByDate(rows);
  const urls = await signedUrls(rows.map((r) => r.storage_path)).catch(() => ({}));
  const dates = groups.map(([d]) => d);
  const [d1, d2] = [dates[dates.length - 1], dates[0]]; // mặc định: đầu tiên ↔ mới nhất

  el.innerHTML = `
    <div class="row row--between"><h2>Ảnh tiến trình</h2><button class="btn small" id="addP">+ Chụp / tải ảnh</button></div>
    ${!groups.length ? '<div class="card"><p class="muted small">Chưa có ảnh. Mỗi giai đoạn chụp 3 góc: trước, nghiêng, sau.</p></div>' : `
    ${dates.length >= 2 ? `<div class="card"><strong>So sánh</strong>
      <div class="row" style="margin:8px 0">
        <select id="cmpA" style="flex:1">${dates.map((d) => `<option value="${d}"${d === d1 ? ' selected' : ''}>${fmtDate(d)}</option>`).join('')}</select>
        <span class="muted">↔</span>
        <select id="cmpB" style="flex:1">${dates.map((d) => `<option value="${d}"${d === d2 ? ' selected' : ''}>${fmtDate(d)}</option>`).join('')}</select>
      </div><div id="cmp"></div></div>` : ''}
    ${groups.map(([d, byAngle]) => `<div class="card"><div class="row row--between"><strong>${fmtDate(d)}</strong></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">
      ${ANGLES.map(([k, l]) => { const r = byAngle[k]; return `<div><div class="small muted" style="margin-bottom:4px">${l}</div>${img(r && urls[r.storage_path], l)}
        ${r && r.entered_by === myId ? `<button class="btn btn--ghost small" style="min-height:32px;width:100%;margin-top:4px" data-del="${r.id}">Xóa</button>` : ''}</div>`; }).join('')}
      </div></div>`).join('')}`}

    <dialog id="dp"><form method="dialog">
      <h2>Ảnh tiến trình</h2>
      <p class="small muted">Đứng thẳng, cùng nền, cùng ánh sáng, cùng giờ trong ngày (nên buổi sáng). Mặc đồ bó hoặc đồ tập.</p>
      <label class="field"><span>Ngày chụp</span><input class="input" type="date" name="taken_on" required></label>
      ${ANGLES.map(([k, l]) => `<label class="field"><span>${l}</span><input type="file" accept="image/*" name="${k}" data-angle="${k}" class="input" style="padding:8px"></label><div id="pv_${k}" class="small muted" style="margin:-8px 0 12px"></div>`).join('')}
      <div class="row"><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary" style="flex:1">Tải lên</button></div>
    </form></dialog>`;

  // So sánh 2 mốc
  const drawCmp = () => {
    const a = $('#cmpA', el)?.value, b = $('#cmpB', el)?.value;
    if (!a || !b) return;
    const A = Object.fromEntries(groups)[a] || {}, B = Object.fromEntries(groups)[b] || {};
    $('#cmp', el).innerHTML = ANGLES.map(([k, l]) => `<p class="small muted" style="margin:8px 0 4px">${l}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${img(A[k] && urls[A[k].storage_path], l + ' ' + a)}${img(B[k] && urls[B[k].storage_path], l + ' ' + b)}</div>`).join('');
  };
  $('#cmpA', el)?.addEventListener('change', drawCmp);
  $('#cmpB', el)?.addEventListener('change', drawCmp);
  drawCmp();

  // Xóa ảnh do chính mình tải lên
  el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = async () => {
    const r = rows.find((x) => x.id === b.dataset.del);
    await busy(b, async () => {
      try {
        await removeImages([r.storage_path]);
        const { error: e } = await db.from('progress_photos').delete().eq('id', r.id);
        if (e) throw e;
        toast('Đã xóa ảnh.'); renderPhotos(el, clientId, myId);
      } catch (err) { toast(viError(err), 'error'); }
    });
  }));

  // Tải ảnh
  const dlg = $('#dp', el), f = dlg.querySelector('form');
  $('#addP', el).onclick = () => { f.reset(); f.taken_on.value = today(); ANGLES.forEach(([k]) => ($('#pv_' + k, el).textContent = '')); dlg.showModal(); };
  dlg.querySelector('[data-close]').onclick = () => dlg.close();
  f.querySelectorAll('input[type=file]').forEach((inp) => inp.addEventListener('change', () => {
    const file = inp.files[0];
    $('#pv_' + inp.dataset.angle, el).textContent = file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB → sẽ nén còn khoảng 0,2 MB` : '';
  }));
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const picks = ANGLES.map(([k]) => [k, f[k].files[0]]).filter(([, file]) => file);
    if (!picks.length) return toast('Chọn ít nhất 1 ảnh.', 'error');
    await busy(e.submitter, async () => {
      let done = 0;
      try {
        for (const [angle, file] of picks) {
          const { path } = await uploadClientImage(clientId, file, { prefix: `${f.taken_on.value}_${angle}` });
          const { error: e2 } = await db.from('progress_photos').insert({ client_id: clientId, taken_on: f.taken_on.value, angle, storage_path: path });
          if (e2) { await removeImages([path]).catch(() => {}); throw e2; }
          done++;
        }
        dlg.close(); toast(`Đã tải ${done} ảnh.`); renderPhotos(el, clientId, myId);
      } catch (err) { toast((done ? `Đã tải ${done} ảnh, lỗi ở ảnh tiếp theo: ` : '') + (err.message?.startsWith('Không') ? err.message : viError(err)), 'error'); }
    });
  });
}
