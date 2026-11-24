-- =====================================================================
-- DINO COACH — 0001b: cấp quyền cấp bảng cho người dùng đã đăng nhập
-- Chạy NGAY SAU 0001. Lý do: project Supabase mới không còn tự grant bảng trong
-- schema public cho role `authenticated` → app báo "permission denied for table profiles".
-- RLS (trong 0001) vẫn quyết định từng dòng ai được xem/ghi. Không cấp gì cho `anon`.
-- Đã chạy trên project dino-coach ngày 24/11/2026: 26/26 bảng OK.
-- =====================================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
