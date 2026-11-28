# DINO-019 — Làm lại giao diện DINOMET v2 (UI/UX) + icon mới

**Trạng thái:** AUTHORIZED · **Agent:** Antigravity viết code + test · **Review:** Claude · **UAT:** Dino
**Nhánh:** `feature/dino-coach-019-ui-v2` tạo từ `main` (merge `37476c9`, `dcoach-v26`). **Không migration. Không đổi logic/dữ liệu** — chỉ giao diện.
**Bản mẫu Dino đã duyệt** (trang "DINOMET v2", 3 màn): https://claude.ai/artifact/Xt1McUsfGyJnfKH7Pu2odm — Dino sẽ gửi ảnh chụp nếu AG không mở được link. Dino chốt: **phong cách mới OK, màu nút giữ kiểu "kính tối ánh đỏ" như hiện tại** (KHÔNG nút đặc đỏ, KHÔNG nút trắng).
**Tham khảo kỹ năng:** có thể cài skill UI UX Pro Max (github.com/nextlevelbuilder/ui-ux-pro-max-skill, có bản cho Antigravity `.agent/workflows/`) để tra quy tắc — nhưng **bản mẫu + brief này là chuẩn cuối cùng**; skill chỉ để tham khảo, không tự đổi phong cách.

## 1. Icon mới (Claude đã đặt sẵn trong `coach/icons/`, chưa commit)
`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png`, `logo-mark.png` — logo D to (~64% icon) và đậm hơn, nền đỏ tỏa sáng giữa. Chỉ cần commit + tăng `sw.js` version để điện thoại nhận icon mới.

## 2. Quy tắc giao diện (áp dụng TOÀN BỘ app coach + khách)
**Chữ**
- Font chính giữ **Be Vietnam Pro**. Thêm **Barlow Condensed 600/700** (Google Fonts, hỗ trợ tiếng Việt) **chỉ cho con số lớn** (chỉ số, %, kg, phút, hiệp, km, pace) — lớp `.num`.
- Thang chữ mobile: H1 **24 px/700**, 1 dòng (quá dài thì `text-overflow: ellipsis`), H2 18 px/600, thân 15 px, phụ 13 px, nhãn tab 11 px. Không chỗ nào H1 > 24 px trên màn ≤ 430 px.
- Chào: "Chào buổi sáng, Đức Anh" — dùng **2 chữ cuối của tên** (tên gọi), 1 dòng.
- Bỏ chữ IN HOA giãn cách cho nhãn (vd "CHECK-IN TUẦN", "BUỔI KẾ TIẾP") → chữ thường 13 px màu nhấn nhạt.

**Nút**
- **Không nút nào được xuống dòng**: mọi `.btn` có `white-space: nowrap`. Nhãn dài → rút gọn hoặc thành **nút biểu tượng 44×44** có `aria-label` (vd "Dán danh sách" = biểu tượng clipboard).
- Màu nút **giữ kiểu hiện tại**: nền tối pha đỏ + viền gradient đỏ→cam + chữ đỏ nhạt + glow nhẹ (`.btn--primary` hiện có, theo `--h`). Nút phụ: kính mờ viền mảnh. Không nút đặc.
- Chạm tối thiểu 44 px.

**Thanh trên cùng (mọi màn chính)**
- Trái: `logo-mark` 26 px + chữ **DINOMET** (15 px/700, giãn chữ nhẹ); coach thêm nhãn nhỏ "Coach".
- Phải: **vòng tròn chữ viết tắt** (40 px). Bấm → menu (sheet dưới đáy): Đổi màu giao diện (bộ chọn màu chuyển vào đây, BỎ khỏi trang chủ coach), Về Coach (khi ở "Tập của tôi"), Mở "Tập của tôi" (coach), Hồ sơ, Đăng xuất.
- Bỏ các nút chữ "Đăng xuất", "← Về Coach", "+ Buổi tự do" khỏi đầu trang.

**Khách · Hôm nay** (theo artboard v2-HomNay)
- Dòng ngày ("Chủ nhật 29/11") + H1 chào.
- Thẻ **Buổi kế tiếp**: tên buổi 22 px, danh sách bài 1 dòng, 3 số lớn (phút · bài · hiệp) font `.num`, nút "Bắt đầu tập" rộng.
- 3 ô **Tập / Ăn đúng / Cân TB**: Tập & Ăn là **vòng tròn tiến độ SVG** (số % ở giữa), Cân là số lớn + mũi tên xu hướng.
- Thẻ check-in, công cụ: dạng hàng (biểu tượng vuông bo + tiêu đề + 1 dòng phụ).
- **"Buổi tự do" = 1 nút nổi (FAB)** góc phải dưới, trên thanh tab, kiểu kính đỏ; bỏ mọi nút "+ Buổi tự do" khác trên Hôm nay. Khi chưa có lịch: thẻ trống chỉ còn 1 câu + gợi ý dùng nút nổi.
- Thanh tab khách: Hôm nay · Lịch tập · Ăn · **Tiến độ** (đổi tên từ "Cơ thể", vẫn chứa số đo/ảnh + biểu đồ) · Hồ sơ — hiện nhãn dưới mọi biểu tượng, tab đang chọn tô màu nhấn.

**Coach · Khách** (theo artboard v2-CoachKhach)
- H1 "Khách của bạn" + dòng "2 đang tập, 1 cần chú ý" + nút biểu tượng "+" (mời khách → mở hướng dẫn mời).
- Mỗi khách = 1 thẻ bấm được cả thẻ (mở trang khách): avatar chữ cái có vòng (đỏ nếu cần chú ý), tên + nhãn hình thức, giai đoạn · tuần (1 dòng), 3 chỉ số (Tập 7 ngày / Ăn đúng / Cân 2 tuần) số `.num` + thanh mảnh, 1 dòng lý do màu vàng. **Bỏ dòng lý do lặp số %** (chỉ ghi lý do không phải số đã hiện, vd "Chưa check-in tuần này", "Gói còn 1 buổi").
- Bỏ 2 nút "Tiến độ" / "Sửa" trên thẻ: "Tiến độ" vào trang khách; "Sửa" vào trang khách (nút biểu tượng bút ở đầu trang).
- Khách chưa có giáo án: nút viền đứt "Soạn giáo án đầu tiên".
- "Tập của tôi" = 1 hàng gọn (biểu tượng + tiêu đề + 1 dòng phụ + mũi tên).
- Hộp việc trên thanh tab có **số đỏ** đếm việc chờ.

**Coach · Thư viện** (theo artboard v2-ThuVien)
- H1 "Thư viện" 1 dòng + nút biểu tượng (Dán danh sách) + nút "+ Bài mới".
- **3 tab trượt**: Bài tập · Món ăn · Công cụ (thay link "Kho món ăn →", "Công cụ hỗ trợ →").
- Ô tìm có biểu tượng kính lúp; bộ lọc → **hàng chip vuốt ngang** (★ Hay dùng, Nhóm cơ, Dụng cụ, Nhãn…) mở sheet chọn.
- Hàng bài: ảnh 56 px bo 14, tên + "tên Anh · nhóm cơ", nút "⋯" (Sửa, ★) thay nút "Sửa".

**Các màn còn lại** (Lịch tập, Ăn, Phiếu tập, Tiến độ, trang khách, giáo án, soạn buổi, Hộp việc, check-in, báo cáo, gói tập, Công cụ, Hồ sơ): áp **cùng quy tắc chữ / nút / thanh trên cùng**, không cần đổi bố cục lớn; rà mọi chỗ chữ xuống dòng xấu, nút gãy chữ, chữ IN HOA nhãn, thông tin lặp.

## 3. Kỹ thuật
- Tập trung vào `coach/css/coach.css` (biến, `.num`, `.btn` nowrap, `.topbar`, `.fab`, `.ring`, `.chips`, `.seg`) + `coach/js/ui.js` (hàm `topbar()`, `accountSheet()`, `ring(pct)`); sửa các view tương ứng. Màu vẫn theo `--h` (mặc định 355).
- `coach/sw.js` → tăng version, thêm font Barlow Condensed vào preconnect (không cache Google Fonts nếu hiện chưa cache).
- Không đổi route, không đổi logic, key `dcoach_`, bảng.
- Test: cập nhật selector trong `tests/coach/e2e_*.py` nếu đổi chỗ nút (giữ `id`/`data-*` cũ khi có thể để ít phải sửa test); thêm `e2e_ui_v2.py` (cổng **8783**): ở 375 px và 390 px không nút nào có chiều cao > 1 dòng chữ (đo `scrollHeight` so line-height) và không tràn ngang trên 10 màn chính; H1 ≤ 24 px; trang chủ coach không còn bộ chọn màu; menu tài khoản mở được, có Đăng xuất / Đổi màu; FAB Buổi tự do mở màn tạo buổi; tab khách có "Tiến độ". Chạy lại toàn bộ unit + e2e.
- Commit: `"DINO-019: giao diện DINOMET v2 — thanh trên cùng, chữ gọn, nút không gãy dòng, vòng tiến độ, icon mới"`, push → Preview. Cập nhật handover. **KHÔNG merge main.** STOP.

## 4. Checklist UAT cho Dino (trên điện thoại)
1. Xóa icon cũ → thêm lại: icon D to, đậm như UpRace.
2. Không thấy nút nào chữ bị xuống 2 dòng; tiêu đề không gãy tên.
3. Thanh trên cùng: logo DINOMET + vòng tên; bấm vòng tên → menu Đổi màu / Đăng xuất / Tập của tôi.
4. Hôm nay: vòng tròn % Tập/Ăn, số kiểu đồng hồ thể thao, nút nổi "Buổi tự do".
5. Coach: thẻ khách gọn, bấm cả thẻ vào khách, không còn dòng % lặp; Thư viện có 3 tab Bài tập / Món ăn / Công cụ.
6. Nút vẫn kiểu kính tối ánh đỏ như cũ.
