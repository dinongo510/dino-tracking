// DINO-011b — Màu giao diện: 1 số sắc độ (0–359) lưu trên máy người dùng; CSS tự suy ra toàn bộ bảng màu.
export const HUE_KEY = 'dcoach_hue';
export const DEFAULT_HUE = 25; // cam
export const PRESETS = [['Cam', 25], ['Hồng đỏ', 350], ['Xanh lá', 142], ['Xanh dương', 217], ['Tím', 271]];

export function getHue() {
  try { const v = Number(localStorage.getItem(HUE_KEY)); return Number.isFinite(v) && localStorage.getItem(HUE_KEY) !== null ? clampHue(v) : DEFAULT_HUE; }
  catch { return DEFAULT_HUE; }
}
export const clampHue = (h) => ((Math.round(Number(h)) % 360) + 360) % 360;
export function applyHue(h) {
  const v = clampHue(h);
  document.documentElement.style.setProperty('--h', String(v));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#08080b');
  return v;
}
export function setHue(h) {
  const v = applyHue(h);
  try { localStorage.setItem(HUE_KEY, String(v)); } catch { /* chế độ riêng tư: vẫn áp cho phiên này */ }
  return v;
}

/** Khối chọn màu (dùng ở Hồ sơ khách và trang chủ Coach). Gắn sự kiện bằng bindThemePicker(). */
export function themePickerHtml() {
  const h = getHue();
  return `<div class="card" id="themePick">
    <div class="row row--between"><strong>Màu giao diện</strong><span class="small muted">Chỉ đổi trên máy này</span></div>
    <div class="row" style="gap:12px;margin-top:10px;flex-wrap:wrap">${PRESETS.map(([n, v]) => `<button class="swatch" data-hue="${v}" aria-label="Màu ${n}" aria-pressed="${v === h}" style="background:linear-gradient(135deg,hsl(${v} 92% 62%),hsl(${v + 38} 92% 62%))"></button>`).join('')}</div>
    <label class="small muted" style="display:block;margin-top:10px">Hoặc kéo để chọn màu bất kỳ
      <input type="range" class="hue-range" min="0" max="359" step="1" value="${h}" aria-label="Sắc độ màu giao diện"></label>
  </div>`;
}
export function bindThemePicker(root = document) {
  const box = root.querySelector('#themePick'); if (!box) return;
  const range = box.querySelector('.hue-range');
  const mark = (v) => box.querySelectorAll('.swatch').forEach((b) => b.setAttribute('aria-pressed', String(Math.abs(Number(b.dataset.hue) - v) < 3)));
  range.addEventListener('input', () => mark(applyHue(range.value)));
  range.addEventListener('change', () => mark(setHue(range.value)));
  box.querySelectorAll('.swatch').forEach((b) => (b.onclick = () => { const v = setHue(b.dataset.hue); range.value = v; mark(v); }));
}
