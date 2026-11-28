// DINO-013 — Dashboard 1 khách: coach xem mọi khách của mình (#/dash/:id), khách xem của mình (#/client/dash).
import { render, $, esc, toast, busy } from '../../ui.js';
import { viError } from '../../supabaseClient.js';
import { coachTabs } from '../coach/home.js';
import { clientTabs } from '../client/home.js';
import { loadExercises, MUSCLE_VI } from '../../lib/exercises.js';
import { todayISO } from '../../lib/plan.js';
import { lineChart, barChart, fmtNum, fmtPace } from '../../lib/charts.js';
import {
  RANGE_VI, currentPhase, rangeStart, mondaysBetween, phaseMarkers, weightSeries, circSeries, inbodySeries, logRows, autoTracked, liftedExercises,
  e1rmWeekly, volumeByMuscle, runWeekly, adherenceWeekly, weightTrend, last7, toCsv, zipStore, exportName,
  muscleSets, frequencyMatrix14, personalRecords,
} from '../../lib/dashboard.js';
import { dashData, saveTracked, exportTables } from '../../lib/dashboardStore.js';

const dm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—');
let RANGE = 'phase'; // bộ lọc giữ nguyên khi chuyển qua lại giữa các khách trong phiên

export const clientDashView = ({ profile }) => dashView({ params: { id: profile.id }, profile });

export async function dashView({ params, profile }) {
  const coach = profile.role === 'coach';
  if (coach) coachTabs(); else clientTabs();
  const [D, exList] = await Promise.all([dashData(params.id), loadExercises()]);
  const exById = new Map(exList.map((e) => [e.id, e]));
  const today = todayISO(), rows = logRows(D.logs, D.items);
  const ph = currentPhase(D.phases, today);
  const firstDay = [...D.measurements.map((m) => m.measured_on), ...D.scans.map((s) => s.scanned_on), ...rows.map((r) => r.day), ...D.sessions.map((s) => s.scheduled_on).filter(Boolean)]
    .filter((x) => x && x <= today).sort()[0];
  const tr = weightTrend(D.measurements, today), l7 = last7({ ...D, today });
  const tile = (label, value, sub = '') => `<div class="card tile"><div class="small muted">${label}</div><div class="tile-v">${value}</div>${sub ? `<div class="tile-s">${sub}</div>` : ''}</div>`;

  render(`
    <div class="row row--between no-print"><a href="${coach ? `#/coach/client/${D.client.id}` : '#/client/body'}">← ${coach ? esc(D.client.full_name || 'Khách') : 'Cơ thể'}</a>
      ${coach ? '<button class="btn btn--ghost small" id="csv">Xuất CSV (.zip)</button>' : ''}</div>
    <h1>Tiến độ${coach ? ` · ${esc(D.client.full_name || '')}` : ''}</h1>
    <p class="muted small">${ph ? `${esc(ph.name)} · ${dm(ph.start_date)} → ${dm(ph.end_date)}` : 'Chưa có giai đoạn đã phát hành'}</p>
    <div class="tiles">
      ${tile('Cân TB 7 ngày', tr.now != null ? `${fmtNum(tr.now)} <small>kg</small>` : '—', tr.diff != null ? `${tr.arrow} ${fmtNum(Math.abs(tr.diff))} kg / 2 tuần` : 'chưa đủ dữ liệu')}
      ${tile('Tập 7 ngày', l7.trainPct != null ? `${l7.trainPct}%` : '—')}
      ${tile('Ăn đúng 7 ngày', l7.eatPct != null ? `${l7.eatPct}%` : '—')}
      ${tile('Check-in gần nhất', D.lastCheckin ? dm(D.lastCheckin.week_start) : 'chưa có', D.lastCheckin ? (D.lastCheckin.coach_reply ? 'đã trả lời' : 'chờ coach') : '')}
    </div>
    ${coach && D.alerts.length ? `<a class="card card--flag row" href="#/coach/inbox" style="gap:10px"><span class="badge badge--hot">⚠ ${D.alerts.length}</span>
      <span class="small" style="flex:1">${esc(D.alerts.slice(0, 2).map((a) => a.message).join(' · '))}</span><span>→</span></a>` : ''}
    <div class="chips no-print" role="group" aria-label="Khoảng thời gian">${Object.entries(RANGE_VI).map(([k, v]) => `<button class="chip" data-range="${k}" aria-pressed="${k === RANGE}">${v}</button>`).join('')}</div>
    <div id="charts"></div>
    <dialog id="dlg"><form id="tf" method="dialog"><h2>Bài theo dõi sức mạnh</h2>
      <p class="small muted">Chọn 3–5 bài chính. Chưa chọn thì app tự lấy 3 bài khách tập nhiều nhất.</p>
      <div id="tl" class="stack" style="max-height:50vh;overflow:auto"></div>
      <div class="row" style="margin-top:14px"><button type="button" class="btn btn--ghost" id="tcancel">Hủy</button><button class="btn btn--primary" style="flex:1">Lưu</button></div>
    </form></dialog>`);

  const draw = () => {
    const from = rangeStart(RANGE, today, D.phases, firstDay), to = today;
    const mondays = mondaysBetween(from, to), markers = phaseMarkers(D.phases, from, to);
    const w = weightSeries(D.measurements, from, to), c = circSeries(D.measurements, from, to), ib = inbodySeries(D.scans, from, to);
    const tracked = (D.tracked.length ? D.tracked : autoTracked(rows)).filter((id) => exById.has(id));
    const lifts = e1rmWeekly(rows, tracked, mondays);
    const vol = volumeByMuscle(rows, exById, mondays);
    const run = runWeekly(rows.filter((r) => r.day >= from && r.day <= to), mondays);
    const adh = adherenceWeekly({ ...D, mondays, today });
    const weeksCount = Math.max(1, (Date.parse(to) - Date.parse(from)) / (7 * 864e5));
    const mSets = muscleSets(rows, exById, from, to);
    const fMatrix = frequencyMatrix14(rows, exById, today);
    const prs = personalRecords(rows, exById, today);

    const mStyle = (k) => {
      const s = mSets[k] || 0;
      if (s <= 0) return 'fill:rgba(255,255,255,0.05);stroke:rgba(255,255,255,0.18);stroke-width:1;cursor:pointer;transition:all .2s';
      const pw = s / weeksCount;
      const op = Math.min(0.85, 0.25 + (pw / 12) * 0.6);
      return `fill:hsl(var(--h) 85% 55% / ${op.toFixed(2)});stroke:hsl(var(--h) 95% 70%);stroke-width:1.5;cursor:pointer;filter:drop-shadow(0 0 4px hsl(var(--h) 85% 50% / .4));transition:all .2s`;
    };

    const L = (o) => lineChart({ from, to, markers, ...o });
    $('#charts').innerHTML = `
      <h2>Cơ thể</h2>
      <div class="card">${L({ id: 'weight', title: 'Cân nặng', unit: 'kg', series: [{ name: 'Từng lần cân', points: w.points, line: false }, { name: 'TB 7 ngày', points: w.avg7, dots: false, color: 'var(--a2)' }] })}</div>
      ${c.waist.length || c.hip.length ? `<div class="card">${L({ id: 'circ', title: 'Vòng eo / mông', unit: 'cm', series: [{ name: 'Eo', points: c.waist }, { name: 'Mông', points: c.hip }] })}</div>` : ''}
      ${ib.smm.length || ib.ffm.length || ib.pbf.length ? `<div class="card">${L({ id: 'inbody', title: 'InBody: cơ (SMM) & khối không mỡ (FFM)', unit: 'kg', series: [{ name: 'SMM', points: ib.smm }, { name: 'FFM', points: ib.ffm }] })}
        ${L({ id: 'pbf', title: 'InBody: mỡ (PBF)', unit: '%', series: [{ name: 'PBF', points: ib.pbf, color: 'var(--a3)' }] })}</div>` : ''}
      <div class="row row--between"><h2>Sức mạnh</h2>${coach ? '<button class="btn btn--ghost small no-print" id="pick">Chọn bài theo dõi</button>' : ''}</div>
      <div class="card">${L({ id: 'e1rm', title: '1RM ước tính (Epley) cao nhất mỗi tuần', unit: 'kg', series: lifts.map((s) => ({ name: exById.get(s.id)?.name_vi || 'Bài tập', points: s.points })), legend: true })}
        ${!D.tracked.length && tracked.length ? '<p class="small muted" style="margin:6px 0 0">Đang tự lấy bài tập nhiều nhất' + (coach ? ' — bấm "Chọn bài theo dõi" để chọn.' : '.') + '</p>' : ''}</div>
      <div class="card">${barChart({ id: 'volume', title: 'Khối lượng tạ mỗi tuần theo nhóm cơ', unit: 'kg (rep × tạ)', labels: mondays, series: vol, stacked: true, markers })}</div>

      <!-- Sơ đồ nhóm cơ -->
      <div class="card" id="muscleHeatmapCard" style="margin-top:14px">
        <div class="row row--between">
          <div>
            <h3 style="margin:0 0 2px">Sơ đồ nhóm cơ</h3>
            <div class="small muted">Mức độ tác động dựa trên số hiệp tập/tuần</div>
          </div>
          <div id="activeMuscleLabel" class="badge" style="font-weight:600">
            Chạm vùng cơ để xem số hiệp
          </div>
        </div>
        <div class="row" style="justify-content:space-around;gap:12px;margin:16px 0 10px;text-align:center">
          <div style="flex:1;max-width:180px">
            <div class="small muted" style="margin-bottom:6px">MẶT TRƯỚC</div>
            <svg id="svgAnterior" viewBox="0 0 100 200" style="width:100%;max-height:220px">
              <circle cx="50" cy="18" r="10" fill="#18181b" stroke="#333" stroke-width="1.5" />
              <path class="muscle-path" data-muscle="chest" style="${mStyle('chest')}" d="M38 42 C44 42 48 48 48 56 C42 58 35 54 34 46 Z" />
              <path class="muscle-path" data-muscle="chest" style="${mStyle('chest')}" d="M62 42 C56 42 52 48 52 56 C58 58 65 54 66 46 Z" />
              <path class="muscle-path" data-muscle="shoulders" style="${mStyle('shoulders')}" d="M28 42 C34 40 37 46 36 54 C30 52 26 48 28 42 Z" />
              <path class="muscle-path" data-muscle="shoulders" style="${mStyle('shoulders')}" d="M72 42 C66 40 63 46 64 54 C70 52 74 48 72 42 Z" />
              <path class="muscle-path" data-muscle="biceps" style="${mStyle('biceps')}" d="M25 56 C30 56 30 70 26 76 C23 72 22 62 25 56 Z" />
              <path class="muscle-path" data-muscle="biceps" style="${mStyle('biceps')}" d="M75 56 C70 56 70 70 74 76 C77 72 78 62 75 56 Z" />
              <rect class="muscle-path" data-muscle="abdominals" style="${mStyle('abdominals')}" x="44" y="60" width="12" height="12" rx="2" />
              <rect class="muscle-path" data-muscle="abdominals" style="${mStyle('abdominals')}" x="44" y="74" width="12" height="14" rx="2" />
              <path class="muscle-path" data-muscle="quadriceps" style="${mStyle('quadriceps')}" d="M37 98 C46 98 48 116 46 138 C40 140 35 125 34 106 Z" />
              <path class="muscle-path" data-muscle="quadriceps" style="${mStyle('quadriceps')}" d="M63 98 C54 98 52 116 54 138 C60 140 65 125 66 106 Z" />
              <path class="muscle-path" data-muscle="calves" style="${mStyle('calves')}" d="M37 146 C42 146 43 166 41 182 C37 182 36 166 37 146 Z" />
              <path class="muscle-path" data-muscle="calves" style="${mStyle('calves')}" d="M63 146 C58 146 57 166 59 182 C63 182 64 166 63 146 Z" />
            </svg>
          </div>
          <div style="flex:1;max-width:180px">
            <div class="small muted" style="margin-bottom:6px">MẶT SAU</div>
            <svg id="svgPosterior" viewBox="0 0 100 200" style="width:100%;max-height:220px">
              <circle cx="50" cy="18" r="10" fill="#18181b" stroke="#333" stroke-width="1.5" />
              <path class="muscle-path" data-muscle="traps" style="${mStyle('traps')}" d="M42 30 L58 30 L64 42 L36 42 Z" />
              <path class="muscle-path" data-muscle="lats" style="${mStyle('lats')}" d="M36 44 C44 48 44 70 38 78 C33 68 32 54 36 44 Z" />
              <path class="muscle-path" data-muscle="lats" style="${mStyle('lats')}" d="M64 44 C56 48 56 70 62 78 C67 68 68 54 64 44 Z" />
              <path class="muscle-path" data-muscle="triceps" style="${mStyle('triceps')}" d="M24 54 C28 54 28 70 24 74 C21 70 21 60 24 54 Z" />
              <path class="muscle-path" data-muscle="triceps" style="${mStyle('triceps')}" d="M76 54 C72 54 72 70 76 74 C79 70 79 60 76 54 Z" />
              <path class="muscle-path" data-muscle="glutes" style="${mStyle('glutes')}" d="M37 92 C48 90 49 110 40 114 C33 112 32 100 37 92 Z" />
              <path class="muscle-path" data-muscle="glutes" style="${mStyle('glutes')}" d="M63 92 C52 90 51 110 60 114 C67 112 68 100 63 92 Z" />
              <path class="muscle-path" data-muscle="hamstrings" style="${mStyle('hamstrings')}" d="M36 116 C46 116 47 136 44 142 C38 142 35 132 36 116 Z" />
              <path class="muscle-path" data-muscle="hamstrings" style="${mStyle('hamstrings')}" d="M64 116 C54 116 53 136 56 142 C62 142 65 132 64 116 Z" />
              <path class="muscle-path" data-muscle="calves" style="${mStyle('calves')}" d="M36 148 C44 148 43 170 39 180 C34 176 34 160 36 148 Z" />
              <path class="muscle-path" data-muscle="calves" style="${mStyle('calves')}" d="M64 148 C56 148 57 170 61 180 C66 176 66 160 64 148 Z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Ma trận tần suất 14 ngày -->
      <div class="card" id="freqMatrixCard" style="margin-top:14px">
        <h3 style="margin:0 0 2px">Tần suất nhóm cơ (14 ngày gần nhất)</h3>
        <p class="small muted" style="margin:0 0 10px">Mỗi chấm sáng thể hiện ngày có bài tập tác động lên nhóm cơ tương ứng.</p>
        <div style="overflow-x:auto">
          <table class="small" style="width:100%;border-collapse:collapse;min-width:320px">
            <thead>
              <tr class="muted">
                <th style="text-align:left;padding:4px 6px">Nhóm cơ</th>
                ${fMatrix.days.map((d) => `<th style="text-align:center;padding:4px 2px;font-size:10px">${d.slice(8, 10)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${fMatrix.muscles.map((m) => `
                <tr style="border-top:1px solid rgba(255,255,255,.05)">
                  <td style="padding:4px 6px;white-space:nowrap">${esc(m.label)}</td>
                  ${fMatrix.matrix[m.key].map((active) => `
                    <td style="text-align:center;padding:4px 2px">
                      <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${active ? 'var(--tint)' : 'rgba(255,255,255,0.06)'};${active ? 'box-shadow:0 0 6px var(--tint)' : ''}"></span>
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bảng kỷ lục cá nhân PR -->
      <div class="card" id="prCard" style="margin-top:14px">
        <div class="row row--between">
          <h3 style="margin:0 0 4px">Kỷ lục cá nhân (PR)</h3>
          <span class="small muted">Top 10 thành tích</span>
        </div>
        ${prs.length ? `
          <ul class="list small" style="margin-top:8px">
            ${prs.map((p) => `
              <li class="row row--between" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
                <div>
                  <strong>${esc(p.name_vi)}</strong> ${p.isNew ? '<span class="badge badge--hot" style="font-size:10px;padding:2px 6px;margin-left:4px">Mới</span>' : ''}
                  <div class="small muted">${esc(p.label)} · ${dm(p.day)}</div>
                </div>
                <div style="text-align:right">
                  <strong style="color:var(--tint);font-size:15px">${p.value} ${esc(p.unit)}</strong>
                  <div class="small muted">${esc(p.detail)}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        ` : '<p class="small muted" style="margin:6px 0 0">Chưa có dữ liệu kỷ lục cá nhân.</p>'}
      </div>

      <h2>Chạy</h2>
      ${run.any ? `<div class="card">${barChart({ id: 'km', title: 'Km mỗi tuần', unit: 'km', labels: mondays, series: [{ name: 'km', values: run.km }], yFmt: (v) => fmtNum(v), markers })}
        ${L({ id: 'pace', title: run.easyOnly ? 'Pace TB các buổi easy (vùng tim 1–2)' : 'Pace TB các buổi chạy', unit: 'phút/km', series: [{ name: 'Pace', points: run.pace, color: 'var(--a2)' }], yFmt: fmtPace })}</div>`
        : '<div class="card"><p class="small muted" style="margin:0">Chưa có buổi chạy được ghi trong khoảng này.</p></div>'}
      <h2>Tuân thủ</h2>
      <div class="card">${barChart({ id: 'adherence', title: '% buổi hoàn thành & % ăn đúng mỗi tuần', unit: '%', labels: mondays, series: [{ name: 'Buổi tập', values: adh.sessions }, { name: 'Ăn đúng', values: adh.eat, color: 'var(--a2)' }], max: 100, markers })}</div>`;
    document.querySelectorAll('[data-range]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.range === RANGE)));
    $('#pick')?.addEventListener('click', openPicker);

    // Bắt sự kiện chạm sơ đồ cơ
    document.querySelectorAll('.muscle-path').forEach((path) => {
      path.onclick = () => {
        const m = path.dataset.muscle;
        const name = MUSCLE_VI[m] || m;
        const s = mSets[m] || 0;
        const pw = Math.round((s / weeksCount) * 10) / 10;
        const lbl = $('#activeMuscleLabel');
        if (lbl) {
          lbl.textContent = `${name}: ${pw} hiệp/tuần`;
          lbl.style.background = 'hsl(var(--h) 80% 50% / .2)';
          lbl.style.color = 'var(--tint)';
        }
      };
    });
  };
  document.querySelectorAll('[data-range]').forEach((b) => (b.onclick = () => { RANGE = b.dataset.range; draw(); }));
  draw();

  // ---- Coach: chọn bài theo dõi ----
  const dlg = $('#dlg');
  function openPicker() {
    const ids = liftedExercises(rows).filter((id) => exById.has(id)).sort((a, b) => exById.get(a).name_vi.localeCompare(exById.get(b).name_vi, 'vi'));
    const cur = new Set(D.tracked);
    $('#tl').innerHTML = ids.length ? ids.map((id) => `<label class="row" style="gap:10px;min-height:40px"><input type="checkbox" name="ex" value="${id}" ${cur.has(id) ? 'checked' : ''}> ${esc(exById.get(id).name_vi)}</label>`).join('')
      : '<p class="muted small">Khách chưa ghi bài nào có tạ.</p>';
    dlg.showModal();
  }
  $('#tcancel').onclick = () => dlg.close();
  $('#tf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ids = [...document.querySelectorAll('#tl input:checked')].map((i) => i.value);
    if (ids.length > 5) return toast('Chọn tối đa 5 bài.', 'error');
    await busy(e.submitter, async () => {
      try { await saveTracked(D.client.id, ids); D.tracked = ids; dlg.close(); toast('Đã lưu bài theo dõi.'); draw(); } catch (err) { toast(viError(err), 'error'); }
    });
  });

  // ---- Coach: xuất CSV (.zip) ----
  $('#csv')?.addEventListener('click', async (e) => {
    await busy(e.currentTarget, async () => {
      try {
        const tables = await exportTables(D.client.id);
        const zip = zipStore(tables.map((t) => ({ name: `${t.name}.csv`, text: toCsv(t.rows) })));
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }));
        a.download = exportName(D.client.full_name, today);
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast(`Đã xuất ${tables.length} bảng.`);
      } catch (err) { toast(viError(err), 'error'); }
    });
  });
}
