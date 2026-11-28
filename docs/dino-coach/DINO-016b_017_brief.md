# DINO-016b (sửa sau UAT) + DINO-017 (Buổi tập ngoài lịch)

**Trạng thái:** AUTHORIZED · **Agent:** Antigravity viết code + test · **Review:** Claude · **UAT:** Dino
Đọc kèm: `AGENTS.md`, `00_SYSTEM/`, `docs/dino-coach/00_HANDOVER_DINO_Coach.md`, `docs/dino-coach/DINO-016_brief.md`.

---

## PHẦN A — DINO-016b: sửa sau UAT (trên nhánh `feature/dino-coach-016-tools`, commit riêng)

**A1. Lỗi hiển thị ô nhập "Dự đoán giải chạy"** (`coach/js/views/shared/tools.js` + CSS): ô km / phút / giây quá hẹp, chữ bị cắt ("10" thành "1(", "55" thành "!"). Sửa:
- Mỗi ô rộng tối thiểu 64 px, padding ngang nhỏ, `text-align:center`, số không bị cắt kể cả "42,2" và "59". Bố cục 1 hàng ≥ 375 px không tràn; quá hẹp thì xuống dòng gọn.
- Hiển thị số kiểu Việt Nam: **dấu phẩy thập phân** ("10,9 km/h", "21,1 km") — dùng `fmtNum` trong `charts.js`. Ô nhập chấp nhận cả "10,9" và "10.9".
- Rà toàn bộ 4 thẻ Công cụ, sửa mọi ô cùng lỗi.

**A2. Sơ đồ cơ đẹp hơn — "xịn" như app tập chuyên nghiệp** (`coach/js/views/shared/dashboard.js`, file SVG/dữ liệu mới nếu cần):
Hiện tại là các hình elip rời rạc — **thay toàn bộ**. Yêu cầu:
- Dáng người giải phẫu liền mạch (mặt trước + mặt sau), các bó cơ có hình đúng: ngực, vai trước/giữa/sau, tay trước, tay sau, cẳng tay, bụng, cơ liên sườn/bụng chéo, đùi trước, đùi trong (khép), bắp chân, cầu vai (trapezius), xô (lats), lưng giữa, lưng dưới, mông, đùi sau. Đường viền thân người mảnh, mờ.
- **Nguồn hình:** ưu tiên port dữ liệu đa giác cơ từ thư viện mã nguồn mở giấy phép **MIT**, ví dụ `react-body-highlighter` (repo GitHub giavinh79/react-body-highlighter) — **kiểm tra file LICENSE là MIT trước khi dùng**, chỉ lấy dữ liệu tọa độ, chuyển thành SVG thuần (không thêm React/npm/CDN), giữ thông báo bản quyền MIT trong file `coach/js/lib/bodymap.js` + ghi vào `docs/dino-coach/THIRD_PARTY.md`. Không dùng hình có bản quyền khác / không rõ nguồn. Nếu không tìm được nguồn MIT phù hợp → tự vẽ SVG giải phẫu đủ chi tiết như trên và báo lại.
- Màu nhiệt theo `--h`: 0 hiệp = xám mờ; 1–5 / 6–10 / 11–15 / >15 hiệp/tuần = 4 mức sáng dần (độ sáng + độ bão hòa của `--a1`, mức cao có `filter: drop-shadow` glow nhẹ). KHÔNG khối màu đặc chói. Có **chú thích thang màu** dưới hình.
- Chạm 1 bó cơ → bó đó viền sáng + nhãn "Đùi trước · 6 hiệp/tuần · 2 buổi"; chạm chỗ trống bỏ chọn. Trên điện thoại 2 hình cạnh nhau, mỗi hình cao ~260–300 px, không tràn ngang.
- Ánh xạ `primary_muscles`/`secondary_muscles` của thư viện bài tập (tên free-exercise-db: chest, shoulders, biceps, triceps, forearms, abdominals, obliques? , quadriceps, adductors, abductors, calves, traps, lats, middle back, lower back, glutes, hamstrings, neck) → bó cơ trên hình; ghi bảng ánh xạ trong `bodymap.js`.

**A3.** `coach/sw.js` → `dcoach-v24` (thêm file mới). Test: cập nhật `e2e_tools.py` (ô nhập không bị cắt: `scrollWidth <= clientWidth` cho từng ô; dấu phẩy thập phân) và `e2e_dash.py`/test sơ đồ (vùng có tập sáng hơn vùng không tập, chạm hiện nhãn, có chú thích thang màu). Commit: `"DINO-016b: sửa ô nhập công cụ, sơ đồ cơ giải phẫu mới, sw v24"`, push.

---

## PHẦN B — DINO-017: Buổi tập ngoài lịch (nhánh `feature/dino-coach-017-adhoc` tạo TỪ nhánh 016 sau Phần A)

### B1. Mục tiêu
Khách (và coach) tạo được **1 buổi tập ngoài lịch** bất kỳ ngày nào — kể cả khi chưa có giáo án — rồi ghi kết quả như buổi bình thường. **Coach luôn được biết** (Hộp việc + trang khách). Buổi ngoài lịch **không làm giảm % tuân thủ**, nhưng **tính vào** khối lượng tạ, km, PR, sơ đồ cơ, 1RM.

### B2. Migration `supabase/migrations/0012_adhoc_sessions.sql` (AG soạn, **KHÔNG chạy** — Claude duyệt + test Postgres rồi chạy)
- `sessions.adhoc boolean not null default false`; `sessions.created_by uuid default auth.uid()`; `alter column phase_id drop not null`; check: `adhoc or phase_id is not null`.
- Buổi ngoài lịch: `adhoc = true`, `phase_id = null`, `week_no`/`day_no` tính từ ngày (`week_no = 0`, `day_no` = thứ trong tuần 1–7).
- RLS thêm (giữ nguyên policy cũ): khách được **insert/update/delete** `sessions` của chính mình khi `adhoc = true and mode = 'self'`; được ghi `session_blocks` / `block_items` thuộc session ngoài lịch của chính mình (kiểm tra qua session cha bằng `exists`). Coach giữ toàn quyền như cũ. Khách **không** sửa được session trong giáo án và không tạo được buổi `mode = 'pt'`.
- Viết kèm khối test SQL dạng comment (các câu lệnh Claude sẽ chạy để kiểm): khách A tạo/sửa/xóa buổi ngoài lịch của mình OK; khách A không sửa buổi giáo án; khách A không tạo buổi cho khách B; khách A không tạo buổi PT.

### B3. Giao diện khách
- Nút **"+ Buổi tự do"** trên **Hôm nay** (luôn hiện, kể cả khi chưa có giáo án — thay trạng thái trống "chưa có lịch") và trên **Lịch tập**.
- Màn tạo nhanh `#/client/adhoc/new`: ngày (mặc định hôm nay), tên (mặc định "Buổi tự do dd/mm"), loại (Sức mạnh / Chạy / HYROX / Circuit / Khác), thêm bài từ thư viện (ô tìm không dấu như Thư viện, dùng `loadExercises`), mỗi bài: số hiệp × rep × kg **hoặc** km + thời gian (bài chạy). Có thể thêm bài tự gõ tên nếu không có trong thư viện? → **Không** (chỉ chọn từ thư viện, để số liệu thống kê đúng); có nút "Báo coach thêm bài" mở chat.
- Lưu → mở thẳng phiếu ghi `#/client/session/:id` (dùng nguyên `log.js`: readiness, đồng hồ nghỉ, hoàn thành, chat).
- Sửa / xóa buổi tự do của mình khi **chưa hoàn thành**.
- Lịch tập: mục "Buổi tự do" liệt kê buổi ngoài lịch trong tuần đang xem; Hôm nay: buổi tự do của hôm nay hiện như 1 thẻ riêng (không thay "Buổi kế tiếp" của giáo án).

### B4. Coach được biết
- **Hộp việc:** mục **"Buổi tự tập ngoài lịch (n)"** — buổi ngoài lịch tạo trong 7 ngày, `coach_reviewed = false` (kể cả chưa hoàn thành) → bấm vào mở trang kết quả, nút "Đã xem".
- Trang giáo án của khách (coach): mục "Buổi ngoài lịch" theo tuần. Nhãn "Ngoài lịch" ở trang kết quả.
- Coach cũng tạo được buổi ngoài lịch cho khách từ trang khách (nút "+ Buổi ngoài lịch"), chọn **PT tại chỗ** → hoàn thành thì **trừ 1 buổi gói** (dùng lại `ptDeduct.js` DINO-014).
- "Tập của tôi" (coach tự tập): tạo buổi tự do cho chính mình bình thường.

### B5. Số liệu
- `% buổi hoàn thành` (Hôm nay, check-in, dashboard, bảng tổng nhóm) chỉ tính buổi **trong giáo án** (bỏ `adhoc = true`). Rà `publishedSessions`, `last7`, `weekStats`, `adherenceWeekly`, `groupData`, `dashData`.
- Khối lượng, km, pace, 1RM, PR, sơ đồ cơ, ma trận tần suất **có tính** buổi ngoài lịch (lấy từ `set_logs` như hiện tại — kiểm tra lại không bị lọc mất).
- Buổi ngoài lịch không được đánh "bỏ lỡ" (cảnh báo `missed` của DINO-010 bỏ qua `adhoc`).

### B6. Kỹ thuật
- `coach/sw.js` → `dcoach-v25`. Màu theo `--h`, không khối màu đặc, không tràn 375 px. Không sửa app cá nhân.
- `tests/coach/fake_supabase.js`: cho khách ghi `sessions`/`session_blocks`/`block_items` khi session `adhoc && mode==='self' && client_id===me` (giống RLS 0012).
- Test bắt buộc:
  - Unit: hàm tính `day_no`/tên mặc định; lọc adherence bỏ adhoc (cập nhật `dashboard.test.mjs`/`checkin.test.mjs`).
  - `tests/coach/e2e_adhoc.py` (cổng **8782**): khách chưa có giáo án → Hôm nay có "+ Buổi tự do" → tạo buổi 2 bài (1 tạ, 1 chạy) → phiếu ghi mở → tick + hoàn thành; coach thấy trong Hộp việc "Buổi tự tập ngoài lịch", bấm "Đã xem" thì mất; % tập 7 ngày không đổi vì buổi tự do; PR / sơ đồ cơ có bài vừa tập; khách sửa/xóa buổi tự do chưa hoàn thành; khách không tạo được buổi PT / không sửa buổi giáo án (fake RLS báo lỗi); coach tạo buổi ngoài lịch PT cho khách → hoàn thành trừ 1 buổi gói; không tràn 390 px; không lỗi JS.
  - Chạy lại toàn bộ unit + mọi `e2e_*.py`.

### B7. Giao nộp
Commit `"DINO-017: buổi tập ngoài lịch (khách + coach), coach được báo, sw v25"`, push → Preview. Báo cáo: file, SHA (cả 016b và 017), link Preview (nhánh + link riêng deployment), sw, kết quả test, **nội dung 0012 + khối test SQL**, nguồn + giấy phép sơ đồ cơ. **KHÔNG chạy migration, KHÔNG merge main.** STOP.

### B8. Checklist UAT cho Dino
1. Công cụ: ô "10 km hết 55 p 0 s" hiện đủ số; "10,9 km/h" dùng dấu phẩy.
2. Tiến độ: sơ đồ cơ giải phẫu đẹp, có thang màu, chạm bó cơ hiện số hiệp.
3. Khách: Hôm nay → "+ Buổi tự do" → thêm 2 bài → ghi → hoàn thành < 2 phút.
4. Coach: Hộp việc thấy "Buổi tự tập ngoài lịch" → mở xem → "Đã xem".
5. % tập 7 ngày không bị kéo xuống vì buổi tự do; bảng PR / sơ đồ cơ có bài vừa tập.
6. Coach tạo buổi ngoài lịch PT cho khách → hoàn thành → gói trừ 1 buổi.
