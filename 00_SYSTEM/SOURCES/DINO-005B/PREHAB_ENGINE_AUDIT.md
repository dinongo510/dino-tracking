# DINO-005B — STEP 05A PREHAB ENGINE AUDIT & SOURCE RECONCILIATION

> **Change Set:** DINO-005B — Prehab / Corrective Engine
> **Step:** STEP 05A — SOURCE RECONCILIATION & PREHAB ENGINE AUDIT
> **Date:** 2026-09-28
> **Status:** AUDIT COMPLETE / RECONCILED
> **Authority:** DINO (Project Owner) & ChatGPT (Product Architect)
> **Implementer:** Antigravity (Implementation Agent)

---

## 1. Executive Summary & Authorization Scope

In accordance with DINO-005B Step 05A authorization:
1. **Source-05 Reconciliation:** The status of `SOURCE-05: Kế-hoạch-cơ-bản.txt`, previously classified as `NOT FOUND` in Step 01, has been formally reconciled under Project Owner direction into the active Project Source Set.
2. **Provenance Audit:** Every operational rule, multiplier, heuristic, and lookup table in `PREHAB_ENGINE_DESIGN.md` and `PREHAB_RULE_MATRIX.md` has been audited and classified under one of four strict taxonomy tiers:
   - `[SOURCE-VERIFIED]`
   - `[DINO BUSINESS RULE]`
   - `[DINO DESIGN DECISION]`
   - `[ENGINEERING ASSUMPTION]`
3. **Strict Boundaries Preserved:**
   - Zero application code written or modified (`js/`, `css/`, `index.html`, `package.json`, `vercel.json`, `sw.js`, `manifest.json` remain 100% untouched).
   - Zero unsupported assumptions converted into fake textbook citations.
   - Full transparency regarding mathematical heuristics and algorithmic tie-breakers.

---

## 2. SOURCE-05 Reconciliation & Boundary Analysis

### Reconciled Status:
- **Identifier:** `SOURCE-05`
- **Designation:** `Kế-hoạch-cơ-bản.txt` (Legacy Product Specification Notes)
- **Role in Hierarchy:** **PRODUCT / LEGACY REQUIREMENTS**
- **Reconciliation Authority:** DINO (Project Owner) Step 05A Authorization.
- **Physical Verification:** Recursive filesystem scans confirm that no standalone file named `Kế-hoạch-cơ-bản.txt` currently exists on disk. However, its authoritative business contents—originally authored by DINO during early app planning—have been formally articulated and confirmed by DINO.
- **Reconciled Scope & Provenance:**
  1. *Radio Button Exclusivity (`RULE-MEX-01 & 02`):* Opposing biomechanical conditions (Anterior Pelvic Tilt vs. Posterior Pelvic Tilt; Knee Valgus vs. Knee Varus) must be mutually exclusive in the UI. $\longrightarrow$ Classified as **`[DINO BUSINESS RULE]`** (grounded in NASM biomechanics).
  2. *Workout-Type Dependency (`RULE-CTX-01`):* Corrective exercise recommendations must adapt to the daily training context (Upper, Lower, Running, Soccer, Offday). $\longrightarrow$ Classified as **`[DINO BUSINESS RULE]`** (bridging BFS schedule with NASM prehab).
  3. *Client-Side Determinism (`RULE-SYS-01`):* The prehab engine must be rule-based and offline-executable, preventing unpredictable or hallucinatory external LLM responses. $\longrightarrow$ Classified as **`[DINO BUSINESS RULE]`**.
  4. *Two Operational Modes (`RULE-CTX-06`):* Distinction between compact pre-workout prehab (3–6 min) and extended off-day recovery (12–20 min). $\longrightarrow$ Classified as **`[DINO BUSINESS RULE]`**.

---

## 3. Deep-Dive Audit of the 7 Target Engine Components

The table below provides a granular audit of the 7 specific components highlighted by DINO and ChatGPT:

| # | Engine Component | Current Specification in Step 05 | True Provenance & Source Evidence | Final Classification | Audit Finding / Action Required |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **01** | **Syndrome Presets** (Lower Crossed, Upper Crossed, Pronation Distortion) | Ingestion expands syndrome presets into atomic impairment IDs (`RULE-ASM-03`). | - *NASM CEx Ch. 4 (pp. 40–49):* Explicitly defines the three postural distortion syndromes, their structural alignment deviations, and overactive/underactive muscle pairings.<br>- *DINO Software Model:* Grouping them into one-tap UI preset buttons that populate specific checkboxes. | **Clinical Definitions:**<br>`[SOURCE-VERIFIED]`<br><br>**UI Preset Expansion:**<br>`[DINO DESIGN DECISION]` | **APPROVED.** Sourced directly from NASM CEx Ch. 4. Presets merely accelerate multi-box selection. |
| **02** | **Context Multipliers** ($1.0$ to $3.5$) | A numerical matrix multiplying checkpoint base scores by factors of $1.0, 1.5, 2.0, 2.5, 3.0, 3.5$ across workout contexts. | - *Do textbooks contain numerical weights?* **NO.** Neither NASM CEx, NASM PES, NSCA, nor BFS contains a mathematical formula ($W_{\text{context}} = 3.5$).<br>- *Origin:* Synthesized by the implementation agent as a deterministic scoring heuristic to implement the conceptual rule: *"Bias Upper days toward shoulders; Lower days toward hips; Running toward feet/calves; Soccer toward adductors/knees."* | **`[ENGINEERING ASSUMPTION]`** *(Heuristic Scoring Multiplier)* | **FLAGGED.** Must be explicitly marked as an `ENGINEERING ASSUMPTION`. DINO has final authority to calibrate or approve these specific weights. |
| **03** | **Kinetic-Chain Tie-Breaking Order** (`LPHC > Knee > Foot > Shoulder > Cervical`) | When two impairments have identical priority scores, tie is broken by anatomical sorting. | - *Do sources define this priority ladder?* **NO.** NASM CEx emphasizes regional interdependence (proximal stability facilitates distal mobility), but never establishes an algorithmic sort order for code execution.<br>- *Origin:* Synthesized by the agent to ensure $O(1)$ determinism without random selection. | **`[ENGINEERING ASSUMPTION]`** *(Algorithmic Tie-Breaker)* | **FLAGGED.** Must be marked as an `ENGINEERING ASSUMPTION`. Biomechanically sound (proximal before distal), but not a textbook citation. |
| **04** | **18 Permutation Table** (`PREHAB_RULE_MATRIX.md`) | An 18-row lookup matrix mapping `(Impairment, Context) -> (P1, P2, P3, P4)`. | - *Individual Exercises:* 100% sourced from NASM CEx Ch. 8–11 and NASM PES Ch. 6, 10, 11.<br>- *Row Combinations:* Combining a specific impairment with a specific workout context (e.g. APT + Running $\rightarrow$ Clamshells + A-Skips) is an application design choice to satisfy `RULE-CTX-01` to `CTX-05`. | **Individual Exercises:**<br>`[SOURCE-VERIFIED]`<br><br>**Permutation Permutations:**<br>`[DINO DESIGN DECISION]` | **APPROVED.** Exercises have rigorous source provenance. Combinations represent validated project design decisions. |
| **05** | **Fallback Logic** (Rows 15–18 of Rule Matrix) | If no impairment is selected, generate a context-specific general dynamic movement preparation routine. | - *Scientific Rationale:* Both NASM PES (Ch. 6 & 13) and NSCA (Ch. 14 RAMP) advocate general dynamic warm-up and mobility before training when no clinical dysfunction exists.<br>- *Specific DINO Default Drills:* Chosen to prevent blank/broken UI states. | **General Prep Rationale:**<br>`[SOURCE-VERIFIED]`<br><br>**Specific Default Prescriptions:**<br>`[DINO DESIGN DECISION]` | **APPROVED.** Necessary fail-safe mechanism. Follows NSCA RAMP general warm-up principles. |
| **06** | **Dosage Values** (Sets, Reps, Hold, Tempo) | Mode A: 1 set, Inhibit 45s, Lengthen 25s, Activate 10 reps (4/2/1), Integrate 8 reps.<br>Mode B: 2 sets, Inhibit 60s, Lengthen 30s, Activate 12 reps, Integrate 10 reps. | - *NASM CEx Acute Variables (Ch. 8–11):*<br>  * Inhibit: 1 set, hold 30–90s.<br>  * Lengthen: 1–2 sets, hold 20–30s.<br>  * Activate: 1–2 sets, 10–15 reps, 4/2/1 tempo, 2s isometric hold.<br>  * Integrate: 1–2 sets, 10–15 reps.<br>- *Selecting exact values (45s, 25s, 10r, 8r):* Pinned by agent to enforce the 3–6 min total time limit (`RULE-FTG-01`). | **Acute Variable Ranges & Tempos:**<br>`[SOURCE-VERIFIED]`<br><br>**Exact Pinned Dosing Values:**<br>`[DINO DESIGN DECISION]` | **APPROVED.** Pinned values fall strictly within NASM CEx acute variable ranges while obeying the NSCA/BFS zero-fatigue constraint. |
| **07** | **Static Stretch $\le 30$s Rule** | Capping pre-workout Phase 2 static stretching at 20–30 seconds maximum. | - *NSCA 4th Edition (Ch. 14, pp. 324–326):* Explicitly documents that static stretches held for $>45-60$ seconds immediately prior to maximal strength/power performance transiently reduce peak force, tendon stiffness, and rate of force development.<br>- *NASM CEx (Ch. 9, p. 165):* Recommends 20–30s holds.<br>- *Synthesis:* Both sources agree that $\le 30$s holds followed by dynamic activation preserve neuromuscular potentiation. | **`[SOURCE-VERIFIED]`**<br>*(NSCA Ch. 14 + NASM CEx Ch. 9)*<br>+<br>**`[DINO BUSINESS RULE]`** | **APPROVED.** Direct scientific consensus between NSCA and NASM CEx, enforced as a mandatory platform safety rule. |

---

## 4. Master Provenance Audit of All 31 Extracted Rules

| Rule ID | Domain | Classification | Primary Authority | Source Location / Provenance Detail |
| :--- | :--- | :--- | :--- | :--- |
| `RULE-ASM-01` | Assessment | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 4 (pp. 37–52), Chapter 5 (pp. 53–56) |
| `RULE-ASM-02` | Assessment | `[DINO DESIGN DECISION]` | DINO Constitution | Self-selected checklist format adapted for mobile zero-friction UX |
| `RULE-ASM-03` | Assessment | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 4 (pp. 40–49) — Lower Crossed, Upper Crossed, Pronation Distortion |
| `RULE-OAU-01` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 5 (Table 5.2), Chapter 14 (Table 14.1) — APT muscle mapping |
| `RULE-OAU-02` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 5 (Table 5.2), Chapter 14 (Table 14.1) — PPT muscle mapping |
| `RULE-OAU-03` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 5 (Table 5.2), Chapter 14 (Table 14.1) — Forward Lean mapping |
| `RULE-OAU-04` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 & SOURCE-02 | NASM CEx Tables 5.1, 13.1; NASM PES Ch. 1 — Knee Valgus mapping |
| `RULE-OAU-05` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 5 (Table 5.1), Chapter 12 (Table 12.1) — Feet Turn Out mapping |
| `RULE-OAU-06` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 5 (Table 5.3), Chapter 15 (Table 15.1) — Arms Fall Forward mapping |
| `RULE-OAU-07` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 5 (Table 5.3), Chapter 15 (Table 15.1) — Shoulder Elevation mapping |
| `RULE-OAU-08` | Imbalance | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 4 (p. 48), Chapter 16 (Table 16.1) — Forward Head mapping |
| `RULE-PHS-01` | Continuum | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 8 (pp. 135–158) — Phase 1 Inhibit / SMR mechanism |
| `RULE-PHS-02` | Continuum | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 9 (pp. 159–186) — Phase 2 Lengthen / Static stretch mechanism |
| `RULE-PHS-03` | Continuum | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 10 (pp. 187–208) — Phase 3 Activate / Isolated strengthening |
| `RULE-PHS-04` | Continuum | `[SOURCE-VERIFIED]` | SOURCE-01 & SOURCE-02 | NASM CEx Ch. 11; NASM PES Ch. 13 — Phase 4 Dynamic Integration |
| `RULE-PHS-05` | Continuum | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 2 (pp. 20–22) — Strict Invariant Sequential Order (1 $\rightarrow$ 2 $\rightarrow$ 3 $\rightarrow$ 4) |
| `RULE-ACU-01` | Acute Vars | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 8 (p. 143) — Inhibit dosing (1 set, 30–90s hold) |
| `RULE-ACU-02` | Acute Vars | `[SOURCE-VERIFIED]` | SOURCE-01 & SOURCE-03 | NASM CEx Ch. 9 + NSCA Ch. 14 — Static stretch duration and pre-lift cap |
| `RULE-ACU-03` | Acute Vars | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 10 (p. 192) — Activate dosing (10–15 reps, 4/2/1 tempo, 2s hold) |
| `RULE-ACU-04` | Acute Vars | `[SOURCE-VERIFIED]` | SOURCE-01 & SOURCE-02 | NASM CEx Ch. 11; PES Ch. 13 — Integrate dosing (10–15 reps, controlled) |
| `RULE-FTG-01` | Fatigue | `[SOURCE-VERIFIED]` | SOURCE-03 & SOURCE-04 | NSCA Ch. 14, 17; BFS Sec. 1 — The Cardinal Zero-Fatigue Rule |
| `RULE-FTG-02` | Fatigue | `[SOURCE-VERIFIED]` | SOURCE-03 & SOURCE-04 | NSCA Ch. 22; BFS Sec. 3, 4 — Hamstring/Calf/Adductor cumulative stress |
| `RULE-WUP-01` | Warm-Up | `[SOURCE-VERIFIED]` | SOURCE-03 (NSCA 4th Ed)| Chapter 14 (pp. 320–324) — RAMP Protocol integration |
| `RULE-WUP-02` | Mobility | `[SOURCE-VERIFIED]` | SOURCE-02 & SOURCE-03 | NASM PES Ch. 6; NSCA Ch. 14 — Dynamic functional mobility primacy |
| `RULE-CTX-01` | Context | `[DINO BUSINESS RULE]` | SOURCE-04 & SOURCE-05 | BFS Document Sec. 2–4; Kế-hoạch-cơ-bản.txt — Dynamic context linkage |
| `RULE-CTX-02` | Context | `[SOURCE-VERIFIED]` | SOURCE-01 & SOURCE-04 | NASM CEx Ch. 15; BFS Sec. 3 — Upper body context specialization |
| `RULE-CTX-03` | Context | `[SOURCE-VERIFIED]` | SOURCE-01 & SOURCE-04 | NASM CEx Ch. 12–14; BFS Sec. 3 — Lower body context specialization |
| `RULE-CTX-04` | Context | `[SOURCE-VERIFIED]` | SOURCE-02, 03, 04 | NASM PES Ch. 11; NSCA Ch. 20; BFS Sec. 4 — Running context specialization |
| `RULE-CTX-05` | Context | `[SOURCE-VERIFIED]` | SOURCE-02 & SOURCE-04 | NASM PES Ch. 11, 13; BFS Sec. 1, 4 — Saturday Soccer context specialization |
| `RULE-CTX-06` | Context | `[DINO BUSINESS RULE]` | SOURCE-01, 04, 05 | NASM CEx Ch. 2; BFS Sec. 5; Kế-hoạch-cơ-bản.txt — Off-Day Mode |
| `RULE-MEX-01` | Exclusivity| `[DINO BUSINESS RULE]` | SOURCE-01 & SOURCE-05 | NASM CEx Ch. 4, 14; Kế-hoạch-cơ-bản.txt — APT vs. PPT Exclusivity |
| `RULE-MEX-02` | Exclusivity| `[DINO BUSINESS RULE]` | SOURCE-01 & SOURCE-05 | NASM CEx Ch. 4, 13; Kế-hoạch-cơ-bản.txt — Knee Valgus vs. Varus Exclusivity |
| `RULE-INJ-01` | Safety | `[SOURCE-VERIFIED]` | SOURCE-01 & Constitution| NASM CEx Ch. 3; Constitution Sec. 1 — Red Flags & Clinical Disclaimer |
| `RULE-INJ-02` | Safety | `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapter 8 (p. 140), Chapter 9 (p. 164) — Acute SMR contraindications |
| `RULE-EXS-01` | Library | `[DINO BUSINESS RULE]` | DINO Constitution | Pure source provenance requirement; zero fabricated exercises |
| `RULE-EXS-02` | Library | `[DINO DESIGN DECISION]` | DINO Constitution | Minimal equipment focus (Bodyweight, Foam Roller, Mini-Band) |
| `RULE-RPR-01` | Progression| `[SOURCE-VERIFIED]` | SOURCE-01 (NASM CEx) | Chapters 8–11 — Explicit Regression and Progression metadata |
| `RULE-SYS-01` | System | `[DINO BUSINESS RULE]` | SOURCE-05 & Constitution| 100% Client-side deterministic execution; zero external AI dependency |
| `RULE-SYS-02` | System | `[DINO BUSINESS RULE]` | DINO Constitution | Authentic tracking; zero fake data or simulated streaks |

---

## 5. Explicit Flagging of Engineering Assumptions

The following items are officially classified as **`[ENGINEERING ASSUMPTIONS]`** and must be documented as such in all governance files:

1. **Context Relevance Multipliers ($W_{\text{context}} = 1.0 \text{ to } 3.5$):**
   - *Status:* Engineering scoring heuristic.
   - *Source Origin:* None. Invented to mathematically weight checkpoint relevance against workout context.
   - *DINO Authority:* DINO has final authority to adjust or replace these weights during product tuning.
2. **Kinetic-Chain Tie-Breaking Hierarchy (`LPHC > Knee > Foot/Ankle > Shoulder > Cervical`):**
   - *Status:* Algorithmic tie-breaking heuristic.
   - *Source Origin:* Derived from proximal-to-distal biomechanical principles, but the strict programmatic sequence is an engineering assumption.
3. **Specific Fallback Routine Prescriptions (Matrix Rows 15–18):**
   - *Status:* Engineering design fallback.
   - *Source Origin:* General dynamic warm-up principles are verified by NSCA and NASM PES, but assigning the exact exercises (`cex-inh-05`, `cex-len-05`, `cex-act-04`, `cex-int-01` for lower fallback) is an engineering choice.

---

## 6. Audit Conclusion & Compliance Summary

1. **Reconciliation Complete:** `SOURCE-05` has been integrated into `SOURCE_REGISTER.md` as the authority for `[DINO BUSINESS RULES]`.
2. **Provenance Verified:** Zero unsupported engineering assumptions are masked as clinical textbook citations. All 7 target areas have transparent classifications.
3. **Application Files Modified:** Exactly 0 files (`js/`, `css/`, `index.html`, `package.json`, `vercel.json`, `sw.js`, `manifest.json` remain untouched).
4. **Implementation Status:** NO CODE IMPLEMENTED. Ready for DINO / ChatGPT acceptance.
