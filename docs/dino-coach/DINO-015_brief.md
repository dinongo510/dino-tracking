# DINO-015 — Readiness trước buổi tập + Khởi động chỉnh tư thế (Prehab NASM)

**Trạng thái:** AUTHORIZED (Dino dán lệnh = duyệt) · **Agent:** Antigravity viết code + test · **Review:** Claude · **UAT:** Dino
**Phụ thuộc:** DINO-014 (nhánh `feature/dino-coach-014-packages`). Tạo nhánh `feature/dino-coach-015-readiness` **từ nhánh 014** (hoặc từ main nếu 014 đã merge).
**Đọc trước:** `AGENTS.md`, `00_SYSTEM/`, `docs/dino-coach/00_HANDOVER_DINO_Coach.md` (mục DINO-010 → 014).

## 1. Mục tiêu
Trước mỗi buổi tập, khách trả lời nhanh 4 câu (< 20 giây) → app gợi ý điều chỉnh cường độ; hiện bài khởi động chỉnh tư thế 5–8 phút theo kết quả OHSA của khách + loại buổi. Coach thấy kết quả readiness khi xem buổi.

## 2. Nguồn tham khảo trong repo (app cá nhân — CHỈ ĐỌC, KHÔNG SỬA)
- `js/app.js`: phần "Đánh Giá Mỏi Cơ & Giấc Ngủ (Readiness)" — logic gợi ý hạ RIR / đổi bài theo thể trạng.
- `js/prehab_engine.js` + `js/prehab_data.js`: thuật toán NASM CEX 4 bước (inhibit → lengthen → activate → integrate), thời lượng từng bước, chọn bài theo tư thế/vùng đau + loại buổi.
- Port **logic** sang module ES mới trong `/coach/`. Dữ liệu bài tập lấy từ **thư viện Supabase của coach** (`exercises.corrective_step` + `tags` dạng `ohsa:<mã>`, xem `coach/js/views/coach/client.js` hàm `correctiveFor` và `coach/js/lib/plan.js` hàm `correctiveFromOhsa`) — KHÔNG copy `prehab_data.js` sang làm thư viện thứ hai.

## 3. Phạm vi IN

**3.1 Migration `supabase/migrations/0011_readiness.sql`** (AG soạn, **KHÔNG chạy** — Claude duyệt rồi chạy):
`alter table public.session_feedback add column if not exists readiness jsonb;`
Dạng: `{"sleep":1-5,"soreness":1-5,"stress":1-5,"energy":1-5,"pain":["Gối trái",...],"score":0-100,"level":"green|yellow|red","warmup_done":bool,"at":"ISO"}`. RLS có sẵn (session_feedback_rw) — không đổi.

**3.2 `coach/js/lib/readiness.js`** (hàm thuần, KHÔNG import supabase):
- `readinessScore({sleep, soreness, stress, energy})` → 0–100 (soreness và stress: 5 = tệ nhất, đảo chiều). Ghi rõ công thức trong comment, lấy theo app cũ nếu hợp lý.
- `readinessLevel(score, pain)` → `green` ≥ 70 · `yellow` 50–69 · `red` < 50 **hoặc** có vùng đau.
- `adjustment(level)` → lời gợi ý tiếng Việt: green "Tập như kế hoạch"; yellow "Giảm 1 hiệp ở bài chính, RPE mục tiêu −1"; red "Buổi nhẹ: giữ kỹ thuật, bỏ hiệp nặng nhất / thay bằng mobility — nhắn Coach nếu đau". **Chỉ gợi ý, không tự sửa giáo án.**

**3.3 `coach/js/lib/prehab.js`** (hàm thuần):
- `warmupPlan({ohsa, sessionType, pain, exercises})` → `[{step:'inhibit'|'lengthen'|'activate'|'integrate', label, items:[{exercise_id, name_vi, dose:'30 giây'|'10 lần'…}], sec}]`, tổng 5–8 phút.
- Chọn bài: ưu tiên bài có tag `ohsa:<mã>` khớp các bù trừ OHSA của khách; không có OHSA → bộ khởi động chung theo `sessionType` (upper / lower / strength full / run / hyrox). Vùng đau (từ readiness) → thêm bài inhibit/lengthen cho vùng đó nếu thư viện có.
- Thời lượng mỗi bước theo app cũ (inhibit ~30–60 giây/bài, lengthen ~30 giây, activate 10–15 lần, integrate 8–10 lần).

**3.4 Giao diện khách — phiếu buổi tập `coach/js/views/client/log.js`:**
- Buổi chưa hoàn thành và chưa có readiness → hiện thẻ "Sẵn sàng chưa?" ở đầu phiếu: 4 hàng nút 1–5 + chọn vùng đau (dùng `PAIN_AREAS` có sẵn) + nút "Xong". Có nút "Bỏ qua" (không bắt buộc).
- Lưu vào `session_feedback.readiness` (upsert theo `session_id`, **không** đổi `completed`). Lưu ý trigger cảnh báo 0007 chỉ chạy khi `completed = true` — giữ nguyên.
- Sau khi lưu: thẻ màu theo level (tinted glass theo `--h`, KHÔNG khối màu đặc, dùng lớp có sẵn `.lvl--on/near/off` hoặc `.card--flag`) + câu gợi ý.
- Thẻ "Khởi động & chỉnh tư thế (~N phút)" ngay dưới: các bước + bài + liều, nút ⏱ bấm giờ từng bước (dùng lại đồng hồ có sẵn trong log.js), ô "Đã khởi động xong" → `readiness.warmup_done = true`. **Ẩn** thẻ này nếu buổi đã có khối `corrective` do coach soạn.
- Mất mạng: readiness lưu tạm localStorage key tiền tố `dcoach_` rồi đồng bộ như `dcoach_pending_logs` (hoặc báo "chưa lưu được" — chọn cách đơn giản, ghi rõ trong báo cáo).
- Buổi PT tại chỗ do coach ghi (DINO-014, `s.mode==='pt'`) và chế độ "Tập của tôi": thẻ readiness vẫn hiện, coach nhập thay được.

**3.5 Giao diện coach:**
- `coach/js/views/coach/review.js`: dòng "Readiness: 72/100 · 🟡 …" + 4 điểm + vùng đau + đã khởi động hay chưa.
- `coach/js/views/coach/inbox.js`: buổi có readiness `red` trong 7 ngày gần nhất hiện trong mục buổi chưa xem với nhãn "Readiness thấp" (không tạo bảng/cảnh báo mới).

**3.6** `coach/sw.js` → `dcoach-v21`, thêm file mới vào SHELL. Mọi màu theo `--h` (DINO-011b). Font Be Vietnam Pro. Không sửa app cá nhân (index.html gốc, `js/`, `css/`, `manifest.json` gốc).

## 4. OUT
AI Coach · tự sửa giáo án theo readiness · cảnh báo/bảng mới · tab Công cụ, sơ đồ cơ, PR (DINO-016).

## 5. Test bắt buộc (AG viết, tất cả PASS)
- `tests/coach/readiness.test.mjs`: điểm + level 3 mức (có case biên 50, 70), đau → red, gợi ý đúng chữ; `warmupPlan`: có OHSA "knees_in" → có bài tag `ohsa:knees_in` ở bước activate; không OHSA + run → bộ chung; tổng thời lượng 5–8 phút; có vùng đau → thêm bài.
- `tests/coach/e2e_readiness.py` (cổng **8780**, dùng `fake_supabase.js`, khung giống `e2e_packages.py`): khách mở buổi → thẻ readiness → chọn 4 điểm → lưu đúng JSON, `completed` vẫn false; level đúng màu; thẻ khởi động hiện đúng bài theo OHSA mẫu; tick "Đã khởi động" lưu `warmup_done`; buổi có khối corrective → ẩn thẻ khởi động; "Bỏ qua" không lưu gì; hoàn thành buổi sau đó vẫn giữ readiness; coach xem review thấy readiness; inbox có nhãn "Readiness thấp" với buổi red; không tràn ngang 390 px; không lỗi JS.
- Chạy lại toàn bộ: `node --test tests/coach/*.test.mjs` + tất cả `tests/coach/e2e_*.py` (trước 015: 60 unit + 229 e2e).

## 6. Giao nộp
Commit trên nhánh `feature/dino-coach-015-readiness`, push → Preview. Báo cáo: danh sách file, SHA, link Preview (nhánh + link riêng deployment), sw version, kết quả test, nội dung 0011, công thức điểm readiness đã chọn và lý do. **KHÔNG chạy migration, KHÔNG merge main.** STOP — chờ Claude review + Dino UAT.

## 7. Checklist UAT cho Dino (sau khi Claude chạy 0011)
1. Khách mở buổi hôm nay → thấy "Sẵn sàng chưa?", trả lời trong < 20 giây.
2. Chọn ngủ 2, mỏi 4, stress 4, năng lượng 2 → thẻ đỏ/vàng + gợi ý giảm tải hợp lý.
3. Thẻ khởi động: bài khớp kết quả OHSA của khách (đối chiếu trang khách phía coach), tổng 5–8 phút, bấm giờ chạy được.
4. Tick "Đã khởi động", tập rồi hoàn thành → coach mở kết quả buổi thấy readiness + đã khởi động.
5. Hộp việc coach có nhãn "Readiness thấp".
6. Trên điện thoại: không vỡ giao diện, màu theo màu đã chọn.
