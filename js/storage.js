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
        if (stored.length === 0 && defaultProgs.length > 0) {
          stored.push(defaultProgs[0]);
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
  // 1. DINO-005A: EXERCISE NORMALIZATION & ENTITY LOGIC
  // =========================================================================
  inferMovementPattern(ex) {
    if (ex && ex.movementPattern) return ex.movementPattern;
    const text = ((ex?.name || "") + " " + (ex?.category || "") + " " + (ex?.equipment || "") + " " + (ex?.primaryMuscles || []).join(" ")).toLowerCase();
    if (text.includes("squat") || text.includes("leg press") || text.includes("hack") || text.includes("sissy")) return "SQUAT";
    if (text.includes("rdl") || text.includes("deadlift") || text.includes("leg curl") || text.includes("hip thrust") || text.includes("swing")) return "HINGE";
    if (text.includes("lunge") || text.includes("split")) return "LUNGE";
    if (text.includes("bench") || text.includes("push") || text.includes("press") || text.includes("dips") || text.includes("raise") || text.includes("fly") || text.includes("pushdown") || text.includes("triceps")) return "PUSH";
    if (text.includes("pull") || text.includes("row") || text.includes("chin") || text.includes("curl") || text.includes("lat") || text.includes("skierg") || text.includes("erg")) return "PULL";
    if (text.includes("carry") || text.includes("farmer")) return "CARRY";
    if (text.includes("woodchop") || text.includes("rotation") || text.includes("twist")) return "ROTATION";
    if (text.includes("run") || text.includes("sprint") || text.includes("bike") || text.includes("walk") || text.includes("jump") || text.includes("burpee")) return "LOCOMOTION";
    if (text.includes("plank") || text.includes("situp") || text.includes("core") || text.includes("leg raise") || text.includes("adduction")) return "CORE";
    if (ex && ex.category === "Cardio") return "CARDIO";
    return "STRENGTH";
  }

  inferTrainingType(ex) {
    if (ex && ex.trainingType) return ex.trainingType;
    if (ex && ex.category === "Cardio") return "CARDIO";
    if (ex && ex.category === "Hybrid") return "HYBRID";
    return "HYPERTROPHY";
  }

  normalizeExercise(ex) {
    if (!ex) return null;
    const stableId = ex.exerciseId || ex.id || ("ex_" + String(ex.name || Date.now()).toLowerCase().replace(/[^a-z0-9]+/g, "_"));
    return {
      exerciseId: stableId,
      id: ex.id || stableId, // 100% backward compat
      name: (ex.name || "").trim(),
      status: ex.status || (ex.isCustom ? "CUSTOM" : "ACTIVE"), // ACTIVE | ARCHIVED | CUSTOM
      category: ex.category || "Strength",
      movementPattern: ex.movementPattern || this.inferMovementPattern(ex),
      trainingType: ex.trainingType || this.inferTrainingType(ex),
      equipment: ex.equipment || "Barbell",
      primaryMuscles: Array.isArray(ex.primaryMuscles) ? [...ex.primaryMuscles] : [],
      secondaryMuscles: Array.isArray(ex.secondaryMuscles) ? [...ex.secondaryMuscles] : [],
      instructions: ex.instructions || null,
      coachingCues: ex.coachingCues || ex.formCues || "",
      formCues: ex.formCues || ex.coachingCues || "",
      commonErrors: ex.commonErrors || null,
      cautions: ex.cautions || null,
      targetRequirement: ex.targetRequirement || "",
      defaultSets: Array.isArray(ex.defaultSets) ? ex.defaultSets.map((s, idx) => ({
        setNum: s.setNum || idx + 1,
        reps: s.reps || "8-10",
        rir: s.rir || "RIR 1-2",
        restSec: s.restSec || 120,
        weightKg: s.weightKg || null,
        note: s.note || "",
        isRestPause: !!s.isRestPause
      })) : [{ setNum: 1, reps: "8-10", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "8-10", rir: "RIR 1", restSec: 120 }],
      version: ex.version || "1.0",
      createdAt: ex.createdAt || "2026-01-01T00:00:00.000Z",
      updatedAt: ex.updatedAt || new Date().toISOString(),
      isCustom: !!(ex.isCustom || ex.status === "CUSTOM"),
      // Reserved hooks for DINO-005B
      correctiveRole: ex.correctiveRole || null,
      targetDeviation: ex.targetDeviation || null,
      CEXStage: ex.CEXStage || null
    };
  }

  // =========================================================================
  // 2. DINO-005A: PROGRAM NORMALIZATION & HIERARCHY
  // =========================================================================
  normalizeProgram(prog) {
    if (!prog) return null;
    const stableId = prog.programId || prog.id || ("prog_" + Date.now());
    const version = prog.version || "1.0";
    const currentVersionId = prog.currentVersionId || ("v" + version);
    const versions = (Array.isArray(prog.versions) && prog.versions.length > 0)
      ? prog.versions
      : [{ versionId: currentVersionId, versionNumber: version, createdAt: "2026-09-25T00:00:00.000Z", notes: "Standardized Program Version" }];

    const weeks = (prog.weeks || []).map((week, wIdx) => {
      const weekId = week.weekId || week.id || ("w_" + (wIdx + 1));
      const days = (week.days || []).map((day, dIdx) => {
        const dayId = day.dayId || day.id || ("d_" + (dIdx + 1));
        const exercises = (day.exercises || []).map((ex, exIdx) => {
          const rxId = ex.prescriptionId || ("rx_" + dayId + "_" + (ex.id || ex.exerciseId || exIdx) + "_" + (exIdx + 1));
          const exId = ex.exerciseId || ex.id || ("ex_" + exIdx);
          return {
            prescriptionId: rxId,
            exerciseId: exId,
            id: ex.id || exId, // 100% backward compat
            order: ex.order !== undefined ? ex.order : (exIdx + 1),
            name: ex.name || "",
            category: ex.category || "General",
            equipment: ex.equipment || "Barbell",
            primaryMuscles: Array.isArray(ex.primaryMuscles) ? [...ex.primaryMuscles] : [],
            secondaryMuscles: Array.isArray(ex.secondaryMuscles) ? [...ex.secondaryMuscles] : [],
            targetRequirement: ex.targetRequirement || "",
            optionNote: ex.optionNote || "",
            formCues: ex.formCues || ex.coachingCues || "",
            coachingCues: ex.coachingCues || ex.formCues || "",
            sets: ex.sets !== undefined ? ex.sets : (ex.defaultSets ? ex.defaultSets.length : 2),
            reps: ex.reps || (ex.defaultSets && ex.defaultSets[0] ? ex.defaultSets[0].reps : "8-10"),
            repRange: ex.repRange || (ex.defaultSets && ex.defaultSets[0] ? ex.defaultSets[0].reps : "8-10"),
            load: ex.load || null,
            rir: ex.rir || (ex.defaultSets && ex.defaultSets[0] ? ex.defaultSets[0].rir : "RIR 1-2"),
            rpe: ex.rpe || null,
            tempo: ex.tempo || null,
            restSec: ex.restSec || (ex.defaultSets && ex.defaultSets[0] ? ex.defaultSets[0].restSec : 120),
            notes: ex.notes || "",
            isRestPause: !!ex.isRestPause,
            defaultSets: Array.isArray(ex.defaultSets) ? ex.defaultSets : [
              { setNum: 1, reps: "8-10", rir: "RIR 1", restSec: 120 },
              { setNum: 2, reps: "8-10", rir: "RIR 1", restSec: 120 }
            ]
          };
        });

        return {
          dayId: dayId,
          id: day.id || dayId,
          dayNumber: day.dayNumber !== undefined ? day.dayNumber : (dIdx + 1),
          dayKey: day.dayKey || `D${dIdx + 1}`,
          dayLabel: day.dayLabel || day.dayKey || `D${dIdx + 1}`,
          dayName: day.dayName || day.title || `Day ${dIdx + 1}`,
          title: day.title || day.dayName || "Workout Session",
          sessionType: day.sessionType || day.type || "strength",
          type: day.type || day.sessionType || "strength",
          focus: day.focus || "",
          badge: day.badge || (day.type === "run" ? "Quality Run" : "Strength"),
          targetKm: day.targetKm || 0,
          runDetail: day.runDetail || null,
          options: Array.isArray(day.options) ? [...day.options] : [],
          checklist: Array.isArray(day.checklist) ? [...day.checklist] : [],
          cardioPrescription: day.cardioPrescription || (day.targetKm ? { targetKm: day.targetKm, focus: day.focus || "" } : null),
          exercises: exercises
        };
      });

      return {
        weekId: weekId,
        id: week.id || weekId,
        weekNumber: week.weekNumber !== undefined ? week.weekNumber : (wIdx + 1),
        label: week.label || week.name || `Week ${wIdx + 1}`,
        name: week.name || `Week ${wIdx + 1}`,
        focus: week.focus || "",
        targetKm: week.targetKm || 0,
        days: days
      };
    });

    return {
      programId: stableId,
      id: prog.id || stableId,
      programName: (prog.programName || prog.name || "Untitled Program").trim(),
      name: (prog.name || prog.programName || "Untitled Program").trim(),
      subtitle: prog.subtitle || "Custom Program",
      description: prog.description || "",
      philosophy: prog.philosophy || "",
      target: prog.target || "Hypertrophy & Conditioning",
      status: prog.status || "active", // active | draft | archived
      currentVersionId: currentVersionId,
      version: version,
      rotationWeeks: parseInt(prog.rotationWeeks, 10) || 1,
      isBuiltIn: !!prog.isBuiltIn,
      versions: versions,
      weeks: weeks
    };
  }

  // =========================================================================
  // 3. PROGRAM BUILDER & VERSIONING ENGINE
  // =========================================================================
  getPrograms() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRAMS) || "[]");
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(p => this.normalizeProgram(p));
      }
      return (window.DEFAULT_PROGRAMS || []).map(p => this.normalizeProgram(p));
    } catch (e) {
      return (window.DEFAULT_PROGRAMS || []).map(p => this.normalizeProgram(p));
    }
  }

  savePrograms(programs) {
    const normalized = (programs || []).map(p => this.normalizeProgram(p));
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(normalized));
  }

  getActiveProgramId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID) || "dino_hybrid_1";
  }

  setActiveProgramId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, id);
    const prog = this.getProgramById(id);
    if (prog && prog.weeks && prog.weeks.length > 0) {
      this.setActiveWeekId(prog.weeks[0].id || prog.weeks[0].weekId);
      if (prog.weeks[0].days && prog.weeks[0].days.length > 0) {
        this.setActiveDayId(prog.weeks[0].days[0].id || prog.weeks[0].days[0].dayId);
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
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DAY_ID) || "wA_t3";
  }

  setActiveDayId(dayId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DAY_ID, dayId);
  }

  getActiveProgram() {
    const progs = this.getPrograms();
    const activeId = this.getActiveProgramId();
    return progs.find(p => p.id === activeId || p.programId === activeId) || progs[0] || (window.DEFAULT_PROGRAMS ? this.normalizeProgram(window.DEFAULT_PROGRAMS[0]) : null);
  }

  getProgramById(id) {
    if (!id) return null;
    const progs = this.getPrograms();
    return progs.find(p => p.id === id || p.programId === id) || null;
  }

  createProgram(name, philosophy, subtitle = "Custom Program", rotationWeeks = 1) {
    const progs = this.getPrograms();
    const progId = "prog_" + Date.now();
    const newProg = {
      id: progId,
      programId: progId,
      version: "1.0",
      currentVersionId: "v1.0",
      name: name.trim(),
      programName: name.trim(),
      subtitle: subtitle.trim(),
      philosophy: (philosophy || "").trim(),
      target: "Custom Hypertrophy & Performance",
      status: "active",
      rotationWeeks: parseInt(rotationWeeks, 10) || 1,
      isBuiltIn: false,
      versions: [
        {
          versionId: "v1.0",
          versionNumber: "1.0",
          createdAt: new Date().toISOString(),
          notes: "Initial program creation"
        }
      ],
      weeks: [] // Starts completely empty as requested
    };
    progs.push(this.normalizeProgram(newProg));
    this.savePrograms(progs);
    return newProg;
  }

  duplicateProgram(progId) {
    const orig = this.getProgramById(progId);
    if (!orig) return null;
    const progs = this.getPrograms();
    const cloned = JSON.parse(JSON.stringify(orig));
    const newProgId = "prog_" + Date.now();
    cloned.programId = newProgId;
    cloned.id = newProgId;
    cloned.name = `${orig.name} (Bản sao)`;
    cloned.programName = cloned.name;
    cloned.isBuiltIn = false;
    cloned.status = "draft";
    cloned.currentVersionId = "v1.0";
    cloned.version = "1.0";
    cloned.versions = [{
      versionId: "v1.0",
      versionNumber: "1.0",
      createdAt: new Date().toISOString(),
      notes: `Nhân bản từ ${orig.name}`
    }];
    // Regenerate unique IDs for all weeks, days, and prescriptions
    (cloned.weeks || []).forEach((w, wIdx) => {
      const newWeekId = `w_${Date.now()}_${wIdx + 1}`;
      w.weekId = newWeekId;
      w.id = newWeekId;
      (w.days || []).forEach((d, dIdx) => {
        const newDayId = `d_${Date.now()}_${wIdx + 1}_${dIdx + 1}`;
        d.dayId = newDayId;
        d.id = newDayId;
        (d.exercises || []).forEach((ex, exIdx) => {
          ex.prescriptionId = `rx_${newDayId}_${ex.exerciseId || ex.id}_${exIdx + 1}`;
          ex.order = exIdx + 1;
        });
      });
    });
    progs.push(cloned);
    this.savePrograms(progs);
    return cloned;
  }

  createProgramVersion(progId, versionNotes = "") {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog) return null;
    const currentNum = parseFloat(prog.version) || 1.0;
    const nextNum = (currentNum + 0.1).toFixed(1);
    const newVersionId = "v" + nextNum;
    prog.version = nextNum;
    prog.currentVersionId = newVersionId;
    if (!prog.versions) prog.versions = [];
    prog.versions.push({
      versionId: newVersionId,
      versionNumber: nextNum,
      createdAt: new Date().toISOString(),
      notes: versionNotes.trim() || `Version ${nextNum} update`
    });
    this.savePrograms(progs);
    return prog;
  }

  updateProgram(progId, updates) {
    const progs = this.getPrograms();
    const idx = progs.findIndex(p => p.id === progId || p.programId === progId);
    if (idx !== -1) {
      progs[idx] = this.normalizeProgram({ ...progs[idx], ...updates });
      this.savePrograms(progs);
      return progs[idx];
    }
    return null;
  }

  deleteProgram(progId) {
    let progs = this.getPrograms();
    progs = progs.filter(p => p.id !== progId && p.programId !== progId);
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
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog) return null;
    if (!prog.weeks) prog.weeks = [];

    const newWeekId = "w_" + Date.now();
    const newWeek = {
      id: newWeekId,
      weekId: newWeekId,
      weekNumber: prog.weeks.length + 1,
      name: weekName.trim(),
      label: weekName.trim(),
      focus: "Hypertrophy & Conditioning",
      targetKm: 0,
      days: []
    };
    prog.weeks.push(newWeek);
    this.savePrograms(progs);
    return newWeek;
  }

  duplicateWeek(progId, weekId) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return null;
    const origWeek = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!origWeek) return null;

    const cloned = JSON.parse(JSON.stringify(origWeek));
    const newWeekId = "w_" + Date.now();
    cloned.weekId = newWeekId;
    cloned.id = newWeekId;
    cloned.weekNumber = prog.weeks.length + 1;
    cloned.name = `${origWeek.name} (Bản sao)`;
    cloned.label = `${origWeek.label || origWeek.name} (Bản sao)`;

    (cloned.days || []).forEach((d, dIdx) => {
      const newDayId = `d_${Date.now()}_${dIdx + 1}`;
      d.dayId = newDayId;
      d.id = newDayId;
      (d.exercises || []).forEach((ex, exIdx) => {
        ex.prescriptionId = `rx_${newDayId}_${ex.exerciseId || ex.id}_${exIdx + 1}`;
        ex.order = exIdx + 1;
      });
    });

    prog.weeks.push(cloned);
    this.savePrograms(progs);
    return cloned;
  }

  deleteWeekFromProgram(progId, weekId) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return false;

    prog.weeks = prog.weeks.filter(w => w.id !== weekId && w.weekId !== weekId);
    this.savePrograms(progs);
    return true;
  }

  // Day Operations
  addDayToWeek(progId, weekId, dayData) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return null;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week) return null;
    if (!week.days) week.days = [];

    const newDayId = "d_" + Date.now();
    const newDay = {
      id: newDayId,
      dayId: newDayId,
      dayNumber: week.days.length + 1,
      dayKey: dayData.dayKey || `D${week.days.length + 1}`,
      dayLabel: dayData.dayLabel || dayData.dayKey || `D${week.days.length + 1}`,
      dayName: dayData.dayName || dayData.title || `Day ${week.days.length + 1}`,
      title: dayData.title || dayData.dayName || "Custom Workout Session",
      sessionType: dayData.sessionType || dayData.type || "strength",
      type: dayData.type || dayData.sessionType || "strength",
      focus: dayData.focus || "Whole Body",
      badge: dayData.badge || (dayData.type === "run" ? "Quality Run" : "Strength"),
      targetKm: dayData.targetKm || 0,
      runDetail: dayData.runDetail || null,
      options: Array.isArray(dayData.options) ? [...dayData.options] : [],
      checklist: Array.isArray(dayData.checklist) ? [...dayData.checklist] : [],
      cardioPrescription: dayData.cardioPrescription || (dayData.targetKm ? { targetKm: dayData.targetKm, focus: dayData.focus || "" } : null),
      exercises: []
    };
    week.days.push(newDay);
    this.savePrograms(progs);
    return newDay;
  }

  duplicateDay(progId, weekId, dayId) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return null;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week || !week.days) return null;
    const origDay = week.days.find(d => d.id === dayId || d.dayId === dayId);
    if (!origDay) return null;

    const cloned = JSON.parse(JSON.stringify(origDay));
    const newDayId = "d_" + Date.now();
    cloned.dayId = newDayId;
    cloned.id = newDayId;
    cloned.dayNumber = week.days.length + 1;
    cloned.dayKey = `D${week.days.length + 1}`;
    cloned.dayLabel = cloned.dayKey;
    cloned.title = `${origDay.title} (Bản sao)`;
    cloned.dayName = cloned.title;

    (cloned.exercises || []).forEach((ex, exIdx) => {
      ex.prescriptionId = `rx_${newDayId}_${ex.exerciseId || ex.id}_${exIdx + 1}`;
      ex.order = exIdx + 1;
    });

    week.days.push(cloned);
    this.savePrograms(progs);
    return cloned;
  }

  deleteDayFromWeek(progId, weekId, dayId) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week || !week.days) return false;

    week.days = week.days.filter(d => d.id !== dayId && d.dayId !== dayId);
    this.savePrograms(progs);
    return true;
  }

  // Prescription Operations in Day
  addExerciseToDay(progId, weekId, dayId, exercise, overrides = null) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId || d.dayId === dayId);
    if (!day) return false;
    if (!day.exercises) day.exercises = [];

    const normEx = this.normalizeExercise(exercise);
    const rxId = "rx_" + (normEx.exerciseId || normEx.id) + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    const setsCount = overrides && overrides.sets ? parseInt(overrides.sets, 10) : (normEx.defaultSets?.length || 2);
    const repsStr = overrides && overrides.reps ? String(overrides.reps) : (normEx.defaultSets?.[0]?.reps || "8-10");
    const rirStr = overrides && overrides.rir ? String(overrides.rir) : (normEx.defaultSets?.[0]?.rir || "RIR 1-2");
    const restSecVal = overrides && overrides.restSec ? parseInt(overrides.restSec, 10) : (normEx.defaultSets?.[0]?.restSec || 120);

    const newRx = {
      prescriptionId: rxId,
      exerciseId: normEx.exerciseId,
      id: normEx.id, // backward compat
      order: day.exercises.length + 1,
      name: normEx.name,
      category: normEx.category,
      equipment: normEx.equipment,
      primaryMuscles: [...normEx.primaryMuscles],
      secondaryMuscles: [...normEx.secondaryMuscles],
      targetRequirement: overrides?.targetRequirement || normEx.targetRequirement || `${setsCount} sets × ${repsStr} @ ${rirStr}`,
      optionNote: normEx.optionNote || "",
      formCues: normEx.formCues || "",
      coachingCues: normEx.coachingCues || normEx.formCues || "",
      sets: setsCount,
      reps: repsStr,
      repRange: repsStr,
      load: overrides?.load || null,
      rir: rirStr,
      rpe: overrides?.rpe || null,
      tempo: overrides?.tempo || null,
      restSec: restSecVal,
      notes: overrides?.notes || "",
      isRestPause: !!normEx.isRestPause,
      defaultSets: Array.isArray(normEx.defaultSets) && normEx.defaultSets.length > 0 ? normEx.defaultSets : [
        { setNum: 1, reps: repsStr, rir: rirStr, restSec: restSecVal },
        { setNum: 2, reps: repsStr, rir: rirStr, restSec: restSecVal }
      ]
    };

    day.exercises.push(newRx);
    this.savePrograms(progs);
    return newRx;
  }

  updateExercisePrescription(progId, weekId, dayId, exerciseIndex, updates) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId || d.dayId === dayId);
    if (!day || !day.exercises) return false;

    const exIdx = typeof exerciseIndex === "number"
      ? exerciseIndex
      : day.exercises.findIndex(e => e.prescriptionId === exerciseIndex || e.id === exerciseIndex || e.exerciseId === exerciseIndex);
    if (exIdx < 0 || exIdx >= day.exercises.length) return false;

    const current = day.exercises[exIdx];
    const newSetsCount = updates.sets !== undefined ? parseInt(updates.sets, 10) : current.sets;
    const newReps = updates.reps !== undefined ? String(updates.reps).trim() : current.reps;
    const newRir = updates.rir !== undefined ? String(updates.rir).trim() : current.rir;
    const newRestSec = updates.restSec !== undefined ? parseInt(updates.restSec, 10) : current.restSec;
    const newNotes = updates.notes !== undefined ? String(updates.notes).trim() : current.notes;
    const newLoad = updates.load !== undefined ? updates.load : current.load;
    const newTargetReq = updates.targetRequirement !== undefined ? updates.targetRequirement : `${newSetsCount} sets × ${newReps} @ ${newRir}`;

    let defaultSets = [...(current.defaultSets || [])];
    if (newSetsCount > 0 && newSetsCount !== defaultSets.length) {
      defaultSets = Array.from({ length: newSetsCount }, (_, i) => ({
        setNum: i + 1,
        reps: newReps,
        rir: newRir,
        restSec: newRestSec,
        note: (defaultSets[i] && defaultSets[i].note) || ""
      }));
    } else {
      defaultSets = defaultSets.map(s => ({
        ...s,
        reps: newReps || s.reps,
        rir: newRir || s.rir,
        restSec: newRestSec || s.restSec
      }));
    }

    day.exercises[exIdx] = {
      ...current,
      sets: newSetsCount,
      reps: newReps,
      repRange: newReps,
      rir: newRir,
      load: newLoad,
      restSec: newRestSec,
      notes: newNotes,
      targetRequirement: newTargetReq,
      optionNote: updates.optionNote !== undefined ? updates.optionNote : (current.optionNote || ""),
      defaultSets: defaultSets
    };

    this.savePrograms(progs);
    return day.exercises[exIdx];
  }

  duplicateExercisePrescription(progId, weekId, dayId, exerciseIndex) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId || d.dayId === dayId);
    if (!day || !day.exercises) return false;

    const exIdx = typeof exerciseIndex === "number"
      ? exerciseIndex
      : day.exercises.findIndex(e => e.prescriptionId === exerciseIndex || e.id === exerciseIndex || e.exerciseId === exerciseIndex);
    if (exIdx < 0 || exIdx >= day.exercises.length) return false;

    const orig = day.exercises[exIdx];
    const cloned = JSON.parse(JSON.stringify(orig));
    cloned.prescriptionId = `rx_${day.id || day.dayId}_${orig.exerciseId || orig.id}_${Date.now()}`;
    day.exercises.splice(exIdx + 1, 0, cloned);
    day.exercises.forEach((ex, idx) => { ex.order = idx + 1; });

    this.savePrograms(progs);
    return cloned;
  }

  deleteExerciseFromDay(progId, weekId, dayId, exerciseIndex) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId || d.dayId === dayId);
    if (!day || !day.exercises) return false;

    const exIdx = typeof exerciseIndex === "number"
      ? exerciseIndex
      : day.exercises.findIndex(e => e.prescriptionId === exerciseIndex || e.id === exerciseIndex || e.exerciseId === exerciseIndex);
    if (exIdx >= 0 && exIdx < day.exercises.length) {
      day.exercises.splice(exIdx, 1);
      day.exercises.forEach((ex, idx) => { ex.order = idx + 1; });
      this.savePrograms(progs);
      return true;
    }
    return false;
  }

  reorderExerciseInDay(progId, weekId, dayId, index, direction) {
    const progs = this.getPrograms();
    const prog = progs.find(p => p.id === progId || p.programId === progId);
    if (!prog || !prog.weeks) return false;
    const week = prog.weeks.find(w => w.id === weekId || w.weekId === weekId);
    if (!week || !week.days) return false;
    const day = week.days.find(d => d.id === dayId || d.dayId === dayId);
    if (!day || !day.exercises) return false;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= day.exercises.length) return false;

    const temp = day.exercises[index];
    day.exercises[index] = day.exercises[newIndex];
    day.exercises[newIndex] = temp;
    day.exercises.forEach((ex, idx) => { ex.order = idx + 1; });

    this.savePrograms(progs);
    return true;
  }

  // =========================================================================
  // 4. CUSTOM EXERCISES & GLOBAL REPOSITORY (DINO-005A)
  // =========================================================================
  getCustomExercises() {
    try {
      const customs = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES) || "[]");
      if (Array.isArray(customs)) {
        return customs.map(e => this.normalizeExercise(e));
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  saveCustomExercise(exercise) {
    const customs = this.getCustomExercises();
    const uniqueId = exercise.exerciseId || exercise.id || ("custom_ex_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4));
    const newEx = this.normalizeExercise({
      ...exercise,
      exerciseId: uniqueId,
      id: uniqueId,
      name: (exercise.name || "").trim(),
      status: "CUSTOM",
      isCustom: true,
      createdAt: exercise.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    customs.push(newEx);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customs));
    return newEx;
  }

  updateCustomExercise(exerciseId, updates) {
    const customs = this.getCustomExercises();
    const idx = customs.findIndex(e => e.id === exerciseId || e.exerciseId === exerciseId);
    if (idx !== -1) {
      const current = customs[idx];
      const updated = this.normalizeExercise({
        ...current,
        ...updates,
        exerciseId: current.exerciseId,
        id: current.id,
        status: "CUSTOM",
        isCustom: true,
        updatedAt: new Date().toISOString()
      });
      customs[idx] = updated;
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customs));
      return updated;
    }
    return null;
  }

  archiveCustomExercise(exerciseId) {
    const customs = this.getCustomExercises();
    const idx = customs.findIndex(e => e.id === exerciseId || e.exerciseId === exerciseId);
    if (idx !== -1) {
      customs[idx].status = "ARCHIVED";
      customs[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customs));
      return true;
    }
    return false;
  }

  getAllExercises(includeArchived = false) {
    const builtIn = (window.EXERCISE_LIBRARY || []).map(ex => this.normalizeExercise(ex));
    const customs = this.getCustomExercises().map(ex => this.normalizeExercise(ex));
    const all = [...builtIn, ...customs];
    if (includeArchived) return all;
    return all.filter(e => e.status !== "ARCHIVED");
  }

  getExerciseById(exerciseId) {
    if (!exerciseId) return null;
    const all = this.getAllExercises(true);
    const target = String(exerciseId).trim().toLowerCase();
    return all.find(e =>
      (e.exerciseId && e.exerciseId.toLowerCase() === target) ||
      (e.id && e.id.toLowerCase() === target) ||
      (e.name && e.name.toLowerCase() === target)
    ) || null;
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

  startWorkoutSession(progId, weekId, dayId, dayTitle = null, exercises = null, dayData = null, initialSelectedOption = null) {
    const prog = this.getProgramById(progId) || this.getActiveProgram();
    const startTime = Date.now();

    // Auto-resolve if not explicitly passed
    if (!dayTitle || !exercises) {
      const week = (prog?.weeks || []).find(w => w.id === weekId);
      const day = (week?.days || []).find(d => d.id === dayId);
      if (day) {
        dayTitle = dayTitle || day.title;
        exercises = exercises || day.exercises || [];
        dayData = dayData || day;
      }
    }

    // Determine session type & cardio planning
    const hasExercises = exercises && exercises.length > 0;
    const hasCardio = dayData?.type === "run" || dayData?.type === "hybrid" || dayData?.type === "cardio" || (dayData?.targetKm && dayData.targetKm > 0) || !hasExercises;
    const sessionType = (hasExercises && hasCardio) ? "hybrid" : (hasCardio ? "cardio" : "strength");

    // 1. Immutable Prescription Snapshot captured at workout start
    const prescriptionSnapshot = (exercises || []).map((ex, exIdx) => ({
      prescriptionId: ex.prescriptionId || `rx_${dayId}_${ex.exerciseId || ex.id}_${exIdx + 1}`,
      exerciseId: ex.exerciseId || ex.id,
      id: ex.id || ex.exerciseId,
      order: ex.order !== undefined ? ex.order : (exIdx + 1),
      name: ex.name,
      category: ex.category || "General",
      equipment: ex.equipment || "Barbell",
      primaryMuscles: [...(ex.primaryMuscles || [])],
      secondaryMuscles: [...(ex.secondaryMuscles || [])],
      targetRequirement: ex.targetRequirement || "",
      optionNote: ex.optionNote || "",
      formCues: ex.formCues || ex.coachingCues || "",
      coachingCues: ex.coachingCues || ex.formCues || "",
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

    // Planned cardio snapshot if applicable (Prescription ≠ Actual)
    const plannedCardio = hasCardio ? {
      sessionType: dayData?.badge || dayData?.title || (sessionType === "hybrid" ? "Hybrid Cardio" : "Cardio"),
      targetKm: dayData ? (dayData.targetKm || null) : null,
      focus: dayData ? (dayData.focus || "") : "",
      options: dayData && dayData.options ? [...dayData.options] : [],
      checklist: dayData && dayData.checklist ? [...dayData.checklist] : []
    } : null;

    // Actual cardio initial record - MUST NOT inherit planned targetKm (Prescription ≠ Actual)
    const actualCardio = hasCardio ? {
      distanceKm: null,
      durationMin: null,
      durationSec: 0,
      avgPace: "—",
      pace: "—",
      sessionType: dayData?.badge || dayData?.title || (sessionType === "hybrid" ? "Hybrid Cardio" : "Cardio"),
      completed: false,
      notes: ""
    } : null;

    // 2. Pre-populate Actual Sets structure (Prescription ≠ Actual)
    // Actual values MUST remain empty/null until user records them. No fake 50kg/reps/rir defaults.
    const loggedSets = {};
    (exercises || []).forEach(ex => {
      const exKey = ex.id || ex.exerciseId;
      loggedSets[exKey] = (ex.defaultSets || []).map((s, idx) => {
        return {
          setId: `set_${exKey}_${idx + 1}_${startTime}`,
          prescriptionId: ex.prescriptionId || null,
          exerciseId: ex.exerciseId || ex.id,
          exerciseName: ex.name,
          setNumber: s.setNum || (idx + 1),
          modality: "strength",
          planned: {
            reps: s.reps || "8-10",
            load: s.weightKg || null,
            rir: s.rir || "RIR 1-2",
            rpe: s.rpe || null,
            restSec: s.restSec || 120,
            duration: null,
            distance: null
          },
          actual: {
            reps: null,
            load: null,
            rir: null,
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
      selectedOption: initialSelectedOption || null,
      dayOptionsSnapshot: dayData && dayData.options ? [...dayData.options] : [],
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

  updateActiveSelectedOption(selectedOption) {
    const state = this.getActiveWorkoutState();
    if (state) {
      state.selectedOption = selectedOption;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE, JSON.stringify(state));
    }
  }

  cancelActiveWorkout() {
    // Abandon active session cleanly
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE);
  }

  cancelActiveWorkoutSession() {
    this.cancelActiveWorkout();
  }

  getActiveWorkoutSession() {
    return this.getActiveWorkoutState();
  }

  saveActiveWorkoutSession(state) {
    if (state) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_STATE, JSON.stringify(state));
    }
  }

  getWorkouts() {
    return this.getWorkoutHistory();
  }

  finishWorkoutSession(summaryData = {}) {
    if (typeof summaryData === "number") {
      summaryData = { durationSec: summaryData };
    }
    const history = this.getWorkoutHistory();
    const activeState = this.getActiveWorkoutState();
    const prog = this.getProgramById(summaryData.progId || (activeState ? activeState.progId : this.getActiveProgramId()));

    // 1. Authoritative Actual Performance Sets & Actual Cardio
    let actualPerformance = summaryData.actualPerformance;
    if (!actualPerformance && activeState && activeState.loggedSets) {
      actualPerformance = Object.keys(activeState.loggedSets).map(exKey => {
        const sets = activeState.loggedSets[exKey] || [];
        const firstSet = sets[0];
        return {
          exerciseId: firstSet ? (firstSet.exerciseId || exKey) : exKey,
          exerciseName: firstSet ? (firstSet.exerciseName || "Exercise") : "Exercise",
          sets: sets
        };
      });
    }
    actualPerformance = actualPerformance || [];
    const actualCardio = summaryData.actualCardio || (activeState ? activeState.actualCardio : null) || null;
    const sessionType = summaryData.sessionType || (activeState ? activeState.sessionType : (actualCardio ? actualCardio.sessionType : "strength")) || "strength";
    const selectedOption = summaryData.selectedOption || (activeState ? activeState.selectedOption : null) || null;

    const actualCardioDist = (actualCardio && actualCardio.distanceKm !== null && actualCardio.distanceKm !== undefined && !isNaN(parseFloat(actualCardio.distanceKm)))
      ? parseFloat(actualCardio.distanceKm)
      : null;

    // Determine authoritative duration: if cardio duration was explicitly recorded, use it
    const authoritativeDurationSec = (summaryData.durationSec && summaryData.durationSec > 0)
      ? summaryData.durationSec
      : (actualCardio && actualCardio.durationMin ? actualCardio.durationMin * 60 : 0)
        || (activeState ? Math.max(0, Math.floor((Date.now() - activeState.startTime) / 1000)) : 0);

    // 2. Derived Summary calculation (authoritative performance -> derived summary)
    const derivedSummary = {
      totalVolumeKg: summaryData.totalVolumeKg || 0,
      totalSets: summaryData.totalSets || 0,
      totalDistanceKm: summaryData.totalDistanceKm !== undefined ? summaryData.totalDistanceKm : (actualCardioDist !== null ? actualCardioDist : 0),
      avgPace: summaryData.avgPace || (actualCardio ? (actualCardio.pace || actualCardio.avgPace || "—") : "—"),
      prsCount: summaryData.prsCount || 0,
      durationSec: authoritativeDurationSec
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
      selectedOption: selectedOption,
      dayOptionsSnapshot: (activeState && activeState.dayOptionsSnapshot) ? activeState.dayOptionsSnapshot : (summaryData.dayOptionsSnapshot || []),

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
      exercises: summaryData.exercises || (actualPerformance && actualPerformance.length > 0 ? actualPerformance.map(ap => ({
        name: ap.exerciseName,
        sets: ap.sets ? ap.sets.filter(s => s.completed).length : 0,
        volume: ap.sets ? ap.sets.filter(s => s.completed).reduce((sum, s) => sum + ((s.actual?.load || 0) * (s.actual?.reps || 0)), 0) : 0
      })) : (actualCardio && actualCardioDist !== null && actualCardioDist > 0 ? [{
        name: summaryData.dayTitle || "Cardio Session",
        sets: 1,
        volume: 0,
        distanceKm: derivedSummary.totalDistanceKm,
        pace: derivedSummary.avgPace
      }] : [])),
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
          } else if (typeof match.sets === "string" && match.sets.length > 0) {
            entries.push({
              sessionId: session.id,
              date: session.date || "Gần đây",
              dayTitle: session.dayTitle || "Buổi tập",
              legacySummary: match.sets
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    STORAGE_KEYS,
    DinoStorage
  };
}
