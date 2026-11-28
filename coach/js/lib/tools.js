// DINO-016 — Công cụ hỗ trợ: đổi pace ⇄ tốc độ, Riegel dự đoán giải chạy, tính 1RM & % tạ, lắp đĩa tạ, quay WOD
import { e1rm } from './formulas.js';

export const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

/** Đổi pace (giây/km) sang vận tốc (km/h) làm tròn 1 chữ số thập phân */
export function paceToSpeed(secPerKm) {
  if (!secPerKm || secPerKm <= 0) return 0;
  return Math.round((3600 / secPerKm) * 10) / 10;
}

/** Đổi vận tốc (km/h) sang pace (giây/km) làm tròn số nguyên */
export function speedToPace(kmh) {
  if (!kmh || kmh <= 0) return 0;
  return Math.round(3600 / kmh);
}

/** Định dạng giây/km thành chuỗi m:ss (ví dụ: 330 -> '5:30') */
export function fmtPace(secPerKm) {
  if (!secPerKm || secPerKm <= 0 || !isFinite(secPerKm)) return '—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Chuyển chuỗi m:ss hoặc số thập phân sang số giây/km */
export function parsePace(str) {
  if (!str) return 0;
  const s = String(str).trim();
  if (s.includes(':')) {
    const [m, sec] = s.split(':').map(Number);
    return (m || 0) * 60 + (sec || 0);
  }
  const n = parseFloat(s.replace(',', '.'));
  if (isNaN(n) || n <= 0) return 0;
  // Nếu người dùng nhập 5.30 -> xem là 5:30 hay 5.3 phút?
  // Theo chuẩn thể thao, 5.30 thường là gõ 5 phút 30 giây thay vì dấu hai chấm
  const m = Math.floor(n);
  const part = Math.round((n - m) * 100);
  if (part > 0 && part < 60) return m * 60 + part;
  return Math.round(n * 60);
}

/** Định dạng giây thành h:mm:ss hoặc m:ss */
export function formatDuration(totalSec) {
  if (!totalSec || totalSec <= 0 || !isFinite(totalSec)) return '—';
  const sec = Math.round(totalSec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Dự đoán thành tích giải chạy theo công thức Riegel:
 * T2 = T1 * (D2 / D1)^1.06
 */
export function predictRace(distKm, timeSec, targetKm) {
  if (!distKm || distKm <= 0 || !timeSec || timeSec <= 0 || !targetKm || targetKm <= 0) return 0;
  return Math.round(timeSec * Math.pow(targetKm / distKm, 1.06));
}

export const RACE_TARGETS = [
  { key: '5k', label: '5 km', distKm: 5 },
  { key: '10k', label: '10 km', distKm: 10 },
  { key: 'hm', label: '21,1 km (Half Marathon)', distKm: 21.0975 },
  { key: 'fm', label: '42,2 km (Full Marathon)', distKm: 42.195 },
];

/** Dự đoán thời gian cho 4 cự ly tiêu chuẩn (5K, 10K, 21.1K, 42.2K) */
export function predictStandardRaces(distKm, timeSec) {
  if (!distKm || distKm <= 0 || !timeSec || timeSec <= 0) return [];
  return RACE_TARGETS.map((t) => {
    const sec = predictRace(distKm, timeSec, t.distKm);
    const p = sec / t.distKm;
    return {
      ...t,
      sec,
      timeFormatted: formatDuration(sec),
      paceFormatted: fmtPace(p),
    };
  });
}

/** Tính 1RM theo Epley (chuẩn hệ thống) và Brzycki (đối chiếu) */
export function oneRm(load, reps) {
  const l = Number(load) || 0;
  const r = Number(reps) || 0;
  if (l <= 0 || r <= 0) return { epley: 0, brzycki: 0 };
  const ep = e1rm(l, r);
  let brz = l;
  if (r > 1) {
    brz = r >= 37 ? ep : Math.round(l * (36 / (37 - r)) * 10) / 10;
  }
  return { epley: ep, brzycki: brz };
}

/** Bảng phần trăm 1RM từ 100% đến 50% bước 5% */
export function oneRmPercentages(rmLoad) {
  const rm = Number(rmLoad) || 0;
  if (rm <= 0) return [];
  const pcts = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
  const estReps = { 100: 1, 95: 2, 90: 4, 85: 6, 80: 8, 75: 10, 70: 12, 65: 15, 60: 18, 55: 20, 50: 24 };
  return pcts.map((pct) => ({
    pct,
    repsEst: estReps[pct] || null,
    load: Math.round(((rm * pct) / 100) * 2) / 2,
  }));
}

/**
 * Tính số đĩa tạ lắp mỗi bên đòn tạ:
 * @param {number} targetKg - Tổng khối lượng mong muốn (kg)
 * @param {number} barKg - Khối lượng đòn tạ (mặc định 20 kg)
 * @param {Array<number>} plates - Danh sách đĩa có sẵn [25, 20, 15, 10, 5, 2.5, 1.25]
 * @returns {{ eachSide: Array<{plate: number, count: number}>, remainder: number, totalLoaded: number, barKg: number }}
 */
export function plateLoad(targetKg, barKg = 20, plates = STANDARD_PLATES) {
  const target = Number(targetKg) || 0;
  const bar = Number(barKg) || 0;
  const sorted = [...plates].sort((a, b) => b - a);
  if (target < bar) {
    return {
      eachSide: [],
      remainder: target > 0 ? target : 0,
      totalLoaded: bar,
      barKg: bar,
    };
  }
  let remSide = (target - bar) / 2;
  const eachSide = [];
  for (const p of sorted) {
    const count = Math.floor((remSide + 1e-6) / p);
    if (count > 0) {
      eachSide.push({ plate: p, count });
      remSide -= count * p;
      remSide = Math.round(remSide * 1000) / 1000;
    }
  }
  const remainder = Math.round(remSide * 2 * 1000) / 1000;
  const totalLoaded = Math.round((target - remainder) * 100) / 100;
  return {
    eachSide,
    remainder,
    totalLoaded,
    barKg: bar,
  };
}

/**
 * Quay WOD ngẫu nhiên:
 * @param {Array} list - Danh sách WOD
 * @param {Object} options
 * @param {string} [options.type] - amrap | emom | fortime | hyrox | chipper | all
 * @param {number} [options.minutes] - Thời lượng tối đa (phút)
 * @param {Function} [options.rng] - Hàm sinh số ngẫu nhiên [0, 1), truyền vào để test ổn định
 */
export function randomWod(list, { type, minutes, rng = Math.random } = {}) {
  let pool = list || [];
  if (type && type !== 'all') {
    pool = pool.filter((w) => w.type === type);
  }
  if (minutes && minutes > 0) {
    const fitMin = pool.filter((w) => w.minutes <= minutes);
    if (fitMin.length) pool = fitMin;
  }
  if (!pool.length) return null;
  const idx = Math.floor(rng() * pool.length);
  return pool[idx];
}
