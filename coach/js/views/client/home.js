import { render, $, esc, tabbar } from '../../ui.js';
import { sb } from '../../supabaseClient.js';
import { signOut } from '../../auth.js';
import { go } from '../../router.js';
import { loadIntake } from './intake.js';
import { sessionsOn } from '../../lib/planStore.js';
import { todayISO, SESSION_TYPE_VI } from '../../lib/plan.js';

export const clientTabs = () => tabbar([
  { href: '#/client', label: 'Hôm nay' },
  { href: '#/client/plan', label: 'Lịch tập' },
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
  const today = await sessionsOn(profile.id, todayISO()).catch(() => []);
  const hour = new Date().getHours();
  const hi = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  render(`
    <div class="row row--between"><div><h1>${hi}, ${esc(profile.full_name || 'bạn')}!</h1>
      <p class="muted">Coach của bạn: ${esc(coachName)}</p></div>
      <button id="out" class="btn btn--ghost small">Đăng xuất</button></div>

    <h2>Hôm nay</h2>
    ${today.length ? today.map((s) => `<a class="card" href="#/client/session/${s.id}" style="display:block;color:var(--text);text-decoration:none">
        <strong>${esc(s.title || 'Buổi tập')}</strong><div class="small muted">${esc(SESSION_TYPE_VI[s.session_type] || '')} · bấm để xem bài</div></a>`).join('')
      : `<div class="card"><p><strong>Hôm nay không có buổi tập.</strong></p>
      <p class="muted small">Xem cả tuần ở tab <a href="#/client/plan">Lịch tập</a>. Nếu Coach chưa phát hành giáo án, lịch sẽ hiện khi có.</p></div>`}

    <div class="card"><p class="small muted">Mẹo: thêm DINO Coach vào màn hình chính để mở nhanh như một ứng dụng
      (Safari: Chia sẻ → Thêm vào MH chính · Chrome: ⋮ → Cài đặt ứng dụng).</p></div>`);
  $('#out').onclick = async () => { await signOut(); go('#/login'); };
}
