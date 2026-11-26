// DINO-009 — Khách: lịch tập theo tuần (chỉ giai đoạn đã phát hành) + xem chi tiết buổi
import { render, $, esc } from '../../ui.js';
import { clientTabs } from './home.js';
import { loadExercises } from '../../lib/exercises.js';
import { DAY_VI, SESSION_TYPE_VI, addDays, todayISO, itemSummary, blockSummary } from '../../lib/plan.js';
import { loadPlan, loadSession } from '../../lib/planStore.js';

const dm = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');

/** Tuần đang diễn ra (hoặc gần nhất) trong các giai đoạn đã phát hành */
export function currentWeek(phases, today) {
  const ok = phases.filter((p) => p.start_date).sort((a, b) => a.start_date.localeCompare(b.start_date));
  if (!ok.length) return null;
  let ph = ok.find((p) => today >= p.start_date && today <= p.end_date)
    || ok.find((p) => p.start_date > today) || ok[ok.length - 1];
  const diff = Math.floor((Date.parse(today) - Date.parse(ph.start_date)) / 864e5);
  const week = Math.min(Math.max(Math.floor(diff / 7) + 1, 1), ph.weeks);
  return { phase: ph, week };
}

export async function clientPlanView({ profile }) {
  clientTabs();
  const programs = await loadPlan(profile.id, { publishedOnly: true });
  const phases = programs.flatMap((p) => p.phases);
  const today = todayISO();
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  const auto = currentWeek(phases, today);
  if (!auto) {
    render(`<h1>Lịch tập</h1><div class="card"><p><strong>Chưa có lịch tập.</strong></p>
      <p class="muted small">Coach đang chuẩn bị giáo án cho bạn. Khi được phát hành, lịch theo tuần sẽ hiện ở đây.</p></div>`);
    return;
  }
  const phase = phases.find((p) => p.id === qs.get('phase')) || auto.phase;
  const week = Math.min(Math.max(+(qs.get('w') || (phase.id === auto.phase.id ? auto.week : 1)), 1), phase.weeks);
  const idx = phases.indexOf(phase);
  const prevLink = week > 1 ? `?phase=${phase.id}&w=${week - 1}` : idx > 0 ? `?phase=${phases[idx - 1].id}&w=${phases[idx - 1].weeks}` : null;
  const nextLink = week < phase.weeks ? `?phase=${phase.id}&w=${week + 1}` : idx < phases.length - 1 ? `?phase=${phases[idx + 1].id}&w=1` : null;
  const ss = phase.sessions.filter((s) => s.week_no === week).sort((a, b) => a.day_no - b.day_no);
  const start = addDays(phase.start_date, (week - 1) * 7);

  render(`
    <h1>Lịch tập</h1>
    <div class="card"><strong>${esc(phase.name)}</strong>
      <div class="small muted">Giai đoạn ${idx + 1}/${phases.length} · ${phase.weeks} tuần · ${dm(phase.start_date)} → ${dm(phase.end_date)}</div>
      ${phase.handover_note ? `<p class="small" style="margin-top:8px">${esc(phase.handover_note).replace(/\n/g, '<br>')}</p>` : ''}</div>
    <div class="row row--between" style="margin:8px 0">
      ${prevLink ? `<a class="btn btn--ghost small" href="#/client/plan${prevLink}">← Tuần trước</a>` : '<span></span>'}
      <strong>Tuần ${week} · ${dm(start)}–${dm(addDays(start, 6))}</strong>
      ${nextLink ? `<a class="btn btn--ghost small" href="#/client/plan${nextLink}">Tuần sau →</a>` : '<span></span>'}
    </div>
    <ul class="list">${ss.map((s) => `<li${s.scheduled_on === today ? ' style="border-left:4px solid var(--accent)"' : ''}>
      <a href="#/client/session/${s.id}" style="flex:1;color:var(--text);text-decoration:none">
        <strong>${DAY_VI[s.day_no - 1]} ${dm(s.scheduled_on)}${s.scheduled_on === today ? ' · Hôm nay' : ''}</strong>
        <div>${esc(s.title || 'Buổi tập')}</div>
        <div class="small muted">${esc(SESSION_TYPE_VI[s.session_type] || '')} · ${s.blocks.reduce((n, b) => n + b.items.length, 0)} bài</div></a></li>`).join('')
      || '<li class="small muted">Tuần này không có buổi tập — nghỉ ngơi hồi phục.</li>'}</ul>`);
}

export async function clientSessionView({ params, profile }) {
  if (profile.role === 'client') clientTabs();
  const [{ session: s, phase }, exList] = await Promise.all([loadSession(params.id), loadExercises()]);
  if (phase.status === 'draft' && profile.role === 'client') { render('<div class="card"><p>Buổi tập này chưa được phát hành.</p><a href="#/client/plan">← Lịch tập</a></div>'); return; }
  const exById = new Map(exList.map((e) => [e.id, e]));
  render(`
    <p class="small"><a href="#/client/plan?phase=${phase.id}&w=${s.week_no}">← Lịch tập</a></p>
    <h1 style="margin-bottom:0">${esc(s.title || 'Buổi tập')}</h1>
    <p class="muted small">${DAY_VI[s.day_no - 1]} ${dm(s.scheduled_on)} · tuần ${s.week_no} · ${esc(SESSION_TYPE_VI[s.session_type] || '')}</p>
    ${s.coach_note ? `<div class="card"><strong>Coach dặn:</strong> ${esc(s.coach_note).replace(/\n/g, '<br>')}</div>` : ''}
    ${s.blocks.map((b) => `<div class="card">
      <div class="row row--between"><strong>${esc(b.label ? b.label + '. ' : '')}${esc(blockSummary(b))}</strong></div>
      ${b.note ? `<p class="small muted">${esc(b.note)}</p>` : ''}
      <ul class="list">${b.items.map((it) => { const ex = exById.get(it.exercise_id); return `<li>
        <a href="#/exercise/${it.exercise_id}" style="flex:1;color:var(--text);text-decoration:none">
          <strong>${esc(ex?.name_vi || 'Bài tập')}</strong>
          <div class="small">${esc(itemSummary(it))}</div>
          ${it.note ? `<div class="small muted">${esc(it.note)}</div>` : ''}</a>
        ${ex?.image_urls?.[0] ? `<img src="${esc(ex.image_urls[0])}" alt="" loading="lazy" style="width:56px;height:56px;object-fit:cover;border-radius:8px;background:#fff">` : ''}</li>`; }).join('')}</ul>
    </div>`).join('') || '<div class="card"><p class="muted">Buổi này chưa có bài.</p></div>'}
    <div class="card"><p class="small muted">Ghi kết quả từng hiệp (tạ, reps, RPE) sẽ có ở bản cập nhật tiếp theo.</p></div>`);
}
