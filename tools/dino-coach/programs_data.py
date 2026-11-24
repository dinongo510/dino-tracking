# 3 mẫu giai đoạn 4 tuần (tuần 1 soạn tay; tuần 2–4 sinh bằng formulas.generateWeek, tuần 4 deload)
# item: (tên Việt bài, sets, reps_min, reps_max, tải {"rpe":x} | {"pct":x} | {}, rest_sec, rule, extra)
DBL = {"type": "double", "upper_kg": 2.5, "lower_kg": 5}
LIN = {"type": "linear_weekly", "step_kg": 2.5}
NONE = {"type": "none"}

def it(ex, sets, rmin, rmax, load=None, rest=90, rule=DBL, **extra):
    return {"exercise": ex, "sets": sets, "reps_min": rmin, "reps_max": rmax, **(load or {}), "rest_sec": rest, "progression_rule": rule, **extra}

WARM = {"type": "corrective", "label": "Khởi động", "note": "Hoặc thay bằng khối 'Lấy từ OHSA' của khách", "items": [
    it("World's greatest stretch", 1, 5, 5, rest=0, rule=NONE, note="mỗi bên"),
    it("Đổi hông 90/90", 1, 6, 6, rest=0, rule=NONE),
    it("Kéo giãn band trước ngực", 1, 15, 15, rest=0, rule=NONE)]}

P = [
{
 "name": "Giảm mỡ – Nền tảng (Full body 3 buổi)", "goal": "fat_loss", "model": "linear", "weeks": 4,
 "handover_note": "Ưu tiên kỹ thuật và thói quen. RPE 7–8, chưa đi đến kiệt sức. Đi bộ 8.000 bước/ngày.",
 "sessions": [
  {"day": 1, "title": "Full body A", "type": "strength", "blocks": [WARM,
    {"type": "straight", "label": "A", "items": [it("Goblet squat", 3, 8, 12, {"target_rpe": 7})]},
    {"type": "superset", "label": "B", "items": [it("Đẩy ngực tạ đơn", 3, 8, 12, {"target_rpe": 7}, 60), it("Chèo tạ đơn một tay", 3, 10, 12, {"target_rpe": 7}, 60)]},
    {"type": "superset", "label": "C", "items": [it("Romanian deadlift", 3, 10, 12, {"target_rpe": 7}, 60), it("Dead bug", 3, 8, 10, rest=45, rule=NONE)]},
    {"type": "circuit", "label": "Finisher", "rounds": 3, "work_sec": 40, "rest_sec": 20, "items": [it("Xe đạp gió (Assault bike)", 1, 1, 1, rest=0, rule=NONE), it("Leo núi", 1, 1, 1, rest=0, rule=NONE)]}]},
  {"day": 2, "title": "Full body B", "type": "strength", "blocks": [WARM,
    {"type": "straight", "label": "A", "items": [it("Hip thrust tạ đòn", 3, 10, 12, {"target_rpe": 7})]},
    {"type": "superset", "label": "B", "items": [it("Kéo xô rộng", 3, 10, 12, {"target_rpe": 7}, 60), it("Đẩy vai ngồi tạ đơn", 3, 8, 12, {"target_rpe": 7}, 60)]},
    {"type": "superset", "label": "C", "items": [it("Lunge lùi", 3, 8, 10, {"target_rpe": 7}, 60, note="mỗi chân"), it("Plank nghiêng", 3, 30, 30, rest=30, rule=NONE, note="giây mỗi bên")]},
    {"type": "run", "label": "Cardio", "items": [it("Chạy nhẹ (Zone 2)", 1, 1, 1, rest=0, rule=NONE, duration_sec=1200, hr_zone=2)]}]},
  {"day": 3, "title": "Full body C + Circuit", "type": "mixed", "blocks": [WARM,
    {"type": "straight", "label": "A", "items": [it("Deadlift thanh lục giác", 3, 6, 8, {"target_rpe": 7}, 120)]},
    {"type": "superset", "label": "B", "items": [it("Hít đất", 3, 8, 15, rest=60, rule=NONE), it("Chèo cáp ngồi", 3, 10, 12, {"target_rpe": 7}, 60)]},
    {"type": "circuit", "label": "C", "rounds": 4, "work_sec": 40, "rest_sec": 20, "items": [
       it("Vung tạ ấm", 1, 1, 1, rest=0, rule=NONE), it("Bước bục tạ đơn", 1, 1, 1, rest=0, rule=NONE),
       it("Đập bóng tạ", 1, 1, 1, rest=0, rule=NONE), it("Ôm tạ trước ngực đi bộ", 1, 1, 1, rest=60, rule=NONE)]}]},
 ]},
{
 "name": "Tăng cơ – Upper/Lower DUP 4 buổi", "goal": "muscle_gain", "model": "undulating", "weeks": 4,
 "handover_note": "Mỗi nhóm cơ 2 lần/tuần, ngày nặng – ngày nhẹ xen kẽ. Ăn đủ kcal và protein là điều kiện bắt buộc.",
 "sessions": [
  {"day": 1, "title": "Upper – Nặng", "type": "strength", "blocks": [
    {"type": "straight", "label": "A", "items": [it("Đẩy ngực tạ đòn", 4, 4, 6, {"target_rpe": 8}, 180, LIN)]},
    {"type": "straight", "label": "B", "items": [it("Chèo tạ đòn", 4, 6, 8, {"target_rpe": 8}, 150)]},
    {"type": "superset", "label": "C", "items": [it("Đẩy vai đứng tạ đòn", 3, 6, 8, {"target_rpe": 8}, 90), it("Hít xà ngửa tay", 3, 6, 10, rest=90, rule=NONE)]},
    {"type": "superset", "label": "D", "items": [it("Cuốn tay búa", 3, 10, 12, {"target_rpe": 8}, 60), it("Đè tay sau cáp", 3, 10, 12, {"target_rpe": 8}, 60)]}]},
  {"day": 2, "title": "Lower – Nặng", "type": "strength", "blocks": [
    {"type": "straight", "label": "A", "items": [it("Squat tạ đòn sau lưng", 4, 4, 6, {"target_rpe": 8}, 180, LIN)]},
    {"type": "straight", "label": "B", "items": [it("Romanian deadlift", 3, 6, 8, {"target_rpe": 8}, 150)]},
    {"type": "superset", "label": "C", "items": [it("Bulgarian split squat", 3, 8, 10, {"target_rpe": 8}, 90, note="mỗi chân"), it("Cuộn đùi nằm", 3, 10, 12, {"target_rpe": 8}, 60)]},
    {"type": "superset", "label": "D", "items": [it("Nhón gót đứng", 3, 10, 15, {"target_rpe": 8}, 45), it("Nâng gối treo xà", 3, 10, 15, rest=45, rule=NONE)]}]},
  {"day": 4, "title": "Upper – Nhẹ (khối lượng)", "type": "strength", "blocks": [
    {"type": "straight", "label": "A", "items": [it("Đẩy ngực dốc lên tạ đơn", 3, 10, 12, {"target_rpe": 8}, 90)]},
    {"type": "straight", "label": "B", "items": [it("Kéo xô rộng", 3, 10, 12, {"target_rpe": 8}, 90)]},
    {"type": "superset", "label": "C", "items": [it("Dang vai tạ đơn", 3, 12, 15, {"target_rpe": 9}, 45), it("Face pull", 3, 12, 15, {"target_rpe": 8}, 45)]},
    {"type": "superset", "label": "D", "items": [it("Ép ngực cáp", 3, 12, 15, {"target_rpe": 9}, 45), it("Cuốn tay cáp", 3, 12, 15, {"target_rpe": 9}, 45)]}]},
  {"day": 5, "title": "Lower – Nhẹ (khối lượng)", "type": "strength", "blocks": [
    {"type": "straight", "label": "A", "items": [it("Đạp đùi máy", 3, 10, 15, {"target_rpe": 8}, 90)]},
    {"type": "straight", "label": "B", "items": [it("Hip thrust tạ đòn", 3, 10, 12, {"target_rpe": 8}, 90)]},
    {"type": "superset", "label": "C", "items": [it("Đá đùi máy", 3, 12, 15, {"target_rpe": 9}, 45), it("Cuộn đùi ngồi", 3, 12, 15, {"target_rpe": 9}, 45)]},
    {"type": "superset", "label": "D", "items": [it("Dạng hông máy", 2, 15, 20, {"target_rpe": 9}, 45), it("Gập bụng cáp quỳ", 3, 12, 15, rest=45, rule=NONE)]}]},
 ]},
{
 "name": "HYROX – Xây nền 4 buổi (2 sức mạnh + 2 chạy/station)", "goal": "performance", "model": "block", "weeks": 4,
 "handover_note": "Tích lũy: nền aerobic + sức mạnh đủ dùng cho sled và lunge. Chạy easy thật sự easy (Zone 2). Tăng km ≤ 10%/tuần.",
 "sessions": [
  {"day": 1, "title": "Sức mạnh – Thân dưới + Sled", "type": "strength", "blocks": [WARM,
    {"type": "straight", "label": "A", "items": [it("Squat tạ đòn trước ngực", 4, 5, 6, {"target_rpe": 7.5}, 150, LIN)]},
    {"type": "superset", "label": "B", "items": [it("Lunge bước tới (đi bộ)", 3, 10, 12, {"target_rpe": 8}, 60, note="mỗi chân"), it("Copenhagen plank", 3, 20, 20, rest=45, rule=NONE, note="giây mỗi bên")]},
    {"type": "hyrox", "label": "C", "rounds": 4, "rest_sec": 90, "items": [it("Đẩy sled 50 m", 1, 1, 1, rest=0, rule=NONE, distance_m=25), it("Kéo sled 50 m", 1, 1, 1, rest=0, rule=NONE, distance_m=25)]}]},
  {"day": 2, "title": "Chạy interval", "type": "run", "blocks": [
    {"type": "run", "label": "Khởi động", "items": [it("Chạy nhẹ (Zone 2)", 1, 1, 1, rest=0, rule=NONE, duration_sec=600, hr_zone=2)]},
    {"type": "run", "label": "Chính", "items": [it("Chạy interval", 6, 1, 1, rest=90, rule=NONE, distance_m=800, target_pace="pace 5–10K", note="nghỉ đi bộ 90 giây")]},
    {"type": "run", "label": "Thả lỏng", "items": [it("Chạy hồi phục", 1, 1, 1, rest=0, rule=NONE, duration_sec=600, hr_zone=1)]}]},
  {"day": 4, "title": "Sức mạnh – Thân trên + Kéo", "type": "strength", "blocks": [WARM,
    {"type": "straight", "label": "A", "items": [it("Deadlift tạ đòn", 4, 4, 5, {"target_rpe": 7.5}, 180, LIN)]},
    {"type": "superset", "label": "B", "items": [it("Hít xà sấp tay", 4, 5, 8, rest=90, rule=NONE), it("Đẩy vai ngồi tạ đơn", 4, 8, 10, {"target_rpe": 8}, 90)]},
    {"type": "superset", "label": "C", "items": [it("Chèo tạ đơn một tay", 3, 10, 12, {"target_rpe": 8}, 60), it("Xách tạ một bên đi bộ", 3, 1, 1, rest=60, rule=NONE, distance_m=40)]}]},
  {"day": 6, "title": "HYROX simulation nhẹ + chạy dài", "type": "hyrox", "blocks": [
    {"type": "hyrox", "label": "A", "rounds": 2, "rest_sec": 120, "note": "Tốc độ thi đấu 70%", "items": [
       it("Chạy compromised 1 km", 1, 1, 1, rest=0, rule=NONE, distance_m=1000), it("SkiErg 1000 m", 1, 1, 1, rest=0, rule=NONE, distance_m=500),
       it("Chạy compromised 1 km", 1, 1, 1, rest=0, rule=NONE, distance_m=1000), it("Chèo 1000 m", 1, 1, 1, rest=0, rule=NONE, distance_m=500),
       it("Chạy compromised 1 km", 1, 1, 1, rest=0, rule=NONE, distance_m=1000), it("Ném bóng tường 100 lần", 1, 30, 30, rest=0, rule=NONE)]},
    {"type": "run", "label": "B", "items": [it("Chạy dài", 1, 1, 1, rest=0, rule=NONE, duration_sec=2400, hr_zone=2)]}]},
 ]},
]
