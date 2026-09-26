/**
 * Dino Tracking - Comprehensive Database & Presets
 * Contains:
 * 1. Default Built-in Preset: "Dino Hybrid 1.0" (Exact BFS Hybrid Athlete 2-Week Rotation)
 * 2. 50+ Distinct CrossFit & Hyrox WODs Database
 * 3. 50+ Comprehensive Exercise Library (Strength, Cardio, Hybrid, Machines, Free-weights)
 * 4. NASM Corrective Exercise Continuum (CEX) Mapping (Mutually Exclusive Deviations)
 * 5. Muscle Anatomical Mapping for 3D SVG Heatmap
 */

// =========================================================================
// 1. DEFAULT BUILT-IN PRESET: DINO HYBRID 1.0 (BFS ROTATION)
// =========================================================================

// =========================================================================
// 0. EXERCISE TAXONOMY CONSTANTS (DINO-005A)
// =========================================================================
const MOVEMENT_PATTERNS = ["SQUAT", "HINGE", "LUNGE", "PUSH", "PULL", "CARRY", "ROTATION", "LOCOMOTION", "CORE", "CARDIO"];
const TRAINING_TYPES = ["STRENGTH", "HYPERTROPHY", "POWER", "CONDITIONING", "CARDIO", "MOBILITY", "CORRECTIVE", "HYBRID"];
const EQUIPMENT_TYPES = ["Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight", "Kettlebell", "Band", "Sled", "Cardio_Machine", "None"];

const DEFAULT_PROGRAMS = [
  {
    id: "dino_hybrid_1",
    programId: "dino_hybrid_1",
    version: "2.0",
    currentVersionId: "v2.0",
    status: "active",
    name: "Dino Hybrid 2.0",
    programName: "Dino Hybrid 2.0",
    versions: [
      {
        versionId: "v2.0",
        versionNumber: "2.0",
        createdAt: "2026-09-25T00:00:00.000Z",
        notes: "BFS Hybrid Athlete 2-Week Rotation aligned"
      }
    ],
    subtitle: "BFS Hybrid Athlete 2-Week Rotation",
    description: "Running Performance • Hypertrophy • Strength • Hybrid Conditioning • Soccer",
    philosophy: "Ít work sets, intensity cao, ưu tiên 4–10 reps ở resistance, có Rest-Pause, duy trì chạy và đá bóng thứ 7.",
    target: "HM Sub-2 Readiness + Thigh & Shoulder Hypertrophy",
    rotationWeeks: 2,
    isBuiltIn: true,
    weeks: [
      {
        id: "A",
        weekId: "wA",
        weekNumber: 1,
        label: "Week A",
        name: "Week A — Running Performance + Strength",
        focus: "Threshold / Speed Run, Full Body Compound Lifts, Core/Carry, Upper Focus, Long Run ≤12km, Soccer",
        targetKm: 23,
        days: [
          {
            id: "wA_t2",
            dayKey: "T2",
            dayName: "Thứ Hai (T2)",
            title: "Quality Run (Threshold / Speed)",
            type: "run",
            focus: "Threshold / Tốc độ 10 km–HM",
            badge: "Quality Run",
            targetKm: 9.5,
            options: [
              { id: "opt_a", title: "Option A: Threshold Cruise (Ưu tiên HM)", details: "Warm-up 1.5–2 km → 3 × 2 km @ khoảng 5:45–5:55/km (nghỉ 2' jog giữa set) → Cool-down 1–2 km.", rpe: "RPE 7.5–8.5", targetKm: 9.5 },
              { id: "opt_b", title: "Option B: 1 km Repeats", details: "Warm-up 2 km → 4–5 × 1 km @ khoảng 5:25–5:40/km (nghỉ 2' jog) → Cool-down.", rpe: "RPE rep cuối tối đa ~8.5", targetKm: 8.5 },
              { id: "opt_c", title: "Option C: Progression 8 km", details: "2 km easy → 2 km steady → 2 km ~6:00 → 2 km ~5:45–5:35 nếu tốt. Không biến thành race.", rpe: "RPE tăng dần 5→8", targetKm: 8.0 },
              { id: "opt_d", title: "Option D: Khi Mệt", details: "4–6 km easy, bỏ quality. Không cố 'bù' ngày khác.", rpe: "RPE 5–6", targetKm: 5.0 }
            ],
            checklist: [
              { id: "wA_t2_wu", label: "Khởi động kỹ & Dynamic Stretches (10'): Bắp chân, đùi sau, khớp háng", note: "10 mins" },
              { id: "wA_t2_main", label: "Chạy đúng Option đã chọn theo Pace / RPE (Threshold 5:45-5:55)", note: "RPE 7.5-8.5" },
              { id: "wA_t2_cd", label: "Cool-down jog 1-2km & Bù nước điện giải", note: "Không tập thêm lower nặng" }
            ],
            exercises: []
          },
          {
            id: "wA_t3",
            dayKey: "T3",
            dayName: "Thứ Ba (T3)",
            title: "Full Body Strength",
            type: "strength",
            focus: "Strength + Tension toàn thân, ít sets",
            badge: "Full Body",
            exercises: [
              {
                id: "pin_squat",
                name: "Pin Back Squat hoặc Back Squat",
                category: "Lower",
                equipment: "Barbell",
                primaryMuscles: ["Quads", "Glutes"],
                secondaryMuscles: ["Lower Back", "Core"],
                targetRequirement: "1-2 × 5-8 | RIR 1-2; 2.5-4'",
                optionNote: "Nếu chân mệt: Leg Press 2 × 6-10 @ RIR 1.",
                formCues: "Gánh tạ ngang vai, hạ chậm chạm chốt pin, dừng 1s không nhún rồi đẩy bùng nổ lên.",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Top hard set" },
                  { setNum: 2, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Back-off hard set" }
                ]
              },
              {
                id: "pull_up",
                name: "Weighted/BW Pull-up",
                category: "Upper",
                equipment: "Bodyweight",
                primaryMuscles: ["Lats", "Upper Back"],
                secondaryMuscles: ["Biceps", "Forearms"],
                targetRequirement: "2 × 5-8 | Set 1 RIR 1; set 2 RIR 0-1; 2-3'",
                optionNote: "Nếu grip/shoulder mệt: Lat Pulldown 2 × 6-10.",
                formCues: "Treo người thẳng tay, kéo bả vai xuống trước khi gập cùi chỏ. Cằm vượt qua xà.",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150, note: "Set 1 chuẩn kỹ thuật" },
                  { setNum: 2, reps: "5-8", rir: "RIR 0-1", restSec: 150, note: "Set 2 hard effort" }
                ]
              },
              {
                id: "incline_db_bench",
                name: "Incline DB Bench",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Chest"],
                secondaryMuscles: ["Shoulders", "Triceps"],
                targetRequirement: "2 × 6-10 | Set cuối RIR 0-1; 2-3'",
                optionNote: "Có thể đổi Machine Chest Press.",
                formCues: "Góc ghế 30-45 độ. Hạ tạ sâu ngang ngực trên cảm nhận cơ căng, đẩy lên không khóa khớp.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 150, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 150, note: "Set cuối hard push" }
                ]
              },
              {
                id: "leg_curl",
                name: "Leg Curl",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Hamstrings"],
                secondaryMuscles: ["Calves"],
                isRestPause: true,
                targetRequirement: "1 conventional set 6-10 + 1 RP optional | Set đầu RIR 0-1; RP dừng khi <3 reps; 2'",
                optionNote: "Nếu hamstring nhạy cảm: 2 × 6-8 @ RIR 2, bỏ RP.",
                formCues: "Cố định đùi chặt vào đệm. Gập gót chân sát mông, giữ 1s đỉnh co thắt, hạ chậm 2-3s.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 120, note: "Set thông thường" },
                  { setNum: 2, reps: "6-10+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause optional" }
                ]
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: ["Traps"],
                isRestPause: true,
                targetRequirement: "1 Rest-Pause extended set | 10-20 + mini sets; nghỉ 10-15s",
                optionNote: "Ưu tiên cable/machine.",
                formCues: "Nghiêng nhẹ người 10 độ. Nâng tay dang ngang theo mặt phẳng bả vai, cùi chỏ dẫn đường.",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0-1", restSec: 15, isRestPause: true, note: "1 Rest-Pause extended set" }
                ]
              },
              {
                id: "hanging_leg_raise",
                name: "Hanging Leg Raise",
                category: "Core",
                equipment: "Bodyweight",
                primaryMuscles: ["Core"],
                secondaryMuscles: ["Hip Flexors"],
                targetRequirement: "2 × 8-15 | Dừng trước khi mất pelvic control",
                optionNote: "Đổi Knee Raise nếu swing nhiều.",
                formCues: "Treo người, cuộn xương chậu lên về phía ngực, không đung đưa theo quán tính.",
                defaultSets: [
                  { setNum: 1, reps: "8-15", rir: "RIR 1", restSec: 60, note: "Cuộn chậm không đu" },
                  { setNum: 2, reps: "8-15", rir: "RIR 0-1", restSec: 60, note: "Kiểm soát hạ" }
                ]
              }
            ]
          },
          {
            id: "wA_t4",
            dayKey: "T4",
            dayName: "Thứ Tư (T4)",
            title: "Easy Run + Core/Carry",
            type: "hybrid",
            focus: "Duy trì frequency, phục hồi chủ động",
            badge: "Easy + Core",
            targetKm: 5.5,
            options: [
              { id: "wA_t4_opt_a", title: "Option A: Farmer Carry + Copenhagen + Knee Raise", details: "Farmer Carry 2 × 40–60m + Copenhagen Plank 2 × 20–40s/bên + Hanging Knee Raise 2 × 10–15.", rpe: "RPE 6", targetKm: 5.5 },
              { id: "wA_t4_opt_b", title: "Option B: Suitcase Carry + Plank + Russian Twist", details: "Suitcase Carry 2 × 30–40m/bên + Plank 2 × 45–60s + Russian Twist 2 × 12–20/bên.", rpe: "RPE 6", targetKm: 5.5 },
              { id: "wA_t4_opt_c", title: "Option C: Khi Mệt", details: "Chỉ 4–5 km easy hoặc 30–45 phút đi bộ; bỏ core nếu fatigue toàn thân.", rpe: "RPE 5–6", targetKm: 4.5 }
            ],
            checklist: [
              { id: "wA_t4_run", label: "5–6 km easy, RPE 5–6. Không progression", note: "Zone 2" },
              { id: "wA_t4_core", label: "Core/Carry theo Option đã chọn", note: "Core & Carry" },
              { id: "wA_t4_stretch", label: "Giãn cơ & bù nước điện giải", note: "10 phút" }
            ],
            exercises: []
          },
          {
            id: "wA_t5",
            dayKey: "T5",
            dayName: "Thứ Năm (T5)",
            title: "Upper Strength / Hypertrophy",
            type: "strength",
            focus: "Upper + ưu tiên vai",
            badge: "Upper Focus",
            exercises: [
              {
                id: "dips",
                name: "Dips",
                category: "Upper",
                equipment: "Bodyweight",
                primaryMuscles: ["Chest", "Triceps"],
                secondaryMuscles: ["Shoulders"],
                targetRequirement: "2 × 5-8 | Set cuối RIR 0-1; 2-3'",
                optionNote: "Nếu vai khó chịu: Machine Chest Press.",
                formCues: "Nghiêng người về trước 20 độ để vào ngực. Xuống góc cùi chỏ 90 độ.",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150, note: "Set 1 chuẩn kỹ thuật" },
                  { setNum: 2, reps: "5-8", rir: "RIR 0-1", restSec: 150, note: "Set cuối near failure" }
                ]
              },
              {
                id: "chest_supported_row",
                name: "Chest-Supported Row",
                category: "Upper",
                equipment: "Machine",
                primaryMuscles: ["Upper Back", "Lats"],
                secondaryMuscles: ["Biceps", "Rear Delts"],
                targetRequirement: "2 × 6-10 | Set 2 RIR 0; 2'",
                optionNote: "Đổi Seated Row.",
                formCues: "Áp ngực sát đệm tựa, kéo cùi chỏ về sau siết chặt bả vai.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Kéo sâu siết lưng giữa" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Set 2 RIR 0" }
                ]
              },
              {
                id: "machine_shoulder_press",
                name: "Machine Shoulder Press",
                category: "Upper",
                equipment: "Machine",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: ["Triceps"],
                isRestPause: true,
                targetRequirement: "1 × 6-10 + 1 RP optional | Set đầu RIR 0-1; 15-20s RP",
                optionNote: "Nếu vai mệt: DB high incline press 2 × 6-10.",
                formCues: "Tay cầm ngang tai. Đẩy thẳng đứng kiểm soát, hạ sâu đến cằm.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 120, note: "Set đầu RIR 0-1" },
                  { setNum: 2, reps: "3-5+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause optional" }
                ]
              },
              {
                id: "lat_pulldown",
                name: "Lat Pulldown",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Lats"],
                secondaryMuscles: ["Biceps"],
                targetRequirement: "2 × 6-10 | Set cuối RIR 0; 2'",
                optionNote: "Đổi neutral-grip pull-down.",
                formCues: "Kéo thanh đòn về xương quai xanh, ép chặt bả vai.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Set 1 chuẩn kỹ thuật" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Set cuối RIR 0" }
                ]
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 Rest-Pause extended set | RIR 0-1 -> mini sets",
                optionNote: "Có thể cable unilateral.",
                formCues: "Nghiêng nhẹ người 10 độ. Nâng tay dang ngang theo mặt phẳng bả vai.",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0-1", restSec: 15, isRestPause: true, note: "Rest-Pause extended set" }
                ]
              },
              {
                id: "curl",
                name: "Curl",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Biceps"],
                secondaryMuscles: ["Forearms"],
                isRestPause: true,
                targetRequirement: "1 RP hoặc 2 × 6-10 | Set cuối RIR 0",
                optionNote: "Cable/DB.",
                formCues: "Khóa cố định cùi chỏ bên hông, cuộn tạ siết bắp tay, hạ chậm 2s.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90, note: "Set cuối RIR 0" }
                ]
              },
              {
                id: "triceps",
                name: "Triceps",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Triceps"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 RP hoặc 2 × 6-10 | Set cuối RIR 0",
                optionNote: "Rope pushdown/extension.",
                formCues: "Khóa cùi chỏ sát thân, đẩy cáp xuống mở rộng ở đáy.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90, note: "Set cuối RIR 0" }
                ]
              }
            ]
          },
          {
            id: "wA_t6",
            dayKey: "T6",
            dayName: "Thứ Sáu (T6)",
            title: "Long Run ≤12 km",
            type: "run",
            focus: "Aerobic endurance (Zone 2)",
            badge: "Long Run",
            targetKm: 12.0,
            options: [
              { id: "wA_t6_opt_a", title: "Option A: Easy Long", details: "8–12 km @ RPE 6–7. Pace tham khảo hiện tại 6:20–6:50/km, ưu tiên cảm giác.", rpe: "RPE 6–7", targetKm: 10.0 },
              { id: "wA_t6_opt_b", title: "Option B: Fast-Finish", details: "8–12 km: phần lớn easy, 2–3 km cuối steady; không nhanh hơn mức kiểm soát được.", rpe: "RPE 6.5–7.5", targetKm: 11.0 },
              { id: "wA_t6_opt_c", title: "Option C: Khi chân nặng", details: "6–8 km easy hoặc 45–60 phút walk. Không cố đủ 12 km.", rpe: "RPE 5–6", targetKm: 7.0 }
            ],
            checklist: [
              { id: "wA_t6_prep", label: "Khởi động nhẹ & chuẩn bị nước / điện giải", note: "Chuẩn bị" },
              { id: "wA_t6_run", label: "Chạy đúng Option đã chọn (Zone 2 thư giãn)", note: "Pace 6:20–6:50" },
              { id: "wA_t6_post", label: "Ăn/uống, đi bộ nhẹ. Không thêm lower resistance", note: "Phục hồi" }
            ],
            exercises: []
          },
          {
            id: "wA_t7",
            dayKey: "T7",
            dayName: "Thứ Bảy (T7)",
            title: "Soccer (Trận Đấu Bóng Đá Sân 7)",
            type: "hybrid",
            focus: "Speed/COD/conditioning tự nhiên",
            badge: "Soccer Match",
            options: [
              { id: "soc_opt_1", title: "Option A: Thi Đấu Chính Thức", details: "Trận bóng đá sân 7 (60–90 phút). Chạy bứt tốc, tranh chấp vừa phải.", rpe: "RPE 8" },
              { id: "soc_opt_2", title: "Option B: Nếu Không Đá Bóng", details: "Chạy 4–6 km Easy + 4–6 lần bứt tốc ngắn (Strides 80–100m) hoặc đạp xe 45'.", rpe: "RPE 6" }
            ],
            checklist: [
              { id: "wA_t7_pre", label: "Nạp 50-60g Carbs + 500ml nước điện giải trước trận 60-90'", note: "Năng lượng" },
              { id: "wA_t7_match", label: "Khởi động khớp cổ chân, háng và thi đấu an toàn", note: "Trận đấu" },
              { id: "wA_t7_post", label: "Bù nước, giãn cơ đùi sau & ngâm chân nước mát", note: "Phục hồi" }
            ],
            exercises: []
          },
          {
            id: "wA_cn",
            dayKey: "CN",
            dayName: "Chủ Nhật (CN)",
            title: "Nghỉ Ngơi / Phục Hồi (OFF)",
            type: "rest",
            focus: "Phục hồi toàn thân, giấc ngủ sâu & dinh dưỡng",
            badge: "Rest Day",
            targetKm: 0,
            checklist: [
              { id: "wA_cn_rest", label: "Nghỉ ngơi hoàn toàn, phục hồi cơ bắp & hệ thần kinh", note: "Giấc ngủ sâu" },
              { id: "wA_cn_nutr", label: "Bổ sung đủ protein, carb sạch và nước điện giải", note: "Dinh dưỡng" },
              { id: "wA_cn_walk", label: "Đi dạo nhẹ nhàng hoặc thả lỏng cơ thể (tuỳ chọn)", note: "Thư giãn" }
            ],
            exercises: []
          }
        ]
      },
      {
        id: "B",
        name: "Week B — Hypertrophy + Game Conditioning + Running Volume",
        focus: "Hybrid Game / Hyrox, Lower Hypertrophy/Strength, Upper Hypertrophy, Long/Progression Run ≤12km, Soccer",
        targetKm: 23,
        days: [
          {
            id: "wB_t2",
            dayKey: "T2",
            dayName: "Thứ Hai (T2)",
            title: "Hybrid Game / Hyrox-style",
            type: "hybrid",
            focus: "Fun conditioning + running, format xoay sẵn",
            badge: "Hybrid Game",
            targetKm: 5.0,
            options: [
              { id: "wB_t2_opt_a", title: "Option A: 5 km Chipper", details: "1 km run → 50 Burpee → 1 km run → 50 Med Ball Slam → 1 km run → 50 Hanging Knee Raise → 1 km run → 50 TRX Row → 1 km finish.", rpe: "RPE 8. Tự chia reps.", targetKm: 5.0 },
              { id: "wB_t2_opt_b", title: "Option B: Accumulation Challenge", details: "100 Burpee + 100 Hanging Knee Raise + 100 Slam 10 kg + 100 TRX High Row 45° for time.", rpe: "Pacing", targetKm: 0 },
              { id: "wB_t2_opt_c", title: "Option C: Carry Hybrid", details: "5 rounds: 600–800m run + 40–60m Farmer/Suitcase Carry + 10–15 Burpee + 10–15 Slam.", rpe: "RPE 7.5", targetKm: 3.5 },
              { id: "wB_t2_opt_d", title: "Option D: Khi mệt", details: "20–30' easy circuit không nhảy: carry + TRX row + slam nhẹ + core.", rpe: "RPE 6–7", targetKm: 0 }
            ],
            checklist: [
              { id: "wB_t2_wu", label: "Warm-up khớp gối, cổ chân và khớp vai 10'", note: "10 mins" },
              { id: "wB_t2_main", label: "Hoàn thành Option đã chọn theo nhịp độ kiểm soát", note: "Không chase PR" },
              { id: "wB_t2_post", label: "Thả lỏng tim mạch, hạ nhịp tim và bù nước", note: "Phục hồi" }
            ],
            exercises: []
          },
          {
            id: "wB_t3",
            dayKey: "T3",
            dayName: "Thứ Ba (T3)",
            title: "Lower Hypertrophy / Strength",
            type: "strength",
            focus: "Mechanical tension cho đùi, phát triển cơ bắp chân",
            badge: "Lower Strength",
            exercises: [
              {
                id: "back_pin_squat",
                name: "Back/Pin Squat",
                category: "Lower",
                equipment: "Barbell",
                primaryMuscles: ["Quads", "Glutes"],
                secondaryMuscles: ["Lower Back"],
                targetRequirement: "1-2 × 5-8 | RIR 1-2; 3-4'",
                optionNote: "Nếu T2 chân nặng: Smith Squat hoặc Leg Press 2 × 6-10.",
                formCues: "Gánh tạ ngang vai, hạ chậm chạm pin hoặc song song sàn, đẩy dứt khoát.",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Top hard set" },
                  { setNum: 2, reps: "5-8", rir: "RIR 1-2", restSec: 180, note: "Back-off set" }
                ]
              },
              {
                id: "leg_press",
                name: "Leg Press",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Quads"],
                secondaryMuscles: ["Glutes"],
                isRestPause: true,
                targetRequirement: "1 × 8-10 + 1 RP optional | Set đầu RIR 0-1; 15-20s RP",
                optionNote: "Không RP nếu tuần đó soccer/run fatigue cao.",
                formCues: "Bàn chân giữa mâm máy, hạ gối sâu 90 độ, đẩy thẳng không khóa gối.",
                defaultSets: [
                  { setNum: 1, reps: "8-10", rir: "RIR 0-1", restSec: 150, note: "Set đầu RIR 0-1" },
                  { setNum: 2, reps: "6-10+RP", rir: "RIR 0", restSec: 20, isRestPause: true, note: "Rest-Pause optional" }
                ]
              },
              {
                id: "leg_extension",
                name: "Leg Extension",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Quads"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 Rest-Pause extended set | 10-15 + mini sets; dừng <3 reps",
                optionNote: "Ưu tiên full ROM.",
                formCues: "Đá chân thẳng hoàn toàn, siết chặt đùi trước 1s đỉnh co thắt.",
                defaultSets: [
                  { setNum: 1, reps: "10-15+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause extended set" }
                ]
              },
              {
                id: "leg_curl",
                name: "Leg Curl",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Hamstrings"],
                secondaryMuscles: [],
                targetRequirement: "1-2 × 6-10 | Set cuối RIR 0 nếu hamstring ổn",
                optionNote: "Hamstring căng: RIR 2, bỏ failure.",
                formCues: "Cố định đùi chặt vào đệm. Gập gót chân sát mông, giữ 1s đỉnh co thắt.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90, note: "Set cuối RIR 0" }
                ]
              },
              {
                id: "hip_adduction",
                name: "Hip Adduction",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Adductors"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 RP hoặc 2 × 8-12 | Set cuối RIR 0",
                optionNote: "Optional.",
                formCues: "Khép đùi dứt khoát, siết chặt cơ khép 1s đỉnh co thắt, mở chậm 2-3s.",
                defaultSets: [
                  { setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 90, note: "Set 1" },
                  { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 90, note: "Set cuối RIR 0" }
                ]
              },
              {
                id: "calf_raise",
                name: "Calf Raise",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Calves"],
                secondaryMuscles: [],
                targetRequirement: "2 × 6-12 | Set cuối RIR 0",
                optionNote: "Optional nếu recovery tốt.",
                formCues: "Nhón cao hết biên độ giữ 1s, hạ gót sâu giữ 2s giãn bắp chuối.",
                defaultSets: [
                  { setNum: 1, reps: "6-12", rir: "RIR 0", restSec: 90, note: "Set 1" },
                  { setNum: 2, reps: "6-12", rir: "RIR 0", restSec: 90, note: "Set 2" }
                ]
              },
              {
                id: "leg_ext_hold",
                name: "Iso optional: Leg Extension hold",
                category: "Lower",
                equipment: "Machine",
                primaryMuscles: ["Quads"],
                secondaryMuscles: [],
                targetRequirement: "1-2 × 20-40s | RPE 7-8",
                optionNote: "Optional.",
                formCues: "Đá thẳng chân và giữ chặt đùi trước ở vị trí khóa gối 20-40 giây tạo áp lực isometric.",
                defaultSets: [
                  { setNum: 1, reps: "30s", rir: "RPE 7-8", restSec: 60, note: "Isometric hold 1" },
                  { setNum: 2, reps: "30s", rir: "RPE 7-8", restSec: 60, note: "Isometric hold 2" }
                ]
              }
            ]
          },
          {
            id: "wB_t4",
            dayKey: "T4",
            dayName: "Thứ Tư (T4)",
            title: "Easy Run + optional core",
            type: "run",
            focus: "Tích luỹ aerobic, phục hồi chủ động",
            badge: "Easy + Core",
            targetKm: 5.5,
            options: [
              { id: "wB_t4_opt_a", title: "Core Option: Trunk & Pelvic Stability", details: "Hanging Leg Raise 2 × 8–15 + Russian Twist 2 × 12–20/side + Plank 2 × 45–60s.", rpe: "RPE 5–6", targetKm: 5.5 },
              { id: "wB_t4_opt_b", title: "Khi Mệt / DOMS nhiều", details: "4 km easy hoặc 30–45 phút walk; core bỏ nếu lower DOMS nhiều.", rpe: "RPE 5", targetKm: 4.0 }
            ],
            checklist: [
              { id: "wB_t4_run", label: "5–6 km easy @ RPE 5–6 (Zone 2)", note: "5.5 km" },
              { id: "wB_t4_core", label: "Core option (nếu chân ổn định)", note: "Core" }
            ],
            exercises: []
          },
          {
            id: "wB_t5",
            dayKey: "T5",
            dayName: "Thứ Năm (T5)",
            title: "Upper Hypertrophy (Low Set, High Effort)",
            type: "strength",
            focus: "Vai/upper development",
            badge: "Upper Focus",
            exercises: [
              {
                id: "incline_db_bench",
                name: "Incline DB Bench",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Chest"],
                secondaryMuscles: ["Shoulders", "Triceps"],
                targetRequirement: "2 × 6-10 | Set cuối RIR 0-1; 2-3'",
                optionNote: "Đổi Machine Chest Press.",
                formCues: "Góc ghế 30-45 độ. Hạ tạ sâu ngang ngực trên cảm nhận cơ căng giãn.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 150, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 150, note: "Set cuối near failure" }
                ]
              },
              {
                id: "pull_up",
                name: "Pull-up",
                category: "Upper",
                equipment: "Bodyweight",
                primaryMuscles: ["Lats"],
                secondaryMuscles: ["Biceps"],
                targetRequirement: "2 × 5-8 | Set cuối RIR 0-1; 2-3'",
                optionNote: "Đổi weighted/neutral grip/lat pulldown.",
                formCues: "Treo người thẳng tay, kéo bả vai xuống trước khi gập cùi chỏ. Cằm vượt xà.",
                defaultSets: [
                  { setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150, note: "Set 1" },
                  { setNum: 2, reps: "5-8", rir: "RIR 0-1", restSec: 150, note: "Set 2 hard effort" }
                ]
              },
              {
                id: "machine_shoulder_press",
                name: "Machine Shoulder Press",
                category: "Upper",
                equipment: "Machine",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: ["Triceps"],
                isRestPause: true,
                targetRequirement: "1 × 6-10 + 1 RP optional | RIR 0-1; 15-20s RP",
                optionNote: "Nếu mỏi vai: bỏ RP.",
                formCues: "Tay cầm ngang tai. Đẩy thẳng đứng kiểm soát, hạ sâu đến cằm.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 0-1", restSec: 120, note: "Set 1" },
                  { setNum: 2, reps: "3-5+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "RP optional" }
                ]
              },
              {
                id: "seated_row",
                name: "Seated Row",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Upper Back", "Lats"],
                secondaryMuscles: ["Biceps"],
                targetRequirement: "2 × 6-10 | Set cuối RIR 0; 2'",
                optionNote: "Đổi chest-supported row.",
                formCues: "Ngồi thẳng lưng, kéo tay cầm sát bụng dưới, ép chặt bả vai 1s.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120, note: "Set cuối RIR 0" }
                ]
              },
              {
                id: "lateral_raise",
                name: "Lateral Raise",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Shoulders"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 Rest-Pause extended set | 10-20 + mini sets",
                optionNote: "Ưu tiên vai giữa.",
                formCues: "Nghiêng nhẹ người 10 độ, nâng tay dang ngang theo mặt phẳng bả vai.",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause extended set" }
                ]
              },
              {
                id: "rear_delt_fly",
                name: "Rear Delt Fly",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Rear Delts", "Shoulders"],
                secondaryMuscles: ["Upper Back"],
                isRestPause: true,
                targetRequirement: "1 Rest-Pause extended set | 10-20 + mini sets",
                optionNote: "Cable/machine.",
                formCues: "Dang tay ngang vai hơi cong cùi chỏ, siết chặt vai sau, không giật bả vai.",
                defaultSets: [
                  { setNum: 1, reps: "10-20+RP", rir: "RIR 0", restSec: 15, isRestPause: true, note: "Rest-Pause extended set" }
                ]
              },
              {
                id: "curl",
                name: "Curl",
                category: "Upper",
                equipment: "Dumbbell",
                primaryMuscles: ["Biceps"],
                secondaryMuscles: ["Forearms"],
                isRestPause: true,
                targetRequirement: "1 RP hoặc 2 × 6-10 | RIR 0",
                optionNote: "Optional.",
                formCues: "Khóa cùi chỏ, cuộn tạ siết bắp tay, hạ chậm 2s.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90, note: "Set cuối RIR 0" }
                ]
              },
              {
                id: "pushdown",
                name: "Pushdown",
                category: "Upper",
                equipment: "Cable",
                primaryMuscles: ["Triceps"],
                secondaryMuscles: [],
                isRestPause: true,
                targetRequirement: "1 RP hoặc 2 × 6-10 | RIR 0",
                optionNote: "Optional.",
                formCues: "Khóa cùi chỏ sát sườn, duỗi thẳng cùi chỏ siết tay sau.",
                defaultSets: [
                  { setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90, note: "Set 1" },
                  { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90, note: "Set cuối RIR 0" }
                ]
              }
            ]
          },
          {
            id: "wB_t6",
            dayKey: "T6",
            dayName: "Thứ Sáu (T6)",
            title: "Long / Progression Run ≤12 km",
            type: "run",
            focus: "Aerobic + race-specific",
            badge: "Long Run",
            targetKm: 12.0,
            options: [
              { id: "wB_t6_opt_a", title: "Option A: Easy Long", details: "8–12 km easy, RPE 6–7.", rpe: "RPE 6–7", targetKm: 10.0 },
              { id: "wB_t6_opt_b", title: "Option B: Progression", details: "8–10 km: 3 km easy → 3 km steady → 2–4 km nhanh hơn nhưng không race.", rpe: "RPE 6.5–8", targetKm: 9.0 },
              { id: "wB_t6_opt_c", title: "Option C: HM-specific nhẹ", details: "10–12 km, trong đó 2 × 2 km gần HM goal pace nếu recovery tốt; 3–4' easy giữa block. Chỉ dùng khi chân tươi, không tuần nào cũng dùng.", rpe: "HM Pace", targetKm: 11.0 },
              { id: "wB_t6_opt_d", title: "Option D: Khi mệt", details: "6–8 km easy hoặc walk; soccer hôm sau quan trọng hơn việc ép đủ quãng đường.", rpe: "RPE 5–6", targetKm: 7.0 }
            ],
            checklist: [
              { id: "wB_t6_wu", label: "Khởi động nhẹ nhàng và chuẩn bị nước", note: "Chuẩn bị" },
              { id: "wB_t6_run", label: "Chạy theo Option đã chọn (giữ cảm giác tốt)", note: "Zone 2 / HM" },
              { id: "wB_t6_post", label: "Bù nước, điện giải, dinh dưỡng đầy đủ", note: "Phục hồi" }
            ],
            exercises: []
          },
          {
            id: "wB_t7",
            dayKey: "T7",
            dayName: "Thứ Bảy (T7)",
            title: "Soccer (Trận Đấu Bóng Đá Sân 7)",
            type: "hybrid",
            focus: "High intensity locomotion",
            badge: "Soccer Match",
            options: [
              { id: "wB_t7_opt_a", title: "Option A: Thi Đấu Chính Thức", details: "Trận bóng đá sân 7 (60–90 phút). Chạy bứt tốc, tranh chấp vừa phải.", rpe: "RPE 8" },
              { id: "wB_t7_opt_b", title: "Option B: Active Recovery", details: "Chạy 4–6 km Easy hoặc đạp xe 45' nếu không có trận.", rpe: "RPE 6" }
            ],
            checklist: [
              { id: "wB_t7_match", label: "Thi đấu bóng đá sân 7 (60-90')", note: "Bứt tốc & niềm vui" },
              { id: "wB_t7_rec", label: "Giãn cơ & nạp điện giải", note: "Phục hồi" }
            ],
            exercises: []
          },
          {
            id: "wB_cn",
            dayKey: "CN",
            dayName: "Chủ Nhật (CN)",
            title: "Nghỉ Ngơi / Phục Hồi (OFF)",
            type: "rest",
            focus: "Phục hồi toàn diện trước khi bước vào chu kỳ tiếp theo",
            badge: "Rest Day",
            targetKm: 0,
            checklist: [
              { id: "wB_cn_rest", label: "Nghỉ ngơi hoàn toàn, tái tạo năng lượng", note: "Phục hồi" },
              { id: "wB_cn_nutr", label: "Bữa ăn giàu dinh dưỡng và giấc ngủ sâu", note: "Dinh dưỡng" }
            ],
            exercises: []
          }
        ]
      }
    ]
  }
];

// =========================================================================
// 2. 50+ COMPREHENSIVE EXERCISE LIBRARY (STRENGTH, CARDIO, HYBRID)
// =========================================================================
const EXERCISE_LIBRARY = [
  // LOWER BODY (QUADS, HAMSTRINGS, GLUTES, CALVES)
  { id: "pin_squat", exerciseId: "pin_squat", status: "ACTIVE", category: "Lower", movementPattern: "SQUAT", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Tránh đẩy đầu gối quá lệch hoặc nhấc gót chân khi chạm chốt pin.", cautions: "Đặt chốt an toàn ngang tầm đáy đùi để phòng ngừa quá tải.", name: "Pin Back Squat / Back Squat", category: "Strength", equipment: "Barbell", primaryMuscles: ["Quads", "Glutes"], secondaryMuscles: ["Lower Back", "Core"], targetRequirement: "2 sets × 5–8 reps @ RIR 1–2", formCues: "Gánh tạ ngang vai, hạ chậm chạm chốt pin, dừng 1s không nhún rồi đẩy bùng nổ.", coachingCues: "Gánh tạ ngang vai, hạ chậm chạm chốt pin, dừng 1s không nhún rồi đẩy bùng nổ.", defaultSets: [{ setNum: 1, reps: "5-8", rir: "RIR 1-2", restSec: 180 }, { setNum: 2, reps: "5-8", rir: "RIR 1-2", restSec: 180 }] },
  { id: "leg_press", exerciseId: "leg_press", status: "ACTIVE", category: "Lower", movementPattern: "SQUAT", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không cong lưng dưới (butt wink) ở đáy chuyển động.", cautions: "Không khóa khớp gối ở đỉnh co thắt.", name: "Leg Press 45°", category: "Strength", equipment: "Machine", primaryMuscles: ["Quads"], secondaryMuscles: ["Glutes", "Hamstrings"], targetRequirement: "2 sets × 8–10 reps @ RIR 1", formCues: "Bàn chân giữa mâm. Hạ sâu gối 90 độ không nhấc mông khỏi đệm.", coachingCues: "Bàn chân giữa mâm. Hạ sâu gối 90 độ không nhấc mông khỏi đệm.", defaultSets: [{ setNum: 1, reps: "8-10", rir: "RIR 1", restSec: 150 }, { setNum: 2, reps: "8-10", rir: "RIR 0-1", restSec: 150 }] },
  { id: "hack_squat", exerciseId: "hack_squat", status: "ACTIVE", category: "Lower", movementPattern: "SQUAT", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nhấc gót chân khỏi bàn đạp.", cautions: "Xuống sâu kiểm soát 2-3s tránh dội lực lên bánh chè.", name: "Hack Squat Machine", category: "Strength", equipment: "Machine", primaryMuscles: ["Quads"], secondaryMuscles: ["Glutes"], targetRequirement: "2 sets × 6–10 reps @ RIR 1", formCues: "Tựa lưng sát đệm máy, hạ chậm cảm nhận đùi trước căng tối đa.", coachingCues: "Tựa lưng sát đệm máy, hạ chậm cảm nhận đùi trước căng tối đa.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 150 }, { setNum: 2, reps: "6-10", rir: "RIR 1", restSec: 150 }] },
  { id: "front_squat", exerciseId: "front_squat", status: "ACTIVE", category: "Lower", movementPattern: "SQUAT", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không để cùi chỏ bị sụp xuống khi đi lên.", cautions: "Giữ ngực mở và thân trên thẳng đứng.", name: "Front Squat", category: "Strength", equipment: "Barbell", primaryMuscles: ["Quads"], secondaryMuscles: ["Core", "Upper Back"], targetRequirement: "3 sets × 5–8 reps @ RIR 1", formCues: "Đặt đòn trên vai trước, cùi chỏ cao, giữ thân trên thẳng đứng.", coachingCues: "Đặt đòn trên vai trước, cùi chỏ cao, giữ thân trên thẳng đứng.", defaultSets: [{ setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150 }, { setNum: 2, reps: "5-8", rir: "RIR 1", restSec: 150 }] },
  { id: "bulgarian_split_squat", exerciseId: "bulgarian_split_squat", status: "ACTIVE", category: "Lower", movementPattern: "LUNGE", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không bước chân quá ngắn khiến gối trước chịu tải quá mức.", cautions: "Giữ thăng bằng và hạ hông thẳng đứng có kiểm soát.", name: "Bulgarian Split Squat", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Quads", "Glutes"], secondaryMuscles: ["Hamstrings"], targetRequirement: "2 sets × 8–12 reps/bên", formCues: "Gác mu bàn chân sau lên ghế, hạ hông thẳng đứng kiểm soát.", coachingCues: "Gác mu bàn chân sau lên ghế, hạ hông thẳng đứng kiểm soát.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 90 }, { setNum: 2, reps: "8-12", rir: "RIR 1", restSec: 90 }] },
  { id: "leg_extension", exerciseId: "leg_extension", status: "ACTIVE", category: "Lower", movementPattern: "SQUAT", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không giật tạ bằng quán tính.", cautions: "Nếu đau gối, giảm biên độ duỗi hoặc giảm tải.", name: "Leg Extension (Quad Burner)", category: "Strength", equipment: "Machine", primaryMuscles: ["Quads"], secondaryMuscles: [], targetRequirement: "2 sets × 10–15 reps @ RIR 0", formCues: "Đá chân thẳng hoàn toàn, siết chặt đùi trước 1s đỉnh co thắt.", coachingCues: "Đá chân thẳng hoàn toàn, siết chặt đùi trước 1s đỉnh co thắt.", defaultSets: [{ setNum: 1, reps: "10-15", rir: "RIR 0", restSec: 90 }, { setNum: 2, reps: "10-15", rir: "RIR 0", restSec: 90 }] },
  { id: "leg_curl", exerciseId: "leg_curl", status: "ACTIVE", category: "Lower", movementPattern: "HINGE", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nhấc xương chậu khỏi đệm ghế.", cautions: "Kiểm soát pha hạ tạ eccentric 2-3s.", name: "Lying / Seated Leg Curl", category: "Strength", equipment: "Machine", primaryMuscles: ["Hamstrings"], secondaryMuscles: ["Calves"], targetRequirement: "2 sets × 6–10 reps @ RIR 0–1", formCues: "Cố định đùi chặt vào đệm. Gập gót chân sát mông, giữ 1s đỉnh co thắt.", coachingCues: "Cố định đùi chặt vào đệm. Gập gót chân sát mông, giữ 1s đỉnh co thắt.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90 }, { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90 }] },
  { id: "rdl_db", exerciseId: "rdl_db", status: "ACTIVE", category: "Lower", movementPattern: "HINGE", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không gù lưng hoặc khuỵu gối thành squat.", cautions: "Gập hông ra sau cảm nhận gân kheo căng tối đa.", name: "Romanian Deadlift (DB / Barbell)", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Hamstrings", "Glutes"], secondaryMuscles: ["Lower Back"], targetRequirement: "2 sets × 8–10 reps @ RIR 1–2", formCues: "Gập hông đẩy mông ra sau, lưng thẳng, cảm nhận gân kheo căng sâu.", coachingCues: "Gập hông đẩy mông ra sau, lưng thẳng, cảm nhận gân kheo căng sâu.", defaultSets: [{ setNum: 1, reps: "8-10", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "8-10", rir: "RIR 1", restSec: 120 }] },
  { id: "hip_thrust", exerciseId: "hip_thrust", status: "ACTIVE", category: "Lower", movementPattern: "HINGE", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không ưỡn thắt lưng quá mức ở đỉnh.", cautions: "Khóa xương chậu và siết chặt mông 1-2s.", name: "Barbell Hip Thrust", category: "Strength", equipment: "Barbell", primaryMuscles: ["Glutes"], secondaryMuscles: ["Hamstrings"], targetRequirement: "3 sets × 8–12 reps @ RIR 1", formCues: "Tựa lưng trên lên ghế, nâng hông siết chặt mông 2s đỉnh.", coachingCues: "Tựa lưng trên lên ghế, nâng hông siết chặt mông 2s đỉnh.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "8-12", rir: "RIR 1", restSec: 120 }] },
  { id: "calf_raise", exerciseId: "calf_raise", status: "ACTIVE", category: "Lower", movementPattern: "LOCOMOTION", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nhún nhảy lò xo mất kiểm soát.", cautions: "Dừng 1-2s ở đáy giãn cơ và đỉnh nhón gót.", name: "Standing / Seated Calf Raise", category: "Strength", equipment: "Machine", primaryMuscles: ["Calves"], secondaryMuscles: [], targetRequirement: "2 sets × 10–15 reps @ RIR 0", formCues: "Nhón cao hết biên độ giữ 1s, hạ gót sâu giữ 2s giãn bắp chuối.", coachingCues: "Nhón cao hết biên độ giữ 1s, hạ gót sâu giữ 2s giãn bắp chuối.", defaultSets: [{ setNum: 1, reps: "10-15", rir: "RIR 0", restSec: 60 }, { setNum: 2, reps: "10-15", rir: "RIR 0", restSec: 60 }] },
  { id: "sissy_squat", exerciseId: "sissy_squat", status: "ACTIVE", category: "Lower", movementPattern: "SQUAT", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không gập hông khi lùi người ra sau.", cautions: "Cần làm quen với tải bodyweight trước khi mang tạ.", name: "Sissy Squat (Bodyweight / Plate)", category: "Strength", equipment: "Bodyweight", primaryMuscles: ["Quads"], secondaryMuscles: ["Core"], targetRequirement: "2 sets × 10–15 reps", formCues: "Đẩy gối về trước, nghiêng người ra sau kéo giãn đùi trước tối đa.", coachingCues: "Đẩy gối về trước, nghiêng người ra sau kéo giãn đùi trước tối đa.", defaultSets: [{ setNum: 1, reps: "10-15", rir: "RIR 1", restSec: 60 }] },

  // UPPER BODY PUSH (CHEST, SHOULDERS, TRICEPS)
  { id: "incline_db_bench", exerciseId: "incline_db_bench", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không dang cùi chỏ quá rộng 90 độ gây áp lực bao khớp vai.", cautions: "Góc cùi chỏ 45-60 độ so với thân người.", name: "Incline DB Bench Press", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Chest"], secondaryMuscles: ["Shoulders", "Triceps"], targetRequirement: "2 sets × 6–10 reps @ RIR 0–1", formCues: "Góc ghế 30-45 độ, hạ sâu ngang ngực trên cảm nhận cơ căng giãn.", coachingCues: "Góc ghế 30-45 độ, hạ sâu ngang ngực trên cảm nhận cơ căng giãn.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 120 }] },
  { id: "flat_db_bench", exerciseId: "flat_db_bench", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nhấc vai khỏi ghế khi đẩy lên đỉnh.", cautions: "Khóa bả vai và giữ lồng ngực vươn cao.", name: "Flat DB Bench Press", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Chest"], secondaryMuscles: ["Triceps", "Shoulders"], targetRequirement: "2 sets × 6–10 reps @ RIR 1", formCues: "Nằm ngửa vững chãi, đẩy tạ vòng cung nhẹ, không khóa khớp.", coachingCues: "Nằm ngửa vững chãi, đẩy tạ vòng cung nhẹ, không khóa khớp.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "6-10", rir: "RIR 1", restSec: 120 }] },
  { id: "barbell_bench_press", exerciseId: "barbell_bench_press", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nảy đòn tạ lên từ xương ức.", cautions: "Luôn có người đỡ (spotter) hoặc dùng giá an toàn.", name: "Flat Barbell Bench Press", category: "Strength", equipment: "Barbell", primaryMuscles: ["Chest"], secondaryMuscles: ["Triceps", "Shoulders"], targetRequirement: "3 sets × 5–8 reps @ RIR 1", formCues: "Hạ đòn chạm xương ức ngực dưới, đẩy thẳng bùng nổ.", coachingCues: "Hạ đòn chạm xương ức ngực dưới, đẩy thẳng bùng nổ.", defaultSets: [{ setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150 }, { setNum: 2, reps: "5-8", rir: "RIR 1", restSec: 150 }] },
  { id: "machine_chest_press", exerciseId: "machine_chest_press", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nhún vai lên về phía tai.", cautions: "Giữ bả vai áp sát đệm tựa suốt set.", name: "Machine Chest Press", category: "Strength", equipment: "Machine", primaryMuscles: ["Chest"], secondaryMuscles: ["Triceps"], targetRequirement: "2 sets × 8–12 reps @ RIR 0", formCues: "Khóa bả vai vào đệm, đẩy hết sức an toàn tuyệt đối.", coachingCues: "Khóa bả vai vào đệm, đẩy hết sức an toàn tuyệt đối.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 90 }, { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 90 }] },
  { id: "dips", exerciseId: "dips", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không hạ quá sâu gây chèn ép khớp vai trước.", cautions: "Dừng khi bắp tay song song với sàn.", name: "Chest / Triceps Dips", category: "Strength", equipment: "Bodyweight", primaryMuscles: ["Chest", "Triceps"], secondaryMuscles: ["Shoulders"], targetRequirement: "2 sets × 6–10 reps @ RIR 1", formCues: "Nghiêng người về trước 20 độ để vào ngực. Xuống góc cùi chỏ 90 độ.", coachingCues: "Nghiêng người về trước 20 độ để vào ngực. Xuống góc cùi chỏ 90 độ.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "6-10", rir: "RIR 0-1", restSec: 120 }] },
  { id: "cable_crossover", exerciseId: "cable_crossover", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không gập cùi chỏ thành động tác press.", cautions: "Giữ góc cùi chỏ cố định như đang ôm thân cây.", name: "Cable Chest Fly / Crossover", category: "Strength", equipment: "Cable", primaryMuscles: ["Chest"], secondaryMuscles: [], targetRequirement: "2 sets × 12–15 reps @ RIR 0", formCues: "Ép 2 bàn tay chạm nhau phía trước ngực siết cơ 1s.", coachingCues: "Ép 2 bàn tay chạm nhau phía trước ngực siết cơ 1s.", defaultSets: [{ setNum: 1, reps: "12-15", rir: "RIR 0", restSec: 60 }] },
  { id: "machine_shoulder_press", exerciseId: "machine_shoulder_press", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không ưỡn thắt lưng để gian lận đẩy nặng.", cautions: "Tựa chặt lưng và mông vào đệm.", name: "Machine Shoulder Press", category: "Strength", equipment: "Machine", primaryMuscles: ["Shoulders"], secondaryMuscles: ["Triceps"], targetRequirement: "1 Set 6–10 reps + 1 Set Rest-Pause", formCues: "Tay cầm ngang tai. Đẩy thẳng đứng kiểm soát, hạ sâu đến cằm.", coachingCues: "Tay cầm ngang tai. Đẩy thẳng đứng kiểm soát, hạ sâu đến cằm.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "4-6+RP", rir: "RIR 0", restSec: 15 }] },
  { id: "db_shoulder_press", exerciseId: "db_shoulder_press", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không để tạ lệch về sau đầu gây trật khớp vai.", cautions: "Đẩy thẳng trục đứng qua đỉnh đầu.", name: "Seated DB Shoulder Press", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Shoulders"], secondaryMuscles: ["Triceps"], targetRequirement: "2 sets × 6–10 reps @ RIR 1", formCues: "Cùi chỏ khép nhẹ 45 độ so với thân, đẩy lên qua đầu.", coachingCues: "Cùi chỏ khép nhẹ 45 độ so với thân, đẩy lên qua đầu.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120 }] },
  { id: "lateral_raise", exerciseId: "lateral_raise", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không dùng quán tính lắc người để vung tạ.", cautions: "Cùi chỏ dẫn đường, nâng trong mặt phẳng bả vai (scaption plane).", name: "Lateral Raise (Cable / DB)", category: "Strength", equipment: "Cable", primaryMuscles: ["Shoulders"], secondaryMuscles: ["Traps"], targetRequirement: "1 Rest-Pause Extended Set (10-20 + mini sets)", formCues: "Nghiêng nhẹ người 10 độ, nâng tay dang ngang theo mặt phẳng bả vai.", coachingCues: "Nghiêng nhẹ người 10 độ, nâng tay dang ngang theo mặt phẳng bả vai.", defaultSets: [{ setNum: 1, reps: "10-20+RP", rir: "RIR 0", restSec: 15 }] },
  { id: "triceps_pushdown", exerciseId: "triceps_pushdown", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không đung đưa cùi chỏ ra trước ra sau.", cautions: "Khóa chặt cùi chỏ bên sườn.", name: "Triceps Pushdown (Rope / V-Bar)", category: "Strength", equipment: "Cable", primaryMuscles: ["Triceps"], secondaryMuscles: [], targetRequirement: "2 sets × 8–12 reps @ RIR 0", formCues: "Khóa cùi chỏ sát thân, đẩy cáp xuống mở rộng ở đáy.", coachingCues: "Khóa cùi chỏ sát thân, đẩy cáp xuống mở rộng ở đáy.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 60 }, { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 60 }] },
  { id: "overhead_triceps_ext", exerciseId: "overhead_triceps_ext", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không xòe rộng cùi chỏ sang 2 bên.", cautions: "Kéo giãn tối đa đầu dài cơ tam đầu.", name: "Overhead Cable / DB Triceps Ext", category: "Strength", equipment: "Cable", primaryMuscles: ["Triceps"], secondaryMuscles: [], targetRequirement: "2 sets × 10–12 reps @ RIR 0", formCues: "Kéo giãn đầu dài cơ tay sau tối đa phía sau đầu.", coachingCues: "Kéo giãn đầu dài cơ tay sau tối đa phía sau đầu.", defaultSets: [{ setNum: 1, reps: "10-12", rir: "RIR 0", restSec: 60 }] },

  // UPPER BODY PULL (LATS, UPPER BACK, BICEPS, REAR DELTS)
  { id: "pull_up", exerciseId: "pull_up", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không đung đưa giật chân (kipping) khi tập hypertrophy/strength.", cautions: "Khóa bả vai xuống trước khi kéo tay.", name: "Weighted / BW Pull-up", category: "Strength", equipment: "Bodyweight", primaryMuscles: ["Lats", "Upper Back"], secondaryMuscles: ["Biceps", "Forearms"], targetRequirement: "2 sets × 5–8 reps @ RIR 0–1", formCues: "Treo người thẳng tay, kéo bả vai xuống trước khi gập cùi chỏ. Cằm vượt xà.", coachingCues: "Treo người thẳng tay, kéo bả vai xuống trước khi gập cùi chỏ. Cằm vượt xà.", defaultSets: [{ setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150 }, { setNum: 2, reps: "5-8", rir: "RIR 0-1", restSec: 150 }] },
  { id: "lat_pulldown", exerciseId: "lat_pulldown", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không ngửa người ra sau quá 20 độ.", cautions: "Kéo đòn về xương quai xanh và ép chặt bả vai.", name: "Lat Pulldown (Neutral / Wide)", category: "Strength", equipment: "Cable", primaryMuscles: ["Lats"], secondaryMuscles: ["Biceps"], targetRequirement: "2 sets × 8–12 reps @ RIR 0–1", formCues: "Kéo thanh đòn về xương quai xanh, ép chặt bả vai.", coachingCues: "Kéo thanh đòn về xương quai xanh, ép chặt bả vai.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 120 }] },
  { id: "chest_supported_row", exerciseId: "chest_supported_row", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nhấc ngực khỏi đệm tựa.", cautions: "Kéo cùi chỏ ra sau siết cơ xô và lưng trên.", name: "Chest-Supported Row", category: "Strength", equipment: "Machine", primaryMuscles: ["Upper Back", "Lats"], secondaryMuscles: ["Biceps", "Rear Delts"], targetRequirement: "2 sets × 6–10 reps @ RIR 0", formCues: "Áp ngực sát đệm tựa, kéo cùi chỏ về sau siết chặt bả vai.", coachingCues: "Áp ngực sát đệm tựa, kéo cùi chỏ về sau siết chặt bả vai.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 120 }, { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 120 }] },
  { id: "barbell_row", exerciseId: "barbell_row", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không giật lưng trên để nhấc tạ.", cautions: "Giữ cột sống thắt lưng trung tính.", name: "Bent-Over Barbell Row", category: "Strength", equipment: "Barbell", primaryMuscles: ["Upper Back", "Lats"], secondaryMuscles: ["Lower Back", "Biceps"], targetRequirement: "3 sets × 6–8 reps @ RIR 1", formCues: "Gập hông 45 độ, kéo đòn sát đùi về rốn.", coachingCues: "Gập hông 45 độ, kéo đòn sát đùi về rốn.", defaultSets: [{ setNum: 1, reps: "6-8", rir: "RIR 1", restSec: 120 }] },
  { id: "face_pull", exerciseId: "face_pull", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không kéo về ngực thay vì kéo về trán.", cautions: "Xoay ngoài cổ tay ở đỉnh kéo kích hoạt rotator cuff.", name: "Cable Face Pull", category: "Strength", equipment: "Cable", primaryMuscles: ["Shoulders", "Upper Back"], secondaryMuscles: [], targetRequirement: "2 sets × 12–15 reps", formCues: "Kéo dây thừng về trán, xoay ngoài cổ tay kích hoạt cơ xoay vai.", coachingCues: "Kéo dây thừng về trán, xoay ngoài cổ tay kích hoạt cơ xoay vai.", defaultSets: [{ setNum: 1, reps: "12-15", rir: "RIR 0", restSec: 60 }] },
  { id: "biceps_curl", exerciseId: "biceps_curl", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không đưa cùi chỏ ra trước để hỗ trợ.", cautions: "Khóa cùi chỏ cố định và hạ chậm 2s.", name: "Incline DB Biceps Curl", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Biceps"], secondaryMuscles: ["Forearms"], targetRequirement: "2 sets × 8–12 reps @ RIR 0", formCues: "Khóa cố định cùi chỏ bên hông, cuộn tạ siết bắp tay, hạ chậm 2s.", coachingCues: "Khóa cố định cùi chỏ bên hông, cuộn tạ siết bắp tay, hạ chậm 2s.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 60 }, { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 60 }] },
  { id: "hammer_curl", exerciseId: "hammer_curl", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không vặn cổ tay sang ngang.", cautions: "Lòng bàn tay đối diện nhau kích hoạt cơ cánh tay Brachialis.", name: "DB Hammer Curl", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Biceps"], secondaryMuscles: ["Forearms"], targetRequirement: "2 sets × 8–12 reps", formCues: "Lòng bàn tay hướng vào nhau, phát triển cơ cánh tay Brachialis.", coachingCues: "Lòng bàn tay hướng vào nhau, phát triển cơ cánh tay Brachialis.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 0", restSec: 60 }] },

  // CORE & FUNCTIONAL
  { id: "hanging_leg_raise", exerciseId: "hanging_leg_raise", status: "ACTIVE", category: "Core", movementPattern: "CORE", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không đung đưa người theo đà quán tính.", cautions: "Cuộn xương chậu lên ngực để kích hoạt cơ bụng thay vì cơ gập hông.", name: "Hanging Leg / Knee Raise", category: "Strength", equipment: "Bodyweight", primaryMuscles: ["Core"], secondaryMuscles: ["Hip Flexors"], targetRequirement: "2 sets × 8–15 reps", formCues: "Treo xà, cuộn xương chậu lên ngực, không đung đưa theo quán tính.", coachingCues: "Treo xà, cuộn xương chậu lên ngực, không đung đưa theo quán tính.", defaultSets: [{ setNum: 1, reps: "8-15", rir: "RIR 1", restSec: 60 }] },
  { id: "abmat_situp", exerciseId: "abmat_situp", status: "ACTIVE", category: "Core", movementPattern: "CORE", trainingType: "CONDITIONING", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không giật cổ khi ngồi dậy.", cautions: "Chạm tay sau đầu và vươn chạm mũi chân có kiểm soát.", name: "AbMat Sit-up", category: "Strength", equipment: "Bodyweight", primaryMuscles: ["Core"], secondaryMuscles: [], targetRequirement: "3 sets × 20 reps", formCues: "Chạm tay ra sau đầu rồi ngồi dậy chạm mũi chân.", coachingCues: "Chạm tay ra sau đầu rồi ngồi dậy chạm mũi chân.", defaultSets: [{ setNum: 1, reps: "20", rir: "RIR 1", restSec: 45 }] },
  { id: "plank", exerciseId: "plank", status: "ACTIVE", category: "Core", movementPattern: "CORE", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không võng thắt lưng hoặc nhô mông quá cao.", cautions: "Siết chặt cơ mông và cơ bụng tạo thành tấm ván phẳng.", name: "Forearm Plank", category: "Strength", equipment: "Bodyweight", primaryMuscles: ["Core"], secondaryMuscles: ["Glutes"], targetRequirement: "3 sets × 45–60s", formCues: "Siết chặt bụng và mông, giữ thân thẳng như tấm ván.", coachingCues: "Siết chặt bụng và mông, giữ thân thẳng như tấm ván.", defaultSets: [{ setNum: 1, reps: "60s", rir: "RIR 0", restSec: 45 }] },
  { id: "cable_woodchop", exerciseId: "cable_woodchop", status: "ACTIVE", category: "Core", movementPattern: "ROTATION", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không xoay chỉ bằng cánh tay mà không xoay thân hông.", cautions: "Phát lực xoay từ trục hông và cơ chéo bụng.", name: "Cable Diagonal Woodchop", category: "Strength", equipment: "Cable", primaryMuscles: ["Core"], secondaryMuscles: ["Shoulders"], targetRequirement: "2 sets × 10–12 reps/bên", formCues: "Xoay hông và thân trên chéo góc, kích hoạt cơ chéo bụng.", coachingCues: "Xoay hông và thân trên chéo góc, kích hoạt cơ chéo bụng.", defaultSets: [{ setNum: 1, reps: "10-12", rir: "RIR 1", restSec: 60 }] },

  // CARDIO & RUNNING
  { id: "threshold_run", exerciseId: "threshold_run", status: "ACTIVE", category: "Cardio", movementPattern: "LOCOMOTION", trainingType: "CARDIO", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không xuất phát quá nhanh vượt ngưỡng lactate ở các km đầu.", cautions: "Duy trì cadence 175-185 spm và nhịp thở ổn định.", name: "Threshold Run (Interval 2km/3km)", category: "Cardio", equipment: "Bodyweight", primaryMuscles: ["Cardio", "Quads"], secondaryMuscles: ["Calves", "Hamstrings"], targetRequirement: "3 × 2 km @ Pace 5:45–5:55/km", formCues: "Cadence 175-185 spm, thở nhịp nhàng 2:2.", coachingCues: "Cadence 175-185 spm, thở nhịp nhàng 2:2.", defaultSets: [{ setNum: 1, reps: "2km", rir: "RPE 8", restSec: 120 }] },
  { id: "speed_repeats", exerciseId: "speed_repeats", status: "ACTIVE", category: "Cardio", movementPattern: "LOCOMOTION", trainingType: "CARDIO", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không chạy hết sức ở rep đầu rồi đuối sức ở rep cuối.", cautions: "Nghỉ jog đúng thời lượng quy định giữa các rep.", name: "1km Speed Repeats", category: "Cardio", equipment: "Bodyweight", primaryMuscles: ["Cardio", "Quads"], secondaryMuscles: ["Calves"], targetRequirement: "4–5 × 1 km @ Pace 5:25–5:40/km", formCues: "Chạy bứt tốc có kiểm soát, nghỉ jog 2 phút.", coachingCues: "Chạy bứt tốc có kiểm soát, nghỉ jog 2 phút.", defaultSets: [{ setNum: 1, reps: "1km", rir: "RPE 8.5", restSec: 120 }] },
  { id: "easy_run", exerciseId: "easy_run", status: "ACTIVE", category: "Cardio", movementPattern: "LOCOMOTION", trainingType: "CARDIO", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không chạy quá nhanh biến buổi easy thành tempo.", cautions: "Giữ nhịp tim hoàn toàn trong Zone 2 và thở bằng mũi.", name: "Easy Run Zone 2 (5-8km)", category: "Cardio", equipment: "Bodyweight", primaryMuscles: ["Cardio"], secondaryMuscles: ["Calves"], targetRequirement: "5–8 km @ Pace 6:15–6:45/km", formCues: "Thở hoàn toàn bằng mũi, nhịp tim duy trì Zone 2.", coachingCues: "Thở hoàn toàn bằng mũi, nhịp tim duy trì Zone 2.", defaultSets: [{ setNum: 1, reps: "5km", rir: "RPE 5", restSec: 0 }] },
  { id: "long_run", exerciseId: "long_run", status: "ACTIVE", category: "Cardio", movementPattern: "LOCOMOTION", trainingType: "CARDIO", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không quên bù nước và điện giải khi chạy dài.", cautions: "Nạp gel sau mỗi 45-50 phút chạy liên tục.", name: "Long Run (12-16km)", category: "Cardio", equipment: "Bodyweight", primaryMuscles: ["Cardio", "Quads"], secondaryMuscles: ["Calves", "Hamstrings"], targetRequirement: "12–16 km @ Pace 6:00–6:20/km", formCues: "Nạp 1 Energy Gel sau mỗi 45 phút chạy + bù điện giải.", coachingCues: "Nạp 1 Energy Gel sau mỗi 45 phút chạy + bù điện giải.", defaultSets: [{ setNum: 1, reps: "12km", rir: "RPE 6", restSec: 0 }] },

  // HYROX & FUNCTIONAL
  { id: "skierg", exerciseId: "skierg", status: "ACTIVE", category: "Hybrid", movementPattern: "PULL", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không chỉ kéo bằng tay mà không gập hông phát lực.", cautions: "Gập thân dứt khoát và kéo sâu theo thân người.", name: "SkiErg 1000m", category: "Hybrid", equipment: "Machine", primaryMuscles: ["Lats", "Core"], secondaryMuscles: ["Triceps", "Cardio"], targetRequirement: "1000m @ Pace < 2:05/500m", formCues: "Gập hông dứt khoát, kéo tay xuôi theo thân người.", coachingCues: "Gập hông dứt khoát, kéo tay xuôi theo thân người.", defaultSets: [{ setNum: 1, reps: "1000m", rir: "RPE 8", restSec: 60 }] },
  { id: "sled_push", exerciseId: "sled_push", status: "ACTIVE", category: "Hybrid", movementPattern: "PUSH", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không bước chân quá ngắn hoặc trượt đế giày.", cautions: "Khóa chặt cổ chân và đẩy người chéo góc 45 độ.", name: "Sled Push (100kg+)", category: "Hybrid", equipment: "Machine", primaryMuscles: ["Quads", "Glutes"], secondaryMuscles: ["Calves"], targetRequirement: "50m Heavy Push", formCues: "Khóa chặt cổ chân, bước dài dứt khoát.", coachingCues: "Khóa chặt cổ chân, bước dài dứt khoát.", defaultSets: [{ setNum: 1, reps: "50m", rir: "RPE 9", restSec: 90 }] },
  { id: "sled_pull", exerciseId: "sled_pull", status: "ACTIVE", category: "Hybrid", movementPattern: "HINGE", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không gù lưng khi kéo dây xe trượt.", cautions: "Hạ thấp trọng tâm và kéo dứt khoát bằng cả thân dưới.", name: "Sled Pull (75kg+)", category: "Hybrid", equipment: "Machine", primaryMuscles: ["Hamstrings", "Lats"], secondaryMuscles: ["Glutes"], targetRequirement: "50m Heavy Drag", formCues: "Ngả người ra sau kéo dứt khoát bằng cả thân dưới và lưng.", coachingCues: "Ngả người ra sau kéo dứt khoát bằng cả thân dưới và lưng.", defaultSets: [{ setNum: 1, reps: "50m", rir: "RPE 8.5", restSec: 90 }] },
  { id: "burpee_broad_jump", exerciseId: "burpee_broad_jump", status: "ACTIVE", category: "Hybrid", movementPattern: "LOCOMOTION", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không tiếp đất bằng đầu gối khóa cứng.", cautions: "Tiếp đất êm ái bằng cả bàn chân và chùng gối giảm chấn.", name: "Burpee Broad Jump", category: "Hybrid", equipment: "Bodyweight", primaryMuscles: ["Cardio", "Quads"], secondaryMuscles: ["Chest"], targetRequirement: "80m For Time", formCues: "Hạ ngực chạm sàn, bật nhảy xa bằng cả 2 chân.", coachingCues: "Hạ ngực chạm sàn, bật nhảy xa bằng cả 2 chân.", defaultSets: [{ setNum: 1, reps: "80m", rir: "RPE 8.5", restSec: 60 }] },
  { id: "rowing_erg", exerciseId: "rowing_erg", status: "ACTIVE", category: "Hybrid", movementPattern: "PULL", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không gập tay kéo trước khi chân đạp thẳng.", cautions: "Thứ tự chuyển động: Đạp chân -> Ngả lưng -> Kéo tay.", name: "Rowing Ergometer 1000m", category: "Hybrid", equipment: "Machine", primaryMuscles: ["Lats", "Cardio"], secondaryMuscles: ["Quads", "Hamstrings"], targetRequirement: "1000m @ Pace < 1:55/500m", formCues: "Đạp chân trước, ngả thân sau, kéo tay cuối cùng.", coachingCues: "Đạp chân trước, ngả thân sau, kéo tay cuối cùng.", defaultSets: [{ setNum: 1, reps: "1000m", rir: "RPE 8", restSec: 60 }] },
  { id: "farmers_carry", exerciseId: "farmers_carry", status: "ACTIVE", category: "Hybrid", movementPattern: "CARRY", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không để tạ va đập vào đùi hoặc nghiêng người.", cautions: "Lưng thẳng, ngực vươn cao, bước ngắn kiểm soát.", name: "Farmers Carry (2x24kg)", category: "Hybrid", equipment: "Kettlebell", primaryMuscles: ["Forearms", "Traps"], secondaryMuscles: ["Core"], targetRequirement: "200m Carry", formCues: "Lưng thẳng, bước ngắn có kiểm soát, khóa chặt cẳng tay.", coachingCues: "Lưng thẳng, bước ngắn có kiểm soát, khóa chặt cẳng tay.", defaultSets: [{ setNum: 1, reps: "200m", rir: "RPE 8", restSec: 60 }] },
  { id: "sandbag_lunges", exerciseId: "sandbag_lunges", status: "ACTIVE", category: "Hybrid", movementPattern: "LUNGE", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không để đầu gối chạm đập mạnh xuống sàn.", cautions: "Hạ gối nhẹ nhàng sát sàn rồi đạp thẳng lên.", name: "Sandbag Walking Lunges (20kg)", category: "Hybrid", equipment: "Bodyweight", primaryMuscles: ["Quads", "Glutes"], secondaryMuscles: ["Core"], targetRequirement: "100m Lunges", formCues: "Vác bao cát ngang vai, bước chùng chân 90 độ.", coachingCues: "Vác bao cát ngang vai, bước chùng chân 90 độ.", defaultSets: [{ setNum: 1, reps: "100m", rir: "RPE 9", restSec: 90 }] },
  { id: "wall_balls", exerciseId: "wall_balls", status: "ACTIVE", category: "Hybrid", movementPattern: "SQUAT", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không squat nông nửa chừng dưới 90 độ.", cautions: "Squat sâu qua song song và dùng lực đẩy bóng trúng đích.", name: "Wall Balls (9kg/6kg)", category: "Hybrid", equipment: "Bodyweight", primaryMuscles: ["Quads", "Shoulders"], secondaryMuscles: ["Cardio"], targetRequirement: "100 Reps", formCues: "Squat sâu dưới 90 độ, ném bóng trúng đích 3m.", coachingCues: "Squat sâu dưới 90 độ, ném bóng trúng đích 3m.", defaultSets: [{ setNum: 1, reps: "100", rir: "RPE 9", restSec: 60 }] },
  { id: "thruster", exerciseId: "thruster", status: "ACTIVE", category: "Hybrid", movementPattern: "SQUAT", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không tách rời squat và press thành 2 nhịp riêng.", cautions: "Phát lực nhịp nhàng liên tục từ chân truyền qua đòn tạ lên đầu.", name: "Barbell Thruster (43kg/30kg)", category: "Hybrid", equipment: "Barbell", primaryMuscles: ["Quads", "Shoulders"], secondaryMuscles: ["Cardio", "Core"], targetRequirement: "21-15-9 Reps", formCues: "Front squat sâu rồi đẩy bùng nổ tạ qua đầu.", coachingCues: "Front squat sâu rồi đẩy bùng nổ tạ qua đầu.", defaultSets: [{ setNum: 1, reps: "21", rir: "RPE 9", restSec: 60 }] },
  { id: "kettlebell_swing", exerciseId: "kettlebell_swing", status: "ACTIVE", category: "Hybrid", movementPattern: "HINGE", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không biến động tác thành squat rồi nâng bằng vai.", cautions: "Gập hông dứt khoát đẩy mông ra sau và siết mông đẩy tạ bay lên.", name: "Russian / American KB Swing", category: "Hybrid", equipment: "Kettlebell", primaryMuscles: ["Hamstrings", "Glutes"], secondaryMuscles: ["Shoulders"], targetRequirement: "3 sets × 20 reps", formCues: "Gập hông phát lực bằng cơ mông, không nâng bằng vai.", coachingCues: "Gập hông phát lực bằng cơ mông, không nâng bằng vai.", defaultSets: [{ setNum: 1, reps: "20", rir: "RPE 8", restSec: 45 }] },
  { id: "box_jump", exerciseId: "box_jump", status: "ACTIVE", category: "Hybrid", movementPattern: "LOCOMOTION", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không tiếp đất bằng chân thẳng gây chấn thương gối.", cautions: "Tiếp đất êm ái trên mặt hộp ở tư thế quarter squat.", name: "Box Jump Overs (24in/20in)", category: "Hybrid", equipment: "Bodyweight", primaryMuscles: ["Quads", "Calves"], secondaryMuscles: ["Cardio"], targetRequirement: "3 sets × 15 reps", formCues: "Bật nhảy tiếp đất êm ái trên mặt hộp.", coachingCues: "Bật nhảy tiếp đất êm ái trên mặt hộp.", defaultSets: [{ setNum: 1, reps: "15", rir: "RPE 7.5", restSec: 45 }] },
  { id: "devil_press", exerciseId: "devil_press", status: "ACTIVE", category: "Hybrid", movementPattern: "LOCOMOTION", trainingType: "HYBRID", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nhấc tạ bằng lưng cong ở pha swing qua đầu.", cautions: "Giữ tạ sát thân và dùng lực hông đẩy thẳng tạ qua đầu.", name: "Dumbbell Devil Press (2x15kg)", category: "Hybrid", equipment: "Dumbbell", primaryMuscles: ["Chest", "Shoulders"], secondaryMuscles: ["Hamstrings", "Cardio"], targetRequirement: "10–15 reps", formCues: "Burpee chạm ngực trên tạ rồi swing đẩy thẳng tạ qua đầu.", coachingCues: "Burpee chạm ngực trên tạ rồi swing đẩy thẳng tạ qua đầu.", defaultSets: [{ setNum: 1, reps: "10", rir: "RPE 9", restSec: 60 }] },
  { id: "barbell_ohp", exerciseId: "barbell_ohp", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không ưỡn thắt lưng ra sau quá nhiều khi đẩy qua đầu.", cautions: "Siết chặt cơ mông và cơ lõi suốt hành trình nâng tạ.", name: "Overhead Barbell Press (Strict OHP)", category: "Strength", equipment: "Barbell", primaryMuscles: ["Shoulders"], secondaryMuscles: ["Triceps", "Core"], targetRequirement: "3 sets × 5–8 reps @ RIR 1", formCues: "Siết chặt mông và cơ lõi, đẩy thanh đòn thẳng đứng qua đầu sát cằm.", coachingCues: "Siết chặt mông và cơ lõi, đẩy thanh đòn thẳng đứng qua đầu sát cằm.", defaultSets: [{ setNum: 1, reps: "5-8", rir: "RIR 1", restSec: 150 }] },
  { id: "preacher_curl", exerciseId: "preacher_curl", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không duỗi thẳng cánh tay thả rơi tạ ở đáy.", cautions: "Kiểm soát 2-3s hạ tạ bảo vệ gân bắp tay.", name: "Preacher Curl (EZ-Bar / Machine)", category: "Strength", equipment: "Barbell", primaryMuscles: ["Biceps"], secondaryMuscles: ["Forearms"], targetRequirement: "2 sets × 8–12 reps @ RIR 0", formCues: "Áp nách sát đệm ghế, cuộn tạ siết bắp tay ở đỉnh, hạ kiểm soát không thả rơi khớp.", coachingCues: "Áp nách sát đệm ghế, cuộn tạ siết bắp tay ở đỉnh, hạ kiểm soát không thả rơi khớp.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 0", restSec: 90 }] },
  { id: "romanian_deadlift_bb", exerciseId: "romanian_deadlift_bb", status: "ACTIVE", category: "Lower", movementPattern: "HINGE", trainingType: "STRENGTH", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không để đòn tạ trôi xa khỏi cẳng chân.", cautions: "Giữ đòn tạ cọ sát đùi và cẳng chân để bảo vệ thắt lưng.", name: "Barbell Romanian Deadlift (RDL)", category: "Strength", equipment: "Barbell", primaryMuscles: ["Hamstrings", "Glutes"], secondaryMuscles: ["Lower Back"], targetRequirement: "3 sets × 6–8 reps @ RIR 1–2", formCues: "Cố định đầu gối hơi chùng, gập hông đẩy mông ra sau cho tới khi gân kheo căng tối đa.", coachingCues: "Cố định đầu gối hơi chùng, gập hông đẩy mông ra sau cho tới khi gân kheo căng tối đa.", defaultSets: [{ setNum: 1, reps: "6-8", rir: "RIR 1", restSec: 150 }] },
  { id: "walking_lunges_db", exerciseId: "walking_lunges_db", status: "ACTIVE", category: "Lower", movementPattern: "LUNGE", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không bước chân so le làm mất thăng bằng ngang.", cautions: "Bước rộng bằng hông và giữ thân người thẳng đứng.", name: "Dumbbell Walking Lunges", category: "Strength", equipment: "Dumbbell", primaryMuscles: ["Quads", "Glutes"], secondaryMuscles: ["Hamstrings", "Calves"], targetRequirement: "2 sets × 10–12 bước/chân", formCues: "Bước dài, gối sau hạ gần chạm sàn, giữ thân thẳng đứng siết cơ đùi và mông.", coachingCues: "Bước dài, gối sau hạ gần chạm sàn, giữ thân thẳng đứng siết cơ đùi và mông.", defaultSets: [{ setNum: 1, reps: "10-12", rir: "RIR 1", restSec: 90 }] },
  { id: "hip_adduction", exerciseId: "hip_adduction", status: "ACTIVE", category: "Lower", movementPattern: "CORE", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không giật tạ bằng lưng.", cautions: "Khép đùi siết chặt 1s ở đỉnh co thắt.", name: "Hip Adduction Machine", category: "Strength", equipment: "Machine", primaryMuscles: ["Adductors"], secondaryMuscles: ["Glutes"], targetRequirement: "1 RP hoặc 2 × 8–12 reps @ RIR 0", formCues: "Khép đùi dứt khoát, siết chặt cơ khép 1s đỉnh co thắt, mở chậm 2-3s.", coachingCues: "Khép đùi dứt khoát, siết chặt cơ khép 1s đỉnh co thắt, mở chậm 2-3s.", defaultSets: [{ setNum: 1, reps: "8-12", rir: "RIR 1", restSec: 90 }, { setNum: 2, reps: "8-12", rir: "RIR 0", restSec: 90 }] },
  { id: "leg_ext_hold", exerciseId: "leg_ext_hold", status: "ACTIVE", category: "Lower", movementPattern: "SQUAT", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không hạ chân xuống trước thời gian mục tiêu.", cautions: "Khóa gối và siết chặt đùi trước tạo áp lực isometric.", name: "Leg Extension Hold (Isometric)", category: "Strength", equipment: "Machine", primaryMuscles: ["Quads"], secondaryMuscles: [], targetRequirement: "1-2 × 20-40s @ RPE 7-8", formCues: "Đá thẳng chân và giữ chặt đùi trước ở vị trí khóa gối 20-40 giây tạo áp lực isometric.", coachingCues: "Đá thẳng chân và giữ chặt đùi trước ở vị trí khóa gối 20-40 giây tạo áp lực isometric.", defaultSets: [{ setNum: 1, reps: "30s", rir: "RPE 7-8", restSec: 60 }] },
  { id: "rear_delt_fly", exerciseId: "rear_delt_fly", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không dùng cơ thang nhún vai lên.", cautions: "Tập trung cô lập cơ vai sau với chuyển động mở cánh tay.", name: "Rear Delt Fly (Cable / Machine)", category: "Strength", equipment: "Cable", primaryMuscles: ["Rear Delts", "Shoulders"], secondaryMuscles: ["Upper Back"], targetRequirement: "1 Rest-Pause Extended Set (10-20 + mini sets)", formCues: "Dang tay ngang vai hơi cong cùi chỏ, siết chặt vai sau, không giật bả vai.", coachingCues: "Dang tay ngang vai hơi cong cùi chỏ, siết chặt vai sau, không giật bả vai.", defaultSets: [{ setNum: 1, reps: "10-20+RP", rir: "RIR 0", restSec: 15 }] },
  { id: "curl_pushdown", exerciseId: "curl_pushdown", status: "ACTIVE", category: "Upper", movementPattern: "PULL", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không nghỉ quá lâu giữa set superset tay trước và tay sau.", cautions: "Chuyển bài nhanh chóng để tối đa hóa bơm máu.", name: "Curl & Pushdown Superset", category: "Strength", equipment: "Cable", primaryMuscles: ["Biceps", "Triceps"], secondaryMuscles: [], targetRequirement: "1 RP hoặc 2 × 6-10 @ RIR 0", formCues: "Superset tay trước và tay sau luân phiên, tối đa hóa bơm máu cơ bắp.", coachingCues: "Superset tay trước và tay sau luân phiên, tối đa hóa bơm máu cơ bắp.", defaultSets: [{ setNum: 1, reps: "6-10", rir: "RIR 1", restSec: 90 }, { setNum: 2, reps: "6-10", rir: "RIR 0", restSec: 90 }] },
  { id: "cable_lateral_raise_uni", exerciseId: "cable_lateral_raise_uni", status: "ACTIVE", category: "Upper", movementPattern: "PUSH", trainingType: "HYPERTROPHY", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không vặn người khi kéo cáp từ sau hông.", cautions: "Dang tay theo góc 30 độ mặt phẳng bả vai.", name: "Unilateral Cable Lateral Raise", category: "Strength", equipment: "Cable", primaryMuscles: ["Shoulders"], secondaryMuscles: ["Traps"], targetRequirement: "2 sets × 12–15 reps @ RIR 0", formCues: "Kéo dây cáp qua hông dang tay theo góc 30 độ mặt phẳng bả vai, giữ đỉnh 1 giây.", coachingCues: "Kéo dây cáp qua hông dang tay theo góc 30 độ mặt phẳng bả vai, giữ đỉnh 1 giây.", defaultSets: [{ setNum: 1, reps: "12-15", rir: "RIR 0", restSec: 60 }] },
  { id: "assault_bike_intervals", exerciseId: "assault_bike_intervals", status: "ACTIVE", category: "Cardio", movementPattern: "LOCOMOTION", trainingType: "CARDIO", version: "1.0", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-09-26T00:00:00.000Z", instructions: null, coachingCues: null, commonErrors: "Không giảm công suất giữa chừng trong 20s sprint.", cautions: "Đạp chân và kéo tay đồng thời, bung hết 100% công suất.", name: "Assault / Echo Bike Lactic Sprints", category: "Cardio", equipment: "Machine", primaryMuscles: ["Cardio", "Quads"], secondaryMuscles: ["Shoulders", "Glutes"], targetRequirement: "10 Rounds (20s Max Wattage / 40s Recovery)", formCues: "Đạp chân và đẩy kéo tay đồng thời, bùng nổ hết công suất 20 giây.", coachingCues: "Đạp chân và đẩy kéo tay đồng thời, bùng nổ hết công suất 20 giây.", defaultSets: [{ setNum: 1, reps: "20s/40s x10", rir: "RPE 9.5", restSec: 40 }] }
];

// =========================================================================
// 3. 50+ DIVERSE CROSSFIT & HYROX WOD DATABASE
// =========================================================================
const CROSSFIT_WOD_DATABASE = [
  // THE GIRLS
  { id: "wod_fran", name: "Fran", category: "The Girls", format: "For Time", difficulty: "Hard", rxMale: "43 kg (95 lbs)", rxFemale: "30 kg (65 lbs)", timeCap: "10 mins", movements: ["21 Thrusters", "21 Pull-ups", "15 Thrusters", "15 Pull-ups", "9 Thrusters", "9 Pull-ups"], description: "The gold standard CrossFit sprint. Heart rate will spike instantly; maintain pacing in round of 15.", targetMuscles: ["Quads", "Shoulders", "Lats", "Cardio"] },
  { id: "wod_cindy", name: "Cindy", category: "The Girls", format: "20 min AMRAP", difficulty: "Medium", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "20 mins", movements: ["5 Pull-ups", "10 Push-ups", "15 Air Squats"], description: "Endurance bodyweight benchmark. Consistent 45-60s per round pacing is key.", targetMuscles: ["Lats", "Chest", "Quads", "Cardio"] },
  { id: "wod_grace", name: "Grace", category: "The Girls", format: "For Time", difficulty: "Hard", rxMale: "61 kg (135 lbs)", rxFemale: "43 kg (95 lbs)", timeCap: "8 mins", movements: ["30 Clean and Jerks for time"], description: "Barbell power and breathing efficiency test. Quick singles or sets of 5.", targetMuscles: ["Hamstrings", "Quads", "Shoulders"] },
  { id: "wod_helen", name: "Helen", category: "The Girls", format: "3 Rounds For Time", difficulty: "Medium", rxMale: "24 kg KB (53 lbs)", rxFemale: "16 kg KB (35 lbs)", timeCap: "15 mins", movements: ["400m Run", "21 Kettlebell Swings", "12 Pull-ups"], description: "Classic running and posterior chain benchmark. Maintain high tempo on 400m runs.", targetMuscles: ["Hamstrings", "Glutes", "Lats", "Cardio"] },
  { id: "wod_diane", name: "Diane", category: "The Girls", format: "For Time", difficulty: "Hard", rxMale: "102 kg DL (225 lbs)", rxFemale: "70 kg DL (155 lbs)", timeCap: "12 mins", movements: ["21 Deadlifts", "21 Handstand Push-ups", "15 Deadlifts", "15 Handstand Push-ups", "9 Deadlifts", "9 Handstand Push-ups"], description: "Posterior chain hinge power paired with strict gymnastic pressing.", targetMuscles: ["Hamstrings", "Lower Back", "Shoulders"] },
  { id: "wod_karen", name: "Karen", category: "The Girls", format: "For Time", difficulty: "Hard", rxMale: "9 kg (20 lbs) Ball", rxFemale: "6 kg (14 lbs) Ball", timeCap: "15 mins", movements: ["150 Wall Balls for time"], description: "Leg burn and mental grit test. Break into disciplined sets of 25-30 reps.", targetMuscles: ["Quads", "Shoulders", "Cardio"] },
  { id: "wod_annie", name: "Annie", category: "The Girls", format: "For Time", difficulty: "Medium", rxMale: "Double Unders", rxFemale: "Double Unders", timeCap: "12 mins", movements: ["50-40-30-20-10 Double Unders", "50-40-30-20-10 Sit-ups"], description: "High speed core conditioning and jump rope agility test.", targetMuscles: ["Core", "Calves", "Hip Flexors"] },
  { id: "wod_elizabeth", name: "Elizabeth", category: "The Girls", format: "For Time", difficulty: "Hard", rxMale: "61 kg (135 lbs)", rxFemale: "43 kg (95 lbs)", timeCap: "12 mins", movements: ["21 Squat Cleans", "21 Ring Dips", "15 Squat Cleans", "15 Ring Dips", "9 Squat Cleans", "9 Ring Dips"], description: "Explosive triple extension combined with strict gymnastics pressing.", targetMuscles: ["Quads", "Chest", "Triceps"] },
  { id: "wod_nancy", name: "Nancy", category: "The Girls", format: "5 Rounds For Time", difficulty: "Hard", rxMale: "43 kg (95 lbs)", rxFemale: "30 kg (65 lbs)", timeCap: "20 mins", movements: ["400m Run", "15 Overhead Squats"], description: "Thoracic mobility and running stamina under shoulder fatigue.", targetMuscles: ["Quads", "Shoulders", "Cardio"] },
  { id: "wod_jackie", name: "Jackie", category: "The Girls", format: "For Time", difficulty: "Medium", rxMale: "20 kg (45 lbs) Barbell", rxFemale: "15 kg (35 lbs) Barbell", timeCap: "15 mins", movements: ["1000m Row", "50 Empty Barbell Thrusters", "30 Pull-ups"], description: "Pure engine chipper. Hold a sustainable 1:55-2:00/500m split on the rower.", targetMuscles: ["Lats", "Quads", "Shoulders", "Cardio"] },
  { id: "wod_mary", name: "Mary", category: "The Girls", format: "20 min AMRAP", difficulty: "Elite", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "20 mins", movements: ["5 Handstand Push-ups", "10 Alternating Pistols", "15 Pull-ups"], description: "High skill gymnastics and unilateral leg strength test.", targetMuscles: ["Shoulders", "Quads", "Lats"] },
  { id: "wod_angie", name: "Angie", category: "The Girls", format: "For Time", difficulty: "Hard", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "25 mins", movements: ["100 Pull-ups", "100 Push-ups", "100 Sit-ups", "100 Air Squats"], description: "Complete all 100 reps of each exercise before moving to the next.", targetMuscles: ["Lats", "Chest", "Core", "Quads"] },
  { id: "wod_barbara", name: "Barbara", category: "The Girls", format: "5 Rounds (3m rest)", difficulty: "Hard", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "35 mins", movements: ["20 Pull-ups", "30 Push-ups", "40 Sit-ups", "50 Air Squats"], description: "High volume interval pacing. Treat each round as an aggressive sprint.", targetMuscles: ["Lats", "Chest", "Core", "Quads"] },
  { id: "wod_chelsea", name: "Chelsea", category: "The Girls", format: "EMOM for 30 mins", difficulty: "Hard", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "30 mins", movements: ["5 Pull-ups + 10 Push-ups + 15 Air Squats every minute"], description: "Strict pacing test. If you fall behind the minute mark, workout ends.", targetMuscles: ["Lats", "Chest", "Quads", "Cardio"] },
  { id: "wod_amanda", name: "Amanda", category: "The Girls", format: "For Time", difficulty: "Elite", rxMale: "61 kg (135 lbs)", rxFemale: "43 kg (95 lbs)", timeCap: "12 mins", movements: ["9-7-5 Muscle-ups", "9-7-5 Squat Snatches"], description: "Elite gymnastics and barbell proficiency under intense heart rate.", targetMuscles: ["Lats", "Chest", "Shoulders", "Quads"] },
  { id: "wod_eva", name: "Eva", category: "The Girls", format: "5 Rounds For Time", difficulty: "Elite", rxMale: "32 kg KB (70 lbs)", rxFemale: "24 kg KB (53 lbs)", timeCap: "35 mins", movements: ["800m Run", "30 Heavy KB Swings", "30 Pull-ups"], description: "4 km total running + 150 KB swings + 150 pull-ups.", targetMuscles: ["Hamstrings", "Lats", "Cardio"] },
  { id: "wod_lynne", name: "Lynne", category: "The Girls", format: "5 Max Effort Rounds", difficulty: "Medium", rxMale: "BW Bench Press", rxFemale: "3/4 BW Bench", timeCap: "20 mins", movements: ["Max Reps Bodyweight Bench Press", "Max Reps Unbroken Pull-ups"], description: "Pure muscular endurance and upper body pump benchmark.", targetMuscles: ["Chest", "Triceps", "Lats", "Biceps"] },
  { id: "wod_nicole", name: "Nicole", category: "The Girls", format: "20 min AMRAP", difficulty: "Medium", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "20 mins", movements: ["400m Run", "Max Reps Unbroken Pull-ups"], description: "Score is total pull-ups completed across all rounds.", targetMuscles: ["Lats", "Biceps", "Cardio"] },
  { id: "wod_kelly", name: "Kelly", category: "The Girls", format: "5 Rounds For Time", difficulty: "Hard", rxMale: "24in Box / 9kg Ball", rxFemale: "20in Box / 6kg Ball", timeCap: "30 mins", movements: ["400m Run", "30 Box Jumps", "30 Wall Balls"], description: "Pure hybrid leg burnout. 2 km running + 150 jumps + 150 wall balls.", targetMuscles: ["Quads", "Calves", "Shoulders", "Cardio"] },

  // HERO WODS
  { id: "wod_murph", name: "Murph", category: "Hero WODs", format: "For Time (Vest: 9kg/6kg)", difficulty: "Elite", rxMale: "9 kg (20 lbs) Vest", rxFemale: "6 kg (14 lbs) Vest", timeCap: "60 mins", movements: ["1 Mile Run (1.6 km)", "100 Pull-ups", "200 Push-ups", "300 Air Squats", "1 Mile Run (1.6 km)"], description: "The ultimate Memorial Day endurance test. Partition reps 5-10-15.", targetMuscles: ["Lats", "Chest", "Quads", "Cardio"] },
  { id: "wod_dt", name: "DT", category: "Hero WODs", format: "5 Rounds For Time", difficulty: "Hard", rxMale: "70 kg (155 lbs)", rxFemale: "48 kg (105 lbs)", timeCap: "15 mins", movements: ["12 Deadlifts", "9 Hang Power Cleans", "6 Push Jerks"], description: "Barbell cycling classic. Rest at rep 11 of deadlifts and rep 8 of cleans.", targetMuscles: ["Hamstrings", "Shoulders", "Glutes"] },
  { id: "wod_the_chief", name: "The Chief", category: "Hero WODs", format: "5 Cycles of 3m AMRAP", difficulty: "Medium", rxMale: "61 kg (135 lbs)", rxFemale: "43 kg (95 lbs)", timeCap: "19 mins", movements: ["3 Power Cleans", "6 Push-ups", "9 Air Squats"], description: "High speed interval pacing. Maximize total rounds completed across all 5 cycles.", targetMuscles: ["Quads", "Chest", "Hamstrings", "Cardio"] },
  { id: "wod_nate", name: "Nate", category: "Hero WODs", format: "20 min AMRAP", difficulty: "Elite", rxMale: "32 kg KB (70 lbs)", rxFemale: "24 kg KB (53 lbs)", timeCap: "20 mins", movements: ["2 Ring Muscle-ups", "4 Handstand Push-ups", "8 Heavy KB Swings"], description: "Demanding gymnastic efficiency under heavy posterior chain load.", targetMuscles: ["Lats", "Shoulders", "Hamstrings"] },
  { id: "wod_badger", name: "Badger", category: "Hero WODs", format: "3 Rounds For Time", difficulty: "Hard", rxMale: "43 kg (95 lbs)", rxFemale: "30 kg (65 lbs)", timeCap: "25 mins", movements: ["30 Squat Cleans", "30 Pull-ups", "800m Run"], description: "Brutal whole-body grind test. Pacing is mandatory on the squat cleans.", targetMuscles: ["Quads", "Lats", "Glutes", "Cardio"] },
  { id: "wod_randy", name: "Randy", category: "Hero WODs", format: "For Time", difficulty: "Medium", rxMale: "34 kg (75 lbs)", rxFemale: "25 kg (55 lbs)", timeCap: "10 mins", movements: ["75 Power Snatches for time"], description: "Lightning-fast light barbell snatch sprint. Sub-4 minutes is world class.", targetMuscles: ["Shoulders", "Hamstrings", "Lower Back"] },
  { id: "wod_chad", name: "Chad 1000X", category: "Hero WODs", format: "For Time (Vest: 20kg/15kg)", difficulty: "Elite", rxMale: "20 kg Backpack / 20in Box", rxFemale: "15 kg Backpack / 20in Box", timeCap: "75 mins", movements: ["1,000 Weighted Box Step-ups for time"], description: "Pure mental resilience and eccentric hamstring/quad fatigue endurance test.", targetMuscles: ["Quads", "Glutes", "Calves", "Core"] },
  { id: "wod_glen", name: "Glen", category: "Hero WODs", format: "For Time", difficulty: "Elite", rxMale: "61 kg (135 lbs)", rxFemale: "43 kg (95 lbs)", timeCap: "45 mins", movements: ["30 Clean & Jerks", "1 Mile Run", "10 Burpee Muscle-ups", "1 Mile Run", "100 Burpees"], description: "Epic marathon hybrid workout testing total psychological resilience.", targetMuscles: ["Whole Body", "Cardio", "Shoulders", "Lats"] },
  { id: "wod_loredo", name: "Loredo", category: "Hero WODs", format: "6 Rounds For Time", difficulty: "Medium", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "25 mins", movements: ["24 Air Squats", "24 Push-ups", "24 Walking Lunges", "400m Run"], description: "High volume lower body burn paired with aerobic pacing.", targetMuscles: ["Quads", "Glutes", "Chest", "Cardio"] },
  { id: "wod_holleyman", name: "Holleyman", category: "Hero WODs", format: "30 Rounds For Time", difficulty: "Elite", rxMale: "102 kg DL / 225 lbs Clean", rxFemale: "70 kg Clean", timeCap: "35 mins", movements: ["5 Wall Balls", "3 Handstand Push-ups", "1 Heavy Power Clean"], description: "30 micro-rounds of heavy power and gymnastics.", targetMuscles: ["Quads", "Shoulders", "Hamstrings"] },
  { id: "wod_kalsu", name: "Kalsu", category: "Hero WODs", format: "For Time", difficulty: "Elite", rxMale: "61 kg Thrusters (135 lbs)", rxFemale: "43 kg Thrusters (95 lbs)", timeCap: "45 mins", movements: ["100 Thrusters for time", "On the minute every minute (EMOM): 5 Burpees starting at 0:00"], description: "Widely regarded as one of the hardest CrossFit workouts ever created.", targetMuscles: ["Quads", "Shoulders", "Chest", "Cardio"] },
  { id: "wod_clovis", name: "Clovis", category: "Hero WODs", format: "For Time", difficulty: "Elite", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "90 mins", movements: ["10 Mile Run (16 km)", "150 Burpee Pull-ups"], description: "Epic ultra-endurance test combining 16 km running with 150 burpee pull-ups.", targetMuscles: ["Cardio", "Lats", "Chest", "Quads"] },
  { id: "wod_lumberjack_20", name: "Lumberjack 20", category: "Hero WODs", format: "For Time", difficulty: "Hard", rxMale: "125 kg DL / 52 kg OHS / 24in Box", rxFemale: "84 kg DL / 34 kg OHS / 20in Box", timeCap: "35 mins", movements: ["20 Deadlifts", "400m Run", "20 KB Swings (32kg)", "400m Run", "20 Overhead Squats", "400m Run", "20 Burpees", "400m Run", "20 Chest-to-Bar Pull-ups", "400m Run", "20 Box Jumps", "400m Run", "20 DB Squat Cleans", "400m Run"], description: "Hero test featuring 20 reps of 7 heavy movements interleaved with 400m runs.", targetMuscles: ["Whole Body", "Cardio", "Hamstrings", "Quads", "Lats"] },

  // HYROX & HYBRID
  { id: "wod_hyrox_open_sim", name: "Hyrox Championship Simulation", category: "Hyrox & Hybrid", format: "For Time", difficulty: "Elite", rxMale: "Standard Hyrox Open Weights", rxFemale: "Standard Hyrox Open Weights", timeCap: "75 mins", movements: ["1 km Run + 1000m SkiErg", "1 km Run + 50m Sled Push (102kg)", "1 km Run + 50m Sled Pull (78kg)", "1 km Run + 80m Burpee Broad Jumps", "1 km Run + 1000m Row", "1 km Run + 200m Farmers Carry (2x24kg)", "1 km Run + 100m Sandbag Lunges (20kg)", "1 km Run + 100 Wall Balls (6kg)"], description: "The gold standard 8 x 1km running plus functional station championship event.", targetMuscles: ["Whole Body", "Cardio", "Quads", "Lats"] },
  { id: "wod_hyrox_half_sim", name: "Hyrox Half-Distance Workout", category: "Hyrox & Hybrid", format: "For Time", difficulty: "Hard", rxMale: "Standard Hyrox Weights", rxFemale: "Standard Hyrox Weights", timeCap: "45 mins", movements: ["500m Run + 500m SkiErg", "500m Run + 25m Sled Push", "500m Run + 25m Sled Pull", "500m Run + 40m Burpee Broad Jumps", "500m Run + 500m Row", "500m Run + 100m Farmers Carry", "500m Run + 50m Sandbag Lunges", "500m Run + 50 Wall Balls"], description: "Half distance simulation perfect for weekly aerobic conditioning.", targetMuscles: ["Whole Body", "Cardio", "Quads", "Glutes"] },
  { id: "wod_hyrox_doubles_sim", name: "Hyrox Doubles Simulation", category: "Hyrox & Hybrid", format: "For Time", difficulty: "Hard", rxMale: "Standard Doubles Weights", rxFemale: "Standard Doubles Weights", timeCap: "60 mins", movements: ["1 km Run together", "1000m SkiErg (Split 500m)", "1 km Run together", "50m Sled Push (Split 25m)", "1 km Run together", "50m Sled Pull (Split 25m)", "1 km Run together", "80m Burpee Broad Jumps (Split 40m)", "1 km Run together", "1000m Row (Split 500m)", "1 km Run together", "200m Farmers Carry (Split 100m)", "1 km Run together", "100m Sandbag Lunges (Split 50m)", "1 km Run together", "100 Wall Balls (Split 50)"], description: "Official Hyrox Doubles championship format simulation testing team pacing.", targetMuscles: ["Whole Body", "Cardio", "Quads", "Lats", "Shoulders"] },
  { id: "wod_5k_chipper", name: "Dino 5K Chipper", category: "Hyrox & Hybrid", format: "For Time", difficulty: "Hard", rxMale: "10 kg Med Ball / TRX", rxFemale: "8 kg Med Ball / TRX", timeCap: "40 mins", movements: ["1 km Run", "50 Burpees", "1 km Run", "50 Med Ball Slams", "1 km Run", "50 Hanging Knee Raises", "1 km Run", "50 Inverted Rows", "1 km Finish Run"], description: "5 km of compromised running mixed with 200 functional bodyweight reps.", targetMuscles: ["Whole Body", "Cardio", "Core", "Quads"] },
  { id: "wod_sled_burpee_gauntlet", name: "Sled & Burpee Gauntlet", category: "Hyrox & Hybrid", format: "4 Rounds For Time", difficulty: "Hard", rxMale: "100 kg Sled / 2x24 kg KB", rxFemale: "75 kg Sled / 2x16 kg KB", timeCap: "30 mins", movements: ["50m Heavy Sled Push", "20 Burpee Box Jump Overs", "50m Sled Drag", "100m Farmers Carry", "400m Fast Run"], description: "Develops brutal locomotive horsepower and mental resilience.", targetMuscles: ["Quads", "Calves", "Glutes", "Cardio"] },
  { id: "wod_wallball_death", name: "Wall Ball & Row Pyramids", category: "Hyrox & Hybrid", format: "For Time", difficulty: "Medium", rxMale: "9 kg Ball", rxFemale: "6 kg Ball", timeCap: "22 mins", movements: ["500m Row - 50 Wall Balls", "400m Row - 40 Wall Balls", "300m Row - 30 Wall Balls", "200m Row - 20 Wall Balls", "100m Row - 10 Wall Balls"], description: "Descending sprint pyramid. Maintain high stroke power on the rower.", targetMuscles: ["Quads", "Shoulders", "Lats", "Cardio"] },
  { id: "wod_ski_lunge_burner", name: "SkiErg & Sandbag Burner", category: "Hyrox & Hybrid", format: "5 Rounds For Time", difficulty: "Hard", rxMale: "20 kg Sandbag", rxFemale: "15 kg Sandbag", timeCap: "28 mins", movements: ["400m SkiErg", "30m Sandbag Walking Lunges", "15 Toes-to-Bar", "200m Sprint"], description: "Simulates the demanding final stations of a Hyrox championship.", targetMuscles: ["Lats", "Quads", "Glutes", "Core"] },

  // AMRAPS & CHIPPERS
  { id: "wod_fight_gone_bad", name: "Fight Gone Bad", category: "AMRAPs & EMOMs", format: "3 Rounds (1m per station, 1m rest)", difficulty: "Hard", rxMale: "34 kg PP / 9 kg WB / 20 in Box / 16 kg SDHP", rxFemale: "25 kg PP / 6 kg WB / 20 in Box / 12 kg SDHP", timeCap: "17 mins", movements: ["1 min Wall Balls", "1 min Sumo Deadlift High-Pulls", "1 min Box Jumps", "1 min Push Press", "1 min Row (Calories)", "1 min Rest"], description: "Classic MMA conditioning test. Maximize total reps across all 3 rounds.", targetMuscles: ["Whole Body", "Cardio", "Quads", "Shoulders"] },
  { id: "wod_filthy_fifty", name: "Filthy Fifty", category: "Chippers", format: "For Time", difficulty: "Elite", rxMale: "24 in Box / 16 kg KB / 20 kg Barbell", rxFemale: "20 in Box / 12 kg KB / 15 kg Barbell", timeCap: "35 mins", movements: ["50 Box Jumps", "50 Jumping Pull-ups", "50 KB Swings", "50 Walking Lunges", "50 Knees-to-Elbows", "50 Push Press", "50 Back Extensions", "50 Wall Balls", "50 Burpees", "50 Double Unders"], description: "Legendary 500-rep mega chipper. Test of pure cardiovascular grit.", targetMuscles: ["Whole Body", "Cardio", "Quads", "Core"] },
  { id: "wod_the_300", name: "The 300 Workout", category: "Chippers", format: "For Time", difficulty: "Hard", rxMale: "61 kg DL / 16 kg KB / 24 in Box", rxFemale: "43 kg DL / 12 kg KB / 20 in Box", timeCap: "25 mins", movements: ["25 Pull-ups", "50 Deadlifts", "50 Push-ups", "50 Box Jumps", "50 Floor Wipers", "50 KB Clean & Press", "25 Pull-ups"], description: "Spartan strength and body composition conditioning challenge.", targetMuscles: ["Lats", "Chest", "Hamstrings", "Shoulders", "Core"] },
  { id: "wod_tabata_this", name: "Tabata This!", category: "AMRAPs & EMOMs", format: "Tabata (20s on / 10s off x 8 rounds)", difficulty: "Medium", rxMale: "Bodyweight & Rower", rxFemale: "Bodyweight & Rower", timeCap: "24 mins", movements: ["Tabata Row (Calories)", "Tabata Air Squats", "Tabata Pull-ups", "Tabata Push-ups", "Tabata Sit-ups"], description: "1 min rest between movements. Score is the sum of lowest reps in each movement.", targetMuscles: ["Whole Body", "Cardio", "Quads", "Chest", "Lats"] },
  { id: "wod_death_by_burpees", name: "Death By Burpees", category: "AMRAPs & EMOMs", format: "EMOM until failure", difficulty: "Hard", rxMale: "Chest to ground", rxFemale: "Chest to ground", timeCap: "20 mins", movements: ["Min 1: 1 Burpee", "Min 2: 2 Burpees", "Min 3: 3 Burpees", "... continue until you cannot finish in the minute"], description: "Mental toughness test. Reaching minute 16+ is exceptional.", targetMuscles: ["Chest", "Quads", "Cardio", "Shoulders"] },
  { id: "wod_barbell_blitz_1", name: "Barbell Blitz #1", category: "The Girls", format: "5 Rounds For Time", difficulty: "Hard", rxMale: "50 kg Barbell", rxFemale: "35 kg Barbell", timeCap: "18 mins", movements: ["10 Hang Power Cleans", "10 Front Squats", "10 Push Press"], description: "High-intensity barbell cycling circuit.", targetMuscles: ["Quads", "Shoulders", "Upper Back"] },
  { id: "wod_dumbbell_devil_1", name: "Dumbbell Devil #1", category: "The Girls", format: "18 min AMRAP", difficulty: "Hard", rxMale: "2x15 kg DBs", rxFemale: "2x10 kg DBs", timeCap: "18 mins", movements: ["8 Devil Press", "12 DB Thrusters", "16 Renegade Rows"], description: "Dumbbell power circuit building grip and shoulder endurance.", targetMuscles: ["Chest", "Shoulders", "Lats", "Core"] },
  { id: "wod_kettlebell_storm_1", name: "Kettlebell Storm #1", category: "The Girls", format: "5 Rounds For Time", difficulty: "Medium", rxMale: "24 kg KB", rxFemale: "16 kg KB", timeCap: "20 mins", movements: ["15 KB Snatches/bên", "15 Goblet Squats", "20 KB Swings"], description: "Posterior chain horsepower and hip snap development.", targetMuscles: ["Hamstrings", "Quads", "Shoulders"] },
  { id: "wod_engine_blitz_1", name: "Cardio Engine Blitz #1", category: "Hyrox & Hybrid", format: "4 Rounds For Time", difficulty: "Medium", rxMale: "Standard Erg", rxFemale: "Standard Erg", timeCap: "25 mins", movements: ["500m Row", "400m Run", "50 Double Unders"], description: "Pure aerobic engine builder.", targetMuscles: ["Cardio", "Calves", "Lats"] },
  { id: "wod_core_crusher_1", name: "Core Crusher Chipper #1", category: "Chippers", format: "For Time", difficulty: "Medium", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "15 mins", movements: ["30 Toes-to-Bar", "40 AbMat Sit-ups", "50 Hollow Rocks", "60s Plank"], description: "Trunk and pelvic stability challenge.", targetMuscles: ["Core", "Hip Flexors"] },
  { id: "wod_bodyweight_burn_1", name: "Bodyweight Burn Hell #1", category: "The Girls", format: "4 Rounds For Time", difficulty: "Hard", rxMale: "Bodyweight", rxFemale: "Bodyweight", timeCap: "20 mins", movements: ["12 Handstand Push-ups", "20 Box Jumps", "15 Chest-to-Bar Pull-ups"], description: "Gymnastics prowess under leg fatigue.", targetMuscles: ["Shoulders", "Lats", "Quads"] },
  { id: "wod_heavy_metal_1", name: "Heavy Metal Triad #1", category: "Hero WODs", format: "5 Rounds For Time", difficulty: "Hard", rxMale: "100 kg DL / 70 kg Bench", rxFemale: "70 kg DL / 45 kg Bench", timeCap: "22 mins", movements: ["8 Deadlifts", "8 Flat Bench Press", "8 Strict Pull-ups"], description: "Heavy strength grit testing maximum tension.", targetMuscles: ["Hamstrings", "Chest", "Lats"] }
];

// =========================================================================
// 4. NASM CORRECTIVE EXERCISE CONTINUUM (MUTUALLY EXCLUSIVE DEVIATIONS)
// =========================================================================
const NASM_CEX_DATABASE = {
  // Categorized by Anatomical Regions (Mutually exclusive within each radio group)
  deviationGroups: [
    {
      groupKey: "pelvis",
      groupTitle: "1. Độ Nghiêng Khung Chậu (Pelvic Alignment)",
      options: [
        { id: "pelvis_none", name: "Khung chậu cân bằng (Bình thường)", isNone: true },
        { id: "pelvis_apt", name: "Anterior Pelvic Tilt - APT (Võng lưng dưới, bụng ưỡn, mông vểnh)", overactive: ["Hip Flexors (Psoas/TFL)", "Rectus Femoris", "Erector Spinae", "Latissimus Dorsi"], underactive: ["Gluteus Maximus", "Gluteus Medius", "Transverse Abdominis", "Hamstrings"] },
        { id: "pelvis_ppt", name: "Posterior Pelvic Tilt - PPT (Lưng phẳng, mông cụp, mất cong thắt lưng)", overactive: ["Hamstrings", "Rectus Abdominis", "Adductor Magnus"], underactive: ["Iliopsoas", "Erector Spinae", "Gluteus Medius", "Quadratus Lumborum"] }
      ]
    },
    {
      groupKey: "upper",
      groupTitle: "2. Tư Thế Cổ & Vai Thân Trên (Upper Body Posture)",
      options: [
        { id: "upper_none", name: "Cổ vai bình thường", isNone: true },
        { id: "upper_forward_head", name: "Forward Head Posture (Đầu & cằm nhô ra trước)", overactive: ["Upper Trapezius", "Levator Scapulae", "Sternocleidomastoid"], underactive: ["Deep Cervical Flexors", "Lower Trapezius"] },
        { id: "upper_rounded_shoulders", name: "Rounded Shoulders & Kyphosis (Gù lưng, vai cuộn tròn ra trước)", overactive: ["Pectoralis Minor", "Pectoralis Major", "Anterior Deltoid", "Latissimus Dorsi"], underactive: ["Rhomboids", "Middle & Lower Trapezius", "Serratus Anterior", "Posterior Deltoid"] }
      ]
    },
    {
      groupKey: "lower",
      groupTitle: "3. Khớp Gối & Cổ Chân (Lower Kinetic Chain)",
      options: [
        { id: "lower_none", name: "Khớp gối & cổ chân bình thường", isNone: true },
        { id: "lower_knee_valgus", name: "Knee Valgus / Pronation (Gối sụp vào trong, bàn chân bẹt)", overactive: ["Adductor Complex", "TFL / IT Band", "Biceps Femoris (Short Head)", "Peroneals"], underactive: ["Gluteus Medius", "Gluteus Maximus", "Vastus Medialis Oblique (VMO)", "Anterior Tibialis"] },
        { id: "lower_tight_calves", name: "Tight Calves & Achilles Strain (Bắp chuối bó cứng, hạn chế gập cổ chân)", overactive: ["Gastrocnemius", "Soleus"], underactive: ["Anterior Tibialis", "Intrinsic Foot Muscles"] }
      ]
    }
  ],

  // Specific 4-Step NASM Protocol Mapping Generator
  generateRoutine: function(selectedDevIds, workoutType) {
    let overactiveList = [];
    let underactiveList = [];

    this.deviationGroups.forEach(grp => {
      grp.options.forEach(opt => {
        if (selectedDevIds.includes(opt.id) && !opt.isNone) {
          if (opt.overactive) overactiveList.push(...opt.overactive);
          if (opt.underactive) underactiveList.push(...opt.underactive);
        }
      });
    });

    // Default fallbacks if none selected
    if (overactiveList.length === 0) overactiveList = ["Upper Trapezius", "Hip Flexors", "Calves"];
    if (underactiveList.length === 0) underactiveList = ["Gluteus Medius", "Lower Trapezius", "Core"];

    const isAPT = selectedDevIds.includes("pelvis_apt");
    const isPPT = selectedDevIds.includes("pelvis_ppt");
    const isRounded = selectedDevIds.includes("upper_rounded_shoulders");
    const isValgus = selectedDevIds.includes("lower_knee_valgus");

    // 1. INHIBIT (SMR / Foam Rolling)
    const inhibitStep = isAPT 
      ? { name: "SMR TFL, Psoas & Dải Chậu Chày ITB", muscles: "Hip Flexors, TFL, IT Band", durationSec: 60, cue: "Đặt bóng/con lăn vào góc ngoài háng và trước đùi, giữ 45-60s tại điểm căng cứng để giải tỏa co thắt khung chậu." }
      : isPPT
      ? { name: "SMR Hamstrings & Bắp Đùi Sau", muscles: "Hamstrings, Biceps Femoris", durationSec: 60, cue: "Lăn chậm cơ đùi sau từ ụ ngồi đến khoeo chân, dừng 45s tại điểm thắt nút cơ." }
      : isRounded
      ? { name: "SMR Lacrosse Ball Pectoralis Minor (Ngực bé)", muscles: "Pectoralis Minor, Anterior Deltoid", durationSec: 45, cue: "Đặt bóng cao su vào góc nách ngực trên, áp vào tường giữ 45s để mở rộng khớp vai." }
      : { name: "SMR Bắp Chuối & Cơ Thang Cổ", muscles: "Gastrocnemius, Upper Traps", durationSec: 45, cue: "Lăn giải tỏa bắp chân và cơ thang cổ vai 45s mỗi bên." };

    // 2. LENGTHEN (Static & Neuromuscular Stretches)
    const lengthenStep = isAPT
      ? { name: "Couch Stretch (Kneeling Hip Flexor Stretch)", muscles: "Psoas, Rectus Femoris", durationSec: 30, cue: "Quỳ 1 chân tựa chân sau lên ghế/tường, siết chặt mông cùng bên và đẩy hông về trước giữ 30s." }
      : isPPT
      ? { name: "Seated Single-Leg Hamstring Stretch", muscles: "Hamstrings, Adductors", durationSec: 30, cue: "Ngồi thẳng lưng, vươn ngực về phía mũi chân cảm nhận gân kheo giãn sâu 30s." }
      : isRounded
      ? { name: "Doorway Corner Pec Stretch (Giãn ngực qua khung cửa)", muscles: "Pectoralis Major & Minor", durationSec: 30, cue: "Đặt cùi chỏ lên khung cửa ở góc 90 độ, bước 1 chân lên trước cảm nhận lồng ngực mở rộng." }
      : { name: "Wall Calf Stretch (Kéo giãn bắp chuối)", muscles: "Calves, Achilles", durationSec: 30, cue: "Chống tay vào tường, chân sau thẳng gót chạm sàn giữ 30s." };

    // 3. ACTIVATE (Isolated Strengthening)
    const activateStep = isValgus || isAPT
      ? { name: "Banded Clamshells / Side-Lying Abduction", muscles: "Gluteus Medius, Gluteus Maximus", durationSec: 45, cue: "Nằm nghiêng đeo dây miniband trên gối, mở gối lên giữ 2s đỉnh co thắt, khóa cố định khung chậu." }
      : isPPT
      ? { name: "Single-Leg Glute Bridge với Hip Flexor Lock", muscles: "Gluteus Maximus, Iliopsoas", durationSec: 45, cue: "Nằm ngửa ấn gót chân nâng hông siết chặt mông 2s đỉnh, phục hồi đường cong sinh lý cột sống." }
      : isRounded
      ? { name: "Wall Angels / Y-T-W Scapular Raises", muscles: "Lower Trapezius, Rhomboids, Serratus", durationSec: 45, cue: "Áp sát lưng, đầu và cùi chỏ vào tường, trượt tay lên cao hình chữ Y mà không ưỡn lưng dưới." }
      : { name: "Deep Neck Flexor Chin Tucks & Wall Angels", muscles: "Deep Neck Flexors, Lower Traps", durationSec: 45, cue: "Thu cằm ra sau như tạo cằm đôi, giữ 2s đỉnh co thắt." };

    // 4. INTEGRATE (Dynamic Functional Movement)
    const integrateStep = (workoutType === "run" || isValgus)
      ? { name: "Single-Leg RDL to High Knee Balance", muscles: "Kinetic Chain, Glutes & Balance", durationSec: 60, cue: "Đứng 1 chân, gập hông vươn tay về trước rồi đứng dậy nâng cao đùi giữ thăng bằng 2 giây." }
      : (workoutType === "upper" || isRounded)
      ? { name: "Band Pull-Apart to Overhead Squat", muscles: "Thoracic Spine, Lats & Shoulders", durationSec: 60, cue: "Kéo giãn dây kháng lực ngang ngực đồng thời thực hiện squat có kiểm soát." }
      : { name: "Broomstick / Band Overhead Squat to Stand", muscles: "Whole Body Kinetic Sling", durationSec: 60, cue: "Giữ gậy thẳng trên đầu, squat sâu mở gối và ngực thẳng, đứng dậy thở ra có kiểm soát." };

    return [
      { stepNum: 1, stepName: "1. INHIBIT (Ức chế - SMR)", ex: inhibitStep },
      { stepNum: 2, stepName: "2. LENGTHEN (Kéo giãn tĩnh 30s)", ex: lengthenStep },
      { stepNum: 3, stepName: "3. ACTIVATE (Kích hoạt cơ yếu)", ex: activateStep },
      { stepNum: 4, stepName: "4. INTEGRATE (Tích hợp chuỗi vận động)", ex: integrateStep }
    ];
  }
};

// Muscle Mapping for 3D Heatmap Highlighting
const ANATOMY_MUSCLE_MAP = {
  Quads: ["quad_left", "quad_right"],
  Hamstrings: ["ham_left", "ham_right"],
  Glutes: ["glute_left", "glute_right"],
  Chest: ["pec_left", "pec_right"],
  Lats: ["lat_left", "lat_right"],
  "Upper Back": ["traps_upper"],
  Shoulders: ["delt_front_left", "delt_front_right"],
  Biceps: ["biceps_left", "biceps_right"],
  Triceps: ["triceps_left", "triceps_right"],
  Calves: ["calf_left", "calf_right", "calf_front_left", "calf_front_right"],
  Core: ["abs_upper", "abs_lower"]
};

if (typeof window !== "undefined") {
  window.DEFAULT_PROGRAMS = DEFAULT_PROGRAMS;
  window.EXERCISE_LIBRARY = EXERCISE_LIBRARY;
  window.CROSSFIT_WOD_DATABASE = CROSSFIT_WOD_DATABASE;
  window.NASM_CEX_DATABASE = NASM_CEX_DATABASE;
  window.ANATOMY_MUSCLE_MAP = ANATOMY_MUSCLE_MAP;
}

// =========================================================================
// GLOBAL EXPORTS & RUNTIME ATTACHMENT (DINO-005A)
// =========================================================================
if (typeof window !== "undefined") {
  window.DEFAULT_PROGRAMS = DEFAULT_PROGRAMS;
  window.EXERCISE_LIBRARY = EXERCISE_LIBRARY;
  window.MOVEMENT_PATTERNS = MOVEMENT_PATTERNS;
  window.TRAINING_TYPES = TRAINING_TYPES;
  window.EQUIPMENT_TYPES = EQUIPMENT_TYPES;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DEFAULT_PROGRAMS,
    EXERCISE_LIBRARY,
    CROSSFIT_WOD_DATABASE,
    NASM_CEX_DATABASE,
    ANATOMY_MUSCLE_MAP,
    MOVEMENT_PATTERNS,
    TRAINING_TYPES,
    EQUIPMENT_TYPES
  };
}
