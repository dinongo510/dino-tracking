/**
 * Dino Tracking - Program Database & Presets
 * Built-in Preset: "Dino Hybrid 1.0" (BFS Hybrid Athlete 2-Week Rotation)
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
            title: "Quality Run",
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
                title: "Option B: 1 km Repeats",
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
                targetRequirement: "2 sets × 5–8 reps @ RIR 1–2 (Nghỉ 3–4m)",
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
            title: "Hybrid Game / Hyrox-Style",
            type: "hybrid",
            focus: "Fun conditioning + Running under fatigue",
            badge: "Hybrid Game",
            estimatedTime: "45-60 mins",
            targetKm: 5.0,
            options: [
              {
                id: "wB_hy_a",
                title: "Option A: 5 km Chipper",
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
                details: "5 Rounds: 600–800m run + 40–60m Farmer/Suitcase Carry + 10–15 Burpee + 10–15 Slam Ball.",
                rpe: "Lower fatigue vừa phải trước T3 Lower.",
                targetKm: 3.5
              },
              {
                id: "wB_hy_d",
                title: "Option D: Khi Mệt / Low-Fatigue Circuit",
                details: "20–30 phút circuit nhẹ nhàng: Carry + TRX Row + Slam bóng nhẹ + Core plank.",
                rpe: "RPE 6–7.",
                targetKm: 0.0
              }
            ],
            checklist: [
              { id: "wB_t2_wu", label: "Dynamic warm-up toàn thân (10')", note: "Vai, háng, gối" },
              { id: "wB_t2_main", label: "Thực hiện Workout Hyrox/Hybrid đã chọn", note: "Pacing thông minh" },
              { id: "wB_t2_cd", label: "Hạ nhiệt & giãn cơ vai/lưng", note: "Chuẩn bị cho T3 Lower" }
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
                targetRequirement: "2 sets × 5–8 reps @ RIR 1–2 (Nghỉ 3–4m)",
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
              },
              {
                id: "wB_long_d",
                title: "Option D: Khi Chân Mệt",
                details: "6–8 km easy hoặc đi bộ.",
                targetKm: 6.5
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
      action: "Tuyệt đối không thêm bài Squat/Hinge; giữ bài tập Upper hoặc chỉ đi bộ nhẹ/chạy rất nhẹ nhàng.",
      badge: "Không tập Squat/Hinge",
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
    "1. Sức khỏe / Đau nhức khớp",
    "2. Soccer (Trận bóng đá T7)",
    "3. Quality Run (Threshold/Repeats)",
    "4. Lower Resistance (Squat/Leg Press)",
    "5. Upper Resistance (Press/Pull)",
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

  exerciseDetails: {
    pin_squat: {
      name: "Pin Back Squat / Back Squat",
      category: "Lower (Quad & Glutes)",
      primaryMuscles: "Cơ đùi trước (Quadriceps), Cơ mông (Gluteus Maximus), Cơ lưng dưới (Erector Spinae)",
      formCues: "Đặt thanh đòn ngang vai/cơ thang. Xuống kiểm soát đến khi chạm thanh chốt (pin), dừng 1 giây không nhún rồi phát lực đứng dậy bùng nổ.",
      progressionTip: "Tăng 2.5kg khi hoàn thành đủ 8 reps ở 2 sets chuẩn RIR 1.",
      swaps: [
        { id: "leg_press", name: "Leg Press", category: "Lower (Quad)", reason: "Giảm áp lực cột sống khi lưng dưới hoặc khớp háng mỏi" },
        { id: "smith_squat", name: "Smith Machine Squat", category: "Lower (Quad)", reason: "Tăng tính ổn định quỹ đạo, cô lập đùi an toàn" },
        { id: "hack_squat", name: "Hack Squat Machine", category: "Lower (Quad Focus)", reason: "Tối đa hóa lực căng cơ học lên đùi trước" }
      ]
    },
    pull_up: {
      name: "Weighted / BW Pull-up",
      category: "Upper (Lats & Back)",
      primaryMuscles: "Cơ xô (Latissimus Dorsi), Cơ lưng giữa (Rhomboids), Cơ tay trước (Biceps Brachii)",
      formCues: "Treo người thẳng tay, kéo bả vai xuống trước khi gập cùi chỏ. Kéo cằm vượt qua xà, dừng 0.5s ở đỉnh và hạ người có kiểm soát (eccentric 2s).",
      progressionTip: "Khi kéo được 8 reps bodyweight chuẩn form, đeo thêm tạ belt +2.5kg đến +5kg.",
      swaps: [
        { id: "lat_pulldown", name: "Lat Pulldown", category: "Upper (Lats)", reason: "Dễ điều chỉnh mức tạ chính xác theo số reps mục tiêu" },
        { id: "neutral_pullup", name: "Neutral-Grip Pull-up", category: "Upper (Lats/Arm)", reason: "Thân thiện hơn với bao khớp vai và cổ tay" },
        { id: "chest_supported_row", name: "Chest-Supported Row", category: "Upper (Mid Back)", reason: "Tập trung phát triển độ dày lưng giữa và bả vai" }
      ]
    },
    incline_db_bench: {
      name: "Incline DB Bench Press",
      category: "Upper (Upper Chest & Triceps)",
      primaryMuscles: "Cơ ngực trên (Clavicular Head Pectoralis), Cơ vai trước (Anterior Deltoid), Tay sau (Triceps)",
      formCues: "Góc ghế 30°–45°. Ép nhẹ bả vai vào đệm, hạ tạ sâu ngang ngực trên cảm nhận cơ căng giãn tối đa, đẩy tạ lên theo hình parabol nhẹ không khóa khớp cùi chỏ.",
      progressionTip: "Tăng 2kg mỗi bên tạ khi đạt 10 reps chuẩn ở set 1.",
      swaps: [
        { id: "machine_chest_press", name: "Machine Incline Chest Press", category: "Upper (Chest)", reason: "Điểm tựa lưng cố định, đẩy failure an toàn tuyệt đối" },
        { id: "flat_db_bench", name: "Flat DB Bench Press", category: "Upper (Mid Chest)", reason: "Tối ưu hóa tổng khối lượng tạ phát triển ngực toàn diện" },
        { id: "dips", name: "Chest Dips", category: "Upper (Chest/Tri)", reason: "Bài trọng lượng cơ thể kích hoạt ngực dưới và tay sau" }
      ]
    },
    leg_curl: {
      name: "Lying / Seated Leg Curl",
      category: "Lower (Hamstrings)",
      primaryMuscles: "Cơ đùi sau (Biceps Femoris, Semitendinosus, Semimembranosus)",
      formCues: "Cố định đùi chặt vào đệm máy. Gập gót chân sát mông, giữ 1 giây co thắt đỉnh, hạ tạ từ từ trong 2-3 giây.",
      progressionTip: "Áp dụng Rest-Pause: Set 1 (6-10 reps), nghỉ 15s rồi tiếp tục 3-5 reps mini sets tới khi dưới 3 reps.",
      swaps: [
        { id: "seated_leg_curl", name: "Seated Leg Curl", category: "Lower (Hamstrings)", reason: "Kéo giãn hamstring tối đa ở khớp háng gập 90°" },
        { id: "rdl_db", name: "Romanian Deadlift (DB/Barbell)", category: "Lower (Posterior Chain)", reason: "Kéo giãn chuỗi sau và mông đùi dưới tải trọng lớn" }
      ]
    },
    lateral_raise: {
      name: "Lateral Raise (Cable / DB)",
      category: "Upper (Side Delts - Vai Giữa)",
      primaryMuscles: "Cơ vai giữa (Lateral Deltoid)",
      formCues: "Nghiêng nhẹ người về trước 10-15°. Nâng tay dang ngang theo mặt phẳng bả vai (scapular plane), cùi chỏ dẫn đường, không nhún vai dùng cơ cầu vai.",
      progressionTip: "Ưu tiên bài tập Rest-Pause: 1 extended set 15 reps + 3-4 mini sets nghỉ 15 giây.",
      swaps: [
        { id: "cable_lateral_raise", name: "Cable Unilateral Lateral Raise", category: "Upper (Side Delts)", reason: "Lực căng đều từ vị trí đáy đến đỉnh" },
        { id: "machine_lateral_raise", name: "Machine Lateral Raise", category: "Upper (Side Delts)", reason: "Loại bỏ hoàn toàn quán tính, cô lập vai giữa" }
      ]
    },
    machine_shoulder_press: {
      name: "Machine Shoulder Press",
      category: "Upper (Shoulders)",
      primaryMuscles: "Cơ vai trước và giữa (Anterior & Lateral Delts), Tay sau (Triceps)",
      formCues: "Chỉnh ghế sao cho tay cầm ngang tầm tai. Đẩy tạ thẳng đứng kiểm soát, hạ tạ sâu đến cằm không để tạ chạm đệm nghỉ.",
      progressionTip: "1 Set chuẩn 6-10 reps + 1 Set Rest-Pause mini sets.",
      swaps: [
        { id: "db_shoulder_press", name: "Seated DB Shoulder Press", category: "Upper (Delts)", reason: "Tăng khả năng ổn định và biên độ khớp vai tự nhiên" },
        { id: "high_incline_db_press", name: "High-Incline DB Press (75°)", category: "Upper (Delts/Chest)", reason: "Thân thiện hơn với người có tiền sử chấn thương vai" }
      ]
    },
    dips: {
      name: "Dips (Chest / Triceps)",
      category: "Upper (Chest & Triceps)",
      primaryMuscles: "Cơ ngực dưới (Pectoralis Major), Tay sau (Triceps Brachii), Vai trước",
      formCues: "Nghiêng người về trước 20° để tập trung ngực. Xuống đến khi góc cùi chỏ đạt 90°, không hạ quá sâu gây áp lực khớp cùng vai.",
      progressionTip: "Đeo tạ thêm khi hoàn thành 2 sets x 8 reps bodyweight dễ dàng.",
      swaps: [
        { id: "close_grip_bench", name: "Close-Grip Bench Press", category: "Upper (Triceps/Chest)", reason: "Giảm áp lực xoay ngoài lên bao khớp vai" },
        { id: "machine_chest_press", name: "Machine Chest Press", category: "Upper (Chest)", reason: "Đẩy hết sức an toàn không lo rơi tạ" }
      ]
    },
    chest_supported_row: {
      name: "Chest-Supported Row / Cable Row",
      category: "Upper (Upper Back & Lats)",
      primaryMuscles: "Cơ lưng giữa (Rhomboids), Cơ thang giữa/dưới (Trapezius), Cơ xô",
      formCues: "Áp ngực sát đệm tựa. Kéo cùi chỏ về sau siết chặt 2 bả vai, giữ 1 giây đỉnh co thắt, duỗi thẳng tay cảm nhận cơ lưng giãn.",
      progressionTip: "Tăng mức tạ khi set 1 đạt 10 reps @ RIR 1.",
      swaps: [
        { id: "seated_cable_row", name: "Seated Cable Row", category: "Upper (Back)", reason: "Thay đổi các loại tay cầm V-Bar / Wide Grip linh hoạt" },
        { id: "one_arm_db_row", name: "One-Arm DB Row", category: "Upper (Lats)", reason: "Kéo từng bên giúp cân bằng cơ bắp 2 bên lưng" }
      ]
    },
    lat_pulldown: {
      name: "Lat Pulldown",
      category: "Upper (Lats)",
      primaryMuscles: "Cơ xô (Latissimus Dorsi), Cơ bắp tay trước (Biceps)",
      formCues: "Cầm rộng hơn vai 1.5 lần. Hơi ưỡn ngực kéo thanh đòn về xương quai xanh, ép cùi chỏ xuống sườn, thả tạ chậm 2 giây.",
      progressionTip: "Tập trung stretch ở đỉnh chuyển động.",
      swaps: [
        { id: "pull_up", name: "Pull-up", category: "Upper (Lats)", reason: "Chuyển sang bài xà đơn thể lực" },
        { id: "neutral_lat_pulldown", name: "Neutral-Grip Lat Pulldown", category: "Upper (Lats)", reason: "Thân thiện với khớp cổ tay và khuỷu tay" }
      ]
    },
    leg_press: {
      name: "Leg Press",
      category: "Lower (Quad & Glutes)",
      primaryMuscles: "Cơ đùi trước (Quadriceps), Cơ mông (Gluteus Maximus)",
      formCues: "Đặt bàn chân ở giữa bàn đạp, mở rộng bằng vai. Hạ mâm tạ sâu gối 90° không để mông bị nhấc khỏi đệm ghế (butt wink), đẩy tạ lên không khóa khớp gối.",
      progressionTip: "Tập trung dồn lực gót và lòng bàn chân.",
      swaps: [
        { id: "pin_squat", name: "Pin Back Squat", category: "Lower (Quad/Glutes)", reason: "Chuyển sang gánh tạ tự do xây dựng sức mạnh lõi" },
        { id: "hack_squat", name: "Hack Squat", category: "Lower (Quad)", reason: "Cô lập đùi trước quỹ đạo nghiêng 45°" }
      ]
    },
    leg_extension: {
      name: "Leg Extension (Rest-Pause)",
      category: "Lower (Quad Focus)",
      primaryMuscles: "Cơ đùi trước (Rectus Femoris, Vastus Lateralis/Medialis)",
      formCues: "Cố định đùi sát đệm. Đá chân lên thẳng hoàn toàn, siết chặt đùi trước 1 giây, hạ xuống có kiểm soát.",
      progressionTip: "Áp dụng Rest-Pause 10-15 reps + 3 mini sets.",
      swaps: [
        { id: "sissy_squat", name: "Sissy Squat", category: "Lower (Quad)", reason: "Kích hoạt đùi trước cực đại không cần máy móc" },
        { id: "leg_press", name: "Leg Press (High Reps)", category: "Lower (Quad)", reason: "Tạo lực căng cơ học lớn với nhiều đĩa tạ" }
      ]
    }
  },

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
    }
  ]
};

if (typeof window !== "undefined") {
  window.DEFAULT_PROGRAMS = DEFAULT_PROGRAMS;
  window.PROGRAM_DATA = PROGRAM_DATA;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEFAULT_PROGRAMS, PROGRAM_DATA };
}
