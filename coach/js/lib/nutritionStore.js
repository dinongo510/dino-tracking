// DINO-011 — Đọc/ghi dinh dưỡng trên Supabase
import { sb } from '../supabaseClient.js';
import { totalsOf } from './nutrition.js';

const must = ({ data, error }) => { if (error) throw error; return data; };
const db = () => sb();

export async function listFoods() {
  return must(await (await db()).from('foods').select('*').order('name_vi'));
}
export async function saveFood(row) {
  const q = (await db()).from('foods');
  return must(row.id ? await q.update(row).eq('id', row.id).select().single() : await q.insert(row).select().single());
}
export async function deleteFood(id) { must(await (await db()).from('foods').delete().eq('id', id)); }
/** Lưu nhiều món (CSV); trùng tên thì cập nhật */
export async function upsertFoods(rows) {
  return must(await (await db()).from('foods').upsert(rows, { onConflict: 'name_vi' }).select());
}

/** Mọi thứ cho trang dinh dưỡng của 1 khách */
export async function loadNutrition(clientId, { approvedOnly = false } = {}) {
  const d = await db();
  let tq = d.from('nutrition_targets').select('*').eq('client_id', clientId);
  if (approvedOnly) tq = tq.eq('status', 'approved');
  const [targets, slots, options, foods] = await Promise.all([
    tq.order('valid_from', { ascending: false }).order('created_at', { ascending: false }).then(must),
    d.from('meal_slots').select('*').eq('client_id', clientId).order('order_no').then(must),
    d.from('meal_options').select('*').eq('client_id', clientId).order('created_at').then(must),
    listFoods(),
  ]);
  for (const s of slots) s.options = options.filter((o) => o.slot_id === s.id);
  return { targets, target: targets.find((t) => t.status === 'approved') || null, slots, foods };
}
export async function loadBodyAndIntake(clientId) {
  const d = await db();
  const [m, s, i] = await Promise.all([
    d.from('measurements').select('measured_on, weight_kg').eq('client_id', clientId).then(must),
    d.from('inbody_scans').select('scanned_on, weight_kg, ffm_kg').eq('client_id', clientId).then(must),
    d.from('health_intakes').select('dob, sex, height_cm, goal, activity_factor').eq('client_id', clientId).maybeSingle().then(must),
  ]);
  return { measurements: m, scans: s, intake: i || {} };
}
export async function approveTarget(row) {
  return must(await (await db()).from('nutrition_targets').insert({ ...row, status: 'approved' }).select().single());
}

export async function insertSlots(clientId, list) {
  const rows = list.map((s, i) => ({ client_id: clientId, order_no: i + 1, name: s.name, kcal_pct: s.kcal_pct }));
  return must(await (await db()).from('meal_slots').insert(rows).select());
}
export async function updateSlot(id, patch) { must(await (await db()).from('meal_slots').update(patch).eq('id', id)); }
export async function deleteSlot(id) { must(await (await db()).from('meal_slots').delete().eq('id', id)); }

export async function insertOption(clientId, slotId, { label, items }, foodById) {
  const t = totalsOf(items, foodById);
  return must(await (await db()).from('meal_options').insert({ client_id: clientId, slot_id: slotId, label: label || null, items, kcal: t.kcal, protein_g: t.proteinG }).select().single());
}
export async function updateOption(id, { label, items }, foodById) {
  const t = totalsOf(items, foodById);
  must(await (await db()).from('meal_options').update({ label: label || null, items, kcal: t.kcal, protein_g: t.proteinG }).eq('id', id));
}
export async function deleteOption(id) { must(await (await db()).from('meal_options').delete().eq('id', id)); }

/** Thay toàn bộ thực đơn: xóa các bữa cũ (phương án xóa theo), tạo bữa + phương án mới */
export async function replacePlan(clientId, oldSlots, plan, foodById) {
  const d = await db();
  if (oldSlots.length) must(await d.from('meal_slots').delete().in('id', oldSlots.map((s) => s.id)));
  const slots = await insertSlots(clientId, plan);
  const opts = [];
  plan.forEach((p, i) => (p.options || []).forEach((o) => { const t = totalsOf(o.items, foodById);
    opts.push({ client_id: clientId, slot_id: slots.find((s) => s.order_no === i + 1).id, label: o.label, items: o.items, kcal: t.kcal, protein_g: t.proteinG }); }));
  if (opts.length) must(await d.from('meal_options').insert(opts));
}

export async function listTemplates() {
  const d = await db();
  const [meals, days] = await Promise.all([
    d.from('meal_templates').select('*').order('name').then(must),
    d.from('day_plan_templates').select('*').order('name').then(must),
  ]);
  return { meals, days };
}

export async function listChecks(clientId, from, to) {
  return must(await (await db()).from('meal_checks').select('*').eq('client_id', clientId).gte('check_date', from).lte('check_date', to).order('check_date'));
}
export async function saveCheck(row) {
  return must(await (await db()).from('meal_checks').upsert(row, { onConflict: 'client_id,check_date,slot_id' }).select().single());
}
