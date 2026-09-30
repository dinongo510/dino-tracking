/**
 * DINO-005B — PREHAB & CORRECTIVE EXERCISE CATALOG
 *
 * Auto-generated from 00_SYSTEM/SOURCES/DINO-005B/EXERCISE_DATABASE_SPECIFICATION.md
 * Total Exercises: 37 (10 Inhibit, 9 Lengthen, 10 Activate, 8 Integrate)
 *
 * S01: NASM Essentials of Corrective Exercise Training
 * S02: NASM Essentials of Sports Performance Training
 * S03: NSCA Essentials of Strength Training and Conditioning 4th Ed.
 * S04: BFS Hybrid Athlete 2-Week Rotation
 * S05: Kế-hoạch-cơ-bản.txt
 *
 * PROVENANCE:
 * - Physiological Facts & Biomechanical Pairings: [LOCKED-SOURCE]
 * - Operational Parameters & Vietnamese UI Labels: [DINO DESIGN DECISION]
 * - Engineering Weights: [ENGINEERING-PROPOSAL]
 */

const PREHAB_EXERCISE_CATALOG_VERSION = "1.0-locked";

const PREHAB_EXERCISES = [
  {
    "exerciseId": "cex-inh-01",
    "matrixId": "FA-INH-01",
    "aliases": [
      "FA-INH-01",
      "KV-INH-01",
      "EFL-INH-01"
    ],
    "nameEn": "SMR Calves (Gastrocnemius/Soleus)",
    "name": "Lăn Bắp Chân (Calves)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "foot_ankle",
    "addressedImpairments": [
      "imp-lphc-lean",
      "imp-foot-turnout",
      "imp-foot-flatten",
      "imp-run-quality"
    ],
    "primaryMuscles": [
      "Gastrocnemius (medial and lateral heads)",
      "Soleus"
    ],
    "secondaryMuscles": [
      "Plantaris",
      "Achilles tendon insertion zone"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Đặt bắp chân lên ống lăn, chống hai tay nâng nhẹ hông khỏi sàn để dồn trọng lượng cơ thể lên bắp chân.",
      "Lăn chậm rãi 2–3 cm mỗi giây dọc từ gân gót lên sát khoeo chân để định vị điểm co thắt căng nhức nhất (trigger point).",
      "Dừng lại tĩnh trên điểm đau nhức nhất 30–60 giây, giữ cổ chân trung tính và hít thở sâu, chậm rãi để kích hoạt ức chế tự sinh (autogenic inhibition)."
    ],
    "commonErrors": [
      "Lăn qua lại quá nhanh liên tục",
      "thả lỏng buông thõng cổ chân",
      "gồng cứng người và nín thở."
    ],
    "cautions": "Không tì đè trực tiếp lên gân gót Achilles hoặc hố khoeo chân sau gối. Dừng lại ngay nếu xuất hiện cảm giác tê buốt dây thần kinh chày.",
    "regression": "Đặt cả hai chân cùng lúc lên ống lăn hoặc chạm nhẹ hông xuống sàn để giảm 50% áp lực.",
    "progression": "Vắt một chân qua chân kia để tăng 100% tải trọng; kết hợp chủ động gập/duỗi cổ chân (active flossing) khi đè điểm căng.",
    "preWorkout": {
      "raw": "1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 144",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Anatomy, trigger point mechanism, SMR cues: [SOURCE-VERIFIED]. Vietnamese name & Mode A/B split: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-02",
    "matrixId": "FA-INH-02",
    "aliases": [
      "FA-INH-02"
    ],
    "nameEn": "SMR Peroneals",
    "name": "Lăn Nhóm Cơ Mác (Peroneals)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "foot_ankle",
    "addressedImpairments": [
      "imp-foot-turnout",
      "imp-knee-valgus"
    ],
    "primaryMuscles": [
      "Peroneus longus",
      "Peroneus brevis",
      "Peroneus tertius"
    ],
    "secondaryMuscles": [
      "NOT SPECIFIED"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Nằm nghiêng một bên, đặt má ngoài cẳng chân lên ống lăn ở khoảng giữa mắt cá ngoài và chỏm xương mác.",
      "Dùng hai cẳng tay và bàn chân đối diện chống sàn điều tiết mức độ tì đè.",
      "Lăn chậm tìm điểm co cứng dọc dải má ngoài cẳng chân và giữ yên tĩnh áp lực trong 30–60 giây."
    ],
    "commonErrors": [
      "Lăn đè trực tiếp lên mắt cá ngoài hoặc chỏm xương mác",
      "xoay người ngửa ra sau làm lệch hướng sang bắp chân."
    ],
    "cautions": "Tránh chèn ép mạnh vào vị trí ngay dưới chỏm xương mác nơi dây thần kinh mác chung đi nông (nguy cơ tê bì mu bàn chân).",
    "regression": "Chống bàn chân đối diện phía trước chịu 60% trọng lượng; sử dụng ống lăn bọt biển mềm.",
    "progression": "Nhấc chân đối diện rời sàn; chủ động xoay cổ chân vào trong (inversion) trong khi giữ điểm đau.",
    "preWorkout": {
      "raw": "1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 145",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Peroneal anatomy & inhibition: [SOURCE-VERIFIED]. DINO operational dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-03",
    "matrixId": "KV-INH-02",
    "aliases": [
      "KV-INH-02",
      "AWS-INH-01"
    ],
    "nameEn": "SMR Adductors",
    "name": "Lăn Cơ Đùi Trong (Adductors)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "knee / lphc",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-lphc-ppt",
      "imp-field-soccer"
    ],
    "primaryMuscles": [
      "Adductor longus",
      "Adductor brevis",
      "Adductor magnus",
      "Gracilis"
    ],
    "secondaryMuscles": [
      "Pectineus"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Nằm sấp tựa trên hai cẳng tay, dang một bên đùi sang ngang và gập gối 90 độ, đặt đùi trong vuông góc lên ống lăn.",
      "Hạ thấp hông cho cơ đùi trong tiếp xúc với ống lăn từ phía trên gối vào sát vùng bẹn.",
      "Lăn chậm định vị điểm căng nhức nhất và giữ yên tĩnh áp lực từ 30–60 giây kết hợp thả lỏng cơ khép."
    ],
    "commonErrors": [
      "Lăn quá nhanh",
      "võng thắt lưng do không gồng cơ lõi",
      "đặt ống lăn quá sát xương chậu gây chèn ép mạch máu."
    ],
    "cautions": "Tránh tì đè trực tiếp lên tam giác đùi (femoral triangle) sát nếp bẹn nơi có động mạch và tĩnh mạch đùi lớn.",
    "regression": "Giữ thân mình nằm sát sàn để giảm áp lực tì trọng lượng lên ống lăn.",
    "progression": "Từ từ duỗi và gập khớp gối (knee flossing) trong khi duy trì áp lực trên điểm căng cơ đùi trong.",
    "preWorkout": {
      "raw": "1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 147",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Adductor kinetic mapping: [SOURCE-VERIFIED]. DINO dosage & soccer bias: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-04",
    "matrixId": "KV-INH-03",
    "aliases": [
      "KV-INH-03",
      "AWS-INH-02"
    ],
    "nameEn": "SMR Tensor Fascia Latae & IT Band",
    "name": "Lăn Dải Chậu Chày & Cơ Căng Mạc Đùi (TFL/ITB)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "knee / lphc",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-knee-varus",
      "imp-lphc-apt",
      "imp-foot-turnout"
    ],
    "primaryMuscles": [
      "Tensor fasciae latae (TFL)",
      "Vastus lateralis"
    ],
    "secondaryMuscles": [
      "Gluteus medius (anterior fibers)",
      "Iliotibial tract"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Nằm nghiêng một bên, đặt ống lăn ngay dưới mào chậu ở mặt trước ngoài khớp háng (vị trí bụng cơ TFL).",
      "Bắt chéo chân trên ra phía trước đặt bàn chân trên sàn để đỡ và điều chỉnh trọng lượng cơ thể.",
      "Lăn đoạn ngắn 5–10 cm tìm điểm trigger point của bụng cơ TFL và dải chậu chày ngoài, giữ yên tĩnh 30–60 giây."
    ],
    "commonErrors": [
      "Lăn đè trực tiếp lên mấu chuyển lớn xương đùi (greater trochanter)",
      "lăn dọc dải gân ITB vô cảm giác mà bỏ qua bụng cơ TFL."
    ],
    "cautions": "Tuyệt đối không lăn đè lên lồi cầu ngoài khớp gối hoặc mấu chuyển lớn (nguy cơ viêm bao hoạt dịch trochanteric).",
    "regression": "Chống hai tay và chân trước chịu 70% trọng lượng cơ thể.",
    "progression": "Duỗi thẳng hai chân chồng lên nhau tăng tối đa áp lực; hơi xoay úp thân người về trước 15 độ.",
    "preWorkout": {
      "raw": "1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 146",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "TFL overactivity anatomy: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-05",
    "matrixId": "EFL-INH-02",
    "aliases": [
      "EFL-INH-02"
    ],
    "nameEn": "SMR Quadriceps & Rectus Femoris",
    "name": "Lăn Cơ Gập Hông / Cơ Đùi Trước (Hip Flexors/Quads)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "lphc",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-lphc-lean",
      "imp-run-quality",
      "default_general"
    ],
    "primaryMuscles": [
      "Rectus femoris",
      "Vastus lateralis",
      "Vastus intermedius",
      "Vastus medialis",
      "Iliopsoas (indirectly via anterior hip)"
    ],
    "secondaryMuscles": [
      "Sartorius"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Nằm sấp ở tư thế plank cẳng tay, đặt mặt trước đùi lên ống lăn ngay dưới gai chậu trước trên (ASIS).",
      "Lăn chậm dọc mặt trước đùi từ hông xuống phía trên xương bánh chè để rà soát toàn bộ dải cơ tứ đầu.",
      "Giữ yên tĩnh 30–60 giây tại điểm căng nhức nhất ở giữa mặt trước đùi (bụng cơ Rectus femoris), thở đều đặn."
    ],
    "commonErrors": [
      "Võng thắt lưng do thả lỏng bụng",
      "lăn tì trực tiếp lên xương bánh chè khớp gối",
      "nín thở."
    ],
    "cautions": "Duy trì cơ bụng siết nhẹ giữ cột sống thắt lưng trung tính, không để cong võng thắt lưng gây kích ứng khớp gai cột sống.",
    "regression": "Đặt cả hai đùi lên ống lăn cùng lúc hoặc gác chân không lăn xuống sàn làm trụ chịu tải.",
    "progression": "Nhấc chân đối diện hoàn toàn khỏi sàn; chủ động gập khớp gối chân đang lăn 90 độ (active flossing) để kéo căng dải cơ khi đè.",
    "preWorkout": {
      "raw": "1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 148",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Rectus femoris APT mechanism: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-06",
    "matrixId": "LBR-INH-01",
    "aliases": [
      "LBR-INH-01",
      "AWS-INH-04",
      "FA-INH-03"
    ],
    "nameEn": "SMR Hamstrings (Biceps Femoris)",
    "name": "Lăn Cơ Đùi Sau (Hamstrings)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "lphc / knee",
    "addressedImpairments": [
      "imp-lphc-ppt",
      "imp-foot-turnout"
    ],
    "primaryMuscles": [
      "Biceps femoris (long and short heads)",
      "Semitendinosus",
      "Semimembranosus"
    ],
    "secondaryMuscles": [
      "NOT SPECIFIED"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Ngồi trên sàn, đặt mặt sau đùi lên ống lăn ở vị trí phía dưới ụ ngồi xương chậu.",
      "Chống hai tay phía sau nâng nhẹ hông, hơi xoay cẳng chân ra ngoài để hướng áp lực vào dải cơ nhị đầu đùi ngoài (Biceps femoris).",
      "Lăn chậm từ gốc mông xuống phía trên khoeo gối, dừng lại và giữ tĩnh 30–60 giây trên điểm co cứng."
    ],
    "commonErrors": [
      "Lăn đè sâu vào hố khoeo sau gối",
      "gù sụp vai và rụt cổ khi chống tay."
    ],
    "cautions": "Tránh ấn sâu vào hố khoeo sau gối (popliteal fossa) nơi có động mạch, tĩnh mạch khoeo và dây thần kinh chày đi nông.",
    "regression": "Đặt cả hai chân lên ống lăn cùng lúc hoặc chạm nhẹ hông xuống sàn trợ lực.",
    "progression": "Vắt một chân qua chân kia tăng áp lực; kết hợp chủ động duỗi thẳng gối khi đè điểm co cứng.",
    "preWorkout": {
      "raw": "1 set × 30–45s per leg | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 60s per leg | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 146",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Hamstring overactivity in PPT: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-07",
    "matrixId": "AWS-INH-03",
    "aliases": [
      "AWS-INH-03"
    ],
    "nameEn": "SMR Piriformis & Gluteal Complex",
    "name": "Lăn Cơ Mông Sâu / Hình Lê (Piriformis/Glutes)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "lphc",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-knee-valgus",
      "imp-foot-turnout"
    ],
    "primaryMuscles": [
      "Piriformis",
      "Gemelli",
      "Obturator internus",
      "Gluteus medius (posterior fibers)"
    ],
    "secondaryMuscles": [
      "Gluteus maximus"
    ],
    "equipment": [
      "foam_roller",
      "lacrosse_ball"
    ],
    "rawEquipment": [
      "Lacrosse Ball / Foam Roller"
    ],
    "formCues": [
      "Ngồi lên ống lăn hoặc bóng massage, vắt mắt cá chân bên cần lăn lên đầu gối chân đối diện (tư thế hình số 4).",
      "Nghiêng người dồn trọng lượng sang bên mông của chân đang vắt.",
      "Lăn chậm vùng sâu giữa mào chậu sau và mấu chuyển lớn, định vị điểm co thắt cơ hình lê và giữ tĩnh 30–60 giây."
    ],
    "commonErrors": [
      "Lăn lệch đè lên xương cùng hoặc xương cụt",
      "gồng cứng cơ mông kháng cự lại bóng."
    ],
    "cautions": "Nếu xuất hiện cảm giác tê buốt giật điện chạy dọc mặt sau đùi (kích thích dây thần kinh tọa - sciatica), dịch chuyển bóng khỏi vị trí đó ngay lập tức.",
    "regression": "Sử dụng ống lăn bọt biển phẳng thay cho bóng Lacrosse mật độ cao.",
    "progression": "Sử dụng bóng Lacrosse cứng và hạ thấp đầu gối chân vắt để bộc lộ sâu hơn các cơ xoay ngoài khớp háng.",
    "preWorkout": {
      "raw": "1 set × 30–45s per side | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 60s per side | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 149",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Piriformis anatomy & Sciatic nerve caution: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-08",
    "matrixId": "SW-INH-01",
    "aliases": [
      "SW-INH-01",
      "SE-INH-01"
    ],
    "nameEn": "SMR Latissimus Dorsi",
    "name": "Lăn Cơ Lưng Rộng (Latissimus Dorsi)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "shoulder / lphc",
    "addressedImpairments": [
      "imp-shldr-fall",
      "imp-shldr-round",
      "imp-lphc-apt",
      "default_general"
    ],
    "primaryMuscles": [
      "Latissimus dorsi",
      "Teres major"
    ],
    "secondaryMuscles": [
      "Subscapularis",
      "Triceps brachii (long head)"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Nằm nghiêng một bên, duỗi thẳng cánh tay dưới qua đầu với lòng bàn tay ngửa lên trên.",
      "Đặt ống lăn ở nách sau, ngay dưới bờ nách trên dải cơ xô.",
      "Hơi ngửa nhẹ thân trên ra sau 10–15 độ, lăn chậm tìm điểm căng nhức và giữ yên tĩnh áp lực 30–60 giây."
    ],
    "commonErrors": [
      "Ngửa người quá nhiều đè lên xương bả vai",
      "gồng cơ cổ",
      "lăn quá thấp đè lên xương sườn tự do."
    ],
    "cautions": "Tuyệt đối tránh đè lên vùng xương sườn dưới (floating ribs) hoặc tì trực tiếp lên khớp ổ chảo cánh tay.",
    "regression": "Chống bàn chân trên phía trước để chia sẻ bớt trọng lượng cơ thể.",
    "progression": "Hơi xoay nhẹ cánh tay (internal/external rotation) trong khi duy trì điểm đè; thở sâu mở rộng lồng ngực.",
    "preWorkout": {
      "raw": "1 set × 30–45s per side | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 60s per side | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 150",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Latissimus shoulder/LPHC link: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-09",
    "matrixId": "FH-INH-01",
    "aliases": [
      "FH-INH-01"
    ],
    "nameEn": "SMR Thoracic Spine Extension",
    "name": "Lăn Mở Cột Sống Ngực (Thoracic Spine Extension)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "shoulder",
    "addressedImpairments": [
      "imp-shldr-fall",
      "imp-shldr-round",
      "imp-neck-fwd"
    ],
    "primaryMuscles": [
      "Thoracic erector spinae",
      "Rhomboids",
      "Middle trapezius"
    ],
    "secondaryMuscles": [
      "Intercostals"
    ],
    "equipment": [
      "foam_roller"
    ],
    "rawEquipment": [
      "Foam Roller"
    ],
    "formCues": [
      "Nằm ngửa, đặt ống lăn ngang qua vùng lưng giữa (ngang ngực/dưới mỏm xương bả vai).",
      "Đan hai bàn tay đỡ sau gáy bảo vệ cổ, co hai gối đặt bàn chân phẳng trên sàn.",
      "Hít sâu và từ từ ngửa phần lưng trên qua ống lăn (duỗi ngực), giữ 20–30 giây mỗi phân đoạn đốt sống ngực (T12 đến T1)."
    ],
    "commonErrors": [
      "Võng gãy vùng thắt lưng (lumbar hyperextension) thay vì duỗi ngực",
      "dùng tay giật bẻ gập cổ",
      "lăn xuống vùng thắt lưng."
    ],
    "cautions": "Tuyệt đối không lăn hoặc ngửa lên cột sống thắt lưng (L1–L5) không có khung xương sườn hỗ trợ chống lực cắt.",
    "regression": "Kê gối hoặc đệm mỏng dưới đầu; ngửa ngực ở biên độ ngắn vừa phải.",
    "progression": "Vươn thẳng hai tay qua đầu thành hình chữ Y khi ngửa người qua ống lăn để tăng đòn bẩy duỗi ngực.",
    "preWorkout": {
      "raw": "1 set × 45s (3–4 phân đoạn ngực) | Tempo: Sustained Extension | Hold: 15–20s per segment | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 60s | Tempo: Sustained Extension | Hold: 30s per segment | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 151",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Thoracic extension biomechanics & lumbar prohibition: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-inh-10",
    "matrixId": "SE-INH-02",
    "aliases": [
      "SE-INH-02",
      "SE-INH-03",
      "FH-INH-04"
    ],
    "nameEn": "SMR Upper Trapezius & Levator Scapulae",
    "name": "Giải Tỏa Cơ Thang Trên (Upper Trapezius/Levator)",
    "phase": "inhibit",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "cervical_spine / shoulder",
    "addressedImpairments": [
      "imp-shldr-elev",
      "imp-neck-fwd"
    ],
    "primaryMuscles": [
      "Upper trapezius",
      "Levator scapulae"
    ],
    "secondaryMuscles": [
      "Sternocleidomastoid",
      "Splenius capitis"
    ],
    "equipment": [
      "lacrosse_ball"
    ],
    "rawEquipment": [
      "Lacrosse Ball (hoặc góc tường / cột rig)"
    ],
    "formCues": [
      "Đứng tựa bóng massage vào góc tường hoặc cột rig, kẹp bóng giữa bờ trên xương bả vai và chân cổ.",
      "Hơi nghiêng người về phía bóng tạo lực tì nén ép có kiểm soát.",
      "Giữ yên tĩnh 30–60 giây tại điểm co cứng, có thể nghiêng nhẹ đầu sang bên đối diện để tăng độ kéo giãn giải tỏa."
    ],
    "commonErrors": [
      "Đè bóng trực tiếp lên các gai đốt sống cổ (C-spine) hoặc mỏm cùng vai",
      "nhún vai gồng cứng cổ chống lại bóng."
    ],
    "cautions": "Tránh tì đè vào vùng trước cổ hoặc tam giác cổ nơi có động mạch cảnh; dừng lại ngay nếu thấy hoa mắt hoặc tê tay.",
    "regression": "Giảm bớt lực tựa người vào tường; sử dụng bóng tennis có độ mềm êm hơn.",
    "progression": "Vòng cánh tay cùng bên ra sau lưng hoặc cử động cánh tay chậm rãi lên xuống trong khi đè bóng.",
    "preWorkout": {
      "raw": "1 set × 30–45s per side | Tempo: Sustained Pressure | Hold: 30–45s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 60s per side | Tempo: Sustained Pressure | Hold: 60s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 8, p. 152",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Cervical trigger point anatomy: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-01",
    "matrixId": "FA-LEN-01",
    "aliases": [
      "FA-LEN-01",
      "KV-LEN-01",
      "EFL-LEN-01"
    ],
    "nameEn": "Static Gastrocnemius Stretch",
    "name": "Giãn Bắp Chân Tĩnh (Static Calf Stretch)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "foot_ankle",
    "addressedImpairments": [
      "imp-lphc-lean",
      "imp-foot-turnout",
      "imp-foot-flatten"
    ],
    "primaryMuscles": [
      "Gastrocnemius (medial and lateral heads)"
    ],
    "secondaryMuscles": [
      "Soleus",
      "Achilles tendon"
    ],
    "equipment": [
      "mat",
      "wall"
    ],
    "rawEquipment": [
      "Wall / Mat"
    ],
    "formCues": [
      "Đứng chống hai tay vào tường, bước một chân lùi ra phía sau tạo thế chân trước chân sau.",
      "Giữ khớp gối chân sau duỗi thẳng tuyệt đối, ngón chân sau hướng thẳng về phía trước (không xoay ra ngoài).",
      "Ấn gót chân sau bám chặt xuống sàn và từ từ đẩy hông tới trước cho đến khi thấy căng bắp chân sau, giữ yên tĩnh 20–30 giây."
    ],
    "commonErrors": [
      "Bàn chân sau bị xoay xòe ra ngoài (feet turn out)",
      "nhấc gót chân sau khỏi sàn",
      "chùng gập khớp gối chân sau."
    ],
    "cautions": "Tuyệt đối không nhấp nhún nảy (ballistic bouncing). Giữ căng tĩnh êm ái dưới ngưỡng đau.",
    "regression": "Thu ngắn khoảng cách bước chân sau để giảm góc gập cổ chân.",
    "progression": "Kê mũi bàn chân trước lên gờ dốc hoặc đĩa tạ để tăng độ gập cổ chân (dorsiflexion).",
    "preWorkout": {
      "raw": "1 set × 20–30s per leg | Tempo: Static Hold | Hold: 20–30s ($\\le 30$s cap under NSCA Ch. 14) | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 30–45s per leg | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM CEx Ch. 9, p. 166 & SOURCE-03: NSCA 4th Ed. Ch. 14 (pre-lifting static stretch cap $\\le 30$s)",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "NASM stretch mechanics & NSCA $\\le 30$s duration rule: [SOURCE-VERIFIED]. Mode A/B split: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-02",
    "matrixId": "FA-LEN-02",
    "aliases": [
      "FA-LEN-02"
    ],
    "nameEn": "Static Soleus Stretch",
    "name": "Giãn Cơ Dép Gối Gập (Static Soleus Stretch)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "foot_ankle",
    "addressedImpairments": [
      "imp-foot-turnout",
      "imp-lphc-lean",
      "imp-foot-flatten"
    ],
    "primaryMuscles": [
      "Soleus"
    ],
    "secondaryMuscles": [
      "Posterior tibialis",
      "Flexor hallucis longus"
    ],
    "equipment": [
      "mat",
      "wall"
    ],
    "rawEquipment": [
      "Wall / Mat"
    ],
    "formCues": [
      "Đứng chống hai tay vào tường tương tự bài bắp chân, nhưng thu ngắn khoảng cách bước chân sau lại.",
      "Giữ gót chân sau bám chặt sàn và chủ động chùng gập khớp gối chân sau khoảng 20–30 độ.",
      "Dồn trọng lượng cơ thể hạ thấp hông xuống cho đến khi cảm thấy căng sâu ở phần thấp của bắp chân ngay trên gót, giữ tĩnh 20–30 giây."
    ],
    "commonErrors": [
      "Nhấc gót chân sau khỏi sàn",
      "xoay bàn chân sau ra ngoài",
      "duỗi thẳng khớp gối chân sau (chuyển sang cơ bụng chân)."
    ],
    "cautions": "Không dồn lực nhấp nảy gây kích ứng gân gót Achilles.",
    "regression": "Đứng trên mặt sàn phẳng không kê gờ, hạ hông nông hơn.",
    "progression": "Đặt mũi bàn chân lên góc tường hoặc bục dốc trong khi vẫn duy trì gập khớp gối.",
    "preWorkout": {
      "raw": "1 set × 20–30s per leg | Tempo: Static Hold | Hold: 20–30s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 30–45s per leg | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 167",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Soleus knee flexion mechanics: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-03",
    "matrixId": "KV-LEN-02",
    "aliases": [
      "KV-LEN-02",
      "AWS-LEN-01"
    ],
    "nameEn": "Static Standing Adductor Stretch",
    "name": "Giãn Đùi Trong Tĩnh (Static Standing Adductor)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "knee / lphc",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-field-soccer"
    ],
    "primaryMuscles": [
      "Adductor longus",
      "Adductor brevis",
      "Adductor magnus",
      "Gracilis"
    ],
    "secondaryMuscles": [
      "Pectineus"
    ],
    "equipment": [
      "bodyweight"
    ],
    "rawEquipment": [
      "Bodyweight"
    ],
    "formCues": [
      "Đứng hai chân mở rộng gấp đôi vai, hai bàn chân song song hướng thẳng về phía trước.",
      "Chùng gối một bên, đẩy hông sang bên và lùi nhẹ ra sau như tư thế ngồi xổm một bên.",
      "Giữ chân đối diện duỗi thẳng hoàn toàn với bàn chân bám phẳng sàn, cảm nhận căng dải cơ đùi trong trong 20–30 giây."
    ],
    "commonErrors": [
      "Nhấc cạnh trong bàn chân của chân duỗi khỏi sàn",
      "gù lưng gập người quá mức",
      "gối chân gập bị sụp vào trong thay vì mở theo mũi chân."
    ],
    "cautions": "Khớp gối chân duỗi phải được giữ thẳng tự nhiên, không khóa khớp giật cục; dừng lại nếu thấy đau buốt gân khép ở háng.",
    "regression": "Chống hai tay lên đùi trước hoặc ghế bục phía trước để đỡ bớt trọng lượng cơ thể.",
    "progression": "Hạ hông sâu hơn (tư thế Cossack stretch tĩnh) hoặc xoay ngón chân chân duỗi hướng lên trần nhà.",
    "preWorkout": {
      "raw": "1 set × 20–30s per side | Tempo: Static Hold | Hold: 20–30s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 169",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Adductor lengthening anatomy: [SOURCE-VERIFIED]. DINO operational dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-04",
    "matrixId": "KV-LEN-03",
    "aliases": [
      "KV-LEN-03"
    ],
    "nameEn": "Static Standing TFL Stretch",
    "name": "Giãn Cơ Căng Mạc Đùi (Static TFL Stretch)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "knee / lphc",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-knee-varus",
      "imp-lphc-apt",
      "imp-foot-turnout"
    ],
    "primaryMuscles": [
      "Tensor fasciae latae (TFL)"
    ],
    "secondaryMuscles": [
      "Gluteus medius (anterior fibers)",
      "Iliotibial tract"
    ],
    "equipment": [
      "mat",
      "wall"
    ],
    "rawEquipment": [
      "Wall / Mat"
    ],
    "formCues": [
      "Đứng nghiêng người một bên cạnh tường, bắt chéo chân cần giãn ra phía sau chân trước.",
      "Đẩy khung chậu của chân sau dịch sang phía ngoài (hướng ra xa tường).",
      "Vươn cánh tay cùng bên chân sau lên cao qua đầu và nghiêng lườn sang phía tường, giữ yên tĩnh 20–30 giây."
    ],
    "commonErrors": [
      "Xoay vặn khung chậu về trước/sau làm mất hướng căng của cơ TFL",
      "gập người về phía trước thay vì nghiêng lườn bên."
    ],
    "cautions": "Không dồn lực bẻ vẹo cột sống thắt lưng; duy trì cơ bụng gồng nhẹ để bảo vệ lưng dưới.",
    "regression": "Đứng tựa sát lưng vào tường để duy trì thăng bằng vững chắc.",
    "progression": "Tăng góc đẩy hông sang bên và hơi xoay nhẹ thân người ra sau để mở tối đa vùng mào chậu trước ngoài.",
    "preWorkout": {
      "raw": "1 set × 20–30s per side | Tempo: Static Hold | Hold: 20–30s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 168",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "TFL stretch biomechanics: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-05",
    "matrixId": "EFL-LEN-02",
    "aliases": [
      "EFL-LEN-02"
    ],
    "nameEn": "Static Kneeling Hip Flexor Stretch",
    "name": "Giãn Cơ Gập Hông Quỳ (Kneeling Hip Flexor Stretch)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "lphc",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-lphc-lean",
      "imp-run-quality",
      "default_general"
    ],
    "primaryMuscles": [
      "Psoas major",
      "Rectus femoris",
      "Iliacus"
    ],
    "secondaryMuscles": [
      "Tensor fasciae latae",
      "Sartorius"
    ],
    "equipment": [
      "mat"
    ],
    "rawEquipment": [
      "Mat"
    ],
    "formCues": [
      "Quỳ tư thế 90/90 (một chân quỳ gối trên thảm, chân kia chống vuông góc 90 độ phía trước).",
      "Siết chặt mông chân quỳ và chủ động cuộn xương chậu ra sau (Posterior Pelvic Tilt — phẳng thắt lưng).",
      "Từ từ đẩy nhẹ hông tới trước 2–3 cm trong khi giữ thân thẳng đứng cho đến khi thấy căng mặt trước đùi và hông, giữ tĩnh 20–25 giây."
    ],
    "commonErrors": [
      "Võng cong thắt lưng (lumbar lordosis) để cố đẩy hông đi xa",
      "thả lỏng cơ mông sau",
      "nghiêng người chúi về phía trước."
    ],
    "cautions": "Tuyệt đối không để ưỡn cong cột sống thắt lưng; người có vấn đề khớp bánh chè cần kê đệm xốp dày dưới đầu gối.",
    "regression": "Chống hai tay lên ghế hoặc tường phía trước giữ vững thăng bằng.",
    "progression": "Vươn tay cùng bên chân quỳ lên cao và hơi nghiêng lườn sang bên đối diện; hoặc gác mu bàn chân sau lên ghế (Couch stretch).",
    "preWorkout": {
      "raw": "1 set × 20–25s per side | Tempo: Static Hold | Hold: 20–25s ($\\le 30$s cap) | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 170",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "PPT pelvic positioning rule: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-06",
    "matrixId": "LBR-LEN-01",
    "aliases": [
      "LBR-LEN-01",
      "AWS-LEN-04",
      "FA-LEN-03"
    ],
    "nameEn": "Static Hamstring Stretch",
    "name": "Giãn Cơ Đùi Sau Tĩnh (Static Hamstring Stretch)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "lphc",
    "addressedImpairments": [
      "imp-lphc-ppt"
    ],
    "primaryMuscles": [
      "Biceps femoris",
      "Semitendinosus",
      "Semimembranosus"
    ],
    "secondaryMuscles": [
      "Gastrocnemius"
    ],
    "equipment": [
      "bodyweight"
    ],
    "rawEquipment": [
      "Bodyweight / Strap / Bench"
    ],
    "formCues": [
      "Đặt một gót chân lên bục thấp hoặc duỗi một chân phía trước khi ngồi/nằm trên thảm.",
      "Giữ cột sống thẳng tuyệt đối (không gù lưng), khóa nhẹ xương chậu ở vị trí trung tính.",
      "Gập người từ khớp háng (hinge at the hips) đẩy ngực về phía trước cho đến khi thấy căng mặt sau đùi, giữ tĩnh 20–25 giây."
    ],
    "commonErrors": [
      "Gù cong lưng trên và thắt lưng để cố cúi đầu chạm chân",
      "khóa cứng khớp gối quá mức gây căng dây thần kinh tọa thay vì giãn cơ."
    ],
    "cautions": "Dừng lại ngay nếu xuất hiện cảm giác tê buốt châm chích ở bắp chân hoặc bàn chân (dấu hiệu căng thần kinh tọa - neural tension).",
    "regression": "Nằm ngửa trên thảm dùng dây đai vải móc vào bàn chân kéo chân lên trong khi gối hơi chùng nhẹ.",
    "progression": "Đặt chân lên bục cao hơn và gập hông sâu hơn trong khi vẫn duy trì lưng thẳng tuyệt đối.",
    "preWorkout": {
      "raw": "1 set × 20–25s per leg | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 30–45s per leg | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 171",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Hamstring stretch kinematics: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-07",
    "matrixId": "SW-LEN-01",
    "aliases": [
      "SW-LEN-01",
      "SE-LEN-01"
    ],
    "nameEn": "Static Kneeling Lat Stretch",
    "name": "Giãn Cơ Lưng Rộng Quỳ (Static Kneeling Lat Stretch)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "shoulder / lphc",
    "addressedImpairments": [
      "imp-shldr-fall",
      "imp-lphc-apt"
    ],
    "primaryMuscles": [
      "Latissimus dorsi",
      "Teres major"
    ],
    "secondaryMuscles": [
      "Posterior deltoid",
      "Triceps brachii (long head)"
    ],
    "equipment": [
      "mat"
    ],
    "rawEquipment": [
      "Mat / Bench (hoặc bóng tập)"
    ],
    "formCues": [
      "Quỳ gối trước ghế băng hoặc bục, đặt mép ngoài bàn tay (ngón cái hướng lên trần) lên mặt ghế.",
      "Giữ hai cánh tay duỗi thẳng, từ từ đẩy hông lùi ra sau về phía gót chân.",
      "Hạ ngực chìm xuống sàn cảm nhận căng dài dải cơ xô hai bên sườn, giữ tĩnh 20–25 giây kết hợp thở đều."
    ],
    "commonErrors": [
      "Ưỡn cong thắt lưng (phải giữ xương chậu trung tính, siết nhẹ bụng)",
      "gập khuỷu tay",
      "nhún vai co về phía tai."
    ],
    "cautions": "Người có tiền sử chèn ép khoang vai (shoulder impingement) nên dang hai tay rộng hơn hoặc hạ ngực ở biên độ vừa phải không gây đau nhói khớp vai.",
    "regression": "Đặt tay trên bóng tập lớn (Swiss ball) hoặc ngay trên sàn nhà.",
    "progression": "Xoay chéo thân người đưa hai tay chếch sang một bên để kéo dài dải cơ xô từng bên sâu hơn.",
    "preWorkout": {
      "raw": "1 set × 20–25s | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 30–40s | Tempo: Static Hold | Hold: 30–40s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 174",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Latissimus shoulder/APT mechanics: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-08",
    "matrixId": "SW-LEN-02",
    "aliases": [
      "SW-LEN-02"
    ],
    "nameEn": "Static Doorway Pectoral Stretch",
    "name": "Giãn Cơ Ngực Khung Cửa (Static Doorway Pectoral)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "shoulder",
    "addressedImpairments": [
      "imp-shldr-fall",
      "imp-shldr-round",
      "default_general"
    ],
    "primaryMuscles": [
      "Pectoralis major (sternal & clavicular heads)",
      "Pectoralis minor"
    ],
    "secondaryMuscles": [
      "Anterior deltoid",
      "Coracobrachialis"
    ],
    "equipment": [
      "Doorframe / Rig"
    ],
    "rawEquipment": [
      "Doorframe / Rig"
    ],
    "formCues": [
      "Đứng giữa khung cửa hoặc cột rig, đặt cẳng tay lên mép khung cửa với khuỷu tay gập 90 độ ngang tầm vai.",
      "Bước một chân tới trước tạo thế trụ vững, giữ lưng thẳng và hạ thấp vai.",
      "Từ từ dồn trọng tâm về trước cho đến khi thấy căng vùng ngực trước và mặt trước vai, giữ tĩnh 20–25 giây."
    ],
    "commonErrors": [
      "Nhô đầu và cổ ra trước (forward head)",
      "xoay vẹo thân người mất cân bằng",
      "nâng cùi chỏ quá cao gây chèn ép mỏm cùng vai."
    ],
    "cautions": "Dừng lại ngay nếu xuất hiện cảm giác đau nhói ở mặt trước chỏm xương cánh tay (dấu hiệu kéo căng bao khớp trước quá mức).",
    "regression": "Đặt cánh tay thấp hơn (khuỷu tay dưới tầm vai) hoặc giãn từng bên một.",
    "progression": "Nâng cùi chỏ lên góc 120 độ để nhắm sâu vào nhóm sợi cơ ngực bé (Pectoralis minor).",
    "preWorkout": {
      "raw": "1 set × 20–25s per side | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 30–45s per side | Tempo: Static Hold | Hold: 30–45s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 176",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Pectoral lengthening & impingement caution: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-len-09",
    "matrixId": "SE-LEN-02",
    "aliases": [
      "SE-LEN-02",
      "SE-LEN-03",
      "FH-LEN-02",
      "FH-LEN-03"
    ],
    "nameEn": "Static Upper Trapezius / Levator Stretch",
    "name": "Giãn Cơ Thang Trên / Nâng Vai (Upper Trap Stretch)",
    "phase": "lengthen",
    "category": "Corrective",
    "trainingType": "MOBILITY",
    "movementPattern": "MOBILITY",
    "kineticChainCheckpoint": "cervical_spine / shoulder",
    "addressedImpairments": [
      "imp-shldr-elev",
      "imp-neck-fwd"
    ],
    "primaryMuscles": [
      "Upper trapezius",
      "Levator scapulae"
    ],
    "secondaryMuscles": [
      "Scalenes",
      "Sternocleidomastoid"
    ],
    "equipment": [
      "bodyweight"
    ],
    "rawEquipment": [
      "Bodyweight"
    ],
    "formCues": [
      "Ngồi hoặc đứng thẳng lưng, một tay vòng ra sau lưng hoặc bám nhẹ mép ghế để chủ động hạ thấp mỏm vai bên đó.",
      "Nhẹ nhàng nghiêng tai đối diện về phía vai đối diện trong khi mắt nhìn thẳng tới trước.",
      "Đặt nhẹ các ngón tay đối diện lên đỉnh đầu (không dùng sức kéo) hỗ trợ trọng lượng giữ tĩnh 20–25 giây."
    ],
    "commonErrors": [
      "Dùng tay giật kéo mạnh đầu",
      "nhún vai đang cần giãn lên tai",
      "gập gù lưng trên."
    ],
    "cautions": "Tuyệt đối không giật mạnh hoặc vặn xoắn đột ngột đốt sống cổ. Dừng lại nếu thấy chóng mặt hoặc tê bì cánh tay.",
    "regression": "Không đặt tay lên đầu, chỉ chủ động nghiêng đầu bằng lực cơ cổ tự nhiên.",
    "progression": "Xoay cằm nhìn chếch xuống nách đối diện 45 độ để chuyển trọng tâm giãn trực tiếp vào cơ nâng vai (Levator scapulae).",
    "preWorkout": {
      "raw": "1 set × 20–25s per side | Tempo: Static Hold | Hold: 20–25s | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 30–40s per side | Tempo: Static Hold | Hold: 30–40s | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 9, p. 178",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Cervical lengthening anatomy: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-01",
    "matrixId": "FA-ACT-02",
    "aliases": [
      "FA-ACT-02",
      "KV-ACT-01",
      "EFL-ACT-01"
    ],
    "nameEn": "Isolated Tibialis Anterior Dorsiflexion",
    "name": "Gập Cổ Chân Ngược (Anterior Tibialis Dorsiflexion)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "ISOLATION",
    "kineticChainCheckpoint": "foot_ankle",
    "addressedImpairments": [
      "imp-lphc-lean",
      "imp-foot-turnout",
      "imp-foot-flatten"
    ],
    "primaryMuscles": [
      "Tibialis anterior"
    ],
    "secondaryMuscles": [
      "Extensor digitorum longus",
      "Extensor hallucis longus"
    ],
    "equipment": [
      "bodyweight",
      "mini_band",
      "wall"
    ],
    "rawEquipment": [
      "Mini-Band / Wall / Bodyweight"
    ],
    "formCues": [
      "Đứng tựa lưng và mông vào tường, hai gót chân đặt cách tường 20–30 cm.",
      "Giữ hai đầu gối duỗi thẳng, chủ động nhấc tối đa toàn bộ phần mũi bàn chân lên về phía cẳng chân (dorsiflexion).",
      "Giữ 2 giây ở đỉnh co thắt cực đại (isometric hold), sau đó hạ chậm 4 giây về mặt sàn (tempo 4/2/1)."
    ],
    "commonErrors": [
      "Đẩy hông rời khỏi tường",
      "gập cong đầu gối để nhấc chân",
      "giật nhanh không kiểm soát pha hạ eccentric."
    ],
    "cautions": "Kiểm soát hạ êm ái, tránh dộng mạnh mũi bàn chân xuống sàn gây kích ứng xương bàn chân.",
    "regression": "Ngồi trên ghế thực hiện gập cổ chân chủ động không tải hoặc đứng gần tường hơn.",
    "progression": "Móc dây kháng lực (mini-band) vào mũi chân để kéo ngược tải trọng hoặc tăng khoảng cách đứng xa tường (Tibialis raise).",
    "preWorkout": {
      "raw": "1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 194",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Isolated tibialis recruitment & 4/2/1 tempo: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-02",
    "matrixId": "KV-ACT-03",
    "aliases": [
      "KV-ACT-03",
      "AWS-ACT-01"
    ],
    "nameEn": "Side-Lying Clamshell",
    "name": "Mở Gối Nằm Nghiêng (Side-Lying Clamshell)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "ISOLATION",
    "kineticChainCheckpoint": "knee / lphc",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-lphc-apt",
      "imp-foot-turnout"
    ],
    "primaryMuscles": [
      "Gluteus medius (posterior fibers)",
      "Gluteus minimus"
    ],
    "secondaryMuscles": [
      "Piriformis",
      "Gemelli",
      "Obturator internus"
    ],
    "equipment": [
      "bodyweight",
      "mini_band"
    ],
    "rawEquipment": [
      "Mini-Band / Bodyweight"
    ],
    "formCues": [
      "Nằm nghiêng một bên, gập hông 45 độ, gập gối 90 độ, hai gót chân chụm sát vào nhau.",
      "Đặt bàn tay trên lên mào chậu giữ cố định khung chậu vuông góc tuyệt đối với sàn nhà.",
      "Mở đầu gối trên lên trần nhà mà không để xoay lật khung chậu ra sau, giữ 2 giây ở đỉnh co thắt, hạ chậm 4 giây (tempo 4/2/1)."
    ],
    "commonErrors": [
      "Lật ngửa khung chậu ra sau để nâng gối cao hơn",
      "dùng cơ TFL ở đùi trước thay vì cơ mông nhỡ",
      "nhấc rời hai gót chân."
    ],
    "cautions": "Cảm nhận kích hoạt ở má ngoài phía sau của mông; không được xuất hiện cảm giác đau nhói ở mặt trước khớp háng.",
    "regression": "Thực hiện bằng trọng lượng cơ thể không dùng dây mini-band.",
    "progression": "Đeo dây mini-band đàn hồi ngay trên hai khớp gối để tăng kháng lực xoay ngoài.",
    "preWorkout": {
      "raw": "1 set × 10–12 reps per leg | Tempo: 4/2/1 | Hold: 2s at top | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 12–15 reps per leg | Tempo: 4/2/1 | Hold: 2s at top | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 197",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Gluteus medius posterior fiber isolation: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-03",
    "matrixId": "KV-ACT-03",
    "aliases": [
      "KV-ACT-03"
    ],
    "nameEn": "Lateral Band Walk",
    "name": "Bước Ngang Với Dây Kháng Lực (Lateral Band Walk)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "ISOLATION / LOCOMOTION",
    "kineticChainCheckpoint": "knee / lphc",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-field-soccer",
      "imp-lphc-apt"
    ],
    "primaryMuscles": [
      "Gluteus medius",
      "Gluteus minimus",
      "Gluteus maximus (upper fibers)"
    ],
    "secondaryMuscles": [
      "Tensor fasciae latae (as dynamic stabilizer)"
    ],
    "equipment": [
      "mini_band"
    ],
    "rawEquipment": [
      "Mini-Band"
    ],
    "formCues": [
      "Đeo dây mini-band quanh hai mũi chân hoặc trên cổ chân, hai bàn chân mở rộng bằng hông.",
      "Hạ thấp trọng tâm vào tư thế athletic quarter-squat, hai bàn chân song song hướng thẳng tới trước.",
      "Bước ngang từng bước chậm có kiểm soát, duy trì độ căng của dây liên tục, không để hai đầu gối chụm vào nhau."
    ],
    "commonErrors": [
      "Xoay xòe hai bàn chân sang hai bên (feet turn out)",
      "gối bị sụp vào trong khi bước",
      "thân trên lắc lư lắc lư sang hai bên."
    ],
    "cautions": "Duy trì cột sống thắt lưng trung tính, không ưỡn thắt lưng khi bước.",
    "regression": "Đeo dây mini-band lên phía trên khớp gối để rút ngắn cánh tay đòn kháng lực.",
    "progression": "Đeo dây mini-band quanh hai mũi bàn chân (kích hoạt đồng thời cơ xoay ngoài và cơ mông nhỡ mạnh nhất theo nghiên cứu EMG).",
    "preWorkout": {
      "raw": "1 set × 10–12 steps per side | Tempo: Controlled | Hold: 1s at landing | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 15 steps per side | Tempo: Controlled | Hold: 1s at landing | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 198",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Band placement EMG kinetics: [SOURCE-VERIFIED]. DINO operational dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-04",
    "matrixId": "EFL-ACT-02",
    "aliases": [
      "EFL-ACT-02",
      "KV-ACT-04",
      "LBR-ACT-01"
    ],
    "nameEn": "Floor Glute Bridge",
    "name": "Cầu Mông Sàn (Floor Glute Bridge)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "HINGE",
    "kineticChainCheckpoint": "lphc",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-lphc-lean",
      "imp-run-quality",
      "default_general"
    ],
    "primaryMuscles": [
      "Gluteus maximus"
    ],
    "secondaryMuscles": [
      "Hamstrings (as synergists)",
      "Erector spinae",
      "Transverse abdominis"
    ],
    "equipment": [
      "bodyweight",
      "mini_band",
      "mat"
    ],
    "rawEquipment": [
      "Mat / Bodyweight / Mini-Band"
    ],
    "formCues": [
      "Nằm ngửa trên thảm, gập hai gối đặt bàn chân phẳng trên sàn cách mông một gang tay, hai gối mở ngang vai.",
      "Cuộn nhẹ xương chậu ra sau (phẳng thắt lưng xuống sàn), gồng nhẹ cơ bụng.",
      "Ấn gót chân đẩy hông lên tạo thành đường thẳng từ gối đến vai, siết chặt cơ mông 2 giây ở đỉnh, hạ chậm 4 giây (tempo 4/2/1)."
    ],
    "commonErrors": [
      "Đẩy hông quá cao bằng cách ưỡn gãy thắt lưng (lumbar hyperextension)",
      "nhấc mũi chân hoặc gót chân",
      "dùng cơ đùi sau co rút thay vì cơ mông."
    ],
    "cautions": "Khóa chặt xương chậu ở vị trí trung tính; không để xuất hiện cảm giác căng tức ở vùng cột sống thắt lưng.",
    "regression": "Đặt hai tay úp sát sàn trợ lực thăng bằng; rút ngắn biên độ nâng hông.",
    "progression": "Single-Leg Glute Bridge (cầu mông một chân) hoặc kẹp dây mini-band quanh đùi giữ mở gối.",
    "preWorkout": {
      "raw": "1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s isometric hold at top | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s isometric hold at top | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 196",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Gluteus maximus recruitment mechanics: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-05",
    "matrixId": "DEADBUG-01",
    "aliases": [
      "DEADBUG-01"
    ],
    "nameEn": "Deadbug Stabilization",
    "name": "Côn Trùng Chết Kích Hoạt Lõi (Deadbug Core Activation)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORE",
    "movementPattern": "CORE",
    "kineticChainCheckpoint": "lphc",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-lphc-lean"
    ],
    "primaryMuscles": [
      "Transverse abdominis",
      "Multifidus",
      "Internal obliques"
    ],
    "secondaryMuscles": [
      "Rectus abdominis",
      "Hip flexors (isometric stabilization)"
    ],
    "equipment": [
      "mat"
    ],
    "rawEquipment": [
      "Mat"
    ],
    "formCues": [
      "Nằm ngửa trên thảm, giơ hai tay thẳng lên trần nhà, nâng hai gối gập 90 độ (tư thế tabletop).",
      "Thở hết khí ra siết chặt cơ bụng ép chặt toàn bộ cột sống thắt lưng dính sát xuống mặt sàn (không có khe hở).",
      "Từ từ duỗi một tay qua đầu và chân đối diện duỗi thẳng hạ sát sàn trong khi lưng dưới vẫn dính chặt sàn, giữ 1 giây rồi thu về đổi bên."
    ],
    "commonErrors": [
      "Thắt lưng bị võng rời khỏi mặt sàn khi duỗi chân (mất kiểm soát chống ưỡn - anti-extension)",
      "nín thở gồng cổ",
      "duỗi chân quá nhanh."
    ],
    "cautions": "Ngừng động tác ngay nếu lưng dưới bị nhấc khỏi thảm gây đau mỏi vùng thắt lưng.",
    "regression": "Chỉ hạ chân chạm gót nhẹ xuống sàn với gối gập (bent-knee tap) không duỗi thẳng chân; giữ hai tay cố định.",
    "progression": "Cầm tạ nhẹ trên tay hoặc kẹp bóng ổn định giữa đầu gối và bàn tay đối diện.",
    "preWorkout": {
      "raw": "1 set × 8–10 reps per side | Tempo: Controlled | Hold: 1s at extension | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 10–12 reps per side | Tempo: Controlled | Hold: 1s at extension | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "quality_run",
      "easy_run",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM CEx Ch. 10, p. 200 & SOURCE-02: NASM PES Ch. 8",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Anti-extension core stabilization: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-06",
    "matrixId": "LBR-ACT-03",
    "aliases": [
      "LBR-ACT-03"
    ],
    "nameEn": "Quadruped Bird-Dog",
    "name": "Chim Chó Giữ Thăng Bằng (Quadruped Bird-Dog)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORE",
    "movementPattern": "CORE",
    "kineticChainCheckpoint": "lphc",
    "addressedImpairments": [
      "imp-lphc-ppt",
      "imp-lphc-apt"
    ],
    "primaryMuscles": [
      "Erector spinae",
      "Gluteus maximus",
      "Multifidus"
    ],
    "secondaryMuscles": [
      "Posterior deltoid",
      "Middle/Lower trapezius",
      "Core stabilizers"
    ],
    "equipment": [
      "mat"
    ],
    "rawEquipment": [
      "Mat"
    ],
    "formCues": [
      "Quỳ chống bốn điểm trên sàn (cổ tay thẳng dưới vai, khớp gối thẳng dưới hông, cột sống trung tính).",
      "Đồng thời vươn thẳng một tay tới trước và duỗi chân đối diện ra sau ngang tầm thân người.",
      "Giữ vững thân người không nghiêng lắc, siết chặt cơ mông và cơ dựng sống lưng trong 2 giây trước khi hạ xuống đổi bên."
    ],
    "commonErrors": [
      "Đá chân quá cao làm võng gãy thắt lưng (hyperextension)",
      "lật nghiêng khung chậu sang bên",
      "gục đầu rụt cổ."
    ],
    "cautions": "Giữ mắt nhìn thẳng xuống sàn để cột sống cổ luôn thẳng hàng với cột sống ngực và thắt lưng.",
    "regression": "Chỉ nhấc riêng từng tay hoặc từng chân một lần để giảm đòi hỏi thăng bằng.",
    "progression": "Giữ 3–5 giây ở đỉnh co thắt hoặc dùng cùi chỏ chạm đầu gối dưới bụng trước khi duỗi thẳng lại.",
    "preWorkout": {
      "raw": "1 set × 8–10 reps per side | Tempo: 4/2/1 | Hold: 2s hold at extension | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 10–12 reps per side | Tempo: 4/2/1 | Hold: 2s hold at extension | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM CEx Ch. 10, p. 201 & McGill Spine Stabilization",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "McGill posterior chain stabilization: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-07",
    "matrixId": "SE-ACT-01",
    "aliases": [
      "SE-ACT-01"
    ],
    "nameEn": "Prone Cobra (Lower Trap / Rhomboids)",
    "name": "Rắn Hổ Mang Nằm Sấp (Prone Cobra)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "ISOLATION / PULL",
    "kineticChainCheckpoint": "shoulder",
    "addressedImpairments": [
      "imp-shldr-fall",
      "imp-shldr-elev",
      "imp-neck-fwd"
    ],
    "primaryMuscles": [
      "Middle trapezius",
      "Lower trapezius",
      "Rhomboids",
      "Infraspinatus",
      "Teres minor"
    ],
    "secondaryMuscles": [
      "Erector spinae",
      "Deep cervical flexors"
    ],
    "equipment": [
      "mat"
    ],
    "rawEquipment": [
      "Mat"
    ],
    "formCues": [
      "Nằm sấp trên thảm, hai chân duỗi thẳng, hai tay xuôi theo thân với ngón tay cái hướng lên trần nhà.",
      "Thu cằm nhẹ (chin tuck), siết hai xương bả vai kéo xuống về phía hông (scapular depression & retraction).",
      "Nhấc nhẹ lồng ngực khỏi sàn 5–10 cm và xoay ngoài cánh tay, giữ yên tĩnh 2 giây ở đỉnh co thắt, hạ chậm 4 giây (tempo 4/2/1)."
    ],
    "commonErrors": [
      "Ngửa cổ quá mức nhăn trán (hyperextending cervical spine)",
      "nhún vai co về phía tai",
      "dùng thắt lưng giật nảy người."
    ],
    "cautions": "Luôn duy trì mắt nhìn thẳng xuống sàn để giữ cột sống cổ thẳng trục với cột sống ngực.",
    "regression": "Đặt một chiếc khăn cuộn đỡ trán, chỉ nhấc hai cánh tay và siết hai bả vai không cần nâng ngực.",
    "progression": "Đưa hai cánh tay ra góc chữ Y (Prone Y-raise) để tăng đòn bẩy kích hoạt cơ thang dưới (Lower trapezius).",
    "preWorkout": {
      "raw": "1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s at top | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 204",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Scapular depression/retraction kinematics: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-08",
    "matrixId": "SE-ACT-01",
    "aliases": [
      "SE-ACT-01",
      "FH-ACT-03"
    ],
    "nameEn": "Band Pull-Apart / External Rotation",
    "name": "Kéo Dây Ngang Ngực (Band Pull-Apart / W-External)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "ISOLATION / PULL",
    "kineticChainCheckpoint": "shoulder",
    "addressedImpairments": [
      "imp-shldr-round",
      "imp-shldr-fall",
      "default_general"
    ],
    "primaryMuscles": [
      "Infraspinatus",
      "Teres minor",
      "Rhomboids",
      "Posterior deltoid"
    ],
    "secondaryMuscles": [
      "Middle trapezius"
    ],
    "equipment": [
      "mini_band"
    ],
    "rawEquipment": [
      "Mini-Band / Light Elastic Band"
    ],
    "formCues": [
      "Đứng thẳng, hai tay cầm dây kháng lực đưa thẳng ra trước ngực ngang tầm vai.",
      "Giữ khuỷu tay hơi chùng nhẹ, siết hai xương bả vai kéo dây sang ngang hai bên cho đến khi chạm ngực.",
      "Giữ 2 giây ở vị trí co thắt ép chặt hai bả vai, nhả chậm 4 giây về phía trước (tempo 4/2/1)."
    ],
    "commonErrors": [
      "Ưỡn thắt lưng ra sau để kéo dây",
      "nhún vai co lên tai",
      "gập cùi chỏ biến thành động tác kéo chèo (row)."
    ],
    "cautions": "Giữ xương sườn hạ thấp (ribs down) và cơ bụng siết nhẹ để chống ưỡn cong thắt lưng.",
    "regression": "Cầm dây rộng hơn để giảm độ căng của dây kháng lực.",
    "progression": "Đổi góc kéo thành hình chữ W hoặc tăng độ đàn hồi của dây kháng lực.",
    "preWorkout": {
      "raw": "1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s at contraction | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s at contraction | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 205",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Rotator cuff external rotation mechanics: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-09",
    "matrixId": "FH-ACT-01",
    "aliases": [
      "FH-ACT-01"
    ],
    "nameEn": "Chin Tuck (Deep Cervical Flexors)",
    "name": "Thu Cằm Giữ Cổ (Chin Tuck Retraction)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "ISOLATION",
    "kineticChainCheckpoint": "cervical_spine",
    "addressedImpairments": [
      "imp-neck-fwd",
      "imp-shldr-elev"
    ],
    "primaryMuscles": [
      "Longus capitis",
      "Longus colli (Deep Cervical Flexors)"
    ],
    "secondaryMuscles": [
      "Rectus capitis anterior",
      "Rectus capitis lateralis"
    ],
    "equipment": [
      "bodyweight",
      "mat"
    ],
    "rawEquipment": [
      "Bodyweight / Mat"
    ],
    "formCues": [
      "Nằm ngửa trên sàn hoặc đứng thẳng tựa lưng vào tường, mắt nhìn thẳng tới trước.",
      "Nhẹ nhàng trượt đầu lùi thẳng ra sau tạo tư thế \"hai cằm\" (double chin) mà không cúi gập đầu.",
      "Ấn nhẹ gáy vào sàn/tường cảm nhận cơ sâu trước cổ kích hoạt, giữ 2 giây ở đỉnh rồi nhả chậm 4 giây."
    ],
    "commonErrors": [
      "Cúi gập cổ gí cằm vào xương ức",
      "nín thở",
      "dùng cơ ức đòn chũm (SCM) gồng cứng hai bên cổ."
    ],
    "cautions": "Chuyển động ở biên độ ngắn, êm ái; tuyệt đối không dùng tay đẩy thô bạo vào cằm.",
    "regression": "Ngồi thẳng tựa lưng vào ghế có tựa đầu cao để cảm nhận điểm tựa.",
    "progression": "Nằm ngửa thu cằm và nhấc nhẹ đầu lên khỏi mặt thảm 1 cm giữ tĩnh 5 giây (Chin tuck with head lift).",
    "preWorkout": {
      "raw": "1 set × 10–12 reps | Tempo: 4/2/1 | Hold: 2s hold | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 12–15 reps | Tempo: 4/2/1 | Hold: 2s hold | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 206",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Deep cervical flexor activation: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-act-10",
    "matrixId": "KV-ACT-02",
    "aliases": [
      "KV-ACT-02"
    ],
    "nameEn": "Terminal Knee Extension (TKE)",
    "name": "Duỗi Gối Khóa Khớp Gối VMO (Terminal Knee Extension)",
    "phase": "activate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "ISOLATION",
    "kineticChainCheckpoint": "knee",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-knee-varus",
      "imp-field-soccer"
    ],
    "primaryMuscles": [
      "Vastus medialis oblique (VMO)"
    ],
    "secondaryMuscles": [
      "Vastus lateralis",
      "Vastus intermedius"
    ],
    "equipment": [
      "mini_band"
    ],
    "rawEquipment": [
      "Mini-Band (hoặc dây kháng lực móc vào cột)"
    ],
    "formCues": [
      "Móc một đầu dây kháng lực vào cột ngang tầm gối, đầu kia luồn sau khoeo chân bên tập.",
      "Đứng chân đó hơi lùi lại sao cho dây kéo khớp gối hơi gập nhẹ về phía trước.",
      "Dồn lực siết cơ đùi trong (VMO) duỗi thẳng hoàn toàn khớp gối ấn gót chân xuống sàn, giữ 2 giây ở đỉnh trước khi nhả chậm 4 giây."
    ],
    "commonErrors": [
      "Ưỡn thắt lưng ra sau để khóa gối",
      "nhấc gót chân lên",
      "duỗi gối giật cục mạnh bạo."
    ],
    "cautions": "Khóa gối bằng sự co rút chủ động của cơ VMO, không để dây kéo giật ngược khớp gối về sau (hyperextension).",
    "regression": "Ngồi trên ghế kê khăn cuộn dưới khoeo chân, duỗi gối tĩnh co siết cơ đùi trong.",
    "progression": "Đứng trên thảm xốp thăng bằng hoặc tăng độ căng của dây kháng lực.",
    "preWorkout": {
      "raw": "1 set × 12–15 reps per leg | Tempo: 4/2/1 | Hold: 2s at full extension | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 15 reps per leg | Tempo: 4/2/1 | Hold: 2s at full extension | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 10, p. 195",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "VMO isolated terminal extension: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-01",
    "matrixId": "EFL-INT-01",
    "aliases": [
      "EFL-INT-01",
      "LBR-INT-01",
      "KV-INT-01",
      "AWS-INT-01"
    ],
    "nameEn": "Pause Squat (3s Isometric Pause)",
    "name": "Squat Giữ Dưới Đáy 3 Giây (Goblet / Bodyweight Pause Squat)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "SQUAT",
    "kineticChainCheckpoint": "lphc / knee / foot_ankle",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-lphc-ppt",
      "imp-lphc-lean",
      "imp-knee-valgus",
      "imp-knee-varus",
      "default_general"
    ],
    "primaryMuscles": [
      "Quadriceps",
      "Gluteus maximus",
      "Adductor magnus"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Core complex",
      "Soleus",
      "Gastrocnemius"
    ],
    "equipment": [
      "bodyweight",
      "dumbbell"
    ],
    "rawEquipment": [
      "Bodyweight / Light Dumbbell"
    ],
    "formCues": [
      "Đứng hai chân rộng bằng vai, mũi chân mở nhẹ 15–20 độ theo hướng tự nhiên của khớp háng.",
      "Ngồi xổm kiểm soát hạ chậm xuống vị trí đùi song song sàn, chủ động mở hai đầu gối thẳng hàng với ngón chân thứ hai.",
      "Dừng tĩnh tuyệt đối 3 giây dưới đáy không nhấp nhô, giữ ngực mở lưng thẳng, đạp sàn đứng lên dứt khoát."
    ],
    "commonErrors": [
      "Sụp đầu gối vào trong (valgus collapse) khi dừng dưới đáy",
      "nhấc gót chân khỏi sàn",
      "cong cụp lưng dưới (butt wink)."
    ],
    "cautions": "Chỉ dừng ở biên độ sâu mà cột sống thắt lưng vẫn duy trì được độ cong sinh lý tự nhiên.",
    "regression": "Squat xuống ghế hộp (Box pause squat) bằng trọng lượng cơ thể.",
    "progression": "Cầm tạ dumbbell nhẹ 5–10 kg trước ngực (Goblet pause squat).",
    "preWorkout": {
      "raw": "1 set × 8–10 reps | Tempo: Controlled | Hold: 3s isometric pause at bottom | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 10–12 reps | Tempo: Controlled | Hold: 3s isometric pause at bottom | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 11, p. 214",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Multi-joint integrated squat pause: [SOURCE-VERIFIED]. DINO Mode A/B dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-02",
    "matrixId": "SE-INT-01",
    "aliases": [
      "SE-INT-01",
      "FA-INT-01"
    ],
    "nameEn": "Single-Leg Romanian Deadlift to Balance",
    "name": "RDL 1 Chân Giữ Thăng Bằng (Single-Leg RDL to Balance)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "HINGE / LOCOMOTION",
    "kineticChainCheckpoint": "lphc / knee / foot_ankle",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-knee-valgus",
      "imp-run-quality"
    ],
    "primaryMuscles": [
      "Hamstrings",
      "Gluteus maximus",
      "Gluteus medius (dynamic frontal stabilizer)"
    ],
    "secondaryMuscles": [
      "Erector spinae",
      "Core stabilizers",
      "Intrinsic foot muscles"
    ],
    "equipment": [
      "bodyweight"
    ],
    "rawEquipment": [
      "Bodyweight"
    ],
    "formCues": [
      "Đứng thăng bằng trên một chân, khớp gối chân trụ hơi chùng nhẹ 10 độ.",
      "Đẩy hông ra sau cúi người với thân thẳng như đòn bập bênh trong khi chân kia duỗi thẳng ra sau ngang tầm sàn.",
      "Dùng cơ mông và gân kheo kéo người đứng thẳng dậy, đồng thời co đầu gối chân sau lên 90 độ giữ thăng bằng 2 giây trước ngực."
    ],
    "commonErrors": [
      "Xoay lật khung chậu mở sang bên",
      "gù lưng cúi người bằng thắt lưng",
      "chân trụ bị sụp vòm hoặc sụp gối vào trong."
    ],
    "cautions": "Giữ cột sống thẳng trục từ đầu đến gót chân sau; không khóa cứng khớp gối chân trụ.",
    "regression": "Chạm nhẹ mũi chân sau xuống sàn khi đứng lên để hỗ trợ thăng bằng.",
    "progression": "Cầm tạ dumbbell nhẹ ở tay đối diện chân trụ hoặc đứng trên thảm xốp thăng bằng (balance pad).",
    "preWorkout": {
      "raw": "1 set × 6–8 reps per leg | Tempo: Controlled | Hold: 2s hold at top | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 8–10 reps per leg | Tempo: Controlled | Hold: 2s hold at top | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "quality_run",
      "easy_run",
      "soccer",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM CEx Ch. 11, p. 216 & SOURCE-02: NASM PES Ch. 9",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Single-leg balance reach kinematics: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-03",
    "matrixId": "FA-INT-03",
    "aliases": [
      "FA-INT-03",
      "KV-INT-01"
    ],
    "nameEn": "Multi-Planar Lunge with Rotation",
    "name": "Lunge Đa Mặt Phẳng Xoay Thân (Lunge with Trunk Rotation)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "LUNGE / ROTATION",
    "kineticChainCheckpoint": "lphc / knee",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-field-soccer"
    ],
    "primaryMuscles": [
      "Quadriceps",
      "Gluteus maximus",
      "Adductors",
      "Core obliques"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Calves",
      "Erector spinae"
    ],
    "equipment": [
      "bodyweight"
    ],
    "rawEquipment": [
      "Bodyweight"
    ],
    "formCues": [
      "Đứng thẳng, bước một chân dài tới trước hạ thấp trọng tâm vào tư thế lunge 90/90.",
      "Giữ đầu gối chân trước mở thẳng theo ngón chân thứ hai, xoay nhẹ thân trên qua phía đùi chân trước.",
      "Xoay thân về giữa và đạp mạnh gót chân trước thu người về vị trí đứng ban đầu, sau đó đổi bên."
    ],
    "commonErrors": [
      "Gối chân trước bị trôi sụp vào trong khi xoay thân",
      "thân trên đổ chúi ra trước",
      "bước chân quá ngắn."
    ],
    "cautions": "Đầu gối chân trước luôn thẳng hàng với ngón chân thứ hai; không để lực xoay thân làm vặn xoắn khớp gối.",
    "regression": "Bước lunge tĩnh tại chỗ (split squat) rồi mới xoay thân nhẹ, không bước tiến/lùi.",
    "progression": "Cầm bóng tạ nhẹ hoặc thực hiện theo phương lunge ngang (lateral lunge with rotation).",
    "preWorkout": {
      "raw": "1 set × 6–8 reps per side | Tempo: Controlled | Hold: 1s at rotation | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 10 reps per side | Tempo: Controlled | Hold: 1s at rotation | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "lower",
      "soccer",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-02: NASM Essentials of Sports Performance Training, Chapter 6, p. 158",
      "sourceId": "SOURCE-02"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Multi-planar athletic lunge protocol: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-04",
    "matrixId": "KV-INT-01",
    "aliases": [
      "KV-INT-01"
    ],
    "nameEn": "Lateral Skater Hop with Stabilization",
    "name": "Bước Bật Trượt Băng Giữ Thăng Bằng (Skater Hop with Stick)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "LOCOMOTION / ISOLATION",
    "kineticChainCheckpoint": "knee / lphc / foot_ankle",
    "addressedImpairments": [
      "imp-knee-valgus",
      "imp-field-soccer",
      "imp-lphc-apt"
    ],
    "primaryMuscles": [
      "Gluteus medius",
      "Gluteus maximus",
      "Quadriceps"
    ],
    "secondaryMuscles": [
      "Hamstrings",
      "Gastrocnemius",
      "Peroneals"
    ],
    "equipment": [
      "bodyweight"
    ],
    "rawEquipment": [
      "Bodyweight"
    ],
    "formCues": [
      "Đứng thăng bằng trên một chân, khớp gối chùng nhẹ ở tư thế chuẩn bị.",
      "Dùng lực cơ mông bật nhảy ngang sang bên đối diện khoảng 1–1.5 mét.",
      "Tiếp đất êm ái trên chân đối diện bằng cách chùng gối và hạ hông, \"dính chặt\" (stick) mặt sàn giữ thăng bằng tuyệt đối trong 2 giây trước khi bật ngược lại."
    ],
    "commonErrors": [
      "Tiếp đất đầu gối bị sụp vào trong (valgus collapse)",
      "tiếp đất cứng bằng gót chân phát ra tiếng động lớn",
      "mất thăng bằng ngã nghiêng."
    ],
    "cautions": "Không thực hiện nếu đang có chấn thương cấp tính dây chằng chéo trước (ACL) hoặc bong gân mắt cá chân chưa hồi phục.",
    "regression": "Bước dậm chân ngang không bật nhảy (lateral step with balance reach).",
    "progression": "Tăng khoảng cách bật nhảy hoặc tăng tốc độ chuyển hướng sau khi giữ thăng bằng 2 giây.",
    "preWorkout": {
      "raw": "1 set × 6 hops per side | Tempo: Explosive with 2s Stick | Hold: 2s stick landing | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 8 hops per side | Tempo: Explosive with 2s Stick | Hold: 2s stick landing | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "soccer",
      "quality_run",
      "lower",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-02: NASM Essentials of Sports Performance Training, Chapter 10, p. 278",
      "sourceId": "SOURCE-02"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Frontal plane reactive deceleration: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-05",
    "matrixId": "FA-INT-03",
    "aliases": [
      "FA-INT-03"
    ],
    "nameEn": "A-Skip & Ankling Dynamic Prep",
    "name": "Bước Nâng Gối Kỹ Thuật Chạy (A-Skip & Ankling Drills)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "LOCOMOTION",
    "kineticChainCheckpoint": "foot_ankle / lphc",
    "addressedImpairments": [
      "imp-run-quality",
      "imp-foot-turnout",
      "imp-lphc-apt"
    ],
    "primaryMuscles": [
      "Gastrocnemius",
      "Soleus",
      "Tibialis anterior",
      "Psoas",
      "Gluteus maximus"
    ],
    "secondaryMuscles": [
      "Quadriceps",
      "Hamstrings"
    ],
    "equipment": [
      "bodyweight"
    ],
    "rawEquipment": [
      "Bodyweight"
    ],
    "formCues": [
      "Đứng thẳng, nhịp nhàng nhún nhảy trên nửa bàn chân trước (ball of foot) duy trì độ cứng vững khớp cổ chân (ankle stiffness).",
      "Nâng đầu gối một bên lên ngang tầm hông, cổ chân chủ động gập ngược (dorsiflexed).",
      "Đập nhịp nhàng nửa bàn chân xuống sàn ngay dưới trọng tâm cơ thể và chuyển nhịp nhún nhảy sang chân kia."
    ],
    "commonErrors": [
      "Ngửa người ra sau",
      "thả lỏng buông thõng cổ chân (plantarflexed)",
      "tiếp đất bằng gót chân."
    ],
    "cautions": "Thực hiện trên bề mặt phẳng có độ đàn hồi tốt; tránh nếu đang đau gân gót Achilles cấp tính.",
    "regression": "Đi bộ nâng gối kỹ thuật (A-Walk) nhấn mạnh gập cổ chân và siết cơ mông chân trụ.",
    "progression": "Chuyển sang động tác chạy nâng gối nhanh (A-Run) hoặc tăng tần số guồng chân (cadence).",
    "preWorkout": {
      "raw": "1 set × 15–20 mét (hoặc 15–20 nhịp) | Tempo: Rhythmic Dynamic | Hold: None | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 20–30 mét | Tempo: Rhythmic Dynamic | Hold: None | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "quality_run",
      "easy_run",
      "soccer"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-02: NASM PES Ch. 11, p. 308 & SOURCE-03: NSCA 4th Ed. Ch. 19/20",
      "sourceId": "SOURCE-02"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Sprint running mechanics & stiffness: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-06",
    "matrixId": "SE-INT-01",
    "aliases": [
      "SE-INT-01"
    ],
    "nameEn": "Overhead Band Walk / Carry",
    "name": "Đi Bước Xách Tạ / Dây Qua Đầu (Overhead Carry / Band Walk)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "CARRY",
    "kineticChainCheckpoint": "shoulder",
    "addressedImpairments": [
      "imp-shldr-fall",
      "imp-shldr-round"
    ],
    "primaryMuscles": [
      "Lower trapezius",
      "Serratus anterior",
      "Rotator cuff complex"
    ],
    "secondaryMuscles": [
      "Upper trapezius",
      "Deltoids",
      "Core abdominal wall"
    ],
    "equipment": [
      "mini_band",
      "dumbbell"
    ],
    "rawEquipment": [
      "Mini-Band / Light Dumbbell"
    ],
    "formCues": [
      "Đeo dây mini-band quanh hai cổ tay hoặc cầm tạ dumbbell rất nhẹ đẩy thẳng hai tay qua đầu.",
      "Khóa thẳng khuỷu tay, chủ động đẩy bả vai vươn lên cao (scapular upward rotation), giữ sườn hạ thấp siết chặt cơ bụng.",
      "Bước từng bước chậm rãi tới trước 10–15 mét trong khi duy trì hai cánh tay thẳng đứng sát mang tai."
    ],
    "commonErrors": [
      "Võng thắt lưng (lumbar hyperextension) để đưa tay ra sau",
      "gập khuỷu tay",
      "nhô đầu chúi ra trước."
    ],
    "cautions": "Không thực hiện nếu có hội chứng cấn khớp vai cấp tính hoặc mất vững khớp vai tái hồi.",
    "regression": "Đi bước giơ hai tay không tải (bodyweight overhead walk) hoặc đưa tay tư thế chữ Y.",
    "progression": "Single-Arm Overhead Dumbbell Waiter's Walk tăng thử thách chống nghiêng vặn thân mình.",
    "preWorkout": {
      "raw": "1 set × 15–20 mét (8–10 bước chậm) | Tempo: Controlled | Hold: Sustained Overhead | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2–3 sets × 20–25 mét | Tempo: Controlled | Hold: Sustained Overhead | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 11, p. 218",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Scapular upward rotation integration: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-07",
    "matrixId": "SW-INT-01",
    "aliases": [
      "SW-INT-01"
    ],
    "nameEn": "Standing One-Arm Cable Chest Press",
    "name": "Đẩy Ngực Một Tay Với Dây Cáp (Standing One-Arm Cable Chest Press)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "PUSH",
    "kineticChainCheckpoint": "shoulder",
    "addressedImpairments": [
      "imp-scap-wing",
      "imp-shldr-round",
      "imp-shldr-fall"
    ],
    "primaryMuscles": [
      "Serratus anterior",
      "Pectoralis major",
      "Core rotators / stabilizers"
    ],
    "secondaryMuscles": [
      "Anterior deltoid",
      "Triceps brachii",
      "Gluteus medius/maximus (anti-rotation)"
    ],
    "equipment": [
      "cable"
    ],
    "rawEquipment": [
      "Cable Machine / Resistance Cable"
    ],
    "formCues": [
      "Đứng vào tư thế so le (staggered stance) trước máy kéo cáp, tay cùng bên chân sau cầm tay cầm cáp ở độ cao ngang ngực.",
      "Giữ trục cột sống thẳng, siết chặt cơ bụng và mông để chống xoay thân người.",
      "Đẩy tay cầm cáp ra phía trước thành một chuyển động kiểm soát, chủ động vươn bả vai (protraction) ở cuối tầm, sau đó kiểm soát đưa tay về vị trí ban đầu."
    ],
    "commonErrors": [
      "Xoay vặn thân người mất kiểm soát khi đẩy cáp",
      "nhún vai về phía tai",
      "ưỡn thắt lưng bù trừ."
    ],
    "cautions": "Đây là bài tập liên kết toàn bộ chuỗi động lực (neuromuscular integration), sử dụng mức kháng lực nhẹ để ưu tiên độ vững trục và kích hoạt serratus anterior.",
    "regression": "Giảm mức kháng lực cáp hoặc thực hiện ở tư thế hai chân song song hẹp (bilateral stance).",
    "progression": "Tăng khoảng cách bước so le hoặc kết hợp bước chân luân phiên (step and press).",
    "preWorkout": {
      "raw": "1 set × 8–10 reps per arm | Tempo: 2/1/2 | Hold: 1s at full extension | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 10–12 reps per arm | Tempo: 2/1/2 | Hold: 1s at full extension | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "upper",
      "full_body",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 15",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Dynamic multi-joint integration: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  },
  {
    "exerciseId": "cex-int-08",
    "matrixId": "EFL-INT-01",
    "aliases": [
      "EFL-INT-01",
      "FH-INT-01",
      "LBR-INT-01"
    ],
    "nameEn": "Squat to Overhead Press Integration",
    "name": "Squat Đẩy Tạ Qua Đầu (Squat to Overhead Press)",
    "phase": "integrate",
    "category": "Corrective",
    "trainingType": "CORRECTIVE",
    "movementPattern": "SQUAT / PUSH",
    "kineticChainCheckpoint": "lphc / shoulder / knee",
    "addressedImpairments": [
      "imp-lphc-apt",
      "imp-shldr-fall",
      "default_general"
    ],
    "primaryMuscles": [
      "Quadriceps",
      "Gluteus maximus",
      "Deltoids (anterior/medial)",
      "Lower trapezius"
    ],
    "secondaryMuscles": [
      "Triceps brachii",
      "Core complex",
      "Gastrocnemius"
    ],
    "equipment": [
      "bodyweight",
      "mini_band",
      "dumbbell"
    ],
    "rawEquipment": [
      "Light Dumbbell / Mini-Band / Bodyweight"
    ],
    "formCues": [
      "Đứng thẳng hai chân rộng ngang vai, cầm tạ dumbbell rất nhẹ (hoặc nắm tay không) ngang vai.",
      "Ngồi xổm squat kiểm soát xuống vị trí đùi song song sàn.",
      "Đạp sàn đứng lên dứt khoát, dùng lực truyền từ chân qua thân người để đẩy hai tay qua đầu thành một chuyển động liền mạch trơn tru."
    ],
    "commonErrors": [
      "Ngắt quãng chuyển động thành hai nhịp riêng biệt",
      "ưỡn cong thắt lưng khi đẩy tạ qua đầu",
      "sụp gối vào trong khi squat."
    ],
    "cautions": "Đây là bài tập liên kết thần kinh cơ (neuromuscular integration), tuyệt đối không dùng tạ nặng gây mỏi cơ trước buổi tập chính.",
    "regression": "Thực hiện bằng trọng lượng cơ thể không tải hoặc squat xuống ghế ngồi rồi đứng lên giơ tay.",
    "progression": "Sử dụng tạ dumbbell 5–8 kg hoặc dây đàn hồi móc dưới chân.",
    "preWorkout": {
      "raw": "1 set × 8–10 reps | Tempo: Fluid Continuous | Hold: 1s at top | Intent: ZERO FATIGUE",
      "sets": 1,
      "fatigueIntent": "ZERO FATIGUE"
    },
    "offDay": {
      "raw": "2 sets × 10–12 reps | Tempo: Fluid Continuous | Hold: 1s at top | Intent: TISSUE RESTORATION",
      "sets": 2,
      "fatigueIntent": "TISSUE RESTORATION"
    },
    "compatibleContexts": [
      "full_body",
      "lower",
      "upper",
      "offday"
    ],
    "sourceProvenance": {
      "raw": "SOURCE-01: NASM Essentials of Corrective Exercise Training, Chapter 11, p. 215",
      "sourceId": "SOURCE-01"
    },
    "provenanceClassification": {
      "physiologicalFacts": "SOURCE-VERIFIED",
      "operationalParameters": "DINO DESIGN DECISION",
      "raw": "Global kinetic chain linkage: [SOURCE-VERIFIED]. DINO dosage: [DINO DESIGN DECISION]."
    }
  }
];

// Rapid Lookup Indexes
const PREHAB_EXERCISE_INDEX_BY_ID = {};
const PREHAB_EXERCISE_INDEX_BY_ALIAS = {};
const PREHAB_EXERCISES_BY_PHASE = {
  inhibit: [],
  lengthen: [],
  activate: [],
  integrate: []
};

PREHAB_EXERCISES.forEach(ex => {
  PREHAB_EXERCISE_INDEX_BY_ID[ex.exerciseId] = ex;
  if (ex.aliases && ex.aliases.length > 0) {
    ex.aliases.forEach(alias => {
      PREHAB_EXERCISE_INDEX_BY_ALIAS[alias] = ex;
    });
  }
  if (PREHAB_EXERCISES_BY_PHASE[ex.phase]) {
    PREHAB_EXERCISES_BY_PHASE[ex.phase].push(ex);
  }
});

function getPrehabExerciseById(id) {
  if (!id) return null;
  return PREHAB_EXERCISE_INDEX_BY_ID[id] || PREHAB_EXERCISE_INDEX_BY_ALIAS[id] || null;
}

// Runtime Exports
if (typeof window !== "undefined") {
  window.PREHAB_EXERCISE_CATALOG_VERSION = PREHAB_EXERCISE_CATALOG_VERSION;
  window.PREHAB_EXERCISES = PREHAB_EXERCISES;
  window.PREHAB_EXERCISES_BY_PHASE = PREHAB_EXERCISES_BY_PHASE;
  window.getPrehabExerciseById = getPrehabExerciseById;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PREHAB_EXERCISE_CATALOG_VERSION,
    PREHAB_EXERCISES,
    PREHAB_EXERCISES_BY_PHASE,
    PREHAB_EXERCISE_INDEX_BY_ID,
    PREHAB_EXERCISE_INDEX_BY_ALIAS,
    getPrehabExerciseById
  };
}
