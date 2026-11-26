// Nén ảnh ngay trên máy trước khi tải lên (DINO-007 mục 2.4)
// Mục tiêu <= 250 KB/ảnh. WebP; trình duyệt không xuất được WebP (Safari cũ) → JPEG.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh. Chọn file JPG, PNG, WebP hoặc HEIC đã chuyển sang JPG.')); };
    img.src = url;
  });
}

const toBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q));

/**
 * Nén để ảnh <= maxBytes (mặc định 250 KB): thử chất lượng 0.8 → 0.5, rồi thu nhỏ cạnh dài 1280 → 1024 → 800.
 * @returns {Promise<{blob: Blob, ext: string, type: string, width: number, height: number}>}
 */
export async function compressImage(file, { maxSide = 1280, maxBytes = 250 * 1024 } = {}) {
  if (!file || !file.type.startsWith('image/')) throw new Error('File không phải ảnh.');
  const img = await loadImage(file);
  let best = null;
  for (const side of [maxSide, 1024, 800]) {
    const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    for (const q of [0.8, 0.7, 0.6, 0.5]) {
      let blob = await toBlob(canvas, 'image/webp', q);
      if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', q);
      if (!blob) continue;
      best = { blob, ext: blob.type === 'image/webp' ? 'webp' : 'jpg', type: blob.type, width: w, height: h };
      if (blob.size <= maxBytes) return best;
    }
  }
  if (!best) throw new Error('Không nén được ảnh.');
  return best; // trường hợp cực hiếm vẫn > maxBytes: dùng bản nhỏ nhất đã thử
}
