# DINO-006 + DINO-007 — Code do Claude viết (chờ AG review + tích hợp)

**Trạng thái:** IMPLEMENTED (bản nháp ngoài repo) — chưa VERIFIED trên Supabase thật.

## Việc AG cần làm
1. Đọc `AGENTS.md` + `00_SYSTEM/`. Chép nguyên thư mục này vào `/coach/` của repo `dino-tracking`; `0001…0006.sql` vào `/supabase/migrations/`.
2. Kiểm tra luật DINO-006 mục 3 — đặc biệt `sw.js` gốc có chặn/precache `/coach/*` không (chỉ báo cáo, chưa sửa).
3. Điền `js/config.js` (URL + anon key Dino gửi). Không thêm service_role.
4. Chạy local (`npx serve .` hoặc server hiện có) → UAT theo bảng DINO-006 mục 5 với Supabase thật.
5. Báo cáo theo mẫu DINO-006 mục 6. Sửa gì so với bản này → ghi rõ lý do.

## Cấu trúc
```
coach/
  index.html · manifest.json (scope /coach/) · sw.js (scope /coach/, không cache Supabase)
  css/coach.css            design tokens + component dùng chung (card, btn, field, list, badge, tabbar, dialog, in A4)
  icons/icon-192.png, icon-512.png   (tạm — Dino thay logo thật)
  js/config.js             URL + anon key + supabase-js ghim 2.45.4 (CDN ESM, không build)
  js/supabaseClient.js     tải supabase-js lười; storageKey 'dcoach_auth'; viError() dịch lỗi
  js/auth.js               đăng nhập/xuất, đặt mật khẩu, quên mật khẩu, đọc loại link (invite/recovery)
  js/router.js             hash router + chặn theo vai trò (coach/client)
  js/ui.js                 render, esc (chống XSS), toast, tabbar, busy, watchOnline
  js/views/auth.js         Đăng nhập · Quên mật khẩu · Tạo mật khẩu
  js/views/coach/home.js   Danh sách khách + sửa tên/SĐT/trạng thái + hướng dẫn mời khách
  js/views/client/home.js  Lời chào + khung "Hôm nay" (placeholder cho 010)
  js/lib/formulas.js       công thức (13 test pass) — dùng từ 010/011
```

## Quy ước cho các Change Set sau
- View mới: `js/views/<role>/<tên>.js`, export `xxxView({ params, profile })`, đăng ký trong `app.js` bằng `route(path, view, 'coach'|'client')`.
- Mọi dữ liệu người dùng chèn vào HTML phải qua `esc()`.
- Mọi lỗi Supabase hiển thị bằng `toast(viError(err), 'error')`.
- Mọi thay đổi file trong `/coach/` phải tăng `VERSION` trong `coach/sw.js` (thêm file tĩnh mới thì thêm vào mảng `SHELL`).
- LocalStorage/SessionStorage: chỉ key tiền tố `dcoach_`.

## Đã kiểm thử (Chromium headless, viewport 390×844, Supabase giả lập)
| # | Kịch bản | Kết quả |
|---|---|---|
| 1 | Chưa đăng nhập mở /coach/ → về Đăng nhập | PASS |
| 2 | Sai mật khẩu → báo lỗi tiếng Việt | PASS |
| 3–4 | Khách đăng nhập → Trang chủ khách, thấy tên coach | PASS |
| 5 | Khách gõ `#/coach` → bị đẩy về `#/client` | PASS |
| 6 | Coach đăng nhập → thấy 2 khách | PASS |
| 7 | Coach sửa tên khách → cập nhật ngay | PASS |
| 8 | Không có lỗi JavaScript | PASS |

**Chưa kiểm được (cần Supabase thật):** link mời → tạo mật khẩu; link đặt lại mật khẩu; RLS thật; cài PWA trên điện thoại; hành vi offline của service worker.

---

## DINO-007 (đã viết thêm)
| File | Nội dung |
|---|---|
| `js/lib/intake.js` | Khai báo câu hỏi hồ sơ theo phiếu BFS (5 bước) + 7 câu sàng lọc; suy luận mục tiêu, cờ đỏ, hệ số vận động, gợi ý cho Coach. **Sửa câu chữ ở đây.** |
| `js/views/client/intake.js` | Wizard 5 bước: lưu mỗi bước, nhớ bước đang dở (`lifestyle.wizard_step`), bắt buộc liên hệ khẩn cấp + 7 câu sàng lọc, cân → `measurements` |
| `js/views/client/body.js` | Tab Cơ thể (khách) + Hồ sơ của bạn (xem, sửa từng bước) |
| `js/views/shared/body.js` | Số đo + InBody: danh sách mới nhất trước, chênh lệch ▲▼ có màu, nhãn ai nhập, nhập dấu phẩy hoặc chấm |
| `js/views/coach/client.js` | Chi tiết khách: cờ đỏ, tóm tắt, toàn bộ hồ sơ + In phiếu, gợi ý từ hồ sơ, ghi chú nội bộ, OHSA 5 bù trừ → nhóm cơ + bài corrective theo tag `ohsa:*` (4 bước), số đo/InBody |
| `/tests/coach/e2e_dino007.py` + `fake_supabase.js` + `formulas.test.mjs` | Kiểm thử trình duyệt với Supabase giả lập |

**Thay đổi schema kèm theo (đã có trong 0001):** ghi chú nội bộ chuyển sang bảng riêng `coach_notes` (RLS chỉ coach). Lý do: nếu để trong `health_intakes`, khách gọi API trực tiếp vẫn đọc được. Đã test trên Postgres: khách đọc 0 dòng, ghi bị chặn.

**Kiểm thử DINO-007: 15/15 PASS** — khách mới vào wizard · thiếu liên hệ khẩn cấp bị chặn · thoát giữa chừng tiếp tục đúng bước · câu "Có" → thông báo · cân từ wizard vào Số đo · thêm số đo hiện ▼1.5 · xem hồ sơ · coach thấy cờ đỏ · mục tiêu suy ra đúng · 3 gợi ý đúng · hệ số 1.375 · OHSA → bài corrective · khách không thấy ghi chú nội bộ · không lỗi JS.

**Phát hiện và đã sửa trong lúc test:** dòng ghi chú trong form làm hỏng bước 2; app nhảy cóc tới bước 5 khi tiếp tục; số đo cùng ngày bị so sánh sai thứ tự.

**Chưa làm trong 007:** ảnh tiến trình (tải 3 góc, nén WebP, so sánh 2 mốc) và ảnh phiếu InBody — làm tiếp theo brief DINO-007 mục 2.4. Kiểm thử 006 cũ (`#/client` hiện tên khách) không còn đúng vì khách chưa có hồ sơ giờ được đưa vào wizard — đã thay bằng bộ test 007.
