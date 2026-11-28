import { render, $, esc, toast, busy, tabbar, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { signOut } from '../../auth.js';
import { go } from '../../router.js';

const STATUS = { active: ['Đang tập', 'badge--ok'], paused: ['Tạm dừng', 'badge--warn'], ended: ['Kết thúc', ''] };

export const coachTabs = () => tabbar([
  { href: '#/coach', label: 'Khách' },
  { href: '#/coach/library', label: 'Thư viện' },
  { href: '#/coach/inbox', label: 'Hộp việc' },
]);

export async function coachHomeView({ profile }) {
  coachTabs();
  const db = await sb();
  const { data: clients, error } = await db.from('profiles')
    .select('id, full_name, phone, status, created_at')
    .eq('role', 'client').eq('coach_id', profile.id).order('status').order('full_name');
  if (error) throw error;

  const active = clients.filter((c) => c.status === 'active').length;
  render(`
    <div class="row row--between"><div><h1>Chào Coach ${esc(profile.full_name || '')}</h1>
      <p class="muted">${active} khách đang tập · ${clients.length} tổng</p></div>
      <button id="out" class="btn btn--ghost small">Đăng xuất</button></div>

    <div class="card">${clients.length ? `<ul class="list">${clients.map((c) => `
      <li><div><a href="#/coach/client/${c.id}" style="color:var(--text)"><strong>${esc(c.full_name || '(chưa có tên)')}</strong></a>
        <div class="small muted">${esc(c.phone || '—')} · từ ${fmtDate(c.created_at)}</div></div>
        <div class="row"><span class="badge ${STATUS[c.status]?.[1] || ''}">${STATUS[c.status]?.[0] || esc(c.status)}</span>
        <button class="btn btn--ghost small" data-edit="${c.id}">Sửa</button></div></li>`).join('')}</ul>`
      : '<p class="muted">Chưa có khách. Xem hướng dẫn mời khách bên dưới.</p>'}</div>

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
    </form></dialog>`);

  $('#out').onclick = async () => { await signOut(); go('#/login'); };

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
