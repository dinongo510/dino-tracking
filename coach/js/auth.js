import { sb } from './supabaseClient.js';
import { APP_BASE } from './config.js';

// Đọc loại link TRƯỚC khi supabase-js xóa hash (invite | recovery | signup | magiclink)
const rawHash = new URLSearchParams(location.hash.replace(/^#/, ''));
export const linkType = rawHash.get('access_token') ? rawHash.get('type') : null;
// Link mời / đặt lại mật khẩu hỏng hoặc đã dùng: Supabase trả về #error=...&error_code=otp_expired
const rawQuery = new URLSearchParams(location.search);
export const linkError = rawHash.get('error_code') || rawQuery.get('error_code') || rawHash.get('error') || null;

let cachedProfile = null;

export async function getSession() {
  const { data } = await (await sb()).auth.getSession();
  return data.session;
}

export async function getProfile(force = false) {
  const s = await getSession();
  if (!s) { cachedProfile = null; return null; }
  if (cachedProfile && !force && cachedProfile.id === s.user.id) return cachedProfile;
  const { data, error } = await (await sb()).from('profiles')
    .select('id, role, full_name, phone, coach_id, status').eq('id', s.user.id).single();
  if (error) throw error;
  cachedProfile = data;
  return data;
}

export async function signIn(email, password) {
  cachedProfile = null;
  const { error } = await (await sb()).auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signOut() {
  cachedProfile = null;
  await (await sb()).auth.signOut();
}

export async function setPassword(password) {
  const { error } = await (await sb()).auth.updateUser({ password });
  if (error) throw error;
}

export async function sendReset(email) {
  const { error } = await (await sb()).auth.resetPasswordForEmail(email.trim(), {
    redirectTo: location.origin + APP_BASE,
  });
  if (error) throw error;
}

export async function onAuthChange(cb) {
  (await sb()).auth.onAuthStateChange((event, session) => cb(event, session));
}

export const homeFor = (profile) => (profile?.role === 'coach' ? '#/coach' : '#/client');
