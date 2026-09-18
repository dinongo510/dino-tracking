/**
 * Dino Tracking - Principal Application Controller (v6.0)
 * 4-Tab Hevy-Style Hybrid Fitness Architecture:
 * Tab 1: Workout (Hevy Sets Table, Rest/RP Timer, Pace Calc, Plate Calc, Muscle Heatmap, For Time Circuit)
 * Tab 2: Stats & Progress (Dynamic Recalculation, Canvas Charts, Calendar, History Deletion)
 * Tab 3: Exercises & CrossFit WOD Roulette (100+ WODs, Physics Canvas Spinner, Library)
 * Tab 4: Rules & Recovery (Smart Fatigue, Frequency Matrix, Priority Hierarchy)
 */

document.addEventListener("DOMContentLoaded", () => {
  window.dinoApp = new DinoApp();
});

class DinoApp {
  constructor() {
    this.storage = window.dinoStorage;
    this.audio = window.dinoAudio;
    this.timer = window.dinoTimer;
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

    // Stats Timeframe Filter ('all', 'month', 'week')
    this.statsFilter = "all";
    this.selectedChartLift = "pin_squat";

    // Calendar state
    const today = new Date();
    this.calYear = today.getFullYear();
    this.calMonth = today.getMonth();
    this.calFilterDate = null;

    // Roulette state
    this.rouletteWODs = window.CROSSFIT_WOD_DATABASE || [];
    this.isSpinning = false;
    this.rouletteRotation = 0;
    this.selectedWOD = null;

    // Active Exercise Modal State
    this.selectedExerciseForDetail = null;
    this.selectedExerciseForSwap = null;

    this.initElements();
    this.bindEvents();
    this.initRouletteWheel();
    this.renderAll();

    // Init Supabase background sync
    if (this.supabaseSync) {
      this.supabaseSync.init();
    }
  }

  initElements() {
    // 4-Tab Bottom Navigation
    this.navBtns = document.querySelectorAll(".nav-item-btn");
    this.tabContents = document.querySelectorAll(".tab-content");

    // Header buttons
    this.headerProgramSubtitle = document.getElementById("headerProgramSubtitle");
    this.btnHeaderAICoach = document.getElementById("btnHeaderAICoach");
    this.btnHeaderPrograms = document.getElementById("btnHeaderPrograms");
    this.cloudSyncBadge = document.getElementById("cloudSyncBadge");
    this.cloudSyncText = document.getElementById("cloudSyncText");
    this.btnHeaderSettings = document.getElementById("btnHeaderSettings");

    // Tab 1: Workout Elements
    this.activeProgramNameText = document.getElementById("activeProgramNameText");
    this.btnSwitchProgramDirect = document.getElementById("btnSwitchProgramDirect");
    this.weekToggleContainer = document.getElementById("weekToggleContainer");
    this.btnWeekA = document.getElementById("btnWeekA");
    this.btnWeekB = document.getElementById("btnWeekB");
    this.dayChipsContainer = document.getElementById("dayChipsContainer");
    this.heroDayTag = document.getElementById("heroDayTag");
    this.btnToggleMuscleHeatmap = document.getElementById("btnToggleMuscleHeatmap");
    this.heroHeatmapContainer = document.getElementById("heroHeatmapContainer");
    this.btnCloseHeroHeatmap = document.getElementById("btnCloseHeroHeatmap");
    this.heroWorkoutTitle = document.getElementById("heroWorkoutTitle");
    this.heroWorkoutFocus = document.getElementById("heroWorkoutFocus");
    this.workoutStartOverlay = document.getElementById("workoutStartOverlay");
    this.btnStartWorkoutSession = document.getElementById("btnStartWorkoutSession");
    this.activeStopwatchCluster = document.getElementById("activeStopwatchCluster");
    this.workoutStopwatchText = document.getElementById("workoutStopwatchText");
    this.btnPauseWorkout = document.getElementById("btnPauseWorkout");
    this.btnFinishWorkout = document.getElementById("btnFinishWorkout");
    this.workoutExercisesContainer = document.getElementById("workoutExercisesContainer");
    this.inputWorkoutNotes = document.getElementById("inputWorkoutNotes");
    this.notesSavedTag = document.getElementById("notesSavedTag");

    // Tab 2: Stats Elements
    this.timeframeBtns = document.querySelectorAll(".timeframe-btn");
    this.statSummaryVolume = document.getElementById("statSummaryVolume");
    this.statSummaryDistance = document.getElementById("statSummaryDistance");
    this.statSummaryWorkouts = document.getElementById("statSummaryWorkouts");
    this.statSummaryPRs = document.getElementById("statSummaryPRs");
    this.selectChartExercise = document.getElementById("selectChartExercise");
    this.calMonthTitle = document.getElementById("calMonthTitle");
    this.btnCalPrevMonth = document.getElementById("btnCalPrevMonth");
    this.btnCalNextMonth = document.getElementById("btnCalNextMonth");
    this.calendarDaysGrid = document.getElementById("calendarDaysGrid");
    this.historySelectedDateFilter = document.getElementById("historySelectedDateFilter");
    this.historyCardsContainer = document.getElementById("historyCardsContainer");

    // Tab 3: Exercises & Roulette Elements
    this.subnavBtnLibrary = document.getElementById("subnavBtnLibrary");
    this.subnavBtnRoulette = document.getElementById("subnavBtnRoulette");
    this.sectionExerciseLibrary = document.getElementById("sectionExerciseLibrary");
    this.sectionWODRoulette = document.getElementById("sectionWODRoulette");
    this.inputSearchExercise = document.getElementById("inputSearchExercise");
    this.selectMuscleFilter = document.getElementById("selectMuscleFilter");
    this.selectEquipmentFilter = document.getElementById("selectEquipmentFilter");
    this.exerciseLibraryGrid = document.getElementById("exerciseLibraryGrid");
    this.canvasRouletteWheel = document.getElementById("canvasRouletteWheel");
    this.btnSpinRoulette = document.getElementById("btnSpinRoulette");
    this.landedWODCard = document.getElementById("landedWODCard");
    this.btnLoadWodToWorkout = document.getElementById("btnLoadWodToWorkout");
    this.btnSpinAgain = document.getElementById("btnSpinAgain");

    // Tab 4: Rules & Recovery Elements
    this.btnOpenDailyCheckinDirect = document.getElementById("btnOpenDailyCheckinDirect");
    this.recoveryRulesList = document.getElementById("recoveryRulesList");
    this.priorityListEl = document.getElementById("priorityListEl");
    this.matrixTableBody = document.getElementById("matrixTableBody");
    this.checkpointsContainer = document.getElementById("checkpointsContainer");

    // Rest Timer HUD Elements
    this.timerHudPill = document.getElementById("timerHudPill");
    this.timerTitleText = document.getElementById("timerTitleText");
    this.timerTimeText = document.getElementById("timerTimeText");
    this.btnTimerAdd30 = document.getElementById("btnTimerAdd30");
    this.btnTimerDismiss = document.getElementById("btnTimerDismiss");

    // Toast
    this.toastBox = document.getElementById("toastBox");
  }

  bindEvents() {
    // 1. Bottom 4-Tab Navigation
    this.navBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // 2. Header Shortcuts
    if (this.btnHeaderAICoach) {
      this.btnHeaderAICoach.addEventListener("click", () => {
        this.openModal("modalAICoach");
        this.renderAIChatMessages();
        this.renderAIQuickPrompts();
      });
    }

    if (this.btnHeaderPrograms) {
      this.btnHeaderPrograms.addEventListener("click", () => {
        this.openModal("modalProgramsManager");
        this.renderProgramsListModal();
      });
    }

    if (this.btnSwitchProgramDirect) {
      this.btnSwitchProgramDirect.addEventListener("click", () => {
        this.openModal("modalProgramsManager");
        this.renderProgramsListModal();
      });
    }

    if (this.btnHeaderSettings) {
      this.btnHeaderSettings.addEventListener("click", () => this.openSettingsModal());
    }

    // 3. Week A / B Switchers
    if (this.btnWeekA && this.btnWeekB) {
      this.btnWeekA.addEventListener("click", () => this.setWeek("A"));
      this.btnWeekB.addEventListener("click", () => this.setWeek("B"));
    }

    // 4. Workout Start & Stopwatch Lifecycle
    if (this.btnStartWorkoutSession) {
      this.btnStartWorkoutSession.addEventListener("click", () => this.handleStartWorkoutClick());
    }

    if (this.btnPauseWorkout) {
      this.btnPauseWorkout.addEventListener("click", () => this.togglePauseStopwatch());
    }

    if (this.btnFinishWorkout) {
      this.btnFinishWorkout.addEventListener("click", () => this.openPostWorkoutSummary());
    }

    const btnConfirmSaveWorkout = document.getElementById("btnConfirmSaveWorkout");
    if (btnConfirmSaveWorkout) {
      btnConfirmSaveWorkout.addEventListener("click", () => this.handleConfirmSaveWorkout());
    }

    // Timer Ticks callback
    this.timer.onSessionTick((data) => {
      if (this.workoutStopwatchText) {
        this.workoutStopwatchText.textContent = data.formatted;
      }
      const dot = document.querySelector(".stopwatch-dot");
      if (dot) dot.classList.toggle("paused", data.isPaused);
    });

    this.timer.onRestTick((data) => {
      if (this.timerTimeText) this.timerTimeText.textContent = data.formatted;
      if (this.timerTitleText) {
        this.timerTitleText.textContent = data.isRestPause ? "⚡ REST-PAUSE (15s)" : "⏱️ NGHỈ GIỮA SET";
      }
      if (this.timerHudPill) {
        this.timerHudPill.classList.toggle("visible", data.isRunning);
      }
    });

    this.timer.onRestComplete((data) => {
      this.showToast(data.isRestPause ? "⚡ Hết 15s Rest-Pause! Vào set tiếp ngay!" : "⏰ Hết giờ nghỉ! Sẵn sàng cho set tiếp theo!");
    });

    if (this.btnTimerAdd30) {
      this.btnTimerAdd30.addEventListener("click", () => this.timer.addRestSeconds(30));
    }

    if (this.btnTimerDismiss) {
      this.btnTimerDismiss.addEventListener("click", () => this.timer.stopRest());
    }

    // 5. Muscle Heatmap Drawer Toggle
    if (this.btnToggleMuscleHeatmap) {
      this.btnToggleMuscleHeatmap.addEventListener("click", () => {
        if (this.heroHeatmapContainer) {
          const isShown = this.heroHeatmapContainer.style.display !== "none";
          this.heroHeatmapContainer.style.display = isShown ? "none" : "block";
          if (!isShown) this.renderWorkoutMuscleHeatmap();
        }
      });
    }

    if (this.btnCloseHeroHeatmap) {
      this.btnCloseHeroHeatmap.addEventListener("click", () => {
        if (this.heroHeatmapContainer) this.heroHeatmapContainer.style.display = "none";
      });
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

    // 7. Tab 2: Stats Events
    this.timeframeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.timeframeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.statsFilter = btn.dataset.filter || "all";
        this.renderStatsTab();
      });
    });

    if (this.selectChartExercise) {
      this.selectChartExercise.addEventListener("change", (e) => {
        this.selectedChartLift = e.target.value;
        this.renderStatsTab();
      });
    }

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
          this.renderStatsTab();
          this.showToast("Đã bỏ lọc ngày.");
        }
      });
    }

    // 8. Tab 3: Exercises & Roulette Events
    if (this.subnavBtnLibrary && this.subnavBtnRoulette) {
      this.subnavBtnLibrary.addEventListener("click", () => {
        this.subnavBtnLibrary.classList.add("active");
        this.subnavBtnRoulette.classList.remove("active");
        if (this.sectionExerciseLibrary) this.sectionExerciseLibrary.style.display = "block";
        if (this.sectionWODRoulette) this.sectionWODRoulette.style.display = "none";
      });

      this.subnavBtnRoulette.addEventListener("click", () => {
        this.subnavBtnRoulette.classList.add("active");
        this.subnavBtnLibrary.classList.remove("active");
        if (this.sectionExerciseLibrary) this.sectionExerciseLibrary.style.display = "none";
        if (this.sectionWODRoulette) this.sectionWODRoulette.style.display = "block";
        this.drawRouletteWheel();
      });
    }

    if (this.inputSearchExercise) {
      this.inputSearchExercise.addEventListener("input", () => this.renderExerciseLibrary());
    }
    if (this.selectMuscleFilter) {
      this.selectMuscleFilter.addEventListener("change", () => this.renderExerciseLibrary());
    }
    if (this.selectEquipmentFilter) {
      this.selectEquipmentFilter.addEventListener("change", () => this.renderExerciseLibrary());
    }

    if (this.btnSpinRoulette) {
      this.btnSpinRoulette.addEventListener("click", () => this.spinRouletteWheel());
    }

    if (this.btnSpinAgain) {
      this.btnSpinAgain.addEventListener("click", () => this.spinRouletteWheel());
    }

    if (this.btnLoadWodToWorkout) {
      this.btnLoadWodToWorkout.addEventListener("click", () => this.handleLoadWodToWorkout());
    }

    // 9. Tab 4: Rules & Check-in Events
    if (this.btnOpenDailyCheckinDirect) {
      this.btnOpenDailyCheckinDirect.addEventListener("click", () => {
        this.openSmartFatigueModal();
      });
    }

    // 10. Plate Calculator & 1RM Modal Events
    const modalTabBtnPlates = document.getElementById("modalTabBtnPlates");
    const modalTabBtn1RM = document.getElementById("modalTabBtn1RM");
    const subviewPlateCalc = document.getElementById("subviewPlateCalc");
    const subview1RMCalc = document.getElementById("subview1RMCalc");

    if (modalTabBtnPlates && modalTabBtn1RM) {
      modalTabBtnPlates.addEventListener("click", () => {
        modalTabBtnPlates.classList.add("active");
        modalTabBtn1RM.classList.remove("active");
        if (subviewPlateCalc) subviewPlateCalc.style.display = "block";
        if (subview1RMCalc) subview1RMCalc.style.display = "none";
      });

      modalTabBtn1RM.addEventListener("click", () => {
        modalTabBtn1RM.classList.add("active");
        modalTabBtnPlates.classList.remove("active");
        if (subviewPlateCalc) subviewPlateCalc.style.display = "none";
        if (subview1RMCalc) subview1RMCalc.style.display = "block";
        this.update1RMCalculations();
      });
    }

    const btnCalculatePlates = document.getElementById("btnCalculatePlates");
    const inputTargetPlateKg = document.getElementById("inputTargetPlateKg");
    if (btnCalculatePlates && inputTargetPlateKg) {
      btnCalculatePlates.addEventListener("click", () => this.calculateBarbellPlates(parseFloat(inputTargetPlateKg.value) || 20));
      inputTargetPlateKg.addEventListener("input", () => this.calculateBarbellPlates(parseFloat(inputTargetPlateKg.value) || 20));
    }

    const input1RMWeight = document.getElementById("input1RMWeight");
    const input1RMReps = document.getElementById("input1RMReps");
    if (input1RMWeight && input1RMReps) {
      input1RMWeight.addEventListener("input", () => this.update1RMCalculations());
      input1RMReps.addEventListener("input", () => this.update1RMCalculations());
    }

    // 11. Smart Fatigue Check-in Modal Events
    document.querySelectorAll(".btn-checkin-pill").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const group = btn.closest(".checkin-options-grid");
        if (group) group.querySelectorAll(".btn-checkin-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.updateCheckinRecommendations();
      });
    });

    const btnApplySmartAdjustment = document.getElementById("btnApplySmartAdjustment");
    if (btnApplySmartAdjustment) {
      btnApplySmartAdjustment.addEventListener("click", () => this.handleConfirmCheckinAndStart());
    }

    // 12. Program Builder Dynamic Days Events
    const btnOpenCreateProgFromManager = document.getElementById("btnOpenCreateProgFromManager");
    if (btnOpenCreateProgFromManager) {
      btnOpenCreateProgFromManager.addEventListener("click", () => {
        this.closeAllModals();
        this.openCleanProgramBuilder();
      });
    }

    const btnAddDayToBuilder = document.getElementById("btnAddDayToBuilder");
    if (btnAddDayToBuilder) {
      btnAddDayToBuilder.addEventListener("click", () => this.addDayToProgramBuilder());
    }

    const formProgramBuilder = document.getElementById("formProgramBuilder");
    if (formProgramBuilder) {
      formProgramBuilder.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveCustomProgram();
      });
    }

    // 13. AI Coach Chat Form in Modal
    const formAIChatModal = document.getElementById("formAIChatModal");
    const inputAIChatModal = document.getElementById("inputAIChatModal");
    if (formAIChatModal && inputAIChatModal) {
      formAIChatModal.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = inputAIChatModal.value.trim();
        if (text) {
          inputAIChatModal.value = "";
          this.sendAICoachQuery(text);
        }
      });
    }

    const btnClearAIChatModal = document.getElementById("btnClearAIChatModal");
    if (btnClearAIChatModal) {
      btnClearAIChatModal.addEventListener("click", () => {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat với AI Coach?")) {
          this.storage.clearAIChatHistory();
          this.renderAIChatMessages();
          this.showToast("Đã xóa lịch sử chat.");
        }
      });
    }

    // 14. Exercise Detail & Swap Shortcut
    const btnModalSwapShortcut = document.getElementById("btnModalSwapShortcut");
    if (btnModalSwapShortcut) {
      btnModalSwapShortcut.addEventListener("click", () => {
        this.closeAllModals();
        if (this.selectedExerciseForDetail) {
          this.openSwapExerciseModal(this.selectedExerciseForDetail);
        }
      });
    }

    const btnOpenPlateCalcFromDetail = document.getElementById("btnOpenPlateCalcFromDetail");
    if (btnOpenPlateCalcFromDetail) {
      btnOpenPlateCalcFromDetail.addEventListener("click", () => {
        this.closeAllModals();
        this.openPlateAnd1RMModal();
      });
    }

    // 15. Global Close Modal on Backdrop Click
    document.querySelectorAll(".btn-sheet-close, .modal-overlay").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target === el || el.classList.contains("btn-sheet-close")) {
          this.closeAllModals();
        }
      });
    });

    // 16. Supabase Cloud Sync Listeners
    window.addEventListener("dino:cloud-status", (e) => {
      this.updateCloudSyncDisplay(e.detail);
    });

    window.addEventListener("dino:cloud-synced", () => {
      this.activeProgram = this.storage.getActiveProgram();
      this.currentWeek = this.storage.getActiveWeek();
      this.currentDayIndex = this.storage.getActiveDayIndex();
      this.renderAll();
      this.showToast("☁️ Đã đồng bộ dữ liệu Cloud thành công!");
    });

    if (this.cloudSyncBadge) {
      this.cloudSyncBadge.addEventListener("click", () => {
        if (this.supabaseSync) {
          this.supabaseSync.syncNow();
          this.showToast("Đang kích hoạt đồng bộ Cloud...");
        }
      });
    }
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
    } else if (tabName === "stats") {
      this.renderStatsTab();
    } else if (tabName === "exercises") {
      this.renderExerciseLibrary();
      this.drawRouletteWheel();
    } else if (tabName === "rules") {
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
    this.renderStatsTab();
    this.renderExerciseLibrary();
    this.renderRecoveryTab();
  }

  // =========================================================================
  // TAB 1: WORKOUT TAB & HEVY LOGGING
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

    if (this.heroDayTag) {
      this.heroDayTag.textContent = `${activeDay.dayKey} • ${(activeDay.badge || 'WORKOUT').toUpperCase()}`;
    }
    if (this.heroWorkoutTitle) {
      this.heroWorkoutTitle.textContent = activeDay.title;
    }
    if (this.heroWorkoutFocus) {
      this.heroWorkoutFocus.textContent = activeDay.focus || activeDay.details || "Tập trung cường độ & chất lượng reps";
    }

    // Stopwatch UI State (Idle Prompt vs Active Stopwatch)
    if (this.timer.sessionIsRunning) {
      if (this.workoutStartOverlay) this.workoutStartOverlay.style.display = "none";
      if (this.activeStopwatchCluster) this.activeStopwatchCluster.style.display = "flex";
    } else {
      if (this.workoutStartOverlay) this.workoutStartOverlay.style.display = "flex";
      if (this.activeStopwatchCluster) this.activeStopwatchCluster.style.display = "none";
    }

    // Load Session Notes
    if (this.inputWorkoutNotes) {
      this.inputWorkoutNotes.value = this.storage.getSessionNotes(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);
    }

    // Render Exercises List
    if (this.workoutExercisesContainer) {
      this.workoutExercisesContainer.innerHTML = "";

      // Check if day is Circuit / For Time
      if (activeDay.type === "circuit" || activeDay.circuitData) {
        const circuitCard = this.createForTimeCircuitCard(activeDay);
        this.workoutExercisesContainer.appendChild(circuitCard);
      }

      // Strength Exercises
      if (activeDay.exercises && activeDay.exercises.length > 0) {
        const swappedMap = this.storage.getSwappedExercises(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);

        activeDay.exercises.forEach(originalEx => {
          const effectiveEx = swappedMap[originalEx.id] || originalEx;
          const card = this.createHevyExerciseCard(effectiveEx, originalEx, activeDay);
          this.workoutExercisesContainer.appendChild(card);
        });
      }

      // Running Cards
      if (activeDay.type === "run" || activeDay.type === "hybrid") {
        const runCard = this.createHevyRunningCard(activeDay);
        this.workoutExercisesContainer.appendChild(runCard);
      }

      // Soccer / Rest Day Cards
      if (activeDay.type === "game" || activeDay.type === "rest") {
        const gameCard = this.createHevyGameOrRestCard(activeDay);
        this.workoutExercisesContainer.appendChild(gameCard);
      }
    }
  }

  renderDayChips(weekData) {
    if (!this.dayChipsContainer) return;
    this.dayChipsContainer.innerHTML = "";

    weekData.days.forEach((day, idx) => {
      const isCompleted = this.storage.isDayCompleted(this.activeProgram.id, this.currentWeek, idx);
      const isActive = idx === this.currentDayIndex;

      const chip = document.createElement("button");
      chip.className = `day-chip ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`;
      chip.innerHTML = `
        <span style="font-weight: 800; font-size: 13px;">${day.dayKey}</span>
        <span style="font-size: 10.5px; opacity: 0.8;">${day.badge || ''}</span>
      `;
      chip.addEventListener("click", () => this.selectDay(idx));
      this.dayChipsContainer.appendChild(chip);
    });
  }

  handleStartWorkoutClick() {
    const settings = this.storage.getSettings();
    const todayStr = new Date().toISOString().split("T")[0];
    const checkin = this.storage.getSmartFatigueCheckin(todayStr);

    if (settings.enableSmartFatigue !== false && !checkin) {
      this.openSmartFatigueModal();
    } else {
      this.startWorkoutTimer();
    }
  }

  startWorkoutTimer() {
    this.timer.startSession();
    if (this.workoutStartOverlay) this.workoutStartOverlay.style.display = "none";
    if (this.activeStopwatchCluster) this.activeStopwatchCluster.style.display = "flex";
    this.showToast("⏱️ Buổi tập đã bắt đầu! Chúc bạn tập luyện bùng nổ!");
  }

  togglePauseStopwatch() {
    const isNowRunning = this.timer.togglePauseSession();
    if (this.btnPauseWorkout) {
      this.btnPauseWorkout.innerHTML = isNowRunning
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }
    this.showToast(isNowRunning ? "▶️ Tiếp tục bấm giờ buổi tập" : "⏸️ Đã tạm dừng bấm giờ");
  }

  // Create Hevy Exercise Card
  createHevyExerciseCard(exercise, originalEx, day) {
    const card = document.createElement("div");
    card.className = "hevy-exercise-card";
    card.dataset.exerciseId = exercise.id;

    const targetText = exercise.targetRequirement || (exercise.defaultSets
      ? `${exercise.defaultSets.length} sets × ${exercise.defaultSets[0].reps || '6-10'} reps @ ${exercise.defaultSets[0].rir || 'RIR 0-1'}`
      : "2 sets × 6-10 reps @ RIR 0-1");

    const bestPrev = this.storage.getExerciseBestPrevious(exercise.id);
    const prevBannerText = bestPrev
      ? `${bestPrev.weightKg}kg × ${bestPrev.reps} reps @ ${bestPrev.rir} (${bestPrev.date})`
      : `Chưa có dữ liệu lần trước`;

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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="hevy-exercise-name" title="Xem chi tiết & lịch sử">${exercise.name} ℹ️</span>
            ${isSwapped ? `<span class="prog-badge" style="font-size: 9px; padding: 1px 5px;">Đã đổi</span>` : ""}
          </div>
          <span class="hevy-exercise-category">${exercise.category || "Compound"} • ${exercise.equipment || 'Tạ'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          ${exercise.isRestPause ? `<span class="rp-badge">Rest-Pause</span>` : ""}
          <button type="button" class="btn-plate-calc-shortcut" title="Mở Plate Calc & 1RM">🏋️ Plate</button>
          <button type="button" class="btn-swap-exercise" title="Đổi bài tập khác">🔄 Đổi</button>
        </div>
      </div>

      <!-- DUAL BANNERS -->
      <div class="hevy-target-banner">
        🎯 <strong>Mục tiêu:</strong> ${targetText}
      </div>

      <div class="hevy-previous-banner">
        <span>⏱️ LẦN TRƯỚC:</span>
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        + Add Set
      </button>

      ${exercise.optionNote ? `<div class="exercise-alt-footer">💡 ${exercise.optionNote}</div>` : ""}
    `;

    this.bindHevyCardEvents(card, exercise, originalEx, day);
    return card;
  }

  bindHevyCardEvents(card, exercise, originalEx, day) {
    // 1. Click Exercise Name -> Open Detail Modal
    const nameEl = card.querySelector(".hevy-exercise-name");
    if (nameEl) {
      nameEl.addEventListener("click", () => this.openExerciseDetailModal(exercise));
    }

    // 2. Click Plate Calc Shortcut
    const btnPlate = card.querySelector(".btn-plate-calc-shortcut");
    if (btnPlate) {
      btnPlate.addEventListener("click", () => {
        const firstKgInput = card.querySelector(".input-kg");
        const val = firstKgInput ? (parseFloat(firstKgInput.value) || 100) : 100;
        this.openPlateAnd1RMModal(val);
      });
    }

    // 3. Click Swap Button
    const btnSwap = card.querySelector(".btn-swap-exercise");
    if (btnSwap) {
      btnSwap.addEventListener("click", () => this.openSwapExerciseModal(originalEx));
    }

    // 4. Click Prev Data Cell to Quick Autofill
    card.querySelectorAll(".prev-data-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const w = cell.dataset.weight;
        const r = cell.dataset.reps;
        if (w && r) {
          const row = cell.closest(".hevy-set-row");
          if (row) {
            row.querySelector(".input-kg").value = w;
            row.querySelector(".input-reps").value = r;
            this.showToast(`Đã điền nhanh: ${w}kg × ${r} reps`);
          }
        }
      });
    });

    // 5. Set Checkmark Button
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
            this.showToast(`🔥 KỶ LỤC MỚI (PR)! Overload: ${kg}kg × ${reps} reps!`);
          } else if (result.progressStatus === "regression") {
            this.audio.playRegressionTone();
            this.showToast(`💪 Đã log: ${kg}kg × ${reps} reps. Giữ vững form chuẩn!`);
          } else {
            this.audio.playSetComplete();
            this.showToast(`✓ Đã log Set ${setIndex + 1}: ${kg}kg × ${reps} reps`);
          }

          // Auto-start rest timer
          if (isRp) {
            this.timer.startRest(15, true);
          } else {
            this.timer.startRest(150, false);
          }
        }
      });
    });

    // 6. Delete Set Button
    card.querySelectorAll(".btn-del-set-row").forEach(btn => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".hevy-set-row");
        const setIndex = parseInt(row.dataset.setIndex);
        if (confirm("Xóa set này khỏi buổi tập?")) {
          this.storage.deleteSessionSet(this.activeProgram.id, this.currentWeek, day.dayIndex, exercise.id, setIndex);
          this.renderWorkoutTab();
          this.showToast("Đã xóa set.");
        }
      });
    });

    // 7. Add Set Button
    const btnAddSet = card.querySelector(".btn-add-set");
    if (btnAddSet) {
      btnAddSet.addEventListener("click", () => {
        this.storage.addSessionSet(this.activeProgram.id, this.currentWeek, day.dayIndex, exercise);
        this.renderWorkoutTab();
        this.showToast("+ Đã thêm 1 set mới");
      });
    }
  }

  // Create Running Card with Embedded Pace Calculator
  createHevyRunningCard(day) {
    const card = document.createElement("div");
    card.className = "running-exercise-card";

    const draft = this.storage.getSessionRunData(this.activeProgram.id, this.currentWeek, day.dayIndex) || {};
    const targetKm = day.targetKm || (day.runDetail ? day.runDetail.targetKm : 5.0);

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div>
          <span style="font-size: 11px; font-weight: 800; color: var(--color-blue); text-transform: uppercase;">🏃 RUNNING SESSION</span>
          <div style="font-family: var(--font-heading); font-size: 16px; font-weight: 800; color: var(--text-white);">${day.title}</div>
        </div>
        <span class="prog-badge" style="color: var(--color-blue); border-color: rgba(59,130,246,0.3);">Mục tiêu: ${targetKm} km</span>
      </div>

      <!-- Pace Calculator Widget -->
      <div class="pace-calculator-box">
        <div style="font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px;">
          ⏱️ Công Cụ Tính Pace & Tốc Độ (Pace Calculator)
        </div>

        <div class="pace-calc-inputs-row">
          <div>
            <label style="font-size: 10.5px; color: var(--text-muted); display: block; margin-bottom: 2px;">Cự ly (km):</label>
            <input type="number" step="0.1" id="inputPaceKm" class="form-input" style="font-family: var(--font-mono); font-size: 14px; font-weight: 800;" value="${draft.distanceKm || targetKm}">
          </div>
          <div>
            <label style="font-size: 10.5px; color: var(--text-muted); display: block; margin-bottom: 2px;">Thời gian (phút):</label>
            <input type="number" step="1" id="inputPaceMins" class="form-input" style="font-family: var(--font-mono); font-size: 14px; font-weight: 800;" value="${draft.durationMinutes || Math.round(targetKm * 6)}">
          </div>
        </div>

        <div class="pace-calc-outputs-grid">
          <div class="pace-metric-item">
            <span class="p-label">PACE TRUNG BÌNH</span>
            <div id="outputPaceDisplay" class="p-val">--:--/km</div>
          </div>
          <div class="pace-metric-item">
            <span class="p-label">TỐC ĐỘ (SPEED)</span>
            <div id="outputSpeedDisplay" class="p-val">-- km/h</div>
          </div>
          <div class="pace-metric-item">
            <span class="p-label">DỰ TÍNH 21.1KM (HM)</span>
            <div id="outputHMProjection" class="p-val">--:--:--</div>
          </div>
        </div>
      </div>

      ${day.options ? `
        <div style="font-size: 11.5px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin: 10px 0 6px 0;">
          Tùy chọn bài chạy (Options):
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${day.options.map(opt => `
            <div style="background: #0d0d0d; border: 1px solid var(--border-subtle); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px;">
              <strong style="color: var(--text-white);">${opt.title}:</strong>
              <span style="color: var(--text-muted);"> ${opt.details}</span>
              ${opt.rpe ? `<span style="color: var(--color-amber); font-size: 11px; margin-left: 4px;">(${opt.rpe})</span>` : ""}
            </div>
          `).join("")}
        </div>
      ` : ""}
    `;

    // Bind Pace Calculator Math
    const inputKm = card.querySelector("#inputPaceKm");
    const inputMins = card.querySelector("#inputPaceMins");
    const outPace = card.querySelector("#outputPaceDisplay");
    const outSpeed = card.querySelector("#outputSpeedDisplay");
    const outHM = card.querySelector("#outputHMProjection");

    const updatePaceMath = () => {
      const km = parseFloat(inputKm.value) || 0;
      const mins = parseFloat(inputMins.value) || 0;
      if (km > 0 && mins > 0) {
        const paceDec = mins / km;
        const pM = Math.floor(paceDec);
        const pS = Math.round((paceDec - pM) * 60);
        const paceStr = `${pM}:${pS < 10 ? '0' : ''}${pS}/km`;
        const speed = Math.round((km / (mins / 60)) * 10) / 10;
        const hmTotalMins = paceDec * 21.0975;
        const hmHrs = Math.floor(hmTotalMins / 60);
        const hmM = Math.floor(hmTotalMins % 60);

        outPace.textContent = paceStr;
        outSpeed.textContent = `${speed} km/h`;
        outHM.textContent = `${hmHrs}h${hmM < 10 ? '0' : ''}${hmM}m`;

        this.storage.setSessionRunData(this.activeProgram.id, this.currentWeek, day.dayIndex, {
          distanceKm: km,
          durationMinutes: mins,
          pace: paceStr
        });
      } else {
        outPace.textContent = "--:--/km";
        outSpeed.textContent = "-- km/h";
        outHM.textContent = "--:--:--";
      }
    };

    inputKm.addEventListener("input", updatePaceMath);
    inputMins.addEventListener("input", updatePaceMath);
    setTimeout(updatePaceMath, 50);

    return card;
  }

  // Create For Time Circuit Grouped Block Card
  createForTimeCircuitCard(day) {
    const card = document.createElement("div");
    card.className = "circuit-block-card";

    const cData = day.circuitData || {
      format: "For Time",
      title: "Hyrox-Style Conditioning Block",
      items: [
        { id: "c1", name: "1 km Run @ Moderate", reps: "1 km" },
        { id: "c2", name: "50 Burpees over line", reps: "50 reps" },
        { id: "c3", name: "1 km Run @ Steady", reps: "1 km" },
        { id: "c4", name: "50 Med Ball Slams", reps: "50 reps" },
        { id: "c5", name: "1 km Run Finish", reps: "1 km" }
      ]
    };

    let itemsHtml = "";
    cData.items.forEach((item, idx) => {
      itemsHtml += `
        <div class="circuit-task-row" data-task-id="${item.id}">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: var(--font-mono); font-size: 11px; color: var(--red-primary); font-weight: 800;">#${idx + 1}</span>
            <span style="font-weight: 700; font-size: 13px; color: var(--text-white);">${item.name}</span>
          </div>
          <button type="button" class="btn-set-check btn-task-check" title="Hoàn thành động tác">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="circuit-block-header">
        <div>
          <span style="font-size: 11px; font-weight: 900; color: var(--red-primary); letter-spacing: 0.8px;">⚡ FOR TIME CIRCUIT BLOCK</span>
          <h3 style="font-family: var(--font-heading); font-size: 17px; font-weight: 900; color: var(--text-white);">${cData.title}</h3>
        </div>
        <span class="prog-badge" style="color: var(--color-gold); border-color: rgba(255,215,0,0.3);">${cData.format}</span>
      </div>

      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
        Tập trung hoàn thành toàn bộ chuỗi động tác trong thời gian nhanh nhất với pacing ổn định.
      </div>

      <div class="circuit-tasks-list">
        ${itemsHtml}
      </div>
    `;

    card.querySelectorAll(".btn-task-check").forEach(btn => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".circuit-task-row");
        const isDone = btn.classList.contains("completed");
        btn.classList.toggle("completed", !isDone);
        row.classList.toggle("completed", !isDone);
        if (!isDone) {
          this.audio.playSetComplete();
          this.showToast("✓ Hoàn thành động tác trong Circuit!");
        }
      });
    });

    return card;
  }

  createHevyGameOrRestCard(day) {
    const card = document.createElement("div");
    card.className = "hevy-exercise-card";

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div>
          <span style="font-size: 11px; font-weight: 800; color: ${day.type === 'game' ? 'var(--color-green)' : 'var(--text-dim)'}; text-transform: uppercase;">
            ${day.type === 'game' ? '⚽ MATCH DAY (SOCCER)' : '💤 REST & RECOVERY'}
          </span>
          <div style="font-family: var(--font-heading); font-size: 16px; font-weight: 800; color: var(--text-white);">${day.title}</div>
        </div>
        <span class="prog-badge">${day.estimatedTime || '60 mins'}</span>
      </div>

      <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
        ${day.details || "Hoạt động thể thao tự do hoặc phục hồi cơ bắp toàn diện."}
      </p>

      ${day.checklist ? `
        <div style="font-size: 11.5px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px;">
          Checklist lưu ý:
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${day.checklist.map(c => `
            <label style="display: flex; align-items: center; gap: 8px; background: #0a0a0a; border: 1px solid var(--border-subtle); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px; color: var(--text-muted); cursor: pointer;">
              <input type="checkbox" style="accent-color: var(--red-primary);">
              <span><strong>${c.label}</strong> ${c.note ? `— ${c.note}` : ''}</span>
            </label>
          `).join("")}
        </div>
      ` : ""}
    `;
    return card;
  }

  // Render SVG Muscle Heatmap
  renderWorkoutMuscleHeatmap(customMuscles = null) {
    const anteriorBox = document.getElementById("anteriorMuscleSvgWrap");
    const posteriorBox = document.getElementById("posteriorMuscleSvgWrap");
    const tagsBox = document.getElementById("heroTargetMusclesTags");
    if (!anteriorBox || !posteriorBox) return;

    let targetMuscles = [];

    if (customMuscles) {
      targetMuscles = customMuscles;
    } else {
      const weekData = (this.activeProgram.weeks && this.activeProgram.weeks[this.currentWeek])
        ? this.activeProgram.weeks[this.currentWeek]
        : null;
      const activeDay = (weekData && weekData.days) ? weekData.days[this.currentDayIndex] : null;

      if (activeDay) {
        if (activeDay.exercises) {
          activeDay.exercises.forEach(ex => {
            const cat = (ex.category || "").toLowerCase();
            if (cat.includes("quad") || cat.includes("squat") || cat.includes("leg press")) targetMuscles.push("Quads");
            if (cat.includes("hamstring") || cat.includes("curl")) targetMuscles.push("Hamstrings");
            if (cat.includes("chest") || cat.includes("bench") || cat.includes("dips")) targetMuscles.push("Chest");
            if (cat.includes("lat") || cat.includes("pull") || cat.includes("back") || cat.includes("row")) targetMuscles.push("Lats");
            if (cat.includes("shoulder") || cat.includes("delt") || cat.includes("lateral")) targetMuscles.push("Shoulders");
            if (cat.includes("biceps")) targetMuscles.push("Biceps");
            if (cat.includes("triceps")) targetMuscles.push("Triceps");
            if (cat.includes("core") || cat.includes("abs")) targetMuscles.push("Core");
            if (cat.includes("calf")) targetMuscles.push("Calves");
          });
        }
        if (activeDay.type === "run") {
          targetMuscles.push("Cardio", "Quads", "Hamstrings", "Calves");
        }
      }
    }

    targetMuscles = [...new Set(targetMuscles)];

    const hasMuscle = (m) => targetMuscles.includes(m);

    // Anterior SVG Silhouette
    anteriorBox.innerHTML = `
      <svg viewBox="0 0 100 180" width="100%" height="100%">
        <!-- Head -->
        <circle cx="50" cy="18" r="10" fill="#27272a"/>
        <!-- Chest -->
        <path class="muscle-path ${hasMuscle('Chest') ? 'highlight' : ''}" d="M38 36 Q50 38 62 36 L60 52 Q50 56 40 52 Z"/>
        <!-- Shoulders Anterior -->
        <circle class="muscle-path ${hasMuscle('Shoulders') ? 'highlight' : ''}" cx="33" cy="38" r="6"/>
        <circle class="muscle-path ${hasMuscle('Shoulders') ? 'highlight' : ''}" cx="67" cy="38" r="6"/>
        <!-- Biceps -->
        <ellipse class="muscle-path ${hasMuscle('Biceps') ? 'highlight' : ''}" cx="30" cy="54" rx="4" ry="8"/>
        <ellipse class="muscle-path ${hasMuscle('Biceps') ? 'highlight' : ''}" cx="70" cy="54" rx="4" ry="8"/>
        <!-- Abs / Core -->
        <path class="muscle-path ${hasMuscle('Core') ? 'highlight' : ''}" d="M42 54 L58 54 L56 82 L44 82 Z"/>
        <!-- Quads -->
        <path class="muscle-path ${hasMuscle('Quads') ? 'highlight' : ''}" d="M36 86 L48 86 L46 126 L34 126 Z"/>
        <path class="muscle-path ${hasMuscle('Quads') ? 'highlight' : ''}" d="M52 86 L64 86 L66 126 L54 126 Z"/>
        <!-- Calves Anterior -->
        <path class="muscle-path ${hasMuscle('Calves') ? 'highlight' : ''}" d="M35 132 L45 132 L43 166 L37 166 Z"/>
        <path class="muscle-path ${hasMuscle('Calves') ? 'highlight' : ''}" d="M55 132 L65 132 L63 166 L57 166 Z"/>
        <text x="50" y="178" font-size="8" fill="#71717a" text-anchor="middle">MẶT TRƯỚC</text>
      </svg>
    `;

    // Posterior SVG Silhouette
    posteriorBox.innerHTML = `
      <svg viewBox="0 0 100 180" width="100%" height="100%">
        <!-- Head -->
        <circle cx="50" cy="18" r="10" fill="#27272a"/>
        <!-- Traps / Upper Back -->
        <path class="muscle-path ${hasMuscle('Upper Back') || hasMuscle('Shoulders') ? 'highlight' : ''}" d="M38 32 Q50 36 62 32 L58 46 L42 46 Z"/>
        <!-- Lats -->
        <path class="muscle-path ${hasMuscle('Lats') ? 'highlight' : ''}" d="M38 46 L62 46 L58 72 L42 72 Z"/>
        <!-- Triceps -->
        <ellipse class="muscle-path ${hasMuscle('Triceps') ? 'highlight' : ''}" cx="29" cy="54" rx="4" ry="8"/>
        <ellipse class="muscle-path ${hasMuscle('Triceps') ? 'highlight' : ''}" cx="71" cy="54" rx="4" ry="8"/>
        <!-- Glutes -->
        <ellipse class="muscle-path ${hasMuscle('Glutes') || hasMuscle('Quads') ? 'highlight' : ''}" cx="43" cy="88" rx="7" ry="9"/>
        <ellipse class="muscle-path ${hasMuscle('Glutes') || hasMuscle('Quads') ? 'highlight' : ''}" cx="57" cy="88" rx="7" ry="9"/>
        <!-- Hamstrings -->
        <path class="muscle-path ${hasMuscle('Hamstrings') ? 'highlight' : ''}" d="M36 98 L48 98 L46 128 L34 128 Z"/>
        <path class="muscle-path ${hasMuscle('Hamstrings') ? 'highlight' : ''}" d="M52 98 L64 98 L66 128 L54 128 Z"/>
        <!-- Calves Posterior -->
        <path class="muscle-path ${hasMuscle('Calves') ? 'highlight' : ''}" d="M34 134 L46 134 L43 166 L37 166 Z"/>
        <path class="muscle-path ${hasMuscle('Calves') ? 'highlight' : ''}" d="M54 134 L66 134 L63 166 L57 166 Z"/>
        <text x="50" y="178" font-size="8" fill="#71717a" text-anchor="middle">MẶT SAU</text>
      </svg>
    `;

    if (tagsBox) {
      tagsBox.innerHTML = targetMuscles.map(m => `<span class="heatmap-tag-pill">🔥 ${m}</span>`).join("");
    }
  }

  // =========================================================================
  // TAB 2: STATS & PROGRESS (WITH DYNAMIC RECALCULATION & DELETION)
  // =========================================================================
  renderStatsTab() {
    const stats = this.storage.getHistoryStats(this.statsFilter);

    if (this.statSummaryVolume) {
      this.statSummaryVolume.textContent = `${stats.totalVolumeKg.toLocaleString()} kg`;
    }
    if (this.statSummaryDistance) {
      this.statSummaryDistance.textContent = `${stats.totalDistanceKm} km`;
    }
    if (this.statSummaryWorkouts) {
      this.statSummaryWorkouts.textContent = stats.totalWorkouts;
    }
    if (this.statSummaryPRs) {
      this.statSummaryPRs.textContent = stats.totalPRs;
    }

    // Render Canvas Charts
    this.renderStatsCharts();
    this.renderCalendarMonth();
    this.renderHistoryCardsList();
  }

  renderStatsCharts() {
    if (!window.DinoCharts) return;

    setTimeout(() => {
      // 1. Overload Lift Chart
      const overloadLogs = this.storage.getLiftHistory(this.selectedChartLift);
      window.DinoCharts.renderOverloadChart("canvasStatsOverload", overloadLogs, this.selectedChartLift);

      // 2. Mileage Chart
      const runLogs = this.storage.getRunLogs();
      window.DinoCharts.renderMileageChart("canvasStatsMileage", runLogs, this.statsFilter);

      // 3. Volume Progression Chart
      const history = this.storage.getWorkoutHistory();
      window.DinoCharts.renderVolumeChart("canvasStatsVolume", history, this.statsFilter);
    }, 60);
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
          this.showToast("Đã bỏ lọc ngày.");
        } else {
          this.calFilterDate = dateStr;
          this.showToast(`Đang lọc nhật ký ngày: ${dayStr}/${monthStr}/${this.calYear}`);
        }
        this.renderStatsTab();
      });

      this.calendarDaysGrid.appendChild(cell);
    }
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

  // Render History Cards with Instant Dynamic Deletion & Stats Update
  renderHistoryCardsList() {
    if (!this.historyCardsContainer) return;

    if (this.historySelectedDateFilter) {
      if (this.calFilterDate) {
        const parts = this.calFilterDate.split("-");
        this.historySelectedDateFilter.innerHTML = `Ngày: ${parts[2]}/${parts[1]}/${parts[0]} <span style="text-decoration: underline;">[✕ Bỏ lọc]</span>`;
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
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px 16px; text-align: center; color: var(--text-dim); font-size: 13px;">
          Chưa có nhật ký buổi tập nào ${this.calFilterDate ? 'trong ngày đã chọn' : ''}.<br>
          Hãy hoàn thành buổi tập ở tab <strong>Workout</strong>!
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
            <span style="font-size: 11px; font-weight: 800; color: var(--red-primary);">${h.dayKey || 'DAY'} • ${h.programName || 'Dino Hybrid'}</span>
            <div class="hist-workout-name">${h.dayTitle}</div>
          </div>
          <span class="hist-date-tag">${h.date}</span>
        </div>

        <div class="hist-metrics-pills">
          <span class="hist-pill">⏱️ ${h.durationMinutes || 50}m</span>
          ${h.totalVolumeKg > 0 ? `<span class="hist-pill" style="color: var(--color-green);">⚖️ ${h.totalVolumeKg.toLocaleString()} kg</span>` : ""}
          ${h.totalSetsCount > 0 ? `<span class="hist-pill">🔢 ${h.totalSetsCount} sets</span>` : ""}
          ${h.totalDistanceKm > 0 ? `<span class="hist-pill" style="color: var(--color-blue);">🏃 ${h.totalDistanceKm} km</span>` : ""}
          ${h.prCount > 0 ? `<span class="hist-pill" style="color: var(--color-gold);">⚡ ${h.prCount} PRs</span>` : ""}
        </div>

        ${exercisesHtml}

        ${h.notes ? `
          <div style="font-size: 12px; color: var(--text-muted); font-style: italic; background: var(--bg-card-elevated); padding: 8px 10px; border-radius: var(--radius-sm); margin-top: 6px;">
            📝 "${h.notes}"
          </div>
        ` : ""}

        <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
          <button class="btn-del-hist" style="background: transparent; border: none; color: var(--text-dim); font-size: 11px; cursor: pointer; padding: 4px 8px;">
            Xóa nhật ký ✕
          </button>
        </div>
      `;

      // 1-Click Delete Event: Recalculates stats immediately
      card.querySelector(".btn-del-hist").addEventListener("click", () => {
        if (confirm(`Bạn có chắc chắn muốn xóa bản ghi "${h.dayTitle}" (${h.date})? Tổng khối lượng và cự ly sẽ tự động trừ đi.`)) {
          this.storage.deleteHistoryRecord(h.id);
          this.renderStatsTab();
          this.showToast("✓ Đã xóa bản ghi & tự động cập nhật lại tổng thống kê!");
        }
      });

      this.historyCardsContainer.appendChild(card);
    });
  }

  // =========================================================================
  // TAB 3: EXERCISES & CROSSFIT WOD ROULETTE
  // =========================================================================
  renderExerciseLibrary() {
    if (!this.exerciseLibraryGrid) return;

    const catalog = window.EXERCISE_LIBRARY || [];
    const searchVal = (this.inputSearchExercise ? this.inputSearchExercise.value : "").trim().toLowerCase();
    const muscleVal = this.selectMuscleFilter ? this.selectMuscleFilter.value : "all";
    const equipVal = this.selectEquipmentFilter ? this.selectEquipmentFilter.value : "all";

    const filtered = catalog.filter(ex => {
      const matchSearch = !searchVal || ex.name.toLowerCase().includes(searchVal) || (ex.category && ex.category.toLowerCase().includes(searchVal));
      const matchMuscle = muscleVal === "all" || (ex.primaryMuscles && ex.primaryMuscles.includes(muscleVal)) || (ex.secondaryMuscles && ex.secondaryMuscles.includes(muscleVal));
      const matchEquip = equipVal === "all" || ex.equipment === equipVal;
      return matchSearch && matchMuscle && matchEquip;
    });

    if (filtered.length === 0) {
      this.exerciseLibraryGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 30px 14px; font-size: 13px;">
          Không tìm thấy bài tập phù hợp với bộ lọc.
        </div>
      `;
      return;
    }

    this.exerciseLibraryGrid.innerHTML = "";
    filtered.forEach(ex => {
      const card = document.createElement("div");
      card.className = "exercise-library-card";

      card.innerHTML = `
        <div class="ex-lib-top-row">
          <span class="ex-lib-name">${ex.name}</span>
          <span class="prog-badge">${ex.equipment || 'Gym'}</span>
        </div>

        <div class="ex-lib-tags-row">
          ${(ex.primaryMuscles || []).map(m => `<span class="ex-lib-tag primary">${m}</span>`).join("")}
          ${(ex.secondaryMuscles || []).map(m => `<span class="ex-lib-tag">${m}</span>`).join("")}
        </div>

        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin: 6px 0;">
          ${ex.formCues || "Thực hiện chuyển động kiểm soát và chuẩn form."}
        </div>

        <div style="display: flex; gap: 6px; margin-top: 10px;">
          <button class="btn-day-action secondary btn-lib-detail" style="flex: 1; font-size: 11.5px; padding: 6px;">
            ℹ️ Chi Tiết & 1RM
          </button>
          <button class="btn-day-action secondary btn-lib-heatmap" style="flex: 1; font-size: 11.5px; padding: 6px;">
            🔥 Cơ Tác Động
          </button>
        </div>
      `;

      card.querySelector(".btn-lib-detail").addEventListener("click", () => {
        this.openExerciseDetailModal(ex);
      });

      card.querySelector(".btn-lib-heatmap").addEventListener("click", () => {
        this.openModal("modalExerciseDetail");
        this.selectedExerciseForDetail = ex;
        this.openExerciseDetailModal(ex);
      });

      this.exerciseLibraryGrid.appendChild(card);
    });
  }

  // CrossFit WOD Roulette Wheel Renderer & Physics
  initRouletteWheel() {
    this.drawRouletteWheel();
  }

  drawRouletteWheel() {
    const canvas = this.canvasRouletteWheel;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    const slices = 12; // 12 visible visual segments on wheel
    const sliceAngle = (Math.PI * 2) / slices;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(this.rouletteRotation);

    const colors = ["#ff2a2a", "#1a1a1a", "#b31010", "#27272a", "#ff4545", "#141414"];
    const labels = ["FRAN", "MURPH", "CINDY", "HYROX", "HELEN", "DT", "GRACE", "KAREN", "CHIPPER", "ANNIE", "DIANE", "BADGER"];

    for (let i = 0; i < slices; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label text
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.fillText(labels[i % labels.length], radius - 14, 4);
      ctx.restore();
    }

    // Outer rim glow
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 42, 42, 0.6)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡", 0, 4);

    ctx.restore();
  }

  spinRouletteWheel() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    if (this.btnSpinRoulette) this.btnSpinRoulette.disabled = true;

    // Pick a random WOD from 100+ database
    const wods = window.CROSSFIT_WOD_DATABASE || [];
    const randomIndex = Math.floor(Math.random() * wods.length);
    this.selectedWOD = wods[randomIndex];

    const spinDuration = 3200; // ms
    const startTime = Date.now();
    const initialVelocity = 0.45 + Math.random() * 0.25;
    let lastTickTime = 0;

    const animateSpin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / spinDuration);
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.rouletteRotation += (initialVelocity * (1 - easeOut));
      this.drawRouletteWheel();

      // Audio click ticks
      if (Date.now() - lastTickTime > (40 + easeOut * 240)) {
        this.audio.playRouletteTick();
        lastTickTime = Date.now();
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.isSpinning = false;
        if (this.btnSpinRoulette) this.btnSpinRoulette.disabled = false;
        this.audio.playRouletteWin();
        this.audio.triggerConfetti();
        this.displayLandedWOD(this.selectedWOD);
      }
    };

    requestAnimationFrame(animateSpin);
  }

  displayLandedWOD(wod) {
    if (!this.landedWODCard || !wod) return;

    const diffBadge = document.getElementById("wodDifficultyBadge");
    if (diffBadge) {
      diffBadge.textContent = wod.difficulty;
      diffBadge.className = `wod-diff-badge badge-${wod.difficulty.toLowerCase()}`;
    }

    const catBadge = document.getElementById("wodCategoryBadge");
    if (catBadge) catBadge.textContent = wod.category;

    const formatBadge = document.getElementById("wodFormatBadge");
    if (formatBadge) formatBadge.textContent = wod.format;

    const timeTag = document.getElementById("wodRxTimeTag");
    if (timeTag) timeTag.textContent = wod.format.includes("AMRAP") ? wod.format : "Time Cap: 20-30m";

    const titleEl = document.getElementById("wodNameTitle");
    if (titleEl) titleEl.textContent = wod.name;

    const descEl = document.getElementById("wodDescriptionText");
    if (descEl) descEl.textContent = wod.description;

    const rxM = document.getElementById("wodRxMaleText");
    if (rxM) rxM.textContent = wod.rxMale;

    const rxF = document.getElementById("wodRxFemaleText");
    if (rxF) rxF.textContent = wod.rxFemale;

    const listEl = document.getElementById("wodMovementsList");
    if (listEl && wod.movements) {
      listEl.innerHTML = wod.movements.map(m => `
        <div class="wod-move-item">
          <span style="color: var(--red-primary); font-weight: 800;">⚡</span>
          <span>${m}</span>
        </div>
      `).join("");
    }

    this.landedWODCard.style.display = "block";
    this.landedWODCard.scrollIntoView({ behavior: "smooth" });
    this.showToast(`🎰 Đã chọn WOD: ${wod.name}!`);
  }

  handleLoadWodToWorkout() {
    if (!this.selectedWOD) return;

    // Build circuit block on active day
    const weekData = (this.activeProgram.weeks && this.activeProgram.weeks[this.currentWeek])
      ? this.activeProgram.weeks[this.currentWeek]
      : null;
    const activeDay = (weekData && weekData.days) ? weekData.days[this.currentDayIndex] : null;

    if (activeDay) {
      activeDay.type = "circuit";
      activeDay.title = `CrossFit WOD: ${this.selectedWOD.name}`;
      activeDay.circuitData = {
        title: this.selectedWOD.name,
        format: this.selectedWOD.format,
        items: this.selectedWOD.movements.map((m, idx) => ({ id: `wod_m_${idx}`, name: m }))
      };
    }

    this.switchTab("workout");
    this.showToast(`🚀 Đã nạp "${this.selectedWOD.name}" vào Buổi tập!`);
  }

  // =========================================================================
  // MODALS & ADVANCED CALCULATORS
  // =========================================================================
  openPlateAnd1RMModal(initialKg = 100) {
    const inputPlate = document.getElementById("inputTargetPlateKg");
    const input1RMW = document.getElementById("input1RMWeight");
    if (inputPlate) inputPlate.value = initialKg;
    if (input1RMW) input1RMW.value = initialKg;

    this.calculateBarbellPlates(initialKg);
    this.update1RMCalculations();
    this.openModal("modalPlateAnd1RM");
  }

  calculateBarbellPlates(totalKg) {
    const stack = document.getElementById("barbellPlatesStack");
    const pills = document.getElementById("platesPerSideDisplay");
    if (!stack || !pills) return;

    const barWeight = 20;
    let weightPerSide = Math.max(0, (totalKg - barWeight) / 2);

    const plateTypes = [
      { kg: 25, class: "plate-25k", label: "25kg" },
      { kg: 20, class: "plate-20k", label: "20kg" },
      { kg: 15, class: "plate-15k", label: "15kg" },
      { kg: 10, class: "plate-10k", label: "10kg" },
      { kg: 5, class: "plate-5k", label: "5kg" },
      { kg: 2.5, class: "plate-2_5k", label: "2.5kg" },
      { kg: 1.25, class: "plate-1_25k", label: "1.25kg" }
    ];

    const sidePlates = [];
    plateTypes.forEach(p => {
      while (weightPerSide >= p.kg - 0.001) {
        sidePlates.push(p);
        weightPerSide -= p.kg;
      }
    });

    stack.innerHTML = sidePlates.map(p => `<div class="plate-disc ${p.class}">${p.kg}</div>`).join("");

    if (sidePlates.length === 0) {
      pills.innerHTML = `<span style="font-size: 12px; color: var(--text-dim);">Chỉ cần thanh đòn không (20kg).</span>`;
    } else {
      const counts = {};
      sidePlates.forEach(p => counts[p.label] = (counts[p.label] || 0) + 1);
      pills.innerHTML = Object.entries(counts).map(([label, qty]) => `
        <span class="plate-pill-item">${qty} × <strong>${label}</strong></span>
      `).join("");
    }
  }

  update1RMCalculations() {
    const inputW = document.getElementById("input1RMWeight");
    const inputR = document.getElementById("input1RMReps");
    const resultBig = document.getElementById("calculated1RMResult");
    const tableBody = document.getElementById("rmTableBody");
    if (!inputW || !inputR || !resultBig || !tableBody) return;

    const w = parseFloat(inputW.value) || 0;
    const r = parseInt(inputR.value) || 0;

    if (w <= 0 || r <= 0) {
      resultBig.textContent = "0.0 kg";
      tableBody.innerHTML = "";
      return;
    }

    // Epley & Brzycki formula hybrid
    const e1rm = w * (1 + r / 30);
    const rounded1RM = Math.round(e1rm * 10) / 10;
    resultBig.textContent = `${rounded1RM} kg`;

    const percentages = [
      { pct: 100, reps: "1 Rep (Max)" },
      { pct: 95, reps: "2 Reps" },
      { pct: 90, reps: "3-4 Reps" },
      { pct: 85, reps: "5-6 Reps" },
      { pct: 80, reps: "7-8 Reps" },
      { pct: 75, reps: "9-10 Reps" },
      { pct: 70, reps: "11-12 Reps" },
      { pct: 60, reps: "15+ Reps" }
    ];

    tableBody.innerHTML = percentages.map(p => `
      <tr>
        <td style="font-weight: 800; color: var(--red-primary);">${p.pct}%</td>
        <td style="font-family: var(--font-mono); font-weight: 800; color: #fff;">${Math.round(rounded1RM * (p.pct / 100) * 10) / 10} kg</td>
        <td style="color: var(--text-muted);">${p.reps}</td>
      </tr>
    `).join("");
  }

  // Smart Fatigue Daily Check-in Modal
  openSmartFatigueModal() {
    this.openModal("modalSmartFatigueCheckin");
    this.updateCheckinRecommendations();
  }

  updateCheckinRecommendations() {
    const sleepBtn = document.querySelector(".btn-checkin-pill[data-sleep].active");
    const domsBtn = document.querySelector(".btn-checkin-pill[data-doms].active");
    const recBox = document.getElementById("checkinRecommendationBox");
    if (!recBox) return;

    const sleep = sleepBtn ? sleepBtn.dataset.sleep : "good";
    const doms = domsBtn ? domsBtn.dataset.doms : "none";

    if (sleep === "poor" || doms === "legs") {
      recBox.innerHTML = `
        <div style="font-weight: 800; font-size: 12px; color: var(--red-primary); text-transform: uppercase;">
          ⚠️ Khuyến nghị tự động điều chỉnh:
        </div>
        <div style="font-size: 12px; color: #fecaca; margin-top: 3px; line-height: 1.4;">
          ${doms === "legs" ? "• Đùi mỏi rõ rệt: Đổi Pin Squat sang Leg Press máy, giữ RIR 2." : ""}
          ${sleep === "poor" ? "• Ngủ kém (< 6h): Giảm 1 mức RIR ở tất cả các bài tập để tránh tích lũy kiệt sức." : ""}
        </div>
      `;
    } else if (sleep === "fair" || doms === "upper") {
      recBox.innerHTML = `
        <div style="font-weight: 800; font-size: 12px; color: var(--color-amber); text-transform: uppercase;">
          ⚡ Gợi ý thể trạng trung bình:
        </div>
        <div style="font-size: 12px; color: #fef08a; margin-top: 3px;">
          Tập trung warm-up kỹ khớp vai/gối. Giữ RIR 1-2 chuẩn, không đẩy quá ngưỡng failure.
        </div>
      `;
    } else {
      recBox.innerHTML = `
        <div style="font-weight: 800; font-size: 12px; color: var(--color-green); text-transform: uppercase;">
          ✓ Sẵn sàng tập luyện 100%:
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
          Thể trạng phục hồi tối ưu. Giữ nguyên mức tạ và chiến lược Overload.
        </div>
      `;
    }
  }

  handleConfirmCheckinAndStart() {
    const sleepBtn = document.querySelector(".btn-checkin-pill[data-sleep].active");
    const domsBtn = document.querySelector(".btn-checkin-pill[data-doms].active");
    const todayStr = new Date().toISOString().split("T")[0];

    this.storage.saveSmartFatigueCheckin(todayStr, {
      sleep: sleepBtn ? sleepBtn.dataset.sleep : "good",
      doms: domsBtn ? domsBtn.dataset.doms : "none"
    });

    this.closeAllModals();
    this.startWorkoutTimer();
  }

  // Clean Slate Program Builder
  openCleanProgramBuilder() {
    const list = document.getElementById("builderDaysListContainer");
    const form = document.getElementById("formProgramBuilder");
    if (form) form.reset();
    if (list) {
      list.innerHTML = `
        <div id="builderEmptyNotice" style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 14px; background: var(--bg-card); border-radius: var(--radius-sm);">
          Chưa có ngày tập nào. Bấm <strong>"+ Thêm Ngày"</strong> để bắt đầu tạo lịch tập cá nhân.
        </div>
      `;
    }
    this.openModal("modalProgramBuilder");
  }

  addDayToProgramBuilder() {
    const list = document.getElementById("builderDaysListContainer");
    const emptyNotice = document.getElementById("builderEmptyNotice");
    if (emptyNotice) emptyNotice.remove();

    const dayIndex = list.querySelectorAll(".builder-day-card").length;
    const card = document.createElement("div");
    card.className = "builder-day-card";
    card.dataset.dayIndex = dayIndex;

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; gap: 6px; align-items: center;">
          <select class="form-select b-day-key" style="width: 80px; padding: 5px;">
            <option value="T2">T2</option>
            <option value="T3">T3</option>
            <option value="T4">T4</option>
            <option value="T5">T5</option>
            <option value="T6">T6</option>
            <option value="T7">T7</option>
            <option value="CN">CN</option>
          </select>
          <input type="text" class="form-input b-day-title" placeholder="Tên ngày tập (VD: Push Day)" style="padding: 5px 8px;" required>
        </div>
        <button type="button" class="btn-del-day-mini" style="background: transparent; border: none; color: var(--red-primary); cursor: pointer; font-size: 12px;">✕ Xóa</button>
      </div>

      <div style="display: flex; gap: 6px; margin-bottom: 8px;">
        <select class="form-select b-day-type" style="padding: 5px;">
          <option value="strength">Tập tạ (Strength / Gym)</option>
          <option value="run">Chạy bộ (Running)</option>
          <option value="circuit">Circuit / Hyrox</option>
          <option value="rest">Nghỉ ngơi (Rest)</option>
        </select>
        <button type="button" class="btn-builder-add-mini b-btn-add-ex">+ Thêm Bài</button>
      </div>

      <div class="b-day-exercises-container" style="display: flex; flex-direction: column; gap: 6px;">
        <!-- Exercise rows -->
      </div>
    `;

    card.querySelector(".btn-del-day-mini").addEventListener("click", () => card.remove());

    const exContainer = card.querySelector(".b-day-exercises-container");
    card.querySelector(".b-btn-add-ex").addEventListener("click", () => {
      const exRow = document.createElement("div");
      exRow.className = "b-ex-row";
      exRow.style.display = "flex";
      exRow.style.gap = "6px";
      exRow.style.alignItems = "center";
      exRow.innerHTML = `
        <input type="text" class="form-input b-ex-name" placeholder="Tên bài tập" style="flex: 1.5; padding: 4px 6px;" required>
        <input type="text" class="form-input b-ex-sets" placeholder="2 sets" style="flex: 0.8; padding: 4px 6px;" value="2">
        <input type="text" class="form-input b-ex-reps" placeholder="6-10" style="flex: 0.8; padding: 4px 6px;" value="6-10">
        <button type="button" class="btn-del-ex-mini" style="background: transparent; border: none; color: var(--text-dim); cursor: pointer;">✕</button>
      `;
      exRow.querySelector(".btn-del-ex-mini").addEventListener("click", () => exRow.remove());
      exContainer.appendChild(exRow);
    });

    list.appendChild(card);
  }

  handleSaveCustomProgram() {
    const nameInput = document.getElementById("inputProgName");
    const descInput = document.getElementById("inputProgDesc");
    const rotSelect = document.getElementById("selectProgRotation");
    const list = document.getElementById("builderDaysListContainer");

    const name = nameInput.value.trim();
    const desc = descInput.value.trim();
    const rotation = parseInt(rotSelect.value) || 1;

    const dayCards = list.querySelectorAll(".builder-day-card");
    if (dayCards.length === 0) {
      alert("Vui lòng thêm ít nhất 1 ngày tập!");
      return;
    }

    const days = [];
    dayCards.forEach((dc, idx) => {
      const key = dc.querySelector(".b-day-key").value;
      const title = dc.querySelector(".b-day-title").value.trim() || `Day ${idx + 1}`;
      const type = dc.querySelector(".b-day-type").value;

      const exercises = [];
      dc.querySelectorAll(".b-ex-row").forEach((er, eIdx) => {
        const exName = er.querySelector(".b-ex-name").value.trim();
        const setsCount = parseInt(er.querySelector(".b-ex-sets").value) || 2;
        const reps = er.querySelector(".b-ex-reps").value.trim() || "6-10";

        if (exName) {
          const defaultSets = [];
          for (let s = 1; s <= setsCount; s++) {
            defaultSets.push({ setNum: s, reps, rir: "RIR 1", restSec: 120 });
          }
          exercises.push({
            id: `custom_ex_${Date.now()}_${eIdx}`,
            name: exName,
            category: "Custom",
            defaultSets
          });
        }
      });

      days.push({
        dayIndex: idx,
        dayKey: key,
        title: title,
        type: type,
        badge: title,
        exercises: exercises
      });
    });

    const newProg = {
      id: "custom_prog_" + Date.now(),
      name: name,
      description: desc || "Giáo án cá nhân tùy biến",
      rotationWeeks: rotation,
      isBuiltIn: false,
      weeks: {
        A: {
          id: "A",
          title: "Week A",
          days: days
        }
      }
    };

    this.storage.saveCustomProgram(newProg);
    this.storage.setActiveProgramId(newProg.id);
    this.activeProgram = newProg;
    this.closeAllModals();
    this.renderAll();
    this.showToast(`🎉 Đã tạo và kích hoạt giáo án: ${name}!`);
    this.switchTab("workout");
  }

  renderProgramsListModal() {
    const container = document.getElementById("programsListContainerModal");
    if (!container) return;

    const programs = this.storage.getPrograms();
    const activeId = this.storage.getActiveProgramId();

    container.innerHTML = "";
    programs.forEach(prog => {
      const isActive = prog.id === activeId;
      const card = document.createElement("div");
      card.className = `program-card ${isActive ? "active" : ""}`;
      card.style.background = "#0d0d0d";
      card.style.border = "1px solid var(--border-subtle)";
      card.style.borderRadius = "var(--radius-md)";
      card.style.padding = "12px";

      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 800; font-size: 14px; color: var(--text-white);">${prog.name}</span>
          ${isActive ? `<span style="font-size: 11px; font-weight: 800; color: var(--red-primary);">✓ Đang Tập</span>` : ""}
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">${prog.description || 'Chương trình tập luyện'}</div>
        <div style="display: flex; gap: 6px;">
          ${!isActive ? `<button class="btn-day-action btn-act-p" style="padding: 6px 12px; font-size: 11.5px;">Kích Hoạt</button>` : ""}
          ${!prog.isBuiltIn ? `<button class="btn-day-action secondary btn-del-p" style="padding: 6px 12px; font-size: 11.5px; color: var(--red-primary);">Xóa</button>` : ""}
        </div>
      `;

      const btnAct = card.querySelector(".btn-act-p");
      if (btnAct) {
        btnAct.addEventListener("click", () => {
          this.storage.setActiveProgramId(prog.id);
          this.activeProgram = prog;
          this.closeAllModals();
          this.renderAll();
          this.showToast(`Đã kích hoạt: ${prog.name}`);
        });
      }

      const btnDel = card.querySelector(".btn-del-p");
      if (btnDel) {
        btnDel.addEventListener("click", () => {
          if (confirm(`Xóa giáo án "${prog.name}"?`)) {
            this.storage.deleteProgram(prog.id);
            this.renderProgramsListModal();
            this.showToast("Đã xóa giáo án.");
          }
        });
      }

      container.appendChild(card);
    });
  }

  // Exercise Detail Modal
  openExerciseDetailModal(exercise) {
    this.selectedExerciseForDetail = exercise;
    const detail = (this.data.exerciseDetails && this.data.exerciseDetails[exercise.id]) || {
      name: exercise.name,
      category: exercise.category || "Compound",
      primaryMuscles: "Toàn thân",
      formCues: "Thực hiện chuyển động kiểm soát và chuẩn form.",
      progressionTip: "Tăng tạ khi đạt đủ số reps ở set cuối."
    };

    const nameEl = document.getElementById("modalExDetailName");
    if (nameEl) nameEl.textContent = detail.name || exercise.name;

    const catEl = document.getElementById("modalExDetailCategory");
    if (catEl) catEl.textContent = detail.category || exercise.category;

    const targetEl = document.getElementById("modalExDetailTarget");
    if (targetEl) targetEl.textContent = exercise.targetRequirement || "2 sets × 6-10 reps @ RIR 0-1";

    const musclesEl = document.getElementById("modalExDetailMuscles");
    if (musclesEl) musclesEl.textContent = detail.primaryMuscles || "Toàn thân";

    const cuesEl = document.getElementById("modalExDetailCues");
    if (cuesEl) cuesEl.innerHTML = `${detail.formCues}<br><br><strong>Tiêu chuẩn Overload:</strong> ${detail.progressionTip}`;

    const historyList = document.getElementById("exerciseDetailHistoryList");
    const history = this.storage.getLiftHistory(exercise.id);

    if (historyList) {
      if (history.length === 0) {
        historyList.innerHTML = `<div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 10px;">Chưa có lịch sử tập cho bài này.</div>`;
      } else {
        historyList.innerHTML = history.slice(0, 5).map(item => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: #0a0a0a; padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px;">
            <div>
              <span style="font-weight: 800; color: #fff;">${item.weightKg} kg</span>
              <span style="color: var(--text-muted);">× ${item.reps} reps</span>
              <span style="color: var(--color-amber); font-size: 10.5px;">(${item.rir})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-family: var(--font-mono); color: var(--color-green); font-size: 11px;">e1RM: ${item.e1rm}k</span>
              <span style="font-size: 10px; color: var(--text-dim);">${item.date}</span>
            </div>
          </div>
        `).join("");
      }
    }

    if (window.DinoCharts) {
      setTimeout(() => {
        window.DinoCharts.renderOverloadChart("canvasExerciseDetail", history, detail.name);
      }, 80);
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
      { id: "leg_press", name: "Leg Press", category: "Lower", reason: "Bài tập thay thế an toàn cho khớp gối và lưng dưới" },
      { id: "lat_pulldown", name: "Lat Pulldown", category: "Upper", reason: "Điều chỉnh mức tạ chính xác theo reps" }
    ];

    container.innerHTML = "";
    swaps.forEach(opt => {
      const card = document.createElement("div");
      card.className = "swap-option-card";
      card.style.background = "#0d0d0d";
      card.style.border = "1px solid var(--border-subtle)";
      card.style.borderRadius = "var(--radius-md)";
      card.style.padding = "10px";
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
          <span style="font-weight: 800; font-size: 13.5px; color: #fff;">${opt.name}</span>
          <span class="prog-badge">${opt.category || 'Swap'}</span>
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted);">💡 ${opt.reason}</div>
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

  // Post-Workout Summary Celebration
  openPostWorkoutSummary() {
    const weekData = (this.activeProgram.weeks && this.activeProgram.weeks[this.currentWeek])
      ? this.activeProgram.weeks[this.currentWeek]
      : null;
    const activeDay = (weekData && weekData.days) ? weekData.days[this.currentDayIndex] : null;

    const subtitleEl = document.getElementById("summaryWorkoutTitleSubtitle");
    if (subtitleEl && activeDay) {
      subtitleEl.textContent = `${activeDay.dayKey} • ${activeDay.title}`;
    }

    const sessionSetsMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_SETS) || "{}");
    const runDraft = this.storage.getSessionRunData(this.activeProgram.id, this.currentWeek, this.currentDayIndex) || {};

    let totalVolume = 0;
    let totalSets = 0;
    let prCount = 0;
    const completedExercises = [];

    if (activeDay && activeDay.exercises) {
      const swappedMap = this.storage.getSwappedExercises(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);
      activeDay.exercises.forEach(origEx => {
        const effectiveEx = swappedMap[origEx.id] || origEx;
        const key = this.storage.getExerciseSessionKey(this.activeProgram.id, this.currentWeek, activeDay.dayIndex, effectiveEx.id);
        const sets = sessionSetsMap[key] || [];

        const doneSets = sets.filter(s => s.isCompleted && parseFloat(s.weightKg) > 0);
        if (doneSets.length > 0) {
          totalSets += doneSets.length;
          const setsSummaryStr = doneSets.map(s => `${s.weightKg}k×${s.reps}`).join(", ");
          doneSets.forEach(s => {
            totalVolume += (parseFloat(s.weightKg) || 0) * (parseInt(s.reps) || 0);
            if (s.progressStatus === "overload") prCount++;
          });
          completedExercises.push({ name: effectiveEx.name, sets: `${doneSets.length} sets (${setsSummaryStr})` });
        }
      });
    }

    const elapsedSec = this.timer.getSessionElapsedSeconds();
    const durationMins = Math.max(1, Math.round(elapsedSec / 60));

    const totalVolEl = document.getElementById("summaryTotalVolume");
    if (totalVolEl) totalVolEl.textContent = `${totalVolume.toLocaleString()} kg`;

    const totalSetsEl = document.getElementById("summaryTotalSets");
    if (totalSetsEl) totalSetsEl.textContent = `${totalSets} sets`;

    const durationEl = document.getElementById("summaryDuration");
    if (durationEl) durationEl.textContent = this.timer.formatSessionTime(elapsedSec);

    const prEl = document.getElementById("summaryPrCount");
    if (prEl) prEl.textContent = `${prCount} PRs`;

    const distanceCard = document.getElementById("summaryMetricCardDistance");
    const paceCard = document.getElementById("summaryMetricCardPace");
    const totalDistEl = document.getElementById("summaryTotalDistance");
    const avgPaceEl = document.getElementById("summaryAveragePace");

    if (runDraft.distanceKm && parseFloat(runDraft.distanceKm) > 0) {
      if (distanceCard) distanceCard.style.display = "block";
      if (paceCard) paceCard.style.display = "block";
      if (totalDistEl) totalDistEl.textContent = `${runDraft.distanceKm} km`;
      if (avgPaceEl) avgPaceEl.textContent = runDraft.pace || "--:--/km";
    } else {
      if (distanceCard) distanceCard.style.display = "none";
      if (paceCard) paceCard.style.display = "none";
    }

    const exListEl = document.getElementById("summaryExercisesList");
    if (exListEl) {
      if (completedExercises.length === 0 && !runDraft.distanceKm) {
        exListEl.innerHTML = `<div style="font-size: 12px; color: var(--text-dim);">Chưa có set nào được tích hoàn thành.</div>`;
      } else {
        exListEl.innerHTML = completedExercises.map(e => `
          <div style="font-size: 12px; color: var(--text-white); margin-bottom: 3px;">
            • <strong>${e.name}:</strong> <span style="color: var(--text-muted);">${e.sets}</span>
          </div>
        `).join("");
      }
    }

    const notes = this.storage.getSessionNotes(this.activeProgram.id, this.currentWeek, activeDay ? activeDay.dayIndex : 0);
    const notesEl = document.getElementById("summaryNotesDisplay");
    if (notesEl) {
      notesEl.textContent = notes || "Không có ghi chú.";
    }

    this.audio.playVictoryFanfare();
    this.audio.triggerConfetti();
    this.openModal("modalWorkoutSummary");
  }

  handleConfirmSaveWorkout() {
    const weekData = (this.activeProgram.weeks && this.activeProgram.weeks[this.currentWeek])
      ? this.activeProgram.weeks[this.currentWeek]
      : null;
    const activeDay = (weekData && weekData.days) ? weekData.days[this.currentDayIndex] : null;
    if (!activeDay) return;

    const sessionSetsMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_SETS) || "{}");
    const runDraft = this.storage.getSessionRunData(this.activeProgram.id, this.currentWeek, this.currentDayIndex) || {};

    let totalVolume = 0;
    let totalSets = 0;
    let prCount = 0;
    const completedExercises = [];

    if (activeDay.exercises) {
      const swappedMap = this.storage.getSwappedExercises(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);
      activeDay.exercises.forEach(origEx => {
        const effectiveEx = swappedMap[origEx.id] || origEx;
        const key = this.storage.getExerciseSessionKey(this.activeProgram.id, this.currentWeek, activeDay.dayIndex, effectiveEx.id);
        const sets = sessionSetsMap[key] || [];

        const doneSets = sets.filter(s => s.isCompleted && parseFloat(s.weightKg) > 0);
        if (doneSets.length > 0) {
          totalSets += doneSets.length;
          const setsSummaryStr = doneSets.map(s => `${s.weightKg}k×${s.reps}`).join(", ");
          doneSets.forEach(s => {
            totalVolume += (parseFloat(s.weightKg) || 0) * (parseInt(s.reps) || 0);
            if (s.progressStatus === "overload") prCount++;
          });
          completedExercises.push({ name: effectiveEx.name, sets: `${doneSets.length} sets (${setsSummaryStr})` });
        }
      });
    }

    const elapsedSec = this.timer.getSessionElapsedSeconds();
    const durationMins = Math.max(1, Math.round(elapsedSec / 60));
    const notes = this.storage.getSessionNotes(this.activeProgram.id, this.currentWeek, activeDay.dayIndex);

    const record = {
      programId: this.activeProgram.id,
      programName: this.activeProgram.name,
      weekId: this.currentWeek,
      dayKey: activeDay.dayKey,
      dayTitle: activeDay.title,
      durationMinutes: durationMins,
      totalVolumeKg: totalVolume,
      totalSetsCount: totalSets,
      totalDistanceKm: parseFloat(runDraft.distanceKm) || 0,
      exercises: completedExercises,
      runDetail: runDraft.distanceKm ? runDraft : null,
      notes: notes,
      prCount: prCount
    };

    this.storage.archiveWorkoutSession(record);
    this.storage.setDayCompleted(this.activeProgram.id, this.currentWeek, activeDay.dayIndex, true);
    this.timer.stopSession();

    this.closeAllModals();
    this.showToast("🏆 Buổi tập đã hoàn tất & lưu trữ thành công!");
    this.switchTab("stats");
  }

  // =========================================================================
  // TAB 4: RULES & RECOVERY
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
            <span class="prog-badge" style="color: var(--red-primary);">${r.badge}</span>
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
  // AI COACH MODAL CONTROLLER
  // =========================================================================
  renderAIQuickPrompts() {
    const container = document.getElementById("aiQuickPromptsContainerModal");
    if (!container || !this.data.aiCoachPrompts) return;
    container.innerHTML = "";

    this.data.aiCoachPrompts.forEach(p => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ai-prompt-chip";
      chip.textContent = p.label;
      chip.addEventListener("click", () => {
        this.sendAICoachQuery(p.prompt);
      });
      container.appendChild(chip);
    });
  }

  renderAIChatMessages() {
    const container = document.getElementById("aiChatHistoryModal");
    if (!container) return;
    const history = this.storage.getAIChatHistory();

    if (history.length === 0) {
      container.innerHTML = `
        <div class="ai-msg-row">
          <div class="ai-bubble assistant">
            <h3 style="font-family: var(--font-heading); font-size: 15px; margin-bottom: 4px;">⚡ Xin chào Athlete!</h3>
            Tôi là <strong>Dino AI Coach</strong>. Tôi phân tích lịch sử tập luyện, tải tạ, giấc ngủ và trả lời mọi câu hỏi về dinh dưỡng, phục hồi hay chiến thuật chạy Half-Marathon!
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = history.map(msg => `
      <div class="ai-msg-row ${msg.role === 'user' ? 'user' : ''}">
        <div class="ai-bubble ${msg.role === 'user' ? 'user' : 'assistant'}">
          ${msg.role === 'user' ? msg.content.replace(/\n/g, '<br>') : this.formatMarkdown(msg.content)}
        </div>
      </div>
    `).join("");

    container.scrollTop = container.scrollHeight;
  }

  formatMarkdown(text) {
    if (!text) return "";
    let html = text;
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size: 13.5px; margin: 6px 0 2px 0;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="font-size: 14.5px; margin: 8px 0 4px 0;">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code style="background:#222; padding:1px 4px; border-radius:3px;">$1</code>');
    html = html.replace(/^\s*[-•]\s+(.*$)/gim, '<li style="margin-left: 14px;">$1</li>');
    html = html.replace(/\n\n+/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  async sendAICoachQuery(queryText) {
    if (!queryText || !queryText.trim()) return;

    const history = this.storage.getAIChatHistory();
    history.push({ role: "user", content: queryText });
    this.storage.saveAIChatHistory(history);
    this.renderAIChatMessages();

    const container = document.getElementById("aiChatHistoryModal");
    if (container) {
      const typingRow = document.createElement("div");
      typingRow.className = "ai-msg-row typing-row";
      typingRow.innerHTML = `<div class="ai-bubble assistant"><em>Coach đang phân tích dữ liệu... ⚡</em></div>`;
      container.appendChild(typingRow);
      container.scrollTop = container.scrollHeight;
    }

    const response = await this.aiCoach.generateResponse(queryText);

    const updatedHistory = this.storage.getAIChatHistory();
    updatedHistory.push({ role: "assistant", content: response });
    this.storage.saveAIChatHistory(updatedHistory);
    this.renderAIChatMessages();
  }

  // Settings Modal
  openSettingsModal() {
    const modal = document.getElementById("modalSettings");
    if (!modal) return;

    const settings = this.storage.getSettings();
    const soundToggle = document.getElementById("settingSound");
    const vibrateToggle = document.getElementById("settingVibrate");
    const smartFatigueToggle = document.getElementById("settingSmartFatigue");

    if (soundToggle) {
      soundToggle.checked = settings.sound !== false;
      soundToggle.onchange = () => this.storage.updateSettings({ sound: soundToggle.checked });
    }
    if (vibrateToggle) {
      vibrateToggle.checked = settings.vibrate !== false;
      vibrateToggle.onchange = () => this.storage.updateSettings({ vibrate: vibrateToggle.checked });
    }
    if (smartFatigueToggle) {
      smartFatigueToggle.checked = settings.enableSmartFatigue !== false;
      smartFatigueToggle.onchange = () => this.storage.updateSettings({ enableSmartFatigue: smartFatigueToggle.checked });
    }

    const inputCloudAthleteId = document.getElementById("inputCloudAthleteId");
    const btnSaveCloudAthleteId = document.getElementById("btnSaveCloudAthleteId");
    if (inputCloudAthleteId && this.supabaseSync) {
      inputCloudAthleteId.value = this.supabaseSync.getUserId();
      if (btnSaveCloudAthleteId) {
        btnSaveCloudAthleteId.onclick = () => {
          const val = (inputCloudAthleteId.value || "").trim();
          if (val) {
            this.supabaseSync.setUserId(val);
            this.showToast(`Đã đổi Athlete Sync ID: "${val}"`);
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

    this.openModal("modalSettings");
  }

  updateCloudSyncDisplay(detail) {
    if (!this.cloudSyncBadge) return;
    const { status, message, lastSyncedAt } = detail;
    this.cloudSyncBadge.className = `cloud-sync-pill ${status}`;

    if (this.cloudSyncText) {
      if (status === "synced") this.cloudSyncText.textContent = "Cloud";
      else if (status === "syncing") this.cloudSyncText.textContent = "Syncing...";
      else if (status === "offline") this.cloudSyncText.textContent = "Offline";
      else if (status === "error") this.cloudSyncText.textContent = "Error";
    }

    const settingsCloudPill = document.getElementById("settingsCloudPill");
    if (settingsCloudPill) {
      settingsCloudPill.className = `cloud-status-pill ${status}`;
      if (status === "synced") settingsCloudPill.textContent = "● Đã kết nối Cloud";
      else if (status === "syncing") settingsCloudPill.textContent = "● Đang đồng bộ...";
      else if (status === "offline") settingsCloudPill.textContent = "● Ngoại tuyến (Offline)";
      else settingsCloudPill.textContent = "● Lỗi kết nối";
    }
  }

  // Modals Controller
  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add("open");
  }

  closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
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
