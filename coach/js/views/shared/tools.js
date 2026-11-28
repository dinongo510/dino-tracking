// DINO-016 — Tab Công cụ hỗ trợ: Đổi pace ⇄ km/h, Riegel dự đoán giải chạy, 1RM & % tạ, Lắp đĩa tạ, Quay WOD ngẫu nhiên
import { render, $, esc } from '../../ui.js';
import { coachTabs } from '../coach/home.js';
import { clientTabs } from '../client/home.js';
import {
  paceToSpeed, speedToPace, fmtPace, predictStandardRaces,
  oneRm, oneRmPercentages, plateLoad, randomWod,
} from '../../lib/tools.js';
import { WODS, WOD_TYPES } from '../../lib/wods.js';

export async function toolsView({ profile }) {
  const isCoach = profile.role === 'coach';
  if (isCoach) coachTabs(); else clientTabs();

  // Giá trị khởi tạo
  let paceMin = 5, paceSec = 0;
  let speedKmH = 12.0;
  let testDistKm = 10, testMin = 50, testSec = 0;
  let rmLoad = 80, rmReps = 8;
  let plateTarget = 87.5, plateBar = 20;
  let curWodType = 'all', curWodMin = 0;
  let curWod = randomWod(WODS);

  function renderView() {
    const totalPaceSec = paceMin * 60 + paceSec;
    const preds = predictStandardRaces(testDistKm, testMin * 60 + testSec);
    const rm = oneRm(rmLoad, rmReps);
    const pcts = oneRmPercentages(rm.epley);
    const pl = plateLoad(plateTarget, plateBar);

    render(`
      <div id="tools">
        <div class="row row--between">
          <h1 style="margin:0">Công cụ hỗ trợ</h1>
        </div>
        <p class="muted small" style="margin-top:2px">Tính toán pace, dự đoán giải chạy, tính 1RM, lắp đĩa tạ và quay WOD ngẫu nhiên.</p>

        <!-- 1. Pace & Dự đoán giải chạy -->
        <div class="card" id="cardPace" style="margin-top:12px">
          <div class="row row--between">
            <h2 style="margin:0;font-size:16px"><span style="color:var(--tint)">⚡</span> Pace & Dự đoán giải chạy</h2>
          </div>
          <p class="small muted" style="margin:4px 0 10px">Quy đổi giữa pace (phút:giây/km) và vận tốc chạy máy (km/h), dự đoán thời gian hoàn thành các cự ly theo công thức Riegel.</p>
          
          <div class="row" style="gap:10px;align-items:flex-end">
            <div style="flex:1">
              <label class="small muted">Pace (phút : giây / km)</label>
              <div class="row" style="gap:4px;margin-top:4px">
                <input class="input" id="p_m" type="number" inputmode="numeric" min="2" max="20" value="${paceMin}" style="width:50%;text-align:center">
                <span style="font-weight:700;line-height:36px">:</span>
                <input class="input" id="p_s" type="number" inputmode="numeric" min="0" max="59" value="${String(paceSec).padStart(2, '0')}" style="width:50%;text-align:center">
              </div>
            </div>
            <div style="display:flex;align-items:center;padding-bottom:8px;font-size:18px;color:var(--tint)">⇄</div>
            <div style="flex:1">
              <label class="small muted">Vận tốc (km/h)</label>
              <input class="input" id="p_spd" type="number" inputmode="decimal" step="0.1" min="1" max="30" value="${speedKmH}" style="margin-top:4px;width:100%;text-align:center">
            </div>
          </div>

          <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.07);padding-top:12px">
            <div class="small"><strong>Dự đoán giải chạy (Riegel formula):</strong></div>
            <div class="row" style="gap:8px;margin-top:6px;align-items:center">
              <span class="small muted">Căn cứ:</span>
              <input class="input small" id="t_dist" type="number" inputmode="decimal" value="${testDistKm}" style="width:54px;text-align:center">
              <span class="small muted">km hết</span>
              <input class="input small" id="t_min" type="number" inputmode="numeric" value="${testMin}" style="width:48px;text-align:center">
              <span class="small muted">p</span>
              <input class="input small" id="t_sec" type="number" inputmode="numeric" value="${testSec}" style="width:42px;text-align:center">
              <span class="small muted">s</span>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px" id="racePredGrid">
              ${preds.map((p) => `
                <div class="card" style="padding:8px 10px;background:var(--bg)">
                  <div class="small muted" style="font-size:11px">${esc(p.label)}</div>
                  <strong style="font-size:15px;color:var(--tint)">${esc(p.timeFormatted)}</strong>
                  <div class="small muted" style="font-size:10.5px">Pace ${esc(p.paceFormatted)}/km</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 2. 1RM & % tạ -->
        <div class="card" id="card1RM" style="margin-top:14px">
          <div class="row row--between">
            <h2 style="margin:0;font-size:16px"><span style="color:var(--tint)">🏋️</span> 1RM & Bảng phần trăm tạ</h2>
          </div>
          <p class="small muted" style="margin:4px 0 10px">Tính mức tạ 1 rep tối đa (1RM) từ số rep thực tế và bảng tỷ lệ % sức mạnh.</p>

          <div class="row" style="gap:10px">
            <div style="flex:1">
              <label class="small muted">Mức tạ (kg)</label>
              <input class="input" id="rm_kg" type="number" inputmode="decimal" step="0.5" min="1" value="${rmLoad}" style="margin-top:4px;width:100%;text-align:center">
            </div>
            <div style="flex:1">
              <label class="small muted">Số rep (lần)</label>
              <input class="input" id="rm_reps" type="number" inputmode="numeric" min="1" max="30" value="${rmReps}" style="margin-top:4px;width:100%;text-align:center">
            </div>
          </div>

          <div class="row" style="gap:10px;margin-top:12px;background:var(--bg);padding:10px;border-radius:12px">
            <div style="flex:1;text-align:center">
              <div class="small muted">1RM Epley (chuẩn)</div>
              <strong style="font-size:22px;color:var(--tint)" id="rm_res_epley">${rm.epley} <small style="font-size:13px">kg</small></strong>
            </div>
            <div style="width:1px;background:rgba(255,255,255,.1)"></div>
            <div style="flex:1;text-align:center">
              <div class="small muted">1RM Brzycki</div>
              <strong style="font-size:22px" id="rm_res_brz">${rm.brzycki} <small style="font-size:13px">kg</small></strong>
            </div>
          </div>

          <details style="margin-top:10px">
            <summary class="small" style="cursor:pointer;color:var(--tint)">Xem bảng tỷ lệ % 1RM (${rm.epley} kg)</summary>
            <table class="small" style="width:100%;border-collapse:collapse;margin-top:6px" id="rmTable">
              <thead><tr class="muted"><th style="text-align:left;padding:4px">Tỷ lệ</th><th style="padding:4px">Mức tạ</th><th style="text-align:right;padding:4px">Rep ước tính</th></tr></thead>
              <tbody>
                ${pcts.map((p) => `<tr style="border-top:1px solid rgba(255,255,255,.05)"><td style="padding:4px"><strong>${p.pct}%</strong></td><td style="padding:4px;text-align:center"><strong style="color:var(--tint)">${p.load} kg</strong></td><td style="padding:4px;text-align:right;color:var(--text-muted)">~${p.repsEst || '—'} rep</td></tr>`).join('')}
              </tbody>
            </table>
          </details>
        </div>

        <!-- 3. Lắp đĩa tạ -->
        <div class="card" id="cardPlates" style="margin-top:14px">
          <div class="row row--between">
            <h2 style="margin:0;font-size:16px"><span style="color:var(--tint)">🎯</span> Máy tính lắp đĩa tạ (Plate Calculator)</h2>
          </div>
          <p class="small muted" style="margin:4px 0 10px">Chia đều đĩa tạ tiêu chuẩn (25, 20, 15, 10, 5, 2.5, 1.25 kg) vào 2 bên đòn.</p>

          <div class="row" style="gap:10px">
            <div style="flex:1">
              <label class="small muted">Mức tạ mục tiêu (kg)</label>
              <input class="input" id="pl_target" type="number" inputmode="decimal" step="0.5" min="15" value="${plateTarget}" style="margin-top:4px;width:100%;text-align:center">
            </div>
            <div style="flex:1">
              <label class="small muted">Đòn tạ</label>
              <select class="input" id="pl_bar" style="margin-top:4px;width:100%">
                <option value="20" ${plateBar === 20 ? 'selected' : ''}>Đòn 20 kg (Nam / Olympic)</option>
                <option value="15" ${plateBar === 15 ? 'selected' : ''}>Đòn 15 kg (Nữ)</option>
              </select>
            </div>
          </div>

          <div class="card" style="margin-top:12px;background:var(--bg);padding:12px" id="plResultBox">
            <div class="small muted">Mỗi bên lắp:</div>
            ${pl.eachSide.length ? `
              <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">
                ${pl.eachSide.map((p) => `
                  <span class="badge badge--ok" style="font-size:13px;padding:6px 10px">
                    ${p.plate} kg ${p.count > 1 ? `× ${p.count}` : ''}
                  </span>
                `).join('')}
              </div>
            ` : '<p class="small muted" style="margin:6px 0 0">Chỉ dùng thanh đòn rỗng, không cần lắp thêm đĩa.</p>'}

            ${pl.remainder > 0 ? `
              <div class="small" style="color:var(--warn);margin-top:8px">
                ⚠ Dư <strong>${pl.remainder} kg</strong> không lắp được bằng đĩa chuẩn (thực tế lắp được: ${pl.totalLoaded} kg).
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 4. WOD ngẫu nhiên -->
        <div class="card" id="cardWod" style="margin-top:14px">
          <div class="row row--between">
            <h2 style="margin:0;font-size:16px"><span style="color:var(--tint)">🎲</span> WOD ngẫu nhiên (50+ WOD Roulette)</h2>
          </div>
          <p class="small muted" style="margin:4px 0 10px">Quay ngẫu nhiên từ kho 50+ bài tập kinh điển (CrossFit Benchmark Girls, Heroes, Hyrox & Chippers).</p>

          <div class="row" style="gap:8px;margin-bottom:10px">
            <select class="input small" id="wod_type" style="flex:1">
              ${WOD_TYPES.map((t) => `<option value="${t.key}" ${curWodType === t.key ? 'selected' : ''}>${esc(t.label)}</option>`).join('')}
            </select>
            <select class="input small" id="wod_min" style="flex:1">
              <option value="0" ${curWodMin === 0 ? 'selected' : ''}>Mọi thời lượng</option>
              <option value="15" ${curWodMin === 15 ? 'selected' : ''}>≤ 15 phút</option>
              <option value="20" ${curWodMin === 20 ? 'selected' : ''}>≤ 20 phút</option>
              <option value="30" ${curWodMin === 30 ? 'selected' : ''}>≤ 30 phút</option>
              <option value="45" ${curWodMin === 45 ? 'selected' : ''}>≤ 45 phút</option>
              <option value="60" ${curWodMin === 60 ? 'selected' : ''}>≤ 60 phút</option>
            </select>
          </div>

          <button type="button" class="btn btn--primary btn--block" id="spinWod" style="margin-bottom:12px">🎲 Quay WOD khác</button>

          <div id="wodCard" class="card" style="background:var(--bg);padding:14px;border:1px solid var(--tint)">
            ${curWod ? `
              <div class="row row--between">
                <strong style="font-size:17px;color:var(--tint)">${esc(curWod.name)}</strong>
                <span class="badge">${esc(curWod.type.toUpperCase())} · ${curWod.minutes}p</span>
              </div>
              <ul class="list small" style="margin:10px 0;gap:4px">
                ${curWod.items.map((it) => `<li>• ${esc(it)}</li>`).join('')}
              </ul>
              <div class="small muted" style="margin-top:6px"><em>${esc(curWod.note)}</em></div>
              ${curWod.rxMale || curWod.rxFemale ? `
                <div class="small muted" style="margin-top:6px;font-size:11px">
                  ${curWod.rxMale ? `Rx Nam: <strong>${esc(curWod.rxMale)}</strong>` : ''}
                  ${curWod.rxFemale ? ` · Rx Nữ: <strong>${esc(curWod.rxFemale)}</strong>` : ''}
                </div>
              ` : ''}
            ` : '<p class="small muted">Không tìm thấy WOD phù hợp bộ lọc.</p>'}
          </div>
        </div>
      </div>
    `);

    // Gắn sự kiện tương tác
    // 1. Pace Converter
    const pM = $('#p_m'), pS = $('#p_s'), pSpd = $('#p_spd');
    pM.oninput = () => {
      paceMin = Math.max(0, parseInt(pM.value, 10) || 0);
      speedKmH = paceToSpeed(paceMin * 60 + paceSec);
      pSpd.value = speedKmH.toFixed(1);
      updateRacePreds();
    };
    pS.oninput = () => {
      paceSec = Math.max(0, Math.min(59, parseInt(pS.value, 10) || 0));
      speedKmH = paceToSpeed(paceMin * 60 + paceSec);
      pSpd.value = speedKmH.toFixed(1);
      updateRacePreds();
    };
    pSpd.oninput = () => {
      speedKmH = Math.max(0, parseFloat(pSpd.value) || 0);
      const s = speedToPace(speedKmH);
      paceMin = Math.floor(s / 60);
      paceSec = Math.round(s % 60);
      pM.value = paceMin;
      pS.value = String(paceSec).padStart(2, '0');
      updateRacePreds();
    };

    const tDist = $('#t_dist'), tMin = $('#t_min'), tSec = $('#t_sec');
    const onRaceInput = () => {
      testDistKm = Math.max(0.1, parseFloat(tDist.value) || 10);
      testMin = Math.max(0, parseInt(tMin.value, 10) || 0);
      testSec = Math.max(0, Math.min(59, parseInt(tSec.value, 10) || 0));
      updateRacePreds();
    };
    tDist.oninput = onRaceInput;
    tMin.oninput = onRaceInput;
    tSec.oninput = onRaceInput;

    function updateRacePreds() {
      const el = $('#racePredGrid');
      if (!el) return;
      const ps = predictStandardRaces(testDistKm, testMin * 60 + testSec);
      el.innerHTML = ps.map((p) => `
        <div class="card" style="padding:8px 10px;background:var(--bg)">
          <div class="small muted" style="font-size:11px">${esc(p.label)}</div>
          <strong style="font-size:15px;color:var(--tint)">${esc(p.timeFormatted)}</strong>
          <div class="small muted" style="font-size:10.5px">Pace ${esc(p.paceFormatted)}/km</div>
        </div>
      `).join('');
    }

    // 2. 1RM
    const rmK = $('#rm_kg'), rmR = $('#rm_reps');
    const onRmInput = () => {
      rmLoad = Math.max(0, parseFloat(rmK.value) || 0);
      rmReps = Math.max(1, parseInt(rmR.value, 10) || 1);
      const r = oneRm(rmLoad, rmReps);
      const elEp = $('#rm_res_epley'), elBr = $('#rm_res_brz');
      if (elEp) elEp.innerHTML = `${r.epley} <small style="font-size:13px">kg</small>`;
      if (elBr) elBr.innerHTML = `${r.brzycki} <small style="font-size:13px">kg</small>`;
      const tbl = $('#rmTable tbody');
      if (tbl) {
        const ps = oneRmPercentages(r.epley);
        tbl.innerHTML = ps.map((p) => `<tr style="border-top:1px solid rgba(255,255,255,.05)"><td style="padding:4px"><strong>${p.pct}%</strong></td><td style="padding:4px;text-align:center"><strong style="color:var(--tint)">${p.load} kg</strong></td><td style="padding:4px;text-align:right;color:var(--text-muted)">~${p.repsEst || '—'} rep</td></tr>`).join('');
      }
    };
    rmK.oninput = onRmInput;
    rmR.oninput = onRmInput;

    // 3. Plate calc
    const plT = $('#pl_target'), plB = $('#pl_bar');
    const onPlInput = () => {
      plateTarget = Math.max(0, parseFloat(plT.value) || 0);
      plateBar = parseFloat(plB.value) || 20;
      const res = plateLoad(plateTarget, plateBar);
      const box = $('#plResultBox');
      if (!box) return;
      box.innerHTML = `
        <div class="small muted">Mỗi bên lắp:</div>
        ${res.eachSide.length ? `
          <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">
            ${res.eachSide.map((p) => `
              <span class="badge badge--ok" style="font-size:13px;padding:6px 10px">
                ${p.plate} kg ${p.count > 1 ? `× ${p.count}` : ''}
              </span>
            `).join('')}
          </div>
        ` : '<p class="small muted" style="margin:6px 0 0">Chỉ dùng thanh đòn rỗng, không cần lắp thêm đĩa.</p>'}
        ${res.remainder > 0 ? `
          <div class="small" style="color:var(--warn);margin-top:8px">
            ⚠ Dư <strong>${res.remainder} kg</strong> không lắp được bằng đĩa chuẩn (thực tế lắp được: ${res.totalLoaded} kg).
          </div>
        ` : ''}
      `;
    };
    plT.oninput = onPlInput;
    plB.onchange = onPlInput;

    // 4. WOD
    const wType = $('#wod_type'), wMin = $('#wod_min'), btnSpin = $('#spinWod');
    wType.onchange = () => { curWodType = wType.value; };
    wMin.onchange = () => { curWodMin = parseInt(wMin.value, 10) || 0; };
    btnSpin.onclick = () => {
      curWod = randomWod(WODS, { type: curWodType, minutes: curWodMin });
      const card = $('#wodCard');
      if (!card) return;
      if (!curWod) {
        card.innerHTML = '<p class="small muted">Không tìm thấy WOD phù hợp bộ lọc.</p>';
        return;
      }
      card.innerHTML = `
        <div class="row row--between">
          <strong style="font-size:17px;color:var(--tint)">${esc(curWod.name)}</strong>
          <span class="badge">${esc(curWod.type.toUpperCase())} · ${curWod.minutes}p</span>
        </div>
        <ul class="list small" style="margin:10px 0;gap:4px">
          ${curWod.items.map((it) => `<li>• ${esc(it)}</li>`).join('')}
        </ul>
        <div class="small muted" style="margin-top:6px"><em>${esc(curWod.note)}</em></div>
        ${curWod.rxMale || curWod.rxFemale ? `
          <div class="small muted" style="margin-top:6px;font-size:11px">
            ${curWod.rxMale ? `Rx Nam: <strong>${esc(curWod.rxMale)}</strong>` : ''}
            ${curWod.rxFemale ? ` · Rx Nữ: <strong>${esc(curWod.rxFemale)}</strong>` : ''}
          </div>
        ` : ''}
      `;
    };
  }

  renderView();
}
