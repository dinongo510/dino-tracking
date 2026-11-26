// DINO-008 — Thư viện bài tập: tải 1 lần/phiên (sessionStorage), tìm không dấu, lọc, nhãn tiếng Việt
import { sb } from '../supabaseClient.js';

const KEY = 'dcoach_exercises';

export const CATEGORY_VI = { strength: 'Sức mạnh', power: 'Bùng nổ', conditioning: 'Thể lực', core: 'Core', mobility: 'Linh hoạt', boxing: 'Boxing', hyrox: 'HYROX', run: 'Chạy', corrective: 'Corrective' };
export const MUSCLE_VI = { abdominals: 'Bụng', abductors: 'Dạng hông', adductors: 'Khép đùi', biceps: 'Tay trước', calves: 'Bắp chân', chest: 'Ngực', forearms: 'Cẳng tay', glutes: 'Mông', hamstrings: 'Đùi sau', lats: 'Xô', 'lower back': 'Lưng dưới', 'middle back': 'Lưng giữa', neck: 'Cổ', quadriceps: 'Đùi trước', shoulders: 'Vai', traps: 'Cầu vai', triceps: 'Tay sau' };
export const EQUIP_VI = { barbell: 'Tạ đòn', dumbbell: 'Tạ đơn', cable: 'Cáp', machine: 'Máy', kettlebell: 'Tạ ấm', 'body only': 'Không dụng cụ', bands: 'Dây kháng lực', 'e-z curl bar': 'Thanh EZ', 'medicine ball': 'Bóng tạ', medicine_ball: 'Bóng tạ', other: 'Khác', skierg: 'SkiErg', sled: 'Sled', rope: 'Dây thừng', rower: 'Máy chèo', sandbag: 'Túi cát' };
export const STEP_VI = { inhibit: 'Ức chế', lengthen: 'Kéo giãn', activate: 'Kích hoạt', integrate: 'Tích hợp' };
export const vi = (map, k) => map[k] || k;

/** Bỏ dấu tiếng Việt + chữ thường, để "day" khớp "dây", "dang" khớp "đẩy"... */
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();

export async function loadExercises(force = false) {
  if (!force) {
    try { const c = sessionStorage.getItem(KEY); if (c) return JSON.parse(c); } catch { /* bỏ qua */ }
  }
  const { data, error } = await (await sb()).from('exercises')
    .select('id, name_vi, name_en, category, primary_muscles, secondary_muscles, equipment, image_urls, video_url, cues, tags, featured, is_custom, corrective_step')
    .order('name_vi');
  if (error) throw error;
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch { /* quá dung lượng: bỏ qua cache */ }
  return data;
}
export const clearExerciseCache = () => { try { sessionStorage.removeItem(KEY); } catch { /* */ } };

/** Lọc + sắp xếp: bài hay dùng (featured) lên đầu, rồi theo tên. */
export function filterExercises(list, { q = '', category = '', muscle = '', equipment = '', tag = '', featuredOnly = false } = {}) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  return list.filter((e) => {
    if (category && e.category !== category) return false;
    if (muscle && !(e.primary_muscles || []).includes(muscle)) return false;
    if (equipment && !(e.equipment || []).includes(equipment)) return false;
    if (tag && !(e.tags || []).some((t) => t === tag || t.startsWith(tag))) return false;
    if (featuredOnly && !e.featured) return false;
    if (!words.length) return true;
    const hay = norm(`${e.name_vi} ${e.name_en} ${(e.tags || []).join(' ')}`);
    return words.every((w) => hay.includes(w));
  }).sort((a, b) => (b.featured - a.featured) || a.name_vi.localeCompare(b.name_vi, 'vi'));
}

/** Link YouTube → link nhúng (watch?v=, youtu.be/, shorts/). Không phải video cụ thể → null. */
export function youtubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = null;
    if (/youtu\.be$/.test(u.hostname)) id = u.pathname.slice(1);
    else if (/youtube\.com$/.test(u.hostname.replace(/^www\.|^m\./, ''))) {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else if (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2];
    }
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
}

/** Đọc danh sách dán vào: mỗi dòng `name_en;name_vi;video_url;cues` (cues tùy chọn, dấu ; hoặc tab). */
export function parseImport(text, list) {
  const byEn = new Map(list.map((e) => [norm(e.name_en), e]));
  const byVi = new Map(list.map((e) => [norm(e.name_vi), e]));
  const rows = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [en = '', viName = '', video = '', ...rest] = line.split(/;|\t/).map((x) => x.trim());
    const cues = rest.join('; ').trim();
    if (!en && !viName) continue;
    if (/^name_en$/i.test(en)) continue; // dòng tiêu đề
    const match = (en && byEn.get(norm(en))) || (viName && byVi.get(norm(viName))) || null;
    const bad = video && !/^https?:\/\//i.test(video) ? 'Link video phải bắt đầu bằng http' : '';
    rows.push({ en, vi: viName, video, cues, match, error: bad || (!match && !viName ? 'Bài mới cần tên tiếng Việt' : '') });
  }
  return rows;
}
