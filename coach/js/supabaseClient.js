import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JS } from './config.js';

let client = null;

/** Tải supabase-js lần đầu cần dùng (để vỏ app vẫn hiện khi mất mạng). */
export async function sb() {
  if (client) return client;
  const { createClient } = await import(SUPABASE_JS);
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,       // đọc token từ link mời / link đặt lại mật khẩu
      flowType: 'implicit',
      storageKey: 'dcoach_auth',      // tiền tố dcoach_ — không đụng LocalStorage của app cá nhân
    },
  });
  return client;
}

/** Ném lỗi tiếng Việt dễ hiểu từ lỗi Supabase. */
export function viError(err) {
  const m = (err?.message || '').toLowerCase();
  if (m.includes('invalid login')) return 'Email hoặc mật khẩu chưa đúng.';
  if (m.includes('email not confirmed')) return 'Email chưa được xác nhận. Mở lại link mời trong hộp thư.';
  if (m.includes('password should be')) return 'Mật khẩu cần ít nhất 8 ký tự.';
  if (m.includes('rate limit')) return 'Thao tác quá nhanh, thử lại sau ít phút.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Không kết nối được máy chủ. Kiểm tra mạng.';
  return err?.message || 'Có lỗi xảy ra.';
}
