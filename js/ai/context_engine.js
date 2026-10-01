/**
 * DINO-005C Phase 1 — User-scoped Context Engine
 *
 * Personal data is request-time context, never global model memory.
 * AUTHENTICATED mode is fail-closed: the AI never falls back to legacy
 * global LocalStorage data when an authoritative user identity exists.
 * DEVICE_LOCAL mode preserves the current single-device app behaviour while
 * explicitly treating that device as one local user.
 */
class DinoAIContextEngine {
  constructor(storage) {
    this.storage = storage;
    this.scopeKeyPrefix = "dino_ai_context_v1_";
  }

  getCurrentUserIdentity() {
    const auth = window.dinoAuth;
    if (auth && typeof auth.getCurrentUserId === "function") {
      const id = auth.getCurrentUserId();
      if (id) {
        return { userId: String(id), mode: "AUTHENTICATED" };
      }
    }

    const key = "dino_current_user_id_v1";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "device_user_" + (
        (window.crypto && typeof window.crypto.randomUUID === "function")
          ? window.crypto.randomUUID()
          : Date.now() + "_" + Math.random().toString(36).slice(2)
      );
      localStorage.setItem(key, id);
    }
    return { userId: id, mode: "DEVICE_LOCAL" };
  }

  getCurrentUserId() {
    return this.getCurrentUserIdentity().userId;
  }

  scopedStorageKey(userId) {
    return this.scopeKeyPrefix + encodeURIComponent(String(userId));
  }

  readAuthenticatedSnapshot(userId) {
    // Preferred future/auth integration: the authoritative data layer may
    // provide already-filtered context directly.
    const auth = window.dinoAuth;
    if (auth && typeof auth.getUserScopedAIContext === "function") {
      const supplied = auth.getUserScopedAIContext(userId);
      if (supplied) return supplied;
    }
    if (this.storage && typeof this.storage.getUserScopedAIContext === "function") {
      const supplied = this.storage.getUserScopedAIContext(userId);
      if (supplied) return supplied;
    }

    // LocalStorage fallback is still user-scoped. Never read legacy global
    // program/history/prehab keys in AUTHENTICATED mode.
    try {
      const raw = localStorage.getItem(this.scopedStorageKey(userId));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  writeDeviceSnapshot(userId, snapshot) {
    // Device-local mode has exactly one local identity. This mirror is not
    // presented as authentication and is never used across authenticated IDs.
    try {
      localStorage.setItem(this.scopedStorageKey(userId), JSON.stringify(snapshot));
    } catch (e) {}
  }

  getLegacyDeviceSnapshot() {
    const prog = this.storage?.getActiveProgram ? this.storage.getActiveProgram() : null;
    const weekId = this.storage?.getActiveWeekId ? this.storage.getActiveWeekId() : null;
    const dayId = this.storage?.getActiveDayId ? this.storage.getActiveDayId() : null;
    const base = this.storage?.getAthleteContextSummary ? this.storage.getAthleteContextSummary() : {};

    const activeWeek = prog?.weeks?.find(w => (w.id || w.weekId) === weekId) || null;
    const activeDay = activeWeek?.days?.find(d => (d.id || d.dayId) === dayId) || null;

    return {
      currentProgram: prog ? {
        programId: prog.id || prog.programId,
        name: prog.name,
        version: prog.version,
        philosophy: prog.philosophy,
        weekId,
        dayId
      } : null,
      activeDay: activeDay ? {
        dayId: activeDay.id || activeDay.dayId,
        title: activeDay.title || activeDay.dayName,
        sessionType: activeDay.sessionType || activeDay.type,
        focus: activeDay.focus || "",
        targetKm: activeDay.targetKm || 0,
        runDetail: activeDay.runDetail || null
      } : null,
      currentPrescription: (activeDay?.exercises || []).map(ex => ({
        prescriptionId: ex.prescriptionId,
        exerciseId: ex.exerciseId || ex.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        repRange: ex.repRange,
        load: ex.load,
        rir: ex.rir,
        rpe: ex.rpe,
        restSec: ex.restSec,
        movementPattern: ex.movementPattern,
        targetRequirement: ex.targetRequirement
      })),
      recentTraining: base.recentWorkouts || [],
      aggregateStats: base.stats || {},
      prehabContext: this.storage?.getPrehabProfile ? this.storage.getPrehabProfile() : null
    };
  }

  getPersonalSnapshot(identity) {
    if (identity.mode === "AUTHENTICATED") {
      return this.readAuthenticatedSnapshot(identity.userId);
    }

    const snapshot = this.getLegacyDeviceSnapshot();
    this.writeDeviceSnapshot(identity.userId, snapshot);
    return snapshot;
  }

  queryNeedsPersonalContext(query, task) {
    const q = String(query || "").toLowerCase();
    if (task !== "GENERAL") return true;

    // General-purpose AI remains general-purpose: generic questions do not
    // receive private training data. First-person/personal-data language opts
    // the request into current-user context.
    return /(tôi|mình|của tôi|của mình|my |me |mine|myself|lịch sử|buổi tập|giáo án|chương trình|tiến bộ|thể lực|thành tích|dữ liệu của)/i.test(q);
  }

  selectRelevantContext(snapshot, query, task) {
    const source = snapshot || {};
    const currentProgram = source.currentProgram || null;
    const prescription = Array.isArray(source.currentPrescription) ? source.currentPrescription : [];
    const recent = Array.isArray(source.recentTraining) ? source.recentTraining : [];
    const stats = source.aggregateStats || {};
    const prehab = source.prehabContext || null;
    const activeDay = source.activeDay || null;
    const q = String(query || "").toLowerCase();

    const matchingExerciseHistory = () => {
      const terms = prescription.map(x => String(x.name || "").toLowerCase()).filter(Boolean);
      if (!terms.length) return recent.slice(0, 10);
      return recent.filter(session => {
        const hay = JSON.stringify(session).toLowerCase();
        return terms.some(term => hay.includes(term));
      }).slice(0, 10);
    };

    switch (task) {
      case "LOG_ANALYSIS":
        return { currentProgram, recentTraining: recent.slice(0, 14), aggregateStats: stats };
      case "PROGRESSION_QUERY":
        return { currentProgram, currentPrescription: prescription, relevantExerciseHistory: matchingExerciseHistory() };
      case "FORM_CUE":
        return {
          currentProgram,
          currentPrescription: prescription,
          exerciseQuery: q,
          exerciseDefinition: this.storage?.getExerciseById ? (
            prescription.find(x => String(x.exerciseId).toLowerCase() === q) ||
            prescription.find(x => String(x.name || "").toLowerCase().includes(q)) ||
            null
          ) : null
        };
      case "PREHAB_EXPLANATION":
        return { currentProgram, currentPrescription: prescription, prehabContext: prehab };
      case "RUNNING_ANALYSIS":
        return {
          currentProgram,
          runningContext: recent.filter(x => {
            const hay = JSON.stringify(x).toLowerCase();
            return hay.includes("run") || hay.includes("running") || hay.includes("pace") ||
              hay.includes("distance") || hay.includes("cardio");
          }).slice(0, 14),
          aggregateStats: stats
        };
      case "RECOVERY":
        return { recentTraining: recent.slice(0, 7), aggregateStats: stats, prehabContext: prehab };
      case "GENERAL_COACHING":
        return { currentProgram, currentPrescription: prescription, recentTraining: recent.slice(0, 7) };
      case "GENERAL":
        return this.queryNeedsPersonalContext(query, task)
          ? { currentProgram, recentTraining: recent.slice(0, 5), aggregateStats: stats }
          : {};
      default:
        return {};
    }
  }

  build(query, task) {
    const identity = this.getCurrentUserIdentity();
    const snapshot = this.getPersonalSnapshot(identity);
    const personalAvailable = !!snapshot;

    // Fail-closed for authenticated users: no scoped snapshot means no
    // personal data. General AI still works without it.
    const selected = personalAvailable
      ? this.selectRelevantContext(snapshot, query, task)
      : {};

    return {
      schemaVersion: "005C-1.1",
      userScope: {
        userId: identity.userId,
        scope: "CURRENT_USER_ONLY",
        mode: identity.mode,
        personalContextAvailable: personalAvailable,
        isolation: identity.mode === "AUTHENTICATED"
          ? "FAIL_CLOSED_USER_SCOPED"
          : "DEVICE_LOCAL_SINGLE_USER"
      },
      ...selected,
      userQuery: query,
      task,
      prescriptionVsActual: "PRESCRIPTION_IS_PLAN; ACTUAL_IS_COMPLETED_PERFORMANCE"
    };
  }
}

if (typeof window !== "undefined") window.DinoAIContextEngine = DinoAIContextEngine;
