# DINO-005B — STEP 04 EXERCISE MATRIX

> Change Set: DINO-005B — Prehab / Corrective Engine  
> Step: 04 — Exercise Matrix  
> Status: DRAFT / SOURCE-RECONCILED  
> Implementation: NOT STARTED  
> Branch: feature/dino-005b-step04-exercise-matrix  
> Baseline: main@bd96bd8004fe8a89111597052a1529e4ac5f259a

## 1. Purpose

Define the source-traceable corrective exercise matrix needed before any deterministic Prehab Engine implementation.

This document distinguishes:
- source-supported corrective exercise relationships;
- DINO/BFS product requirements;
- engineering proposals that still require authorization.

No clinical diagnosis is created by this matrix.

## 2. Exercise Record Model

Each matrix record should retain:
- exercise name;
- corrective phase: Inhibit / Lengthen / Activate / Integrate;
- target impairment or assessment finding;
- laterality/side when the source makes side relevant;
- source ID;
- chapter/section or location when identifiable;
- evidence status;
- regression/progression note where source-supported;
- product compatibility note where relevant.

## 3. Source Authority

S01 NASM Corrective Exercise Training:
primary authority for corrective phase, impairment, muscle/tissue and exercise relationships.

S02 NASM Essentials of Sports Performance Training:
athletic preparation, maintenance, movement preparation, fatigue-aware performance context.

S03 NSCA Essentials of Strength Training and Conditioning 4th Ed.:
training-load, sequencing, fatigue/recovery and broader strength & conditioning context.

S04 BFS Hybrid Athlete 2-Week Rotation:
BFS-specific scheduling and practical hybrid constraints.

S05 Kế-hoạch-cơ-bản.txt:
product/UX requirements only; not textbook evidence.

## 4. Source-Locked Exercise Matrix

### 4.1 Foot / Ankle impairment — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| FA-INH-01 | Inhibit | Foam roll lateral gastrocnemius / soleus | LOCKED-SOURCE | S01 Ch.12 |
| FA-INH-02 | Inhibit | Foam roll peroneals | LOCKED-SOURCE | S01 Ch.12 |
| FA-INH-03 | Inhibit | Foam roll biceps femoris (short head) | LOCKED-SOURCE | S01 Ch.12 |
| FA-LEN-01 | Lengthen | Gastrocnemius stretch | LOCKED-SOURCE | S01 Ch.12 |
| FA-LEN-02 | Lengthen | Soleus stretch | LOCKED-SOURCE | S01 Ch.12 |
| FA-LEN-03 | Lengthen | Biceps femoris stretch | LOCKED-SOURCE | S01 Ch.12 |
| FA-ACT-01 | Activate | Posterior tibialis strengthening / positional isometric | LOCKED-SOURCE | S01 Ch.12 |
| FA-ACT-02 | Activate | Anterior tibialis strengthening / positional isometric | LOCKED-SOURCE | S01 Ch.12 |
| FA-ACT-03 | Activate | Medial hamstring strengthening / positional isometric | LOCKED-SOURCE | S01 Ch.12 |
| FA-ACT-04 | Activate | Toe flexors / intrinsic foot muscles | LOCKED-SOURCE | S01 Ch.12 |
| FA-ACT-05 | Activate | Medial gastrocnemius | LOCKED-SOURCE | S01 Ch.12 |
| FA-INT-01 | Integrate | Single-leg balance reach | LOCKED-SOURCE | S01 Ch.12 |
| FA-INT-02 | Integrate | Step-up to balance | LOCKED-SOURCE | S01 Ch.12 |
| FA-INT-03 | Integrate | Lunge to balance | LOCKED-SOURCE | S01 Ch.12 |
| FA-INT-04 | Integrate | Single-leg squat | LOCKED-SOURCE | S01 Ch.12 |

S01 specifies a progression from simpler/transitional and uniplanar tasks toward more dynamic and multiplanar tasks. Integration exercise may need regression when the client cannot perform the listed movement.

### 4.2 Knee inward / valgus compensation — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| KV-INH-01 | Inhibit | Gastrocnemius / soleus | LOCKED-SOURCE | S01 Ch.13 |
| KV-INH-02 | Inhibit | Adductors | LOCKED-SOURCE | S01 Ch.13 |
| KV-INH-03 | Inhibit | TFL / IT band | LOCKED-SOURCE | S01 Ch.13 |
| KV-INH-04 | Inhibit | Short-head biceps femoris | LOCKED-SOURCE | S01 Ch.13 |
| KV-LEN-01 | Lengthen | Gastrocnemius / soleus static or neuromuscular stretch | LOCKED-SOURCE | S01 Ch.13 |
| KV-LEN-02 | Lengthen | Adductor stretch | LOCKED-SOURCE | S01 Ch.13 |
| KV-LEN-03 | Lengthen | TFL stretch | LOCKED-SOURCE | S01 Ch.13 |
| KV-LEN-04 | Lengthen | Biceps femoris stretch | LOCKED-SOURCE | S01 Ch.13 |
| KV-ACT-01 | Activate | Anterior tibialis | LOCKED-SOURCE | S01 Ch.13 |
| KV-ACT-02 | Activate | Posterior tibialis | LOCKED-SOURCE | S01 Ch.13 |
| KV-ACT-03 | Activate | Gluteus medius | LOCKED-SOURCE | S01 Ch.13 |
| KV-ACT-04 | Activate | Gluteus maximus | LOCKED-SOURCE | S01 Ch.13 |
| KV-INT-01 | Integrate | Ball squat → step-up → lunge → single-leg squat progression | LOCKED-SOURCE | S01 Ch.13 |

Important assessment rule: an inward knee compensation does not automatically identify one single causal region. S01 describes a heels-elevated comparison to help distinguish lower-leg versus hip contribution.

### 4.3 LPHC / low-back rounds — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| LBR-INH-01 | Inhibit | Hamstring complex | LOCKED-SOURCE | S01 Ch.14 |
| LBR-INH-02 | Inhibit | Adductor magnus | LOCKED-SOURCE | S01 Ch.14 |
| LBR-LEN-01 | Lengthen | Hamstring complex | LOCKED-SOURCE | S01 Ch.14 |
| LBR-LEN-02 | Lengthen | Adductor magnus | LOCKED-SOURCE | S01 Ch.14 |
| LBR-LEN-03 | Lengthen | Abdominal complex | LOCKED-SOURCE | S01 Ch.14 |
| LBR-ACT-01 | Activate | Gluteus maximus | LOCKED-SOURCE | S01 Ch.14 |
| LBR-ACT-02 | Activate | Hip flexors | LOCKED-SOURCE | S01 Ch.14 |
| LBR-ACT-03 | Activate | Erector spinae | LOCKED-SOURCE | S01 Ch.14 |
| LBR-INT-01 | Integrate | Ball squat to overhead press | LOCKED-SOURCE | S01 Ch.14 |

### 4.4 LPHC / excessive forward lean — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| EFL-INH-01 | Inhibit | Gastrocnemius / soleus | LOCKED-SOURCE | S01 Ch.14 |
| EFL-INH-02 | Inhibit | Hip-flexor complex / rectus femoris | LOCKED-SOURCE | S01 Ch.14 |
| EFL-LEN-01 | Lengthen | Gastrocnemius / soleus | LOCKED-SOURCE | S01 Ch.14 |
| EFL-LEN-02 | Lengthen | Hip-flexor complex | LOCKED-SOURCE | S01 Ch.14 |
| EFL-LEN-03 | Lengthen | Abdominal complex | LOCKED-SOURCE | S01 Ch.14 |
| EFL-ACT-01 | Activate | Anterior tibialis | LOCKED-SOURCE | S01 Ch.14 |
| EFL-ACT-02 | Activate | Gluteus maximus | LOCKED-SOURCE | S01 Ch.14 |
| EFL-ACT-03 | Activate | Erector spinae | LOCKED-SOURCE | S01 Ch.14 |
| EFL-ACT-04 | Activate | Intrinsic core stabilizers | LOCKED-SOURCE | S01 Ch.14 |
| EFL-INT-01 | Integrate | Ball wall squat to overhead press | LOCKED-SOURCE | S01 Ch.14 |
| EFL-INT-02 | Integrate | Step-up / overhead-press progression | LOCKED-SOURCE | S01 Ch.14 |
| EFL-INT-03 | Integrate | Lunge / overhead-press progression | LOCKED-SOURCE | S01 Ch.14 |
| EFL-INT-04 | Integrate | Single-leg squat / overhead-press progression | LOCKED-SOURCE | S01 Ch.14 |

### 4.5 LPHC / asymmetric weight shift — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| AWS-INH-01 | Inhibit | Same-side adductors | LOCKED-SOURCE | S01 Ch.14 |
| AWS-INH-02 | Inhibit | Same-side TFL / IT band | LOCKED-SOURCE | S01 Ch.14 |
| AWS-INH-03 | Inhibit | Opposite-side piriformis | LOCKED-SOURCE | S01 Ch.14 |
| AWS-INH-04 | Inhibit | Opposite-side biceps femoris | LOCKED-SOURCE | S01 Ch.14 |
| AWS-INH-05 | Inhibit | Gastrocnemius / soleus where implicated | LOCKED-SOURCE | S01 Ch.14 |
| AWS-LEN-01 | Lengthen | Same-side adductors | LOCKED-SOURCE | S01 Ch.14 |
| AWS-LEN-02 | Lengthen | Opposite-side TFL / IT band | LOCKED-SOURCE | S01 Ch.14 |
| AWS-LEN-03 | Lengthen | Opposite-side gastrocnemius / soleus | LOCKED-SOURCE | S01 Ch.14 |
| AWS-LEN-04 | Lengthen | Opposite-side biceps femoris | LOCKED-SOURCE | S01 Ch.14 |
| AWS-LEN-05 | Lengthen | Opposite-side piriformis | LOCKED-SOURCE | S01 Ch.14 |
| AWS-ACT-01 | Activate | Same-side gluteus medius | LOCKED-SOURCE | S01 Ch.14 |
| AWS-ACT-02 | Activate | Opposite-side adductor complex | LOCKED-SOURCE | S01 Ch.14 |
| AWS-INT-01 | Integrate | Ball squat to overhead press | LOCKED-SOURCE | S01 Ch.14 |

Laterality is first-class data for this compensation and must not be flattened into a bilateral generic rule.

### 4.6 Shoulder elevation — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| SE-INH-01 | Inhibit | Thoracic spine | LOCKED-SOURCE | S01 Ch.15 |
| SE-INH-02 | Inhibit | Upper trapezius | LOCKED-SOURCE | S01 Ch.15 |
| SE-INH-03 | Inhibit | Levator scapulae | LOCKED-SOURCE | S01 Ch.15 |
| SE-LEN-01 | Lengthen | Pectorals | LOCKED-SOURCE | S01 Ch.15 |
| SE-LEN-02 | Lengthen | Upper trapezius | LOCKED-SOURCE | S01 Ch.15 |
| SE-LEN-03 | Lengthen | Levator scapulae | LOCKED-SOURCE | S01 Ch.15 |
| SE-ACT-01 | Activate | Middle / lower trapezius | LOCKED-SOURCE | S01 Ch.15 |
| SE-INT-01 | Integrate | Single-leg Romanian deadlift with PNF pattern | LOCKED-SOURCE | S01 Ch.15 |

### 4.7 Scapular winging — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| SW-INH-01 | Inhibit | Latissimus dorsi | LOCKED-SOURCE | S01 Ch.15 |
| SW-INH-02 | Inhibit | Thoracic spine | LOCKED-SOURCE | S01 Ch.15 |
| SW-LEN-01 | Lengthen | Latissimus dorsi | LOCKED-SOURCE | S01 Ch.15 |
| SW-LEN-02 | Lengthen | Pectorals | LOCKED-SOURCE | S01 Ch.15 |
| SW-ACT-01 | Activate | Serratus anterior / push-up with plus | LOCKED-SOURCE | S01 Ch.15 |
| SW-ACT-02 | Activate | Middle / lower trapezius / ball combo | LOCKED-SOURCE | S01 Ch.15 |

Integration for scapular winging requires a targeted source extraction before locking the specific DINO integration exercise record.

### 4.8 Forward head — S01

| ID | Phase | Exercise / target | Status | Source |
|---|---|---|---|---|
| FH-INH-01 | Inhibit | Thoracic spine | LOCKED-SOURCE | S01 Ch.16 |
| FH-INH-02 | Inhibit | Sternocleidomastoid | LOCKED-SOURCE | S01 Ch.16 |
| FH-INH-03 | Inhibit | Levator scapulae | LOCKED-SOURCE | S01 Ch.16 |
| FH-INH-04 | Inhibit | Upper trapezius | LOCKED-SOURCE | S01 Ch.16 |
| FH-LEN-01 | Lengthen | Sternocleidomastoid | LOCKED-SOURCE | S01 Ch.16 |
| FH-LEN-02 | Lengthen | Levator scapulae | LOCKED-SOURCE | S01 Ch.16 |
| FH-LEN-03 | Lengthen | Upper trapezius | LOCKED-SOURCE | S01 Ch.16 |
| FH-ACT-01 | Activate | Deep cervical flexors | LOCKED-SOURCE | S01 Ch.16 |
| FH-ACT-02 | Activate | Cervicothoracic extensors | LOCKED-SOURCE | S01 Ch.16 |
| FH-ACT-03 | Activate | Lower trapezius | LOCKED-SOURCE | S01 Ch.16 |
| FH-INT-01 | Integrate | Ball combo with cervical retraction / scaption | LOCKED-SOURCE | S01 Ch.16 |

## 5. Sport-Performance Compatibility Rules

These are not corrective mappings; they constrain how the matrix may later be integrated.

### S02

S02 explicitly describes:
- attending to impaired movement patterns using corrective strategies;
- maintaining ROM, joint stability, strength/endurance and cardiorespiratory endurance in-season;
- considering injury-prevention/performance-training exercise volume against the athlete's activity/travel load;
- using active warm-ups that do not cause fatigue that could impair performance.

Status: LOCKED-SOURCE for the stated performance-context principles. It does not define DINO's exact session multiplier or exact prehab volume.

### S03

S03 provides the broader programming principle that training stress must be managed across resistance training, running and other modes, and that progression/loading should consider intensity, volume and recovery. It does not provide a DINO-specific prehab matrix.

Status: LOCKED-SOURCE for context; exact DINO dosage remains open.

### S04

S04 is the BFS-specific implementation context:
- Week A includes quality run, full-body strength, easy run, upper strength/hypertrophy, long run, soccer.
- Week B includes hybrid/game conditioning, lower strength/hypertrophy, easy run, upper hypertrophy, long/progression run, soccer.
- Heavy lower training should not be placed with unreasonable overlap.
- The program explicitly notes not to chase failure on barbell squat/hinge and to reduce loading/fatigue when run/soccer stress is high.

Status: LOCKED-SOURCE for BFS scheduling context.

## 6. Product Rules from S05

### PR-001
Opposing deviations use mutually exclusive radio-button behavior. Example: Anterior Pelvic Tilt vs Posterior Pelvic Tilt.

Status: PRODUCT-RULE.

### PR-002
The corrective workflow uses the four-phase NASM sequence and has workout-type dependency.

Status: PRODUCT-RULE.

### PR-003
The product includes a Prehab/Corrective area with deviation selection, workout-type selection, four-step protocol, guided timer, and frequency matrix concept.

Status: PRODUCT-RULE.

## 7. Explicitly Not Locked in STEP 04

The following must remain open:
- full deviation taxonomy;
- complete opposite/compatibility graph beyond the explicitly documented APT/PPT product pair;
- one canonical exercise per phase for every impairment;
- exact session-type multipliers;
- exact pre-workout/off-day dosage;
- 2-week frequency algorithm;
- complete regression/progression graph;
- clinical red-flag routing;
- S02/S03-derived rules that would alter S01 exercise selection;
- mapping every matrix record to existing DINO exerciseId values.

Status for all: SOURCE-GAP and/or NEEDS-ADMIN-DECISION.

## 8. Matrix Design Rule

The final engine must not collapse an assessment finding directly into one universal routine.

Conceptually:

assessment finding
→ contributing region / laterality
→ phase-specific candidate set
→ capability / context constraints
→ deterministic selection

This preserves the assessment-first structure demonstrated by S01.

## 9. Implementation Gate

STEP 04 creates the evidence-backed exercise candidate matrix only.

NO application code.
NO data.js exercise records.
NO UI implementation.
NO prehab generator.
NO AI integration.

The next step is a separate design/audit pass to convert the candidate matrix into a deterministic engine specification, while keeping source facts distinct from DINO engineering choices.
