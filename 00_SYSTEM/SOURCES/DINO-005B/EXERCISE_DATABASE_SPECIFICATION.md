# DINO-005B — EXERCISE DATABASE SPECIFICATION

> **Change Set:** DINO-005B — Prehab / Corrective Engine
> **Step:** STEP 06 — EXERCISE DATABASE SPECIFICATION
> **Date:** 2026-09-29
> **Status:** SPECIFICATION COMPLETE / FULL CATALOG REGISTERED
> **Authority:** DINO (Project Owner) & ChatGPT (Product Architect)
> **Implementer:** Antigravity (Implementation Agent)

---

## 1. Specification Governance & Compatibility Charter

1. **NO APPLICATION IMPLEMENTATION:** Zero application runtime code (`js/`, `css/`, `index.html`, `sw.js`, `package.json`, `vercel.json`) is modified. This is a pure specification artifact.
2. **DINO-005A EXERCISE IDENTITY COMPATIBILITY:** Every record adheres strictly to the canonical exercise identity schema established in DINO-005A (`exerciseId`, `name`, `nameEn`, `category`, `movementPattern`, `trainingType`, `equipment`, `primaryMuscles`, `secondaryMuscles`, `formCues`, `commonErrors`, `cautions`), expanded with DINO-005B corrective dimensions (`phase`, `addressedImpairments`, `regression`, `progression`, `defaultDosing`, `compatibleWorkoutContexts`, `sourceProvenance`, `provenanceClassification`).
3. **TAXONOMY & SCIENTIFIC CITATION DISCIPLINE:**
   - Terminology strictly preserves the 4-phase NASM Corrective Exercise Continuum: **Phase 1: Inhibit**, **Phase 2: Lengthen**, **Phase 3: Activate**, **Phase 4: Integrate**.
   - Biomechanical muscle actions, overactive/underactive pairings, kinetic chain checkpoints, and cueing references are cited directly from `SOURCE-01` (NASM CEx), `SOURCE-02` (NASM PES), and `SOURCE-03` (NSCA 4th Ed).
   - If a source does not specify a field (e.g. secondary muscles or specific regression), it is explicitly marked **NOT SPECIFIED**.
   - DINO operational parameters (Vietnamese display names, 1-set Mode A vs. 2–3 set Mode B dosing, exact seconds/reps pinning) are explicitly classified as `[DINO DESIGN DECISION]`.
4. **INTEGRITY VERIFICATION:**
   - Total exercises specified: exactly **37 exercises** (10 Inhibit, 9 Lengthen, 10 Activate, 8 Integrate).
   - Every exercise utilized in [`PREHAB_RULE_MATRIX.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/PREHAB_RULE_MATRIX.md) is 100% present and verified.
   - Zero contradictory phase or workout context assignments.

---

## 2. Canonical Exercise Schema Definition

```typescript
interface CorrectiveExerciseRecord {
  exerciseId: string;                     // Unique kebab-case ID, e.g. "cex-inh-01"
  name: string;                           // Vietnamese display name
  nameEn: string;                         // Standard English anatomical name
  phase: "inhibit" | "lengthen" | "activate" | "integrate";
  category: "Corrective";                 // DINO-005A taxonomy compatibility
  trainingType: "CORRECTIVE" | "MOBILITY";
  movementPattern: "MOBILITY" | "ISOLATION" | "SQUAT" | "HINGE" | "LUNGE" | "PUSH" | "PULL" | "CARRY" | "ROTATION" | "LOCOMOTION" | "CORE";
  kineticChainCheckpoint: "foot_ankle" | "knee" | "lphc" | "shoulder" | "cervical_spine";
  addressedImpairments: string[];         // Impairment IDs matching RULE-OAU rules
  primaryMuscles: string[];               // Primary target anatomical muscles
  secondaryMuscles: string[];             // Synergists / stabilizers or ["NOT SPECIFIED"]
  equipment: string[];                    // Minimal gear: Bodyweight, Foam Roller, Lacrosse Ball, Mini-Band, Dumbbell, Mat, Wall
  formCues: [string, string, string];     // Exactly 3 actionable execution cues
  commonErrors: string[];                 // 2-3 specific compensation errors to avoid
  cautions: string;                       // Contraindications & safety red flags
  regression: string;                     // Less demanding regression variant
  progression: string;                    // Higher demand progression variant
  dosing: {
    preWorkout: {
      sets: number;                       // Standard Mode A: 1 set
      workParameter: string;              // e.g. "30–45s", "20–25s", "10–12 reps"
      tempo: string;                      // e.g. "Sustained pressure", "Static", "4/2/1", "Controlled"
      holdSeconds: number | null;         // Isometric hold duration
      fatigueIntent: "ZERO FATIGUE";      // Cardinal law under RULE-FTG-01
    };
    offDay: {
      sets: number;                       // Standard Mode B: 2–3 sets
      workParameter: string;              // e.g. "60s", "30–45s", "12–15 reps"
      tempo: string;
      holdSeconds: number | null;
      fatigueIntent: "TISSUE RESTORATION";
    };
  };
  compatibleWorkoutContexts: Array<"lower" | "upper" | "full_body" | "quality_run" | "easy_run" | "soccer" | "offday">;
  sourceProvenance: {
    sourceId: "SOURCE-01" | "SOURCE-02" | "SOURCE-03" | "SOURCE-04";
    citation: string;
  };
  provenanceClassification: {
    physiologicalFacts: "SOURCE-VERIFIED";
    operationalParameters: "DINO DESIGN DECISION";
  };
}
```

---

## 3. Complete 37-Exercise Database Catalog

### PHASE 1: INHIBIT TECHNIQUES (SELF-MYOFASCIAL RELEASE — SMR)

---

#### 01. `cex-inh-01` — SMR Calves (Gastrocnemius/Soleus)
- **English Name:** SMR Calves (Gastrocnemius/Soleus)
- **Vietnamese Display Name:** Lăn Bắp Chân (Calves)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `foot_ankle`
- **Addressed Impairments:** `imp-lphc-lean`, `imp-foot-turnout`, `imp-foot-flatten`, `imp-run-quality`
- **Primary Muscles:** Gastrocnemius (medial and lateral heads), Soleus
- **Secondary Muscles:** Plantaris, Achilles tendon insertion zone
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Đặt bắp chân lên ống lăn, chống hai tay nâng nhẹ hông khỏi sàn để dồn trọng lượng cơ thể lên bắp chân.
  2. Lăn chậm rãi 2–3 cm mỗi giây dọc từ gân gót lên sát khoeo chân để định vị điểm co thắt căng nhức nhất (trigger point).
  3. Dừng lại tĩnh trên điểm đau nhức nhất 30–60 giây, giữ cổ chân trung tính và hít thở sâu, chậm rãi để kích hoạt ức chế tự sinh (autogenic inhibition).
- **Common Errors:** Lăn qua lại quá nhanh liên tục; thả lỏng buông thõng cổ chân; gồng cứng người và nín thở.
- **Cautions:** Không tì đè trực tiếp lên gân gót Achilles hoặc hố khoeo chân sau gối. Dừng lại ngay nếu xuất hiện cảm giác tê buốt dây thần kinh chày.
- **Regression:** Đặt cả hai chân cùng lúc lên ống lăn hoặc chạm nhẹ hông xuống sàn để giảm 50% áp lực.
- **Progression:** Vắt một chân qua chân kia để tăng 100% tải trọng; kết hợp chủ động gập/duỗi cổ chân (active flossing) khi đè điểm căng.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 144
- **Provenance Classification:** Anatomy, trigger point mechanism, SMR cues: `[SOURCE-VERIFIED]`. Vietnamese name & Mode A/B split: `[DINO DESIGN DECISION]`.

---

#### 02. `cex-inh-02` — SMR Peroneals
- **English Name:** SMR Peroneals
- **Vietnamese Display Name:** Lăn Nhóm Cơ Mác (Peroneals)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `foot_ankle`
- **Addressed Impairments:** `imp-foot-turnout`, `imp-knee-valgus`
- **Primary Muscles:** Peroneus longus, Peroneus brevis, Peroneus tertius
- **Secondary Muscles:** NOT SPECIFIED
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Nằm nghiêng một bên, đặt má ngoài cẳng chân lên ống lăn ở khoảng giữa mắt cá ngoài và chỏm xương mác.
  2. Dùng hai cẳng tay và bàn chân đối diện chống sàn điều tiết mức độ tì đè.
  3. Lăn chậm tìm điểm co cứng dọc dải má ngoài cẳng chân và giữ yên tĩnh áp lực trong 30–60 giây.
- **Common Errors:** Lăn đè trực tiếp lên mắt cá ngoài hoặc chỏm xương mác; xoay người ngửa ra sau làm lệch hướng sang bắp chân.
- **Cautions:** Tránh chèn ép mạnh vào vị trí ngay dưới chỏm xương mác nơi dây thần kinh mác chung đi nông (nguy cơ tê bì mu bàn chân).
- **Regression:** Chống bàn chân đối diện phía trước chịu 60% trọng lượng; sử dụng ống lăn bọt biển mềm.
- **Progression:** Nhấc chân đối diện rời sàn; chủ động xoay cổ chân vào trong (inversion) trong khi giữ điểm đau.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 145
- **Provenance Classification:** Peroneal anatomy & inhibition: `[SOURCE-VERIFIED]`. DINO operational dosage: `[DINO DESIGN DECISION]`.

---

#### 03. `cex-inh-03` — SMR Adductors
- **English Name:** SMR Adductors
- **Vietnamese Display Name:** Lăn Cơ Đùi Trong (Adductors)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `knee` / `lphc`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-lphc-ppt`, `imp-field-soccer`
- **Primary Muscles:** Adductor longus, Adductor brevis, Adductor magnus, Gracilis
- **Secondary Muscles:** Pectineus
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Nằm sấp tựa trên hai cẳng tay, dang một bên đùi sang ngang và gập gối 90 độ, đặt đùi trong vuông góc lên ống lăn.
  2. Hạ thấp hông cho cơ đùi trong tiếp xúc với ống lăn từ phía trên gối vào sát vùng bẹn.
  3. Lăn chậm định vị điểm căng nhức nhất và giữ yên tĩnh áp lực từ 30–60 giây kết hợp thả lỏng cơ khép.
- **Common Errors:** Lăn quá nhanh; võng thắt lưng do không gồng cơ lõi; đặt ống lăn quá sát xương chậu gây chèn ép mạch máu.
- **Cautions:** Tránh tì đè trực tiếp lên tam giác đùi (femoral triangle) sát nếp bẹn nơi có động mạch và tĩnh mạch đùi lớn.
- **Regression:** Giữ thân mình nằm sát sàn để giảm áp lực tì trọng lượng lên ống lăn.
- **Progression:** Từ từ duỗi và gập khớp gối (knee flossing) trong khi duy trì áp lực trên điểm căng cơ đùi trong.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 147
- **Provenance Classification:** Adductor kinetic mapping: `[SOURCE-VERIFIED]`. DINO dosage & soccer bias: `[DINO DESIGN DECISION]`.

---

#### 04. `cex-inh-04` — SMR Tensor Fascia Latae & IT Band
- **English Name:** SMR Tensor Fascia Latae & IT Band
- **Vietnamese Display Name:** Lăn Dải Chậu Chày & Cơ Căng Mạc Đùi (TFL/ITB)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `knee` / `lphc`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-knee-varus`, `imp-lphc-apt`, `imp-foot-turnout`
- **Primary Muscles:** Tensor fasciae latae (TFL), Vastus lateralis
- **Secondary Muscles:** Gluteus medius (anterior fibers), Iliotibial tract
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Nằm nghiêng một bên, đặt ống lăn ngay dưới mào chậu ở mặt trước ngoài khớp háng (vị trí bụng cơ TFL).
  2. Bắt chéo chân trên ra phía trước đặt bàn chân trên sàn để đỡ và điều chỉnh trọng lượng cơ thể.
  3. Lăn đoạn ngắn 5–10 cm tìm điểm trigger point của bụng cơ TFL và dải chậu chày ngoài, giữ yên tĩnh 30–60 giây.
- **Common Errors:** Lăn đè trực tiếp lên mấu chuyển lớn xương đùi (greater trochanter); lăn dọc dải gân ITB vô cảm giác mà bỏ qua bụng cơ TFL.
- **Cautions:** Tuyệt đối không lăn đè lên lồi cầu ngoài khớp gối hoặc mấu chuyển lớn (nguy cơ viêm bao hoạt dịch trochanteric).
- **Regression:** Chống hai tay và chân trước chịu 70% trọng lượng cơ thể.
- **Progression:** Duỗi thẳng hai chân chồng lên nhau tăng tối đa áp lực; hơi xoay úp thân người về trước 15 độ.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 146
- **Provenance Classification:** TFL overactivity anatomy: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 05. `cex-inh-05` — SMR Quadriceps & Rectus Femoris
- **English Name:** SMR Quadriceps & Rectus Femoris
- **Vietnamese Display Name:** Lăn Cơ Gập Hông / Cơ Đùi Trước (Hip Flexors/Quads)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `lphc`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-lphc-lean`, `imp-run-quality`, `default_general`
- **Primary Muscles:** Rectus femoris, Vastus lateralis, Vastus intermedius, Vastus medialis, Iliopsoas (indirectly via anterior hip)
- **Secondary Muscles:** Sartorius
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Nằm sấp ở tư thế plank cẳng tay, đặt mặt trước đùi lên ống lăn ngay dưới gai chậu trước trên (ASIS).
  2. Lăn chậm dọc mặt trước đùi từ hông xuống phía trên xương bánh chè để rà soát toàn bộ dải cơ tứ đầu.
  3. Giữ yên tĩnh 30–60 giây tại điểm căng nhức nhất ở giữa mặt trước đùi (bụng cơ Rectus femoris), thở đều đặn.
- **Common Errors:** Võng thắt lưng do thả lỏng bụng; lăn tì trực tiếp lên xương bánh chè khớp gối; nín thở.
- **Cautions:** Duy trì cơ bụng siết nhẹ giữ cột sống thắt lưng trung tính, không để cong võng thắt lưng gây kích ứng khớp gai cột sống.
- **Regression:** Đặt cả hai đùi lên ống lăn cùng lúc hoặc gác chân không lăn xuống sàn làm trụ chịu tải.
- **Progression:** Nhấc chân đối diện hoàn toàn khỏi sàn; chủ động gập khớp gối chân đang lăn 90 độ (active flossing) để kéo căng dải cơ khi đè.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 148
- **Provenance Classification:** Rectus femoris APT mechanism: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 06. `cex-inh-06` — SMR Hamstrings (Biceps Femoris)
- **English Name:** SMR Hamstrings (Biceps Femoris)
- **Vietnamese Display Name:** Lăn Cơ Đùi Sau (Hamstrings)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `lphc` / `knee`
- **Addressed Impairments:** `imp-lphc-ppt`, `imp-foot-turnout`
- **Primary Muscles:** Biceps femoris (long and short heads), Semitendinosus, Semimembranosus
- **Secondary Muscles:** NOT SPECIFIED
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Ngồi trên sàn, đặt mặt sau đùi lên ống lăn ở vị trí phía dưới ụ ngồi xương chậu.
  2. Chống hai tay phía sau nâng nhẹ hông, hơi xoay cẳng chân ra ngoài để hướng áp lực vào dải cơ nhị đầu đùi ngoài (Biceps femoris).
  3. Lăn chậm từ gốc mông xuống phía trên khoeo gối, dừng lại và giữ tĩnh 30–60 giây trên điểm co cứng.
- **Common Errors:** Lăn đè sâu vào hố khoeo sau gối; gù sụp vai và rụt cổ khi chống tay.
- **Cautions:** Tránh ấn sâu vào hố khoeo sau gối (popliteal fossa) nơi có động mạch, tĩnh mạch khoeo và dây thần kinh chày đi nông.
- **Regression:** Đặt cả hai chân lên ống lăn cùng lúc hoặc chạm nhẹ hông xuống sàn trợ lực.
- **Progression:** Vắt một chân qua chân kia tăng áp lực; kết hợp chủ động duỗi thẳng gối khi đè điểm co cứng.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 146
- **Provenance Classification:** Hamstring overactivity in PPT: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 07. `cex-inh-07` — SMR Piriformis & Gluteal Complex
- **English Name:** SMR Piriformis & Gluteal Complex
- **Vietnamese Display Name:** Lăn Cơ Mông Sâu / Hình Lê (Piriformis/Glutes)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `lphc`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-knee-valgus`, `imp-foot-turnout`
- **Primary Muscles:** Piriformis, Gemelli, Obturator internus, Gluteus medius (posterior fibers)
- **Secondary Muscles:** Gluteus maximus
- **Equipment:** `Lacrosse Ball` / `Foam Roller`
- **Form Cues:**
  1. Ngồi lên ống lăn hoặc bóng massage, vắt mắt cá chân bên cần lăn lên đầu gối chân đối diện (tư thế hình số 4).
  2. Nghiêng người dồn trọng lượng sang bên mông của chân đang vắt.
  3. Lăn chậm vùng sâu giữa mào chậu sau và mấu chuyển lớn, định vị điểm co thắt cơ hình lê và giữ tĩnh 30–60 giây.
- **Common Errors:** Lăn lệch đè lên xương cùng hoặc xương cụt; gồng cứng cơ mông kháng cự lại bóng.
- **Cautions:** Nếu xuất hiện cảm giác tê buốt giật điện chạy dọc mặt sau đùi (kích thích dây thần kinh tọa - sciatica), dịch chuyển bóng khỏi vị trí đó ngay lập tức.
- **Regression:** Sử dụng ống lăn bọt biển phẳng thay cho bóng Lacrosse mật độ cao.
- **Progression:** Sử dụng bóng Lacrosse cứng và hạ thấp đầu gối chân vắt để bộc lộ sâu hơn các cơ xoay ngoài khớp háng.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per side | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 60s per side | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 149
- **Provenance Classification:** Piriformis anatomy & Sciatic nerve caution: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 08. `cex-inh-08` — SMR Latissimus Dorsi
- **English Name:** SMR Latissimus Dorsi
- **Vietnamese Display Name:** Lăn Cơ Lưng Rộng (Latissimus Dorsi)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `shoulder` / `lphc`
- **Addressed Impairments:** `imp-shldr-fall`, `imp-shldr-round`, `imp-lphc-apt`, `default_general`
- **Primary Muscles:** Latissimus dorsi, Teres major
- **Secondary Muscles:** Subscapularis, Triceps brachii (long head)
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Nằm nghiêng một bên, duỗi thẳng cánh tay dưới qua đầu với lòng bàn tay ngửa lên trên.
  2. Đặt ống lăn ở nách sau, ngay dưới bờ nách trên dải cơ xô.
  3. Hơi ngửa nhẹ thân trên ra sau 10–15 độ, lăn chậm tìm điểm căng nhức và giữ yên tĩnh áp lực 30–60 giây.
- **Common Errors:** Ngửa người quá nhiều đè lên xương bả vai; gồng cơ cổ; lăn quá thấp đè lên xương sườn tự do.
- **Cautions:** Tuyệt đối tránh đè lên vùng xương sườn dưới (floating ribs) hoặc tì trực tiếp lên khớp ổ chảo cánh tay.
- **Regression:** Chống bàn chân trên phía trước để chia sẻ bớt trọng lượng cơ thể.
- **Progression:** Hơi xoay nhẹ cánh tay (internal/external rotation) trong khi duy trì điểm đè; thở sâu mở rộng lồng ngực.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per side | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 60s per side | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 150
- **Provenance Classification:** Latissimus shoulder/LPHC link: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 09. `cex-inh-09` — SMR Thoracic Spine Extension
- **English Name:** SMR Thoracic Spine Extension
- **Vietnamese Display Name:** Lăn Mở Cột Sống Ngực (Thoracic Spine Extension)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `shoulder`
- **Addressed Impairments:** `imp-shldr-fall`, `imp-shldr-round`, `imp-neck-fwd`
- **Primary Muscles:** Thoracic erector spinae, Rhomboids, Middle trapezius
- **Secondary Muscles:** Intercostals
- **Equipment:** `Foam Roller`
- **Form Cues:**
  1. Nằm ngửa, đặt ống lăn ngang qua vùng lưng giữa (ngang ngực/dưới mỏm xương bả vai).
  2. Đan hai bàn tay đỡ sau gáy bảo vệ cổ, co hai gối đặt bàn chân phẳng trên sàn.
  3. Hít sâu và từ từ ngửa phần lưng trên qua ống lăn (duỗi ngực), giữ 20–30 giây mỗi phân đoạn đốt sống ngực (T12 đến T1).
- **Common Errors:** Võng gãy vùng thắt lưng (lumbar hyperextension) thay vì duỗi ngực; dùng tay giật bẻ gập cổ; lăn xuống vùng thắt lưng.
- **Cautions:** Tuyệt đối không lăn hoặc ngửa lên cột sống thắt lưng (L1–L5) không có khung xương sườn hỗ trợ chống lực cắt.
- **Regression:** Kê gối hoặc đệm mỏng dưới đầu; ngửa ngực ở biên độ ngắn vừa phải.
- **Progression:** Vươn thẳng hai tay qua đầu thành hình chữ Y khi ngửa người qua ống lăn để tăng đòn bẩy duỗi ngực.
- **Pre-Workout Dosage (Mode A):** 1 set × 45s (3–4 phân đoạn ngực) | Tempo: Sustained Extension | Hold: 15–20s per segment | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 60s | Tempo: Sustained Extension | Hold: 30s per segment | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 151
- **Provenance Classification:** Thoracic extension biomechanics & lumbar prohibition: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 10. `cex-inh-10` — SMR Upper Trapezius & Levator Scapulae
- **English Name:** SMR Upper Trapezius & Levator Scapulae
- **Vietnamese Display Name:** Giải Tỏa Cơ Thang Trên (Upper Trapezius/Levator)
- **Phase:** `inhibit`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `cervical_spine` / `shoulder`
- **Addressed Impairments:** `imp-shldr-elev`, `imp-neck-fwd`
- **Primary Muscles:** Upper trapezius, Levator scapulae
- **Secondary Muscles:** Sternocleidomastoid, Splenius capitis
- **Equipment:** `Lacrosse Ball` (hoặc góc tường / cột rig)
- **Form Cues:**
  1. Đứng tựa bóng massage vào góc tường hoặc cột rig, kẹp bóng giữa bờ trên xương bả vai và chân cổ.
  2. Hơi nghiêng người về phía bóng tạo lực tì nén ép có kiểm soát.
  3. Giữ yên tĩnh 30–60 giây tại điểm co cứng, có thể nghiêng nhẹ đầu sang bên đối diện để tăng độ kéo giãn giải tỏa.
- **Common Errors:** Đè bóng trực tiếp lên các gai đốt sống cổ (C-spine) hoặc mỏm cùng vai; nhún vai gồng cứng cổ chống lại bóng.
- **Cautions:** Tránh tì đè vào vùng trước cổ hoặc tam giác cổ nơi có động mạch cảnh; dừng lại ngay nếu thấy hoa mắt hoặc tê tay.
- **Regression:** Giảm bớt lực tựa người vào tường; sử dụng bóng tennis có độ mềm êm hơn.
- **Progression:** Vòng cánh tay cùng bên ra sau lưng hoặc cử động cánh tay chậm rãi lên xuống trong khi đè bóng.
- **Pre-Workout Dosage (Mode A):** 1 set × 30–45s per side | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 60s per side | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 152
- **Provenance Classification:** Cervical trigger point anatomy: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

### PHASE 2: LENGTHEN TECHNIQUES (STATIC STRETCHING)

---

#### 11. `cex-len-01` — Static Gastrocnemius Stretch
- **English Name:** Static Gastrocnemius Stretch
- **Vietnamese Display Name:** Giãn Bắp Chân Tĩnh (Static Calf Stretch)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `foot_ankle`
- **Addressed Impairments:** `imp-lphc-lean`, `imp-foot-turnout`, `imp-foot-flatten`
- **Primary Muscles:** Gastrocnemius (medial and lateral heads)
- **Secondary Muscles:** Soleus, Achilles tendon
- **Equipment:** `Wall` / `Mat`
- **Form Cues:**
  1. Đứng chống hai tay vào tường, bước một chân lùi ra phía sau tạo thế chân trước chân sau.
  2. Giữ khớp gối chân sau duỗi thẳng tuyệt đối, ngón chân sau hướng thẳng về phía trước (không xoay ra ngoài).
  3. Ấn gót chân sau bám chặt xuống sàn và từ từ đẩy hông tới trước cho đến khi thấy căng bắp chân sau, giữ yên tĩnh 20–30 giây.
- **Common Errors:** Bàn chân sau bị xoay xòe ra ngoài (feet turn out); nhấc gót chân sau khỏi sàn; chùng gập khớp gối chân sau.
- **Cautions:** Tuyệt đối không nhấp nhún nảy (ballistic bouncing). Giữ căng tĩnh êm ái dưới ngưỡng đau.
- **Regression:** Thu ngắn khoảng cách bước chân sau để giảm góc gập cổ chân.
- **Progression:** Kê mũi bàn chân trước lên gờ dốc hoặc đĩa tạ để tăng độ gập cổ chân (dorsiflexion).
- **Pre-Workout Dosage (Mode A):** 1 set × 20–30s per leg | Tempo: Static Hold | Hold: 20–30s ($\le 30$s cap under NSCA Ch. 14) | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 30–45s per leg | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM CEx Ch. 9, p. 166 & `SOURCE-03`: NSCA 4th Ed. Ch. 14 (pre-lifting static stretch cap $\le 30$s)
- **Provenance Classification:** NASM stretch mechanics & NSCA $\le 30$s duration rule: `[SOURCE-VERIFIED]`. Mode A/B split: `[DINO DESIGN DECISION]`.

---

#### 12. `cex-len-02` — Static Soleus Stretch
- **English Name:** Static Soleus Stretch
- **Vietnamese Display Name:** Giãn Cơ Dép Gối Gập (Static Soleus Stretch)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `foot_ankle`
- **Addressed Impairments:** `imp-foot-turnout`, `imp-lphc-lean`, `imp-foot-flatten`
- **Primary Muscles:** Soleus
- **Secondary Muscles:** Posterior tibialis, Flexor hallucis longus
- **Equipment:** `Wall` / `Mat`
- **Form Cues:**
  1. Đứng chống hai tay vào tường tương tự bài bắp chân, nhưng thu ngắn khoảng cách bước chân sau lại.
  2. Giữ gót chân sau bám chặt sàn và chủ động chùng gập khớp gối chân sau khoảng 20–30 độ.
  3. Dồn trọng lượng cơ thể hạ thấp hông xuống cho đến khi cảm thấy căng sâu ở phần thấp của bắp chân ngay trên gót, giữ tĩnh 20–30 giây.
- **Common Errors:** Nhấc gót chân sau khỏi sàn; xoay bàn chân sau ra ngoài; duỗi thẳng khớp gối chân sau (chuyển sang cơ bụng chân).
- **Cautions:** Không dồn lực nhấp nảy gây kích ứng gân gót Achilles.
- **Regression:** Đứng trên mặt sàn phẳng không kê gờ, hạ hông nông hơn.
- **Progression:** Đặt mũi bàn chân lên góc tường hoặc bục dốc trong khi vẫn duy trì gập khớp gối.
- **Pre-Workout Dosage (Mode A):** 1 set × 20–30s per leg | Tempo: Static Hold | Hold: 20–30s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 30–45s per leg | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 167
- **Provenance Classification:** Soleus knee flexion mechanics: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 13. `cex-len-03` — Static Standing Adductor Stretch
- **English Name:** Static Standing Adductor Stretch
- **Vietnamese Display Name:** Giãn Đùi Trong Tĩnh (Static Standing Adductor)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `knee` / `lphc`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-field-soccer`
- **Primary Muscles:** Adductor longus, Adductor brevis, Adductor magnus, Gracilis
- **Secondary Muscles:** Pectineus
- **Equipment:** `Bodyweight`
- **Form Cues:**
  1. Đứng hai chân mở rộng gấp đôi vai, hai bàn chân song song hướng thẳng về phía trước.
  2. Chùng gối một bên, đẩy hông sang bên và lùi nhẹ ra sau như tư thế ngồi xổm một bên.
  3. Giữ chân đối diện duỗi thẳng hoàn toàn với bàn chân bám phẳng sàn, cảm nhận căng dải cơ đùi trong trong 20–30 giây.
- **Common Errors:** Nhấc cạnh trong bàn chân của chân duỗi khỏi sàn; gù lưng gập người quá mức; gối chân gập bị sụp vào trong thay vì mở theo mũi chân.
- **Cautions:** Khớp gối chân duỗi phải được giữ thẳng tự nhiên, không khóa khớp giật cục; dừng lại nếu thấy đau buốt gân khép ở háng.
- **Regression:** Chống hai tay lên đùi trước hoặc ghế bục phía trước để đỡ bớt trọng lượng cơ thể.
- **Progression:** Hạ hông sâu hơn (tư thế Cossack stretch tĩnh) hoặc xoay ngón chân chân duỗi hướng lên trần nhà.
- **Pre-Workout Dosage (Mode A):** 1 set × 20–30s per side | Tempo: Static Hold | Hold: 20–30s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 169
- **Provenance Classification:** Adductor lengthening anatomy: `[SOURCE-VERIFIED]`. DINO operational dosage: `[DINO DESIGN DECISION]`.

---

#### 14. `cex-len-04` — Static Standing TFL Stretch
- **English Name:** Static Standing TFL Stretch
- **Vietnamese Display Name:** Giãn Cơ Căng Mạc Đùi (Static TFL Stretch)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `knee` / `lphc`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-knee-varus`, `imp-lphc-apt`, `imp-foot-turnout`
- **Primary Muscles:** Tensor fasciae latae (TFL)
- **Secondary Muscles:** Gluteus medius (anterior fibers), Iliotibial tract
- **Equipment:** `Wall` / `Mat`
- **Form Cues:**
  1. Đứng nghiêng người một bên cạnh tường, bắt chéo chân cần giãn ra phía sau chân trước.
  2. Đẩy khung chậu của chân sau dịch sang phía ngoài (hướng ra xa tường).
  3. Vươn cánh tay cùng bên chân sau lên cao qua đầu và nghiêng lườn sang phía tường, giữ yên tĩnh 20–30 giây.
- **Common Errors:** Xoay vặn khung chậu về trước/sau làm mất hướng căng của cơ TFL; gập người về phía trước thay vì nghiêng lườn bên.
- **Cautions:** Không dồn lực bẻ vẹo cột sống thắt lưng; duy trì cơ bụng gồng nhẹ để bảo vệ lưng dưới.
- **Regression:** Đứng tựa sát lưng vào tường để duy trì thăng bằng vững chắc.
- **Progression:** Tăng góc đẩy hông sang bên và hơi xoay nhẹ thân người ra sau để mở tối đa vùng mào chậu trước ngoài.
- **Pre-Workout Dosage (Mode A):** 1 set × 20–30s per side | Tempo: Static Hold | Hold: 20–30s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 168
- **Provenance Classification:** TFL stretch biomechanics: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 15. `cex-len-05` — Static Kneeling Hip Flexor Stretch
- **English Name:** Static Kneeling Hip Flexor Stretch
- **Vietnamese Display Name:** Giãn Cơ Gập Hông Quỳ (Kneeling Hip Flexor Stretch)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `lphc`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-lphc-lean`, `imp-run-quality`, `default_general`
- **Primary Muscles:** Psoas major, Rectus femoris, Iliacus
- **Secondary Muscles:** Tensor fasciae latae, Sartorius
- **Equipment:** `Mat`
- **Form Cues:**
  1. Quỳ tư thế 90/90 (một chân quỳ gối trên thảm, chân kia chống vuông góc 90 độ phía trước).
  2. Siết chặt mông chân quỳ và chủ động cuộn xương chậu ra sau (Posterior Pelvic Tilt — phẳng thắt lưng).
  3. Từ từ đẩy nhẹ hông tới trước 2–3 cm trong khi giữ thân thẳng đứng cho đến khi thấy căng mặt trước đùi và hông, giữ tĩnh 20–25 giây.
- **Common Errors:** Võng cong thắt lưng (lumbar lordosis) để cố đẩy hông đi xa; thả lỏng cơ mông sau; nghiêng người chúi về phía trước.
- **Cautions:** Tuyệt đối không để ưỡn cong cột sống thắt lưng; người có vấn đề khớp bánh chè cần kê đệm xốp dày dưới đầu gối.
- **Regression:** Chống hai tay lên ghế hoặc tường phía trước giữ vững thăng bằng.
- **Progression:** Vươn tay cùng bên chân quỳ lên cao và hơi nghiêng lườn sang bên đối diện; hoặc gác mu bàn chân sau lên ghế (Couch stretch).
- **Pre-Workout Dosage (Mode A):** 1 set × 20–25s per side | Tempo: Static Hold | Hold: 20–25s ($\le 30$s cap) | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 170
- **Provenance Classification:** PPT pelvic positioning rule: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 16. `cex-len-06` — Static Hamstring Stretch
- **English Name:** Static Hamstring Stretch
- **Vietnamese Display Name:** Giãn Cơ Đùi Sau Tĩnh (Static Hamstring Stretch)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `lphc`
- **Addressed Impairments:** `imp-lphc-ppt`
- **Primary Muscles:** Biceps femoris, Semitendinosus, Semimembranosus
- **Secondary Muscles:** Gastrocnemius
- **Equipment:** `Bodyweight` / `Strap` / `Bench`
- **Form Cues:**
  1. Đặt một gót chân lên bục thấp hoặc duỗi một chân phía trước khi ngồi/nằm trên thảm.
  2. Giữ cột sống thẳng tuyệt đối (không gù lưng), khóa nhẹ xương chậu ở vị trí trung tính.
  3. Gập người từ khớp háng (hinge at the hips) đẩy ngực về phía trước cho đến khi thấy căng mặt sau đùi, giữ tĩnh 20–25 giây.
- **Common Errors:** Gù cong lưng trên và thắt lưng để cố cúi đầu chạm chân; khóa cứng khớp gối quá mức gây căng dây thần kinh tọa thay vì giãn cơ.
- **Cautions:** Dừng lại ngay nếu xuất hiện cảm giác tê buốt châm chích ở bắp chân hoặc bàn chân (dấu hiệu căng thần kinh tọa - neural tension).
- **Regression:** Nằm ngửa trên thảm dùng dây đai vải móc vào bàn chân kéo chân lên trong khi gối hơi chùng nhẹ.
- **Progression:** Đặt chân lên bục cao hơn và gập hông sâu hơn trong khi vẫn duy trì lưng thẳng tuyệt đối.
- **Pre-Workout Dosage (Mode A):** 1 set × 20–25s per leg | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 30–45s per leg | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 171
- **Provenance Classification:** Hamstring stretch kinematics: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 17. `cex-len-07` — Static Kneeling Lat Stretch
- **English Name:** Static Kneeling Lat Stretch
- **Vietnamese Display Name:** Giãn Cơ Lưng Rộng Quỳ (Static Kneeling Lat Stretch)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `shoulder` / `lphc`
- **Addressed Impairments:** `imp-shldr-fall`, `imp-lphc-apt`
- **Primary Muscles:** Latissimus dorsi, Teres major
- **Secondary Muscles:** Posterior deltoid, Triceps brachii (long head)
- **Equipment:** `Mat` / `Bench` (hoặc bóng tập)
- **Form Cues:**
  1. Quỳ gối trước ghế băng hoặc bục, đặt mép ngoài bàn tay (ngón cái hướng lên trần) lên mặt ghế.
  2. Giữ hai cánh tay duỗi thẳng, từ từ đẩy hông lùi ra sau về phía gót chân.
  3. Hạ ngực chìm xuống sàn cảm nhận căng dài dải cơ xô hai bên sườn, giữ tĩnh 20–25 giây kết hợp thở đều.
- **Common Errors:** Ưỡn cong thắt lưng (phải giữ xương chậu trung tính, siết nhẹ bụng); gập khuỷu tay; nhún vai co về phía tai.
- **Cautions:** Người có tiền sử chèn ép khoang vai (shoulder impingement) nên dang hai tay rộng hơn hoặc hạ ngực ở biên độ vừa phải không gây đau nhói khớp vai.
- **Regression:** Đặt tay trên bóng tập lớn (Swiss ball) hoặc ngay trên sàn nhà.
- **Progression:** Xoay chéo thân người đưa hai tay chếch sang một bên để kéo dài dải cơ xô từng bên sâu hơn.
- **Pre-Workout Dosage (Mode A):** 1 set × 20–25s | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 30–40s | Tempo: Static Hold | Hold: 30–40s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 174
- **Provenance Classification:** Latissimus shoulder/APT mechanics: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 18. `cex-len-08` — Static Doorway Pectoral Stretch
- **English Name:** Static Doorway Pectoral Stretch
- **Vietnamese Display Name:** Giãn Cơ Ngực Khung Cửa (Static Doorway Pectoral)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `shoulder`
- **Addressed Impairments:** `imp-shldr-fall`, `imp-shldr-round`, `default_general`
- **Primary Muscles:** Pectoralis major (sternal & clavicular heads), Pectoralis minor
- **Secondary Muscles:** Anterior deltoid, Coracobrachialis
- **Equipment:** `Doorframe` / `Rig`
- **Form Cues:**
  1. Đứng giữa khung cửa hoặc cột rig, đặt cẳng tay lên mép khung cửa với khuỷu tay gập 90 độ ngang tầm vai.
  2. Bước một chân tới trước tạo thế trụ vững, giữ lưng thẳng và hạ thấp vai.
  3. Từ từ dồn trọng tâm về trước cho đến khi thấy căng vùng ngực trước và mặt trước vai, giữ tĩnh 20–25 giây.
- **Common Errors:** Nhô đầu và cổ ra trước (forward head); xoay vẹo thân người mất cân bằng; nâng cùi chỏ quá cao gây chèn ép mỏm cùng vai.
- **Cautions:** Dừng lại ngay nếu xuất hiện cảm giác đau nhói ở mặt trước chỏm xương cánh tay (dấu hiệu kéo căng bao khớp trước quá mức).
- **Regression:** Đặt cánh tay thấp hơn (khuỷu tay dưới tầm vai) hoặc giãn từng bên một.
- **Progression:** Nâng cùi chỏ lên góc 120 độ để nhắm sâu vào nhóm sợi cơ ngực bé (Pectoralis minor).
- **Pre-Workout Dosage (Mode A):** 1 set × 20–25s per side | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 176
- **Provenance Classification:** Pectoral lengthening & impingement caution: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 19. `cex-len-09` — Static Upper Trapezius / Levator Stretch
- **English Name:** Static Upper Trapezius / Levator Stretch
- **Vietnamese Display Name:** Giãn Cơ Thang Trên / Nâng Vai (Upper Trap Stretch)
- **Phase:** `lengthen`
- **Category / Training Type:** `Corrective` / `MOBILITY`
- **Movement Pattern:** `MOBILITY`
- **Kinetic Chain Checkpoint:** `cervical_spine` / `shoulder`
- **Addressed Impairments:** `imp-shldr-elev`, `imp-neck-fwd`
- **Primary Muscles:** Upper trapezius, Levator scapulae
- **Secondary Muscles:** Scalenes, Sternocleidomastoid
- **Equipment:** `Bodyweight`
- **Form Cues:**
  1. Ngồi hoặc đứng thẳng lưng, một tay vòng ra sau lưng hoặc bám nhẹ mép ghế để chủ động hạ thấp mỏm vai bên đó.
  2. Nhẹ nhàng nghiêng tai đối diện về phía vai đối diện trong khi mắt nhìn thẳng tới trước.
  3. Đặt nhẹ các ngón tay đối diện lên đỉnh đầu (không dùng sức kéo) hỗ trợ trọng lượng giữ tĩnh 20–25 giây.
- **Common Errors:** Dùng tay giật kéo mạnh đầu; nhún vai đang cần giãn lên tai; gập gù lưng trên.
- **Cautions:** Tuyệt đối không giật mạnh hoặc vặn xoắn đột ngột đốt sống cổ. Dừng lại nếu thấy chóng mặt hoặc tê bì cánh tay.
- **Regression:** Không đặt tay lên đầu, chỉ chủ động nghiêng đầu bằng lực cơ cổ tự nhiên.
- **Progression:** Xoay cằm nhìn chếch xuống nách đối diện 45 độ để chuyển trọng tâm giãn trực tiếp vào cơ nâng vai (Levator scapulae).
- **Pre-Workout Dosage (Mode A):** 1 set × 20–25s per side | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 30–40s per side | Tempo: Static Hold | Hold: 30–40s | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 178
- **Provenance Classification:** Cervical lengthening anatomy: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

### PHASE 3: ACTIVATE TECHNIQUES (ISOLATED STRENGTHENING)

---

#### 20. `cex-act-01` — Isolated Tibialis Anterior Dorsiflexion
- **English Name:** Isolated Tibialis Anterior Dorsiflexion
- **Vietnamese Display Name:** Gập Cổ Chân Ngược (Anterior Tibialis Dorsiflexion)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `ISOLATION`
- **Kinetic Chain Checkpoint:** `foot_ankle`
- **Addressed Impairments:** `imp-lphc-lean`, `imp-foot-turnout`, `imp-foot-flatten`
- **Primary Muscles:** Tibialis anterior
- **Secondary Muscles:** Extensor digitorum longus, Extensor hallucis longus
- **Equipment:** `Mini-Band` / `Wall` / `Bodyweight`
- **Form Cues:**
  1. Đứng tựa lưng và mông vào tường, hai gót chân đặt cách tường 20–30 cm.
  2. Giữ hai đầu gối duỗi thẳng, chủ động nhấc tối đa toàn bộ phần mũi bàn chân lên về phía cẳng chân (dorsiflexion).
  3. Giữ 2 giây ở đỉnh co thắt cực đại (isometric hold), sau đó hạ chậm 4 giây về mặt sàn (tempo 4/2/1).
- **Common Errors:** Đẩy hông rời khỏi tường; gập cong đầu gối để nhấc chân; giật nhanh không kiểm soát pha hạ eccentric.
- **Cautions:** Kiểm soát hạ êm ái, tránh dộng mạnh mũi bàn chân xuống sàn gây kích ứng xương bàn chân.
- **Regression:** Ngồi trên ghế thực hiện gập cổ chân chủ động không tải hoặc đứng gần tường hơn.
- **Progression:** Móc dây kháng lực (mini-band) vào mũi chân để kéo ngược tải trọng hoặc tăng khoảng cách đứng xa tường (Tibialis raise).
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 194
- **Provenance Classification:** Isolated tibialis recruitment & 4/2/1 tempo: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 21. `cex-act-02` — Side-Lying Clamshell
- **English Name:** Side-Lying Clamshell
- **Vietnamese Display Name:** Mở Gối Nằm Nghiêng (Side-Lying Clamshell)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `ISOLATION`
- **Kinetic Chain Checkpoint:** `knee` / `lphc`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-lphc-apt`, `imp-foot-turnout`
- **Primary Muscles:** Gluteus medius (posterior fibers), Gluteus minimus
- **Secondary Muscles:** Piriformis, Gemelli, Obturator internus
- **Equipment:** `Mini-Band` / `Bodyweight`
- **Form Cues:**
  1. Nằm nghiêng một bên, gập hông 45 độ, gập gối 90 độ, hai gót chân chụm sát vào nhau.
  2. Đặt bàn tay trên lên mào chậu giữ cố định khung chậu vuông góc tuyệt đối với sàn nhà.
  3. Mở đầu gối trên lên trần nhà mà không để xoay lật khung chậu ra sau, giữ 2 giây ở đỉnh co thắt, hạ chậm 4 giây (tempo 4/2/1).
- **Common Errors:** Lật ngửa khung chậu ra sau để nâng gối cao hơn; dùng cơ TFL ở đùi trước thay vì cơ mông nhỡ; nhấc rời hai gót chân.
- **Cautions:** Cảm nhận kích hoạt ở má ngoài phía sau của mông; không được xuất hiện cảm giác đau nhói ở mặt trước khớp háng.
- **Regression:** Thực hiện bằng trọng lượng cơ thể không dùng dây mini-band.
- **Progression:** Đeo dây mini-band đàn hồi ngay trên hai khớp gối để tăng kháng lực xoay ngoài.
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 reps per leg | Tempo: 4/2/1 | Hold: 2s at top | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 12–15 reps per leg | Tempo: 4/2/1 | Hold: 2s at top | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 197
- **Provenance Classification:** Gluteus medius posterior fiber isolation: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 22. `cex-act-03` — Lateral Band Walk
- **English Name:** Lateral Band Walk
- **Vietnamese Display Name:** Bước Ngang Với Dây Kháng Lực (Lateral Band Walk)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `ISOLATION` / `LOCOMOTION`
- **Kinetic Chain Checkpoint:** `knee` / `lphc`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-field-soccer`, `imp-lphc-apt`
- **Primary Muscles:** Gluteus medius, Gluteus minimus, Gluteus maximus (upper fibers)
- **Secondary Muscles:** Tensor fasciae latae (as dynamic stabilizer)
- **Equipment:** `Mini-Band`
- **Form Cues:**
  1. Đeo dây mini-band quanh hai mũi chân hoặc trên cổ chân, hai bàn chân mở rộng bằng hông.
  2. Hạ thấp trọng tâm vào tư thế athletic quarter-squat, hai bàn chân song song hướng thẳng tới trước.
  3. Bước ngang từng bước chậm có kiểm soát, duy trì độ căng của dây liên tục, không để hai đầu gối chụm vào nhau.
- **Common Errors:** Xoay xòe hai bàn chân sang hai bên (feet turn out); gối bị sụp vào trong khi bước; thân trên lắc lư lắc lư sang hai bên.
- **Cautions:** Duy trì cột sống thắt lưng trung tính, không ưỡn thắt lưng khi bước.
- **Regression:** Đeo dây mini-band lên phía trên khớp gối để rút ngắn cánh tay đòn kháng lực.
- **Progression:** Đeo dây mini-band quanh hai mũi bàn chân (kích hoạt đồng thời cơ xoay ngoài và cơ mông nhỡ mạnh nhất theo nghiên cứu EMG).
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 steps per side | Tempo: Controlled | Hold: 1s at landing | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 15 steps per side | Tempo: Controlled | Hold: 1s at landing | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 198
- **Provenance Classification:** Band placement EMG kinetics: `[SOURCE-VERIFIED]`. DINO operational dosage: `[DINO DESIGN DECISION]`.

---

#### 23. `cex-act-04` — Floor Glute Bridge
- **English Name:** Floor Glute Bridge
- **Vietnamese Display Name:** Cầu Mông Sàn (Floor Glute Bridge)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `HINGE`
- **Kinetic Chain Checkpoint:** `lphc`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-lphc-lean`, `imp-run-quality`, `default_general`
- **Primary Muscles:** Gluteus maximus
- **Secondary Muscles:** Hamstrings (as synergists), Erector spinae, Transverse abdominis
- **Equipment:** `Mat` / `Bodyweight` / `Mini-Band`
- **Form Cues:**
  1. Nằm ngửa trên thảm, gập hai gối đặt bàn chân phẳng trên sàn cách mông một gang tay, hai gối mở ngang vai.
  2. Cuộn nhẹ xương chậu ra sau (phẳng thắt lưng xuống sàn), gồng nhẹ cơ bụng.
  3. Ấn gót chân đẩy hông lên tạo thành đường thẳng từ gối đến vai, siết chặt cơ mông 2 giây ở đỉnh, hạ chậm 4 giây (tempo 4/2/1).
- **Common Errors:** Đẩy hông quá cao bằng cách ưỡn gãy thắt lưng (lumbar hyperextension); nhấc mũi chân hoặc gót chân; dùng cơ đùi sau co rút thay vì cơ mông.
- **Cautions:** Khóa chặt xương chậu ở vị trí trung tính; không để xuất hiện cảm giác căng tức ở vùng cột sống thắt lưng.
- **Regression:** Đặt hai tay úp sát sàn trợ lực thăng bằng; rút ngắn biên độ nâng hông.
- **Progression:** Single-Leg Glute Bridge (cầu mông một chân) hoặc kẹp dây mini-band quanh đùi giữ mở gối.
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s isometric hold at top | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s isometric hold at top | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 196
- **Provenance Classification:** Gluteus maximus recruitment mechanics: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 24. `cex-act-05` — Deadbug Stabilization
- **English Name:** Deadbug Stabilization
- **Vietnamese Display Name:** Côn Trùng Chết Kích Hoạt Lõi (Deadbug Core Activation)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORE`
- **Movement Pattern:** `CORE`
- **Kinetic Chain Checkpoint:** `lphc`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-lphc-lean`
- **Primary Muscles:** Transverse abdominis, Multifidus, Internal obliques
- **Secondary Muscles:** Rectus abdominis, Hip flexors (isometric stabilization)
- **Equipment:** `Mat`
- **Form Cues:**
  1. Nằm ngửa trên thảm, giơ hai tay thẳng lên trần nhà, nâng hai gối gập 90 độ (tư thế tabletop).
  2. Thở hết khí ra siết chặt cơ bụng ép chặt toàn bộ cột sống thắt lưng dính sát xuống mặt sàn (không có khe hở).
  3. Từ từ duỗi một tay qua đầu và chân đối diện duỗi thẳng hạ sát sàn trong khi lưng dưới vẫn dính chặt sàn, giữ 1 giây rồi thu về đổi bên.
- **Common Errors:** Thắt lưng bị võng rời khỏi mặt sàn khi duỗi chân (mất kiểm soát chống ưỡn - anti-extension); nín thở gồng cổ; duỗi chân quá nhanh.
- **Cautions:** Ngừng động tác ngay nếu lưng dưới bị nhấc khỏi thảm gây đau mỏi vùng thắt lưng.
- **Regression:** Chỉ hạ chân chạm gót nhẹ xuống sàn với gối gập (bent-knee tap) không duỗi thẳng chân; giữ hai tay cố định.
- **Progression:** Cầm tạ nhẹ trên tay hoặc kẹp bóng ổn định giữa đầu gối và bàn tay đối diện.
- **Pre-Workout Dosage (Mode A):** 1 set × 8–10 reps per side | Tempo: Controlled | Hold: 1s at extension | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 10–12 reps per side | Tempo: Controlled | Hold: 1s at extension | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `quality_run`, `easy_run`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM CEx Ch. 10, p. 200 & `SOURCE-02`: NASM PES Ch. 8
- **Provenance Classification:** Anti-extension core stabilization: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 25. `cex-act-06` — Quadruped Bird-Dog
- **English Name:** Quadruped Bird-Dog
- **Vietnamese Display Name:** Chim Chó Giữ Thăng Bằng (Quadruped Bird-Dog)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORE`
- **Movement Pattern:** `CORE`
- **Kinetic Chain Checkpoint:** `lphc`
- **Addressed Impairments:** `imp-lphc-ppt`, `imp-lphc-apt`
- **Primary Muscles:** Erector spinae, Gluteus maximus, Multifidus
- **Secondary Muscles:** Posterior deltoid, Middle/Lower trapezius, Core stabilizers
- **Equipment:** `Mat`
- **Form Cues:**
  1. Quỳ chống bốn điểm trên sàn (cổ tay thẳng dưới vai, khớp gối thẳng dưới hông, cột sống trung tính).
  2. Đồng thời vươn thẳng một tay tới trước và duỗi chân đối diện ra sau ngang tầm thân người.
  3. Giữ vững thân người không nghiêng lắc, siết chặt cơ mông và cơ dựng sống lưng trong 2 giây trước khi hạ xuống đổi bên.
- **Common Errors:** Đá chân quá cao làm võng gãy thắt lưng (hyperextension); lật nghiêng khung chậu sang bên; gục đầu rụt cổ.
- **Cautions:** Giữ mắt nhìn thẳng xuống sàn để cột sống cổ luôn thẳng hàng với cột sống ngực và thắt lưng.
- **Regression:** Chỉ nhấc riêng từng tay hoặc từng chân một lần để giảm đòi hỏi thăng bằng.
- **Progression:** Giữ 3–5 giây ở đỉnh co thắt hoặc dùng cùi chỏ chạm đầu gối dưới bụng trước khi duỗi thẳng lại.
- **Pre-Workout Dosage (Mode A):** 1 set × 8–10 reps per side | Tempo: 4/2/1 | Hold: 2s hold at extension | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 10–12 reps per side | Tempo: 4/2/1 | Hold: 2s hold at extension | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM CEx Ch. 10, p. 201 & McGill Spine Stabilization
- **Provenance Classification:** McGill posterior chain stabilization: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 26. `cex-act-07` — Prone Cobra
- **English Name:** Prone Cobra (Lower Trap / Rhomboids)
- **Vietnamese Display Name:** Rắn Hổ Mang Nằm Sấp (Prone Cobra)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `ISOLATION` / `PULL`
- **Kinetic Chain Checkpoint:** `shoulder`
- **Addressed Impairments:** `imp-shldr-fall`, `imp-shldr-elev`, `imp-neck-fwd`
- **Primary Muscles:** Middle trapezius, Lower trapezius, Rhomboids, Infraspinatus, Teres minor
- **Secondary Muscles:** Erector spinae, Deep cervical flexors
- **Equipment:** `Mat`
- **Form Cues:**
  1. Nằm sấp trên thảm, hai chân duỗi thẳng, hai tay xuôi theo thân với ngón tay cái hướng lên trần nhà.
  2. Thu cằm nhẹ (chin tuck), siết hai xương bả vai kéo xuống về phía hông (scapular depression & retraction).
  3. Nhấc nhẹ lồng ngực khỏi sàn 5–10 cm và xoay ngoài cánh tay, giữ yên tĩnh 2 giây ở đỉnh co thắt, hạ chậm 4 giây (tempo 4/2/1).
- **Common Errors:** Ngửa cổ quá mức nhăn trán (hyperextending cervical spine); nhún vai co về phía tai; dùng thắt lưng giật nảy người.
- **Cautions:** Luôn duy trì mắt nhìn thẳng xuống sàn để giữ cột sống cổ thẳng trục với cột sống ngực.
- **Regression:** Đặt một chiếc khăn cuộn đỡ trán, chỉ nhấc hai cánh tay và siết hai bả vai không cần nâng ngực.
- **Progression:** Đưa hai cánh tay ra góc chữ Y (Prone Y-raise) để tăng đòn bẩy kích hoạt cơ thang dưới (Lower trapezius).
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 204
- **Provenance Classification:** Scapular depression/retraction kinematics: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 27. `cex-act-08` — Band Pull-Apart / External Rotation
- **English Name:** Band Pull-Apart / External Rotation
- **Vietnamese Display Name:** Kéo Dây Ngang Ngực (Band Pull-Apart / W-External)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `ISOLATION` / `PULL`
- **Kinetic Chain Checkpoint:** `shoulder`
- **Addressed Impairments:** `imp-shldr-round`, `imp-shldr-fall`, `default_general`
- **Primary Muscles:** Infraspinatus, Teres minor, Rhomboids, Posterior deltoid
- **Secondary Muscles:** Middle trapezius
- **Equipment:** `Mini-Band` / Light Elastic Band
- **Form Cues:**
  1. Đứng thẳng, hai tay cầm dây kháng lực đưa thẳng ra trước ngực ngang tầm vai.
  2. Giữ khuỷu tay hơi chùng nhẹ, siết hai xương bả vai kéo dây sang ngang hai bên cho đến khi chạm ngực.
  3. Giữ 2 giây ở vị trí co thắt ép chặt hai bả vai, nhả chậm 4 giây về phía trước (tempo 4/2/1).
- **Common Errors:** Ưỡn thắt lưng ra sau để kéo dây; nhún vai co lên tai; gập cùi chỏ biến thành động tác kéo chèo (row).
- **Cautions:** Giữ xương sườn hạ thấp (ribs down) và cơ bụng siết nhẹ để chống ưỡn cong thắt lưng.
- **Regression:** Cầm dây rộng hơn để giảm độ căng của dây kháng lực.
- **Progression:** Đổi góc kéo thành hình chữ W hoặc tăng độ đàn hồi của dây kháng lực.
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s at contraction | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s at contraction | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 205
- **Provenance Classification:** Rotator cuff external rotation mechanics: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 28. `cex-act-09` — Chin Tuck (Deep Cervical Flexors)
- **English Name:** Chin Tuck (Deep Cervical Flexors)
- **Vietnamese Display Name:** Thu Cằm Giữ Cổ (Chin Tuck Retraction)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `ISOLATION`
- **Kinetic Chain Checkpoint:** `cervical_spine`
- **Addressed Impairments:** `imp-neck-fwd`, `imp-shldr-elev`
- **Primary Muscles:** Longus capitis, Longus colli (Deep Cervical Flexors)
- **Secondary Muscles:** Rectus capitis anterior, Rectus capitis lateralis
- **Equipment:** `Bodyweight` / `Mat`
- **Form Cues:**
  1. Nằm ngửa trên sàn hoặc đứng thẳng tựa lưng vào tường, mắt nhìn thẳng tới trước.
  2. Nhẹ nhàng trượt đầu lùi thẳng ra sau tạo tư thế "hai cằm" (double chin) mà không cúi gập đầu.
  3. Ấn nhẹ gáy vào sàn/tường cảm nhận cơ sâu trước cổ kích hoạt, giữ 2 giây ở đỉnh rồi nhả chậm 4 giây.
- **Common Errors:** Cúi gập cổ gí cằm vào xương ức; nín thở; dùng cơ ức đòn chũm (SCM) gồng cứng hai bên cổ.
- **Cautions:** Chuyển động ở biên độ ngắn, êm ái; tuyệt đối không dùng tay đẩy thô bạo vào cằm.
- **Regression:** Ngồi thẳng tựa lưng vào ghế có tựa đầu cao để cảm nhận điểm tựa.
- **Progression:** Nằm ngửa thu cằm và nhấc nhẹ đầu lên khỏi mặt thảm 1 cm giữ tĩnh 5 giây (Chin tuck with head lift).
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s hold | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s hold | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 206
- **Provenance Classification:** Deep cervical flexor activation: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 29. `cex-act-10` — Terminal Knee Extension (TKE)
- **English Name:** Terminal Knee Extension (TKE)
- **Vietnamese Display Name:** Duỗi Gối Khóa Khớp Gối VMO (Terminal Knee Extension)
- **Phase:** `activate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `ISOLATION`
- **Kinetic Chain Checkpoint:** `knee`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-knee-varus`, `imp-field-soccer`
- **Primary Muscles:** Vastus medialis oblique (VMO)
- **Secondary Muscles:** Vastus lateralis, Vastus intermedius
- **Equipment:** `Mini-Band` (hoặc dây kháng lực móc vào cột)
- **Form Cues:**
  1. Móc một đầu dây kháng lực vào cột ngang tầm gối, đầu kia luồn sau khoeo chân bên tập.
  2. Đứng chân đó hơi lùi lại sao cho dây kéo khớp gối hơi gập nhẹ về phía trước.
  3. Dồn lực siết cơ đùi trong (VMO) duỗi thẳng hoàn toàn khớp gối ấn gót chân xuống sàn, giữ 2 giây ở đỉnh trước khi nhả chậm 4 giây.
- **Common Errors:** Ưỡn thắt lưng ra sau để khóa gối; nhấc gót chân lên; duỗi gối giật cục mạnh bạo.
- **Cautions:** Khóa gối bằng sự co rút chủ động của cơ VMO, không để dây kéo giật ngược khớp gối về sau (hyperextension).
- **Regression:** Ngồi trên ghế kê khăn cuộn dưới khoeo chân, duỗi gối tĩnh co siết cơ đùi trong.
- **Progression:** Đứng trên thảm xốp thăng bằng hoặc tăng độ căng của dây kháng lực.
- **Pre-Workout Dosage (Mode A):** 1 set × 12–15 reps per leg | Tempo: 4/2/1 | Hold: 2s at full extension | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 15 reps per leg | Tempo: 4/2/1 | Hold: 2s at full extension | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 195
- **Provenance Classification:** VMO isolated terminal extension: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

### PHASE 4: INTEGRATE TECHNIQUES (INTEGRATED DYNAMIC MOVEMENT)

---

#### 30. `cex-int-01` — Pause Squat (3s Isometric Pause)
- **English Name:** Pause Squat (3s Isometric Pause)
- **Vietnamese Display Name:** Squat Giữ Dưới Đáy 3 Giây (Goblet / Bodyweight Pause Squat)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `SQUAT`
- **Kinetic Chain Checkpoint:** `lphc` / `knee` / `foot_ankle`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-lphc-ppt`, `imp-lphc-lean`, `imp-knee-valgus`, `imp-knee-varus`, `default_general`
- **Primary Muscles:** Quadriceps, Gluteus maximus, Adductor magnus
- **Secondary Muscles:** Hamstrings, Core complex, Soleus, Gastrocnemius
- **Equipment:** `Bodyweight` / Light `Dumbbell`
- **Form Cues:**
  1. Đứng hai chân rộng bằng vai, mũi chân mở nhẹ 15–20 độ theo hướng tự nhiên của khớp háng.
  2. Ngồi xổm kiểm soát hạ chậm xuống vị trí đùi song song sàn, chủ động mở hai đầu gối thẳng hàng với ngón chân thứ hai.
  3. Dừng tĩnh tuyệt đối 3 giây dưới đáy không nhấp nhô, giữ ngực mở lưng thẳng, đạp sàn đứng lên dứt khoát.
- **Common Errors:** Sụp đầu gối vào trong (valgus collapse) khi dừng dưới đáy; nhấc gót chân khỏi sàn; cong cụp lưng dưới (butt wink).
- **Cautions:** Chỉ dừng ở biên độ sâu mà cột sống thắt lưng vẫn duy trì được độ cong sinh lý tự nhiên.
- **Regression:** Squat xuống ghế hộp (Box pause squat) bằng trọng lượng cơ thể.
- **Progression:** Cầm tạ dumbbell nhẹ 5–10 kg trước ngực (Goblet pause squat).
- **Pre-Workout Dosage (Mode A):** 1 set × 8–10 reps | Tempo: Controlled | Hold: 3s isometric pause at bottom | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 10–12 reps | Tempo: Controlled | Hold: 3s isometric pause at bottom | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 11, p. 214
- **Provenance Classification:** Multi-joint integrated squat pause: `[SOURCE-VERIFIED]`. DINO Mode A/B dosage: `[DINO DESIGN DECISION]`.

---

#### 31. `cex-int-02` — Single-Leg Romanian Deadlift to Balance
- **English Name:** Single-Leg Romanian Deadlift to Balance
- **Vietnamese Display Name:** RDL 1 Chân Giữ Thăng Bằng (Single-Leg RDL to Balance)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `HINGE` / `LOCOMOTION`
- **Kinetic Chain Checkpoint:** `lphc` / `knee` / `foot_ankle`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-knee-valgus`, `imp-run-quality`
- **Primary Muscles:** Hamstrings, Gluteus maximus, Gluteus medius (dynamic frontal stabilizer)
- **Secondary Muscles:** Erector spinae, Core stabilizers, Intrinsic foot muscles
- **Equipment:** `Bodyweight`
- **Form Cues:**
  1. Đứng thăng bằng trên một chân, khớp gối chân trụ hơi chùng nhẹ 10 độ.
  2. Đẩy hông ra sau cúi người với thân thẳng như đòn bập bênh trong khi chân kia duỗi thẳng ra sau ngang tầm sàn.
  3. Dùng cơ mông và gân kheo kéo người đứng thẳng dậy, đồng thời co đầu gối chân sau lên 90 độ giữ thăng bằng 2 giây trước ngực.
- **Common Errors:** Xoay lật khung chậu mở sang bên; gù lưng cúi người bằng thắt lưng; chân trụ bị sụp vòm hoặc sụp gối vào trong.
- **Cautions:** Giữ cột sống thẳng trục từ đầu đến gót chân sau; không khóa cứng khớp gối chân trụ.
- **Regression:** Chạm nhẹ mũi chân sau xuống sàn khi đứng lên để hỗ trợ thăng bằng.
- **Progression:** Cầm tạ dumbbell nhẹ ở tay đối diện chân trụ hoặc đứng trên thảm xốp thăng bằng (balance pad).
- **Pre-Workout Dosage (Mode A):** 1 set × 6–8 reps per leg | Tempo: Controlled | Hold: 2s hold at top | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 8–10 reps per leg | Tempo: Controlled | Hold: 2s hold at top | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `quality_run`, `easy_run`, `soccer`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM CEx Ch. 11, p. 216 & `SOURCE-02`: NASM PES Ch. 9
- **Provenance Classification:** Single-leg balance reach kinematics: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 32. `cex-int-03` — Multi-Planar Lunge with Rotation
- **English Name:** Multi-Planar Lunge with Rotation
- **Vietnamese Display Name:** Lunge Đa Mặt Phẳng Xoay Thân (Lunge with Trunk Rotation)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `LUNGE` / `ROTATION`
- **Kinetic Chain Checkpoint:** `lphc` / `knee`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-field-soccer`
- **Primary Muscles:** Quadriceps, Gluteus maximus, Adductors, Core obliques
- **Secondary Muscles:** Hamstrings, Calves, Erector spinae
- **Equipment:** `Bodyweight`
- **Form Cues:**
  1. Đứng thẳng, bước một chân dài tới trước hạ thấp trọng tâm vào tư thế lunge 90/90.
  2. Giữ đầu gối chân trước mở thẳng theo ngón chân thứ hai, xoay nhẹ thân trên qua phía đùi chân trước.
  3. Xoay thân về giữa và đạp mạnh gót chân trước thu người về vị trí đứng ban đầu, sau đó đổi bên.
- **Common Errors:** Gối chân trước bị trôi sụp vào trong khi xoay thân; thân trên đổ chúi ra trước; bước chân quá ngắn.
- **Cautions:** Đầu gối chân trước luôn thẳng hàng với ngón chân thứ hai; không để lực xoay thân làm vặn xoắn khớp gối.
- **Regression:** Bước lunge tĩnh tại chỗ (split squat) rồi mới xoay thân nhẹ, không bước tiến/lùi.
- **Progression:** Cầm bóng tạ nhẹ hoặc thực hiện theo phương lunge ngang (lateral lunge with rotation).
- **Pre-Workout Dosage (Mode A):** 1 set × 6–8 reps per side | Tempo: Controlled | Hold: 1s at rotation | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 10 reps per side | Tempo: Controlled | Hold: 1s at rotation | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `lower`, `soccer`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-02`: NASM Essentials of Sports Performance Training, Chapter 6, p. 158
- **Provenance Classification:** Multi-planar athletic lunge protocol: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 33. `cex-int-04` — Lateral Skater Hop with Stabilization
- **English Name:** Lateral Skater Hop with Stabilization
- **Vietnamese Display Name:** Bước Bật Trượt Băng Giữ Thăng Bằng (Skater Hop with Stick)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `LOCOMOTION` / `ISOLATION`
- **Kinetic Chain Checkpoint:** `knee` / `lphc` / `foot_ankle`
- **Addressed Impairments:** `imp-knee-valgus`, `imp-field-soccer`, `imp-lphc-apt`
- **Primary Muscles:** Gluteus medius, Gluteus maximus, Quadriceps
- **Secondary Muscles:** Hamstrings, Gastrocnemius, Peroneals
- **Equipment:** `Bodyweight`
- **Form Cues:**
  1. Đứng thăng bằng trên một chân, khớp gối chùng nhẹ ở tư thế chuẩn bị.
  2. Dùng lực cơ mông bật nhảy ngang sang bên đối diện khoảng 1–1.5 mét.
  3. Tiếp đất êm ái trên chân đối diện bằng cách chùng gối và hạ hông, "dính chặt" (stick) mặt sàn giữ thăng bằng tuyệt đối trong 2 giây trước khi bật ngược lại.
- **Common Errors:** Tiếp đất đầu gối bị sụp vào trong (valgus collapse); tiếp đất cứng bằng gót chân phát ra tiếng động lớn; mất thăng bằng ngã nghiêng.
- **Cautions:** Không thực hiện nếu đang có chấn thương cấp tính dây chằng chéo trước (ACL) hoặc bong gân mắt cá chân chưa hồi phục.
- **Regression:** Bước dậm chân ngang không bật nhảy (lateral step with balance reach).
- **Progression:** Tăng khoảng cách bật nhảy hoặc tăng tốc độ chuyển hướng sau khi giữ thăng bằng 2 giây.
- **Pre-Workout Dosage (Mode A):** 1 set × 6 hops per side | Tempo: Explosive with 2s Stick | Hold: 2s stick landing | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 8 hops per side | Tempo: Explosive with 2s Stick | Hold: 2s stick landing | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `soccer`, `quality_run`, `lower`, `offday`
- **Source Provenance:** `SOURCE-02`: NASM Essentials of Sports Performance Training, Chapter 10, p. 278
- **Provenance Classification:** Frontal plane reactive deceleration: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 34. `cex-int-05` — A-Skip & Ankling Dynamic Prep
- **English Name:** A-Skip & Ankling Dynamic Prep
- **Vietnamese Display Name:** Bước Nâng Gối Kỹ Thuật Chạy (A-Skip & Ankling Drills)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `LOCOMOTION`
- **Kinetic Chain Checkpoint:** `foot_ankle` / `lphc`
- **Addressed Impairments:** `imp-run-quality`, `imp-foot-turnout`, `imp-lphc-apt`
- **Primary Muscles:** Gastrocnemius, Soleus, Tibialis anterior, Psoas, Gluteus maximus
- **Secondary Muscles:** Quadriceps, Hamstrings
- **Equipment:** `Bodyweight`
- **Form Cues:**
  1. Đứng thẳng, nhịp nhàng nhún nhảy trên nửa bàn chân trước (ball of foot) duy trì độ cứng vững khớp cổ chân (ankle stiffness).
  2. Nâng đầu gối một bên lên ngang tầm hông, cổ chân chủ động gập ngược (dorsiflexed).
  3. Đập nhịp nhàng nửa bàn chân xuống sàn ngay dưới trọng tâm cơ thể và chuyển nhịp nhún nhảy sang chân kia.
- **Common Errors:** Ngửa người ra sau; thả lỏng buông thõng cổ chân (plantarflexed); tiếp đất bằng gót chân.
- **Cautions:** Thực hiện trên bề mặt phẳng có độ đàn hồi tốt; tránh nếu đang đau gân gót Achilles cấp tính.
- **Regression:** Đi bộ nâng gối kỹ thuật (A-Walk) nhấn mạnh gập cổ chân và siết cơ mông chân trụ.
- **Progression:** Chuyển sang động tác chạy nâng gối nhanh (A-Run) hoặc tăng tần số guồng chân (cadence).
- **Pre-Workout Dosage (Mode A):** 1 set × 15–20 mét (hoặc 15–20 nhịp) | Tempo: Rhythmic Dynamic | Hold: None | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 20–30 mét | Tempo: Rhythmic Dynamic | Hold: None | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `quality_run`, `easy_run`, `soccer`
- **Source Provenance:** `SOURCE-02`: NASM PES Ch. 11, p. 308 & `SOURCE-03`: NSCA 4th Ed. Ch. 19/20
- **Provenance Classification:** Sprint running mechanics & stiffness: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 35. `cex-int-06` — Overhead Band Walk / Carry
- **English Name:** Overhead Band Walk / Carry
- **Vietnamese Display Name:** Đi Bước Xách Tạ / Dây Qua Đầu (Overhead Carry / Band Walk)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `CARRY`
- **Kinetic Chain Checkpoint:** `shoulder`
- **Addressed Impairments:** `imp-shldr-fall`, `imp-shldr-round`
- **Primary Muscles:** Lower trapezius, Serratus anterior, Rotator cuff complex
- **Secondary Muscles:** Upper trapezius, Deltoids, Core abdominal wall
- **Equipment:** `Mini-Band` / Light `Dumbbell`
- **Form Cues:**
  1. Đeo dây mini-band quanh hai cổ tay hoặc cầm tạ dumbbell rất nhẹ đẩy thẳng hai tay qua đầu.
  2. Khóa thẳng khuỷu tay, chủ động đẩy bả vai vươn lên cao (scapular upward rotation), giữ sườn hạ thấp siết chặt cơ bụng.
  3. Bước từng bước chậm rãi tới trước 10–15 mét trong khi duy trì hai cánh tay thẳng đứng sát mang tai.
- **Common Errors:** Võng thắt lưng (lumbar hyperextension) để đưa tay ra sau; gập khuỷu tay; nhô đầu chúi ra trước.
- **Cautions:** Không thực hiện nếu có hội chứng cấn khớp vai cấp tính hoặc mất vững khớp vai tái hồi.
- **Regression:** Đi bước giơ hai tay không tải (bodyweight overhead walk) hoặc đưa tay tư thế chữ Y.
- **Progression:** Single-Arm Overhead Dumbbell Waiter's Walk tăng thử thách chống nghiêng vặn thân mình.
- **Pre-Workout Dosage (Mode A):** 1 set × 15–20 mét (8–10 bước chậm) | Tempo: Controlled | Hold: Sustained Overhead | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 20–25 mét | Tempo: Controlled | Hold: Sustained Overhead | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 11, p. 218
- **Provenance Classification:** Scapular upward rotation integration: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 36. `cex-int-07` — Push-Up Plus (Serratus Anterior)
- **English Name:** Push-Up Plus (Serratus Anterior)
- **Vietnamese Display Name:** Hít Đất Nhô Xương Bả Vai (Push-Up Plus Scapular Retract)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `PUSH`
- **Kinetic Chain Checkpoint:** `shoulder`
- **Addressed Impairments:** `imp-shldr-round`, `imp-shldr-elev`, `imp-neck-fwd`, `default_general`
- **Primary Muscles:** Serratus anterior
- **Secondary Muscles:** Pectoralis minor, Anterior deltoid, Triceps brachii, Core abdominals
- **Equipment:** `Mat` / `Bodyweight`
- **Form Cues:**
  1. Vào tư thế chống đẩy (plank đỉnh cao), hai bàn tay đặt thẳng dưới vai, thân người tạo thành một đường thẳng.
  2. Giữ hai khuỷu tay thẳng tuyệt đối trong toàn bộ chuyển động.
  3. Chủ động đẩy sàn nhà ra xa bằng cách mở rộng hai xương bả vai ra hai bên (scapular protraction) nhấc lưng trên lên cao, giữ 2 giây ở đỉnh trước khi hạ nhẹ về trung tính.
- **Common Errors:** Gập khuỷu tay biến thành động tác hít đất thông thường; võng thắt lưng chùng hông; gục đầu rụt cổ xuống sàn.
- **Cautions:** Giữ khuỷu tay thẳng tự nhiên nhưng không khóa khớp giật cục; duy trì cơ bụng siết chặt bảo vệ thắt lưng.
- **Regression:** Chống hai gối xuống sàn (Kneeling push-up plus) hoặc chống hai tay lên tường/ghế bục cao.
- **Progression:** Đặt hai chân lên bục cao (feet-elevated) hoặc thực hiện ở tư thế plank cẳng tay (Dolphin push-up plus).
- **Pre-Workout Dosage (Mode A):** 1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s at full protraction | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s at full protraction | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `upper`, `full_body`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 11, p. 220
- **Provenance Classification:** Serratus anterior protraction mechanics: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

#### 37. `cex-int-08` — Squat to Overhead Press Integration
- **English Name:** Squat to Overhead Press Integration
- **Vietnamese Display Name:** Squat Đẩy Tạ Qua Đầu (Squat to Overhead Press)
- **Phase:** `integrate`
- **Category / Training Type:** `Corrective` / `CORRECTIVE`
- **Movement Pattern:** `SQUAT` / `PUSH`
- **Kinetic Chain Checkpoint:** `lphc` / `shoulder` / `knee`
- **Addressed Impairments:** `imp-lphc-apt`, `imp-shldr-fall`, `default_general`
- **Primary Muscles:** Quadriceps, Gluteus maximus, Deltoids (anterior/medial), Lower trapezius
- **Secondary Muscles:** Triceps brachii, Core complex, Gastrocnemius
- **Equipment:** Light `Dumbbell` / `Mini-Band` / `Bodyweight`
- **Form Cues:**
  1. Đứng thẳng hai chân rộng ngang vai, cầm tạ dumbbell rất nhẹ (hoặc nắm tay không) ngang vai.
  2. Ngồi xổm squat kiểm soát xuống vị trí đùi song song sàn.
  3. Đạp sàn đứng lên dứt khoát, dùng lực truyền từ chân qua thân người để đẩy hai tay qua đầu thành một chuyển động liền mạch trơn tru.
- **Common Errors:** Ngắt quãng chuyển động thành hai nhịp riêng biệt; ưỡn cong thắt lưng khi đẩy tạ qua đầu; sụp gối vào trong khi squat.
- **Cautions:** Đây là bài tập liên kết thần kinh cơ (neuromuscular integration), tuyệt đối không dùng tạ nặng gây mỏi cơ trước buổi tập chính.
- **Regression:** Thực hiện bằng trọng lượng cơ thể không tải hoặc squat xuống ghế ngồi rồi đứng lên giơ tay.
- **Progression:** Sử dụng tạ dumbbell 5–8 kg hoặc dây đàn hồi móc dưới chân.
- **Pre-Workout Dosage (Mode A):** 1 set × 8–10 reps | Tempo: Fluid Continuous | Hold: 1s at top | Intent: ZERO FATIGUE
- **Off-Day Dosage (Mode B):** 2 sets × 10–12 reps | Tempo: Fluid Continuous | Hold: 1s at top | Intent: TISSUE RESTORATION
- **Compatible Workout Contexts:** `full_body`, `lower`, `upper`, `offday`
- **Source Provenance:** `SOURCE-01`: NASM Essentials of Corrective Exercise Training, Chapter 11, p. 215
- **Provenance Classification:** Global kinetic chain linkage: `[SOURCE-VERIFIED]`. DINO dosage: `[DINO DESIGN DECISION]`.

---

## 4. Verification & Matrix Consistency Audit

### 4.1 Master 37-Exercise Audit Register

| # | Exercise ID | Phase | Checkpoint | Impairment Keys | Compatible Contexts | Rule Matrix Usage |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `cex-inh-01` | Inhibit | `foot_ankle` | `imp-lphc-lean`, `imp-foot-turnout`, `imp-foot-flatten`, `imp-run-quality` | `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday` | Rows 07, 10, 17 |
| **02** | `cex-inh-02` | Inhibit | `foot_ankle` | `imp-foot-turnout`, `imp-knee-valgus` | `lower`, `quality_run`, `easy_run`, `soccer`, `offday` | Auxiliary / Foot Catalog |
| **03** | `cex-inh-03` | Inhibit | `knee` / `lphc` | `imp-knee-valgus`, `imp-lphc-ppt`, `imp-field-soccer` | `lower`, `full_body`, `soccer`, `offday` | Rows 08, 09, 18 |
| **04** | `cex-inh-04` | Inhibit | `knee` / `lphc` | `imp-knee-valgus`, `imp-lphc-apt`, `imp-foot-turnout` | `lower`, `quality_run`, `easy_run`, `soccer`, `offday` | Auxiliary / TFL Catalog |
| **05** | `cex-inh-05` | Inhibit | `lphc` | `imp-lphc-apt`, `imp-lphc-lean`, `imp-run-quality`, `default_general` | `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday` | Rows 01, 02, 03, 04, 05, 16 |
| **06** | `cex-inh-06` | Inhibit | `lphc` / `knee` | `imp-lphc-ppt`, `imp-foot-turnout` | `lower`, `full_body`, `offday` | Row 06 |
| **07** | `cex-inh-07` | Inhibit | `lphc` | `imp-lphc-apt`, `imp-knee-valgus`, `imp-foot-turnout` | `lower`, `full_body`, `quality_run`, `easy_run`, `offday` | Auxiliary / Piriformis Catalog |
| **08** | `cex-inh-08` | Inhibit | `shoulder` / `lphc` | `imp-shldr-fall`, `imp-shldr-round`, `imp-lphc-apt`, `default_general` | `upper`, `full_body`, `offday` | Rows 11, 12, 15 |
| **09** | `cex-inh-09` | Inhibit | `shoulder` | `imp-shldr-fall`, `imp-shldr-round`, `imp-neck-fwd` | `upper`, `full_body`, `offday` | Auxiliary / Thoracic Catalog |
| **10** | `cex-inh-10` | Inhibit | `cervical_spine` | `imp-shldr-elev`, `imp-neck-fwd` | `upper`, `offday` | Rows 13, 14 |
| **11** | `cex-len-01` | Lengthen | `foot_ankle` | `imp-lphc-lean`, `imp-foot-turnout`, `imp-foot-flatten` | `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday` | Row 07 |
| **12** | `cex-len-02` | Lengthen | `foot_ankle` | `imp-foot-turnout`, `imp-lphc-lean`, `imp-foot-flatten` | `lower`, `quality_run`, `easy_run`, `soccer`, `offday` | Row 10 |
| **13** | `cex-len-03` | Lengthen | `knee` / `lphc` | `imp-knee-valgus`, `imp-field-soccer` | `lower`, `soccer`, `offday` | Rows 08, 09, 18 |
| **14** | `cex-len-04` | Lengthen | `knee` / `lphc` | `imp-knee-valgus`, `imp-lphc-apt`, `imp-foot-turnout` | `lower`, `quality_run`, `easy_run`, `soccer`, `offday` | Auxiliary / TFL Catalog |
| **15** | `cex-len-05` | Lengthen | `lphc` | `imp-lphc-apt`, `imp-lphc-lean`, `imp-run-quality`, `default_general` | `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday` | Rows 01, 02, 03, 04, 05, 16, 17 |
| **16** | `cex-len-06` | Lengthen | `lphc` | `imp-lphc-ppt` | `lower`, `offday` | Row 06 |
| **17** | `cex-len-07` | Lengthen | `shoulder` / `lphc` | `imp-shldr-fall`, `imp-lphc-apt` | `upper`, `full_body`, `offday` | Row 11 |
| **18** | `cex-len-08` | Lengthen | `shoulder` | `imp-shldr-fall`, `imp-shldr-round`, `default_general` | `upper`, `offday` | Rows 12, 15 |
| **19** | `cex-len-09` | Lengthen | `cervical_spine` | `imp-shldr-elev`, `imp-neck-fwd` | `upper`, `offday` | Rows 13, 14 |
| **20** | `cex-act-01` | Activate | `foot_ankle` | `imp-lphc-lean`, `imp-foot-turnout`, `imp-foot-flatten` | `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday` | Rows 07, 10 |
| **21** | `cex-act-02` | Activate | `knee` / `lphc` | `imp-knee-valgus`, `imp-lphc-apt`, `imp-foot-turnout` | `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday` | Rows 03, 09 |
| **22** | `cex-act-03` | Activate | `knee` / `lphc` | `imp-knee-valgus`, `imp-field-soccer`, `imp-lphc-apt` | `lower`, `soccer`, `offday` | Rows 05, 08, 18 |
| **23** | `cex-act-04` | Activate | `lphc` | `imp-lphc-apt`, `imp-lphc-lean`, `imp-run-quality`, `default_general` | `lower`, `full_body`, `quality_run`, `easy_run`, `soccer`, `offday` | Rows 01, 02, 04, 16, 17 |
| **24** | `cex-act-05` | Activate | `lphc` | `imp-lphc-apt`, `imp-lphc-lean` | `lower`, `full_body`, `quality_run`, `easy_run`, `offday` | Auxiliary / Core Catalog |
| **25** | `cex-act-06` | Activate | `lphc` | `imp-lphc-ppt`, `imp-lphc-apt` | `lower`, `full_body`, `offday` | Row 06 |
| **26** | `cex-act-07` | Activate | `shoulder` | `imp-shldr-fall`, `imp-shldr-elev`, `imp-neck-fwd` | `upper`, `full_body`, `offday` | Rows 11, 13 |
| **27** | `cex-act-08` | Activate | `shoulder` | `imp-shldr-round`, `imp-shldr-fall`, `default_general` | `upper`, `full_body`, `offday` | Rows 12, 15 |
| **28** | `cex-act-09` | Activate | `cervical_spine` | `imp-neck-fwd`, `imp-shldr-elev` | `upper`, `offday` | Row 14 |
| **29** | `cex-act-10` | Activate | `knee` | `imp-knee-valgus`, `imp-field-soccer` | `lower`, `soccer`, `offday` | Auxiliary / VMO Catalog |
| **30** | `cex-int-01` | Integrate | `lphc` / `knee` | `imp-lphc-apt`, `imp-lphc-ppt`, `imp-lphc-lean`, `imp-knee-valgus`, `default_general` | `lower`, `full_body`, `offday` | Rows 01, 06, 07, 08, 16 |
| **31** | `cex-int-02` | Integrate | `lphc` / `knee` | `imp-lphc-apt`, `imp-knee-valgus`, `imp-run-quality` | `lower`, `quality_run`, `easy_run`, `soccer`, `offday` | Row 04 |
| **32** | `cex-int-03` | Integrate | `lphc` / `knee` | `imp-knee-valgus`, `imp-field-soccer` | `lower`, `soccer`, `full_body`, `offday` | Auxiliary / Multi-Planar Catalog |
| **33** | `cex-int-04` | Integrate | `knee` / `lphc` | `imp-knee-valgus`, `imp-field-soccer`, `imp-lphc-apt` | `soccer`, `quality_run`, `lower`, `offday` | Rows 05, 09, 18 |
| **34** | `cex-int-05` | Integrate | `foot_ankle` | `imp-run-quality`, `imp-foot-turnout`, `imp-lphc-apt` | `quality_run`, `easy_run`, `soccer` | Rows 03, 10, 17 |
| **35** | `cex-int-06` | Integrate | `shoulder` | `imp-shldr-fall`, `imp-shldr-round` | `upper`, `full_body`, `offday` | Row 11 |
| **36** | `cex-int-07` | Integrate | `shoulder` | `imp-shldr-round`, `imp-shldr-elev`, `imp-neck-fwd`, `default_general` | `upper`, `full_body`, `offday` | Rows 12, 13, 14, 15 |
| **37** | `cex-int-08` | Integrate | `lphc` / `shoulder` | `imp-lphc-apt`, `imp-shldr-fall`, `default_general` | `full_body`, `lower`, `upper`, `offday` | Row 02 |

### 4.2 Cross-Verification Checklist

| Check Item | Requirement | Verification Result | Verdict |
| :--- | :--- | :--- | :--- |
| **Total Exercise Count** | Exactly 37 exercises | 10 Inhibit + 9 Lengthen + 10 Activate + 8 Integrate = 37 | PASS |
| **PREHAB_RULE_MATRIX Coverage** | All exercises in Rows 01–18 present | 100% of rule matrix exercises are verified in database | PASS |
| **Phase Assignment Consistency** | Phase adheres to NASM continuum | No exercise assigned to multiple or contradictory phases | PASS |
| **Context Assignment Safety** | Upper/Lower/Run/Soccer contexts aligned | Upper exercises not prescribed as lower integration | PASS |
| **Dosing Safety Cap** | Pre-workout static stretch $\le 30$s | All Phase 2 pre-workout holds capped at 20–30s (NSCA Ch. 14) | PASS |
| **Fatigue Control Law** | Mode A zero fatigue guarantee | Exactly 1 set per exercise in Mode A | PASS |
| **Anatomical Claims Integrity** | No unsourced claims | All primary muscle actions sourced from NASM CEx / PES | PASS |
| **Unspecified Fields** | Explicit marking | Unspecified secondary muscles marked `NOT SPECIFIED` | PASS |
| **Application Code Untouched** | Zero modifications to `js/`, `css/`, `index.html` | Verified: only governance specification files modified | PASS |

---

## 5. Conclusion & Next Step Authorization

- **Step Status:** `STEP 06 COMPLETE`
- **Output Artifact:** [`00_SYSTEM/SOURCES/DINO-005B/EXERCISE_DATABASE_SPECIFICATION.md`](file:///c:/Users/ADMIN/Desktop/DinoHybridTracking/00_SYSTEM/SOURCES/DINO-005B/EXERCISE_DATABASE_SPECIFICATION.md)
- **Authorized Next Step:** Proceed to **STEP 07 — DETERMINISTIC SCORING & PIPELINE SPECIFICATION** or **IMPLEMENTATION AUTHORIZATION** upon review by DINO & ChatGPT.
