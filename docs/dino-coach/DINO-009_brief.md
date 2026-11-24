# DINO-009 — Trình tạo giáo án (Program Builder)

**Trạng thái:** PROPOSED · **Phụ thuộc:** 006, 008 LOCKED · **UAT:** Dino
**Bảng:** `programs → phases → sessions → session_blocks → block_items` · Đặc tả mục 4 (M5), 5.5

> Đọc `AGENTS.md` + `00_SYSTEM/`. Chỉ sửa `/coach/`, `/supabase/`.

## 1. Mục tiêu
Dino dựng một giai đoạn 4 tuần cho 1 khách trong ≤ 20 phút, gồm tạ, superset, circuit, chạy, HYROX, corrective; theo mô hình tuyến tính, phi tuyến tính (DUP) hoặc block; phát hành cho khách.

## 2. Phạm vi IN

**2.1 Cấu trúc & điều hướng (Coach)**
Khách → Chương trình → Giai đoạn (tab) → lưới Tuần × Ngày → mở Buổi → danh sách Khối → Bài trong khối.

**2.2 Tạo chương trình** — tên, mô hình (`linear | undulating | block | custom`), ngày bắt đầu. Tạo giai đoạn: tên, mục tiêu, số tuần (mặc định 4), ghi chú bàn giao. Ngày bắt đầu/kết thúc tự tính nối tiếp.

**2.3 Buổi tập** — tiêu đề, loại (`strength | run | hyrox | circuit | corrective | mixed`), ghi chú coach. Ngày tự tính từ tuần + ngày trong tuần.

**2.4 Khối** — chọn kiểu, form đổi theo kiểu:

| Kiểu | Trường hiện |
|---|---|
| straight | (không thêm) |
| superset | nhãn A1/A2 tự đánh |
| circuit | số vòng, giây làm, giây nghỉ |
| emom / amrap / for_time | thời lượng hoặc time cap |
| run | (bài chạy dùng cự ly/thời gian/pace/vùng tim ở mức bài) |
| hyrox | số vòng; gợi ý chèn "Chạy compromised 1 km" giữa các trạm |
| corrective | nút "Lấy từ đánh giá OHSA gần nhất" → tự thêm 4 bước theo tag `ohsa:*` |

**2.5 Bài trong khối** — tìm từ thư viện (dùng lại component 008). Trường: hiệp, rep min–max, tải (chọn 1: kg / %1RM / RPE), tempo, nghỉ, cự ly, thời lượng, pace, vùng tim, ghi chú. Trường không liên quan theo category thì ẩn.

**2.6 Quy tắc tăng tải (`progression_rule` json)**
- `{"type":"none"}`
- `{"type":"double","upper_kg":2.5,"lower_kg":5}` — dùng ở DINO-010 để gợi ý.
- `{"type":"linear_weekly","step_kg":2.5}` hoặc `{"type":"linear_weekly","step_pct":2.5}`
- `{"type":"rpe_wave","weeks":[7,7.5,8,6]}`
- `{"type":"dup","days":{"1":"heavy","2":"light","3":"medium"}}` + bảng mặc định heavy 3–5 rep / medium 6–10 / light 12–15.
Nút **"Sinh các tuần còn lại"**: từ tuần 1 đã soạn, tạo tuần 2…N theo quy tắc của từng bài; tuần cuối tùy chọn deload (giảm 40% số hiệp, RPE −2). Dino sửa tay sau khi sinh.

**2.7 Thao tác nhanh** — chép buổi, chép tuần, kéo thả thứ tự khối/bài, lưu giai đoạn thành **Mẫu** (bảng mới `program_templates`: `coach_id`, `name`, `payload jsonb`; chỉ coach đọc/ghi) và áp mẫu cho khách khác.

**2.8 Phát hành** — nút Phát hành giai đoạn: `phases.status = published`, `programs.status = published`. Khách chỉ thấy giai đoạn đã phát hành (lọc ở truy vấn). Sửa sau phát hành vẫn được, hiện nhãn "Coach đã cập nhật" cho khách.

**2.9 Phía khách** — tab "Lịch tập": tuần hiện tại, mỗi ngày 1 thẻ (tiêu đề, loại, số bài); mở thẻ → xem buổi (chỉ đọc; ghi kết quả ở 010). Đầu giai đoạn hiện mục tiêu + ghi chú bàn giao.

## 3. OUT
Ghi kết quả, chat, gợi ý tăng tải theo kết quả thực (010) · dashboard (013).

## 4. Migration kèm
`0006_program_templates.sql`: bảng `program_templates` + RLS `coach_id = auth.uid()`.

## 5. UAT
| # | Kiểm tra | Mong đợi |
|---|---|---|
| 1 | Dựng giai đoạn 4 tuần × 3 buổi, linear | ≤ 20 phút; tuần 2–4 tải tăng đúng bước |
| 2 | Mô hình DUP | Ngày 1/2/3 ra heavy/light/medium đúng dải rep |
| 3 | Khối circuit 4 vòng 40/20 | Khách thấy đúng vòng, giây làm/nghỉ |
| 4 | Buổi HYROX 4 trạm | Có chạy compromised xen giữa |
| 5 | Khối corrective từ OHSA "gối đổ vào" | Tự thêm đủ 4 bước |
| 6 | Lưu mẫu, áp cho khách khác | Bản sao độc lập, sửa không ảnh hưởng bản gốc |
| 7 | Khách xem trước khi phát hành | Không thấy gì |
| 8 | Phát hành | Khách thấy lịch tuần hiện tại |
