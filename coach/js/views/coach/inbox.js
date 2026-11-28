// DINO-010 — Hộp việc (Coach): cảnh báo → tin chưa đọc → buổi vừa xong chưa xem
import { render, $, esc, toast, busy } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { coachTabs } from './home.js';
import { DAY_VI, addDays, mondayOf, todayISO } from '../../lib/plan.js';
import { missedLastWeek, weeklyKm } from '../../lib/sessionLog.js';
import { runningLoadAlert } from '../../lib/formulas.js';
import { openAlerts, addAlerts, resolveAlert, unreadBySession } from '../../lib/logStore.js';
import { unrepliedCheckins } from '../../lib/checkinStore.js';

const dm = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');
const must = ({ data, error }) => { if (error) throw error; return data; };
const KIND_VI = { pain: 'Đau', high_rpe: 'RPE cao', missed: 'Bỏ buổi', run_load: 'Km tăng nhanh' };

/** Tính cảnh báo "bỏ buổi tuần trước" + "km chạy tăng > 110%" cho mọi khách, ghi vào bảng alerts (không trùng) */
export async function computeAlerts(clients) {
  const db = await sb(), thisMon = mondayOf(todayISO()), lastMon = addDays(thisMon, -7);
  const mondays = [-28, -21, -14, -7, 0].map((d) => addDays(thisMon, d));
  const ids = clients.map((c) => c.id);
  if (!ids.length) return;
  const [ss, logs] = await Promise.all([
    db.from('sessions').select('id, client_id, phase_id, scheduled_on').in('client_id', ids).gte('scheduled_on', lastMon).lte('scheduled_on', addDays(lastMon, 6)).then(must),
    db.from('set_logs').select('client_id, distance_m, logged_at, done').in('client_id', ids).gte('logged_at', mondays[0]).not('distance_m', 'is', null).then(must),
  ]);
  const phaseIds = [...new Set(ss.map((s) => s.phase_id))];
  const [phases, fbs] = await Promise.all([
    phaseIds.length ? db.from('phases').select('id, status').in('id', phaseIds).then(must) : [],
    ss.length ? db.from('session_feedback').select('session_id, completed').in('session_id', ss.map((s) => s.id)).then(must) : [],
  ]);
  const pub = new Set(phases.filter((p) => p.status !== 'draft').map((p) => p.id));
  const done = new Set(fbs.filter((f) => f.completed).map((f) => f.session_id));
  const rows = [];
  for (const c of clients) {
    const m = missedLastWeek(ss.filter((s) => s.client_id === c.id && pub.has(s.phase_id)), done);
    if (m) rows.push({ client_id: c.id, kind: 'missed', ref_key: lastMon, message: m.message });
    const km = weeklyKm(logs.filter((l) => l.client_id === c.id && l.done !== false).map((l) => ({ distance_m: l.distance_m, day: l.logged_at.slice(0, 10) })), mondays);
    const r = runningLoadAlert(km);
    if (r) rows.push({ client_id: c.id, kind: 'run_load', ref_key: thisMon, message: r.message });
  }
  await addAlerts(rows);
}

export async function coachInboxView({ profile }) {
  coachTabs();
  const db = await sb();
  const clients = must(await db.from('profiles').select('id, full_name').eq('role', 'client'));
  await computeAlerts(clients).catch((e) => console.warn('computeAlerts', e));
  const [cks, unreadCk, unreadPh] = await Promise.all([unrepliedCheckins().then((x) => x.filter((c) => c.client_id !== profile.id)).catch(() => []), unreadBySession(profile.id, null, 'checkin').catch(() => ({})), unreadBySession(profile.id, null, 'phase').catch(() => ({}))]);
  const sevenDaysAgo = addDays(todayISO(), -7);
  const [alerts, unread, fbsRaw, adhocRaw] = await Promise.all([
    openAlerts(),
    unreadBySession(profile.id),
    db.from('session_feedback').select('session_id, client_id, session_rpe, pain, readiness, completed, coach_reviewed, created_at').eq('coach_reviewed', false).order('created_at', { ascending: false }).then(must),
    db.from('sessions').select('id, client_id, title, day_no, scheduled_on, created_at, mode, session_type').eq('adhoc', true).then(must).catch(() => []),
  ]);
  const adhocCandidates = adhocRaw.filter((s) => s.client_id !== profile.id && ((s.created_at && s.created_at.slice(0, 10) >= sevenDaysAgo) || (s.scheduled_on && s.scheduled_on >= sevenDaysAgo)));
  const adhocIds = adhocCandidates.map((s) => s.id);
  const adhocFbs = adhocIds.length ? must(await db.from('session_feedback').select('session_id, coach_reviewed, completed, session_rpe').in('session_id', adhocIds)) : [];
  const adhocFbMap = new Map(adhocFbs.map((f) => [f.session_id, f]));
  const unreviewedAdhoc = adhocCandidates.filter((s) => !adhocFbMap.get(s.id)?.coach_reviewed);

  const fbs = fbsRaw.filter((f) => !unreviewedAdhoc.some((a) => a.id === f.session_id) && (f.completed || (f.readiness?.level === 'red' && (f.readiness.at || f.created_at || '').slice(0, 10) >= sevenDaysAgo)));
  const sids = [...new Set([...Object.keys(unread), ...fbs.map((f) => f.session_id), ...alerts.map((a) => a.ref_id).filter(Boolean), ...unreviewedAdhoc.map((s) => s.id)])];
  const sess = sids.length ? must(await db.from('sessions').select('id, title, day_no, scheduled_on').in('id', sids)) : [];
  const S = new Map(sess.map((s) => [s.id, s])), name = (id) => clients.find((c) => c.id === id)?.full_name || 'Khách';
  for (const s of unreviewedAdhoc) if (!S.has(s.id)) S.set(s.id, s);
  const sLabel = (id) => { const s = S.get(id); return s ? `${esc(s.title || 'Buổi tập')} · ${DAY_VI[s.day_no - 1]} ${dm(s.scheduled_on)}` : 'Buổi tập'; };
  const other = [...Object.entries(unreadCk).map(([id, ms]) => ({ href: `#/coach/checkin/${id}`, label: 'Check-in tuần', ms })), ...Object.entries(unreadPh).map(([id, ms]) => ({ href: `#/phase/${id}`, label: 'Báo cáo giai đoạn', ms }))];
  const total = alerts.length + Object.keys(unread).length + fbs.length + cks.length + other.length + unreviewedAdhoc.length;

  render(`
    <h1>Hộp việc</h1>
    ${!total ? '<div class="card"><p><strong>Không có việc tồn.</strong></p><p class="small muted">Khi khách ghi buổi, nhắn tin hoặc có cảnh báo, việc sẽ hiện ở đây.</p></div>' : ''}
    ${unreviewedAdhoc.length ? `<h2>Buổi tự tập ngoài lịch (${unreviewedAdhoc.length})</h2><div class="card"><ul class="list">${unreviewedAdhoc.map((s) => {
      const afb = adhocFbMap.get(s.id);
      return `<li>
        <a href="#/coach/review/${s.id}" style="flex:1;color:var(--text);text-decoration:none">
          <strong>${esc(name(s.client_id))}</strong> · ${sLabel(s.id)}
          <div class="small muted">${afb?.completed ? `Đã hoàn thành · RPE ${afb.session_rpe ?? '—'}` : 'Chưa bấm hoàn thành'} · <span class="badge">Ngoài lịch</span></div>
        </a>
      </li>`;
    }).join('')}</ul></div>` : ''}
    ${alerts.length ? `<h2>Cảnh báo (${alerts.length})</h2><div class="card card--flag"><ul class="list">${alerts.map((a) => `<li>
        <div style="flex:1"><span class="badge badge--hot">⚠ ${KIND_VI[a.kind] || a.kind}</span> <strong>${esc(name(a.client_id))}</strong>
          <div class="small">${esc(a.message)}</div>
          ${a.ref_id ? `<a class="small" href="#/coach/review/${a.ref_id}">${sLabel(a.ref_id)} →</a>` : `<a class="small" href="#/coach/client/${a.client_id}/plan">Mở giáo án →</a>`}</div>
        <button class="btn btn--ghost small" data-resolve="${a.id}">Đã xử lý</button></li>`).join('')}</ul></div>` : ''}
    ${Object.keys(unread).length ? `<h2>Tin chưa đọc (${Object.values(unread).reduce((n, a) => n + a.length, 0)})</h2><div class="card"><ul class="list">${Object.entries(unread).map(([sid, ms]) => `<li>
        <a href="#/coach/review/${sid}" style="flex:1;color:var(--text);text-decoration:none"><strong>${esc(name(ms[0].client_id))}</strong> · ${sLabel(sid)}
          <div class="small muted">${esc(ms[ms.length - 1].body.slice(0, 90))}</div></a><span class="badge">${ms.length}</span></li>`).join('')}</ul></div>` : ''}
    ${other.length ? `<h2>Tin khác chưa đọc (${other.reduce((n, o) => n + o.ms.length, 0)})</h2><div class="card"><ul class="list">${other.map((o) => `<li>
        <a href="${o.href}" style="flex:1;color:var(--text);text-decoration:none"><strong>${esc(name(o.ms[0].client_id))}</strong> · ${o.label}
          <div class="small muted">${esc(o.ms[o.ms.length - 1].body.slice(0, 90))}</div></a><span class="badge">${o.ms.length}</span></li>`).join('')}</ul></div>` : ''}
    ${cks.length ? `<h2>Check-in chờ trả lời (${cks.length})</h2><div class="card"><ul class="list">${cks.map((c) => `<li>
        <a href="#/coach/checkin/${c.id}" style="flex:1;color:var(--text);text-decoration:none"><strong>${esc(name(c.client_id))}</strong> · tuần ${dm(c.week_start)}
          <div class="small muted">${c.avg_weight_kg != null ? String(Number(c.avg_weight_kg)).replace('.', ',') + ' kg · ' : ''}buổi ${c.sessions_pct ?? '—'}% · ăn ${c.eat_pct ?? '—'}%</div></a></li>`).join('')}</ul></div>` : ''}
    ${fbs.length ? `<h2>Buổi vừa xong chưa xem (${fbs.length})</h2><div class="card"><ul class="list">${fbs.map((f) => `<li>
        <a href="#/coach/review/${f.session_id}" style="flex:1;color:var(--text);text-decoration:none"><strong>${esc(name(f.client_id))}</strong> · ${sLabel(f.session_id)}
          <div class="small muted">${f.readiness?.level === 'red' ? '<span class="badge badge--hot" style="margin-right:6px">Readiness thấp</span> ' : ''}${f.completed ? `RPE ${f.session_rpe ?? '—'}` : 'Chưa hoàn thành'}${f.pain?.length ? ' · <span style="color:var(--danger)">có đau</span>' : ''}</div></a></li>`).join('')}</ul></div>` : ''}`);

  document.querySelectorAll('[data-resolve]').forEach((b) => (b.onclick = async () => {
    await busy(b, async () => { try { await resolveAlert(b.dataset.resolve); toast('Đã đóng cảnh báo.'); coachInboxView({ profile }); } catch (err) { toast(viError(err), 'error'); } });
  }));
}
