import { render, $, esc, tabbar } from '../../ui.js';
import { sb } from '../../supabaseClient.js';
import { signOut } from '../../auth.js';
import { go } from '../../router.js';
import { loadIntake } from './intake.js';

export const clientTabs = () => tabbar([
  { href: '#/client', label: 'Hôm nay' },
  { href: '#/client/body', label: 'Cơ thể' },
  { href: '#/client/profile', label: 'Hồ sơ' },
]);

export async function clientHomeView({ profile }) {
  const intake = await loadIntake(profile.id);
  if (!intake?.updated_at) return go('#/client/intake'); // chưa hoàn thành hồ sơ → vào wizard
  clientTabs();
  let coachName = 'Dino';
  if (profile.coach_id) {
    const { data } = await (await sb()).from('profiles').select('full_name').eq('id', profile.coach_id).maybeSingle();
    if (data?.full_name) coachName = data.full_name;
  }
  const hour = new Date().getHours();
  const hi = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  render(`
    <div class="row row--between"><div><h1>${hi}, ${esc(profile.full_name || 'bạn')}!</h1>
      <p class="muted">Coach của bạn: ${esc(coachName)}</p></div>
      <button id="out" class="btn btn--ghost small">Đăng xuất</button></div>

    <h2>Hôm nay</h2>
    <div class="card"><p><strong>Chưa có buổi tập nào được giao.</strong></p>
      <p class="muted small">Coach đang chuẩn bị kế hoạch cho bạn. Khi giai đoạn được phát hành, buổi tập của ngày sẽ hiện ở đây.</p></div>

    <div class="card"><p class="small muted">Mẹo: thêm DINO Coach vào màn hình chính để mở nhanh như một ứng dụng
      (Safari: Chia sẻ → Thêm vào MH chính · Chrome: ⋮ → Cài đặt ứng dụng).</p></div>`);
  $('#out').onclick = async () => { await signOut(); go('#/login'); };
}
