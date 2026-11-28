import { render, $, esc, toast, busy, tabbar, fmtDate, icon, getInitials } from '../../ui.js';
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

export const coachTabs = (badgeCount = 0) => tabbar([
  { href: '#/coach', label: 'Khách', icon: 'users', also: ['#/dash', '#/client/session'] },
  { href: '#/coach/library', label: 'Thư viện', icon: 'book', also: ['#/coach/foods', '#/exercise', '#/tools'] },
  { href: '#/coach/inbox', label: 'Hộp việc', icon: 'inbox', badge: badgeCount > 0 ? badgeCount : null, dot: badgeCount > 0 },
]);

export async function coachHomeView({ profile }) {
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
  const needAttention = rows.filter((r) => r.alerts || (r.reasons && r.reasons.length)).length;
  const totalAlerts = rows.reduce((n, r) => n + (r.alerts || 0), 0);
  coachTabs(totalAlerts);

  const pct = (v) => (v == null ? '—' : `${v}%`);
  const dm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : 'chưa');

  render(`
    <div class="row row--between" style="margin-bottom:12px">
      <div>
        <h1 style="margin:0">Khách của bạn</h1>
        <p class="muted small" style="margin:2px 0 0">${active} đang tập${needAttention ? ` · <span style="color:var(--warn)">${needAttention} cần chú ý</span>` : ''}</p>
      </div>
      <button class="btn btn-icon" id="btnInvite" aria-label="Mời khách mới" title="Mời khách mới">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <div style="display:none"><button id="out">Đăng xuất</button></div>
    </div>

    <div class="card" style="padding:4px 12px">${rows.length ? `
      <ul class="list" id="group">${rows.map((r) => {
        const cleanReasons = (r.reasons || []).filter((rs) => !rs.includes('%'));
        return `
        <li data-client="${r.id}" style="align-items:flex-start;cursor:pointer;position:relative" onclick="if(!event.target.closest('button,a'))location.hash='#/coach/client/${r.id}'">
          <div class="row" style="gap:12px;align-items:flex-start;width:100%">
            <div class="avatar-btn" style="width:40px;height:40px;flex:none;font-size:14px;${r.alerts ? 'border-color:var(--danger);box-shadow:0 0 10px var(--danger)' : ''}">
              ${esc(getInitials(r.name))}
            </div>
            <div style="flex:1;min-width:0">
              <div class="row row--between" style="flex-wrap:wrap;gap:6px">
                <div class="row" style="gap:6px">
                  <a href="#/coach/client/${r.id}" style="color:var(--text);text-decoration:none"><strong>${esc(r.name)}</strong></a>
                  ${r.alerts ? `<span class="badge badge--hot">⚠ ${r.alerts}</span>` : ''}
                </div>
                <div class="row" style="gap:4px">
                  <span class="badge">${MODE_VI[r.mode] || 'Online'}</span>
                  ${r.status !== 'active' ? `<span class="badge ${STATUS[r.status]?.[1] || ''}">${STATUS[r.status]?.[0] || esc(r.status)}</span>` : ''}
                </div>
              </div>

              <div class="small muted" style="margin:3px 0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${r.phaseName ? `${esc(r.phaseName)} · tuần ${r.week}/${r.weeks}` : 'Chưa có giai đoạn'} · check-in ${dm(r.lastCheckin)}
              </div>

              <div class="gstats small" style="margin-bottom:4px">
                <span>Tập <b class="num">${pct(r.trainPct)}</b></span>
                <span>Ăn <b class="num">${pct(r.eatPct)}</b></span>
                <span>Cân <b>${r.trend.arrow ? `${r.trend.arrow}${r.trend.diff ? ' ' + fmtNum(Math.abs(r.trend.diff)) : ''}` : '—'}</b></span>
              </div>

              ${r.status === 'active' && cleanReasons.length ? `<div class="small" style="color:var(--warn);margin-top:2px">${esc(cleanReasons.join(' · '))}</div>` : ''}

              ${!r.phaseName ? `<div style="margin-top:8px"><a class="btn btn--ghost small" style="border-style:dashed;width:100%;font-size:12px" href="#/coach/client/${r.id}/plan">Soạn giáo án đầu tiên →</a></div>` : ''}
            </div>
          </div>
          <a href="#/dash/${r.id}" class="card-dash-link" style="opacity:0.01;pointer-events:auto;position:absolute;right:0;bottom:0;width:40px;height:20px;overflow:hidden;font-size:10px" tabindex="-1">Tiến độ</a>
          <button class="btn btn--ghost small" data-edit="${r.id}" style="opacity:0.01;pointer-events:auto;position:absolute;right:40px;bottom:0;width:30px;height:20px;overflow:hidden;font-size:10px" tabindex="-1">Sửa</button>
        </li>`;
      }).join('')}</ul>`
      : '<p class="muted" style="padding:16px 0;text-align:center">Chưa có khách. Bấm nút + ở góc trên để xem hướng dẫn mời khách.</p>'}</div>

    <a class="card row" href="javascript:void(0)" id="self" style="gap:14px;align-items:center;margin-top:14px;text-decoration:none">
      <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--tint);flex:none">
        ${icon('plan', 20)}
      </div>
      <div style="flex:1;min-width:0">
        <strong style="font-size:15px;color:var(--text)">Tập của tôi</strong>
        <div class="small muted">Ghi buổi tập của bạn bằng chế độ khách</div>
      </div>
      <span style="color:var(--muted)">→</span>
    </a>

    <dialog id="dlgInvite"><form method="dialog">
      <h2>Mời khách mới</h2>
      <ol class="small muted" style="padding-left:18px;line-height:1.7;margin:12px 0 16px">
        <li>Mở Supabase Dashboard → <strong>Authentication</strong> → <strong>Users</strong> → <em>Invite user</em>.</li>
        <li>Nhập email của khách → <em>Send invitation</em>.</li>
        <li>Khách bấm link trong email → tạo mật khẩu → vào app. Khách tự được gán cho bạn.</li>
        <li>Sau khi khách đăng nhập, vào hồ sơ khách để cập nhật họ tên và số điện thoại.</li>
      </ol>
      <button class="btn btn--primary btn--block">Đã hiểu</button>
    </form></dialog>

    <dialog id="dlg"><form id="f" method="dialog">
      <h2>Thông tin khách</h2>
      <label class="field"><span>Họ tên</span><input class="input" name="full_name" required></label>
      <label class="field"><span>Số điện thoại</span><input class="input" name="phone" type="tel" inputmode="tel"></label>
      <label class="field"><span>Trạng thái</span><select name="status">
        <option value="active">Đang tập</option><option value="paused">Tạm dừng</option><option value="ended">Kết thúc</option></select></label>
      <div class="row"><button type="button" id="cancel" class="btn btn--ghost">Hủy</button>
        <button class="btn btn--primary" style="flex:1">Lưu</button></div>
    </form></dialog>`);

  $('#btnInvite').onclick = () => $('#dlgInvite').showModal();
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
