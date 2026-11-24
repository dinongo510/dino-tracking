# DINO-006 — Coach Platform Foundation

**Trạng thái:** PROPOSED (chờ `DINO-006 AUTHORIZED`)
**Agent thực hiện:** Antigravity · **UAT:** Dino
**Tài liệu gốc:** "DINO Coach Online — Đặc tả quy trình & sản phẩm" (mục 6, 7, 8) · SQL: `05_DINO_Coach_schema.sql`

> AG đọc `AGENTS.md` và 4 file trong `00_SYSTEM/` trước khi làm. Không rebuild kiến trúc, không đổi framework.
> "AG báo cáo" ≠ "đã kiểm chứng". Commit / push / merge / deploy là các bước tách riêng, chỉ làm khi Dino ra lệnh.

---

## 1. Mục tiêu

Dựng phần nền cho app dạy khách online tại `/coach/` trong repo `dino-tracking`: đăng nhập, phân quyền Coach/Khách bằng Supabase, màn hình chính theo vai trò. App tracking cá nhân ở thư mục gốc phải **không thay đổi hành vi**.

## 2. Phạm vi

**IN**

1. Thư mục `/coach/` với cấu trúc ở mục 3.
2. Migration `supabase/migrations/0001_dino_coach_schema.sql` (nội dung = file SQL đã duyệt, không sửa logic).
3. Kết nối Supabase bằng `supabase-js` v2 qua CDN ESM (ghim phiên bản cụ thể, ví dụ `@2.x.y`), không thêm bước build.
4. Màn hình: Đăng nhập · Đặt mật khẩu (từ link mời) · Quên mật khẩu · Trang chủ Coach · Trang chủ Khách · Đăng xuất.
5. Router theo vai trò: đọc `profiles.role` sau khi đăng nhập → `#/coach` hoặc `#/client`.
6. Trang chủ Coach: danh sách khách (tên, trạng thái, ngày tham gia), sửa tên/SĐT/trạng thái khách. Hướng dẫn mời khách hiển thị dạng ghi chú (mời qua Supabase Dashboard).
7. Trang chủ Khách: lời chào + khung "Hôm nay" để trống (placeholder cho DINO-010).
8. PWA riêng: `/coach/manifest.json` (`scope` và `start_url` = `/coach/`), `/coach/sw.js` chỉ cache tài nguyên tĩnh của `/coach/`, **không cache** request tới Supabase.

**OUT** (làm ở Change Set sau)

Form sức khỏe, số đo, InBody, ảnh (007) · thư viện bài v2 (008) · giáo án (009) · phiếu buổi tập, chat (010) · dinh dưỡng (011) · check-in (012) · dashboard (013) · AI Coach (005C) · di chuyển bất kỳ file nào của app cá nhân.

## 3. Cấu trúc repo

```
/                         ← APP CÁ NHÂN — GIỮ NGUYÊN
  index.html, css/, js/, sw.js, manifest.json, server.js, vercel.json
/coach/                   ← APP DẠY KHÁCH (mới)
  index.html
  manifest.json           scope "/coach/"
  sw.js                   scope "/coach/"
  css/coach.css
  js/config.js            SUPABASE_URL + ANON KEY (public-safe)
  js/supabaseClient.js
  js/auth.js              login, logout, set password, reset password
  js/router.js            hash router + role guard
  js/views/coach/home.js
  js/views/client/home.js
  icons/
/supabase/migrations/0001_dino_coach_schema.sql
```

**Luật bắt buộc**

1. Không sửa file nào ngoài `/coach/`, `/supabase/` và `vercel.json` (chỉ được thêm rule cho `/coach/` nếu cần). Nếu buộc phải sửa file khác → dừng, báo Dino.
2. `sw.js` gốc không được precache hay chặn đường dẫn `/coach/*`. Kiểm tra và báo cáo; nếu có xung đột → đề xuất, chưa sửa.
3. `/coach/` không đọc/ghi LocalStorage của app cá nhân. Key LocalStorage (nếu có) phải có tiền tố `dcoach_`.
4. **Không bao giờ** đưa `service_role` key vào repo. Chỉ dùng anon key (an toàn ở frontend vì có RLS).
5. Thư viện bài tập / corrective của app cá nhân: chưa dùng trong 006.

## 4. Việc Dino làm tay (AG viết hướng dẫn từng bước có ảnh chụp vị trí nút nếu được)

1. Tạo Supabase project mới, region Singapore. **Không** dùng lại project cũ đã bị pause.
2. SQL Editor → chạy `0001_dino_coach_schema.sql`.
3. Authentication → Sign In / Providers: tắt "Allow new users to sign up"; Email: bật.
4. Authentication → URL Configuration: Site URL = `<domain>/coach/`; Redirect URLs thêm `<domain>/coach/*` và `http://localhost:*/coach/*`.
5. Authentication → Users → "Add user" tạo tài khoản của Dino → chạy:
   `update public.profiles set role='coach', full_name='Ngô Đức Anh' where id='<UUID>';`
6. Settings → API: copy Project URL + anon key gửi AG điền vào `config.js`.
7. Mời 2 khách thử: Authentication → Users → "Invite user" (dùng 2 email phụ của Dino).

## 5. Tiêu chí UAT (Dino kiểm)

| # | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | Mở app cá nhân ở `/`, ghi 1 buổi tập, tải lại trang | Hoạt động như cũ, dữ liệu còn nguyên |
| 2 | Mở `/coach/` trên điện thoại → "Thêm vào màn hình chính" | Cài thành app riêng, tên và icon khác app cá nhân |
| 3 | Khách thử 1 bấm link mời → đặt mật khẩu | Vào thẳng Trang chủ Khách |
| 4 | Dino đăng nhập | Vào Trang chủ Coach, thấy 2 khách thử |
| 5 | Khách thử 1 đăng nhập | Không thấy khách thử 2 ở bất kỳ đâu |
| 6 | Khách thử 1 gõ thẳng `#/coach` | Bị đẩy về `#/client` |
| 7 | Quên mật khẩu → email → đặt lại | Đăng nhập lại được |
| 8 | Tìm "service_role" trong repo | Không có kết quả |
| 9 | Tắt mạng, mở `/coach/` | Hiện giao diện + thông báo "Mất kết nối", không trắng trang |

## 6. Báo cáo AG phải nộp

1. Danh sách file tạo/sửa (đường dẫn đầy đủ) + lý do.
2. Kết quả kiểm tra luật 1–5 ở mục 3.
3. Cách chạy thử local.
4. Rủi ro / việc còn mở.
5. Trạng thái đề xuất: IMPLEMENTED (chưa phải DONE).
