// Chạy: node --test formulas.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../../coach/js/lib/formulas.js';

test('BMR Mifflin nam 30t 80kg 175cm = 1749', () => {
  assert.equal(F.bmrMifflin({ sex: 'male', weightKg: 80, heightCm: 175, age: 30 }), 1749);
});
test('BMR Mifflin nữ 25t 55kg 160cm = 1264', () => {
  assert.equal(F.bmrMifflin({ sex: 'female', weightKg: 55, heightCm: 160, age: 25 }), 1264);
});
test('Katch FFM 60 = 1666; bmrAuto chọn Katch khi có FFM', () => {
  assert.equal(F.bmrKatch({ ffmKg: 60 }), 1666);
  assert.equal(F.bmrAuto({ ffmKg: 60 }).formula, 'katch');
  assert.equal(F.bmrAuto({ sex: 'male', weightKg: 80, heightCm: 175, age: 30 }).formula, 'mifflin');
});
test('Tuổi từ ngày sinh', () => {
  assert.equal(F.ageFromDob('1990-12-01', new Date('2026-11-23')), 35);
  assert.equal(F.ageFromDob('1990-11-23', new Date('2026-11-23')), 36);
});
test('Macro giảm mỡ 80kg TDEE 2700', () => {
  const t = F.nutritionTargets({ tdee: 2700, goal: 'fat_loss', weightKg: 80 });
  assert.equal(t.kcal, 2230);
  assert.equal(t.proteinG, 176);
  assert.ok(t.fatG * 9 >= t.kcal * 0.2 - 9);
  const sum = t.proteinG * 4 + t.fatG * 9 + t.carbG * 4;
  assert.ok(Math.abs(sum - t.kcal) <= 4, `macro cộng lại ${sum} ≈ ${t.kcal}`);
});
test('Chia kcal theo bữa', () => {
  const s = F.splitKcal(2000);
  assert.deepEqual(s.map((x) => x.kcal), [600, 700, 500, 200]);
});
test('Phương án bữa & tuân thủ', () => {
  const tot = F.optionTotals([{ food: { kcal: 165, protein_g: 31 }, qty: 2 }, { food: { kcal: 130, protein_g: 2.7, carb_g: 28 }, qty: 2 }]);
  assert.equal(tot.kcal, 590);
  assert.ok(F.optionFits(tot, 600, 40));
  assert.ok(!F.optionFits(tot, 800, 40));
  assert.equal(F.adherencePct([{ level: 'on' }, { level: 'near' }, { level: 'off' }, { level: 'on' }], 4), 63);
});
test('Điều chỉnh kcal', () => {
  assert.equal(F.kcalAdjustment({ goal: 'fat_loss', avgs: [80, 80.05, 80.02], adherence: 90 }).action, 'decrease');
  assert.equal(F.kcalAdjustment({ goal: 'fat_loss', avgs: [80, 80, 80], adherence: 70 }).action, 'talk');
  assert.equal(F.kcalAdjustment({ goal: 'fat_loss', avgs: [80, 79.5, 78.5], adherence: 90 }).action, 'increase');
  assert.equal(F.kcalAdjustment({ goal: 'fat_loss', avgs: [80, 79.5, 79], adherence: 90 }).action, 'none');
  assert.equal(F.kcalAdjustment({ goal: 'muscle_gain', avgs: [70, 70, 70.05], adherence: 90 }).action, 'increase');
});
test('Cân TB 7 ngày', () => {
  const e = [{ date: '2026-11-15', weightKg: 90 }, { date: '2026-11-17', weightKg: 80 }, { date: '2026-11-23', weightKg: 81 }];
  assert.equal(F.weeklyAvg(e, '2026-11-23'), 80.5);
});
test('1RM, khối lượng, %1RM', () => {
  assert.equal(F.e1rm(100, 5), 116.7);
  assert.equal(F.e1rm(100, 1), 100);
  assert.equal(F.volumeLoad([{ reps: 5, loadKg: 100 }, { reps: 5, loadKg: 100 }]), 1000);
  assert.equal(F.kgFromPct(120, 75), 90);
});
test('Double progression', () => {
  const item = { reps_min: 6, reps_max: 8, load_kg: 100, progression_rule: { type: 'double', upper_kg: 2.5, lower_kg: 5 } };
  const top = [{ reps: 8, loadKg: 100, rpe: 8 }, { reps: 8, loadKg: 100, rpe: 7.5 }, { reps: 8, loadKg: 100 }];
  assert.equal(F.suggestNextLoad({ item, logs: top, primaryMuscles: ['quadriceps'] }).loadKg, 105);
  assert.equal(F.suggestNextLoad({ item, logs: top, primaryMuscles: ['chest'] }).loadKg, 102.5);
  const miss = [{ reps: 5, loadKg: 100 }, { reps: 4, loadKg: 100 }, { reps: 6, loadKg: 100 }];
  assert.equal(F.suggestNextLoad({ item, logs: miss, primaryMuscles: ['chest'] }).loadKg, 95);
  const hard = top.map((l) => ({ ...l, rpe: 9 }));
  assert.equal(F.suggestNextLoad({ item, logs: hard, primaryMuscles: ['chest'] }).loadKg, 100);
});
test('Sinh tuần: linear + deload, DUP, RPE wave', () => {
  const base = { sets: 4, reps_min: 5, reps_max: 5, load_kg: 80, target_rpe: 8 };
  const r = { type: 'linear_weekly', step_kg: 2.5 };
  assert.equal(F.generateWeek({ base, rule: r, week: 3, totalWeeks: 5 }).load_kg, 85);
  const dl = F.generateWeek({ base, rule: r, week: 5, totalWeeks: 5 });
  assert.equal(dl.sets, 2); assert.equal(dl.load_kg, 80); assert.equal(dl.target_rpe, 6);
  const dup = F.generateWeek({ base, rule: { type: 'dup', days: { 2: 'light' } }, week: 1, totalWeeks: 4, dayNo: 2 });
  assert.deepEqual([dup.reps_min, dup.reps_max], [12, 15]);
  assert.equal(F.generateWeek({ base, rule: { type: 'rpe_wave', weeks: [7, 7.5, 8, 6] }, week: 3, totalWeeks: 4, deloadLastWeek: false }).target_rpe, 8);
});
test('Pace & cảnh báo', () => {
  assert.equal(F.pacePerKm(10000, 3000), '5:00');
  assert.equal(F.alertsFromFeedback([{ session_rpe: 9.5, pain: [{ area: 'gối trái', level: 3 }] }, { session_rpe: 10 }]).length, 2);
  assert.ok(F.runningLoadAlert([20, 20, 20, 20, 23]));
  assert.equal(F.runningLoadAlert([20, 20, 20, 20, 21]), null);
  assert.ok(F.missedSessionsAlert(4, 2));
});
