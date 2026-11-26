# DINO-007 — Hồ sơ khách & Đánh giá

**Trạng thái:** PROPOSED · **Phụ thuộc:** DINO-006 LOCKED · **UAT:** Dino
**Tài liệu gốc:** Đặc tả mục 3 (bước 2–3), 4 (M1–M3), 5.4 · Bảng: `health_intakes`, `measurements`, `inbody_scans`, `progress_photos`, `assessments`

> Đọc `AGENTS.md` + `00_SYSTEM/` trước. Chỉ sửa trong `/coach/`. Luật mục 3 của DINO-006 vẫn áp dụng.

## 1. Mục tiêu
Khách tự điền hồ sơ sức khỏe ngay lần đầu đăng nhập; khách và Dino cùng nhập số đo, InBody, ảnh tiến trình; Dino ghi đánh giá OHSA và nhận gợi ý corrective.

## 2. Phạm vi IN

**2.1 Onboarding khách (wizard 5 bước, chỉ hiện khi chưa có `health_intakes`)**
Câu hỏi, mã trường, kiểu nhập: **đúng theo `DINO_Coach_noi_dung_khach.md` mục 2** (bám phiếu giấy "Thông tin cá nhân của khách hàng" của BFS + 7 câu sàng lọc). Bước: 1 Thông tin cá nhân · 2 Bài tập & mục tiêu · 3 Ăn uống · 4 Cách sống, nghề nghiệp, giải trí · 5 Y khoa + sàng lọc.
- Mỗi bước lưu ngay (thoát giữa chừng vẫn giữ). Có nút Quay lại. `emergency_contact` bắt buộc.
- `goal` tự suy từ `goal_ratings`; `activity_factor` và các gợi ý ở mục 3–4 của file nội dung hiện cho Coach ở trang chi tiết khách (khung "Gợi ý từ hồ sơ").
- Cờ đỏ theo quy tắc mục 2 bước 5 của file nội dung.
- Nút **"In phiếu"** (Coach): xuất hồ sơ đã điền theo bố cục phiếu giấy BFS (window.print, CSS in A4) để lưu hồ sơ studio.

**2.2 Số đo** — form 1 màn hình: ngày, cân, cổ, ngực, eo, hông, tay, đùi, ghi chú. Danh sách lịch sử mới nhất trên cùng, hiện chênh lệch so với lần trước (▲/▼). Hiện người nhập (Coach/Khách).

**2.3 InBody** — form: ngày, cân, SMM, PBF, FFM, mỡ nội tạng, BMR InBody + chụp ảnh phiếu. Lịch sử như 2.2.

**2.4 Ảnh tiến trình**
- Khách chọn ngày + chụp/tải 3 góc (trước, nghiêng, sau). Khung hướng dẫn tư thế (đứng thẳng, cùng nền, cùng giờ).
- Nén trên máy trước khi tải: canvas → WebP, cạnh dài 1280 px, chất lượng 0.8 (mục tiêu ≤ 250 KB). Ảnh phiếu InBody áp dụng tương tự.
- Đường dẫn: `progress/<client_id>/<yyyy-mm-dd>_<angle>_<6 ký tự ngẫu nhiên>.webp`. Hiển thị bằng signed URL 1 giờ.
- Màn so sánh: chọn 2 ngày → hiện 2 cột cạnh nhau theo từng góc.

**2.5 Đánh giá OHSA (chỉ giao diện Coach)**
- 5 ô chọn: bàn chân xoay ngoài, gối đổ vào trong, đổ người trước quá mức, võng lưng dưới, tay đổ về trước (+ ghi chú, mặt trước/mặt bên).
- Lưu vào `assessments.ohsa` dạng `{"feet_turn_out":true,...}`.
- Gợi ý corrective: tra bảng ở Đặc tả mục 5.4 → hiện nhóm cơ overactive / underactive và **bài mặc định** lấy từ `exercises` có tag `ohsa:<mã>` (seed ở DINO-008; nếu 008 chưa xong thì chỉ hiện tên nhóm cơ). Nếu bộ chấm điểm DINO-005B dùng lại được ở chế độ chỉ đọc thì dùng, không sửa file gốc.
- Mã chuẩn: `feet_turn_out`, `knees_in`, `forward_lean`, `low_back_arch`, `arms_forward`.

**2.6 Trang chi tiết khách (Coach)** — tab: Hồ sơ | Số đo | InBody | Ảnh | Đánh giá. Cờ đỏ PAR-Q hiện ngay đầu trang. Ô "Ghi chú nội bộ" (`coach_notes`) khách không thấy.

**2.7 Trang khách** — menu dưới: Hôm nay | Cơ thể (Số đo, InBody, Ảnh) | Hồ sơ.

## 3. OUT
Biểu đồ (013) · tính BMR/TDEE (011) · đưa bài corrective vào giáo án (009).

## 4. Lưu ý kỹ thuật
- Ghi chú nội bộ ở bảng `coach_notes` (0001), không nằm trong `health_intakes`.
- Số thập phân: chấp nhận cả dấu phẩy và dấu chấm khi nhập.
- Form dùng được 1 tay trên điện thoại, nút ≥ 44 px, bàn phím số cho ô số.

## 5. UAT
| # | Kiểm tra | Mong đợi |
|---|---|---|
| 1 | Khách mới đăng nhập lần đầu | Vào wizard; thoát ở bước 3 rồi vào lại → tiếp tục bước 3 |
| 2 | Trả lời "Có" 1 câu PAR-Q | Dino thấy cờ đỏ ở danh sách khách và trang chi tiết |
| 3 | Khách nhập số đo, Dino nhập InBody | Cả hai thấy cả hai bản ghi, ghi đúng người nhập |
| 4 | Tải ảnh 12 MP | File lưu ≤ 250 KB, xem rõ |
| 5 | Khách A mở signed URL ảnh của khách B (dán link đường dẫn) | Bị từ chối |
| 6 | So sánh ảnh 2 mốc | 3 cặp ảnh cạnh nhau |
| 7 | Dino tick "gối đổ vào trong" | Hiện nhóm cơ đúng bảng 5.4 + bài mặc định (nếu 008 xong) |
| 8 | Khách xem hồ sơ của mình | Không thấy ghi chú nội bộ |
| 9 | App cá nhân ở `/` | Không đổi |

## 6. Báo cáo AG
File tạo/sửa · kết quả luật DINO-006 mục 3 · rủi ro/việc mở · trạng thái IMPLEMENTED.
