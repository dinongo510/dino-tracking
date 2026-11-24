# DINO-011 → 013 — Dinh dưỡng · Check-in & Giai đoạn · Dashboard

**Trạng thái:** PROPOSED · **UAT:** Dino
**Dùng chung:** `/coach/js/lib/formulas.js` (đã có 13 bài kiểm thử Node pass — `node --test formulas.test.mjs`). AG **không viết lại công thức**, chỉ gọi hàm. Sửa công thức = Change Set riêng, Dino duyệt.

> Đọc `AGENTS.md` + `00_SYSTEM/`. Chỉ sửa `/coach/`, `/supabase/`. Mỗi Change Set duyệt và LOCK riêng.

---

## DINO-011 — Dinh dưỡng  (phụ thuộc 007)

**IN**
1. **Tính mục tiêu (Coach):** lấy cân mới nhất (`measurements` hoặc `inbody_scans`), FFM (nếu có InBody), tuổi từ `health_intakes.dob`, `activity_factor`, `goal` → `bmrAuto` → `tdee` → `nutritionTargets`. Hiện công thức đã dùng; Dino sửa tay kcal/P/C/F rồi **Duyệt** → ghi `nutrition_targets` (`status='approved'`, `valid_from`). Lịch sử các mức cũ giữ nguyên.
2. **Kho món (`foods`):** màn Coach thêm/sửa; dán CSV `name_vi;serving;kcal;protein;carb;fat;source` (xem trước rồi lưu). Nguồn tham khảo: Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng), USDA FoodData Central.
3. **Bữa & phương án:** Coach đặt các bữa (`meal_slots`, mặc định `DEFAULT_SLOTS`) → mỗi bữa thêm 2–4 phương án (`meal_options`: món + số khẩu phần). Hiện tổng (`optionTotals`) và nhãn ✓/✗ theo `optionFits`. Nút **"Gợi ý phương án"**: từ kho món, lấy 1 món đạm + 1 món tinh bột + 1 rau, tìm số khẩu phần (bước 0,5) để vừa khung → đưa 3 gợi ý cho Dino chọn.
4. **Khách:** tab "Ăn" — mục tiêu ngày (kcal, P/C/F), mỗi bữa chọn 1 phương án; check bữa: Đúng / Gần đúng / Lệch + ảnh (nén như DINO-007, thư mục `progress/<client_id>/meals/`) + ghi chú. Thanh tuân thủ tuần (`adherencePct`).
5. **Coach:** xem nhật ký ăn theo ngày (ảnh + mức), tuân thủ 7 ngày ở trang chi tiết khách.

6. **Kho có sẵn (migration `0004_nutrition_library.sql`, đã chạy thử):** 89 thực phẩm/món Việt (`foods`), 32 mẫu bữa (`meal_templates`), 6 thực đơn mẫu cả ngày (`day_plan_templates`). Màn Coach: chọn thực đơn mẫu hoặc mẫu bữa → **"Áp cho khách"** = chép sang `meal_slots`/`meal_options` của khách, nhân hệ số khẩu phần = kcal mục tiêu ÷ kcal mẫu (làm tròn bước 0,5 khẩu phần), Dino chỉnh sau.

**UAT:** (1) 3 khách mẫu: số liệu khớp bảng tính tay của Dino ±5 kcal · (2) Dán 20 món CSV → lưu đúng · (3) Gợi ý phương án ra 3 lựa chọn đều ✓ · (4) Khách check 4 bữa < 1 phút · (5) Khách A không thấy ảnh bữa ăn khách B.

---

## DINO-012 — Check-in tuần & Báo cáo giai đoạn  (phụ thuộc 010, 011)

**IN**
1. **Check-in tuần (Khách, Chủ nhật):** thẻ nhắc trên "Hôm nay" từ thứ 7. Form: cân TB tuần (tự điền từ `weeklyAvg` nếu khách cân hằng ngày, sửa được), ngủ / stress / năng lượng (1–5), "điều khó nhất tuần qua", ghi chú → `weekly_checkins`. Tự gắn: % buổi hoàn thành, % tuân thủ ăn.
2. **Coach trả lời** check-in (`coach_reply`) + chat theo ngữ cảnh `checkin`. Hiện **đề xuất kcal** từ `kcalAdjustment` (3 tuần cân TB + tuân thủ) với lý do; Dino bấm "Áp dụng" → tạo `nutrition_targets` mới (proposed → approved).
3. **Báo cáo giai đoạn** (mở khi giai đoạn còn ≤ 3 ngày hoặc Dino bấm): bảng so sánh đầu–cuối (cân, eo, hông, SMM, PBF, FFM), ảnh 2 mốc cạnh nhau, tổng buổi hoàn thành, top 3 bài tăng 1RM ước tính, tổng km chạy, tuân thủ ăn TB.
   - Coach viết `coach_summary` + `next_decisions`; khách viết `client_feedback`; cả hai bấm "Đồng ý" → `status='agreed'` → nút "Tạo giai đoạn tiếp" (chép cấu trúc giai đoạn cũ làm điểm xuất phát).
4. Nhắc khách cập nhật số đo / InBody / ảnh khi mở báo cáo nếu dữ liệu cuối giai đoạn chưa có.

**UAT:** (1) Khách làm check-in < 2 phút · (2) Kịch bản cân đứng 2 tuần, tuân thủ 90% → đề xuất −150 kcal · (3) Tuân thủ 70% → nhãn "cần trao đổi", không đề xuất kcal · (4) Báo cáo giai đoạn ra đủ số liệu, ảnh đúng 2 mốc · (5) "Tạo giai đoạn tiếp" ra bản nháp chưa phát hành.

---

## DINO-013 — Dashboard  (phụ thuộc 010–012)

**IN**
1. **Thư viện biểu đồ:** Chart.js v4 qua CDN (ghim phiên bản), không build step. Bảng màu và kiểu chữ theo app; mỗi biểu đồ có tiêu đề + đơn vị trục.
2. **Dashboard khách (Coach và khách đều xem, khách chỉ của mình):**
   - Cơ thể: cân (điểm từng lần + đường TB 7 ngày), eo/hông, SMM–PBF–FFM theo lần InBody.
   - Sức mạnh: 1RM ước tính theo tuần cho 3–5 bài chính (Dino chọn bài "theo dõi"), tổng khối lượng tạ / tuần theo nhóm cơ.
   - Chạy: km / tuần, pace TB các buổi easy, phút theo vùng tim (nếu có).
   - Tuân thủ: % buổi hoàn thành và % ăn đúng theo tuần.
   - Bộ lọc thời gian: giai đoạn hiện tại / 3 tháng / toàn bộ. Mốc chuyển giai đoạn vẽ đường dọc.
3. **Bảng tổng nhóm (Coach):** mỗi khách 1 dòng — giai đoạn, tuần, % buổi 7 ngày, % ăn 7 ngày, xu hướng cân 2 tuần (▲▼—), số cảnh báo mở, lần check-in gần nhất. Sắp xếp theo "cần chú ý" (cảnh báo → tuân thủ thấp → lâu chưa check-in).
4. **Xuất dữ liệu:** nút "Xuất CSV" theo khách (mọi bảng của khách đó, gộp file zip phía client) — phục vụ sao lưu hằng tuần (Đặc tả mục 7).
5. Truy vấn tổng hợp: tạo view/RPC `security invoker` trong migration `0008_dashboard_views.sql` để RLS vẫn áp dụng; không dùng `security definer` cho view.

**UAT:** (1) Dino nắm tình hình 1 khách trong 30 giây · (2) Biểu đồ khớp số liệu thô 3 mốc kiểm tra tay · (3) Khách chỉ thấy dashboard của mình · (4) Bảng tổng nhóm đưa khách có cảnh báo lên đầu · (5) Xuất CSV mở được bằng Google Sheets, tiếng Việt không lỗi font (UTF-8 BOM).
