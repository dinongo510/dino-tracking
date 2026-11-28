// Chạy từ gốc repo: node --test tests/coach/nutrition.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { latestBody, computeTargets, carbFrom, slotTargets, totalsOf, fits, suggestOptions, applyDayPlan, scaleItems, parseFoodCsv, adherenceRange, roundHalf } from '../../coach/js/lib/nutrition.js';

const TODAY = new Date('2026-11-28');
test('cân mới nhất: InBody mới hơn số đo thì lấy InBody; FFM chỉ từ InBody', () => {
  const b = latestBody([{ measured_on: '2026-11-20', weight_kg: 70 }], [{ scanned_on: '2026-11-25', weight_kg: 69.5, ffm_kg: 55 }]);
  assert.deepEqual([b.weightKg, b.ffmKg, b.weightDate], [69.5, 55, '2026-11-25']);
  const b2 = latestBody([{ measured_on: '2026-11-27', weight_kg: 69 }], [{ scanned_on: '2026-11-25', weight_kg: 69.5, ffm_kg: 55 }]);
  assert.deepEqual([b2.weightKg, b2.ffmKg], [69, 55]);
  assert.equal(latestBody([], []).weightKg, null);
});

test('3 khách mẫu: khớp tính tay (Mifflin / Katch)', () => {
  // Nam 30t 175cm 80kg giảm mỡ, ít vận động 1.375: BMR = 800+1093.75-150+5 = 1748.75 → 1749; TDEE 2405; kcal 2405×0.825=1984 → 1980; P 2.2×80=176; F 0.8×80=64; C (1980−704−576)/4=175
  const a = computeTargets({ sex: 'male', dob: '1996-01-01', height_cm: 175, goal: 'fat_loss', activity_factor: 1.375 }, { weightKg: 80 }, TODAY);
  assert.deepEqual([a.formula, a.bmr, a.tdee, a.kcal, a.proteinG, a.fatG, a.carbG], ['mifflin', 1749, 2405, 1980, 176, 64, 175]);
  // Nữ 28t 160cm 55kg tăng cơ 1.55: BMR = 550+1000-140-161 = 1249; TDEE 1936; kcal ×1.075 = 2081 → 2080
  const b = computeTargets({ sex: 'female', dob: '1998-06-01', height_cm: 160, goal: 'muscle_gain', activity_factor: 1.55 }, { weightKg: 55 }, TODAY);
  assert.deepEqual([b.bmr, b.tdee, b.kcal, b.proteinG], [1249, 1936, 2080, 99]);
  // Có InBody FFM 60: Katch = 370 + 21.6×60 = 1666; ×1.725 = 2874; recomp giữ → 2870
  const c = computeTargets({ goal: 'recomp', activity_factor: 1.725 }, { weightKg: 75, ffmKg: 60 }, TODAY);
  assert.deepEqual([c.formula, c.bmr, c.tdee, c.kcal, c.proteinG], ['katch', 1666, 2874, 2870, 150]);
  assert.deepEqual(computeTargets({ goal: 'fat_loss' }, { weightKg: 70 }, TODAY).missing, ['giới tính', 'chiều cao', 'ngày sinh']);
  assert.equal(carbFrom(1980, 176, 64), 175);
});

const F = [
  { id: 'ga', name_vi: 'Ức gà', food_group: 'protein', kcal: 165, protein_g: 31, carb_g: 0, fat_g: 3.6 },
  { id: 'ca', name_vi: 'Cá basa', food_group: 'protein', kcal: 130, protein_g: 18, carb_g: 0, fat_g: 6 },
  { id: 'bo', name_vi: 'Thăn bò', food_group: 'protein', kcal: 200, protein_g: 29, carb_g: 0, fat_g: 9 },
  { id: 'heo', name_vi: 'Thăn heo', food_group: 'protein', kcal: 145, protein_g: 26, carb_g: 0, fat_g: 4 },
  { id: 'com', name_vi: 'Cơm trắng', food_group: 'carb', kcal: 200, protein_g: 4, carb_g: 44, fat_g: 0.4 },
  { id: 'kl', name_vi: 'Khoai lang', food_group: 'carb', kcal: 130, protein_g: 2, carb_g: 30, fat_g: 0.2 },
  { id: 'rau', name_vi: 'Rau luộc', food_group: 'veg', kcal: 30, protein_g: 2, carb_g: 5, fat_g: 0.3 },
];
const byId = new Map(F.map((f) => [f.id, f]));

test('mục tiêu bữa + tổng phương án + ✓/✗', () => {
  const s = slotTargets({ kcal: 2000, protein_g: 150 }, [{ name: 'Sáng', kcal_pct: 30 }, { name: 'Trưa', kcal_pct: 35 }, { name: 'Tối', kcal_pct: 25 }, { name: 'Phụ', kcal_pct: 10 }]);
  assert.deepEqual(s.map((x) => x.kcal), [600, 700, 500, 200]);
  assert.equal(s[1].proteinG, 53);
  const tot = totalsOf([{ food_id: 'ga', qty: 1.5 }, { food_id: 'com', qty: 1.5 }, { food_id: 'rau', qty: 1 }], byId);
  assert.equal(tot.kcal, 578);
  assert.equal(fits(tot, s[1]), false); // 578 < 630
  assert.equal(fits(totalsOf([{ food_id: 'ga', qty: 2 }, { food_id: 'com', qty: 1.5 }, { food_id: 'rau', qty: 1 }], byId), s[1]), true);
});

test('gợi ý phương án: 3 lựa chọn đều ✓, món đạm khác nhau, bước 0,5', () => {
  const slot = { kcal: 700, proteinG: 53 };
  const g = suggestOptions(F, slot);
  assert.equal(g.length, 3);
  assert.ok(g.every((x) => fits(x.tot, slot)));
  assert.equal(new Set(g.map((x) => x.pid)).size, 3);
  assert.ok(g.every((x) => x.items.every((i) => i.qty * 2 === Math.round(i.qty * 2))));
});

test('áp thực đơn mẫu: nhân hệ số, làm tròn 0,5, % bữa theo kcal mẫu', () => {
  assert.equal(roundHalf(0.8), 1); assert.equal(roundHalf(0.2), 0.5); assert.equal(roundHalf(1.74), 1.5);
  assert.deepEqual(scaleItems([{ food_id: 'ga', qty: 1 }], 1.45), [{ food_id: 'ga', qty: 1.5 }]);
  const T = new Map([['t1', { name: 'Sáng A', kcal: 400, items: [{ food_id: 'ga', qty: 1 }] }], ['t2', { name: 'Trưa B', kcal: 600, items: [{ food_id: 'com', qty: 2 }] }]]);
  const r = applyDayPlan({ kcal: 1000, meals: [{ slot: 'trua', template_id: 't2' }, { slot: 'sang', template_id: 't1' }] }, T, 1500);
  assert.deepEqual(r.map((x) => [x.name, x.kcal_pct]), [['Sáng', 40], ['Trưa', 60]]);
  assert.deepEqual(r[1].options[0].items, [{ food_id: 'com', qty: 3 }]);
});

test('dán CSV: 20 món, dấu phẩy thập phân, bỏ tiêu đề, báo lỗi dòng hỏng', () => {
  const lines = ['name_vi;serving;kcal;protein;carb;fat;source', ...Array.from({ length: 20 }, (_, i) => `Món ${i + 1};100 g;${100 + i};10,5;5;2;USDA`), 'Món hỏng;100 g;abc;1;1;1;', ';100 g;50;1;1;1;'];
  const { rows, errors } = parseFoodCsv(lines.join('\n'));
  assert.equal(rows.length, 20);
  assert.equal(rows[0].protein_g, 10.5);
  assert.deepEqual(errors.map((e) => e.reason), ['kcal không hợp lệ', 'thiếu tên']);
});

test('tuân thủ ăn: Đúng 1, Gần 0,5, Lệch 0 trên số bữa × số ngày', () => {
  assert.equal(adherenceRange([{ level: 'on' }, { level: 'near' }, { level: 'off' }, { level: 'on' }], 4, 1), 63);
  assert.equal(adherenceRange([], 4, 7), 0);
  assert.equal(adherenceRange([], 0, 7), null);
});
