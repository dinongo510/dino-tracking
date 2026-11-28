// Chạy từ gốc repo: node --test tests/coach/sessionLog.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRows, rowKind, rowCount, grade, toClock, fromClock, sessionStats, suggestions, queuePut, queueRead, queueDrop, missedLastWeek, weeklyKm } from '../../coach/js/lib/sessionLog.js';
import { runningLoadAlert } from '../../coach/js/lib/formulas.js';

const sq = { id: 'i1', exercise_id: 'sq', sets: 3, reps_min: 8, reps_max: 10, load_kg: 60, progression_rule: { type: 'double', upper_kg: 2.5, lower_kg: 5 } };
const bp = { id: 'i2', exercise_id: 'bp', sets: 3, reps_min: 8, reps_max: 10, load_kg: 40, progression_rule: { type: 'double', upper_kg: 2.5, lower_kg: 5 } };
const run = { id: 'i3', exercise_id: 'z2', sets: 1, distance_m: 5000 };
const S = { blocks: [{ block_type: 'straight', items: [sq, bp] }, { block_type: 'run', items: [run] }] };
const EX = new Map([['sq', { primary_muscles: ['quadriceps'] }], ['bp', { primary_muscles: ['chest'] }], ['z2', { category: 'run' }]]);

test('dòng ghi: điền sẵn reps_min + tải, ghép log đã có, số dòng theo khối', () => {
  const r = buildRows({ block_type: 'straight' }, sq, [{ set_no: 2, reps: 10, load_kg: '62.5', done: true }]);
  assert.equal(r.length, 3);
  assert.deepEqual([r[0].reps, r[0].load_kg, r[0].done], [8, 60, false]);
  assert.deepEqual([r[1].reps, r[1].load_kg, r[1].done], [10, 62.5, true]);
  assert.equal(rowCount({ block_type: 'circuit', rounds: 4 }, { sets: 1 }), 4);
  assert.equal(rowCount({ block_type: 'amrap' }, { sets: 3 }), 1);
  assert.equal(rowKind({ block_type: 'run' }, run, null), 'run');
  assert.equal(rowKind({ block_type: 'corrective' }, { duration_sec: 45 }, null), 'timed');
});

test('so mục tiêu: đạt / vượt / hụt', () => {
  assert.equal(grade(sq, { reps: 9, load_kg: 60 }), 'hit');
  assert.equal(grade(sq, { reps: 7, load_kg: 60 }), 'under');
  assert.equal(grade(sq, { reps: 11, load_kg: 60 }), 'over');
  assert.equal(grade(sq, { reps: 8, load_kg: 62.5 }), 'over');
  assert.equal(grade(sq, { reps: 8, load_kg: 55 }), 'under');
  assert.equal(grade(run, { distance_m: 4000 }), 'under');
  assert.equal(grade(sq, { reps: 8, done: false }), null);
});

test('đồng hồ m:ss', () => {
  assert.equal(toClock(1505), '25:05');
  assert.equal(fromClock('25:05'), 1505);
  assert.equal(fromClock('1:02:00'), 3720);
  assert.equal(fromClock('30'), 1800);
  assert.equal(fromClock(''), null);
  assert.equal(fromClock('ab'), null);
});

test('thống kê + gợi ý: squat đạt đỉnh RPE 8 → +5 kg; đẩy ngực hụt 2 hiệp → −5%', () => {
  const logs = {
    i1: [1, 2, 3].map((n) => ({ set_no: n, reps: 10, load_kg: 60, rpe: 8 })),
    i2: [{ set_no: 1, reps: 8, load_kg: 40 }, { set_no: 2, reps: 6, load_kg: 40 }, { set_no: 3, reps: 5, load_kg: 40 }],
    i3: [{ set_no: 1, distance_m: 5000, duration_sec: 1800 }],
  };
  const st = sessionStats(S, logs, EX);
  assert.equal(st.volume, 1800 + 760);
  assert.equal(st.km, 5);
  assert.deepEqual(st.counts, { hit: 5, over: 0, under: 2 });
  assert.equal(st.best[0].ex, EX.get('sq'));
  const sg = suggestions(S, logs, EX);
  assert.equal(sg.find((x) => x.item.id === 'i1').loadKg, 65);
  assert.equal(sg.find((x) => x.item.id === 'i2').loadKg, 37.5);
  assert.equal(sg.length, 2);
  // không sửa số (điền sẵn reps_min) → giữ tải, không tăng
  const keep = suggestions(S, { i1: [1, 2, 3].map((n) => ({ set_no: n, reps: 8, load_kg: 60 })) }, EX);
  assert.equal(keep[0].change, 0);
});

test('hàng chờ mất mạng: ghi đè cùng hiệp, xóa sau khi đồng bộ', () => {
  const mem = {}; const st = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; } };
  queuePut(st, { block_item_id: 'i1', set_no: 1, reps: 8 });
  queuePut(st, { block_item_id: 'i1', set_no: 1, reps: 9 });
  queuePut(st, { block_item_id: 'i1', set_no: 2, reps: 8 });
  assert.equal(Object.keys(queueRead(st)).length, 2);
  assert.equal(queueRead(st)['i1#1'].reps, 9);
  queueDrop(st, [{ block_item_id: 'i1', set_no: 1 }]);
  assert.deepEqual(Object.keys(queueRead(st)), ['i1#2']);
});

test('cảnh báo phía coach: bỏ buổi, km tăng đột ngột', () => {
  assert.equal(missedLastWeek([{ id: 'a' }, { id: 'b' }, { id: 'c' }], new Set(['a'])).message, 'Bỏ 2/3 buổi tuần trước');
  assert.equal(missedLastWeek([{ id: 'a' }, { id: 'b' }], new Set(['a'])), null);
  const m = ['2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23'];
  const km = weeklyKm([{ day: '2026-10-27', distance_m: 10000 }, { day: '2026-11-03', distance_m: 10000 }, { day: '2026-11-10', distance_m: 10000 },
    { day: '2026-11-17', distance_m: 10000 }, { day: '2026-11-24', distance_m: 8000 }, { day: '2026-11-26', distance_m: 5000 }], m);
  assert.deepEqual(km, [10, 10, 10, 10, 13]);
  assert.equal(runningLoadAlert(km).kind, 'run_load');
});

import { timerPlan } from '../../coach/js/lib/sessionLog.js';
test('đồng hồ khối: circuit làm/nghỉ, EMOM theo phút, AMRAP đếm ngược, for time đếm lên', () => {
  const c = timerPlan({ block_type: 'circuit', rounds: 3, work_sec: 40, rest_sec: 20 });
  assert.equal(c.segments.length, 5);
  assert.deepEqual(c.segments.map((s) => s.label), ['LÀM', 'NGHỈ', 'LÀM', 'NGHỈ', 'LÀM']);
  assert.equal(timerPlan({ block_type: 'emom', time_cap_sec: 600 }).segments.length, 10);
  assert.equal(timerPlan({ block_type: 'amrap', time_cap_sec: 720 }).segments[0].sec, 720);
  const ft = timerPlan({ block_type: 'for_time', time_cap_sec: 900 });
  assert.deepEqual([ft.countUp, ft.cap], [true, 900]);
  assert.equal(timerPlan({ block_type: 'hyrox', rounds: 2 }).countUp, true);
});
