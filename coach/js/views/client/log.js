// DINO-010 / DINO-015 — Phiếu buổi tập (Khách): ghi từng hiệp, readiness & khởi động, đồng hồ nghỉ / khối, hoàn thành buổi, chat với coach
import { render, $, esc, toast, busy } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { clientTabs } from './home.js';
import { loadExercises } from '../../lib/exercises.js';
import { DAY_VI, SESSION_TYPE_VI, itemSummary, blockSummary } from '../../lib/plan.js';
import { loadSession, latestOhsa } from '../../lib/planStore.js';
import { buildRows, rowKind, toClock, fromClock, pace, timerPlan, PAIN_AREAS, TOTAL_BLOCKS } from '../../lib/sessionLog.js';
import { deductForSession } from '../../lib/ptDeduct.js';
import { coachTabs } from '../coach/home.js';
import { loadLogs, saveLog, flushPending, pendingCount, loadFeedback, saveFeedback } from '../../lib/logStore.js';
import { renderChat } from '../shared/chat.js';
import { readinessScore, readinessLevel, adjustment, LEVEL_LABEL_VI } from '../../lib/readiness.js';
import { warmupPlan } from '../../lib/prehab.js';

const dm = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');
const RPES = ['', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];
let tick = null; // đồng hồ đang chạy (nghỉ hoặc khối)
addEventListener('hashchange', () => { clearInterval(tick); tick = null; document.getElementById('restbar')?.remove(); });

function beep() {
  try { navigator.vibrate?.([300, 120, 300]); } catch { /* */ }
  if (localStorage.getItem('dcoach_sound') === '0') return;
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    if (a.state === 'suspended') a.resume();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, a.currentTime);
    g.gain.setValueAtTime(0.3, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.35);
    o.connect(g);
    g.connect(a.destination);
    o.start(a.currentTime);
    o.stop(a.currentTime + 0.35);
  } catch { /* */ }
}

export async function clientSessionView({ params, profile }) {
  const [{ session: s, phase }, exList] = await Promise.all([loadSession(params.id), loadExercises()]);
  // Coach chỉ ghi phiếu ở buổi PT tại chỗ hoặc buổi của chính mình ("Tập của tôi"); buổi khác → trang xem kết quả
  const isCoach = profile.role === 'coach', own = s.client_id === profile.id, coachPT = isCoach && !own && s.mode === 'pt';
  if (isCoach && !own && !coachPT) { location.hash = `#/coach/review/${params.id}`; return; }
  if (coachPT) coachTabs(); else clientTabs();
  if (phase && phase.status === 'draft') { render('<div class="card"><p>Buổi tập này chưa được phát hành.</p><a href="#/client/plan">← Lịch tập</a></div>'); return; }
  await flushPending();
  const exById = new Map(exList.map((e) => [e.id, e]));
  const items = s.blocks.flatMap((b) => b.items);
  const [logs, fb, aOhsa] = await Promise.all([loadLogs(items.map((i) => i.id)), loadFeedback(s.id), latestOhsa(s.client_id).catch(() => null)]);
  const ohsa = aOhsa?.ohsa || {};
  let readiness = fb?.readiness || null;
  const offKey = 'dcoach_rd_' + s.id;
  if (!readiness) {
    try { const off = localStorage.getItem(offKey); if (off) readiness = JSON.parse(off).readiness; } catch { /* */ }
  }
  let skipped = sessionStorage.getItem('dcoach_skip_rd_' + s.id) === '1';
  const hasCorrectiveBlock = s.blocks.some((b) => b.block_type === 'corrective');
  const rowsOf = {}; for (const b of s.blocks) for (const it of b.items) rowsOf[it.id] = buildRows(b, it, logs[it.id]);
  const clientName = coachPT ? ((await (await sb()).from('profiles').select('full_name').eq('id', s.client_id).maybeSingle()).data?.full_name || 'Khách') : '';
  const coachName = profile.coach_id ? ((await (await sb()).from('profiles').select('full_name').eq('id', profile.coach_id).maybeSingle()).data?.full_name || 'Coach') : 'Coach';

  let curPlan = [];
  function renderReadinessBox() {
    if (readiness) {
      curPlan = warmupPlan({ ohsa, sessionType: s.session_type, pain: readiness.pain || [], exercises: exList });
      const totalMin = Math.max(5, Math.min(8, Math.round(curPlan.reduce((n, p) => n + p.sec, 0) / 60)));
      return `
        <div class="card ${readiness.level === 'red' ? 'card--flag' : readiness.level === 'yellow' ? 'lvl--near' : 'lvl--on'}" id="rdSummaryCard">
          <div class="row row--between">
            <strong style="font-size:15px">Readiness: ${readiness.score}/100 · ${readiness.level === 'green' ? '🟢' : readiness.level === 'yellow' ? '🟡' : '🔴'} ${esc(LEVEL_LABEL_VI[readiness.level] || '')}</strong>
          </div>
          <p style="margin:6px 0 3px"><strong>Gợi ý:</strong> ${esc(adjustment(readiness.level))}</p>
          <div class="small muted">Ngủ ${readiness.sleep}/5 · Mỏi ${readiness.soreness}/5 · Stress ${readiness.stress}/5 · Năng lượng ${readiness.energy}/5${readiness.pain?.length ? ' · <span style="color:var(--danger)">Đau: ' + esc(readiness.pain.join(', ')) + '</span>' : ''}</div>
        </div>
        ${!hasCorrectiveBlock ? `
        <div class="card" id="warmupCard" style="margin-top:10px">
          <div class="row row--between">
            <strong>Khởi động & chỉnh tư thế (~${totalMin} phút)</strong>
            <label class="row small" style="cursor:pointer;gap:6px">
              <input type="checkbox" id="warmupDone" ${readiness.warmup_done ? 'checked' : ''}>
              <span id="warmupDoneTxt">${readiness.warmup_done ? 'Đã khởi động xong ✓' : 'Đã khởi động xong'}</span>
            </label>
          </div>
          <div class="stack" style="margin-top:10px;gap:8px">
            ${curPlan.map((st, i) => `
              <div class="card" style="padding:10px;background:var(--bg)">
                <div class="row row--between">
                  <strong>${esc(st.label)}</strong>
                  <button type="button" class="btn btn--ghost small" data-wtimer="${i}">⏱ ${st.sec}s</button>
                </div>
                <ul class="list small" style="margin-top:4px">
                  ${st.items.map((it) => `<li><span>${esc(it.name_vi)}</span><span class="muted">${esc(it.dose)}</span></li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>` : ''}
      `;
    }
    if (!skipped && !fb?.completed) {
      return `
        <div class="card" id="rdCard" style="border:1.5px solid var(--tint)">
          <div class="row row--between"><strong style="font-size:15px;color:var(--tint)">Sẵn sàng chưa?</strong><button type="button" class="btn btn--ghost small" id="rdSkip">Bỏ qua</button></div>
          <p class="small muted" style="margin:4px 0 10px">Trả lời nhanh 4 câu để app gợi ý điều chỉnh cường độ & bài khởi động phù hợp thể trạng hôm nay.</p>
          <div class="stack" style="gap:10px" id="rdQuestions">
            <div>
              <div class="row row--between small"><span>Giấc ngủ đêm qua</span><strong id="v_sleep">3</strong></div>
              <div class="row" style="gap:4px;margin-top:4px" data-score-row="sleep">
                ${[1, 2, 3, 4, 5].map((v) => `<button type="button" class="btn small ${v === 3 ? 'btn--primary' : 'btn--ghost'}" style="flex:1" data-val="${v}">${v}</button>`).join('')}
              </div>
              <div class="row row--between" style="font-size:10.5px;color:var(--text-muted);margin-top:2px"><span>Rất tệ (1)</span><span>Sâu giấc (5)</span></div>
            </div>
            <div>
              <div class="row row--between small"><span>Mức mỏi cơ / ê ẩm</span><strong id="v_soreness">3</strong></div>
              <div class="row" style="gap:4px;margin-top:4px" data-score-row="soreness">
                ${[1, 2, 3, 4, 5].map((v) => `<button type="button" class="btn small ${v === 3 ? 'btn--primary' : 'btn--ghost'}" style="flex:1" data-val="${v}">${v}</button>`).join('')}
              </div>
              <div class="row row--between" style="font-size:10.5px;color:var(--text-muted);margin-top:2px"><span>Không mỏi (1)</span><span>Rất mỏi (5)</span></div>
            </div>
            <div>
              <div class="row row--between small"><span>Căng thẳng thần kinh</span><strong id="v_stress">3</strong></div>
              <div class="row" style="gap:4px;margin-top:4px" data-score-row="stress">
                ${[1, 2, 3, 4, 5].map((v) => `<button type="button" class="btn small ${v === 3 ? 'btn--primary' : 'btn--ghost'}" style="flex:1" data-val="${v}">${v}</button>`).join('')}
              </div>
              <div class="row row--between" style="font-size:10.5px;color:var(--text-muted);margin-top:2px"><span>Thoải mái (1)</span><span>Rất căng thẳng (5)</span></div>
            </div>
            <div>
              <div class="row row--between small"><span>Mức năng lượng</span><strong id="v_energy">3</strong></div>
              <div class="row" style="gap:4px;margin-top:4px" data-score-row="energy">
                ${[1, 2, 3, 4, 5].map((v) => `<button type="button" class="btn small ${v === 3 ? 'btn--primary' : 'btn--ghost'}" style="flex:1" data-val="${v}">${v}</button>`).join('')}
              </div>
              <div class="row row--between" style="font-size:10.5px;color:var(--text-muted);margin-top:2px"><span>Kiệt sức (1)</span><span>Sung sức (5)</span></div>
            </div>
            <div style="margin-top:4px">
              <div class="small" style="margin-bottom:4px">Có vùng đau nào không? (nếu có, chọn bên dưới):</div>
              <div class="row" style="flex-wrap:wrap;gap:6px">
                ${PAIN_AREAS.map((a) => `<label class="badge" style="cursor:pointer;padding:6px 10px"><input type="checkbox" data-rd-pain="${esc(a)}"> ${esc(a)}</label>`).join('')}
              </div>
            </div>
            <button type="button" class="btn btn--primary" id="rdDone" style="margin-top:8px">Xong</button>
          </div>
        </div>
      `;
    }
    return '';
  }

  render(`<div id="log">
    <p class="small">${coachPT ? `<a href="#/coach/client/${s.client_id}/plan${phase ? '?phase=' + phase.id : ''}">← Giáo án ${esc(clientName)}</a>` : `<a href="#/client/plan${phase ? `?phase=${phase.id}&w=${s.week_no}` : ''}">← Lịch tập</a>`}</p>
    ${s.mode === 'pt' ? `<div class="card card--hi small"><strong style="color:var(--tint)">Buổi PT tại chỗ</strong> — ${coachPT ? `bạn ghi kết quả cho ${esc(clientName)}. Bấm "Hoàn thành" sẽ trừ 1 buổi trong gói của khách.` : 'tập cùng Coach, Coach ghi kết quả.'}</div>` : ''}
    <div class="row row--between"><h1 style="margin:0">${esc(s.title || 'Buổi tập')}</h1><span id="sync" class="badge" style="display:none;color:var(--warn);border-color:var(--warn)"></span></div>
    <p class="muted small">${DAY_VI[s.day_no - 1]} ${dm(s.scheduled_on)} · ${s.adhoc ? 'Ngoài lịch' : 'tuần ' + s.week_no} · ${esc(SESSION_TYPE_VI[s.session_type] || '')}${fb?.completed ? ' · <strong style="color:var(--tint)">Đã hoàn thành ✓</strong>' : ''}</p>
    ${s.coach_note ? `<div class="card"><strong>Coach dặn:</strong> ${esc(s.coach_note).replace(/\n/g, '<br>')}</div>` : ''}
    <div id="rdBox" style="margin-bottom:12px">${renderReadinessBox()}</div>
    <p class="small muted">Số đã điền sẵn là mục tiêu. Tập xong hiệp nào bấm <strong>✓</strong> hiệp đó — chỉ sửa số khi bạn làm khác.</p>
    ${s.blocks.map((b, bi) => blockHtml(b, bi)).join('') || '<div class="card"><p class="muted">Buổi này chưa có bài.</p></div>'}

    <h2>Kết thúc buổi</h2>
    <form id="fin" class="card stack">
      <label class="field"><span>Cả buổi nặng cỡ nào? (RPE 1–10)</span>
        <select name="rpe">${['', ...Array.from({ length: 19 }, (_, i) => String(1 + i * 0.5))].map((v) => `<option value="${v}"${fb?.session_rpe != null && Number(v) === Number(fb.session_rpe) && v !== '' ? ' selected' : ''}>${v || '— chọn —'}</option>`).join('')}</select></label>
      <div class="field"><span>Có đau / khó chịu chỗ nào không?</span>
        <div class="row" style="flex-wrap:wrap;gap:6px">${PAIN_AREAS.map((a) => { const p = (fb?.pain || []).find((x) => x.area === a); return `<label class="badge" style="cursor:pointer;padding:6px 10px"><input type="checkbox" data-pain="${esc(a)}"${p ? ' checked' : ''}> ${esc(a)}
          <select data-lvl="${esc(a)}" ${p ? '' : 'hidden'}>${[1, 2, 3, 4, 5].map((n) => `<option${p?.level === n ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`; }).join('')}</div>
        <span class="small muted">Mức đau 1 (nhẹ) – 5 (rất đau). Có đau thì Coach sẽ liên hệ.</span></div>
      <label class="field"><span>Ghi chú cho Coach</span><textarea name="note" rows="2">${esc(fb?.note || '')}</textarea></label>
      <button class="btn btn--primary">${fb?.completed ? 'Cập nhật' : coachPT ? 'Hoàn thành & trừ 1 buổi' : 'Hoàn thành buổi'}</button>
    </form>
    <div id="chat"></div></div>`);

  function blockHtml(b, bi) {
    const tp = timerPlan(b), timed = !['straight', 'superset', 'corrective', 'run'].includes(b.block_type);
    return `<div class="card" data-blk="${bi}">
      <div class="row row--between"><strong>${esc(b.label ? b.label + '. ' : '')}${esc(blockSummary(b))}</strong>
        ${timed ? `<button class="btn btn--ghost small" data-timer="${bi}">⏱ Bấm giờ</button>` : ''}</div>
      ${b.note ? `<p class="small muted">${esc(b.note)}</p>` : ''}
      ${timed ? `<div data-tpanel="${bi}" hidden class="card" style="text-align:center;background:var(--bg)">
        <div class="small muted" data-tlabel></div><div data-tclock style="font-size:48px;font-weight:700;font-variant-numeric:tabular-nums">${tp.countUp ? '0:00' : toClock(tp.segments[0]?.sec || 0)}</div>
        <div class="row" style="justify-content:center;gap:6px"><button class="btn btn--primary small" data-tgo>Bắt đầu</button><button class="btn btn--ghost small" data-treset>Đặt lại</button></div></div>` : ''}
      ${b.items.map((it) => itemHtml(b, it)).join('')}
    </div>`;
  }
  function itemHtml(b, it) {
    const ex = exById.get(it.exercise_id), kind = rowKind(b, it, ex), total = TOTAL_BLOCKS.has(b.block_type);
    const head = kind === 'run' ? '<th>Cự ly (m)</th><th>Thời gian</th><th>HR TB</th><th>Pace</th>'
      : kind === 'timed' ? '<th>Giây</th>' : `<th>${total ? 'Tổng rep' : 'Rep'}</th><th>Kg</th><th>RPE</th>`;
    return `<div data-item="${it.id}" style="margin-top:12px">
      <div class="row row--between"><a href="#/exercise/${it.exercise_id}" style="color:var(--text)"><strong>${esc(ex?.name_vi || 'Bài tập')}</strong></a></div>
      <div class="small muted">${esc(itemSummary(it))}${it.note ? ' · ' + esc(it.note) : ''}</div>
      <table style="width:100%;border-collapse:collapse;margin-top:4px"><thead><tr class="small muted"><th style="width:44px">${b.block_type === 'circuit' || b.block_type === 'hyrox' ? 'Vòng' : 'Hiệp'}</th>${head}<th style="width:52px"></th></tr></thead>
      <tbody>${rowsOf[it.id].map((r) => rowHtml(kind, r)).join('')}</tbody></table></div>`;
  }
  function rowHtml(kind, r) {
    const n = (k, w = 64, step = 'any') => `<td><input class="input" data-k="${k}" type="number" inputmode="decimal" step="${step}" min="0" value="${r[k] ?? ''}" style="width:100%;max-width:${w}px;padding:6px"></td>`;
    const cells = kind === 'run'
      ? `${n('distance_m', 80)}<td><input class="input" data-k="duration" value="${toClock(r.duration_sec)}" placeholder="mm:ss" style="width:100%;max-width:80px;padding:6px"></td>${n('avg_hr', 60)}<td class="small" data-pace>${pace(r.distance_m, r.duration_sec) || ''}</td>`
      : kind === 'timed' ? n('duration_sec', 80)
        : `${n('reps', 56, 1)}${n('load_kg', 70)}<td><select data-k="rpe" style="padding:6px">${RPES.map((v) => `<option value="${v}"${r.rpe != null && Number(v) === Number(r.rpe) && v ? ' selected' : ''}>${v || '–'}</option>`).join('')}</select></td>`;
    return `<tr data-set="${r.set_no}" class="${r.done ? 'row-done' : ''}"><td class="small">${r.set_no}</td>${cells}
      <td><button class="btn small ${r.done ? 'btn--primary' : ''}" data-done aria-label="Xong hiệp ${r.set_no}">✓</button></td></tr>`;
  }

  // ---------- Ghi hiệp ----------
  const sync = () => { const n = pendingCount(), el = $('#sync'); if (!el) return; el.style.display = n ? '' : 'none'; el.textContent = `Chưa đồng bộ ${n} hiệp`; };
  sync();
  const onOnline = async () => {
    await flushPending();
    sync();
    // Đồng bộ readiness offline nếu có
    try {
      const off = localStorage.getItem(offKey);
      if (off) { await saveFeedback(JSON.parse(off)); localStorage.removeItem(offKey); }
    } catch { /* */ }
    if (!pendingCount()) toast('Đã đồng bộ dữ liệu lúc mất mạng.');
  };
  addEventListener('online', onOnline);
  addEventListener('hashchange', () => removeEventListener('online', onOnline), { once: true });

  // ---------- Readiness & Warmup interactions ----------
  const rdScores = { sleep: 3, soreness: 3, stress: 3, energy: 3 };
  function updateRdBox() {
    const box = $('#rdBox');
    if (!box) return;
    box.innerHTML = renderReadinessBox();
    wireReadiness();
  }
  function wireReadiness() {
    const box = $('#rdBox');
    if (!box) return;

    box.querySelectorAll('[data-score-row]').forEach((row) => {
      const key = row.dataset.scoreRow;
      row.querySelectorAll('[data-val]').forEach((btn) => {
        btn.onclick = () => {
          rdScores[key] = Number(btn.dataset.val);
          row.querySelectorAll('[data-val]').forEach((b) => b.classList.replace('btn--primary', 'btn--ghost'));
          btn.classList.replace('btn--ghost', 'btn--primary');
          const vl = document.getElementById('v_' + key);
          if (vl) vl.textContent = rdScores[key];
        };
      });
    });

    const skipBtn = $('#rdSkip', box);
    if (skipBtn) {
      skipBtn.onclick = () => {
        sessionStorage.setItem('dcoach_skip_rd_' + s.id, '1');
        skipped = true;
        updateRdBox();
      };
    }

    const doneBtn = $('#rdDone', box);
    if (doneBtn) {
      doneBtn.onclick = async () => {
        const pain = [...box.querySelectorAll('[data-rd-pain]:checked')].map((c) => c.dataset.rdPain);
        const score = readinessScore(rdScores);
        const level = readinessLevel(score, pain);
        const rdObj = {
          sleep: rdScores.sleep,
          soreness: rdScores.soreness,
          stress: rdScores.stress,
          energy: rdScores.energy,
          pain,
          score,
          level,
          warmup_done: false,
          at: new Date().toISOString(),
        };
        await busy(doneBtn, async () => {
          readiness = rdObj;
          const row = {
            client_id: s.client_id,
            session_id: s.id,
            readiness: rdObj,
            completed: fb?.completed || false,
            coach_reviewed: fb?.coach_reviewed ?? isCoach,
          };
          try {
            await saveFeedback(row);
            localStorage.removeItem(offKey);
            toast('Đã lưu đánh giá sẵn sàng.');
          } catch {
            localStorage.setItem(offKey, JSON.stringify(row));
            toast('Mất mạng — đã lưu tạm trên máy.');
          }
          updateRdBox();
        });
      };
    }

    const wmChk = $('#warmupDone', box);
    if (wmChk) {
      wmChk.onchange = async () => {
        if (!readiness) return;
        readiness.warmup_done = wmChk.checked;
        const txt = $('#warmupDoneTxt', box);
        if (txt) txt.textContent = readiness.warmup_done ? 'Đã khởi động xong ✓' : 'Đã khởi động xong';
        const row = {
          client_id: s.client_id,
          session_id: s.id,
          readiness,
          completed: fb?.completed || false,
          coach_reviewed: fb?.coach_reviewed ?? isCoach,
        };
        try {
          await saveFeedback(row);
          localStorage.removeItem(offKey);
          toast(readiness.warmup_done ? 'Đã ghi nhận khởi động ✓' : 'Đã bỏ ghi nhận khởi động.');
        } catch {
          localStorage.setItem(offKey, JSON.stringify(row));
        }
      };
    }

    box.querySelectorAll('[data-wtimer]').forEach((tb) => {
      tb.onclick = () => {
        const idx = Number(tb.dataset.wtimer);
        const st = curPlan[idx];
        if (st) startRest(st.sec, st.label.split('(')[0].trim());
      };
    });
  }
  wireReadiness();

  $('#log').addEventListener('input', (e) => {
    const tr = e.target.closest('tr[data-set]'); if (!tr) return;
    const pc = tr.querySelector('[data-pace]');
    if (pc) pc.textContent = pace(Number(tr.querySelector('[data-k=distance_m]').value), fromClock(tr.querySelector('[data-k=duration]').value)) || '';
  });
  $('#log').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-done]');
    if (btn) {
      const tr = btn.closest('tr'), itemId = btn.closest('[data-item]').dataset.item, it = items.find((x) => x.id === itemId);
      const done = !btn.classList.contains('btn--primary');
      const v = (k) => { const el = tr.querySelector(`[data-k=${k}]`); return el && el.value !== '' ? Number(el.value) : null; };
      const row = { client_id: s.client_id, block_item_id: itemId, set_no: +tr.dataset.set, done,
        reps: v('reps'), load_kg: v('load_kg'), rpe: v('rpe'), distance_m: v('distance_m'), avg_hr: v('avg_hr'),
        duration_sec: tr.querySelector('[data-k=duration]') ? fromClock(tr.querySelector('[data-k=duration]').value) : v('duration_sec') };
      btn.classList.toggle('btn--primary', done); tr.classList.toggle('row-done', done);
      try { const online = await saveLog(row); sync(); if (!online) toast('Mất mạng — hiệp đã lưu tạm trên máy, sẽ tự gửi khi có mạng.'); }
      catch (err) { toast(viError(err), 'error'); btn.classList.toggle('btn--primary', !done); tr.classList.remove('row-done'); return; }
      if (done && it.rest_sec && !TOTAL_BLOCKS.has(s.blocks.find((b) => b.items.includes(it)).block_type)) startRest(it.rest_sec);
      return;
    }
    const tb = e.target.closest('[data-timer]');
    if (tb) { const p = document.querySelector(`[data-tpanel="${tb.dataset.timer}"]`); p.hidden = !p.hidden; return; }
    const go = e.target.closest('[data-tgo]'), rs = e.target.closest('[data-treset]');
    if (go || rs) blockTimer(+e.target.closest('[data-blk]').dataset.blk, go ? 'toggle' : 'reset');
  });

  // ---------- Đồng hồ nghỉ ----------
  function startRest(sec, title = 'Nghỉ') {
    clearInterval(tick); document.getElementById('restbar')?.remove();
    let left = sec;
    let soundOn = localStorage.getItem('dcoach_sound') !== '0';
    document.body.insertAdjacentHTML('beforeend', `<div id="restbar" class="soft" style="position:fixed;left:50%;transform:translateX(-50%);width:min(528px,calc(100% - 28px));bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:20;border-radius:32px;padding:8px 8px 8px 22px;display:flex;align-items:center;gap:10px;color:var(--text);background:linear-gradient(rgba(16,16,20,.94),rgba(16,16,20,.94)) padding-box,var(--grad) border-box;border:1.5px solid transparent;box-shadow:0 12px 30px rgba(0,0,0,.55),0 0 24px -6px var(--glow);backdrop-filter:blur(20px)">
      <span>${esc(title)}</span><strong id="rleft" style="font-size:24px;font-variant-numeric:tabular-nums">${toClock(left)}</strong><span style="flex:1"></span>
      <button class="btn small" id="rsound" title="Bật/tắt âm báo" aria-label="Bật/tắt âm báo">${soundOn ? '🔔' : '🔕'}</button>
      <button class="btn small" id="rplus">+15s</button><button class="btn small" id="rskip">Bỏ qua</button></div>`);
    const stop = () => { clearInterval(tick); tick = null; document.getElementById('restbar')?.remove(); };
    $('#rsound').onclick = () => {
      soundOn = !soundOn;
      localStorage.setItem('dcoach_sound', soundOn ? '1' : '0');
      $('#rsound').textContent = soundOn ? '🔔' : '🔕';
    };
    $('#rplus').onclick = () => { left += 15; $('#rleft').textContent = toClock(left); };
    $('#rskip').onclick = stop;
    tick = setInterval(() => { left--; const el = document.getElementById('rleft'); if (el) el.textContent = toClock(Math.max(left, 0)); if (left <= 0) { beep(); stop(); } }, 1000);
  }

  // ---------- Đồng hồ khối (circuit / EMOM / AMRAP / for time) ----------
  const tstate = {};
  function blockTimer(bi, cmd) {
    const b = s.blocks[bi], plan = timerPlan(b), panel = document.querySelector(`[data-tpanel="${bi}"]`);
    const st = (tstate[bi] ||= { seg: 0, left: plan.segments[0]?.sec || 0, up: 0, running: false });
    const draw = () => {
      const sg = plan.segments[st.seg];
      panel.querySelector('[data-tclock]').textContent = plan.countUp ? toClock(st.up) : toClock(st.left);
      panel.querySelector('[data-tlabel]').textContent = plan.countUp ? (plan.cap ? `Giới hạn ${toClock(plan.cap)}` : 'Bấm giờ')
        : sg ? `${sg.label} · ${b.block_type === 'emom' ? 'phút' : 'vòng'} ${sg.round}/${b.block_type === 'emom' ? plan.segments.length : (b.rounds || 1)}` : 'XONG';
      panel.querySelector('[data-tgo]').textContent = st.running ? 'Tạm dừng' : 'Bắt đầu';
    };
    if (cmd === 'reset') { clearInterval(tick); tick = null; Object.assign(st, { seg: 0, left: plan.segments[0]?.sec || 0, up: 0, running: false }); return draw(); }
    if (st.running) { clearInterval(tick); tick = null; st.running = false; return draw(); }
    clearInterval(tick); document.getElementById('restbar')?.remove();
    st.running = true; draw();
    tick = setInterval(() => {
      if (plan.countUp) { st.up++; if (plan.cap && st.up >= plan.cap) { beep(); clearInterval(tick); st.running = false; } }
      else if (--st.left <= 0) {
        beep(); st.seg++;
        if (st.seg >= plan.segments.length) { clearInterval(tick); st.running = false; st.left = 0; } else st.left = plan.segments[st.seg].sec;
      }
      draw();
    }, 1000);
  }

  // ---------- Hoàn thành buổi ----------
  document.querySelectorAll('[data-pain]').forEach((c) => (c.onchange = () => { document.querySelector(`[data-lvl="${CSS.escape(c.dataset.pain)}"]`).hidden = !c.checked; }));
  $('#fin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const pain = [...document.querySelectorAll('[data-pain]:checked')].map((c) => ({ area: c.dataset.pain, level: +document.querySelector(`[data-lvl="${CSS.escape(c.dataset.pain)}"]`).value }));
    const doneSets = document.querySelectorAll('[data-done].btn--primary').length;
    if (!fb?.completed && !doneSets && !confirmNoSets()) return;
    await busy(e.submitter, async () => {
      try {
        const left = await flushPending(); sync();
        if (left) return toast(`Còn ${left} hiệp chưa đồng bộ — có mạng rồi bấm lại nhé.`, 'error');
        await saveFeedback({ client_id: s.client_id, session_id: s.id, completed: true, session_rpe: f.rpe.value ? Number(f.rpe.value) : null, pain: pain.length ? pain : null, note: f.note.value.trim() || null, coach_reviewed: isCoach, readiness: readiness || fb?.readiness || null });
        if (coachPT) {
          const msg = await deductForSession(s);
          toast(msg); setTimeout(() => (location.hash = `#/coach/review/${s.id}`), 1200); return;
        }
        toast(pain.length && !own ? 'Đã lưu. Coach sẽ xem phần đau và liên hệ bạn.' : 'Tuyệt vời! Đã hoàn thành buổi tập.');
        setTimeout(() => (location.hash = '#/client/plan'), 900);
      } catch (err) { toast(viError(err), 'error'); }
    });
  });
  function confirmNoSets() {
    const b = $('#fin button.btn--primary');
    if (b.dataset.sure) return true;
    b.dataset.sure = '1'; b.textContent = 'Chưa ghi hiệp nào — bấm lần nữa để vẫn hoàn thành';
    return false;
  }

  await renderChat($('#chat'), { clientId: s.client_id, sessionId: s.id, me: profile.id, names: coachPT ? { [profile.id]: 'Bạn', [s.client_id]: clientName } : { [profile.id]: 'Bạn', [profile.coach_id]: coachName } });
}
