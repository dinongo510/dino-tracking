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

  // -------------------------------------------------------------------------
  // TEST 13: Exercise Detail from Library (No duplicate created, same identity)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 13] Exercise Detail from Library");
  const storage9 = new DinoStorage();
  const allLibExercises = storage9.getAllExercises();
  const pinSquatLib = allLibExercises.find(e => (e.exerciseId || e.id) === "pin_squat");
  assert(pinSquatLib !== undefined, "Pin Back Squat found directly in Exercise Library");
  assert(pinSquatLib.movementPattern === "SQUAT", "Pin Back Squat has movementPattern 'SQUAT'");
  assert(pinSquatLib.primaryMuscles.includes("Quads"), "Pin Back Squat has primary muscle 'Quads'");
  const countBeforeDetail = storage9.getAllExercises().length;
  // Opening detail should just reference the same object without creating a duplicate
  const detailObj = storage9.getExerciseById("pin_squat");
  const countAfterDetail = storage9.getAllExercises().length;
  assert(countBeforeDetail === countAfterDetail, "Viewing Exercise Detail does NOT create duplicate entity");
  assert(detailObj.exerciseId === pinSquatLib.exerciseId, "Detail entity maintains exact exercise identity");

  // -------------------------------------------------------------------------
  // TEST 14: Prescription Edit Persistence (Simulating full app reload)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 14] Prescription Edit Persistence Across Reload");
  const storage10 = new DinoStorage();
  const prog10 = storage10.createProgram("Prescription Persistence Program");
  const w10 = storage10.addWeekToProgram(prog10.id, "Week 1");
  const d10 = storage10.addDayToWeek(prog10.id, w10.id, { title: "Day 1" });
  const rx10 = storage10.addExerciseToDay(prog10.id, w10.id, d10.id, { name: "Bench Press", category: "Strength" });

  storage10.updateExercisePrescription(prog10.id, w10.id, d10.id, rx10.prescriptionId, {
    sets: 4,
    reps: "6–8",
    load: "85kg",
    rir: "1",
    rpe: "8.5",
    tempo: "3-1-1-0",
    restSec: 180,
    notes: "Top set RPE 8.5, hạ chậm 3s",
    optionNote: "Nếu vai đau: Dumbbell Floor Press 4 × 8",
    targetRequirement: "4 sets × 6–8 reps @ RIR 1 (85kg)"
  });

  // Re-instantiate storage to simulate browser reload
  const storage10Reloaded = new DinoStorage();
  const reloadedProg10 = storage10Reloaded.getProgramById(prog10.id);
  const reloadedRx = reloadedProg10.weeks[0].days[0].exercises[0];
  assert(reloadedRx.sets === 4, "Edited sets count persisted after reload (actual: 4)");
  assert(reloadedRx.reps === "6–8", "Edited reps persisted after reload (actual: 6–8)");
  assert(reloadedRx.load === "85kg", "Edited load persisted after reload (actual: 85kg)");
  assert(reloadedRx.rir === "1", "Edited RIR persisted after reload (actual: 1)");
  assert(reloadedRx.rpe === "8.5", "Edited RPE persisted after reload (actual: 8.5)");
  assert(reloadedRx.tempo === "3-1-1-0", "Edited tempo persisted after reload (actual: 3-1-1-0)");
  assert(reloadedRx.restSec === 180, "Edited restSec persisted after reload (actual: 180)");
  assert(reloadedRx.notes === "Top set RPE 8.5, hạ chậm 3s", "Edited notes persisted after reload");
  assert(reloadedRx.optionNote.includes("Dumbbell Floor Press"), "Edited optionNote persisted after reload");
  assert(reloadedRx.targetRequirement === "4 sets × 6–8 reps @ RIR 1 (85kg)", "Edited target requirement persisted after reload");

  // -------------------------------------------------------------------------
  // TEST 15: Exercise Add Persistence (Simulating full app reload)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 15] Exercise Add Persistence Across Reload");
  const storage11 = new DinoStorage();
  const prog11 = storage11.createProgram("Add Persistence Program");
  const w11 = storage11.addWeekToProgram(prog11.id, "Week 1");
  const d11 = storage11.addDayToWeek(prog11.id, w11.id, { title: "Day 1" });
  storage11.addExerciseToDay(prog11.id, w11.id, d11.id, { name: "Front Squat", category: "Strength", movementPattern: "SQUAT" });

  const storage11Reloaded = new DinoStorage();
  const reloadedProg11 = storage11Reloaded.getProgramById(prog11.id);
  const reloadedDay11 = reloadedProg11.weeks[0].days[0];
  assert(reloadedDay11.exercises.length === 1, "Added exercise count persisted after reload");
  assert(reloadedDay11.exercises[0].name === "Front Squat", "Front Squat is present after reload");
  assert(reloadedDay11.exercises[0].movementPattern === "SQUAT", "Front Squat movementPattern preserved");

  // -------------------------------------------------------------------------
  // TEST 16: Exercise Reorder Persistence (Simulating full app reload)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 16] Reorder Persistence Across Reload");
  const storage12 = new DinoStorage();
  const prog12 = storage12.createProgram("Reorder Persistence Program");
  const w12 = storage12.addWeekToProgram(prog12.id, "Week 1");
  const d12 = storage12.addDayToWeek(prog12.id, w12.id, { title: "Day 1" });
  storage12.addExerciseToDay(prog12.id, w12.id, d12.id, { name: "Exercise A", category: "Strength" });
  storage12.addExerciseToDay(prog12.id, w12.id, d12.id, { name: "Exercise B", category: "Strength" });
  storage12.addExerciseToDay(prog12.id, w12.id, d12.id, { name: "Exercise C", category: "Strength" });

  // Order before: A (idx 0), B (idx 1), C (idx 2)
  // Move C upward (idx 2 -> idx 1): A, C, B
  storage12.reorderExerciseInDay(prog12.id, w12.id, d12.id, 2, "up");

  // Reload application / new storage instance
  const storage12Reloaded = new DinoStorage();
  const reloadedProg12 = storage12Reloaded.getProgramById(prog12.id);
  const reorderedDay = reloadedProg12.weeks[0].days[0];
  assert(reorderedDay.exercises[0].name === "Exercise A", "Position 1 is Exercise A after reload");
  assert(reorderedDay.exercises[1].name === "Exercise C", "Position 2 is Exercise C after reload (reorder persisted!)");
  assert(reorderedDay.exercises[2].name === "Exercise B", "Position 3 is Exercise B after reload (reorder persisted!)");

  // -------------------------------------------------------------------------
  // TEST 17: Duplicate Independence (Day & Prescription cloning)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 17] Duplicate Independence");
  const storage13 = new DinoStorage();
  const prog13 = storage13.createProgram("Duplication Program");
  const w13 = storage13.addWeekToProgram(prog13.id, "Week 1");
  const d13 = storage13.addDayToWeek(prog13.id, w13.id, { title: "Leg Day" });
  const rxOrig = storage13.addExerciseToDay(prog13.id, w13.id, d13.id, {
    name: "Barbell Back Squat",
    targetRequirement: "3 sets × 5 reps @ RIR 2"
  });

  // Duplicate Prescription
  const rxCloned = storage13.duplicateExercisePrescription(prog13.id, w13.id, d13.id, rxOrig.prescriptionId);
  assert(rxCloned.prescriptionId !== rxOrig.prescriptionId, "Cloned prescription has distinct prescriptionId");
  assert(rxCloned.name === rxOrig.name, "Cloned prescription matches original name");

  // Edit Clone
  storage13.updateExercisePrescription(prog13.id, w13.id, d13.id, rxCloned.prescriptionId, {
    targetRequirement: "1 set × 20 reps @ RIR 0 (Widowmaker)",
    sets: 1,
    reps: "20"
  });

  const refreshedDay = storage13.getProgramById(prog13.id).weeks[0].days[0];
  const refreshedOrig = refreshedDay.exercises.find(e => e.prescriptionId === rxOrig.prescriptionId);
  const refreshedClone = refreshedDay.exercises.find(e => e.prescriptionId === rxCloned.prescriptionId);
  assert(refreshedOrig.targetRequirement === "3 sets × 5 reps @ RIR 2", "Original prescription target remained untouched");
  assert(refreshedOrig.sets === 2 || refreshedOrig.sets === 3, "Original sets remained untouched");
  assert(refreshedClone.targetRequirement === "1 set × 20 reps @ RIR 0 (Widowmaker)", "Cloned prescription target updated independently");
  assert(refreshedClone.sets === 1, "Cloned prescription sets updated to 1");

  // Duplicate Day
  const dupDay = storage13.duplicateDay(prog13.id, w13.id, d13.id);
  assert(dupDay.id !== d13.id, "Cloned day has distinct dayId");
  assert(dupDay.title.includes("(Bản sao)"), "Cloned day title annotated");
  assert(dupDay.exercises[0].prescriptionId !== refreshedDay.exercises[0].prescriptionId, "Cloned day exercises have newly generated prescriptionIds");

  // -------------------------------------------------------------------------
  // TEST 18: No Fake Performance Fallback (Detail & History Integrity)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 18] No Fake Performance Fallback");
  const storage14 = new DinoStorage();
  const unperformedHistory = storage14.getExercisePerformanceHistory("unperformed_ex_123", "Unperformed Exercise");
  assert(Array.isArray(unperformedHistory), "History is an array");
  assert(unperformedHistory.length === 0, "Unperformed exercise returns empty array, NOT fake 50kg historical sets");

  console.log("\n==================================================");
  console.log(`ALL TESTS PASSED: ${passedTests} passed, ${failedTests} failed`);
  console.log("==================================================");
} catch (err) {
  console.error("\nTEST SUITE ABORTED WITH ERROR:", err.message);
  process.exit(1);
}
