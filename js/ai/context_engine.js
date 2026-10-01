/**
 * DINO-005C Phase 1 — User-scoped Context Engine
 * Personal data is context, not global model memory.
 */
class DinoAIContextEngine {
  constructor(storage) {
    this.storage = storage;
  }

  getCurrentUserId() {
    // Future authenticated deployments must supply the authoritative ID.
    const auth = window.dinoAuth;
    if (auth && typeof auth.getCurrentUserId === "function") {
      const id = auth.getCurrentUserId();
      if (id) return String(id);
    }
    // Device-local legacy identity. Never claim this is multi-user authentication.
    const key = "dino_current_user_id_v1";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "device_user_" + (crypto.randomUUID ? crypto.randomUUID() : Date.now());
      localStorage.setItem(key, id);
    }
    return id;
  }

  build(query, task) {
    const userId = this.getCurrentUserId();
    const prog = this.storage.getActiveProgram ? this.storage.getActiveProgram() : null;
    const weekId = this.storage.getActiveWeekId ? this.storage.getActiveWeekId() : null;
    const dayId = this.storage.getActiveDayId ? this.storage.getActiveDayId() : null;
    const base = this.storage.getAthleteContextSummary ? this.storage.getAthleteContextSummary() : {};
    const activeWeek = prog?.weeks?.find(w => (w.id || w.weekId) === weekId) || null;
    const activeDay = activeWeek?.days?.find(d => (d.id || d.dayId) === dayId) || null;

    const currentPrescription = (activeDay?.exercises || []).map(ex => ({
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
    }));

    const recentTraining = base.recentWorkouts || [];
    const context = {
      schemaVersion: "005C-1.0",
      userScope: { userId, scope: "CURRENT_USER_ONLY" },
      currentProgram: prog ? {
        programId: prog.id || prog.programId,
        name: prog.name,
        version: prog.version,
        philosophy: prog.philosophy,
        weekId,
        dayId
      } : null,
      currentPrescription,
      recentTraining,
      aggregateStats: base.stats || {},
      prehabContext: this.storage.getPrehabProfile ? this.storage.getPrehabProfile() : null,
      userQuery: query,
      task
    };

    // Keep context relevance explicit; general questions still receive only safe identity + useful coaching context.
    if (task === "GENERAL") {
      context.currentPrescription = currentPrescription;
      context.recentTraining = recentTraining.slice(0, 7);
    }
    return context;
  }
}
if (typeof window !== "undefined") window.DinoAIContextEngine = DinoAIContextEngine;
