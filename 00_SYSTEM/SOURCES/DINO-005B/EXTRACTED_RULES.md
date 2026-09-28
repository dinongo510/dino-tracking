# DINO-005B — EXTRACTED RULES

> Step 03 — Source-grounded corrective rules  
> Status: INITIAL EXTRACTION REGISTERED  
> Implementation: NOT STARTED  
> Rule: No application logic may be implemented from an unverified or inferred rule.

---

## 0. Evidence Standard

Every rule below is traceable to an authorized source. The source text is preserved by citation in the working record; this repository document records the normalized rule without reproducing textbook prose.

Status meanings:

- **LOCKED-SOURCE** — explicitly supported by the cited source.
- **SOURCE-GAP** — required for the product but not yet sufficiently supported by the retrieved source material.
- **PRODUCT-RULE** — comes from BFS/DINO requirements rather than textbook evidence.
- **NEEDS-ADMIN-DECISION** — requires a product decision before becoming engine behavior.

Important: the textbook describes potential associations and corrective strategies. DINO must not turn these into a diagnosis engine.

---

# 1. Corrective Exercise Continuum — Core Rule

### Rule CEX-001

NASM defines corrective exercise as a systematic process of identifying a neuromusculoskeletal dysfunction, developing a plan, and implementing an integrated corrective strategy. The continuum is organized into four primary phases:

1. **Inhibit** — decrease activity/tension of overactive neuromyofascial tissue.
2. **Lengthen** — increase extensibility/length and ROM of relevant tissue.
3. **Activate** — increase/re-educate activation of underactive tissue using isolated strengthening and/or positional isometrics.
4. **Integrate** — use integrated dynamic movement to apply the changes to functional movement.

**Source:** S01, Section 1 / Corrective Exercise Continuum, around printed pp. 5–6; retrieved text explicitly describes the four phases. fileciteturn130file3

**Engine status:** LOCKED-SOURCE.

### Rule CEX-002

The continuum is not a diagnosis by itself. NASM frames corrective exercise around an integrated assessment process before corrective program design and implementation.

**Source:** S01, same continuum discussion. fileciteturn130file3

**Engine status:** LOCKED-SOURCE.

### Rule CEX-003

Integration exercise selection depends on assessment findings and the individual's physical capabilities. If the individual cannot perform the listed integrated dynamic exercise, NASM notes that regression to a more suitable exercise may be required.

**Source:** S01, foot/ankle and knee corrective strategy tables. fileciteturn130file1 fileciteturn130file2

**Engine status:** LOCKED-SOURCE.

---

# 2. Lower Crossed Syndrome / Anterior Pelvic Tilt

### Rule LCS-001

NASM describes **Lower Crossed Syndrome** as increased lumbar lordosis with an **anterior pelvic tilt**.

**Source:** S01, Chapter 5, Static Postural Assessment, Lower Crossed Syndrome. fileciteturn129file6

**Engine status:** LOCKED-SOURCE.

### Rule LCS-002 — Potentially tightened / overactive structures

The retrieved S01 text identifies the following as commonly tight in Lower Crossed Syndrome:

- Gastrocnemius
- Soleus
- Adductor complex
- Hip flexor complex: psoas, rectus femoris, tensor fasciae latae
- Latissimus dorsi
- Erector spinae

**Source:** S01, Chapter 5, Lower Crossed Syndrome. fileciteturn129file6

**Engine status:** LOCKED-SOURCE.

### Rule LCS-003 — Potentially weak / inhibited structures

The retrieved S01 text identifies the following as commonly weak/lengthened:

- Posterior tibialis
- Anterior tibialis
- Gluteus maximus
- Gluteus medius
- Transverse abdominis
- Internal oblique

**Source:** S01, Chapter 5, Lower Crossed Syndrome. fileciteturn129file6

**Engine status:** LOCKED-SOURCE.

### Rule LCS-004

The DINO engine may use **Anterior Pelvic Tilt** as a selectable product-facing label for this pattern, but the label must not be treated as a clinical diagnosis.

**Source basis:** S01 defines Lower Crossed Syndrome as characterized by anterior pelvic tilt; product implementation is DINO-specific.

**Engine status:** NEEDS-ADMIN-DECISION for exact UX terminology.

---

# 3. Upper Crossed Syndrome

### Rule UCS-001

NASM describes Upper Crossed Syndrome as rounded shoulders and forward head posture.

**Source:** S01, Chapter 5 / Chapter 15. fileciteturn129file1 fileciteturn129file8

**Engine status:** LOCKED-SOURCE.

### Rule UCS-002 — Functionally tightened structures

The retrieved S01 text identifies the following as functionally tightened in Upper Crossed Syndrome:

- Pectoralis major
- Pectoralis minor
- Subscapularis
- Latissimus dorsi
- Levator scapulae
- Upper trapezius
- Teres major
- Sternocleidomastoid
- Scalenes

**Source:** S01, Chapter 5, Upper Crossed Syndrome. fileciteturn129file1

**Engine status:** LOCKED-SOURCE.

### Rule UCS-003 — Functionally weakened / inhibited structures

The retrieved S01 text identifies:

- Rhomboids
- Lower trapezius
- Teres minor
- Infraspinatus
- Serratus anterior
- Deep cervical flexors

**Source:** S01, Chapter 5, Upper Crossed Syndrome. fileciteturn129file1

**Engine status:** LOCKED-SOURCE.

### Rule UCS-004 — Shoulder elevation compensation

For shoulder elevation, the S01 corrective strategy identifies thoracic spine, upper trapezius, and levator scapulae for inhibition; pectorals, upper trapezius, and levator scapulae for lengthening; middle/lower trapezius for activation; and a single-leg Romanian deadlift with PNF pattern as one possible integration exercise.

**Source:** S01, Chapter 15, shoulder impairment: shoulder elevation. fileciteturn130file4

**Engine status:** LOCKED-SOURCE.

### Rule UCS-005 — Forward-head compensation

For forward-head impairment, S01 identifies thoracic spine, sternocleidomastoid, levator scapulae, and upper trapezius for inhibition; sternocleidomastoid, levator scapulae, and upper trapezius for lengthening; deep cervical flexors, cervicothoracic extensors, and lower trapezius for activation; and integrated movements maintaining cervical retraction for integration.

**Source:** S01, Chapter 16, forward head corrective strategy. fileciteturn130file0

**Engine status:** LOCKED-SOURCE.

---

# 4. Pronation Distortion Syndrome / Knee Valgus Pattern

### Rule PDS-001

NASM describes Pronation Distortion Syndrome as excessive foot pronation associated with knee flexion, internal rotation, and adduction; the static posture section also describes flat feet with knee valgus involving tibial and femoral adduction/internal rotation.

**Source:** S01, Chapters 5 and 13. fileciteturn129file1 fileciteturn129file2

**Engine status:** LOCKED-SOURCE.

### Rule PDS-002 — Potentially tightened structures

S01 identifies the following as functionally tightened in Pronation Distortion Syndrome:

- Peroneals
- Gastrocnemius
- Soleus
- Iliotibial band
- Hamstrings
- Adductor complex
- Psoas / hip flexor complex as listed in the relevant table

**Source:** S01, Chapter 5, Pronation Distortion Syndrome. fileciteturn129file4

**Engine status:** LOCKED-SOURCE.

### Rule PDS-003 — Potentially weakened / inhibited structures

S01 identifies:

- Posterior tibialis
- Anterior tibialis
- Vastus medialis
- Gluteus medius
- Gluteus maximus
- Hip external rotators

**Source:** S01, Chapter 5, Pronation Distortion Syndrome. fileciteturn129file4

**Engine status:** LOCKED-SOURCE.

### Rule PDS-004 — Knee moves inward

For an inward knee compensation, S01 notes potential calf, TFL/IT-band, and adductor tightness with anterior/posterior tibialis and gluteus medius/maximus weakness. The source also describes using a heels-elevated overhead squat to help distinguish lower-leg versus hip contribution.

**Source:** S01, Chapter 13, knee impairments. fileciteturn129file2

**Engine status:** LOCKED-SOURCE.

### Rule PDS-005 — Corrective sequence example

For knee impairment, the sample continuum includes:

- **Inhibit:** gastrocnemius/soleus, adductors, TFL/IT band, short-head biceps femoris.
- **Lengthen:** gastrocnemius/soleus, adductors, TFL, biceps femoris.
- **Activate:** anterior/posterior tibialis, gluteus medius/maximus.
- **Integrate:** jumping progression or functional movement progression from ball squat → step-up → lunge → single-leg squat when appropriate.

**Source:** S01, Chapter 13 corrective strategy table. fileciteturn130file2

**Engine status:** LOCKED-SOURCE.

---

# 5. Foot & Ankle Corrective Sequence

### Rule F&A-001

For the sample foot/ankle impairment strategy, S01 provides:

- **Inhibit:** lateral gastrocnemius, peroneals, short-head biceps femoris.
- **Lengthen:** gastrocnemius/soleus, short-head biceps femoris, with static or neuromuscular stretching.
- **Activate:** posterior tibialis, anterior tibialis, medial hamstrings using positional isometrics and/or isolated strengthening.
- **Integrate:** step-up to balance and single-leg balance reach.

**Source:** S01, Chapter 12 corrective strategy table. fileciteturn130file1

**Engine status:** LOCKED-SOURCE.

### Rule F&A-002

S01 describes integration progressions from simpler/stabler movements toward more dynamic movements and from sagittal-plane work toward multiplanar work, with examples including single-leg balance reaches and step-up-to-balance progressions.

**Source:** S01, Chapter 12. fileciteturn130file5

**Engine status:** LOCKED-SOURCE.

---

# 6. Acute Variable Baseline — Do Not Treat as Universal Prescription

### Rule VAR-001

S01 sample tables provide acute variables such as approximately 30-second inhibition holds, 30-second lengthening holds, activation examples using 4 progressively increasing isometric intensities or 10–15 controlled repetitions, and integration examples at 10–15 controlled repetitions.

**Source:** S01 sample foot/ankle and knee tables. fileciteturn130file1 fileciteturn130file2

**Engine status:** LOCKED-SOURCE as **sample acute variables only**.

### Rule VAR-002

The application must NOT hard-code these sample variables as universal prescriptions for every user, deviation, workout type, or corrective exercise. Exercise selection is explicitly dependent on assessment findings and individual capability.

**Source:** S01 notes accompanying the corrective strategy tables. fileciteturn130file1 fileciteturn130file2

**Engine status:** LOCKED-SOURCE.

---

# 7. Product Requirements Already Explicitly Supported by BFS/DINO Source

### Rule UX-001

Opposing postural-deviation selections must be mutually exclusive at the UI/data-model level. The existing DINO requirement explicitly states radio-button behavior for opposing deviations and gives Anterior Pelvic Tilt vs Posterior Pelvic Tilt as the example.

**Source:** S05, Prehab & Corrective Logic requirements. fileciteturn128file0

**Engine status:** PRODUCT-RULE.

### Rule UX-002

The existing product specification requires a Prehab/Corrective workflow based on the NASM four-phase sequence and a workout-type selector.

**Source:** S05 and existing architecture documentation. fileciteturn128file0 fileciteturn128file2

**Engine status:** PRODUCT-RULE.

### Rule UX-003

The current product architecture describes a Prehab tab containing a postural-deviation selector, workout-type selector, four-step protocol generator, guided countdown timer, and 2-week muscle-frequency matrix.

**Source:** Existing DINO architecture documentation. fileciteturn128file2

**Engine status:** PRODUCT-RULE / existing architecture target.

---

# 8. Critical Rule: Mutually Exclusive Deviations Must Be Modeled Explicitly

The product requirement establishes the need for mutually exclusive opposing deviations, but the exact full taxonomy has not yet been extracted from the authorized sources.

Therefore:

- Anterior Pelvic Tilt ↔ Posterior Pelvic Tilt: **PRODUCT-RULE, mutually exclusive**.
- Any other opposing pair: **SOURCE-GAP until explicitly mapped**.
- Do not assume that every biomechanically opposite-looking label is mutually exclusive without defining the domain and evidence.

This is intentionally conservative so the engine does not silently invent incompatibility rules.

---

# 9. Workout-Type Dependency — Not Yet a Corrective Rule

The product intent requires different preparation/corrective outputs for different session types (for example upper, lower, running, circuit, and off-day). The current source extraction establishes that corrective exercise must be individualized and that integration depends on assessment findings and physical capability.

However, the exact DINO mapping:

`sessionType → warm-up profile → corrective volume → exercise selection → order`

has **not yet been established as a source-grounded rule**.

Status: **SOURCE-GAP / NEEDS-ADMIN-DECISION**.

Do not implement it yet.

---

# 10. Clinical / Safety Boundary

### Rule SAFE-001

The source material itself indicates that some assessment procedures are beyond the scope of a general fitness professional and may require a qualified licensed professional. DINO therefore must not present the Prehab Engine as diagnosing injury or disease.

**Source:** S01 cervical assessment discussion explicitly limits certain manual muscle testing to qualified licensed professionals. fileciteturn130file0

**Engine status:** LOCKED-SOURCE safety boundary.

### Rule SAFE-002

Where movement dysfunction persists or produces pain, the source recommends a more thorough clinical examination by an appropriate healthcare professional.

**Source:** S01 summary for shoulder/elbow/wrist corrective exercise. fileciteturn130file6

**Engine status:** LOCKED-SOURCE safety boundary.

---

# 11. Rules Deliberately NOT Locked Yet

The following are intentionally left open until deeper extraction/cross-source verification:

1. Complete DINO deviation taxonomy.
2. Complete opposing-deviation compatibility matrix.
3. Complete muscle-by-muscle corrective matrix for all deviations.
4. Complete exercise-level mapping for every corrective phase.
5. Upper/lower/running/circuit/off-day session profiles.
6. Warm-up duration and exact set/rep logic by session type.
7. Frequency rules for repeated corrective exposures.
8. 2-week muscle-frequency matrix generation logic.
9. Regression/progression rules across user capability levels.
10. Pain/red-flag routing rules.
11. How S02 performance preparation modifies S01 corrective selection.
12. How S03 load/fatigue principles modify corrective volume.
13. How S04 BFS hybrid scheduling modifies placement and volume.

These are **not missing because of a lack of effort**; they are deliberately uncommitted until the source material is extracted and compared.

---

# 12. STEP 03 STATUS

**INITIAL SOURCE EXTRACTION COMPLETE.**

Verified source-grounded foundations now include:

- CEX four-phase structure.
- Lower Crossed Syndrome / anterior pelvic tilt pattern.
- Upper Crossed Syndrome.
- Pronation Distortion Syndrome.
- Knee inward/outward corrective examples.
- Foot/ankle corrective examples.
- Cervical forward-head corrective example.
- Shoulder elevation corrective example.
- Sample acute variables.
- Assessment/individual-capability dependency.
- BFS requirement for mutually exclusive opposing deviations.
- Product architecture requirements.
- Clinical safety boundary.

**Next sub-step:** deepen extraction across S01 and then cross-check S02/S03/S04/S05 before creating the final DINO-005B rule matrix.

**Implementation remains NOT STARTED.**
