-- =====================================================================
-- DINO COACH — 0011: readiness trước buổi tập + khởi động chỉnh tư thế (DINO-015)
-- Chạy SAU 0010. Status: PROPOSED (AG soạn, KHÔNG chạy — Claude duyệt rồi chạy)
-- - session_feedback.readiness: JSONB lưu kết quả đánh giá sẵn sàng trước buổi tập
--   Dạng: {"sleep":1-5,"soreness":1-5,"stress":1-5,"energy":1-5,"pain":["Gối trái",...],"score":0-100,"level":"green|yellow|red","warmup_done":bool,"at":"ISO"}
--   RLS: dùng lại policy session_feedback_rw có sẵn.
-- =====================================================================
alter table public.session_feedback add column if not exists readiness jsonb;
