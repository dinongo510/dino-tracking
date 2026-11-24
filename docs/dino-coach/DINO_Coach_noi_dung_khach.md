# DINO Coach — Nội dung hiển thị cho khách

**Trạng thái:** PROPOSED · Dino duyệt câu chữ · Dùng cho DINO-007 (hồ sơ — theo phiếu giấy BFS), DINO-012 (check-in, báo cáo), tin nhắn mẫu trong app.
Giọng văn: xưng "Coach" – gọi khách bằng tên, câu ngắn, rõ, không thuật ngữ khi không cần.

---

## 1. Màn chào mừng (lần đầu đăng nhập)

> Chào {tên}! Coach Dino đây. Trước khi giao bài, Coach cần hiểu cơ thể và lịch sống của bạn. Mất khoảng 8 phút, có thể dừng giữa chừng và quay lại sau. Thông tin chỉ Coach xem được.

## 2. Hồ sơ sức khỏe — theo phiếu "Thông tin cá nhân của khách hàng" (BFS) + sàng lọc an toàn

Wizard 5 bước, giữ đúng thứ tự và câu chữ phiếu giấy của BFS để khách online và khách tại studio dùng chung một mẫu. Mã trường → cột `health_intakes` (0001 đã thêm cột).

### Bước 1 — Thông tin cá nhân
| Mã | Câu hỏi | Kiểu |
|---|---|---|
| full_name, phone | Họ và tên · Số điện thoại (→ `profiles`) | chữ |
| dob | Ngày sinh (app tự tính tuổi) | ngày |
| sex | Giới tính | Nam / Nữ |
| height_cm | Chiều cao (cm) | số |
| weight_kg | Cân nặng (kg) (→ `measurements`) | số |
| doctor_contact | Tên bác sĩ và số điện thoại (nếu có) | chữ |
| emergency_contact | Tên người liên lạc khẩn cấp và số điện thoại | chữ, **bắt buộc** |

### Bước 2 — Bài tập & mục tiêu
| Mã | Câu hỏi | Kiểu |
|---|---|---|
| current_activity | Bạn hiện đang tham gia những hoạt động thể dục nào (chạy, cử tạ, tập nhóm…)? | chữ |
| active_days_60min | Bạn tập ít nhất 60 phút ở cường độ trung bình bao nhiêu ngày mỗi tuần? | 0–7 |
| experience | Bạn đã tập tạ/chạy bao lâu? (bổ sung) | Chưa tập · < 6 tháng · 6–24 tháng · > 2 năm |
| goal_ratings | Mức quan trọng (0–10) của: Giảm cân · Tăng cơ · Thành tích thể thao · Cải thiện sức khỏe | 4 thanh trượt |
| goal | **Tự suy ra** từ điểm cao nhất (giảm cân → fat_loss, tăng cơ → muscle_gain, thành tích → performance, sức khỏe → recomp); bằng điểm → Coach chọn | tự động |

### Bước 3 — Ăn uống (`diet`)
| Mã | Câu hỏi | Kiểu |
|---|---|---|
| health_score | Bạn tự chấm chế độ ăn tổng thể lành mạnh mức nào? | 0–10 |
| current_diet | Bạn có đang theo chế độ ăn kiêng nào? Lý do? | chữ |
| salt / sugar / fat | Lượng muối · đường · chất béo hằng ngày | Thấp / Trung bình / Cao |
| snack_control | Mức kiểm soát cám dỗ đồ ăn vặt | 0–10 |
| alcohol_per_week | Số lần/ly đồ uống có cồn mỗi tuần | số |
| caffeine_per_week | Cà phê, trà, soda, nước tăng lực — bao nhiêu mỗi tuần? | số + chữ |
| meals_per_day, cook | Ăn mấy bữa/ngày? Ai nấu? (bổ sung cho meal plan) | số + Tự nấu / Gia đình / Ăn ngoài |
| food_avoid | Món không ăn được / dị ứng (bổ sung) | chữ |

### Bước 4 — Cách sống, nghề nghiệp, giải trí (`lifestyle`)
| Mã | Câu hỏi | Kiểu |
|---|---|---|
| sleep_rested | Bạn có ngủ đủ giấc và thức dậy thấy được nghỉ ngơi không? | Có / Thỉnh thoảng / Không |
| stress_score | Mức căng thẳng trung bình | 0–10 |
| stress_techniques | Bạn đang dùng cách nào để quản lý căng thẳng? | chữ |
| smoking | Bạn có hút thuốc lá / thuốc lá điện tử không? | Không / Có (bao nhiêu) |
| job | Nghề nghiệp của bạn? | chữ |
| job_sitting | Có phải ngồi lâu không? Giải thích | Có/Không + chữ |
| job_repetitive | Có động tác lặp đi lặp lại không? Giải thích | Có/Không + chữ |
| job_heels | Có phải đi giày có gót (công sở, bảo hộ)? | Có/Không |
| recreation | Hoạt động thể chất giải trí (bóng đá…)? | chữ |
| hobbies | Sở thích khác (làm vườn, câu cá, âm nhạc…)? | chữ |
| sessions_per_week, free_days, session_length, location, equipment | Lịch tập thực tế (bổ sung cho giáo án) | như bản trước |

### Bước 5 — Y khoa + sàng lọc an toàn
| Mã | Câu hỏi |
|---|---|
| injuries | Liệt kê chấn thương xương khớp trong quá khứ |
| surgeries | Liệt kê các cuộc phẫu thuật trong quá khứ |
| return_cleared | Nếu từng chấn thương/phẫu thuật: đã hồi phục và được bác sĩ cho phép vận động lại chưa? (Có / Chưa / Không áp dụng) |
| medical | Bệnh mạn tính (tim mạch, phổi, tăng huyết áp, tiểu đường, ung thư…)? Giải thích |
| medications | Thuốc đang dùng? Đã được bác sĩ cho phép vận động chưa? |
| parq | 7 câu Có/Không bên dưới (phiếu giấy BFS chưa có — nên bổ sung vào phiếu giấy) |
| notes | Ghi chú bổ sung |

**7 câu sàng lọc (theo nguyên tắc PAR-Q+)** — 1 câu "Có" → `parq_flag = true`:
1. Bác sĩ từng nói bạn có vấn đề về tim hoặc huyết áp cao?
2. Bạn có bị đau ngực khi nghỉ, khi sinh hoạt hằng ngày hoặc khi vận động?
3. Trong 12 tháng qua, bạn có bị chóng mặt mất thăng bằng hoặc ngất xỉu?
4. Bạn có bệnh mạn tính nào khác được bác sĩ chẩn đoán?
5. Bạn có đang dùng thuốc kê đơn cho bệnh mạn tính?
6. Bạn có vấn đề xương, khớp, cơ có thể nặng hơn khi tập?
7. Bác sĩ có từng dặn bạn chỉ nên vận động dưới giám sát y tế?

**Cờ đỏ tự động cho Coach** (`parq_flag = true` khi bất kỳ điều kiện nào): ≥ 1 câu sàng lọc "Có" · `return_cleared = Chưa` · có bệnh mạn tính hoặc thuốc mà chưa được bác sĩ cho phép.

**Thông báo khi có cờ đỏ:**
> Cảm ơn bạn đã trả lời thật. Coach sẽ nhắn bạn trong 24 giờ để hỏi thêm. Có thể Coach đề nghị bạn hỏi ý kiến bác sĩ trước khi bắt đầu, để mình tập an toàn và lâu dài.

**Ghi chú cho Dino:** khách có cờ đỏ nên làm bản PAR-Q+ chính thức (eparmedx.com).

## 3. Gợi ý tự động từ hồ sơ (Coach xem, sửa được)

| Dữ liệu hồ sơ | Gợi ý cho Coach |
|---|---|
| job_sitting = Có | Chú ý OHSA: võng lưng dưới, đổ người trước (gập hông ngắn) → kiểm tra giãn gập hông, kích hoạt mông |
| job_heels = Có | Chú ý OHSA: bàn chân xoay ngoài, đổ người trước (bắp chân ngắn) → kiểm tra cổ chân |
| job_repetitive = Có | Hỏi thêm động tác cụ thể; cân bằng mẫu chuyển động ngược chiều trong giáo án |
| sleep_rested = Không hoặc stress_score ≥ 7 | Khối lượng tập vừa phải giai đoạn đầu, ưu tiên ngủ trong check-in |
| snack_control ≤ 4 hoặc sugar = Cao | Meal plan có bữa phụ cố định; check meal tập trung bữa phụ |
| alcohol_per_week ≥ 4 | Đưa vào trao đổi tuần đầu; tính kcal đồ uống |
| smoking = Có | Ghi chú cho chạy/HYROX: tăng cường độ aerobic chậm hơn |
| active_days_60min ≤ 1 và experience = Chưa tập | Mẫu "Giảm mỡ – Nền tảng", RPE ≤ 7 tuần 1–2 |

## 4. Hệ số vận động gợi ý (`activity_factor`)
job_sitting = Có và active_days_60min ≤ 3 → 1,375 · job_sitting = Có và ≥ 4, hoặc đứng/đi lại và ≤ 3 → 1,55 · đứng/đi lại và ≥ 4, hoặc lao động chân tay → 1,725. Coach sửa được.

## 5. Check-in tuần (Chủ nhật)

Lời nhắc (hiện từ thứ 7):
> Cuối tuần rồi {tên}! Dành 2 phút check-in để Coach chỉnh kế hoạch tuần tới nhé.

| Mã | Câu hỏi | Kiểu |
|---|---|---|
| avg_weight_kg | Cân trung bình tuần này (app tự tính nếu bạn cân hằng ngày)? | số |
| sleep_score | Tuần này bạn ngủ thế nào? | 1 rất tệ – 5 rất tốt |
| stress_score | Mức căng thẳng tuần này? | 1 rất thấp – 5 rất cao |
| energy_score | Năng lượng khi tập? | 1 – 5 |
| hardest | Điều khó nhất tuần qua là gì? | chữ |
| client_note | Tuần tới bạn muốn Coach hỗ trợ gì thêm? | chữ |

## 6. Tin nhắn mẫu cho Coach (chèn nhanh trong app)

**7.1 Bàn giao giai đoạn**
> {tên} ơi, giai đoạn {số} – "{tên giai đoạn}" đã sẵn sàng! Mục tiêu 4 tuần tới: {mục tiêu}. Điểm cần chú ý: {1–2 ý}. Mỗi buổi ghi đủ số hiệp, rep, kg và RPE giúp Coach nhé — Coach dựa vào đó để tăng tải đúng lúc.

**7.2 Trả lời check-in — đúng hướng**
> Tuần này làm tốt lắm: {điểm sáng cụ thể}. Cân trung bình {xu hướng}, đúng hướng mình muốn. Tuần tới giữ nguyên kế hoạch, thêm một việc nhỏ: {1 việc}.

**7.3 Trả lời check-in — chững lại**
> Coach thấy {số liệu} đứng yên 2 tuần. Không sao, đây là chuyện bình thường. Tuần tới mình điều chỉnh: {điều chỉnh kcal / bước chân / buổi tập}. Bạn thấy phần nào khó làm nhất để Coach tính cách dễ hơn?

**7.4 Trả lời check-in — tuân thủ thấp**
> Tuần này có vẻ nhiều việc với bạn. Coach không chỉnh kcal vội — mình nói chuyện chút nhé: điều gì cản trở nhiều nhất, công việc, giấc ngủ hay việc ăn ngoài? Mình sẽ đơn giản hóa kế hoạch cho vừa sức.

**7.5 Phản hồi khi khách báo đau**
> Cảm ơn bạn đã báo. Buổi tới tạm bỏ {bài} và thay bằng {bài thay}. Mô tả giúp Coach: đau ở đâu, đau khi nào (lúc tập/sau tập/sáng dậy), kiểu đau (nhói/âm ỉ)? Nếu đau tăng, sưng, tê hoặc kéo dài > 1 tuần, bạn nên đi khám bác sĩ.

**7.6 Đạt PR / cột mốc**
> PR mới: {bài} {kg} × {rep}! 1RM ước tính tăng {x} kg so với đầu giai đoạn. Công sức của bạn đó!

**7.7 Nhắc khi bỏ buổi**
> Coach thấy tuần này còn {số} buổi chưa tập. Nếu bận, mình đổi sang bản rút gọn 30 phút nhé — làm ít vẫn hơn bỏ hẳn. Bạn muốn Coach gửi bản rút gọn không?

## 7. Báo cáo cuối giai đoạn — câu hỏi cho khách

1. Điều bạn tự hào nhất trong giai đoạn này?
2. Bài/buổi nào bạn thích nhất, bài nào ngại nhất?
3. Phần nào trong kế hoạch khó duy trì nhất (tập, ăn, ngủ)?
4. Mức hài lòng với kết quả (1–10) và vì sao?
5. Giai đoạn tới bạn muốn ưu tiên gì?
