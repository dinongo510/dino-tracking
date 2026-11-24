# DINO-008 — Thư viện bài tập v2

**Trạng thái:** PROPOSED · **Phụ thuộc:** DINO-006 LOCKED (làm song song được với 007) · **UAT:** Dino
**Migration:** `0002_exercise_library_seed.sql` (đã chạy thử trên Postgres 16: 8 HYROX, 6 chạy, 27 corrective; mỗi bù trừ OHSA đủ 4 bước)

> Đọc `AGENTS.md` + `00_SYSTEM/`. Chỉ sửa `/coach/`, `/supabase/`, `/tools/`. Không đụng thư viện bài của app cá nhân.

## 1. Mục tiêu
Kho bài có ảnh, tên Việt, cue, link video; Dino tìm được bài trong 3 giây để kéo vào giáo án; khách xem được chi tiết bài được giao.

## 2. Phạm vi IN
1. Chạy migration 0002, rồi `0003_dino_core_exercises.sql` (130 bài cốt lõi của Dino, `featured = true`, tag `dino_core`).
2. **Script import một lần** `tools/import_free_exercise_db.mjs` (Node, chạy trên máy Dino):
   - Đọc `dist/exercises.json` của repo `yuhonas/free-exercise-db` (public domain).
   - Ánh xạ: `id → external_id`, `name → name_en`, `primaryMuscles/secondaryMuscles`, `equipment → equipment[]`, `category`, `instructions → cues` (nối thành đoạn), `images → image_urls` với tiền tố `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/`.
   - `name_vi` để trống = `name_en` tạm; `source = 'free-exercise-db'`.
   - Xuất ra `supabase/seed/0005_free_exercise_db.sql` (insert … on conflict (external_id) do nothing). Dino chạy file này trong SQL Editor. **Không** nhúng service_role key vào script.
3. **Màn Thư viện (Coach):**
   - Tìm theo tên Việt/Anh (lọc phía client, không phân biệt dấu: "dây" khớp "day").
   - Lọc: category, nhóm cơ chính, dụng cụ, tag (hyrox, run, corrective, ohsa:*), "Bài hay dùng".
   - Bài `featured` lên đầu.
   - Thẻ bài: ảnh đầu tiên, tên Việt, tên Anh nhỏ, nhóm cơ.
4. **Sửa bài (Coach):** tên Việt, cue (2–3 dòng), link video YouTube, tag, featured, corrective_step. Thêm bài mới (`is_custom = true`).
5. **Import nhanh danh sách của Dino:** dán CSV `name_en;name_vi;video_url;cues` → khớp theo `name_en` (không phân biệt hoa thường) → cập nhật + bật `featured`; dòng không khớp → tạo bài custom. Hiện bảng xem trước trước khi lưu.
6. **Chi tiết bài (Khách + Coach):** ảnh (vuốt qua lại), cue, nút mở video YouTube.
7. Bộ đệm: tải toàn bộ bảng `exercises` một lần mỗi phiên (~900 dòng), lưu `sessionStorage` key `dcoach_exercises`.

## 3. OUT
Kéo bài vào giáo án (009) · tạo video.

## 4. UAT
| # | Kiểm tra | Mong đợi |
|---|---|---|
| 1 | Chạy script + seed | ≥ 800 bài có ảnh hiển thị |
| 2 | Gõ "squat" | Kết quả < 1 giây |
| 3 | Lọc tag `ohsa:knees_in` | 11 bài, đủ 4 bước |
| 4 | Dán CSV 10 dòng của Dino | Xem trước đúng, lưu xong 10 bài thành "hay dùng" |
| 5 | Khách mở chi tiết bài | Xem ảnh, cue, video; không có nút sửa |
| 6 | Khách gọi API sửa bài | Bị RLS chặn |
