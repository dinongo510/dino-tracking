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
import {
  ANTERIOR_DATA, POSTERIOR_DATA,
  calculateBodymapStats, getBodymapPolygonStyle,
} from '../../lib/bodymap.js';
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
    const bStats = calculateBodymapStats(rows, exById, from, to, weeksCount);
    let selectedMuscle = null;

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
        <div class="row row--between" style="align-items:flex-start;gap:8px">
          <div>
            <h3 style="margin:0 0 2px">Sơ đồ nhóm cơ</h3>
            <div class="small muted">Mức độ tác động dựa trên số hiệp tập/tuần</div>
          </div>
          <div id="activeMuscleLabel" class="badge" style="font-weight:600;font-size:12px;padding:6px 10px;text-align:right">
            Chạm bó cơ để xem chi tiết
          </div>
        </div>
        <div class="row" style="justify-content:space-around;gap:12px;margin:16px 0 10px;text-align:center" id="bodymapContainer">
          <div style="flex:1;max-width:200px">
            <div class="small muted" style="margin-bottom:6px;font-weight:600">MẶT TRƯỚC</div>
            <svg id="svgAnterior" viewBox="0 0 1000 2220" style="width:100%;max-height:280px;overflow:visible">
              ${ANTERIOR_DATA.map((item) => item.svgPoints.map((pts) => `
                <polygon
                  class="muscle-path muscle-poly"
                  data-muscle="${item.muscle === 'trapezius' ? 'traps' : item.muscle}"
                  data-muscle-raw="${item.muscle}"
                  points="${pts}"
                  style="${getBodymapPolygonStyle(item.muscle, bStats, false)}"
                />
              `).join('')).join('')}
            </svg>
          </div>
          <div style="flex:1;max-width:200px">
            <div class="small muted" style="margin-bottom:6px;font-weight:600">MẶT SAU</div>
            <svg id="svgPosterior" viewBox="0 0 1000 2220" style="width:100%;max-height:280px;overflow:visible">
              ${POSTERIOR_DATA.map((item) => item.svgPoints.map((pts) => `
                <polygon
                  class="muscle-path muscle-poly"
                  data-muscle="${item.muscle === 'trapezius' ? 'traps' : item.muscle}"
                  data-muscle-raw="${item.muscle}"
                  points="${pts}"
                  style="${getBodymapPolygonStyle(item.muscle, bStats, false)}"
                />
              `).join('')).join('')}
            </svg>
          </div>
        </div>

        <!-- Chú thích thang màu -->
        <div class="row" style="justify-content:center;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);flex-wrap:wrap;font-size:11px" id="bodymapLegend">
          <span class="row" style="gap:4px;align-items:center"><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14)"></i> <span class="muted">0 hiệp</span></span>
          <span class="row" style="gap:4px;align-items:center"><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:hsl(var(--h) 45% 36% / .55);border:1px solid hsl(var(--h) 55% 48% / .7)"></i> <span class="muted">1–5</span></span>
          <span class="row" style="gap:4px;align-items:center"><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:hsl(var(--h) 65% 45% / .72);border:1px solid hsl(var(--h) 75% 58% / .85)"></i> <span class="muted">6–10</span></span>
          <span class="row" style="gap:4px;align-items:center"><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:hsl(var(--h) 80% 54% / .88);border:1px solid hsl(var(--h) 90% 70% / .95)"></i> <span class="muted">11–15</span></span>
          <span class="row" style="gap:4px;align-items:center"><i style="display:inline-block;width:11px;height:11px;border-radius:2px;background:hsl(var(--h) 92% 60% / .98);box-shadow:0 0 4px var(--tint);border:1px solid hsl(var(--h) 96% 78% / 1)"></i> <span class="muted">&gt;15 hiệp/tuần</span></span>
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

    // Bắt sự kiện chạm sơ đồ cơ giải phẫu
    const updateMuscleSelection = (slug) => {
      selectedMuscle = slug;
      const lbl = $('#activeMuscleLabel');
      if (!lbl) return;
      if (!slug) {
        lbl.textContent = 'Chạm bó cơ để xem chi tiết';
        lbl.style.background = '';
        lbl.style.color = '';
      } else {
        const s = bStats[slug] || (slug === 'traps' ? bStats['trapezius'] : null);
        if (s) {
          lbl.textContent = `${s.label} · ${fmtNum(s.pw, 1)} hiệp/tuần · ${s.sessions} buổi`;
        } else {
          lbl.textContent = `${slug} · 0 hiệp/tuần · 0 buổi`;
        }
        lbl.style.background = 'hsl(var(--h) 80% 50% / .22)';
        lbl.style.color = 'var(--tint)';
      }
      document.querySelectorAll('.muscle-poly').forEach((el) => {
        const raw = el.dataset.muscleRaw || el.dataset.muscle;
        const isSel = (raw === slug) || (slug === 'traps' && raw === 'trapezius');
        el.setAttribute('style', getBodymapPolygonStyle(raw, bStats, isSel));
      });
    };

    document.querySelectorAll('.muscle-poly').forEach((poly) => {
      poly.onclick = (e) => {
        e.stopPropagation();
        const m = poly.dataset.muscleRaw || poly.dataset.muscle;
        updateMuscleSelection(selectedMuscle === m ? null : m);
      };
    });

    const cardHeatmap = $('#muscleHeatmapCard');
    if (cardHeatmap) {
      cardHeatmap.onclick = (e) => {
        if (!e.target.closest('.muscle-poly')) {
          updateMuscleSelection(null);
        }
      };
    }
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
