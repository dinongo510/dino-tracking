// DINO Coach — điểm khởi động (DINO-006)
import { route, start, go } from './router.js';
import { watchOnline, render, esc } from './ui.js';
import { linkType, onAuthChange, getSession, getProfile, homeFor } from './auth.js';
import { loginView, forgotView, setPasswordView } from './views/auth.js';
import { coachHomeView } from './views/coach/home.js';
import { clientHomeView } from './views/client/home.js';
import { intakeView } from './views/client/intake.js';
import { clientBodyView, clientProfileView } from './views/client/body.js';
import { coachClientView } from './views/coach/client.js';

route('/', async () => { const s = await getSession(); go(s ? homeFor(await getProfile()) : '#/login'); }, 'public');
route('/login', loginView, 'public');
route('/forgot', forgotView, 'public');
route('/set-password', setPasswordView, 'public');
route('/coach', coachHomeView, 'coach');
route('/client', clientHomeView, 'client');
route('/client/intake', intakeView, 'client');
route('/client/intake/:step', intakeView, 'client');
route('/client/body', clientBodyView, 'client');
route('/client/profile', clientProfileView, 'client');
route('/coach/client/:id', coachClientView, 'coach');

watchOnline();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/coach/sw.js', { scope: '/coach' }).catch(console.warn);

(async () => {
  try {
    // Link mời / đặt lại mật khẩu: để supabase-js đọc token từ hash xong rồi mới chuyển trang
    await getSession();
    await onAuthChange((event) => { if (event === 'PASSWORD_RECOVERY') go('#/set-password'); });
    if (linkType === 'invite' || linkType === 'recovery') { history.replaceState(null, '', location.pathname); location.hash = '#/set-password'; }
    await start();
  } catch (err) {
    console.error(err);
    render(`<div class="card card--flag"><h2>Không kết nối được</h2>
      <p class="muted">Kiểm tra mạng rồi thử lại. ${esc(navigator.onLine ? '' : '(Đang mất mạng)')}</p>
      <button class="btn" onclick="location.reload()">Thử lại</button></div>`);
  }
})();
