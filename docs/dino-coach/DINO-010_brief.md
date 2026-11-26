# DINO-010 — Phiếu buổi tập + Chat thời gian thực

**Trạng thái:** PROPOSED · **Phụ thuộc:** 009 LOCKED · **UAT:** Dino
**Bảng:** `set_logs`, `session_feedback`, `messages` (Realtime đã bật ở 0001) · Đặc tả mục 3 bước 7, 5.5
**Mốc:** xong 010 = MVP, nhận khách thật.

> Đọc `AGENTS.md` + `00_SYSTEM/`. Chỉ sửa `/coach/`, `/supabase/`.

## 1. Mục tiêu
Khách ghi 1 buổi trong < 1 phút trên điện thoại; Dino thấy kết quả và bình luận ngay lập tức; hệ thống gợi ý tăng tải và cảnh báo.

## 2. Phạm vi IN

**2.1 Phiếu buổi tập (Khách)** — mở từ "Hôm nay" hoặc Lịch tập.
- Mỗi bài: dòng cho từng hiệp, điền sẵn mục tiêu (rep, kg) → khách chỉ sửa khi khác; tick ✓ là lưu hiệp (upsert theo `block_item_id + set_no`).
- Ô RPE từng hiệp (tùy chọn) dạng nút 6–10.
- Bài chạy: cự ly, thời gian (tự tính pace), HR trung bình.
- Circuit/EMOM/AMRAP: đồng hồ đếm trên màn hình (làm/nghỉ, số vòng), ghi số vòng/rep hoàn thành.
- Đồng hồ nghỉ tự chạy sau khi tick hiệp (theo `rest_sec`), rung khi hết.
- Cuối buổi: RPE cả buổi, đau (chọn vùng + mức 1–5), ghi chú → `session_feedback`, `completed = true`.
- Mất mạng giữa buổi: lưu tạm `localStorage` key `dcoach_pending_logs`, tự đồng bộ khi có mạng; hiện trạng thái "Chưa đồng bộ".

**2.2 Chat trong phiếu** — khung bình luận dưới phiếu (`messages.context_type = 'session'`, `context_id = session_id`). Realtime: tin mới hiện ngay ở cả hai phía. Đánh dấu đã đọc (`read_at`) khi mở. Chấm đỏ ở thẻ buổi khi có tin chưa đọc.

**2.3 Phía Coach**
- **Hộp việc** (trang chủ Coach): buổi vừa xong chưa xem (`coach_reviewed = false`), tin chưa đọc, cảnh báo. Sắp xếp: cảnh báo → tin → buổi.
- Xem phiếu: mục tiêu vs thực tế từng hiệp (tô màu: đạt / vượt / hụt), tổng khối lượng tạ buổi, 1RM ước tính (Epley) bài chính, nút "Đã xem".
- Sửa nhanh buổi kế tiếp từ gợi ý (xem 2.4) → cập nhật `block_items` của buổi đó.

**2.4 Gợi ý tăng tải (chỉ gợi ý, Dino bấm áp dụng)**
- `double`: mọi hiệp đạt `reps_max` với RPE ≤ 8 (hoặc không ghi RPE) → buổi kế tiếp cùng bài: +`upper_kg`/+`lower_kg` (thân dưới = nhóm cơ chính thuộc quads, hamstrings, glutes, calves, adductors, abductors).
- Hụt `reps_min` ≥ 2 hiệp → gợi ý giữ tải hoặc −5%.

**2.5 Cảnh báo** (bảng mới `alerts`: `client_id, kind, ref_id, message, resolved_at`; ghi bằng trigger hoặc khi lưu feedback)
- Khách ghi đau (bất kỳ mức).
- RPE buổi ≥ 9.5 hai buổi liên tiếp.
- Tuần trước có ≥ 2 buổi đã lên lịch mà không hoàn thành (kiểm tra khi Dino mở app).
- Tổng km chạy tuần > 110% trung bình 4 tuần trước.

## 3. OUT
Thông báo đẩy (sau MVP) · dinh dưỡng (011) · check-in tuần (012) · biểu đồ (013).

## 4. Migration kèm
`0007_alerts.sql`: bảng `alerts` + RLS kiểu "khách + coach" (khách chỉ đọc), index `(client_id, resolved_at)`.

## 5. UAT
| # | Kiểm tra | Mong đợi |
|---|---|---|
| 1 | Khách ghi buổi 5 bài × 3 hiệp, không đổi số | < 1 phút |
| 2 | Hai điện thoại: khách bình luận | Dino thấy trong ≤ 2 giây, không tải lại trang |
| 3 | Tắt mạng giữa buổi, bật lại | Không mất hiệp nào |
| 4 | Đạt đỉnh rep 3/3 hiệp RPE 8 (squat) | Gợi ý +5 kg buổi sau |
| 5 | Khách ghi đau gối mức 3 | Cảnh báo đầu hộp việc Dino |
| 6 | Dino bấm "Đã xem" | Buổi rời hộp việc |
| 7 | Khách A đọc tin của khách B (gọi API) | Bị chặn |
| 8 | App cá nhân ở `/` | Không đổi |
