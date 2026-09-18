/**
 * Dino Tracking - Comprehensive Database & Presets
 * Contains:
 * 1. Default Built-in Preset: "Dino Hybrid 1.0" (BFS Hybrid Athlete 2-Week Rotation)
 * 2. 100+ CrossFit WODs & Functional Conditioning Database (The Girls, Heroes, Hyrox, AMRAPs, Chippers)
 * 3. Comprehensive Exercise Library (Normal, Functional, Core, Machine, Free-weight, Running)
 * 4. Muscle Anatomical Mapping for SVG Heatmap
 * 5. Smart Recovery Rules & Priority Hierarchy
 */

const DEFAULT_PROGRAMS = [
  {
    id: "dino_hybrid_1",
    name: "Dino Hybrid 1.0",
    subtitle: "BFS Hybrid Athlete 2-Week Rotation",
    description: "Running Performance • Hypertrophy • Strength • Hyrox Conditioning • Soccer",
    philosophy: "Ít work sets, intensity cao, ưu tiên 4–10 reps ở resistance, có Rest-Pause, duy trì chạy và đá bóng thứ 7.",
    target: "HM Sub-2 Readiness + Thigh & Shoulder Hypertrophy",
    rotationWeeks: 2,
    isBuiltIn: true,
    weeks: {
      A: {
        id: "A",
        title: "Week A — Running Performance + Strength",
        focus: "Threshold / Speed Run, Heavy Compound Lifts, Long Run 12km, Soccer",
        targetKm: 23,
        days: [
          {
            dayIndex: 0,
            dayKey: "T2",
            dayName: "Thứ Hai (T2)",
            title: "Quality Run (Threshold / Speed)",
            type: "run",
            focus: "Threshold / Tốc độ 10 km–HM",
            badge: "Quality Run",
            estimatedTime: "45-55 mins",
            targetKm: 9.5,
            options: [
              {
                id: "opt_a",
                title: "Option A: Threshold Cruise (Ưu tiên HM)",
                details: "Warm-up 1.5–2 km → 3 × 2 km @ ~5:45–5:55/km (nghỉ 2' jog giữa set) → Cool-down 1–2 km.",
                rpe: "RPE 7.5–8.5",
                targetKm: 9.5
              },
              {
                id: "opt_b",
                title: "Option B: 1 km Repeats (Võ đài tốc độ)",
                details: "Warm-up 2 km → 4–5 × 1 km @ ~5:25–5:40/km (nghỉ 2' jog) → Cool-down 1.5 km.",
                rpe: "RPE rep cuối tối đa ~8.5",
                targetKm: 8.5
              },
              {
                id: "opt_c",
                title: "Option C: Progression 8 km",
                details: "2 km easy → 2 km steady → 2 km ~6:00/km → 2 km ~5:45–5:35/km nếu chân tốt.",
                rpe: "RPE tăng dần 5 → 8. Không biến thành race.",
                targetKm: 8.0
              },
              {
                id: "opt_d",
                title: "Option D: Khi Mệt / Phục hồi",
                details: "4–6 km easy nhẹ nhàng, hoàn toàn bỏ interval/quality.",
                rpe: "RPE 5–6. Không cố bù ngày khác.",
                targetKm: 5.0
              }
            ],
            checklist: [
              { id: "wA_t2_wu", label: "Khởi động kỹ & Dynamic Stretches (10')", note: "Bắp chân, đùi sau, khớp háng" },
              { id: "wA_t2_main", label: "Chạy đúng Option đã chọn theo Pace / RPE", note: "Threshold 5:45-5:55 hoặc Repeats" },
              { id: "wA_t2_cd", label: "Cool-down & Bù nước điện giải", note: "Không tập thêm lower nặng" }
            ]
          },
          {
            dayIndex: 1,
            dayKey: "T3",
            dayName: "Thứ Ba (T3)",
            title: "Full Body Strength",
            type: "strength",
            focus: "Strength + Tension toàn thân, ít sets, chất lượng cao",
            badge: "Full Body",
            estimatedTime: "50-60 mins",
            exercises: [
              {
                id: "pin_squat",
                name: "Pin Back Squat hoặc Back Squat",
                category: "Lower (Quad/Glutes)",
                equipment: "Barbell",
                targetRequirement: "2 sets × 5–8 reps @ RIR 1–2 (Nghỉ 3m)",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Top hard set" },
                  { setNum: 2, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Back-off hard set" }
                ],
                optionNote: "Nếu chân mệt: Đổi Leg Press 2 × 6–10 @ RIR 1."
              },
              {
                id: "pull_up",
                name: "Weighted / BW Pull-up",
                category: "Upper (Lats/Back)",
                equipment: "Bodyweight",
                targetRequirement: "2 sets × 5–8 reps @ RIR 0–1 (Nghỉ 2–3m)",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150, note: "Set 1 chuẩn kỹ thuật" },
                  { setNum: 2, reps: "5-8", rir: "RIR 0-1", restSec: 150, note: "Set 2 hard effort" }
                ],
                optionNote: "Nếu grip/shoulder mệt: Lat Pulldown 2 × 6–10."
              },
              {
                id: "incline_db_bench",
                name: "Incline DB Bench Press",
                category: "Upper (Upper Chest)",
                equipment: "Dumbbell",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0–1 (Nghỉ 2–3m)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 150, note: "Kiểm soát eccentric" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 150, note: "Set cuối hard push" }
                ],
                optionNote: "Có thể đổi Machine Chest Press."
              },
              {
                id: "leg_curl",
                name: "Lying / Seated Leg Curl",
                category: "Lower (Hamstrings)",
                equipment: "Machine",
                isRestPause: true,
                targetRequirement: "1 Set chuẩn 6–10 reps + 1 Set Rest-Pause @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 120, note: "Set thông thường" },
                  { setNum: 2, reps: "10-15+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause (dừng khi < 3 reps)" }
                ],
                optionNote: "Nếu hamstring nhạy cảm: 2 × 6–8 @ RIR 2, bỏ RP."
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise (Cable / DB)",
                category: "Upper (Side Delts)",
                equipment: "Cable",
                isRestPause: true,
                targetRequirement: "1 Rest-Pause Extended Set (10–20 + mini sets)",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0-1", restSec: 15, isRestPause: true, note: "1 Rest-Pause Extended Set" }
                ],
                optionNote: "Ưu tiên Cable unilateral hoặc Machine."
              },
              {
                id: "hanging_leg_raise",
                name: "Hanging Leg Raise",
                category: "Core (Abs/Hip)",
                equipment: "Bodyweight",
                targetRequirement: "2 sets × 8–15 reps (Kiểm soát khung chậu)",
                defaultSets: [
                  { setNum: 1, reps: "8-15", rir: "Sub-fail", restSec: 90, note: "Kiểm soát khung chậu" },
                  { setNum: 2, reps: "8-15", rir: "Sub-fail", restSec: 90, note: "Đổi Knee Raise nếu swing" }
                ],
                optionNote: "Dừng trước khi mất kiểm soát pelvic."
              }
            ]
          },
          {
            dayIndex: 2,
            dayKey: "T4",
            dayName: "Thứ Tư (T4)",
            title: "Easy Run + Core / Carry",
            type: "hybrid",
            focus: "Duy trì tần suất chạy, phục hồi chủ động, core stability",
            badge: "Easy Run & Core",
            estimatedTime: "40-50 mins",
            targetKm: 5.5,
            runDetail: {
              desc: "5–6 km Easy Run @ RPE 5–6 (Zone 2). Giữ pace trò chuyện thoải mái.",
              targetKm: 5.5
            },
            options: [
              {
                id: "core_a",
                title: "Core Option A: Grip & Hip Stability",
                details: "Farmer Carry 2 × 40–60m + Copenhagen Plank 2 × 20–40s/bên + Hanging Knee Raise 2 × 10–15."
              },
              {
                id: "core_b",
                title: "Core Option B: Anti-Rotation & Trunk",
                details: "Suitcase Carry 2 × 30–40m/bên + Plank 2 × 45–60s + Russian Twist 2 × 12–20/bên."
              },
              {
                id: "core_tired",
                title: "Option Khi Mệt: Recovery Only",
                details: "Chỉ chạy 4–5 km easy hoặc 30–45 phút đi bộ nhanh; bỏ toàn bộ bài core nếu mệt."
              }
            ],
            checklist: [
              { id: "wA_t4_run", label: "5-6 km Easy Run (RPE 5-6 / Zone 2)", note: "Hít thở bằng mũi thoải mái" },
              { id: "wA_t4_core", label: "Thực hiện chuỗi Core / Carry đã chọn", note: "2 sets mỗi bài" },
              { id: "wA_t4_stretch", label: "Giãn cơ chân và foam roll nhẹ", note: "10 phút" }
            ]
          },
          {
            dayIndex: 3,
            dayKey: "T5",
            dayName: "Thứ Năm (T5)",
            title: "Upper Strength / Hypertrophy",
            type: "strength",
            focus: "Upper Body tổng lực + Ưu tiên Vai phát triển",
            badge: "Upper Focus",
            estimatedTime: "55-65 mins",
            exercises: [
              {
                id: "dips",
                name: "Dips (Chest / Triceps)",
                category: "Upper (Chest/Tri)",
                equipment: "Bodyweight",
                targetRequirement: "2 sets × 5–8 reps @ RIR 0–1 (Nghỉ 2–3m)",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150, note: "Kiểm soát độ sâu" },
                  { setNum: 2, reps: "5-8", rir: "RIR 0-1", restSec: 150, note: "Set cuối hard effort" }
                ],
                optionNote: "Nếu vai khó chịu: Machine Chest Press."
              },
              {
                id: "chest_supported_row",
                name: "Chest-Supported Row",
                category: "Upper (Upper Back)",
                equipment: "Machine",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0 (Nghỉ 2m)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Squeeze bả vai" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Set cuối RIR 0" }
                ],
                optionNote: "Đổi Seated Cable Row nếu máy bận."
              },
              {
                id: "machine_shoulder_press",
                name: "Machine Shoulder Press",
                category: "Upper (Shoulder Priority)",
                equipment: "Machine",
                isRestPause: true,
                targetRequirement: "1 Set 6–10 reps + 1 Set Rest-Pause (Nghỉ 15–20s)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 120, note: "Hard work set" },
                  { setNum: 2, reps: "3-6+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause mini set" }
                ],
                optionNote: "Nếu mỏi vai: DB high incline press 2 × 6–10."
              },
              {
                id: "lat_pulldown",
                name: "Lat Pulldown",
                category: "Upper (Lats)",
                equipment: "Cable",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0 (Nghỉ 2m)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Full stretch ở đỉnh" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Set cuối RIR 0" }
                ],
                optionNote: "Đổi Neutral-Grip Pull-down."
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise (Rest-Pause)",
                category: "Upper (Side Delts)",
                equipment: "Cable",
                isRestPause: true,
                targetRequirement: "1 Rest-Pause Extended Set (10–20 + mini sets)",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0-1", restSec: 15, isRestPause: true, note: "RP extended set" }
                ],
                optionNote: "Cable unilateral hoặc DB."
              },
              {
                id: "biceps_curl",
                name: "Biceps Curl (Cable / DB)",
                category: "Upper (Biceps)",
                equipment: "Dumbbell",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90, note: "Set 1 kiểm soát" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90, note: "Set cuối failure" }
                ],
                optionNote: "Incline DB hoặc Cable EZ-Bar."
              },
              {
                id: "triceps_pushdown",
                name: "Triceps Pushdown (Rope / Bar)",
                category: "Upper (Triceps)",
                equipment: "Cable",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90, note: "Khóa khớp cùi chỏ" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90, note: "Set cuối failure" }
                ],
                optionNote: "Rope pushdown hoặc Overhead extension."
              }
            ]
          },
          {
            dayIndex: 4,
            dayKey: "T6",
            dayName: "Thứ Sáu (T6)",
            title: "Long Run ≤ 12 km",
            type: "run",
            focus: "Xây dựng sức bền Aerobic nền tảng cho HM",
            badge: "Long Run",
            estimatedTime: "60-75 mins",
            targetKm: 10.0,
            options: [
              {
                id: "long_a",
                title: "Option A: Easy Long Run (Ưu tiên)",
                details: "8–12 km @ RPE 6–7. Pace tham khảo: 6:20–6:50/km.",
                targetKm: 10.0
              },
              {
                id: "long_b",
                title: "Option B: Fast-Finish Long",
                details: "8–12 km: Phần lớn Easy, 2–3 km cuối đẩy nhẹ lên Steady.",
                targetKm: 11.0
              },
              {
                id: "long_c",
                title: "Option C: Khi Chân Nặng / Quá tải",
                details: "6–8 km easy hoặc 45–60 phút đi bộ dốc.",
                targetKm: 7.0
              }
            ],
            checklist: [
              { id: "wA_t6_fuel", label: "Chuẩn bị nước, điện giải và carb nhẹ", note: "Bảo đảm năng lượng" },
              { id: "wA_t6_run", label: "Chạy Long Run 8-12 km theo pace kiểm soát", note: "RPE 6-7" },
              { id: "wA_t6_post", label: "Sau chạy: Ăn bổ sung carb + protein, không tập chân", note: "Giữ sức cho đá bóng T7" }
            ]
          },
          {
            dayIndex: 5,
            dayKey: "T7",
            dayName: "Thứ Bảy (T7)",
            title: "Soccer (Đá Bóng)",
            type: "game",
            focus: "Speed, Đổi hướng COD, Conditioning tự nhiên",
            badge: "Match Day",
            estimatedTime: "60-90 mins",
            details: "Trận đấu bóng đá sân 7/11. Hoạt động bộc phát cường độ cao. Được tính là một Stressor lớn trong tuần.",
            checklist: [
              { id: "wA_t7_warmup", label: "Khởi động kỹ khớp gối, cổ chân, cơ háng", note: "15 phút" },
              { id: "wA_t7_match", label: "Tham gia thi đấu hết mình & an toàn", note: "Quản lý sức bền" },
              { id: "wA_t7_rehydrate", label: "Bù nước, protein và khoáng chất sau trận", note: "Phục hồi" }
            ]
          },
          {
            dayIndex: 6,
            dayKey: "CN",
            dayName: "Chủ Nhật (CN)",
            title: "OFF / Active Recovery",
            type: "rest",
            focus: "Nghỉ ngơi hoàn toàn, hồi phục hệ thần kinh và cơ bắp",
            badge: "Rest Day",
            estimatedTime: "Cả ngày",
            details: "Không tập nặng. Có thể đi dạo nhẹ nhàng 20–30 phút, giãn cơ tĩnh, ngủ đủ 8+ tiếng.",
            checklist: [
              { id: "wA_cn_sleep", label: "Ngủ sâu ≥ 8 tiếng", note: "Hồi phục cơ bắp" },
              { id: "wA_cn_nutrition", label: "Đảm bảo đủ lượng Protein (1.8-2.2g/kg)", note: "Tái tạo mô cơ" },
              { id: "wA_cn_review", label: "Review tuần tập và chuẩn bị tâm lý cho Week B", note: "Đánh giá DOMS" }
            ]
          }
        ]
      },
      B: {
        id: "B",
        title: "Week B — Hypertrophy + Hybrid Game + Running Volume",
        focus: "Hybrid Game (Hyrox-style), Lower Hypertrophy, Upper Hypertrophy, Long/Progression Run, Soccer",
        targetKm: 21,
        days: [
          {
            dayIndex: 0,
            dayKey: "T2",
            dayName: "Thứ Hai (T2)",
            title: "Hybrid Game / Hyrox-Style (For Time Block)",
            type: "circuit",
            focus: "Fun conditioning + Running under fatigue (Grouped Block with Single Timer)",
            badge: "Hybrid Circuit",
            estimatedTime: "45-60 mins",
            targetKm: 5.0,
            circuitData: {
              format: "For Time",
              title: "Hyrox-Style Chipper",
              timeCap: "45 mins",
              items: [
                { id: "c_run1", name: "1 km Run @ Moderate Pace", reps: "1 km", completed: false },
                { id: "c_burp", name: "50 Burpees over line", reps: "50 reps", completed: false },
                { id: "c_run2", name: "1 km Run @ Steady Pace", reps: "1 km", completed: false },
                { id: "c_slam", name: "50 Med Ball Slams (10kg)", reps: "50 reps", completed: false },
                { id: "c_run3", name: "1 km Run @ Steady Pace", reps: "1 km", completed: false },
                { id: "c_knee", name: "50 Hanging Knee / Leg Raises", reps: "50 reps", completed: false },
                { id: "c_run4", name: "1 km Run @ Steady Pace", reps: "1 km", completed: false },
                { id: "c_row", name: "50 TRX / Inverted Rows", reps: "50 reps", completed: false },
                { id: "c_run5", name: "1 km Finish Run (Fast)", reps: "1 km", completed: false }
              ]
            },
            options: [
              {
                id: "wB_hy_a",
                title: "Option A: 5 km Chipper (Mặc định)",
                details: "1 km run → 50 Burpee → 1 km run → 50 Med Ball Slam → 1 km run → 50 Hanging Knee Raise → 1 km run → 50 TRX Row → 1 km run finish.",
                rpe: "RPE 8. Pacing linh hoạt.",
                targetKm: 5.0
              },
              {
                id: "wB_hy_b",
                title: "Option B: Accumulation Challenge (For Time)",
                details: "100 Burpee + 100 Hanging Knee Raise + 100 Slam Ball (10 kg) + 100 TRX High Row 45° for time.",
                rpe: "Pacing ổn định.",
                targetKm: 0.0
              },
              {
                id: "wB_hy_c",
                title: "Option C: Carry Hybrid (5 Rounds)",
                details: "5 Rounds: 600–800m run + 40–60m Farmer Carry + 12 Burpee + 15 Slam Ball.",
                rpe: "Lower fatigue vừa phải trước T3 Lower.",
                targetKm: 3.5
              }
            ],
            checklist: [
              { id: "wB_t2_wu", label: "Dynamic warm-up toàn thân (10')", note: "Vai, háng, gối" },
              { id: "wB_t2_main", label: "Hoàn thành Circuit For Time đã chọn", note: "Bấm giờ For Time" },
              { id: "wB_t2_cd", label: "Hạ nhiệt & bù điện giải", note: "Chuẩn bị cho T3 Lower" }
            ]
          },
          {
            dayIndex: 1,
            dayKey: "T3",
            dayName: "Thứ Ba (T3)",
            title: "Lower Hypertrophy / Strength",
            type: "strength",
            focus: "Mechanical tension cho đùi, ưu tiên tăng size & sức mạnh",
            badge: "Lower Body",
            estimatedTime: "55-65 mins",
            exercises: [
              {
                id: "pin_squat",
                name: "Back / Pin Squat",
                category: "Lower (Quad/Glutes)",
                equipment: "Barbell",
                targetRequirement: "2 sets × 5–8 reps @ RIR 1–2 (Nghỉ 3m)",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Top hard set" },
                  { setNum: 2, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Back-off (optional)" }
                ],
                optionNote: "Nếu T2 chân nặng: Smith Squat hoặc Leg Press 2 × 6–10."
              },
              {
                id: "leg_press",
                name: "Leg Press (Rest-Pause Optional)",
                category: "Lower (Quad)",
                equipment: "Machine",
                isRestPause: true,
                targetRequirement: "1 Set 8–10 reps + 1 Set Rest-Pause (Nghỉ 15–20s)",
                defaultSets: [
                  { setNum: 1, reps: "8-10", rir: "RIR 0-1", restSec: 150, note: "Set 1 hard work" },
                  { setNum: 2, reps: "3-5+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause (optional)" }
                ],
                optionNote: "Bỏ RP nếu chạy/đá bóng fatigue cao."
              },
              {
                id: "leg_extension",
                name: "Leg Extension (Rest-Pause)",
                category: "Lower (Quad Focus)",
                equipment: "Machine",
                isRestPause: true,
                targetRequirement: "1 Rest-Pause Extended Set (10–15 + mini sets)",
                defaultSets: [
                  { setNum: 1, reps: "10-15+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "RP extended set, full ROM" }
                ],
                optionNote: "Dừng khi mini set < 3 reps chuẩn."
              },
              {
                id: "leg_curl",
                name: "Leg Curl (Lying / Seated)",
                category: "Lower (Hamstrings)",
                equipment: "Machine",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0–1",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Set 1 chuẩn form" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Set 2 hard effort" }
                ],
                optionNote: "Hamstring căng: Giữ RIR 2, bỏ failure."
              },
              {
                id: "hip_adduction",
                name: "Hip Adduction Machine (Optional)",
                category: "Lower (Adductors)",
                equipment: "Machine",
                targetRequirement: "2 sets × 8–12 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "8-12", rir: "RIR 0-1", restSec: 90, note: "1 RP hoặc 2 sets" },
                  { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 90, note: "Tăng độ dày đùi trong" }
                ],
                optionNote: "Optional bổ trợ thêm."
              },
              {
                id: "calf_raise",
                name: "Calf Raise (Standing / Seated)",
                category: "Lower (Calves)",
                equipment: "Machine",
                targetRequirement: "2 sets × 6–12 reps @ RIR 0 (Giữ 1s đáy)",
                defaultSets: [
                  { setNum: 1, reps: "6-12", rir: "RIR 0", restSec: 90, note: "Giữ 1s dưới đáy" },
                  { setNum: 2, reps: "6-12", rir: "RIR 0", restSec: 90, note: "Optional nếu phục hồi tốt" }
                ],
                optionNote: "Hỗ trợ độ bật và cổ chân chạy bộ."
              }
            ]
          },
          {
            dayIndex: 2,
            dayKey: "T4",
            dayName: "Thứ Tư (T4)",
            title: "Easy Run + Optional Core",
            type: "hybrid",
            focus: "Tích lũy aerobic, xả axit lactic đùi, phục hồi nhẹ",
            badge: "Easy Run",
            estimatedTime: "40-45 mins",
            targetKm: 5.5,
            runDetail: {
              desc: "5–6 km Easy Run @ RPE 5–6 (Zone 2). Chạy hoàn toàn thư giãn.",
              targetKm: 5.5
            },
            options: [
              {
                id: "core_opt_b1",
                title: "Core Option: Trunk & Pelvic Stability",
                details: "Hanging Leg Raise 2 × 8–15 + Russian Twist 2 × 12–20/bên + Plank 2 × 45–60s."
              },
              {
                id: "core_opt_b2",
                title: "Khi Mệt / DOMS nhiều",
                details: "Chỉ chạy 4 km easy hoặc 30–45 phút đi bộ; bỏ toàn bộ core nếu đùi mỏi."
              }
            ],
            checklist: [
              { id: "wB_t4_run", label: "5-6 km Easy Run (RPE 5-6)", note: "Không chạy nhanh hơn dự kiến" },
              { id: "wB_t4_core", label: "Core nhẹ nhàng (nếu cơ thể sảng khoái)", note: "2 sets" },
              { id: "wB_t4_stretch", label: "Giãn cơ bắp chuối và cơ đùi", note: "10 phút" }
            ]
          },
          {
            dayIndex: 3,
            dayKey: "T5",
            dayName: "Thứ Năm (T5)",
            title: "Upper Hypertrophy (Low Set, High Effort)",
            type: "strength",
            focus: "Upper Body & Ưu tiên Vai phát triển tối đa",
            badge: "Upper Hypertrophy",
            estimatedTime: "55-65 mins",
            exercises: [
              {
                id: "incline_db_bench",
                name: "Incline DB Bench Press",
                category: "Upper (Chest)",
                equipment: "Dumbbell",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0–1 (Nghỉ 2–3m)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 150, note: "Set 1 hard work" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 150, note: "Set cuối near failure" }
                ],
                optionNote: "Đổi Machine Chest Press nếu thích máy."
              },
              {
                id: "pull_up",
                name: "Pull-up (Weighted / Bodyweight)",
                category: "Upper (Lats)",
                equipment: "Bodyweight",
                targetRequirement: "2 sets × 5–8 reps @ RIR 0–1 (Nghỉ 2–3m)",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150, note: "Full ROM cằm qua xà" },
                  { setNum: 2, reps: "5-8", rir: "RIR 0-1", restSec: 150, note: "Set 2 hard effort" }
                ],
                optionNote: "Đổi Lat Pulldown / Neutral grip nếu mỏi grip."
              },
              {
                id: "machine_shoulder_press",
                name: "Machine Shoulder Press",
                category: "Upper (Shoulder)",
                equipment: "Machine",
                isRestPause: true,
                targetRequirement: "1 Set 6–10 reps + 1 Set Rest-Pause (Nghỉ 15–20s)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 120, note: "Hard work set" },
                  { setNum: 2, reps: "3-5+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause (optional)" }
                ],
                optionNote: "Nếu mỏi vai: bỏ RP."
              },
              {
                id: "chest_supported_row",
                name: "Seated Cable Row / Chest-Supported",
                category: "Upper (Back)",
                equipment: "Cable",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0 (Nghỉ 2m)",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Kéo sâu siết lưng giữa" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Set cuối RIR 0" }
                ],
                optionNote: "Đổi Chest-supported row."
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise (Vai giữa)",
                category: "Upper (Side Delts)",
                equipment: "Cable",
                isRestPause: true,
                targetRequirement: "1 Rest-Pause Extended Set (10–20 + mini sets)",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0-1", restSec: 15, isRestPause: true, note: "1 RP extended set" }
                ],
                optionNote: "Ưu tiên vai giữa bùng nổ."
              },
              {
                id: "rear_delt_fly",
                name: "Rear Delt Fly (Vai sau)",
                category: "Upper (Rear Delts)",
                equipment: "Machine",
                isRestPause: true,
                targetRequirement: "1 Rest-Pause Extended Set (10–20 + mini sets)",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "1 RP extended set" }
                ],
                optionNote: "Cable hoặc Reverse Pec Deck."
              },
              {
                id: "biceps_curl",
                name: "Biceps Curl (Optional)",
                category: "Upper (Arms)",
                equipment: "Dumbbell",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 90, note: "1 RP hoặc 2 sets @ RIR 0" }
                ],
                optionNote: "Cable hoặc Incline DB."
              },
              {
                id: "triceps_pushdown",
                name: "Triceps Pushdown (Optional)",
                category: "Upper (Arms)",
                equipment: "Cable",
                targetRequirement: "2 sets × 6–10 reps @ RIR 0",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 90, note: "1 RP hoặc 2 sets @ RIR 0" }
                ],
                optionNote: "Rope hoặc V-Bar."
              }
            ]
          },
          {
            dayIndex: 4,
            dayKey: "T6",
            dayName: "Thứ Sáu (T6)",
            title: "Long / Progression Run ≤ 12 km",
            type: "run",
            focus: "Aerobic + Tốc độ đặc thù race HM",
            badge: "Long Run",
            estimatedTime: "60-75 mins",
            targetKm: 10.0,
            options: [
              {
                id: "wB_long_a",
                title: "Option A: Easy Long Run (8–12 km)",
                details: "8–12 km @ RPE 6–7. Giữ nhịp tim và sải chân ổn định.",
                targetKm: 10.0
              },
              {
                id: "wB_long_b",
                title: "Option B: Progression Run (8–10 km)",
                details: "3 km Easy → 3 km Steady → 2–4 km nhanh hơn.",
                targetKm: 9.0
              },
              {
                id: "wB_long_c",
                title: "Option C: HM-Specific Nhẹ (10–12 km)",
                details: "10–12 km, có 2 × 2 km gần HM goal pace (~5:35-5:45/km).",
                targetKm: 11.5
              }
            ],
            checklist: [
              { id: "wB_t6_fuel", label: "Uống đủ nước và nạp carb trước chạy", note: "Duy trì năng lượng" },
              { id: "wB_t6_run", label: "Chạy Long / Progression theo option", note: "Tối đa 12 km" },
              { id: "wB_t6_post", label: "Ăn uống phục hồi, không tập chân bổ sung", note: "Sẵn sàng cho trận T7" }
            ]
          },
          {
            dayIndex: 5,
            dayKey: "T7",
            dayName: "Thứ Bảy (T7)",
            title: "Soccer (Đá Bóng)",
            type: "game",
            focus: "High intensity locomotion, Tốc độ bộc phát & Thể lực",
            badge: "Match Day",
            estimatedTime: "60-90 mins",
            details: "Trận bóng đá giao hữu/cạnh tranh. Được tính là một Stressor cường độ cao.",
            checklist: [
              { id: "wB_t7_warmup", label: "Khởi động kĩ khớp và cơ bắp chân (15')", note: "Phòng tránh căng cơ" },
              { id: "wB_t7_match", label: "Thi đấu và quản lý sức bền theo từng hiệp", note: "Tránh va chạm xấu" },
              { id: "wB_t7_rehydrate", label: "Bổ sung điện giải + Protein sau trận", note: "Nghỉ ngơi" }
            ]
          },
          {
            dayIndex: 6,
            dayKey: "CN",
            dayName: "Chủ Nhật (CN)",
            title: "OFF / Active Recovery",
            type: "rest",
            focus: "Hồi phục toàn diện, chuẩn bị xoay vòng trở lại Week A",
            badge: "Rest Day",
            estimatedTime: "Cả ngày",
            details: "Ngày nghỉ hoàn toàn. Ngủ nhiều, đi dạo nhẹ thư giãn, chuẩn bị tinh thần xoay vòng.",
            checklist: [
              { id: "wB_cn_sleep", label: "Ngủ đủ giấc và thư giãn thần kinh", note: "Tối ưu đồng hóa cơ" },
              { id: "wB_cn_check", label: "Kiểm tra cơ đùi/gân kheo sau trận bóng", note: "Ghi chú nếu có DOMS" },
              { id: "wB_cn_cycle", label: "Chuẩn bị xoay vòng sang Tuần A", note: "Tiếp tục chu kỳ" }
            ]
          }
        ]
      }
    }
  }
];

// =========================================================================
// 100+ CROSSFIT WODS & FUNCTIONAL CIRCUITS DATABASE FOR ROULETTE
// =========================================================================
const CROSSFIT_WOD_DATABASE = [
  // THE GIRLS
  {
    id: "wod_fran",
    name: "Fran",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "43 kg (95 lbs)",
    rxFemale: "30 kg (65 lbs)",
    movements: ["21-15-9 Thrusters", "21-15-9 Pull-ups"],
    description: "The quintessential sprint benchmark. Go all out from the gun with fast transitions.",
    targetMuscles: ["Quads", "Shoulders", "Lats", "Core"]
  },
  {
    id: "wod_cindy",
    name: "Cindy",
    category: "The Girls",
    format: "20 min AMRAP",
    difficulty: "Medium",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    movements: ["5 Pull-ups", "10 Push-ups", "15 Air Squats"],
    description: "Classic calisthenics capacity test. Aim for 20+ rounds with steady pacing.",
    targetMuscles: ["Lats", "Chest", "Quads", "Core"]
  },
  {
    id: "wod_helen",
    name: "Helen",
    category: "The Girls",
    format: "3 Rounds For Time",
    difficulty: "Medium",
    rxMale: "24 kg KB",
    rxFemale: "16 kg KB",
    movements: ["400m Run", "21 Kettlebell Swings", "12 Pull-ups"],
    description: "Hybrid running and grip endurance test.",
    targetMuscles: ["Hamstrings", "Lats", "Glutes", "Cardio"]
  },
  {
    id: "wod_grace",
    name: "Grace",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
    movements: ["30 Clean & Jerks for time"],
    description: "Heavy barbell power output test. Keep the bar close and maintain hip snap.",
    targetMuscles: ["Shoulders", "Quads", "Glutes", "Upper Back"]
  },
  {
    id: "wod_isabel",
    name: "Isabel",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
    movements: ["30 Snatches for time"],
    description: "High power Olympic weightlifting sprint. Power snatch or full snatch allowed.",
    targetMuscles: ["Shoulders", "Hamstrings", "Upper Back", "Traps"]
  },
  {
    id: "wod_diane",
    name: "Diane",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "102 kg (225 lbs)",
    rxFemale: "70 kg (155 lbs)",
    movements: ["21-15-9 Deadlifts", "21-15-9 Handstand Push-ups"],
    description: "Posterior chain power paired with gymnastic overhead pressing capacity.",
    targetMuscles: ["Hamstrings", "Glutes", "Shoulders", "Triceps"]
  },
  {
    id: "wod_karen",
    name: "Karen",
    category: "The Girls",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "9 kg (20 lbs) to 10ft target",
    rxFemale: "6 kg (14 lbs) to 9ft target",
    movements: ["150 Wall Balls for time"],
    description: "Leg burn and mental grit test. Break into disciplined sets of 25-30.",
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
    movements: ["50-40-30-20-10 Double Unders", "50-40-30-20-10 Sit-ups"],
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
    movements: ["21-15-9 Squat Cleans", "21-15-9 Ring Dips"],
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
    movements: ["1000m Row", "50 Empty Barbell Thrusters", "30 Pull-ups"],
    description: "Pure engine chipper. Don't blow up on the row!",
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
    movements: ["800m Run", "30 Heavy KB Swings", "30 Pull-ups"],
    description: "A legendary monster endurance test. 4 km total running + 150 KB swings + 150 pull-ups.",
    targetMuscles: ["Hamstrings", "Lats", "Glutes", "Cardio"]
  },
  {
    id: "wod_lynne",
    name: "Lynne",
    category: "The Girls",
    format: "5 Max Effort Rounds",
    difficulty: "Medium",
    rxMale: "Bodyweight Bench Press",
    rxFemale: "3/4 Bodyweight Bench Press",
    movements: ["Max Reps Bodyweight Bench Press", "Max Reps Unbroken Pull-ups"],
    description: "Pure muscular endurance and upper body pump benchmark.",
    targetMuscles: ["Chest", "Triceps", "Lats", "Biceps"]
  },
  {
    id: "wod_nicole",
    name: "Nicole",
    category: "The Girls",
    format: "20 min AMRAP",
    difficulty: "Medium",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    movements: ["400m Run", "Max Reps Unbroken Pull-ups"],
    description: "Score is total pull-ups completed across all rounds.",
    targetMuscles: ["Lats", "Biceps", "Cardio"]
  },
  {
    id: "wod_kelly",
    name: "Kelly",
    category: "The Girls",
    format: "5 Rounds For Time",
    difficulty: "Hard",
    rxMale: "24 in Box / 9 kg Ball",
    rxFemale: "20 in Box / 6 kg Ball",
    movements: ["400m Run", "30 Box Jumps", "30 Wall Balls"],
    description: "Pure hybrid leg burnout. 2 km running + 150 jumps + 150 wall balls.",
    targetMuscles: ["Quads", "Calves", "Shoulders", "Cardio"]
  },

  // HERO WODS
  {
    id: "wod_murph",
    name: "Murph",
    category: "Hero WODs",
    format: "For Time (Vest optional: 9kg/6kg)",
    difficulty: "Elite",
    rxMale: "9 kg (20 lbs) Vest",
    rxFemale: "6 kg (14 lbs) Vest",
    movements: ["1 Mile Run (1.6 km)", "100 Pull-ups", "200 Push-ups", "300 Air Squats", "1 Mile Run (1.6 km)"],
    description: "The ultimate Memorial Day endurance test. Partition reps 5-10-15 as needed.",
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
    movements: ["12 Deadlifts", "9 Hang Power Cleans", "6 Push Jerks"],
    description: "Barbell cycling classic. Try to rest at rep 11 of deadlifts and rep 8 of cleans.",
    targetMuscles: ["Hamstrings", "Shoulders", "Glutes", "Upper Back"]
  },
  {
    id: "wod_the_chief",
    name: "The Chief",
    category: "Hero WODs",
    format: "5 Cycles of 3 min AMRAP (1 min rest between)",
    difficulty: "Medium",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
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
    movements: ["75 Power Snatches for time"],
    description: "Lightning-fast light barbell snatch sprint. Sub-4 minutes is world class.",
    targetMuscles: ["Shoulders", "Hamstrings", "Lower Back", "Traps"]
  },
  {
    id: "wod_glen",
    name: "Glen",
    category: "Hero WODs",
    format: "For Time",
    difficulty: "Elite",
    rxMale: "61 kg (135 lbs)",
    rxFemale: "43 kg (95 lbs)",
    movements: ["30 Clean & Jerks", "1 Mile Run", "10 Burpee Muscle-ups", "1 Mile Run", "100 Burpees"],
    description: "Epic marathon hybrid workout testing total psychological resilience.",
    targetMuscles: ["Whole Body", "Cardio", "Shoulders", "Lats"]
  },
  {
    id: "wod_loredo",
    name: "Loredo",
    category: "Hero WODs",
    format: "6 Rounds For Time",
    difficulty: "Medium",
    rxMale: "Bodyweight",
    rxFemale: "Bodyweight",
    movements: ["24 Air Squats", "24 Push-ups", "24 Walking Lunges", "400m Run"],
    description: "High volume lower body burn paired with aerobic pacing.",
    targetMuscles: ["Quads", "Glutes", "Chest", "Cardio"]
  },
  {
    id: "wod_holleyman",
    name: "Holleyman",
    category: "Hero WODs",
    format: "30 Rounds For Time",
    difficulty: "Elite",
    rxMale: "102 kg (225 lbs)",
    rxFemale: "70 kg (155 lbs)",
    movements: ["5 Wall Balls", "3 Handstand Push-ups", "1 Heavy Power Clean"],
    description: "30 micro-rounds of heavy power and gymnastics.",
    targetMuscles: ["Quads", "Shoulders", "Hamstrings", "Glutes"]
  },
  {
    id: "wod_lumberjack_20",
    name: "Lumberjack 20",
    category: "Hero WODs",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "125 kg DL / 52 kg OHS / 15 kg KB / 24in Box",
    rxFemale: "84 kg DL / 34 kg OHS / 12 kg KB / 20in Box",
    movements: ["20 Deadlifts", "400m Run", "20 KB Swings", "400m Run", "20 Overhead Squats", "400m Run", "20 Burpees", "400m Run", "20 Pull-ups", "400m Run", "20 Box Jumps", "400m Run", "20 DB Squat Cleans", "400m Run"],
    description: "Massive 2.8 km running multi-movement chipper.",
    targetMuscles: ["Whole Body", "Cardio", "Hamstrings", "Quads"]
  },

  // HYROX & HYBRID ATHLETE CIRCUITS
  {
    id: "wod_hyrox_open_sim",
    name: "Hyrox Half Simulation",
    category: "Hyrox & Hybrid",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "Standard Hyrox Open Weights",
    rxFemale: "Standard Hyrox Open Weights",
    movements: ["500m Run", "500m SkiErg", "500m Run", "50m Sled Push (102kg)", "500m Run", "50m Sled Pull (78kg)", "500m Run", "40m Burpee Broad Jumps", "500m Run", "500m Row", "500m Run", "100m Farmers Carry (2x24kg)", "500m Run", "50m Sandbag Lunges (20kg)", "500m Run", "75 Wall Balls (6kg)"],
    description: "The ultimate hybrid athlete conditioning test across run and compromised movements.",
    targetMuscles: ["Quads", "Glutes", "Lats", "Cardio", "Core"]
  },
  {
    id: "wod_5k_chipper",
    name: "Dino 5K Chipper",
    category: "Hyrox & Hybrid",
    format: "For Time",
    difficulty: "Hard",
    rxMale: "10 kg Med Ball / TRX",
    rxFemale: "8 kg Med Ball / TRX",
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
    movements: ["400m SkiErg", "30m Sandbag Walking Lunges", "15 Toes-to-Bar", "200m Sprint"],
    description: "Simulates the demanding final stations of a Hyrox championship.",
    targetMuscles: ["Lats", "Quads", "Glutes", "Core", "Cardio"]
  },
  {
    id: "wod_fight_gone_bad",
    name: "Fight Gone Bad",
    category: "AMRAPs & EMOMs",
    format: "3 Rounds (1 min at each station, 1 min rest between rounds)",
    difficulty: "Hard",
    rxMale: "34 kg PP / 9 kg WB / 20 in Box / 16 kg SDHP",
    rxFemale: "25 kg PP / 6 kg WB / 20 in Box / 12 kg SDHP",
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
    movements: ["Min 1: 1 Burpee", "Min 2: 2 Burpees", "Min 3: 3 Burpees", "... continue until you cannot finish in the minute"],
    description: "Mental toughness test. Reaching minute 16+ (136 total burpees) is exceptional.",
    targetMuscles: ["Chest", "Quads", "Cardio", "Shoulders"]
  }
];

// Generate additional procedural WOD variations up to 100+ items
(function generateAdditionalWods() {
  const formats = ["For Time", "15 min AMRAP", "20 min AMRAP", "5 Rounds For Time", "4 Rounds For Time", "EMOM 16 mins"];
  const themes = [
    { prefix: "Barbell Blitz", m: ["Hang Power Cleans", "Front Squats", "Push Press"], diff: "Hard", muscles: ["Quads", "Shoulders", "Upper Back"] },
    { prefix: "Dumbbell Devil", m: ["Devil Press", "DB Thrusters", "Renegade Rows"], diff: "Hard", muscles: ["Chest", "Shoulders", "Lats", "Core"] },
    { prefix: "Kettlebell Storm", m: ["KB Snatches", "Goblet Squats", "KB Russian Swings"], diff: "Medium", muscles: ["Hamstrings", "Quads", "Shoulders"] },
    { prefix: "Cardio Engine", m: ["500m Row", "400m Run", "50 Double Unders"], diff: "Medium", muscles: ["Cardio", "Calves", "Lats"] },
    { prefix: "Core Crusher", m: ["Toes-to-Bar", "AbMat Sit-ups", "Hollow Rocks"], diff: "Easy", muscles: ["Core", "Hip Flexors"] },
    { prefix: "Bodyweight Burn", m: ["Handstand Push-ups", "Box Jumps", "Chest-to-Bar Pull-ups"], diff: "Hard", muscles: ["Shoulders", "Lats", "Quads"] },
    { prefix: "Sprint Triplet", m: ["200m Sprint", "15 Burpees", "10 Thrusters"], diff: "Medium", muscles: ["Quads", "Chest", "Cardio"] },
    { prefix: "Heavy Metal", m: ["Deadlifts", "Bench Press", "Strict Pull-ups"], diff: "Hard", muscles: ["Hamstrings", "Chest", "Lats"] }
  ];

  for (let i = 1; i <= 80; i++) {
    const t = themes[i % themes.length];
    const f = formats[i % formats.length];
    CROSSFIT_WOD_DATABASE.push({
      id: `wod_circuit_${i + 20}`,
      name: `${t.prefix} #${i}`,
      category: "Functional Circuits",
      format: f,
      difficulty: t.diff,
      rxMale: "Moderate to Heavy Rx",
      rxFemale: "Standard Rx",
      movements: t.m.map((move, idx) => `${10 + (idx * 5)} reps ${move}`),
      description: `High-intensity functional conditioning circuit combining ${t.m.join(", ")}.`,
      targetMuscles: t.muscles
    });
  }
})();

// =========================================================================
// COMPREHENSIVE EXERCISE CATALOG FOR EXERCISE LIBRARY TAB
// =========================================================================
const EXERCISE_LIBRARY = [
  {
    id: "pin_squat",
    name: "Pin Back Squat / Back Squat",
    category: "Lower",
    subcategory: "Quads & Glutes",
    equipment: "Barbell",
    primaryMuscles: ["Quads", "Glutes"],
    secondaryMuscles: ["Lower Back", "Core"],
    formCues: "Đặt thanh đòn ngang vai/cơ thang. Xuống kiểm soát đến khi chạm chốt (pin), dừng 1 giây không nhún rồi đứng dậy bùng nổ.",
    progressionTip: "Tăng 2.5kg khi đạt 2 sets x 8 reps chuẩn RIR 1.",
    isRestPause: false,
    swaps: [
      { id: "leg_press", name: "Leg Press", reason: "Giảm tải cột sống khi lưng dưới hoặc háng mệt" },
      { id: "smith_squat", name: "Smith Machine Squat", reason: "Tăng tính ổn định quỹ đạo, cô lập đùi an toàn" },
      { id: "hack_squat", name: "Hack Squat Machine", reason: "Tối đa hóa lực căng cơ học lên đùi trước" }
    ]
  },
  {
    id: "leg_press",
    name: "Leg Press 45°",
    category: "Lower",
    subcategory: "Quads & Glutes",
    equipment: "Machine",
    primaryMuscles: ["Quads"],
    secondaryMuscles: ["Glutes", "Hamstrings"],
    formCues: "Đặt bàn chân giữa mâm, mở rộng bằng vai. Hạ sâu gối 90° không nhấc mông khỏi đệm (tránh butt wink).",
    progressionTip: "Thêm đĩa 5kg-10kg mỗi bên khi set 1 đạt 10 reps chuẩn.",
    isRestPause: true,
    swaps: [
      { id: "pin_squat", name: "Pin Back Squat", reason: "Chuyển sang gánh tạ tự do xây dựng sức mạnh lõi" },
      { id: "hack_squat", name: "Hack Squat", reason: "Cô lập đùi trước quỹ đạo nghiêng 45°" }
    ]
  },
  {
    id: "pull_up",
    name: "Weighted / BW Pull-up",
    category: "Upper",
    subcategory: "Lats & Back",
    equipment: "Bodyweight",
    primaryMuscles: ["Lats", "Upper Back"],
    secondaryMuscles: ["Biceps", "Forearms"],
    formCues: "Treo người thẳng tay, kéo bả vai xuống trước khi gập cùi chỏ. Kéo cằm vượt qua xà, eccentric 2 giây.",
    progressionTip: "Khi kéo được 8 reps bodyweight chuẩn form, đeo thêm tạ belt +2.5kg đến +5kg.",
    isRestPause: false,
    swaps: [
      { id: "lat_pulldown", name: "Lat Pulldown", reason: "Dễ điều chỉnh mức tạ chính xác theo số reps mục tiêu" },
      { id: "neutral_pullup", name: "Neutral-Grip Pull-up", reason: "Thân thiện hơn với bao khớp vai và cổ tay" },
      { id: "chest_supported_row", name: "Chest-Supported Row", reason: "Tập trung phát triển độ dày lưng giữa và bả vai" }
    ]
  },
  {
    id: "incline_db_bench",
    name: "Incline DB Bench Press",
    category: "Upper",
    subcategory: "Chest & Triceps",
    equipment: "Dumbbell",
    primaryMuscles: ["Chest"],
    secondaryMuscles: ["Shoulders", "Triceps"],
    formCues: "Góc ghế 30°–45°. Ép nhẹ bả vai vào đệm, hạ tạ sâu ngang ngực trên cảm nhận cơ căng giãn, đẩy tạ lên không khóa khớp cùi chỏ.",
    progressionTip: "Tăng 2kg mỗi bên khi đạt 10 reps chuẩn ở set 1.",
    isRestPause: false,
    swaps: [
      { id: "machine_chest_press", name: "Machine Incline Chest Press", reason: "Điểm tựa lưng cố định, đẩy failure an toàn tuyệt đối" },
      { id: "flat_db_bench", name: "Flat DB Bench Press", reason: "Tối ưu hóa tổng khối lượng tạ phát triển ngực toàn diện" },
      { id: "dips", name: "Chest Dips", reason: "Bài trọng lượng cơ thể kích hoạt ngực dưới và tay sau" }
    ]
  },
  {
    id: "dips",
    name: "Chest / Triceps Dips",
    category: "Upper",
    subcategory: "Chest & Triceps",
    equipment: "Bodyweight",
    primaryMuscles: ["Chest", "Triceps"],
    secondaryMuscles: ["Shoulders"],
    formCues: "Nghiêng người về trước 20° để tập trung ngực. Xuống đến khi góc cùi chỏ đạt 90°, không hạ quá sâu gây áp lực khớp vai.",
    progressionTip: "Đeo tạ belt +5kg khi hoàn thành 2 sets x 8 reps bodyweight dễ dàng.",
    isRestPause: false,
    swaps: [
      { id: "close_grip_bench", name: "Close-Grip Bench Press", reason: "Giảm áp lực xoay ngoài lên bao khớp vai" },
      { id: "machine_chest_press", name: "Machine Chest Press", reason: "Đẩy hết sức an toàn không lo rơi tạ" }
    ]
  },
  {
    id: "chest_supported_row",
    name: "Chest-Supported Row / Cable Row",
    category: "Upper",
    subcategory: "Upper Back",
    equipment: "Machine",
    primaryMuscles: ["Upper Back", "Lats"],
    secondaryMuscles: ["Biceps", "Rear Delts"],
    formCues: "Áp ngực sát đệm tựa. Kéo cùi chỏ về sau siết chặt 2 bả vai, giữ 1 giây đỉnh co thắt, duỗi thẳng tay cảm nhận cơ lưng giãn.",
    progressionTip: "Tăng mức tạ khi set 1 đạt 10 reps @ RIR 1.",
    isRestPause: false,
    swaps: [
      { id: "seated_cable_row", name: "Seated Cable Row", reason: "Thay đổi các loại tay cầm V-Bar / Wide Grip linh hoạt" },
      { id: "one_arm_db_row", name: "One-Arm DB Row", reason: "Kéo từng bên giúp cân bằng cơ bắp 2 bên lưng" }
    ]
  },
  {
    id: "machine_shoulder_press",
    name: "Machine Shoulder Press",
    category: "Upper",
    subcategory: "Shoulders",
    equipment: "Machine",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Triceps"],
    formCues: "Chỉnh ghế sao cho tay cầm ngang tầm tai. Đẩy tạ thẳng đứng kiểm soát, hạ tạ sâu đến cằm không để tạ chạm đệm nghỉ.",
    progressionTip: "1 Set chuẩn 6-10 reps + 1 Set Rest-Pause mini sets.",
    isRestPause: true,
    swaps: [
      { id: "db_shoulder_press", name: "Seated DB Shoulder Press", reason: "Tăng khả năng ổn định và biên độ khớp vai tự nhiên" },
      { id: "high_incline_db_press", name: "High-Incline DB Press (75°)", reason: "Thân thiện hơn với người có tiền sử chấn thương vai" }
    ]
  },
  {
    id: "lateral_raise",
    name: "Lateral Raise (Cable / DB)",
    category: "Upper",
    subcategory: "Shoulders (Side Delts)",
    equipment: "Cable",
    primaryMuscles: ["Shoulders"],
    secondaryMuscles: ["Traps"],
    formCues: "Nghiêng nhẹ người về trước 10-15°. Nâng tay dang ngang theo mặt phẳng bả vai, cùi chỏ dẫn đường.",
    progressionTip: "Ưu tiên bài tập Rest-Pause: 1 extended set 15 reps + 3-4 mini sets nghỉ 15 giây.",
    isRestPause: true,
    swaps: [
      { id: "cable_lateral_raise", name: "Cable Unilateral Lateral Raise", reason: "Lực căng đều từ vị trí đáy đến đỉnh" },
      { id: "machine_lateral_raise", name: "Machine Lateral Raise", reason: "Loại bỏ hoàn toàn quán tính, cô lập vai giữa" }
    ]
  },
  {
    id: "leg_curl",
    name: "Lying / Seated Leg Curl",
    category: "Lower",
    subcategory: "Hamstrings",
    equipment: "Machine",
    primaryMuscles: ["Hamstrings"],
    secondaryMuscles: ["Calves"],
    formCues: "Cố định đùi chặt vào đệm máy. Gập gót chân sát mông, giữ 1 giây co thắt đỉnh, hạ tạ từ từ trong 2-3 giây.",
    progressionTip: "Áp dụng Rest-Pause: Set 1 (6-10 reps), nghỉ 15s rồi tiếp tục 3-5 reps mini sets.",
    isRestPause: true,
    swaps: [
      { id: "seated_leg_curl", name: "Seated Leg Curl", reason: "Kéo giãn hamstring tối đa ở khớp háng gập 90°" },
      { id: "rdl_db", name: "Romanian Deadlift (DB/Barbell)", reason: "Kéo giãn chuỗi sau và mông đùi dưới tải trọng lớn" }
    ]
  },
  {
    id: "leg_extension",
    name: "Leg Extension (Quad Burner)",
    category: "Lower",
    subcategory: "Quads",
    equipment: "Machine",
    primaryMuscles: ["Quads"],
    secondaryMuscles: [],
    formCues: "Cố định đùi sát đệm. Đá chân lên thẳng hoàn toàn, siết chặt đùi trước 1 giây, hạ xuống có kiểm soát.",
    progressionTip: "Áp dụng Rest-Pause 10-15 reps + 3 mini sets.",
    isRestPause: true,
    swaps: [
      { id: "sissy_squat", name: "Sissy Squat", reason: "Kích hoạt đùi trước cực đại không cần máy móc" },
      { id: "leg_press", name: "Leg Press (High Reps)", reason: "Tạo lực căng cơ học lớn với nhiều đĩa tạ" }
    ]
  },
  {
    id: "biceps_curl",
    name: "Biceps Curl (Incline DB / Cable)",
    category: "Upper",
    subcategory: "Arms",
    equipment: "Dumbbell",
    primaryMuscles: ["Biceps"],
    secondaryMuscles: ["Forearms"],
    formCues: "Giữ cố định cùi chỏ bên sườn. Cuộn tạ lên siết chặt bắp tay trước, hạ chậm cảm nhận cơ căng giãn.",
    progressionTip: "Tăng tạ khi đạt 10 reps chuẩn ở set 1.",
    isRestPause: true,
    swaps: [
      { id: "hammer_curl", name: "Hammer Curl", reason: "Tập trung phát triển cơ cánh tay Brachialis và cẳng tay" }
    ]
  },
  {
    id: "triceps_pushdown",
    name: "Triceps Pushdown (Rope / V-Bar)",
    category: "Upper",
    subcategory: "Arms",
    equipment: "Cable",
    primaryMuscles: ["Triceps"],
    secondaryMuscles: [],
    formCues: "Khóa cùi chỏ sát thân người. Đẩy cáp xuống mở rộng dây ở đáy, giữ 1 giây siết cơ tay sau.",
    progressionTip: "Tập trung co thắt tối đa.",
    isRestPause: true,
    swaps: [
      { id: "overhead_triceps_ext", name: "Overhead Triceps Extension", reason: "Kéo giãn đầu dài cơ tay sau tối đa" }
    ]
  },
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg / Knee Raise",
    category: "Core",
    subcategory: "Abs & Hip Flexors",
    equipment: "Bodyweight",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hip Flexors", "Forearms"],
    formCues: "Treo người trên xà. Cuộn xương chậu lên về phía ngực, không đung đưa theo quán tính.",
    progressionTip: "Tiến triển từ co gối (Knee Raise) -> duỗi thẳng chân (Toes-to-Bar).",
    isRestPause: false,
    swaps: [
      { id: "ab_wheel_rollout", name: "Ab Wheel Rollout", reason: "Kích hoạt lực kháng duỗi cơ bụng cực đại" }
    ]
  },
  {
    id: "farmer_carry",
    name: "Farmer / Suitcase Carry",
    category: "Functional",
    subcategory: "Core & Grip",
    equipment: "Kettlebell",
    primaryMuscles: ["Core", "Traps"],
    secondaryMuscles: ["Forearms", "Glutes"],
    formCues: "Xách 2 quả tạ nặng hai bên (hoặc 1 bên). Giữ cột sống thẳng đứng, bước đi nhịp nhàng không lắc lư.",
    progressionTip: "Tăng trọng lượng tạ hoặc kéo dài cự ly 40m -> 60m.",
    isRestPause: false,
    swaps: []
  },
  {
    id: "running_zone2",
    name: "Easy Run (Zone 2 Aerobic)",
    category: "Running",
    subcategory: "Aerobic Base",
    equipment: "Bodyweight",
    primaryMuscles: ["Cardio", "Calves"],
    secondaryMuscles: ["Quads", "Hamstrings"],
    formCues: "Giữ nhịp thở đều 3-3 hoặc có thể trò chuyện thành câu dài thoải mái. Tiếp đất midfoot.",
    progressionTip: "Tăng dần thời lượng chạy từ 30 -> 45 -> 60 phút ở cùng mức nhịp tim.",
    isRestPause: false,
    swaps: []
  }
];

// =========================================================================
// RECOVERY RULES, MATRIX, AND KNOWLEDGE ITEMS
// =========================================================================
const PROGRAM_DATA = {
  info: {
    appTitle: "Dino Tracking",
    activePreset: "Dino Hybrid 1.0"
  },

  keyLifts: [
    { id: "pin_squat", name: "Pin Back Squat / Squat", category: "Lower", targetRepRange: "5-8", defaultRIR: "RIR 1-2" },
    { id: "leg_press", name: "Leg Press", category: "Lower", targetRepRange: "6-10", defaultRIR: "RIR 0-1" },
    { id: "incline_db_bench", name: "Incline DB Bench Press", category: "Upper (Chest)", targetRepRange: "6-10", defaultRIR: "RIR 0-1" },
    { id: "pull_up", name: "Weighted / BW Pull-up", category: "Upper (Back)", targetRepRange: "5-8", defaultRIR: "RIR 0-1" },
    { id: "machine_shoulder_press", name: "Machine Shoulder Press", category: "Upper (Shoulder)", targetRepRange: "6-10", defaultRIR: "RIR 0-1" },
    { id: "dips", name: "Chest / Triceps Dips", category: "Upper (Chest/Tri)", targetRepRange: "5-8", defaultRIR: "RIR 0-1" },
    { id: "chest_supported_row", name: "Chest-Supported Row", category: "Upper (Back)", targetRepRange: "6-10", defaultRIR: "RIR 0" },
    { id: "lat_pulldown", name: "Lat Pulldown", category: "Upper (Back)", targetRepRange: "6-10", defaultRIR: "RIR 0" },
    { id: "leg_curl", name: "Lying / Seated Leg Curl", category: "Lower (Hamstrings)", targetRepRange: "6-10", defaultRIR: "RIR 0-1" },
    { id: "leg_extension", name: "Leg Extension (Rest-Pause)", category: "Lower (Quad)", targetRepRange: "10-15+RP", defaultRIR: "RIR 0" },
    { id: "lateral_raise", name: "Cable/DB Lateral Raise", category: "Upper (Delts)", targetRepRange: "10-20+RP", defaultRIR: "RIR 0" }
  ],

  smartRecoveryRules: [
    {
      id: "sleep_1_bad",
      condition: "Ngủ kém 1 đêm nhưng cơ thể cảm thấy vẫn ổn",
      action: "Giữ nguyên các bài tập, giảm 1 mức RIR: RIR 0 → RIR 1, RIR 1 → RIR 2.",
      badge: "Giảm 1 mức RIR",
      badgeClass: "badge-warning"
    },
    {
      id: "sleep_2_bad",
      condition: "Ngủ kém 2 đêm liên tiếp hoặc fatigue toàn thân",
      action: "Giảm resistance xuống chỉ 1 work set mỗi bài; đổi buổi chạy Quality thành Easy Run 4–6 km nhẹ nhàng.",
      badge: "1 Work Set & Easy Run",
      badgeClass: "badge-danger"
    },
    {
      id: "lower_doms",
      condition: "Lower DOMS (đau mỏi đùi/mông) còn rõ rệt",
      action: "Tuyệt đối không thêm bài Squat/Hinge; đổi sang Leg Press hoặc giữ bài tập Upper, đi bộ nhẹ nhàng.",
      badge: "Không tập Squat nặng",
      badgeClass: "badge-danger"
    },
    {
      id: "hamstring_tight",
      condition: "Hamstring căng hoặc đau bất thường",
      action: "Bỏ bài tốc độ và tải nặng Lower; chạy easy chỉ khi không làm triệu chứng nặng hơn. BỎ Rest-Pause ở Leg Curl.",
      badge: "Bỏ Tốc độ & Bỏ RP Leg Curl",
      badgeClass: "badge-danger"
    },
    {
      id: "shoulder_elbow",
      condition: "Vai hoặc khuỷu tay khó chịu",
      action: "Dips / Pull-up chuyển từ RIR 0 → RIR 2 hoặc đổi sang bài máy (Machine Chest Press / Pulldown) có điểm tựa cố định.",
      badge: "Đổi sang Machine ổn định",
      badgeClass: "badge-warning"
    },
    {
      id: "lazy_vs_tired",
      condition: "Chỉ lười do tâm lý nhưng cơ thể không mệt thật",
      action: "Áp dụng Minimum Effective Session: 1 bài compound chính + 1 bài isolation Rest-Pause + 20–30 phút easy cardio/đi bộ.",
      badge: "Minimum Effective Session",
      badgeClass: "badge-info"
    },
    {
      id: "circuit_light",
      condition: "Buổi Circuit hôm trước unexpectedly nhẹ nhàng",
      action: "Không tự ý cộng thêm bài lower nặng nếu hôm sau đã có Lower; giữ nguyên progression theo đúng kế hoạch.",
      badge: "Giữ nguyên Progression",
      badgeClass: "badge-info"
    },
    {
      id: "soccer_hard",
      condition: "Trận Soccer thứ 7 cực nặng / thi đấu quá sức",
      action: "Buổi Long Run T6 trước đó nên giảm 20–30% quãng đường hoặc chỉ chạy easy; Chủ Nhật nghỉ ngơi triệt để.",
      badge: "Giảm Long Run & CN Nghỉ Thật",
      badgeClass: "badge-warning"
    }
  ],

  priorityHierarchy: [
    "1. Sức khỏe / Không chấn thương khớp",
    "2. Soccer (Trận bóng đá T7)",
    "3. Quality Run (Threshold / Speed)",
    "4. Lower Resistance (Squat / Leg Press)",
    "5. Upper Resistance (Press / Pull)",
    "6. Circuit PR (Kỷ lục cá nhân)"
  ],

  muscleMatrix: [
    { group: "Quad (Đùi trước)", weekA: "T3 Strength + Running", weekB: "T2 Hybrid nhẹ + T3 Lower + Running", note: "Đủ kích thích, không dồn 2 buổi nặng sát nhau" },
    { group: "Hamstring (Đùi sau)", weekA: "T3 Leg Curl + Running/Soccer", weekB: "T3 Leg Curl + Running/Soccer", note: "Theo dõi DOMS vì lịch sử nhạy cảm" },
    { group: "Chest (Ngực)", weekA: "T3 Incline DB + T5 Dips", weekB: "T5 Incline DB + Hybrid gián tiếp", note: "Tần suất đủ duy trì và tăng trưởng nạc" },
    { group: "Back / Lats (Lưng)", weekA: "T3 Pull-up + T5 Row/Pulldown", weekB: "T5 Pull-up + Row + Hybrid tuỳ option", note: "Volume vừa phải, không pull nặng liên tiếp" },
    { group: "Shoulder (Vai)", weekA: "T3 Lateral + T5 Press/Lateral", weekB: "T5 Press + Lateral + Rear Delt", note: "Nhóm cơ được ưu tiên rõ rệt hàng đầu" },
    { group: "Arms (Tay)", weekA: "T5 Direct Curls & Pushdowns", weekB: "T5 Direct + Compound gián tiếp", note: "Thêm kích thích từ Pull-up, Dips, Press" },
    { group: "Core & Carry", weekA: "T3 Leg Raise + T4 Carries", weekB: "T2 Hybrid + T4 Core optional", note: "Không cần failure mỗi lần tập" },
    { group: "Running (Chạy bộ)", weekA: "T2 Quality + T4 Easy + T6 Long", weekB: "T2 Hybrid + T4 Easy + T6 Long/Progression", note: "+ Soccer mỗi tuần (tổng ~20-25 km/tuần)" }
  ],

  reviewCheckpoints: [
    {
      timeframe: "Sau 2 Tuần",
      action: "Kiểm tra cảm giác cơ thể, mức độ DOMS đùi/gân kheo, chất lượng trận đá bóng T7, pace chạy Easy."
    },
    {
      timeframe: "Sau 4 Tuần",
      action: "Đánh giá mức tạ ở Squat, Pull-up, Press, và benchmark cự ly 5 km / Quality Run."
    },
    {
      timeframe: "Sau 6–8 Tuần",
      action: "Quyết định giữ nguyên block, tăng tính đặc thù race HM, hoặc đổi bài tập/format mới."
    },
    {
      timeframe: "Khi bị Plateau (Đứng tải)",
      action: "Không tăng tất cả mọi thứ; chỉ đổi 1 biến số: đổi rep range, đổi bài phụ, hoặc bỏ Rest-Pause 1 tuần để deload."
    }
  ],

  aiCoachPrompts: [
    {
      id: "prompt_recovery",
      label: "⚡ Phân tích phục hồi hôm nay",
      prompt: "Phân tích mức độ hồi phục của tôi hôm nay dựa trên giấc ngủ, độ mỏi cơ đùi và lịch sử các buổi tập gần nhất."
    },
    {
      id: "prompt_doms_adjust",
      label: "🏋️ Giảm tạ khi bị DOMS đùi?",
      prompt: "Tôi đang bị DOMS mỏi đùi sau trận bóng hoặc buổi Squat, hôm nay có nên giảm set hoặc đổi bài Leg Press không?"
    },
    {
      id: "prompt_soccer_run",
      label: "🏃 Điều chỉnh chạy sau đá bóng",
      prompt: "Thứ 7 tôi đá bóng sân 7 rất nặng, tuần sau buổi chạy Quality Run T2 và Long Run T6 nên điều chỉnh pace và cự ly thế nào?"
    },
    {
      id: "prompt_squat_overload",
      label: "🎯 Gợi ý Progressive Overload Squat",
      prompt: "Hãy xem lịch sử các set Squat gần nhất của tôi và gợi ý mức tạ/reps mục tiêu cho buổi tập hôm nay để đạt Overload an toàn."
    },
    {
      id: "prompt_hm_pacing",
      label: "⏱️ Chiến thuật Half-Marathon Sub-2",
      prompt: "Cho tôi chiến thuật phân bổ pace từng km cho cự ly 21.1 km Half-Marathon mục tiêu Sub-2 giờ kết hợp với giáo án Dino Hybrid."
    },
    {
      id: "prompt_wod_spin",
      label: "🎰 Gợi ý WOD CrossFit theo ngày",
      prompt: "Hôm nay tôi muốn tập một bài CrossFit WOD / Conditioning vui nhộn, hãy gợi ý cho tôi 1 bài từ Roulette phù hợp với thể trạng!"
    }
  ]
};

if (typeof window !== "undefined") {
  window.DEFAULT_PROGRAMS = DEFAULT_PROGRAMS;
  window.CROSSFIT_WOD_DATABASE = CROSSFIT_WOD_DATABASE;
  window.EXERCISE_LIBRARY = EXERCISE_LIBRARY;
  window.PROGRAM_DATA = PROGRAM_DATA;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEFAULT_PROGRAMS, CROSSFIT_WOD_DATABASE, EXERCISE_LIBRARY, PROGRAM_DATA };
}
