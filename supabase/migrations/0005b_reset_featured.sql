-- =====================================================================
-- DINO COACH — 0005b: ★ (featured) = bài Dino tự chọn. Chạy SAU 0002, 0003.
-- Lý do: dữ liệu mẫu 0002/0003 gắn sẵn ★ cho 143 bài → ★ mất tác dụng ưu tiên.
-- Bỏ ★ của dữ liệu mẫu, giữ ★ cho bài đã có video thật (không phải link tìm kiếm YouTube).
-- Nhãn 'dino_core' vẫn giữ để lọc 130 bài cốt lõi. Đã chạy trên dino-coach 26/11/2026 (còn 1 ★).
-- =====================================================================
update public.exercises set featured = false
where featured and (video_url is null or video_url like '%search_query%');
