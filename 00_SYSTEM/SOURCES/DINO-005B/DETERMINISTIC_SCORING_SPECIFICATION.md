# DINO-005B — STEP 06 DETERMINISTIC SCORING & PIPELINE SPECIFICATION

> **Change Set:** DINO-005B — Prehab / Corrective Engine
> **Step:** 06 — Deterministic Scoring & Pipeline Specification
> **Status:** SPECIFICATION COMPLETE (DOCUMENTATION ONLY)
> **Authority:** DINO (Project Owner / Founder)
> **Implementer:** Antigravity (Implementation Agent)
> **Branch:** `feature/dino-005b-step06-scoring-spec`
> **Baseline Commit:** `9838ebef2eb1087415bf96543e9154e11b941e97`

---

## 1. Purpose

This document establishes the machine-executable specification for the deterministic scoring and evaluation pipeline of the DINO Prehab & Corrective Engine.

It defines the exact mathematical, algorithmic, and state-machine transitions that convert user movement assessments (`AssessmentInput`), training schedule variables (`workoutContext`), and operational modes (`sessionMode`) into an immutable, 4-phase corrective routine (`PrehabRoutine`).

This specification is complete and implementation-ready: a developer implementing the engine in JavaScript can follow this document without inventing missing algorithmic rules, heuristic weights, fallback branches, or tie-breaking logic.

---

## 2. Scope & Governance Boundaries

1. **NO APPLICATION CODE:** This document is an architectural and mathematical specification. Zero application files (`js/*`, `css/*`, `index.html`, `package.json`, `sw.js`, `vercel.json`, `manifest.json`) are modified.
2. **ZERO HEURISTIC MASKING:** Every mathematical multiplier, scoring threshold, priority sequence, and tie-breaker is explicitly classified as `[ENGINEERING-PROPOSAL]` or `[NEEDS-ADMIN-DECISION]`. No engineering heuristic is presented as a NASM or NSCA laboratory fact.
3. **AI COACH INDEPENDENCE:** The DINO AI Coach is strictly decoupled from this engine. The engine operates entirely in client memory as a stateless, deterministic function ($O(1)$ lookup time, zero network dependencies).
4. **ABSOLUTE EXERCISE INVENTORY INTEGRITY:** The scoring pipeline selects candidates exclusively from the source-locked `EXERCISE_MATRIX.md`. The engine will never synthesize or fabricate an unverified exercise to satisfy phase completeness.

---

## 3. Input Schema (`AssessmentInput`)

The engine consumes a strictly typed, immutable input payload:

```typescript
interface AssessmentInput {
  // 1. Observed Movement Deviations / Assessment Findings
  findings: Array<{
    impairmentKey: string;              // e.g. "imp-knee-valgus", "imp-lphc-apt", "imp-foot-turnout"
    region: "foot_ankle" | "knee" | "lphc" | "shoulder" | "cervical_spine";
    laterality: "bilateral" | "left" | "right" | "unspecified";
    userPriority: boolean;              // true = user selected as primary focus (+50 bonus)
  }>;

  // 2. Syndrome Presets (Optional 1-tap bundle selection)
  activeSyndrome?: "pronation_distortion" | "lower_crossed" | "upper_crossed" | null;

  // 3. Assessment Branch Findings (Sub-test modifications per S01 Ch. 5)
  assessmentBranches?: {
    heelsElevatedModifies?: boolean;    // true = compensation eliminated when heels lifted
    handsOnHipsModifies?: boolean;      // true = arms fall forward eliminated with hands on hips
  };

  // 4. Client Capability & Functional Constraints
  capabilityState: {
    canPerformSingleLegBalance: boolean;// false = must regress Phase 4 balance drills
    overheadMobilityRestricted: boolean;// true = restrict overhead carry/press integration
    floorMatAvailable: boolean;        // true = can perform prone/supine floor exercises
  };

  // 5. Workout Session Context (from BFS schedule or user override)
  workoutContext: "lower" | "upper" | "full_body" | "quality_run" | "easy_run" | "soccer" | "offday";

  // 6. Available Minimal Equipment
  availableEquipment: Array<"bodyweight" | "foam_roller" | "lacrosse_ball" | "mini_band" | "dumbbell" | "mat" | "wall" | "bench">;

  // 7. Operational Session Mode
  sessionMode: "pre_workout" | "off_day";

  // 8. Safety & Discomfort Indicators
  safetyReport?: {
    painLevel: number;                  // 0 to 10 scale (≥ 4 triggers safety divert)
    painLocation?: string;              // anatomical site of reported discomfort
    sharpRadiatingPain: boolean;        // true triggers immediate RED_FLAG block
  };
}
```

---

## 4. Pipeline Execution Architecture (14 Stages)

The scoring engine executes through 14 sequential, deterministic stages:

```
[ Stage 01: Assessment Input Ingestion ]
                    │
                    ▼
[ Stage 02: Input Normalization & Sanity Checks ]
                    │
                    ▼
[ Stage 03: Mutual Exclusivity Validation (PR-001) ]
                    │
                    ▼
[ Stage 04: Syndrome Preset Expansion ]
                    │
                    ▼
[ Stage 05: Impairment Candidate Generation & Priority Ordering ]
                    │
                    ▼
[ Stage 06: Workout Context Suitability Filtering ]
                    │
                    ▼
[ Stage 07: Equipment Availability Filtering ]
                    │
                    ▼
[ Stage 08: Exercise Candidate Retrieval from Matrix ]
                    │
                    ▼
[ Stage 09: Multi-Factor Candidate Scoring ]
                    │
                    ▼
[ Stage 10: Deterministic Tie-Breaking & Selection ]
                    │
                    ▼
[ Stage 11: Phase Completeness & Capability Audit ]
                    │
                    ▼
[ Stage 12: Dosage Profile Assignment (Mode A vs Mode B) ]
                    │
                    ▼
[ Stage 13: Safety Gate & Red-Flag Audit ]
                    │
                    ▼
[ Stage 14: Fallback Resolution & PrehabRoutine Assembly ]
```

### Stage-by-Stage Specification Table

| Stage # | Stage Name | Input Payload | Output Payload | Deterministic Processing Rule | Failure / Edge Behavior | Provenance Tier |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Input Ingestion** | Raw client payload | Typed `AssessmentInput` | Parse and schema-validate input structure against TypeScript interface. | Reject malformed payload with `INVALID_SCHEMA`. | `[ENGINEERING-PROPOSAL]` |
| **02** | **Normalization** | `AssessmentInput` | Normalized input | Trim whitespace, lowercase keys, map legacy aliases to canonical keys. | Unrecognized keys flagged as `UNKNOWN_KEY`. | `[ENGINEERING-PROPOSAL]` |
| **03** | **Mutual Exclusivity** | Normalized input | Conflict-free findings | Enforce `PR-001`: APT vs PPT and Valgus vs Varus cannot coexist. Retain primary. | Auto-prune conflicting secondary finding with warning. | `[PRODUCT-RULE]` PR-001 |
| **04** | **Syndrome Expansion**| Syndrome key | Expanded findings | Map `lower_crossed` $\to$ [APT, Lean]; `upper_crossed` $\to$ [Fall, Round, FwdHead]. | If syndrome unknown, ignore and retain direct findings. | `[LOCKED-SOURCE]` S01 Ch. 4 |
| **05** | **Impairment Priority**| Findings array | Ranked impairments | Sort impairments by kinetic order (LPHC > Knee > Foot/Ankle > Shoulder > Cervical). | If scores tie, apply catalog order. | `[ENGINEERING-PROPOSAL]` EP-001 |
| **06** | **Context Filtering** | Ranked impairments | Scoped candidates | Look up context multiplier $W_{\text{context}} \in [1.0, 3.5]$ for current `workoutContext`. | If context missing, default to `full_body` ($W=1.0$). | `[ENGINEERING-PROPOSAL]` EP-002 |
| **07** | **Equipment Filter** | Available gear | Eligible candidates | Eliminate candidates requiring equipment absent from `availableEquipment`. | If all eliminated, flag for Stage 14 fallback. | `[ENGINEERING-PROPOSAL]` |
| **08** | **Candidate Retrieval**| Top impairment | Phase candidate sets | Query `EXERCISE_MATRIX.md` for candidates matching impairment in P1, P2, P3, P4. | If a phase has 0 candidates, flag phase gap. | `[LOCKED-SOURCE]` S01 |
| **09** | **Candidate Scoring** | Eligible candidates | Scored candidates | Calculate `candidateScore` using the 6-factor additive formula. | Zero score candidates eliminated. | `[ENGINEERING-PROPOSAL]` |
| **10** | **Tie-Breaking** | Scored candidates | Selected $[P_1, P_2, P_3, P_4]$ | Select highest score per phase. Tie-break: Gear > Specificity > Catalog ID. | Deterministic: same input = same winner. | `[ENGINEERING-PROPOSAL]` EP-001 |
| **11** | **Capability Audit** | Selected tuple | Regressed tuple | If `canPerformSingleLegBalance == false`, regress P4 single-leg to 2-leg drill. | Regress only to source-verified regression. | `[LOCKED-SOURCE]` S01 Ch. 11 |
| **12** | **Dosage Assignment** | Mode + Valid tuple | Dosed routine | Assign Mode A (1 set, $\le 30$s hold) or Mode B (2–3 sets) sample acute variables. | Missing mode defaults to Mode A (pre-workout safe).| `[PRODUCT-RULE]` / AD-001 |
| **13** | **Safety Gate** | Dosed routine | Safety-audited state | Check `painLevel \ge 4` or `sharpRadiatingPain == true`. If present, divert to safety. | If red flag detected, divert to `SAFETY_BLOCKED`. | `[LOCKED-SOURCE]` S01 Ch. 3 |
| **14** | **Fallback Assembly** | Audited routine | Immutable `PrehabRoutine` | If any phase empty, apply 4-tier fallback hierarchy. Serialize output object. | If Tier 4 reached, return `INSUFFICIENT_DATA`. | `[ENGINEERING-PROPOSAL]` |

---

## 5. Mathematical Scoring Model (`[ENGINEERING-PROPOSAL]`)

The engine computes a deterministic numerical score for every eligible candidate exercise:

$$\text{candidateScore} = S_{\text{impairment}} + S_{\text{context}} + S_{\text{phase}} + S_{\text{equipment}} + S_{\text{specificity}} + S_{\text{laterality}}$$

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CANDIDATE SCORING BREAKDOWN                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. S_impairment (Base Match):                                          │
│    • Exact primary impairment match                     = +100 pts     │
│    • Secondary/associated impairment match              =  +60 pts     │
│                                                                        │
│ 2. S_context (Context Suitability Multiplier):                         │
│    • Multiplier W_context (1.0 to 3.5) applied to Base:                │
│      S_context = S_impairment × (W_context - 1.0)                      │
│      (Example: Base 100 × (3.5 - 1.0) = +250 context bonus)            │
│                                                                        │
│ 3. S_phase (Phase Compatibility):                                      │
│    • Candidate matches target phase slot (P1/P2/P3/P4)   = +100 pts     │
│    • Phase mismatch                                      = ELIMINATED  │
│                                                                        │
│ 4. S_equipment (Frictionless Gear Bonus):                              │
│    • Bodyweight (zero equipment required)                =  +20 pts     │
│    • Mini-band or mat                                   =  +10 pts     │
│    • Foam roller or lacrosse ball                       =   +5 pts     │
│    • Required equipment missing                         = ELIMINATED  │
│                                                                        │
│ 5. S_specificity (User Priority Bonus):                                │
│    • User explicitly flagged as primary focus (PR-001)  =  +50 pts     │
│    • Otherwise                                          =    0 pts     │
│                                                                        │
│ 6. S_laterality (Side-Specific Alignment):                             │
│    • Exact unilateral side match on AWS                 =  +25 pts     │
│    • Bilateral on bilateral condition                   =  +10 pts     │
└────────────────────────────────────────────────────────────────────────┘
```

> **Mandatory Classification Notice:** The point values above ($+100, +60, +50, +25, +20, +10$) are an `[ENGINEERING-PROPOSAL]` designed to create clear mathematical separation and prevent ambiguous ties. They are NOT published constants of NASM or NSCA.

---

## 6. Workout Context Scoring & Multiplier Register

The context suitability multiplier $W_{\text{context}}$ adapts exercise selection to the day's primary kinetic stress:

| Impairment Checkpoint | `lower` | `upper` | `full_body` | `quality_run` | `easy_run` | `soccer` | `offday` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Foot & Ankle (`FA`)** | $2.0$ | $1.0$ | $1.5$ | **$3.5$** | $2.5$ | **$3.0$** | $2.0$ |
| **Knee (`KV`)** | **$3.5$** | $1.0$ | $2.5$ | $2.0$ | $2.0$ | **$3.5$** | $2.0$ |
| **LPHC — Low Back Arches (`APT`)** | **$3.0$** | $1.5$ | **$3.0$** | $2.5$ | $2.5$ | $2.5$ | **$3.0$** |
| **LPHC — Low Back Rounds (`PPT`)** | **$3.0$** | $1.0$ | $2.5$ | $2.0$ | $2.0$ | $2.0$ | **$3.0$** |
| **LPHC — Forward Lean (`EFL`)** | **$3.5$** | $1.0$ | $2.5$ | $3.0$ | $2.5$ | $2.5$ | $2.0$ |
| **LPHC — Asymmetric Shift (`AWS`)**| **$3.5$** | $1.0$ | $2.5$ | $2.5$ | $2.0$ | **$3.0$** | **$3.0$** |
| **Shoulder Elevation (`SE`)** | $1.0$ | **$3.5$** | $2.0$ | $1.0$ | $1.0$ | $1.0$ | $2.0$ |
| **Scapular Winging (`SW`)** | $1.0$ | **$3.5$** | $2.0$ | $1.0$ | $1.0$ | $1.0$ | $2.0$ |
| **Forward Head (`FH`)** | $1.0$ | **$3.0$** | $1.5$ | $1.0$ | $1.0$ | $1.0$ | **$2.5$** |

### Context Edge Cases & Fallbacks
1. **Missing Context (`workoutContext == null | ""`):**
   The engine applies $W_{\text{context}} = 1.0$ across all checkpoints (neutral weighting) and logs status `CONTEXT_DEFAULTED_NEUTRAL`.
2. **Ambiguous Context:**
   If multiple workout types are detected, the scheduled BFS rotation day from `S04` takes precedence.
3. **Cross-Context Conflict:**
   If an upper-body impairment is selected on a `lower` body day, the engine preserves Phase 1, Phase 2, and Phase 3 targeting the upper body, but Phase 4 (Integrate) is filtered to an athletic lower/core integration drill (`KV-INT-01` or `EFL-INT-01`) to prepare for the day's compound loading.

---

## 7. Impairment Priority & Kinetic-Chain Precedence

When multi-joint compensations tie in score, the engine resolves precedence via the following programmatic hierarchy (`[ENGINEERING-PROPOSAL]` EP-001):

$$\text{LPHC} \succ \text{Knee} \succ \text{Foot / Ankle} \succ \text{Shoulder} \succ \text{Cervical Spine}$$

### Engineering Rationale
- The Lumbo-Pelvic-Hip Complex (LPHC) is the kinetic center of gravity and core transfer junction for both heavy compound lifting (BFS resistance) and running/soccer gait.
- Lower extremities (Knee, Foot/Ankle) directly absorb ground reaction forces.
- Upper extremities and cervical spine are prioritized during upper-body dedicated training days.
- **Classification:** This ordering is an `[ENGINEERING-PROPOSAL]` to guarantee deterministic tie-breaking. It is NOT a clinical law stating that neck posture is medically inferior to hip posture.

---

## 8. Laterality Specification & Cross-Body Coupling

Laterality is first-class operational data. The engine must support six discrete laterality states:

```typescript
type LateralityState = "bilateral" | "left" | "right" | "same_side" | "opposite_side" | "unspecified";
```

### 8.1 Symmetrical Impairments
- For `bilateral` impairments (e.g. bilateral feet turn out), candidate exercises are prescribed bilaterally or in alternating sequence with equal volume per side.

### 8.2 Asymmetric Weight Shift (`imp-lphc-asymmetric-shift`)
S01 Chapter 14 mandates explicit cross-body asymmetric programming. The engine enforces:

```
[ User Inputs: Asymmetric Weight Shift to the RIGHT ]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[ RIGHT SIDE (Shifted / Same-Side) ]   [ LEFT SIDE (Unweighted / Opposite) ]
• INHIBIT: Right Adductors (AWS-INH-01) • INHIBIT: Left Piriformis (AWS-INH-03)
• INHIBIT: Right TFL/ITB (AWS-INH-02)   • INHIBIT: Left Biceps Fem. (AWS-INH-04)
• LENGTHEN: Right Adductors (AWS-LEN-01)• LENGTHEN: Left Biceps Fem. (AWS-LEN-04)
• ACTIVATE: Right Glute Med (AWS-ACT-01)• LENGTHEN: Left Piriformis (AWS-LEN-05)
                                        • ACTIVATE: Left Adductor (AWS-ACT-02)
```

### 8.3 Missing Laterality Handling (`[NEEDS-ADMIN-DECISION]` AD-002)
- If a user selects Asymmetric Weight Shift but leaves laterality `unspecified`:
  - **Deterministic Policy:** The engine halts unilateral specialization, outputs routine status `PARTIAL_NEEDS_LATERALITY`, and provides safe bilateral posterior-chain mobility (`LBR-INH-01`, `LBR-LEN-01`) while prompting the user to declare the shifted side.
  - **Strict Invariant:** The engine **never silently guesses** or randomly assigns `left` or `right`.

---

## 9. Mutual Exclusivity Rules (`[PRODUCT-RULE]` PR-001)

The engine implements client-side validation independent of UI toggles:

### 9.1 Anterior Pelvic Tilt (APT) vs. Posterior Pelvic Tilt (PPT)
- **Constraint:** `imp-lphc-apt` and `imp-lphc-ppt` are biomechanically contradictory in sagittal pelvic alignment.
- **Resolution:**
  - If both are present in the payload, the finding with `userPriority == true` is retained.
  - If neither or both have priority, `imp-lphc-apt` is retained (higher prevalence in athletic population with heavy hip flexor demand), `imp-lphc-ppt` is pruned, and a diagnostic warning `MUTUAL_EXCLUSIVITY_RESOLVED_APT` is logged.

### 9.2 Knee Valgus vs. Knee Varus
- **Constraint:** `imp-knee-valgus` (inward) and `imp-knee-varus` (outward) are mutually exclusive in frontal plane knee kinematics.
- **Resolution:**
  - Retain `imp-knee-valgus`; prune `imp-knee-varus`.
  - Log diagnostic warning `MUTUAL_EXCLUSIVITY_RESOLVED_VALGUS`.

---

## 10. Phase Coverage & Completion Rules

Every generated routine must satisfy the 4-phase continuum:
1. **Phase 1: Inhibit** (Autogenic inhibition via SMR)
2. **Phase 2: Lengthen** (Reciprocal inhibition / mechanical elongation via Static Stretch)
3. **Phase 3: Activate** (Isolated motor unit recruitment)
4. **Phase 4: Integrate** (Multi-joint dynamic intermuscular coordination)

### Completion Invariants
1. **Zero Exercise Fabrication:** If no source-verified exercise in `EXERCISE_MATRIX.md` matches an eligible candidate for a phase, the engine **must not invent a placeholder**.
2. **Phase Gap Handling:**
   - If Phase 1, 2, or 3 is missing: Apply Tier 2 compatible candidate from the same kinetic checkpoint.
   - If Phase 4 is missing (e.g. Scapular Winging `SG-001`): Apply Tier 3 general movement integration drill (`EFL-INT-01` Ball Squat to Press or `FA-INT-01` Balance Reach) and mark status `FALLBACK_APPLIED`.
   - If zero compatible candidates exist across all tiers: Return `INSUFFICIENT_SUPPORTED_DATA` and safely halt.

---

## 11. Minimal Equipment Constraint & Filtering

The engine respects DINO's zero-friction athletic philosophy. Candidates are filtered against `availableEquipment`:

```text
availableEquipment Array
        ↓
Candidate Gear Requirement Check
        ↓
gearRequired ⊆ availableEquipment ?
  ├─► YES: Keep candidate (apply gear bonus: +20 Bodyweight, +10 Band, +5 Roller)
  └─► NO:  Eliminate candidate from active pool
```

### Complete Equipment Absence Fallback
If a user selects `availableEquipment: ["bodyweight"]` and an impairment's Phase 1 Inhibit candidates strictly require a foam roller:
- **Fallback Rule:** Substitute Phase 1 SMR with an active-isolated mobility or contract-relax active stretch from S01 Chapter 9, or mark Phase 1 as `EQUIPMENT_BYPASSED` and proceed directly to Phase 2 (Static Stretch) and Phase 3 (Bodyweight Activation).
- **Prohibition:** Never prompt the user to use nonexistent equipment.

---

## 12. Dosage Architecture & Provenance Separation

Acute variables are strictly separated into two distinct provenance tiers:

### 12.1 Tier A: Source-Supported Reference Ranges (`[LOCKED-SOURCE]`)
Derived directly from NASM CEx (S01 Ch. 8–11) and NSCA (S03 Ch. 14):
- **SMR (Inhibit):** 1 set, hold tender trigger point 30–90 seconds.
- **Static Stretch (Lengthen):** 1–2 sets, hold 30 seconds.
  - *NSCA Cardinal Safety Cap:* Static stretches prior to maximal strength/speed sessions must be capped at $\le 30$ seconds to prevent transient reduction in force/power production.
- **Activation (Isolated):** 1–2 sets, 10–15 reps, 4/2/1 tempo (4s eccentric, 2s isometric hold, 1s concentric).
- **Integration (Dynamic):** 1–2 sets, 10–15 reps, slow controlled tempo.

### 12.2 Tier B: DINO Operational Dosing Profiles (`[PRODUCT-RULE]` / Open `AD-001`)

```typescript
const DINO_DOSING_PROFILES = {
  // Mode A: Pre-Workout Prehab (Strict zero-fatigue constraint)
  mode_a_pre_workout: {
    phase1_inhibit:  { sets: 1, durationSeconds: 45, holdSeconds: 30, tempo: "Sustained pressure" },
    phase2_lengthen: { sets: 1, durationSeconds: 25, holdSeconds: 25, tempo: "Static hold capped" },
    phase3_activate: { sets: 1, reps: 10, holdSeconds: 2, tempo: "4/2/1" },
    phase4_integrate:{ sets: 1, reps: 8,  holdSeconds: 1, tempo: "Controlled dynamic" },
    totalTargetDurationMinutes: "3–6 minutes",
    fatigueConstraint: "ZERO_FATIGUE"
  },

  // Mode B: Off-Day Corrective (Tissue restoration & remodeling)
  mode_b_off_day: {
    phase1_inhibit:  { sets: 2, durationSeconds: 60, holdSeconds: 60, tempo: "Sustained pressure" },
    phase2_lengthen: { sets: 2, durationSeconds: 35, holdSeconds: 35, tempo: "Static hold" },
    phase3_activate: { sets: 2, reps: 12, holdSeconds: 2, tempo: "4/2/1" },
    phase4_integrate:{ sets: 2, reps: 10, holdSeconds: 2, tempo: "Controlled dynamic" },
    totalTargetDurationMinutes: "12–20 minutes",
    fatigueConstraint: "RESTORATION"
  }
};
```

> **Administrative Note:** `AD-001` (Exact Dosage Pinning) remains an **OPEN DECISION**. The values above represent the authorized operational proposal and will be formally locked upon user acceptance testing.

---

## 13. Pre-Output Safety Gate

Prior to returning a generated routine, the engine executes a deterministic safety audit:

```
[ Generated 4-Phase Candidate Set ]
                 │
                 ▼
     [ Evaluate Safety Gates ]
     • painLevel ≥ 4 ?
     • sharpRadiatingPain == true ?
     • contraindicatedCondition == true ?
     • redFlagAnatomy == true ?
                 │
        ┌────────┴────────┐
        ▼                 ▼
     [ YES ]            [ NO ]
        │                 │
        ▼                 ▼
[ Divert Output ]  [ Safety State: SAFE ]
• Status: SAFETY_BLOCKED
• Flush exercises
• Deliver clinical medical notice
```

### Safety Gate Evaluation Table

| Condition Inspected | Threshold / Trigger | Engine Action | Resulting Status |
| :--- | :--- | :--- | :--- |
| **Acute Pain Reported** | `safetyReport.painLevel >= 4` | Abort prehab exercise generation; output rest and ice/physio recommendation. | `SAFETY_BLOCKED` |
| **Neurological Red Flag**| `sharpRadiatingPain == true` | Abort immediately; output orthopedic medical evaluation warning. | `SAFETY_BLOCKED` |
| **Lumbar SMR Protection**| Exercise targets lumbar spine (L1–L5) | Enforce S01 prohibition: SMR on lumbar spine is forbidden; redirect to Thoracic or Gluteal. | `CAUTION_DIVERTED` |
| **Sciatic Impingement** | Lacrosse ball on piriformis with tingling | Attach mandatory warning: "Di chuyển bóng ngay nếu tê buốt chân". | `CAUTION_ATTACHED` |
| **Pre-Lift Power Safety**| Static stretch in `quality_run` or `lower` | Enforce NSCA cap: hold duration strictly $\le 30$ seconds. | `SAFE` (Cap applied) |

---

## 14. Fallback Resolution Hierarchy

When candidate retrieval or equipment filtering produces zero eligible exercises for a phase, the engine resolves the deficit through a 4-tier hierarchy:

```
┌────────────────────────────────────────────────────────┐
│ LEVEL 1: EXACT MATCH                                   │
│ Primary impairment + target phase + exact context      │
└────────────────────────────────────────────────────────┘
                           │
                           ▼ (if 0 eligible candidates)
┌────────────────────────────────────────────────────────┐
│ LEVEL 2: COMPATIBLE SAME-CHECKPOINT CANDIDATE          │
│ Secondary exercise from same anatomical checkpoint     │
│ (e.g. Soleus stretch FA-LEN-02 if Gastrocnemius taken) │
└────────────────────────────────────────────────────────┘
                           │
                           ▼ (if 0 eligible candidates)
┌────────────────────────────────────────────────────────┐
│ LEVEL 3: AUTHORIZED GENERAL ATHLETIC CANDIDATE         │
│ General athletic movement prep drill from S02/S04       │
│ (e.g. Ball Wall Squat EFL-INT-01 or Balance Reach)     │
└────────────────────────────────────────────────────────┘
                           │
                           ▼ (if Level 3 unavailable)
┌────────────────────────────────────────────────────────┐
│ LEVEL 4: SAFE STOP & CLEAN HALT                        │
│ Output: status = "INSUFFICIENT_SUPPORTED_DATA"         │
│ Zero invented exercises. User informed cleanly.        │
└────────────────────────────────────────────────────────┘
```

---

## 15. Output Contract (`PrehabRoutine`)

The output schema is an immutable, serializable JSON-compatible record:

```typescript
interface PrehabRoutine {
  // 1. Routine Header & Metadata
  routineId: string;                    // Deterministic SHA-256 or UUID
  generationTimestamp: string;          // ISO 8601 string
  catalogVersion: "1.0-locked";
  status: "SAFE" | "CAUTION_ATTACHED" | "FALLBACK_APPLIED" | "SAFETY_BLOCKED" | "INSUFFICIENT_DATA";

  // 2. Ingested Context Snapshot
  contextSnapshot: {
    primaryImpairment: string;
    resolvedRegion: string;
    laterality: "bilateral" | "left" | "right" | "unspecified";
    workoutContext: string;
    sessionMode: "pre_workout" | "off_day";
  };

  // 3. The 4 Prescribed Phase Records
  phases: {
    phase1_inhibit: PrescribedPhaseItem;
    phase2_lengthen: PrescribedPhaseItem;
    phase3_activate: PrescribedPhaseItem;
    phase4_integrate: PrescribedPhaseItem;
  };

  // 4. Traceability & Decision Audit
  auditTrail: {
    appliedRuleIds: string[];           // e.g. ["PR-001", "RULE-OAU-04", "EP-001"]
    sourceCitations: string[];          // e.g. ["S01 Ch. 8 p. 144", "S03 Ch. 14 p. 320"]
    scoringJustification: {
      winningCandidateScore: number;
      tieBreakerApplied: boolean;
      fallbackLevelUsed: 1 | 2 | 3 | 4;
    };
    cautionsAndWarnings: string[];
  };
}

interface PrescribedPhaseItem {
  exerciseId: string;                   // Catalog candidate ID, e.g. "FA-INH-01"
  name: string;                         // Standard English / anatomical name
  phase: "inhibit" | "lengthen" | "activate" | "integrate";
  targetMuscle: string;
  lateralityInstruction: "bilateral" | "same_side" | "opposite_side";
  requiredEquipment: string[];
  dosage: {
    sets: number;
    reps: number | null;
    durationSeconds: number | null;
    holdSeconds: number | null;
    tempo: string;
    fatigueIntent: "ZERO_FATIGUE" | "RESTORATION";
  };
  regressionAlternative?: string;
  progressionAlternative?: string;
}
```

---

## 16. Determinism Guarantees & Law of Invariance

The engine enforces mathematical determinism without exception:

$$\forall (I, C, M, V): \quad f(I, C, M, V) \equiv f(I, C, M, V)$$

### Invariant Rules
1. **Zero Randomness:** The algorithm contains zero calls to `Math.random()`, pseudo-random seeds, or shuffled arrays.
2. **Zero Timestamp Dependency:** The routine generation logic does not branch based on system clock, time of day, or day of week. Timestamps exist solely as output record metadata.
3. **Zero Network Calls:** The engine executes synchronously in local memory without HTTP requests, WebSocket messages, or external API dependencies.
4. **Zero Hidden State:** The engine is a pure function. It does not read or mutate global variables outside its passed parameters.
5. **Zero AI Invariance:** External LLMs cannot alter or intercept candidate scores.

---

## 17. Specification-Level Test Matrix (25 Verification Cases)

The following test matrix defines the expected programmatic behavior across all boundary conditions:

| # | Test Scenario | Input Vector (`AssessmentInput`) | Expected Stage Behavior | Expected Output Result | Verification Rationale |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **01** | **APT Only** | `imp-lphc-apt`, `lower`, Mode A | Stage 08 retrieves LPHC APT candidates; $W_{\text{lower}}=3.0$ | `EFL-INH-02`, `EFL-LEN-02`, `EFL-ACT-02`, `EFL-INT-01` | S01 Chapter 14 anterior pelvic tilt protocol. |
| **02** | **PPT Only** | `imp-lphc-ppt`, `lower`, Mode A | Stage 08 retrieves Hamstring/Adductor Magnus; $W_{\text{lower}}=3.0$ | `LBR-INH-01`, `LBR-LEN-01`, `LBR-ACT-01`, `LBR-INT-01` | S01 Chapter 14 posterior pelvic tilt protocol. |
| **03** | **Valgus Only** | `imp-knee-valgus`, `soccer`, Mode A | Stage 06 applies $W_{\text{soccer}}=3.5$; retrieves Adductor/Glute Med | `KV-INH-02`, `KV-LEN-02`, `KV-ACT-03`, `KV-INT-01` | S01 Chapter 13 & S02 soccer adductor resilience. |
| **04** | **Varus Only** | `imp-knee-varus`, `lower`, Mode A | Stage 08 retrieves lateral hamstring / TFL candidates | Source-locked varus tuple assigned | S01 Chapter 13 outward knee deviation. |
| **05** | **APT + Valgus** | Both selected, `lower`, Valgus has priority | Stage 05 applies priority score; Valgus wins; Knee sequence selected | `KV-INH-02`, `KV-LEN-02`, `KV-ACT-03`, `KV-INT-01` | Priority bonus (+50) cleanly breaks multi-joint tie. |
| **06** | **PPT + Varus** | Both selected, `full_body`, Mode B | Stage 05 LPHC kinetic precedence (LPHC > Knee); PPT wins | `LBR-INH-01`, `LBR-LEN-01`, `LBR-ACT-01`, `LBR-INT-01` | Deterministic kinetic-chain hierarchy (EP-001). |
| **07** | **Lower Workout** | `imp-shldr-fall`, `lower` day | Upper body P1-P3 preserved; P4 filtered to lower integration drill | P1-P3 Shoulder, P4: `EFL-INT-01` Ball Squat to Press | Cross-context safety: legs prepared for squatting. |
| **08** | **Upper Workout** | `imp-shldr-elev`, `upper` day | Stage 06 applies $W_{\text{upper}}=3.5$; Cervicothoracic sequence | `SE-INH-02`, `SE-LEN-02`, `SE-ACT-01`, `SE-INT-01` | S01 Chapter 15 shoulder elevation protocol. |
| **09** | **Quality Run** | `imp-foot-turnout`, `quality_run` | Stage 06 applies $W_{\text{run}}=3.5$; static stretch capped $\le 30$s | `FA-INH-01`, `FA-LEN-01` (25s), `FA-ACT-02`, `FA-INT-03`| NSCA pre-running stretch cap strictly enforced. |
| **10** | **Easy Run** | `imp-lphc-apt`, `easy_run` | Stage 06 applies $W_{\text{easy}}=2.5$; hip flexor / glute sequence | `EFL-INH-02`, `EFL-LEN-02`, `EFL-ACT-02`, `FA-INT-01` | Aerobic gait stabilization without fatigue. |
| **11** | **Soccer Match** | `imp-knee-valgus`, `soccer` | Stage 06 applies $W_{\text{soccer}}=3.5$; groin prep prioritized | `KV-INH-02`, `KV-LEN-02`, `KV-ACT-03`, `KV-INT-01` | Groin strain prevention for Saturday match play. |
| **12** | **Full Body** | `imp-lphc-apt`, `full_body` | Global kinetic chain linkage prioritized in Phase 4 | P1-P3 APT, P4: `EFL-INT-01` Squat to Overhead Press | S01 Chapter 14 multi-joint linkage. |
| **13** | **Off-Day Mode** | `imp-lphc-apt`, `offday`, Mode B | Stage 12 assigns Mode B dosage (2–3 sets, 60s holds) | Complete 4-phase routine with Mode B volume | Tissue remodeling during non-training days. |
| **14** | **Missing Context** | `workoutContext: ""` | Stage 06 defaults to $W=1.0$ (neutral context); logs warning | Standard routine generated; status: `FALLBACK_APPLIED` | Zero crash guarantee on missing client fields. |
| **15** | **Missing Gear** | Only `bodyweight`, candidate needs roller | Stage 07 eliminates roller candidate; substitutes bodyweight variant | Substitute bodyweight candidate selected | Equipment availability filter strictly respected. |
| **16** | **Bilateral State** | `imp-foot-turnout`, bilateral | Routine outputs alternating bilateral dosage | Instructions flag equal sets per leg | Symmetrical movement prescription. |
| **17** | **Left Laterality** | `AWS`, shifted to LEFT | Stage 03 assigns same-side to Left, opposite to Right | Left: Adductor/TFL; Right: Piriformis/Biceps Fem. | Strict asymmetric cross-body mapping preserved. |
| **18** | **Right Laterality**| `AWS`, shifted to RIGHT | Stage 03 assigns same-side to Right, opposite to Left | Right: Adductor/TFL; Left: Piriformis/Biceps Fem. | Strict asymmetric cross-body mapping preserved. |
| **19** | **AWS Unspecified** | `AWS`, `laterality: "unspecified"` | Stage 08 halts unilateral routine; flags missing laterality | Status: `PARTIAL_NEEDS_LATERALITY`; safe bilateral SMR | Invariant: Never guess user laterality (AD-002). |
| **20** | **Zero Impairments**| `findings: []` | Stage 01 detects empty findings; queries general athletic prep | S02 general warm-up routine generated | Empty state renders safe athletic prep routine. |
| **21** | **Conflicting Payload**| Both `APT` and `PPT` selected | Stage 03 enforces PR-001; retains primary, discards opposing | Valid routine for primary; logs conflict warning | Engine validates and resolves invalid UI payload. |
| **22** | **Candidate Absent** | Target candidate lacks equipment | Stage 14 invokes Level 2 compatible same-checkpoint candidate | Level 2 alternative selected; status logged | Transparent fallback without invented exercises. |
| **23** | **Phase Gap** | Phase 4 has no source drill (Winging) | Stage 14 invokes Level 3 general movement drill (`EFL-INT-01`) | Routine completed with Tier 3 fallback marker | SG-001 source gap handled deterministically. |
| **24** | **Safety Block** | `painLevel: 6`, sharp pain | Stage 13 triggers immediate abort; clears exercise array | Status: `SAFETY_BLOCKED`; output medical notice | Clinical red flag prevents loading damaged tissue. |
| **25** | **Score Tie** | Two candidates have identical 250 score | Stage 10 applies tie-breaker: Gear > Specificity > Catalog ID | Deterministic winner selected (lower catalog ID) | Zero random selection under identical math. |

---

## 17. Traceability Matrix

Every candidate exercise chosen by the engine must populate the `auditTrail` block in `PrehabRoutine`:

```json
{
  "exerciseId": "FA-INH-01",
  "phase": "inhibit",
  "targetImpairment": "imp-foot-turnout",
  "workoutContext": "quality_run",
  "scoringBreakdown": {
    "baseScore": 100,
    "contextMultiplier": 3.5,
    "contextBonus": 250,
    "equipmentBonus": 5,
    "userPriorityBonus": 50,
    "lateralityBonus": 10,
    "totalScore": 415
  },
  "tieBreakerApplied": false,
  "fallbackLevel": 1,
  "sourceCitation": "S01 NASM Corrective Exercise Training, Chapter 12, p. 235",
  "provenanceTier": "LOCKED-SOURCE"
}
```

This guarantees complete forensic explainability: any coach, auditor, or user can inspect exactly why an exercise was selected without querying an AI model.

---

## 18. Open Administrative Decisions & Gaps

The following decisions remain formally **OPEN** and will be finalized upon product acceptance:

| Decision ID | Domain | Open Question | Current Proposed Baseline | Authority Required |
| :--- | :--- | :--- | :--- | :--- |
| **AD-001** | Dosage Pinning | Finalize exact second/rep durations for Mode A (3–6 min) vs Mode B (12–20 min). | Mode A: 45s SMR, 25s stretch, 10 reps activate, 8 reps integrate. Mode B: 60s SMR, 35s stretch, 12 reps, 10 reps. | DINO / Founder Approval |
| **AD-002** | Missing Laterality on AWS | Should unspecified laterality block routine generation or provide bilateral safe guidance? | Block unilateral routine, prompt for shifted side, deliver interim bilateral posterior chain relief. | DINO / Founder Approval |
| **SG-001** | Scapular Winging P4 Gap | S01 omits a dedicated Phase 4 integration drill for scapular winging. | Authorize `EFL-INT-01` (Ball Wall Squat to Overhead Press) as official Level 3 fallback. | DINO / Product Architect |

---

## 19. Provenance Classification Summary

| Specification Section | Core Concept | Provenance Classification | Justification |
| :--- | :--- | :--- | :--- |
| **Section 3** | Input Contract Schema | `[ENGINEERING-PROPOSAL]` | Derived to structure client-side data cleanly. |
| **Section 4** | 14-Stage Pipeline | `[ENGINEERING-PROPOSAL]` | Algorithmic execution sequence for deterministic state flow. |
| **Section 5** | 6-Factor Additive Scoring Formula | `[ENGINEERING-PROPOSAL]` | Synthesized mathematical weights to resolve ties programmatically. |
| **Section 6** | Context Suitability Multipliers ($1.0–3.5$) | `[ENGINEERING-PROPOSAL]` | Derived from S02/S04 training stress principles; exact math is engineering. |
| **Section 7** | LPHC > Knee > Foot kinetic precedence | `[ENGINEERING-PROPOSAL]` | Proximal-to-distal tie-breaker heuristic. |
| **Section 8** | AWS Cross-Body Laterality | `[LOCKED-SOURCE]` | S01 Chapter 14 explicitly details unilateral cross-body mechanics. |
| **Section 9** | APT/PPT & Valgus/Varus Mutual Exclusivity | `[PRODUCT-RULE]` PR-001 | S05 requirement for radio button exclusivity. |
| **Section 10** | 4-Phase Continuum Completion | `[LOCKED-SOURCE]` | S01 foundational methodology. |
| **Section 11** | Minimal Equipment Filtering | `[PRODUCT-RULE]` | DINO zero-friction athletic philosophy. |
| **Section 12** | Acute Dosing Ranges vs Mode A/B | `[LOCKED-SOURCE]` (Ranges) / `[PRODUCT-RULE]` (Mode A/B) | Sample acute variables split from proposed DINO operational profile. |
| **Section 13** | Pain $\ge 4$ Safety Gate & NSCA $\le 30$s Cap | `[LOCKED-SOURCE]` | S01 Chapter 3 contraindications & S03 Chapter 14 stretch duration cap. |
| **Section 14** | 4-Level Fallback Hierarchy | `[ENGINEERING-PROPOSAL]` | Systematic fallback sequence preventing runtime crashes. |
| **Section 15** | Output Contract Schema | `[ENGINEERING-PROPOSAL]` | Typed data structure for client UI consumption. |

---

## 20. Implementation Gate

> [!IMPORTANT]
> **NO APPLICATION CODE IS AUTHORIZED BY THIS DOCUMENT.**
> Zero modifications to application runtime scripts (`js/*`), stylesheets (`css/*`), or build manifests (`package.json`, `vercel.json`). This document concludes the specification phase of the deterministic scoring engine. Implementation will proceed only upon formal review and authorization by DINO (Project Owner) and ChatGPT (Product Architect).
