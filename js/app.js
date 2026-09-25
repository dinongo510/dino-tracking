/**
 * Dino Tracking - Master App Controller
 * Architecture:
 * 1. 5-Tab Navigation Router (Workout, Builder, Prehab, Tools, Stats)
 * 2. Workout State Engine (Live Logging, Active Lock State, Cancel/Finish, Rest Timer)
 * 3. Tree-Structure Program Builder with Simple [Up]/[Down] Reordering & Custom Exercises
 * 4. NASM CEX Prehab Engine (4-Step Inhibit, Lengthen, Activate, Integrate + Guided Timer)
 * 5. Tools Engine (Pace/Speed Converter, 50+ WOD Roulette Randomizer, Plate & 1RM Calc)
 * 6. 3D SVG Human Body Muscle Heatmap (Anterior + Posterior with Athletic Red Glow)
 * 7. Google Gemini AI Coach Chat Interface
 */

class DinoApp {
  constructor() {
    this.storage = window.dinoStorage;
    this.timer = window.DinoTimerEngine ? new DinoTimerEngine() : null;
    this.aiCoach = window.dinoAICoach;
    
    this.activeTab = "workout";
    this.currentRouletteWOD = null;
    this.prehabCurrentStepIndex = 0;
    this.prehabSteps = [];
    this.prehabTimerInterval = null;
    this.prehabTimerRemaining = 0;
    this.prehabTimerIsPaused = false;
    this.isSpinningRoulette = false;
    this.pickerSearchQuery = "";
    this.pickerCategory = "all";
    this.builderPendingTarget = null;
    
    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindHeaderActions();
    this.bindWorkoutEvents();
    this.bindBuilderEvents();
    this.bindPrehabEvents();
    this.bindToolsEvents();
    this.bindAICoachEvents();
    this.bindSettingsEvents();
    this.bindTimerCallbacks();

    // Initial Render of Active Tab
    this.switchTab("workout");
  }

  // =========================================================================
  // 1. FLAWLESS 5-TAB NAVIGATION ROUTER
  // =========================================================================
  bindNavigation() {
    const navButtons = document.querySelectorAll(".nav-item-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        if (tabId) this.switchTab(tabId);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Bottom Nav Buttons
    document.querySelectorAll(".nav-item-btn").forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update Tab Contents
    document.querySelectorAll(".tab-content").forEach(tab => {
      if (tab.id === `tab-${tabId}`) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Tab-Specific Render Hooks
    if (tabId === "workout") this.renderWorkoutView();
    else if (tabId === "builder") this.renderBuilderView();
    else if (tabId === "prehab") this.renderPrehabView();
    else if (tabId === "tools") this.renderToolsView();
    else if (tabId === "stats") this.renderStatsView();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showToast(message) {
    const toast = document.getElementById("toastBox");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }

  // =========================================================================
  // 2. HEADER ACTIONS & MODAL TOGGLES
  // =========================================================================
  bindHeaderActions() {
    const btnAI = document.getElementById("btnHeaderAICoach");
    if (btnAI) btnAI.addEventListener("click", () => this.openModal("modalAICoach"));

    const btnSettings = document.getElementById("btnHeaderSettings");
    if (btnSettings) btnSettings.addEventListener("click", () => this.openModal("modalSettings"));

    // Modal Close Buttons
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.classList.contains("btn-sheet-close")) {
          overlay.classList.remove("active");
        }
      });
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }

  // =========================================================================
  // 3. TAB 1: WORKOUT LOGGER & STATE MANAGEMENT (LOCK & CANCEL)
  // =========================================================================
  bindWorkoutEvents() {
    const btnSwitch = document.getElementById("btnSwitchProgramDirect");
    if (btnSwitch) {
      btnSwitch.addEventListener("click", () => this.switchTab("builder"));
    }

    const btnStart = document.getElementById("btnStartWorkoutSession");
    if (btnStart) {
      btnStart.addEventListener("click", () => this.startActiveWorkout());
    }

    const btnPause = document.getElementById("btnPauseWorkout");
    if (btnPause) {
      btnPause.addEventListener("click", () => {
        if (this.timer) {
          if (this.timer.sessionIsPaused) {
            this.timer.resumeSession();
            btnPause.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
          } else {
            this.timer.pauseSession();
            btnPause.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
          }
        }
      });
    }

    const btnCancel = document.getElementById("btnCancelWorkout");
    if (btnCancel) {
      btnCancel.addEventListener("click", () => this.confirmCancelWorkout());
    }

    const btnFinish = document.getElementById("btnFinishWorkout");
    if (btnFinish) {
      btnFinish.addEventListener("click", () => this.openWorkoutSummaryModal());
    }

    const btnConfirmSave = document.getElementById("btnConfirmSaveWorkout");
    if (btnConfirmSave) {
      btnConfirmSave.addEventListener("click", () => this.saveAndCompleteWorkout());
    }

    const btnGoToActive = document.getElementById("btnGoToActiveWorkoutDay");
    if (btnGoToActive) {
      btnGoToActive.addEventListener("click", () => {
        const activeState = this.storage.getActiveWorkoutState();
        if (activeState) {
          this.storage.setActiveProgramId(activeState.progId);
          this.storage.setActiveWeekId(activeState.weekId);
          this.storage.setActiveDayId(activeState.dayId);
          this.renderWorkoutView();
        }
      });
    }

    const inputNotes = document.getElementById("inputWorkoutNotes");
    if (inputNotes) {
      inputNotes.addEventListener("input", (e) => {
        const tag = document.getElementById("notesSavedTag");
        if (tag) {
          tag.style.display = "inline";
          setTimeout(() => { tag.style.display = "none"; }, 1500);
        }
        if (this.storage.isWorkoutActive()) {
          this.storage.updateActiveWorkoutLogs(null, e.target.value);
        }
      });
    }
  }

  renderWorkoutView() {
    const prog = this.storage.getActiveProgram();
    if (!prog) return;

    // Header Subtitle & Banner
    const subtitleEl = document.getElementById("headerProgramSubtitle");
    if (subtitleEl) subtitleEl.textContent = prog.name;

    const progNameText = document.getElementById("activeProgramNameText");
    if (progNameText) progNameText.textContent = prog.name;

    // Render Weeks Toggle
    const weekContainer = document.getElementById("weekToggleContainer");
    if (weekContainer && prog.weeks) {
      weekContainer.innerHTML = "";
      prog.weeks.forEach(w => {
        const btn = document.createElement("button");
        btn.className = `btn-week-toggle ${w.id === this.storage.getActiveWeekId() ? "active" : ""}`;
        btn.textContent = w.name;
        btn.addEventListener("click", () => {
          this.storage.setActiveWeekId(w.id);
          if (w.days && w.days.length > 0) {
            this.storage.setActiveDayId(w.days[0].id);
          }
          this.renderWorkoutView();
        });
        weekContainer.appendChild(btn);
      });
    }

    // Active Week & Days
    const activeWeek = (prog.weeks || []).find(w => w.id === this.storage.getActiveWeekId()) || (prog.weeks ? prog.weeks[0] : null);
    const dayChipsContainer = document.getElementById("dayChipsContainer");
    
    if (dayChipsContainer && activeWeek && activeWeek.days) {
      dayChipsContainer.innerHTML = "";
      activeWeek.days.forEach(d => {
        const chip = document.createElement("button");
        chip.className = `btn-day-chip ${d.id === this.storage.getActiveDayId() ? "active" : ""}`;
        chip.innerHTML = `
          <span class="chip-key">${d.dayKey || "Day"}</span>
          <span class="chip-title">${d.title || "Workout"}</span>
        `;
        chip.addEventListener("click", () => {
          this.storage.setActiveDayId(d.id);
          this.renderWorkoutView();
        });
        dayChipsContainer.appendChild(chip);
      });
    }

    // Active Day Meta
    const activeDay = activeWeek && activeWeek.days ? activeWeek.days.find(d => d.id === this.storage.getActiveDayId()) || activeWeek.days[0] : null;
    
    if (activeDay) {
      const dayTag = document.getElementById("heroDayTag");
      if (dayTag) dayTag.textContent = `${activeDay.dayKey || "DAY"} • ${activeDay.badge || "WORKOUT"}`;

      const titleEl = document.getElementById("heroWorkoutTitle");
      if (titleEl) titleEl.textContent = activeDay.title;

      const focusEl = document.getElementById("heroWorkoutFocus");
      if (focusEl) focusEl.textContent = activeDay.focus || "Tập luyện sức mạnh & cơ bắp.";

      // WORKOUT LOCK STATE LOGIC
      const activeState = this.storage.getActiveWorkoutState();
      const startOverlay = document.getElementById("workoutStartOverlay");
      const stopwatchCluster = document.getElementById("activeStopwatchCluster");
      const lockBadge = document.getElementById("activeLockBadge");
      const lockedWarning = document.getElementById("workoutLockedWarning");

      if (activeState && activeState.isActive) {
        // Is this specific day the one currently running?
        const isThisDayActive = (activeState.progId === prog.id && activeState.weekId === activeWeek.id && activeState.dayId === activeDay.id);

        if (isThisDayActive) {
          if (startOverlay) startOverlay.style.display = "none";
          if (stopwatchCluster) stopwatchCluster.style.display = "flex";
          if (lockBadge) lockBadge.style.display = "inline-block";
          if (lockedWarning) lockedWarning.style.display = "none";
          
          if (this.timer && !this.timer.sessionIsRunning) {
            const elapsed = Math.max(0, Math.floor((Date.now() - activeState.startTime) / 1000));
            this.timer.startSession(elapsed);
          }
        } else {
          // Locked State: Another day is active!
          if (startOverlay) startOverlay.style.display = "none";
          if (stopwatchCluster) stopwatchCluster.style.display = "none";
          if (lockBadge) lockBadge.style.display = "none";
          if (lockedWarning) lockedWarning.style.display = "block";
        }
      } else {
        // Normal Unstarted State
        if (startOverlay) startOverlay.style.display = "flex";
        if (stopwatchCluster) stopwatchCluster.style.display = "none";
        if (lockBadge) lockBadge.style.display = "none";
        if (lockedWarning) lockedWarning.style.display = "none";
      }

      const hasExercises = activeDay.exercises && activeDay.exercises.length > 0;
      const hasCardio = activeDay.type === 'run' || activeDay.type === 'hybrid' || (activeDay.targetKm && activeDay.targetKm > 0) || !hasExercises;

      if (hasExercises && hasCardio) {
        // Hybrid day: preserve BOTH resistance exercises AND cardio logging UI
        this.renderExerciseCards(activeDay.exercises);
        this.renderCardioSessionView(activeDay, true); // true = append to container
      } else if (hasCardio) {
        // Cardio-only day
        this.renderCardioSessionView(activeDay, false);
      } else {
        // Resistance-only day
        this.renderExerciseCards(activeDay.exercises || []);
      }
    }
  }

  renderCardioSessionView(activeDay, append = false) {
    const container = document.getElementById("workoutExercisesContainer");
    if (!container) return;

    const activeState = this.storage.getActiveWorkoutState();
    const isSessionActive = this.storage.isWorkoutActive() && activeState && (activeState.dayId === activeDay.id);
    const savedCardio = (activeState && activeState.actualCardio) ? activeState.actualCardio : {};

    const plannedDist = activeDay.targetKm || (activeDay.cardio ? activeDay.cardio.targetKm : "") || "";
    // Actual distance MUST NOT inherit planned distance. Must remain empty until recorded by user.
    const distVal = (savedCardio && savedCardio.distanceKm !== null && savedCardio.distanceKm !== undefined) ? savedCardio.distanceKm : "";
    const durVal = (savedCardio && savedCardio.durationMin !== null && savedCardio.durationMin !== undefined) ? savedCardio.durationMin : "";
    const notesVal = (savedCardio && savedCardio.notes) ? savedCardio.notes : "";
    const paceVal = (savedCardio && savedCardio.pace && savedCardio.pace !== "—") ? savedCardio.pace : "--:--";

    // Options HTML if defined
    let optionsHtml = "";
    if (activeDay.options && Array.isArray(activeDay.options) && activeDay.options.length > 0) {
      optionsHtml = `
        <div class="cardio-options-box">
          <div style="font-size: 11px; font-weight: 800; color: var(--color-blue); text-transform: uppercase; margin-bottom: 6px;">
            📋 Lựa Chọn Phương Án (Prescribed Options)
          </div>
          ${activeDay.options.map(opt => `
            <div style="margin-bottom: 8px; font-size: 12px; line-height: 1.4; padding: 6px 8px; background: rgba(255,255,255,0.02); border-radius: 4px;">
              <div style="font-weight: 700; color: #fff;">${opt.title} <span style="color: var(--color-gold); font-size: 11px;">(${opt.rpe || ''})</span></div>
              <div style="color: var(--text-muted); font-size: 11.5px; margin-top: 2px;">${opt.details}</div>
            </div>
          `).join("")}
        </div>
      `;
    }

    // Checklist HTML if defined
    let checklistHtml = "";
    if (activeDay.checklist && Array.isArray(activeDay.checklist) && activeDay.checklist.length > 0) {
      checklistHtml = `
        <div style="margin-top: 10px; padding: 8px 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px;">Checklist Buổi Chạy</div>
          ${activeDay.checklist.map(chk => `
            <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text-white); margin-bottom: 6px; cursor: pointer;">
              <input type="checkbox" style="margin-top: 2px; accent-color: var(--color-blue);">
              <span>${chk.label} <span style="color: var(--text-dim); font-size: 10.5px;">(${chk.note || ''})</span></span>
            </label>
          `).join("")}
        </div>
      `;
    }

    const cardHtml = `
      <div class="cardio-session-card">
        <div class="cardio-plan-header">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: var(--color-blue); text-transform: uppercase;">
              ${activeDay.badge || 'Cardio / Running'}
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #fff; margin-top: 2px;">
              ${activeDay.title}
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              ${activeDay.focus || 'Buổi tập cardio / chạy bộ'}
            </div>
          </div>
          ${plannedDist ? `<span class="cardio-target-badge">Mục tiêu: ${plannedDist} km</span>` : ''}
        </div>

        ${optionsHtml}
        ${checklistHtml}

        <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
          <div style="font-size: 12px; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
            <span>🏃 Ghi Nhận Thực Tế (Actual Cardio)</span>
            <span id="cardioPaceDisplay" class="cardio-pace-display-badge">Pace: ${paceVal}</span>
          </div>

          <div class="cardio-inputs-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; display: block;">QUÃNG ĐƯỜNG (KM) *</label>
              <input type="number" id="inputCardioDistance" class="form-input" placeholder="VD: ${plannedDist || '5.0'}" step="0.1" min="0" value="${distVal}">
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; display: block;">THỜI GIAN (PHÚT) *</label>
              <input type="number" id="inputCardioDuration" class="form-input" placeholder="VD: 55" step="1" min="0" value="${durVal}">
            </div>
          </div>

          <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
            <button type="button" id="btnSyncCardioTimer" class="btn-timer-mini" style="font-size: 11px; padding: 4px 8px; border-radius: 4px;">
              ⏱️ Lấy từ đồng hồ (${this.timer ? Math.round(this.timer.getSessionElapsedSeconds() / 60) : 0} ph)
            </button>
          </div>

          <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
            <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; display: block;">GHI CHÚ BUỔI CHẠY (RPE, THỜI TIẾT, CẢM GIÁC)</label>
            <input type="text" id="inputCardioNotes" class="form-input" placeholder="VD: RPE 8, chân khỏe, chạy Option A..." value="${notesVal}">
          </div>
        </div>
      </div>
    `;

    let cardElement;
    if (append) {
      const tempWrapper = document.createElement("div");
      tempWrapper.innerHTML = cardHtml;
      cardElement = tempWrapper.firstElementChild;
      container.appendChild(cardElement);
    } else {
      container.innerHTML = cardHtml;
      cardElement = container.querySelector(".cardio-session-card");
    }

    // Calculate pace and auto-persist
    const distInput = cardElement.querySelector("#inputCardioDistance");
    const durInput = cardElement.querySelector("#inputCardioDuration");
    const notesInput = cardElement.querySelector("#inputCardioNotes");
    const paceBadge = cardElement.querySelector("#cardioPaceDisplay");
    const btnSync = cardElement.querySelector("#btnSyncCardioTimer");

    const updateCardioState = () => {
      const rawDist = distInput ? distInput.value.trim() : "";
      const rawDur = durInput ? durInput.value.trim() : "";
      const d = parseFloat(rawDist);
      const m = parseFloat(rawDur);

      const isDistInvalid = rawDist !== "" && (isNaN(d) || d < 0);
      const isDurInvalid = rawDur !== "" && (isNaN(m) || m < 0);

      distInput?.classList.toggle("input-invalid", isDistInvalid);
      durInput?.classList.toggle("input-invalid", isDurInvalid);

      let paceStr = "--:--";
      if (!isNaN(d) && d > 0 && !isNaN(m) && m > 0) {
        const paceDec = m / d;
        const mins = Math.floor(paceDec);
        const secs = Math.round((paceDec - mins) * 60);
        const adjMins = secs === 60 ? mins + 1 : mins;
        const adjSecs = secs === 60 ? 0 : secs;
        paceStr = `${adjMins}:${String(adjSecs).padStart(2, '0')} /km`;
      }
      if (paceBadge) paceBadge.textContent = `Pace: ${paceStr}`;

      if (this.storage.isWorkoutActive()) {
        const cardioData = {
          sessionType: activeDay.badge || activeDay.title || "Cardio",
          distanceKm: (rawDist !== "" && !isNaN(d) && d >= 0) ? d : null,
          durationMin: (rawDur !== "" && !isNaN(m) && m >= 0) ? m : null,
          pace: paceStr,
          notes: notesInput ? notesInput.value : "",
          completedTimestamp: Date.now()
        };
        this.storage.updateActiveWorkoutLogs(null, null, cardioData);
      }
    };

    if (distInput) distInput.addEventListener("input", updateCardioState);
    if (durInput) durInput.addEventListener("input", updateCardioState);
    if (notesInput) notesInput.addEventListener("input", updateCardioState);

    if (btnSync) {
      btnSync.addEventListener("click", () => {
        const elapsedSec = this.timer ? this.timer.getSessionElapsedSeconds() : 0;
        const mins = Math.max(1, Math.round(elapsedSec / 60));
        if (durInput) {
          durInput.value = mins;
          updateCardioState();
        }
      });
    }
  }

  renderExerciseCards(exercises) {
    const container = document.getElementById("workoutExercisesContainer");
    if (!container) return;

    container.innerHTML = "";
    if (exercises.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; background: var(--bg-card); border-radius: var(--radius-md); color: var(--text-dim); font-size: 13px;">
          Ngày này chưa có bài tập nào. Bấm tab <strong>"Builder"</strong> để thêm bài tập cho giáo án!
        </div>
      `;
      return;
    }

    const activeState = this.storage.getActiveWorkoutState();
    const isSessionActive = this.storage.isWorkoutActive();
    const loggedSets = (activeState && activeState.loggedSets) ? activeState.loggedSets : {};

    exercises.forEach((ex, exIdx) => {
      const card = document.createElement("div");
      card.className = "hevy-exercise-card";

      // Query previous completed performance for this exercise
      const lastPerf = this.storage.getLastCompletedExercisePerformance(ex.id, ex.name);
      let prevSummaryText = "";
      if (lastPerf && lastPerf.sets && lastPerf.sets.length > 0) {
        prevSummaryText = lastPerf.sets.map(s => {
          const rirPart = (s.actual?.rir !== undefined && s.actual?.rir !== "" && s.actual?.rir !== null) ? ` @ RIR ${s.actual.rir}` : "";
          return `S${s.setNumber}: ${s.actual?.load ?? 0}kg × ${s.actual?.reps ?? 0}${rirPart}`;
        }).join(" | ");
      } else if (lastPerf && lastPerf.legacySummary) {
        prevSummaryText = lastPerf.legacySummary;
      }

      const setsHtml = (ex.defaultSets || []).map((s, sIdx) => {
        const savedSet = (loggedSets[ex.id] && loggedSets[ex.id][sIdx]) ? loggedSets[ex.id][sIdx] : null;
        const isChecked = savedSet ? !!savedSet.completed : false;
        const hasSavedWeight = savedSet && savedSet.actual?.load !== null && savedSet.actual?.load !== undefined;
        const hasSavedReps = savedSet && savedSet.actual?.reps !== null && savedSet.actual?.reps !== undefined;
        const hasSavedRir = savedSet && savedSet.actual?.rir !== null && savedSet.actual?.rir !== undefined && savedSet.actual?.rir !== "";

        // Unrecorded actual values must remain empty until user records them. No fake defaults (no 50kg, no 8 reps).
        const actualWeight = hasSavedWeight ? savedSet.actual.load : "";
        const actualReps = hasSavedReps ? savedSet.actual.reps : "";
        const actualRir = hasSavedRir ? savedSet.actual.rir : "";

        let prevSetDisplay = "";
        if (lastPerf && lastPerf.sets && lastPerf.sets[sIdx]) {
          const ps = lastPerf.sets[sIdx];
          const rirStr = (ps.actual?.rir !== undefined && ps.actual?.rir !== "" && ps.actual?.rir !== null) ? ` @ RIR ${ps.actual.rir}` : "";
          prevSetDisplay = `${ps.actual?.load ?? 0}kg × ${ps.actual?.reps ?? 0}${rirStr}`;
        }

        return `
        <tr data-ex-idx="${exIdx}" data-set-idx="${sIdx}" data-ex-id="${ex.id}">
          <td>
            <span class="set-num-badge ${s.isRestPause ? 'rest-pause' : ''}">
              ${s.setNum || (sIdx + 1)}
            </span>
          </td>
          <td style="text-align: left; padding: 4px 6px;">
            <div style="font-size: 11px; color: var(--text-muted);">${s.note || s.rir || "RIR 1-2"}</div>
            ${prevSetDisplay ? `<div style="font-size: 9.5px; color: var(--color-gold); font-weight: 600;">Trước: ${prevSetDisplay}</div>` : ''}
          </td>
          <td>
            <input type="number" class="set-input-num input-weight" value="${actualWeight}" placeholder="${s.weightKg || '—'}" step="2.5" min="0">
          </td>
          <td>
            <input type="number" class="set-input-num input-reps" value="${actualReps}" placeholder="${s.reps || 'reps'}" min="1" max="100">
          </td>
          <td>
            <input type="text" class="set-input-num input-rir" placeholder="${s.rir ? String(s.rir).replace(/[^0-9.]/g, '') || 'RIR' : 'RIR'}" value="${actualRir}">
          </td>
          <td>
            <button type="button" class="btn-check-set ${isChecked ? 'checked' : ''}" data-rest-sec="${s.restSec || 120}" data-is-rp="${s.isRestPause ? 'true' : 'false'}">
              ✓
            </button>
          </td>
        </tr>
      `;
      }).join("");

      card.innerHTML = `
        <div class="hevy-card-top-row">
          <div style="flex: 1; min-width: 0; padding-right: 8px;">
            <div class="hevy-ex-title" data-ex-idx="${exIdx}" title="Bấm để xem chi tiết bài tập & 3D heatmap">
              <span>${ex.name}</span>
              <span class="info-dot">ℹ️</span>
            </div>
            <div class="hevy-ex-meta">${ex.category || 'Compound'} • ${ex.equipment || 'Barbell'} • ${(ex.primaryMuscles || []).join(', ')}</div>
            ${prevSummaryText ? `<div class="hevy-ex-prev-perf"><span class="prev-tag">Lần trước:</span> <span>${prevSummaryText}</span></div>` : ''}
            ${ex.targetRequirement ? `<div class="hevy-ex-target-note">${ex.targetRequirement}</div>` : ''}
            ${ex.optionNote ? `<div class="hevy-ex-option-line"><span class="opt-tag-red">Option:</span> ${ex.optionNote.replace(/^Option:\s*/i, '')}</div>` : ''}
          </div>
          <div class="hevy-ex-actions-top">
            <button class="btn-mini-ex-tool btn-open-ex-detail" data-ex-idx="${exIdx}" title="Xem 3D Heatmap & Form Cues">🔍</button>
            <button class="btn-mini-ex-tool btn-open-plate-calc" title="Tính đĩa tạ">🏋️</button>
          </div>
        </div>

        <table class="hevy-sets-table">
          <thead>
            <tr>
              <th>SET</th>
              <th>MỤC TIÊU</th>
              <th>KG</th>
              <th>REPS</th>
              <th>RIR</th>
              <th>XONG</th>
            </tr>
          </thead>
          <tbody>
            ${setsHtml}
          </tbody>
        </table>

        <div class="hevy-add-set-row">
          <button class="btn-add-set-mini" data-ex-idx="${exIdx}">+ Thêm Set</button>
        </div>
      `;

      // Helper to validate and persist row data
      const validateRow = (row) => {
        const wInput = row.querySelector(".input-weight");
        const rInput = row.querySelector(".input-reps");
        const rirInput = row.querySelector(".input-rir");

        const rawW = wInput?.value?.trim() ?? "";
        const rawR = rInput?.value?.trim() ?? "";
        const rawRir = rirInput?.value?.trim() ?? "";

        const w = rawW === "" ? null : parseFloat(rawW);
        const r = rawR === "" ? null : parseInt(rawR, 10);
        const parsedRir = rawRir === "" ? null : parseFloat(rawRir);

        const isWeightInvalid = rawW !== "" && (isNaN(w) || w < 0);
        const isRepsInvalid = rawR !== "" && (isNaN(r) || r < 1);
        const isRirInvalid = rawRir !== "" && !isNaN(parsedRir) && parsedRir < 0;

        wInput?.classList.toggle("input-invalid", !!isWeightInvalid);
        rInput?.classList.toggle("input-invalid", !!isRepsInvalid);
        rirInput?.classList.toggle("input-invalid", !!isRirInvalid);

        const hasValidRecordedData = !isWeightInvalid && !isRepsInvalid && !isRirInvalid && w !== null && !isNaN(w) && w >= 0 && r !== null && !isNaN(r) && r >= 1;

        return {
          isValid: hasValidRecordedData,
          w: (w !== null && !isNaN(w) && w >= 0) ? w : null,
          r: (r !== null && !isNaN(r) && r >= 1) ? r : null,
          rir: rawRir !== "" ? rawRir : null
        };
      };

      // Helper to update actual set data and persist to storage
      const persistSetRow = (row) => {
        const valRes = validateRow(row);
        if (!this.storage.isWorkoutActive()) return;
        const currentActive = this.storage.getActiveWorkoutState();
        if (!currentActive) return;
        if (!currentActive.loggedSets) currentActive.loggedSets = {};
        if (!currentActive.loggedSets[ex.id]) currentActive.loggedSets[ex.id] = [];

        const sIdx = parseInt(row.getAttribute("data-set-idx"), 10);
        const isChecked = row.querySelector(".btn-check-set")?.classList.contains("checked");

        const existing = currentActive.loggedSets[ex.id][sIdx] || {};
        currentActive.loggedSets[ex.id][sIdx] = {
          setId: existing.setId || `set_${ex.id}_${sIdx + 1}_${Date.now()}`,
          exerciseId: ex.id,
          exerciseName: ex.name,
          setNumber: sIdx + 1,
          modality: "strength",
          planned: existing.planned || {
            reps: ex.defaultSets?.[sIdx]?.reps || "8-10",
            load: ex.defaultSets?.[sIdx]?.weightKg || null,
            rir: ex.defaultSets?.[sIdx]?.rir || "RIR 1-2"
          },
          actual: {
            load: valRes.w,
            reps: valRes.r,
            rir: valRes.rir,
            duration: null,
            distance: null
          },
          completed: !!isChecked,
          timestamp: isChecked ? (existing.timestamp || Date.now()) : null,
          notes: ""
        };

        this.storage.updateActiveWorkoutLogs(currentActive.loggedSets);
      };

      // Input change listeners for immediate data validation and persistence
      card.querySelectorAll(".input-weight, .input-reps, .input-rir").forEach(input => {
        input.addEventListener("input", (e) => {
          const row = e.target.closest("tr");
          if (row) {
            validateRow(row);
            persistSetRow(row);
          }
        });
      });

      // Interactive Exercise Detail Modal Shortcut
      const titleClickEl = card.querySelector(".hevy-ex-title");
      if (titleClickEl) {
        titleClickEl.addEventListener("click", () => this.openExerciseDetailModal(ex));
      }

      const btnDetail = card.querySelector(".btn-open-ex-detail");
      if (btnDetail) {
        btnDetail.addEventListener("click", () => this.openExerciseDetailModal(ex));
      }

      // Set Completion Checkmark with Strict Input Validation
      card.querySelectorAll(".btn-check-set").forEach(btn => {
        btn.addEventListener("click", () => {
          const row = btn.closest("tr");
          if (!row) return;

          const isCurrentlyChecked = btn.classList.contains("checked");

          // If checking set (not unchecking), enforce input validation and require actual values
          if (!isCurrentlyChecked) {
            const valRes = validateRow(row);

            if (!valRes.isValid) {
              const rawW = row.querySelector(".input-weight")?.value?.trim() ?? "";
              const rawR = row.querySelector(".input-reps")?.value?.trim() ?? "";
              if (rawW === "" || valRes.w === null || isNaN(valRes.w) || valRes.w < 0) {
                row.querySelector(".input-weight")?.classList.add("input-invalid");
              }
              if (rawR === "" || valRes.r === null || isNaN(valRes.r) || valRes.r < 1) {
                row.querySelector(".input-reps")?.classList.add("input-invalid");
              }
              this.showToast("⚠️ Vui lòng nhập mức tạ hợp lệ (≥ 0 kg) và số reps (≥ 1).");
              return;
            }
          }

          btn.classList.toggle("checked");
          const isChecked = btn.classList.contains("checked");

          persistSetRow(row);

          if (isChecked) {
            // Trigger audio & Rest Timer HUD
            if (window.DinoAudio) window.DinoAudio.playSuccessBeep();
            const restSec = parseInt(btn.getAttribute("data-rest-sec"), 10) || 120;
            const isRP = btn.getAttribute("data-is-rp") === "true";
            this.startRestTimer(restSec, isRP);
          }
        });
      });

      // Add Set Button
      const btnAddSet = card.querySelector(".btn-add-set-mini");
      if (btnAddSet) {
        btnAddSet.addEventListener("click", () => {
          if (!ex.defaultSets) ex.defaultSets = [];
          const nextSetNum = ex.defaultSets.length + 1;
          ex.defaultSets.push({ setNum: nextSetNum, reps: "8-10", rir: "RIR 1", restSec: 120 });

          // Also register in activeState.loggedSets if active
          if (this.storage.isWorkoutActive()) {
            const currentActive = this.storage.getActiveWorkoutState();
            if (currentActive && currentActive.loggedSets) {
              if (!currentActive.loggedSets[ex.id]) currentActive.loggedSets[ex.id] = [];
              currentActive.loggedSets[ex.id].push({
                setId: `set_${ex.id}_${nextSetNum}_${Date.now()}`,
                exerciseId: ex.id,
                exerciseName: ex.name,
                setNumber: nextSetNum,
                modality: "strength",
                planned: { reps: "8-10", load: null, rir: "RIR 1" },
                actual: { reps: null, load: null, rir: null },
                completed: false,
                timestamp: null,
                notes: ""
              });
              this.storage.updateActiveWorkoutLogs(currentActive.loggedSets);
            }
          }

          this.renderExerciseCards(exercises);
        });
      }

      // Plate Calc Shortcut
      const btnPlate = card.querySelector(".btn-open-plate-calc");
      if (btnPlate) {
        btnPlate.addEventListener("click", () => {
          this.switchTab("tools");
          this.switchToolsSubnav("PlateCalc");
        });
      }

      container.appendChild(card);
    });
  }

  openExerciseDetailModal(ex) {
    if (!ex) return;

    const nameEl = document.getElementById("detailExName");
    if (nameEl) nameEl.textContent = ex.name;

    const catBadge = document.getElementById("detailExCategoryBadge");
    if (catBadge) catBadge.textContent = ex.category || "Strength";

    const eqEl = document.getElementById("detailExEquipment");
    if (eqEl) eqEl.textContent = `Dụng cụ: ${ex.equipment || "Barbell"}`;

    const targetEl = document.getElementById("detailExTargetRequirement");
    if (targetEl) targetEl.textContent = `Mục tiêu: ${ex.targetRequirement || "2–3 sets × 6–10 reps"}`;

    const musclesEl = document.getElementById("detailExMusclesList");
    if (musclesEl) musclesEl.textContent = (ex.primaryMuscles || []).join(", ") || "Toàn thân";

    const cuesEl = document.getElementById("detailExCuesText");
    if (cuesEl) cuesEl.textContent = ex.formCues || "Kiểm soát chuyển động chậm rãi ở pha eccentric (hạ tạ) và bùng nổ ở pha concentric (đẩy tạ). Giữ thân cốt lõi vững chắc.";

    const optBox = document.getElementById("detailExOptionNoteBox");
    const optText = document.getElementById("detailExOptionNoteText");
    if (optBox && optText) {
      if (ex.optionNote) {
        optText.innerHTML = `<span style="color: #ff2a2a; font-weight: 800;">Option:</span> ${ex.optionNote.replace(/^Option:\s*/i, '')}`;
        optBox.style.display = "block";
      } else {
        optBox.style.display = "none";
      }
    }

    // Render Mini 3D Heatmap
    this.renderMini3DHeatmap(ex.primaryMuscles || []);

    // Render Overload History from Actual Completed Sessions
    const historyContainer = document.getElementById("detailExHistoryContainer");
    if (historyContainer) {
      const perfEntries = this.storage.getExercisePerformanceHistory(ex.id, ex.name);

      if (perfEntries.length > 0) {
        historyContainer.innerHTML = perfEntries.slice(0, 5).map(entry => {
          let setsSummary = "";
          if (entry.sets && entry.sets.length > 0) {
            setsSummary = entry.sets.map(s => {
              const rirStr = (s.rir !== undefined && s.rir !== "" && s.rir !== null) ? ` @ RIR ${s.rir}` : "";
              return `S${s.setNumber}: ${s.load}kg × ${s.reps}${rirStr}`;
            }).join(" | ");
          } else if (entry.legacySummary) {
            setsSummary = entry.legacySummary;
          }
          return `
            <div class="history-log-row">
              <div>
                <div style="font-weight: 700; color: #fff;">${entry.dayTitle}</div>
                <div class="history-log-date">📅 ${entry.date}</div>
              </div>
              <div class="history-log-sets">${setsSummary || "Hoàn thành"}</div>
            </div>
          `;
        }).join("");
      } else {
        // Show default progressive overload recommendation
        historyContainer.innerHTML = `
          <div style="font-size: 12px; color: var(--text-dim); padding: 6px 0 8px 0;">
            Chưa có lịch sử tập bài này. Bắt đầu ghi nhận buổi tập hôm nay để tự động lưu biểu đồ Progressive Overload!
          </div>
          <div class="history-log-row" style="opacity: 0.75;">
            <div>
              <div style="font-weight: 700; color: #fff;">Khởi điểm khuyến nghị</div>
              <div class="history-log-date">Chuẩn BFS Hybrid</div>
            </div>
            <div class="history-log-sets">${(ex.defaultSets || []).map((s, i) => `S${i+1}: ${s.weightKg || 50}kg × ${s.reps}`).join(" | ")}</div>
          </div>
        `;
      }
    }

    this.openModal("modalExerciseDetail");
  }

  renderMini3DHeatmap(primaryMuscles = []) {
    const anteriorContainer = document.getElementById("svgDetailAnteriorContainer");
    const posteriorContainer = document.getElementById("svgDetailPosteriorContainer");

    const svgFilterDefs = `
      <defs>
        <filter id="miniGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feFlood flood-color="#ff2a2a" flood-opacity="0.9" result="color"/>
          <feComposite in2="blur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `;

    const isTarget = (m) => primaryMuscles.includes(m) ? 'targeted' : '';

    if (anteriorContainer) {
      anteriorContainer.innerHTML = `
        <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
          ${svgFilterDefs}
          <circle cx="50" cy="18" r="10" fill="#1c1c1c" stroke="#333" />
          <path id="mini_pec_left" class="muscle-path ${isTarget('Chest')}" d="M38 42 C44 42 48 48 48 56 C42 58 35 54 34 46 Z" />
          <path id="mini_pec_right" class="muscle-path ${isTarget('Chest')}" d="M62 42 C56 42 52 48 52 56 C58 58 65 54 66 46 Z" />
          <path id="mini_delt_left" class="muscle-path ${isTarget('Shoulders')}" d="M28 42 C34 40 37 46 36 54 C30 52 26 48 28 42 Z" />
          <path id="mini_delt_right" class="muscle-path ${isTarget('Shoulders')}" d="M72 42 C66 40 63 46 64 54 C70 52 74 48 72 42 Z" />
          <path id="mini_biceps_left" class="muscle-path ${isTarget('Biceps')}" d="M25 56 C30 56 30 70 26 76 C23 72 22 62 25 56 Z" />
          <path id="mini_biceps_right" class="muscle-path ${isTarget('Biceps')}" d="M75 56 C70 56 70 70 74 76 C77 72 78 62 75 56 Z" />
          <rect id="mini_abs_upper" class="muscle-path ${isTarget('Core')}" x="44" y="60" width="12" height="12" rx="2" />
          <rect id="mini_abs_lower" class="muscle-path ${isTarget('Core')}" x="44" y="74" width="12" height="14" rx="2" />
          <path id="mini_quad_left" class="muscle-path ${isTarget('Quads')}" d="M37 98 C46 98 48 116 46 138 C40 140 35 125 34 106 Z" />
          <path id="mini_quad_right" class="muscle-path ${isTarget('Quads')}" d="M63 98 C54 98 52 116 54 138 C60 140 65 125 66 106 Z" />
          <path id="mini_calf_f_left" class="muscle-path ${isTarget('Calves')}" d="M37 146 C42 146 43 166 41 182 C37 182 36 166 37 146 Z" />
          <path id="mini_calf_f_right" class="muscle-path ${isTarget('Calves')}" d="M63 146 C58 146 57 166 59 182 C63 182 64 166 63 146 Z" />
        </svg>
      `;
    }

    if (posteriorContainer) {
      posteriorContainer.innerHTML = `
        <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
          ${svgFilterDefs}
          <circle cx="50" cy="18" r="10" fill="#1c1c1c" stroke="#333" />
          <path id="mini_traps" class="muscle-path ${isTarget('Upper Back')}" d="M42 30 L58 30 L64 42 L36 42 Z" />
          <path id="mini_lat_left" class="muscle-path ${isTarget('Lats')}" d="M36 44 C44 48 44 70 38 78 C33 68 32 54 36 44 Z" />
          <path id="mini_lat_right" class="muscle-path ${isTarget('Lats')}" d="M64 44 C56 48 56 70 62 78 C67 68 68 54 64 44 Z" />
          <path id="mini_tri_left" class="muscle-path ${isTarget('Triceps')}" d="M24 54 C28 54 28 70 24 74 C21 70 21 60 24 54 Z" />
          <path id="mini_tri_right" class="muscle-path ${isTarget('Triceps')}" d="M76 54 C72 54 72 70 76 74 C79 70 79 60 76 54 Z" />
          <path id="mini_glute_left" class="muscle-path ${isTarget('Glutes')}" d="M37 92 C48 90 49 110 40 114 C33 112 32 100 37 92 Z" />
          <path id="mini_glute_right" class="muscle-path ${isTarget('Glutes')}" d="M63 92 C52 90 51 110 60 114 C67 112 68 100 63 92 Z" />
          <path id="mini_ham_left" class="muscle-path ${isTarget('Hamstrings')}" d="M36 116 C46 116 47 136 44 142 C38 142 35 132 36 116 Z" />
          <path id="mini_ham_right" class="muscle-path ${isTarget('Hamstrings')}" d="M64 116 C54 116 53 136 56 142 C62 142 65 132 64 116 Z" />
          <path id="mini_calf_left" class="muscle-path ${isTarget('Calves')}" d="M36 148 C44 148 43 170 39 180 C34 176 34 160 36 148 Z" />
          <path id="mini_calf_right" class="muscle-path ${isTarget('Calves')}" d="M64 148 C56 148 57 170 61 180 C66 176 66 160 64 148 Z" />
        </svg>
      `;
    }
  }

  startActiveWorkout() {
    const prog = this.storage.getActiveProgram();
    const activeWeek = (prog.weeks || []).find(w => w.id === this.storage.getActiveWeekId()) || prog.weeks[0];
    const activeDay = activeWeek && activeWeek.days ? activeWeek.days.find(d => d.id === this.storage.getActiveDayId()) || activeWeek.days[0] : null;

    if (!prog || !activeWeek || !activeDay) return;

    this.storage.startWorkoutSession(prog.id, activeWeek.id, activeDay.id, activeDay.title, activeDay.exercises, activeDay);
    if (this.timer) this.timer.startSession(0);
    this.showToast("🚀 Buổi tập đã bắt đầu! Chúc bạn tập luyện sung mãn.");
    this.renderWorkoutView();
  }

  confirmCancelWorkout() {
    const confirmed = confirm("Bạn có chắc chắn muốn HỦY buổi tập này? Các set đã ghi nhận sẽ không được lưu.");
    if (confirmed) {
      this.storage.cancelActiveWorkout();
      if (this.timer) this.timer.stopSession();
      this.dismissRestTimer();
      this.showToast("Buổi tập đã được hủy.");
      this.renderWorkoutView();
    }
  }

  openWorkoutSummaryModal() {
    const activeState = this.storage.getActiveWorkoutState();
    const duration = this.timer ? this.timer.getSessionElapsedSeconds() : (activeState ? Math.max(0, Math.floor((Date.now() - activeState.startTime) / 1000)) : 0);
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Calculate metrics and collect authoritative actual performance
    let totalVolume = 0;
    let totalSets = 0;
    const actualPerformance = [];
    const exercisesCompleted = [];

    const loggedSets = (activeState && activeState.loggedSets) ? activeState.loggedSets : {};

    document.querySelectorAll(".hevy-exercise-card").forEach((card, exIdx) => {
      const titleSpan = card.querySelector(".hevy-ex-title span");
      const title = titleSpan ? titleSpan.textContent.trim() : "Exercise";
      const firstRow = card.querySelector("tbody tr");
      const exId = firstRow ? firstRow.getAttribute("data-ex-id") : `ex_${exIdx}`;

      let exSetsVol = 0;
      let exCompletedSets = 0;
      const exActualSets = [];

      card.querySelectorAll("tbody tr").forEach((row, sIdx) => {
        const isChecked = row.querySelector(".btn-check-set")?.classList.contains("checked");
        const w = parseFloat(row.querySelector(".input-weight")?.value) || 0;
        const r = parseInt(row.querySelector(".input-reps")?.value, 10) || 0;
        const rir = (row.querySelector(".input-rir")?.value || "").trim();

        const savedRecord = (loggedSets[exId] && loggedSets[exId][sIdx]) ? loggedSets[exId][sIdx] : null;

        const setRecord = {
          setId: savedRecord ? savedRecord.setId : `set_${exId}_${sIdx + 1}_${Date.now()}`,
          exerciseId: exId,
          exerciseName: title,
          setNumber: sIdx + 1,
          modality: "strength",
          planned: savedRecord ? savedRecord.planned : { reps: r, load: w, rir: rir },
          actual: { load: w, reps: r, rir: rir, duration: null, distance: null },
          completed: !!isChecked,
          timestamp: isChecked ? (savedRecord?.timestamp || Date.now()) : null,
          notes: ""
        };

        exActualSets.push(setRecord);

        if (isChecked) {
          totalVolume += (w * r);
          exSetsVol += (w * r);
          totalSets++;
          exCompletedSets++;
        }
      });

      if (exCompletedSets > 0) {
        actualPerformance.push({
          exerciseId: exId,
          exerciseName: title,
          sets: exActualSets
        });
        exercisesCompleted.push({
          name: title,
          sets: exCompletedSets,
          volume: exSetsVol
        });
      }
    });

    // Capture cardio data ONLY if actual performance was recorded by user
    const rawCardioDist = document.getElementById("inputCardioDistance")?.value?.trim();
    const rawCardioDur = document.getElementById("inputCardioDuration")?.value?.trim();
    const activeCardioDist = (rawCardioDist !== "" && !isNaN(parseFloat(rawCardioDist))) ? parseFloat(rawCardioDist) : null;
    const activeCardioDur = (rawCardioDur !== "" && !isNaN(parseFloat(rawCardioDur))) ? parseFloat(rawCardioDur) : null;
    const activeCardioNotes = document.getElementById("inputCardioNotes")?.value || "";

    const savedCardio = activeState?.actualCardio;
    const hasRecordedCardio = (activeCardioDist !== null && activeCardioDist > 0) ||
                             (savedCardio && savedCardio.distanceKm !== null && savedCardio.distanceKm > 0);

    let actualCardio = null;
    if (hasRecordedCardio) {
      const dist = (activeCardioDist !== null && activeCardioDist > 0) ? activeCardioDist : savedCardio.distanceKm;
      const durMin = (activeCardioDur !== null && activeCardioDur > 0) ? activeCardioDur : (savedCardio?.durationMin || Math.round(duration / 60));
      let paceStr = "--:--";
      if (dist > 0 && durMin > 0) {
        const paceDec = durMin / dist;
        const pMins = Math.floor(paceDec);
        const pSecs = Math.round((paceDec - pMins) * 60);
        const adjMins = pSecs === 60 ? pMins + 1 : pMins;
        const adjSecs = pSecs === 60 ? 0 : pSecs;
        paceStr = `${adjMins}:${String(adjSecs).padStart(2, '0')} /km`;
      }
      actualCardio = {
        sessionType: savedCardio?.sessionType || activeState?.dayTitle || "Cardio / Running",
        distanceKm: dist,
        durationMin: durMin,
        pace: paceStr,
        notes: activeCardioNotes || savedCardio?.notes || "",
        completedTimestamp: Date.now()
      };
    }

    const summaryTitle = document.getElementById("summaryWorkoutTitleSubtitle");
    if (summaryTitle) summaryTitle.textContent = activeState ? activeState.dayTitle : "Workout Session";

    const volEl = document.getElementById("summaryTotalVolume");
    if (volEl) {
      if (actualCardio && actualCardio.distanceKm > 0 && exercisesCompleted.length === 0) {
        volEl.textContent = `${actualCardio.distanceKm} km`;
      } else {
        volEl.textContent = `${totalVolume.toLocaleString()} kg`;
      }
    }

    const setsEl = document.getElementById("summaryTotalSets");
    if (setsEl) {
      if (actualCardio && actualCardio.pace && actualCardio.pace !== "--:--" && exercisesCompleted.length === 0) {
        setsEl.textContent = `Pace ${actualCardio.pace}`;
      } else {
        setsEl.textContent = `${totalSets} sets`;
      }
    }

    const durEl = document.getElementById("summaryDuration");
    if (durEl) durEl.textContent = timeStr;

    // Real PRs calculated from historical performance
    const sessionPRs = this.storage.calculateSessionPRs(actualPerformance, this.storage.getWorkoutHistory());
    const prCountEl = document.getElementById("summaryPrCount");
    if (prCountEl) {
      prCountEl.textContent = `${sessionPRs} PRs`;
    }

    const listEl = document.getElementById("summaryExercisesList");
    if (listEl) {
      let listHtml = "";
      if (exercisesCompleted.length > 0) {
        listHtml += exercisesCompleted.map(e => `
          <div style="display: flex; justify-content: space-between; font-size: 12.5px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span style="font-weight: 700; color: #fff;">${e.name}</span>
            <span style="color: var(--color-gold);">${e.sets} sets • ${e.volume.toLocaleString()} kg</span>
          </div>
        `).join("");
      }
      if (actualCardio && actualCardio.distanceKm > 0) {
        listHtml += `
          <div style="padding: 6px 0; font-size: 13px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.05);">
            🏃 <strong>${actualCardio.sessionType || 'Cardio'}</strong>: ${actualCardio.distanceKm} km • ${actualCardio.durationMin || mins} phút • Pace: ${actualCardio.pace || '--:--'}
          </div>
        `;
      }
      if (!listHtml) {
        listHtml = `<div style="color: var(--text-dim); font-size: 12px;">Chưa check hoàn thành set nào.</div>`;
      }
      listEl.innerHTML = listHtml;
    }

    const notesEl = document.getElementById("summaryNotesDisplay");
    const notesInput = document.getElementById("inputWorkoutNotes");
    if (notesEl) {
      const displayNote = (notesInput ? notesInput.value : "") || (actualCardio ? actualCardio.notes : "") || "Không có ghi chú.";
      notesEl.textContent = displayNote;
    }

    const hasExercisesCompleted = exercisesCompleted.length > 0;
    const sessionType = (hasExercisesCompleted && actualCardio) ? "hybrid" : (actualCardio ? "cardio" : "strength");

    this.pendingWorkoutSummary = {
      progId: activeState ? activeState.progId : this.storage.getActiveProgramId(),
      weekId: activeState ? activeState.weekId : this.storage.getActiveWeekId(),
      dayId: activeState ? activeState.dayId : this.storage.getActiveDayId(),
      dayTitle: activeState ? activeState.dayTitle : "Workout Session",
      durationSec: duration,
      totalVolumeKg: totalVolume,
      totalSets: totalSets,
      actualPerformance: actualPerformance,
      exercises: exercisesCompleted,
      notes: notesInput ? notesInput.value : "",
      actualCardio: actualCardio,
      sessionType: sessionType,
      totalDistanceKm: actualCardio ? (actualCardio.distanceKm || 0) : 0
    };

    this.openModal("modalWorkoutSummary");
    this.triggerConfetti();
  }

  saveAndCompleteWorkout() {
    if (this.pendingWorkoutSummary) {
      this.storage.finishWorkoutSession(this.pendingWorkoutSummary);
    }
    if (this.timer) this.timer.stopSession();
    this.dismissRestTimer();
    this.closeModal("modalWorkoutSummary");
    this.showToast("🎉 Buổi tập đã được lưu thành công vào lịch sử!");
    this.renderWorkoutView();
  }

  // Rest Timer HUD Callbacks
  bindTimerCallbacks() {
    if (!this.timer) return;

    this.timer.onSessionTick((elapsedSec, formatted) => {
      const el = document.getElementById("workoutStopwatchText");
      if (el) el.textContent = formatted;
    });

    this.timer.onRestTick((remSec, formatted) => {
      const el = document.getElementById("timerTimeText");
      if (el) el.textContent = formatted;
    });

    this.timer.onRestComplete(() => {
      this.dismissRestTimer();
      if (window.DinoAudio) window.DinoAudio.playBellChime();
      this.showToast("⏱️ Hết giờ nghỉ! Sẵn sàng cho set tiếp theo.");
    });

    const btnAdd30 = document.getElementById("btnTimerAdd30");
    if (btnAdd30) {
      btnAdd30.addEventListener("click", () => {
        if (this.timer) this.timer.addRestSeconds(30);
      });
    }

    const btnDismiss = document.getElementById("btnTimerDismiss");
    if (btnDismiss) {
      btnDismiss.addEventListener("click", () => this.dismissRestTimer());
    }
  }

  startRestTimer(seconds, isRP = false) {
    if (!this.timer) return;
    const hud = document.getElementById("timerHudPill");
    if (hud) hud.style.display = "flex";

    const titleEl = document.getElementById("timerTitleText");
    if (titleEl) titleEl.textContent = isRP ? "⚡ NGHỈ REST-PAUSE (15S)" : "⏱️ NGHỈ GIỮA SET";

    this.timer.startRest(seconds, isRP);
  }

  dismissRestTimer() {
    if (this.timer) this.timer.dismissRest();
    const hud = document.getElementById("timerHudPill");
    if (hud) hud.style.display = "none";
  }

  // =========================================================================
  // 4. TAB 2: PROGRAM BUILDER (TREE HIERARCHY & REORDERING)
  // =========================================================================
  bindBuilderEvents() {
    const btnOpenProgModal = document.getElementById("btnOpenCreateProgramModal");
    if (btnOpenProgModal) {
      btnOpenProgModal.addEventListener("click", () => this.openModal("modalCreateProgram"));
    }

    const btnOpenCustomExModal = document.getElementById("btnOpenCreateCustomExModal");
    if (btnOpenCustomExModal) {
      btnOpenCustomExModal.addEventListener("click", () => {
        this.builderPendingTarget = null;
        this.openModal("modalCustomExercise");
      });
    }

    // Search in exercise picker modal
    const inputPickerSearch = document.getElementById("inputPickerExSearch");
    if (inputPickerSearch) {
      inputPickerSearch.addEventListener("input", (e) => {
        this.pickerSearchQuery = e.target.value.trim();
        this.renderPickerExercises(this.pickerSearchQuery, this.pickerCategory);
      });
    }

    // Category filters in exercise picker modal
    document.querySelectorAll(".btn-picker-cat").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-picker-cat").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.pickerCategory = btn.getAttribute("data-cat") || "all";
        this.renderPickerExercises(this.pickerSearchQuery, this.pickerCategory);
      });
    });

    // Launch Create Custom Exercise from inside Picker Modal
    const btnPickerLaunch = document.getElementById("btnPickerLaunchCreateCustom");
    if (btnPickerLaunch) {
      btnPickerLaunch.addEventListener("click", () => {
        this.closeModal("modalExercisePicker");
        this.openModal("modalCustomExercise");
      });
    }

    const selectProg = document.getElementById("selectBuilderProgram");
    if (selectProg) {
      selectProg.addEventListener("change", (e) => {
        this.builderSelectedProgId = e.target.value;
        this.renderBuilderTree();
      });
    }

    const btnSetActive = document.getElementById("btnSetActiveProgramFromBuilder");
    if (btnSetActive) {
      btnSetActive.addEventListener("click", () => {
        if (this.builderSelectedProgId) {
          this.storage.setActiveProgramId(this.builderSelectedProgId);
          this.showToast("✓ Đã kích hoạt giáo án làm lịch tập chính!");
          this.renderBuilderView();
        }
      });
    }

    const btnDeleteProg = document.getElementById("btnDeleteProgramFromBuilder");
    if (btnDeleteProg) {
      btnDeleteProg.addEventListener("click", () => {
        if (this.builderSelectedProgId) {
          const progs = this.storage.getPrograms();
          if (progs.length <= 1) {
            alert("Không thể xóa giáo án duy nhất còn lại!");
            return;
          }
          if (confirm("Bạn có chắc chắn muốn xóa giáo án này?")) {
            this.storage.deleteProgram(this.builderSelectedProgId);
            this.builderSelectedProgId = null;
            this.renderBuilderView();
          }
        }
      });
    }

    const btnAddWeek = document.getElementById("btnAddWeekToActiveProg");
    if (btnAddWeek) {
      btnAddWeek.addEventListener("click", () => {
        const progId = this.builderSelectedProgId || this.storage.getActiveProgramId();
        const weekName = prompt("Nhập tên tuần mới:", `Week ${(this.storage.getProgramById(progId)?.weeks || []).length + 1}`);
        if (weekName) {
          this.storage.addWeekToProgram(progId, weekName);
          this.renderBuilderTree();
        }
      });
    }

    // Form: Create Program
    const formCreateProg = document.getElementById("formCreateProgram");
    if (formCreateProg) {
      formCreateProg.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("inputNewProgName").value;
        const philo = document.getElementById("inputNewProgPhilosophy").value;
        const rot = document.getElementById("selectNewProgRotation").value;

        const newProg = this.storage.createProgram(name, philo, "Custom Routine", rot);
        this.closeModal("modalCreateProgram");
        formCreateProg.reset();
        this.builderSelectedProgId = newProg.id;
        this.showToast("✓ Đã tạo giáo án mới! Hãy thêm Tuần và Ngày tập.");
        this.renderBuilderView();
      });
    }

    // Form: Create Custom Exercise
    const formCustomEx = document.getElementById("formCustomExercise");
    if (formCustomEx) {
      formCustomEx.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("inputCustomExName").value;
        const category = document.getElementById("selectCustomExCategory").value;
        const equipment = document.getElementById("selectCustomExEquipment").value;
        const primary = document.getElementById("selectCustomExPrimaryMuscle").value;
        const cues = document.getElementById("inputCustomExCues").value;

        const savedEx = this.storage.saveCustomExercise({
          name, category, equipment, primaryMuscles: [primary], formCues: cues
        });
        this.closeModal("modalCustomExercise");
        formCustomEx.reset();

        // If launched while building a specific day, auto attach it!
        if (this.builderPendingTarget) {
          this.storage.addExerciseToDay(
            this.builderPendingTarget.progId,
            this.builderPendingTarget.weekId,
            this.builderPendingTarget.dayId,
            savedEx
          );
          this.builderPendingTarget = null;
          this.renderBuilderTree();
          this.showToast(`✓ Đã tạo và thêm "${name}" vào buổi tập!`);
        } else {
          this.showToast("✓ Đã lưu bài tập mới vào thư viện toàn cục!");
        }
      });
    }
  }

  renderBuilderView() {
    const progs = this.storage.getPrograms();
    const select = document.getElementById("selectBuilderProgram");
    if (!select) return;

    if (!this.builderSelectedProgId) {
      this.builderSelectedProgId = this.storage.getActiveProgramId();
    }

    select.innerHTML = progs.map(p => `
      <option value="${p.id}" ${p.id === this.builderSelectedProgId ? 'selected' : ''}>
        ${p.name} ${p.isBuiltIn ? '(Mẫu)' : ''}
      </option>
    `).join("");

    this.renderBuilderTree();
  }

  renderBuilderTree() {
    const prog = this.storage.getProgramById(this.builderSelectedProgId || this.storage.getActiveProgramId());
    if (!prog) return;

    // Metadata Header
    const nameEl = document.getElementById("builderProgramNameDisplay");
    if (nameEl) nameEl.textContent = prog.name;

    const philoEl = document.getElementById("builderProgramPhilosophyDisplay");
    if (philoEl) philoEl.textContent = prog.philosophy || "Chưa có mô tả triết lý.";

    const treeContainer = document.getElementById("builderWeeksTreeContainer");
    if (!treeContainer) return;

    treeContainer.innerHTML = "";

    if (!prog.weeks || prog.weeks.length === 0) {
      treeContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; background: var(--bg-card); border-radius: var(--radius-md); color: var(--text-dim); font-size: 13px;">
          Giáo án đang rỗng. Bấm <strong>"+ Thêm Tuần (Week)"</strong> ở trên để bắt đầu cấu trúc!
        </div>
      `;
      return;
    }

    prog.weeks.forEach(week => {
      const weekCard = document.createElement("div");
      weekCard.className = "builder-week-card";

      const daysHtml = (week.days || []).map(day => `
        <div class="builder-day-card" data-day-id="${day.id}">
          <div class="builder-day-header">
            <div>
              <span style="font-size: 10.5px; font-weight: 800; color: var(--red-primary); text-transform: uppercase;">${day.dayKey || 'DAY'}</span>
              <div class="builder-day-title">${day.title}</div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button class="btn-mini-tag btn-add-ex-to-day" data-week-id="${week.id}" data-day-id="${day.id}">+ Bài Tập</button>
              <button class="btn-mini-tag danger btn-delete-day" data-week-id="${week.id}" data-day-id="${day.id}">✕</button>
            </div>
          </div>

          <div class="builder-exercises-list">
            ${(day.exercises || []).map((ex, exIdx) => `
              <div class="builder-ex-row">
                <div class="builder-ex-info">
                  <div class="builder-ex-name">${ex.name}</div>
                  <div class="builder-ex-target">${ex.targetRequirement || '3 sets x 8-10 reps'}</div>
                  ${ex.optionNote ? `<div class="builder-ex-opt"><span class="opt-tag-red">Option:</span> ${ex.optionNote.replace(/^Option:\s*/i, '')}</div>` : ''}
                </div>
                <div class="builder-ex-reorder-group">
                  <button class="btn-reorder-arrow btn-up" data-week-id="${week.id}" data-day-id="${day.id}" data-idx="${exIdx}" ${exIdx === 0 ? 'disabled' : ''}>▲</button>
                  <button class="btn-reorder-arrow btn-down" data-week-id="${week.id}" data-day-id="${day.id}" data-idx="${exIdx}" ${exIdx === day.exercises.length - 1 ? 'disabled' : ''}>▼</button>
                  <button class="btn-ex-delete-mini" data-week-id="${week.id}" data-day-id="${day.id}" data-idx="${exIdx}">✕</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("");

      weekCard.innerHTML = `
        <div class="builder-week-header">
          <div class="builder-week-title">📅 ${week.name}</div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-mini-tag btn-add-day-to-week" data-week-id="${week.id}">+ Thêm Ngày</button>
            <button class="btn-mini-tag danger btn-delete-week" data-week-id="${week.id}">✕ Xóa Tuần</button>
          </div>
        </div>
        <div class="builder-days-column">
          ${daysHtml || `<div style="font-size: 12px; color: var(--text-dim); padding: 8px;">Chưa có ngày tập nào trong tuần này. Bấm "+ Thêm Ngày".</div>`}
        </div>
      `;

      // Event Listeners for Tree Manipulation
      // Add Day
      const btnAddDay = weekCard.querySelector(".btn-add-day-to-week");
      if (btnAddDay) {
        btnAddDay.addEventListener("click", () => {
          const title = prompt("Nhập tên ngày tập (VD: Upper Power, Leg Day, 5km Run):");
          if (title) {
            this.storage.addDayToWeek(prog.id, week.id, { title, dayKey: `D${(week.days || []).length + 1}` });
            this.renderBuilderTree();
          }
        });
      }

      // Delete Week
      const btnDeleteWeek = weekCard.querySelector(".btn-delete-week");
      if (btnDeleteWeek) {
        btnDeleteWeek.addEventListener("click", () => {
          if (confirm(`Xóa ${week.name}?`)) {
            this.storage.deleteWeekFromProgram(prog.id, week.id);
            this.renderBuilderTree();
          }
        });
      }

      // Add Exercise to Day via 50+ Library Modal
      weekCard.querySelectorAll(".btn-add-ex-to-day").forEach(btn => {
        btn.addEventListener("click", () => {
          const dayId = btn.getAttribute("data-day-id");
          const weekId = btn.getAttribute("data-week-id");
          this.builderPendingTarget = { progId: prog.id, weekId, dayId };
          this.pickerSearchQuery = "";
          this.pickerCategory = "all";
          const searchInput = document.getElementById("inputPickerExSearch");
          if (searchInput) searchInput.value = "";
          document.querySelectorAll(".btn-picker-cat").forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-cat") === "all");
          });
          this.renderPickerExercises();
          this.openModal("modalExercisePicker");
        });
      });

      // Delete Day
      weekCard.querySelectorAll(".btn-delete-day").forEach(btn => {
        btn.addEventListener("click", () => {
          const dayId = btn.getAttribute("data-day-id");
          if (confirm("Xóa ngày tập này?")) {
            this.storage.deleteDayFromWeek(prog.id, week.id, dayId);
            this.renderBuilderTree();
          }
        });
      });

      // Reorder Up
      weekCard.querySelectorAll(".btn-reorder-arrow.btn-up").forEach(btn => {
        btn.addEventListener("click", () => {
          const dayId = btn.getAttribute("data-day-id");
          const idx = parseInt(btn.getAttribute("data-idx"), 10);
          this.storage.reorderExerciseInDay(prog.id, week.id, dayId, idx, "up");
          this.renderBuilderTree();
        });
      });

      // Reorder Down
      weekCard.querySelectorAll(".btn-reorder-arrow.btn-down").forEach(btn => {
        btn.addEventListener("click", () => {
          const dayId = btn.getAttribute("data-day-id");
          const idx = parseInt(btn.getAttribute("data-idx"), 10);
          this.storage.reorderExerciseInDay(prog.id, week.id, dayId, idx, "down");
          this.renderBuilderTree();
        });
      });

      // Delete Exercise
      weekCard.querySelectorAll(".btn-ex-delete-mini").forEach(btn => {
        btn.addEventListener("click", () => {
          const dayId = btn.getAttribute("data-day-id");
          const idx = parseInt(btn.getAttribute("data-idx"), 10);
          this.storage.deleteExerciseFromDay(prog.id, week.id, dayId, idx);
          this.renderBuilderTree();
        });
      });

      treeContainer.appendChild(weekCard);
    });
  }

  renderPickerExercises(searchQuery = "", category = "all") {
    const container = document.getElementById("pickerExercisesList");
    if (!container) return;

    let list = this.storage.getAllExercises();

    // Category filter
    if (category && category !== "all") {
      list = list.filter(ex => {
        const catMatch = (ex.category || "").toLowerCase() === category.toLowerCase();
        const primaryMatch = (ex.primaryMuscles || []).some(m => {
          if (category === "Lower") return ["Quads", "Hamstrings", "Glutes", "Calves"].includes(m);
          if (category === "Upper") return ["Chest", "Lats", "Upper Back", "Shoulders", "Biceps", "Triceps"].includes(m);
          if (category === "Core") return m === "Core";
          return m.toLowerCase() === category.toLowerCase();
        });
        return catMatch || primaryMatch;
      });
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(ex => 
        (ex.name && ex.name.toLowerCase().includes(q)) ||
        (ex.category && ex.category.toLowerCase().includes(q)) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(q)) ||
        (ex.primaryMuscles && ex.primaryMuscles.some(m => m.toLowerCase().includes(q))) ||
        (ex.formCues && ex.formCues.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-dim); font-size: 13px;">
          Không tìm thấy bài tập nào khớp với từ khóa.
          <div style="margin-top: 10px;">
            <button type="button" class="btn-day-action secondary" style="font-size: 12px; padding: 6px 14px;" onclick="document.getElementById('btnPickerLaunchCreateCustom').click()">
              + Tự Tạo Bài Tập Này
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(ex => `
      <div class="picker-ex-item" data-ex-id="${ex.id}">
        <div>
          <div class="picker-ex-title">${ex.name}</div>
          <div class="picker-ex-sub">${ex.category || 'Compound'} • ${ex.equipment || 'Barbell'} • ${(ex.primaryMuscles || []).join(', ')}</div>
        </div>
        <button type="button" class="picker-ex-add-badge">+ Thêm</button>
      </div>
    `).join("");

    container.querySelectorAll(".picker-ex-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-ex-id");
        const found = list.find(e => e.id === id) || (this.storage.getAllExercises() || []).find(e => e.id === id);
        if (found && this.builderPendingTarget) {
          this.storage.addExerciseToDay(
            this.builderPendingTarget.progId,
            this.builderPendingTarget.weekId,
            this.builderPendingTarget.dayId,
            found
          );
          this.closeModal("modalExercisePicker");
          this.renderBuilderTree();
          this.showToast(`✓ Đã thêm "${found.name}" vào buổi tập!`);
        }
      });
    });
  }

  // =========================================================================
  // 5. TAB 3: PREHAB & RECOVERY (NASM CEX CONTINUUM)
  // =========================================================================
  bindPrehabEvents() {
    const btnGenerate = document.getElementById("btnGeneratePrehabRoutine");
    if (btnGenerate) {
      btnGenerate.addEventListener("click", () => this.generateNASMPrehabRoutine());
    }

    const btnStartTimer = document.getElementById("btnStartPrehabGuidedTimer");
    if (btnStartTimer) {
      btnStartTimer.addEventListener("click", () => this.startPrehabGuidedTimer());
    }

    const btnTimerToggle = document.getElementById("btnPrehabTimerToggle");
    if (btnTimerToggle) {
      btnTimerToggle.addEventListener("click", () => {
        this.prehabTimerIsPaused = !this.prehabTimerIsPaused;
        btnTimerToggle.textContent = this.prehabTimerIsPaused ? "Tiếp Tục" : "Tạm Dừng";
      });
    }

    const btnTimerNext = document.getElementById("btnPrehabTimerNextStep");
    if (btnTimerNext) {
      btnTimerNext.addEventListener("click", () => this.nextPrehabStep());
    }
  }

  renderPrehabView() {
    const db = window.NASM_CEX_DATABASE;
    if (!db) return;

    const deviationsGrid = document.getElementById("prehabDeviationsGrid");
    if (deviationsGrid && db.deviationGroups) {
      deviationsGrid.innerHTML = db.deviationGroups.map(grp => `
        <div class="prehab-group-container">
          <div class="prehab-group-title">${grp.groupTitle}</div>
          <div class="prehab-radio-list">
            ${grp.options.map(opt => `
              <label class="prehab-radio-card ${opt.isNone ? 'selected' : ''}" data-group="${grp.groupKey}">
                <input type="radio" name="nasm_dev_${grp.groupKey}" value="${opt.id}" class="prehab-radio-input" ${opt.isNone ? 'checked' : ''}>
                <div class="prehab-radio-info">
                  <div class="prehab-radio-name">${opt.name}</div>
                  ${opt.overactive ? `<div class="prehab-radio-desc"><strong>Ức chế/Kéo giãn:</strong> ${opt.overactive.join(', ')}<br><strong>Kích hoạt:</strong> ${opt.underactive.join(', ')}</div>` : ''}
                </div>
              </label>
            `).join("")}
          </div>
        </div>
      `).join("");

      // Radio Selection Highlight Listener
      deviationsGrid.querySelectorAll(".prehab-radio-input").forEach(radio => {
        radio.addEventListener("change", () => {
          const groupName = radio.name;
          document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
            const card = r.closest(".prehab-radio-card");
            if (card) card.classList.toggle("selected", r.checked);
          });
        });
      });
    }

    // Workout Types
    document.querySelectorAll(".btn-prehab-workout-type").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-prehab-workout-type").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // 2-Week Frequency Matrix Table
    const matrixBody = document.getElementById("matrixTableBody");
    if (matrixBody) {
      matrixBody.innerHTML = `
        <tr><td><strong>Ngực & Tay sau</strong></td><td>2 buổi (4 sets)</td><td>2 buổi (4 sets)</td><td>Tối ưu RIR 0-1</td></tr>
        <tr><td><strong>Lưng xô & Tay trước</strong></td><td>2 buổi (4 sets)</td><td>2 buổi (4 sets)</td><td>Kéo giãn bả vai</td></tr>
        <tr><td><strong>Vai & Cơ thang</strong></td><td>2 buổi (RP)</td><td>2 buổi (RP)</td><td>Ưu tiên Rest-Pause</td></tr>
        <tr><td><strong>Đùi trước & Mông</strong></td><td>2 buổi (Pin/LegPress)</td><td>2 buổi (Hack/Press)</td><td>Giãn háng & Foam roll</td></tr>
        <tr><td><strong>Chạy bền & Cổ chân</strong></td><td>23 km (Threshold+Long)</td><td>25 km (Interval+Long)</td><td>Bù nước điện giải</td></tr>
      `;
    }
  }

  generateNASMPrehabRoutine() {
    const db = window.NASM_CEX_DATABASE;
    if (!db) return;

    const checkedRadios = document.querySelectorAll(".prehab-radio-input:checked");
    const selectedDevIds = Array.from(checkedRadios)
      .map(r => r.value)
      .filter(val => !val.endsWith("_none"));

    const activeType = document.querySelector(".btn-prehab-workout-type.active")?.getAttribute("data-type") || "full_body";

    this.prehabSteps = db.generateRoutine(selectedDevIds, activeType);

    const resultBox = document.getElementById("prehabRoutineResultContainer");
    const stepsList = document.getElementById("prehab4StepsList");

    if (resultBox && stepsList) {
      stepsList.innerHTML = this.prehabSteps.map(s => `
        <div class="cex-step-card">
          <div class="cex-step-num-title">${s.stepName}</div>
          <div class="cex-exercise-name">${s.ex.name}</div>
          <div style="font-size: 11px; color: var(--color-green); margin-top: 2px;">Nhóm cơ tác động: ${s.ex.muscles || 'Toàn thân'} • ${s.ex.durationSec || 45}s</div>
          <div class="cex-cue-text">💡 ${s.ex.cue}</div>
        </div>
      `).join("");

      resultBox.style.display = "block";
      resultBox.scrollIntoView({ behavior: "smooth" });
    }
  }

  startPrehabGuidedTimer() {
    if (!this.prehabSteps || this.prehabSteps.length === 0) return;
    this.prehabCurrentStepIndex = 0;
    this.openModal("modalPrehabTimer");
    this.runPrehabStepTimer();
  }

  runPrehabStepTimer() {
    if (this.prehabTimerInterval) clearInterval(this.prehabTimerInterval);
    const step = this.prehabSteps[this.prehabCurrentStepIndex];
    if (!step) {
      this.closeModal("modalPrehabTimer");
      this.showToast("🎉 Hoàn thành bài khởi động Prehab chuẩn NASM!");
      return;
    }

    const badge = document.getElementById("prehabTimerStepBadge");
    const title = document.getElementById("prehabTimerExerciseTitle");
    const cue = document.getElementById("prehabTimerCueText");
    const display = document.getElementById("prehabTimerDisplay");

    if (badge) badge.textContent = step.stepName;
    if (title) title.textContent = step.ex.name;
    if (cue) cue.textContent = step.ex.cue;

    this.prehabTimerRemaining = step.ex.durationSec || step.durationSec || 45;
    this.prehabTimerIsPaused = false;

    const updateDisplay = () => {
      const m = Math.floor(this.prehabTimerRemaining / 60);
      const s = this.prehabTimerRemaining % 60;
      if (display) display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    updateDisplay();

    this.prehabTimerInterval = setInterval(() => {
      if (!this.prehabTimerIsPaused) {
        this.prehabTimerRemaining--;
        updateDisplay();
        if (this.prehabTimerRemaining <= 0) {
          if (window.DinoAudio) window.DinoAudio.playSuccessBeep();
          this.nextPrehabStep();
        }
      }
    }, 1000);
  }

  nextPrehabStep() {
    this.prehabCurrentStepIndex++;
    if (this.prehabCurrentStepIndex < this.prehabSteps.length) {
      this.runPrehabStepTimer();
    } else {
      if (this.prehabTimerInterval) clearInterval(this.prehabTimerInterval);
      this.closeModal("modalPrehabTimer");
      this.showToast("🎉 Hoàn tất chu trình Prehab!");
    }
  }

  // =========================================================================
  // 6. TAB 4: TOOLS (PACE CONVERTER, 50+ WOD ROULETTE & PLATE CALC)
  // =========================================================================
  bindToolsEvents() {
    const subnavBtns = {
      Pace: document.getElementById("subnavBtnPace"),
      Roulette: document.getElementById("subnavBtnRoulette"),
      PlateCalc: document.getElementById("subnavBtnPlateCalc")
    };

    Object.keys(subnavBtns).forEach(key => {
      const btn = subnavBtns[key];
      if (btn) {
        btn.addEventListener("click", () => this.switchToolsSubnav(key));
      }
    });

    // Pace Converter Inputs
    const inputMin = document.getElementById("inputPaceMin");
    const inputSec = document.getElementById("inputPaceSec");
    const inputSpeed = document.getElementById("inputSpeedKmH");

    const updateFromPace = () => {
      const min = parseInt(inputMin.value, 10) || 5;
      const sec = parseInt(inputSec.value, 10) || 0;
      const totalSec = min * 60 + sec;
      if (totalSec > 0) {
        const speed = 3600 / totalSec;
        if (inputSpeed) inputSpeed.value = speed.toFixed(1);
        this.updateRaceSplits(totalSec);
      }
    };

    const updateFromSpeed = () => {
      const speed = parseFloat(inputSpeed.value) || 10;
      if (speed > 0) {
        const totalSec = 3600 / speed;
        const m = Math.floor(totalSec / 60);
        const s = Math.round(totalSec % 60);
        if (inputMin) inputMin.value = m;
        if (inputSec) inputSec.value = s;
        this.updateRaceSplits(totalSec);
      }
    };

    if (inputMin) inputMin.addEventListener("input", updateFromPace);
    if (inputSec) inputSec.addEventListener("input", updateFromPace);
    if (inputSpeed) inputSpeed.addEventListener("input", updateFromSpeed);

    // Preset Pace buttons
    document.querySelectorAll(".btn-pace-preset").forEach(btn => {
      btn.addEventListener("click", () => {
        const m = parseInt(btn.getAttribute("data-min"), 10);
        const s = parseInt(btn.getAttribute("data-sec"), 10);
        if (inputMin) inputMin.value = m;
        if (inputSec) inputSec.value = s;
        updateFromPace();
      });
    });

    // WOD Roulette Spin Trigger
    const btnSpin = document.getElementById("btnSpinRoulette");
    if (btnSpin) {
      btnSpin.addEventListener("click", () => this.spinWODRoulette());
    }

    const btnSpinAgain = document.getElementById("btnSpinAgain");
    if (btnSpinAgain) {
      btnSpinAgain.addEventListener("click", () => this.spinWODRoulette());
    }

    const btnLoadWod = document.getElementById("btnLoadWodToWorkout");
    if (btnLoadWod) {
      btnLoadWod.addEventListener("click", () => {
        if (this.currentRouletteWOD) {
          this.switchTab("workout");
          this.showToast(`🚀 Đã chọn WOD "${this.currentRouletteWOD.name}" cho buổi tập!`);
        }
      });
    }

    // WOD Category Filters
    document.querySelectorAll(".btn-wod-cat").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-wod-cat").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.renderWODCatalog(btn.getAttribute("data-cat"));
        this.drawRouletteWheel();
      });
    });

    // Plate Calculator
    const btnCalcPlates = document.getElementById("btnCalculatePlates");
    if (btnCalcPlates) {
      btnCalcPlates.addEventListener("click", () => this.calculatePlates());
    }

    // 1RM Inputs
    const input1RMW = document.getElementById("input1RMWeight");
    const input1RMR = document.getElementById("input1RMReps");
    const update1RM = () => {
      const w = parseFloat(input1RMW?.value) || 100;
      const r = parseInt(input1RMR?.value, 10) || 6;
      const epley = w * (1 + r / 30);
      const brzycki = w / (1.0278 - 0.0278 * r);
      const e1RM = Math.round(((epley + brzycki) / 2) * 10) / 10;

      const resEl = document.getElementById("calculated1RMResult");
      if (resEl) resEl.textContent = `${e1RM.toFixed(1)} kg`;

      const tbody = document.getElementById("rmTableBody");
      if (tbody) {
        const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60];
        tbody.innerHTML = percentages.map(pct => {
          const load = Math.round((e1RM * (pct / 100)) * 2) / 2;
          const maxReps = pct === 100 ? 1 : pct >= 90 ? 3 : pct >= 80 ? 6 : pct >= 70 ? 10 : 15;
          return `<tr><td>${pct}%</td><td><strong>${load} kg</strong></td><td>~${maxReps} reps</td></tr>`;
        }).join("");
      }
    };

    if (input1RMW) input1RMW.addEventListener("input", update1RM);
    if (input1RMR) input1RMR.addEventListener("input", update1RM);
  }

  switchToolsSubnav(subnavKey) {
    const sections = {
      Pace: document.getElementById("sectionPaceConverter"),
      Roulette: document.getElementById("sectionWODRoulette"),
      PlateCalc: document.getElementById("sectionPlateCalc")
    };

    const buttons = {
      Pace: document.getElementById("subnavBtnPace"),
      Roulette: document.getElementById("subnavBtnRoulette"),
      PlateCalc: document.getElementById("subnavBtnPlateCalc")
    };

    Object.keys(sections).forEach(k => {
      if (sections[k]) sections[k].style.display = (k === subnavKey) ? "block" : "none";
      if (buttons[k]) {
        if (k === subnavKey) buttons[k].classList.add("active");
        else buttons[k].classList.remove("active");
      }
    });

    if (subnavKey === "Roulette") {
      this.drawRouletteWheel();
      this.renderWODCatalog("all");
    }
  }

  renderToolsView() {
    this.updateRaceSplits(345); // default 5:45/km
    this.drawRouletteWheel();
    this.renderWODCatalog("all");
    this.calculatePlates();
  }

  updateRaceSplits(paceSecPerKm) {
    const formatTime = (totalSeconds) => {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.round(totalSeconds % 60);
      if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const el1 = document.getElementById("split1km");
    if (el1) el1.textContent = formatTime(paceSecPerKm);

    const el5 = document.getElementById("split5km");
    if (el5) el5.textContent = formatTime(paceSecPerKm * 5);

    const el10 = document.getElementById("split10km");
    if (el10) el10.textContent = formatTime(paceSecPerKm * 10);

    const elHM = document.getElementById("splitHM");
    if (elHM) elHM.textContent = formatTime(paceSecPerKm * 21.0975);

    const elFM = document.getElementById("splitFM");
    if (elFM) elFM.textContent = formatTime(paceSecPerKm * 42.195);
  }

  drawRouletteWheel() {
    const canvas = document.getElementById("canvasRouletteWheel");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const center = w / 2;
    const radius = center - 10;

    const wods = window.CROSSFIT_WOD_DATABASE || [];
    const slices = Math.min(12, wods.length);
    const sliceAngle = (Math.PI * 2) / slices;

    ctx.clearRect(0, 0, w, h);

    const colors = ["#ff2a2a", "#181818", "#b31010", "#242424", "#dc2626", "#121212"];

    for (let i = 0; i < slices; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px 'Outfit', sans-serif";
      const name = wods[i] ? wods[i].name : `WOD #${i + 1}`;
      ctx.fillText(name.slice(0, 12), radius - 15, 4);
      ctx.restore();
    }

    // Center Hub
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();
    ctx.strokeStyle = "#ff2a2a";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ff2a2a";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡", center, center + 4);
  }

  spinWODRoulette() {
    if (this.isSpinningRoulette) return;
    this.isSpinningRoulette = true;

    const activeCat = document.querySelector(".btn-wod-cat.active")?.getAttribute("data-cat") || "all";
    let wods = window.CROSSFIT_WOD_DATABASE || [];
    if (activeCat !== "all") {
      wods = wods.filter(w => w.category === activeCat);
    }
    if (wods.length === 0) wods = window.CROSSFIT_WOD_DATABASE || [];

    const picked = wods[Math.floor(Math.random() * wods.length)];
    this.currentRouletteWOD = picked;

    const canvas = document.getElementById("canvasRouletteWheel");
    let rotation = 0;
    const totalSpins = 1080 + Math.random() * 360;
    const duration = 2500;
    const startTime = performance.now();

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      rotation = easeOut * totalSpins;

      if (canvas) canvas.style.transform = `rotate(${rotation}deg)`;

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.isSpinningRoulette = false;
        this.displayLandedWOD(picked);
      }
    };

    requestAnimationFrame(animateSpin);
  }

  displayLandedWOD(wod) {
    const card = document.getElementById("landedWODCard");
    if (!card || !wod) return;

    const nameEl = document.getElementById("wodNameTitle");
    if (nameEl) nameEl.textContent = wod.name;

    const descEl = document.getElementById("wodDescriptionText");
    if (descEl) descEl.textContent = wod.description;

    const rxMale = document.getElementById("wodRxMaleText");
    if (rxMale) rxMale.textContent = wod.rxMale || "Standard Rx";

    const rxFemale = document.getElementById("wodRxFemaleText");
    if (rxFemale) rxFemale.textContent = wod.rxFemale || "Standard Rx";

    const timeTag = document.getElementById("wodRxTimeTag");
    if (timeTag) timeTag.textContent = `Time Cap: ${wod.timeCap || '20 min'}`;

    const movesList = document.getElementById("wodMovementsList");
    if (movesList && wod.movements) {
      movesList.innerHTML = wod.movements.map(m => `
        <div class="wod-move-item">⚡ ${m}</div>
      `).join("");
    }

    card.style.display = "block";
    card.scrollIntoView({ behavior: "smooth" });
    if (window.DinoAudio) window.DinoAudio.playSuccessBeep();
  }

  renderWODCatalog(category = "all") {
    const grid = document.getElementById("wodsCatalogGrid");
    if (!grid) return;

    let wods = window.CROSSFIT_WOD_DATABASE || [];
    if (category !== "all") {
      wods = wods.filter(w => w.category === category);
    }

    grid.innerHTML = wods.map(w => `
      <div class="wod-catalog-item" data-wod-id="${w.id}">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--red-primary); font-weight: 800;">
          <span>${w.category}</span>
          <span>${w.format}</span>
        </div>
        <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 800; color: #fff; margin-top: 2px;">
          ${w.name}
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">
          ${w.description}
        </div>
      </div>
    `).join("");

    grid.querySelectorAll(".wod-catalog-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-wod-id");
        const found = (window.CROSSFIT_WOD_DATABASE || []).find(w => w.id === id);
        if (found) {
          this.currentRouletteWOD = found;
          this.displayLandedWOD(found);
        }
      });
    });
  }

  calculatePlates() {
    const inputKg = document.getElementById("inputTargetPlateKg");
    const target = parseFloat(inputKg?.value) || 100;
    const barWeight = 20; // Standard Olympic Bar
    let remPerSide = Math.max(0, (target - barWeight) / 2);

    const plateDenoms = [
      { kg: 25, cls: "p25" },
      { kg: 20, cls: "p20" },
      { kg: 15, cls: "p15" },
      { kg: 10, cls: "p10" },
      { kg: 5, cls: "p5" },
      { kg: 2.5, cls: "p25_small" }
    ];

    const platesNeeded = [];
    plateDenoms.forEach(p => {
      const count = Math.floor(remPerSide / p.kg);
      if (count > 0) {
        platesNeeded.push({ kg: p.kg, count, cls: p.cls });
        remPerSide -= (count * p.kg);
      }
    });

    const barbellStack = document.getElementById("barbellPlatesStack");
    if (barbellStack) {
      barbellStack.innerHTML = platesNeeded.flatMap(p => 
        Array(p.count).fill(0).map(() => `<div class="plate-disc ${p.cls}">${p.kg}</div>`)
      ).join("");
    }

    const pillsDisplay = document.getElementById("platesPerSideDisplay");
    if (pillsDisplay) {
      pillsDisplay.innerHTML = platesNeeded.map(p => `
        <span class="plate-pill-badge">${p.count} × ${p.kg}kg</span>
      `).join("") || `<span style="font-size: 12px; color: var(--text-dim);">Chỉ cần dùng thanh đòn rỗng 20kg.</span>`;
    }
  }

  // =========================================================================
  // 7. TAB 5: STATS & 3D SVG HEATMAP
  // =========================================================================
  renderStatsView() {
    this.render3DHeatmap();
    this.renderStatsSummaryCards();
    this.renderProgressCharts();
    this.renderCalendar();
    this.renderHistoryList();
  }

  render3DHeatmap(highlightMuscle = null) {
    const anteriorContainer = document.getElementById("svgAnteriorContainer");
    const posteriorContainer = document.getElementById("svgPosteriorContainer");

    const svgFilterDefs = `
      <defs>
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feFlood flood-color="#ff2a2a" flood-opacity="0.9" result="color"/>
          <feComposite in2="blur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="redGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff4d4d"/>
          <stop offset="100%" stop-color="#cc0000"/>
        </linearGradient>
      </defs>
    `;

    // ANTERIOR SVG
    if (anteriorContainer) {
      anteriorContainer.innerHTML = `
        <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
          ${svgFilterDefs}
          <!-- Head & Neck -->
          <circle cx="50" cy="18" r="10" fill="#1c1c1c" stroke="#333" />
          
          <!-- Chest -->
          <path id="pec_left" class="muscle-path ${highlightMuscle === 'Chest' ? 'targeted' : ''}" d="M38 42 C44 42 48 48 48 56 C42 58 35 54 34 46 Z" data-muscle="Chest" />
          <path id="pec_right" class="muscle-path ${highlightMuscle === 'Chest' ? 'targeted' : ''}" d="M62 42 C56 42 52 48 52 56 C58 58 65 54 66 46 Z" data-muscle="Chest" />
          
          <!-- Shoulders (Anterior Deltoids) -->
          <path id="delt_front_left" class="muscle-path ${highlightMuscle === 'Shoulders' ? 'targeted' : ''}" d="M28 42 C34 40 37 46 36 54 C30 52 26 48 28 42 Z" data-muscle="Shoulders" />
          <path id="delt_front_right" class="muscle-path ${highlightMuscle === 'Shoulders' ? 'targeted' : ''}" d="M72 42 C66 40 63 46 64 54 C70 52 74 48 72 42 Z" data-muscle="Shoulders" />
          
          <!-- Biceps -->
          <path id="biceps_left" class="muscle-path ${highlightMuscle === 'Biceps' ? 'targeted' : ''}" d="M25 56 C30 56 30 70 26 76 C23 72 22 62 25 56 Z" data-muscle="Biceps" />
          <path id="biceps_right" class="muscle-path ${highlightMuscle === 'Biceps' ? 'targeted' : ''}" d="M75 56 C70 56 70 70 74 76 C77 72 78 62 75 56 Z" data-muscle="Biceps" />
          
          <!-- Core / Abs -->
          <rect id="abs_upper" class="muscle-path ${highlightMuscle === 'Core' ? 'targeted' : ''}" x="44" y="60" width="12" height="12" rx="2" data-muscle="Core" />
          <rect id="abs_lower" class="muscle-path ${highlightMuscle === 'Core' ? 'targeted' : ''}" x="44" y="74" width="12" height="14" rx="2" data-muscle="Core" />
          
          <!-- Quads (Thighs) -->
          <path id="quad_left" class="muscle-path ${highlightMuscle === 'Quads' ? 'targeted' : ''}" d="M37 98 C46 98 48 116 46 138 C40 140 35 125 34 106 Z" data-muscle="Quads" />
          <path id="quad_right" class="muscle-path ${highlightMuscle === 'Quads' ? 'targeted' : ''}" d="M63 98 C54 98 52 116 54 138 C60 140 65 125 66 106 Z" data-muscle="Quads" />
          
          <!-- Calves (Anterior Tibialis) -->
          <path id="calf_front_left" class="muscle-path ${highlightMuscle === 'Calves' ? 'targeted' : ''}" d="M37 146 C42 146 43 166 41 182 C37 182 36 166 37 146 Z" data-muscle="Calves" />
          <path id="calf_front_right" class="muscle-path ${highlightMuscle === 'Calves' ? 'targeted' : ''}" d="M63 146 C58 146 57 166 59 182 C63 182 64 166 63 146 Z" data-muscle="Calves" />
        </svg>
      `;
    }

    // POSTERIOR SVG
    if (posteriorContainer) {
      posteriorContainer.innerHTML = `
        <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
          ${svgFilterDefs}
          <!-- Head -->
          <circle cx="50" cy="18" r="10" fill="#1c1c1c" stroke="#333" />
          
          <!-- Upper Traps -->
          <path id="traps_upper" class="muscle-path ${highlightMuscle === 'Upper Back' ? 'targeted' : ''}" d="M42 30 L58 30 L64 42 L36 42 Z" data-muscle="Upper Back" />
          
          <!-- Lats (Back) -->
          <path id="lat_left" class="muscle-path ${highlightMuscle === 'Lats' ? 'targeted' : ''}" d="M36 44 C44 48 44 70 38 78 C33 68 32 54 36 44 Z" data-muscle="Lats" />
          <path id="lat_right" class="muscle-path ${highlightMuscle === 'Lats' ? 'targeted' : ''}" d="M64 44 C56 48 56 70 62 78 C67 68 68 54 64 44 Z" data-muscle="Lats" />
          
          <!-- Triceps -->
          <path id="triceps_left" class="muscle-path ${highlightMuscle === 'Triceps' ? 'targeted' : ''}" d="M24 54 C28 54 28 70 24 74 C21 70 21 60 24 54 Z" data-muscle="Triceps" />
          <path id="triceps_right" class="muscle-path ${highlightMuscle === 'Triceps' ? 'targeted' : ''}" d="M76 54 C72 54 72 70 76 74 C79 70 79 60 76 54 Z" data-muscle="Triceps" />
          
          <!-- Glutes (Mông) -->
          <path id="glute_left" class="muscle-path ${highlightMuscle === 'Glutes' ? 'targeted' : ''}" d="M37 92 C48 90 49 110 40 114 C33 112 32 100 37 92 Z" data-muscle="Glutes" />
          <path id="glute_right" class="muscle-path ${highlightMuscle === 'Glutes' ? 'targeted' : ''}" d="M63 92 C52 90 51 110 60 114 C67 112 68 100 63 92 Z" data-muscle="Glutes" />
          
          <!-- Hamstrings (Đùi sau) -->
          <path id="ham_left" class="muscle-path ${highlightMuscle === 'Hamstrings' ? 'targeted' : ''}" d="M36 116 C46 116 47 136 44 142 C38 142 35 132 36 116 Z" data-muscle="Hamstrings" />
          <path id="ham_right" class="muscle-path ${highlightMuscle === 'Hamstrings' ? 'targeted' : ''}" d="M64 116 C54 116 53 136 56 142 C62 142 65 132 64 116 Z" data-muscle="Hamstrings" />
          
          <!-- Calves (Gastrocnemius) -->
          <path id="calf_left" class="muscle-path ${highlightMuscle === 'Calves' ? 'targeted' : ''}" d="M36 148 C44 148 43 170 39 180 C34 176 34 160 36 148 Z" data-muscle="Calves" />
          <path id="calf_right" class="muscle-path ${highlightMuscle === 'Calves' ? 'targeted' : ''}" d="M64 148 C56 148 57 170 61 180 C66 176 66 160 64 148 Z" data-muscle="Calves" />
        </svg>
      `;
    }

    // Interactive Heatmap Muscle Click Listeners
    document.querySelectorAll(".muscle-path").forEach(path => {
      path.addEventListener("click", () => {
        const muscle = path.getAttribute("data-muscle");
        this.selectHeatmapMuscle(muscle);
      });
    });

    // Muscle Tags Row
    const tagsRow = document.getElementById("heatmapInteractiveTagsRow");
    if (tagsRow) {
      const muscles = ["Chest", "Lats", "Shoulders", "Quads", "Hamstrings", "Glutes", "Biceps", "Triceps", "Calves", "Core", "Upper Back"];
      tagsRow.innerHTML = muscles.map(m => `
        <button class="btn-heatmap-filter-tag ${highlightMuscle === m ? 'active' : ''}" data-muscle="${m}">
          ${m}
        </button>
      `).join("");

      tagsRow.querySelectorAll(".btn-heatmap-filter-tag").forEach(btn => {
        btn.addEventListener("click", () => {
          const m = btn.getAttribute("data-muscle");
          this.selectHeatmapMuscle(m);
        });
      });
    }
  }

  selectHeatmapMuscle(muscle) {
    const indicator = document.getElementById("activeHeatmapMuscleLabel");
    if (indicator) indicator.textContent = `🔥 Nhóm Cơ: ${muscle}`;
    this.render3DHeatmap(muscle);
  }

  renderStatsSummaryCards() {
    const history = this.storage.getWorkoutHistory();
    let vol = 0;
    let km = 0;

    history.forEach(h => {
      vol += (h.totalVolumeKg || 0);
      km += (h.totalDistanceKm || (h.actualCardio && h.actualCardio.distanceKm) || 0);
    });

    const volEl = document.getElementById("statSummaryVolume");
    if (volEl) volEl.textContent = `${vol.toLocaleString()} kg`;

    const kmEl = document.getElementById("statSummaryDistance");
    if (kmEl) kmEl.textContent = `${km.toFixed(1)} km`;

    const wkEl = document.getElementById("statSummaryWorkouts");
    if (wkEl) wkEl.textContent = history.length;

    const prEl = document.getElementById("statSummaryPRs");
    if (prEl) {
      const prCount = this.storage.calculatePersonalRecords(history);
      prEl.textContent = prCount;
    }
  }

  renderProgressCharts() {
    if (!window.DinoCharts) return;

    const history = this.storage.getWorkoutHistory();
    const selectEx = document.getElementById("selectChartExercise");
    const exId = selectEx ? selectEx.value : "pin_squat";
    const selectedOption = selectEx ? selectEx.options[selectEx.selectedIndex] : null;
    const exName = selectedOption ? selectedOption.textContent.trim() : "Squat";

    // Chart 1: Overload - Real performance points from actual completed sessions
    const perfHistory = this.storage.getExercisePerformanceHistory(exId, exName);
    const overloadPoints = [];

    perfHistory.forEach(entry => {
      let maxLoad = 0;
      let bestReps = 0;
      if (entry.sets && Array.isArray(entry.sets)) {
        entry.sets.forEach(s => {
          if (s.completed || (s.actual && s.actual.load > 0)) {
            const load = s.actual?.load ?? s.load ?? 0;
            const reps = s.actual?.reps ?? s.reps ?? 0;
            if (load > maxLoad || (load === maxLoad && reps > bestReps)) {
              maxLoad = load;
              bestReps = reps;
            }
          }
        });
      }
      if (maxLoad > 0) {
        overloadPoints.push({
          date: entry.date,
          weightKg: maxLoad,
          reps: bestReps
        });
      }
    });

    window.DinoCharts.renderOverloadChart("canvasStatsOverload", overloadPoints, exName);

    // Chart 2: Mileage - Real cardio sessions from actual history
    const mileageRuns = [];
    history.forEach(h => {
      const dist = (h.actualCardio && h.actualCardio.distanceKm) ? h.actualCardio.distanceKm : (h.totalDistanceKm || 0);
      if (dist > 0) {
        mileageRuns.push({
          date: h.date,
          km: dist
        });
      }
    });

    window.DinoCharts.renderMileageChart("canvasStatsMileage", mileageRuns);

    if (selectEx && !this._chartSelectBound) {
      this._chartSelectBound = true;
      selectEx.addEventListener("change", () => this.renderProgressCharts());
    }
  }

  renderCalendar() {
    const grid = document.getElementById("calendarDaysGrid");
    if (!grid) return;

    const daysInMonth = 30;
    const history = this.storage.getWorkoutHistory();
    const activeDates = new Set(history.map(h => parseInt(h.date?.split("-")[2], 10)).filter(d => !isNaN(d)));

    grid.innerHTML = "";
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      const hasWorkout = activeDates.has(day);
      cell.className = `cal-day-cell ${hasWorkout ? 'has-workout' : ''}`;
      cell.innerHTML = `<span>${day}</span>`;
      grid.appendChild(cell);
    }
  }

  renderHistoryList() {
    const container = document.getElementById("historyCardsContainer");
    if (!container) return;

    const history = this.storage.getWorkoutHistory();
    if (history.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-dim); font-size: 12.5px;">
          Chưa có buổi tập nào được lưu. Hãy hoàn thành buổi tập đầu tiên!
        </div>
      `;
      return;
    }

    container.innerHTML = history.map(s => {
      const isCardio = s.sessionType === "cardio" || (s.actualCardio && (s.actualCardio.distanceKm > 0 || s.totalDistanceKm > 0));
      let metaLine = "";
      let exDetailLine = "";

      if (isCardio) {
        const dist = s.actualCardio?.distanceKm || s.totalDistanceKm || 0;
        const pace = s.actualCardio?.pace || s.avgPace || (s.actualCardio?.durationMin && dist > 0 ? `${(s.actualCardio.durationMin / dist).toFixed(2)} /km` : "--:--");
        const dur = Math.round((s.durationSec || (s.actualCardio?.durationMin ? s.actualCardio.durationMin * 60 : 0)) / 60);
        metaLine = `📅 ${s.date} • 🏃 ${dist} km • ⚡ Pace: ${pace} • ⏱️ ${dur} phút`;
        exDetailLine = `Cardio: ${s.actualCardio?.sessionType || s.dayTitle || 'Chạy bộ'}${s.actualCardio?.notes ? ` • Ghi chú: ${s.actualCardio.notes}` : ''}`;
      } else {
        metaLine = `📅 ${s.date} • ⏱️ ${Math.round((s.durationSec || 0) / 60)} phút • 🏋️ ${(s.totalVolumeKg || 0).toLocaleString()} kg • ${s.totalSets || 0} sets`;
        if (s.actualPerformance && Array.isArray(s.actualPerformance) && s.actualPerformance.length > 0) {
          exDetailLine = s.actualPerformance.map(ap => {
            const completedCount = ap.sets ? ap.sets.filter(st => st.completed).length : 0;
            return `${ap.exerciseName} (${completedCount} sets)`;
          }).join(" • ");
        } else if (s.exercises && Array.isArray(s.exercises) && s.exercises.length > 0) {
          exDetailLine = s.exercises.map(e => `${e.name} (${e.sets || 0} sets)`).join(" • ");
        }
      }

      return `
      <div class="history-session-card">
        <div style="flex: 1; min-width: 0;">
          <div class="history-session-title">${s.dayTitle || 'Workout Session'}</div>
          <div class="history-session-meta">${metaLine}</div>
          ${exDetailLine ? `<div style="font-size: 11px; color: var(--text-dim); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${exDetailLine}</div>` : ''}
        </div>
        <button class="btn-ex-delete-mini btn-delete-history-item" data-id="${s.id}">✕</button>
      </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-delete-history-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Xóa bản ghi buổi tập này?")) {
          this.storage.deleteWorkoutHistoryItem(id);
          this.renderStatsView();
        }
      });
    });
  }

  // =========================================================================
  // 8. GOOGLE GEMINI AI COACH COPILOT
  // =========================================================================
  bindAICoachEvents() {
    const form = document.getElementById("formAIChatModal");
    const input = document.getElementById("inputAIChatModal");
    const historyContainer = document.getElementById("aiChatHistoryModal");
    const promptsContainer = document.getElementById("aiQuickPromptsContainerModal");

    // Quick Prompts
    const quickPrompts = [
      "Phân tích khối lượng tập tuần này của tôi",
      "Đề xuất mức tăng tạ (Progressive Overload) buổi tới",
      "Làm thế nào để kết hợp chạy 15km với gánh tạ nặng?",
      "Tạo routine phục hồi gù lưng và đau khớp gối",
      "Tôi nên xử lý thế nào khi đá bóng thứ 7 bị mỏi đùi?"
    ];

    if (promptsContainer) {
      promptsContainer.innerHTML = quickPrompts.map(p => `
        <button class="btn-ai-prompt-chip" data-prompt="${p}">${p}</button>
      `).join("");

      promptsContainer.querySelectorAll(".btn-ai-prompt-chip").forEach(btn => {
        btn.addEventListener("click", () => {
          if (input) {
            input.value = btn.getAttribute("data-prompt");
            form?.dispatchEvent(new Event("submit"));
          }
        });
      });
    }

    const appendMessage = (sender, text) => {
      if (!historyContainer) return;
      const msg = document.createElement("div");
      msg.className = `ai-msg ${sender}`;
      // Basic markdown bold & list rendering
      msg.innerHTML = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n- /g, '<br>• ');
      historyContainer.appendChild(msg);
      historyContainer.scrollTop = historyContainer.scrollHeight;
    };

    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        appendMessage("user", text);
        input.value = "";

        // Typing indicator
        const typingId = "aiTyping_" + Date.now();
        const typingEl = document.createElement("div");
        typingEl.id = typingId;
        typingEl.className = "ai-msg bot";
        typingEl.textContent = "⚡ AI Coach đang phân tích...";
        historyContainer.appendChild(typingEl);
        historyContainer.scrollTop = historyContainer.scrollHeight;

        try {
          const reply = await this.aiCoach.generateResponse(text);
          typingEl.remove();
          appendMessage("bot", reply);
        } catch (err) {
          typingEl.remove();
          appendMessage("bot", "Lỗi phản hồi từ AI Coach: " + err.message);
        }
      });
    }

    const btnClearChat = document.getElementById("btnClearAIChatModal");
    if (btnClearChat && historyContainer) {
      btnClearChat.addEventListener("click", () => {
        historyContainer.innerHTML = `
          <div class="ai-msg bot">
            Xin chào! Tôi là <strong>Dino AI Coach</strong>. Hãy hỏi tôi về tăng tạ, chiến thuật chạy 21km hay phục hồi cơ bắp!
          </div>
        `;
      });
    }

    // Initialize Default Greeting
    if (historyContainer && historyContainer.children.length === 0) {
      appendMessage("bot", "Xin chào! Tôi là **Dino AI Coach**. Dữ liệu tập luyện của bạn đã được kết nối sẵn sàng. Hãy chọn câu hỏi gợi ý hoặc hỏi tôi bất cứ điều gì!");
    }
  }

  // =========================================================================
  // 9. SETTINGS & GOOGLE GEMINI API KEY MANAGEMENT
  // =========================================================================
  bindSettingsEvents() {
    const inputKey = document.getElementById("inputGeminiApiKey");
    const btnSaveKey = document.getElementById("btnSaveGeminiApiKey");
    const successTag = document.getElementById("geminiApiKeySuccessTag");

    if (inputKey) {
      inputKey.value = this.storage.getGeminiApiKey();
    }

    if (btnSaveKey && inputKey) {
      btnSaveKey.addEventListener("click", () => {
        const key = inputKey.value.trim();
        this.storage.setGeminiApiKey(key);
        if (successTag) {
          successTag.style.display = "block";
          setTimeout(() => { successTag.style.display = "none"; }, 3000);
        }
        this.showToast("✓ Đã lưu Google Gemini API Key!");
      });
    }

    const btnTestKey = document.getElementById("btnTestGeminiApiKey");
    const statusBox = document.getElementById("geminiApiKeyTestStatus");
    if (btnTestKey && inputKey) {
      btnTestKey.addEventListener("click", async () => {
        const key = inputKey.value.trim() || this.storage.getGeminiApiKey();
        if (!key) {
          this.showToast("⚠️ Vui lòng nhập API Key trước khi test!");
          return;
        }

        if (statusBox) {
          statusBox.style.display = "block";
          statusBox.style.color = "var(--color-gold)";
          statusBox.innerHTML = "⏳ Đang kiểm tra kết nối tới Gemini API (gemini-2.5-flash)...";
        }

        try {
          const athlete = this.storage.getAthleteContextSummary();
          const testReply = await this.aiCoach.callGeminiAPI(key, "Kiểm tra kết nối AI Coach", athlete);
          
          if (statusBox) {
            statusBox.style.color = "var(--color-green)";
            statusBox.innerHTML = "✓ <strong>Kết nối thành công!</strong> Mô hình đã sẵn sàng phản hồi.";
          }
          this.showToast("✓ Kết nối thành công tới Google Gemini API!");
        } catch (err) {
          console.error("Gemini API Test Failed:", err);
          if (statusBox) {
            statusBox.style.color = "var(--red-primary)";
            statusBox.innerHTML = `✕ <strong>Lỗi kết nối:</strong> ${err.message}`;
          }
          this.showToast(`⚠️ Lỗi Gemini API: ${err.message}`);
        }
      });
    }

    // Export JSON Backup
    const btnExport = document.getElementById("btnExportData");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const json = this.storage.exportAllDataAsJSON();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dino_tracking_backup_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("📥 Đã tải file sao lưu JSON!");
      });
    }

    // Import JSON Backup
    const fileImport = document.getElementById("fileImportInput");
    if (fileImport) {
      fileImport.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const success = this.storage.importAllDataFromJSON(ev.target.result);
            if (success) {
              this.showToast("✓ Khôi phục dữ liệu thành công! Đang tải lại...");
              setTimeout(() => location.reload(), 1000);
            } else {
              alert("Lỗi đọc file sao lưu JSON!");
            }
          };
          reader.readAsText(file);
        }
      });
    }
  }

  // Confetti Particle Explosion
  triggerConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 70 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: ["#ff2a2a", "#10b981", "#3b82f6", "#ffd700", "#ffffff"][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      rv: (Math.random() - 0.5) * 10
    }));

    let frames = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.rv;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    requestAnimationFrame(animate);
  }
}

// Instantiate DinoApp on DOMContentLoaded
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    window.dinoApp = new DinoApp();
  });
}
