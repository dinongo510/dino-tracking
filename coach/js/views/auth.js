import { render, $, toast, busy, tabbar } from '../ui.js';
import { signIn, sendReset, setPassword, getProfile, homeFor, getSession } from '../auth.js';
import { viError } from '../supabaseClient.js';
import { go } from '../router.js';

export async function loginView() {
  tabbar(null);
  if (await getSession()) return go(homeFor(await getProfile()));
  render(`
    <div class="center" style="padding-bottom:16px"><h1>DINO Coach</h1><p class="muted">Đăng nhập để xem kế hoạch của bạn</p></div>
    <form id="f" class="card" novalidate>
      <label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required></label>
      <label class="field"><span>Mật khẩu</span><input class="input" name="password" type="password" autocomplete="current-password" required></label>
      <button class="btn btn--primary btn--block">Đăng nhập</button>
    </form>
    <p class="center small" style="padding:8px 0"><a href="#/forgot">Quên mật khẩu?</a></p>
    <p class="center small muted" style="padding:0">Chưa có tài khoản? Liên hệ Coach Dino để nhận link mời.</p>`);
  $('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await busy(e.submitter, async () => {
      try { await signIn(fd.get('email'), fd.get('password')); go(homeFor(await getProfile(true))); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
}

export async function forgotView() {
  tabbar(null);
  render(`
    <h1>Quên mật khẩu</h1><p class="muted">Nhập email, Coach sẽ gửi link đặt lại mật khẩu.</p>
    <form id="f" class="card">
      <label class="field"><span>Email</span><input class="input" name="email" type="email" autocomplete="email" required></label>
      <button class="btn btn--primary btn--block">Gửi link</button>
    </form>
    <p class="small"><a href="#/login">← Quay lại đăng nhập</a></p>`);
  $('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    await busy(e.submitter, async () => {
      try { await sendReset(new FormData(e.target).get('email')); toast('Đã gửi. Kiểm tra hộp thư (cả mục Spam).'); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
}

/** Dùng cho link mời (invite) và link đặt lại mật khẩu (recovery). */
export async function setPasswordView() {
  tabbar(null);
  if (!(await getSession())) {
    render(`<div class="card card--flag"><h2>Link đã hết hạn hoặc đã dùng</h2>
      <p class="muted">Nhờ Coach gửi lại link mời, hoặc dùng “Quên mật khẩu”.</p><a class="btn" href="#/forgot">Quên mật khẩu</a></div>`);
    return;
  }
  render(`
    <h1>Tạo mật khẩu</h1><p class="muted">Dùng mật khẩu này cho những lần đăng nhập sau.</p>
    <form id="f" class="card">
      <label class="field"><span>Mật khẩu mới (ít nhất 8 ký tự)</span><input class="input" name="p1" type="password" minlength="8" autocomplete="new-password" required></label>
      <label class="field"><span>Nhập lại</span><input class="input" name="p2" type="password" minlength="8" autocomplete="new-password" required></label>
      <button class="btn btn--primary btn--block">Lưu và vào app</button>
    </form>`);
  $('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get('p1').length < 8) return toast('Mật khẩu cần ít nhất 8 ký tự.', 'error');
    if (fd.get('p1') !== fd.get('p2')) return toast('Hai mật khẩu chưa khớp.', 'error');
    await busy(e.submitter, async () => {
      try { await setPassword(fd.get('p1')); toast('Đã lưu mật khẩu.'); go(homeFor(await getProfile(true))); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
}
