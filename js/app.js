/**
 * Dino Tracking - Hevy-Style Application Controller (v5.0)
 * Professional 5-Tab Hybrid Fitness Architecture with AI Coach, Multi-Program Builder,
 * Active Stopwatch, Set Deletion, Exercise Swapping, Post-Workout Summary, and Gamified Visuals
 */

document.addEventListener("DOMContentLoaded", () => {
  window.dinoApp = new DinoApp();
});

class DinoApp {
  constructor() {
    this.storage = window.dinoStorage;
    this.audio = window.dinoAudio;
    this.data = window.PROGRAM_DATA || {};
    this.aiCoach = window.dinoAICoach;
    this.supabaseSync = (typeof DinoSupabaseSync !== "undefined")
      ? new DinoSupabaseSync(this.storage)
      : null;
    if (typeof window !== "undefined") {
      window.dinoSync = this.supabaseSync;
    }

    // Application State
    this.currentTab = "workout";
    this.activeProgram = this.storage.getActiveProgram();
    this.currentWeek = this.storage.getActiveWeek();
    this.currentDayIndex = this.storage.getActiveDayIndex();

    // Active Exercise Modal State
    this.selectedExerciseForDetail = null;
    this.selectedExerciseForSwap = null;

    // Calendar state
    const today = new Date();
    this.calYear = today.getFullYear();
    this.calMonth = today.getMonth(); // 0-11
    this.calFilterDate = null; // 'YYYY-MM-DD' or null

    // Rest Timer State
    this.timerInterval = null;
    this.timerSecondsLeft = 0;
    this.isTimerRP = false;

    // Active Workout Stopwatch State
    this.stopwatchSeconds = 0;
    this.isStopwatchRunning = true;
    this.stopwatchInterval = null;

    this.initElements();
    this.bindEvents();
    this.initStopwatch();
    this.renderAll();

    // Start background Supabase cloud sync
    if (this.supabaseSync) {
      this.supabaseSync.init();
    }
  }

  initElements() {
    // 5-Tab Bottom Navigation
    this.navBtns = document.querySelectorAll(".nav-item-btn");
    this.tabContents = document.querySelectorAll(".tab-content");

    // Header elements
    this.headerProgramSubtitle = document.getElementById("headerProgramSubtitle");
    this.btnHeaderSettings = document.getElementById("btnHeaderSettings");
    this.cloudSyncBadge = document.getElementById("cloudSyncBadge");
    this.cloudSyncText = document.getElementById("cloudSyncText");

    // Tab 1: Workout elements
    this.activeProgramNameText = document.getElementById("activeProgramNameText");
    this.btnSwitchProgramDirect = document.getElementById("btnSwitchProgramDirect");
    this.weekToggleContainer = document.getElementById("weekToggleContainer");
    this.btnWeekA = document.getElementById("btnWeekA");
    this.btnWeekB = document.getElementById("btnWeekB");
    this.dayChipsContainer = document.getElementById("dayChipsContainer");
    this.heroDayTag = document.getElementById("heroDayTag");
    this.heroWorkoutTitle = document.getElementById("heroWorkoutTitle");
    this.heroWorkoutFocus = document.getElementById("heroWorkoutFocus");
    this.workoutStopwatchText = document.getElementById("workoutStopwatchText");
    this.btnPauseWorkout = document.getElementById("btnPauseWorkout");
    this.btnFinishWorkout = document.getElementById("btnFinishWorkout");
    this.workoutExercisesContainer = document.getElementById("workoutExercisesContainer");
    this.inputWorkoutNotes = document.getElementById("inputWorkoutNotes");
    this.notesSavedTag = document.getElementById("notesSavedTag");

    // Tab 2: History & Calendar elements
    this.calMonthTitle = document.getElementById("calMonthTitle");
    this.btnCalPrevMonth = document.getElementById("btnCalPrevMonth");
    this.btnCalNextMonth = document.getElementById("btnCalNextMonth");
    this.calendarDaysGrid = document.getElementById("calendarDaysGrid");
    this.statTotalWorkouts = document.getElementById("statTotalWorkouts");
    this.statTotalVolume = document.getElementById("statTotalVolume");
    this.statTotalKm = document.getElementById("statTotalKm");
    this.historySelectedDateFilter = document.getElementById("historySelectedDateFilter");
    this.historyCardsContainer = document.getElementById("historyCardsContainer");

    // Tab 3: AI Coach elements
    this.aiQuickPromptsContainer = document.getElementById("aiQuickPromptsContainer");
    this.aiChatHistoryContainer = document.getElementById("aiChatHistoryContainer");
    this.formAIChat = document.getElementById("formAIChat");
    this.inputAIChat = document.getElementById("inputAIChat");
    this.btnSendAIChat = document.getElementById("btnSendAIChat");

    // Tab 4: Program Builder elements
    this.btnOpenCreateProgramModal = document.getElementById("btnOpenCreateProgramModal");
    this.programsListContainer = document.getElementById("programsListContainer");
    this.modalProgramBuilder = document.getElementById("modalProgramBuilder");
    this.formProgramBuilder = document.getElementById("formProgramBuilder");
    this.inputProgName = document.getElementById("inputProgName");
    this.inputProgDesc = document.getElementById("inputProgDesc");
    this.selectProgRotation = document.getElementById("selectProgRotation");

    // Tab 5: Recovery Rules elements
    this.recoveryRulesList = document.getElementById("recoveryRulesList");
    this.priorityListEl = document.getElementById("priorityListEl");
    this.matrixTableBody = document.getElementById("matrixTableBody");
    this.checkpointsContainer = document.getElementById("checkpointsContainer");

    // Rest Timer HUD elements
    this.timerHudPill = document.getElementById("timerHudPill");
    this.timerTimeText = document.getElementById("timerTimeText");
    this.timerTitleText = document.getElementById("timerTitleText");
    this.btnTimerAdd30 = document.getElementById("btnTimerAdd30");
    this.btnTimerDismiss = document.getElementById("btnTimerDismiss");

    // Modals
    this.modalWorkoutSummary = document.getElementById("modalWorkoutSummary");
    this.modalExerciseDetail = document.getElementById("modalExerciseDetail");
    this.modalSwapExercise = document.getElementById("modalSwapExercise");
    this.modalSettings = document.getElementById("modalSettings");
    this.toastBox = document.getElementById("toastBox");
  }

  bindEvents() {
    // 1. Bottom 5-Tab Navigation
    this.navBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // 2. Direct Program Switch button in workout tab
    if (this.btnSwitchProgramDirect) {
      this.btnSwitchProgramDirect.addEventListener("click", () => {
        this.switchTab("programs");
      });
    }

    // 3. Week A / Week B Switchers
    if (this.btnWeekA && this.btnWeekB) {
      this.btnWeekA.addEventListener("click", () => this.setWeek("A"));
      this.btnWeekB.addEventListener("click", () => this.setWeek("B"));
    }

    // 4. Stopwatch Pause / Resume Toggle
    if (this.btnPauseWorkout) {
      this.btnPauseWorkout.addEventListener("click", () => this.togglePauseStopwatch());
    }

    // 5. Finish Workout Button -> Opens Post-Workout Celebration Summary
    if (this.btnFinishWorkout) {
      this.btnFinishWorkout.addEventListener("click", () => this.openPostWorkoutSummary());
    }

    // Confirm Save Workout in Summary Modal
    const btnConfirmSaveWorkout = document.getElementById("btnConfirmSaveWorkout");
    if (btnConfirmSaveWorkout) {
      btnConfirmSaveWorkout.addEventListener("click", () => this.handleConfirmSaveWorkout());
    }

    // 6. Session Notes Input Auto-save
    if (this.inputWorkoutNotes) {
      this.inputWorkoutNotes.addEventListener("input", () => {
        const text = this.inputWorkoutNotes.value;
        this.storage.setSessionNotes(this.activeProgram.id, this.currentWeek, this.currentDayIndex, text);
        if (this.notesSavedTag) {
          this.notesSavedTag.style.display = "inline";
          clearTimeout(this.notesSavedTimeout);
          this.notesSavedTimeout = setTimeout(() => {
            if (this.notesSavedTag) this.notesSavedTag.style.display = "none";
          }, 1500);
        }
      });
    }

    // 7. Calendar Navigation
    if (this.btnCalPrevMonth) {
      this.btnCalPrevMonth.addEventListener("click", () => this.changeCalMonth(-1));
    }
    if (this.btnCalNextMonth) {
      this.btnCalNextMonth.addEventListener("click", () => this.changeCalMonth(1));
    }
    if (this.historySelectedDateFilter) {
      this.historySelectedDateFilter.addEventListener("click", () => {
        if (this.calFilterDate) {
          this.calFilterDate = null;
          this.renderHistoryTab();
          this.showToast("Đã bỏ bộ lọc ngày. Hiển thị tất cả!");
        }
      });
    }

    // 8. AI Coach Input Form & Prompts
    if (this.formAIChat) {
      this.formAIChat.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSendAIChat();
      });
    }

    const btnClearAIChat = document.getElementById("btnClearAIChat");
    if (btnClearAIChat) {
      btnClearAIChat.addEventListener("click", () => {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đoạn chat với AI Coach?")) {
          this.storage.clearAIChatHistory();
          this.renderAIChatMessages();
          this.showToast("Đã xóa lịch sử đoạn chat.");
        }
      });
    }

    // 9. Modal Swap Shortcut from Detail modal
    const btnModalSwapShortcut = document.getElementById("btnModalSwapShortcut");
    if (btnModalSwapShortcut) {
      btnModalSwapShortcut.addEventListener("click", () => {
        this.closeAllModals();
        if (this.selectedExerciseForDetail) {
          this.openSwapExerciseModal(this.selectedExerciseForDetail);
        }
      });
    }

    // 10. Program Builder Modal
    if (this.btnOpenCreateProgramModal) {
      this.btnOpenCreateProgramModal.addEventListener("click", () => {
        this.openModal("modalProgramBuilder");
      });
    }
    if (this.formProgramBuilder) {
      this.formProgramBuilder.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleCreateProgram();
      });
    }

    // 11. Settings Modal
    if (this.btnHeaderSettings) {
      this.btnHeaderSettings.addEventListener("click", () => this.openSettingsModal());
    }

    // 12. Close Modals
    document.querySelectorAll(".btn-sheet-close, .modal-overlay").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target === el || el.classList.contains("btn-sheet-close")) {
          this.closeAllModals();
        }
      });
    });

    // 13. Rest Timer HUD buttons
    if (this.btnTimerAdd30) {
      this.btnTimerAdd30.addEventListener("click", () => this.addTimerSeconds(30));
    }
    if (this.btnTimerDismiss) {
      this.btnTimerDismiss.addEventListener("click", () => this.stopTimer());
    }

    // 14. Supabase Cloud Sync Event Listeners
    window.addEventListener("dino:cloud-status", (e) => {
      this.updateCloudSyncDisplay(e.detail);
    });

    window.addEventListener("dino:cloud-synced", () => {
      this.activeProgram = this.storage.getActiveProgram();
      this.currentWeek = this.storage.getActiveWeek();
      this.currentDayIndex = this.storage.getActiveDayIndex();
      this.renderAll();
      this.showToast("☁️ Dữ liệu đã đồng bộ thời gian thực từ Cloud!");
    });

    if (this.cloudSyncBadge) {
      this.cloudSyncBadge.addEventListener("click", () => {
        if (this.supabaseSync) {
          this.supabaseSync.syncNow();
          this.showToast("Đang kích hoạt đồng bộ Supabase Cloud...");
        }
      });
    }

    // Supabase Sync buttons in Settings Modal
    const btnManualSyncCloud = document.getElementById("btnManualSyncCloud");
    if (btnManualSyncCloud) {
      btnManualSyncCloud.addEventListener("click", async () => {
        if (this.supabaseSync) {
          btnManualSyncCloud.disabled = true;
          btnManualSyncCloud.textContent = "🔄 Đang đồng bộ...";
          await this.supabaseSync.syncNow();
          btnManualSyncCloud.disabled = false;
          btnManualSyncCloud.textContent = "🔄 Đồng Bộ Ngay";
        }
      });
    }

    const btnCopySupabaseSql = document.getElementById("btnCopySupabaseSql");
    const sqlHelpBox = document.getElementById("sqlHelpBox");
    if (btnCopySupabaseSql) {
      btnCopySupabaseSql.addEventListener("click", () => {
        const sqlText = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.SQL_SETUP)
          ? window.SUPABASE_CONFIG.SQL_SETUP
          : "";
        if (navigator.clipboard && sqlText) {
          navigator.clipboard.writeText(sqlText);
          if (sqlHelpBox) sqlHelpBox.style.display = "block";
          this.showToast("✓ Đã sao chép mã SQL vào clipboard!");
        } else {
          prompt("Sao chép mã SQL dưới đây và chạy trong Supabase SQL Editor:", sqlText);
        }
      });
    }
  }

  updateCloudSyncDisplay(detail) {
    if (!this.cloudSyncBadge) return;
    const { status, message, lastSyncedAt, userId } = detail;
    this.cloudSyncBadge.className = `cloud-sync-pill ${status}`;

    if (this.cloudSyncText) {
      if (status === "synced") this.cloudSyncText.textContent = "Cloud";
      else if (status === "syncing") this.cloudSyncText.textContent = "Syncing...";
      else if (status === "offline") this.cloudSyncText.textContent = "Offline";
      else if (status === "error") this.cloudSyncText.textContent = "Cloud Error";
      else if (status === "table_missing") this.cloudSyncText.textContent = "Setup SQL";
    }

    const settingsCloudPill = document.getElementById("settingsCloudPill");
    if (settingsCloudPill) {
      settingsCloudPill.className = `cloud-status-pill ${status}`;
      if (status === "synced") settingsCloudPill.textContent = "● Đã kết nối Cloud";
      else if (status === "syncing") settingsCloudPill.textContent = "● Đang đồng bộ...";
      else if (status === "table_missing") settingsCloudPill.textContent = "● Cần chạy SQL";
      else if (status === "offline") settingsCloudPill.textContent = "● Ngoại tuyến (Offline)";
      else settingsCloudPill.textContent = "● Lỗi kết nối";
    }

    const cloudLastSyncedText = document.getElementById("cloudLastSyncedText");
    if (cloudLastSyncedText) {
      if (lastSyncedAt) {
        const d = new Date(lastSyncedAt);
        const timeStr = `${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}:${d.getSeconds() < 10 ? '0' : ''}${d.getSeconds()}`;
        cloudLastSyncedText.textContent = `Lần đồng bộ gần nhất: ${timeStr} (${d.toLocaleDateString('vi-VN')})`;
      } else {
        cloudLastSyncedText.textContent = "Lần đồng bộ gần nhất: Chưa đồng bộ";
      }
    }
  }

  // =========================================================================
  // STOPWATCH CONTROLLER
  // =========================================================================
  initStopwatch() {
    this.stopwatchSeconds = 0;
    this.isStopwatchRunning = true;

    if (this.stopwatchInterval) clearInterval(this.stopwatchInterval);
    this.stopwatchInterval = setInterval(() => {
      if (this.isStopwatchRunning) {
        this.stopwatchSeconds++;
        this.updateStopwatchDisplay();
      }
    }, 1000);
  }

  togglePauseStopwatch() {
    this.isStopwatchRunning = !this.isStopwatchRunning;
    const dot = document.querySelector(".stopwatch-dot");
    if (dot) dot.classList.toggle("paused", !this.isStopwatchRunning);

    if (this.btnPauseWorkout) {
      this.btnPauseWorkout.innerHTML = this.isStopwatchRunning
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }
    this.showToast(this.isStopwatchRunning ? "▶️ Tiếp tục bấm giờ buổi tập" : "⏸️ Đã tạm dừng bấm giờ");
  }

  updateStopwatchDisplay() {
    if (!this.workoutStopwatchText) return;
    const hrs = Math.floor(this.stopwatchSeconds / 3600);
    const mins = Math.floor((this.stopwatchSeconds % 3600) / 60);
    const secs = this.stopwatchSeconds % 60;
    this.workoutStopwatchText.textContent = `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  resetStopwatch() {
    this.stopwatchSeconds = 0;
    this.updateStopwatchDisplay();
  }

  // =========================================================================
  // GLOBAL NAVIGATION & TAB SWITCHING
  // =========================================================================
  switchTab(tabName) {
    this.currentTab = tabName;
    this.activeProgram = this.storage.getActiveProgram();

    this.navBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    this.tabContents.forEach(tab => {
      tab.classList.toggle("active", tab.id === `tab-${tabName}`);
    });

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (tabName === "workout") {
      this.renderWorkoutTab();
    } else if (tabName === "history") {
      this.renderHistoryTab();
    } else if (tabName === "aicoach") {
      this.renderAICoachTab();
    } else if (tabName === "programs") {
      this.renderProgramsTab();
    } else if (tabName === "recovery") {
      this.renderRecoveryTab();
    }
  }

  setWeek(weekId) {
    this.currentWeek = weekId;
    this.storage.setActiveWeek(weekId);
    if (this.btnWeekA) this.btnWeekA.classList.toggle("active", weekId === "A");
    if (this.btnWeekB) this.btnWeekB.classList.toggle("active", weekId === "B");

    this.renderWorkoutTab();
    this.showToast(`Đã chuyển sang Tuần ${weekId}`);
  }

  selectDay(dayIndex) {
    this.currentDayIndex = dayIndex;
    this.storage.setActiveDayIndex(dayIndex);
    this.renderWorkoutTab();
  }

  renderAll() {
    this.activeProgram = this.storage.getActiveProgram();
    this.renderWorkoutTab();
    this.renderHistoryTab();
    this.renderAICoachTab();
    this.renderProgramsTab();
    this.renderRecoveryTab();
  }

  // =========================================================================
  // TAB 1: HEVY-STYLE WORKOUT LOGGER
  // =========================================================================
  renderWorkoutTab() {
    this.activeProgram = this.storage.getActiveProgram();
    if (!this.activeProgram) return;

    if (this.headerProgramSubtitle) {
      this.headerProgramSubtitle.innerHTML = `<span>${this.activeProgram.name}</span>`;
    }
    if (this.activeProgramNameText) {
      this.activeProgramNameText.textContent = this.activeProgram.name;
    }

    const isMultiWeek = this.activeProgram.rotationWeeks === 2;
    if (this.weekToggleContainer) {
      this.weekToggleContainer.style.display = isMultiWeek ? "grid" : "none";
      if (this.btnWeekA) this.btnWeekA.classList.toggle("active", this.currentWeek === "A");
      if (this.btnWeekB) this.btnWeekB.classList.toggle("active", this.currentWeek === "B");
    }

    const weekData = (this.activeProgram.weeks && this.activeProgram.weeks[this.currentWeek])
      ? this.activeProgram.weeks[this.currentWeek]
      : (this.activeProgram.weeks ? Object.values(this.activeProgram.weeks)[0] : null);

    if (!weekData || !weekData.days) return;

    this.renderDayChips(weekData);

    const activeDay = weekData.days[this.currentDayIndex] || weekData.days[0];
    if (!activeDay) return;

    const isDayDone = this.storage.isDayCompleted(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);

    if (this.heroDayTag) {
      this.heroDayTag.textContent = `${activeDay.dayKey} • ${(activeDay.badge || 'WORKOUT').toUpperCase()}`;
    }
    if (this.heroWorkoutTitle) {
      this.heroWorkoutTitle.textContent = activeDay.title;
    }
    if (this.heroWorkoutFocus) {
      this.heroWorkoutFocus.textContent = activeDay.focus || activeDay.details || "Tập trung cường độ & chất lượng reps";
    }

    // Load Session Notes
    if (this.inputWorkoutNotes) {
      this.inputWorkoutNotes.value = this.storage.getSessionNotes(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);
    }

    // Render Exercises List
    if (this.workoutExercisesContainer) {
      this.workoutExercisesContainer.innerHTML = "";

      // 1. Strength Exercises
      if (activeDay.exercises && activeDay.exercises.length > 0) {
        const swappedMap = this.storage.getSwappedExercises(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);

        activeDay.exercises.forEach(originalEx => {
          const effectiveEx = swappedMap[originalEx.id] || originalEx;
          const card = this.createHevyExerciseCard(effectiveEx, originalEx, activeDay);
          this.workoutExercisesContainer.appendChild(card);
        });
      }

      // 2. Running / Hybrid Day
      if (activeDay.type === "run" || activeDay.type === "hybrid") {
        const runCard = this.createHevyRunningCard(activeDay);
        this.workoutExercisesContainer.appendChild(runCard);
      }

      // 3. Soccer / Rest Day
      if (activeDay.type === "game" || activeDay.type === "rest") {
        const gameCard = this.createHevyGameOrRestCard(activeDay);
        this.workoutExercisesContainer.appendChild(gameCard);
      }
    }
  }

  // Render Horizontal Day Chips Carousel
  renderDayChips(weekData) {
    if (!this.dayChipsContainer) return;
    this.dayChipsContainer.innerHTML = "";

    weekData.days.forEach((day, idx) => {
      const isCompleted = this.storage.isDayCompleted(this.activeProgram.id, this.currentWeek, idx);
      const isActive = idx === this.currentDayIndex;

      const chip = document.createElement("button");
      chip.className = `day-chip ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`;
      chip.innerHTML = `
        <span class="chip-indicator"></span>
        <span>${day.dayKey}</span>
        <span style="font-size: 11px; opacity: 0.8;">${day.badge || ''}</span>
      `;
      chip.addEventListener("click", () => this.selectDay(idx));
      this.dayChipsContainer.appendChild(chip);
    });
  }

  // Create Hevy-Style Exercise Card (Dual Banners + Sets Table + Trash Delete + Swap)
  createHevyExerciseCard(exercise, originalEx, day) {
    const card = document.createElement("div");
    card.className = "hevy-exercise-card";
    card.dataset.exerciseId = exercise.id;

    // 1. Target Banner
    const targetText = exercise.targetRequirement || (exercise.defaultSets
      ? `${exercise.defaultSets.length} sets × ${exercise.defaultSets[0].reps || '6-10'} reps @ ${exercise.defaultSets[0].rir || 'RIR 0-1'}`
      : "2 sets × 6-10 reps @ RIR 0-1");

    // 2. Previous Session Banner
    const bestPrev = this.storage.getExerciseBestPrevious(exercise.id);
    const prevBannerText = bestPrev
      ? `${bestPrev.weightKg}kg × ${bestPrev.reps} reps @ ${bestPrev.rir} (${bestPrev.date})`
      : `Chưa có dữ liệu lần trước`;

    // 3. Sets Rows
    const sessionSets = this.storage.getSessionSets(this.activeProgram.id, this.currentWeek, day.dayIndex, exercise);

    let setsRowsHtml = "";
    sessionSets.forEach((s, idx) => {
      const isDone = !!s.isCompleted;
      const prevDataStr = s.previous ? `${s.previous.weightKg}k × ${s.previous.reps}` : `—`;

      setsRowsHtml += `
        <tr class="hevy-set-row ${isDone ? "completed" : ""}" data-set-index="${idx}">
          <td>
            <span class="set-index-tag">${(exercise.isRestPause || s.isRestPause) && idx > 0 ? "RP" : s.setNum}</span>
          </td>
          <td>
            <span class="prev-data-cell" title="Chạm để điền nhanh" data-weight="${s.previous ? s.previous.weightKg : ''}" data-reps="${s.previous ? s.previous.reps : ''}">
              ${prevDataStr}
            </span>
          </td>
          <td>
            <input type="number" step="0.5" inputmode="decimal" class="hevy-input input-kg" placeholder="kg" value="${s.weightKg !== undefined && s.weightKg !== '' ? s.weightKg : ''}">
          </td>
          <td>
            <input type="number" step="1" inputmode="numeric" class="hevy-input input-reps" placeholder="reps" value="${s.reps !== undefined && s.reps !== '' ? s.reps : ''}">
          </td>
          <td>
            <select class="hevy-select-rir select-rir">
              <option value="RIR 0" ${s.rir === "RIR 0" ? "selected" : ""}>RIR 0</option>
              <option value="RIR 0-1" ${s.rir === "RIR 0-1" ? "selected" : ""}>RIR 0-1</option>
              <option value="RIR 1" ${s.rir === "RIR 1" ? "selected" : ""}>RIR 1</option>
              <option value="RIR 1-2" ${s.rir === "RIR 1-2" ? "selected" : ""}>RIR 1-2</option>
              <option value="RIR 2" ${s.rir === "RIR 2" ? "selected" : ""}>RIR 2</option>
              <option value="Sub-fail" ${s.rir === "Sub-fail" ? "selected" : ""}>Sub-fail</option>
            </select>
          </td>
          <td>
            <button type="button" class="btn-set-check ${isDone ? "completed" : ""}" title="Đánh dấu hoàn thành set">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </td>
          <td>
            <button type="button" class="btn-del-set-row" title="Xóa set này">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        </tr>
      `;
    });

    const isSwapped = exercise.id !== originalEx.id;

    card.innerHTML = `
      <div class="hevy-exercise-header">
        <div class="hevy-exercise-title-wrap">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="hevy-exercise-name clickable" title="Xem chi tiết & lịch sử">${exercise.name} ℹ️</span>
            ${isSwapped ? `<span class="prog-badge" style="font-size: 9px; padding: 1px 5px;">Đã đổi</span>` : ""}
          </div>
          <span class="hevy-exercise-category">${exercise.category || "Compound"}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          ${exercise.isRestPause ? `<span class="rp-badge">Rest-Pause</span>` : ""}
          <button type="button" class="btn-swap-exercise" title="Đổi bài tập khác">🔄 Swap</button>
        </div>
      </div>

      <!-- DUAL BANNERS -->
      <div class="hevy-target-banner">
        🎯 <strong>Mục tiêu:</strong> ${targetText}
      </div>

      <div class="hevy-previous-banner">
        <span>⏱️ LẦN TRƯỚC</span>
        <span class="hevy-previous-val">${prevBannerText}</span>
      </div>

      <!-- HEVY SETS TABLE -->
      <table class="hevy-sets-table">
        <thead>
          <tr>
            <th>SET</th>
            <th>PREV</th>
            <th>KG</th>
            <th>REPS</th>
            <th>RIR</th>
            <th>✓</th>
            <th></th>
          </tr>
        </thead>
        <tbody class="hevy-sets-tbody">
          ${setsRowsHtml}
        </tbody>
      </table>

      <button type="button" class="btn-add-set">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        + Add Set
      </button>

      ${exercise.optionNote ? `<div class="exercise-alt-footer">💡 ${exercise.optionNote}</div>` : ""}
    `;

    // Bind Card Events
    this.bindHevyCardEvents(card, exercise, originalEx, day);

    return card;
  }

  bindHevyCardEvents(card, exercise, originalEx, day) {
    // 1. Click Exercise Name -> Open Detail Modal
    const nameEl = card.querySelector(".hevy-exercise-name.clickable");
    if (nameEl) {
      nameEl.addEventListener("click", () => this.openExerciseDetailModal(exercise));
    }

    // 2. Click Swap Button -> Open Swap Modal
    const btnSwap = card.querySelector(".btn-swap-exercise");
    if (btnSwap) {
      btnSwap.addEventListener("click", () => this.openSwapExerciseModal(originalEx));
    }

    // 3. Set Checkmark Button
    card.querySelectorAll(".btn-set-check").forEach(btn => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".hevy-set-row");
        const setIndex = parseInt(row.dataset.setIndex);
        const kgVal = row.querySelector(".input-kg").value.trim();
        const repsVal = row.querySelector(".input-reps").value.trim();
        const rirVal = row.querySelector(".select-rir").value;

        const kg = parseFloat(kgVal);
        const reps = parseInt(repsVal);

        const isCurrentlyCompleted = btn.classList.contains("completed");
        const nextState = !isCurrentlyCompleted;

        if (nextState && (isNaN(kg) || kg <= 0 || isNaN(reps) || reps <= 0)) {
          alert("Vui lòng nhập Mức tạ (kg) và Số Reps hợp lệ!");
          return;
        }

        const result = this.storage.updateSessionSet(
          this.activeProgram.id,
          this.currentWeek,
          day.dayIndex,
          exercise.id,
          setIndex,
          {
            weightKg: isNaN(kg) ? "" : kg,
            reps: isNaN(reps) ? "" : reps,
            rir: rirVal,
            isCompleted: nextState
          }
        );

        btn.classList.toggle("completed", nextState);
        row.classList.toggle("completed", nextState);

        if (nextState) {
          const isRp = (exercise.isRestPause || (result.setRecord && result.setRecord.isRestPause)) && setIndex > 0;

          if (result.progressStatus === "overload") {
            this.audio.playOverloadFanfare();
            this.audio.triggerConfetti();
            this.showToast(`🔥 KỶ LỤC MỚI (PR)! Overload thành công: ${kg}kg × ${reps} reps!`);
          } else if (result.progressStatus === "regression") {
            this.audio.playRegressionTone();
            this.showToast(`💪 Đã log: ${kg}kg × ${reps} reps. Giữ vững form chuẩn!`);
          } else {
            this.audio.playSetComplete();
            this.showToast(`✓ Set ${setIndex + 1}: ${kg}kg × ${reps} reps (@${rirVal})`);
          }

          // Trigger Auto-Rest Countdown Timer (15s for RP, 120s for strength, 60s for accessory)
          if (isRp) {
            this.startTimer(15, true);
          } else if (exercise.category && exercise.category.includes("Lower")) {
            this.startTimer(180, false);
          } else {
            this.startTimer(120, false);
          }
        }
      });
    });

    // 4. Trash / Delete Set Row Button
    card.querySelectorAll(".btn-del-set-row").forEach(btn => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".hevy-set-row");
        const setIndex = parseInt(row.dataset.setIndex);
        this.storage.deleteSessionSet(this.activeProgram.id, this.currentWeek, day.dayIndex, exercise.id, setIndex);
        this.renderWorkoutTab();
        this.showToast("Đã xóa 1 set.");
      });
    });

    // 5. Quick Copy Previous Metrics
    card.querySelectorAll(".prev-data-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const row = cell.closest(".hevy-set-row");
        const w = cell.dataset.weight;
        const r = cell.dataset.reps;
        if (w && r && row) {
          row.querySelector(".input-kg").value = w;
          row.querySelector(".input-reps").value = r;
          this.showToast(`Đã sao chép ${w}kg × ${r} reps!`);
        }
      });
    });

    // 6. "+ Add Set" button
    const btnAddSet = card.querySelector(".btn-add-set");
    if (btnAddSet) {
      btnAddSet.addEventListener("click", () => {
        this.storage.addSessionSet(this.activeProgram.id, this.currentWeek, day.dayIndex, exercise);
        this.renderWorkoutTab();
        this.showToast(`Đã thêm set mới cho bài ${exercise.name}`);
      });
    }
  }

  // Helper to compute formatted pace string (e.g. 5:41/km)
  calculatePace(distanceKm, durationMins) {
    if (!distanceKm || distanceKm <= 0 || !durationMins || durationMins <= 0) return "—";
    const totalSec = Math.round((durationMins * 60) / distanceKm);
    const pMin = Math.floor(totalSec / 60);
    const pSec = totalSec % 60;
    return `${pMin}:${pSec < 10 ? '0' : ''}${pSec}/km`;
  }

  // Create Running / Hybrid Session Card
  createHevyRunningCard(day) {
    const card = document.createElement("div");
    card.className = "hevy-run-card";

    const selectedOptId = this.storage.getSelectedOption(this.activeProgram.id, this.currentWeek, day.dayIndex);
    const draftRun = this.storage.getSessionRunData(this.activeProgram.id, this.currentWeek, day.dayIndex);

    const targetKm = day.targetKm || (day.runDetail ? day.runDetail.targetKm : 8.0);
    const initialKm = draftRun && draftRun.distanceKm ? draftRun.distanceKm : targetKm;
    const initialMins = draftRun && draftRun.durationMinutes ? draftRun.durationMinutes : (targetKm ? Math.round(targetKm * 5.75) : 45);
    const initialRpe = draftRun && draftRun.rpe ? draftRun.rpe : (day.rpe || "RPE 7 (Steady)");

    let optionsHtml = "";
    if (day.options && day.options.length > 0) {
      optionsHtml = `
        <div class="options-container">
          <div style="font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase;">
            Lựa chọn cự ly / cường độ hôm nay:
          </div>`;
      day.options.forEach((opt, oIdx) => {
        const isSelected = selectedOptId ? selectedOptId === opt.id : (oIdx === 0);
        optionsHtml += `
          <div class="option-box ${isSelected ? "selected" : ""}" data-opt-id="${opt.id}">
            <div class="option-box-header">
              <span class="option-title">${opt.title}</span>
              ${opt.rpe ? `<span class="option-rpe">${opt.rpe}</span>` : ""}
            </div>
            <div class="option-details">${opt.details}</div>
          </div>
        `;
      });
      optionsHtml += `</div>`;
    }

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 800; color: var(--text-white);">
            ${day.title}
          </h3>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <span style="font-size: 12px; color: var(--color-blue); font-weight: 700;">Mục tiêu: ${targetKm} km</span>
            <span id="cardLivePaceBadge" class="live-pace-badge">⚡ Pace: ${this.calculatePace(initialKm, initialMins)}</span>
          </div>
        </div>
        <span class="day-badge badge-run">${day.badge || 'RUN'}</span>
      </div>

      ${optionsHtml}

      <div style="background: var(--bg-card-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; margin-top: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 11.5px; font-weight: 800; color: var(--text-white); text-transform: uppercase;">
            Thông số buổi chạy (Distance & Pace):
          </span>
          <span style="font-size: 10.5px; color: var(--text-dim);">Tự động lưu vào buổi tập</span>
        </div>

        <div class="run-inputs-grid" style="grid-template-columns: 1fr 1fr 1.2fr; gap: 8px;">
          <div>
            <label style="display: block; font-size: 10.5px; color: var(--text-muted); margin-bottom: 4px;">CỰ LY (KM)</label>
            <input type="number" step="0.1" inputmode="decimal" class="hevy-input input-run-km" style="max-width: 100%;" placeholder="km" value="${initialKm || ''}">
          </div>
          <div>
            <label style="display: block; font-size: 10.5px; color: var(--text-muted); margin-bottom: 4px;">THỜI GIAN (PHÚT)</label>
            <input type="number" step="0.5" inputmode="decimal" class="hevy-input input-run-mins" style="max-width: 100%;" placeholder="phút" value="${initialMins || ''}">
          </div>
          <div>
            <label style="display: block; font-size: 10.5px; color: var(--text-muted); margin-bottom: 4px;">CƯỜNG ĐỘ (RPE)</label>
            <select class="hevy-select-rir select-run-rpe" style="width: 100%; height: 38px;">
              <option value="RPE 5 (Very Easy)" ${initialRpe.includes("RPE 5") ? "selected" : ""}>RPE 5 (Very Easy)</option>
              <option value="RPE 6 (Easy Zone 2)" ${initialRpe.includes("RPE 6") ? "selected" : ""}>RPE 6 (Easy Zone 2)</option>
              <option value="RPE 7 (Steady)" ${initialRpe.includes("RPE 7") ? "selected" : ""}>RPE 7 (Steady)</option>
              <option value="RPE 8 (Threshold)" ${initialRpe.includes("RPE 8") && !initialRpe.includes("8.5") ? "selected" : ""}>RPE 8 (Threshold)</option>
              <option value="RPE 8.5 (Hard Repeats)" ${initialRpe.includes("RPE 8.5") ? "selected" : ""}>RPE 8.5 (Hard Repeats)</option>
              <option value="RPE 9 (All Out Race)" ${initialRpe.includes("RPE 9") ? "selected" : ""}>RPE 9 (All Out Race)</option>
            </select>
          </div>
        </div>
      </div>
    `;

    // Real-time auto-save & pace calculation listeners
    const inputKm = card.querySelector(".input-run-km");
    const inputMins = card.querySelector(".input-run-mins");
    const selectRpe = card.querySelector(".select-run-rpe");
    const paceBadge = card.querySelector("#cardLivePaceBadge");

    const updateAndSaveRun = () => {
      const km = parseFloat(inputKm.value) || 0;
      const mins = parseFloat(inputMins.value) || 0;
      const rpe = selectRpe.value;
      const pace = this.calculatePace(km, mins);

      if (paceBadge) {
        paceBadge.textContent = `⚡ Pace: ${pace}`;
      }

      this.storage.setSessionRunData(this.activeProgram.id, this.currentWeek, day.dayIndex, {
        distanceKm: km,
        durationMinutes: mins,
        rpe: rpe,
        pace: pace
      });
    };

    inputKm.addEventListener("input", updateAndSaveRun);
    inputMins.addEventListener("input", updateAndSaveRun);
    selectRpe.addEventListener("change", updateAndSaveRun);

    // Initial draft save
    updateAndSaveRun();

    card.querySelectorAll(".option-box").forEach(box => {
      box.addEventListener("click", () => {
        const optId = box.dataset.optId;
        this.storage.setSelectedOption(this.activeProgram.id, this.currentWeek, day.dayIndex, optId);
        card.querySelectorAll(".option-box").forEach(b => b.classList.toggle("selected", b === box));
        this.showToast("Đã lưu lựa chọn bài tập!");
      });
    });

    return card;
  }

  // Create Soccer / Rest Day Card
  createHevyGameOrRestCard(day) {
    const card = document.createElement("div");
    card.className = "hevy-run-card";

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 800; color: var(--text-white);">
          ${day.title}
        </h3>
        <span class="day-badge ${day.type === 'game' ? 'badge-game' : 'badge-rest'}">${day.badge || 'DAY'}</span>
      </div>
      <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">
        ${day.details || day.focus}
      </p>
      <div class="checklist-container" style="margin-top: 6px;">
        ${(day.checklist || []).map(item => `
          <div class="checklist-item ${this.storage.isChecklistCompleted(item.id) ? 'done' : ''}" data-check-id="${item.id}">
            <div class="check-box-mini">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="checklist-text-wrap">
              <span class="checklist-label">${item.label}</span>
              <span class="checklist-subnote">${item.note || ''}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    card.querySelectorAll(".checklist-item").forEach(item => {
      item.addEventListener("click", () => {
        const checkId = item.dataset.checkId;
        const current = this.storage.isChecklistCompleted(checkId);
        this.storage.setChecklistCompleted(checkId, !current);
        item.classList.toggle("done", !current);
        if (!current) this.audio.playSetComplete();
      });
    });

    return card;
  }

  // =========================================================================
  // POST-WORKOUT SUMMARY CELEBRATION MODAL (Unified for Running & Strength)
  // =========================================================================
  openPostWorkoutSummary() {
    const weekData = this.activeProgram.weeks ? this.activeProgram.weeks[this.currentWeek] : null;
    const activeDay = weekData ? weekData.days[this.currentDayIndex] : null;
    if (!activeDay) return;

    let totalVol = 0;
    let totalSets = 0;
    let prCount = 0;
    const completedExercises = [];

    // 1. Gather Strength sets data
    if (activeDay.exercises && activeDay.exercises.length > 0) {
      const swappedMap = this.storage.getSwappedExercises(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);

      activeDay.exercises.forEach(origEx => {
        const ex = swappedMap[origEx.id] || origEx;
        const sets = this.storage.getSessionSets(this.activeProgram.id, this.currentWeek, activeDay.dayIndex, ex);
        const done = sets.filter(s => s.isCompleted);
        if (done.length > 0) {
          totalSets += done.length;
          done.forEach(s => {
            totalVol += (parseFloat(s.weightKg) || 0) * (parseInt(s.reps) || 0);
            if (s.progressStatus === "overload") prCount++;
          });
          completedExercises.push({
            name: ex.name,
            sets: `${done.length} sets (${done.map(s => `${s.weightKg}k × ${s.reps}`).join(", ")})`
          });
        }
      });
    }

    // 2. Gather Running metrics
    const runDraft = this.storage.getSessionRunData(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);
    const hasRun = activeDay.type === "run" || activeDay.type === "hybrid" || (runDraft && runDraft.distanceKm > 0);
    const runKm = runDraft && runDraft.distanceKm ? parseFloat(runDraft.distanceKm) : (activeDay.targetKm ? parseFloat(activeDay.targetKm) : 0);
    const runMins = runDraft && runDraft.durationMinutes ? parseFloat(runDraft.durationMinutes) : (runKm ? Math.round(runKm * 5.75) : 0);
    const runPace = runDraft && runDraft.pace && runDraft.pace !== "—" ? runDraft.pace : (runKm > 0 && runMins > 0 ? this.calculatePace(runKm, runMins) : "—");
    const runRpe = runDraft && runDraft.rpe ? runDraft.rpe : (activeDay.rpe || "RPE 7.0");

    // Stopwatch or run duration
    const durationMins = runKm > 0 && totalSets === 0 && runMins > 0
      ? Math.round(runMins)
      : Math.max(1, Math.round(this.stopwatchSeconds / 60));

    const notesText = this.storage.getSessionNotes(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);

    // Update Modal DOM
    const subtitleEl = document.getElementById("summaryWorkoutTitleSubtitle");
    if (subtitleEl) subtitleEl.textContent = `${activeDay.dayKey} • ${activeDay.title}`;

    const durEl = document.getElementById("summaryDuration");
    if (durEl) durEl.textContent = `${durationMins} phút`;

    // Dynamic Metric Cards Visibility
    const cardVol = document.getElementById("summaryMetricCardVolume");
    const cardSets = document.getElementById("summaryMetricCardSets");
    const cardPRs = document.getElementById("summaryMetricCardPRs");
    const cardDist = document.getElementById("summaryMetricCardDistance");
    const cardPace = document.getElementById("summaryMetricCardPace");

    const volEl = document.getElementById("summaryTotalVolume");
    const setsEl = document.getElementById("summaryTotalSets");
    const distEl = document.getElementById("summaryTotalDistance");
    const paceEl = document.getElementById("summaryAveragePace");
    const prEl = document.getElementById("summaryPrCount");

    if (hasRun && runKm > 0) {
      if (cardDist) cardDist.style.display = "flex";
      if (cardPace) cardPace.style.display = "flex";
      if (distEl) distEl.textContent = `${runKm} km`;
      if (paceEl) paceEl.textContent = runPace;

      if (totalSets === 0) {
        if (cardVol) cardVol.style.display = "none";
        if (cardSets) cardSets.style.display = "none";
        if (cardPRs) cardPRs.style.display = "none";
      } else {
        if (cardVol) cardVol.style.display = "flex";
        if (cardSets) cardSets.style.display = "flex";
        if (cardPRs) cardPRs.style.display = "flex";
        if (volEl) volEl.textContent = `${totalVol.toLocaleString()} kg`;
        if (setsEl) setsEl.textContent = `${totalSets} sets`;
        if (prEl) prEl.textContent = `${prCount} PRs`;
      }
    } else {
      if (cardDist) cardDist.style.display = "none";
      if (cardPace) cardPace.style.display = "none";
      if (cardVol) cardVol.style.display = "flex";
      if (cardSets) cardSets.style.display = "flex";
      if (cardPRs) cardPRs.style.display = "flex";
      if (volEl) volEl.textContent = `${totalVol.toLocaleString()} kg`;
      if (setsEl) setsEl.textContent = `${totalSets} sets`;
      if (prEl) prEl.textContent = `${prCount} PRs`;
    }

    const listEl = document.getElementById("summaryExercisesList");
    if (listEl) {
      let breakdownHtml = "";
      if (hasRun && runKm > 0) {
        breakdownHtml += `<div>🏃 <strong>Chạy bộ:</strong> ${runKm} km • ${runPace} (${runRpe})</div>`;
      }
      if (completedExercises.length > 0) {
        breakdownHtml += completedExercises.map(e => `<div>• <strong>${e.name}:</strong> ${e.sets}</div>`).join("");
      }
      if (!breakdownHtml) {
        breakdownHtml = `<div>• Hoàn thành buổi tập theo giáo án.</div>`;
      }
      listEl.innerHTML = breakdownHtml;
    }

    const notesDisplayEl = document.getElementById("summaryNotesDisplay");
    if (notesDisplayEl) {
      notesDisplayEl.textContent = notesText ? `"${notesText}"` : "Không có ghi chú.";
    }

    // Play Victory Fanfare and confetti
    this.audio.playVictoryFanfare();
    this.audio.triggerConfetti();

    this.openModal("modalWorkoutSummary");
  }

  handleConfirmSaveWorkout() {
    const weekData = this.activeProgram.weeks ? this.activeProgram.weeks[this.currentWeek] : null;
    const activeDay = weekData ? weekData.days[this.currentDayIndex] : null;

    let totalVol = 0;
    let totalSets = 0;
    let prCount = 0;
    const exerciseRecords = [];

    // 1. Gather Strength sets
    if (activeDay && activeDay.exercises) {
      const swappedMap = this.storage.getSwappedExercises(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);
      activeDay.exercises.forEach(origEx => {
        const ex = swappedMap[origEx.id] || origEx;
        const sets = this.storage.getSessionSets(this.activeProgram.id, this.currentWeek, activeDay.dayIndex, ex);
        const completedSets = sets.filter(s => s.isCompleted);
        if (completedSets.length > 0) {
          totalSets += completedSets.length;
          completedSets.forEach(s => {
            totalVol += (parseFloat(s.weightKg) || 0) * (parseInt(s.reps) || 0);
            if (s.progressStatus === "overload") prCount++;
          });
          exerciseRecords.push({
            name: ex.name,
            sets: `${completedSets.length} sets (${completedSets.map(s => `${s.weightKg}k × ${s.reps}`).join(", ")})`
          });
        }
      });
    }

    // 2. Gather Running metrics
    const runDraft = this.storage.getSessionRunData(this.activeProgram.id, this.currentWeek, activeDay ? activeDay.dayIndex : 0);
    const hasRun = activeDay && (activeDay.type === "run" || activeDay.type === "hybrid" || (runDraft && runDraft.distanceKm > 0));
    const runKm = runDraft && runDraft.distanceKm ? parseFloat(runDraft.distanceKm) : (activeDay && activeDay.targetKm ? parseFloat(activeDay.targetKm) : 0);
    const runMins = runDraft && runDraft.durationMinutes ? parseFloat(runDraft.durationMinutes) : (runKm ? Math.round(runKm * 5.75) : 0);
    const runPace = runDraft && runDraft.pace && runDraft.pace !== "—" ? runDraft.pace : (runKm > 0 && runMins > 0 ? this.calculatePace(runKm, runMins) : "—");
    const runRpe = runDraft && runDraft.rpe ? runDraft.rpe : (activeDay ? activeDay.rpe : "RPE 7.0");

    const finalDuration = runKm > 0 && totalSets === 0 && runMins > 0
      ? Math.round(runMins)
      : Math.max(1, Math.round(this.stopwatchSeconds / 60));

    const notesText = this.storage.getSessionNotes(this.activeProgram.id, this.currentWeek, activeDay ? activeDay.dayIndex : 0);

    // Archive unified session to permanent history
    this.storage.archiveWorkoutSession({
      programId: this.activeProgram.id,
      programName: this.activeProgram.name,
      weekId: this.currentWeek,
      dayKey: activeDay ? activeDay.dayKey : "T2",
      dayTitle: activeDay ? activeDay.title : "Workout",
      date: new Date().toISOString().split("T")[0],
      durationMinutes: finalDuration,
      totalVolumeKg: totalVol,
      totalSetsCount: totalSets,
      totalDistanceKm: runKm,
      prCount: prCount,
      notes: notesText,
      exercises: exerciseRecords,
      runDetail: runKm > 0 ? {
        distanceKm: runKm,
        durationMinutes: finalDuration,
        pace: runPace,
        rpe: runRpe
      } : null,
      type: activeDay ? (activeDay.type || (runKm > 0 && totalSets > 0 ? "hybrid" : runKm > 0 ? "run" : "strength")) : "workout"
    });

    this.storage.setDayCompleted(this.activeProgram.id, this.currentWeek, this.currentDayIndex, true);
    this.resetStopwatch();
    this.closeAllModals();

    this.renderWorkoutTab();
    this.renderHistoryTab();

    const toastMsg = runKm > 0 && totalVol > 0
      ? `🏆 Đã lưu buổi tập Hybrid: ${runKm}km chạy + ${totalVol.toLocaleString()}kg tạ!`
      : runKm > 0
        ? `🏃 Đã lưu buổi chạy ${runKm}km (Pace ${runPace}) vào Lịch sử!`
        : `🏆 Đã lưu buổi tập tạ: ${totalVol.toLocaleString()}kg (${totalSets} sets)!`;

    this.showToast(toastMsg);
  }

  // =========================================================================
  // EXERCISE DETAIL & SWAP MODALS
  // =========================================================================
  openExerciseDetailModal(exercise) {
    this.selectedExerciseForDetail = exercise;
    const detailData = (this.data.exerciseDetails && this.data.exerciseDetails[exercise.id]) || {
      name: exercise.name,
      category: exercise.category || "Compound",
      primaryMuscles: "Cơ toàn thân",
      formCues: "Kiểm soát chuyển động và giữ vững RIR.",
      progressionTip: "Tăng tạ khi đạt đủ số reps ở set cuối."
    };

    const nameEl = document.getElementById("modalExDetailName");
    if (nameEl) nameEl.textContent = detailData.name;

    const catEl = document.getElementById("modalExDetailCategory");
    if (catEl) catEl.textContent = detailData.category;

    const targetEl = document.getElementById("modalExDetailTarget");
    if (targetEl) targetEl.textContent = exercise.targetRequirement || "2 sets × 6-10 reps @ RIR 0-1";

    const musclesEl = document.getElementById("modalExDetailMuscles");
    if (musclesEl) musclesEl.textContent = detailData.primaryMuscles;

    const cuesEl = document.getElementById("modalExDetailCues");
    if (cuesEl) cuesEl.innerHTML = `${detailData.formCues}<br><br><strong>Tiêu chuẩn Overload:</strong> ${detailData.progressionTip}`;

    // Render Past Performance Log
    const historyList = document.getElementById("exerciseDetailHistoryList");
    const history = this.storage.getLiftHistory(exercise.id);

    if (historyList) {
      if (history.length === 0) {
        historyList.innerHTML = `<div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 10px;">Chưa có dữ liệu lịch sử cho bài này.</div>`;
      } else {
        historyList.innerHTML = history.slice(0, 6).map(item => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px;">
            <div>
              <span style="font-weight: 800; color: var(--text-white);">${item.weightKg} kg</span>
              <span style="color: var(--text-muted);">× ${item.reps} reps</span>
              <span style="font-size: 10px; color: var(--color-amber); margin-left: 4px;">(${item.rir})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--color-green);">e1RM: ${item.e1rm}k</span>
              <span style="font-size: 10.5px; color: var(--text-dim);">${item.date}</span>
            </div>
          </div>
        `).join("");
      }
    }

    // Render Canvas Chart
    if (window.DinoCharts) {
      setTimeout(() => {
        window.DinoCharts.renderOverloadChart("canvasExerciseDetail", history, detailData.name);
      }, 100);
    }

    this.openModal("modalExerciseDetail");
  }

  openSwapExerciseModal(originalEx) {
    this.selectedExerciseForSwap = originalEx;
    const titleEl = document.getElementById("swapCurrentExTitle");
    if (titleEl) titleEl.textContent = `Đang đổi bài: ${originalEx.name}`;

    const container = document.getElementById("swapOptionsListContainer");
    if (!container) return;

    const detailData = this.data.exerciseDetails ? this.data.exerciseDetails[originalEx.id] : null;
    const swaps = (detailData && detailData.swaps) ? detailData.swaps : [
      { id: "leg_press", name: "Leg Press", category: "Lower", reason: "Bài tập thay thế an toàn cho khớp gối/cột sống" },
      { id: "lat_pulldown", name: "Lat Pulldown", category: "Upper", reason: "Điều chỉnh mức tạ chính xác theo reps" }
    ];

    container.innerHTML = "";
    swaps.forEach(opt => {
      const card = document.createElement("div");
      card.className = "swap-option-card";
      card.innerHTML = `
        <div class="swap-opt-header">
          <span class="swap-opt-name">${opt.name}</span>
          <span class="day-badge badge-run" style="font-size: 9.5px;">${opt.category}</span>
        </div>
        <div class="swap-reason">💡 ${opt.reason}</div>
      `;

      card.addEventListener("click", () => {
        const replacementEx = {
          ...originalEx,
          id: opt.id,
          name: opt.name,
          category: opt.category,
          isSwapped: true
        };
        this.storage.swapSessionExercise(this.activeProgram.id, this.currentWeek, this.currentDayIndex, originalEx.id, replacementEx);
        this.closeAllModals();
        this.renderWorkoutTab();
        this.showToast(`Đã đổi sang bài: ${opt.name}! 🔄`);
      });

      container.appendChild(card);
    });

    this.openModal("modalSwapExercise");
  }

  // =========================================================================
  // TAB 3: AI COACH INTERFACE & CHAT CONTROLLER
  // =========================================================================
  renderAICoachTab() {
    this.renderAIQuickPrompts();
    this.renderAIChatMessages();
  }

  renderAIQuickPrompts() {
    if (!this.aiQuickPromptsContainer || !this.data.aiCoachPrompts) return;
    this.aiQuickPromptsContainer.innerHTML = "";

    this.data.aiCoachPrompts.forEach(p => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ai-prompt-chip";
      chip.textContent = p.label;
      chip.addEventListener("click", () => {
        this.sendAICoachQuery(p.prompt);
      });
      this.aiQuickPromptsContainer.appendChild(chip);
    });
  }

  formatMarkdown(text) {
    if (!text) return "";
    let html = text;
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bullet lists
    html = html.replace(/^\s*[-•]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    // Paragraphs / Line breaks
    html = html.replace(/\n\n+/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  renderAIChatMessages() {
    if (!this.aiChatHistoryContainer) return;
    const history = this.storage.getAIChatHistory();

    if (history.length === 0) {
      this.aiChatHistoryContainer.innerHTML = `
        <div class="ai-msg-row">
          <div class="ai-bubble assistant">
            <h3>⚡ Xin chào Athlete!</h3>
            Tôi là <strong>Dino AI Coach</strong> (Trợ lý 2-trong-1). Tôi có thể phân tích dữ liệu tập luyện cá nhân (tạ, chạy, ghi chú) và giải đáp mọi câu hỏi về dinh dưỡng, biomechanics, RIR hay chiến thuật Half-Marathon Sub-2!
          </div>
        </div>
      `;
      return;
    }

    this.aiChatHistoryContainer.innerHTML = history.map(msg => `
      <div class="ai-msg-row ${msg.role === 'user' ? 'user' : ''}">
        <div class="ai-bubble ${msg.role === 'user' ? 'user' : 'assistant ai-msg-bubble'}">
          ${msg.role === 'user' ? msg.content.replace(/\n/g, '<br>') : this.formatMarkdown(msg.content)}
        </div>
      </div>
    `).join("");

    this.aiChatHistoryContainer.scrollTop = this.aiChatHistoryContainer.scrollHeight;
  }

  async sendAICoachQuery(queryText) {
    if (!queryText || !queryText.trim()) return;

    const history = this.storage.getAIChatHistory();
    history.push({ role: "user", content: queryText });
    this.storage.saveAIChatHistory(history);
    this.renderAIChatMessages();

    // Show typing placeholder
    if (this.aiChatHistoryContainer) {
      const typingRow = document.createElement("div");
      typingRow.className = "ai-msg-row typing-row";
      typingRow.innerHTML = `<div class="ai-bubble assistant"><em>Coach đang phân tích dữ liệu... ⚡</em></div>`;
      this.aiChatHistoryContainer.appendChild(typingRow);
      this.aiChatHistoryContainer.scrollTop = this.aiChatHistoryContainer.scrollHeight;
    }

    const response = await this.aiCoach.generateResponse(queryText);

    // Save Assistant Response
    const updatedHistory = this.storage.getAIChatHistory();
    updatedHistory.push({ role: "assistant", content: response });
    this.storage.saveAIChatHistory(updatedHistory);
    this.renderAIChatMessages();
  }

  handleSendAIChat() {
    if (!this.inputAIChat) return;
    const text = this.inputAIChat.value.trim();
    if (!text) return;
    this.inputAIChat.value = "";
    this.sendAICoachQuery(text);
  }

  // =========================================================================
  // TAB 2: HISTORY & MONTH CALENDAR
  // =========================================================================
  renderHistoryTab() {
    this.renderCalendarMonth();
    this.renderHistoryStats();
    this.renderHistoryCards();
  }

  changeCalMonth(delta) {
    this.calMonth += delta;
    if (this.calMonth < 0) {
      this.calMonth = 11;
      this.calYear -= 1;
    } else if (this.calMonth > 11) {
      this.calMonth = 0;
      this.calYear += 1;
    }
    this.renderCalendarMonth();
  }

  renderCalendarMonth() {
    if (!this.calMonthTitle || !this.calendarDaysGrid) return;

    const monthNames = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    this.calMonthTitle.textContent = `${monthNames[this.calMonth]}, ${this.calYear}`;

    const workoutDates = this.storage.getWorkoutDatesForMonth(this.calYear, this.calMonth);

    const firstDay = new Date(this.calYear, this.calMonth, 1).getDay();
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.calYear, this.calMonth, 0).getDate();

    const leadingDays = firstDay === 0 ? 6 : firstDay - 1;

    this.calendarDaysGrid.innerHTML = "";

    for (let i = leadingDays - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const cell = document.createElement("div");
      cell.className = "cal-day-cell other-month";
      cell.textContent = dayNum;
      this.calendarDaysGrid.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = (this.calMonth + 1 < 10 ? "0" : "") + (this.calMonth + 1);
      const dayStr = (d < 10 ? "0" : "") + d;
      const dateStr = `${this.calYear}-${monthStr}-${dayStr}`;

      const hasWorkout = workoutDates.has(dateStr);
      const isSelected = this.calFilterDate === dateStr;

      const cell = document.createElement("div");
      cell.className = `cal-day-cell ${isSelected ? "selected" : ""}`;
      cell.innerHTML = `
        <span>${d}</span>
        ${hasWorkout ? `<span class="cal-dot"></span>` : ""}
      `;

      cell.addEventListener("click", () => {
        if (this.calFilterDate === dateStr) {
          this.calFilterDate = null;
          this.showToast("Đã bỏ lọc ngày. Hiển thị tất cả!");
        } else {
          this.calFilterDate = dateStr;
          this.showToast(`Đang lọc nhật ký ngày: ${dayStr}/${monthStr}/${this.calYear}`);
        }
        this.renderHistoryTab();
      });

      this.calendarDaysGrid.appendChild(cell);
    }
  }

  renderHistoryStats() {
    const stats = this.storage.getHistoryStats();
    if (this.statTotalWorkouts) this.statTotalWorkouts.textContent = stats.totalWorkouts;
    if (this.statTotalVolume) this.statTotalVolume.textContent = `${stats.totalVolumeKg.toLocaleString()} kg`;
    if (this.statTotalKm) this.statTotalKm.textContent = `${stats.totalDistanceKm} km`;
  }

  renderHistoryCards() {
    if (!this.historyCardsContainer) return;

    if (this.historySelectedDateFilter) {
      if (this.calFilterDate) {
        const parts = this.calFilterDate.split("-");
        this.historySelectedDateFilter.innerHTML = `Ngày: ${parts[2]}/${parts[1]}/${parts[0]} <span style="cursor:pointer; text-decoration: underline;">[✕ Bỏ lọc]</span>`;
      } else {
        this.historySelectedDateFilter.textContent = "Tất cả các buổi";
      }
    }

    let history = this.storage.getWorkoutHistory();
    if (this.calFilterDate) {
      history = history.filter(h => h.date === this.calFilterDate);
    }

    if (history.length === 0) {
      this.historyCardsContainer.innerHTML = `
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 28px 16px; text-align: center; color: var(--text-dim); font-size: 13px;">
          Chưa có nhật ký buổi tập nào ${this.calFilterDate ? 'trong ngày đã chọn' : ''}.<br>
          Hãy hoàn thành buổi tập đầu tiên ở tab <strong>Workout</strong>!
        </div>
      `;
      return;
    }

    this.historyCardsContainer.innerHTML = "";
    history.forEach(h => {
      const card = document.createElement("div");
      card.className = "history-session-card";

      let exercisesHtml = "";
      if (h.exercises && h.exercises.length > 0) {
        exercisesHtml = `
          <div class="hist-exercises-summary">
            ${h.exercises.map(ex => `<div>• <strong>${ex.name}:</strong> ${ex.sets}</div>`).join("")}
          </div>
        `;
      } else if (h.runDetail) {
        exercisesHtml = `
          <div class="hist-exercises-summary">
            <div>🏃 <strong>Chạy bộ:</strong> ${h.runDetail.distanceKm} km • ${h.runDetail.pace || ''} (${h.runDetail.rpe || ''})</div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="hist-card-top">
          <div>
            <span style="font-size: 11px; font-weight: 800; color: var(--red-primary);">${h.dayKey} • ${h.programName || 'Dino Hybrid'}</span>
            <div class="hist-workout-name">${h.dayTitle}</div>
          </div>
          <span class="hist-date-tag">${h.date}</span>
        </div>

        <div class="hist-metrics-pills">
          <span class="hist-pill">⏱️ ${h.durationMinutes || 50}m</span>
          ${h.totalVolumeKg > 0 ? `<span class="hist-pill" style="color: var(--color-green);">⚖️ ${h.totalVolumeKg.toLocaleString()} kg</span>` : ""}
          ${h.totalSetsCount > 0 ? `<span class="hist-pill">🔢 ${h.totalSetsCount} sets</span>` : ""}
          ${h.totalDistanceKm > 0 ? `<span class="hist-pill" style="color: var(--color-blue);">🏃 ${h.totalDistanceKm} km</span>` : ""}
          ${h.prCount > 0 ? `<span class="hist-pill" style="color: var(--color-gold); border-color: rgba(255,215,0,0.3);">⚡ ${h.prCount} PRs</span>` : ""}
        </div>

        ${exercisesHtml}

        ${h.notes ? `
          <div style="font-size: 12px; color: var(--text-muted); font-style: italic; background: var(--bg-card-elevated); padding: 8px 10px; border-radius: var(--radius-sm); margin-top: 4px;">
            📝 "${h.notes}"
          </div>
        ` : ""}

        <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
          <button class="btn-del-hist" style="background: transparent; border: none; color: var(--text-dim); font-size: 11px; cursor: pointer; padding: 4px 8px;">
            Xóa nhật ký ✕
          </button>
        </div>
      `;

      card.querySelector(".btn-del-hist").addEventListener("click", () => {
        if (confirm("Bạn có chắc chắn muốn xóa bản ghi nhật ký này?")) {
          this.storage.deleteHistoryRecord(h.id);
          this.renderHistoryTab();
          this.showToast("Đã xóa bản ghi nhật ký.");
        }
      });

      this.historyCardsContainer.appendChild(card);
    });
  }

  // =========================================================================
  // TAB 4: PROGRAMS & CUSTOM PROGRAM BUILDER
  // =========================================================================
  renderProgramsTab() {
    if (!this.programsListContainer) return;

    const programs = this.storage.getPrograms();
    const activeProgId = this.storage.getActiveProgramId();

    this.programsListContainer.innerHTML = "";

    programs.forEach(prog => {
      const isActive = prog.id === activeProgId;
      const card = document.createElement("div");
      card.className = `program-card ${isActive ? "active" : ""}`;

      card.innerHTML = `
        <div class="prog-card-header">
          <div class="prog-title-row">
            <span class="prog-title">${prog.name}</span>
            ${prog.isBuiltIn ? `<span class="prog-badge">Mặc Định</span>` : `<span class="prog-badge" style="color: var(--color-blue); border-color: rgba(59,130,246,0.3); background: var(--color-blue-bg);">Tự Tạo</span>`}
          </div>
          ${isActive ? `<span style="font-size: 11px; font-weight: 800; color: var(--red-primary);">✓ Đang Tập</span>` : ""}
        </div>

        <div class="prog-desc">${prog.description || prog.philosophy || "Chương trình tập luyện cá nhân"}</div>

        <div style="font-size: 11.5px; color: var(--text-dim);">
          Chu kỳ: <strong>${prog.rotationWeeks || 1} Tuần</strong> • ${(prog.weeks ? Object.keys(prog.weeks).length : 1)} pha xoay vòng
        </div>

        <div class="prog-actions-row">
          ${!isActive ? `
            <button class="btn-day-action btn-activate-prog" style="font-size: 11.5px; padding: 6px 12px;">
              Kích Hoạt
            </button>
          ` : `
            <button class="btn-day-action secondary" style="font-size: 11.5px; padding: 6px 12px; pointer-events: none; opacity: 0.8;">
              ✓ Đang Kích Hoạt
            </button>
          `}
          <button class="btn-day-action secondary btn-clone-prog" style="font-size: 11.5px; padding: 6px 12px;">
            Nhân Bản
          </button>
          ${!prog.isBuiltIn ? `
            <button class="btn-day-action secondary btn-delete-prog" style="font-size: 11.5px; padding: 6px 12px; color: var(--red-primary);">
              Xóa
            </button>
          ` : ""}
        </div>
      `;

      const btnActivate = card.querySelector(".btn-activate-prog");
      if (btnActivate) {
        btnActivate.addEventListener("click", () => {
          this.storage.setActiveProgramId(prog.id);
          this.activeProgram = prog;
          this.showToast(`Đã kích hoạt giáo án: ${prog.name}!`);
          this.switchTab("workout");
        });
      }

      const btnClone = card.querySelector(".btn-clone-prog");
      if (btnClone) {
        btnClone.addEventListener("click", () => {
          const clonedProg = JSON.parse(JSON.stringify(prog));
          clonedProg.id = "custom_prog_" + Date.now();
          clonedProg.name = `${prog.name} (Bản Sao)`;
          clonedProg.isBuiltIn = false;
          this.storage.saveCustomProgram(clonedProg);
          this.renderProgramsTab();
          this.showToast(`Đã nhân bản giáo án: ${clonedProg.name}!`);
        });
      }

      const btnDelete = card.querySelector(".btn-delete-prog");
      if (btnDelete) {
        btnDelete.addEventListener("click", () => {
          if (confirm(`Bạn có chắc chắn muốn xóa giáo án "${prog.name}"?`)) {
            this.storage.deleteProgram(prog.id);
            this.renderProgramsTab();
            this.showToast("Đã xóa giáo án.");
          }
        });
      }

      this.programsListContainer.appendChild(card);
    });
  }

  handleCreateProgram() {
    const name = this.inputProgName.value.trim();
    const desc = this.inputProgDesc.value.trim();
    const rotationWeeks = parseInt(this.selectProgRotation.value) || 1;

    if (!name) {
      alert("Vui lòng nhập tên giáo án!");
      return;
    }

    const defaultTemplate = window.DEFAULT_PROGRAMS ? window.DEFAULT_PROGRAMS[0] : null;
    let weeksObj = {};

    if (rotationWeeks === 2 && defaultTemplate && defaultTemplate.weeks) {
      weeksObj = JSON.parse(JSON.stringify(defaultTemplate.weeks));
    } else if (defaultTemplate && defaultTemplate.weeks && defaultTemplate.weeks.A) {
      weeksObj = {
        A: JSON.parse(JSON.stringify(defaultTemplate.weeks.A))
      };
    } else {
      weeksObj = {
        A: {
          id: "A",
          title: "Tuần 1 — Khởi động & Sức mạnh",
          targetKm: 15,
          days: [
            { dayIndex: 0, dayKey: "T2", title: "Upper Body", type: "strength", badge: "Upper", exercises: [] },
            { dayIndex: 1, dayKey: "T3", title: "Lower Body", type: "strength", badge: "Lower", exercises: [] },
            { dayIndex: 2, dayKey: "T4", title: "Easy Run", type: "run", badge: "Easy Run", targetKm: 5.0 },
            { dayIndex: 3, dayKey: "T5", title: "Full Body", type: "strength", badge: "Full Body", exercises: [] },
            { dayIndex: 4, dayKey: "T6", title: "Long Run", type: "run", badge: "Long Run", targetKm: 10.0 },
            { dayIndex: 5, dayKey: "T7", title: "Match / Game", type: "game", badge: "Match", details: "Thể thao tự do" },
            { dayIndex: 6, dayKey: "CN", title: "Rest Day", type: "rest", badge: "Rest", details: "Nghỉ ngơi hồi phục" }
          ]
        }
      };
    }

    const newProg = {
      id: "custom_prog_" + Date.now(),
      name: name,
      description: desc || "Giáo án cá nhân tùy biến",
      rotationWeeks: rotationWeeks,
      isBuiltIn: false,
      weeks: weeksObj
    };

    this.storage.saveCustomProgram(newProg);
    this.storage.setActiveProgramId(newProg.id);
    this.activeProgram = newProg;

    this.closeAllModals();
    this.formProgramBuilder.reset();
    this.showToast(`🎉 Đã tạo và kích hoạt giáo án: ${name}!`);
    this.switchTab("workout");
  }

  // =========================================================================
  // TAB 5: RECOVERY RULES & KNOWLEDGE MATRIX
  // =========================================================================
  renderRecoveryTab() {
    if (this.recoveryRulesList && this.data.smartRecoveryRules) {
      this.recoveryRulesList.innerHTML = "";
      this.data.smartRecoveryRules.forEach(r => {
        const el = document.createElement("div");
        el.className = "rule-card";
        el.innerHTML = `
          <div class="rule-header">
            <span class="rule-condition">⚡ ${r.condition}</span>
            <span class="rule-badge ${r.badgeClass || 'badge-warning'}">${r.badge}</span>
          </div>
          <div class="rule-action">${r.action}</div>
        `;
        this.recoveryRulesList.appendChild(el);
      });
    }

    if (this.priorityListEl && this.data.priorityHierarchy) {
      this.priorityListEl.innerHTML = "";
      this.data.priorityHierarchy.forEach(p => {
        const el = document.createElement("div");
        el.className = "priority-item";
        el.textContent = p;
        this.priorityListEl.appendChild(el);
      });
    }

    if (this.matrixTableBody && this.data.muscleMatrix) {
      this.matrixTableBody.innerHTML = "";
      this.data.muscleMatrix.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="primary">${row.group}</td>
          <td>${row.weekA}</td>
          <td>${row.weekB}</td>
          <td style="font-size: 11px; color: var(--text-dim);">${row.note}</td>
        `;
        this.matrixTableBody.appendChild(tr);
      });
    }

    if (this.checkpointsContainer && this.data.reviewCheckpoints) {
      this.checkpointsContainer.innerHTML = "";
      this.data.reviewCheckpoints.forEach(cp => {
        const el = document.createElement("div");
        el.className = "rule-card";
        el.style.borderLeftColor = "var(--color-blue)";
        el.innerHTML = `
          <div class="rule-header">
            <span class="rule-condition" style="color: var(--color-blue);">📅 ${cp.timeframe}</span>
          </div>
          <div class="rule-action">${cp.action}</div>
        `;
        this.checkpointsContainer.appendChild(el);
      });
    }
  }

  // =========================================================================
  // REST TIMER HUD ENGINE
  // =========================================================================
  startTimer(durationSeconds, isRestPause = false) {
    this.stopTimer();
    this.timerSecondsLeft = durationSeconds;
    this.isTimerRP = isRestPause;

    if (this.timerTitleText) {
      this.timerTitleText.textContent = isRestPause ? "⚡ REST-PAUSE (15s)" : "⏱️ NGHỈ GIỮA SET";
    }

    if (this.timerHudPill) {
      this.timerHudPill.classList.add("visible");
    }

    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timerSecondsLeft -= 1;
      this.updateTimerDisplay();

      if (this.timerSecondsLeft === 3 || this.timerSecondsLeft === 2 || this.timerSecondsLeft === 1) {
        this.audio.playWarningTick();
      } else if (this.timerSecondsLeft <= 0) {
        this.audio.playTimerDone();
        this.showToast("⏰ Hết giờ nghỉ! Sẵn sàng cho set tiếp theo!");
        this.stopTimer();
      }
    }, 1000);
  }

  addTimerSeconds(sec) {
    this.timerSecondsLeft += sec;
    this.updateTimerDisplay();
    this.showToast(`+${sec}s vào thời gian nghỉ`);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.timerHudPill) {
      this.timerHudPill.classList.remove("visible");
    }
  }

  updateTimerDisplay() {
    if (!this.timerTimeText) return;
    const mins = Math.floor(Math.max(0, this.timerSecondsLeft) / 60);
    const secs = Math.max(0, this.timerSecondsLeft) % 60;
    this.timerTimeText.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // =========================================================================
  // MODALS & SETTINGS CONTROLLER
  // =========================================================================
  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add("open");
  }

  closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
  }

  openSettingsModal() {
    const modal = document.getElementById("modalSettings");
    if (!modal) return;

    const settings = this.storage.getSettings();
    const soundToggle = document.getElementById("settingSound");
    const vibrateToggle = document.getElementById("settingVibrate");
    if (soundToggle) {
      soundToggle.checked = settings.sound !== false;
      soundToggle.onchange = () => this.storage.updateSettings({ sound: soundToggle.checked });
    }
    if (vibrateToggle) {
      vibrateToggle.checked = settings.vibrate !== false;
      vibrateToggle.onchange = () => this.storage.updateSettings({ vibrate: vibrateToggle.checked });
    }
    // Supabase Cloud Sync settings in modal
    const inputCloudAthleteId = document.getElementById("inputCloudAthleteId");
    const btnSaveCloudAthleteId = document.getElementById("btnSaveCloudAthleteId");
    if (inputCloudAthleteId && this.supabaseSync) {
      inputCloudAthleteId.value = this.supabaseSync.getUserId();
      if (btnSaveCloudAthleteId) {
        btnSaveCloudAthleteId.onclick = () => {
          const val = (inputCloudAthleteId.value || "").trim();
          if (val) {
            this.supabaseSync.setUserId(val);
            this.showToast(`Đã đổi Athlete Sync ID thành: "${val}"`);
          }
        };
      }
    }

    const btnExportData = document.getElementById("btnExportData");
    if (btnExportData) {
      btnExportData.onclick = () => {
        const json = this.storage.exportAllData();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dino_tracking_backup_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("Đã tải file sao lưu JSON!");
      };
    }

    const fileImportInput = document.getElementById("fileImportInput");
    if (fileImportInput) {
      fileImportInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = this.storage.importData(event.target.result);
          if (res.success) {
            this.renderAll();
            this.showToast("Khôi phục dữ liệu thành công!");
            this.closeAllModals();
          } else {
            alert("Lỗi khôi phục: " + res.error);
          }
        };
        reader.readAsText(file);
      };
    }

    const btnSeedDemo = document.getElementById("btnSeedDemo");
    if (btnSeedDemo) {
      btnSeedDemo.onclick = () => {
        if (confirm("Nạp dữ liệu mẫu (các buổi tập, chạy bộ và benchmark) để trải nghiệm ứng dụng?")) {
          this.storage.seedDemoData();
          this.renderAll();
          this.showToast("Đã nạp dữ liệu mẫu thành công!");
          this.closeAllModals();
        }
      };
    }

    modal.classList.add("open");
  }

  // Toast Notification
  showToast(msg) {
    if (!this.toastBox) return;
    this.toastBox.innerHTML = msg;
    this.toastBox.classList.add("show");

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastBox.classList.remove("show");
    }, 2800);
  }
}

if (typeof window !== "undefined") {
  window.DinoApp = DinoApp;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DinoApp;
}
