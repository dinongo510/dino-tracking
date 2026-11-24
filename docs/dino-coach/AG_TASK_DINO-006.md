# GIAO VIỆC ANTIGRAVITY — DINO-006 (+ phần DINO-007 đã có code)

**Người giao:** DINO (Project Owner) · **Ngày:** 23/11/2026
**Trạng thái:** DINO-006 **AUTHORIZED** bởi DINO (xác nhận lại trong chat trước khi bắt đầu nếu cần).
**Code do Claude viết sẵn và đã đặt vào repo (chưa commit).** Nhiệm vụ của AG: review, sửa các điểm dưới đây, kiểm thử, báo cáo. Không viết lại từ đầu.

## 1. Đọc trước
1. `AGENTS.md`, `00_SYSTEM/*`
2. `docs/dino-coach/00_HANDOVER_DINO_Coach.md` — bối cảnh, quyết định FINAL
3. `docs/dino-coach/DINO-006_brief.md` — phạm vi, luật, UAT
4. `docs/dino-coach/README_coach_code.md` — cấu trúc code, quy ước, kết quả test

## 2. Claude đã đặt vào repo (file mới, KHÔNG sửa file cũ nào)
```
coach/                      app dạy khách (DINO-006 + phần lớn 007)
supabase/migrations/        0001, 0002, 0003, 0004, 0006 (.sql)
docs/dino-coach/            đặc tả, brief 006–013, nội dung khách, bàn giao, file này
tests/coach/                e2e_dino007.py + fake_supabase.js (Playwright), formulas.test.mjs (node --test)
tools/dino-coach/           bộ sinh SQL kho bài tập / thực phẩm / giáo án (Python)
```

## 3. Việc AG phải làm trong DINO-006

### 3.1 BLOCKER đã phát hiện — Vercel `cleanUrls` + `trailingSlash:false`
`vercel.json` hiện tại sẽ chuyển `/coach/` → `/coach` (308). Khi đó trang ở `/coach` **nằm ngoài** scope PWA `/coach/` → không cài PWA được, service worker không kiểm soát trang, Supabase redirect `/coach/` bị đổi.
**Đề xuất (DINO duyệt trước khi sửa `vercel.json`):**
- Đổi `coach/manifest.json`: `"start_url": "/coach"`, `"scope": "/coach"`.
- `coach/js/app.js`: `register('/coach/sw.js', { scope: '/coach' })`.
- `vercel.json`: thêm header cho `/coach/sw.js`: `Service-Worker-Allowed: /coach` và `Cache-Control: no-cache, no-store, must-revalidate`.
- `coach/js/config.js` `APP_BASE = '/coach'`; Supabase Site URL / Redirect URLs dùng `<domain>/coach`.
- Kiểm chứng trên Vercel Preview: mở `/coach`, cài PWA, tắt mạng mở lại.
Nếu DINO chọn chuyển hosting sang Cloudflare Pages (OPEN #1 trong bàn giao) thì báo lại trước khi sửa.

### 3.2 Chặn tài liệu / SQL / test bị deploy công khai
`.vercelignore` hiện chỉ loại `server.js`, `*.docx`, `*.log`, `.git`. Đề xuất thêm:
```
docs
supabase
tests
tools
```
(DINO duyệt — sửa file gốc.)

### 3.3 Service worker gốc `sw.js` (KHÔNG sửa, chỉ báo cáo)
SW gốc scope `/` bắt mọi request same-origin, kể cả `/coach/*`, và fallback offline về `/index.html` (app cá nhân). Trên máy đã dùng app cá nhân, lần đầu mở `/coach` khi mất mạng (trước khi SW của coach cài xong) có thể hiện app cá nhân. Sau khi SW `/coach` cài xong thì SW cụ thể hơn sẽ kiểm soát. Đánh giá rủi ro, đề xuất có cần cho SW gốc bỏ qua `/coach` hay không — chờ DINO quyết.

### 3.4 Kiểm thử
- `node --test tests/coach/formulas.test.mjs` → 13 pass
- `pip install playwright && playwright install chromium` rồi `python tests/coach/e2e_dino007.py` (chạy từ gốc repo) → 15 PASS
- Kiểm tra app cá nhân ở `/` không đổi (UAT #1 của brief 006).
- Chưa có Supabase thật: dừng ở AUTO_VERIFIED. DINO gửi URL + anon key sau → điền `coach/js/config.js` → UAT 9 mục của brief 006.

### 3.5 Không làm
Không commit / push / deploy. Không sửa file nào của app cá nhân. Không đổi logic SQL / `formulas.js` (đề xuất thì báo cáo).

## 4. Báo cáo
Theo mẫu **DINO CHANGE SET REPORT** ở `AGENTS.md` mục 8, kèm kết quả 3.1–3.4.
