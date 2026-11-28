# PROMPT BÀN GIAO — DINO COACH ONLINE (phiên 23/11/2026)

> Dán toàn bộ khối này vào phiên mới (Claude, ChatGPT hoặc Antigravity) để tiếp tục đúng chỗ.

## Bối cảnh
Tôi là Dino (Ngô Đức Anh), Head Coach. Tôi xây **DINO Coach Online**: công cụ coaching online miễn phí cho < 10 khách, là **phần 2 trong repo `dino-tracking`** (thư mục `/coach/`), tách khỏi app tracking cá nhân ở thư mục gốc. Stack: vanilla HTML/CSS/JS (không rebuild) + Supabase Free (Auth, Postgres + RLS, Storage, Realtime). Agent code: Antigravity. Tôi là UAT. Quy trình: PROPOSED → AUTHORIZED → IMPLEMENTING → IMPLEMENTED → VERIFIED → UAT → LOCKED; commit/push/merge/deploy tách riêng.
Nguyên tắc: hiểu hệ thống trước; nghiệp vụ trước sở thích kỹ thuật; thay đổi nhỏ nhất; kiểm chứng trước khi báo xong. Hệ thống chỉ GỢI Ý (TDEE, macro, corrective, tăng tải) — Coach duyệt.

## Tài liệu (Project "Chuyên môn" + `dino-coach-handoff.zip`)
- Đặc tả: Claude Doc "DINO Coach Online — Đặc tả quy trình & sản phẩm" (9 mục).
- Brief: `DINO-006` … `DINO-010`, `DINO-011-013`.
- Migration (thứ tự chạy): `0001_dino_coach_schema` → `0002_exercise_library_seed` → `0003_dino_core_exercises` → `0004_nutrition_library` → `0005_free_exercise_db` (AG sinh ở 008) → `0006_program_templates` → `0007_alerts` (AG, 010) → `0008_dashboard_views` (AG, 013).
- Code: `formulas.js` + `formulas.test.mjs` (13 test pass).
- Nội dung khách: `DINO_Coach_noi_dung_khach.md` (hồ sơ, 7 câu sàng lọc, check-in, tin nhắn mẫu).
- Kho duyệt: `DINO_Coach_Kho_bai_tap_va_meal_plan.xlsx`; bộ sinh lại SQL: `generator/` (`exercises_data.py`, `foods_data.py`, `programs_data.py`, `build.py`).

## FINAL (đã chốt)
- Hướng: mở rộng DINO Tracking + Supabase, không dùng app thương mại / AppSheet.
- Chung repo, 2 phần: `/` cá nhân (LocalStorage, giữ nguyên) · `/coach/` dạy khách (manifest + service worker riêng).
- Supabase project MỚI, không dùng lại project cũ bị pause. Tắt sign-up; mời khách qua Dashboard; khách mới tự gán cho coach duy nhất.
- MVP = DINO-006 → 010. Thứ tự: 006 → (007 ‖ 008) → 009 → 010 → 011 → 012 → 013.
- AG gọi `formulas.js`, không tự viết lại công thức.
- Hồ sơ khách bám phiếu giấy BFS "Thông tin cá nhân của khách hàng" + 7 câu sàng lọc (đã thêm cột vào 0001, chạy lại toàn bộ test pass). Đề xuất bổ sung 7 câu sàng lọc vào phiếu giấy BFS.

## Đã kiểm chứng (Postgres 16 local, giả lập auth Supabase)
- 0001: khách không xem/ghi dữ liệu của nhau, không tạo giáo án, không tự nâng role; coach thấy khách của mình; set role coach từ SQL Editor được.
- 0002–0004, 0006: nạp được; 171 bài tập, 89 thực phẩm, 32 mẫu bữa, 6 thực đơn ngày, 3 mẫu giáo án; không tham chiếu hỏng.
- `formulas.js`: 13/13 test.
- Code `coach/` (DINO-006 + phần lớn DINO-007): test trình duyệt 15/15 với Supabase giả lập; chưa test link mời, RLS thật, PWA trên điện thoại. Còn thiếu ở 007: ảnh tiến trình + ảnh phiếu InBody.
- Ghi chú nội bộ coach chuyển sang bảng riêng `coach_notes` (0001) — khách không đọc được kể cả gọi API (test Postgres pass).

## PROPOSED (chờ tôi duyệt)
Toàn bộ brief 006–013, migration 0001–0006, `formulas.js`, nội dung khách, kho bài tập / thực phẩm / mẫu bữa / giáo án.

## OPEN
1. Hosting: Vercel Hobby có thể cấm dùng thương mại → kiểm tra điều khoản; phương án thay: Cloudflare Pages.
2. Tên thương hiệu hiển thị cho khách.
3. Giá trị dinh dưỡng là ước tính, **chưa tra từng món** — tôi đối chiếu Bảng TPTP Việt Nam trước khi dùng.
4. Tên Anh bài tập chưa đối chiếu danh sách thật free-exercise-db → bài không khớp sẽ thiếu ảnh.
5. Video bài tập: đang là link tìm YouTube, thay dần bằng video của tôi.
6. Thông báo đẩy cho khách: sau MVP.

## Việc tiếp theo
- Tôi: duyệt đặc tả + nội dung khách; sửa kho trong Excel; chốt OPEN 1–2.
- Antigravity (khi rảnh): nhận `DINO-006_brief.md` + thư mục `coach/` (code DINO-006 Claude đã viết, 8/8 test giao diện pass với Supabase giả lập — xem `coach/README_DINO-006.md`) + lệnh `DINO-006 AUTHORIZED` → review, tích hợp, UAT với Supabase thật.
- Phiên Claude kế tiếp: hỗ trợ tôi làm 7 bước Supabase của DINO-006 (từng bước, có vị trí nút), review báo cáo AG, sinh lại SQL khi tôi sửa Excel.

## DINO-009 — Giáo án theo chu kỳ — DEPLOYED production 28/11/2026 (dcoach-v10, Dino UAT đạt)
- File mới: `coach/js/lib/plan.js` (hàm thuần: ngày buổi tập, sinh tuần 2…N qua `formulas.generateWeek` + deload tuần cuối, mẫu ↔ cây, corrective từ OHSA 4 bước, chèn chạy compromised HYROX), `coach/js/lib/planStore.js` (đọc/ghi Supabase; lưu buổi theo kiểu chỉ sửa phần thay đổi, giữ id để set_logs của DINO-010 không bị xóa dây chuyền), `views/coach/plan.js` (chương trình → giai đoạn → lưới tuần × buổi; áp mẫu, sinh tuần, chép tuần, phát hành/thu hồi, lưu thành mẫu, đổi ngày bắt đầu tự dời lịch), `views/coach/session.js` (soạn buổi: 9 loại khối, chọn bài từ thư viện, kg/%1RM/RPE, quy tắc tăng tải, ↑↓✕), `views/client/plan.js` (tab "Lịch tập" theo tuần + xem buổi chỉ đọc).
- Sửa: `app.js` (4 route), `sw.js` v8, trang chi tiết khách (nút "Giáo án tập luyện →"), trang khách (tab Lịch tập + buổi hôm nay).
- Không cần migration mới (dùng bảng có sẵn từ 0001 + 0006).
- Test: plan.test.mjs 7/7, e2e_plan.py 28/28; chạy lại 006–008: 13+6+15+5+17+16 đều đạt (tổng 107/107).
- Giới hạn đã biết: khách gọi thẳng API vẫn đọc được giai đoạn nháp (app chỉ lọc ở truy vấn) — chấp nhận ở MVP. Ghi kết quả từng hiệp = DINO-010.
- Sau UAT: nút "Lưu thành mẫu" dùng hộp nhập trong app (Chrome hay chặn `prompt()` im lặng); lưu mẫu xong tự tải lại danh sách mẫu.

## DINO-010 — Phiếu buổi tập + chat + Hộp việc — DEPLOYED production 28/11/2026 (dcoach-v12, merge a8cee96; Claude UAT trên Preview với Supabase thật: đạt)
- Migration `0007_alerts.sql`: bảng `alerts` (khách chỉ đọc, coach ghi; chống trùng theo `client_id, kind, ref_key`); trigger trên `session_feedback` tự tạo cảnh báo đau và RPE ≥ 9,5 hai buổi liên tiếp; trigger trên `messages` ép tác giả = người đăng nhập và chỉ cho sửa `read_at`. Đã test trên Postgres 16 local (RLS: khách không tự tạo/đóng cảnh báo, không giả danh coach, B không thấy dữ liệu A).
- File mới: `lib/sessionLog.js` (hàm thuần: dòng ghi điền sẵn mục tiêu, so mục tiêu đạt/vượt/hụt, thống kê buổi + e1RM, gợi ý tải qua `formulas.suggestNextLoad`, hàng chờ mất mạng, đồng hồ khối), `lib/logStore.js` (Supabase: set_logs upsert theo `block_item_id,set_no`, hàng chờ `dcoach_pending_logs`, feedback, tin nhắn + Realtime, cảnh báo, áp dụng tải cho buổi sau), `views/client/log.js` (phiếu khách: ✓ từng hiệp, RPE, bài chạy tự tính pace, đồng hồ nghỉ + đồng hồ circuit/EMOM/AMRAP, hoàn thành buổi có vùng đau 1–5), `views/coach/review.js` (mục tiêu vs thực tế tô màu, khối lượng, e1RM Epley, gợi ý + "Áp dụng", "Đã xem"), `views/coach/inbox.js` (Hộp việc: cảnh báo → tin chưa đọc → buổi chưa xem; tự tính bỏ buổi tuần trước + km chạy > 110% TB 4 tuần), `views/shared/chat.js` (chat theo buổi, Realtime).
- Sửa: `app.js` (route /coach/inbox, /coach/review/:id; phiếu khách chuyển sang log.js; tự đồng bộ khi có mạng), `sw.js` v11, `coach.css` (`[hidden]` luôn ẩn), tab Hộp việc bật, link "Xem kết quả khách ghi" ở màn soạn buổi, Lịch tập khách có ✓ Đã tập + số tin mới.
- Quyết định: điền sẵn `reps_min` (không phải max) để khách không sửa số thì không kích hoạt tăng tải. RPE từng hiệp dùng ô chọn 6–10 (gọn hơn nút trên điện thoại).
- Test: sessionLog 7/7, e2e_log 31/31 (2 tab realtime, mất mạng, gợi ý +5 kg, cảnh báo, bảo mật API); toàn bộ: 146/146.
- Sau UAT: sửa gửi chat bằng Ctrl+Enter (`requestSubmit()` không có submitter làm nút null).

## DINO-011 — Dinh dưỡng (Claude viết 28/11/2026, chờ AG tạo nhánh + Dino UAT)
- Không cần migration: dùng `foods`, `nutrition_targets`, `meal_slots`, `meal_options`, `meal_checks` (0001) + `meal_templates`, `day_plan_templates`, unique `foods.name_vi` (0004). RLS có sẵn: coach ghi mục tiêu/thực đơn, khách chỉ đọc; khách ghi `meal_checks`; ảnh bữa ăn ở `progress/<client_id>/meals/`.
- File mới: `lib/nutrition.js` (hàm thuần: cân/FFM mới nhất, đề xuất mục tiêu qua `formulas.bmrAuto/tdee/nutritionTargets`, carb tự tính, mục tiêu từng bữa, tổng/✓✗ qua `optionTotals/optionFits`, gợi ý 3 phương án đạm + tinh bột + rau bước 0,5, áp thực đơn mẫu nhân hệ số làm tròn 0,5, đọc CSV, tuân thủ), `lib/nutritionStore.js`, `views/coach/nutrition.js` (mục tiêu → duyệt; thực đơn: áp mẫu cả ngày, tạo 4 bữa, % kcal, + phương án tay, gợi ý, từ mẫu bữa; nhật ký ăn 7 ngày có ảnh), `views/coach/foods.js` (kho món: tìm, thêm/sửa/xóa, dán CSV xem trước, trùng tên = cập nhật), `views/client/eat.js` (tab Ăn: mục tiêu ngày, tuân thủ 7 ngày, mỗi bữa chọn phương án + Đúng/Gần đúng/Lệch + ảnh + ghi chú, xem ngày trước).
- Sửa: `app.js` (3 route), `sw.js` v13, tab "Ăn" cho khách, nút "Dinh dưỡng →" ở trang khách, link "Kho món ăn" ở Thư viện.
- Kiểm tay 3 khách mẫu (nutrition.test.mjs): Nam 30t/175/80 giảm mỡ ×1,375 → BMR 1749, TDEE 2405, 1980 kcal P176 C175 F64; Nữ 28t/160/55 tăng cơ ×1,55 → 1249/1936/2080; FFM 60 recomp ×1,725 → Katch 1666/2874/2870.
- Test: nutrition 7/7, e2e_nutrition 24/24; toàn bộ 177/177.
