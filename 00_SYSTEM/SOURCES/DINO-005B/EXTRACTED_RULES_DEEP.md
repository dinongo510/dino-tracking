# DINO-005B — STEP 03B DEEP EXTRACTION & CROSS-SOURCE VERIFICATION

Status: SOURCE-GROUNDED EXTRACTION — NO APPLICATION IMPLEMENTATION

## 1. Source boundary

This document records rules supported by the attached source material. It deliberately separates source-derived rules from DINO/BFS product rules and from unresolved design questions. It does not diagnose users and does not infer a corrective intervention from a single visual observation without the assessment context described by the source.

## 2. Assessment-first architecture

NASM describes movement assessment as a way to observe human movement system impairments, including muscle imbalances and altered recruitment strategies. Transitional assessments occur without changing the base of support; dynamic assessments change the base of support. NASM also organizes observation around kinetic-chain checkpoints: foot/ankle, knee, lumbo-pelvic-hip complex, and shoulders/head-cervical spine. A compensation is a deviation from expected biomechanical motion and can be used to presume possible movement-system impairment. [Source: NASM CEX, search extraction]

Product implication: the engine should store an observed finding/compensation separately from any inferred muscle-state mapping and from the exercise prescription. A user-facing selector should not imply that a posture label is a medical diagnosis.

## 3. Overactive / underactive terminology

NASM explicitly notes that “overactive” and “underactive” describe activity relative to another muscle or muscle group, not necessarily the muscle's own normal functional capacity. A muscle can be underactive or weak even when shortened or lengthened because of altered length-tension relationships or reciprocal inhibition. [NASM CEX, Chapter 6]

Product implication: the data model should use the source terminology and avoid converting “overactive/underactive” into absolute pathology labels.

## 4. Corrective Exercise Continuum

The source repeatedly structures corrective strategies as:

1. Inhibit — self-myofascial release / pressure-based modality where specified.
2. Lengthen — static stretching and/or neuromuscular stretching where specified.
3. Activate — isolated strengthening and/or positional isometrics.
4. Integrate — integrated dynamic movement.

The source also states that if the client cannot initially perform the listed integrated dynamic movement, the movement may need to be regressed to a more suitable exercise. [NASM CEX, corrective strategy chapters]

Important: the exact muscle targets, exercise examples, and acute variables belong to each specific compensation rule; they must not be globally copied across all impairments.

## 5. LPHC / excessive forward lean

NASM's corrective strategy for excessive forward lean includes:

- Inhibit: gastrocnemius/soleus and hip-flexor complex (rectus femoris).
- Lengthen: gastrocnemius/soleus, hip-flexor complex, abdominal complex.
- Activate: anterior tibialis, gluteus maximus, erector spinae, intrinsic core stabilizers.
- Integrate: ball wall squat to overhead press; the source describes progression through step-up/overhead press, lunge/overhead press, and single-leg squat/overhead press.
- Acute variables shown: inhibit tender areas ~30 s; lengthen ~30 s or 7–10 s isometric contraction depending on modality; activate 4 increasing-intensity reps (25/50/75/100%) or 10–15 reps with 2-s isometric + 4-s eccentric; integrate 10–15 controlled reps.

The source states exercise selection depends on assessment findings and the individual's physical capabilities. [NASM CEX, Chapter 14]

## 6. LPHC / low-back arching

The source identifies low-back arching as a compensation observed in the overhead squat and begins its corrective strategy with inhibition of the hip-flexor complex (rectus femoris) and latissimus dorsi. The detailed continuation should be stored as a separate compensation rule rather than merged with excessive-forward-lean logic. [NASM CEX, Chapter 14]

## 7. Upper crossed / shoulder pattern

NASM describes upper crossed syndrome as rounded shoulders and forward head posture. The source lists functionally tightened muscles including pectoralis major/minor, subscapularis, latissimus dorsi, levator scapulae, upper trapezius, teres major, sternocleidomastoid and scalenes; functionally weakened/inhibited muscles include rhomboids, lower trapezius, teres minor, infraspinatus, serratus anterior and deep cervical flexors. [NASM CEX, Chapter 5]

For shoulder elevation, the specific corrective strategy includes:
- Inhibit: thoracic spine, upper trapezius, levator scapulae.
- Lengthen: pectorals, upper trapezius, levator scapulae.
- Activate: middle/lower trapezius (ball cobra).
- Integrate: single-leg Romanian deadlift with PNF pattern.
- Example acute variables: inhibit tender area ~30 s; lengthen 30-s holds; activate either 4 increasing-intensity reps or 10–15 reps with 2-s isometric / 4-s eccentric; integrate 10–15 controlled reps.

For scapular winging, the source specifies:
- Inhibit: latissimus dorsi and thoracic spine.
- Lengthen: latissimus dorsi and pectorals.
- Activate: serratus anterior and middle/lower trapezius.
- Integrate: standing one-arm cable chest press.

These are distinct compensation records and should not be collapsed into one generic “upper-body corrective” rule. [NASM CEX, Chapters 15]

## 8. Forward head / cervical pattern

For forward head, NASM specifies:
- Inhibit: thoracic spine, sternocleidomastoid, levator scapulae, upper trapezius.
- Lengthen: sternocleidomastoid, levator scapulae, upper trapezius.
- Activate: deep cervical flexors, cervical-thoracic extensors, lower trapezius.
- Integrate: ball combo with cervical retraction/scaption, with progression to dynamic lower-extremity movements while maintaining cervical retraction.

The source also emphasizes that maintaining proper cervical alignment/chin tuck during exercise is important for reducing cervical stress. [NASM CEX, Chapter 16]

## 9. Pronation distortion / knee-valgus pathway

NASM describes pronation distortion syndrome as excessive foot pronation/flat feet with knee flexion, internal rotation and adduction. During overhead squat assessment, inward knee movement represents a knee-valgus compensation; the source associates it with possible calf, TFL/IT-band and adductor tightness and weakness involving anterior/posterior tibialis and gluteus medius/maximus. It recommends a heels-elevated comparison to help determine whether the primary contribution is lower-leg or hip related. [NASM CEX, Chapter 13]

This is important for the engine: “knee moves inward” should not automatically map to one fixed corrective sequence. The assessment branch can change the target region.

## 10. Foot / ankle corrective pathway

NASM's foot/ankle corrective strategy includes:
- Inhibit: soleus, lateral gastrocnemius, peroneals, biceps femoris, and TFL as specified for the relevant compensation.
- Lengthen: gastrocnemius/soleus, biceps femoris, TFL; static or neuromuscular stretching may be used as specified.
- Activate: toe flexors/intrinsic foot muscles, medial gastrocnemius, medial hamstrings, anterior tibialis, posterior tibialis.
- Integrate: begin with uniplanar/transitional tasks such as single-leg balance reach, progressing toward step-up to balance and then more dynamic/multiplanar tasks such as lunge to balance or single-leg squat.
- Example acute variables shown: inhibition tender area ~30 s; lengthening 30-s hold or 7–10-s isometric contraction depending on modality; activation 4 increasing-intensity reps or 10–15 reps with 2-s isometric + 4-s eccentric; integration 10–15 controlled reps.

[NASM CEX, Chapter 12]

## 11. Assessment branches are first-class logic

The source demonstrates that the same visible compensation can have more than one plausible contributing region. Example: inward knee movement may originate from lower-leg and/or hip dysfunction; the heels-elevated comparison is used to distinguish the likely target area. Therefore the engine must represent conditional branches rather than a flat lookup table of “problem -> exercise list.” [NASM CEX, Chapter 13]

## 12. Exercise regression is part of the engine

The source repeatedly states that an integrated movement may need to be regressed when the client cannot initially perform it. Therefore an exercise record needs at minimum a progression/regression relationship or an explicit capability gate for the integration stage.

## 13. Acute variables are rule-specific

The source provides acute-variable examples such as ~30-s inhibition holds, 30-s static stretching, 7–10-s isometric contractions for neuromuscular stretching, 4 increasing-intensity activation reps (25/50/75/100%) or 10–15 activation reps with specified tempo, and 10–15 controlled integration reps. These values are examples attached to specific corrective strategies; they should not become universal defaults for every condition.

## 14. Product-specific constraints already established by DINO/BFS

- Pelvic anterior tilt and posterior tilt are mutually exclusive selections in the same assessment state. The UI/data model must prevent contradictory simultaneous selection rather than merely warning after the fact.
- Workout/session context matters: the intended product behavior is to vary warm-up/corrective output by session type (for example upper, lower, running, circuit, off-day). This is a DINO product requirement, not a claim that the NASM source itself defines those exact session categories.
- The existing DINO app already has a Prehab tab concept with deviation selection, workout-type selection, a 4-step continuum, timer, and frequency matrix; implementation must preserve existing architecture and avoid prematurely changing protected AI/business modules. [Project architecture audit]

## 15. Cross-source verification status

Verified against the current attached NASM CEX source and the existing BFS hybrid program document that the product needs to account for mixed running, resistance training, hybrid conditioning and soccer exposures. The BFS program explicitly separates running, resistance, hybrid conditioning and soccer across the 2-week rotation. [BFS Hybrid Athlete 2-Week Rotation]

The NSCA and NASM Sports Performance sources still require targeted extraction before they are used to define sport-specific warm-up or session-type rules. No sport-specific rule is declared source-authoritative here yet.

## 16. Explicit unresolved items — DO NOT IMPLEMENT YET

1. Full list of mutually exclusive and conditionally compatible deviation states.
2. Complete compensation -> overactive/underactive -> corrective mapping for all supported regions.
3. Session-type matrix: Off-day / Upper / Lower / Push / Pull / Running / Circuit / Hybrid / Sport-specific.
4. Rules for how much corrective volume is permitted before a primary workout, especially on running and lower-body days.
5. Progression/regression graph for each integration exercise.
6. Safety/red-flag gate and when to stop generation or recommend qualified clinical evaluation.
7. Source-verified exercise taxonomy linking DINO exerciseId values to corrective roles.
8. Full 2-week frequency matrix rules.

These items remain open until the relevant source sections are extracted and reconciled.

## 17. Implementation gate

NO application code is authorized by this extraction document. The next step is source-specific extraction of the NSCA Strength & Conditioning, NASM Sports Performance, and BFS program materials for session-context and loading rules, followed by a formal SOURCE MAP / RULE MATRIX review before engine implementation.
