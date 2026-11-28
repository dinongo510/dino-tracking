// DINO-014 — Khối "Gói tập & hình thức" trên trang khách (Coach)
import { $, esc, toast, busy } from '../../ui.js';
import { viError } from '../../supabaseClient.js';
import { todayISO } from '../../lib/plan.js';
import { MODE_VI, pkgStatus, pkgLine, autoName, fmtVnd, parseVnd, endAfterMonths, lockState, currentPackage } from '../../lib/packages.js';
import { loadPackages, savePackage, addUse, deleteUse, setCoachMode } from '../../lib/packageStore.js';

const dm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');
const DUR = [['none', 'Không thời hạn'], ['1', '1 tháng'], ['2', '2 tháng'], ['3', '3 tháng'], ['6', '6 tháng'], ['12', '12 tháng'], ['date', 'Chọn ngày hết hạn']];

export async function renderPackages(el, client) {
  const today = todayISO();
  const { packages, uses, usedById } = await loadPackages(client.id);
  const lk = lockState(packages, today), cur = currentPackage(packages, usedById, today);
  const sorted = [...packages].sort((a, b) => (a.id === cur?.id ? -1 : b.id === cur?.id ? 1 : b.start_date.localeCompare(a.start_date)));

  const card = (p) => {
    const s = pkgStatus(p, usedById[p.id] || 0, today), us = uses.filter((u) => u.package_id === p.id);
    return `<div class="card${p.id === cur?.id && !s.ended ? ' card--hi' : ''}" data-pkg="${p.id}">
      <div class="row row--between"><strong>${esc(p.name || autoName(p))}</strong>
        <span class="badge${s.ended ? '' : s.warn.length ? ' badge--warn' : ' badge--ok'}">${s.ended ? 'Đã kết thúc' : s.notStarted ? 'Chưa bắt đầu' : s.expired ? (s.inGrace ? 'Hết hạn (ân hạn)' : 'Hết hạn') : 'Đang dùng'}</span></div>
      <div class="small muted">Từ ${dm(p.start_date)}${p.end_date ? ` đến ${dm(p.end_date)}` : ' · không thời hạn'}</div>
      <div style="font-size:18px;font-weight:700;margin:6px 0 2px" class="pkg-line">${esc(pkgLine(p, s))}</div>
      <div class="small">${p.price_vnd != null ? `Giá ${fmtVnd(p.price_vnd)} · đã trả ${fmtVnd(p.paid_vnd || 0)}${s.owe ? ` · <strong style="color:var(--warn)">còn nợ ${fmtVnd(s.owe)}</strong>` : ' · <span style="color:var(--tint)">đã trả đủ ✓</span>'}` : '<span class="muted">Chưa nhập giá</span>'}</div>
      ${p.note ? `<div class="small muted">${esc(p.note)}</div>` : ''}
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px">
        ${!s.ended ? `<button class="btn small btn--primary" data-use="${p.id}">− Trừ 1 buổi</button>` : ''}
        <button class="btn small" data-edit="${p.id}">Sửa</button>
        ${!s.ended ? `<button class="btn btn--ghost small" data-end="${p.id}">Kết thúc gói</button>` : `<button class="btn btn--ghost small" data-reopen="${p.id}">Mở lại</button>`}
      </div>
      ${us.length ? `<details style="margin-top:8px"><summary class="small">Đã dùng ${us.length} buổi</summary><ul class="list small">${us.map((u) => `
        <li style="min-height:44px"><span>${dm(u.used_on)}${u.session_id ? ' · buổi PT trong lịch' : ''}${u.note ? ` · ${esc(u.note)}` : ''}</span><button class="btn btn--ghost small" data-unuse="${u.id}" title="Hoàn lại buổi này">↺ Hoàn</button></li>`).join('')}</ul></details>` : ''}
    </div>`;
  };

  el.innerHTML = `
    <div class="card"><label class="field" style="margin:0"><span>Hình thức coaching</span>
      <select id="cmode">${Object.entries(MODE_VI).map(([k, v]) => `<option value="${k}"${(client.coach_mode || 'online') === k ? ' selected' : ''}>${v}</option>`).join('')}</select></label>
      ${lk.locked ? `<p class="small" style="color:var(--danger);margin:10px 0 0">⛔ App của khách đang khóa — gói hết hạn ${dm(lk.lastEnd)} (quá 3 ngày). Thêm gói mới hoặc gia hạn để mở.</p>`
        : lk.graceLeft ? `<p class="small" style="color:var(--warn);margin:10px 0 0">Gói hết hạn ${dm(lk.lastEnd)} — app khách sẽ khóa sau ${lk.graceLeft} ngày.</p>` : ''}
    </div>
    ${sorted.map(card).join('') || '<div class="card"><p class="muted small" style="margin:0">Chưa có gói. Khách không có gói thì app không bị khóa.</p></div>'}
    <button class="btn btn--block" id="newpkg">+ Gói mới</button>
    <dialog id="pdlg"><form id="pf" method="dialog"><h2 id="ptitle">Gói mới</h2>
      <label class="field"><span>Tên gói (để trống = tự đặt)</span><input class="input" name="name" placeholder="VD: 12 buổi PT"></label>
      <div class="row"><label class="field" style="flex:1"><span>Số buổi</span><input class="input" name="total" type="number" min="1" inputmode="numeric" placeholder="Trống = không giới hạn"></label>
        <label class="field" style="flex:1"><span>Bắt đầu</span><input class="input" name="start" type="date" required></label></div>
      <div class="row"><label class="field" style="flex:1"><span>Thời hạn</span><select name="dur">${DUR.map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <label class="field" style="flex:1" id="endwrap" hidden><span>Hết hạn ngày</span><input class="input" name="end" type="date"></label></div>
      <div class="row"><label class="field" style="flex:1"><span>Giá</span><input class="input" name="price" inputmode="decimal" placeholder="VD 3tr, 3.000.000"></label>
        <label class="field" style="flex:1"><span>Đã trả</span><input class="input" name="paid" inputmode="decimal" placeholder="0"></label></div>
      <label class="field"><span>Ghi chú</span><input class="input" name="note"></label>
      <p class="small muted" id="pprev"></p>
      <div class="row"><button type="button" class="btn btn--ghost" id="pcancel">Hủy</button><button class="btn btn--primary" style="flex:1">Lưu gói</button></div>
    </form></dialog>
    <dialog id="udlg"><form id="uf" method="dialog"><h2>Trừ 1 buổi</h2>
      <label class="field"><span>Ngày dạy</span><input class="input" name="day" type="date" required></label>
      <label class="field"><span>Ghi chú (tùy chọn)</span><input class="input" name="note" placeholder="VD: PT ngoài lịch, chân"></label>
      <div class="row"><button type="button" class="btn btn--ghost" id="ucancel">Hủy</button><button class="btn btn--primary" style="flex:1">Trừ buổi</button></div>
    </form></dialog>`;

  const reload = () => renderPackages(el, client);
  $('#cmode', el).onchange = async (e) => {
    try { await setCoachMode(client.id, e.target.value); client.coach_mode = e.target.value; toast(`Đã đổi sang ${MODE_VI[e.target.value]}.`); } catch (err) { toast(viError(err), 'error'); }
  };

  // ---- Gói: thêm / sửa ----
  const dlg = $('#pdlg', el), f = $('#pf', el);
  let editing = null;
  const endFrom = () => {
    const v = f.dur.value; if (v === 'none') return null; if (v === 'date') return f.end.value || null;
    return f.start.value ? endAfterMonths(f.start.value, Number(v)) : null;
  };
  const preview = () => {
    $('#endwrap', el).hidden = f.dur.value !== 'date';
    const p = { total_sessions: Number(f.total.value) || null, start_date: f.start.value || today, end_date: endFrom() };
    $('#pprev', el).textContent = `→ ${f.name.value.trim() || autoName(p)}${p.end_date ? ` · hết hạn ${dm(p.end_date)}` : ''}`;
  };
  f.addEventListener('input', preview); f.dur.onchange = preview;
  const open = (p) => {
    editing = p; f.reset(); $('#ptitle', el).textContent = p ? 'Sửa gói' : 'Gói mới';
    f.name.value = p?.name || ''; f.total.value = p?.total_sessions || ''; f.start.value = p?.start_date || today;
    f.dur.value = p ? (p.end_date ? 'date' : 'none') : 'none'; f.end.value = p?.end_date || '';
    f.price.value = p?.price_vnd ?? ''; f.paid.value = p?.paid_vnd || ''; f.note.value = p?.note || '';
    preview(); dlg.showModal();
  };
  $('#newpkg', el).onclick = () => open(null);
  $('#pcancel', el).onclick = () => dlg.close();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const end = endFrom();
    if (f.dur.value === 'date' && !end) return toast('Chọn ngày hết hạn.', 'error');
    if (end && end < f.start.value) return toast('Ngày hết hạn phải sau ngày bắt đầu.', 'error');
    const price = parseVnd(f.price.value), paid = parseVnd(f.paid.value) || 0;
    if (f.price.value.trim() && price == null) return toast('Giá không đọc được. Gõ kiểu 3000000, 3.000.000 hoặc 3tr.', 'error');
    const row = { client_id: client.id, name: f.name.value.trim() || null, total_sessions: Number(f.total.value) || null, start_date: f.start.value,
      end_date: end, price_vnd: price, paid_vnd: paid, note: f.note.value.trim() || null };
    if (editing) row.id = editing.id;
    await busy(e.submitter, async () => {
      try { await savePackage(row); dlg.close(); toast(editing ? 'Đã sửa gói.' : 'Đã thêm gói.'); reload(); } catch (err) { toast(viError(err), 'error'); }
    });
  });
  el.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => open(packages.find((p) => p.id === b.dataset.edit))));

  // ---- Kết thúc / mở lại ----
  el.querySelectorAll('[data-end],[data-reopen]').forEach((b) => (b.onclick = async () => {
    const p = packages.find((x) => x.id === (b.dataset.end || b.dataset.reopen));
    await busy(b, async () => {
      try { await savePackage({ id: p.id, status: b.dataset.end ? 'ended' : 'active' }); toast(b.dataset.end ? 'Đã kết thúc gói.' : 'Đã mở lại gói.'); reload(); } catch (err) { toast(viError(err), 'error'); }
    });
  }));

  // ---- Trừ buổi tay (PT ngoài lịch) / hoàn buổi ----
  const ud = $('#udlg', el), uf = $('#uf', el);
  let usePkg = null;
  el.querySelectorAll('[data-use]').forEach((b) => (b.onclick = () => {
    usePkg = packages.find((p) => p.id === b.dataset.use);
    const s = pkgStatus(usePkg, usedById[usePkg.id] || 0, today);
    if (s.left === 0) toast('Gói đã hết buổi — vẫn trừ được nếu bạn muốn ghi nhận buổi dạy thêm.', 'error');
    uf.reset(); uf.day.value = today; ud.showModal();
  }));
  $('#ucancel', el).onclick = () => ud.close();
  uf.addEventListener('submit', async (e) => {
    e.preventDefault();
    await busy(e.submitter, async () => {
      try { await addUse({ client_id: client.id, package_id: usePkg.id, used_on: uf.day.value, note: uf.note.value.trim() || null }); ud.close(); toast('Đã trừ 1 buổi.'); reload(); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
  el.querySelectorAll('[data-unuse]').forEach((b) => (b.onclick = async () => {
    await busy(b, async () => { try { await deleteUse(b.dataset.unuse); toast('Đã hoàn lại 1 buổi.'); reload(); } catch (err) { toast(viError(err), 'error'); } });
  }));
}
