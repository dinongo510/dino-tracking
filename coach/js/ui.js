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
export function tabbar(items) {
  const nav = $('#tabbar');
  if (!items) { nav.hidden = true; nav.innerHTML = ''; return; }
  const cur = location.hash.split('?')[0];
  const active = items.filter((i) => cur === i.href || cur.startsWith(i.href + '/')).sort((a, b) => b.href.length - a.href.length)[0];
  nav.innerHTML = items.map((i) => `<a href="${i.href}"${i === active ? ' aria-current="page"' : ''}${i.disabled ? ' aria-disabled="true"' : ''}>${esc(i.label)}</a>`).join('');
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
