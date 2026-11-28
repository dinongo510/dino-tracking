// Tiện ích giao diện dùng chung DINOMET
export const $ = (sel, root = document) => root.querySelector(sel);

/** Escape chuỗi trước khi chèn vào HTML (chống XSS từ dữ liệu người dùng). */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function render(html) { $('#app').innerHTML = html; window.scrollTo(0, 0); }

let toastTimer;
export function toast(msg, type = 'info') {
  const t = $('#toast');
  t.textContent = msg; t.className = 'toast' + (type === 'error' ? ' toast--error' : ''); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 3500);
}

/** Rút gọn họ tên lấy 2 chữ cuối (tên gọi). Vd "Ngô Đức Anh" -> "Đức Anh", "Khách A" -> "Khách A" */
export function shortName(name) {
  if (!name) return 'bạn';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(' ');
  return parts.slice(-2).join(' ');
}

/** Chữ viết tắt cho avatar (2 chữ cái) */
export function getInitials(name) {
  if (!name) return 'D';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const lastTwo = parts.slice(-2);
  return (lastTwo[0][0] + lastTwo[1][0]).toUpperCase();
}

/** Vòng tròn tiến độ SVG với số % ở tâm */
export function ringSvg(pct, size = 68, stroke = 6) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct ?? 0));
  const offset = c - (p / 100) * c;
  const displayVal = pct == null ? '—' : `${Math.round(pct)}%`;
  return `
    <div class="ring-box" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="${stroke}" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--a1)" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}" style="transition: stroke-dashoffset .4s ease" />
      </svg>
      <span class="ring-val num">${displayVal}</span>
    </div>
  `;
}

/** Tab bar: items = [{href, label, disabled, dot, badge}] ; null để ẩn */
const ICONS = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  plan: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  eat: '<path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M6 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  body: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
};
export const icon = (name, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/** Thanh tab nổi: mọi tab hiện biểu tượng + nhãn dưới biểu tượng; tab đang chọn tô màu nhấn */
export function tabbar(items) {
  const nav = $('#tabbar');
  if (!items) { nav.hidden = true; nav.innerHTML = ''; return; }
  const cur = location.hash.split('?')[0];
  const hit = (h) => cur === h || cur.startsWith(h + '/');
  const active = items.find((i) => (i.also || []).some(hit)) || items.filter((i) => hit(i.href)).sort((a, b) => b.href.length - a.href.length)[0];
  nav.innerHTML = items.map((i) => `
    <a href="${i.href}"${i === active ? ' aria-current="page"' : ''}${i.disabled ? ' aria-disabled="true"' : ''}${i.dot ? ' class="tab-dot"' : ''}>
      ${icon(i.icon)}
      <span class="tab-label">${esc(i.label)}</span>
      ${i.badge ? `<span class="tab-badge">${i.badge}</span>` : ''}
    </a>
  `).join('');
  nav.hidden = false;
}

/** Thanh trên cùng (Top bar) chuẩn DINOMET v2 */
export function topbar(profile) {
  const bar = $('#topbar');
  if (!bar) return;
  if (!profile) { bar.hidden = true; bar.innerHTML = ''; return; }
  const isCoach = profile.role === 'coach';
  const inSelf = isCoach && (typeof window !== 'undefined' && localStorage.getItem('dcoach_self_mode') === 'true');
  const initials = getInitials(profile.full_name);
  bar.innerHTML = `
    <div class="topbar-left">
      <img src="/coach/icons/logo-mark.png" alt="DINOMET" style="width:26px;height:26px;flex:none;vertical-align:middle">
      <span class="topbar-brand">DINOMET</span>
      ${isCoach ? `<span class="badge small" style="padding:2px 7px;font-size:11px;font-weight:700">${inSelf ? 'Tập' : 'Coach'}</span>` : ''}
    </div>
    <button id="btnAvatar" class="avatar-btn" aria-label="Tài khoản">${esc(initials)}</button>
  `;
  bar.hidden = false;
  $('#btnAvatar').onclick = () => accountSheet(profile);
}

/** Sheet tài khoản dưới đáy (Account bottom sheet) */
export async function accountSheet(profile) {
  const dlg = $('#accountSheet');
  if (!dlg) return;
  const { themePickerHtml, bindThemePicker } = await import('./lib/theme.js');
  const isCoach = profile.role === 'coach';
  const inSelf = isCoach && (typeof window !== 'undefined' && localStorage.getItem('dcoach_self_mode') === 'true');
  const initials = getInitials(profile.full_name);

  dlg.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="row" style="gap:12px;margin-bottom:16px;align-items:center">
      <div class="avatar-btn" style="width:48px;height:48px;font-size:16px">${esc(initials)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(profile.full_name || 'Tài khoản')}</div>
        <div class="small muted">${isCoach ? (inSelf ? 'Coach (Chế độ tập)' : 'Coach') : 'Học viên'}</div>
      </div>
    </div>

    <div class="stack" style="gap:8px;margin-bottom:16px">
      ${isCoach && inSelf ? `<button class="btn btn--primary btn--block" id="actBackCoach">← Về giao diện Coach</button>` : ''}
      ${isCoach && !inSelf ? `<button class="btn btn--block" id="actSelfMode">Mở "Tập của tôi" →</button>` : ''}
      ${!isCoach ? `<a class="btn btn--block" href="#/client/profile" id="actProfile">Xem Hồ sơ cá nhân</a>` : ''}
    </div>

    ${themePickerHtml()}

    <div style="margin-top:16px">
      <button class="btn btn--ghost btn--block" id="actSignOut" style="color:var(--danger)">Đăng xuất</button>
      <button class="btn btn--ghost btn--block small" id="actCloseSheet" style="margin-top:4px">Đóng</button>
    </div>
  `;
  bindThemePicker(dlg);

  dlg.showModal();
  dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); };
  $('#actCloseSheet').onclick = () => dlg.close();
  if ($('#actProfile')) $('#actProfile').onclick = () => dlg.close();

  $('#actSignOut').onclick = async () => {
    dlg.close();
    const { signOut } = await import('./auth.js');
    await signOut();
    location.hash = '#/login';
  };

  if ($('#actBackCoach')) {
    $('#actBackCoach').onclick = async () => {
      dlg.close();
      const { setSelfMode } = await import('./lib/packages.js');
      setSelfMode(false);
      location.hash = '#/coach';
    };
  }
  if ($('#actSelfMode')) {
    $('#actSelfMode').onclick = async () => {
      dlg.close();
      const { setSelfMode } = await import('./lib/packages.js');
      setSelfMode(true);
      location.hash = '#/client';
    };
  }
}

/** Khóa nút trong lúc chờ, tự mở lại. */
export async function busy(btn, fn) {
  const label = btn.textContent; btn.disabled = true; btn.textContent = 'Đang xử lý…';
  try { return await fn(); } finally { btn.disabled = false; btn.textContent = label; }
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');

export function watchOnline() {
  const b = $('#offline');
  const upd = () => (b.hidden = navigator.onLine);
  addEventListener('online', upd); addEventListener('offline', upd); upd();
}
