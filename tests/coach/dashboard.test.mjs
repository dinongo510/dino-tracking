// Chạy từ gốc repo: node --test tests/coach/dashboard.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rangeStart, mondaysBetween, phaseMarkers, weightSeries, logRows, autoTracked, e1rmWeekly, volumeByMuscle, runWeekly,
  adherenceWeekly, weightTrend, groupRow, sortByAttention, toCsv, crc32, zipStore, exportName,
} from '../../coach/js/lib/dashboard.js';
import { niceScale, lineChart, barChart, fmtPace } from '../../coach/js/lib/charts.js';

const TODAY = '2026-11-28'; // T7
const L = (id, day, reps, kg, extra = {}) => ({ block_item_id: id, reps, load_kg: kg, done: true, logged_at: `${day}T10:00:00`, ...extra });

test('bộ lọc thời gian + tuần + mốc giai đoạn', () => {
  const phases = [{ id: 'p1', status: 'done', order_no: 1, start_date: '2026-09-01', end_date: '2026-10-26' }, { id: 'p2', status: 'published', order_no: 2, start_date: '2026-11-23', end_date: '2026-12-20' }, { id: 'p3', status: 'draft', order_no: 3, start_date: '2026-12-21' }];
  assert.equal(rangeStart('phase', TODAY, phases), '2026-11-23');
  assert.equal(rangeStart('3m', TODAY, phases), '2026-08-30');
  assert.equal(rangeStart('all', TODAY, phases, '2026-08-15'), '2026-08-15');
  assert.equal(rangeStart('phase', TODAY, []), '2026-11-01');                   // chưa có giai đoạn → 4 tuần
  assert.deepEqual(mondaysBetween('2026-11-12', TODAY), ['2026-11-09', '2026-11-16', '2026-11-23']);
  assert.deepEqual(phaseMarkers(phases, '2026-08-30', TODAY), [{ x: '2026-09-01', label: 'GĐ1' }, { x: '2026-11-23', label: 'GĐ2' }]); // bỏ nháp
});

test('cân: từng lần + TB 7 ngày (tính cả lần cân trước khoảng xem) — đối chiếu tay', () => {
  const m = [{ measured_on: '2026-11-20', weight_kg: 84 }, { measured_on: '2026-11-24', weight_kg: 83.6 }, { measured_on: '2026-11-26', weight_kg: 83.2 }, { measured_on: '2026-11-27', waist_cm: 85 }];
  const w = weightSeries(m, '2026-11-23', TODAY);
  assert.deepEqual(w.points.map((p) => p.y), [83.6, 83.2]);
  assert.equal(w.avg7[0].y, 83.8);   // (84 + 83,6) / 2
  assert.equal(w.avg7[1].y, 83.6);   // (84 + 83,6 + 83,2) / 3
  const t = weightTrend([{ measured_on: '2026-11-13', weight_kg: 85 }, { measured_on: '2026-11-14', weight_kg: 84.8 }, ...m], TODAY);
  assert.equal(t.now, 83.4); assert.equal(t.diff, -1.5); assert.equal(t.arrow, '▼'); // TB 08–14/11 = 84,9 → TB 22–28/11 = 83,4
  assert.equal(weightTrend([], TODAY).arrow, null);
});

test('sức mạnh: 1RM Epley cao nhất mỗi tuần, bài tự chọn, khối lượng theo nhóm cơ', () => {
  const items = [{ id: 'iSq', exercise_id: 'sq' }, { id: 'iBp', exercise_id: 'bp' }, { id: 'iRow', exercise_id: 'row' }, { id: 'iCurl', exercise_id: 'curl' }, { id: 'iRun', exercise_id: 'z2', hr_zone: 2 }];
  const logs = [
    L('iSq', '2026-11-17', 5, 100), L('iSq', '2026-11-17', 8, 90), L('iSq', '2026-11-24', 5, 105),
    L('iBp', '2026-11-18', 8, 60), L('iBp', '2026-11-25', 8, 62.5), L('iRow', '2026-11-25', 10, 50),
    L('iCurl', '2026-11-25', 12, 10), L('iSq', '2026-11-25', 5, 999, { done: false }),
    { block_item_id: 'iRun', distance_m: 5000, duration_sec: 1800, done: true, logged_at: '2026-11-19T06:00:00' },
    { block_item_id: 'iRun', distance_m: 8000, duration_sec: 2640, done: true, logged_at: '2026-11-26T06:00:00' },
  ];
  const rows = logRows(logs, items);
  assert.equal(rows.length, 9);                                        // hiệp done:false bị bỏ
  const mondays = ['2026-11-16', '2026-11-23'];
  assert.deepEqual(autoTracked(rows, 2), ['sq', 'bp']);
  const e = e1rmWeekly(rows, ['sq'], mondays)[0].points.map((p) => p.y);
  assert.deepEqual(e, [116.7, 122.5]);                                  // max(100×(1+5/30), 90×(1+8/30)=114) ; 105×1,1667
  const ex = new Map([['sq', { primary_muscles: ['quadriceps'] }], ['bp', { primary_muscles: ['chest'] }], ['row', { primary_muscles: ['middle back'] }], ['curl', { primary_muscles: ['biceps'] }]]);
  const v = volumeByMuscle(rows, ex, mondays, 2);
  assert.deepEqual(v.map((s) => s.name), ['Đùi trước', 'Ngực', 'Khác']); // 1220+525 · 480+500 · lưng 500 + tay 120 gộp "Khác"
  assert.deepEqual(v[0].values, [1220, 525]);
});

test('khối lượng: 2 nhóm lớn nhất + Khác, cộng đúng từng tuần', () => {
  const items = [{ id: 'a', exercise_id: 'sq' }, { id: 'b', exercise_id: 'bp' }, { id: 'c', exercise_id: 'curl' }];
  const rows = logRows([L('a', '2026-11-17', 10, 100), L('a', '2026-11-24', 10, 100), L('b', '2026-11-24', 10, 60), L('c', '2026-11-24', 10, 10)], items);
  const ex = new Map([['sq', { primary_muscles: ['quadriceps'] }], ['bp', { primary_muscles: ['chest'] }], ['curl', { primary_muscles: ['biceps'] }]]);
  const v = volumeByMuscle(rows, ex, ['2026-11-16', '2026-11-23'], 2);
  assert.deepEqual(v, [{ name: 'Đùi trước', values: [1000, 1000] }, { name: 'Ngực', values: [0, 600] }, { name: 'Khác', values: [0, 100], color: '#8a8a93' }]);
});

test('chạy: km/tuần, pace easy, % tuân thủ theo tuần', () => {
  const rows = logRows([{ block_item_id: 'r', distance_m: 5000, duration_sec: 1800, logged_at: '2026-11-19T06:00:00' }, { block_item_id: 't', distance_m: 3000, duration_sec: 840, logged_at: '2026-11-20T06:00:00' },
    { block_item_id: 'r', distance_m: 8000, duration_sec: 2640, logged_at: '2026-11-26T06:00:00' }], [{ id: 'r', exercise_id: 'z2', hr_zone: 2 }, { id: 't', exercise_id: 'tempo', hr_zone: 4 }]);
  const r = runWeekly(rows, ['2026-11-16', '2026-11-23']);
  assert.deepEqual(r.km, [8, 8]);
  assert.equal(r.easyOnly, true);
  assert.deepEqual(r.pace.map((p) => p.y), [360, 330]);                // 6:00 và 5:30 /km — buổi tempo vùng 4 không tính
  assert.equal(fmtPace(330), '5:30');
  const sessions = [{ id: 's1', scheduled_on: '2026-11-17' }, { id: 's2', scheduled_on: '2026-11-19' }, { id: 's3', scheduled_on: '2026-11-24' }, { id: 's4', scheduled_on: '2026-12-01' }];
  const checks = [{ check_date: '2026-11-24', level: 'on' }, { check_date: '2026-11-25', level: 'near' }];
  const a = adherenceWeekly({ sessions, doneIds: new Set(['s1']), checks, slotsCount: 1, mondays: ['2026-11-16', '2026-11-23', '2026-11-30'], today: TODAY });
  assert.deepEqual(a.sessions, [50, 0, null]);
  assert.equal(a.eat[0], 0); assert.equal(a.eat[2], null);
});

test('bảng tổng nhóm: cảnh báo → tuân thủ thấp → lâu chưa check-in; tạm dừng xuống cuối', () => {
  const base = { today: TODAY, slotsCount: 1, checks: Array.from({ length: 7 }, (_, i) => ({ check_date: `2026-11-${22 + i}`, level: 'on' })) };
  const ss = (id, done) => ({ sessions: [{ id: id + 'a', scheduled_on: '2026-11-24' }, { id: id + 'b', scheduled_on: '2026-11-26' }], doneIds: new Set(done.map((d) => id + d)) });
  const rows = [
    groupRow({ ...base, client: { id: 'ok', full_name: 'An', status: 'active' }, ...ss('ok', ['a', 'b']), lastCheckin: '2026-11-23' }),
    groupRow({ ...base, client: { id: 'low', full_name: 'Bình', status: 'active' }, ...ss('low', []), lastCheckin: '2026-11-23' }),
    groupRow({ ...base, client: { id: 'old', full_name: 'Chi', status: 'active' }, ...ss('old', ['a', 'b']), lastCheckin: '2026-11-09' }),
    groupRow({ ...base, client: { id: 'al', full_name: 'Dũng', status: 'active' }, ...ss('al', ['a', 'b']), alerts: 2, lastCheckin: '2026-11-23' }),
    groupRow({ ...base, client: { id: 'pz', full_name: 'Em', status: 'paused' }, ...ss('pz', []), alerts: 1 }),
  ];
  assert.deepEqual(sortByAttention(rows).map((r) => r.id), ['al', 'low', 'old', 'ok', 'pz']);
  const low = rows[1];
  assert.equal(low.trainPct, 0); assert.equal(low.eatPct, 100);
  assert.deepEqual(rows[2].reasons, ['19 ngày chưa check-in']);
  assert.deepEqual(rows[3].reasons, ['2 cảnh báo']);
});

test('CSV có BOM UTF-8, thoát dấu phẩy/ngoặc kép, gộp zip đúng chuẩn', () => {
  const csv = toCsv([{ a: 'Phở bò, tái', b: 'nói "hi"', c: null }, { a: 'x', d: { k: 1 } }]);
  assert.ok(csv.startsWith('﻿a,b,c,d\r\n'));
  assert.ok(csv.includes('"Phở bò, tái","nói ""hi""",,'));
  assert.ok(csv.includes('x,,,"{""k"":1}"'));
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  const z = zipStore([{ name: 'a.csv', text: 'xin chào' }, { name: 'b.csv', text: '' }]);
  const dv = new DataView(z.buffer);
  assert.equal(dv.getUint32(0, true), 0x04034b50);
  assert.equal(dv.getUint32(z.length - 22, true), 0x06054b50);
  assert.equal(dv.getUint16(z.length - 12, true), 2);
  assert.equal(exportName('Nguyễn Văn Đức', TODAY), 'dino-coach_nguyen-van-duc_2026-11-28.zip');
});

test('biểu đồ SVG: điểm mang số liệu thô, trục y tròn, rỗng thì báo', () => {
  assert.deepEqual(niceScale(83.2, 84.1).ticks, [83, 83.5, 84, 84.5]);
  const h = lineChart({ id: 'w', title: 'Cân nặng', unit: 'kg', from: '2026-11-23', to: TODAY, series: [{ name: 'Cân', points: [{ x: '2026-11-24', y: 83.6 }, { x: '2026-11-26', y: 83.2 }] }], markers: [{ x: '2026-11-25', label: 'GĐ2' }] });
  assert.ok(h.includes('data-chart="w"') && h.includes('data-v="83.6"') && h.includes('data-v="83.2"') && h.includes('GĐ2'));
  assert.ok(lineChart({ title: 'X', series: [{ name: 'a', points: [] }] }).includes('Chưa có dữ liệu'));
  // 1 điểm của đường không chấm (TB 7 ngày) vẫn hiện; 1 bài 1RM vẫn có chú thích tên bài
  const one = lineChart({ title: 'C', series: [{ name: 'TB', points: [{ x: '2026-11-25', y: 83.5 }], dots: false }], legend: true });
  assert.ok(/r="3"[^>]*data-v="83.5"/.test(one) && one.includes('class="legend"') && one.includes('TB'));
  assert.ok(!lineChart({ title: 'C', series: [{ name: 'TB', points: [{ x: '2026-11-25', y: 1 }] }] }).includes('class="legend"'));
  const b = barChart({ id: 'ad', title: 'Tuân thủ', unit: '%', labels: ['2026-11-16', '2026-11-23'], series: [{ name: 'Buổi', values: [50, 100] }], max: 100 });
  assert.ok(b.includes('data-v="100"') && b.includes('>100</text>') && !b.includes('>125</text>'));
});
