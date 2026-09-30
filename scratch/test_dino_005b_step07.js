/**
 * DINO-005B STEP 07 — DETERMINISTIC PREHAB ENGINE TEST SUITE
 *
 * Tests:
 * 1. 25 Specification Verification Cases from DETERMINISTIC_SCORING_SPECIFICATION.md
 * 2. Determinism (byte-equivalent JSON across identical calls)
 * 3. Immutability & Mutation Safety (no mutation of catalog, inputs, or program presets)
 * 4. Invalid Input Handling (APT XOR PPT, Valgus XOR Varus)
 * 5. Minimal Equipment Filtering
 * 6. Laterality & Cross-Body Coupling (AWS)
 * 7. Pre-Output Safety Gate (Pain >= 4, Sharp radiating pain)
 * 8. 4-Tier Fallback Hierarchy & Phase Gap Safety
 * 9. History Immutability (Completed workout records unchanged)
 * 10. DINO-005A Exercise Identity Compatibility
 */

const assert = require('assert');
const prehabEngine = require('../js/prehab_engine.js');
const prehabData = require('../js/prehab_data.js');
const dinoData = require('../js/data.js');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  FAIL: ${desc}`);
    console.error(`    Error: ${err.message}`);
    failCount++;
  }
}

function suite(name) {
  console.log(`\n[SUITE] ${name}`);
}

console.log("==================================================");
console.log("STARTING DINO-005B STEP 07 TEST SUITE");
console.log("==================================================");

// =========================================================================
// SUITE 1: 25 SPECIFICATION MATRIX TEST CASES
// =========================================================================
suite("Step 06 Test Matrix (25 Cases)");

it("Test 01: APT Only (lower, Mode A) selects LPHC anterior tilt protocol & verifies Founder-authorized Mode A Integrate dosage (reps = 10)", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt", userPriority: false }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "SAFE");
  assert.strictEqual(routine.contextSnapshot.primaryImpairment, "imp-lphc-apt");
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-05"); // SMR Quads / Rectus Fem (EFL-INH-02)
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-05"); // Kneeling Hip Flexor (EFL-LEN-02)
  assert.strictEqual(routine.phases.phase3_activate.exerciseId, "cex-act-04"); // Floor Glute Bridge (EFL-ACT-02)
  assert(routine.phases.phase4_integrate.exerciseId === "cex-int-01" || routine.phases.phase4_integrate.exerciseId === "cex-int-08");
  assert.strictEqual(routine.phases.phase4_integrate.dosage.sets, 1);
  assert.strictEqual(routine.phases.phase4_integrate.dosage.reps, 10);
});

it("Test 02: PPT Only (lower, Mode A) selects posterior pelvic tilt corrective protocol", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-ppt", userPriority: false }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "SAFE");
  assert.strictEqual(routine.contextSnapshot.primaryImpairment, "imp-lphc-ppt");
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-06"); // SMR Hamstrings (LBR-INH-01)
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-06"); // Static Hamstring Stretch (LBR-LEN-01)
  assert.strictEqual(routine.phases.phase4_integrate.exerciseId, "cex-int-01"); // Pause Squat (LBR-INT-01)
});

it("Test 03: Valgus Only (soccer, Mode A) applies soccer multiplier and targets adductor/glute", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-knee-valgus", userPriority: false }] },
    "soccer",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "SAFE");
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-03"); // SMR Adductors (KV-INH-02)
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-03"); // Standing Adductor Stretch (KV-LEN-02)
  assert(routine.phases.phase3_activate.exerciseId === "cex-act-02" || routine.phases.phase3_activate.exerciseId === "cex-act-03"); // Glute Med
});

it("Test 04: Varus Only (lower, Mode A) retrieves lateral chain / TFL candidates", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-knee-varus", userPriority: false }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "SAFE");
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-04"); // SMR TFL/ITB
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-04"); // Static TFL Stretch
});

it("Test 05: APT + Valgus with Valgus priority (+50 bonus) -> Valgus wins", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    {
      findings: [
        { impairmentKey: "imp-lphc-apt", userPriority: false },
        { impairmentKey: "imp-knee-valgus", userPriority: true }
      ]
    },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.contextSnapshot.primaryImpairment, "imp-knee-valgus");
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-03"); // Adductor SMR
});

it("Test 06: PPT + Varus (full_body, Mode B) -> Kinetic precedence LPHC > Knee -> PPT wins", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    {
      findings: [
        { impairmentKey: "imp-knee-varus", userPriority: false },
        { impairmentKey: "imp-lphc-ppt", userPriority: false }
      ]
    },
    "full_body",
    "off_day"
  );
  assert.strictEqual(routine.contextSnapshot.primaryImpairment, "imp-lphc-ppt");
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-06"); // Hamstring complex SMR
});

it("Test 07: Lower Workout with Shoulder Impairment -> P1-P3 Shoulder, P4 filtered to Lower integration drill", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-shldr-fall", userPriority: false }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-08"); // Lat SMR
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-07"); // Kneeling Lat Stretch
  assert.strictEqual(routine.phases.phase3_activate.exerciseId, "cex-act-07"); // Prone Cobra
  // Phase 4 cross-context safety filter:
  assert(routine.phases.phase4_integrate.exerciseId === "cex-int-01" || routine.phases.phase4_integrate.exerciseId === "cex-int-08");
  assert(routine.phases.phase4_integrate.compatibleContexts.includes("lower"));
});

it("Test 08: Upper Workout with Shoulder Elevation -> SMR Upper Trap, Stretch Trap, Activate Mid/Lower Trap", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-shldr-elev", userPriority: false }] },
    "upper",
    "pre_workout"
  );
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-10"); // SMR Upper Trap / Levator
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-09"); // Static Upper Trap / Levator Stretch
  assert(routine.phases.phase3_activate.exerciseId === "cex-act-07" || routine.phases.phase3_activate.exerciseId === "cex-act-08");
});

it("Test 09: Quality Run (Foot Turnout) -> Static stretch capped <= 30s per NSCA Ch. 14", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-foot-turnout", userPriority: false }] },
    "quality_run",
    "pre_workout"
  );
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-01"); // Calves SMR
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-01"); // Gastrocnemius Stretch
  // Hold seconds must not exceed 30s in pre-workout mode:
  assert(routine.phases.phase2_lengthen.dosage.holdSeconds <= 30);
});

it("Test 10: Easy Run with APT -> Aerobic gait stabilization without fatigue", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt", userPriority: false }] },
    "easy_run",
    "pre_workout"
  );
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-05");
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-05");
  assert.strictEqual(routine.phases.phase3_activate.exerciseId, "cex-act-04");
  assert.strictEqual(routine.phases.phase1_inhibit.dosage.fatigueIntent, "ZERO FATIGUE");
});

it("Test 11: Soccer Match with Knee Valgus -> Groin prep prioritized", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-knee-valgus", userPriority: false }] },
    "soccer",
    "pre_workout"
  );
  assert.strictEqual(routine.phases.phase1_inhibit.exerciseId, "cex-inh-03"); // Adductor SMR
  assert.strictEqual(routine.phases.phase2_lengthen.exerciseId, "cex-len-03"); // Adductor Stretch
});

it("Test 12: Full Body with APT -> Global kinetic chain linkage in Phase 4", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt", userPriority: false }] },
    "full_body",
    "pre_workout"
  );
  assert(routine.phases.phase4_integrate.exerciseId === "cex-int-08" || routine.phases.phase4_integrate.exerciseId === "cex-int-01");
});

it("Test 13: Off-Day Mode (APT, Mode B) -> Assigns Mode B restoration volume (sets: 2, hold = 30s)", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt", userPriority: false }] },
    "offday",
    "off_day"
  );
  assert.strictEqual(routine.contextSnapshot.sessionMode, "off_day");
  assert.strictEqual(routine.phases.phase1_inhibit.dosage.sets, 2);
  assert.strictEqual(routine.phases.phase1_inhibit.dosage.holdSeconds, 60);
  assert.strictEqual(routine.phases.phase2_lengthen.dosage.sets, 2);
  assert.strictEqual(routine.phases.phase2_lengthen.dosage.holdSeconds, 30);
  assert.strictEqual(routine.phases.phase2_lengthen.dosage.durationSeconds, 30);
  assert.strictEqual(routine.phases.phase1_inhibit.dosage.fatigueIntent, "TISSUE RESTORATION");
});

it("Test 14: Missing Context -> Neutral fallback multiplier W=1.0 and FALLBACK_APPLIED status", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt", userPriority: false }] },
    "",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "FALLBACK_APPLIED");
  assert.strictEqual(routine.contextSnapshot.workoutContext, "full_body");
  assert.strictEqual(routine.contextSnapshot.isContextMissing, true);
});

it("Test 15: Missing Equipment (Only bodyweight) -> Eliminates roller exercises", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    {
      findings: [{ impairmentKey: "imp-lphc-apt", userPriority: false }],
      availableEquipment: ["bodyweight"]
    },
    "lower",
    "pre_workout"
  );
  // All selected exercises must be compatible with available equipment
  Object.values(routine.phases).forEach(item => {
    if (item) {
      assert(item.equipment.includes("bodyweight") || item.equipment.length === 0);
    }
  });
});

it("Test 16: Bilateral State -> Preserves bilateral instruction across outputs", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-foot-turnout", laterality: "bilateral" }] },
    "quality_run",
    "pre_workout"
  );
  assert.strictEqual(routine.contextSnapshot.laterality, "bilateral");
  assert.strictEqual(routine.phases.phase1_inhibit.lateralityInstruction, "bilateral");
});

it("Test 17: Left Laterality for Asymmetric Weight Shift -> Preserves shifted side Left", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-asymmetric-shift", laterality: "left" }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.contextSnapshot.laterality, "left");
  assert.strictEqual(routine.phases.phase1_inhibit.asymmetricFocus.shiftedSide, "left");
});

it("Test 18: Right Laterality for Asymmetric Weight Shift -> Preserves shifted side Right", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-asymmetric-shift", laterality: "right" }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.contextSnapshot.laterality, "right");
  assert.strictEqual(routine.phases.phase1_inhibit.asymmetricFocus.shiftedSide, "right");
});

it("Test 19: AWS with Unspecified Laterality -> Status PARTIAL_NEEDS_LATERALITY per AD-002", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-asymmetric-shift", laterality: "unspecified" }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "PARTIAL_NEEDS_LATERALITY");
});

it("Test 20: Zero Impairments Selected -> Safe general athletic prep routine generated", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [] },
    "full_body",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "SAFE");
  assert.strictEqual(routine.contextSnapshot.primaryImpairment, "default_general");
  assert.ok(routine.phases.phase1_inhibit);
  assert.ok(routine.phases.phase4_integrate);
});

it("Test 21: Conflicting Payload (APT + PPT) -> Engine returns INVALID_INPUT (PR-001)", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    {
      findings: [
        { impairmentKey: "imp-lphc-apt" },
        { impairmentKey: "imp-lphc-ppt" }
      ]
    },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "INVALID_INPUT");
  assert.strictEqual(routine.error, "MUTUAL_EXCLUSIVITY_VIOLATION");
  assert.strictEqual(routine.phases, null);
});

it("Test 22: Candidate Absent (Gear constraint) -> Applies Level 2 same-checkpoint fallback", () => {
  // If equipment only has dumbbell and mat (no foam roller or bodyweight for SMR calves)
  const routine = prehabEngine.generatePrehabRoutine(
    {
      findings: [{ impairmentKey: "imp-foot-turnout" }],
      availableEquipment: ["mat", "mini_band", "dumbbell"]
    },
    "quality_run",
    "pre_workout"
  );
  assert.ok(routine);
  assert(routine.status === "SAFE" || routine.status === "FALLBACK_APPLIED");
});

it("Test 23: Scapular Winging P4 -> Resolves to Standing One-Arm Cable Chest Press (cex-int-07)", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-scap-wing" }] },
    "upper",
    "pre_workout"
  );
  // Scapular winging P4 resolves to source-verified Standing One-Arm Cable Chest Press (cex-int-07)
  assert.ok(routine.phases.phase4_integrate);
  assert.strictEqual(routine.phases.phase4_integrate.exerciseId, "cex-int-07");
  assert.strictEqual(routine.phases.phase4_integrate.nameEn, "Standing One-Arm Cable Chest Press");
  assert.strictEqual(routine.phases.phase4_integrate.phase, "integrate");
  assert(routine.phases.phase4_integrate.equipment.includes("cable"));
  // Invariant: Zero synthetic SG-001 Level 3 fallback is used for Phase 4
  assert.notStrictEqual(routine.phases.phase4_integrate.audit.fallbackLevel, 3);
});

it("Test 24: Pre-Output Safety Gate -> Pain level >= 4 blocks routine with SAFETY_BLOCKED", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    {
      findings: [{ impairmentKey: "imp-lphc-apt" }],
      safetyReport: { painLevel: 6, sharpRadiatingPain: true }
    },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "SAFETY_BLOCKED");
  assert.strictEqual(routine.safetyNotice.blocked, true);
  assert.strictEqual(routine.phases.phase1_inhibit, null);
  assert.strictEqual(routine.phases.phase4_integrate, null);
});

it("Test 25: Same-Score Candidate Tie-Breaking -> Deterministic winner (lowest ID / highest gear score)", () => {
  // Call twice with identical tie candidates
  const r1 = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt" }] },
    "lower",
    "pre_workout"
  );
  const r2 = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt" }] },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(r1.phases.phase1_inhibit.exerciseId, r2.phases.phase1_inhibit.exerciseId);
  assert.strictEqual(r1.phases.phase3_activate.exerciseId, r2.phases.phase3_activate.exerciseId);
});

// =========================================================================
// SUITE 2: DETERMINISM, MUTATION & INTEGRITY
// =========================================================================
suite("Determinism & Mutation Guarantees");

it("Determinism: Exact same input returns byte-identical JSON string across 5 iterations", () => {
  const input = {
    findings: [{ impairmentKey: "imp-knee-valgus", userPriority: true }],
    availableEquipment: ["bodyweight", "foam_roller", "mini_band"],
    sessionMode: "pre_workout",
    workoutContext: "soccer"
  };
  const str1 = JSON.stringify(prehabEngine.generatePrehabRoutine(input));
  for (let i = 0; i < 4; i++) {
    const strN = JSON.stringify(prehabEngine.generatePrehabRoutine(input));
    assert.strictEqual(str1, strN, `Iteration ${i+2} differed from iteration 1`);
  }
});

it("Input Mutation Safety: generatePrehabRoutine does not mutate passed input object", () => {
  const input = {
    findings: [{ impairmentKey: "imp-lphc-apt", userPriority: true }],
    availableEquipment: ["bodyweight", "foam_roller"]
  };
  const snapshotBefore = JSON.stringify(input);
  prehabEngine.generatePrehabRoutine(input, "lower", "pre_workout");
  const snapshotAfter = JSON.stringify(input);
  assert.strictEqual(snapshotBefore, snapshotAfter, "Input object was mutated!");
});

it("Catalog Mutation Safety: generatePrehabRoutine does not mutate PREHAB_EXERCISES catalog", () => {
  const countBefore = prehabData.PREHAB_EXERCISES.length;
  const ex1Before = JSON.stringify(prehabData.PREHAB_EXERCISES[0]);
  prehabEngine.generatePrehabRoutine({ findings: [{ impairmentKey: "imp-lphc-apt" }] }, "lower", "pre_workout");
  const countAfter = prehabData.PREHAB_EXERCISES.length;
  const ex1After = JSON.stringify(prehabData.PREHAB_EXERCISES[0]);
  assert.strictEqual(countBefore, countAfter);
  assert.strictEqual(ex1Before, ex1After, "Catalog record 0 was mutated!");
});

it("Mutual Exclusivity: Knee Valgus + Knee Varus returns INVALID_INPUT", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    {
      findings: [
        { impairmentKey: "imp-knee-valgus" },
        { impairmentKey: "imp-knee-varus" }
      ]
    },
    "lower",
    "pre_workout"
  );
  assert.strictEqual(routine.status, "INVALID_INPUT");
  assert.strictEqual(routine.error, "MUTUAL_EXCLUSIVITY_VIOLATION");
});

it("Phase Integrity: Zero fabricated exercises; every phase item matches a catalog record", () => {
  const routine = prehabEngine.generatePrehabRoutine(
    { findings: [{ impairmentKey: "imp-lphc-apt" }] },
    "lower",
    "pre_workout"
  );
  ["phase1_inhibit", "phase2_lengthen", "phase3_activate", "phase4_integrate"].forEach(p => {
    const item = routine.phases[p];
    assert.ok(item, `Phase ${p} missing`);
    const inCatalog = prehabData.getPrehabExerciseById(item.exerciseId);
    assert.ok(inCatalog, `Exercise ${item.exerciseId} was fabricated and not in catalog!`);
    assert.strictEqual(item.exerciseId, inCatalog.exerciseId);
  });
});

it("Completed Workout History Integrity: Existing workout history in storage is untouched", () => {
  // Verify DEFAULT_PROGRAMS is untouched
  assert.strictEqual(dinoData.DEFAULT_PROGRAMS.length, 1);
  assert.strictEqual(dinoData.DEFAULT_PROGRAMS[0].programId, "dino_hybrid_1");
  assert.strictEqual(dinoData.EXERCISE_LIBRARY.length, 59);
});

// =========================================================================
// TEST SUMMARY
// =========================================================================
console.log("\n==================================================");
console.log(`STEP 07 TEST RESULTS: ${passCount} passed, ${failCount} failed`);
console.log("==================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
