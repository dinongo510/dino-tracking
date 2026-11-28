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

## DINO-009 — Giáo án theo chu kỳ (Claude viết 26/11/2026, chờ AG tạo nhánh + Dino UAT)
- File mới: `coach/js/lib/plan.js` (hàm thuần: ngày buổi tập, sinh tuần 2…N qua `formulas.generateWeek` + deload tuần cuối, mẫu ↔ cây, corrective từ OHSA 4 bước, chèn chạy compromised HYROX), `coach/js/lib/planStore.js` (đọc/ghi Supabase; lưu buổi theo kiểu chỉ sửa phần thay đổi, giữ id để set_logs của DINO-010 không bị xóa dây chuyền), `views/coach/plan.js` (chương trình → giai đoạn → lưới tuần × buổi; áp mẫu, sinh tuần, chép tuần, phát hành/thu hồi, lưu thành mẫu, đổi ngày bắt đầu tự dời lịch), `views/coach/session.js` (soạn buổi: 9 loại khối, chọn bài từ thư viện, kg/%1RM/RPE, quy tắc tăng tải, ↑↓✕), `views/client/plan.js` (tab "Lịch tập" theo tuần + xem buổi chỉ đọc).
- Sửa: `app.js` (4 route), `sw.js` v8, trang chi tiết khách (nút "Giáo án tập luyện →"), trang khách (tab Lịch tập + buổi hôm nay).
- Không cần migration mới (dùng bảng có sẵn từ 0001 + 0006).
- Test: plan.test.mjs 7/7, e2e_plan.py 28/28; chạy lại 006–008: 13+6+15+5+17+16 đều đạt (tổng 107/107).
- Giới hạn đã biết: khách gọi thẳng API vẫn đọc được giai đoạn nháp (app chỉ lọc ở truy vấn) — chấp nhận ở MVP. Ghi kết quả từng hiệp = DINO-010.
