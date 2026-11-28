// DINO-009 — Soạn 1 buổi tập (Coach): khối → bài, tải/RPE/%1RM, quy tắc tăng tải, corrective từ OHSA, HYROX
import { render, $, esc, toast, busy } from '../../ui.js';
import { viError } from '../../supabaseClient.js';
import { SESSION_MODE_VI } from '../../lib/packages.js';
import { coachTabs } from './home.js';
import { loadExercises, filterExercises, norm, CATEGORY_VI, vi } from '../../lib/exercises.js';
import { DAY_VI, SESSION_TYPE_VI, BLOCK_VI, BLOCK_FIELDS, RULE_VI, ruleKey, ruleFromKey, sessionDate, correctiveFromOhsa, interleaveCompromised, itemSummary } from '../../lib/plan.js';
import { loadSession, saveSession, deleteSessions, latestOhsa } from '../../lib/planStore.js';

const clone = (x) => structuredClone(x);
const BF_VI = { rounds: 'Số vòng', work_sec: 'Làm (giây)', rest_sec: 'Nghỉ giữa vòng (giây)', time_cap_sec: 'Thời gian (giây)' };
const F_VI = { sets: 'Hiệp', reps_min: 'Reps từ', reps_max: 'đến', load_kg: 'Tạ (kg)', pct_1rm: '%1RM', target_rpe: 'RPE', rest_sec: 'Nghỉ (giây)', tempo: 'Tempo', distance_m: 'Cự ly (m)', duration_sec: 'Thời lượng (giây)', target_pace: 'Pace (ph/km)', hr_zone: 'Vùng tim' };
const TEXT_F = new Set(['tempo', 'target_pace']);
const RUN_F = ['sets', 'distance_m', 'duration_sec', 'target_pace', 'hr_zone', 'rest_sec'];
const STR_F = ['sets', 'reps_min', 'reps_max', 'load_kg', 'pct_1rm', 'target_rpe', 'rest_sec', 'tempo'];
const TIMED_F = ['sets', 'reps_min', 'reps_max', 'duration_sec', 'distance_m', 'load_kg', 'target_rpe', 'rest_sec'];

function fieldsFor(block, ex) {
  if (ex?.category === 'run' || block.block_type === 'run') return RUN_F;
  if (['hyrox', 'corrective', 'circuit', 'emom', 'amrap', 'for_time'].includes(block.block_type) || ['hyrox', 'conditioning', 'corrective', 'mobility'].includes(ex?.category)) return TIMED_F;
  return STR_F;
}
const blankItem = (exId) => ({ exercise_id: exId, sets: 3, reps_min: 8, reps_max: 12, rest_sec: 90, progression_rule: { type: 'none' } });

export async function coachSessionView({ params }) {
  coachTabs();
  const [{ session, phase }, exList] = await Promise.all([loadSession(params.id), loadExercises()]);
  const exById = new Map(exList.map((e) => [e.id, e]));
  let cur = clone(session), prev = clone(session), dirty = false;
  const back = `#/coach/client/${session.client_id}/plan?phase=${phase.id}`;
  const mark = () => { dirty = true; $('#save').classList.add('btn--primary'); $('#save').textContent = 'Lưu buổi •'; };

  render(`
    <p class="small"><a href="${back}" id="back">← ${esc(phase.name)}</a> · <a href="#/coach/review/${session.id}">Xem kết quả khách ghi →</a></p>
    <div class="row row--between"><h1 style="margin:0">Tuần ${session.week_no} · ${DAY_VI[session.day_no - 1]}</h1>
      ${phase.status !== 'draft' ? '<span class="badge badge--ok">Khách đang thấy</span>' : '<span class="badge">Nháp</span>'}</div>
    <div class="card stack">
      <label class="field"><span>Tên buổi</span><input class="input" id="st" value="${esc(cur.title || '')}"></label>
      <div class="row"><label class="field" style="flex:1"><span>Ngày</span><select id="sd">${DAY_VI.map((d, i) => `<option value="${i + 1}"${i + 1 === cur.day_no ? ' selected' : ''}>${d}</option>`).join('')}</select></label>
        <label class="field" style="flex:1"><span>Loại</span><select id="sy">${Object.entries(SESSION_TYPE_VI).map(([k, l]) => `<option value="${k}"${k === cur.session_type ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <label class="field"><span>Ai ghi buổi này?</span><select id="sm">${Object.entries(SESSION_MODE_VI).map(([k, l]) => `<option value="${k}"${k === (cur.mode || 'self') ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field"><span>Lời dặn của coach cho buổi này</span><textarea id="sn" rows="2">${esc(cur.coach_note || '')}</textarea></label>
    </div>
    <div id="blocks"></div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin:8px 0 90px">
      <select id="nbt">${Object.entries(BLOCK_VI).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      <button class="btn" id="addB">+ Thêm khối</button>
      <button class="btn btn--ghost" id="delS" style="margin-left:auto">Xóa buổi</button>
    </div>
    <div style="position:sticky;bottom:72px;z-index:5"><button class="btn" id="save" style="width:100%">Lưu buổi</button></div>

    <dialog id="dex"><div class="stack" style="min-width:min(90vw,520px)">
      <h2 style="margin:0">Chọn bài tập</h2>
      <input class="input" id="exq" placeholder="Gõ tên bài (không cần dấu)…" autocomplete="off">
      <select id="exc"><option value="">Mọi nhóm</option>${Object.entries(CATEGORY_VI).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      <ul class="list" id="exl" style="max-height:50vh;overflow:auto"></ul>
      <button class="btn btn--ghost" data-close>Đóng</button>
    </div></dialog>`);

  $('#st').oninput = (e) => { cur.title = e.target.value; mark(); };
  $('#sn').oninput = (e) => { cur.coach_note = e.target.value || null; mark(); };
  $('#sy').onchange = (e) => { cur.session_type = e.target.value; mark(); };
  $('#sm').onchange = (e) => { cur.mode = e.target.value; mark(); };
  $('#sd').onchange = (e) => { cur.day_no = +e.target.value; cur.scheduled_on = sessionDate(phase.start_date, cur.week_no, cur.day_no); mark(); drawBlocks(); };
  $('#back').onclick = (e) => { if (dirty && !confirm('Buổi chưa được lưu. Bỏ thay đổi?')) e.preventDefault(); };

  // ---------- Vẽ khối & bài ----------
  function drawBlocks() {
    $('#blocks').innerHTML = cur.blocks.map((b, bi) => `
      <div class="card" data-blk="${bi}">
        <div class="row row--between" style="gap:6px">
          <select data-bk="block_type" style="max-width:150px">${Object.entries(BLOCK_VI).map(([k, l]) => `<option value="${k}"${k === b.block_type ? ' selected' : ''}>${l}</option>`).join('')}</select>
          <input class="input" data-bk="label" value="${esc(b.label || '')}" placeholder="Nhãn (A, B…)" style="max-width:110px">
          <span style="flex:1"></span>
          <button class="btn btn--ghost small" data-bmv="-1" ${bi === 0 ? 'disabled' : ''} aria-label="Lên">↑</button>
          <button class="btn btn--ghost small" data-bmv="1" ${bi === cur.blocks.length - 1 ? 'disabled' : ''} aria-label="Xuống">↓</button>
          <button class="btn btn--ghost small" data-bdel aria-label="Xóa khối">✕</button>
        </div>
        ${BLOCK_FIELDS[b.block_type].length ? `<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">${BLOCK_FIELDS[b.block_type].map((k) => `
          <label class="field" style="flex:1;min-width:110px"><span>${BF_VI[k]}</span><input class="input" type="number" min="0" data-bk="${k}" value="${b[k] ?? ''}"></label>`).join('')}</div>` : ''}
        <input class="input" data-bk="note" value="${esc(b.note || '')}" placeholder="Ghi chú khối (không bắt buộc)" style="margin-top:8px">
        <div class="stack" style="margin-top:8px">${b.items.map((it, ii) => itemHtml(b, it, ii)).join('') || '<p class="small muted">Chưa có bài.</p>'}</div>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">
          <button class="btn small" data-addi>+ Bài</button>
          ${b.block_type === 'corrective' ? '<button class="btn btn--ghost small" data-ohsa>Lấy từ OHSA gần nhất</button>' : ''}
          ${b.block_type === 'hyrox' ? '<button class="btn btn--ghost small" data-cmp>Chèn chạy compromised</button>' : ''}
        </div>
      </div>`).join('') || '<div class="card"><p class="muted">Buổi chưa có khối nào. Chọn loại khối rồi bấm "+ Thêm khối".</p></div>';
  }
  function itemHtml(b, it, ii) {
    const ex = exById.get(it.exercise_id);
    const rk = ruleKey(it.progression_rule, cur.day_no);
    return `<div class="card" style="background:var(--bg);margin:0" data-it="${ii}">
      <div class="row" style="gap:6px">
        <button class="btn btn--ghost small" data-pick style="flex:1;justify-content:flex-start;text-align:left">${ex ? `<strong>${esc(ex.name_vi)}</strong>` : '<em>Chọn bài…</em>'}</button>
        <button class="btn btn--ghost small" data-imv="-1" ${ii === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn btn--ghost small" data-imv="1" ${ii === b.items.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="btn btn--ghost small" data-idel>✕</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px;margin-top:6px">
        ${fieldsFor(b, ex).map((k) => `<label class="field" style="margin:0"><span class="small">${F_VI[k]}</span><input class="input" data-ik="${k}" ${TEXT_F.has(k) ? '' : 'type="number" step="any" min="0"'} value="${esc(it[k] ?? '')}"></label>`).join('')}
      </div>
      <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap">
        <select data-rule style="flex:1;min-width:180px">${Object.entries(RULE_VI).map(([k, l]) => `<option value="${k}"${k === rk ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <input class="input" data-ik="note" value="${esc(it.note || '')}" placeholder="Ghi chú bài" style="flex:2;min-width:160px">
      </div>
      <p class="small muted" style="margin:4px 0 0" data-sum>${esc(itemSummary(it))}</p>
    </div>`;
  }

  // ---------- Sự kiện (ủy quyền) ----------
  const where = (el) => { const bEl = el.closest('[data-blk]'), iEl = el.closest('[data-it]'); return { bi: bEl ? +bEl.dataset.blk : -1, ii: iEl ? +iEl.dataset.it : -1, iEl }; };
  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
  $('#blocks').addEventListener('input', (e) => {
    const t = e.target, { bi, ii, iEl } = where(t);
    if (bi < 0) return;
    const b = cur.blocks[bi];
    const val = t.type === 'number' ? (t.value === '' ? null : Number(t.value)) : (t.value.trim() || null);
    if (t.dataset.ik) { b.items[ii][t.dataset.ik] = val; iEl.querySelector('[data-sum]').textContent = itemSummary(b.items[ii]); mark(); }
    else if (t.dataset.bk && t.tagName === 'INPUT') { b[t.dataset.bk] = val; mark(); }
  });
  $('#blocks').addEventListener('change', (e) => {
    const t = e.target, { bi, ii } = where(t);
    if (t.dataset.bk === 'block_type') {
      const b = cur.blocks[bi]; b.block_type = t.value;
      for (const k of ['rounds', 'work_sec', 'rest_sec', 'time_cap_sec']) if (!BLOCK_FIELDS[t.value].includes(k)) b[k] = null;
      mark(); drawBlocks();
    } else if (t.dataset.rule !== undefined) { cur.blocks[bi].items[ii].progression_rule = ruleFromKey(t.value, cur.day_no); mark(); }
  });
  $('#blocks').addEventListener('click', async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    const { bi, ii } = where(t), b = cur.blocks[bi];
    if (t.dataset.bmv) { move(cur.blocks, bi, +t.dataset.bmv); }
    else if (t.dataset.bdel !== undefined) { if (b.items.length && !confirm(`Xóa khối có ${b.items.length} bài?`)) return; cur.blocks.splice(bi, 1); }
    else if (t.dataset.imv) { move(b.items, ii, +t.dataset.imv); }
    else if (t.dataset.idel !== undefined) { b.items.splice(ii, 1); }
    else if (t.dataset.addi !== undefined) { return pickExercise(b, (id) => { b.items.push(blankItem(id)); }); }
    else if (t.dataset.pick !== undefined) { return pickExercise(b, (id) => { b.items[ii].exercise_id = id; }); }
    else if (t.dataset.ohsa !== undefined) {
      const a = await latestOhsa(session.client_id);
      const add = correctiveFromOhsa(a?.ohsa, exList);
      if (!add.length) return toast(a ? 'OHSA gần nhất không có bù trừ nào được đánh dấu.' : 'Khách chưa có đánh giá OHSA (vào trang khách để nhập).', 'error');
      const have = new Set(b.items.map((i) => i.exercise_id));
      b.items.push(...add.filter((i) => !have.has(i.exercise_id)));
      toast(`Đã thêm bài corrective theo OHSA ngày ${a.assessed_on.split('-').reverse().join('/')}.`);
    } else if (t.dataset.cmp !== undefined) {
      const run = exList.find((x) => norm(x.name_vi).includes('compromised'));
      if (!run) return toast('Không tìm thấy bài "Chạy compromised 1 km" trong thư viện.', 'error');
      b.items = interleaveCompromised(b.items, run);
    } else return;
    mark(); drawBlocks();
  });
  $('#addB').onclick = () => {
    const type = $('#nbt').value;
    cur.blocks.push({ block_type: type, label: String.fromCharCode(65 + cur.blocks.length), rounds: type === 'circuit' || type === 'hyrox' ? 3 : null, items: [] });
    mark(); drawBlocks();
  };

  // ---------- Chọn bài ----------
  const dex = $('#dex');
  dex.querySelector('[data-close]').onclick = () => dex.close();
  let onPick = null;
  const drawEx = () => {
    const rows = filterExercises(exList, { q: $('#exq').value, category: $('#exc').value }).slice(0, 60);
    $('#exl').innerHTML = rows.map((x) => `<li><button class="btn btn--ghost" data-id="${x.id}" style="width:100%;justify-content:flex-start;text-align:left">
      ${x.featured ? '★ ' : ''}${esc(x.name_vi)} <span class="small muted">· ${esc(vi(CATEGORY_VI, x.category))}</span></button></li>`).join('') || '<li class="small muted">Không có bài phù hợp.</li>';
  };
  $('#exq').oninput = drawEx; $('#exc').onchange = drawEx;
  $('#exl').onclick = (e) => { const b = e.target.closest('[data-id]'); if (!b) return; onPick(b.dataset.id); dex.close(); mark(); drawBlocks(); };
  function pickExercise(block, cb) {
    onPick = cb; $('#exq').value = '';
    $('#exc').value = { run: 'run', hyrox: 'hyrox', corrective: 'corrective' }[block.block_type] || '';
    drawEx(); dex.showModal(); $('#exq').focus();
  }

  // ---------- Lưu / xóa ----------
  $('#save').onclick = async (e) => {
    if (cur.blocks.some((b) => b.items.some((i) => !i.exercise_id))) return toast('Còn bài chưa chọn — bấm "Chọn bài…" hoặc xóa dòng đó.', 'error');
    if (!cur.title?.trim()) return toast('Nhập tên buổi.', 'error');
    let saved = false;
    await busy(e.currentTarget, async () => {
      try { await saveSession(cur, prev); prev = clone(cur); dirty = false; saved = true; toast('Đã lưu buổi tập.'); }
      catch (err) { toast(viError(err), 'error'); }
    });
    if (saved) { $('#save').classList.remove('btn--primary'); $('#save').textContent = 'Đã lưu ✓'; }
  };
  $('#delS').onclick = async (e) => {
    if (!confirm(`Xóa buổi "${cur.title}"? Không hoàn tác được.`)) return;
    await busy(e.currentTarget, async () => {
      try { await deleteSessions([cur.id]); dirty = false; toast('Đã xóa buổi.'); location.hash = back; } catch (err) { toast(viError(err), 'error'); }
    });
  };
  drawBlocks();
}
