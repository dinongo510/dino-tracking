// DINO-015 — Unit test cho readiness.js và prehab.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readinessScore, readinessLevel, adjustment } from '../../coach/js/lib/readiness.js';
import { warmupPlan } from '../../coach/js/lib/prehab.js';

const mockExercises = [
  // Inhibit
  { id: 'i_calf', name_vi: 'Lăn foam bắp chân', corrective_step: 'inhibit', tags: ['corrective', 'ohsa:feet_turn_out', 'ohsa:forward_lean'] },
  { id: 'i_add', name_vi: 'Lăn foam cơ khép', corrective_step: 'inhibit', tags: ['corrective', 'ohsa:knees_in'] },
  { id: 'i_tfl', name_vi: 'Lăn foam TFL / IT band', corrective_step: 'inhibit', tags: ['corrective', 'ohsa:knees_in'] },
  { id: 'i_quad', name_vi: 'Lăn foam đùi trước / gập hông', corrective_step: 'inhibit', tags: ['corrective', 'ohsa:forward_lean', 'ohsa:low_back_arch'] },
  { id: 'i_lat', name_vi: 'Lăn foam cơ xô', corrective_step: 'inhibit', tags: ['corrective', 'ohsa:low_back_arch', 'ohsa:arms_forward'] },
  { id: 'i_thor', name_vi: 'Lăn foam lưng trên', corrective_step: 'inhibit', tags: ['corrective', 'ohsa:arms_forward'] },
  // Lengthen
  { id: 'l_calf', name_vi: 'Giãn bắp chân', corrective_step: 'lengthen', tags: ['corrective', 'ohsa:feet_turn_out', 'ohsa:forward_lean'] },
  { id: 'l_add', name_vi: 'Giãn cơ khép (lunge ngang)', corrective_step: 'lengthen', tags: ['corrective', 'ohsa:knees_in'] },
  { id: 'l_hip', name_vi: 'Giãn gập hông quỳ một gối', corrective_step: 'lengthen', tags: ['corrective', 'ohsa:knees_in', 'ohsa:forward_lean', 'ohsa:low_back_arch'] },
  { id: 'l_pec', name_vi: 'Giãn ngực ở khung cửa', corrective_step: 'lengthen', tags: ['corrective', 'ohsa:arms_forward'] },
  // Activate
  { id: 'a_calf', name_vi: 'Nhón gót một chân', corrective_step: 'activate', tags: ['corrective', 'ohsa:feet_turn_out'] },
  { id: 'a_tube', name_vi: 'Đi ngang với band', corrective_step: 'activate', tags: ['corrective', 'ohsa:knees_in'] },
  { id: 'a_abd', name_vi: 'Dạng hông nằm nghiêng', corrective_step: 'activate', tags: ['corrective', 'ohsa:knees_in'] },
  { id: 'a_bridge', name_vi: 'Cầu mông', corrective_step: 'activate', tags: ['corrective', 'ohsa:knees_in', 'ohsa:forward_lean', 'ohsa:low_back_arch'] },
  { id: 'a_cobra', name_vi: 'Nâng ngực nằm sấp (cobra)', corrective_step: 'activate', tags: ['corrective', 'ohsa:arms_forward'] },
  // Integrate
  { id: 'g_squat', name_vi: 'Squat tựa bóng vào tường', corrective_step: 'integrate', tags: ['corrective', 'ohsa:feet_turn_out', 'ohsa:knees_in', 'ohsa:forward_lean'] },
  { id: 'g_band', name_vi: 'Squat với band quanh gối', corrective_step: 'integrate', tags: ['corrective', 'ohsa:knees_in'] },
  { id: 'g_step', name_vi: 'Bước bục giữ thăng bằng', corrective_step: 'integrate', tags: ['corrective', 'ohsa:feet_turn_out', 'ohsa:knees_in'] },
  { id: 'g_row', name_vi: 'Squat kết hợp kéo cáp', corrective_step: 'integrate', tags: ['corrective', 'ohsa:low_back_arch', 'ohsa:arms_forward'] },
];

test('readinessScore: tính điểm chuẩn hóa 0–100 từ 4 tiêu chí (đảo chiều soreness, stress)', () => {
  // Điểm hoàn hảo: ngủ 5, năng lượng 5, không mỏi 1, không stress 1 -> 100
  assert.equal(readinessScore({ sleep: 5, energy: 5, soreness: 1, stress: 1 }), 100);

  // Điểm tệ nhất: ngủ 1, năng lượng 1, rất mỏi 5, rất stress 5 -> 0
  assert.equal(readinessScore({ sleep: 1, energy: 1, soreness: 5, stress: 5 }), 0);

  // Điểm trung bình: tất cả 3 -> 50
  assert.equal(readinessScore({ sleep: 3, energy: 3, soreness: 3, stress: 3 }), 50);

  // Điểm tốt khá: ngủ 4, năng lượng 4, mỏi 2, stress 2 -> 75
  assert.equal(readinessScore({ sleep: 4, energy: 4, soreness: 2, stress: 2 }), 75);
});

test('readinessLevel: 3 mức green / yellow / red với mốc biên 50, 70 và có đau thì thành red', () => {
  // Case biên 70:
  assert.equal(readinessLevel(70, []), 'green');
  assert.equal(readinessLevel(69, []), 'yellow');

  // Case biên 50:
  assert.equal(readinessLevel(50, []), 'yellow');
  assert.equal(readinessLevel(49, []), 'red');

  // Có vùng đau -> luôn là red kể cả điểm cao
  assert.equal(readinessLevel(95, ['Gối trái']), 'red');
  assert.equal(readinessLevel(100, ['Lưng dưới']), 'red');
});

test('adjustment: gợi ý đúng từng chữ theo level', () => {
  assert.equal(adjustment('green'), 'Tập như kế hoạch');
  assert.equal(adjustment('yellow'), 'Giảm 1 hiệp ở bài chính, RPE mục tiêu −1');
  assert.equal(adjustment('red'), 'Buổi nhẹ: giữ kỹ thuật, bỏ hiệp nặng nhất / thay bằng mobility — nhắn Coach nếu đau');
});

test('warmupPlan: có OHSA knees_in -> có bài tag ohsa:knees_in ở bước activate', () => {
  const plan = warmupPlan({
    ohsa: { knees_in: true },
    sessionType: 'lower',
    pain: [],
    exercises: mockExercises,
  });

  const actStep = plan.find((s) => s.step === 'activate');
  assert.ok(actStep, 'Phải có bước activate');
  assert.ok(actStep.items.length > 0, 'Phải có bài trong activate');
  const hasKneesIn = actStep.items.some((it) => (it.tags || []).includes('ohsa:knees_in'));
  assert.ok(hasKneesIn, 'Bước activate phải có bài mang tag ohsa:knees_in');
});

test('warmupPlan: không OHSA + run -> bộ khởi động chung cho chạy', () => {
  const plan = warmupPlan({
    ohsa: {},
    sessionType: 'run',
    pain: [],
    exercises: mockExercises,
  });

  assert.equal(plan.length, 4, 'Đủ 4 bước continuum');
  // Bước inhibit cho chạy có bài bắp chân
  const inh = plan.find((s) => s.step === 'inhibit');
  assert.ok(inh.items.some((it) => it.name_vi.includes('bắp chân') || it.name_vi.includes('đùi')));
});

test('warmupPlan: tổng thời lượng luôn nằm trong khoảng 5–8 phút (300–480 giây)', () => {
  const testCases = [
    { ohsa: { knees_in: true, feet_turn_out: true }, sessionType: 'strength', pain: [] },
    { ohsa: {}, sessionType: 'run', pain: [] },
    { ohsa: { arms_forward: true }, sessionType: 'upper', pain: ['Vai trái'] },
    { ohsa: {}, sessionType: 'hyrox', pain: [] },
  ];

  for (const tc of testCases) {
    const plan = warmupPlan({ ...tc, exercises: mockExercises });
    const totalSec = plan.reduce((s, p) => s + p.sec, 0);
    assert.ok(totalSec >= 300, `Tổng giây ${totalSec} phải >= 300s (5 phút) cho case ${JSON.stringify(tc)}`);
    assert.ok(totalSec <= 480, `Tổng giây ${totalSec} phải <= 480s (8 phút) cho case ${JSON.stringify(tc)}`);
  }
});

test('warmupPlan: có vùng đau -> thêm bài tập giải tỏa vùng đau', () => {
  const planNoPain = warmupPlan({
    ohsa: {},
    sessionType: 'strength',
    pain: [],
    exercises: mockExercises,
  });

  const planWithPain = warmupPlan({
    ohsa: {},
    sessionType: 'strength',
    pain: ['Gối trái'],
    exercises: mockExercises,
  });

  const totalItemsNoPain = planNoPain.reduce((n, s) => n + s.items.length, 0);
  const totalItemsWithPain = planWithPain.reduce((n, s) => n + s.items.length, 0);

  assert.ok(totalItemsWithPain >= totalItemsNoPain, 'Có đau phải có ít nhất bằng hoặc nhiều bài hơn');
  // Phải có bài liên quan đến gối (knees_in / feet_turn_out)
  const allItems = planWithPain.flatMap((s) => s.items);
  const matchesPain = allItems.some((it) => (it.tags || []).includes('ohsa:knees_in'));
  assert.ok(matchesPain, 'Phải có bài chứa tag giải tỏa cho gối');
});
