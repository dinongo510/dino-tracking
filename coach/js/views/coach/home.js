import { themePickerHtml, bindThemePicker } from '../../lib/theme.js';
import { render, $, esc, toast, busy, tabbar, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { signOut } from '../../auth.js';
import { go } from '../../router.js';
import { groupData } from '../../lib/dashboardStore.js';
import { groupRow, sortByAttention } from '../../lib/dashboard.js';
import { todayISO } from '../../lib/plan.js';
import { fmtNum } from '../../lib/charts.js';
import { computeAlerts } from './inbox.js';
import { loadPackages } from '../../lib/packageStore.js';
import { pkgReasons, MODE_VI, setSelfMode } from '../../lib/packages.js';

const STATUS = { active: ['Đang tập', 'badge--ok'], paused: ['Tạm dừng', 'badge--warn'], ended: ['Kết thúc', ''] };

export const coachTabs = () => tabbar([
  { href: '#/coach', label: 'Khách', icon: 'users', also: ['#/dash', '#/client/session'] },
  { href: '#/coach/library', label: 'Thư viện', icon: 'book', also: ['#/coach/foods', '#/exercise', '#/tools'] },
  { href: '#/coach/inbox', label: 'Hộp việc', icon: 'inbox' },
]);

export async function coachHomeView({ profile }) {
  coachTabs();
  const db = await sb();
  const { data: clients, error } = await db.from('profiles')
    .select('id, full_name, phone, status, created_at, coach_mode')
    .eq('role', 'client').eq('coach_id', profile.id).order('status').order('full_name');
  if (error) throw error;

  // Bảng tổng nhóm: tính cảnh báo bỏ buổi / km tăng trước (giống Hộp việc), rồi sắp theo "cần chú ý"
  const today = todayISO();
  await computeAlerts(clients.filter((c) => c.status === 'active')).catch((e) => console.warn('computeAlerts', e));
  const G = await groupData(clients.map((c) => c.id), today).catch((e) => { console.warn('groupData', e); return {}; });
  const PK = await loadPackages(clients.map((c) => c.id)).catch(() => ({ packages: [], usedById: {} }));
  const rows = sortByAttention(clients.map((c) => groupRow({ client: c, ...(G[c.id] || {}), pkg: c.status === 'active' ? pkgReasons(PK.packages.filter((p) => p.client_id === c.id), PK.usedById, today) : [], today })));
  const active = clients.filter((c) => c.status === 'active').length;
  const pct = (v) => (v == null ? '—' : `${v}%`);
  const dm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : 'chưa');
  render(`
    <div class="row row--between"><div><h1 style="display:flex;align-items:center;gap:8px"><img src="/coach/icons/logo-mark.png" alt="DINOMET" style="width:24px;height:24px;vertical-align:middle;flex:none"><span>Chào Coach ${esc(profile.full_name || '')}</span></h1>
      <p class="muted">${active} khách đang tập · ${clients.length} tổng</p></div>
      <button id="out" class="btn btn--ghost small">Đăng xuất</button></div>

    <div class="card">${rows.length ? `<p class="small muted" style="margin:0 0 4px">Xếp theo mức cần chú ý: cảnh báo → tuân thủ thấp → lâu chưa check-in.</p>
      <ul class="list" id="group">${rows.map((r) => `
      <li data-client="${r.id}" style="align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div class="row" style="gap:8px;flex-wrap:wrap"><a href="#/coach/client/${r.id}" style="color:var(--text)"><strong>${esc(r.name)}</strong></a>
            ${r.alerts ? `<span class="badge badge--hot">⚠ ${r.alerts}</span>` : ''}
            <span class="badge">${MODE_VI[r.mode] || 'Online'}</span>
            ${r.status !== 'active' ? `<span class="badge ${STATUS[r.status]?.[1] || ''}">${STATUS[r.status]?.[0] || esc(r.status)}</span>` : ''}</div>
          <div class="small muted">${r.phaseName ? `${esc(r.phaseName)} · tuần ${r.week}/${r.weeks}` : 'Chưa có giai đoạn'} · check-in ${dm(r.lastCheckin)}</div>
          <div class="gstats small"><span>Tập <b>${pct(r.trainPct)}</b></span><span>Ăn <b>${pct(r.eatPct)}</b></span>
            <span>Cân <b>${r.trend.arrow ? `${r.trend.arrow}${r.trend.diff ? ' ' + fmtNum(Math.abs(r.trend.diff)) : ''}` : '—'}</b></span></div>
          ${r.status === 'active' && r.reasons.length ? `<div class="small" style="color:var(--warn)">${esc(r.reasons.join(' · '))}</div>` : ''}
        </div>
        <div class="row" style="gap:6px;flex-direction:column;align-items:stretch"><a class="btn btn--ghost small" href="#/dash/${r.id}">Tiến độ</a>
        <button class="btn btn--ghost small" data-edit="${r.id}">Sửa</button></div></li>`).join('')}</ul>`
      : '<p class="muted">Chưa có khách. Xem hướng dẫn mời khách bên dưới.</p>'}</div>

    <div class="card row row--between" style="flex-wrap:wrap;gap:8px"><div><strong>Tập của tôi</strong>
      <div class="small muted">Dùng chính app này để ghi buổi tập của bạn — không cần đăng xuất.</div></div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn btn--primary small" id="self">Mở chế độ tập →</button>
        <a class="btn small" href="#/coach/client/${profile.id}/plan">Giáo án của tôi</a><a class="btn btn--ghost small" href="#/dash/${profile.id}">Tiến độ</a></div></div>

    <details class="card"><summary><strong>Cách mời khách mới</strong></summary>
      <ol class="small muted">
        <li>Mở Supabase Dashboard → Authentication → Users → <em>Invite user</em>.</li>
        <li>Nhập email khách → Send invitation.</li>
        <li>Khách bấm link trong email → tạo mật khẩu → vào app. Khách tự được gán cho bạn.</li>
        <li>Quay lại đây bấm <em>Sửa</em> để điền tên và số điện thoại.</li>
      </ol></details>

    <dialog id="dlg"><form id="f" method="dialog">
      <h2>Thông tin khách</h2>
      <label class="field"><span>Họ tên</span><input class="input" name="full_name" required></label>
      <label class="field"><span>Số điện thoại</span><input class="input" name="phone" type="tel" inputmode="tel"></label>
      <label class="field"><span>Trạng thái</span><select name="status">
        <option value="active">Đang tập</option><option value="paused">Tạm dừng</option><option value="ended">Kết thúc</option></select></label>
      <div class="row"><button type="button" id="cancel" class="btn btn--ghost">Hủy</button>
        <button class="btn btn--primary" style="flex:1">Lưu</button></div>
    </form></dialog>
    ${themePickerHtml()}`);

  bindThemePicker();
  $('#out').onclick = async () => { await signOut(); go('#/login'); };
  $('#self').onclick = () => { setSelfMode(true); go('#/client'); };

  const dlg = $('#dlg'), f = $('#f');
  let editing = null;
  document.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => {
    editing = clients.find((c) => c.id === b.dataset.edit);
    f.full_name.value = editing.full_name || ''; f.phone.value = editing.phone || ''; f.status.value = editing.status;
    dlg.showModal();
  }));
  $('#cancel').onclick = () => dlg.close();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    await busy(e.submitter, async () => {
      const patch = { full_name: f.full_name.value.trim(), phone: f.phone.value.trim() || null, status: f.status.value };
      const { error: err } = await db.from('profiles').update(patch).eq('id', editing.id);
      if (err) return toast(viError(err), 'error');
      dlg.close(); toast('Đã lưu.'); coachHomeView({ profile });
    });
  });
}
