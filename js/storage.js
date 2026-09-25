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
        }
        stored.forEach(p => { if (!p.version) p.version = "1.0"; });
        localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(stored));
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
      version: "1.0",
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
  // 3. WORKOUT STATE MANAGEMENT (LIFECYCLE, ACTUAL SETS & SNAPSHOTS)
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
    return !!(state && (state.isActive || state.status === "IN_PROGRESS"));
  }

  startWorkoutSession(progId, weekId, dayId, dayTitle, exercises, dayData = null) {
    const prog = this.getProgramById(progId) || this.getActiveProgram();
    const startTime = Date.now();

    // Determine session type & cardio planning
    const sessionType = dayData?.type || (exercises && exercises.length > 0 ? "strength" : "run");
    const isCardio = sessionType === "run" || sessionType === "cardio" || (sessionType === "hybrid" && (!exercises || exercises.length === 0)) || (!exercises || exercises.length === 0);

    // 1. Immutable Prescription Snapshot captured at workout start
    const prescriptionSnapshot = (exercises || []).map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category || "General",
      equipment: ex.equipment || "Barbell",
      primaryMuscles: [...(ex.primaryMuscles || [])],
      secondaryMuscles: [...(ex.secondaryMuscles || [])],
      targetRequirement: ex.targetRequirement || "",
      optionNote: ex.optionNote || "",
      formCues: ex.formCues || "",
      defaultSets: (ex.defaultSets || []).map(s => ({
        setNum: s.setNum,
        reps: s.reps,
        rir: s.rir,
        rpe: s.rpe || null,
        weightKg: s.weightKg || null,
        restSec: s.restSec || 120,
        note: s.note || "",
        isRestPause: !!s.isRestPause
      }))
    }));

    // Planned cardio snapshot if applicable
    const plannedCardio = isCardio ? {
      sessionType: sessionType,
      targetKm: dayData ? (dayData.targetKm || 0) : 0,
      focus: dayData ? (dayData.focus || "") : "",
      options: dayData && dayData.options ? [...dayData.options] : [],
      checklist: dayData && dayData.checklist ? [...dayData.checklist] : []
    } : null;

    // Actual cardio initial record
    const actualCardio = isCardio ? {
      distanceKm: plannedCardio.targetKm || 0,
      durationSec: 0,
      avgPace: "—",
      sessionType: sessionType,
      completed: false
    } : null;

    // 2. Pre-populate Actual Sets structure (Prescription ≠ Actual)
    const loggedSets = {};
    (exercises || []).forEach(ex => {
      loggedSets[ex.id] = (ex.defaultSets || []).map((s, idx) => {
        const plannedReps = s.reps || "8-10";
        const parsedReps = parseInt(plannedReps, 10) || 8;
        const parsedRir = s.rir ? String(s.rir).replace(/[^0-9.]/g, "") || "1" : "1";

        return {
          setId: `set_${ex.id}_${idx + 1}_${startTime}`,
          exerciseId: ex.id,
          exerciseName: ex.name,
          setNumber: s.setNum || (idx + 1),
          modality: "strength",
          planned: {
            reps: plannedReps,
            load: s.weightKg || null,
            rir: s.rir || "RIR 1-2",
            rpe: s.rpe || null,
            restSec: s.restSec || 120,
            duration: null,
            distance: null
          },
          actual: {
            reps: parsedReps,
            load: s.weightKg || 50,
            rir: parsedRir,
            rpe: null,
            duration: null,
            distance: null
          },
          completed: false,
          timestamp: null,
          notes: ""
        };
      });
    });

    const state = {
      sessionId: "session_act_" + startTime,
      status: "IN_PROGRESS", // PLANNED -> IN_PROGRESS -> COMPLETED / ABANDONED
      isActive: true,
      startTime: startTime,
      athleteId: "dino_athlete_default",
      progId: progId,
      progVersion: prog ? (prog.version || "1.0") : "1.0",
      progName: prog ? prog.name : "Dino Program",
      weekId: weekId,
      dayId: dayId,
      dayTitle: dayTitle,
      sessionType: sessionType,
      plannedCardio: plannedCardio,
      actualCardio: actualCardio,
      elapsedSeconds: 0,
      isPaused: false,
      prescriptionSnapshot: prescriptionSnapshot,
      loggedSets: loggedSets,
      notes: ""
    };

    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE, JSON.stringify(state));
    return state;
  }

  updateActiveWorkoutLogs(loggedSets, notes = null, actualCardio = null) {
    const state = this.getActiveWorkoutState();
    if (state) {
      if (loggedSets) state.loggedSets = loggedSets;
      if (notes !== null) state.notes = notes;
      if (actualCardio) state.actualCardio = { ...(state.actualCardio || {}), ...actualCardio };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE, JSON.stringify(state));
    }
  }

  cancelActiveWorkout() {
    // Abandon active session cleanly
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE);
  }

  finishWorkoutSession(summaryData) {
    const history = this.getWorkoutHistory();
    const activeState = this.getActiveWorkoutState();
    const prog = this.getProgramById(summaryData.progId || (activeState ? activeState.progId : this.getActiveProgramId()));

    // 1. Authoritative Actual Performance Sets & Actual Cardio
    const actualPerformance = summaryData.actualPerformance || [];
    const actualCardio = summaryData.actualCardio || (activeState ? activeState.actualCardio : null) || null;
    const sessionType = summaryData.sessionType || (activeState ? activeState.sessionType : (actualCardio ? actualCardio.sessionType : "strength")) || "strength";

    // 2. Derived Summary calculation (authoritative performance -> derived summary)
    const derivedSummary = {
      totalVolumeKg: summaryData.totalVolumeKg || 0,
      totalSets: summaryData.totalSets || 0,
      totalDistanceKm: summaryData.totalDistanceKm || (actualCardio ? (parseFloat(actualCardio.distanceKm) || 0) : 0) || 0,
      avgPace: summaryData.avgPace || (actualCardio ? actualCardio.avgPace : "—") || "—",
      prsCount: summaryData.prsCount || 0,
      durationSec: summaryData.durationSec || (actualCardio ? actualCardio.durationSec : 0) || (activeState ? Math.max(0, Math.floor((Date.now() - activeState.startTime) / 1000)) : 0)
    };

    // 3. Immutable Completed Session Snapshot
    const newSession = {
      id: "session_" + Date.now(),
      status: "COMPLETED", // Primary source for history & analytics
      athleteId: "dino_athlete_default",
      date: new Date().toISOString().split("T")[0],
      startTime: activeState ? activeState.startTime : (Date.now() - derivedSummary.durationSec * 1000),
      endTime: Date.now(),
      timestamp: Date.now(),
      durationSec: derivedSummary.durationSec,
      sessionType: sessionType,
      progId: summaryData.progId || (activeState ? activeState.progId : this.getActiveProgramId()),
      progVersion: (activeState && activeState.progVersion) ? activeState.progVersion : (prog ? prog.version || "1.0" : "1.0"),
      progName: (activeState && activeState.progName) ? activeState.progName : (prog ? prog.name : "Dino Program"),
      weekId: summaryData.weekId || (activeState ? activeState.weekId : this.getActiveWeekId()),
      dayId: summaryData.dayId || (activeState ? activeState.dayId : this.getActiveDayId()),
      dayTitle: summaryData.dayTitle || (activeState ? activeState.dayTitle : "Workout Session"),

      // Prescription snapshot at completion time (stable, immutable across future program updates)
      prescriptionSnapshot: (activeState && activeState.prescriptionSnapshot) ? activeState.prescriptionSnapshot : (summaryData.prescriptionSnapshot || []),
      plannedCardio: (activeState && activeState.plannedCardio) ? activeState.plannedCardio : (summaryData.plannedCardio || null),

      // Authoritative actual performance
      actualPerformance: actualPerformance,
      actualCardio: actualCardio,

      // Derived summary
      derivedSummary: derivedSummary,

      // Root-level fields for 100% backward compatibility with existing stats, calendar & AI Coach
      totalVolumeKg: derivedSummary.totalVolumeKg,
      totalSets: derivedSummary.totalSets,
      totalDistanceKm: derivedSummary.totalDistanceKm,
      avgPace: derivedSummary.avgPace,
      prsCount: derivedSummary.prsCount,
      exercises: summaryData.exercises || (actualCardio ? [{
        name: summaryData.dayTitle || "Cardio Session",
        sets: 1,
        volume: 0,
        distanceKm: derivedSummary.totalDistanceKm,
        pace: derivedSummary.avgPace
      }] : actualPerformance.map(ap => ({
        name: ap.exerciseName,
        sets: ap.sets ? ap.sets.filter(s => s.completed).length : 0,
        volume: ap.sets ? ap.sets.filter(s => s.completed).reduce((sum, s) => sum + ((s.actual?.load || 0) * (s.actual?.reps || 0)), 0) : 0
      }))),
      notes: summaryData.notes || (activeState ? activeState.notes : "")
    };

    history.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));

    // Clear active workout state
    this.cancelActiveWorkout();
    return newSession;
  }

  // Real Personal Records (PR) Calculation Engine based on authentic performance records
  calculatePersonalRecords(history = null) {
    const hist = history || this.getWorkoutHistory();
    if (!hist || !Array.isArray(hist) || hist.length === 0) return 0;

    // Chronological order (oldest to newest)
    const sorted = [...hist].sort((a, b) => {
      const timeA = a.startTime || a.timestamp || (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.startTime || b.timestamp || (b.date ? new Date(b.date).getTime() : 0);
      return timeA - timeB;
    });

    const bestLoads = {};
    let prCount = 0;

    sorted.forEach(session => {
      if (session.actualPerformance && Array.isArray(session.actualPerformance)) {
        session.actualPerformance.forEach(ap => {
          const exKey = (ap.exerciseId || ap.exerciseName || "").trim().toLowerCase();
          if (!exKey) return;
          const completedSets = (ap.sets || []).filter(s => s.completed && (parseFloat(s.actual?.load) || 0) > 0);
          if (completedSets.length > 0) {
            const maxL = Math.max(...completedSets.map(s => parseFloat(s.actual.load) || 0));
            if (maxL > 0) {
              if (bestLoads[exKey] === undefined) {
                bestLoads[exKey] = maxL;
                prCount++;
              } else if (maxL > bestLoads[exKey]) {
                bestLoads[exKey] = maxL;
                prCount++;
              }
            }
          }
        });
      } else if (session.exercises && Array.isArray(session.exercises)) {
        session.exercises.forEach(e => {
          const exKey = (e.id || e.name || "").trim().toLowerCase();
          if (!exKey) return;
          if (e.sets && Array.isArray(e.sets)) {
            const valid = e.sets.filter(s => (parseFloat(s.weightKg || s.weight || s.actual?.load) || 0) > 0);
            if (valid.length > 0) {
              const maxL = Math.max(...valid.map(s => parseFloat(s.weightKg || s.weight || s.actual?.load) || 0));
              if (maxL > 0) {
                if (bestLoads[exKey] === undefined || maxL > bestLoads[exKey]) {
                  bestLoads[exKey] = maxL;
                  prCount++;
                }
              }
            }
          }
        });
      }
    });

    return prCount;
  }

  // Calculate PRs achieved in a specific session compared to prior history
  calculateSessionPRs(actualPerformance, priorHistory = null) {
    if (!actualPerformance || !Array.isArray(actualPerformance) || actualPerformance.length === 0) return 0;
    const hist = priorHistory !== null ? priorHistory : this.getWorkoutHistory();

    const priorBests = {};
    (hist || []).forEach(session => {
      if (session.actualPerformance && Array.isArray(session.actualPerformance)) {
        session.actualPerformance.forEach(ap => {
          const exKey = (ap.exerciseId || ap.exerciseName || "").trim().toLowerCase();
          if (!exKey) return;
          (ap.sets || []).forEach(s => {
            if (s.completed) {
              const l = parseFloat(s.actual?.load) || 0;
              if (l > (priorBests[exKey] || 0)) priorBests[exKey] = l;
            }
          });
        });
      } else if (session.exercises && Array.isArray(session.exercises)) {
        session.exercises.forEach(e => {
          const exKey = (e.id || e.name || "").trim().toLowerCase();
          if (!exKey) return;
          if (Array.isArray(e.sets)) {
            e.sets.forEach(s => {
              const l = parseFloat(s.weightKg || s.weight || s.actual?.load) || 0;
              if (l > (priorBests[exKey] || 0)) priorBests[exKey] = l;
            });
          }
        });
      }
    });

    let sessionPRs = 0;
    actualPerformance.forEach(ap => {
      const exKey = (ap.exerciseId || ap.exerciseName || "").trim().toLowerCase();
      if (!exKey) return;
      const completedSets = (ap.sets || []).filter(s => s.completed && (parseFloat(s.actual?.load) || 0) > 0);
      if (completedSets.length > 0) {
        const sessionMax = Math.max(...completedSets.map(s => parseFloat(s.actual.load) || 0));
        const prior = priorBests[exKey] || 0;
        if (sessionMax > prior) {
          sessionPRs++;
        }
      }
    });

    return sessionPRs;
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

  getLastCompletedExercisePerformance(exerciseId, exerciseName) {
    const history = this.getWorkoutHistory();
    for (const session of history) {
      if (session.status && session.status !== "COMPLETED") continue;

      // 1. Search in actualPerformance
      if (session.actualPerformance && Array.isArray(session.actualPerformance)) {
        const match = session.actualPerformance.find(p =>
          (exerciseId && p.exerciseId === exerciseId) ||
          (exerciseName && p.exerciseName && p.exerciseName.toLowerCase() === exerciseName.toLowerCase())
        );
        if (match && match.sets && match.sets.length > 0) {
          const completedSets = match.sets.filter(s => s.completed);
          if (completedSets.length > 0) {
            return {
              date: session.date,
              dayTitle: session.dayTitle,
              sets: completedSets
            };
          }
        }
      }

      // 2. Fallback to legacy exercises format
      if (session.exercises && Array.isArray(session.exercises)) {
        const match = session.exercises.find(e =>
          (exerciseId && e.id === exerciseId) ||
          (exerciseName && e.name && e.name.toLowerCase() === exerciseName.toLowerCase())
        );
        if (match) {
          if (match.sets && Array.isArray(match.sets) && match.sets.length > 0) {
            return {
              date: session.date,
              dayTitle: session.dayTitle,
              sets: match.sets.map((s, i) => ({
                setNumber: i + 1,
                actual: {
                  load: s.weightKg || s.weight || 0,
                  reps: s.reps || 0,
                  rir: s.rir || ""
                },
                completed: true
              }))
            };
          } else if (typeof match.sets === "number" && match.sets > 0) {
            return {
              date: session.date,
              dayTitle: session.dayTitle,
              legacySummary: `${match.sets} sets • ${(match.volume || 0).toLocaleString()} kg`
            };
          }
        }
      }
    }
    return null;
  }

  getExercisePerformanceHistory(exerciseId, exerciseName) {
    const history = this.getWorkoutHistory();
    const entries = [];

    for (const session of history) {
      if (session.status && session.status !== "COMPLETED") continue;

      // 1. Search in actualPerformance
      if (session.actualPerformance && Array.isArray(session.actualPerformance)) {
        const match = session.actualPerformance.find(p =>
          (exerciseId && p.exerciseId === exerciseId) ||
          (exerciseName && p.exerciseName && p.exerciseName.toLowerCase() === exerciseName.toLowerCase())
        );
        if (match && match.sets && match.sets.length > 0) {
          const completedSets = match.sets.filter(s => s.completed);
          if (completedSets.length > 0) {
            entries.push({
              sessionId: session.id,
              date: session.date || (session.completedAt ? new Date(session.completedAt).toLocaleDateString("vi-VN") : "Gần đây"),
              dayTitle: session.dayTitle || session.workoutTitle || "Buổi tập",
              sets: completedSets.map(s => ({
                setNumber: s.setNumber,
                load: s.actual?.load ?? s.weightKg ?? 0,
                reps: s.actual?.reps ?? s.reps ?? 0,
                rir: s.actual?.rir ?? s.rir ?? "",
                rpe: s.actual?.rpe ?? s.rpe ?? "",
                completed: s.completed,
                timestamp: s.timestamp
              }))
            });
            continue;
          }
        }
      }

      // 2. Fallback to legacy exercises format
      if (session.exercises && Array.isArray(session.exercises)) {
        const match = session.exercises.find(e =>
          (exerciseId && e.id === exerciseId) ||
          (exerciseName && e.name && e.name.toLowerCase() === exerciseName.toLowerCase())
        );
        if (match) {
          if (match.sets && Array.isArray(match.sets) && match.sets.length > 0) {
            entries.push({
              sessionId: session.id,
              date: session.date || (session.completedAt ? new Date(session.completedAt).toLocaleDateString("vi-VN") : "Gần đây"),
              dayTitle: session.dayTitle || session.workoutTitle || "Buổi tập",
              sets: match.sets.map((s, idx) => ({
                setNumber: idx + 1,
                load: s.weightKg || s.weight || 0,
                reps: s.reps || 0,
                rir: s.rir || "",
                completed: true
              }))
            });
          } else if (typeof match.sets === "number" && match.sets > 0) {
            entries.push({
              sessionId: session.id,
              date: session.date || "Gần đây",
              dayTitle: session.dayTitle || "Buổi tập",
              legacySummary: `${match.sets} sets • ${(match.volume || 0).toLocaleString()} kg`
            });
          }
        }
      }
    }

    return entries;
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
