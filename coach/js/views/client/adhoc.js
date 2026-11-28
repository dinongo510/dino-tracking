// DINO-017 — Màn tạo / sửa buổi tập ngoài lịch (khách & coach)
import { render, $, esc, toast, busy } from '../../ui.js';
import { sb, viError } from '../../supabaseClient.js';
import { clientTabs } from './home.js';
import { coachTabs } from '../coach/home.js';
import { loadExercises, norm } from '../../lib/exercises.js';
import { SESSION_TYPE_VI, todayISO, defaultAdhocTitle } from '../../lib/plan.js';
import { createAdhocSession, loadSession, saveSession, deleteAdhocSession } from '../../lib/planStore.js';
import { loadFeedback } from '../../lib/logStore.js';
import { toClock, fromClock } from '../../lib/sessionLog.js';

export async function clientAdhocView({ params, profile }) {
  const isCoach = profile.role === 'coach';
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  const targetClientId = (isCoach && qs.get('client')) ? qs.get('client') : profile.id;
  const isEditing = !!params?.id;

  if (isCoach && targetClientId !== profile.id) {
    coachTabs();
  } else {
    clientTabs();
  }

  const [exList, existingSessionData] = await Promise.all([
    loadExercises(),
    isEditing ? loadSession(params.id).catch(() => null) : null,
  ]);

  const exById = new Map(exList.map((e) => [e.id, e]));
  let session = existingSessionData?.session || null;
  const fb = session ? await loadFeedback(session.id).catch(() => null) : null;
  const isCompleted = fb?.completed === true;

  const today = todayISO();
  let scheduledOn = session?.scheduled_on || qs.get('date') || today;
  let title = session?.title || (qs.get('mode') === 'pt' ? `Buổi PT ${scheduledOn.slice(8, 10)}/${scheduledOn.slice(5, 7)}` : defaultAdhocTitle(scheduledOn));
  let sessionType = session?.session_type || 'strength';
  let mode = session?.mode || qs.get('mode') || 'self';
  let coachNote = session?.coach_note || '';

  // Danh sách bài tập đang chọn: [{ id, exercise_id, sets, reps_min, reps_max, load_kg, distance_m, duration_sec, rest_sec }]
  let selectedItems = [];
  if (session?.blocks?.length) {
    selectedItems = session.blocks.flatMap((b) => b.items.map((it) => ({
      exercise_id: it.exercise_id,
      sets: it.sets || 3,
      reps_min: it.reps_min ?? 10,
      reps_max: it.reps_max ?? 10,
      load_kg: it.load_kg ?? null,
      distance_m: it.distance_m ?? null,
      duration_sec: it.duration_sec ?? null,
      rest_sec: it.rest_sec ?? 90,
    })));
  }

  function renderView() {
    render(`
      <p class="small">
        ${isCoach && targetClientId !== profile.id ? `<a href="#/coach/client/${targetClientId}/plan">← Giáo án khách</a>` : '<a href="#/client/plan">← Lịch tập</a>'}
      </p>
      <h1>${isEditing ? 'Sửa buổi tự do' : 'Tạo buổi tập ngoài lịch'}</h1>
      ${isCompleted ? '<div class="card card--hi small"><strong style="color:var(--tint)">Buổi tập này đã hoàn thành.</strong> Không thể sửa bài tập.</div>' : ''}

      <form id="adhocForm" class="stack" style="gap:14px">
        <div class="card stack" style="gap:12px">
          <label class="field">
            <span>Ngày tập</span>
            <input class="input" type="date" name="scheduled_on" value="${scheduledOn}" ${isCompleted ? 'disabled' : ''} required>
          </label>

          <label class="field">
            <span>Tên buổi tập</span>
            <input class="input" type="text" name="title" value="${esc(title)}" placeholder="Ví dụ: Buổi tự do 28/11" ${isCompleted ? 'disabled' : ''} required>
          </label>

          <label class="field">
            <span>Loại buổi tập</span>
            <select name="session_type" ${isCompleted ? 'disabled' : ''}>
              ${Object.entries(SESSION_TYPE_VI).map(([k, l]) => `<option value="${k}"${k === sessionType ? ' selected' : ''}>${esc(l)}</option>`).join('')}
            </select>
          </label>

          ${isCoach && targetClientId !== profile.id ? `
            <label class="field">
              <span>Hình thức</span>
              <select name="mode" ${isCompleted ? 'disabled' : ''}>
                <option value="pt"${mode === 'pt' ? ' selected' : ''}>PT tại chỗ (trừ 1 buổi gói khi hoàn thành)</option>
                <option value="self"${mode === 'self' ? ' selected' : ''}>Khách tự tập</option>
              </select>
            </label>
          ` : ''}

          <label class="field">
            <span>Ghi chú ${isCoach ? 'cho khách' : ''}</span>
            <textarea name="coach_note" rows="2" placeholder="Ghi chú, mục tiêu..." ${isCompleted ? 'disabled' : ''}>${esc(coachNote)}</textarea>
          </label>
        </div>

        <h2>Bài tập (${selectedItems.length})</h2>
        <div id="selectedBox" class="stack" style="gap:10px">
          ${renderSelectedItems()}
        </div>

        ${!isCompleted ? `
          <div class="card stack" style="gap:10px;background:var(--bg)">
            <strong>Thêm bài từ thư viện</strong>
            <input class="input" type="search" id="exSearch" placeholder="Gõ tên bài để tìm (không dấu)..." autocomplete="off">
            <div id="exSearchResults" class="stack" style="max-height:220px;overflow-y:auto;gap:6px"></div>
            <div class="row row--between" style="margin-top:6px">
              <span class="small muted">Chỉ chọn từ thư viện để thống kê chính xác</span>
              <button type="button" class="btn btn--ghost small" id="btnRequestEx">Báo coach thêm bài</button>
            </div>
          </div>
        ` : ''}

        <div class="row" style="gap:10px;margin-top:8px">
          ${!isCompleted ? `<button type="submit" class="btn btn--primary" style="flex:1">${isEditing ? 'Lưu thay đổi' : 'Tạo buổi & Bắt đầu tập →'}</button>` : ''}
          ${isEditing && !isCompleted ? '<button type="button" class="btn btn--ghost" id="btnDelete" style="color:var(--danger)">Xóa buổi này</button>' : ''}
        </div>
      </form>
    `);

    attachEvents();
  }

  function renderSelectedItems() {
    if (!selectedItems.length) {
      return '<div class="card"><p class="muted small">Chưa chọn bài nào. Tìm bài ở ô bên dưới để thêm.</p></div>';
    }

    return selectedItems.map((it, idx) => {
      const ex = exById.get(it.exercise_id);
      const isRun = sessionType === 'run' || ex?.category === 'run';
      return `
        <div class="card" data-idx="${idx}" style="padding:12px">
          <div class="row row--between">
            <strong>${idx + 1}. ${esc(ex?.name_vi || 'Bài tập')}</strong>
            ${!isCompleted ? `<button type="button" class="btn btn--ghost small" data-del-item="${idx}" style="padding:2px 8px;color:var(--danger)">✕</button>` : ''}
          </div>
          <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap">
            ${isRun ? `
              <label class="field" style="flex:1;min-width:110px">
                <span class="small muted">Cự ly (m)</span>
                <input class="input small" type="number" data-k="distance_m" value="${it.distance_m ?? 5000}" step="100" min="0" ${isCompleted ? 'disabled' : ''}>
              </label>
              <label class="field" style="flex:1;min-width:110px">
                <span class="small muted">Thời gian (mm:ss)</span>
                <input class="input small" type="text" data-k="duration" value="${toClock(it.duration_sec ?? 1800)}" placeholder="mm:ss" ${isCompleted ? 'disabled' : ''}>
              </label>
            ` : `
              <label class="field" style="flex:1;min-width:70px">
                <span class="small muted">Hiệp</span>
                <input class="input small" type="number" data-k="sets" value="${it.sets || 3}" min="1" max="20" ${isCompleted ? 'disabled' : ''}>
              </label>
              <label class="field" style="flex:1;min-width:70px">
                <span class="small muted">Rep</span>
                <input class="input small" type="number" data-k="reps_min" value="${it.reps_min ?? 10}" min="1" max="100" ${isCompleted ? 'disabled' : ''}>
              </label>
              <label class="field" style="flex:1;min-width:70px">
                <span class="small muted">Kg</span>
                <input class="input small" type="number" data-k="load_kg" value="${it.load_kg ?? ''}" step="any" min="0" placeholder="0" ${isCompleted ? 'disabled' : ''}>
              </label>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  function attachEvents() {
    const f = $('#adhocForm');
    if (!f) return;

    // Thay đổi ngày -> đổi title mặc định nếu title chưa đổi thủ công
    f.scheduled_on?.addEventListener('change', (e) => {
      scheduledOn = e.target.value;
      if (!isEditing && f.title.value.startsWith('Buổi tự do')) {
        f.title.value = defaultAdhocTitle(scheduledOn);
      }
    });

    f.session_type?.addEventListener('change', (e) => {
      sessionType = e.target.value;
      $('#selectedBox').innerHTML = renderSelectedItems();
      wireItemInputs();
    });

    wireItemInputs();

    // Tìm bài tập
    const searchInput = $('#exSearch');
    const resultsBox = $('#exSearchResults');
    if (searchInput && resultsBox) {
      searchInput.addEventListener('input', () => {
        const q = norm(searchInput.value.trim());
        if (!q) {
          resultsBox.innerHTML = '';
          return;
        }
        const matches = exList.filter((e) => norm(e.name_vi).includes(q) || norm(e.id).includes(q)).slice(0, 15);
        if (!matches.length) {
          resultsBox.innerHTML = '<div class="small muted" style="padding:6px">Không tìm thấy bài tập nào.</div>';
          return;
        }
        resultsBox.innerHTML = matches.map((m) => `
          <div class="row row--between card" style="padding:8px 12px;cursor:pointer;margin:0" data-add-ex="${m.id}">
            <span><strong>${esc(m.name_vi)}</strong> <span class="small muted">(${esc(m.category || 'gym')})</span></span>
            <button type="button" class="btn btn--primary small" style="pointer-events:none">+ Thêm</button>
          </div>
        `).join('');
      });

      resultsBox.addEventListener('click', (e) => {
        const row = e.target.closest('[data-add-ex]');
        if (!row) return;
        const exId = row.dataset.addEx;
        const ex = exById.get(exId);
        const isRun = sessionType === 'run' || ex?.category === 'run';
        selectedItems.push({
          exercise_id: exId,
          sets: 3,
          reps_min: 10,
          reps_max: 10,
          load_kg: null,
          distance_m: isRun ? 5000 : null,
          duration_sec: isRun ? 1800 : null,
          rest_sec: 90,
        });
        searchInput.value = '';
        resultsBox.innerHTML = '';
        $('#selectedBox').innerHTML = renderSelectedItems();
        wireItemInputs();
      });
    }

    // Nút báo coach thêm bài
    $('#btnRequestEx')?.addEventListener('click', () => {
      toast('Hãy nhắn tin cho Coach trong phần chat buổi tập để yêu cầu thêm bài tập bạn cần nhé!');
    });

    // Xóa bài
    $('#selectedBox')?.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-del-item]');
      if (!delBtn) return;
      const idx = Number(delBtn.dataset.delItem);
      selectedItems.splice(idx, 1);
      $('#selectedBox').innerHTML = renderSelectedItems();
      wireItemInputs();
    });

    // Xóa buổi
    $('#btnDelete')?.addEventListener('click', async (e) => {
      if (!confirm('Bạn có chắc chắn muốn xóa buổi tập ngoài lịch này?')) return;
      await busy(e.currentTarget, async () => {
        try {
          await deleteAdhocSession(session.id);
          toast('Đã xóa buổi tập ngoài lịch.');
          location.hash = isCoach && targetClientId !== profile.id ? `#/coach/client/${targetClientId}/plan` : '#/client/plan';
        } catch (err) {
          toast(viError(err), 'error');
        }
      });
    });

    // Submit form
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!selectedItems.length) {
        return toast('Vui lòng thêm ít nhất 1 bài tập vào buổi tập.', 'error');
      }

      const postData = {
        scheduled_on: f.scheduled_on.value,
        title: f.title.value.trim() || defaultAdhocTitle(f.scheduled_on.value),
        session_type: f.session_type.value,
        mode: f.mode?.value || mode,
        coach_note: f.coach_note.value.trim() || null,
        blocks: [
          {
            block_type: f.session_type.value === 'run' ? 'run' : 'straight',
            label: 'A',
            items: selectedItems.map((it) => ({
              exercise_id: it.exercise_id,
              sets: it.sets,
              reps_min: it.reps_min,
              reps_max: it.reps_max,
              load_kg: it.load_kg,
              distance_m: it.distance_m,
              duration_sec: it.duration_sec,
              rest_sec: it.rest_sec,
            })),
          },
        ],
      };

      await busy(e.submitter, async () => {
        try {
          let sid = session?.id;
          if (isEditing) {
            session.title = postData.title;
            session.scheduled_on = postData.scheduled_on;
            session.session_type = postData.session_type;
            session.mode = postData.mode;
            session.coach_note = postData.coach_note;
            session.blocks = postData.blocks;
            await saveSession(session, existingSessionData.session);
            toast('Đã cập nhật buổi tập.');
          } else {
            const created = await createAdhocSession(targetClientId, postData);
            sid = created.id;
            toast('Đã tạo buổi tập ngoài lịch.');
          }
          location.hash = `#/client/session/${sid}`;
        } catch (err) {
          toast(viError(err), 'error');
        }
      });
    });
  }

  function wireItemInputs() {
    document.querySelectorAll('#selectedBox [data-idx]').forEach((box) => {
      const idx = Number(box.dataset.idx);
      box.querySelectorAll('input').forEach((inp) => {
        inp.oninput = () => {
          const k = inp.dataset.k;
          if (k === 'duration') {
            selectedItems[idx].duration_sec = fromClock(inp.value);
          } else if (k === 'load_kg') {
            selectedItems[idx].load_kg = inp.value === '' ? null : Number(inp.value);
          } else if (k === 'distance_m') {
            selectedItems[idx].distance_m = inp.value === '' ? null : Number(inp.value);
          } else if (k === 'sets') {
            selectedItems[idx].sets = Math.max(1, Number(inp.value) || 1);
          } else if (k === 'reps_min') {
            const r = Math.max(1, Number(inp.value) || 1);
            selectedItems[idx].reps_min = r;
            selectedItems[idx].reps_max = r;
          }
        };
      });
    });
  }

  renderView();
}
