// DINO-009 — Giáo án của 1 khách (Coach): chương trình → giai đoạn → lưới tuần × buổi
import { render, $, esc, toast, busy, fmtDate } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { loadExercises, norm } from '../../lib/exercises.js';
import { DAY_VI, MODEL_VI, GOAL_VI, SESSION_TYPE_VI, addDays, mondayOf, todayISO, phaseEnd, sessionDate, generateWeeks, templateToTree, treeToTemplate } from '../../lib/plan.js';
import { loadPlan, createProgram, createPhase, updatePhase, deletePhase, insertSessions, deleteSessions, setPhaseStatus, listTemplates, saveTemplate, loadAdhocSessions } from '../../lib/planStore.js';

const opts = (map, cur) => Object.entries(map).map(([k, l]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${esc(l)}</option>`).join('');
const nextMonday = () => addDays(mondayOf(todayISO()), 7);
const dm = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');

export async function coachPlanView({ params, profile }) {
  coachTabs();
  const clientId = params.id;
  const db = await sb();
  const [{ data: client, error }, programs, templates, adhocAll] = await Promise.all([
    db.from('profiles').select('id, full_name').eq('id', clientId).single(),
    loadPlan(clientId),
    listTemplates().catch(() => []),
    loadAdhocSessions(clientId).catch(() => []),
  ]);
  if (error) throw error;
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  const program = programs[programs.length - 1] || null; // chương trình mới nhất
  const phases = program?.phases || [];
  const phase = phases.find((p) => p.id === qs.get('phase')) || phases.find((p) => p.status === 'draft') || phases[phases.length - 1] || null;
  const reload = (phaseId) => { const h = `#/coach/client/${clientId}/plan${phaseId ? '?phase=' + phaseId : ''}`; if (location.hash === h) coachPlanView({ params, profile }); else location.hash = h; };

  const tplSelect = `<select name="tpl"><option value="">— Không dùng mẫu (tự soạn) —</option>${templates.map((t) => `<option value="${t.id}">${esc(t.name)} · ${t.weeks} tuần</option>`).join('')}</select>`;

  render(`
    <p class="small"><a href="#/coach/client/${clientId}">← ${esc(client.full_name || 'Khách')}</a></p>
    <div class="row row--between">
      <h1 style="margin:0">Giáo án</h1>
      <a class="btn btn--primary small" href="#/client/adhoc/new?client=${clientId}&mode=pt">+ Buổi ngoài lịch</a>
    </div>
    ${!program ? `
      <div class="card"><p>Khách chưa có giáo án.</p>
      <form id="np" class="stack">
        <label class="field"><span>Tên chương trình</span><input class="input" name="name" value="Chương trình của ${esc(client.full_name || 'khách')}" required></label>
        <label class="field"><span>Mô hình chu kỳ</span><select name="model">${opts(MODEL_VI, 'linear')}</select></label>
        <label class="field"><span>Ngày bắt đầu (nên là thứ Hai)</span><input class="input" type="date" name="start" value="${nextMonday()}" required></label>
        <label class="field"><span>Bắt đầu từ mẫu</span>${tplSelect}</label>
        <label class="row small"><input type="checkbox" name="gen" checked> Có mẫu thì sinh luôn các tuần còn lại</label>
        <button class="btn btn--primary">Tạo giáo án</button>
      </form></div>` : `
      <div class="card"><div class="row row--between"><div><strong>${esc(program.name)}</strong>
        <div class="small muted">${esc(MODEL_VI[program.model] || '')} · bắt đầu ${fmtDate(program.start_date)}</div></div>
        <span class="badge ${program.status === 'published' ? 'badge--ok' : ''}">${program.status === 'published' ? 'Đã phát hành' : 'Nháp'}</span></div></div>

      <div class="row" style="flex-wrap:wrap;gap:6px;margin:8px 0">
        ${phases.map((p) => `<a class="btn small ${p.id === phase?.id ? 'btn--primary' : ''}" href="#/coach/client/${clientId}/plan?phase=${p.id}">${p.order_no}. ${esc(p.name)}</a>`).join('')}
        <button class="btn btn--ghost small" id="addPh">+ Giai đoạn</button>
      </div>

      ${phase ? `
      <div class="card">
        <div class="row row--between"><div><h2 style="margin:0">${esc(phase.name)}</h2>
          <div class="small muted">${phase.weeks} tuần · ${fmtDate(phase.start_date)} → ${fmtDate(phase.end_date)}${phase.goal ? ' · ' + esc(GOAL_VI[phase.goal] || phase.goal) : ''}</div></div>
          <span class="badge ${phase.status === 'draft' ? '' : 'badge--ok'}">${phase.status === 'draft' ? 'Nháp — khách chưa thấy' : 'Đã phát hành'}</span></div>
        ${phase.handover_note ? `<p class="small" style="margin-top:8px"><strong>Ghi chú bàn giao:</strong> ${esc(phase.handover_note)}</p>` : ''}
        <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">
          <button class="btn small" id="edPh">Sửa giai đoạn</button>
          <button class="btn small" id="gen">Sinh tuần 2–${phase.weeks} từ tuần 1</button>
          <button class="btn small ${phase.status === 'draft' ? 'btn--primary' : ''}" id="pub">${phase.status === 'draft' ? 'Phát hành cho khách' : 'Thu hồi về nháp'}</button>
          <a class="btn small" href="#/phase/${phase.id}">Báo cáo giai đoạn</a>
          <button class="btn btn--ghost small" id="tplSave">Lưu thành mẫu</button>
          ${phase.status === 'draft' ? '<button class="btn btn--ghost small" id="delPh">Xóa giai đoạn</button>' : ''}
        </div>
      </div>
      ${Array.from({ length: phase.weeks }, (_, i) => i + 1).map((w) => {
        const ss = phase.sessions.filter((s) => s.week_no === w).sort((a, b) => a.day_no - b.day_no);
        const start = sessionDate(phase.start_date, w, 1);
        const end = addDays(start, 6);
        const adhocWeek = adhocAll.filter((a) => a.scheduled_on >= start && a.scheduled_on <= end);
        return `<div class="card"><div class="row row--between"><strong>Tuần ${w}${w === phase.weeks && phase.weeks > 1 ? ' <span class="small muted">(deload nếu sinh tự động)</span>' : ''}</strong>
          <span class="small muted">${dm(start)}–${dm(end)}</span></div>
          <ul class="list">${ss.map((s) => `<li><a href="#/coach/session/${s.id}" style="flex:1;color:var(--text);text-decoration:none">
              <strong>${DAY_VI[s.day_no - 1]} · ${esc(s.title || 'Buổi tập')}</strong>
              <div class="small muted">${s.mode === 'pt' ? '<b style="color:var(--tint)">PT</b> · ' : ''}${esc(SESSION_TYPE_VI[s.session_type] || '')} · ${s.blocks.length} khối · ${s.blocks.reduce((n, b) => n + b.items.length, 0)} bài</div></a>
              <span class="small muted">${dm(s.scheduled_on)}</span></li>`).join('') || '<li class="small muted">Chưa có buổi trong giáo án.</li>'}</ul>
          ${adhocWeek.length ? `
            <div style="margin-top:8px;padding-top:6px;border-top:1px dashed rgba(255,255,255,.12)">
              <div class="small muted" style="margin-bottom:4px">Buổi ngoài lịch (${adhocWeek.length}):</div>
              <ul class="list">${adhocWeek.map((s) => `
                <li><a href="#/coach/review/${s.id}" style="flex:1;color:var(--text);text-decoration:none">
                  <strong>${dm(s.scheduled_on)} · ${esc(s.title || 'Buổi tự do')}</strong>
                  <span class="badge">Ngoài lịch</span>
                  <div class="small muted">${s.mode === 'pt' ? '<b style="color:var(--tint)">PT</b> · ' : ''}${esc(SESSION_TYPE_VI[s.session_type] || '')} · ${(s.blocks || []).reduce((n, b) => n + (b.items?.length || 0), 0)} bài</div>
                </a></li>
              `).join('')}</ul>
            </div>
          ` : ''}
          <div class="row" style="gap:6px;margin-top:8px"><button class="btn btn--ghost small" data-add="${w}">+ Buổi</button>
            <a class="btn btn--ghost small" href="#/client/adhoc/new?client=${clientId}&date=${start}">+ Buổi ngoài lịch</a>
            ${w > 1 ? `<button class="btn btn--ghost small" data-copy="${w}">Chép tuần ${w - 1} sang</button>` : ''}</div></div>`;
      }).join('')}` : '<div class="card"><p class="muted">Chưa có giai đoạn. Bấm "+ Giai đoạn".</p></div>'}`}

    <dialog id="dph"><form method="dialog" id="fph">
      <h2 id="tph">Giai đoạn mới</h2>
      <label class="field"><span>Tên giai đoạn</span><input class="input" name="name" required placeholder="Ví dụ: Nền tảng, Tích lũy, Tăng cường…"></label>
      <div class="row"><label class="field" style="flex:1"><span>Số tuần</span><input class="input" name="weeks" type="number" min="1" max="16" value="4" required></label>
        <label class="field" style="flex:1"><span>Mục tiêu</span><select name="goal"><option value="">—</option>${opts(GOAL_VI)}</select></label></div>
      <label class="field"><span>Ngày bắt đầu</span><input class="input" type="date" name="start" required></label>
      <label class="field"><span>Ghi chú bàn giao cho khách</span><textarea name="note" rows="3"></textarea></label>
      <label class="field" id="tplRow"><span>Bắt đầu từ mẫu</span>${tplSelect}</label>
      <div class="row"><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary" style="flex:1">Lưu</button></div>
    </form></dialog>

    <dialog id="dtp"><form method="dialog" id="ftp">
      <h2>Lưu tuần 1 thành mẫu</h2>
      <label class="field"><span>Tên mẫu (trùng tên mẫu cũ sẽ ghi đè)</span><input class="input" name="name" required></label>
      <div class="row"><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary" style="flex:1">Lưu mẫu</button></div>
    </form></dialog>

    <dialog id="dss"><form method="dialog" id="fss">
      <h2>Thêm buổi — tuần <span id="sw"></span></h2>
      <label class="field"><span>Ngày</span><select name="day">${DAY_VI.map((d, i) => `<option value="${i + 1}">${d}</option>`).join('')}</select></label>
      <label class="field"><span>Tên buổi</span><input class="input" name="title" placeholder="Ví dụ: Upper – Nặng" required></label>
      <label class="field"><span>Loại</span><select name="type">${opts(SESSION_TYPE_VI, 'strength')}</select></label>
      <div class="row"><button type="button" class="btn btn--ghost" data-close>Hủy</button><button class="btn btn--primary" style="flex:1">Thêm & soạn</button></div>
    </form></dialog>`);

  document.querySelectorAll('dialog [data-close]').forEach((b) => (b.onclick = () => b.closest('dialog').close()));
  const exList = await loadExercises();
  const exByName = new Map(exList.map((e) => [norm(e.name_vi), e]));
  const fromTemplate = (tplId) => { const t = templates.find((x) => x.id === tplId); return t ? templateToTree(t.payload, exByName, norm) : null; };
  const warnMissing = (tree) => { if (tree?.missing.length) toast(`Mẫu có ${tree.missing.length} bài không tìm thấy trong thư viện (đã bỏ qua): ${tree.missing.slice(0, 3).join(', ')}`, 'error'); };
  const cleanTree = (sessions) => sessions.map((s) => ({ ...s, blocks: s.blocks.map((b) => ({ ...b, items: b.items.filter((i) => i.exercise_id) })) }));

  // ---- Tạo giáo án lần đầu ----
  $('#np')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, tree = fromTemplate(f.tpl.value);
    await busy(e.submitter, async () => {
      try {
        const pr = await createProgram(clientId, { name: f.name.value.trim(), model: tree?.model || f.model.value, start_date: f.start.value });
        const ph = await createPhase(clientId, { ...pr, phases: [] }, { name: tree?.phase.name || 'Giai đoạn 1', goal: tree?.phase.goal, weeks: tree?.phase.weeks || 4, start_date: f.start.value, handover_note: tree?.phase.handover_note });
        if (tree) {
          const w1 = cleanTree(tree.sessions);
          await insertSessions(clientId, ph, w1);
          if (f.gen.checked) await insertSessions(clientId, ph, generateWeeks(w1, ph.weeks, { phaseStart: ph.start_date }));
        }
        toast('Đã tạo giáo án.'); warnMissing(tree); reload(ph.id);
      } catch (err) { toast(viError(err), 'error'); }
    });
  });

  // ---- Giai đoạn: thêm / sửa ----
  const dph = $('#dph'), fph = $('#fph');
  let editingPhase = null;
  $('#addPh')?.addEventListener('click', () => {
    editingPhase = null; fph.reset(); $('#tph').textContent = 'Giai đoạn mới'; $('#tplRow').hidden = false;
    const last = phases[phases.length - 1];
    fph.start.value = last?.end_date ? addDays(last.end_date, 1) : (program.start_date || nextMonday());
    fph.name.value = `Giai đoạn ${phases.length + 1}`;
    dph.showModal();
  });
  $('#edPh')?.addEventListener('click', () => {
    editingPhase = phase; $('#tph').textContent = 'Sửa giai đoạn'; $('#tplRow').hidden = true;
    fph.name.value = phase.name; fph.weeks.value = phase.weeks; fph.goal.value = phase.goal || ''; fph.start.value = phase.start_date || ''; fph.note.value = phase.handover_note || '';
    dph.showModal();
  });
  fph.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = { name: fph.name.value.trim(), weeks: +fph.weeks.value, goal: fph.goal.value || null, start_date: fph.start.value, handover_note: fph.note.value.trim() || null };
    await busy(e.submitter, async () => {
      try {
        if (editingPhase) {
          const over = editingPhase.sessions.filter((s) => s.week_no > v.weeks);
          if (over.length && !confirm(`Giảm còn ${v.weeks} tuần sẽ xóa ${over.length} buổi ở các tuần sau. Tiếp tục?`)) return;
          if (over.length) await deleteSessions(over.map((s) => s.id));
          await updatePhase(editingPhase, v); dph.close(); toast('Đã lưu giai đoạn.'); reload(editingPhase.id);
        } else {
          const tree = fromTemplate(fph.tpl.value);
          const ph = await createPhase(clientId, program, { ...v, weeks: tree?.phase.weeks || v.weeks, handover_note: v.handover_note || tree?.phase.handover_note, goal: v.goal || tree?.phase.goal });
          if (tree) { const w1 = cleanTree(tree.sessions); await insertSessions(clientId, ph, w1); await insertSessions(clientId, ph, generateWeeks(w1, ph.weeks, { phaseStart: ph.start_date })); }
          dph.close(); toast('Đã thêm giai đoạn.'); warnMissing(tree); reload(ph.id);
        }
      } catch (err) { toast(viError(err), 'error'); }
    });
  });

  // ---- Thêm buổi / chép tuần ----
  const dss = $('#dss'), fss = $('#fss');
  let addWeek = 1;
  document.querySelectorAll('[data-add]').forEach((b) => (b.onclick = () => { addWeek = +b.dataset.add; $('#sw').textContent = addWeek; fss.reset(); dss.showModal(); }));
  fss.addEventListener('submit', async (e) => {
    e.preventDefault();
    await busy(e.submitter, async () => {
      try {
        const [s] = await insertSessions(clientId, phase, [{ week_no: addWeek, day_no: +fss.day.value, title: fss.title.value.trim(), session_type: fss.type.value, blocks: [] }]);
        dss.close(); location.hash = `#/coach/session/${s.id}`;
      } catch (err) { toast(viError(err), 'error'); }
    });
  });
  document.querySelectorAll('[data-copy]').forEach((b) => (b.onclick = async () => {
    const w = +b.dataset.copy;
    const src = phase.sessions.filter((s) => s.week_no === w - 1), dst = phase.sessions.filter((s) => s.week_no === w);
    if (!src.length) return toast(`Tuần ${w - 1} chưa có buổi.`, 'error');
    if (dst.length && !confirm(`Tuần ${w} đã có ${dst.length} buổi. Ghi đè bằng bản chép của tuần ${w - 1}?`)) return;
    await busy(b, async () => {
      try {
        await deleteSessions(dst.map((s) => s.id));
        await insertSessions(clientId, phase, src.map((s) => ({ ...s, id: undefined, week_no: w, scheduled_on: sessionDate(phase.start_date, w, s.day_no) })));
        toast(`Đã chép tuần ${w - 1} sang tuần ${w}.`); reload(phase.id);
      } catch (err) { toast(viError(err), 'error'); }
    });
  }));

  // ---- Sinh tuần 2…N ----
  $('#gen')?.addEventListener('click', async (e) => {
    const w1 = phase.sessions.filter((s) => s.week_no === 1);
    if (!w1.length) return toast('Soạn tuần 1 trước.', 'error');
    const later = phase.sessions.filter((s) => s.week_no > 1);
    const deload = confirm(`Sinh tuần 2–${phase.weeks} theo quy tắc tăng tải của từng bài.\n\nBấm OK: tuần ${phase.weeks} là tuần deload (giảm 40% số hiệp, RPE −2).\nBấm Hủy: không deload.`);
    if (later.length && !confirm(`Đang có ${later.length} buổi ở tuần 2–${phase.weeks}. Ghi đè toàn bộ?`)) return;
    await busy(e.currentTarget, async () => {
      try {
        await deleteSessions(later.map((s) => s.id));
        await insertSessions(clientId, phase, generateWeeks(w1, phase.weeks, { deload, phaseStart: phase.start_date }));
        toast(`Đã sinh tuần 2–${phase.weeks}${deload ? ', tuần cuối deload' : ''}.`); reload(phase.id);
      } catch (err) { toast(viError(err), 'error'); }
    });
  });

  // ---- Phát hành / thu hồi / mẫu / xóa ----
  $('#pub')?.addEventListener('click', async (e) => {
    const toPub = phase.status === 'draft';
    if (toPub && !phase.sessions.length) return toast('Giai đoạn chưa có buổi nào.', 'error');
    if (!toPub && !confirm('Thu hồi: khách sẽ không thấy giai đoạn này nữa. Tiếp tục?')) return;
    await busy(e.currentTarget, async () => {
      try { await setPhaseStatus(phase, program, toPub ? 'published' : 'draft'); toast(toPub ? 'Đã phát hành — khách thấy lịch tập.' : 'Đã thu hồi.'); reload(phase.id); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
  $('#tplSave')?.addEventListener('click', () => {
    const w1 = phase.sessions.filter((s) => s.week_no === 1);
    if (!w1.length) return toast('Tuần 1 chưa có buổi.', 'error');
    ftp.name.value = phase.name; dtp.showModal(); ftp.name.select();
  });
  const dtp = $('#dtp'), ftp = $('#ftp');
  ftp?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = ftp.name.value.trim(); if (!name) return;
    const w1 = phase.sessions.filter((s) => s.week_no === 1);
    await busy(e.submitter, async () => {
      try { await saveTemplate(profile.id, treeToTemplate({ ...phase, name }, program.model, w1, new Map(exList.map((x) => [x.id, x])))); dtp.close(); toast(`Đã lưu mẫu "${name}".`); reload(phase.id); }
      catch (err) { toast(viError(err), 'error'); }
    });
  });
  $('#delPh')?.addEventListener('click', async (e) => {
    if (!confirm(`Xóa giai đoạn "${phase.name}" và ${phase.sessions.length} buổi? Không hoàn tác được.`)) return;
    await busy(e.currentTarget, async () => { try { await deletePhase(phase.id); toast('Đã xóa giai đoạn.'); reload(null); } catch (err) { toast(viError(err), 'error'); } });
  });
}

export { phaseEnd };
