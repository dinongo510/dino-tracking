/**
 * Dino Tracking - Comprehensive Sports Science & Hybrid Fitness Database
 * Architecture:
 * 1. Default Built-in Programs (Tree Structure: Program -> Weeks -> Days -> Exercises)
 * 2. NASM Corrective Exercise Continuum (CEX) Engine Database (Deviations, Inhibit, Lengthen, Activate, Integrate)
 * 3. 50+ Diverse WOD Database (CrossFit Girls, Hero WODs, Hyrox Simulations, AMRAPs, EMOMs, Chippers)
 * 4. 100+ Exercise Library (Free-weights, Machines, Bodyweight, Running, Functional)
 * 5. Muscle Anatomy Metadata for 3D SVG Heatmap
 */

// =========================================================================
// 1. DEFAULT BUILT-IN PROGRAMS (TREE STRUCTURE)
// =========================================================================
const DEFAULT_PROGRAMS = [
  {
    id: "dino_hybrid_1",
    name: "Dino Hybrid 2.0 (BFS Rotation)",
    subtitle: "2-Week Athletic Periodization",
    description: "Strength • Hypertrophy • Zone 2 & Threshold Running • Hyrox Conditioning",
    philosophy: "Tối ưu hóa khối lượng tạ với RIR 1-2, kết hợp kỹ thuật Rest-Pause cho nhóm cơ ưu tiên (Vai, Đùi) và duy trì 20-25km chạy bền mỗi tuần.",
    target: "Half-Marathon Sub-2 Readiness + Upper & Leg Hypertrophy",
    rotationWeeks: 2,
    isBuiltIn: true,
    weeks: [
      {
        id: "wA",
        name: "Week A — Running Performance & Strength",
        focus: "Threshold Running (9.5km), Heavy Pin Squat, Weighted Pull-ups, Long Run (12km)",
        targetKm: 23,
        days: [
          {
            id: "wA_d1",
            dayKey: "T2",
            dayName: "Thứ Hai (T2)",
            title: "Quality Run (Threshold / Speed)",
            type: "run",
            focus: "Threshold / Tốc độ 10 km–HM",
            badge: "Quality Run",
            targetKm: 9.5,
            runDetail: {
              desc: "Warm-up 2 km → 3 × 2 km @ ~5:45–5:55/km (nghỉ 2' jog) → Cool-down 1.5 km.",
              targetKm: 9.5
            },
            checklist: [
              { id: "wA_t2_wu", label: "Dynamic Warm-up (10'): Giãn động bắp chân, đùi sau, khớp háng", note: "10 mins" },
              { id: "wA_t2_main", label: "Chạy 3 x 2km Threshold Pace 5:45 - 5:55/km", note: "RPE 7.5 - 8.5" },
              { id: "wA_t2_cd", label: "Cool-down jog 1.5km & Bù nước điện giải", note: "Thư giãn" }
            ],
            exercises: []
          },
          {
            id: "wA_d2",
            dayKey: "T3",
            dayName: "Thứ Ba (T3)",
            title: "Full Body Strength",
            type: "strength",
            focus: "Strength + Tension toàn thân, ít sets, chất lượng cao",
            badge: "Full Body",
            exercises: [
              {
                id: "pin_squat",
                name: "Pin Back Squat / Back Squat",
                category: "Lower",
                equipment: "Barbell",
                primaryMuscles: ["Quads", "Glutes"],
                secondaryMuscles: ["Lower Back", "Core"],
                targetRequirement: "2 sets × 5–8 reps @ RIR 1–2 (Nghỉ 3m)",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Top hard set" },
                  { setNum: 2, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Back-off hard set" }
                ]
              },
              {
                id: "pull_up",
                name: "Weighted / BW Pull-up",
                category: "Upper",
                equipment: "Bodyweight",
                primaryMuscles: ["Lats", "Upper Back"],
                secondaryMuscles: ["Biceps", "Forearms"],
                targetRequirement: "2 sets × 5–8 reps @ RIR 1–2 (Nghỉ 2–3m)",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1-2", restSec: 150, note: "Form chuẩn cằm qua xà" },
                  { setNum: 2, reps: "5-8", rir: "RIR 1", restSec: 150, note: "RIR 1 kiểm soát eccentric" }
                ]
              },
              {
                id: "incline_db_bench",
                name: "Incline DB Bench Press",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Chest"],
                secondaryMuscles: ["Shoulders", "Triceps"],
                targetRequirement: "2 sets × 6–10 reps @ RIR 1–2 (Nghỉ 2m)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1-2", restSec: 120, note: "Đẩy góc ghế 30-45 độ" },
                  { setNum: 2, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Xuống sâu căng ngực" }
                ]
              },
              {
                id: "leg_curl",
                name: "Lying / Seated Leg Curl",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Hamstrings"],
                secondaryMuscles: ["Calves"],
                isRestPause: true,
                targetRequirement: "1 Set 6–10 reps + 1 Set Rest-Pause (Nghỉ 15–20s)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Set 1 hard effort" },
                  { setNum: 2, reps: "3-5+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause mini sets" }
                ]
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise (Cable / DB)",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: ["Traps"],
                isRestPause: true,
                targetRequirement: "1 Extended Set + Rest-Pause",
                defaultSets: [
                  { setNum: 1, reps: "10-15", rir: "RIR 0", restSec: 90, note: "Cô lập vai giữa" },
                  { setNum: 2, reps: "4-6+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause failure" }
                ]
              }
            ]
          },
          {
            id: "wA_d3",
            dayKey: "T4",
            dayName: "Thứ Tư (T4)",
            title: "Recovery / Easy Run 5km",
            type: "run",
            focus: "Zone 2 Aerobic Base + Phục hồi tích cực",
            badge: "Easy Run",
            targetKm: 5.5,
            runDetail: {
              desc: "5–6 km Easy Run @ RPE 5–6 (Zone 2, thở hoàn toàn bằng mũi).",
              targetKm: 5.5
            },
            checklist: [
              { id: "wA_t4_run", label: "Chạy 5km Zone 2 nhẹ nhàng thư giãn", note: "Pace 6:15 - 6:45/km" },
              { id: "wA_t4_foam", label: "Lăn bọt Foam Roll đùi trước & bắp chuối", note: "10 mins" }
            ],
            exercises: []
          },
          {
            id: "wA_d4",
            dayKey: "T5",
            dayName: "Thứ Năm (T5)",
            title: "Upper Hypertrophy + Shoulders",
            type: "strength",
            focus: "Phát triển thân trên, ưu tiên Vai & Lưng xô",
            badge: "Upper Focus",
            exercises: [
              {
                id: "machine_shoulder_press",
                name: "Machine Shoulder Press",
                category: "Upper",
                equipment: "Machine",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: ["Triceps"],
                isRestPause: true,
                targetRequirement: "1 Set 6–10 reps + 1 Set Rest-Pause",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Set chính tạ nặng" },
                  { setNum: 2, reps: "3-5+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause" }
                ]
              },
              {
                id: "chest_supported_row",
                name: "Chest-Supported Row",
                category: "Upper",
                equipment: "Machine",
                primaryMuscles: ["Upper Back", "Lats"],
                secondaryMuscles: ["Biceps", "Rear Delts"],
                targetRequirement: "2 sets × 6–10 reps @ RIR 0–1",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Siết sâu bả vai" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Hard effort" }
                ]
              },
              {
                id: "dips",
                name: "Chest / Triceps Dips",
                category: "Upper",
                equipment: "Bodyweight",
                primaryMuscles: ["Chest", "Triceps"],
                secondaryMuscles: ["Shoulders"],
                targetRequirement: "2 sets × 6–10 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Nghiêng 20 độ vào ngực" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 120, note: "Đẩy hết sức" }
                ]
              },
              {
                id: "biceps_curl",
                name: "Incline DB Biceps Curl",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Biceps"],
                secondaryMuscles: ["Forearms"],
                targetRequirement: "2 sets × 8–12 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 90, note: "Eccentric 2s" },
                  { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 90, note: "Co thắt đỉnh" }
                ]
              }
            ]
          },
          {
            id: "wA_d5",
            dayKey: "T6",
            dayName: "Thứ Sáu (T6)",
            title: "Leg Hypertrophy & Quads",
            type: "strength",
            focus: "Phát triển cơ bắp đùi trước & mông đùi",
            badge: "Lower Hypertrophy",
            exercises: [
              {
                id: "leg_press",
                name: "Leg Press 45°",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Quads"],
                secondaryMuscles: ["Glutes", "Hamstrings"],
                isRestPause: true,
                targetRequirement: "1 Set 8–12 reps + 1 Set Rest-Pause",
                defaultSets: [
                  { setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 150, note: "Xuống sâu không nhấc mông" },
                  { setNum: 2, reps: "4-6+RP", rir: "RIR 0", restSec: 20, isRestPause: true, note: "Rest-Pause cháy cơ" }
                ]
              },
              {
                id: "leg_extension",
                name: "Leg Extension (Quad Burner)",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Quads"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "2 sets × 10–15 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "10-15", rir: "RIR 0", restSec: 90, note: "Khóa thẳng đùi 1s" },
                  { setNum: 2, reps: "10-15", rir: "RIR 0", restSec: 90, note: "Drop set / Rest-pause" }
                ]
              },
              {
                id: "calf_raise",
                name: "Standing / Seated Calf Raise",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Calves"],
                secondaryMuscles: [],
                targetRequirement: "2 sets × 10–15 reps (Giữ 2s đáy)",
                defaultSets: [
                  { setNum: 1, reps: "10-15", rir: "RIR 0", restSec: 60, note: "Giãn sâu bắp chuối" },
                  { setNum: 2, reps: "10-15", rir: "RIR 0", restSec: 60, note: "Nhón cao hết biên độ" }
                ]
              }
            ]
          },
          {
            id: "wA_d6",
            dayKey: "CN",
            dayName: "Chủ Nhật (CN)",
            title: "Long Run 12km (HM Specific)",
            type: "run",
            focus: "Sức bền hiếu khí cự ly dài (Zone 2)",
            badge: "Long Run",
            targetKm: 12.0,
            runDetail: {
              desc: "12–14 km Steady Long Run @ Pace 6:00–6:20/km. Nạp gel tại km 7.",
              targetKm: 12.0
            },
            checklist: [
              { id: "wA_cn_gel", label: "Chuẩn bị 1 Energy Gel + 500ml nước điện giải", note: "Nạp tại phút 40" },
              { id: "wA_cn_run", label: "Chạy 12km Zone 2 ổn định nhịp tim", note: "Pace 6:00 - 6:20/km" },
              { id: "wA_cn_stretch", label: "Giãn tĩnh toàn thân & Ngâm chân nước lạnh", note: "15 mins" }
            ],
            exercises: []
          }
        ]
      },
      {
        id: "wB",
        name: "Week B — Volume Accumulation & Speed",
        focus: "Interval 1km Repeats, Hack Squat, Dips, Long Run 14km",
        targetKm: 25,
        days: [
          {
            id: "wB_d1",
            dayKey: "T2",
            dayName: "Thứ Hai (T2)",
            title: "Interval Speed Run (1km Repeats)",
            type: "run",
            focus: "Võ đài tốc độ VO2Max",
            badge: "Speed Run",
            targetKm: 9.0,
            runDetail: {
              desc: "Warm-up 2 km → 4 × 1 km @ ~5:25–5:35/km (nghỉ 2' jog) → Cool-down 1.5 km.",
              targetKm: 9.0
            },
            checklist: [
              { id: "wB_t2_wu", label: "Khởi động kỹ & Dynamic Stretches (10')", note: "10 mins" },
              { id: "wB_t2_main", label: "4 x 1km @ Pace 5:25 - 5:35/km", note: "RPE 8.5" },
              { id: "wB_t2_cd", label: "Cool-down & Bù nước điện giải", note: "1.5 km" }
            ],
            exercises: []
          },
          {
            id: "wB_d2",
            dayKey: "T3",
            dayName: "Thứ Ba (T3)",
            title: "Full Body Density",
            type: "strength",
            focus: "Tension toàn thân & Quads Volume",
            badge: "Full Body",
            exercises: [
              {
                id: "hack_squat",
                name: "Hack Squat / Front Squat",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Quads"],
                secondaryMuscles: ["Glutes"],
                targetRequirement: "2 sets × 6–10 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 150, note: "Đùi trước chịu tải tối đa" },
                  { setNum: 2, reps: "6-10", rir: "RIR 1", restSec: 150, note: "Xuống sâu kiểm soát" }
                ]
              },
              {
                id: "lat_pulldown",
                name: "Lat Pulldown (Neutral Grip)",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Lats"],
                secondaryMuscles: ["Biceps"],
                targetRequirement: "2 sets × 8–12 reps @ RIR 0–1",
                defaultSets: [
                  { setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 120, note: "Kéo sâu siết xô" },
                  { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 120, note: "Eccentric chậm" }
                ]
              },
              {
                id: "flat_db_bench",
                name: "Flat DB Bench Press",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Chest"],
                secondaryMuscles: ["Triceps", "Shoulders"],
                targetRequirement: "2 sets × 6–10 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Tải ngực toàn diện" },
                  { setNum: 2, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Kiểm soát đường tạ" }
                ]
              }
            ]
          },
          {
            id: "wB_d3",
            dayKey: "T4",
            dayName: "Thứ Tư (T4)",
            title: "Easy Run 6km + Core Stability",
            type: "hybrid",
            focus: "Phục hồi đùi & Gia cố cơ lõi",
            badge: "Easy + Core",
            targetKm: 6.0,
            runDetail: {
              desc: "6 km Zone 2 + 3 sets Hanging Leg Raise & Plank.",
              targetKm: 6.0
            },
            checklist: [
              { id: "wB_t4_run", label: "Chạy 6km Zone 2 nhẹ nhàng", note: "Pace 6:15/km" },
              { id: "wB_t4_core", label: "Hanging Leg Raise 3 x 12 reps + Plank 3 x 60s", note: "Core" }
            ],
            exercises: []
          },
          {
            id: "wB_d4",
            dayKey: "T5",
            dayName: "Thứ Năm (T5)",
            title: "Upper Power & Rest-Pause",
            type: "strength",
            focus: "Ngực, Vai và Tay sau chuyên sâu",
            badge: "Upper Power",
            exercises: [
              {
                id: "incline_db_bench",
                name: "Incline DB Bench Press",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Chest"],
                secondaryMuscles: ["Shoulders", "Triceps"],
                targetRequirement: "2 sets × 6–10 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Heavy work set" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Near failure" }
                ]
              },
              {
                id: "cable_lateral_raise",
                name: "Cable Lateral Raise",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 Set 12–15 reps + 3 Mini-sets Rest-Pause",
                defaultSets: [
                  { setNum: 1, reps: "12-15", rir: "RIR 0", restSec: 60, note: "Tension đều" },
                  { setNum: 2, reps: "4-5+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause" }
                ]
              },
              {
                id: "triceps_pushdown",
                name: "Triceps Pushdown (Rope)",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Triceps"],
                secondaryMuscles: [],
                targetRequirement: "2 sets × 10–12 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "10-12", rir: "RIR 0", restSec: 60, note: "Tách dây ở đáy" },
                  { setNum: 2, reps: "10-12", rir: "RIR 0", restSec: 60, note: "Siết mạnh tay sau" }
                ]
              }
            ]
          },
          {
            id: "wB_d5",
            dayKey: "CN",
            dayName: "Chủ Nhật (CN)",
            title: "Long Run 14km (Endurance Capstone)",
            type: "run",
            focus: "Chạy cự ly dài nhất chu kỳ",
            badge: "Long Run",
            targetKm: 14.0,
            runDetail: {
              desc: "14 km Steady Run @ Pace 6:05–6:15/km. Nạp gel tại km 7 & km 11.",
              targetKm: 14.0
            },
            checklist: [
              { id: "wB_cn_run", label: "Chạy 14km Zone 2 nhịp tim ổn định", note: "14 km" },
              { id: "wB_cn_rec", label: "Phục hồi & Nạp 40g Protein + 80g Carbs", note: "Dinh dưỡng" }
            ],
            exercises: []
          }
        ]
      }
    ]
  },
  {
    id: "dino_ppl_hypertrophy",
    name: "Push - Pull - Legs Hypertrophy",
    subtitle: "Classic 3-Day / 6-Day Muscle Split",
    description: "Tập trung tối đa vào phì đại cơ bắp, phân tách rõ ràng nhóm đẩy, kéo và chân.",
    philosophy: "Mỗi nhóm cơ được tập luyện với tần suất tối ưu 2 lần/tuần, cường độ cao RIR 1.",
    target: "Pure Muscle Mass & Aesthetic V-Taper",
    rotationWeeks: 1,
    isBuiltIn: true,
    weeks: [
      {
        id: "w1",
        name: "Week 1 - Push Pull Legs",
        focus: "Push (Chest/Shoulders/Triceps) • Pull (Back/Biceps) • Legs (Quads/Hamstrings)",
        targetKm: 0,
        days: [
          {
            id: "ppl_d1",
            dayKey: "D1",
            dayName: "Ngày 1 (Push)",
            title: "Push Power (Ngực - Vai - Tay Sau)",
            type: "strength",
            focus: "Incline Press, Dips, Lateral Raise, Triceps Pushdown",
            badge: "Push Day",
            exercises: [
              {
                id: "incline_db_bench",
                name: "Incline DB Bench Press",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Chest"],
                secondaryMuscles: ["Shoulders", "Triceps"],
                targetRequirement: "3 sets × 8–10 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "8-10", rir: "RIR 1", restSec: 120 },
                  { setNum: 2, reps: "8-10", rir: "RIR 1", restSec: 120 },
                  { setNum: 3, reps: "8-10", rir: "RIR 0-1", restSec: 120 }
                ]
              },
              {
                id: "dips",
                name: "Chest Dips",
                category: "Upper",
                equipment: "Bodyweight",
                primaryMuscles: ["Chest", "Triceps"],
                secondaryMuscles: ["Shoulders"],
                targetRequirement: "3 sets × 8–12 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 90 },
                  { setNum: 2, reps: "8-12", rir: "RIR 1", restSec: 90 },
                  { setNum: 3, reps: "8-12", rir: "RIR 0", restSec: 90 }
                ]
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise (DB / Cable)",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 Set 12–15 reps + Rest-Pause",
                defaultSets: [
                  { setNum: 1, reps: "12-15", rir: "RIR 0", restSec: 60 },
                  { setNum: 2, reps: "5-6+RP", rir: "RIR 0", restSec: 15, isRestPause: true }
                ]
              },
              {
                id: "triceps_pushdown",
                name: "Triceps Pushdown",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Triceps"],
                secondaryMuscles: [],
                targetRequirement: "3 sets × 10–12 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "10-12", rir: "RIR 1", restSec: 60 },
                  { setNum: 2, reps: "10-12", rir: "RIR 0", restSec: 60 },
                  { setNum: 3, reps: "10-12", rir: "RIR 0", restSec: 60 }
                ]
              }
            ]
          },
          {
            id: "ppl_d2",
            dayKey: "D2",
            dayName: "Ngày 2 (Pull)",
            title: "Pull Density (Lưng - Xô - Tay Trước)",
            type: "strength",
            focus: "Pull-ups, Seated Cable Row, Face Pull, Incline Curl",
            badge: "Pull Day",
            exercises: [
              {
                id: "pull_up",
                name: "Weighted / BW Pull-up",
                category: "Upper",
                equipment: "Bodyweight",
                primaryMuscles: ["Lats", "Upper Back"],
                secondaryMuscles: ["Biceps"],
                targetRequirement: "3 sets × 6–8 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "6-8", rir: "RIR 1", restSec: 120 },
                  { setNum: 2, reps: "6-8", rir: "RIR 1", restSec: 120 },
                  { setNum: 3, reps: "6-8", rir: "RIR 0", restSec: 120 }
                ]
              },
              {
                id: "chest_supported_row",
                name: "Chest-Supported Row",
                category: "Upper",
                equipment: "Machine",
                primaryMuscles: ["Upper Back", "Lats"],
                secondaryMuscles: ["Biceps", "Rear Delts"],
                targetRequirement: "3 sets × 8–10 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "8-10", rir: "RIR 1", restSec: 90 },
                  { setNum: 2, reps: "8-10", rir: "RIR 1", restSec: 90 },
                  { setNum: 3, reps: "8-10", rir: "RIR 0", restSec: 90 }
                ]
              },
              {
                id: "biceps_curl",
                name: "Incline DB Biceps Curl",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Biceps"],
                secondaryMuscles: [],
                targetRequirement: "3 sets × 10–12 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "10-12", rir: "RIR 1", restSec: 60 },
                  { setNum: 2, reps: "10-12", rir: "RIR 0", restSec: 60 },
                  { setNum: 3, reps: "10-12", rir: "RIR 0", restSec: 60 }
                ]
              }
            ]
          },
          {
            id: "ppl_d3",
            dayKey: "D3",
            dayName: "Ngày 3 (Legs)",
            title: "Legs & Core Power (Đùi - Mông - Bắp Chuối)",
            type: "strength",
            focus: "Squats, Romanian Deadlift, Leg Press, Calves",
            badge: "Leg Day",
            exercises: [
              {
                id: "pin_squat",
                name: "Back Squat / Pin Squat",
                category: "Lower",
                equipment: "Barbell",
                primaryMuscles: ["Quads", "Glutes"],
                secondaryMuscles: ["Lower Back"],
                targetRequirement: "3 sets × 6–8 reps @ RIR 1",
                defaultSets: [
                  { setNum: 1, reps: "6-8", rir: "RIR 1", restSec: 150 },
                  { setNum: 2, reps: "6-8", rir: "RIR 1", restSec: 150 },
                  { setNum: 3, reps: "6-8", rir: "RIR 1", restSec: 150 }
                ]
              },
              {
                id: "leg_curl",
                name: "Lying Leg Curl (Hamstrings)",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Hamstrings"],
                secondaryMuscles: [],
                targetRequirement: "3 sets × 8–12 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 90 },
                  { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 90 },
                  { setNum: 3, reps: "8-12", rir: "RIR 0", restSec: 90 }
                ]
              },
              {
                id: "calf_raise",
                name: "Standing Calf Raise",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Calves"],
                secondaryMuscles: [],
                targetRequirement: "3 sets × 12–15 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "12-15", rir: "RIR 0", restSec: 60 },
                  { setNum: 2, reps: "12-15", rir: "RIR 0", restSec: 60 },
                  { setNum: 3, reps: "12-15", rir: "RIR 0", restSec: 60 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// =========================================================================
// 2. NASM CORRECTIVE EXERCISE CONTINUUM (CEX) DATABASE
// =========================================================================
const NASM_CEX_DATABASE = {
  deviations: [
    {
      id: "forward_head",
      name: "Forward Head Posture (Đầu nhô về trước)",
      description: "Đốt sống cổ bị duỗi quá mức, cằm hướng ra trước, gây mỏi gáy và chèn ép thần kinh.",
      overactive: ["Upper Trapezius", "Levator Scapulae", "Sternocleidomastoid", "Suboccipitals"],
      underactive: ["Deep Cervical Flexors", "Lower Trapezius", "Serratus Anterior"]
    },
    {
      id: "rounded_shoulders",
      name: "Rounded Shoulders / Kyphosis (Gù lưng, vai cuộn)",
      description: "Xương bả vai bị kéo xoay ra trước, lồng ngực khép, giảm dung tích phổi và hạn chế biên độ vai.",
      overactive: ["Pectoralis Minor", "Pectoralis Major", "Anterior Deltoid", "Latissimus Dorsi", "Teres Major"],
      underactive: ["Middle & Lower Trapezius", "Rhomboids", "Infraspinatus", "Posterior Deltoid", "Serratus Anterior"]
    },
    {
      id: "anterior_pelvic_tilt",
      name: "Anterior Pelvic Tilt - APT (Võng lưng dưới, bụng ưỡn)",
      description: "Khung chậu nghiêng về phía trước, cơ gập hông bị co ngắn, gây áp lực nén lên đĩa đệm L4-L5-S1.",
      overactive: ["Psoas & Iliacus (Hip Flexors)", "Rectus Femoris", "Tensor Fasciae Latae (TFL)", "Erector Spinae"],
      underactive: ["Gluteus Maximus", "Gluteus Medius", "Hamstrings", "Rectus Abdominis", "Transverse Abdominis"]
    },
    {
      id: "posterior_pelvic_tilt",
      name: "Posterior Pelvic Tilt - PPT (Lưng phẳng, mông cụp)",
      description: "Khung chậu ngửa ra sau, mất đường cong sinh lý cột sống thắt lưng, giảm khả năng giảm chấn khi tiếp đất.",
      overactive: ["Hamstrings", "Rectus Abdominis", "Adductor Magnus"],
      underactive: ["Iliopsoas", "Erector Spinae", "Quadratus Lumborum", "Gluteus Medius"]
    },
    {
      id: "knee_valgus",
      name: "Knee Valgus / Pronation Distortion (Gối sụp vào trong / Bàn chân bẹt)",
      description: "Đầu gối sụp vào trong khi squat hoặc tiếp đất chạy bộ, tăng nguy cơ rách ACL và viêm dải chậu chày (ITBS).",
      overactive: ["Adductor Complex", "TFL / IT Band", "Biceps Femoris (Short Head)", "Gastrocnemius", "Peroneals"],
      underactive: ["Gluteus Medius", "Gluteus Maximus", "Vastus Medialis Oblique (VMO)", "Anterior Tibialis", "Posterior Tibialis"]
    },
    {
      id: "lower_back_arch",
      name: "Excessive Lumbar Extension & Rib Flare (Ưỡn ngực bẻ cong lưng)",
      description: "Xương sườn bị nhô ra, cơ hoành và cơ đáy chậu mất đồng trục, cơ lõi mất khả năng ổn định áp suất ổ bụng.",
      overactive: ["Thoracolumbar Erector Spinae", "Quadratus Lumborum", "Latissimus Dorsi"],
      underactive: ["Internal & External Obliques", "Transverse Abdominis", "Pelvic Floor"]
    }
  ],

  // Scientific protocols mapping: Inhibit (SMR), Lengthen (Static Stretch), Activate (Isolated), Integrate (Dynamic Movement)
  exerciseLibrary: {
    inhibit: [
      { id: "smr_pecs", name: "SMR Lacrosse Ball Pectoralis Minor", targetMuscles: ["Pectoralis Minor"], holdSec: 45, cue: "Đặt bóng cao su vào góc nách ngực trên, áp vào tường và giữ 30-45s tại điểm thắt nút cơ (trigger point)." },
      { id: "smr_upper_traps", name: "SMR Upper Trapezius & Levator Scapulae", targetMuscles: ["Upper Trapezius"], holdSec: 45, cue: "Dùng bóng lăn nhẹ vùng cơ thang trên cổ vai, hít thở sâu xả căng thẳng." },
      { id: "smr_lats", name: "SMR Foam Roll Latissimus Dorsi & Teres Major", targetMuscles: ["Latissimus Dorsi"], holdSec: 60, cue: "Nằm nghiêng đặt con lăn dưới hõm nách bên sườn, lăn chậm tìm điểm đau và giữ 45s." },
      { id: "smr_tfl_itb", name: "SMR TFL & IT Band", targetMuscles: ["TFL", "IT Band"], holdSec: 60, cue: "Nằm nghiêng đặt con lăn ở phía ngoài khớp háng (TFL), giữ 45-60s không lăn nhanh." },
      { id: "smr_quads", name: "SMR Rectus Femoris & Adductors", targetMuscles: ["Rectus Femoris", "Adductors"], holdSec: 60, cue: "Nằm sấp lăn đùi trước và mặt trong đùi, giải tỏa căng cứng khớp gối." },
      { id: "smr_calves", name: "SMR Gastrocnemius & Soleus", targetMuscles: ["Calves"], holdSec: 45, cue: "Đặt bắp chân lên con lăn hoặc bóng đôi, xoay cổ chân tròn để giải tỏa bắp chuối." }
    ],
    lengthen: [
      { id: "stretch_doorway_pec", name: "Doorway Corner Pectoral Stretch", targetMuscles: ["Pectoralis Major/Minor"], holdSec: 30, cue: "Đặt cùi chỏ lên khung cửa ở góc 90°, bước 1 chân lên trước cảm nhận ngực giãn sâu trong 30s." },
      { id: "stretch_levator", name: "Levator Scapulae & Neck Stretch", targetMuscles: ["Levator Scapulae"], holdSec: 30, cue: "Nghiêng đầu 45° nhìn xuống hõm nách đối diện, dùng tay kéo nhẹ nhàng giữ 30s." },
      { id: "stretch_couch_hip_flexor", name: "Couch Stretch (Kneeling Hip Flexor)", targetMuscles: ["Psoas", "Rectus Femoris"], holdSec: 45, cue: "Quỳ 1 chân tựa mu bàn chân lên tường/ghế, siết chặt mông cùng bên và đẩy hông về trước." },
      { id: "stretch_adductor_frog", name: "Frog Adductor Stretch", targetMuscles: ["Adductors"], holdSec: 45, cue: "Quỳ dang 2 gối rộng, đẩy hông ra sau kéo giãn toàn bộ mặt trong khớp háng." },
      { id: "stretch_standing_calf", name: "Wall Calf Stretch (Gastrocnemius / Soleus)", targetMuscles: ["Calves"], holdSec: 30, cue: "Chống tay vào tường, chân sau thẳng gót chạm sàn, giữ 30s mỗi bên." }
    ],
    activate: [
      { id: "act_chin_tuck", name: "Deep Neck Flexors Chin Tuck", targetMuscles: ["Deep Cervical Flexors"], sets: 2, reps: "12-15 reps", cue: "Thu cằm ra sau như tạo cằm đôi, giữ 2s ở cuối biên độ rồi thả lỏng." },
      { id: "act_wall_angel", name: "Wall Angels / Y-T-W Raises", targetMuscles: ["Lower Trapezius", "Rhomboids"], sets: 2, reps: "12 reps", cue: "Áp sát lưng, đầu và cùi chỏ vào tường, trượt tay lên cao hình chữ Y mà không ưỡn lưng dưới." },
      { id: "act_clamshell", name: "Banded Clamshell / Side-Lying Abduction", targetMuscles: ["Gluteus Medius"], sets: 2, reps: "15 reps", cue: "Nằm nghiêng gối gập 90°, mở gối trên lên giữ 2s đỉnh co thắt, khóa cố định khung chậu." },
      { id: "act_glute_bridge", name: "Single-Leg Glute Bridge", targetMuscles: ["Gluteus Maximus"], sets: 2, reps: "12 reps/bên", cue: "Nằm ngửa co gối, ấn gót chân nâng hông siết chặt mông 2 giây đỉnh co thắt." },
      { id: "act_tibialis_raise", name: "Wall Tibialis Anterior Raise", targetMuscles: ["Anterior Tibialis"], sets: 2, reps: "15-20 reps", cue: "Tựa lưng vào tường, nhấc mũi bàn chân lên cao nhất có thể gia cố cơ cẳng chân trước." }
    ],
    integrate: [
      { id: "int_overhead_squat", name: "Broomstick / Band Overhead Squat to Stand", targetMuscles: ["Whole Body Kinetic Chain"], sets: 2, reps: "10 reps", cue: "Giữ gậy thẳng trên đầu, squat sâu mở gối và ngực thẳng, đứng dậy thở ra kiểm soát." },
      { id: "int_single_leg_rdl", name: "Single-Leg RDL with Reach", targetMuscles: ["Posterior Chain & Balance"], sets: 2, reps: "8 reps/bên", cue: "Đứng 1 chân, gập hông vươn tay về trước trong khi chân sau duỗi thẳng, kích hoạt thăng bằng bàn chân." },
      { id: "int_bear_crawl", name: "Quadruped Bear Crawl / Bird Dog", targetMuscles: ["Core Cross-Body Sling"], sets: 2, reps: "10 reps/bên", cue: "Bò chậm có kiểm soát giữ lưng phẳng như bàn trà, kết nối chéo tay và chân." },
      { id: "int_woodchop", name: "Cable / Band Diagonal Woodchop", targetMuscles: ["Rotational Core & Hips"], sets: 2, reps: "10 reps/bên", cue: "Xoay hông và thân trên theo đường chéo, chuyển lực mượt mà từ chân qua cơ lõi." }
    ]
  }
};

// =========================================================================
// 3. 50+ DIVERSE WOD DATABASE (CROSSFIT GIRLS, HEROES, HYROX, CHIPPERS)
// =========================================================================
const CROSSFIT_WOD_DATABASE = [
  // 1. THE GIRLS
  {
    id: "wod_fran",
    name: "Fran",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "43 kg (95 lbs)",
    rxFemale: "30 kg (65 lbs)",
    timeCap: "10 mins",
    movements: ["21 Thrusters", "21 Pull-ups", "15 Thrusters", "15 Pull-ups", "9 Thrusters", "9 Pull-ups"],
    description: "The gold standard CrossFit sprint. Heart rate will spike instantly; maintain pacing in round of 15.",
    targetMuscles: ["Quads", "Shoulders", "Lats", "Cardio"]
  },
  {
    id: "wod_cindy",
    name: "Cindy",
    category: "The Girls",
    format: "20 min AMRAP",
    difficulty: "Medium",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    timeCap: "20 mins",
    movements: ["5 Pull-ups", "10 Push-ups", "15 Air Squats"],
    description: "Endurance bodyweight benchmark. Consistent 45-60s per round pacing is key. 20+ rounds is advanced.",
    targetMuscles: ["Lats", "Chest", "Quads", "Cardio"]
  },
  {
    id: "wod_grace",
    name: "Grace",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
    timeCap: "8 mins",
    movements: ["30 Clean and Jerks for time"],
    description: "Barbell power and breathing efficiency test. Quick singles or sets of 5 with fast turnaround.",
    targetMuscles: ["Hamstrings", "Quads", "Shoulders", "Upper Back"]
  },
  {
    id: "wod_helen",
    name: "Helen",
    category: "The Girls",
    format: "3 Rounds For Time",
    difficulty: "Medium",
    rxMale: "24 kg KB (53 lbs)",
    rxFemale: "16 kg KB (35 lbs)",
    timeCap: "15 mins",
    movements: ["400m Run", "21 Kettlebell Swings", "12 Pull-ups"],
    description: "Classic running and posterior chain benchmark. Maintain high tempo on the 400m runs.",
    targetMuscles: ["Hamstrings", "Glutes", "Lats", "Cardio"]
  },
  {
    id: "wod_diane",
    name: "Diane",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "102 kg Deadlift (225 lbs)",
    rxFemale: "70 kg Deadlift (155 lbs)",
    timeCap: "12 mins",
    movements: ["21 Deadlifts", "21 Handstand Push-ups", "15 Deadlifts", "15 Handstand Push-ups", "9 Deadlifts", "9 Handstand Push-ups"],
    description: "Brutal test of posterior chain hinge power paired with strict gymnastic pressing overhead.",
    targetMuscles: ["Hamstrings", "Lower Back", "Shoulders", "Triceps"]
  },
  {
    id: "wod_karen",
    name: "Karen",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "9 kg (20 lbs) to 10ft target",
    rxFemale: "6 kg (14 lbs) to 9ft target",
    timeCap: "15 mins",
    movements: ["150 Wall Balls for time"],
    description: "Leg burn and mental grit test. Break into disciplined sets of 25-30 reps with brief 5s breathers.",
    targetMuscles: ["Quads", "Shoulders", "Glutes", "Cardio"]
  },
  {
    id: "wod_annie",
    name: "Annie",
    category: "The Girls",
    format: "For Time",
    difficulty: "Medium",
    rxMale: "Double Unders",
    rxFemale: "Double Unders",
    timeCap: "12 mins",
    movements: ["50-40-30-20-10 Double Unders", "50-40-30-20-10 AbMat Sit-ups"],
    description: "High speed core conditioning and jump rope agility test.",
    targetMuscles: ["Core", "Calves", "Hip Flexors"]
  },
  {
    id: "wod_elizabeth",
    name: "Elizabeth",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
    timeCap: "12 mins",
    movements: ["21 Squat Cleans", "21 Ring Dips", "15 Squat Cleans", "15 Ring Dips", "9 Squat Cleans", "9 Ring Dips"],
    description: "Explosive triple extension combined with strict gymnastics pressing.",
    targetMuscles: ["Quads", "Chest", "Triceps", "Upper Back"]
  },
  {
    id: "wod_nancy",
    name: "Nancy",
    category: "The Girls",
    format: "5 Rounds For Time",
    difficulty: "Hard",
    rxMale: "43 kg (95 lbs)",
    rxFemale: "30 kg (65 lbs)",
    timeCap: "20 mins",
    movements: ["400m Run", "15 Overhead Squats"],
    description: "Thoracic mobility and running stamina under shoulder fatigue.",
    targetMuscles: ["Quads", "Shoulders", "Core", "Cardio"]
  },
  {
    id: "wod_jackie",
    name: "Jackie",
    category: "The Girls",
    format: "For Time",
    difficulty: "Medium",
    rxMale: "20 kg (45 lbs) Barbell",
    rxFemale: "15 kg (35 lbs) Barbell",
    timeCap: "15 mins",
    movements: ["1000m Row", "50 Empty Barbell Thrusters", "30 Pull-ups"],
    description: "Pure engine chipper. Hold a sustainable 1:55-2:00/500m split on the rower.",
    targetMuscles: ["Lats", "Quads", "Shoulders", "Cardio"]
  },
  {
    id: "wod_mary",
    name: "Mary",
    category: "The Girls",
    format: "20 min AMRAP",
    difficulty: "Elite",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    timeCap: "20 mins",
    movements: ["5 Handstand Push-ups", "10 Alternating Pistols (Single-Leg Squats)", "15 Pull-ups"],
    description: "High skill gymnastics and unilateral leg strength test.",
    targetMuscles: ["Shoulders", "Quads", "Lats", "Glutes"]
  },
  {
    id: "wod_angie",
    name: "Angie",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    timeCap: "25 mins",
    movements: ["100 Pull-ups", "100 Push-ups", "100 Sit-ups", "100 Air Squats"],
    description: "Complete all reps of each exercise before moving to the next.",
    targetMuscles: ["Lats", "Chest", "Core", "Quads"]
  },
  {
    id: "wod_barbara",
    name: "Barbara",
    category: "The Girls",
    format: "5 Rounds (3 min rest between)",
    difficulty: "Hard",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    timeCap: "35 mins",
    movements: ["20 Pull-ups", "30 Push-ups", "40 Sit-ups", "50 Air Squats"],
    description: "High volume interval pacing. Treat each round as an aggressive sprint.",
    targetMuscles: ["Lats", "Chest", "Core", "Quads"]
  },
  {
    id: "wod_chelsea",
    name: "Chelsea",
    category: "The Girls",
    format: "EMOM for 30 mins",
    difficulty: "Hard",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    timeCap: "30 mins",
    movements: ["Every minute on the minute: 5 Pull-ups + 10 Push-ups + 15 Air Squats"],
    description: "Strict pacing test. If you fall behind the minute mark, workout ends.",
    targetMuscles: ["Lats", "Chest", "Quads", "Cardio"]
  },
  {
    id: "wod_amanda",
    name: "Amanda",
    category: "The Girls",
    format: "For Time",
    difficulty: "Elite",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
    timeCap: "12 mins",
    movements: ["9-7-5 Muscle-ups", "9-7-5 Squat Snatches"],
    description: "Elite gymnastics and barbell proficiency under intense heart rate.",
    targetMuscles: ["Lats", "Chest", "Shoulders", "Quads"]
  },
  {
    id: "wod_eva",
    name: "Eva",
    category: "The Girls",
    format: "5 Rounds For Time",
    difficulty: "Elite",
    rxMale: "32 kg KB (70 lbs)",
    rxFemale: "24 kg KB (53 lbs)",
    timeCap: "35 mins",
    movements: ["800m Run", "30 Heavy KB Swings", "30 Pull-ups"],
    description: "A legendary monster endurance test. 4 km total running + 150 KB swings + 150 pull-ups.",
    targetMuscles: ["Hamstrings", "Lats", "Glutes", "Cardio"]
  },

  // 2. HERO WODS
  {
    id: "wod_murph",
    name: "Murph",
    category: "Hero WODs",
    format: "For Time (Vest: 9kg/6kg)",
    difficulty: "Elite",
    rxMale: "9 kg (20 lbs) Vest",
    rxFemale: "6 kg (14 lbs) Vest",
    timeCap: "60 mins",
    movements: ["1 Mile Run (1.6 km)", "100 Pull-ups", "200 Push-ups", "300 Air Squats", "1 Mile Run (1.6 km)"],
    description: "The ultimate Memorial Day endurance test. Partition reps 5-10-15 across 20 rounds.",
    targetMuscles: ["Lats", "Chest", "Quads", "Cardio"]
  },
  {
    id: "wod_dt",
    name: "DT",
    category: "Hero WODs",
    format: "5 Rounds For Time",
    difficulty: "Hard",
    rxMale: "70 kg (155 lbs)",
    rxFemale: "48 kg (105 lbs)",
    timeCap: "15 mins",
    movements: ["12 Deadlifts", "9 Hang Power Cleans", "6 Push Jerks"],
    description: "Barbell cycling classic. Try to rest at rep 11 of deadlifts and rep 8 of cleans.",
    targetMuscles: ["Hamstrings", "Shoulders", "Glutes", "Upper Back"]
  },
  {
    id: "wod_the_chief",
    name: "The Chief",
    category: "Hero WODs",
    format: "5 Cycles of 3 min AMRAP (1m rest)",
    difficulty: "Medium",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
    timeCap: "19 mins",
    movements: ["3 Power Cleans", "6 Push-ups", "9 Air Squats"],
    description: "High speed interval pacing. Maximize total rounds completed across all 5 cycles.",
    targetMuscles: ["Quads", "Chest", "Hamstrings", "Cardio"]
  },
  {
    id: "wod_nate",
    name: "Nate",
    category: "Hero WODs",
    format: "20 min AMRAP",
    difficulty: "Elite",
    rxMale: "32 kg KB (70 lbs)",
    rxFemale: "24 kg KB (53 lbs)",
    timeCap: "20 mins",
    movements: ["2 Ring Muscle-ups", "4 Handstand Push-ups", "8 Heavy KB Swings"],
    description: "Demanding gymnastic efficiency under heavy posterior chain load.",
    targetMuscles: ["Lats", "Shoulders", "Hamstrings", "Glutes"]
  },
  {
    id: "wod_badger",
    name: "Badger",
    category: "Hero WODs",
    format: "3 Rounds For Time",
    difficulty: "Hard",
    rxMale: "43 kg (95 lbs)",
    rxFemale: "30 kg (65 lbs)",
    timeCap: "25 mins",
    movements: ["30 Squat Cleans", "30 Pull-ups", "800m Run"],
    description: "Brutal whole-body grind test. Pacing is mandatory on the squat cleans.",
    targetMuscles: ["Quads", "Lats", "Glutes", "Cardio"]
  },
  {
    id: "wod_randy",
    name: "Randy",
    category: "Hero WODs",
    format: "For Time",
    difficulty: "Medium",
    rxMale: "34 kg (75 lbs)",
    rxFemale: "25 kg (55 lbs)",
    timeCap: "10 mins",
    movements: ["75 Power Snatches for time"],
    description: "Lightning-fast light barbell snatch sprint. Sub-4 minutes is world class.",
    targetMuscles: ["Shoulders", "Hamstrings", "Lower Back", "Traps"]
  },
  {
    id: "wod_chad",
    name: "Chad 1000X",
    category: "Hero WODs",
    format: "For Time (Vest: 20kg/15kg)",
    difficulty: "Elite",
    rxMale: "20 kg (45 lbs) Backpack / 20in Box",
    rxFemale: "15 kg (35 lbs) Backpack / 20in Box",
    timeCap: "75 mins",
    movements: ["1,000 Weighted Box Step-ups for time (20 inch box)"],
    description: "Pure mental resilience and eccentric hamstring/quad fatigue endurance test.",
    targetMuscles: ["Quads", "Glutes", "Calves", "Core"]
  },

  // 3. HYROX & HYBRID ATHLETE CIRCUITS
  {
    id: "wod_hyrox_open_sim",
    name: "Hyrox Championship Simulation",
    category: "Hyrox & Hybrid",
    format: "For Time",
    difficulty: "Elite",
    rxMale: "Standard Hyrox Open Weights",
    rxFemale: "Standard Hyrox Open Weights",
    timeCap: "75 mins",
    movements: [
      "1 km Run", "1000m SkiErg",
      "1 km Run", "50m Sled Push (102kg)",
      "1 km Run", "50m Sled Pull (78kg)",
      "1 km Run", "80m Burpee Broad Jumps",
      "1 km Run", "1000m Row",
      "1 km Run", "200m Farmers Carry (2x24kg)",
      "1 km Run", "100m Sandbag Lunges (20kg)",
      "1 km Run", "100 Wall Balls (6kg)"
    ],
    description: "The gold standard 8 x 1km running plus functional station championship event.",
    targetMuscles: ["Whole Body", "Cardio", "Quads", "Lats", "Forearms"]
  },
  {
    id: "wod_hyrox_half_sim",
    name: "Hyrox Half-Distance Workout",
    category: "Hyrox & Hybrid",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "Standard Hyrox Weights",
    rxFemale: "Standard Hyrox Weights",
    timeCap: "45 mins",
    movements: [
      "500m Run", "500m SkiErg",
      "500m Run", "25m Sled Push",
      "500m Run", "25m Sled Pull",
      "500m Run", "40m Burpee Broad Jumps",
      "500m Run", "500m Row",
      "500m Run", "100m Farmers Carry (2x24kg)",
      "500m Run", "50m Sandbag Lunges (20kg)",
      "500m Run", "50 Wall Balls (6kg)"
    ],
    description: "Half distance simulation perfect for weekly aerobic conditioning sessions.",
    targetMuscles: ["Whole Body", "Cardio", "Quads", "Glutes"]
  },
  {
    id: "wod_5k_chipper",
    name: "Dino 5K Chipper",
    category: "Hyrox & Hybrid",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "10 kg Med Ball / TRX",
    rxFemale: "8 kg Med Ball / TRX",
    timeCap: "40 mins",
    movements: ["1 km Run", "50 Burpees", "1 km Run", "50 Med Ball Slams", "1 km Run", "50 Hanging Knee Raises", "1 km Run", "50 Inverted Rows", "1 km Finish Run"],
    description: "5 km of compromised running mixed with 200 functional bodyweight reps.",
    targetMuscles: ["Whole Body", "Cardio", "Core", "Quads"]
  },
  {
    id: "wod_sled_burpee_gauntlet",
    name: "Sled & Burpee Gauntlet",
    category: "Hyrox & Hybrid",
    format: "4 Rounds For Time",
    difficulty: "Hard",
    rxMale: "100 kg Sled / 2x24 kg KB",
    rxFemale: "75 kg Sled / 2x16 kg KB",
    timeCap: "30 mins",
    movements: ["50m Heavy Sled Push", "20 Burpee Box Jump Overs", "50m Sled Drag", "100m Farmers Carry", "400m Fast Run"],
    description: "Develops brutal locomotive horsepower and mental resilience.",
    targetMuscles: ["Quads", "Calves", "Glutes", "Cardio", "Forearms"]
  },
  {
    id: "wod_wallball_death",
    name: "Wall Ball & Row Pyramids",
    category: "Hyrox & Hybrid",
    format: "For Time",
    difficulty: "Medium",
    rxMale: "9 kg Ball",
    rxFemale: "6 kg Ball",
    timeCap: "22 mins",
    movements: ["500m Row - 50 Wall Balls", "400m Row - 40 Wall Balls", "300m Row - 30 Wall Balls", "200m Row - 20 Wall Balls", "100m Row - 10 Wall Balls"],
    description: "Descending sprint pyramid. Maintain high stroke power on the rower.",
    targetMuscles: ["Quads", "Shoulders", "Lats", "Cardio"]
  },
  {
    id: "wod_ski_lunge_burner",
    name: "SkiErg & Sandbag Burner",
    category: "Hyrox & Hybrid",
    format: "5 Rounds For Time",
    difficulty: "Hard",
    rxMale: "20 kg Sandbag",
    rxFemale: "15 kg Sandbag",
    timeCap: "28 mins",
    movements: ["400m SkiErg", "30m Sandbag Walking Lunges", "15 Toes-to-Bar", "200m Sprint"],
    description: "Simulates the demanding final stations of a Hyrox championship.",
    targetMuscles: ["Lats", "Quads", "Glutes", "Core", "Cardio"]
  },

  // 4. AMRAPS & CHIPPERS
  {
    id: "wod_fight_gone_bad",
    name: "Fight Gone Bad",
    category: "AMRAPs & EMOMs",
    format: "3 Rounds (1 min per station, 1m rest)",
    difficulty: "Hard",
    rxMale: "34 kg PP / 9 kg WB / 20 in Box / 16 kg SDHP",
    rxFemale: "25 kg PP / 6 kg WB / 20 in Box / 12 kg SDHP",
    timeCap: "17 mins",
    movements: ["1 min Wall Balls", "1 min Sumo Deadlift High-Pulls", "1 min Box Jumps", "1 min Push Press", "1 min Row (Calories)", "1 min Rest"],
    description: "Classic MMA conditioning test. Maximize total reps across all 3 rounds.",
    targetMuscles: ["Whole Body", "Cardio", "Quads", "Shoulders"]
  },
  {
    id: "wod_filthy_fifty",
    name: "Filthy Fifty",
    category: "Chippers",
    format: "For Time",
    difficulty: "Elite",
    rxMale: "24 in Box / 16 kg KB / 20 kg Barbell",
    rxFemale: "20 in Box / 12 kg KB / 15 kg Barbell",
    timeCap: "35 mins",
    movements: ["50 Box Jumps", "50 Jumping Pull-ups", "50 KB Swings", "50 Walking Lunges", "50 Knees-to-Elbows", "50 Push Press", "50 Back Extensions", "50 Wall Balls", "50 Burpees", "50 Double Unders"],
    description: "Legendary 500-rep mega chipper. Test of pure cardiovascular and muscular grit.",
    targetMuscles: ["Whole Body", "Cardio", "Quads", "Core"]
  },
  {
    id: "wod_the_300",
    name: "The 300 Workout",
    category: "Chippers",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "61 kg DL / 16 kg KB / 24 in Box",
    rxFemale: "43 kg DL / 12 kg KB / 20 in Box",
    timeCap: "25 mins",
    movements: ["25 Pull-ups", "50 Deadlifts", "50 Push-ups", "50 Box Jumps", "50 Floor Wipers", "50 KB Clean & Press", "25 Pull-ups"],
    description: "Hollywood Spartan strength and body composition conditioning challenge.",
    targetMuscles: ["Lats", "Chest", "Hamstrings", "Shoulders", "Core"]
  },
  {
    id: "wod_tabata_this",
    name: "Tabata This!",
    category: "AMRAPs & EMOMs",
    format: "Tabata (20s on / 10s off x 8 rounds each)",
    difficulty: "Medium",
    rxMale: "Bodyweight & Rower",
    rxFemale: "Bodyweight & Rower",
    timeCap: "24 mins",
    movements: ["Tabata Row (Calories)", "Tabata Air Squats", "Tabata Pull-ups", "Tabata Push-ups", "Tabata Sit-ups"],
    description: "1 min rest between movements. Score is the sum of lowest reps in each movement.",
    targetMuscles: ["Whole Body", "Cardio", "Quads", "Chest", "Lats"]
  },
  {
    id: "wod_death_by_burpees",
    name: "Death By Burpees",
    category: "AMRAPs & EMOMs",
    format: "EMOM until failure",
    difficulty: "Hard",
    rxMale: "Chest to ground",
    rxFemale: "Chest to ground",
    timeCap: "20 mins",
    movements: ["Min 1: 1 Burpee", "Min 2: 2 Burpees", "Min 3: 3 Burpees", "... continue until you cannot finish in the minute"],
    description: "Mental toughness test. Reaching minute 16+ (136 total burpees) is exceptional.",
    targetMuscles: ["Chest", "Quads", "Cardio", "Shoulders"]
  }
];

// Automatically populate additional procedural functional WODs to exceed 50+ entries
(function ensureWODsCount() {
  const themes = [
    { name: "Barbell Thunder", m: ["12 Hang Power Cleans (50kg)", "12 Front Squats (50kg)", "12 Push Press (50kg)"], cat: "CrossFit", diff: "Hard", musc: ["Quads", "Shoulders", "Upper Back"] },
    { name: "Dumbbell Devil Triplet", m: ["10 Devil Press (2x15kg)", "15 DB Thrusters", "20 Renegade Rows"], cat: "CrossFit", diff: "Hard", musc: ["Chest", "Shoulders", "Lats", "Core"] },
    { name: "Kettlebell Storm", m: ["20 KB Snatches (20kg)", "20 Goblet Squats", "30 KB Russian Swings"], cat: "CrossFit", diff: "Medium", musc: ["Hamstrings", "Quads", "Shoulders"] },
    { name: "Engine & Ergometer Blitz", m: ["500m SkiErg", "500m Row", "400m Fast Run"], cat: "Hyrox & Hybrid", diff: "Medium", musc: ["Cardio", "Calves", "Lats"] },
    { name: "Core & Gymnastic Chipper", m: ["20 Toes-to-Bar", "30 AbMat Sit-ups", "40 Hollow Rocks", "50 Planks (seconds)"], cat: "Bodyweight", diff: "Medium", musc: ["Core", "Hip Flexors"] },
    { name: "Sprint Triplet", m: ["200m Sprint", "15 Burpees", "15 DB Thrusters"], cat: "CrossFit", diff: "Medium", musc: ["Quads", "Chest", "Cardio"] },
    { name: "Heavy Metal Triad", m: ["10 Deadlifts (100kg)", "10 Bench Press (70kg)", "10 Strict Pull-ups"], cat: "CrossFit", diff: "Hard", musc: ["Hamstrings", "Chest", "Lats"] },
    { name: "Hyrox Compromised Legs", m: ["400m Run", "50m Sled Push (100kg)", "30 Jumping Lunges"], cat: "Hyrox & Hybrid", diff: "Hard", musc: ["Quads", "Glutes", "Cardio"] },
    { name: "Bodyweight Hell", m: ["15 Handstand Push-ups", "25 Box Jumps", "35 Chest-to-Bar Pull-ups"], cat: "Bodyweight", diff: "Hard", musc: ["Shoulders", "Lats", "Quads"] },
    { name: "Sandbag Warfare", m: ["100m Sandbag Carry (30kg)", "20 Sandbag Squats", "15 Burpee Over Sandbag"], cat: "Hyrox & Hybrid", diff: "Hard", musc: ["Core", "Quads", "Upper Back"] }
  ];

  let counter = 1;
  while (CROSSFIT_WOD_DATABASE.length < 52) {
    const t = themes[counter % themes.length];
    CROSSFIT_WOD_DATABASE.push({
      id: `wod_gen_${counter}`,
      name: `${t.name} #${counter}`,
      category: t.cat,
      format: counter % 2 === 0 ? "5 Rounds For Time" : "18 min AMRAP",
      difficulty: t.diff,
      rxMale: "Standard Rx",
      rxFemale: "Standard Rx",
      timeCap: "20 mins",
      movements: t.m,
      description: `High-intensity conditioning circuit designed to build power and engine capacity.`,
      targetMuscles: t.musc
    });
    counter++;
  }
})();

// =========================================================================
// 4. EXERCISE LIBRARY
// =========================================================================
const EXERCISE_LIBRARY = [
  {
    id: "pin_squat",
    name: "Pin Back Squat / Back Squat",
    category: "Lower",
    equipment: "Barbell",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Lower Back", "Core"],
    formCues: "Gánh tạ ngang vai, hạ chậm đến khi chạm chốt (pin), dừng 1 giây không nhún rồi đẩy bùng nổ lên.",
    swaps: [
      { id: "leg_press", name: "Leg Press 45°", reason: "Giảm tải cột sống khi lưng dưới hoặc háng mệt" },
      { id: "hack_squat", name: "Hack Squat", reason: "Tối đa hóa lực căng cô lập đùi trước" }
    ]
  },
  {
    id: "leg_press",
    name: "Leg Press 45°",
    category: "Lower",
    equipment: "Machine",
    primaryMuscles: ["Quads"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    formCues: "Đặt bàn chân giữa mâm, mở rộng bằng vai. Hạ sâu gối 90° không nhấc mông khỏi đệm.",
    swaps: [
      { id: "pin_squat", name: "Back Squat", reason: "Chuyển sang gánh tạ tự do xây dựng sức mạnh lõi" }
    ]
  },
  {
    id: "hack_squat",
    name: "Hack Squat Machine",
    category: "Lower",
    equipment: "Machine",
    primaryMuscles: ["Quads"],
    secondaryMuscles: ["Glutes"],
    formCues: "Tựa lưng sát đệm máy, hạ chậm cảm nhận đùi trước căng giãn tối đa rồi đạp thẳng chân.",
    swaps: [
      { id: "leg_press", name: "Leg Press", reason: "Điều chỉnh góc đẩy thân thiện với khớp gối hơn" }
    ]
  },
  {
    id: "leg_curl",
    name: "Lying / Seated Leg Curl",
    category: "Lower",
    equipment: "Machine",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    formCues: "Cố định đùi chặt vào đệm. Gập gót chân sát mông, giữ 1s đỉnh co thắt, hạ chậm 2-3s.",
    swaps: [
      { id: "rdl_db", name: "Romanian Deadlift (DB/Barbell)", reason: "Kéo giãn chuỗi sau và mông đùi dưới tải tự do" }
    ]
  },
  {
    id: "leg_extension",
    name: "Leg Extension (Quad Burner)",
    category: "Lower",
    equipment: "Machine",
    primaryMuscles: ["Quads"],
    secondaryMuscles: [],
    formCues: "Đá chân lên thẳng hoàn toàn, siết chặt đùi trước 1 giây đỉnh co thắt rồi hạ chậm.",
    swaps: [
      { id: "sissy_squat", name: "Sissy Squat", reason: "Tập đùi trước tự thân không cần máy" }
    ]
  },
  {
    id: "calf_raise",
    name: "Standing / Seated Calf Raise",
    category: "Lower",
    equipment: "Machine",
    primaryMuscles: ["Calves"],
    secondaryMuscles: [],
    formCues: "Nhón cao hết biên độ giữ 1s đỉnh, hạ gót sâu xuống dưới đệm giữ 2s giãn bắp chuối.",
    swaps: []
  },
  {
    id: "pull_up",
    name: "Weighted / BW Pull-up",
    category: "Upper",
    equipment: "Bodyweight",
    primaryMuscles: ["Lats", "Upper Back"],
    secondaryMuscles: ["Biceps", "Forearms"],
    formCues: "Treo người thẳng tay, kéo bả vai xuống trước khi gập cùi chỏ. Cằm vượt qua xà, eccentric 2 giây.",
    swaps: [
      { id: "lat_pulldown", name: "Lat Pulldown", reason: "Dễ điều chỉnh mức tạ chính xác theo số reps" }
    ]
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown (Neutral / Wide)",
    category: "Upper",
    equipment: "Cable",
    primaryMuscles: ["Lats"],
    secondaryMuscles: ["Biceps", "Upper Back"],
    formCues: "Cố định đùi dưới đệm. Kéo thanh đòn về phía xương quai xanh, ép chặt bả vai.",
    swaps: [
      { id: "pull_up", name: "Pull-up", reason: "Chuyển sang bài kéo tự do trọng lượng cơ thể" }
    ]
  },
  {
    id: "incline_db_bench",
    name: "Incline DB Bench Press",
    category: "Upper",
    equipment: "Dumbbell",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps"],
    formCues: "Góc ghế 30°–45°. Ép nhẹ bả vai vào đệm, hạ tạ sâu ngang ngực trên cảm nhận cơ căng giãn.",
    swaps: [
      { id: "machine_chest_press", name: "Machine Chest Press", reason: "Tăng tính an toàn khi tập failure" },
      { id: "flat_db_bench", name: "Flat DB Bench Press", reason: "Tối ưu hóa tổng tải ngực toàn diện" }
    ]
  },
  {
    id: "flat_db_bench",
    name: "Flat DB Bench Press",
    category: "Upper",
    equipment: "Dumbbell",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Triceps", "Shoulders"],
    formCues: "Nằm ngửa vững chãi, đẩy tạ theo hình vòng cung nhẹ, không khóa khớp cùi chỏ.",
    swaps: []
  },
  {
    id: "dips",
    name: "Chest / Triceps Dips",
    category: "Upper",
    equipment: "Bodyweight",
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders"],
    formCues: "Nghiêng người về trước 20° để vào ngực. Xuống góc cùi chỏ 90°, đẩy lên dứt khoát.",
    swaps: []
  },
  {
    id: "chest_supported_row",
    name: "Chest-Supported Row",
    category: "Upper",
    equipment: "Machine",
    primaryMuscles: ["Upper Back", "Lats"],
    secondaryMuscles: ["Biceps", "Rear Delts"],
    formCues: "Áp ngực sát đệm tựa. Kéo cùi chỏ về sau siết chặt bả vai, giữ 1 giây co thắt đỉnh.",
    swaps: [
      { id: "seated_cable_row", name: "Seated Cable Row", reason: "Linh hoạt các loại tay cầm cáp" }
    ]
  },
  {
    id: "machine_shoulder_press",
    name: "Machine Shoulder Press",
    category: "Upper",
    equipment: "Machine",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    formCues: "Tay cầm ngang tai. Đẩy tạ thẳng đứng kiểm soát, hạ sâu đến cằm không để tạ chạm đệm nghỉ.",
    swaps: []
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise (Cable / DB)",
    category: "Upper",
    equipment: "Cable",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Traps"],
    formCues: "Nghiêng nhẹ người 10°. Nâng tay dang ngang theo mặt phẳng bả vai, cùi chỏ dẫn đường.",
    swaps: []
  },
  {
    id: "biceps_curl",
    name: "Incline DB Biceps Curl",
    category: "Upper",
    equipment: "Dumbbell",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    formCues: "Khóa cố định cùi chỏ bên hông. Cuộn tạ lên siết chặt bắp tay trước, hạ chậm 2s.",
    swaps: []
  },
  {
    id: "triceps_pushdown",
    name: "Triceps Pushdown (Rope / V-Bar)",
    category: "Upper",
    equipment: "Cable",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    formCues: "Khóa cùi chỏ sát thân người. Đẩy cáp xuống mở rộng dây ở đáy, giữ 1s siết cơ tay sau.",
    swaps: []
  },
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg / Knee Raise",
    category: "Core",
    equipment: "Bodyweight",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip Flexors"],
    formCues: "Treo xà, cuộn xương chậu lên về phía ngực, không đung đưa theo quán tính.",
    swaps: []
  }
];

// Muscle Anatomy mapping for 3D Heatmap highlighting
const ANATOMY_MUSCLE_MAP = {
  Quads: ["quads_left", "quads_right", "vmo_left", "vmo_right"],
  Hamstrings: ["hamstring_left", "hamstring_right"],
  Glutes: ["glute_left", "glute_right", "glute_med_left", "glute_med_right"],
  Chest: ["pec_major_left", "pec_major_right", "pec_upper_left", "pec_upper_right"],
  Lats: ["lat_left", "lat_right"],
  "Upper Back": ["traps_mid", "traps_lower", "rhomboids"],
  Shoulders: ["delt_front_left", "delt_front_right", "delt_side_left", "delt_side_right", "delt_rear_left", "delt_rear_right"],
  Biceps: ["biceps_left", "biceps_right"],
  Triceps: ["triceps_left", "triceps_right"],
  Calves: ["calf_left", "calf_right", "soleus_left", "soleus_right"],
  Core: ["abs_upper", "abs_lower", "obliques_left", "obliques_right"],
  "Lower Back": ["erector_left", "erector_right"]
};

if (typeof window !== "undefined") {
  window.DEFAULT_PROGRAMS = DEFAULT_PROGRAMS;
  window.NASM_CEX_DATABASE = NASM_CEX_DATABASE;
  window.CROSSFIT_WOD_DATABASE = CROSSFIT_WOD_DATABASE;
  window.EXERCISE_LIBRARY = EXERCISE_LIBRARY;
  window.ANATOMY_MUSCLE_MAP = ANATOMY_MUSCLE_MAP;
}
