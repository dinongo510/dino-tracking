# DINO-018 — Thương hiệu DINOMET (tên app + logo + icon điện thoại)

**Trạng thái:** AUTHORIZED · **Agent:** Antigravity · **UAT:** Dino · Làm trên nhánh `feature/dino-coach-017-adhoc` (commit riêng, sau DINO-017) — hoặc nhánh mới từ đó.
**Không migration.** Không sửa app cá nhân (thư mục gốc).

## Tài sản đã có (Claude tạo từ logo Dino gửi, đã đặt sẵn trong repo, chưa commit)
`coach/icons/`:
- `icon-192.png`, `icon-512.png` (thay file cũ), `icon-maskable-512.png`, `apple-touch-icon.png` (180), `favicon-32.png` — nền đỏ bóng (ánh cam góc trên phải → đỏ thẫm → gần đen phía dưới), logo D trắng ở giữa, full-bleed (điện thoại tự bo góc).
- `logo-mark.png` (logo D trắng, nền trong suốt), `logo-wordmark.png` (chữ DINOMET trắng), `logo-full.png` (logo + chữ).

## Việc cần làm
1. `coach/manifest.json`: `name` = "DINOMET", `short_name` = "DINOMET", `description` = "DINOMET — huấn luyện & theo dõi tập luyện cùng Coach Dino"; `background_color` = "#120306", `theme_color` = "#7a0c16"; icons: 192 + 512 (`purpose: "any"`) + `icon-maskable-512.png` (`purpose: "maskable"`). Giữ `scope`/`start_url` = `/coach/`.
2. `coach/index.html`: `<title>DINOMET</title>`, `<link rel="icon" href="/coach/icons/favicon-32.png">`, `<link rel="apple-touch-icon" href="/coach/icons/apple-touch-icon.png">`, `<meta name="apple-mobile-web-app-title" content="DINOMET">`, `<meta name="theme-color" content="#7a0c16">`.
3. Màn **Đăng nhập / Đặt mật khẩu / Quên mật khẩu** (`coach/js/views/auth.js`): thay chữ "DINO Coach" bằng `logo-full.png` (rộng ~180 px, căn giữa) + dòng phụ hiện có. Có `alt="DINOMET"`.
4. Mọi chỗ hiện chữ "DINO Coach" cho người dùng (tiêu đề trang, toast, thông báo, mẹo "thêm DINO Coach vào màn hình chính"…) → "DINOMET". Không đổi tên key `dcoach_`, tên file, tên bảng.
5. Đầu trang Hôm nay (khách) và trang chủ coach: logo-mark nhỏ (24 px) cạnh lời chào — tinh tế, không chiếm chỗ.
6. **Màu mặc định của giao diện** (`coach/js/lib/theme.js`, `index.html` script áp màu trước khi vẽ): đổi hue mặc định từ 25 sang **hue đỏ của logo (≈ 355)**, thêm swatch "Đỏ DINOMET" đứng đầu danh sách 5 màu có sẵn. Người dùng đã chọn màu khác (`dcoach_hue` đã lưu) thì giữ nguyên.
7. `coach/sw.js`: tăng version (+1 so với bản hiện tại của nhánh), thêm các file icon/logo mới vào SHELL.
8. Test: cập nhật test có kiểm chữ "DINO Coach" (nếu có); thêm kiểm: manifest có name DINOMET + 3 icon, trang đăng nhập có ảnh logo, hue mặc định 355 khi chưa lưu `dcoach_hue`. Chạy lại toàn bộ unit + e2e.
9. Commit: `"DINO-018: thương hiệu DINOMET — tên app, logo, icon, màu đỏ mặc định"`, push. Báo cáo SHA + link Preview. **KHÔNG merge main.** STOP.

## Checklist UAT cho Dino
1. Mở link Preview trên điện thoại → "Thêm vào màn hình chính" → icon đỏ logo D, tên **DINOMET**.
2. Trang đăng nhập có logo + chữ DINOMET.
3. Lần đầu mở (chưa chọn màu) giao diện ánh đỏ; vào Hồ sơ đổi màu khác vẫn được, có swatch "Đỏ DINOMET".
4. Lưu ý: điện thoại đã cài app cũ có thể giữ icon cũ — xóa icon cũ rồi thêm lại.
