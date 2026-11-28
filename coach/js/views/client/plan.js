// DINO-009 — Khách: lịch tập theo tuần (chỉ giai đoạn đã phát hành) + xem chi tiết buổi
import { render, $, esc } from '../../ui.js';
import { clientTabs } from './home.js';
import { DAY_VI, SESSION_TYPE_VI, addDays, todayISO } from '../../lib/plan.js';
import { reportOpen } from '../../lib/checkin.js';
import { loadPlan } from '../../lib/planStore.js';
import { feedbackFor, unreadBySession } from '../../lib/logStore.js';

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
  const [programs, fbs, unread] = await Promise.all([loadPlan(profile.id, { publishedOnly: true }), feedbackFor(profile.id).catch(() => []), unreadBySession(profile.id).catch(() => ({}))]);
  const done = new Set(fbs.filter((f) => f.completed).map((f) => f.session_id));
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
      ${phase.handover_note ? `<p class="small" style="margin-top:8px">${esc(phase.handover_note).replace(/\n/g, '<br>')}</p>` : ''}
      ${reportOpen(phase, today, false) ? `<a class="btn btn--primary btn--block" href="#/phase/${phase.id}" style="margin-top:10px">Báo cáo giai đoạn →</a>` : ''}</div>
    <div class="row row--between" style="margin:8px 0">
      ${prevLink ? `<a class="btn btn--ghost small" href="#/client/plan${prevLink}">← Tuần trước</a>` : '<span></span>'}
      <strong>Tuần ${week} · ${dm(start)}–${dm(addDays(start, 6))}</strong>
      ${nextLink ? `<a class="btn btn--ghost small" href="#/client/plan${nextLink}">Tuần sau →</a>` : '<span></span>'}
    </div>
    <ul class="list">${ss.map((s) => `<li${s.scheduled_on === today ? ' style="border-left:3px solid var(--a1);padding-left:10px"' : ''}>
      <a href="#/client/session/${s.id}" style="flex:1;color:var(--text);text-decoration:none">
        <strong>${DAY_VI[s.day_no - 1]} ${dm(s.scheduled_on)}${s.scheduled_on === today ? ' · Hôm nay' : ''}</strong>${done.has(s.id) ? ' <span class="badge badge--ok">✓ Đã tập</span>' : ''}${unread[s.id] ? ` <span class="badge badge--hot">${unread[s.id].length} tin mới</span>` : ''}
        <div>${esc(s.title || 'Buổi tập')}</div>
        <div class="small muted">${s.mode === 'pt' ? '<b style="color:var(--tint)">Tập với Coach</b> · ' : ''}${esc(SESSION_TYPE_VI[s.session_type] || '')} · ${s.blocks.reduce((n, b) => n + b.items.length, 0)} bài</div></a></li>`).join('')
      || '<li class="small muted">Tuần này không có buổi tập — nghỉ ngơi hồi phục.</li>'}</ul>`);
}
