// Chạy từ gốc repo: node --test tests/coach/exercises.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { norm, filterExercises, youtubeEmbed, parseImport } from '../../coach/js/lib/exercises.js';

const L = [
  { id: '1', name_vi: 'Đẩy ngực tạ đòn', name_en: 'Barbell Bench Press - Medium Grip', category: 'strength', primary_muscles: ['chest'], equipment: ['barbell'], tags: ['dino_core'], featured: false },
  { id: '2', name_vi: 'Squat tạ đòn sau lưng', name_en: 'Barbell Full Squat', category: 'strength', primary_muscles: ['quadriceps'], equipment: ['barbell'], tags: [], featured: true },
  { id: '3', name_vi: 'Đi ngang với band', name_en: 'Tube Walking (Lateral)', category: 'corrective', primary_muscles: [], equipment: [], tags: ['corrective', 'ohsa:knees_in'], featured: false },
  { id: '4', name_vi: 'Kéo sled 50 m', name_en: 'Sled Pull', category: 'hyrox', primary_muscles: [], equipment: ['sled'], tags: ['hyrox', 'station:3'], featured: false },
  { id: '5', name_vi: 'Goblet squat', name_en: 'Goblet Squat', category: 'strength', primary_muscles: ['quadriceps'], equipment: ['kettlebell'], tags: [], featured: false },
];

test('bỏ dấu tiếng Việt', () => {
  assert.equal(norm('Đẩy ngực'), 'day nguc');
  assert.equal(norm('Kéo XÔ'), 'keo xo');
});
test('tìm không dấu, nhiều từ, tiếng Anh', () => {
  assert.deepEqual(filterExercises(L, { q: 'day nguc' }).map((e) => e.id), ['1']);
  assert.deepEqual(filterExercises(L, { q: 'bench' }).map((e) => e.id), ['1']);
  assert.deepEqual(filterExercises(L, { q: 'squat ta' }).map((e) => e.id), ['2']);
});
test('bài hay dùng lên đầu', () => {
  assert.equal(filterExercises(L, { q: 'squat' })[0].id, '2');
});
test('lọc nhóm, cơ, dụng cụ, nhãn tiền tố', () => {
  assert.deepEqual(filterExercises(L, { category: 'hyrox' }).map((e) => e.id), ['4']);
  assert.deepEqual(filterExercises(L, { muscle: 'quadriceps' }).map((e) => e.id), ['2', '5']);
  assert.deepEqual(filterExercises(L, { equipment: 'kettlebell' }).map((e) => e.id), ['5']);
  assert.deepEqual(filterExercises(L, { tag: 'ohsa:' }).map((e) => e.id), ['3']);
  assert.deepEqual(filterExercises(L, { featuredOnly: true }).map((e) => e.id), ['2']);
});
test('nhận link YouTube', () => {
  assert.equal(youtubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(youtubeEmbed('https://youtu.be/dQw4w9WgXcQ?t=3'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(youtubeEmbed('https://youtube.com/shorts/abcDEF12345'), 'https://www.youtube-nocookie.com/embed/abcDEF12345');
  assert.equal(youtubeEmbed('https://www.youtube.com/results?search_query=squat'), null);
  assert.equal(youtubeEmbed('không phải link'), null);
});
test('đọc danh sách dán: cập nhật / mới / lỗi / tiêu đề / tab', () => {
  const rows = parseImport([
    'name_en;name_vi;video_url;cues',
    'barbell full squat;Squat sau lưng;https://youtu.be/abc12345678;Gối theo mũi chân; thở',
    'Landmine Row\tChèo landmine\thttps://youtu.be/xyz98765432',
    ';Goblet squat;;',
    'Unknown Move;;;',
    'Face Pull;Face pull;youtube.com/x;',
    '# ghi chú',
  ].join('\n'), L);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].match.id, '2'); assert.equal(rows[0].cues, 'Gối theo mũi chân; thở');
  assert.equal(rows[1].match, null); assert.equal(rows[1].vi, 'Chèo landmine'); assert.equal(rows[1].error, '');
  assert.equal(rows[2].match.id, '5');
  assert.match(rows[3].error, /tên tiếng Việt/);
  assert.match(rows[4].error, /http/);
});
