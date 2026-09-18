/**
 * Dino Tracking - Storage & Dynamic Analytics Engine
 * Manages Multi-Program storage, Hevy-style Session sets, Workout History with dynamic recalculation,
 * Overload progression, Smart Fatigue settings, and Supabase cloud sync snapshotting.
 */

const STORAGE_KEYS = {
  PROGRAMS: "dino_programs_v5",
  ACTIVE_PROGRAM_ID: "dino_active_program_id_v5",
  ACTIVE_WEEK: "dino_active_week_v5",
  ACTIVE_DAY_INDEX: "dino_active_day_index_v5",
  COMPLETED_DAYS: "dino_completed_days_v5",
  COMPLETED_CHECKLIST: "dino_completed_checklist_v5",
  DAY_SELECTED_OPTIONS: "dino_day_selected_options_v5",
  SESSION_SETS: "dino_session_sets_v5",
  SESSION_RUN_DATA: "dino_session_run_data_v5",
  SWAPPED_EXERCISES: "dino_swapped_exercises_v5",
  SESSION_NOTES: "dino_session_notes_v5",
  ACTIVE_CIRCUIT_STATE: "dino_active_circuit_state_v5",
  AI_CHAT_HISTORY: "dino_ai_chat_v5",
  WORKOUT_HISTORY: "dino_workout_history_v5",
  OVERLOAD_LOGS: "dino_overload_logs_v5",
  RUN_LOGS: "dino_run_logs_v5",
  SMART_FATIGUE_LOGS: "dino_smart_fatigue_logs_v5",
  SETTINGS: "dino_settings_v5"
};

class DinoStorage {
  constructor() {
    this.initDefaults();
  }

  initDefaults() {
    // 1. Programs initialization
    if (!localStorage.getItem(STORAGE_KEYS.PROGRAMS)) {
      const defaultProgs = (window.DEFAULT_PROGRAMS || []);
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(defaultProgs));
    }

    // 2. Active Program ID
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, "dino_hybrid_1");
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WEEK, "A");
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_DAY_INDEX)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY_INDEX, "1"); // T3 Full Body Strength
    }

    if (!localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS)) {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.COMPLETED_CHECKLIST)) {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_CHECKLIST, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.DAY_SELECTED_OPTIONS)) {
      localStorage.setItem(STORAGE_KEYS.DAY_SELECTED_OPTIONS, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SESSION_SETS)) {
      localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.OVERLOAD_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.OVERLOAD_LOGS, JSON.stringify({}));
    }

    if (!localStorage.getItem(STORAGE_KEYS.RUN_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.RUN_LOGS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        sound: true,
        vibrate: true,
        enableSmartFatigue: true,
        restTimerDuration: 150,
        rpTimerDuration: 15
      }));
    }
  }

  // =========================================================================
  // MULTI-PROGRAM MANAGEMENT (Program Builder)
  // =========================================================================
  getPrograms() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]");
  }

  getActiveProgramId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID) || "dino_hybrid_1";
  }

  setActiveProgramId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, id);
    this.setActiveDayIndex(0);
    this.setActiveWeek("A");
  }

  getActiveProgram() {
    const progs = this.getPrograms();
    const activeId = this.getActiveProgramId();
    const found = progs.find(p => p.id === activeId);
    return found || progs[0] || (window.DEFAULT_PROGRAMS ? window.DEFAULT_PROGRAMS[0] : null);
  }

  saveCustomProgram(program) {
    const progs = this.getPrograms();
    const existingIdx = progs.findIndex(p => p.id === program.id);

    if (existingIdx >= 0) {
      progs[existingIdx] = program;
    } else {
      progs.push(program);
    }

    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(progs));
    this.triggerSync();
    return program;
  }

  deleteProgram(programId) {
    let progs = this.getPrograms();
    if (programId === "dino_hybrid_1") return false; // built-in preset protected
    progs = progs.filter(p => p.id !== programId);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(progs));

    if (this.getActiveProgramId() === programId) {
      this.setActiveProgramId("dino_hybrid_1");
    }
    this.triggerSync();
    return true;
  }

  // ATHLETE CONTEXT SUMMARY FOR AI COACH
  getAthleteContextSummary() {
    const activeProgram = this.getActiveProgram();
    const activeWeek = this.getActiveWeek();
    const activeDayIndex = this.getActiveDayIndex();
    const history = this.getWorkoutHistory();
    const runs = this.getRunLogs();
    const stats = this.getHistoryStats("all");
    const overloadLogs = this.getOverloadLogs();

    const coreExerciseKeys = ["pin_squat", "pull_up", "incline_db_bench", "leg_curl", "lateral_raise", "leg_press", "chest_supported_row"];
    const bestLifts = {};

    coreExerciseKeys.forEach(key => {
      const logs = overloadLogs[key] || [];
      if (logs.length > 0) {
        let bestEntry = logs[0];
        logs.forEach(l => {
          if ((l.e1rm || 0) > (bestEntry.e1rm || 0)) bestEntry = l;
        });
        bestLifts[key] = {
          name: bestEntry.exerciseName || key,
          weightKg: bestEntry.weightKg,
          reps: bestEntry.reps,
          rir: bestEntry.rir,
          e1rm: bestEntry.e1rm,
          date: bestEntry.date
        };
      }
    });

    const recentNotes = [];
    history.slice(0, 5).forEach(h => {
      if (h.notes && h.notes.trim().length > 0) {
        recentNotes.push({ date: h.date, workout: h.dayTitle, text: h.notes });
      }
    });

    let weekKm = 0;
    runs.slice(0, 5).forEach(r => {
      if (r.week === activeWeek) weekKm += (parseFloat(r.distanceKm) || 0);
    });

    return {
      activeProgramName: activeProgram ? activeProgram.name : "Dino Hybrid 1.0",
      activeProgramTarget: activeProgram ? activeProgram.target : "Hybrid Athlete Performance",
      activeWeek,
      activeDayIndex,
      stats,
      recentWorkouts: history.slice(0, 5),
      recentRuns: runs.slice(0, 5),
      bestLifts,
      recentNotes,
      weekRunningKm: Math.round(weekKm * 10) / 10
    };
  }

  // Active Week & Day Navigation
  getActiveWeek() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK) || "A";
  }

  setActiveWeek(week) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WEEK, week);
  }

  getActiveDayIndex() {
    const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_DAY_INDEX);
    return val !== null ? parseInt(val) : 0;
  }

  setActiveDayIndex(dayIndex) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY_INDEX, String(dayIndex));
  }

  // Day Completion Status
  getDayKey(programId, week, dayIndex) {
    return `${programId}_${week}-${dayIndex}`;
  }

  isDayCompleted(programId, week, dayIndex) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS) || "{}");
    return !!data[this.getDayKey(programId, week, dayIndex)];
  }

  setDayCompleted(programId, week, dayIndex, isCompleted) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS) || "{}");
    const key = this.getDayKey(programId, week, dayIndex);
    if (isCompleted) {
      data[key] = {
        completed: true,
        timestamp: new Date().toISOString()
      };
    } else {
      delete data[key];
    }
    localStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify(data));
    this.triggerSync();
  }

  // Selected Option (e.g. Option A vs Option B)
  getSelectedOption(programId, week, dayIndex) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAY_SELECTED_OPTIONS) || "{}");
    return data[this.getDayKey(programId, week, dayIndex)] || null;
  }

  setSelectedOption(programId, week, dayIndex, optionId) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAY_SELECTED_OPTIONS) || "{}");
    data[this.getDayKey(programId, week, dayIndex)] = optionId;
    localStorage.setItem(STORAGE_KEYS.DAY_SELECTED_OPTIONS, JSON.stringify(data));
    this.triggerSync();
  }

  // Checklist Item Completion
  isChecklistCompleted(itemId) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHECKLIST) || "{}");
    return !!data[itemId];
  }

  setChecklistCompleted(itemId, isCompleted) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHECKLIST) || "{}");
    if (isCompleted) {
      data[itemId] = true;
    } else {
      delete data[itemId];
    }
    localStorage.setItem(STORAGE_KEYS.COMPLETED_CHECKLIST, JSON.stringify(data));
    this.triggerSync();
  }

  // =========================================================================
  // HEVY-STYLE DYNAMIC SETS & SESSION ENGINE
  // =========================================================================
  getExerciseSessionKey(programId, week, dayIndex, exerciseId) {
    return `${programId}_${week}-${dayIndex}_${exerciseId}`;
  }

  getSessionSets(programId, week, dayIndex, exercise) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_SETS) || "{}");
    const key = this.getExerciseSessionKey(programId, week, dayIndex, exercise.id);

    if (all[key] && all[key].length > 0) {
      return all[key];
    }

    // Default initialization from program exercise data
    const initialSets = (exercise.defaultSets || [
      { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 150 },
      { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 150 }
    ]).map((s, idx) => {
      const prev = this.getPreviousPerformance(exercise.id, idx + 1);
      return {
        id: `set_${Date.now()}_${idx}`,
        setNum: idx + 1,
        targetReps: s.reps || "6-10",
        targetRir: s.rir || "RIR 1",
        weightKg: prev ? prev.weightKg : "",
        reps: prev ? prev.reps : "",
        rir: prev ? prev.rir : (s.rir || "RIR 1"),
        isRestPause: !!s.isRestPause,
        isCompleted: false,
        previous: prev
      };
    });

    all[key] = initialSets;
    localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify(all));
    return initialSets;
  }

  updateSessionSet(programId, week, dayIndex, exerciseId, setIndex, setData) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_SETS) || "{}");
    const key = this.getExerciseSessionKey(programId, week, dayIndex, exerciseId);
    if (!all[key]) return { progressStatus: "neutral" };

    if (all[key][setIndex]) {
      const current = all[key][setIndex];
      const prev = current.previous;

      // Evaluate progressive overload vs regression
      let progressStatus = "neutral";
      if (setData.isCompleted && parseFloat(setData.weightKg) > 0 && parseInt(setData.reps) > 0) {
        progressStatus = this.evaluateSetProgress(
          parseFloat(setData.weightKg),
          parseInt(setData.reps),
          setData.rir,
          prev
        );

        // Sync to Progressive Overload history
        this.logLiftSet(exerciseId, {
          programId: programId,
          week: week,
          setNum: current.setNum,
          weightKg: parseFloat(setData.weightKg),
          reps: parseInt(setData.reps),
          rir: setData.rir || "RIR 1",
          isRestPause: !!current.isRestPause
        });
      }

      all[key][setIndex] = {
        ...current,
        ...setData,
        e1rm: this.calculateE1RM(setData.weightKg, setData.reps, setData.rir),
        progressStatus
      };

      localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify(all));
      this.triggerSync();
      return { progressStatus, setRecord: all[key][setIndex] };
    }
    return { progressStatus: "neutral" };
  }

  addSessionSet(programId, week, dayIndex, exercise) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_SETS) || "{}");
    const key = this.getExerciseSessionKey(programId, week, dayIndex, exercise.id);
    const currentSets = all[key] || [];

    const newSetNum = currentSets.length + 1;
    const prev = this.getPreviousPerformance(exercise.id, newSetNum) || this.getPreviousPerformance(exercise.id, newSetNum - 1);
    const lastSet = currentSets[currentSets.length - 1];

    const newSet = {
      id: `set_${Date.now()}_${newSetNum}`,
      setNum: newSetNum,
      targetReps: lastSet ? lastSet.targetReps : "6-10",
      targetRir: lastSet ? lastSet.targetRir : "RIR 1",
      weightKg: lastSet ? lastSet.weightKg : (prev ? prev.weightKg : ""),
      reps: lastSet ? lastSet.reps : (prev ? prev.reps : ""),
      rir: lastSet ? lastSet.rir : "RIR 1",
      isRestPause: false,
      isCompleted: false,
      previous: prev
    };

    currentSets.push(newSet);
    all[key] = currentSets;
    localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify(all));
    this.triggerSync();
    return newSet;
  }

  deleteSessionSet(programId, week, dayIndex, exerciseId, setIndex) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_SETS) || "{}");
    const key = this.getExerciseSessionKey(programId, week, dayIndex, exerciseId);
    if (all[key]) {
      all[key].splice(setIndex, 1);
      all[key].forEach((s, idx) => s.setNum = idx + 1);
      localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify(all));
      this.triggerSync();
    }
  }

  evaluateSetProgress(weight, reps, rir, prev) {
    if (!prev || !prev.weightKg || !prev.reps) return "first_time";

    const currentE1rm = this.calculateE1RM(weight, reps, rir);
    const prevE1rm = prev.e1rm || this.calculateE1RM(prev.weightKg, prev.reps, prev.rir);

    // Overload: heavier weight, or more reps with same/heavier weight, or higher e1RM
    if (weight > prev.weightKg || (weight === prev.weightKg && reps > prev.reps) || currentE1rm > (prevE1rm + 0.5)) {
      return "overload";
    }

    // Regression: lower weight or less reps with same/lighter weight
    if (weight < prev.weightKg || (weight === prev.weightKg && reps < prev.reps) || currentE1rm < (prevE1rm - 1.5)) {
      return "regression";
    }

    return "equal";
  }

  getPreviousPerformance(exerciseId, setNum = null) {
    const history = this.getLiftHistory(exerciseId);
    if (!history || history.length === 0) return null;

    if (setNum) {
      const match = history.find(s => s.setNum === setNum);
      if (match) return match;
    }
    return history[0];
  }

  getExerciseBestPrevious(exerciseId) {
    const history = this.getLiftHistory(exerciseId);
    if (!history || history.length === 0) return null;
    return history[0];
  }

  // =========================================================================
  // EXERCISE SWAPPING & SESSION NOTES ENGINE
  // =========================================================================
  getSwappedExerciseKey(programId, week, dayIndex) {
    return `${programId}_${week}-${dayIndex}`;
  }

  getSwappedExercises(programId, week, dayIndex) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SWAPPED_EXERCISES) || "{}");
    const key = this.getSwappedExerciseKey(programId, week, dayIndex);
    return all[key] || {};
  }

  swapSessionExercise(programId, week, dayIndex, originalExId, newExercise) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SWAPPED_EXERCISES) || "{}");
    const key = this.getSwappedExerciseKey(programId, week, dayIndex);
    if (!all[key]) all[key] = {};

    all[key][originalExId] = newExercise;
    localStorage.setItem(STORAGE_KEYS.SWAPPED_EXERCISES, JSON.stringify(all));
    this.triggerSync();
    return newExercise;
  }

  getSessionNotes(programId, week, dayIndex) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_NOTES) || "{}");
    const key = this.getSwappedExerciseKey(programId, week, dayIndex);
    return all[key] || "";
  }

  setSessionNotes(programId, week, dayIndex, notes) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_NOTES) || "{}");
    const key = this.getSwappedExerciseKey(programId, week, dayIndex);
    all[key] = notes;
    localStorage.setItem(STORAGE_KEYS.SESSION_NOTES, JSON.stringify(all));
    this.triggerSync();
    return notes;
  }

  // Running Draft Data Persistence
  getSessionRunData(programId, week, dayIndex) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_RUN_DATA) || "{}");
    const key = this.getSwappedExerciseKey(programId, week, dayIndex);
    return all[key] || null;
  }

  setSessionRunData(programId, week, dayIndex, runData) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_RUN_DATA) || "{}");
    const key = this.getSwappedExerciseKey(programId, week, dayIndex);
    all[key] = {
      ...(all[key] || {}),
      ...runData,
      updatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.SESSION_RUN_DATA, JSON.stringify(all));
    this.triggerSync();
    return all[key];
  }

  // AI Coach Chat History
  getAIChatHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_CHAT_HISTORY) || "[]");
  }

  saveAIChatHistory(messages) {
    localStorage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(messages));
    this.triggerSync();
  }

  clearAIChatHistory() {
    localStorage.removeItem(STORAGE_KEYS.AI_CHAT_HISTORY);
    this.triggerSync();
  }

  // =========================================================================
  // WORKOUT HISTORY ARCHIVE & DYNAMIC STATS ENGINE (Automatic Recalculation)
  // =========================================================================
  getWorkoutHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY) || "[]");
  }

  archiveWorkoutSession(sessionData) {
    const history = this.getWorkoutHistory();
    const newRecord = {
      id: "hist_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      programId: sessionData.programId || this.getActiveProgramId(),
      programName: sessionData.programName || "Dino Hybrid 1.0",
      weekId: sessionData.weekId || this.getActiveWeek(),
      dayKey: sessionData.dayKey || "T3",
      dayTitle: sessionData.dayTitle || "Workout",
      date: sessionData.date || new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      durationMinutes: parseInt(sessionData.durationMinutes) || 50,
      totalVolumeKg: parseFloat(sessionData.totalVolumeKg) || 0,
      totalSetsCount: parseInt(sessionData.totalSetsCount) || 0,
      totalDistanceKm: parseFloat(sessionData.totalDistanceKm) || 0,
      exercises: sessionData.exercises || [],
      runDetail: sessionData.runDetail || null,
      notes: sessionData.notes || "",
      prCount: parseInt(sessionData.prCount) || 0,
      type: sessionData.type || "workout"
    };

    history.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));

    // Also sync to RUN_LOGS if distance is present
    if (newRecord.totalDistanceKm > 0 || newRecord.runDetail) {
      this.logRun({
        id: "run_" + newRecord.id,
        programId: newRecord.programId,
        week: newRecord.weekId,
        dayKey: newRecord.dayKey,
        distanceKm: newRecord.totalDistanceKm,
        durationMinutes: newRecord.durationMinutes,
        pace: newRecord.runDetail ? newRecord.runDetail.pace : `${Math.floor(newRecord.durationMinutes / (newRecord.totalDistanceKm || 1))}:00/km`,
        rpe: newRecord.runDetail ? newRecord.runDetail.rpe : "RPE 7.0",
        date: newRecord.date
      });
    }

    this.triggerSync();
    return newRecord;
  }

  // Deleting a workout record automatically cascades and cleans up linked run logs
  deleteHistoryRecord(recordId) {
    let history = this.getWorkoutHistory();
    history = history.filter(h => h.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));

    // Clean linked run log
    let runs = this.getRunLogs();
    runs = runs.filter(r => r.id !== ("run_" + recordId) && r.id !== ("run_hist_" + recordId));
    localStorage.setItem(STORAGE_KEYS.RUN_LOGS, JSON.stringify(runs));

    this.triggerSync();
  }

  getWorkoutDatesForMonth(year, month) {
    const history = this.getWorkoutHistory();
    const runs = this.getRunLogs();
    const dateSet = new Set();

    const monthStr = (month + 1 < 10 ? "0" : "") + (month + 1);
    const prefix = `${year}-${monthStr}`;

    history.forEach(h => {
      if (h.date && h.date.startsWith(prefix)) {
        dateSet.add(h.date);
      }
    });

    runs.forEach(r => {
      if (r.date && r.date.startsWith(prefix)) {
        dateSet.add(r.date);
      }
    });

    return dateSet;
  }

  // DYNAMIC TOTALS CALCULATION: Recalculates directly from active records
  getHistoryStats(filter = "all") {
    const history = this.getWorkoutHistory();
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Filter by timeframe if requested
    let filteredHistory = history;
    if (filter === "daily") {
      filteredHistory = history.filter(h => h.date === todayStr);
    } else if (filter === "week") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
      filteredHistory = history.filter(h => h.date >= sevenDaysAgo);
    } else if (filter === "month") {
      const monthPrefix = todayStr.substring(0, 7); // 'YYYY-MM'
      filteredHistory = history.filter(h => h.date && h.date.startsWith(monthPrefix));
    }

    let totalWorkouts = filteredHistory.length;
    let totalVolumeKg = 0;
    let totalDistanceKm = 0;
    let totalSets = 0;
    let totalPRs = 0;

    filteredHistory.forEach(h => {
      totalVolumeKg += (parseFloat(h.totalVolumeKg) || 0);
      totalDistanceKm += (parseFloat(h.totalDistanceKm) || 0);
      totalSets += (parseInt(h.totalSetsCount) || 0);
      totalPRs += (parseInt(h.prCount) || 0);
    });

    // Also account for any standalone runs
    const runs = this.getRunLogs();
    let filteredRuns = runs;
    if (filter === "daily") {
      filteredRuns = runs.filter(r => r.date === todayStr);
    } else if (filter === "week") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
      filteredRuns = runs.filter(r => r.date >= sevenDaysAgo);
    } else if (filter === "month") {
      const monthPrefix = todayStr.substring(0, 7);
      filteredRuns = runs.filter(r => r.date && r.date.startsWith(monthPrefix));
    }

    filteredRuns.forEach(r => {
      const isCountedInHistory = filteredHistory.some(h => (
        h.id === r.id.replace("run_", "") ||
        (h.date === r.date && Math.abs((parseFloat(h.totalDistanceKm) || 0) - (parseFloat(r.distanceKm) || 0)) < 0.01)
      ));
      if (!isCountedInHistory && r.distanceKm) {
        totalDistanceKm += parseFloat(r.distanceKm) || 0;
      }
    });

    return {
      totalWorkouts,
      totalVolumeKg: Math.round(totalVolumeKg),
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      totalSets,
      totalPRs
    };
  }

  // =========================================================================
  // PROGRESSIVE OVERLOAD TRACKER & PR ENGINE
  // =========================================================================
  getOverloadLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OVERLOAD_LOGS) || "{}");
  }

  getLiftHistory(liftId) {
    const all = this.getOverloadLogs();
    return all[liftId] || [];
  }

  logLiftSet(liftId, entry) {
    const all = this.getOverloadLogs();
    if (!all[liftId]) {
      all[liftId] = [];
    }

    const newEntry = {
      id: "set_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      date: entry.date || new Date().toISOString().split("T")[0],
      programId: entry.programId || this.getActiveProgramId(),
      week: entry.week || this.getActiveWeek(),
      setNum: entry.setNum || 1,
      weightKg: parseFloat(entry.weightKg) || 0,
      reps: parseInt(entry.reps) || 0,
      rir: entry.rir || "RIR 1",
      isRestPause: !!entry.isRestPause,
      e1rm: this.calculateE1RM(entry.weightKg, entry.reps, entry.rir),
      createdAt: new Date().toISOString()
    };

    all[liftId].unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.OVERLOAD_LOGS, JSON.stringify(all));
    this.triggerSync();
    return newEntry;
  }

  deleteLiftSet(liftId, setId) {
    const all = this.getOverloadLogs();
    if (all[liftId]) {
      all[liftId] = all[liftId].filter(s => s.id !== setId);
      localStorage.setItem(STORAGE_KEYS.OVERLOAD_LOGS, JSON.stringify(all));
      this.triggerSync();
    }
  }

  calculateE1RM(weight, reps, rirStr) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (w <= 0 || r <= 0) return 0;

    let rir = 0;
    if (typeof rirStr === "string") {
      if (rirStr.includes("0-1")) rir = 0.5;
      else if (rirStr.includes("0")) rir = 0;
      else if (rirStr.includes("1-2")) rir = 1.5;
      else if (rirStr.includes("1")) rir = 1;
      else if (rirStr.includes("2")) rir = 2;
    }

    const effectiveReps = r + rir;
    const e1rm = w * (1 + effectiveReps / 30);
    return Math.round(e1rm * 10) / 10;
  }

  // Running Logs
  getRunLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RUN_LOGS) || "[]");
  }

  logRun(runData) {
    const logs = this.getRunLogs();
    const newLog = {
      id: runData.id || ("run_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6)),
      date: runData.date || new Date().toISOString().split("T")[0],
      programId: runData.programId || this.getActiveProgramId(),
      week: runData.week || this.getActiveWeek(),
      dayKey: runData.dayKey || "T2",
      distanceKm: parseFloat(runData.distanceKm) || 0,
      durationMinutes: parseFloat(runData.durationMinutes) || 0,
      pace: runData.pace || this.calculatePace(runData.distanceKm, runData.durationMinutes),
      rpe: runData.rpe || "RPE 6",
      heartRate: runData.heartRate ? parseInt(runData.heartRate) : null,
      notes: runData.notes || "",
      createdAt: new Date().toISOString()
    };

    // Replace if exists, else prepend
    const existingIdx = logs.findIndex(l => l.id === newLog.id);
    if (existingIdx >= 0) {
      logs[existingIdx] = newLog;
    } else {
      logs.unshift(newLog);
    }

    localStorage.setItem(STORAGE_KEYS.RUN_LOGS, JSON.stringify(logs));
    this.triggerSync();
    return newLog;
  }

  deleteRunLog(logId) {
    let logs = this.getRunLogs();
    logs = logs.filter(l => l.id !== logId);
    localStorage.setItem(STORAGE_KEYS.RUN_LOGS, JSON.stringify(logs));
    this.triggerSync();
  }

  calculatePace(distanceKm, durationMinutes) {
    const km = parseFloat(distanceKm);
    const mins = parseFloat(durationMinutes);
    if (!km || km <= 0 || !mins || mins <= 0) return "--:--/km";
    const paceDecimal = mins / km;
    const pMinutes = Math.floor(paceDecimal);
    const pSeconds = Math.round((paceDecimal - pMinutes) * 60);
    return `${pMinutes}:${pSeconds < 10 ? "0" : ""}${pSeconds}/km`;
  }

  // =========================================================================
  // SMART FATIGUE CHECK-IN STATE
  // =========================================================================
  getSmartFatigueCheckin(dateStr) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SMART_FATIGUE_LOGS) || "{}");
    return all[dateStr] || null;
  }

  saveSmartFatigueCheckin(dateStr, data) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SMART_FATIGUE_LOGS) || "{}");
    all[dateStr] = {
      ...data,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SMART_FATIGUE_LOGS, JSON.stringify(all));
    this.triggerSync();
    return all[dateStr];
  }

  // =========================================================================
  // SETTINGS & SYNC
  // =========================================================================
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || "{}");
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.triggerSync();
    return updated;
  }

  exportFullSnapshot() {
    return {
      programs: this.getPrograms(),
      activeProgramId: this.getActiveProgramId(),
      activeWeek: this.getActiveWeek(),
      activeDayIndex: this.getActiveDayIndex(),
      workoutHistory: this.getWorkoutHistory(),
      sessionSets: JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_SETS) || "{}"),
      sessionRunData: JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_RUN_DATA) || "{}"),
      swappedExercises: JSON.parse(localStorage.getItem(STORAGE_KEYS.SWAPPED_EXERCISES) || "{}"),
      sessionNotes: JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_NOTES) || "{}"),
      aiChatHistory: this.getAIChatHistory(),
      overloadLogs: this.getOverloadLogs(),
      runLogs: this.getRunLogs(),
      smartFatigueLogs: JSON.parse(localStorage.getItem(STORAGE_KEYS.SMART_FATIGUE_LOGS) || "{}"),
      completedDays: JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS) || "{}"),
      completedChecklist: JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_CHECKLIST) || "{}"),
      daySelectedOptions: JSON.parse(localStorage.getItem(STORAGE_KEYS.DAY_SELECTED_OPTIONS) || "{}"),
      settings: this.getSettings()
    };
  }

  importFullSnapshot(data) {
    if (!data || typeof data !== "object") return false;
    try {
      if (data.programs) localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(data.programs));
      if (data.activeProgramId) localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, data.activeProgramId);
      if (data.activeWeek) localStorage.setItem(STORAGE_KEYS.ACTIVE_WEEK, data.activeWeek);
      if (data.activeDayIndex !== undefined) localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY_INDEX, String(data.activeDayIndex));
      if (data.workoutHistory) localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(data.workoutHistory));
      if (data.sessionSets) localStorage.setItem(STORAGE_KEYS.SESSION_SETS, JSON.stringify(data.sessionSets));
      if (data.sessionRunData) localStorage.setItem(STORAGE_KEYS.SESSION_RUN_DATA, JSON.stringify(data.sessionRunData));
      if (data.swappedExercises) localStorage.setItem(STORAGE_KEYS.SWAPPED_EXERCISES, JSON.stringify(data.swappedExercises));
      if (data.sessionNotes) localStorage.setItem(STORAGE_KEYS.SESSION_NOTES, JSON.stringify(data.sessionNotes));
      if (data.aiChatHistory) localStorage.setItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(data.aiChatHistory));
      if (data.overloadLogs) localStorage.setItem(STORAGE_KEYS.OVERLOAD_LOGS, JSON.stringify(data.overloadLogs));
      if (data.runLogs) localStorage.setItem(STORAGE_KEYS.RUN_LOGS, JSON.stringify(data.runLogs));
      if (data.smartFatigueLogs) localStorage.setItem(STORAGE_KEYS.SMART_FATIGUE_LOGS, JSON.stringify(data.smartFatigueLogs));
      if (data.completedDays) localStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify(data.completedDays));
      if (data.completedChecklist) localStorage.setItem(STORAGE_KEYS.COMPLETED_CHECKLIST, JSON.stringify(data.completedChecklist));
      if (data.daySelectedOptions) localStorage.setItem(STORAGE_KEYS.DAY_SELECTED_OPTIONS, JSON.stringify(data.daySelectedOptions));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      return true;
    } catch (e) {
      console.warn("importFullSnapshot error:", e);
      return false;
    }
  }

  triggerSync() {
    if (typeof window !== "undefined" && window.dinoSync) {
      window.dinoSync.triggerAutoPush();
    }
  }

  exportAllData() {
    const bundle = {
      app: "DinoTracking",
      version: "5.5",
      exportedAt: new Date().toISOString(),
      ...this.exportFullSnapshot()
    };
    return JSON.stringify(bundle, null, 2);
  }

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const success = this.importFullSnapshot(data);
      if (success) this.triggerSync();
      return { success };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  seedDemoData() {
    const completedDays = {
      "dino_hybrid_1_A-0": { completed: true, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      "dino_hybrid_1_A-1": { completed: true, timestamp: new Date(Date.now() - 86400000).toISOString() }
    };
    localStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify(completedDays));

    const sampleOverload = {
      pin_squat: [
        { id: "set_sq_1", date: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0], setNum: 1, weightKg: 105, reps: 6, rir: "RIR 1-2", e1rm: 131.3 },
        { id: "set_sq_2", date: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0], setNum: 2, weightKg: 100, reps: 7, rir: "RIR 1-2", e1rm: 128.3 }
      ],
      pull_up: [
        { id: "set_pu_1", date: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0], setNum: 1, weightKg: 15, reps: 6, rir: "RIR 1", e1rm: 18.5 }
      ],
      incline_db_bench: [
        { id: "set_db_1", date: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0], setNum: 1, weightKg: 32, reps: 8, rir: "RIR 1", e1rm: 41.6 }
      ]
    };
    localStorage.setItem(STORAGE_KEYS.OVERLOAD_LOGS, JSON.stringify(sampleOverload));

    const sampleHistory = [
      {
        id: "hist_demo_1",
        programId: "dino_hybrid_1",
        programName: "Dino Hybrid 1.0",
        weekId: "A",
        dayKey: "T3",
        dayTitle: "Full Body Strength",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        durationMinutes: 52,
        totalVolumeKg: 4250,
        totalSetsCount: 6,
        totalDistanceKm: 0,
        prCount: 1,
        notes: "Cảm giác đẩy ngực rất tốt, Squat set 1 bùng nổ, gối không đau.",
        exercises: [
          { name: "Pin Back Squat", sets: "2 sets (105kg × 6, 100kg × 7)" },
          { name: "Weighted Pull-up", sets: "2 sets (+15kg × 6, +15kg × 5)" },
          { name: "Incline DB Bench", sets: "2 sets (32kg × 8, 32kg × 7)" }
        ]
      },
      {
        id: "hist_demo_2",
        programId: "dino_hybrid_1",
        programName: "Dino Hybrid 1.0",
        weekId: "A",
        dayKey: "T2",
        dayTitle: "Quality Run (Threshold Cruise)",
        date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        durationMinutes: 54,
        totalVolumeKg: 0,
        totalSetsCount: 0,
        totalDistanceKm: 9.5,
        prCount: 0,
        notes: "Threshold 3x2km giữ đúng pace 5:45/km, hít thở nhịp 3-3 thoải mái.",
        runDetail: { distanceKm: 9.5, durationMinutes: 54, pace: "5:41/km", rpe: "RPE 8.0" }
      }
    ];
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(sampleHistory));

    const sampleRuns = [
      { id: "run_demo_1", date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], distanceKm: 9.5, durationMinutes: 54, pace: "5:41/km", rpe: "RPE 8.0" },
      { id: "run_demo_2", date: new Date(Date.now() - 86400000 * 6).toISOString().split("T")[0], distanceKm: 11.2, durationMinutes: 72, pace: "6:25/km", rpe: "RPE 6.5" }
    ];
    localStorage.setItem(STORAGE_KEYS.RUN_LOGS, JSON.stringify(sampleRuns));
  }
}

if (typeof window !== "undefined") {
  window.dinoStorage = new DinoStorage();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DinoStorage;
}
