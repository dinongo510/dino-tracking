# DINO-005B — STEP 05 DETERMINISTIC PREHAB RULE MATRIX

> **Change Set:** DINO-005B — Prehab / Corrective Engine
> **Step:** 05 — Deterministic Prehab Engine Design (Rule Matrix — Remediated under Step 07A)
> **Status:** SOURCE-RECONCILED & CANONICAL ID MIGRATED
> **Authority:** DINO (Project Owner / Founder)
> **Primary Exercise Identity:** Canonical `cex-*` IDs (37 Exercises)

---

## 1. Matrix Principles & Strict Source Boundaries

1. **CANONICAL EXERCISE IDENTIFIERS (P0-01):**
   - Every candidate exercise is referenced primarily by its canonical ID (`cex-inh-01` to `cex-int-08`) established in `EXERCISE_DATABASE_SPECIFICATION.md`.
   - Legacy checkpoint IDs (`FA-INH-01`, `KV-ACT-03`, etc.) are retained in parentheses strictly for anatomical checkpoint cross-reference and S01 chapter traceability.
2. **SOURCE PROVENANCE & ANNOTATION DISCIPLINE:**
   - `[LOCKED-SOURCE]`: Exercise selection directly derived from S01 chapter protocols.
   - `[PRODUCT-RULE]`: Workflow rules derived from reconciled S05 governance records (`Kế-hoạch-cơ-bản.txt`). Physical S05 file is NOT available on disk; rules possess zero clinical authority.
   - `[ENGINEERING-PROPOSAL]`: Specific context pairings, heuristic ranking weights (+100, +50, etc.), and tie-breakers proposed to achieve software determinism.
   - `[NEEDS-ADMIN-DECISION]`: Formal decisions requiring DINO Project Owner policy approval (`AD-001`, `AD-002`, `SG-001`), currently **STATUS = OPEN**.
   - `[SOURCE-GAP]`: Omissions in source literature where an explicit product policy must be established.
3. **PRESERVATION OF ASSESSMENT BRANCHING & LATERALITY:**
   - Asymmetric Weight Shift (`AWS`) is explicitly indexed by side (`shifted_side` vs. `opposite_side`).
   - Knee Valgus and Excessive Forward Lean incorporate the heels-elevated assessment branch to distinguish Foot/Ankle vs. Hip drivers.
4. **COMPUTATIONAL COMPLEXITY (P2-01):**
   - Evaluation across the candidate matrix operates as an **$O(N)$ bounded deterministic catalog evaluation, where $N = 37$ in the current catalog**.

---

## 2. Deterministic Permutation Table: Impairment $\times$ Context $\to$ (P1, P2, P3, P4)

The table below defines the deterministic mapping from `(ObservedImpairment, AssessmentBranch, WorkoutContext)` to the exact 4-phase exercise tuple `(P1: Inhibit, P2: Lengthen, P3: Activate, P4: Integrate)`.

| Row | Impairment Key & Description | Assessment Branch Condition | Workout Context | Phase 1: Inhibit (SMR) | Phase 2: Lengthen (Static) | Phase 3: Activate (Isolated) | Phase 4: Integrate (Dynamic) | Provenance Tier |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `FA-01`: Feet Turn Out / Pronation | Heels elevated: N/A | `quality_run` / `easy_run` | `cex-inh-01` (`FA-INH-01` Calves) | `cex-len-01` (`FA-LEN-01` Gastroc) | `cex-act-01` (`FA-ACT-02` Ant Tib) | `cex-int-03` (`FA-INT-03` Lunge to Balance) | `[LOCKED-SOURCE]` S01 Ch. 12 + `[ENGINEERING-PROPOSAL]` |
| **02** | `FA-02`: Feet Turn Out / Pronation | Heels elevated: N/A | `lower` / `full_body` | `cex-inh-02` (`FA-INH-02` Peroneals) | `cex-len-02` (`FA-LEN-02` Soleus) | `cex-act-01` (`FA-ACT-02` Ant Tib) | `cex-int-02` (`FA-INT-01` Single-Leg RDL/Reach)| `[LOCKED-SOURCE]` S01 Ch. 12 + `[ENGINEERING-PROPOSAL]` |
| **03** | `KV-01`: Knees Move Inward (Valgus) | Heels elevated: **Modifies** (Foot/Ankle driver) | `lower` / `soccer` | `cex-inh-01` (`KV-INH-01` Calves) | `cex-len-01` (`KV-LEN-01` Gastroc) | `cex-act-01` (`KV-ACT-01` Ant Tib) | `cex-int-01` (`KV-INT-01` Pause Squat) | `[LOCKED-SOURCE]` S01 Ch. 13 + `[ENGINEERING-PROPOSAL]` |
| **04** | `KV-02`: Knees Move Inward (Valgus) | Heels elevated: **Persists** (LPHC/Hip driver) | `lower` / `soccer` | `cex-inh-03` (`KV-INH-02` Adductors) | `cex-len-03` (`KV-LEN-02` Adductor) | `cex-act-02` (`KV-ACT-03` Clamshell) | `cex-int-03` (`KV-INT-01` Lunge to Balance) | `[LOCKED-SOURCE]` S01 Ch. 13 + `[ENGINEERING-PROPOSAL]` |
| **05** | `KV-03`: Knees Move Inward (Valgus) | Heels elevated: Branch not tested | `quality_run` / `easy_run` | `cex-inh-04` (`KV-INH-03` TFL/ITB) | `cex-len-04` (`KV-LEN-03` TFL) | `cex-act-03` (`KV-ACT-03` Lateral Band Walk) | `cex-int-04` (`KV-INT-01` Skater Hop with Stick)| `[ENGINEERING-PROPOSAL]` (Conservative hip-bias) |
| **06** | `LBR-01`: Low Back Rounds (PPT) | Sagittal Pelvic Flexion | `lower` / `offday` | `cex-inh-06` (`LBR-INH-01` Hamstrings)| `cex-len-06` (`LBR-LEN-01` Hamstrings)| `cex-act-04` (`LBR-ACT-01` Glute Bridge) | `cex-int-08` (`LBR-INT-01` Squat to Press) | `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **07** | `LBR-02`: Low Back Rounds (PPT) | Sagittal Pelvic Flexion | `full_body` | `cex-inh-03` (`LBR-INH-02` Adductors) | `cex-len-03` (`LBR-LEN-02` Adductors) | `cex-act-06` (`LBR-ACT-03` Bird-Dog) | `cex-int-08` (`LBR-INT-01` Squat to Press) | `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **08** | `EFL-01`: Excessive Forward Lean | Heels elevated: **Modifies** (Ankle restriction) | `lower` / `full_body` | `cex-inh-01` (`EFL-INH-01` Calves) | `cex-len-01` (`EFL-LEN-01` Gastroc) | `cex-act-01` (`EFL-ACT-01` Ant Tib) | `cex-int-01` (`EFL-INT-01` Pause Squat) | `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **09** | `EFL-02`: Excessive Forward Lean | Heels elevated: **Persists** (Hip/Core driver) | `lower` / `full_body` | `cex-inh-05` (`EFL-INH-02` Hip Flexors)| `cex-len-05` (`EFL-LEN-02` Hip Flexor)| `cex-act-04` (`EFL-ACT-02` Glute Bridge) | `cex-int-08` (`EFL-INT-01` Squat to Press) | `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **10** | `AWS-01`: Asymmetric Weight Shift | Laterality: **Shifted Side (Same-Side)** | `lower` / `offday` | `cex-inh-03` (`AWS-INH-01` Same Adductor)| `cex-len-03` (`AWS-LEN-01` Same Adductor)| `cex-act-02` (`AWS-ACT-01` Same Glute Med)| `cex-int-01` (`AWS-INT-01` Pause Squat) | `[LOCKED-SOURCE]` S01 Ch. 14 (Laterality preserved)|
| **11** | `AWS-02`: Asymmetric Weight Shift | Laterality: **Unweighted (Opposite-Side)**| `lower` / `offday` | `cex-inh-07` (`AWS-INH-03` Opp Piriformis)| `cex-len-06` (`AWS-LEN-04` Opp Hamstrings)| `cex-act-03` (`AWS-ACT-02` Opp Band Walk)| `cex-int-08` (`AWS-INT-01` Squat to Press) | `[LOCKED-SOURCE]` S01 Ch. 14 (Laterality preserved)|
| **12** | `SE-01`: Shoulders Elevate | Cervicothoracic compensation | `upper` | `cex-inh-10` (`SE-INH-02` Upper Trap) | `cex-len-09` (`SE-LEN-02` Upper Trap) | `cex-act-07` (`SE-ACT-01` Prone Cobra) | `cex-int-02` (`SE-INT-01` Single-Leg RDL/PNF) | `[LOCKED-SOURCE]` S01 Ch. 15 + `[ENGINEERING-PROPOSAL]` |
| **13** | `SE-02`: Shoulders Elevate | Cervicothoracic compensation | `full_body` / `offday` | `cex-inh-10` (`SE-INH-03` Levator) | `cex-len-09` (`SE-LEN-03` Levator) | `cex-act-08` (`SE-ACT-01` Band Pull-Apart) | `cex-int-06` (`SE-INT-01` Overhead Band Walk)| `[LOCKED-SOURCE]` S01 Ch. 15 + `[ENGINEERING-PROPOSAL]` |
| **14** | `SW-01`: Scapular Winging | Scapulothoracic instability | `upper` | `cex-inh-08` (`SW-INH-01` Latissimus) | `cex-len-08` (`SW-LEN-02` Pectorals) | `cex-act-07` (`SW-ACT-02` Prone Cobra) | `cex-int-07` (`SW-ACT-01` Push-Up Plus) | `[LOCKED-SOURCE]` P1-P3; P4 is `[ENGINEERING-PROPOSAL]` (SG-001: OPEN) |
| **15** | `FH-01`: Forward Head Posture | Cervical spine compensation | `upper` / `offday` | `cex-inh-10` (`FH-INH-04` Upper Trap) | `cex-len-09` (`FH-LEN-02` Levator) | `cex-act-09` (`FH-ACT-01` Chin Tuck) | `cex-int-08` (`FH-INT-01` Squat to Press) | `[LOCKED-SOURCE]` S01 Ch. 16 + `[ENGINEERING-PROPOSAL]` |
| **16** | `FH-02`: Forward Head Posture | Cervical spine compensation | `full_body` | `cex-inh-09` (`FH-INH-01` Thoracic SMR) | `cex-len-09` (`FH-LEN-03` Upper Trap) | `cex-act-07` (`FH-ACT-03` Prone Cobra) | `cex-int-08` (`FH-INT-01` Squat to Press) | `[LOCKED-SOURCE]` S01 Ch. 16 + `[ENGINEERING-PROPOSAL]` |

---

## 3. Mutual Exclusivity Arbitration Matrix (`[PRODUCT-RULE]` PR-001)

When a user's assessment profile contains biomechanically opposing conditions, the engine applies the following deterministic resolution table:

| Active Input Deviation A | Active Input Deviation B | Biomechanical Conflict | Deterministic Engine Action | Resolution Precedence |
| :--- | :--- | :--- | :--- | :--- |
| `imp-lphc-apt` (Low Back Arches / APT) | `imp-lphc-ppt` (Low Back Rounds / PPT) | Sagittal pelvic tilt cannot be simultaneously anterior and posterior in a bilateral standing position. | Retain primary selected radio input; discard opposing input with informational warning. | Most recently selected or explicit primary focus takes precedence (`[PRODUCT-RULE]`). |
| `imp-knee-valgus` (Knees Move Inward) | `imp-knee-varus` (Knees Move Outward) | Frontal plane tibiofemoral angle cannot be simultaneously valgus and varus. | Retain primary selected radio input; discard opposing input. | Highest clinical prevalence in hybrid athletic running/lifting (`valgus` > `varus`). |

---

## 4. Multi-Impairment Priority Scoring (`[ENGINEERING-PROPOSAL]`)

When a user presents multiple valid, non-conflicting impairments across different checkpoints (e.g. `imp-knee-valgus` AND `imp-shldr-elev`), the engine determines which impairment dictates the primary 4-phase sequence using the following heuristic scoring formula:

$$\text{FinalScore} = \text{BaseWeight} \times W_{\text{context}} + \text{FocusBonus}$$

- $\text{BaseWeight} = 100$ (`[ENGINEERING-PROPOSAL]`).
- $\text{FocusBonus} = +50$ if the user explicitly flagged this deviation as their primary concern (`[PRODUCT-RULE]`).
- $W_{\text{context}}$ represents the context suitability multiplier derived from S02/S03/S04 athletic demand principles:

| Checkpoint Focus | `lower` | `upper` | `full_body` | `quality_run` | `easy_run` | `soccer` | `offday` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Foot / Ankle (`FA`)** | $2.0$ | $1.0$ | $1.5$ | **$3.5$** | $2.5$ | **$3.0$** | $2.0$ |
| **Knee (`KV`)** | **$3.5$** | $1.0$ | $2.5$ | $2.0$ | $2.0$ | **$3.5$** | $2.0$ |
| **LPHC (`LBR`, `EFL`, `AWS`)** | **$3.0$** | $1.5$ | **$3.0$** | $2.5$ | $2.5$ | $2.5$ | **$3.0$** |
| **Shoulder / Scapular (`SE`, `SW`)**| $1.0$ | **$3.5$** | $2.0$ | $1.0$ | $1.0$ | $1.0$ | $2.0$ |
| **Cervical Spine (`FH`)** | $1.0$ | **$3.0$** | $1.5$ | $1.0$ | $1.0$ | $1.0$ | **$2.5$** |

> [!IMPORTANT]
> **Mandatory Provenance Notice on Scoring Weights (P1-02):**
> These weights and multipliers are deterministic engineering heuristics created for product ranking and reproducibility. They are NOT clinical scoring values derived directly from NASM, NSCA, or another source.

---

## 5. Acute Dosing Matrix: Mode A vs. Mode B

Dosing variables are explicitly divided into source-supported reference ranges versus proposed DINO operational parameters:

| Phase | Modality | Source Reference Ranges (`[LOCKED-SOURCE]` S01 / S03) | DINO Mode A: Pre-Workout (`[PRODUCT-RULE]` / `[NEEDS-ADMIN-DECISION]` AD-001) | DINO Mode B: Off-Day (`[PRODUCT-RULE]` / `[NEEDS-ADMIN-DECISION]` AD-001) |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Inhibit** | SMR (Foam Roll / Ball) | 1 set, hold trigger point 30–90 seconds | **1 set $\times$ 30–45s** (1 key tender spot) | **2–3 sets $\times$ 60s** (deeper myofascial work) |
| **Phase 2: Lengthen**| Static Stretch | 1–2 sets, hold 20–30s; **$\le 30$s cap** pre-lifting (S03 Ch. 14) | **1 set $\times$ 20–25s** (capped to prevent power loss) | **2–3 sets $\times$ 30–45s** (plastic tissue lengthening) |
| **Phase 3: Activate**| Isolated Strengthening | 1–2 sets, 10–15 reps, 4/2/1 tempo, 2s hold | **1 set $\times$ 10–12 reps** (4/2/1 tempo, 2s hold) | **2–3 sets $\times$ 12–15 reps** (endurance / motor recruitment)|
| **Phase 4: Integrate**| Dynamic Movement Drill | 1–2 sets, 10–15 reps, slow controlled tempo | **1 set $\times$ 8–10 reps** (controlled athletic tempo) | **2–3 sets $\times$ 10–12 reps** (multiplanar motor control) |
| **Total Routine** | — | Variable depending on assessment | **4 exercises • 3–6 minutes • ZERO FATIGUE** | **4 exercises • 12–20 minutes • RESTORATION** |

---

## 6. Open Administrative Decisions Register (P1-01)

The following administrative decisions remain **`STATUS = OPEN`** pending Project Owner formal sign-off:

| Decision ID | Domain | Open Question | Proposed Engineering Baseline | Status |
| :--- | :--- | :--- | :--- | :---: |
| **`AD-001`** | Dosage Pinning | Finalize exact second/rep durations for Mode A (3–6 min) vs Mode B (12–20 min). | Mode A: 45s SMR, 25s stretch, 10 reps activate, 8 reps integrate. Mode B: 60s SMR, 35s stretch, 12 reps, 10 reps. | **OPEN** |
| **`AD-002`** | Missing AWS Laterality | Policy when user selects Asymmetric Weight Shift without declaring shifted side. | Halt unilateral routine, flag `PARTIAL_NEEDS_LATERALITY`, deliver bilateral posterior chain relief, prompt for shifted side. | **OPEN** |
| **`SG-001`** | Scapular Winging P4 | S01 omits dedicated Phase 4 integration drill for serratus anterior. | Authorize `cex-int-07` (Push-Up Plus) or `cex-int-01` (Pause Squat) as Level 3 fallback. | **OPEN** |

---

## 7. Implementation Gate

> [!IMPORTANT]
> **NO APPLICATION CODE IS AUTHORIZED BY THIS SPECIFICATION.**
> Zero modifications to application runtime scripts (`js/*`), stylesheets (`css/*`), or build manifests (`package.json`, `vercel.json`). This rule matrix serves exclusively as the architectural lookup contract.
