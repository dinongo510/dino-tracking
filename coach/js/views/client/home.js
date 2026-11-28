import { render, $, esc, tabbar, icon } from '../../ui.js';
import { sb } from '../../supabaseClient.js';
import { signOut } from '../../auth.js';
import { go } from '../../router.js';
import { loadIntake } from './intake.js';
import { publishedSessions, loadSession } from '../../lib/planStore.js';
import { todayISO, addDays, mondayOf, pickNext, SESSION_TYPE_VI, DAY_VI } from '../../lib/plan.js';
import { weeklyAvg } from '../../lib/formulas.js';
import { adherenceRange } from '../../lib/nutrition.js';
import { unreadBySession } from '../../lib/logStore.js';
import { checkinWeekFor, reportOpen } from '../../lib/checkin.js';
import { listCheckins, getReview } from '../../lib/checkinStore.js';

export const clientTabs = () => tabbar([
  { href: '#/client', label: 'Hôm nay', icon: 'home' },
  { href: '#/client/plan', label: 'Lịch tập', icon: 'plan', also: ['#/client/session'] },
  { href: '#/client/eat', label: 'Ăn', icon: 'eat' },
  { href: '#/client/body', label: 'Cơ thể', icon: 'body' },
  { href: '#/client/profile', label: 'Hồ sơ', icon: 'user' },
]);

export async function clientHomeView({ profile }) {
  const intake = await loadIntake(profile.id);
  if (!intake?.updated_at) return go('#/client/intake'); // chưa hoàn thành hồ sơ → vào wizard
  clientTabs();
  const db = await sb(), me = profile.id, today = todayISO(), from7 = addDays(today, -6);
  const must = (r) => { if (r.error) throw r.error; return r.data; };
  const [coach, sessions, unread, meas, slots, checks, target] = await Promise.all([
    profile.coach_id ? db.from('profiles').select('full_name').eq('id', profile.coach_id).maybeSingle().then((r) => r.data) : null,
    publishedSessions(me, addDays(mondayOf(today), -7), addDays(today, 21)).catch(() => []),
    unreadBySession(me).catch(() => ({})),
    db.from('measurements').select('measured_on, weight_kg').eq('client_id', me).gte('measured_on', addDays(today, -13)).then(must).catch(() => []),
    db.from('meal_slots').select('id').eq('client_id', me).then(must).catch(() => []),
    db.from('meal_checks').select('level, check_date').eq('client_id', me).gte('check_date', from7).lte('check_date', today).then(must).catch(() => []),
    db.from('nutrition_targets').select('kcal').eq('client_id', me).eq('status', 'approved').order('valid_from', { ascending: false }).order('created_at', { ascending: false }).limit(1).maybeSingle().then((r) => r.data).catch(() => null),
  ]);
  const [cis, phs] = await Promise.all([listCheckins(me).catch(() => []), db.from('phases').select('id, name, start_date, end_date, status').eq('client_id', me).neq('status', 'draft').then(must).catch(() => [])]);
  const ciWeek = checkinWeekFor(today, new Set(cis.map((c) => c.week_start)));
  const lastReply = cis.find((c) => c.coach_reply && c.replied_at && c.replied_at.slice(0, 10) >= addDays(today, -3));
  const curPhase = phs.filter((p) => p.start_date && p.start_date <= today && addDays(p.end_date, 14) >= today).sort((a, b) => b.start_date.localeCompare(a.start_date))[0];
  const review = curPhase ? await getReview(curPhase.id).catch(() => null) : null;
  const showReport = curPhase && review?.status !== 'agreed' && reportOpen(curPhase, today, !!review);
  const fbs = sessions.length ? must(await db.from('session_feedback').select('session_id, completed').in('session_id', sessions.map((s) => s.id))) : [];
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
  const bar = (p) => `<div style="height:4px;border-radius:2px;margin-top:8px;background:linear-gradient(90deg,var(--a1) ${p ?? 0}%,rgba(255,255,255,.10) ${p ?? 0}%)"></div>`;

  const eatenToday = checks.filter((c) => c.check_date === today).length;
  const msgs = Object.values(unread).flat().sort((a, b) => b.created_at.localeCompare(a.created_at));
  const hour = new Date().getHours();
  const hi = hour < 11 ? 'Chào buổi sáng,' : hour < 18 ? 'Chào buổi chiều,' : 'Chào buổi tối,';
  const dm = (iso) => `${DAY_VI[(new Date(iso + 'T00:00:00Z').getUTCDay() + 6) % 7]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  const LABEL = { today: 'BUỔI HÔM NAY', makeup: 'TẬP BÙ', upcoming: 'BUỔI KẾ TIẾP' };
  const when = !nx.main ? '' : nx.kind === 'today' ? 'hôm nay' : nx.kind === 'makeup' ? `lỡ ${dm(nx.main.scheduled_on)}` : dm(nx.main.scheduled_on);
  const otherMissed = nx.missed.filter((s) => s.id !== nx.main?.id);

  render(`
    <div class="row row--between" style="margin-top:4px">
      <div><div class="muted" style="font-size:14px">${hi}</div><h1 style="margin:0">${esc(profile.full_name || 'bạn')}</h1>
        <div class="small muted">Coach: ${esc(coach?.full_name || 'Dino')}</div></div>
      <button id="out" class="btn btn--ghost small">Đăng xuất</button>
    </div>

    ${nx.main ? `<div class="card card--hi" style="margin-top:14px;padding:18px">
      <div class="row row--between"><span style="font-size:11px;letter-spacing:.14em;font-weight:700;color:var(--tint)">${LABEL[nx.kind]}</span>
        <span class="small muted">Tuần ${nx.main.week_no} · ${when}</span></div>
      <div style="font-size:25px;font-weight:800;letter-spacing:-.02em;margin:6px 0 2px">${esc(nx.main.title || 'Buổi tập')}</div>
      ${items.length ? `<div class="small" style="color:#c4c4cc">${esc(items.slice(0, 3).map((i) => exName(i.exercise_id)).filter(Boolean).join(' · '))}${items.length > 3 ? ` · +${items.length - 3} bài` : ''}</div>` : ''}
      <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap">
        <span class="badge">${items.length} bài · ${sets} hiệp</span><span class="badge">${esc(SESSION_TYPE_VI[nx.main.session_type] || '')}</span></div>
      <a class="btn btn--primary btn--block" href="#/client/session/${nx.main.id}" style="margin-top:14px;min-height:54px;font-size:16px">${nx.kind === 'upcoming' ? 'Xem trước buổi tập' : 'Bắt đầu tập'} →</a>
      ${nx.kind === 'today' && otherMissed.length ? `<p class="small muted" style="text-align:center;margin:8px 0 0">Lỡ buổi ${dm(otherMissed[0].scheduled_on)}? <a href="#/client/session/${otherMissed[0].id}">Tập bù "${esc(otherMissed[0].title || 'buổi đó')}"</a></p>` : ''}
      ${nx.kind === 'makeup' && nx.todays.length === 0 && nx.doneToday ? '<p class="small muted" style="text-align:center;margin:8px 0 0">Buổi hôm nay đã xong ✓ — đây là buổi lỡ trong tuần.</p>' : ''}
    </div>` : `<div class="card" style="margin-top:14px"><p><strong>${nx.doneToday ? 'Hôm nay đã tập xong ✓' : 'Chưa có buổi tập.'}</strong></p>
      <p class="muted small">${nx.doneToday ? 'Nghỉ ngơi tốt nhé. ' : ''}Xem cả tuần ở tab <a href="#/client/plan">Lịch tập</a>. Nếu Coach chưa phát hành giáo án, lịch sẽ hiện khi có.</p></div>`}

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px">
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Tập 7 ngày</div><div style="font-size:23px;font-weight:800">${trainPct ?? '—'}${trainPct != null ? '%' : ''}</div>${bar(trainPct)}</div>
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Ăn 7 ngày</div><div style="font-size:23px;font-weight:800">${eatPct ?? '—'}${eatPct != null ? '%' : ''}</div>${bar(eatPct)}</div>
      <div class="card" style="margin:0;padding:12px"><div class="small muted" style="font-size:12px">Cân TB tuần</div><div style="font-size:23px;font-weight:800">${wNow != null ? num(wNow.toFixed(1)) : '—'}</div>
        <div style="font-size:12px;font-weight:600;margin-top:4px;color:var(--tint)">${delta == null ? '<span class="muted">cân để theo dõi</span>' : delta === 0 ? '— giữ nguyên' : `${delta < 0 ? '↓' : '↑'} ${num(Math.abs(delta))} kg`}</div></div>
    </div>

    ${slots.length ? `<a class="card" href="#/client/eat" style="display:block">
      <div class="row row--between"><span style="font-size:11px;letter-spacing:.14em;font-weight:700" class="muted">ĂN HÔM NAY</span>
        <span class="small muted">${target ? `Mục tiêu <strong style="color:var(--text)">${target.kcal}</strong> kcal` : ''}</span></div>
      <div style="height:8px;border-radius:4px;margin-top:10px;background:linear-gradient(90deg,var(--a1),var(--a2) ${Math.round((eatenToday / slots.length) * 100)}%,rgba(255,255,255,.08) ${Math.round((eatenToday / slots.length) * 100)}%)"></div>
      <div class="small" style="margin-top:8px;color:#c4c4cc">Đã check <strong>${eatenToday}/${slots.length}</strong> bữa · ${eatenToday >= slots.length ? 'đủ bữa hôm nay ✓' : 'bấm để check bữa tiếp theo'}</div></a>` : ''}

    ${ciWeek ? `<a class="card card--hi" href="#/client/checkin?w=${ciWeek}" style="display:block">
      <div class="row row--between"><span style="font-size:11px;letter-spacing:.14em;font-weight:700;color:var(--tint)">CHECK-IN TUẦN</span><span class="small muted">~1 phút</span></div>
      <div style="font-size:18px;font-weight:700;margin-top:4px">Tuần ${ciWeek.slice(8, 10)}/${ciWeek.slice(5, 7)} của bạn thế nào?</div>
      <div class="small muted">Cân TB, giấc ngủ, stress, năng lượng — Coach dùng để chỉnh kế hoạch.</div></a>` : ''}
    ${lastReply ? `<a class="card row" href="#/client/checkin?w=${lastReply.week_start}" style="gap:12px"><span class="dot-new"></span>
      <span style="flex:1;min-width:0"><span class="small muted" style="display:block">Coach đã trả lời check-in</span><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(lastReply.coach_reply)}</span></span></a>` : ''}
    ${showReport ? `<a class="card" href="#/phase/${curPhase.id}" style="display:block"><span style="font-size:11px;letter-spacing:.14em;font-weight:700;color:var(--tint)">BÁO CÁO GIAI ĐOẠN</span>
      <div style="font-weight:700;margin-top:4px">${esc(curPhase.name)} sắp kết thúc — xem kết quả &amp; góp ý</div>
      <div class="small muted">${review?.coach_agreed_at ? 'Coach đã viết tóm tắt, chờ bạn đồng ý.' : 'Nhớ cập nhật cân, số đo và ảnh cuối giai đoạn.'}</div></a>` : ''}
    ${msgs.length ? `<a class="card row" href="#/client/session/${msgs[0].context_id}" style="gap:12px">
      <span style="width:36px;height:36px;border-radius:50%;background:#1e1e23;display:flex;align-items:center;justify-content:center;font-weight:700;flex:none">${esc(((coach?.full_name || 'Dino').trim().split(/\s+/).pop() || 'D')[0].toUpperCase())}</span>
      <span style="flex:1;min-width:0"><span class="small muted" style="display:block">Coach nhắn</span><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(msgs[0].body)}</span></span>
      <span class="badge badge--hot">${msgs.length}</span></a>` : ''}

    <div class="card"><p class="small muted" style="margin:0">Mẹo: thêm DINO Coach vào màn hình chính để mở nhanh như một ứng dụng
      (Safari: Chia sẻ → Thêm vào MH chính · Chrome: ⋮ → Cài đặt ứng dụng). Đổi màu giao diện ở tab Hồ sơ.</p></div>`);
  $('#out').onclick = async () => { await signOut(); go('#/login'); };
}
