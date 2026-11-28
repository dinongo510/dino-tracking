// DINO Coach — điểm khởi động (DINO-006)
import { route, start, go, setClientGuard, setSelfCheck } from './router.js';
import { selfMode, lockState } from './lib/packages.js';
import { loadPackages } from './lib/packageStore.js';
import { todayISO } from './lib/plan.js';
import { watchOnline, render, esc, toast } from './ui.js';
import { linkType, linkError, onAuthChange, getSession, getProfile, homeFor } from './auth.js';
import { loginView, forgotView, setPasswordView } from './views/auth.js';
import { coachHomeView } from './views/coach/home.js';
import { clientHomeView } from './views/client/home.js';
import { intakeView } from './views/client/intake.js';
import { clientBodyView, clientProfileView } from './views/client/body.js';
import { coachClientView } from './views/coach/client.js';
import { coachLibraryView } from './views/coach/library.js';
import { exerciseView } from './views/shared/exercise.js';
import { coachPlanView } from './views/coach/plan.js';
import { coachSessionView } from './views/coach/session.js';
import { clientPlanView } from './views/client/plan.js';
import { clientSessionView } from './views/client/log.js';
import { coachReviewView } from './views/coach/review.js';
import { coachInboxView } from './views/coach/inbox.js';
import { flushPending } from './lib/logStore.js';
import { applyHue, getHue } from './lib/theme.js';
applyHue(getHue()); // màu giao diện người dùng đã chọn
import { coachNutritionView } from './views/coach/nutrition.js';
import { coachFoodsView } from './views/coach/foods.js';
import { clientEatView } from './views/client/eat.js';
import { clientCheckinView } from './views/client/checkin.js';
import { coachCheckinView, coachCheckinListView } from './views/coach/checkin.js';
import { phaseReportView } from './views/shared/phaseReport.js';
import { dashView, clientDashView } from './views/shared/dashboard.js';
import { toolsView } from './views/shared/tools.js';
import { clientAdhocView } from './views/client/adhoc.js';

route('/', async () => { const s = await getSession(); const p = s ? await getProfile() : null; go(!s ? '#/login' : p?.role === 'coach' && selfMode() ? '#/client' : homeFor(p)); }, 'public');
route('/login', loginView, 'public');
route('/forgot', forgotView, 'public');
route('/set-password', setPasswordView, 'public');
route('/coach', coachHomeView, 'coach');
route('/client', clientHomeView, 'client');
route('/client/adhoc/new', clientAdhocView, 'auth');
route('/client/adhoc/:id/edit', clientAdhocView, 'auth');
route('/client/intake', intakeView, 'client');
route('/client/intake/:step', intakeView, 'client');
route('/client/body', clientBodyView, 'client');
route('/client/profile', clientProfileView, 'client');
route('/coach/client/:id', coachClientView, 'coach');
route('/coach/library', coachLibraryView, 'coach');
route('/exercise/:id', exerciseView, 'auth');
route('/coach/client/:id/plan', coachPlanView, 'coach');
route('/coach/session/:id', coachSessionView, 'coach');
route('/client/plan', clientPlanView, 'client');
route('/client/session/:id', clientSessionView, 'auth');
route('/coach/review/:id', coachReviewView, 'coach');
route('/coach/inbox', coachInboxView, 'coach');
route('/coach/client/:id/nutrition', coachNutritionView, 'coach');
route('/coach/foods', coachFoodsView, 'coach');
route('/client/eat', clientEatView, 'client');
route('/client/checkin', clientCheckinView, 'client');
route('/coach/checkin/:id', coachCheckinView, 'coach');
route('/coach/client/:id/checkins', coachCheckinListView, 'coach');
route('/phase/:id', phaseReportView, 'auth');
route('/dash/:id', dashView, 'coach');
route('/client/dash', clientDashView, 'client');
route('/tools', toolsView, 'auth');

// DINO-014: khách hết gói quá 3 ngày → màn hình khóa (kiểm tra lại mỗi 60 giây)
setSelfCheck(selfMode);
let lockCache = { at: 0, id: null, st: null };
setClientGuard(async (profile) => {
  if (Date.now() - lockCache.at > 60000 || lockCache.id !== profile.id) {
    try { const { packages } = await loadPackages(profile.id); lockCache = { at: Date.now(), id: profile.id, st: lockState(packages, todayISO()) }; }
    catch { return false; } // lỗi mạng: không khóa
  }
  const st = lockCache.st; if (!st?.locked) return false;
  const { tabbar } = await import('./ui.js'); tabbar(null);
  const d = st.lastEnd ? `${st.lastEnd.slice(8, 10)}/${st.lastEnd.slice(5, 7)}/${st.lastEnd.slice(0, 4)}` : '';
  render(`<div class="card card--flag" style="margin-top:40px;text-align:center" id="locked">
    <div style="font-size:42px">🔒</div><h1>Gói tập đã hết hạn</h1>
    <p class="muted">${d ? `Gói của bạn hết hạn ngày ${d}. ` : ''}Liên hệ Coach để gia hạn — dữ liệu của bạn vẫn được giữ nguyên.</p>
    <button class="btn btn--block" id="lout" style="margin-top:12px">Đăng xuất</button></div>`);
  const { signOut } = await import('./auth.js');
  document.getElementById('lout').onclick = async () => { await signOut(); go('#/login'); };
  return true;
});

watchOnline();
addEventListener('online', () => flushPending().catch(() => {})); // hiệp ghi lúc mất mạng tự gửi khi có mạng
if ('serviceWorker' in navigator) {
  // Khi có bản cập nhật, service worker mới chiếm quyền → tải lại trang 1 lần để chạy code mới ngay
  // (không tải lại ở lần cài đầu tiên, khi trước đó chưa có service worker nào).
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true; location.reload();
  });
  navigator.serviceWorker.register('/coach/sw.js', { scope: '/coach' }).catch(console.warn);
}

(async () => {
  try {
    // Link mời / đặt lại mật khẩu: để supabase-js đọc token từ hash xong rồi mới chuyển trang
    await getSession();
    await onAuthChange((event) => { if (event === 'PASSWORD_RECOVERY') go('#/set-password'); });
    if (linkType === 'invite' || linkType === 'recovery') { history.replaceState(null, '', location.pathname); location.hash = '#/set-password'; }
    if (linkError) {
      history.replaceState(null, '', location.pathname); location.hash = '#/login';
      await start();
      toast(linkError === 'otp_expired' ? 'Link đã hết hạn hoặc đã được dùng. Nhờ Coach gửi lại link mời, hoặc bấm "Quên mật khẩu?".' : 'Link không hợp lệ. Nhờ Coach gửi lại link mời.', 'error');
      return;
    }
    await start();
  } catch (err) {
    console.error(err);
    render(`<div class="card card--flag"><h2>Không kết nối được</h2>
      <p class="muted">Kiểm tra mạng rồi thử lại. ${esc(navigator.onLine ? '' : '(Đang mất mạng)')}</p>
      <button class="btn" onclick="location.reload()">Thử lại</button></div>`);
  }
})();
