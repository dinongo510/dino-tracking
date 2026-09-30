# DINO-005B SPECIFICATION — PREHAB / CORRECTIVE ENGINE

> **Change Set:** DINO-005B — Prehab / Corrective Engine
> **Status:** SPECIFICATION REMEDIATED — STEP_07A_COMPLETE (Awaiting Product Owner Authorization for Step 07 Runtime)
> **Authority:** DINO (Project Owner) & ChatGPT (Product Architect)
> **Implementer:** Antigravity (Implementation Agent)
> **Objective:** Formal specification, source grounding, canonical identity standardization, deterministic scoring pipeline design, and governance remediation for the DINO-005B Prehab & Corrective recommendation engine.

---

## 1. Specification & Governance Artifacts Register

| Step | Artifact File | Title & Scope | Status |
| :--- | :--- | :--- | :--- |
| **STEP 01** | [`00_SYSTEM/SOURCES/DINO-005B/SOURCE_REGISTER.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/SOURCE_REGISTER.md) | Source Ingestion & Inventory Register | VERIFIED / REMEDIATED (S05 physical status updated) |
| **STEP 02** | [`00_SYSTEM/SOURCES/DINO-005B/SOURCE_MAP.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/SOURCE_MAP.md) | Source Domain Mapping & Provenance Tiers | VERIFIED / REMEDIATED (S05 provenance & NASM/RAMP separated) |
| **STEP 03** | [`00_SYSTEM/SOURCES/DINO-005B/EXTRACTED_RULES.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/EXTRACTED_RULES.md) | Extracted Rules Register (ASM, OAU, CEX, CTX, ACU, MEX, FTG) | VERIFIED / REMEDIATED (Governance classifications aligned) |
| **STEP 04** | [`00_SYSTEM/SOURCES/DINO-005B/EXERCISE_MATRIX.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/EXERCISE_MATRIX.md) | Exercise Database & Candidate Matrix | VERIFIED / REMEDIATED (Canonical `cex-*` IDs + Master Migration Table) |
| **STEP 05** | [`00_SYSTEM/SOURCES/DINO-005B/PREHAB_ENGINE_DESIGN.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/PREHAB_ENGINE_DESIGN.md)<br>[`00_SYSTEM/SOURCES/DINO-005B/PREHAB_RULE_MATRIX.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/PREHAB_RULE_MATRIX.md) | Deterministic Engine Architecture & Permutation Matrix | PASS / REMEDIATED (Canonical IDs, Bounded $O(N)$ evaluation) |
| **STEP 06** | [`00_SYSTEM/SOURCES/DINO-005B/EXERCISE_DATABASE_SPECIFICATION.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/EXERCISE_DATABASE_SPECIFICATION.md)<br>[`00_SYSTEM/SOURCES/DINO-005B/DETERMINISTIC_SCORING_SPECIFICATION.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/DETERMINISTIC_SCORING_SPECIFICATION.md) | 37-Exercise Database & Deterministic Scoring Pipeline Specification | PASS / REMEDIATED (Canonical IDs, Heuristic weights classification) |
| **STEP 06A** | [`00_SYSTEM/SOURCES/DINO-005B/DINO_005B_FULL_AUDIT.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/DINO_005B_FULL_AUDIT.md) | Comprehensive Pre-Implementation Specification Audit | AUDIT COMPLETE (7 findings identified: 2 P0, 2 P1, 2 P2, 1 P3) |
| **STEP 07A** | `00_SYSTEM/SOURCES/DINO-005B/*` (All specification files) | Specification Remediation & Blockers Resolution | **COMPLETE / REMEDIATED** |
| **STEP 07** | `js/prehab_data.js`<br>`js/prehab_engine.js` | Client Runtime Modules & Implementation | **NOT STARTED / PROTECTED ON THIS BRANCH** |

---

## 2. Step 07A Audit Remediations Summary

All 7 audit findings from `DINO_005B_FULL_AUDIT.md` have been formally remediated across all specification documents:

1. **P0-01 — Canonical Exercise ID System (`cex-*`):**
   - Locked `cex-inh-01..10`, `cex-len-01..09`, `cex-act-01..10`, `cex-int-01..08` as the single canonical primary key system for all 37 exercises.
   - Master Migration & Equivalence Table created in `EXERCISE_MATRIX.md` (Section 2.1) mapping legacy checkpoint IDs (`FA-INH-01`, etc.) to canonical IDs with 100% verified equivalence.
   - All references across `PREHAB_RULE_MATRIX.md`, `PREHAB_ENGINE_DESIGN.md`, and `DETERMINISTIC_SCORING_SPECIFICATION.md` updated to primary canonical IDs.

2. **P0-02 — SOURCE-05 Reconciled Status (`Kế-hoạch-cơ-bản.txt`):**
   - Explicitly clarified in all registers (`SOURCE_REGISTER.md`, `SOURCE_MAP.md`, `EXTRACTED_RULES.md`, `EXERCISE_MATRIX.md`, `PREHAB_ENGINE_DESIGN.md`):
     - Physical File Status: **NOT AVAILABLE** on local filesystem.
     - Governance Record Status: **RECONCILED / PROJECT-OWNER-AUTHORIZED** (preserving PR-001 to PR-004 under Founder authority).
     - Scientific Authority: **NONE**. Classified strictly as `[DINO BUSINESS RULE]` and `[DINO DESIGN DECISION]`, not clinical science.

3. **P1-01 — Open Administrative Decisions Register:**
   - **`AD-001` (Exact Dosage Pinning):** `STATUS = OPEN`. Clear distinction maintained between source-supported ranges (S01: 30–60s SMR, 20–30s static stretches, 10–15 activation reps) and DINO operational proposals (30–45s Pre-Workout, 10–12 reps).
   - **`AD-002` (AWS Missing Laterality):** `STATUS = OPEN`. Candidate behaviors documented as proposals only; no unilateral decision forced.
   - **`SG-001` (Scapular Winging Phase 4 Integration):** `STATUS = RESOLVED / SOURCE-VERIFIED`. Authoritative exercise: **Standing One-Arm Cable Chest Press** (`cex-int-07`, NASM CEx Chapter 15). Requires cable equipment. Replaces prior `[SOURCE-GAP]` / synthetic fallback proposal.

4. **P1-02 — Scoring Weights Provenance:**
   - Numerical weights ($W_{\text{impairment}} = 100$, $W_{\text{context}} = 60/20$, $W_{\text{phase}} = 50$, multipliers $1.0–3.5$) explicitly classified as **`[ENGINEERING-PROPOSAL]`** deterministic heuristics.
   - Added mandatory governance warning: Not clinical scoring metrics derived from NASM or NSCA textbooks.

5. **P2-01 — Complexity Claims:**
   - Theoretical $O(1)$ claims corrected to: **"$O(N)$ bounded deterministic catalog evaluation, where $N = 37$ in current catalog"**.

6. **P2-02 — NASM CEx vs. NSCA RAMP Framework Separation:**
   - Explicitly documented in `SOURCE_MAP.md`, `EXTRACTED_RULES.md`, `EXERCISE_MATRIX.md`, and `PREHAB_ENGINE_DESIGN.md`:
     - NASM Corrective Exercise Continuum = targeted neuromyofascial rehab.
     - NSCA RAMP = systemic athletic warm-up.

7. **P3-01 — Vietnamese Cues & Assets:**
   - Formally designated as `FUTURE / OPTIONAL` enhancement.

---

## 3. Scope & Boundary Enforcement

- **Runtime Implementation Files:** ZERO runtime code created or modified. `js/*`, `css/*`, `index.html`, `package.json`, `vercel.json`, `sw.js`, `manifest.json` are 100% UNTOUCHED.
- **Application Integrity:** DINO-005A and AI Coach remain completely untouched and verified.
- **Next Stage:** Requires Project Owner authorization before transitioning from `SPECIFICATION_REMEDIATED` to `IMPLEMENTATION_AUTHORIZED`.
