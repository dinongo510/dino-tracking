// DINO-013 — Biểu đồ SVG tự vẽ (không thư viện, không CDN): màu lấy từ biến CSS của giao diện (--h, --a1…).
// Hàm thuần trả về chuỗi HTML → test được bằng Node, chạy offline trong PWA.

export const COLORS = ['var(--a1)', 'var(--a2)', 'var(--a3)', 'hsl(calc(var(--h) + 150) 60% 68%)', 'hsl(calc(var(--h) + 220) 55% 72%)', '#8a8a93'];
const W = 340, H = 170, L = 38, R = 10, T = 14, B = 24;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ms = (iso) => Date.parse(iso + 'T00:00:00Z');
const dm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
export const fmtNum = (v, d = 1) => (v == null ? '—' : String(Math.round(v * 10 ** d) / 10 ** d).replace('.', ','));
export const fmtPace = (sec) => (sec == null ? '—' : `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`);

/** Khoảng trục y "tròn" + các vạch */
export function niceScale(min, max, ticks = 4, { zero = false } = {}) {
  if (zero) min = Math.min(0, min);
  if (min === max) { const p = Math.abs(min) * 0.05 || 1; min -= p; max += p; }
  const raw = (max - min) / ticks, mag = 10 ** Math.floor(Math.log10(raw)), n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const out = []; for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return { lo, hi, step, ticks: out };
}

const frame = (title, unit, body, legend, attrs = '') => `<figure class="chart" ${attrs}>
  <figcaption><span>${esc(title)}</span>${unit ? `<span class="muted">${esc(unit)}</span>` : ''}</figcaption>
  ${body}${legend.length > 1 ? `<div class="legend">${legend.map((s, i) => `<span><i style="background:${s.color || COLORS[i]}"></i>${esc(s.name)}</span>`).join('')}</div>` : ''}</figure>`;
const empty = (title, unit, msg = 'Chưa có dữ liệu trong khoảng này.') => frame(title, unit, `<p class="small muted chart-empty">${esc(msg)}</p>`, [], 'data-empty="1"');

const yAxis = (sc, y, fmt) => sc.ticks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/>
  <text x="${L - 5}" y="${y(v) + 3.5}" text-anchor="end" class="tick">${esc(fmt(v))}</text>`).join('');

/**
 * Đường theo ngày. series: [{name, points:[{x:'YYYY-MM-DD', y}], line=true, dots=true, dash=false, color}]
 * markers: [{x, label}] (đường dọc mốc giai đoạn) · from/to: khoảng trục x · yFmt: định dạng số trục y
 */
export function lineChart({ id = '', title, unit = '', series, markers = [], from, to, yFmt = (v) => fmtNum(v), zero = false }) {
  const all = series.flatMap((s) => s.points.filter((p) => p.y != null));
  if (!all.length) return empty(title, unit);
  let x0 = ms(from || all.reduce((a, p) => (p.x < a ? p.x : a), all[0].x)), x1 = ms(to || all.reduce((a, p) => (p.x > a ? p.x : a), all[0].x));
  if (x1 - x0 < 6 * 864e5) { x0 -= 3 * 864e5; x1 += 3 * 864e5; }
  const ys = all.map((p) => p.y), sc = niceScale(Math.min(...ys), Math.max(...ys), 4, { zero });
  const x = (iso) => Math.round((L + ((ms(iso) - x0) / (x1 - x0)) * (W - L - R)) * 10) / 10;
  const y = (v) => Math.round((T + (1 - (v - sc.lo) / (sc.hi - sc.lo)) * (H - T - B)) * 10) / 10;
  const nx = 4, xt = Array.from({ length: nx }, (_, i) => new Date(x0 + ((x1 - x0) * i) / (nx - 1)).toISOString().slice(0, 10));
  const xLabels = xt.map((d, i) => `<text x="${x(d)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === nx - 1 ? 'end' : 'middle'}" class="tick">${dm(d)}</text>`).join('');
  const mk = markers.filter((m) => ms(m.x) >= x0 && ms(m.x) <= x1).map((m) => `<line x1="${x(m.x)}" x2="${x(m.x)}" y1="${T - 4}" y2="${H - B}" class="mark"/>
    <text x="${x(m.x) + 3}" y="${T + 4}" class="mark-label">${esc(m.label)}</text>`).join('');
  const lines = series.map((s, i) => {
    const c = s.color || COLORS[i], pts = s.points.filter((p) => p.y != null).sort((a, b) => a.x.localeCompare(b.x));
    const path = s.line !== false && pts.length > 1 ? `<path d="${pts.map((p, j) => `${j ? 'L' : 'M'}${x(p.x)} ${y(p.y)}`).join(' ')}" style="stroke:${c}" class="ln${s.dash ? ' ln--dash' : ''}"/>` : '';
    // dots:false vẫn giữ điểm (bán kính 0) để đọc số liệu + tooltip; chỉ không vẽ chấm
    const r = s.dots === false ? 0 : s.line === false ? 3 : 2.6;
    const dots = pts.map((p) => `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="${r}" style="fill:${c}" data-s="${i}" data-x="${p.x}" data-v="${p.y}"><title>${dm(p.x)}: ${esc(yFmt(p.y))} ${esc(unit)}</title></circle>`).join('');
    return path + dots;
  }).join('');
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}" preserveAspectRatio="xMidYMid meet">${yAxis(sc, y, yFmt)}${xLabels}${mk}${lines}</svg>`;
  return frame(title, unit, svg, series, `data-chart="${esc(id)}"`);
}

/**
 * Cột theo tuần. labels: ['YYYY-MM-DD' (thứ Hai)…] · series: [{name, values:[…]}]
 * stacked: cộng dồn (khối lượng theo nhóm cơ) · grouped: cột cạnh nhau (tuân thủ) · max: trần trục y (vd 100%)
 */
export function barChart({ id = '', title, unit = '', labels, series, stacked = false, max = null, markers = [], yFmt = (v) => fmtNum(v, 0) }) {
  const has = series.some((s) => s.values.some((v) => v != null && v > 0));
  if (!labels.length || !has) return empty(title, unit);
  const totals = labels.map((_, j) => (stacked ? series.reduce((a, s) => a + (s.values[j] || 0), 0) : Math.max(0, ...series.map((s) => s.values[j] || 0))));
  const sc = niceScale(0, max ?? Math.max(...totals), 4, { zero: true });
  if (max != null) { sc.hi = max; sc.ticks = sc.ticks.filter((t) => t <= max); }
  const y = (v) => Math.round((T + (1 - v / sc.hi) * (H - T - B)) * 10) / 10;
  const n = labels.length, slot = (W - L - R) / n, bw = Math.min(26, slot * 0.7);
  const groups = stacked ? 1 : series.length, w1 = bw / groups;
  const every = Math.ceil(n / 6);
  let bars = '';
  labels.forEach((lab, j) => {
    const cx = L + slot * j + slot / 2; let acc = 0;
    series.forEach((s, i) => {
      const v = s.values[j]; if (v == null || v <= 0) return;
      const c = s.color || COLORS[i];
      const x0 = stacked ? cx - bw / 2 : cx - bw / 2 + w1 * i, yTop = y(stacked ? acc + v : v), yBot = y(stacked ? acc : 0);
      bars += `<rect x="${Math.round(x0 * 10) / 10}" y="${yTop}" width="${Math.round((w1 - (stacked ? 0 : 1.5)) * 10) / 10}" height="${Math.max(0.5, Math.round((yBot - yTop) * 10) / 10)}" rx="2" style="fill:${c}" data-s="${i}" data-x="${lab}" data-v="${v}"><title>Tuần ${dm(lab)} · ${esc(s.name)}: ${esc(yFmt(v))} ${esc(unit)}</title></rect>`;
      acc += v;
    });
  });
  const xl = labels.map((lab, j) => (j % every === 0 || j === n - 1 ? `<text x="${L + slot * j + slot / 2}" y="${H - 6}" text-anchor="middle" class="tick">${dm(lab)}</text>` : '')).join('');
  const mk = markers.map((m) => { const j = labels.findIndex((lab, k) => m.x >= lab && (k === n - 1 || m.x < labels[k + 1])); return j < 0 ? '' : `<line x1="${L + slot * j + 1}" x2="${L + slot * j + 1}" y1="${T - 4}" y2="${H - B}" class="mark"/><text x="${L + slot * j + 4}" y="${T + 4}" class="mark-label">${esc(m.label)}</text>`; }).join('');
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}" preserveAspectRatio="xMidYMid meet">${yAxis(sc, y, yFmt)}${xl}${mk}${bars}</svg>`;
  return frame(title, unit, svg, series, `data-chart="${esc(id)}"`);
}
