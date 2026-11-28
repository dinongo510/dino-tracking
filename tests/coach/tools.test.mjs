// DINO-016 — Unit tests: Công cụ (Pace ⇄ km/h, Riegel, 1RM & %, Lắp đĩa tạ, Quay WOD) & Dữ liệu WOD
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  paceToSpeed, speedToPace, fmtPace, predictRace, predictStandardRaces,
  oneRm, oneRmPercentages, plateLoad, randomWod,
} from '../../coach/js/lib/tools.js';
import { WODS } from '../../coach/js/lib/wods.js';

test('pace 5:00/km (300s) ⇄ 12 km/h', () => {
  assert.equal(paceToSpeed(300), 12);
  assert.equal(speedToPace(12), 300);
  assert.equal(fmtPace(300), '5:00');

  // Thử thêm pace 5:30 (330s) -> ~10.9 km/h
  assert.equal(paceToSpeed(330), 10.9);
  assert.equal(speedToPace(10.9), 330);
  assert.equal(fmtPace(330), '5:30');
});

test('Riegel 10K 50:00 (3000s) -> 21,1K (21.0975 km) = 6619s (1:50:19)', () => {
  const tHM = predictRace(10, 3000, 21.0975);
  // 3000 * (2.10975)^1.06 = 6619.5s -> làm tròn 6619s = 1:50:19
  assert.equal(tHM, 6619);

  // Nếu cự ly nhập 21.1 km: 3000 * (2.11)^1.06 = 6620s = 1:50:20
  const tHM2 = predictRace(10, 3000, 21.1);
  assert.equal(tHM2, 6620);

  // predictStandardRaces sinh đủ 4 cự ly tiêu chuẩn
  const preds = predictStandardRaces(10, 3000);
  assert.equal(preds.length, 4);
  const hm = preds.find((p) => p.key === 'hm');
  assert.equal(hm.sec, 6619);
  assert.equal(hm.timeFormatted, '1:50:19');
});

test('1RM 100 kg × 5 = 116,7 (Epley)', () => {
  const rm = oneRm(100, 5);
  assert.equal(rm.epley, 116.7);
  // Brzycki: 100 * (36 / 32) = 112.5
  assert.equal(rm.brzycki, 112.5);

  // Bảng phần trăm 1RM từ 100% xuống 50%
  const pcts = oneRmPercentages(rm.epley);
  assert.equal(pcts.length, 11);
  assert.equal(pcts[0].pct, 100);
  assert.equal(pcts[0].load, 116.5); // 116.7 * 1.0 = 116.7 -> làm tròn 0.5 là 116.5
  assert.equal(pcts[pcts.length - 1].pct, 50);
});

test('lắp 100 kg thanh 20 → mỗi bên 25 + 15', () => {
  const p100 = plateLoad(100, 20);
  assert.equal(p100.remainder, 0);
  assert.equal(p100.totalLoaded, 100);
  assert.deepEqual(p100.eachSide, [
    { plate: 25, count: 1 },
    { plate: 15, count: 1 },
  ]);
});

test('lắp 102,5 kg thanh 20 → 25 + 15 + 1,25', () => {
  const p102 = plateLoad(102.5, 20);
  assert.equal(p102.remainder, 0);
  assert.equal(p102.totalLoaded, 102.5);
  assert.deepEqual(p102.eachSide, [
    { plate: 25, count: 1 },
    { plate: 15, count: 1 },
    { plate: 1.25, count: 1 },
  ]);
});

test('số lẻ không lắp được → báo phần dư', () => {
  // 101 kg thanh 20: mỗi bên 40.5 kg -> 25 + 15 = 40 kg, dư 0.5 kg mỗi bên => tổng dư 1 kg
  const p101 = plateLoad(101, 20);
  assert.equal(p101.remainder, 1);
  assert.equal(p101.totalLoaded, 100);
  assert.deepEqual(p101.eachSide, [
    { plate: 25, count: 1 },
    { plate: 15, count: 1 },
  ]);

  // Target bé hơn thanh tạ 20 kg
  const p15 = plateLoad(15, 20);
  assert.equal(p15.remainder, 15);
  assert.deepEqual(p15.eachSide, []);
});

test('randomWod với rng cố định ra đúng bài', () => {
  const sample = [
    { id: 'w1', name: 'W1', type: 'amrap', minutes: 20 },
    { id: 'w2', name: 'W2', type: 'fortime', minutes: 15 },
    { id: 'w3', name: 'W3', type: 'amrap', minutes: 10 },
  ];
  // rng trả 0 -> phần tử đầu tiên
  const picked1 = randomWod(sample, { type: 'amrap', rng: () => 0 });
  assert.equal(picked1.id, 'w1');

  // rng trả 0.99 -> phần tử cuối của danh sách đã lọc
  const picked2 = randomWod(sample, { type: 'amrap', rng: () => 0.99 });
  assert.equal(picked2.id, 'w3');
});

test('dữ liệu WOD ≥ 50 bài, đủ trường', () => {
  assert.ok(WODS.length >= 50, `WODS có ${WODS.length} bài (cần >= 50)`);
  for (const w of WODS) {
    assert.ok(w.id, 'thiếu id');
    assert.ok(w.name, 'thiếu name');
    assert.ok(['amrap', 'emom', 'fortime', 'hyrox', 'chipper'].includes(w.type), `loại sai: ${w.type}`);
    assert.ok(typeof w.minutes === 'number' && w.minutes > 0, 'minutes không hợp lệ');
    assert.ok(Array.isArray(w.items) && w.items.length > 0, 'items phải là mảng không rỗng');
    assert.ok(typeof w.note === 'string', 'thiếu note');
  }
});
