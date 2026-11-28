# PROMPT BÀN GIAO — DINO COACH ONLINE (phiên 23/11/2026)

> Dán toàn bộ khối này vào phiên mới (Claude, ChatGPT hoặc Antigravity) để tiếp tục đúng chỗ.

## Bối cảnh
Tôi là Dino (Ngô Đức Anh), Head Coach. Tôi xây **DINO Coach Online**: công cụ coaching online miễn phí cho < 10 khách, là **phần 2 trong repo `dino-tracking`** (thư mục `/coach/`), tách khỏi app tracking cá nhân ở thư mục gốc. Stack: vanilla HTML/CSS/JS (không rebuild) + Supabase Free (Auth, Postgres + RLS, Storage, Realtime). Agent code: Antigravity. Tôi là UAT. Quy trình: PROPOSED → AUTHORIZED → IMPLEMENTING → IMPLEMENTED → VERIFIED → UAT → LOCKED; commit/push/merge/deploy tách riêng.
Nguyên tắc: hiểu hệ thống trước; nghiệp vụ trước sở thích kỹ thuật; thay đổi nhỏ nhất; kiểm chứng trước khi báo xong. Hệ thống chỉ GỢI Ý (TDEE, macro, corrective, tăng tải) — Coach duyệt.

## Tài liệu (Project "Chuyên môn" + `dino-coach-handoff.zip`)
- Đặc tả: Claude Doc "DINO Coach Online — Đặc tả quy trình & sản phẩm" (9 mục).
- Brief: `DINO-006` … `DINO-010`, `DINO-011-013`.
- Migration (thứ tự chạy): `0001_dino_coach_schema` → `0002_exercise_library_seed` → `0003_dino_core_exercises` → `0004_nutrition_library`  → `0005_exercise_images` → `0006_program_templates` → `0007_alerts` (010) → `0008_checkins_reviews` (012) → `0009_tracked_lifts` (013) → `0010_packages` (014).
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

## DINO-011 — Dinh dưỡng — DEPLOYED production 28/11/2026 (dcoach-v14, merge e374abd; Claude UAT trên Preview: đạt)
- Không cần migration: dùng `foods`, `nutrition_targets`, `meal_slots`, `meal_options`, `meal_checks` (0001) + `meal_templates`, `day_plan_templates`, unique `foods.name_vi` (0004). RLS có sẵn: coach ghi mục tiêu/thực đơn, khách chỉ đọc; khách ghi `meal_checks`; ảnh bữa ăn ở `progress/<client_id>/meals/`.
- File mới: `lib/nutrition.js` (hàm thuần: cân/FFM mới nhất, đề xuất mục tiêu qua `formulas.bmrAuto/tdee/nutritionTargets`, carb tự tính, mục tiêu từng bữa, tổng/✓✗ qua `optionTotals/optionFits`, gợi ý 3 phương án đạm + tinh bột + rau bước 0,5, áp thực đơn mẫu nhân hệ số làm tròn 0,5, đọc CSV, tuân thủ), `lib/nutritionStore.js`, `views/coach/nutrition.js` (mục tiêu → duyệt; thực đơn: áp mẫu cả ngày, tạo 4 bữa, % kcal, + phương án tay, gợi ý, từ mẫu bữa; nhật ký ăn 7 ngày có ảnh), `views/coach/foods.js` (kho món: tìm, thêm/sửa/xóa, dán CSV xem trước, trùng tên = cập nhật), `views/client/eat.js` (tab Ăn: mục tiêu ngày, tuân thủ 7 ngày, mỗi bữa chọn phương án + Đúng/Gần đúng/Lệch + ảnh + ghi chú, xem ngày trước).
- Sửa: `app.js` (3 route), `sw.js` v13, tab "Ăn" cho khách, nút "Dinh dưỡng →" ở trang khách, link "Kho món ăn" ở Thư viện.
- Kiểm tay 3 khách mẫu (nutrition.test.mjs): Nam 30t/175/80 giảm mỡ ×1,375 → BMR 1749, TDEE 2405, 1980 kcal P176 C175 F64; Nữ 28t/160/55 tăng cơ ×1,55 → 1249/1936/2080; FFM 60 recomp ×1,725 → Katch 1666/2874/2870.
- Test: nutrition 7/7, e2e_nutrition 24/24; toàn bộ 177/177.
- Sau UAT: nhãn ✗ ghi rõ lý do lệch khung (`fitReason`: thừa/thiếu % kcal, thiếu đạm).

## DINO-011b — Giao diện "kính tối ánh màu" + Buổi kế tiếp — DEPLOYED production 28/11/2026 (dcoach-v16, merge be80d61)
- Bản mẫu Dino chốt: https://claude.ai/artifact/Xt1McUsfGyJnfKH7Pu2odm (4 màn hình, chọn màu bằng chấm + thanh kéo).
- Nguyên tắc: nền đen nhám, thẻ kính có viền gradient mảnh, vệt màu loang cố định phía sau; KHÔNG khối màu đặc — nút chính / tab đang chọn / ✓ / "Đúng" dùng lớp `.btn--primary` / `.soft` = nền tối + ánh màu nhạt bên trong + viền gradient + chữ sáng cùng tông + quầng sáng mờ. Font Be Vietnam Pro.
- Màu: mọi màu suy ra từ 1 biến CSS `--h` (sắc độ 0–359): `--a1` nhấn, `--a2` (+38°), `--a3` (−34°, nhạt), `--tint` chữ ánh màu, trạng thái `--ok/--warn/--danger` cùng tông, phân biệt bằng độ đậm + ký hiệu (✓ ≈ ✕, ↑ ↓, ⚠). Người dùng chọn ở Hồ sơ (khách) / trang chủ (coach): 5 màu nhanh + thanh kéo; lưu `localStorage.dcoach_hue` (từng máy), áp trước khi vẽ bằng script nhỏ trong `index.html`.
- File: mới `lib/theme.js`; viết lại `css/coach.css`; `ui.js` thanh tab nổi có biểu tượng (tab đang chọn hiện chữ; mục `also` để phiếu tập sáng tab Lịch tập); bỏ màu gán cứng ở review/nutrition/inbox/plan/log/eat/chat (sửa luôn lỗi `var(--accent)` không tồn tại làm bong bóng chat trong suốt).
- Trang Hôm nay (khách) viết lại: thẻ BUỔI HÔM NAY / TẬP BÙ / BUỔI KẾ TIẾP theo `plan.pickNext` (ưu tiên buổi hôm nay → buổi lỡ trong tuần → buổi sắp tới), nhắc tập bù, 3 ô Tập 7 ngày / Ăn 7 ngày / Cân TB tuần (↓↑), thẻ Ăn hôm nay, tin mới của coach. `planStore.publishedSessions`.
- Test: plan 8/8 (+pickNext), e2e_theme 12/12 (mới); sửa e2e_plan/e2e_log/e2e_nutrition theo trang Hôm nay mới; toàn bộ 42 + 151 = 193/193. `sw.js` v15.
- Sau UAT: tab Thư viện sáng cả ở Kho món ăn; thẻ Ăn "đủ bữa hôm nay ✓"; `sw.js` v16.

## DINO-012 — Check-in tuần + đề xuất kcal + báo cáo giai đoạn — Claude UAT trên Preview: đạt (28/11/2026, commit 47a8b1a, dcoach-v17); migration 0008 đã chạy
- Migration `0008_checkins_reviews.sql` (test Postgres 16 local): `weekly_checkins` + `sessions_pct, eat_pct, replied_at, updated_at`; `phase_reviews` + `coach_agreed_at, client_agreed_at, updated_at`. Trigger: khách không ghi `coach_reply`; coach không sửa câu trả lời của khách; mỗi bên chỉ ghi phần mình trong báo cáo; đủ 2 bên đồng ý → `status='agreed'`; coach sửa tóm tắt/quyết định sau khi khách đồng ý → khách đồng ý lại (khách sửa nhận xét KHÔNG làm mất đồng ý của coach).
- File mới: `lib/checkin.js` (hàm thuần: tuần cần check-in T7/CN tuần này, T2/T3 tuần trước; cân TB từng tuần qua `formulas.weeklyAvg`; % buổi/% ăn tuần; đề xuất kcal qua `formulas.kcalAdjustment` + mục tiêu mới (carb tự tính); `phaseReport` đầu–cuối cân/eo/mông/SMM/PBF/FFM, ảnh chính diện 2 mốc, top 3 tăng 1RM (tuần 1–2 vs 2 tuần cuối), km, buổi xong/đến hạn, ăn TB, nhắc thiếu dữ liệu cuối giai đoạn), `lib/checkinStore.js` (+ `createNextPhase`: chép tuần 1, sinh tuần sau, bản nháp), `views/client/checkin.js`, `views/coach/checkin.js` (+ danh sách check-in của 1 khách), `views/shared/phaseReport.js` (route `/phase/:id` cho cả 2 vai).
- Sửa: chat dùng chung theo ngữ cảnh (`session` / `checkin` / `phase`); Hôm nay khách có thẻ CHECK-IN TUẦN, "Coach đã trả lời", BÁO CÁO GIAI ĐOẠN; Lịch tập khách + Giáo án coach có nút báo cáo; trang khách của coach có "Check-in tuần"; Hộp việc có "Check-in chờ trả lời" + "Tin khác chưa đọc"; `sw.js` v17.
- Kịch bản UAT brief đã test: cân đứng 2 tuần + ăn ≥ 80% → −150 kcal (1900 → 1750, C 191); ăn 70% → "Cần trao đổi", không đề xuất.
- Test: checkin 4/4, e2e_checkin 24/24; toàn bộ 46 + 175 = 221/221.

## DINO-013 — Dashboard + bảng tổng nhóm + xuất CSV — DEPLOYED production 28/11/2026 (dcoach-v19, merge 5dbbd16). DINO-012 DEPLOYED (merge c2d6db0, dcoach-v17)
- Quyết định: biểu đồ SVG tự vẽ (`lib/charts.js`) thay Chart.js qua CDN — không phụ thuộc mạng/CDN (PWA chạy offline, test chạy offline), màu ăn theo `--h`, nhẹ hơn ~200 KB. Không tạo view/RPC: < 10 khách → tính phía máy từ các bảng có sẵn, RLS áp dụng bình thường (thay mục 5 của brief).
- Migration `0009_tracked_lifts.sql` (test Postgres 16 local, chạy 2 lần không lỗi): bảng bài "theo dõi" — coach ghi, khách chỉ đọc, khách khác không thấy.
- File mới: `lib/charts.js` (đường theo ngày + cột theo tuần, cộng dồn/cạnh nhau, đường dọc mốc giai đoạn, điểm mang số liệu thô `data-v`), `lib/dashboard.js` (hàm thuần: bộ lọc Giai đoạn này / 3 tháng / Toàn bộ, cân + TB 7 ngày, eo/mông, SMM/FFM/PBF, 1RM Epley cao nhất mỗi tuần, khối lượng tạ theo nhóm cơ, km + pace easy (vùng tim ≤ 2), % buổi + % ăn theo tuần, dòng bảng tổng nhóm + sắp "cần chú ý", CSV BOM UTF-8, zip không nén), `lib/dashboardStore.js`, `views/shared/dashboard.js` (`#/dash/:id` coach, `#/client/dash` khách).
- Sửa: trang chủ coach thành bảng tổng nhóm (cảnh báo → tuân thủ < 70% → lâu chưa check-in; tạm dừng/kết thúc xuống cuối; mỗi dòng: giai đoạn + tuần, % tập/ăn 7 ngày, xu hướng cân 2 tuần ▲▼—, lý do cần chú ý, nút Tiến độ); trang khách của coach có "Tiến độ & biểu đồ"; tab Cơ thể của khách có "Xem biểu đồ tiến độ →"; `coach.css` thêm ô số / chip / biểu đồ; `sw.js` v18.
- Coach: "Chọn bài theo dõi" (tối đa 5, chưa chọn thì tự lấy 3 bài có tạ được ghi nhiều nhất); "Xuất CSV (.zip)" = 23 bảng của 1 khách.
- Test: dashboard 8/8, e2e_dash 27/27; toàn bộ 54 + 202 = 256/256.
- Sau UAT (dữ liệu thật Khách A: cân 84/83 → TB 83,5; 1RM goblet squat 12×12 = 16,8; khối lượng 432; xuất 23 bảng; khách bị chặn ở dashboard khách khác + không tự sửa bài theo dõi): đường TB 7 ngày chỉ 1 điểm vẫn hiện chấm; biểu đồ 1RM luôn ghi tên bài kể cả khi chỉ 1 bài; `sw.js` v19.

## DINO-014 — Gói tập (buổi / thời hạn), buổi PT tại chỗ, khóa app khi hết hạn, "Tập của tôi" (Claude viết 28/11/2026; chờ chạy 0010 + AG tạo nhánh + UAT)
- Quyết định của Dino (28/11): hủy muộn không xử lý (tự giải quyết); gói thường không thời hạn (có lựa chọn "Không thời hạn"); gói hết hạn → khóa app khách sau 3 ngày; lưu giá + đã trả; chưa cần đặt giờ hẹn; khách riêng của Dino (không theo chính sách BFS).
- Migration `0010_packages.sql` (test Postgres 16 local, chạy 2 lần không lỗi): `profiles.coach_mode` (online/offline/hybrid, khách không tự đổi), `sessions.mode` ('self' khách tự tập · 'pt' tại chỗ), bảng `packages` (số buổi NULL = không giới hạn, end_date NULL = không thời hạn, price_vnd, paid_vnd, status active/ended), `package_uses` (1 buổi PT chỉ trừ 1 lần — unique session_id). RLS: coach ghi, khách chỉ đọc. Sửa trigger check-in / báo cáo: coach tự làm khách của mình thì không bị chặn; luật cũ với khách giữ nguyên.
- Khóa app: khách CÓ gói và mọi gói có hạn đều quá hạn > 3 ngày (hoặc coach kết thúc gói cuối) → màn hình khóa ở mọi trang khách (dữ liệu giữ nguyên). Gói không thời hạn đang hoạt động hoặc khách chưa có gói → không khóa. Khóa ở giao diện (khách gọi thẳng API vẫn đọc được dữ liệu của mình — chấp nhận).
- File mới: `lib/packages.js` (hàm thuần: cộng tháng, đọc/ghi tiền "3tr/500k/3.000.000", trạng thái gói, chọn gói để trừ buổi PT, khóa + ân hạn, lý do cần chú ý, chế độ "Tập của tôi"), `lib/packageStore.js`, `lib/ptDeduct.js`, `views/coach/packages.js` (khối Gói tập & hình thức trên trang khách: thêm/sửa gói, trừ tay 1 buổi, hoàn buổi, kết thúc/mở lại, báo khóa/ân hạn).
- Sửa: soạn buổi có "Ai ghi buổi này?" (Khách tự tập / PT tại chỗ); coach mở được phiếu buổi PT để ghi thay khách, "Hoàn thành & trừ 1 buổi"; trang kết quả buổi PT báo đã/chưa trừ gói; nhãn PT ở giáo án + "Tập với Coach" ở lịch/Hôm nay của khách; Hôm nay khách có thẻ gói + báo sắp khóa; bảng tổng nhóm có nhãn hình thức + lý do gói (sắp hết buổi/hạn, còn nợ, đã khóa) xếp ngay sau cảnh báo; trang chủ coach có "Tập của tôi" (dùng app như khách cho chính mình, không cần đăng xuất; mở lại app vẫn nhớ chế độ); Hộp việc ẩn check-in của chính coach; `sw.js` v20.
- Test: packages 6/6, e2e_packages 27/27; toàn bộ 60 + 229 = 289/289.

## DINO-015 — Readiness trước buổi tập + Khởi động chỉnh tư thế (Prehab NASM) — Antigravity viết code + test (28/11/2026, dcoach-v21)
- Migration `0011_readiness.sql` (chưa chạy, Claude duyệt rồi chạy): `alter table public.session_feedback add column if not exists readiness jsonb;`.
- File mới: `coach/js/lib/readiness.js` (hàm thuần: tính điểm chuẩn hóa 0–100 từ 4 tiêu chí đảo chiều soreness/stress, xếp loại green/yellow/red, gợi ý điều chỉnh cường độ), `coach/js/lib/prehab.js` (hàm thuần: sinh kế hoạch khởi động chuẩn NASM CEx 4 bước Inhibit → Lengthen → Activate → Integrate 5–8 phút theo OHSA, loại buổi và vùng đau), `tests/coach/readiness.test.mjs` (7 bài), `tests/coach/e2e_readiness.py` (12 bài).
- Sửa: `coach/js/views/client/log.js` (thẻ "Sẵn sàng chưa?", thẻ tổng kết readiness kèm gợi ý, thẻ "Khởi động & chỉnh tư thế" kèm bấm giờ từng bước và tick hoàn thành, ẩn khi có khối corrective, lưu offline), `coach/js/views/coach/review.js` (hiện điểm readiness, mức, chi tiết, tình trạng khởi động), `coach/js/views/coach/inbox.js` (buổi có readiness red trong 7 ngày có nhãn "Readiness thấp"), `coach/sw.js` (v21).
- Test: readiness 7/7, e2e_readiness 12/12; toàn bộ: 67 unit + 241 e2e (308/308 PASS).

