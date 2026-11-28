// Chạy từ gốc repo: node --test tests/coach/checkin.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkinWeekFor, weekAvgs, weekStats, kcalProposal, phaseReport, reportOpen } from '../../coach/js/lib/checkin.js';

test('tuần cần check-in: T7/CN tuần này, T2/T3 tuần trước nếu thiếu, ngày khác không', () => {
  assert.equal(checkinWeekFor('2026-11-28'), '2026-11-23'); // T7
  assert.equal(checkinWeekFor('2026-11-29'), '2026-11-23'); // CN
  assert.equal(checkinWeekFor('2026-11-28', new Set(['2026-11-23'])), null);
  assert.equal(checkinWeekFor('2026-11-30'), '2026-11-23'); // T2 → tuần trước
  assert.equal(checkinWeekFor('2026-12-01', new Set(['2026-11-23'])), null);
  assert.equal(checkinWeekFor('2026-11-26'), null); // T5
});

test('cân TB từng tuần + % tuần', () => {
  const ms = [{ measured_on: '2026-11-10', weight_kg: 71 }, { measured_on: '2026-11-12', weight_kg: 70 }, { measured_on: '2026-11-18', weight_kg: 70 }, { measured_on: '2026-11-25', weight_kg: 69.4 }, { measured_on: '2026-11-27', weight_kg: 69.6 }];
  assert.deepEqual(weekAvgs(ms, ['2026-11-09', '2026-11-16', '2026-11-23']), [70.5, 70, 69.5]);
  const st = weekStats({ sessions: [{ id: 'a', scheduled_on: '2026-11-23' }, { id: 'b', scheduled_on: '2026-11-25' }, { id: 'c', scheduled_on: '2026-11-27' }, { id: 'd', scheduled_on: '2026-11-29' }],
    doneIds: new Set(['a', 'c']), checks: [{ check_date: '2026-11-23', level: 'on' }, { check_date: '2026-11-24', level: 'near' }], slotsCount: 1, weekStart: '2026-11-23', today: '2026-11-28' });
  assert.equal(st.sessionsPct, 67); // 2/3 (buổi CN chưa tới)
  assert.equal(st.eatPct, 25);      // 1,5 / (1 bữa × 6 ngày)
});

test('đề xuất kcal (UAT 012): cân đứng 2 tuần + tuân thủ 90% → −150; tuân thủ 70% → cần trao đổi', () => {
  const target = { kcal: 1900, protein_g: 130, fat_g: 52, carb_g: 228 };
  const p = kcalProposal({ goal: 'fat_loss', avgs: [70.0, 70.05, 70.02], adherence: 90, target });
  assert.equal(p.deltaKcal, -150); assert.equal(p.reason, 'Cân đứng 2 tuần');
  assert.deepEqual(p.next, { kcal: 1750, protein_g: 130, fat_g: 52, carb_g: 191 });
  const q = kcalProposal({ goal: 'fat_loss', avgs: [70, 70, 70], adherence: 70, target });
  assert.equal(q.action, 'talk'); assert.equal(q.next, null);
  assert.equal(kcalProposal({ goal: 'fat_loss', avgs: [70, null, 69], adherence: 90, target }).reason, 'Chưa đủ 3 tuần dữ liệu cân');
});

test('báo cáo giai đoạn: so sánh đầu–cuối, ảnh 2 mốc, top tăng 1RM, km, tuân thủ, nhắc thiếu dữ liệu', () => {
  const phase = { start_date: '2026-11-02', end_date: '2026-11-29' };
  const r = phaseReport({
    phase, today: '2026-11-28',
    measurements: [{ measured_on: '2026-10-30', weight_kg: 72, waist_cm: 84 }, { measured_on: '2026-11-15', weight_kg: 71 }, { measured_on: '2026-11-27', weight_kg: 70.1, waist_cm: 81.5 }],
    scans: [{ scanned_on: '2026-11-02', smm_kg: 30, pbf_pct: 24, ffm_kg: 54.7 }, { scanned_on: '2026-11-28', smm_kg: 30.6, pbf_pct: 22.1, ffm_kg: 54.6 }],
    photos: [{ taken_on: '2026-11-02', angle: 'front', storage_path: 'a' }, { taken_on: '2026-11-02', angle: 'side', storage_path: 'b' }, { taken_on: '2026-11-27', angle: 'front', storage_path: 'c' }],
    sessions: [{ id: 's1', week_no: 1, scheduled_on: '2026-11-02' }, { id: 's2', week_no: 2, scheduled_on: '2026-11-09' }, { id: 's3', week_no: 3, scheduled_on: '2026-11-16' }, { id: 's4', week_no: 4, scheduled_on: '2026-11-23' }, { id: 's5', week_no: 4, scheduled_on: '2026-11-29' }],
    doneIds: new Set(['s1', 's2', 's4']),
    logs: [{ exercise_id: 'sq', week_no: 1, reps: 10, load_kg: 60 }, { exercise_id: 'sq', week_no: 4, reps: 8, load_kg: 70 }, { exercise_id: 'bp', week_no: 1, reps: 8, load_kg: 40 }, { exercise_id: 'bp', week_no: 3, reps: 8, load_kg: 42.5 },
      { exercise_id: 'z2', week_no: 2, distance_m: 5000 }, { exercise_id: 'z2', week_no: 3, distance_m: 6200 }],
    exById: new Map([['sq', { name_vi: 'Squat' }], ['bp', { name_vi: 'Đẩy ngực' }]]),
    checks: Array.from({ length: 20 }, (_, i) => ({ check_date: `2026-11-${String(i + 2).padStart(2, '0')}`, level: 'on' })), slotsCount: 1,
  });
  assert.deepEqual(r.body.find((x) => x.label === 'Cân nặng'), { label: 'Cân nặng', unit: 'kg', start: 72, end: 70.1, diff: -1.9, better: null });
  assert.equal(r.body.find((x) => x.label === 'Vòng eo').diff, -2.5);
  assert.equal(r.body.find((x) => x.label === 'Mỡ (PBF)').diff, -1.9);
  assert.deepEqual([r.photos.start.storage_path, r.photos.end.storage_path], ['a', 'c']);
  assert.deepEqual(r.topGains.map((g) => [g.name, g.from, g.to]), [['Squat', 80, 88.7], ['Đẩy ngực', 50.7, 53.8]]);
  assert.equal(r.km, 11.2);
  assert.deepEqual([r.sessionsDone, r.sessionsDue, r.sessionsTotal], [3, 4, 5]);
  assert.equal(r.eatPct, 74); // 20 / 27 ngày
  assert.deepEqual(r.missing, []);
  const r2 = phaseReport({ phase, today: '2026-11-28', measurements: [{ measured_on: '2026-11-02', weight_kg: 72 }] });
  assert.deepEqual(r2.missing, ['số đo / cân cuối giai đoạn', 'ảnh tiến độ cuối giai đoạn']);
  assert.equal(reportOpen(phase, '2026-11-26', false), true);
  assert.equal(reportOpen(phase, '2026-11-25', false), false);
  assert.equal(reportOpen(phase, '2026-11-10', true), true);
});
