// Hash router đơn giản + chặn theo vai trò
import { getSession, getProfile, homeFor } from './auth.js';
import { render, esc, topbar } from './ui.js';

const routes = []; // {pattern: RegExp, keys, view, access: 'public'|'auth'|'coach'|'client'}
let clientGuard = null; // DINO-014: khóa app khách khi hết gói — trả true nếu đã chặn (tự vẽ màn hình khóa)
let selfCheck = () => false; // DINO-014: coach đang ở chế độ "Tập của tôi"
export const setClientGuard = (fn) => { clientGuard = fn; };
export const setSelfCheck = (fn) => { selfCheck = fn; };

export function route(path, view, access = 'auth') {
  const keys = [];
  const pattern = new RegExp('^' + path.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$');
  routes.push({ pattern, keys, view, access });
}

export const go = (hash) => { if (location.hash === hash) resolve(); else location.hash = hash; };

export async function resolve() {
  const path = (location.hash.replace(/^#/, '') || '/').split('?')[0];
  const r = routes.find((x) => x.pattern.test(path));
  if (!r) return go('#/');
  const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(path.match(r.pattern)[i + 1])]));

  try {
    if (r.access !== 'public') {
      const session = await getSession();
      if (!session) { topbar(null); return go('#/login'); }
      const profile = await getProfile();
      if (!profile) { topbar(null); return go('#/login'); }
      if (r.access === 'coach' && profile.role !== 'coach') return go(homeFor(profile));
      if (r.access === 'client' && profile.role !== 'client' && !(profile.role === 'coach' && selfCheck())) return go(homeFor(profile));
      if (profile.role === 'client' && clientGuard && await clientGuard(profile, path)) return;
      topbar(profile);
      return await r.view({ params, profile });
    }
    topbar(null);
    return await r.view({ params });
  } catch (err) {
    console.error(err);
    render(`<div class="card card--flag"><h2>Không tải được trang</h2><p class="muted">${esc(err.message || err)}</p>
      <button class="btn" onclick="location.reload()">Thử lại</button></div>`);
  }
}

export function start() {
  addEventListener('hashchange', resolve);
  return resolve();
}
