import { render, $, esc, tabbar, icon, ringSvg, shortName } from '../../ui.js';
import { sb } from '../../supabaseClient.js';
import { signOut } from '../../auth.js';
import { go } from '../../router.js';
import { loadIntake } from './intake.js';
import { publishedSessions, loadSession, loadAdhocSessions } from '../../lib/planStore.js';
import { todayISO, addDays, mondayOf, pickNext, SESSION_TYPE_VI, DAY_VI } from '../../lib/plan.js';
import { weeklyAvg } from '../../lib/formulas.js';
import { adherenceRange } from '../../lib/nutrition.js';
import { unreadBySession } from '../../lib/logStore.js';
import { checkinWeekFor, reportOpen } from '../../lib/checkin.js';
import { listCheckins, getReview } from '../../lib/checkinStore.js';
import { loadPackages } from '../../lib/packageStore.js';
import { currentPackage, pkgStatus, pkgLine, autoName, lockState, selfMode, setSelfMode } from '../../lib/packages.js';

export const clientTabs = () => tabbar([
  { href: '#/client', label: 'Hôm nay', icon: 'home' },
  { href: '#/client/plan', label: 'Lịch tập', icon: 'plan', also: ['#/client/session'] },
  { href: '#/client/eat', label: 'Ăn', icon: 'eat' },
  { href: '#/client/body', label: 'Tiến độ', icon: 'body', also: ['#/client/dash'] },
  { href: '#/client/profile', label: 'Hồ sơ', icon: 'user', also: ['#/tools'] },
]);

export async function clientHomeView({ profile }) {
  const intake = await loadIntake(profile.id);
  if (!intake?.updated_at && profile.role !== 'coach') return go('#/client/intake'); // chưa hoàn thành hồ sơ → vào wizard (coach "Tập của tôi" không bắt buộc)
  clientTabs();
  const db = await sb(), me = profile.id, today = todayISO(), from7 = addDays(today, -6);
  const must = (r) => { if (r.error) throw r.error; return r.data; };
  const [coach, sessions, unread, meas, slots, checks, target, adhocToday] = await Promise.all([
    profile.coach_id ? db.from('profiles').select('full_name').eq('id', profile.coach_id).maybeSingle().then((r) => r.data) : null,
    publishedSessions(me, addDays(mondayOf(today), -7), addDays(today, 21)).catch(() => []),
    unreadBySession(me).catch(() => ({})),
    db.from('measurements').select('measured_on, weight_kg').eq('client_id', me).gte('measured_on', addDays(today, -13)).then(must).catch(() => []),
    db.from('meal_slots').select('id').eq('client_id', me).then(must).catch(() => []),
    db.from('meal_checks').select('level, check_date').eq('client_id', me).gte('check_date', from7).lte('check_date', today).then(must).catch(() => []),
    db.from('nutrition_targets').select('kcal').eq('client_id', me).eq('status', 'approved').order('valid_from', { ascending: false }).order('created_at', { ascending: false }).limit(1).maybeSingle().then((r) => r.data).catch(() => null),
    loadAdhocSessions(me, today, today).catch(() => []),
  ]);
  const pk = await loadPackages(me).catch(() => ({ packages: [], usedById: {} }));
  const curPkg = currentPackage(pk.packages, pk.usedById, today), pkgSt = curPkg ? pkgStatus(curPkg, pk.usedById[curPkg.id] || 0, today) : null;
  const lk = lockState(pk.packages, today);
  const self = profile.role === 'coach' && selfMode();
  const [cis, phs] = await Promise.all([listCheckins(me).catch(() => []), db.from('phases').select('id, name, start_date, end_date, status').eq('client_id', me).neq('status', 'draft').then(must).catch(() => [])]);
  const ciWeek = checkinWeekFor(today, new Set(cis.map((c) => c.week_start)));
  const lastReply = cis.find((c) => c.coach_reply && c.replied_at && c.replied_at.slice(0, 10) >= addDays(today, -3));
  const curPhase = phs.filter((p) => p.start_date && p.start_date <= today && addDays(p.end_date, 14) >= today).sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
  const review = curPhase ? await getReview(curPhase.id).catch(() => null) : null;
  const showReport = curPhase && review?.status !== 'agreed' && reportOpen(curPhase, today, !!review);
  const allIds = [...new Set([...sessions.map((s) => s.id), ...adhocToday.map((s) => s.id)])];
  const fbs = allIds.length ? must(await db.from('session_feedback').select('session_id, completed').in('session_id', allIds)) : [];
  const done = new Set(fbs.filter((f) => f.completed).map((f) => f.session_id));
  const nx = pickNext(sessions, done, today);
  const detail = nx.main ? await loadSession(nx.main.id).catch(() => null) : null;
  const items = detail ? detail.session.blocks.flatMap((b) => b.items) : [];
  const exNames = items.length ? (await db.from('exercises').select('id, name_vi').in('id', [...new Set(items.map((i) => i.exercise_id))]).then(must).catch(() => [])) : [];
  const exName = (id) => exNames.find((e) => e.id === id)?.name_vi || '';
  const sets = items.reduce((n, i) => n + (i.sets || 1), 0);

  // 3 ô số liệu
  const last7 = sessions.filter((s) => s.scheduled_on >= from7 && s.scheduled_on <= today);
  const trainPct = last7.length ? Math.round((last7.filter((s) => done.has(s.id)).length / last7.length) * 100) : null;
  const eatPct = adherenceRange(checks, slots.length, 7);
  const w = meas.filter((m) => m.weight_kg != null).map((m) => ({ date: m.measured_on, weightKg: Number(m.weight_kg) }));
  const wNow = weeklyAvg(w, today), wPrev = weeklyAvg(w, addDays(today, -7));
  const delta = wNow != null && wPrev != null ? Math.round((wNow - wPrev) * 10) / 10 : null;
  const num = (x) => String(x).replace('.', ',');

  const eatenToday = checks.filter((c) => c.check_date === today).length;
  const msgs = Object.values(unread).flat().sort((a, b) => b.created_at.localeCompare(a.created_at));
  const hour = new Date().getHours();
  const hi = hour < 11 ? 'Chào buổi sáng,' : hour < 18 ? 'Chào buổi chiều,' : 'Chào buổi tối,';
  const dm = (iso) => `${DAY_VI[(new Date(iso + 'T00:00:00Z').getUTCDay() + 6) % 7]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  const dateStr = `${DAY_VI[(new Date(today + 'T00:00:00Z').getUTCDay() + 6) % 7]} ${today.slice(8, 10)}/${today.slice(5, 7)}`;
  const LABEL = { today: 'Buổi hôm nay', makeup: 'Tập bù', upcoming: 'Buổi kế tiếp' };
  const when = !nx.main ? '' : nx.kind === 'today' ? 'hôm nay' : nx.kind === 'makeup' ? `lỡ ${dm(nx.main.scheduled_on)}` : dm(nx.main.scheduled_on);
  const otherMissed = nx.missed.filter((s) => s.id !== nx.main?.id);

  render(`
    <div class="row row--between" style="margin-top:2px;margin-bottom:14px;align-items:flex-start">
      <div>
        <div class="small muted" style="font-weight:600">${dateStr}${profile.full_name ? ` · ${esc(profile.full_name)}` : ''}</div>
        <h1 style="margin:2px 0 0">${hi} ${esc(shortName(profile.full_name))}</h1>
        <div class="small muted">Coach: ${esc(coach?.full_name || 'Dino')}</div>
      </div>
      ${self ? '<button id="back" class="btn btn--ghost small">← Về Coach</button>' : ''}
    </div>
    ${lk.graceLeft ? `<div class="card card--flag small" style="margin-top:12px">Gói tập đã hết hạn — app sẽ tạm khóa sau <strong>${lk.graceLeft} ngày</strong>. Liên hệ Coach để gia hạn.</div>` : ''}

    ${adhocToday.length ? adhocToday.map((s) => `
      <div class="card" style="margin-top:14px;padding:16px;border:1px solid rgba(255,255,255,.14)">
        <div class="row row--between">
          <span style="font-size:13px;font-weight:600;color:var(--tint)"><span class="sr-only">BUỔI TỰ DO HÔM NAY </span>Buổi tự do hôm nay</span>
          ${done.has(s.id) ? '<span class="badge badge--ok">✓ Đã tập xong</span>' : s.mode === 'pt' ? '<span class="badge badge--ok">Tập với Coach</span>' : '<span class="badge">Ngoài lịch</span>'}
        </div>
        <div style="font-size:20px;font-weight:700;letter-spacing:-.01em;margin:6px 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.title || 'Buổi tự do')}</div>
        <div class="small muted">${esc(SESSION_TYPE_VI[s.session_type] || '')} · ${(s.blocks || []).reduce((n, b) => n + (b.items?.length || 0), 0)} bài</div>
        <div class="row" style="gap:8px;margin-top:12px">
          <a class="btn ${done.has(s.id) ? 'btn--ghost' : 'btn--primary'} small" href="#/client/session/${s.id}">${done.has(s.id) ? 'Xem lại phiếu tập' : 'Vào tập ngay →'}</a>
          ${!done.has(s.id) ? `<a class="btn btn--ghost small" href="#/client/adhoc/${s.id}/edit">Sửa</a>` : ''}
        </div>
      </div>
    `).join('') : ''}

    ${nx.main ? `<div class="card card--hi" style="margin-top:14px;padding:18px">
      <div class="row row--between">
        <span style="font-size:13px;font-weight:600;color:var(--tint)"><span class="sr-only">${nx.kind === 'today' ? 'BUỔI HÔM NAY ' : nx.kind === 'makeup' ? 'TẬP BÙ ' : 'BUỔI KẾ TIẾP '}</span>${LABEL[nx.kind]}</span>
        <span class="small muted">Tuần ${nx.main.week_no} · ${when}</span>
      </div>
      <div style="font-size:22px;font-weight:700;letter-spacing:-.01em;margin:6px 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nx.main.title || 'Buổi tập')}</div>
      ${items.length ? `<div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px">${esc(items.slice(0, 3).map((i) => exName(i.exercise_id)).filter(Boolean).join(' · '))}${items.length > 3 ? ` · +${items.length - 3} bài` : ''}</div>` : ''}
      <div class="row" style="gap:18px;margin:12px 0 14px">
        <div style="display:flex;flex-direction:column;gap:2px"><span class="num" style="font-size:24px;color:var(--text)">~${Math.round(sets * 2.5 + items.length * 2)}</span><span class="small muted">phút</span></div>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="num" style="font-size:24px;color:var(--text)">${items.length}</span><span class="small muted">bài</span></div>
        <div style="display:flex;flex-direction:column;gap:2px"><span class="num" style="font-size:24px;color:var(--text)">${sets}</span><span class="small muted">hiệp</span></div>
        <div style="margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="badge">${esc(SESSION_TYPE_VI[nx.main.session_type] || '')}</span>
          ${nx.main.mode === 'pt' ? '<span class="badge badge--ok">Tập với Coach</span>' : ''}
        </div>
      </div>
      <a class="btn btn--primary btn--block" href="#/client/session/${nx.main.id}" style="min-height:48px;font-size:15px">${nx.kind === 'upcoming' ? 'Xem trước buổi tập' : 'Bắt đầu tập'} →</a>
      ${nx.kind === 'today' && otherMissed.length ? `<p class="small muted" style="text-align:center;margin:8px 0 0">Lỡ buổi ${dm(otherMissed[0].scheduled_on)}? <a href="#/client/session/${otherMissed[0].id}">Tập bù "${esc(otherMissed[0].title || 'buổi đó')}"</a></p>` : ''}
      ${nx.kind === 'makeup' && nx.todays.length === 0 && nx.doneToday ? '<p class="small muted" style="text-align:center;margin:8px 0 0">Buổi hôm nay đã xong ✓ — đây là buổi lỡ trong tuần.</p>' : ''}
    </div>` : `<div class="card" style="margin-top:14px"><p><strong>${nx.doneToday ? 'Hôm nay đã tập xong ✓' : 'Chưa có buổi tập theo lịch.'}</strong></p>
      <p class="muted small" style="margin:0">${nx.doneToday ? 'Nghỉ ngơi tốt nhé hoặc bấm nút nổi góc dưới để tập thêm buổi tự do.' : 'Xem cả tuần ở tab <a href="#/client/plan">Lịch tập</a>, hoặc bấm nút nổi góc dưới để tự tạo buổi tập.'}</p>
    </div>`}

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0">
      <div class="card" style="margin:0;padding:12px;display:flex;flex-direction:column;align-items:center;text-align:center">
        <div class="small muted" style="margin-bottom:6px">Tập 7 ngày</div>
        ${ringSvg(trainPct)}
      </div>
      <div class="card" style="margin:0;padding:12px;display:flex;flex-direction:column;align-items:center;text-align:center">
        <div class="small muted" style="margin-bottom:6px">Ăn 7 ngày</div>
        ${ringSvg(eatPct)}
      </div>
      <div class="card" style="margin:0;padding:12px;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center">
        <div class="small muted" style="margin-bottom:4px">Cân TB tuần</div>
        <div class="num" style="font-size:24px;color:var(--text);margin:2px 0">${wNow != null ? num(wNow.toFixed(1)) : '—'} <span style="font-size:12px;font-family:var(--font);font-weight:400;color:var(--muted)">kg</span></div>
        <div style="font-size:12px;font-weight:600;margin-top:2px;color:var(--tint)">${delta == null ? '<span class="muted">cân để theo dõi</span>' : delta === 0 ? '— giữ nguyên' : `${delta < 0 ? '↓' : '↑'} ${num(Math.abs(delta))} kg`}</div>
      </div>
    </div>

    ${slots.length ? `<a class="card" href="#/client/eat" style="display:block">
      <div class="row row--between"><span style="font-size:13px;font-weight:600;color:var(--tint)">Ăn hôm nay</span>
        <span class="small muted">${target ? `Mục tiêu <strong style="color:var(--text)">${target.kcal}</strong> kcal` : ''}</span></div>
      <div style="height:8px;border-radius:4px;margin-top:10px;background:linear-gradient(90deg,var(--a1),var(--a2) ${Math.round((eatenToday / slots.length) * 100)}%,rgba(255,255,255,.08) ${Math.round((eatenToday / slots.length) * 100)}%)"></div>
      <div class="small muted" style="margin-top:8px">Đã check <strong>${eatenToday}/${slots.length}</strong> bữa · ${eatenToday >= slots.length ? 'đủ bữa hôm nay ✓' : 'bấm để check bữa tiếp theo'}</div></a>` : ''}

    ${curPkg && !pkgSt.ended ? `<div class="card row row--between" id="pkgcard" style="gap:10px"><span><span class="small muted" style="display:block">Gói: ${esc(curPkg.name || autoName(curPkg))}</span>
      <strong>${esc(pkgLine(curPkg, pkgSt))}</strong></span>${pkgSt.warn.length ? `<span class="badge badge--warn">${esc(pkgSt.warn[0])}</span>` : ''}</div>` : ''}
    ${ciWeek ? `<a class="card row" href="#/client/checkin?w=${ciWeek}" style="gap:14px;align-items:center">
      <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--tint);flex:none">${icon('plan', 20)}</div>
      <div style="flex:1;min-width:0">
        <div class="row row--between"><span style="font-size:13px;font-weight:600;color:var(--tint)"><span class="sr-only">CHECK-IN TUẦN </span>Check-in tuần</span><span class="small muted">~1 phút</span></div>
        <div style="font-weight:700;font-size:15px;margin-top:2px">Tuần ${ciWeek.slice(8, 10)}/${ciWeek.slice(5, 7)} của bạn thế nào?</div>
        <div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Cân TB, giấc ngủ, stress, năng lượng — Coach dùng để chỉnh kế hoạch.</div>
      </div>
      <span style="color:var(--muted)">→</span></a>` : ''}
    ${lastReply ? `<a class="card row" href="#/client/checkin?w=${lastReply.week_start}" style="gap:14px;align-items:center">
      <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--tint);flex:none;position:relative">${icon('inbox', 20)}<span class="dot-new" style="position:absolute;top:6px;right:6px"></span></div>
      <div style="flex:1;min-width:0"><span class="small muted" style="display:block">Coach đã trả lời check-in</span><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600">${esc(lastReply.coach_reply)}</span></div>
      <span style="color:var(--muted)">→</span></a>` : ''}
    ${showReport ? `<a class="card" href="#/phase/${curPhase.id}" style="display:block"><span style="font-size:13px;font-weight:600;color:var(--tint)"><span class="sr-only">BÁO CÁO GIAI ĐOẠN </span>Báo cáo giai đoạn</span>
      <div style="font-weight:700;margin-top:4px">${esc(curPhase.name)} sắp kết thúc — xem kết quả &amp; góp ý</div>
      <div class="small muted">${review?.coach_agreed_at ? 'Coach đã viết tóm tắt, chờ bạn đồng ý.' : 'Nhớ cập nhật cân, số đo và ảnh cuối giai đoạn.'}</div></a>` : ''}
    ${msgs.length ? `<a class="card row" href="#/client/session/${msgs[0].context_id}" style="gap:12px">
      <span style="width:36px;height:36px;border-radius:50%;background:#1e1e23;display:flex;align-items:center;justify-content:center;font-weight:700;flex:none">${esc(((coach?.full_name || 'Dino').trim().split(/\s+/).pop() || 'D')[0].toUpperCase())}</span>
      <span style="flex:1;min-width:0"><span class="small muted" style="display:block">Coach nhắn</span><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(msgs[0].body)}</span></span>
      <span class="badge badge--hot">${msgs.length}</span></a>` : ''}

    <a class="card row" href="#/tools" style="gap:14px;align-items:center;margin-top:10px;text-decoration:none">
      <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--tint);flex:none;font-size:18px">🛠️</div>
      <div style="flex:1;min-width:0">
        <strong style="font-size:15px;color:var(--text)">Công cụ hỗ trợ</strong>
        <div class="small muted">Pace ⇄ km/h, 1RM, đĩa tạ, quay WOD</div>
      </div>
      <span style="color:var(--muted)">→</span>
    </a>

    <div class="card"><p class="small muted" style="margin:0">Mẹo: thêm DINOMET vào màn hình chính để mở nhanh như một ứng dụng
      (Safari: Chia sẻ → Thêm vào MH chính · Chrome: ⋮ → Cài đặt ứng dụng). Đổi màu giao diện ở menu tài khoản góc trên.</p></div>

    <a class="fab" href="#/client/adhoc/new" id="btnNewAdhoc" aria-label="Buổi tự do">+ Buổi tự do</a>
  `);
  if (self) {
    const btn = $('#back');
    if (btn) btn.onclick = () => { setSelfMode(false); go('#/coach'); };
  } else {
    const btn = $('#out');
    if (btn) btn.onclick = async () => { await signOut(); go('#/login'); };
  }
}
