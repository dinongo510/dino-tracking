// DINO-011 — Dinh dưỡng: hàm thuần (test bằng Node). Công thức gốc nằm ở formulas.js — chỉ gọi, không viết lại.
import { ageFromDob, bmrAuto, tdee as tdeeOf, nutritionTargets, DEFAULT_SLOTS, optionTotals, optionFits, adherencePct } from './formulas.js';

export const LEVEL_VI = { on: 'Đúng', near: 'Gần đúng', off: 'Lệch' };
export const GROUP_VI = { protein: 'Đạm', carb: 'Tinh bột', veg: 'Rau', fruit: 'Trái cây', fat: 'Chất béo', dairy: 'Sữa', drink: 'Đồ uống', dish: 'Món nấu sẵn' };
export const SLOT_CODE = { sang: 'Sáng', trua: 'Trưa', toi: 'Tối', phu: 'Phụ' };
export const roundHalf = (x) => Math.max(0.5, Math.round(x * 2) / 2);
const r1 = (x) => Math.round(x * 10) / 10;

/** Cân + FFM mới nhất: so ngày giữa số đo và InBody, lấy bản mới hơn; FFM chỉ từ InBody */
export function latestBody(measurements = [], scans = []) {
  const m = measurements.filter((x) => x.weight_kg != null).sort((a, b) => b.measured_on.localeCompare(a.measured_on))[0];
  const s = scans.filter((x) => x.weight_kg != null || x.ffm_kg != null).sort((a, b) => b.scanned_on.localeCompare(a.scanned_on))[0];
  const useScan = s?.weight_kg != null && (!m || s.scanned_on >= m.measured_on);
  return {
    weightKg: useScan ? Number(s.weight_kg) : m ? Number(m.weight_kg) : s?.weight_kg != null ? Number(s.weight_kg) : null,
    weightDate: useScan ? s.scanned_on : m?.measured_on ?? null,
    ffmKg: s?.ffm_kg != null ? Number(s.ffm_kg) : null,
    ffmDate: s?.ffm_kg != null ? s.scanned_on : null,
  };
}

/** Đề xuất mục tiêu từ hồ sơ + cơ thể. Trả về missing[] nếu thiếu dữ liệu. */
export function computeTargets(intake = {}, body = {}, today = new Date()) {
  const missing = [];
  if (!body.weightKg) missing.push('cân nặng');
  if (!intake.goal) missing.push('mục tiêu');
  if (!body.ffmKg) {
    if (!intake.sex) missing.push('giới tính');
    if (!intake.height_cm) missing.push('chiều cao');
    if (!intake.dob) missing.push('ngày sinh');
  }
  if (missing.length) return { missing };
  const age = intake.dob ? ageFromDob(intake.dob, today) : null;
  const { formula, bmr } = bmrAuto({ sex: intake.sex, weightKg: body.weightKg, heightCm: Number(intake.height_cm), age, ffmKg: body.ffmKg });
  const af = Number(intake.activity_factor || 1.375);
  const t = tdeeOf(bmr, af);
  return { missing, formula, bmr, tdee: t, age, activityFactor: af, ...nutritionTargets({ tdee: t, goal: intake.goal, weightKg: body.weightKg }) };
}
/** Carb tự tính lại khi Coach sửa kcal/P/F */
export const carbFrom = (kcal, p, f) => Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));

/** Mục tiêu từng bữa theo % kcal (protein chia cùng tỉ lệ) */
export function slotTargets(target, slots) {
  const total = slots.reduce((s, x) => s + Number(x.kcal_pct), 0) || 100;
  return slots.map((s) => ({ ...s, kcal: Math.round((target.kcal * Number(s.kcal_pct)) / total), proteinG: Math.round((target.protein_g * Number(s.kcal_pct)) / total) }));
}

/** items [{food_id, qty}] + Map foods → tổng (gọi optionTotals của formulas) */
export function totalsOf(items, foodById) {
  return optionTotals(items.filter((i) => foodById.get(i.food_id)).map((i) => ({ food: foodById.get(i.food_id), qty: Number(i.qty) })));
}
export const fits = (tot, slot) => optionFits(tot, slot.kcal, slot.proteinG);

/**
 * Gợi ý phương án cho 1 bữa: 1 món đạm + 1 tinh bột + 1 rau, số khẩu phần bước 0,5 (đạm/tinh bột 0,5–3; rau 1).
 * Trả về tối đa n phương án đều vừa khung, mỗi phương án dùng món đạm khác nhau.
 */
export function suggestOptions(foods, slot, n = 3) {
  const P = foods.filter((f) => f.food_group === 'protein'), C = foods.filter((f) => f.food_group === 'carb'), V = foods.filter((f) => f.food_group === 'veg');
  const steps = [0.5, 1, 1.5, 2, 2.5, 3];
  const cands = [];
  for (const p of P) for (const c of C) {
    const veg = V.length ? V[(p.name_vi.length + c.name_vi.length) % V.length] : null;
    for (const qp of steps) for (const qc of steps) {
      const items = [{ food_id: p.id, qty: qp }, { food_id: c.id, qty: qc }, ...(veg ? [{ food_id: veg.id, qty: 1 }] : [])];
      const tot = optionTotals(items.map((i) => ({ food: i.food_id === p.id ? p : i.food_id === c.id ? c : veg, qty: i.qty })));
      if (!optionFits(tot, slot.kcal, slot.proteinG)) continue;
      cands.push({ items, tot, score: Math.abs(tot.kcal - slot.kcal) / slot.kcal + Math.max(0, slot.proteinG - tot.proteinG) / (slot.proteinG || 1), pid: p.id,
        label: `${p.name_vi} + ${c.name_vi}` });
    }
  }
  cands.sort((a, b) => a.score - b.score);
  const out = [], usedP = new Set(), usedC = new Set();
  // Lượt 1: món đạm khác nhau + ưu tiên tinh bột chưa dùng; lượt 2: lấp đủ n, chỉ cần món đạm khác nhau
  for (const pass of [1, 2]) for (const x of cands) {
    if (out.length >= n) break;
    if (usedP.has(x.pid) || (pass === 1 && usedC.has(x.items[1].food_id))) continue;
    usedP.add(x.pid); usedC.add(x.items[1].food_id); out.push(x);
  }
  return out;
}

/** Nhân khẩu phần theo hệ số, làm tròn bước 0,5 (tối thiểu 0,5) */
export const scaleItems = (items, factor) => items.map((i) => ({ food_id: i.food_id, qty: roundHalf(Number(i.qty) * factor) }));

/**
 * Áp thực đơn mẫu cả ngày: trả về [{name, kcal_pct, options:[{label, items}]}] theo thứ tự Sáng–Trưa–Tối–Phụ.
 * Hệ số = kcal mục tiêu ÷ kcal mẫu; % mỗi bữa lấy theo kcal từng mẫu bữa trong thực đơn.
 */
export function applyDayPlan(dayPlan, mealTplById, targetKcal) {
  const factor = targetKcal / Number(dayPlan.kcal);
  const order = ['sang', 'trua', 'toi', 'phu'];
  const meals = [...dayPlan.meals].sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
  const total = meals.reduce((s, m) => s + Number(mealTplById.get(m.template_id)?.kcal || 0), 0) || 1;
  return meals.map((m) => {
    const t = mealTplById.get(m.template_id);
    return { name: SLOT_CODE[m.slot] || m.slot, kcal_pct: r1((Number(t?.kcal || 0) / total) * 100), options: t ? [{ label: t.name, items: scaleItems(t.items, factor) }] : [] };
  });
}
export const defaultSlots = () => DEFAULT_SLOTS.map((s) => ({ name: s.name, kcal_pct: s.pct }));

/** Dán CSV: name_vi;serving;kcal;protein;carb;fat;source — chấp nhận dấu phẩy thập phân, bỏ dòng tiêu đề */
export function parseFoodCsv(text) {
  const rows = [], errors = [];
  const num = (s) => { if (s == null || String(s).trim() === '') return null; const n = Number(String(s).trim().replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const c = line.split(line.includes(';') ? ';' : '\t').map((x) => x.trim());
    if (i === 0 && /^(name|tên)/i.test(c[0]) && Number.isNaN(num(c[2]))) return;
    const [name_vi, serving, kcal, protein_g, carb_g, fat_g, source] = c;
    const r = { name_vi, serving, kcal: num(kcal), protein_g: num(protein_g), carb_g: num(carb_g), fat_g: num(fat_g), source: source || null };
    const bad = !name_vi ? 'thiếu tên' : !serving ? 'thiếu khẩu phần' : r.kcal == null || Number.isNaN(r.kcal) ? 'kcal không hợp lệ'
      : [r.protein_g, r.carb_g, r.fat_g].some((x) => Number.isNaN(x)) ? 'P/C/F không hợp lệ' : null;
    if (bad) errors.push({ line: i + 1, text: line, reason: bad }); else rows.push(r);
  });
  return { rows, errors };
}

/** Tuân thủ ăn trong các ngày [from..to] (đến hôm nay): kỳ vọng = số bữa × số ngày */
export function adherenceRange(checks, slotsCount, days) {
  if (!slotsCount || !days) return null;
  return adherencePct(checks, slotsCount * days);
}
