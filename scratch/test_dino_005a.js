/**
 * DINO-005A Automated Test Suite
 * Covers TEST 01 through TEST 12 from Section 49 of DINO-005A_SPECIFICATION.md
 */

// Mock localStorage for Node environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = { localStorage: global.localStorage };

const DinoData = require('../js/data.js');
const { STORAGE_KEYS, DinoStorage } = require('../js/storage.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`  PASS: ${message}`);
    passedTests++;
  }
}

console.log("==================================================");
console.log("STARTING DINO-005A AUTOMATED TEST MATRIX (12 TESTS)");
console.log("==================================================");

try {
  // Reset storage
  localStorage.clear();
  const storage = new DinoStorage();

  // -------------------------------------------------------------------------
  // TEST 01: Exercise Identity
  // Create Exercise -> Rename Exercise -> Verify exerciseId unchanged
  // -------------------------------------------------------------------------
  console.log("\n[TEST 01] Exercise Identity");
  const customEx1 = storage.saveCustomExercise({
    name: "Original Power Snatch",
    category: "Power",
    movementPattern: "Pull",
    equipment: "Barbell",
    primaryMuscles: ["Hamstrings", "Glutes", "Upper Back"]
  });
  const originalId = customEx1.id;
  assert(!!originalId && (originalId.startsWith("custom_ex_") || originalId.startsWith("ex-") || originalId.startsWith("ex_")), "Custom exercise receives valid ID prefix");
  
  // Update name
  const updatedEx1 = storage.updateCustomExercise(originalId, { name: "Renamed Snatch High Pull" });
  assert(updatedEx1.id === originalId, "exerciseId remains strictly identical after renaming");
  assert(updatedEx1.name === "Renamed Snatch High Pull", "Exercise name correctly updated");

  // -------------------------------------------------------------------------
  // TEST 02: Exercise Library Search
  // Search existing exercise -> Verify correct result
  // -------------------------------------------------------------------------
  console.log("\n[TEST 02] Exercise Library Search");
  const allExercises = storage.getAllExercises();
  assert(allExercises.length >= 59, `Exercise library contains all 59+ exercises (found ${allExercises.length})`);
  
  const squatMatches = allExercises.filter(e => 
    e.name.toLowerCase().includes("squat") || 
    (e.movementPattern && e.movementPattern.toLowerCase() === "squat")
  );
  assert(squatMatches.length >= 3, `Search for 'squat' finds relevant exercises (found ${squatMatches.length})`);
  const pinSquat = allExercises.find(e => e.name.includes("Pin Back Squat"));
  assert(pinSquat && pinSquat.movementPattern.toUpperCase() === "SQUAT", "Pin Back Squat exists with movementPattern 'SQUAT'");

  // -------------------------------------------------------------------------
  // TEST 03: Exercise Metadata
  // Open exercise -> Verify metadata (movementPattern, cues, muscles, equipment)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 03] Exercise Metadata");
  const rdl = storage.getExerciseById("ex-romanian-deadlift") || allExercises.find(e => e.name.includes("Romanian Deadlift"));
  assert(!!rdl, "Romanian Deadlift exists in library");
  assert(rdl.movementPattern.toUpperCase() === "HINGE", `RDL movementPattern is 'HINGE' (actual: ${rdl.movementPattern})`);
  assert(rdl.trainingType.toUpperCase() === "STRENGTH", `RDL trainingType is 'STRENGTH' (actual: ${rdl.trainingType})`);
  assert(rdl.equipment.toLowerCase().includes("dumbbell") || rdl.equipment.toLowerCase().includes("barbell"), `RDL equipment is valid (actual: ${rdl.equipment})`);
  assert(Array.isArray(rdl.primaryMuscles) && rdl.primaryMuscles.includes("Hamstrings"), "RDL primary muscles include 'Hamstrings'");
  assert(typeof rdl.formCues === "string" && rdl.formCues.length > 10, "RDL has coaching form cues");

  // -------------------------------------------------------------------------
  // TEST 04: Custom Exercise Persistence
  // Create custom exercise -> Verify unique ID -> Persist -> Reload -> Verify exists
  // -------------------------------------------------------------------------
  console.log("\n[TEST 04] Custom Exercise Persistence");
  const myCustom = storage.saveCustomExercise({
    name: "Deficit Bulgarian Split Squat",
    category: "Strength",
    movementPattern: "Lunge",
    equipment: "Dumbbells",
    primaryMuscles: ["Quads", "Glutes"],
    formCues: "Front foot on 25kg bumper plate, sink deep until back knee touches mat."
  });
  const customId = myCustom.id;
  assert(!!customId, "Custom exercise created with ID");

  // Reload fresh storage instance from localStorage
  const storage2 = new DinoStorage();
  const reloadedCustom = storage2.getCustomExercises().find(e => e.id === customId);
  assert(!!reloadedCustom, "Custom exercise persisted and reloaded from storage");
  assert(reloadedCustom.name === "Deficit Bulgarian Split Squat", "Custom exercise attributes match original");
  assert(reloadedCustom.movementPattern === "Lunge", "Custom exercise movementPattern preserved");

  // -------------------------------------------------------------------------
  // TEST 05: Prescription Add
  // Add exercise to Day -> Save -> Reload -> Verify prescription
  // -------------------------------------------------------------------------
  console.log("\n[TEST 05] Prescription Add");
  const progs = storage2.getPrograms();
  const prog = progs[0];
  const week = prog.weeks[0];
  const day = week.days[0];
  const initialExCount = day.exercises.length;

  const addedPrescription = storage2.addExerciseToDay(prog.id, week.id, day.id, myCustom);
  assert(!!addedPrescription && !!addedPrescription.prescriptionId, "Prescription created with distinct prescriptionId");
  assert(addedPrescription.order === initialExCount + 1, "Prescription order correctly assigned");

  // Reload fresh storage
  const storage3 = new DinoStorage();
  const reloadedProg = storage3.getProgramById(prog.id);
  const reloadedDay = reloadedProg.weeks[0].days[0];
  assert(reloadedDay.exercises.length === initialExCount + 1, "Day exercises count incremented");
  const foundPrescription = reloadedDay.exercises.find(e => e.prescriptionId === addedPrescription.prescriptionId);
  assert(!!foundPrescription, "Added prescription found in reloaded day");
  assert(foundPrescription.exerciseId === myCustom.id || foundPrescription.id === myCustom.id, "Prescription correctly references exerciseId");

  // -------------------------------------------------------------------------
  // TEST 06: Reorder
  // A B C -> C A B -> Verify persistence
  // -------------------------------------------------------------------------
  console.log("\n[TEST 06] Reorder Exercises in Day");
  // Create a clean test program with 3 exercises: A, B, C
  const reorderProg = storage3.createProgram("Reorder Test Program", "Testing order integrity");
  storage3.addWeekToProgram(reorderProg.id, "Week 1");
  const rProg = storage3.getProgramById(reorderProg.id);
  const rWeek = rProg.weeks[0];
  storage3.addDayToWeek(rProg.id, rWeek.id, { title: "Day 1", dayKey: "D1" });
  const rDay = storage3.getProgramById(reorderProg.id).weeks[0].days[0];

  const exA = storage3.addExerciseToDay(rProg.id, rWeek.id, rDay.id, { name: "Exercise A", category: "Strength" });
  const exB = storage3.addExerciseToDay(rProg.id, rWeek.id, rDay.id, { name: "Exercise B", category: "Strength" });
  const exC = storage3.addExerciseToDay(rProg.id, rWeek.id, rDay.id, { name: "Exercise C", category: "Strength" });

  let dayBefore = storage3.getProgramById(rProg.id).weeks[0].days[0];
  assert(dayBefore.exercises[0].name === "Exercise A" && dayBefore.exercises[1].name === "Exercise B" && dayBefore.exercises[2].name === "Exercise C", "Initial order is A, B, C");

  // Move C up once (index 2 -> 1)
  storage3.reorderExerciseInDay(rProg.id, rWeek.id, rDay.id, 2, "up");
  // Move C up again (index 1 -> 0)
  storage3.reorderExerciseInDay(rProg.id, rWeek.id, rDay.id, 1, "up");

  // Reload fresh storage
  const storage4 = new DinoStorage();
  const dayAfter = storage4.getProgramById(rProg.id).weeks[0].days[0];
  assert(dayAfter.exercises[0].name === "Exercise C", "First exercise is now Exercise C");
  assert(dayAfter.exercises[1].name === "Exercise A", "Second exercise is now Exercise A");
  assert(dayAfter.exercises[2].name === "Exercise B", "Third exercise is now Exercise B");
  assert(dayAfter.exercises[0].order === 1 && dayAfter.exercises[1].order === 2 && dayAfter.exercises[2].order === 3, "Orders are strictly 1, 2, 3");

  // -------------------------------------------------------------------------
  // TEST 07: Duplicate Safety
  // Duplicate prescription -> Edit duplicate -> Verify original unchanged
  // -------------------------------------------------------------------------
  console.log("\n[TEST 07] Duplicate Safety (Prescription Cloning)");
  const originalPrescription = dayAfter.exercises[0]; // Exercise C
  const duplicatedPrescription = storage4.duplicateExercisePrescription(rProg.id, rWeek.id, rDay.id, originalPrescription.prescriptionId);
  assert(duplicatedPrescription.prescriptionId !== originalPrescription.prescriptionId, "Duplicate has unique new prescriptionId");

  // Edit the duplicate prescription
  storage4.updateExercisePrescription(rProg.id, rWeek.id, rDay.id, duplicatedPrescription.prescriptionId, {
    targetRequirement: "5 sets × 3 reps @ RIR 0 (Heavy Singles)"
  });

  const storage5 = new DinoStorage();
  const dayDupeCheck = storage5.getProgramById(rProg.id).weeks[0].days[0];
  const origReloaded = dayDupeCheck.exercises.find(e => e.prescriptionId === originalPrescription.prescriptionId);
  const dupeReloaded = dayDupeCheck.exercises.find(e => e.prescriptionId === duplicatedPrescription.prescriptionId);

  assert(origReloaded.targetRequirement !== dupeReloaded.targetRequirement, "Original target requirement remained unchanged when duplicate was edited");
  assert(dupeReloaded.targetRequirement === "5 sets × 3 reps @ RIR 0 (Heavy Singles)", "Duplicate prescription updated correctly");

  // -------------------------------------------------------------------------
  // TEST 08: Version Safety & Immutability of History
  // Version 1 (3 x 5) -> Complete session -> Version 2 (4 x 5) -> History must = 3 x 5
  // -------------------------------------------------------------------------
  console.log("\n[TEST 08] Version Safety & History Immutability");
  const vProg = storage5.createProgram("Version Test Program", "Testing version safety");
  storage5.addWeekToProgram(vProg.id, "Week 1");
  const vWeek = storage5.getProgramById(vProg.id).weeks[0];
  storage5.addDayToWeek(vProg.id, vWeek.id, { title: "Push Day", dayKey: "D1" });
  const vDay = storage5.getProgramById(vProg.id).weeks[0].days[0];
  const vPresc = storage5.addExerciseToDay(vProg.id, vWeek.id, vDay.id, {
    name: "Barbell Bench Press",
    targetRequirement: "3 sets × 5 reps",
    defaultSets: [{ reps: 5, weightKg: 80 }, { reps: 5, weightKg: 80 }, { reps: 5, weightKg: 80 }]
  });

  // Start workout and log completed actual sets for Version 1
  storage5.setActiveProgramId(vProg.id);
  const activeSession = storage5.startWorkoutSession(vProg.id, vWeek.id, vDay.id);
  const prescEx = activeSession.prescriptionSnapshot[0];
  const exKey = prescEx.exerciseId || prescEx.id;
  // Log 3 sets x 80kg
  activeSession.loggedSets[exKey] = [
    { setNumber: 1, actual: { load: 80, reps: 5, rir: 2 }, completed: true },
    { setNumber: 2, actual: { load: 80, reps: 5, rir: 2 }, completed: true },
    { setNumber: 3, actual: { load: 80, reps: 5, rir: 1 }, completed: true }
  ];
  storage5.saveActiveWorkoutSession(activeSession);
  const completedWorkout = storage5.finishWorkoutSession(60);

  // Now create Version 2 of the program and update prescription to 4 sets x 5 reps @ 90kg
  storage5.createProgramVersion(vProg.id, "Increased volume to 4 sets");
  storage5.updateExercisePrescription(vProg.id, vWeek.id, vDay.id, vPresc.prescriptionId, {
    targetRequirement: "4 sets × 5 reps @ 90kg"
  });

  // Verify historical completed session is IMMUTABLE
  const storage6 = new DinoStorage();
  const history = storage6.getExercisePerformanceHistory(prescEx.exerciseId || prescEx.id, prescEx.name);
  assert(history.length >= 1, "Completed session recorded in history");
  const lastEntry = history[0];
  assert(lastEntry.sets.length === 3, `Historical sets count remains 3 (not 4 from Version 2)`);
  assert(lastEntry.sets[0].load === 80, `Historical load remains 80kg (unaffected by Version 2)`);

  // -------------------------------------------------------------------------
  // TEST 09: Actual Integrity (No Fake Fallback)
  // No user input -> actual.load === null, actual.reps === null (zero fake 50kg)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 09] Actual Integrity (No Fake Data Fallback)");
  // Unlogged performance query for a fresh exercise with zero history
  const unloggedHistory = storage6.getExercisePerformanceHistory("non-existent-ex-999", "Totally Fresh Exercise");
  assert(Array.isArray(unloggedHistory) && unloggedHistory.length === 0, "Non-performed exercise returns empty array, NOT fake 50kg sets");

  // Check active session unlogged sets structure
  const testSession = storage6.startWorkoutSession(vProg.id, vWeek.id, vDay.id);
  const testExKey = testSession.prescriptionSnapshot[0].exerciseId || testSession.prescriptionSnapshot[0].id;
  const unloggedSets = testSession.loggedSets[testExKey] || [];
  unloggedSets.forEach((set, sIdx) => {
    assert(set.completed === false, `Unlogged set ${sIdx + 1} completed is false`);
    assert(set.actual.load === null, `Unlogged set ${sIdx + 1} load is not populated with fake default`);
  });
  storage6.cancelActiveWorkoutSession();

  // -------------------------------------------------------------------------
  // TEST 10: Option Persistence
  // Select option -> Complete session -> Reload history -> Verify option persists
  // -------------------------------------------------------------------------
  console.log("\n[TEST 10] Option Persistence");
  const optSession = storage6.startWorkoutSession(vProg.id, vWeek.id, vDay.id);
  optSession.selectedOption = "Dumbbell Incline Press (DB Option)";
  storage6.saveActiveWorkoutSession(optSession);
  const optCompleted = storage6.finishWorkoutSession({
    durationSec: 45,
    selectedOption: "Dumbbell Incline Press (DB Option)"
  });

  const storage7 = new DinoStorage();
  const allCompleted = storage7.getWorkouts();
  const recordedSession = allCompleted.find(w => w.id === optCompleted.id);
  assert(!!recordedSession, "Workout session saved with option");
  assert(recordedSession.selectedOption === "Dumbbell Incline Press (DB Option)", "Selected exercise option correctly persisted in completed workout");

  // -------------------------------------------------------------------------
  // TEST 11: Legacy Data Backward Compatibility
  // Load old session lacking new metadata -> No crash
  // -------------------------------------------------------------------------
  console.log("\n[TEST 11] Legacy Data Compatibility");
  const legacySession = {
    id: "legacy-session-2025",
    date: "2025-01-01",
    dayTitle: "Old Legacy Leg Day",
    exercises: [
      {
        id: "leg-press-legacy",
        name: "Leg Press",
        // Lacks exerciseId, movementPattern, prescriptionSnapshot, etc.
        sets: "3 sets x 10 reps @ 120kg"
      }
    ]
  };
  // Inject raw legacy workout directly to storage
  const existingWorkouts = storage7.getWorkouts();
  existingWorkouts.push(legacySession);
  localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(existingWorkouts));

  // Instantiate storage and read history
  const storage8 = new DinoStorage();
  let crash = false;
  let legacyHistory = [];
  try {
    legacyHistory = storage8.getExercisePerformanceHistory("leg-press-legacy", "Leg Press");
  } catch (err) {
    crash = true;
    console.error(err);
  }
  assert(!crash, "getExercisePerformanceHistory handles legacy sessions without throwing");
  assert(legacyHistory.length >= 1, "Legacy entry parsed cleanly");

  // -------------------------------------------------------------------------
  // TEST 12: No History Pollution
  // Program builder edits never mutate completed history, PRs, or mileage
  // -------------------------------------------------------------------------
  console.log("\n[TEST 12] No History Pollution");
  const workoutsBefore = JSON.stringify(storage8.getWorkouts());
  
  // Modify program in builder: add, edit, reorder, delete
  const dummyProg = storage8.createProgram("Pollution Test", "Testing isolation");
  storage8.addWeekToProgram(dummyProg.id, "Week 1");
  const dWeek = storage8.getProgramById(dummyProg.id).weeks[0];
  storage8.addDayToWeek(dummyProg.id, dWeek.id, { title: "Test Day", dayKey: "TD" });
  const dDay = storage8.getProgramById(dummyProg.id).weeks[0].days[0];
  const dPresc = storage8.addExerciseToDay(dummyProg.id, dWeek.id, dDay.id, { name: "Bench Press" });
  storage8.updateExercisePrescription(dummyProg.id, dWeek.id, dDay.id, dPresc.prescriptionId, { targetRequirement: "99 sets x 99 reps" });
  storage8.deleteExerciseFromDay(dummyProg.id, dWeek.id, dDay.id, dPresc.prescriptionId);
  storage8.deleteProgram(dummyProg.id);

  const workoutsAfter = JSON.stringify(storage8.getWorkouts());
  assert(workoutsBefore === workoutsAfter, "Completed workout history is 100% byte-for-byte identical after Program Builder operations");

  console.log("\n==================================================");
  console.log(`ALL TESTS PASSED: ${passedTests} passed, ${failedTests} failed`);
  console.log("==================================================");
} catch (err) {
  console.error("\nTEST SUITE ABORTED WITH ERROR:", err.message);
  process.exit(1);
}
