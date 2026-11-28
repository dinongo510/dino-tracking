// DINO-014 — Gói tập: hàm thuần (test bằng Node). Gói theo buổi và/hoặc thời hạn; khóa app khách online sau 3 ngày hết hạn.
import { addDays } from './plan.js';

export const MODE_VI = { online: 'Online', offline: 'Offline', hybrid: 'Kết hợp' };
export const SESSION_MODE_VI = { self: 'Khách tự tập', pt: 'PT tại chỗ (coach ghi, trừ 1 buổi)' };
export const GRACE_DAYS = 3;
export const WARN_SESSIONS = 2, WARN_DAYS = 7;
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

/** Cộng tháng (giữ ngày; 31/1 + 1 tháng = 28|29/2) */
export function addMonths(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1)), last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, last));
  return t.toISOString().slice(0, 10);
}
/** Ngày hết hạn của gói N tháng bắt đầu từ `start` (ngày cuối cùng còn dùng được) */
export const endAfterMonths = (start, n) => addDays(addMonths(start, n), -1);

/** Số tiền kiểu Việt Nam: 3000000 → "3.000.000 đ" */
export const fmtVnd = (v) => (v == null ? '—' : `${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ`);
/** Đọc số tiền gõ tay: "3.000.000", "3tr", "3,5tr", "500k" → số */
export function parseVnd(s) {
  if (s == null) return null;
  const t = String(s).trim().toLowerCase().replace(/\s|đ|vnd/g, '');
  if (!t) return null;
  const m = t.match(/^(\d+(?:[.,]\d+)?)(tr|triệu|trieu|m|k|nghìn|nghin)?$/);
  if (m && m[2]) { const n = Number(m[1].replace(',', '.')); return Math.round(n * (/^(k|ngh)/.test(m[2]) ? 1e3 : 1e6)); }
  const n = Number(t.replace(/[.,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Tên tự đặt cho gói */
export function autoName(p) {
  const parts = [];
  if (p.total_sessions) parts.push(`${p.total_sessions} buổi`);
  if (p.end_date) {
    const mo = Math.round(daysBetween(p.start_date, addDays(p.end_date, 1)) / 30.4);
    parts.push(mo >= 1 ? `${mo} tháng` : `${daysBetween(p.start_date, p.end_date) + 1} ngày`);
  } else if (!p.total_sessions) parts.push('không giới hạn');
  return parts.join(' · ') || 'Gói tập';
}

/**
 * Trạng thái 1 gói hôm nay. uses: số buổi đã dùng.
 * valid = còn dùng được (đang hoạt động, chưa quá hạn + 3 ngày ân hạn, còn buổi nếu là gói buổi)
 */
export function pkgStatus(p, used = 0, today) {
  const left = p.total_sessions ? Math.max(0, p.total_sessions - used) : null;
  const daysLeft = p.end_date ? daysBetween(today, p.end_date) : null;            // 0 = hôm nay là ngày cuối
  const expired = daysLeft != null && daysLeft < 0;
  const inGrace = expired && -daysLeft <= GRACE_DAYS;
  const ended = p.status === 'ended';
  const notStarted = p.start_date > today;
  const owe = p.price_vnd != null ? Math.max(0, p.price_vnd - (p.paid_vnd || 0)) : 0;
  const warn = [];
  if (!ended) {
    if (left != null && left <= WARN_SESSIONS) warn.push(left === 0 ? 'hết buổi' : `còn ${left} buổi`);
    if (daysLeft != null && !expired && daysLeft <= WARN_DAYS) warn.push(daysLeft === 0 ? 'hết hạn hôm nay' : `còn ${daysLeft} ngày`);
    if (expired) warn.push(inGrace ? `hết hạn ${-daysLeft} ngày` : 'đã hết hạn');
  }
  return { used, left, daysLeft, expired, inGrace, ended, notStarted, owe, warn,
    usable: !ended && !notStarted && (!expired) && (left == null || left > 0) };
}

/** Gói hiện tại để hiển thị: gói còn hoạt động mới nhất, nếu không có thì gói gần nhất */
export function currentPackage(pkgs, usedById = {}, today) {
  const sorted = [...pkgs].sort((a, b) => b.start_date.localeCompare(a.start_date) || (b.created_at || '').localeCompare(a.created_at || ''));
  return sorted.find((p) => p.status !== 'ended' && p.start_date <= today) || sorted.find((p) => p.status !== 'ended') || sorted[0] || null;
}

/** Gói để trừ khi coach dạy 1 buổi PT: gói theo buổi còn buổi (cũ nhất trước) → gói còn hạn bất kỳ → null */
export function packageForPT(pkgs, usedById = {}, today) {
  const ok = pkgs.filter((p) => p.status !== 'ended' && p.start_date <= today)
    .map((p) => ({ p, s: pkgStatus(p, usedById[p.id] || 0, today) })).filter((x) => !x.s.expired || x.s.inGrace);
  const bySessions = ok.filter((x) => x.p.total_sessions && x.s.left > 0).sort((a, b) => a.p.start_date.localeCompare(b.p.start_date));
  return (bySessions[0] || ok.find((x) => !x.p.total_sessions))?.p || null;
}

/**
 * Khóa app khách: chỉ khi khách CÓ gói và mọi gói có thời hạn đều đã quá hạn hơn 3 ngày (hoặc coach kết thúc gói).
 * Gói không thời hạn (end_date NULL) đang hoạt động → không bao giờ khóa. Khách chưa có gói nào → không khóa.
 * Trả về { locked, graceLeft (số ngày còn trước khi khóa) | null, lastEnd }
 */
export function lockState(pkgs, today) {
  if (!pkgs.length) return { locked: false, graceLeft: null, lastEnd: null };
  const live = pkgs.filter((p) => p.status !== 'ended');
  if (live.some((p) => !p.end_date)) return { locked: false, graceLeft: null, lastEnd: null };
  const ends = live.map((p) => p.end_date).sort();
  const lastEnd = ends[ends.length - 1] || null;
  if (!lastEnd) return { locked: true, graceLeft: null, lastEnd: [...pkgs].map((p) => p.end_date).filter(Boolean).sort().pop() || null };
  const over = daysBetween(lastEnd, today);
  if (over <= 0) return { locked: false, graceLeft: null, lastEnd };
  if (over <= GRACE_DAYS) return { locked: false, graceLeft: GRACE_DAYS - over + 1, lastEnd };
  return { locked: true, graceLeft: null, lastEnd };
}

/** Lý do "cần chú ý" về gói cho bảng tổng nhóm */
export function pkgReasons(pkgs, usedById, today) {
  if (!pkgs.length) return [];
  const lk = lockState(pkgs, today);
  if (lk.locked) return ['app đã khóa (hết gói)'];
  const cur = currentPackage(pkgs, usedById, today);
  if (!cur) return [];
  const s = pkgStatus(cur, usedById[cur.id] || 0, today);
  const r = s.warn.map((w) => `gói ${w}`);
  if (s.owe > 0) r.push(`còn nợ ${fmtVnd(s.owe)}`);
  return r;
}

/** Dòng tóm tắt gói cho khách / coach */
export function pkgLine(p, s) {
  const a = [];
  if (p.total_sessions) a.push(`còn ${s.left}/${p.total_sessions} buổi`);
  else a.push('không giới hạn buổi');
  if (p.end_date) a.push(s.expired ? `hết hạn ${p.end_date.slice(8, 10)}/${p.end_date.slice(5, 7)}` : `đến ${p.end_date.slice(8, 10)}/${p.end_date.slice(5, 7)}${s.daysLeft <= WARN_DAYS ? ` (còn ${s.daysLeft} ngày)` : ''}`);
  else a.push('không thời hạn');
  return a.join(' · ');
}

/** Chế độ "Tập của tôi": coach dùng giao diện khách cho chính mình (lưu trên máy) */
export const SELF_KEY = 'dcoach_self';
export const selfMode = (store = globalThis.localStorage) => { try { return store?.getItem(SELF_KEY) === '1'; } catch { return false; } };
export const setSelfMode = (on, store = globalThis.localStorage) => { try { on ? store.setItem(SELF_KEY, '1') : store.removeItem(SELF_KEY); } catch { /* */ } };
