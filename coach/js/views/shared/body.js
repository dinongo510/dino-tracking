// DINO-007 — Số đo & InBody (khách và coach cùng dùng)
import { $, esc, toast, busy, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { num } from '../client/intake.js';

const MEAS = [['weight_kg', 'Cân (kg)'], ['waist_cm', 'Eo (cm)'], ['hip_cm', 'Hông (cm)'], ['chest_cm', 'Ngực (cm)'],
  ['arm_cm', 'Tay (cm)'], ['thigh_cm', 'Đùi (cm)'], ['neck_cm', 'Cổ (cm)']];
const INB = [['weight_kg', 'Cân (kg)'], ['smm_kg', 'Cơ xương SMM (kg)'], ['pbf_pct', 'Tỉ lệ mỡ PBF (%)'], ['ffm_kg', 'Khối nạc FFM (kg)'],
  ['visceral_fat_level', 'Mỡ nội tạng (level)'], ['bmr_inbody', 'BMR InBody (kcal)']];
// Mũi tên xu hướng: với các chỉ số này giảm là tốt
const LOWER_IS_GOOD = new Set(['waist_cm', 'hip_cm', 'pbf_pct', 'visceral_fat_level']);

function delta(cur, prev, k) {
  if (cur == null || prev == null) return '';
  const d = Math.round((cur - prev) * 10) / 10;
  if (!d) return ' <span class="muted small">—</span>';
  const good = LOWER_IS_GOOD.has(k) ? d < 0 : k === 'smm_kg' || k === 'ffm_kg' ? d > 0 : null;
  const color = good == null ? 'var(--muted)' : good ? 'var(--ok)' : 'var(--warn)';
  return ` <span class="small" style="color:${color}">${d > 0 ? '▲' : '▼'}${Math.abs(d)}</span>`;
}

function table(rows, cols, dateKey, myId) {
  if (!rows.length) return '<p class="muted small">Chưa có dữ liệu.</p>';
  return `<ul class="list">${rows.map((r, i) => {
    const prev = rows[i + 1];
    const vals = cols.filter(([k]) => r[k] != null).map(([k, l]) => `<span class="small">${esc(l.split(' (')[0])}: <strong>${esc(r[k])}</strong>${delta(r[k], prev?.[k], k)}</span>`).join(' · ');
    return `<li style="display:block"><div class="row row--between"><strong>${fmtDate(r[dateKey])}</strong>
      <span class="badge">${r.entered_by === myId ? 'Bạn nhập' : r.entered_by === r.client_id ? 'Khách nhập' : 'Coach nhập'}</span></div>
      <div style="margin-top:4px">${vals || '<span class="muted small">—</span>'}</div></li>`;
  }).join('')}</ul>`;
}

const formHtml = (id, cols, dateKey) => `<dialog id="${id}"><form method="dialog">
  <h2>${id === 'dm' ? 'Thêm số đo' : 'Thêm kết quả InBody'}</h2>
  <label class="field"><span>Ngày</span><input class="input" name="${dateKey}" type="date" value="${new Date().toISOString().slice(0, 10)}" required></label>
  ${cols.map(([k, l]) => `<label class="field"><span>${esc(l)}</span><input class="input" name="${k}" inputmode="decimal"></label>`).join('')}
  ${id === 'dm' ? '<label class="field"><span>Ghi chú</span><input class="input" name="note"></label>' : ''}
  <div class="row"><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary" style="flex:1">Lưu</button></div>
</form></dialog>`;

/** Vẽ phần Số đo + InBody vào phần tử `el`. */
export async function renderBody(el, clientId, myId) {
  const db = await sb();
  const [{ data: ms, error: e1 }, { data: ib, error: e2 }] = await Promise.all([
    db.from('measurements').select('*').eq('client_id', clientId).order('measured_on', { ascending: false }).order('created_at', { ascending: false }),
    db.from('inbody_scans').select('*').eq('client_id', clientId).order('scanned_on', { ascending: false }).order('created_at', { ascending: false }),
  ]);
  if (e1 || e2) throw e1 || e2;
  el.innerHTML = `
    <div class="row row--between"><h2>Số đo</h2><button class="btn small" id="addM">+ Thêm</button></div>
    <div class="card">${table(ms, MEAS, 'measured_on', myId)}</div>
    <div class="row row--between"><h2>InBody</h2><button class="btn small" id="addI">+ Thêm</button></div>
    <div class="card">${table(ib, INB, 'scanned_on', myId)}</div>
    ${formHtml('dm', MEAS, 'measured_on')}${formHtml('di', INB, 'scanned_on')}`;

  const wire = (btn, dlgId, tableName, cols, dateKey) => {
    const dlg = $('#' + dlgId, el), f = dlg.querySelector('form');
    $(btn, el).onclick = () => { f.reset(); f[dateKey].value = new Date().toISOString().slice(0, 10); dlg.showModal(); };
    dlg.querySelector('[data-close]').onclick = () => dlg.close();
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const row = { client_id: clientId, [dateKey]: f[dateKey].value };
      for (const [k] of cols) { const v = num(f[k].value); if (v != null) { if (Number.isNaN(v)) return toast(`"${f[k].value}" không phải số`, 'error'); row[k] = v; } }
      if (f.note?.value) row.note = f.note.value;
      if (Object.keys(row).length <= 2) return toast('Nhập ít nhất một chỉ số.', 'error');
      await busy(e.submitter, async () => {
        const { error } = await db.from(tableName).insert(row);
        if (error) return toast(viError(error), 'error');
        dlg.close(); toast('Đã lưu.'); renderBody(el, clientId, myId);
      });
    });
  };
  wire('#addM', 'dm', 'measurements', MEAS, 'measured_on');
  wire('#addI', 'di', 'inbody_scans', INB, 'scanned_on');
}
