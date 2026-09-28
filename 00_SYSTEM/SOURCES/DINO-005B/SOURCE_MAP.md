# DINO-005B — SOURCE MAP

> Change Set: DINO-005B — Prehab / Corrective Engine  
> Step: 02 — Source Mapping  
> Status: REGISTERED  
> Implementation: NOT STARTED  
> Baseline governance: DINO-005B specification registered before implementation.

---

## 1. Purpose

This document maps each authorized DINO-005B source to the domain questions it is allowed to answer.

The source map is a boundary document. It does **not** yet extract corrective rules, assign overactive/underactive muscles, select exercises, or implement application logic.

The core principle is:

> **Do not merge sources into one undifferentiated knowledge base. Preserve source authority by domain.**

---

## 2. Authorized Source Set

| ID | Source | Primary role | Authority domain |
|---|---|---|---|
| S01 | NASM Essentials of Corrective Exercise Training | Primary corrective-exercise reference | Corrective Exercise Continuum, movement impairment, corrective strategy |
| S02 | NASM Essentials of Sports Performance Training | Athlete-performance reference | Movement preparation, mobility/stability, performance integration |
| S03 | Essentials of Strength Training and Conditioning, 4th Ed. (NSCA) | Strength & conditioning reference | Resistance training, power, conditioning, programming, load/recovery context |
| S04 | BFS Hybrid Athlete 2-Week Rotation | BFS athlete/program context | Running + strength + hybrid conditioning + soccer + fatigue/load constraints |
| S05 | Kế-hoạch-cơ-bản.txt | BFS product requirement / legacy specification | Existing DINO feature requirements and intended corrective UX/logic |

---

## 3. S01 — NASM Corrective Exercise Training

### Primary authority

S01 is the primary source for the **corrective-exercise logic itself**.

### Information to extract in Step 03

- Corrective Exercise Continuum / four-stage sequence.
- Assessment-related terminology used by the source.
- Postural distortion / movement impairment terminology.
- Muscle classifications used by the source where explicitly defined.
- Overactive / underactive relationships where explicitly documented.
- Inhibit strategy.
- Lengthen strategy.
- Activate strategy.
- Integrate strategy.
- Exercise selection and progression/regression where explicitly documented.
- Relevant cautions, contraindications, and coaching considerations.

### Product questions S01 may answer

- What corrective stage is appropriate?
- Which muscle/tissue relationship is documented by NASM for a given pattern?
- Which corrective strategy/exercise does NASM associate with that relationship?
- What terminology should DINO display for the corrective workflow?

### S01 does NOT automatically determine

- BFS weekly training placement.
- Running/soccer scheduling.
- DINO UI architecture.
- Individual medical diagnosis.
- Any rule not explicitly supported by the source.

---

## 4. S02 — NASM Essentials of Sports Performance Training

### Primary authority

S02 provides the **sports-performance context** around corrective and movement-preparation work.

### Information to extract in Step 03

- Dynamic movement preparation.
- Mobility and stability concepts where explicitly presented.
- Activation / movement preparation concepts.
- Athletic movement preparation.
- Plyometric / power / speed / agility / conditioning concepts where relevant.
- Performance-oriented exercise progression/regression.
- Integration of preparation work into athletic training.
- Fatigue/recovery considerations where explicitly supported.

### Product questions S02 may answer

- How should corrective/preparatory work fit into an athlete context?
- What performance qualities should be considered when integrating the work?
- What preparation/progression concepts are relevant before higher-demand athletic work?

### S02 does NOT automatically determine

- NASM corrective muscle classifications unless the source explicitly states them.
- BFS-specific weekly scheduling.
- DINO-specific UI or database schema.
- Medical diagnosis.

---

## 5. S03 — NSCA Essentials of Strength Training and Conditioning, 4th Edition

### Primary authority

S03 provides the **strength & conditioning framework** used to evaluate how corrective/prehab work interacts with the broader training system.

### Information to extract in Step 03

- Program-design principles.
- Resistance-training prescription.
- Strength and hypertrophy context.
- Power and plyometric training.
- Conditioning.
- Training volume and intensity concepts.
- Exercise selection considerations.
- Recovery/fatigue considerations.
- Athlete programming and sequencing considerations where explicitly documented.
- Relevant safety/supervision considerations.

### Product questions S03 may answer

- How should corrective work coexist with resistance/conditioning demands?
- What programming variables can increase or reduce total training stress?
- What sequencing/load considerations matter when integrating prehab into training?

### S03 does NOT automatically determine

- NASM CEX stage selection.
- NASM overactive/underactive classifications.
- BFS-specific RIR preferences.
- DINO UI behavior.

---

## 6. S04 — BFS Hybrid Athlete 2-Week Rotation

### Primary authority

S04 is the **BFS-specific athlete programming context**.

It describes how the target athlete combines running performance, resistance training, hybrid conditioning, and soccer.

### Information to extract in Step 03

- Weekly structure.
- Running exposure and placement.
- Resistance-training exposure.
- Soccer exposure.
- Hybrid/game conditioning exposure.
- RIR/intensity conventions.
- Low-set/high-effort approach.
- Rest-pause usage.
- Fatigue-management rules.
- Rules for missed sessions / competing stressors.
- Constraints that should affect placement of corrective/prehab work.

### Product questions S04 may answer

- When can corrective/prehab work be inserted without unnecessarily disrupting the hybrid program?
- How much additional fatigue should be avoided?
- Which training days already carry substantial lower-body or systemic stress?
- How should DINO respect the existing BFS athlete framework?

### S04 does NOT automatically determine

- Whether a corrective relationship is scientifically/NASM-supported.
- The canonical NASM CEX exercise list.
- Medical diagnosis.

---

## 7. S05 — Kế-hoạch-cơ-bản.txt

### Primary authority

S05 is a **BFS product/feature requirement source**, not a textbook evidence source.

### Information to extract in Step 03

- Existing DINO Prehab & Corrective feature requirements.
- Required user-selection behavior (for example, mutually exclusive opposing deviations where specified).
- Intended corrective workflow.
- Existing examples of corrective mappings that the product specification explicitly requests.
- UI/UX requirements related to Prehab.
- Existing terminology that must be preserved for product continuity.

### Important source-status note

The source was reported as unavailable on the developer's local filesystem during initial ingestion, but the exact file is present and readable in the current Project context. Therefore:

- **Project source:** FOUND / READABLE.
- **Local filesystem mirror:** NOT VERIFIED.
- Do not mark the actual source as missing merely because the local path is unavailable.

### Product questions S05 may answer

- What does the existing DINO specification expect the Prehab feature to do?
- Which existing UX requirements must be preserved?
- Which BFS-specific examples are already part of the product brief?

### S05 does NOT automatically override

- Explicit NASM source rules.
- NSCA programming principles.
- Later Founder decisions that are formally locked and more recent.

---

## 8. Source Authority Hierarchy

When building DINO-005B, use the following authority order by question type:

### Corrective rule

**S01 → NASM Corrective Exercise Training**

Use S01 first for CEX, deviation, corrective-stage, and muscle/exercise relationships.

### Sports-performance context

**S02 → NASM Sports Performance Training**

Use S02 for athlete movement preparation and performance integration.

### Strength & conditioning context

**S03 → NSCA Essentials of Strength Training and Conditioning**

Use S03 for broader programming, resistance, conditioning, power, load, and recovery context.

### BFS programming context

**S04 → BFS Hybrid Athlete 2-Week Rotation**

Use S04 for the actual BFS hybrid-athlete scheduling and fatigue constraints.

### Product requirement

**S05 → Kế-hoạch-cơ-bản.txt**

Use S05 to preserve existing DINO product intent and UX requirements.

---

## 9. Conflict Resolution Rule

If sources appear to conflict, do **not** silently reconcile them.

Record:

1. Source ID.
2. Exact claim/rule.
3. Scope of that claim.
4. Whether the claim is evidence, product requirement, or BFS customization.
5. Whether a later Founder decision supersedes it.
6. Final status: `LOCKED`, `OPEN`, or `NEEDS_ADMIN_DECISION`.

A product requirement must not be presented as textbook evidence.

A textbook statement must not automatically become a DINO product rule without product-level authorization.

A BFS customization must not be presented as a NASM/NSCA canonical rule.

---

## 10. Extraction Boundary for STEP 03

STEP 03 may extract only information that can be traced back to one of S01–S05.

Every extracted rule should retain:

- `sourceId`
- source title
- chapter/section when identifiable
- page/location when identifiable
- original terminology
- normalized DINO interpretation, if needed
- confidence/status

If a required rule cannot be located in the authorized sources, mark it:

`SOURCE GAP — DO NOT INVENT`

Do not fill source gaps from model memory during STEP 03.

---

## 11. Explicitly Out of Scope for STEP 02

- No application code changes.
- No `data.js` changes.
- No `app.js` changes.
- No `storage.js` changes.
- No UI implementation.
- No corrective exercise database generation.
- No final overactive/underactive matrix.
- No clinical diagnosis logic.
- No AI-generated recommendations.
- No exercise prescription engine.

---

## 12. Next Step

**STEP 03 — EXTRACTED RULES**

The next step will extract source-grounded rules from S01–S05 and record their exact source locations before any corrective-engine implementation begins.
