// Tiện ích giao diện dùng chung
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

/** Tab bar: items = [{href, label, disabled}] ; null để ẩn */
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

/** Thanh tab nổi: tab đang chọn hiện biểu tượng + chữ, tab khác chỉ biểu tượng (chữ vẫn có cho trình đọc màn hình). */
export function tabbar(items) {
  const nav = $('#tabbar');
  if (!items) { nav.hidden = true; nav.innerHTML = ''; return; }
  const cur = location.hash.split('?')[0];
  const hit = (h) => cur === h || cur.startsWith(h + '/');
  const active = items.find((i) => (i.also || []).some(hit)) || items.filter((i) => hit(i.href)).sort((a, b) => b.href.length - a.href.length)[0];
  nav.innerHTML = items.map((i) => `<a href="${i.href}"${i === active ? ' aria-current="page"' : ''}${i.disabled ? ' aria-disabled="true"' : ''}${i.dot ? ' class="tab-dot"' : ''}>${icon(i.icon)}<span class="tab-label">${esc(i.label)}</span></a>`).join('');
  nav.hidden = false;
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
