# DINO-016 — Tab Công cụ · Sơ đồ cơ & tần suất nhóm cơ · Bảng PR · Âm báo hết giờ nghỉ

**Trạng thái:** AUTHORIZED (Dino dán lệnh = duyệt) · **Agent:** Antigravity viết code + test · **Review:** Claude · **UAT:** Dino
**Nhánh:** `feature/dino-coach-016-tools` tạo từ `main` (đã có DINO-014 + 015, merge `ef6bbc5`, `dcoach-v22`).
**Đọc trước:** `AGENTS.md`, `00_SYSTEM/`, `docs/dino-coach/00_HANDOVER_DINO_Coach.md`, `docs/dino-coach/DINO-015_brief.md` (cùng khuôn mẫu).
**Không cần migration** (mọi số liệu tính từ bảng có sẵn: `set_logs`, `block_items`, `exercises`, `sessions`).

## 1. Mục tiêu
Đưa các công cụ hay của app cá nhân vào app coach để khách dùng hằng ngày: đổi pace, dự đoán thành tích chạy, tính đĩa tạ, 1RM, WOD ngẫu nhiên; trang Tiến độ có sơ đồ cơ + ma trận tần suất nhóm cơ 2 tuần + bảng kỷ lục cá nhân (PR); đồng hồ nghỉ có âm báo.

## 2. Nguồn tham khảo (app cá nhân — CHỈ ĐỌC, KHÔNG SỬA)
`index.html` (tab "Công Cụ Hỗ Trợ", "Tổng Quan Thể Lực & Bản Đồ Cơ"), `js/app.js`, `js/charts.js`, `js/audio.js`, `js/timer.js`, `js/data.js` (danh sách WOD).
- Port **logic + dữ liệu WOD** sang module ES mới trong `/coach/`. Không import file của app cá nhân.
- Sơ đồ cơ: chỉ dùng lại SVG nếu đó là hình tự vẽ trong repo. Nếu là ảnh/hình lấy từ nguồn ngoài → tự vẽ SVG đơn giản (mặt trước + mặt sau, các vùng cơ là `<path data-muscle="…">`). Ghi rõ trong báo cáo đã chọn cách nào.

## 3. Phạm vi IN

**3.1 `coach/js/lib/tools.js`** (hàm thuần, không import supabase):
- `paceToSpeed(secPerKm)` / `speedToPace(kmh)`; `fmtPace` dùng lại từ `charts.js`.
- `predictRace(distKm, timeSec, targetKm)` — công thức Riegel `T2 = T1 × (D2/D1)^1.06`; trả thời gian cho 5K, 10K, 21,1K, 42,2K.
- `oneRm(load, reps)` — dùng `e1rm` có sẵn trong `formulas.js` (Epley), thêm Brzycki để so sánh; bảng % 1RM (100 → 50%, bước 5%).
- `plateLoad(targetKg, barKg = 20, plates = [25, 20, 15, 10, 5, 2.5, 1.25])` → đĩa mỗi bên + phần dư không lắp được.
- `randomWod(list, {type, minutes, rng})` — `rng` truyền vào được để test ổn định.

**3.2 `coach/js/lib/wods.js`**: dữ liệu WOD port từ app cũ (≥ 50 bài: CrossFit benchmark + HYROX + các WOD khác), mỗi bài `{id, name, type: 'amrap'|'emom'|'fortime'|'hyrox'|'chipper', minutes, items:[…], note}`. Tên bài tiếng Anh giữ nguyên, mô tả tiếng Việt.

**3.3 `coach/js/views/shared/tools.js`** — route `#/tools` (access `auth`, cả coach và khách):
- 4 thẻ: **Pace & dự đoán thành tích** · **1RM & % tạ** · **Lắp đĩa tạ** · **WOD ngẫu nhiên** (lọc loại + thời lượng, nút "Quay WOD khác").
- Input số bàn phím số (`inputmode="decimal"`), kết quả cập nhật ngay khi gõ.
- Lối vào: khách — nút "Công cụ" trên trang **Hồ sơ** + 1 dòng link trên **Hôm nay**; tab đang sáng = Hồ sơ (`also: ['#/tools']`). Coach — link "Công cụ" ở trang Thư viện; tab sáng = Thư viện. **Không thêm tab thứ 6.**

**3.4 Trang Tiến độ `coach/js/views/shared/dashboard.js`** (+ hàm thuần mới trong `coach/js/lib/dashboard.js`):
- `muscleSets(rows, exById, from, to)` → số hiệp có tạ theo nhóm cơ chính (dùng `primary_muscles`, nhóm phụ tính 0,5 hiệp) trong khoảng xem.
- **Sơ đồ cơ** mặt trước + sau, tô màu theo số hiệp/tuần (0 → mờ; càng nhiều càng sáng, màu theo `--h`, KHÔNG khối màu đặc); chạm 1 vùng → hiện "Ngực: 12 hiệp/tuần".
- **Ma trận tần suất 2 tuần**: hàng = nhóm cơ, cột = 14 ngày, ô có tập = chấm sáng.
- `personalRecords(rows, exById)` → mỗi bài có tạ: 1RM ước tính cao nhất (ngày), tạ nặng nhất (số rep, ngày); chạy: quãng dài nhất, pace tốt nhất cho buổi ≥ 5 km. Hiện bảng **PR** (top 10, mới lập trong 14 ngày gắn nhãn "Mới").
- Các phần mới nằm dưới mục Sức mạnh, tôn trọng bộ lọc Giai đoạn này / 3 tháng / Toàn bộ (riêng ma trận luôn là 14 ngày gần nhất).

**3.5 Âm báo hết giờ nghỉ** — `coach/js/views/client/log.js` hàm `startRest`: hết giờ thì rung (đã có) **+ tiếng bíp ngắn** (Web Audio API, port ý tưởng từ `js/audio.js`); nút bật/tắt âm trong thanh đồng hồ, lưu `localStorage` key `dcoach_sound`. Không phát âm khi chưa có thao tác chạm của người dùng (luật autoplay).

**3.6** `coach/sw.js` → `dcoach-v23`, thêm file mới vào SHELL. Màu theo `--h`, font Be Vietnam Pro, không tràn ngang 375 px. Không sửa app cá nhân.

## 4. OUT
AI Coach · lưu lịch sử dùng công cụ · gắn WOD thẳng vào giáo án (để sau) · migration.

## 5. Test bắt buộc (AG viết, tất cả PASS)
- `tests/coach/tools.test.mjs`: pace 5:00/km ⇄ 12 km/h; Riegel 10K 50:00 → 21,1K ≈ 1:50:3x (ghi số chính xác); 1RM 100 kg × 5 = 116,7 (Epley); lắp 100 kg thanh 20 → mỗi bên 25 + 15; 102,5 kg → 25 + 15 + 1,25; số lẻ không lắp được → báo phần dư; `randomWod` với rng cố định ra đúng bài; dữ liệu WOD ≥ 50 bài, đủ trường.
- Thêm vào `tests/coach/dashboard.test.mjs`: `muscleSets` (nhóm phụ 0,5), `personalRecords` (PR đúng bài/ngày, nhãn "Mới").
- `tests/coach/e2e_tools.py` (cổng **8781**, khung giống `e2e_packages.py`): khách mở Công cụ từ Hồ sơ → 4 thẻ hoạt động, kết quả đúng; coach mở từ Thư viện; trang Tiến độ có sơ đồ cơ (vùng có tập sáng hơn vùng không tập, chạm hiện số hiệp), ma trận 14 cột, bảng PR đúng số liệu mẫu; nút âm thanh lưu `dcoach_sound`; không tràn ngang 390 px; không lỗi JS.
- Chạy lại toàn bộ `node --test tests/coach/*.test.mjs` + mọi `tests/coach/e2e_*.py` (hiện có: 67 unit + e2e các bộ).

## 6. Giao nộp
Commit trên `feature/dino-coach-016-tools`, push → Preview. Báo cáo: danh sách file, SHA, link Preview (nhánh + link riêng deployment), sw version, kết quả test, nguồn SVG sơ đồ cơ, số WOD đã port. **KHÔNG merge main.** STOP — chờ Claude review + Dino UAT.

## 7. Checklist UAT cho Dino
1. Khách: Hồ sơ → Công cụ. Pace 5:30/km → ~10,9 km/h; nhập 10K 55:00 → dự đoán HM/FM hợp lý.
2. 1RM: 80 kg × 8 → ~101 kg + bảng %; Lắp đĩa 87,5 kg → đúng đĩa mỗi bên.
3. WOD ngẫu nhiên: lọc AMRAP 20 phút → ra bài đúng loại; "Quay WOD khác" đổi bài.
4. Tiến độ (coach xem Khách A): sơ đồ cơ sáng ở nhóm đã tập (đùi trước từ goblet squat), ma trận 14 ngày có chấm đúng ngày tập, bảng PR có Goblet squat.
5. Phiếu tập: hết giờ nghỉ có tiếng bíp; tắt âm → lần sau không kêu.
6. Điện thoại: không vỡ giao diện, màu theo màu đã chọn.
