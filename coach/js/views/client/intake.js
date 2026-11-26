// DINO-007 — Wizard hồ sơ 5 bước (theo phiếu BFS)
import { render, $, esc, toast, busy, tabbar } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { getProfile } from '../../auth.js';
import { go } from '../../router.js';
import { STEPS, getVal, setVal, deriveGoal, deriveFlag, suggestActivityFactor } from '../../lib/intake.js';

export const num = (v) => (v === '' || v == null ? null : Number(String(v).replace(',', '.')));
const COLS = ['dob', 'sex', 'height_cm', 'doctor_contact', 'emergency_contact', 'current_activity', 'active_days_60min',
  'injuries', 'surgeries', 'return_cleared', 'medical', 'medications'];
const JSONS = ['diet', 'lifestyle', 'goal_ratings', 'parq'];

async function loadState(profile) {
  const db = await sb();
  const [{ data: h }, { data: m }] = await Promise.all([
    db.from('health_intakes').select('*').eq('client_id', profile.id).maybeSingle(),
    db.from('measurements').select('weight_kg').eq('client_id', profile.id).order('measured_on', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const state = { ...(h || {}), profile: { full_name: profile.full_name, phone: profile.phone }, measure: { weight_kg: m?.weight_kg ?? null } };
  return { state, lastWeight: m?.weight_kg ?? null };
}

const missing = (state, step) => step.fields.filter((f) => f.required && [null, undefined, ''].includes(getVal(state, f.key)));
export const firstIncomplete = (state) => { const i = STEPS.findIndex((s) => missing(state, s).length); return i < 0 ? 0 : i; };
export const intakeComplete = (state) => STEPS.every((s) => !missing(state, s).length);

function fieldHtml(f, v) {
  const id = f.key ? 'f_' + f.key.replace('.', '_') : '';
  const req = f.required ? ' <span style="color:var(--brand)">*</span>' : '';
  const val = v ?? '';
  switch (f.type) {
    case 'note': return `<p class="muted small" style="margin:18px 0 8px">${esc(f.label)}</p>`;
    case 'textarea': return `<label class="field"><span>${esc(f.label)}${req}</span><textarea id="${id}" data-k="${f.key}" rows="3">${esc(val)}</textarea></label>`;
    case 'select': return `<label class="field"><span>${esc(f.label)}${req}</span><select id="${id}" data-k="${f.key}"><option value="">— Chọn —</option>${f.options.map(([k, l]) => `<option value="${k}"${String(val) === k ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    case 'choice': return `<fieldset class="field" style="border:0;padding:0;margin:0 0 14px"><span>${esc(f.label)}${req}</span><div class="row" style="flex-wrap:wrap;gap:8px">${f.options.map(([k, l]) => `<label class="btn btn--ghost small" style="min-height:40px"><input type="radio" name="${id}" data-k="${f.key}" value="${k}"${val === k ? ' checked' : ''}> ${esc(l)}</label>`).join('')}</div></fieldset>`;
    case 'scale': return `<label class="field"><span>${esc(f.label)}: <strong id="${id}_v">${val === '' ? '–' : esc(val)}</strong>/10${req}</span><input id="${id}" data-k="${f.key}" type="range" min="0" max="10" step="1" value="${val === '' ? 5 : esc(val)}" data-touched="${val === '' ? '0' : '1'}" style="width:100%"></label>`;
    case 'number': return `<label class="field"><span>${esc(f.label)}${req}</span><input class="input" id="${id}" data-k="${f.key}" type="text" inputmode="decimal" value="${esc(val)}"></label>`;
    default: return `<label class="field"><span>${esc(f.label)}${req}</span><input class="input" id="${id}" data-k="${f.key}" type="${f.type}" value="${esc(val)}"></label>`;
  }
}

function readStep(step, state) {
  for (const f of step.fields) {
    if (!f.key) continue;
    let v;
    if (f.type === 'choice') v = document.querySelector(`input[data-k="${f.key}"]:checked`)?.value ?? null;
    else { const el = document.querySelector(`[data-k="${f.key}"]`); v = el.value; if (f.type === 'scale' && el.dataset.touched !== '1') v = getVal(state, f.key) ?? null; }
    if (f.type === 'number' || f.type === 'scale') v = num(v);
    if (v === '') v = null;
    setVal(state, f.key, v);
  }
}

async function save(profile, state, lastWeight, finish) {
  const db = await sb();
  const row = { client_id: profile.id };
  for (const c of COLS) if (c in state) row[c] = state[c];
  for (const j of JSONS) if (state[j]) row[j] = state[j];
  if (finish) {
    row.parq_flag = deriveFlag(state).length > 0;
    const g = deriveGoal(state.goal_ratings); if (g) row.goal = g;
    row.activity_factor = suggestActivityFactor(state);
    row.updated_at = new Date().toISOString();
  }
  const { error: e1 } = await db.from('health_intakes').upsert(row, { onConflict: 'client_id' });
  if (e1) throw e1;
  const p = state.profile || {};
  if (p.full_name !== profile.full_name || p.phone !== profile.phone) {
    const { error } = await db.from('profiles').update({ full_name: p.full_name, phone: p.phone }).eq('id', profile.id);
    if (error) throw error;
  }
  const w = state.measure?.weight_kg;
  if (w != null && w !== lastWeight) {
    const { error } = await db.from('measurements').insert({ client_id: profile.id, weight_kg: w });
    if (error) throw error;
    return w;
  }
  return lastWeight;
}

export async function intakeView({ profile, params = {} }) {
  tabbar(null);
  let { state, lastWeight } = await loadState(profile);
  // Tiếp tục đúng bước đã dừng (lưu ở lifestyle.wizard_step); nếu thiếu câu bắt buộc ở bước trước thì quay về bước đó
  const saved = state.lifestyle?.wizard_step;
  let i = params.step != null ? +params.step : Math.min(saved ?? firstIncomplete(state), firstIncomplete(state) || (saved ?? 0));

  const draw = () => {
    const step = STEPS[i];
    render(`
      <p class="muted small">Bước ${i + 1}/${STEPS.length}</p>
      <div style="height:6px;background:var(--surface-2);border-radius:6px;margin-bottom:12px"><div style="height:6px;width:${((i + 1) / STEPS.length) * 100}%;background:var(--brand);border-radius:6px"></div></div>
      <h1>${esc(step.title)}</h1>
      ${i === 0 ? '<p class="muted small">Mất khoảng 8 phút. Có thể dừng giữa chừng, lần sau mở app sẽ tiếp tục đúng bước. Chỉ Coach xem được thông tin này.</p>' : ''}
      <form id="f" class="card" novalidate>${step.fields.map((f) => fieldHtml(f, f.key ? getVal(state, f.key) : null)).join('')}
        <div class="row" style="margin-top:8px">${i > 0 ? '<button type="button" id="back" class="btn btn--ghost">Quay lại</button>' : ''}
        <button class="btn btn--primary" style="flex:1">${i === STEPS.length - 1 ? 'Hoàn thành' : 'Lưu & tiếp tục'}</button></div>
      </form>`);
    document.querySelectorAll('input[type=range]').forEach((r) => r.addEventListener('input', () => { r.dataset.touched = '1'; $('#' + r.id + '_v').textContent = r.value; }));
    $('#back')?.addEventListener('click', () => { readStep(step, state); i--; draw(); });
    $('#f').addEventListener('submit', async (e) => {
      e.preventDefault();
      readStep(step, state);
      const miss = missing(state, step);
      if (miss.length) return toast('Còn thiếu: ' + miss.map((f) => f.label).slice(0, 2).join('; '), 'error');
      await busy(e.submitter, async () => {
        try {
          const last = i === STEPS.length - 1;
          if (!last && !state.updated_at) setVal(state, 'lifestyle.wizard_step', i + 1);
          lastWeight = await save(profile, state, lastWeight, last);
          if (!last) { i++; draw(); return; }
          await getProfile(true);
          const flags = deriveFlag(state);
          render(`<div class="card ${flags.length ? 'card--flag' : ''}"><h1>Cảm ơn bạn!</h1>
            <p>${flags.length ? 'Coach sẽ nhắn bạn trong 24 giờ để hỏi thêm. Có thể Coach đề nghị bạn hỏi ý kiến bác sĩ trước khi bắt đầu, để mình tập an toàn và lâu dài.'
              : 'Hồ sơ đã gửi tới Coach. Coach sẽ dùng thông tin này để thiết kế kế hoạch cho bạn.'}</p>
            <a class="btn btn--primary btn--block" href="#/client">Về trang chính</a></div>`);
        } catch (err) { toast(viError(err), 'error'); }
      });
    });
  };
  draw();
}

export async function loadIntake(clientId) {
  const { data } = await (await sb()).from('health_intakes').select('*').eq('client_id', clientId).maybeSingle();
  return data;
}
