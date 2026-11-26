// Lưu/đọc ảnh trong bucket riêng tư 'progress'. Thư mục đầu tiên luôn là client_id (RLS storage dựa vào đó).
import { sb } from '../supabaseClient.js';
import { compressImage } from './image.js';

const BUCKET = 'progress';
const rand = () => Math.random().toString(36).slice(2, 8);

/** Nén + tải ảnh lên. subdir: '' cho ảnh tiến trình, 'inbody' cho phiếu InBody. Trả về đường dẫn trong bucket. */
export async function uploadClientImage(clientId, file, { subdir = '', prefix = '' } = {}) {
  const { blob, ext, type } = await compressImage(file);
  const path = [clientId, subdir, `${prefix}${prefix ? '_' : ''}${rand()}.${ext}`].filter(Boolean).join('/');
  const { error } = await (await sb()).storage.from(BUCKET).upload(path, blob, { contentType: type, upsert: false });
  if (error) throw error;
  return { path, bytes: blob.size };
}

/** Link xem tạm thời (mặc định 1 giờ) cho nhiều ảnh: { path: url } */
export async function signedUrls(paths, seconds = 3600) {
  const list = [...new Set(paths.filter(Boolean))];
  if (!list.length) return {};
  const { data, error } = await (await sb()).storage.from(BUCKET).createSignedUrls(list, seconds);
  if (error) throw error;
  return Object.fromEntries(data.filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]));
}

export async function removeImages(paths) {
  const { error } = await (await sb()).storage.from(BUCKET).remove(paths);
  if (error) throw error;
}
