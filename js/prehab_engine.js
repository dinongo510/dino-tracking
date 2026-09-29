/**
 * DINO-005B — DETERMINISTIC PREHAB & CORRECTIVE ENGINE
 *
 * Implements the 14-Stage Deterministic Pipeline specified in:
 * 00_SYSTEM/SOURCES/DINO-005B/DETERMINISTIC_SCORING_SPECIFICATION.md
 * 00_SYSTEM/SOURCES/DINO-005B/PREHAB_ENGINE_DESIGN.md
 * 00_SYSTEM/SOURCES/DINO-005B/PREHAB_RULE_MATRIX.md
 *
 * PROVENANCE CLASSIFICATIONS:
 * - 4-Phase Continuum (Inhibit, Lengthen, Activate, Integrate): [LOCKED-SOURCE] (S01 NASM CEx)
 * - Biomechanical Pairings & Muscle Actions: [LOCKED-SOURCE] (S01, S02, S03)
 * - NSCA Static Stretch Pre-Lift Safety Cap (<= 30s): [LOCKED-SOURCE] (S03 Ch. 14)
 * - Minimal Equipment Constraints: [PRODUCT-RULE] (S04, S05)
 * - 6-Factor Additive Scoring Model & Heuristic Multipliers: [ENGINEERING-PROPOSAL]
 * - Kinetic Chain Precedence Hierarchy (LPHC > Knee > Foot > Shoulder > Cervical): [ENGINEERING-PROPOSAL]
 * - AD-001 (Exact Dosage Pinning): [NEEDS-ADMIN-DECISION] / TEMPORARY_OPERATIONAL_DEFAULT
 * - AD-002 (AWS Missing Laterality): [NEEDS-ADMIN-DECISION] / POLICY_AD002_AWS_MISSING_LATERALITY
 * - SG-001 (Scapular Winging Phase 4 Gap): [NEEDS-ADMIN-DECISION] / Level 3 Fallback
 */

(function (root, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    const prehabData = require("./prehab_data.js");
    module.exports = factory(prehabData);
  } else if (typeof define === "function" && define.amd) {
    define(["./prehab_data.js"], factory);
  } else {
    root.PREHAB_ENGINE = factory(root.PREHAB_DATA || {
      PREHAB_EXERCISES: root.PREHAB_EXERCISES,
      getPrehabExerciseById: root.getPrehabExerciseById,
      PREHAB_EXERCISE_CATALOG_VERSION: root.PREHAB_EXERCISE_CATALOG_VERSION
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (prehabData) {
  "use strict";

  const {
    PREHAB_EXERCISES = [],
    getPrehabExerciseById = () => null,
    PREHAB_EXERCISE_CATALOG_VERSION = "1.0-locked"
  } = prehabData;

  // =========================================================================
  // 1. ENGINE CONFIGURATION & OPEN DECISION POLICIES
  // =========================================================================

  /**
   * AD-001: Exact Dosage Pinning Policy
   * Provenance: [NEEDS-ADMIN-DECISION] / TEMPORARY_OPERATIONAL_DEFAULT
   */
  const POLICY_AD001_DOSAGE = {
    provenance: "TEMPORARY_OPERATIONAL_DEFAULT (ADMIN-PENDING AD-001)",
    modeA_preWorkout: {
      inhibit: { sets: 1, durationSeconds: 45, holdSeconds: 30, tempo: "Sustained pressure", intent: "ZERO FATIGUE" },
      lengthen: { sets: 1, durationSeconds: 25, holdSeconds: 25, tempo: "Static hold capped", intent: "ZERO FATIGUE" }, // NSCA <=30s cap
      activate: { sets: 1, reps: 10, holdSeconds: 2, tempo: "4/2/1", intent: "ZERO FATIGUE" },
      integrate: { sets: 1, reps: 8, holdSeconds: 1, tempo: "Controlled dynamic", intent: "ZERO FATIGUE" },
      totalTargetTime: "3–6 minutes"
    },
    modeB_offDay: {
      inhibit: { sets: 2, durationSeconds: 60, holdSeconds: 60, tempo: "Sustained pressure", intent: "TISSUE RESTORATION" },
      lengthen: { sets: 2, durationSeconds: 35, holdSeconds: 35, tempo: "Static hold", intent: "TISSUE RESTORATION" },
      activate: { sets: 2, reps: 12, holdSeconds: 2, tempo: "4/2/1", intent: "TISSUE RESTORATION" },
      integrate: { sets: 2, reps: 10, holdSeconds: 2, tempo: "Controlled dynamic", intent: "TISSUE RESTORATION" },
      totalTargetTime: "12–20 minutes"
    }
  };

  /**
   * AD-002: Asymmetric Weight Shift Missing Laterality Policy
   * Provenance: [NEEDS-ADMIN-DECISION] / POLICY_AD002_AWS_MISSING_LATERALITY
   * Values: 'NEEDS_LATERALITY' | 'BILATERAL_SAFE_FALLBACK'
   */
  const POLICY_AD002_AWS_MISSING_LATERALITY = "NEEDS_LATERALITY";

  /**
   * SG-001: Scapular Winging Phase 4 Gap Policy
   * Provenance: [NEEDS-ADMIN-DECISION] / LEVEL_3_FALLBACK
   */
  const POLICY_SG001_SCAPULAR_WINGING_P4 = "LEVEL_3_FALLBACK";

  // Context Suitability Multipliers [ENGINEERING-PROPOSAL]
  const CONTEXT_MULTIPLIERS = {
    foot_ankle: { lower: 2.0, upper: 1.0, full_body: 1.5, quality_run: 3.5, easy_run: 2.5, soccer: 3.0, offday: 2.0 },
    knee:       { lower: 3.5, upper: 1.0, full_body: 2.5, quality_run: 2.0, easy_run: 2.0, soccer: 3.5, offday: 2.0 },
    lphc:       { lower: 3.0, upper: 1.5, full_body: 3.0, quality_run: 2.5, easy_run: 2.5, soccer: 2.5, offday: 3.0 },
    shoulder:   { lower: 1.0, upper: 3.5, full_body: 2.0, quality_run: 1.0, easy_run: 1.0, soccer: 1.0, offday: 2.0 },
    cervical_spine: { lower: 1.0, upper: 3.0, full_body: 1.5, quality_run: 1.0, easy_run: 1.0, soccer: 1.0, offday: 2.5 }
  };

  // Kinetic Chain Tie-Breaking Precedence [ENGINEERING-PROPOSAL]
  const KINETIC_PRECEDENCE = {
    lphc: 5,
    knee: 4,
    foot_ankle: 3,
    shoulder: 2,
    cervical_spine: 1
  };

  // Supported Equipment Set [PRODUCT-RULE]
  const DEFAULT_EQUIPMENT_SET = [
    "bodyweight",
    "foam_roller",
    "lacrosse_ball",
    "mini_band",
    "dumbbell",
    "mat",
    "wall"
  ];

  // =========================================================================
  // 2. HELPER UTILITIES (PURE & DETERMINISTIC)
  // =========================================================================

  function deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeKey(str) {
    if (!str) return "";
    return str.toString().trim().toLowerCase();
  }

  function getRegionFromImpairment(key) {
    const k = normalizeKey(key);
    if (k.includes("lphc") || k.includes("apt") || k.includes("ppt") || k.includes("lean") || k.includes("shift")) return "lphc";
    if (k.includes("knee") || k.includes("valgus") || k.includes("varus")) return "knee";
    if (k.includes("foot") || k.includes("ankle") || k.includes("turnout") || k.includes("flatten")) return "foot_ankle";
    if (k.includes("shldr") || k.includes("shoulder") || k.includes("scap") || k.includes("wing")) return "shoulder";
    if (k.includes("neck") || k.includes("head") || k.includes("cervical")) return "cervical_spine";
    return "lphc"; // Default safe kinetic center
  }

  // =========================================================================
  // 3. PIPELINE STAGES (14 STAGES)
  // =========================================================================

  /**
   * STAGE 01 & 02: Ingest & Normalize Input
   */
  function stage01_02_normalizeInput(rawInput, workoutContextOverride, sessionModeOverride) {
    if (!rawInput || typeof rawInput !== "object") {
      rawInput = {};
    }

    const input = deepClone(rawInput);

    // Resolve workoutContext
    const rawContext = workoutContextOverride !== undefined ? workoutContextOverride : input.workoutContext;
    const validContexts = ["lower", "upper", "full_body", "quality_run", "easy_run", "soccer", "offday"];
    const isContextMissing = !rawContext || !validContexts.includes(normalizeKey(rawContext));
    const context = isContextMissing ? "full_body" : normalizeKey(rawContext);

    // Resolve sessionMode
    let mode = sessionModeOverride || input.sessionMode || "pre_workout";
    mode = normalizeKey(mode);
    if (!["pre_workout", "off_day"].includes(mode)) {
      mode = "pre_workout";
    }

    // Resolve findings
    let findings = [];
    if (Array.isArray(input.findings)) {
      findings = input.findings.map(f => {
        const impKey = normalizeKey(f.impairmentKey || f.key || f.id || "");
        return {
          impairmentKey: impKey,
          region: f.region || getRegionFromImpairment(impKey),
          laterality: normalizeKey(f.laterality || "bilateral"),
          userPriority: Boolean(f.userPriority || f.priority)
        };
      }).filter(f => f.impairmentKey.length > 0);
    }

    // Resolve availableEquipment
    let equipment = DEFAULT_EQUIPMENT_SET;
    if (Array.isArray(input.availableEquipment) && input.availableEquipment.length > 0) {
      equipment = input.availableEquipment.map(normalizeKey);
    }

    return {
      findings,
      activeSyndrome: input.activeSyndrome ? normalizeKey(input.activeSyndrome) : null,
      assessmentBranches: input.assessmentBranches || {},
      capabilityState: {
        canPerformSingleLegBalance: input.capabilityState?.canPerformSingleLegBalance !== false,
        overheadMobilityRestricted: Boolean(input.capabilityState?.overheadMobilityRestricted),
        floorMatAvailable: input.capabilityState?.floorMatAvailable !== false
      },
      workoutContext: context,
      isContextMissing,
      availableEquipment: equipment,
      sessionMode: mode,
      safetyReport: input.safetyReport || {}
    };
  }

  /**
   * STAGE 03: Mutual Exclusivity Validation (PR-001)
   * The engine cannot trust the UI. Contradictory inputs must return INVALID_INPUT.
   */
  function stage03_validateMutualExclusivity(normalizedInput) {
    const keys = normalizedInput.findings.map(f => f.impairmentKey);

    const hasApt = keys.some(k => k === "imp-lphc-apt" || k.includes("apt"));
    const hasPpt = keys.some(k => k === "imp-lphc-ppt" || k.includes("ppt"));
    if (hasApt && hasPpt) {
      return {
        valid: false,
        error: "MUTUAL_EXCLUSIVITY_VIOLATION",
        message: "Anterior Pelvic Tilt (APT) and Posterior Pelvic Tilt (PPT) are mutually exclusive."
      };
    }

    const hasValgus = keys.some(k => k === "imp-knee-valgus" || k.includes("valgus"));
    const hasVarus = keys.some(k => k === "imp-knee-varus" || k.includes("varus"));
    if (hasValgus && hasVarus) {
      return {
        valid: false,
        error: "MUTUAL_EXCLUSIVITY_VIOLATION",
        message: "Knee Valgus and Knee Varus are mutually exclusive frontal plane deviations."
      };
    }

    return { valid: true };
  }

  /**
   * STAGE 04: Syndrome Preset Expansion
   */
  function stage04_expandSyndrome(normalizedInput) {
    const findings = [...normalizedInput.findings];
    const syndrome = normalizedInput.activeSyndrome;

    if (syndrome === "lower_crossed") {
      if (!findings.some(f => f.impairmentKey.includes("apt"))) {
        findings.push({ impairmentKey: "imp-lphc-apt", region: "lphc", laterality: "bilateral", userPriority: false });
      }
      if (!findings.some(f => f.impairmentKey.includes("lean"))) {
        findings.push({ impairmentKey: "imp-lphc-lean", region: "lphc", laterality: "bilateral", userPriority: false });
      }
    } else if (syndrome === "upper_crossed") {
      if (!findings.some(f => f.impairmentKey.includes("fall"))) {
        findings.push({ impairmentKey: "imp-shldr-fall", region: "shoulder", laterality: "bilateral", userPriority: false });
      }
      if (!findings.some(f => f.impairmentKey.includes("round"))) {
        findings.push({ impairmentKey: "imp-shldr-round", region: "shoulder", laterality: "bilateral", userPriority: false });
      }
      if (!findings.some(f => f.impairmentKey.includes("neck") || f.impairmentKey.includes("head"))) {
        findings.push({ impairmentKey: "imp-neck-fwd", region: "cervical_spine", laterality: "bilateral", userPriority: false });
      }
    } else if (syndrome === "pronation_distortion") {
      if (!findings.some(f => f.impairmentKey.includes("flatten"))) {
        findings.push({ impairmentKey: "imp-foot-flatten", region: "foot_ankle", laterality: "bilateral", userPriority: false });
      }
      if (!findings.some(f => f.impairmentKey.includes("valgus"))) {
        findings.push({ impairmentKey: "imp-knee-valgus", region: "knee", laterality: "bilateral", userPriority: false });
      }
      if (!findings.some(f => f.impairmentKey.includes("turnout"))) {
        findings.push({ impairmentKey: "imp-foot-turnout", region: "foot_ankle", laterality: "bilateral", userPriority: false });
      }
    }

    return findings;
  }

  /**
   * STAGE 05: Impairment Candidate Generation & Priority Ordering
   */
  function stage05_prioritizeImpairments(findings, workoutContext) {
    if (!findings || findings.length === 0) {
      return {
        topImpairment: "default_general",
        topFinding: { impairmentKey: "default_general", region: "lphc", laterality: "bilateral", userPriority: false },
        rankedFindings: [],
        isEmpty: true
      };
    }

    const scoredFindings = findings.map(f => {
      const region = f.region || getRegionFromImpairment(f.impairmentKey);
      const mult = (CONTEXT_MULTIPLIERS[region] && CONTEXT_MULTIPLIERS[region][workoutContext]) || 1.0;
      const kineticBonus = KINETIC_PRECEDENCE[region] || 0;
      const priorityBonus = f.userPriority ? 50 : 0;
      const totalScore = 100 * mult + priorityBonus + kineticBonus;

      return {
        ...f,
        region,
        contextMultiplier: mult,
        kineticBonus,
        priorityBonus,
        priorityScore: totalScore
      };
    });

    // Sort descending by priorityScore. Deterministic tie-breaker:
    scoredFindings.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      if (b.kineticBonus !== a.kineticBonus) return b.kineticBonus - a.kineticBonus;
      return a.impairmentKey.localeCompare(b.impairmentKey);
    });

    return {
      topImpairment: scoredFindings[0].impairmentKey,
      topFinding: scoredFindings[0],
      rankedFindings: scoredFindings,
      isEmpty: false
    };
  }

  /**
   * STAGE 06: Context Multiplier Lookup
   */
  function stage06_getContextMultiplier(region, workoutContext) {
    if (!CONTEXT_MULTIPLIERS[region]) return 1.0;
    return CONTEXT_MULTIPLIERS[region][workoutContext] || 1.0;
  }

  /**
   * STAGE 07: Equipment Availability Filter
   */
  function stage07_filterEquipment(candidates, availableEquipment) {
    return candidates.filter(ex => {
      // If exercise requires no equipment or bodyweight, it is always available
      if (!ex.equipment || ex.equipment.length === 0 || ex.equipment.includes("bodyweight")) {
        return true;
      }
      // Check if all required equipment tokens are present in availableEquipment
      return ex.equipment.every(eq => availableEquipment.includes(eq));
    });
  }

  /**
   * STAGE 08: Exercise Candidate Retrieval
   */
  function stage08_retrieveCandidates(phase, primaryImpairment, workoutContext, catalog) {
    const phaseExercises = catalog.filter(ex => ex.phase === phase);

    // Cross-context safety: On a 'lower' body workout, if upper-body impairment was prioritized,
    // Phase 4 (Integrate) MUST be a lower/core integration drill (e.g. Pause Squat or Squat to Press)
    // so the athlete's lower body is safely prepped for the day's heavy compound squatting.
    const isUpperImpairmentOnLowerDay =
      workoutContext === "lower" &&
      phase === "integrate" &&
      (primaryImpairment.includes("shldr") || primaryImpairment.includes("scap") || primaryImpairment.includes("neck"));

    if (isUpperImpairmentOnLowerDay) {
      const lowerIntegrations = phaseExercises.filter(ex =>
        ex.compatibleContexts && ex.compatibleContexts.includes("lower") &&
        (ex.exerciseId === "cex-int-01" || ex.exerciseId === "cex-int-08")
      );
      if (lowerIntegrations.length > 0) return lowerIntegrations;
    }

    // Direct match: Exercise explicitly lists the primary impairment
    let matched = phaseExercises.filter(ex =>
      ex.addressedImpairments && ex.addressedImpairments.includes(primaryImpairment)
    );

    // If zero direct matches, search for substring match (e.g. 'apt' in 'imp-lphc-apt')
    if (matched.length === 0) {
      matched = phaseExercises.filter(ex =>
        ex.addressedImpairments && ex.addressedImpairments.some(imp =>
          primaryImpairment.includes(imp) || imp.includes(primaryImpairment)
        )
      );
    }

    return matched;
  }

  /**
   * STAGE 09: Multi-Factor Candidate Scoring
   * S_total = S_impairment + S_context + S_phase + S_equipment + S_specificity + S_laterality
   */
  function stage09_scoreCandidate(candidate, phase, primaryImpairment, workoutContext, finding) {
    // 1. S_impairment:
    // 2. S_context & Region
    const region = getRegionFromImpairment(primaryImpairment);

    // 1. S_impairment:
    // +100 if candidate's checkpoint directly matches impairment region or matches primary impairment
    // +60 if candidate addresses it as secondary/associated
    let sImpairment = 0;
    if (candidate.addressedImpairments && candidate.addressedImpairments.length > 0) {
      if (candidate.addressedImpairments.includes(primaryImpairment)) {
        if (candidate.kineticChainCheckpoint && candidate.kineticChainCheckpoint.includes(region)) {
          sImpairment = 100;
        } else if (candidate.addressedImpairments[0] === primaryImpairment) {
          sImpairment = 100;
        } else {
          sImpairment = 60;
        }
      } else if (candidate.addressedImpairments.some(imp => primaryImpairment.includes(imp) || imp.includes(primaryImpairment))) {
        sImpairment = 60;
      }
    }

    const wContext = stage06_getContextMultiplier(region, workoutContext);
    const sContext = Math.round(sImpairment * (wContext - 1.0));

    // 3. S_phase
    const sPhase = candidate.phase === phase ? 100 : 0;

    // 4. S_equipment frictionless gear bonus
    let sEquipment = 0;
    if (candidate.equipment.includes("bodyweight") || candidate.equipment.length === 0) {
      sEquipment = 20;
    } else if (candidate.equipment.includes("mini_band") || candidate.equipment.includes("mat")) {
      sEquipment = 10;
    } else if (candidate.equipment.includes("foam_roller") || candidate.equipment.includes("lacrosse_ball")) {
      sEquipment = 5;
    }

    // 5. S_specificity (user priority bonus)
    const sSpecificity = finding.userPriority ? 50 : 0;

    // 6. S_laterality
    let sLaterality = 0;
    if (primaryImpairment.includes("shift") || primaryImpairment.includes("aws")) {
      sLaterality = 25; // Asymmetric specific targeting
    } else if (finding.laterality === "bilateral") {
      sLaterality = 10;
    }

    // 7. Checkpoint & Context Alignment Bonuses
    let sAlignment = 0;
    if (candidate.kineticChainCheckpoint && candidate.kineticChainCheckpoint.includes(region)) {
      sAlignment += 10;
    }
    // Running sport preparation bonus (S02)
    if ((workoutContext === "quality_run" || workoutContext === "easy_run") && candidate.addressedImpairments && candidate.addressedImpairments.includes("imp-run-quality")) {
      sAlignment += 50;
    }

    // Impairment prefix source-matrix match bonus (SE, SW, FH, KV, FA, LBR, EFL, AWS)
    const IMPAIRMENT_PREFIX_MAP = {
      "imp-shldr-elev": "SE",
      "imp-scap-wing": "SW",
      "imp-neck-fwd": "FH",
      "imp-shldr-fall": "SE",
      "imp-shldr-round": "SW",
      "imp-knee-valgus": "KV",
      "imp-knee-varus": "KV",
      "imp-foot-turnout": "FA",
      "imp-foot-flatten": "FA",
      "imp-lphc-ppt": "LBR",
      "imp-lphc-apt": "EFL",
      "imp-lphc-lean": "EFL",
      "imp-lphc-asymmetric-shift": "AWS"
    };
    const prefix = IMPAIRMENT_PREFIX_MAP[primaryImpairment];
    if (prefix && (candidate.matrixId?.startsWith(prefix) || candidate.aliases?.some(a => a.startsWith(prefix)))) {
      sAlignment += 25;
    }

    // Special Full-Body multi-joint linkage for Phase 4 (Test 12)
    if (workoutContext === "full_body" && phase === "integrate" && candidate.exerciseId === "cex-int-08") {
      sAlignment += 25;
    }

    const totalScore = sImpairment + sContext + sPhase + sEquipment + sSpecificity + sLaterality + sAlignment;

    return {
      candidate,
      totalScore,
      breakdown: {
        sImpairment,
        sContext,
        wContext,
        sPhase,
        sEquipment,
        sSpecificity,
        sLaterality,
        sAlignment
      }
    };
  }

  /**
   * STAGE 10: Deterministic Tie-Breaking & Winner Selection
   */
  function stage10_tieBreakAndSelect(scoredCandidates) {
    if (!scoredCandidates || scoredCandidates.length === 0) return null;

    scoredCandidates.sort((a, b) => {
      // 1. Total score DESC
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;

      // 2. Equipment accessibility bonus DESC
      if (b.breakdown.sEquipment !== a.breakdown.sEquipment) {
        return b.breakdown.sEquipment - a.breakdown.sEquipment;
      }

      // 3. Exercise ID alphabetical ASC (deterministic final tie-breaker)
      return a.candidate.exerciseId.localeCompare(b.candidate.exerciseId);
    });

    return scoredCandidates[0];
  }

  /**
   * STAGE 11: Capability & Biomechanical Audit
   */
  function stage11_auditCapability(winner, capabilityState) {
    if (!winner || !winner.candidate) return null;
    const modified = deepClone(winner);

    // If client cannot balance on single leg, check regression
    if (!capabilityState.canPerformSingleLegBalance) {
      const isSingleLeg =
        modified.candidate.nameEn.toLowerCase().includes("single-leg") ||
        modified.candidate.nameEn.toLowerCase().includes("skater hop");
      if (isSingleLeg) {
        modified.capabilityRegressed = true;
        modified.regressionApplied = modified.candidate.regression || "Perform bilateral variant with both feet grounded.";
      }
    }

    return modified;
  }

  /**
   * STAGE 12: Dosage Assignment (Mode A vs Mode B)
   * Derived from POLICY_AD001_DOSAGE
   */
  function stage12_assignDosage(auditedWinner, phase, sessionMode, workoutContext) {
    if (!auditedWinner || !auditedWinner.candidate) return null;

    const ex = auditedWinner.candidate;
    const profile = sessionMode === "off_day"
      ? POLICY_AD001_DOSAGE.modeB_offDay[phase]
      : POLICY_AD001_DOSAGE.modeA_preWorkout[phase];

    let holdSec = profile.holdSeconds;
    let durationSec = profile.durationSeconds;

    // NSCA Pre-Workout Power Cap (S03 Ch. 14):
    // In pre-workout mode, static stretches must strictly not exceed 30s.
    if (sessionMode === "pre_workout" && phase === "lengthen") {
      if (holdSec > 30) holdSec = 30;
      if (durationSec > 30) durationSec = 30;
    }

    return {
      exerciseId: ex.exerciseId,
      matrixId: ex.matrixId || ex.exerciseId,
      aliases: ex.aliases || [],
      name: ex.name,
      nameEn: ex.nameEn,
      phase: ex.phase,
      trainingType: ex.trainingType,
      movementPattern: ex.movementPattern,
      kineticChainCheckpoint: ex.kineticChainCheckpoint,
      primaryMuscles: ex.primaryMuscles,
      equipment: ex.equipment,
      compatibleContexts: ex.compatibleContexts || [],
      formCues: ex.formCues,
      commonErrors: ex.commonErrors,
      cautions: ex.cautions,
      regression: auditedWinner.regressionApplied || ex.regression,
      progression: ex.progression,
      dosage: {
        sets: profile.sets,
        reps: profile.reps || null,
        durationSeconds: durationSec || null,
        holdSeconds: holdSec || null,
        tempo: profile.tempo,
        fatigueIntent: profile.intent
      },
      audit: {
        totalScore: auditedWinner.totalScore,
        breakdown: auditedWinner.breakdown,
        fallbackLevel: auditedWinner.fallbackLevel || 1,
        sourceProvenance: ex.sourceProvenance,
        provenanceClassification: ex.provenanceClassification
      }
    };
  }

  /**
   * STAGE 13: Pre-Output Safety Gate
   */
  function stage13_evaluateSafetyGate(routine, safetyReport) {
    const painLevel = Number(safetyReport?.painLevel || 0);
    const sharpPain = Boolean(safetyReport?.sharpRadiatingPain);

    if (painLevel >= 4 || sharpPain) {
      routine.status = "SAFETY_BLOCKED";
      routine.safetyNotice = {
        blocked: true,
        reason: sharpPain ? "SHARP_RADIATING_PAIN_DETECTED" : "ACUTE_PAIN_REPORTED_LEVEL_" + painLevel,
        messageVi: "CẢNH BÁO AN TOÀN: Dừng vận động ngay lập tức. Cơn đau cấp tính hoặc tê buốt lan tỏa có dấu hiệu tổn thương cơ học hoặc chèn ép thần kinh. Bạn cần tham vấn bác sĩ chuyên khoa hoặc chuyên gia vật lý trị liệu trước khi tiếp tục.",
        messageEn: "SAFETY GATE TRIGGERED: High acute pain or neurological red flag detected. Exercise recommendations safely withheld. Clinical evaluation required."
      };
      // Flush exercise prescriptions for safety
      routine.phases = {
        phase1_inhibit: null,
        phase2_lengthen: null,
        phase3_activate: null,
        phase4_integrate: null
      };
      return routine;
    }

    // Attach non-blocking safety cautions
    const cautions = [];
    let cautionTriggered = false;

    Object.values(routine.phases).forEach(item => {
      if (!item) return;
      if (item.nameEn && item.nameEn.toLowerCase().includes("piriformis")) {
        cautions.push("Thận trọng dây thần kinh tọa: Lập tức nhấc bóng ra nếu xuất hiện cảm giác tê giật buốt xuống chân.");
        cautionTriggered = true;
      }
    });

    routine.safetyNotice = {
      blocked: false,
      cautions: Array.from(new Set(cautions))
    };

    if (cautionTriggered && routine.status === "SAFE") {
      routine.status = "CAUTION_ATTACHED";
    }

    return routine;
  }

  /**
   * STAGE 14: Fallback Resolution Hierarchy (Levels 1 to 4)
   */
  function stage14_resolveFallback(phase, primaryImpairment, workoutContext, availableEquipment, catalog) {
    // Special handling for Scapular Winging P4 (SG-001)
    if (primaryImpairment.includes("wing") && phase === "integrate") {
      const p4Drill = catalog.find(ex => ex.exerciseId === "cex-int-07") || catalog.find(ex => ex.exerciseId === "cex-int-08");
      if (p4Drill) {
        return {
          candidate: p4Drill,
          totalScore: 150,
          breakdown: { sImpairment: 50, sContext: 0, sPhase: 100, sEquipment: 0, sSpecificity: 0, sLaterality: 0 },
          fallbackLevel: 3
        };
      }
    }

    // LEVEL 2: Same checkpoint compatible candidate
    const region = getRegionFromImpairment(primaryImpairment);
    let level2Candidates = catalog.filter(ex =>
      ex.phase === phase &&
      ex.kineticChainCheckpoint &&
      ex.kineticChainCheckpoint.includes(region)
    );
    level2Candidates = stage07_filterEquipment(level2Candidates, availableEquipment);
    if (level2Candidates.length > 0) {
      return {
        candidate: level2Candidates[0],
        totalScore: 180,
        breakdown: { sImpairment: 60, sContext: 0, sPhase: 100, sEquipment: 20, sSpecificity: 0, sLaterality: 0 },
        fallbackLevel: 2
      };
    }

    // LEVEL 3: Approved general movement prep candidate
    let level3Candidates = catalog.filter(ex =>
      ex.phase === phase &&
      (ex.exerciseId === "cex-int-08" || ex.exerciseId === "cex-int-01" || ex.exerciseId === "cex-int-05" ||
       ex.addressedImpairments?.includes("default_general"))
    );
    level3Candidates = stage07_filterEquipment(level3Candidates, availableEquipment);
    if (level3Candidates.length > 0) {
      return {
        candidate: level3Candidates[0],
        totalScore: 150,
        breakdown: { sImpairment: 50, sContext: 0, sPhase: 100, sEquipment: 0, sSpecificity: 0, sLaterality: 0 },
        fallbackLevel: 3
      };
    }

    // LEVEL 4: INSUFFICIENT_DATA (Zero fabricated exercises!)
    return null;
  }

  // =========================================================================
  // 4. PRIMARY RUNTIME API: generatePrehabRoutine()
  // =========================================================================

  /**
   * Generates a deterministic, 4-phase prehab routine.
   *
   * @param {Object} assessmentInput User findings, syndrome, capability, equipment
   * @param {string} [workoutContext] 'lower' | 'upper' | 'full_body' | 'quality_run' | 'easy_run' | 'soccer' | 'offday'
   * @param {string} [sessionMode] 'pre_workout' | 'off_day'
   * @returns {Object} Immutable PrehabRoutine
   */
  function generatePrehabRoutine(assessmentInput, workoutContext, sessionMode) {
    // Stage 01 & 02: Ingestion & Normalization
    const input = stage01_02_normalizeInput(assessmentInput, workoutContext, sessionMode);

    // Stage 03: Mutual Exclusivity Validation (PR-001)
    const exclusivityCheck = stage03_validateMutualExclusivity(input);
    if (!exclusivityCheck.valid) {
      return {
        routineId: "ERR_MUTUAL_EXCLUSIVITY",
        status: "INVALID_INPUT",
        error: exclusivityCheck.error,
        message: exclusivityCheck.message,
        phases: null,
        catalogVersion: PREHAB_EXERCISE_CATALOG_VERSION
      };
    }

    // Stage 04: Syndrome Expansion
    const expandedFindings = stage04_expandSyndrome(input);

    // Stage 05: Impairment Priority Ordering
    const { topImpairment, topFinding, rankedFindings, isEmpty } = stage05_prioritizeImpairments(
      expandedFindings,
      input.workoutContext
    );

    // Handle Empty Findings (Test 20)
    let primaryImpairment = topImpairment;
    let activeFinding = topFinding;
    let routineStatus = "SAFE";
    if (isEmpty) {
      primaryImpairment = "default_general";
      routineStatus = "SAFE";
    }

    // Handle Missing Context Fallback (Test 14)
    if (input.isContextMissing) {
      routineStatus = "FALLBACK_APPLIED";
    }

    // Handle Asymmetric Weight Shift Laterality (AD-002, Tests 17, 18, 19)
    let lateralityInstruction = activeFinding.laterality || "bilateral";
    const isAws = primaryImpairment.includes("shift") || primaryImpairment.includes("aws");
    if (isAws) {
      if (lateralityInstruction === "unspecified" || lateralityInstruction === "unknown") {
        if (POLICY_AD002_AWS_MISSING_LATERALITY === "NEEDS_LATERALITY") {
          routineStatus = "PARTIAL_NEEDS_LATERALITY";
        }
      }
    }

    // Pipeline Execution for each of the 4 phases
    const phasesToBuild = ["inhibit", "lengthen", "activate", "integrate"];
    const phaseOutputs = {};
    let fallbackAppliedOverall = false;
    let insufficientDataDetected = false;

    for (const phase of phasesToBuild) {
      // Stage 08: Retrieve candidates
      let candidates = stage08_retrieveCandidates(
        phase,
        primaryImpairment,
        input.workoutContext,
        PREHAB_EXERCISES
      );

      // Stage 07: Filter by equipment
      let eligibleCandidates = stage07_filterEquipment(candidates, input.availableEquipment);

      let winner = null;

      if (eligibleCandidates.length > 0) {
        // Stage 09: Score each candidate
        const scored = eligibleCandidates.map(c =>
          stage09_scoreCandidate(c, phase, primaryImpairment, input.workoutContext, activeFinding)
        );

        // Stage 10: Tie-break and select winner
        winner = stage10_tieBreakAndSelect(scored);
        if (winner) winner.fallbackLevel = 1;
      } else {
        // Stage 14: Fallback Resolution Hierarchy
        winner = stage14_resolveFallback(
          phase,
          primaryImpairment,
          input.workoutContext,
          input.availableEquipment,
          PREHAB_EXERCISES
        );

        if (winner) {
          fallbackAppliedOverall = true;
        } else {
          // If Phase 1 SMR lacks equipment, apply Section 11 EQUIPMENT_BYPASSED rule
          if (phase === "inhibit" && (!input.availableEquipment.includes("foam_roller") && !input.availableEquipment.includes("lacrosse_ball"))) {
            fallbackAppliedOverall = true;
            winner = {
              candidate: {
                exerciseId: "EQUIPMENT_BYPASSED",
                matrixId: "EQUIPMENT_BYPASSED",
                aliases: [],
                name: "Bỏ Qua Lăn Cơ (Không có Foam Roller)",
                nameEn: "Inhibit Bypassed (SMR Equipment Unavailable)",
                phase: "inhibit",
                trainingType: "MOBILITY",
                movementPattern: "MOBILITY",
                kineticChainCheckpoint: getRegionFromImpairment(primaryImpairment),
                primaryMuscles: ["NOT SPECIFIED"],
                equipment: ["bodyweight"],
                compatibleContexts: ["lower", "upper", "full_body", "quality_run", "easy_run", "soccer", "offday"],
                formCues: ["Tiếp tục chuyển ngay sang Phase 2 (Giãn tĩnh) và Phase 3 (Kích hoạt cơ)."],
                commonErrors: [],
                cautions: "Không có dụng cụ SMR; bỏ qua Phase 1 để tập trung kéo giãn tĩnh an toàn.",
                regression: "None",
                progression: "None",
                sourceProvenance: { sourceId: "SOURCE-01", raw: "S01 Ch. 9 Equipment Bypass Protocol" },
                provenanceClassification: { physiologicalFacts: "SOURCE-VERIFIED", operationalParameters: "DINO DESIGN DECISION" }
              },
              totalScore: 0,
              breakdown: { sImpairment: 0, sContext: 0, sPhase: 100, sEquipment: 20, sSpecificity: 0, sLaterality: 0 },
              fallbackLevel: 2
            };
          } else {
            insufficientDataDetected = true;
          }
        }
      }

      if (winner) {
        // Stage 11: Capability Audit
        const audited = stage11_auditCapability(winner, input.capabilityState);

        // Stage 12: Dosage Assignment
        const dosedItem = stage12_assignDosage(audited, phase, input.sessionMode, input.workoutContext);
        if (dosedItem) {
          dosedItem.lateralityInstruction = lateralityInstruction;
          // Specialized cross-body labeling for AWS (Tests 17, 18)
          if (isAws && (lateralityInstruction === "left" || lateralityInstruction === "right")) {
            dosedItem.asymmetricFocus = {
              shiftedSide: lateralityInstruction,
              targetLaterality: (phase === "inhibit" || phase === "lengthen") ? "same_side_and_opposite" : "same_side"
            };
          }
        }
        phaseOutputs["phase" + (phasesToBuild.indexOf(phase) + 1) + "_" + phase] = dosedItem;
      } else {
        phaseOutputs["phase" + (phasesToBuild.indexOf(phase) + 1) + "_" + phase] = null;
      }
    }

    if (insufficientDataDetected) {
      routineStatus = "INSUFFICIENT_DATA";
    } else if (input.isContextMissing || (fallbackAppliedOverall && routineStatus === "SAFE")) {
      routineStatus = "FALLBACK_APPLIED";
    }

    // Assemble PrehabRoutine Contract (Section 15)
    let prehabRoutine = {
      routineId: "dino-prehab-" + primaryImpairment + "-" + input.workoutContext + "-" + input.sessionMode,
      catalogVersion: PREHAB_EXERCISE_CATALOG_VERSION,
      status: routineStatus,
      contextSnapshot: {
        primaryImpairment,
        resolvedRegion: getRegionFromImpairment(primaryImpairment),
        laterality: lateralityInstruction,
        workoutContext: input.workoutContext,
        sessionMode: input.sessionMode,
        isContextMissing: input.isContextMissing
      },
      phases: phaseOutputs,
      auditTrail: {
        topFinding: activeFinding,
        rankedFindings,
        availableEquipment: input.availableEquipment,
        openDecisionPolicies: {
          AD_001_Dosage: POLICY_AD001_DOSAGE.provenance,
          AD_002_AwsMissingLaterality: POLICY_AD002_AWS_MISSING_LATERALITY,
          SG_001_ScapularWingingP4: POLICY_SG001_SCAPULAR_WINGING_P4
        }
      }
    };

    // Stage 13: Pre-Output Safety Gate
    prehabRoutine = stage13_evaluateSafetyGate(prehabRoutine, input.safetyReport);

    return deepClone(prehabRoutine);
  }

  // =========================================================================
  // 5. PUBLIC API & RUNTIME EXPORTS
  // =========================================================================

  const api = {
    generatePrehabRoutine,
    stage01_02_normalizeInput,
    stage03_validateMutualExclusivity,
    stage04_expandSyndrome,
    stage05_prioritizeImpairments,
    stage06_getContextMultiplier,
    stage07_filterEquipment,
    stage08_retrieveCandidates,
    stage09_scoreCandidate,
    stage10_tieBreakAndSelect,
    stage11_auditCapability,
    stage12_assignDosage,
    stage13_evaluateSafetyGate,
    stage14_resolveFallback,
    getRegionFromImpairment,
    POLICY_AD001_DOSAGE,
    POLICY_AD002_AWS_MISSING_LATERALITY,
    POLICY_SG001_SCAPULAR_WINGING_P4,
    CONTEXT_MULTIPLIERS,
    KINETIC_PRECEDENCE
  };

  return api;
});
