// Chạy từ gốc repo: node --test tests/coach/plan.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, sessionDate, phaseEnd, mondayOf, generateWeeks, templateToTree, treeToTemplate, correctiveFromOhsa, interleaveCompromised, itemSummary, ruleKey, ruleFromKey } from '../../coach/js/lib/plan.js';

test('ngày tháng: cộng ngày qua tháng/năm, ngày buổi tập, thứ Hai', () => {
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(sessionDate('2026-11-30', 1, 1), '2026-11-30');
  assert.equal(sessionDate('2026-11-30', 2, 3), '2026-12-09');
  assert.equal(phaseEnd('2026-11-30', 4), '2026-12-27');
  assert.equal(mondayOf('2026-11-26'), '2026-11-23'); // thứ Năm → thứ Hai
  assert.equal(mondayOf('2026-11-29'), '2026-11-23'); // Chủ nhật → thứ Hai trước đó
  assert.equal(mondayOf('2026-11-23'), '2026-11-23');
});

const W1 = [
  { day_no: 1, title: 'Lower', session_type: 'strength', blocks: [
    { order_no: 1, label: 'A', block_type: 'straight', items: [
      { exercise_id: 'sq', order_no: 1, sets: 4, reps_min: 5, reps_max: 5, load_kg: 80, rest_sec: 180, progression_rule: { type: 'linear_weekly', step_kg: 2.5 } },
      { exercise_id: 'rdl', order_no: 2, sets: 3, reps_min: 8, reps_max: 10, target_rpe: 8, progression_rule: { type: 'rpe_wave', weeks: [7, 7.5, 8, 6] } },
    ] },
    { order_no: 2, label: 'C', block_type: 'circuit', rounds: 4, work_sec: 40, rest_sec: 20, items: [
      { exercise_id: 'kb', order_no: 1, sets: 1, progression_rule: { type: 'none' } },
    ] },
  ] },
  { day_no: 3, title: 'Upper', session_type: 'strength', blocks: [
    { order_no: 1, block_type: 'straight', items: [{ exercise_id: 'bp', order_no: 1, sets: 3, reps_min: 8, reps_max: 10, progression_rule: { type: 'dup', days: { 3: 'light' } } }] },
  ] },
];

test('sinh tuần 2–4: tuyến tính, sóng RPE, DUP, deload tuần cuối, ngày đúng', () => {
  const g = generateWeeks(W1, 4, { phaseStart: '2026-11-30' });
  assert.equal(g.length, 6); // 3 tuần × 2 buổi
  const w3 = g.find((s) => s.week_no === 3 && s.day_no === 1);
  assert.equal(w3.scheduled_on, '2026-12-14');
  assert.equal(w3.blocks[0].items[0].load_kg, 85);         // 80 + 2,5 × 2
  assert.equal(w3.blocks[0].items[1].target_rpe, 8);       // sóng tuần 3
  assert.equal(w3.blocks[1].rounds, 4); assert.equal(w3.blocks[1].work_sec, 40);
  const w4 = g.find((s) => s.week_no === 4 && s.day_no === 1);
  assert.equal(w4.blocks[0].items[0].sets, 2);             // deload: 4 × 0,6
  assert.equal(w4.blocks[0].items[0].load_kg, 80);         // deload về tải tuần 1
  const up = g.find((s) => s.week_no === 2 && s.day_no === 3).blocks[0].items[0];
  assert.deepEqual([up.reps_min, up.reps_max], [12, 15]);  // DUP ngày nhẹ
  assert.equal(W1[0].blocks[0].items[0].load_kg, 80);       // không sửa tuần 1
});
test('không deload khi tắt', () => {
  const g = generateWeeks(W1, 4, { deload: false });
  assert.equal(g.find((s) => s.week_no === 4 && s.day_no === 1).blocks[0].items[0].sets, 4);
});

test('mẫu → cây → mẫu, báo bài thiếu', () => {
  const ex = [{ id: 'e1', name_vi: 'Goblet squat' }, { id: 'e2', name_vi: 'Chạy nhẹ (Zone 2)' }];
  const by = new Map(ex.map((e) => [e.name_vi.toLowerCase(), e]));
  const payload = { name: 'Mẫu', goal: 'fat_loss', model: 'linear', weeks: 4, sessions: [{ day: 1, title: 'A', type: 'strength', blocks: [
    { type: 'straight', label: 'A', items: [{ exercise: 'Goblet squat', sets: 3, reps_min: 8, reps_max: 12, target_rpe: 7, rest_sec: 90, progression_rule: { type: 'double' } }] },
    { type: 'run', items: [{ exercise: 'Chạy nhẹ (Zone 2)', sets: 1, reps_min: 1, reps_max: 1, duration_sec: 1200, hr_zone: 2 }, { exercise: 'Bài không có', sets: 1 }] },
  ] }] };
  const t = templateToTree(payload, by, (s) => s.toLowerCase());
  assert.deepEqual(t.missing, ['Bài không có']);
  assert.equal(t.sessions[0].blocks[0].items[0].exercise_id, 'e1');
  assert.equal(t.sessions[0].blocks[1].items[0].duration_sec, 1200);
  const back = treeToTemplate(t.phase, t.model, t.sessions, new Map(ex.map((e) => [e.id, e])));
  assert.equal(back.sessions[0].blocks[0].items[0].exercise, 'Goblet squat');
  assert.equal(back.sessions[0].blocks[0].items[0].target_rpe, 7);
  assert.equal(back.weeks, 4);
});

test('corrective từ OHSA: đủ 4 bước, ưu tiên bài khớp nhiều lỗi, không trùng', () => {
  const ex = [
    { id: 'i1', name_vi: 'Lăn foam cơ khép', corrective_step: 'inhibit', tags: ['ohsa:knees_in'] },
    { id: 'i2', name_vi: 'Lăn foam bắp chân', corrective_step: 'inhibit', tags: ['ohsa:feet_turn_out'] },
    { id: 'l1', name_vi: 'Giãn gập hông', corrective_step: 'lengthen', tags: ['ohsa:knees_in', 'ohsa:low_back_arch'] },
    { id: 'a1', name_vi: 'Cầu mông', corrective_step: 'activate', tags: ['ohsa:knees_in', 'ohsa:low_back_arch'] },
    { id: 'a2', name_vi: 'Đi ngang với band', corrective_step: 'activate', tags: ['ohsa:knees_in'] },
    { id: 'a3', name_vi: 'Dạng hông nằm nghiêng', corrective_step: 'activate', tags: ['ohsa:knees_in'] },
    { id: 'g1', name_vi: 'Squat với band', corrective_step: 'integrate', tags: ['ohsa:knees_in'] },
  ];
  const it = correctiveFromOhsa({ knees_in: true, low_back_arch: true, arms_forward: false }, ex);
  assert.deepEqual(it.map((x) => x.exercise_id), ['i1', 'l1', 'a1', 'a3', 'g1']);
  assert.equal(it[0].duration_sec, 45); assert.equal(it[2].reps_max, 15);
  assert.deepEqual(correctiveFromOhsa({}, ex), []);
});

test('HYROX: chèn chạy compromised trước mỗi trạm, không nhân đôi', () => {
  const run = { id: 'run' };
  const r = interleaveCompromised([{ exercise_id: 'ski' }, { exercise_id: 'run' }, { exercise_id: 'row' }], run);
  assert.deepEqual(r.map((x) => x.exercise_id), ['run', 'ski', 'run', 'row']);
  assert.equal(r[0].distance_m, 1000);
});

test('tóm tắt bài và quy tắc', () => {
  assert.equal(itemSummary({ sets: 4, reps_min: 6, reps_max: 8, load_kg: 80, target_rpe: 8, rest_sec: 120 }), '4 × 6–8 · 80 kg · RPE 8 · nghỉ 2:00');
  assert.equal(itemSummary({ sets: 1, distance_m: 5000, hr_zone: 2 }), '5 km · vùng tim 2');
  assert.equal(ruleKey({ type: 'dup', days: { 3: 'heavy' } }, 3), 'dup_heavy');
  assert.deepEqual(ruleFromKey('dup_light', 2), { type: 'dup', days: { 2: 'light' } });
  assert.equal(ruleKey(ruleFromKey('linear_pct', 1), 1), 'linear_pct');
});

import { pickNext } from '../../coach/js/lib/plan.js';
test('buổi kế tiếp: hôm nay → tập bù trong tuần → sắp tới; buổi tuần trước không tính tập bù', () => {
  const S = [{ id: 'lw', scheduled_on: '2026-11-20' }, { id: 'mon', scheduled_on: '2026-11-23' }, { id: 'wed', scheduled_on: '2026-11-25' },
    { id: 'fri', scheduled_on: '2026-11-27' }, { id: 'sat', scheduled_on: '2026-11-28' }, { id: 'nmon', scheduled_on: '2026-11-30' }];
  let r = pickNext(S, new Set(['mon']), '2026-11-28');
  assert.equal(r.main.id, 'sat'); assert.equal(r.kind, 'today'); assert.deepEqual(r.missed.map((s) => s.id), ['wed', 'fri']);
  r = pickNext(S, new Set(['mon', 'sat']), '2026-11-28');
  assert.equal(r.main.id, 'wed'); assert.equal(r.kind, 'makeup'); assert.equal(r.doneToday, true);
  r = pickNext(S, new Set(['mon', 'wed', 'fri', 'sat']), '2026-11-28');
  assert.equal(r.main.id, 'nmon'); assert.equal(r.kind, 'upcoming');
  r = pickNext(S, new Set(['mon', 'wed', 'fri', 'sat', 'nmon']), '2026-11-28');
  assert.equal(r.kind, 'none');
  assert.ok(!pickNext(S, new Set(), '2026-11-28').missed.some((s) => s.id === 'lw'));
});
