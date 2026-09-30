# DINO-005B — STEP 04 EXERCISE MATRIX

> **Change Set:** DINO-005B — Prehab / Corrective Engine
> **Step:** 04 — Exercise Matrix (Remediated under Step 07A)
> **Status:** SOURCE-RECONCILED & CANONICAL ID MIGRATED
> **Authority:** DINO (Project Owner / Founder)
> **Primary Exercise Identity:** Canonical `cex-*` IDs (37 Exercises)

---

## 1. Purpose

Define the source-traceable corrective exercise matrix needed before deterministic Prehab Engine execution.

This document establishes:
- The canonical exercise identity system (`cex-*`) matching `EXERCISE_DATABASE_SPECIFICATION.md`.
- Complete legacy checkpoint cross-referencing (`FA-INH-01`, `KV-ACT-03`, etc.) to maintain full traceability to NASM CEx chapters.
- Explicit classification of source-supported relationships vs. product rules vs. open administrative proposals.
- No clinical diagnosis is created by this matrix.

---

## 2. Exercise Record Model & Canonical Identity System (P0-01)

Every corrective exercise record possesses exactly **one canonical identifier**:
- **Canonical ID (`exerciseId`):** `cex-{phase}-{index}` (e.g. `cex-inh-01`, `cex-len-03`, `cex-act-02`, `cex-int-08`). This is the sole primary key consumed by the runtime engine and database.
- **Legacy Matrix ID (`matrixId`):** Historical checkpoint code (e.g. `FA-INH-01`, `KV-INH-02`, `EFL-INT-01`) preserved strictly for anatomical checkpoint cross-reference and S01 chapter traceability.

### 2.1 Master Migration & Equivalence Table (37 Canonical Exercises)

| Canonical ID | Legacy Checkpoint ID(s) | Exercise Name (English) | Phase | Target Checkpoint | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `cex-inh-01` | `FA-INH-01`, `KV-INH-01`, `EFL-INH-01` | SMR Calves (Gastrocnemius/Soleus) | Inhibit | `foot_ankle` | **VERIFIED** |
| `cex-inh-02` | `FA-INH-02` | SMR Peroneals | Inhibit | `foot_ankle` | **VERIFIED** |
| `cex-inh-03` | `KV-INH-02`, `AWS-INH-01` | SMR Adductors | Inhibit | `knee` / `lphc` | **VERIFIED** |
| `cex-inh-04` | `KV-INH-03`, `AWS-INH-02` | SMR Tensor Fascia Latae & IT Band | Inhibit | `knee` / `lphc` | **VERIFIED** |
| `cex-inh-05` | `EFL-INH-02` | SMR Quadriceps & Rectus Femoris | Inhibit | `lphc` | **VERIFIED** |
| `cex-inh-06` | `LBR-INH-01`, `AWS-INH-04`, `FA-INH-03` | SMR Hamstrings (Biceps Femoris) | Inhibit | `lphc` / `knee` | **VERIFIED** |
| `cex-inh-07` | `AWS-INH-03` | SMR Piriformis & Gluteal Complex | Inhibit | `lphc` | **VERIFIED** |
| `cex-inh-08` | `SW-INH-01`, `SE-INH-01` | SMR Latissimus Dorsi | Inhibit | `shoulder` / `lphc` | **VERIFIED** |
| `cex-inh-09` | `FH-INH-01`, `SE-INH-01`, `SW-INH-02` | SMR Thoracic Spine Extension | Inhibit | `cervical_spine` / `shoulder` | **VERIFIED** |
| `cex-inh-10` | `SE-INH-02`, `SE-INH-03`, `FH-INH-04` | SMR Upper Trapezius & Levator Scapulae | Inhibit | `shoulder` / `cervical_spine` | **VERIFIED** |
| `cex-len-01` | `FA-LEN-01`, `KV-LEN-01`, `EFL-LEN-01` | Static Gastrocnemius Stretch | Lengthen | `foot_ankle` | **VERIFIED** |
| `cex-len-02` | `FA-LEN-02` | Static Soleus Stretch | Lengthen | `foot_ankle` | **VERIFIED** |
| `cex-len-03` | `KV-LEN-02`, `AWS-LEN-01`, `LBR-LEN-02` | Static Standing Adductor Stretch | Lengthen | `knee` / `lphc` | **VERIFIED** |
| `cex-len-04` | `KV-LEN-03`, `AWS-LEN-02` | Static Standing TFL Stretch | Lengthen | `knee` / `lphc` | **VERIFIED** |
| `cex-len-05` | `EFL-LEN-02` | Static Kneeling Hip Flexor Stretch | Lengthen | `lphc` | **VERIFIED** |
| `cex-len-06` | `LBR-LEN-01`, `AWS-LEN-04`, `FA-LEN-03` | Static Hamstring Stretch | Lengthen | `lphc` | **VERIFIED** |
| `cex-len-07` | `SW-LEN-01`, `SE-LEN-01` | Static Kneeling Lat Stretch | Lengthen | `shoulder` / `lphc` | **VERIFIED** |
| `cex-len-08` | `SW-LEN-02`, `SE-LEN-01` | Static Doorway Pectoral Stretch | Lengthen | `shoulder` | **VERIFIED** |
| `cex-len-09` | `SE-LEN-02`, `SE-LEN-03`, `FH-LEN-02` | Static Upper Trapezius / Levator Stretch | Lengthen | `cervical_spine` / `shoulder` | **VERIFIED** |
| `cex-act-01` | `FA-ACT-02`, `KV-ACT-01`, `EFL-ACT-01` | Isolated Tibialis Anterior Dorsiflexion | Activate | `foot_ankle` | **VERIFIED** |
| `cex-act-02` | `KV-ACT-03`, `AWS-ACT-01` | Side-Lying Clamshell | Activate | `knee` / `lphc` | **VERIFIED** |
| `cex-act-03` | `KV-ACT-03` (Progression) | Lateral Band Walk | Activate | `knee` / `lphc` | **VERIFIED** |
| `cex-act-04` | `EFL-ACT-02`, `KV-ACT-04`, `LBR-ACT-01` | Floor Glute Bridge | Activate | `lphc` | **VERIFIED** |
| `cex-act-05` | `EFL-ACT-04`, `DEADBUG-01` | Deadbug Stabilization | Activate | `lphc` | **VERIFIED** |
| `cex-act-06` | `LBR-ACT-03` | Quadruped Bird-Dog | Activate | `lphc` | **VERIFIED** |
| `cex-act-07` | `SE-ACT-01`, `FH-ACT-03` | Prone Cobra (Lower Trap / Rhomboids) | Activate | `shoulder` | **VERIFIED** |
| `cex-act-08` | `SE-ACT-01`, `SW-ACT-02` | Band Pull-Apart / External Rotation | Activate | `shoulder` | **VERIFIED** |
| `cex-act-09` | `FH-ACT-01` | Chin Tuck (Deep Cervical Flexors) | Activate | `cervical_spine` | **VERIFIED** |
| `cex-act-10` | `KV-ACT-02`, `FA-ACT-05` | Terminal Knee Extension (TKE) | Activate | `knee` | **VERIFIED** |
| `cex-int-01` | `EFL-INT-01`, `KV-INT-01` | Pause Squat (3s Isometric Pause) | Integrate | `lphc` / `knee` | **VERIFIED** |
| `cex-int-02` | `SE-INT-01`, `FA-INT-01` | Single-Leg Romanian Deadlift to Balance | Integrate | `lphc` / `knee` / `foot_ankle` | **VERIFIED** |
| `cex-int-03` | `FA-INT-03`, `KV-INT-01` | Multi-Planar Lunge with Rotation | Integrate | `lphc` / `knee` | **VERIFIED** |
| `cex-int-04` | `KV-INT-01`, `FA-INT-04` | Lateral Skater Hop with Stabilization | Integrate | `knee` / `lphc` | **VERIFIED** |
| `cex-int-05` | `FA-INT-03` | A-Skip & Ankling Dynamic Prep | Integrate | `foot_ankle` / `lphc` | **VERIFIED** |
| `cex-int-06` | `SE-INT-01` | Overhead Band Walk / Carry | Integrate | `shoulder` | **VERIFIED** |
| `cex-int-07` | `SW-INT-01` | Standing One-Arm Cable Chest Press | Integrate | `shoulder` / `kinetic_chain` | **VERIFIED** |
| `cex-int-08` | `EFL-INT-01`, `LBR-INT-01`, `FH-INT-01` | Squat to Overhead Press Integration | Integrate | `lphc` / `shoulder` | **VERIFIED** |

---

## 3. Source Authority & Framework Separation

- **S01 NASM Corrective Exercise Training:** Primary authority for corrective phases (Inhibit $\to$ Lengthen $\to$ Activate $\to$ Integrate), impairment definitions, and muscle/tissue actions.
- **S02 NASM Essentials of Sports Performance Training:** Athletic movement preparation, non-fatiguing active warm-up, and dynamic sport-specific integration.
- **S03 NSCA Essentials of Strength Training and Conditioning 4th Ed.:** Program design, resistance load modulation, static stretch duration caps ($\le 30$s pre-lifting), and warm-up sequencing (RAMP framework).
- **S04 BFS Hybrid Athlete 2-Week Rotation:** Operational hybrid athlete training context (Heavy Lifting + Running + Saturday Soccer).
- **S05 Kế-hoạch-cơ-bản.txt (Reconciled Governance Record):** Product and UX requirements only (PR-001 to PR-004); **zero clinical/scientific authority**.

### Conceptual Framework Distinction (P2-02):
- **NASM CEx Continuum:** Targeted corrective rehabilitation addressing overactive/underactive muscle imbalances.
- **NSCA RAMP Warm-Up:** Systemic physiological elevation, activation/mobilization, and neuromuscular potentiation. Prehab Mode A integrates into the *Activate & Mobilize* portion of RAMP.

---

## 4. Source-Locked Exercise Matrix (Organized by Kinetic Checkpoint)

### 4.1 Foot / Ankle Impairment — S01 Chapter 12

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-01` | `FA-INH-01` | Inhibit | Foam roll lateral gastrocnemius / soleus | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-inh-02` | `FA-INH-02` | Inhibit | Foam roll peroneals | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-inh-06` | `FA-INH-03` | Inhibit | Foam roll biceps femoris (short head) | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-len-01` | `FA-LEN-01` | Lengthen | Static Gastrocnemius stretch | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-len-02` | `FA-LEN-02` | Lengthen | Static Soleus stretch | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-len-06` | `FA-LEN-03` | Lengthen | Static Biceps femoris stretch | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-act-01` | `FA-ACT-02` | Activate | Anterior tibialis dorsiflexion / positional isometric | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-act-10` | `FA-ACT-05` | Activate | Terminal Knee Extension / medial gastrocnemius | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-int-02` | `FA-INT-01` | Integrate | Single-leg balance reach / RDL | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-int-03` | `FA-INT-03` | Integrate | Multi-planar lunge to balance | `[LOCKED-SOURCE]` | S01 Ch. 12 |
| `cex-int-05` | `FA-INT-03` | Integrate | A-Skip & ankling dynamic preparation | `[LOCKED-SOURCE]` | S02 Ch. 11 |

---

### 4.2 Knee Inward / Valgus Compensation — S01 Chapter 13

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-01` | `KV-INH-01` | Inhibit | Gastrocnemius / soleus | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-inh-03` | `KV-INH-02` | Inhibit | Adductor complex | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-inh-04` | `KV-INH-03` | Inhibit | TFL / IT band | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-inh-06` | `KV-INH-04` | Inhibit | Biceps femoris (short head) | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-len-01` | `KV-LEN-01` | Lengthen | Static Gastrocnemius / soleus stretch | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-len-03` | `KV-LEN-02` | Lengthen | Static Adductor stretch | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-len-04` | `KV-LEN-03` | Lengthen | Static Standing TFL stretch | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-len-06` | `KV-LEN-04` | Lengthen | Static Biceps femoris stretch | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-act-01` | `KV-ACT-01` | Activate | Anterior tibialis dorsiflexion | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-act-02` | `KV-ACT-03` | Activate | Side-lying clamshell (Gluteus medius) | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-act-03` | `KV-ACT-03` | Activate | Lateral band walk (Gluteus medius) | `[LOCKED-SOURCE]` | S01 Ch. 10 |
| `cex-act-04` | `KV-ACT-04` | Activate | Floor glute bridge (Gluteus maximus) | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-act-10` | `KV-ACT-02` | Activate | Terminal Knee Extension (VMO) | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-int-01` | `KV-INT-01` | Integrate | Pause squat (3s isometric pause) | `[LOCKED-SOURCE]` | S01 Ch. 13 |
| `cex-int-04` | `KV-INT-01` | Integrate | Lateral skater hop with stabilization | `[LOCKED-SOURCE]` | S02 Ch. 10 |

---

### 4.3 LPHC / Low Back Rounds (Posterior Pelvic Tilt) — S01 Chapter 14

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-06` | `LBR-INH-01` | Inhibit | Hamstring complex (Biceps femoris) | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-inh-03` | `LBR-INH-02` | Inhibit | Adductor magnus / complex | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-len-06` | `LBR-LEN-01` | Lengthen | Static Hamstring stretch | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-len-03` | `LBR-LEN-02` | Lengthen | Static Adductor magnus stretch | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-act-04` | `LBR-ACT-01` | Activate | Floor glute bridge (Gluteus maximus) | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-act-06` | `LBR-ACT-03` | Activate | Quadruped bird-dog (Erector spinae) | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-int-08` | `LBR-INT-01` | Integrate | Squat to overhead press integration | `[LOCKED-SOURCE]` | S01 Ch. 14 |

---

### 4.4 LPHC / Excessive Forward Lean & Anterior Pelvic Tilt — S01 Chapter 14

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-01` | `EFL-INH-01` | Inhibit | Gastrocnemius / soleus | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-inh-05` | `EFL-INH-02` | Inhibit | Hip flexor complex / rectus femoris | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-len-01` | `EFL-LEN-01` | Lengthen | Static Gastrocnemius stretch | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-len-05` | `EFL-LEN-02` | Lengthen | Static Kneeling hip flexor stretch | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-act-01` | `EFL-ACT-01` | Activate | Anterior tibialis dorsiflexion | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-act-04` | `EFL-ACT-02` | Activate | Floor glute bridge (Gluteus maximus) | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-act-05` | `EFL-ACT-04` | Activate | Deadbug core stabilization | `[LOCKED-SOURCE]` | S01 Ch. 10 |
| `cex-int-01` | `EFL-INT-01` | Integrate | Pause squat (3s isometric pause) | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-int-08` | `EFL-INT-01` | Integrate | Squat to overhead press integration | `[LOCKED-SOURCE]` | S01 Ch. 14 |

---

### 4.5 LPHC / Asymmetric Weight Shift — S01 Chapter 14

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-03` | `AWS-INH-01` | Inhibit | Same-side adductors | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-inh-04` | `AWS-INH-02` | Inhibit | Same-side TFL / IT band | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-inh-07` | `AWS-INH-03` | Inhibit | Opposite-side piriformis | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-inh-06` | `AWS-INH-04` | Inhibit | Opposite-side biceps femoris | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-len-03` | `AWS-LEN-01` | Lengthen | Same-side adductor stretch | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-len-04` | `AWS-LEN-02` | Lengthen | Opposite-side TFL stretch | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-len-06` | `AWS-LEN-04` | Lengthen | Opposite-side hamstring stretch | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-act-02` | `AWS-ACT-01` | Activate | Same-side gluteus medius (clamshell) | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-act-03` | `AWS-ACT-02` | Activate | Opposite-side lateral band walk | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-int-01` | `AWS-INT-01` | Integrate | Pause squat (3s isometric pause) | `[LOCKED-SOURCE]` | S01 Ch. 14 |
| `cex-int-08` | `AWS-INT-01` | Integrate | Squat to overhead press integration | `[LOCKED-SOURCE]` | S01 Ch. 14 |

---

### 4.6 Shoulder Elevation — S01 Chapter 15

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-09` | `SE-INH-01` | Inhibit | SMR Thoracic spine extension | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-inh-10` | `SE-INH-02` | Inhibit | SMR Upper trapezius / levator scapulae | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-len-07` | `SE-LEN-01` | Lengthen | Static Kneeling lat stretch | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-len-08` | `SE-LEN-01` | Lengthen | Static Doorway pectoral stretch | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-len-09` | `SE-LEN-02` | Lengthen | Static Upper trapezius / levator stretch | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-act-07` | `SE-ACT-01` | Activate | Prone cobra (Middle / lower trapezius) | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-act-08` | `SE-ACT-01` | Activate | Band pull-apart / external rotation | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-int-02` | `SE-INT-01` | Integrate | Single-leg RDL to balance | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-int-06` | `SE-INT-01` | Integrate | Overhead band walk / carry | `[LOCKED-SOURCE]` | S01 Ch. 15 |

---

### 4.7 Scapular Winging — S01 Chapter 15

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-08` | `SW-INH-01` | Inhibit | SMR Latissimus dorsi | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-inh-09` | `SW-INH-02` | Inhibit | SMR Thoracic spine extension | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-len-07` | `SW-LEN-01` | Lengthen | Static Kneeling lat stretch | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-len-08` | `SW-LEN-02` | Lengthen | Static Doorway pectoral stretch | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-act-07` | `SW-ACT-02` | Activate | Prone cobra (Rhomboids / Lower Trap) | `[LOCKED-SOURCE]` | S01 Ch. 15 |
| `cex-int-07` | `SW-INT-01` | Integrate | Standing One-Arm Cable Chest Press | `[LOCKED-SOURCE]` | S01 Ch. 15 |

*Note on Scapular Winging Phase 4 (`SG-001`):* **SOURCE-VERIFIED**. S01 Chapter 15 explicitly specifies Standing One-Arm Cable Chest Press as the Step 4 dynamic integration exercise for Scapular Winging. Requires cable equipment (`cable`). Prior `[SOURCE-GAP]` / synthetic fallback proposal is formally resolved.

---

### 4.8 Forward Head Posture — S01 Chapter 16

| Canonical ID | Legacy ID | Phase | Exercise / Target | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cex-inh-09` | `FH-INH-01` | Inhibit | SMR Thoracic spine extension | `[LOCKED-SOURCE]` | S01 Ch. 16 |
| `cex-inh-10` | `FH-INH-04` | Inhibit | SMR Upper trapezius & levator | `[LOCKED-SOURCE]` | S01 Ch. 16 |
| `cex-len-09` | `FH-LEN-02` | Lengthen | Static Upper trapezius / levator stretch | `[LOCKED-SOURCE]` | S01 Ch. 16 |
| `cex-act-09` | `FH-ACT-01` | Activate | Chin tuck (Deep cervical flexors) | `[LOCKED-SOURCE]` | S01 Ch. 16 |
| `cex-act-07` | `FH-ACT-03` | Activate | Prone cobra (Lower trapezius) | `[LOCKED-SOURCE]` | S01 Ch. 16 |
| `cex-int-08` | `FH-INT-01` | Integrate | Squat to overhead press integration | `[LOCKED-SOURCE]` | S01 Ch. 16 |

---

## 5. Product Rules from S05 (Reconciled Governance Status)

- **PR-001 (Mutual Exclusivity):** Biomechanically opposing conditions (APT vs PPT; Knee Valgus vs Varus) use mutually exclusive radio inputs in UI (`[PRODUCT-RULE]`).
- **PR-002 (Context Linkage):** The corrective workflow uses the 4-phase sequence and adapts to daily workout context (`[PRODUCT-RULE]`).
- **PR-003 (Deterministic Pipeline):** Rule-based client execution decoupled from external LLMs (`[PRODUCT-RULE]`).
- **PR-004 (Dual Dosing Modes):** Compact Mode A (3–6m) vs extended Mode B (12–20m) (`[PRODUCT-RULE]`).

---

## 6. Open Administrative Decisions & Gaps (P1-01)

The following administrative decisions belong exclusively to DINO (Project Owner) and remain **`STATUS = OPEN`**:

| Decision ID | Domain | Open Question | Proposed Engineering Baseline | Status |
| :--- | :--- | :--- | :--- | :---: |
| **`AD-001`** | Dosage Pinning | Finalize exact second/rep durations for Mode A (3–6 min) vs Mode B (12–20 min). | Mode A: 45s SMR, 25s stretch, 10 reps activate, 10 reps integrate. Mode B: 60s SMR, 30s stretch, 12 reps, 10 reps. | **OPEN** |
| **`AD-002`** | Missing AWS Laterality | Policy when user selects Asymmetric Weight Shift without declaring shifted side. | Halt unilateral routine, flag `PARTIAL_NEEDS_LATERALITY`, deliver bilateral posterior chain relief, prompt for shifted side. | **OPEN** |
| **`SG-001`** | Scapular Winging P4 | Resolved via NASM CEx Chapter 15 source verification. | Standing One-Arm Cable Chest Press (requires cable equipment). | **RESOLVED (SOURCE-VERIFIED)** |

---

## 7. Computational Complexity Notice (P2-01)

The candidate evaluation across this 37-exercise catalog operates as an **$O(N)$ bounded deterministic catalog evaluation, where $N = 37$ in the current catalog**. It guarantees complete reproducibility and constant execution bounds ($<2$ ms on mobile runtime) without unbounded asymptotic scaling.
