# DINO-005B — STEP 05 DETERMINISTIC PREHAB RULE MATRIX

> **Change Set:** DINO-005B — Prehab / Corrective Engine
> **Step:** 05 — Deterministic Prehab Engine Design (Rule Matrix)
> **Status:** SPECIFICATION / RULE MATRIX COMPLETE (DOCUMENTATION ONLY)
> **Authority:** DINO (Project Owner / Founder)
> **Implementer:** Antigravity (Implementation Agent)
> **Branch:** `feature/dino-005b-step05-engine-design`
> **Baseline Commit:** `d7c8940a0b075b524028b38cb044fb273763a24f`

---

## 1. Matrix Principles & Strict Source Boundaries

1. **NO CODE IMPLEMENTATION:** This matrix is an algorithmic and data design specification. Zero runtime JavaScript files are created or modified.
2. **SOURCE PROVENANCE & ANNOTATION DISCIPLINE:**
   - Every candidate exercise is cited directly from `EXERCISE_MATRIX.md` (`S01`, `S02`, `S03`, `S04`).
   - Every pairing of impairment $\times$ workout context is tagged with its provenance tier:
     - `[LOCKED-SOURCE]`: Exercise selection directly derived from S01 chapter protocols.
     - `[PRODUCT-RULE]`: Workflow rules derived from S05 (`Kế-hoạch-cơ-bản.txt`).
     - `[ENGINEERING-PROPOSAL]`: Specific context pairings, tie-breakers, or heuristic rankings proposed to make selection deterministic.
     - `[NEEDS-ADMIN-DECISION]`: Decisions requiring DINO Project Owner policy approval.
     - `[SOURCE-GAP]`: Omissions in source literature where an explicit product policy must be established.
3. **PRESERVATION OF ASSESSMENT BRANCHING & LATERALITY:**
   - Asymmetric Weight Shift (`AWS`) is explicitly indexed by side (`shifted_side` vs. `opposite_side`).
   - Knee Valgus and Excessive Forward Lean incorporate the heels-elevated assessment branch to distinguish Foot/Ankle vs. Hip drivers.

---

## 2. Deterministic Permutation Table: Impairment $\times$ Context $\to$ (P1, P2, P3, P4)

The table below defines the deterministic mapping from `(ObservedImpairment, AssessmentBranch, WorkoutContext)` to the exact 4-phase exercise tuple `(P1: Inhibit, P2: Lengthen, P3: Activate, P4: Integrate)`.

| Row | Impairment Key & Description | Assessment Branch Condition | Workout Context | Phase 1: Inhibit (SMR) | Phase 2: Lengthen (Static) | Phase 3: Activate (Isolated) | Phase 4: Integrate (Dynamic) | Provenance Tier |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `FA-01`: Feet Turn Out / Pronation | Heels elevated: N/A | `quality_run` / `easy_run` | `FA-INH-01` (Gastrocnemius/Soleus) | `FA-LEN-01` (Gastrocnemius) | `FA-ACT-02` (Anterior Tibialis) | `FA-INT-03` (Lunge to Balance) | `[LOCKED-SOURCE]` S01 Ch. 12 + `[ENGINEERING-PROPOSAL]` |
| **02** | `FA-02`: Feet Turn Out / Pronation | Heels elevated: N/A | `lower` / `full_body` | `FA-INH-02` (Peroneals) | `FA-LEN-02` (Soleus) | `FA-ACT-01` (Posterior Tibialis) | `FA-INT-01` (Single-Leg Balance Reach) | `[LOCKED-SOURCE]` S01 Ch. 12 + `[ENGINEERING-PROPOSAL]` |
| **03** | `KV-01`: Knees Move Inward (Valgus) | Heels elevated: **Modifies** (Foot/Ankle driver) | `lower` / `soccer` | `KV-INH-01` (Gastrocnemius/Soleus) | `KV-LEN-01` (Gastrocnemius/Soleus) | `KV-ACT-01` (Anterior Tibialis) | `KV-INT-01` (Ball Squat / Step-Up) | `[LOCKED-SOURCE]` S01 Ch. 13 + `[ENGINEERING-PROPOSAL]` |
| **04** | `KV-02`: Knees Move Inward (Valgus) | Heels elevated: **Persists** (LPHC/Hip driver) | `lower` / `soccer` | `KV-INH-02` (Adductor Complex) | `KV-LEN-02` (Adductor Complex) | `KV-ACT-03` (Gluteus Medius) | `KV-INT-01` (Lunge to Balance) | `[LOCKED-SOURCE]` S01 Ch. 13 + `[ENGINEERING-PROPOSAL]` |
| **05** | `KV-03`: Knees Move Inward (Valgus) | Heels elevated: Branch not tested | `quality_run` / `easy_run` | `KV-INH-03` (TFL / IT Band) | `KV-LEN-03` (TFL Stretch) | `KV-ACT-03` (Gluteus Medius) | `KV-INT-01` (Step-Up to Balance) | `[ENGINEERING-PROPOSAL]` (Conservative hip-bias) |
| **06** | `LBR-01`: Low Back Rounds (PPT) | Sagittal Pelvic Flexion | `lower` / `offday` | `LBR-INH-01` (Hamstring Complex) | `LBR-LEN-01` (Hamstring Complex) | `LBR-ACT-01` (Gluteus Maximus) | `LBR-INT-01` (Ball Squat to Overhead Press)| `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **07** | `LBR-02`: Low Back Rounds (PPT) | Sagittal Pelvic Flexion | `full_body` | `LBR-INH-02` (Adductor Magnus) | `LBR-LEN-02` (Adductor Magnus) | `LBR-ACT-03` (Erector Spinae) | `LBR-INT-01` (Ball Squat to Overhead Press)| `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **08** | `EFL-01`: Excessive Forward Lean | Heels elevated: **Modifies** (Ankle restriction) | `lower` / `full_body` | `EFL-INH-01` (Gastrocnemius/Soleus) | `EFL-LEN-01` (Gastrocnemius/Soleus) | `EFL-ACT-01` (Anterior Tibialis) | `EFL-INT-01` (Ball Wall Squat to Press) | `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **09** | `EFL-02`: Excessive Forward Lean | Heels elevated: **Persists** (Hip/Core driver) | `lower` / `full_body` | `EFL-INH-02` (Hip Flexor / Rectus Fem.) | `EFL-LEN-02` (Hip Flexor Complex) | `EFL-ACT-02` (Gluteus Maximus) | `EFL-INT-02` (Step-Up to Press) | `[LOCKED-SOURCE]` S01 Ch. 14 + `[ENGINEERING-PROPOSAL]` |
| **10** | `AWS-01`: Asymmetric Weight Shift | Laterality: **Shifted Side (Same-Side)** | `lower` / `offday` | `AWS-INH-01` (Same-side Adductors) | `AWS-LEN-01` (Same-side Adductors) | `AWS-ACT-01` (Same-side Gluteus Medius) | `AWS-INT-01` (Ball Squat to Overhead Press)| `[LOCKED-SOURCE]` S01 Ch. 14 (Laterality preserved)|
| **11** | `AWS-02`: Asymmetric Weight Shift | Laterality: **Unweighted (Opposite-Side)**| `lower` / `offday` | `AWS-INH-03` (Opposite Piriformis) | `AWS-LEN-04` (Opposite Biceps Femoris) | `AWS-ACT-02` (Opposite Adductor Complex)| `AWS-INT-01` (Ball Squat to Overhead Press)| `[LOCKED-SOURCE]` S01 Ch. 14 (Laterality preserved)|
| **12** | `SE-01`: Shoulders Elevate | Cervicothoracic compensation | `upper` | `SE-INH-02` (Upper Trapezius) | `SE-LEN-02` (Upper Trapezius) | `SE-ACT-01` (Middle/Lower Trapezius) | `SE-INT-01` (Single-Leg RDL to PNF Pattern) | `[LOCKED-SOURCE]` S01 Ch. 15 + `[ENGINEERING-PROPOSAL]` |
| **13** | `SE-02`: Shoulders Elevate | Cervicothoracic compensation | `full_body` / `offday` | `SE-INH-03` (Levator Scapulae) | `SE-LEN-03` (Levator Scapulae) | `SE-ACT-01` (Middle/Lower Trapezius) | `SE-INT-01` (Single-Leg RDL to PNF Pattern) | `[LOCKED-SOURCE]` S01 Ch. 15 + `[ENGINEERING-PROPOSAL]` |
| **14** | `SW-01`: Scapular Winging | Scapulothoracic instability | `upper` | `SW-INH-01` (Latissimus Dorsi) | `SW-LEN-02` (Pectorals) | `SW-ACT-01` (Serratus Anterior / Push-Up+)| `[SOURCE-GAP]` (Authorized Wall-Press P4) | `[LOCKED-SOURCE]` P1-P3; P4 is `[SOURCE-GAP]` |
| **15** | `FH-01`: Forward Head Posture | Cervical spine compensation | `upper` / `offday` | `FH-INH-04` (Upper Trapezius) | `FH-LEN-02` (Levator Scapulae) | `FH-ACT-01` (Deep Cervical Flexors) | `FH-INT-01` (Ball Combo with Retraction) | `[LOCKED-SOURCE]` S01 Ch. 16 + `[ENGINEERING-PROPOSAL]` |
| **16** | `FH-02`: Forward Head Posture | Cervical spine compensation | `full_body` | `FH-INH-01` (Thoracic Spine SMR) | `FH-LEN-03` (Upper Trapezius) | `FH-ACT-03` (Lower Trapezius) | `FH-INT-01` (Ball Combo with Scaption) | `[LOCKED-SOURCE]` S01 Ch. 16 + `[ENGINEERING-PROPOSAL]` |

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

> **Classification Notice:** The numerical multiplier values ($1.0$ to $3.5$) are an `[ENGINEERING-PROPOSAL]` designed to achieve deterministic tie-breaking. They reflect S02/S04 training load principles but are NOT published constants of NASM or NSCA.

---

## 5. Acute Dosing Matrix: Mode A vs. Mode B

To satisfy Section 8 of the Engine Design, dosing variables are explicitly divided into source-supported reference ranges versus proposed DINO operational parameters:

| Phase | Modality | Source Sample Variables (`[LOCKED-SOURCE]` S01 / S03) | DINO Mode A: Pre-Workout (`[PRODUCT-RULE]` / `[NEEDS-ADMIN-DECISION]`) | DINO Mode B: Off-Day (`[PRODUCT-RULE]` / `[NEEDS-ADMIN-DECISION]`) |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Inhibit** | SMR (Foam Roll / Ball) | 1 set, hold trigger point 30–90 seconds | **1 set $\times$ 30–45s** (1 key tender spot) | **2–3 sets $\times$ 60s** (deeper myofascial work) |
| **Phase 2: Lengthen**| Static Stretch | 1–2 sets, hold 30s; **$\le 30$s cap** pre-lifting (S03 Ch. 14) | **1 set $\times$ 20–25s** (capped to prevent power loss) | **2–3 sets $\times$ 30–45s** (plastic tissue lengthening) |
| **Phase 3: Activate**| Isolated Strengthening | 1–2 sets, 10–15 reps, 4/2/1 tempo, 2s hold | **1 set $\times$ 10–12 reps** (4/2/1 tempo, 2s hold) | **2–3 sets $\times$ 12–15 reps** (endurance / motor recruitment)|
| **Phase 4: Integrate**| Dynamic Movement Drill | 1–2 sets, 10–15 reps, slow controlled tempo | **1 set $\times$ 8–10 reps** (controlled athletic tempo) | **2–3 sets $\times$ 10–12 reps** (multiplanar motor control) |
| **Total Routine** | — | Variable depending on assessment | **4 exercises • 3–6 minutes • ZERO FATIGUE** | **4 exercises • 12–20 minutes • RESTORATION** |

---

## 6. Implementation Gate

> [!IMPORTANT]
> **NO APPLICATION CODE IS AUTHORIZED BY THIS SPECIFICATION.**
> Zero modifications to application runtime scripts (`js/*`), stylesheets (`css/*`), or build manifests (`package.json`, `vercel.json`). This rule matrix serves exclusively as the architectural lookup contract for upcoming reconciliation and implementation phases.
