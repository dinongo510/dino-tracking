/**
 * Dino Tracking - Storage & State Management Engine
 * Provides:
 * 1. Tree Structure Program Builder persistence (Program -> Weeks -> Days -> Exercises)
 * 2. Global Custom Exercises library
 * 3. Active Workout Lock State & Cancel/Finish workflow
 * 4. Google Gemini API Key storage & Athlete Context aggregation
 * 5. Full Offline LocalStorage caching with JSON Import/Export
 */

const STORAGE_KEYS = {
  PROGRAMS: "dino_programs_v6",
  ACTIVE_PROGRAM_ID: "dino_active_program_id_v6",
  ACTIVE_WEEK_ID: "dino_active_week_id_v6",
  ACTIVE_DAY_ID: "dino_active_day_id_v6",
  CUSTOM_EXERCISES: "dino_custom_exercises_v6",
  ACTIVE_WORKOUT_STATE: "dino_active_workout_state_v6",
  WORKOUT_HISTORY: "dino_workout_history_v6",
  AI_CHAT_HISTORY: "dino_ai_chat_v6",
  GEMINI_API_KEY: "dino_gemini_api_key_v6",
  PREHAB_PROFILE: "dino_prehab_profile_v6",
  SETTINGS: "dino_settings_v6"
};

class DinoStorage {
  constructor() {
    this.initDefaults();
  }

  initDefaults() {
    // 1. Programs Initialization & Built-in Program Sync
    const defaultProgs = (window.DEFAULT_PROGRAMS || []);
    const storedProgsRaw = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    if (!storedProgsRaw) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(defaultProgs));
    } else {
      try {
        const stored = JSON.parse(storedProgsRaw);
        const builtInIdx = stored.findIndex(p => p.id === "dino_hybrid_1");
        if (builtInIdx !== -1 && defaultProgs.length > 0) {
          stored[builtInIdx] = defaultProgs[0];
          localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(stored));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(defaultProgs));
      }
    }

    // 2. Active Program & Day IDs
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, "dino_hybrid_1");
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WEEK_ID, "A");
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_DAY_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY_ID, "wA_t3");
    }

    // 3. Custom Exercises
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify([]));
    }

    // 4. Workout History
    if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify([]));
    }

    // 5. Settings
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        sound: true,
        vibrate: true,
        smartFatigue: true,
        geminiModel: "gemini-2.5-flash",
        restTimerSec: 120
      }));
    } else {
      try {
        const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
        if (settings && settings.geminiModel !== "gemini-2.5-flash") {
          settings.geminiModel = "gemini-2.5-flash";
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        }
      } catch (e) {}
    }
  }

  // =========================================================================
  // 1. DYNAMIC PROGRAM BUILDER (TREE PERSISTENCE)
  // =========================================================================
  getPrograms() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]");
    } catch (e) {
      return window.DEFAULT_PROGRAMS || [];
    }
  }

  savePrograms(programs) {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  }

  getActiveProgramId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID) || "dino_hybrid_1";
  }

  setActiveProgramId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, id);
    const prog = this.getProgramById(id);
    if (prog && prog.weeks && prog.weeks.length > 0) {
      this.setActiveWeekId(prog.weeks[0].id);
      if (prog.weeks[0].days && prog.weeks[0].days.length > 0) {
        this.setActiveDayId(prog.weeks[0].days[0].id);
      }
    }
  }

  getActiveWeekId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WEEK_ID) || "wA";
  }

  setActiveWeekId(weekId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WEEK_ID, weekId);
  }

  getActiveDayId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DAY_ID) || "wA_d2";
  }

  setActiveDayId(dayId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY_ID, dayId);
  }

  getActiveProgram() {
    const progs = this.getPrograms();
    const activeId = this.getActiveProgramId();
    return progs.find(p => p.id === activeId) || progs[0] || (window.DEFAULT_PROGRAMS ? window.DEFAULT_PROGRAMS[0] : null);
  }

  getProgramById(id) {
    const progs = this.getPrograms();
    return progs.find(p => p.id === id) || null;
  }

  createProgram(name, philosophy, subtitle = "Custom Program", rotationWeeks = 1) {
    const progs = this.getPrograms();
    const newProg = {
      id: "prog_" + Date.now(),
      name: name.trim(),
      subtitle: subtitle.trim(),
      philosophy: (philosophy || "").trim(),
      target: "Custom Hypertrophy & Performance",
      rotationWeeks: parseInt(rotationWeeks, 10) || 1,
      isBuiltIn: false,
      weeks: [] // Starts completely empty as requested
    };
    progs.push(newProg);
    this.savePrograms(progs);
    return newProg;
  }

  updateProgram(progId, updates) {
    const progs = this.getPrograms();
    const idx = progs.findIndex(p => p.id === progId);
    if (idx !== -1) {
      progs[idx] = { ...progs[idx], ...updates };
      this.savePrograms(progs);
      return progs[idx];
    }
    return null;
  }

  deleteProgram(progId) {
    let progs = this.getPrograms();
    progs = progs.filter(p => p.id !== progId);
    this.savePrograms(progs);
    if (this.getActiveProgramId() === progId) {
      if (progs.length > 0) {
        this.setActiveProgramId(progs[0].id);
      }
    }
  }

  // Week Operations
  addWeekToProgram(progId, weekName = "Week 1") {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId);
    if (!prog) return null;
    if (!prog.weeks) prog.weeks = [];

    const newWeek = {
      id: "w_" + Date.now(),
      name: weekName.trim(),
      focus: "Hypertrophy & Conditioning",
      targetKm: 0,
      days: []
    };
    prog.weeks.push(newWeek);
    this.savePrograms(progs);
    return newWeek;
  }

  deleteWeekFromProgram(progId, weekId) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId);
    if (!prog || !prog.weeks) return false;

    prog.weeks = prog.weeks.filter(w => w.id !== weekId);
    this.savePrograms(progs);
    return true;
  }

  // Day Operations
  addDayToWeek(progId, weekId, dayData) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId);
    if (!prog || !prog.weeks) return null;
    const week = prog.weeks.find(w => w.id === weekId);
    if (!week) return null;
    if (!week.days) week.days = [];

    const newDay = {
      id: "d_" + Date.now(),
      dayKey: dayData.dayKey || `D${week.days.length + 1}`,
      dayName: dayData.dayName || `Day ${week.days.length + 1}`,
      title: dayData.title || "Custom Workout Session",
      type: dayData.type || "strength",
      focus: dayData.focus || "Whole Body",
      badge: dayData.badge || "Strength",
      targetKm: dayData.targetKm || 0,
      runDetail: dayData.runDetail || null,
      checklist: dayData.checklist || [],
      exercises: []
    };
    week.days.push(newDay);
    this.savePrograms(progs);
    return newDay;
  }

  deleteDayFromWeek(progId, weekId, dayId) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId);
    if (!week || !week.days) return false;

    week.days = week.days.filter(d => d.id !== dayId);
    this.savePrograms(progs);
    return true;
  }

  // Exercise Operations & Reordering via [Up] / [Down]
  addExerciseToDay(progId, weekId, dayId, exercise) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId);
    if (!day) return false;
    if (!day.exercises) day.exercises = [];

    const newEx = {
      id: exercise.id || "ex_" + Date.now(),
      name: exercise.name,
      category: exercise.category || "Upper",
      equipment: exercise.equipment || "Barbell",
      primaryMuscles: exercise.primaryMuscles || ["Chest"],
      secondaryMuscles: exercise.secondaryMuscles || [],
      targetRequirement: exercise.targetRequirement || "3 sets × 8–10 reps @ RIR 1",
      defaultSets: exercise.defaultSets && exercise.defaultSets.length > 0 ? exercise.defaultSets : [
        { setNum: 1, reps: "8-10", rir: "RIR 1", restSec: 120 },
        { setNum: 2, reps: "8-10", rir: "RIR 1", restSec: 120 },
        { setNum: 3, reps: "8-10", rir: "RIR 0-1", restSec: 120 }
      ]
    };
    day.exercises.push(newEx);
    this.savePrograms(progs);
    return true;
  }

  deleteExerciseFromDay(progId, weekId, dayId, exerciseIndex) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId);
    if (!day || !day.exercises) return false;

    if (exerciseIndex >= 0 && exerciseIndex < day.exercises.length) {
      day.exercises.splice(exerciseIndex, 1);
      this.savePrograms(progs);
      return true;
    }
    return false;
  }

  // Simple [Up] / [Down] Button Reordering (No Drag & Drop!)
  reorderExerciseInDay(progId, weekId, dayId, index, direction) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId);
    if (!day || !day.exercises) return false;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= day.exercises.length) return false;

    const temp = day.exercises[index];
    day.exercises[index] = day.exercises[newIndex];
    day.exercises[newIndex] = temp;

    this.savePrograms(progs);
    return true;
  }

  // =========================================================================
  // 2. CUSTOM EXERCISES (SAVED GLOBALLY TO LOCAL LIBRARY)
  // =========================================================================
  getCustomExercises() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES) || "[]");
    } catch (e) {
      return [];
    }
  }

  saveCustomExercise(exercise) {
    const customs = this.getCustomExercises();
    const newEx = {
      id: exercise.id || "custom_ex_" + Date.now(),
      name: exercise.name.trim(),
      category: exercise.category || "Upper",
      equipment: exercise.equipment || "Dumbbell",
      primaryMuscles: exercise.primaryMuscles || ["Chest"],
      secondaryMuscles: exercise.secondaryMuscles || [],
      formCues: exercise.formCues || "Thực hiện đúng kỹ thuật và kiểm soát eccentric.",
      isCustom: true
    };
    customs.push(newEx);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customs));
    return newEx;
  }

  getAllExercises() {
    const builtIn = window.EXERCISE_LIBRARY || [];
    const customs = this.getCustomExercises();
    return [...builtIn, ...customs];
  }

  // =========================================================================
  // 3. WORKOUT STATE MANAGEMENT (LOCK STATE & CANCEL / FINISH)
  // =========================================================================
  getActiveWorkoutState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE) || "null");
    } catch (e) {
      return null;
    }
  }

  isWorkoutActive() {
    const state = this.getActiveWorkoutState();
    return !!(state && state.isActive);
  }

  startWorkoutSession(progId, weekId, dayId, dayTitle, exercises) {
    const state = {
      isActive: true,
      startTime: Date.now(),
      progId,
      weekId,
      dayId,
      dayTitle,
      elapsedSeconds: 0,
      isPaused: false,
      loggedSets: {}, // { exerciseId: [ { weightKg, reps, rpe, completed } ] }
      notes: ""
    };
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE, JSON.stringify(state));
    return state;
  }

  updateActiveWorkoutLogs(loggedSets, notes = null) {
    const state = this.getActiveWorkoutState();
    if (state) {
      if (loggedSets) state.loggedSets = loggedSets;
      if (notes !== null) state.notes = notes;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE, JSON.stringify(state));
    }
  }

  cancelActiveWorkout() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE);
  }

  finishWorkoutSession(summaryData) {
    const history = this.getWorkoutHistory();
    const newSession = {
      id: "session_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      timestamp: Date.now(),
      progId: summaryData.progId || this.getActiveProgramId(),
      weekId: summaryData.weekId || this.getActiveWeekId(),
      dayId: summaryData.dayId || this.getActiveDayId(),
      dayTitle: summaryData.dayTitle || "Workout Session",
      durationSec: summaryData.durationSec || 0,
      totalVolumeKg: summaryData.totalVolumeKg || 0,
      totalSets: summaryData.totalSets || 0,
      totalDistanceKm: summaryData.totalDistanceKm || 0,
      avgPace: summaryData.avgPace || "—",
      prsCount: summaryData.prsCount || 0,
      exercises: summaryData.exercises || [],
      notes: summaryData.notes || ""
    };
    history.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));

    // Clear the active lock state
    this.cancelActiveWorkout();
    return newSession;
  }

  getWorkoutHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY) || "[]");
    } catch (e) {
      return [];
    }
  }

  deleteWorkoutHistoryItem(sessionId) {
    let history = this.getWorkoutHistory();
    history = history.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
  }

  // =========================================================================
  // 4. GOOGLE GEMINI API KEY & AI CONTEXT SUMMARY
  // =========================================================================
  getGeminiApiKey() {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || "";
  }

  setGeminiApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, (key || "").trim());
  }

  getAthleteContextSummary() {
    const prog = this.getActiveProgram();
    const history = this.getWorkoutHistory();
    const settings = this.getSettings();

    let totalVolume = 0;
    let totalKm = 0;
    let totalSets = 0;
    history.forEach(h => {
      totalVolume += (h.totalVolumeKg || 0);
      totalKm += (h.totalDistanceKm || 0);
      totalSets += (h.totalSets || 0);
    });

    const recentWorkouts = history.slice(0, 7);

    return {
      programName: prog ? prog.name : "Dino Hybrid 2.0",
      philosophy: prog ? prog.philosophy : "",
      activeWeek: this.getActiveWeekId(),
      activeDay: this.getActiveDayId(),
      stats: {
        totalWorkouts: history.length,
        totalVolumeKg: totalVolume,
        totalDistanceKm: totalKm.toFixed(1),
        totalSets
      },
      recentWorkouts: recentWorkouts.map(w => ({
        date: w.date,
        dayTitle: w.dayTitle,
        durationMinutes: Math.round((w.durationSec || 0) / 60),
        volumeKg: w.totalVolumeKg,
        distanceKm: w.totalDistanceKm,
        notes: w.notes
      })),
      hasGeminiApiKey: !!this.getGeminiApiKey()
    };
  }

  // =========================================================================
  // 5. SETTINGS & PREHAB PROFILE
  // =========================================================================
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || "{}");
    } catch (e) {
      return { sound: true, vibrate: true, smartFatigue: true };
    }
  }

  updateSettings(updates) {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  getPrehabProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PREHAB_PROFILE) || '{"deviations":[],"workoutType":"full_body"}');
    } catch (e) {
      return { deviations: [], workoutType: "full_body" };
    }
  }

  savePrehabProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PREHAB_PROFILE, JSON.stringify(profile));
  }

  // =========================================================================
  // 6. BACKUP / RESTORE JSON
  // =========================================================================
  exportAllDataAsJSON() {
    const dump = {};
    Object.keys(STORAGE_KEYS).forEach(k => {
      const key = STORAGE_KEYS[k];
      dump[key] = localStorage.getItem(key);
    });
    return JSON.stringify(dump, null, 2);
  }

  importAllDataFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      Object.keys(parsed).forEach(k => {
        if (parsed[k] !== null && parsed[k] !== undefined) {
          localStorage.setItem(k, parsed[k]);
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

if (typeof window !== "undefined") {
  window.DinoStorage = DinoStorage;
  window.dinoStorage = new DinoStorage();
}
