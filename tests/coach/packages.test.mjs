// Chạy từ gốc repo: node --test tests/coach/packages.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, endAfterMonths, fmtVnd, parseVnd, autoName, pkgStatus, currentPackage, packageForPT, lockState, pkgReasons, pkgLine, selfMode, setSelfMode } from '../../coach/js/lib/packages.js';
import { groupRow, sortByAttention } from '../../coach/js/lib/dashboard.js';

const T = '2026-11-28';
const P = (id, o) => ({ id, client_id: 'a', status: 'active', start_date: '2026-11-01', end_date: null, total_sessions: null, price_vnd: null, paid_vnd: 0, ...o });

test('ngày hết hạn theo tháng + tiền Việt', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(endAfterMonths('2026-11-28', 1), '2026-12-27');
  assert.equal(endAfterMonths('2026-11-01', 3), '2027-01-31');
  assert.equal(fmtVnd(3000000), '3.000.000 đ');
  assert.deepEqual(['3tr', '3,5tr', '500k', '3.000.000', '2 500 000đ', '', 'abc'].map(parseVnd), [3000000, 3500000, 500000, 3000000, 2500000, null, null]);
  assert.equal(autoName(P('x', { total_sessions: 12, start_date: '2026-11-01', end_date: '2026-12-31' })), '12 buổi · 2 tháng');
  assert.equal(autoName(P('x', {})), 'không giới hạn');
});

test('trạng thái gói: còn buổi, sắp hết hạn, ân hạn 3 ngày, còn nợ', () => {
  const s = pkgStatus(P('p', { total_sessions: 12, end_date: '2026-12-03', price_vnd: 3000000, paid_vnd: 2000000 }), 10, T);
  assert.deepEqual([s.left, s.daysLeft, s.expired, s.owe, s.usable], [2, 5, false, 1000000, true]);
  assert.deepEqual(s.warn, ['còn 2 buổi', 'còn 5 ngày']);
  assert.equal(pkgLine(P('p', { total_sessions: 12, end_date: '2026-12-03' }), s), 'còn 2/12 buổi · đến 03/12 (còn 5 ngày)');
  const g = pkgStatus(P('p', { end_date: '2026-11-26' }), 0, T);
  assert.deepEqual([g.expired, g.inGrace, g.usable], [true, true, false]);
  assert.deepEqual(g.warn, ['hết hạn 2 ngày']);
  assert.equal(pkgStatus(P('p', { total_sessions: 5 }), 5, T).usable, false);
});

test('trừ buổi PT: gói theo buổi còn buổi (cũ trước) → gói không giới hạn → không có', () => {
  const a = P('a', { total_sessions: 4, start_date: '2026-10-01' }), b = P('b', { total_sessions: 12, start_date: '2026-11-20' }), c = P('c', { end_date: '2026-12-31' });
  assert.equal(packageForPT([a, b, c], { a: 2 }, T).id, 'a');
  assert.equal(packageForPT([a, b, c], { a: 4 }, T).id, 'b');
  assert.equal(packageForPT([a, c], { a: 4 }, T).id, 'c');
  assert.equal(packageForPT([P('f', { total_sessions: 4, start_date: '2026-12-01' })], {}, T), null);   // chưa bắt đầu
  assert.equal(packageForPT([{ ...a, status: 'ended' }], {}, T), null);
  assert.equal(currentPackage([a, b, c], {}, T).id, 'b');
});

test('khóa app: chỉ khi có gói và mọi gói có hạn đã quá 3 ngày; không thời hạn thì không khóa', () => {
  assert.deepEqual(lockState([], T), { locked: false, graceLeft: null, lastEnd: null });
  assert.equal(lockState([P('a', { end_date: '2026-11-28' })], T).locked, false);                      // hôm nay là ngày cuối
  assert.deepEqual(lockState([P('a', { end_date: '2026-11-27' })], T), { locked: false, graceLeft: 3, lastEnd: '2026-11-27' });
  assert.deepEqual(lockState([P('a', { end_date: '2026-11-25' })], T), { locked: false, graceLeft: 1, lastEnd: '2026-11-25' });
  assert.deepEqual(lockState([P('a', { end_date: '2026-11-24' })], T), { locked: true, graceLeft: null, lastEnd: '2026-11-24' });
  assert.equal(lockState([P('a', { end_date: '2026-11-01' }), P('b', { end_date: '2026-12-31' })], T).locked, false);   // đã gia hạn
  assert.equal(lockState([P('a', { end_date: '2026-11-01' }), P('b', {})], T).locked, false);                          // có gói không thời hạn
  assert.equal(lockState([P('a', { status: 'ended' })], T).locked, true);                                              // coach kết thúc gói cuối
});

test('bảng tổng nhóm: gói sắp hết xếp ngay sau cảnh báo', () => {
  const pk = [P('x', { client_id: 'b', total_sessions: 10 })];
  assert.deepEqual(pkgReasons(pk, { x: 9 }, T), ['gói còn 1 buổi']);
  assert.deepEqual(pkgReasons([P('y', { end_date: '2026-11-01' })], {}, T), ['app đã khóa (hết gói)']);
  const base = { today: T, lastCheckin: '2026-11-27', checks: [], slotsCount: 0 };
  const rows = [groupRow({ ...base, client: { id: 'ok', full_name: 'A', status: 'active' } }),
    groupRow({ ...base, client: { id: 'pk', full_name: 'B', status: 'active', coach_mode: 'offline' }, pkg: ['gói còn 1 buổi'] }),
    groupRow({ ...base, client: { id: 'al', full_name: 'C', status: 'active' }, alerts: 1 })];
  assert.deepEqual(sortByAttention(rows).map((r) => r.id), ['al', 'pk', 'ok']);
  assert.equal(rows[1].mode, 'offline');
  assert.deepEqual(rows[1].reasons, ['gói còn 1 buổi']);
});

test('chế độ "Tập của tôi" lưu trên máy', () => {
  const m = new Map(), store = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
  assert.equal(selfMode(store), false); setSelfMode(true, store); assert.equal(selfMode(store), true); setSelfMode(false, store); assert.equal(selfMode(store), false);
});
