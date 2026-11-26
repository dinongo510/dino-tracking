// Hồ sơ khách — khai báo câu hỏi theo phiếu BFS (DINO_Coach_noi_dung_khach.md mục 2).
// Sửa câu chữ ở đây, wizard tự đổi theo. key: cột health_intakes hoặc 'json.khóa' (diet.*, lifestyle.*, goal_ratings.*, parq.*)
// Đặc biệt: 'profile.*' → bảng profiles · 'measure.weight_kg' → bảng measurements
const LMH = [['low', 'Thấp'], ['medium', 'Trung bình'], ['high', 'Cao']];
const YN = [['no', 'Không'], ['yes', 'Có']];

export const PARQ = [
  'Bác sĩ từng nói bạn có vấn đề về tim hoặc huyết áp cao?',
  'Bạn có bị đau ngực khi nghỉ, khi sinh hoạt hằng ngày hoặc khi vận động?',
  'Trong 12 tháng qua, bạn có bị chóng mặt mất thăng bằng hoặc ngất xỉu?',
  'Bạn có bệnh mạn tính nào khác được bác sĩ chẩn đoán?',
  'Bạn có đang dùng thuốc kê đơn cho bệnh mạn tính?',
  'Bạn có vấn đề xương, khớp, cơ có thể nặng hơn khi tập?',
  'Bác sĩ có từng dặn bạn chỉ nên vận động dưới giám sát y tế?',
];

export const STEPS = [
  { title: 'Thông tin cá nhân', fields: [
    { key: 'profile.full_name', label: 'Họ và tên', type: 'text', required: true },
    { key: 'profile.phone', label: 'Số điện thoại', type: 'tel', required: true },
    { key: 'dob', label: 'Ngày sinh', type: 'date', required: true },
    { key: 'sex', label: 'Giới tính', type: 'select', options: [['male', 'Nam'], ['female', 'Nữ']], required: true },
    { key: 'height_cm', label: 'Chiều cao (cm)', type: 'number', required: true },
    { key: 'measure.weight_kg', label: 'Cân nặng hiện tại (kg)', type: 'number', required: true },
    { key: 'doctor_contact', label: 'Tên bác sĩ và số điện thoại (nếu có)', type: 'text' },
    { key: 'emergency_contact', label: 'Người liên lạc khẩn cấp và số điện thoại', type: 'text', required: true },
  ]},
  { title: 'Bài tập & mục tiêu', fields: [
    { key: 'current_activity', label: 'Bạn hiện đang tham gia những hoạt động thể dục nào (chạy, cử tạ, tập nhóm…)?', type: 'textarea' },
    { key: 'active_days_60min', label: 'Bạn tập ít nhất 60 phút ở cường độ trung bình bao nhiêu ngày mỗi tuần?', type: 'number', min: 0, max: 7 },
    { key: 'lifestyle.experience', label: 'Bạn đã tập tạ/chạy bao lâu?', type: 'select', options: [['none', 'Chưa tập'], ['lt6m', 'Dưới 6 tháng'], ['6_24m', '6–24 tháng'], ['gt2y', 'Trên 2 năm']] },
    { type: 'note', label: 'Các mục tiêu sau quan trọng thế nào với bạn? (0 = không quan trọng, 10 = rất quan trọng)' },
    { key: 'goal_ratings.fat_loss', label: 'Giảm cân', type: 'scale' },
    { key: 'goal_ratings.muscle_gain', label: 'Tăng cơ', type: 'scale' },
    { key: 'goal_ratings.performance', label: 'Thành tích thể thao', type: 'scale' },
    { key: 'goal_ratings.health', label: 'Cải thiện sức khỏe', type: 'scale' },
  ]},
  { title: 'Ăn uống', fields: [
    { key: 'diet.health_score', label: 'Bạn chấm chế độ ăn tổng thể của mình lành mạnh mức nào?', type: 'scale' },
    { key: 'diet.current_diet', label: 'Bạn có đang theo chế độ ăn kiêng nào không? Nếu có, chế độ nào và vì sao?', type: 'textarea' },
    { key: 'diet.salt', label: 'Lượng muối hằng ngày', type: 'choice', options: LMH },
    { key: 'diet.sugar', label: 'Lượng đường hằng ngày', type: 'choice', options: LMH },
    { key: 'diet.fat', label: 'Lượng chất béo hằng ngày', type: 'choice', options: LMH },
    { key: 'diet.snack_control', label: 'Bạn kiểm soát cám dỗ đồ ăn vặt hiệu quả mức nào?', type: 'scale' },
    { key: 'diet.alcohol_per_week', label: 'Bạn uống bao nhiêu ly/lon đồ uống có cồn mỗi tuần?', type: 'number', min: 0 },
    { key: 'diet.caffeine', label: 'Cà phê, trà, soda, nước tăng lực — bao nhiêu mỗi tuần?', type: 'text' },
    { key: 'diet.meals_per_day', label: 'Bạn ăn mấy bữa mỗi ngày?', type: 'number', min: 1, max: 8 },
    { key: 'diet.cook', label: 'Bữa ăn chủ yếu do ai chuẩn bị?', type: 'choice', options: [['self', 'Tự nấu'], ['family', 'Gia đình'], ['out', 'Ăn ngoài']] },
    { key: 'diet.food_avoid', label: 'Món không ăn được, không thích hoặc dị ứng?', type: 'text' },
  ]},
  { title: 'Cách sống & nghề nghiệp', fields: [
    { key: 'lifestyle.sleep_rested', label: 'Bạn có ngủ đủ giấc và thức dậy thấy được nghỉ ngơi không?', type: 'choice', options: [['yes', 'Có'], ['sometimes', 'Thỉnh thoảng'], ['no', 'Không']] },
    { key: 'lifestyle.stress_score', label: 'Mức căng thẳng trung bình của bạn', type: 'scale' },
    { key: 'lifestyle.stress_techniques', label: 'Bạn đang dùng cách nào để quản lý căng thẳng?', type: 'text' },
    { key: 'lifestyle.smoking', label: 'Bạn có hút thuốc lá hoặc thuốc lá điện tử không?', type: 'choice', options: YN },
    { key: 'lifestyle.job', label: 'Nghề nghiệp của bạn là gì?', type: 'text' },
    { key: 'lifestyle.job_sitting', label: 'Công việc có phải ngồi lâu không?', type: 'choice', options: YN },
    { key: 'lifestyle.job_repetitive', label: 'Công việc có động tác lặp đi lặp lại không? (giải thích ở ghi chú nếu có)', type: 'choice', options: YN },
    { key: 'lifestyle.job_heels', label: 'Công việc có phải đi giày có gót (giày công sở, giày bảo hộ)?', type: 'choice', options: YN },
    { key: 'lifestyle.recreation', label: 'Bạn có hoạt động thể chất giải trí nào (bóng đá…)?', type: 'text' },
    { key: 'lifestyle.hobbies', label: 'Sở thích khác (làm vườn, câu cá, âm nhạc…)?', type: 'text' },
    { key: 'lifestyle.sessions_per_week', label: 'Thực tế bạn tập được mấy buổi/tuần?', type: 'number', min: 1, max: 7 },
    { key: 'lifestyle.session_length', label: 'Mỗi buổi bạn có bao nhiêu phút?', type: 'select', options: [['30', '30'], ['45', '45'], ['60', '60'], ['75', '75'], ['90', '90']] },
    { key: 'lifestyle.location', label: 'Bạn tập ở đâu?', type: 'choice', options: [['gym', 'Phòng gym'], ['home', 'Ở nhà'], ['outdoor', 'Ngoài trời'], ['mix', 'Kết hợp']] },
  ]},
  { title: 'Y khoa & sàng lọc an toàn', fields: [
    { key: 'injuries', label: 'Chấn thương xương khớp trong quá khứ', type: 'textarea' },
    { key: 'surgeries', label: 'Các cuộc phẫu thuật trong quá khứ', type: 'textarea' },
    { key: 'return_cleared', label: 'Nếu từng chấn thương/phẫu thuật: đã hồi phục và được bác sĩ cho phép vận động lại chưa?', type: 'choice', options: [['na', 'Không áp dụng'], ['yes', 'Đã được phép'], ['no', 'Chưa']] },
    { key: 'medical', label: 'Bệnh mạn tính (tim mạch, phổi, tăng huyết áp, tiểu đường, ung thư…)? Giải thích', type: 'textarea' },
    { key: 'medications', label: 'Thuốc đang dùng? Đã được bác sĩ cho phép vận động chưa?', type: 'textarea' },
    { type: 'note', label: 'Sàng lọc an toàn — trả lời Có/Không' },
    ...PARQ.map((q, i) => ({ key: `parq.q${i + 1}`, label: q, type: 'choice', options: YN, required: true })),
    { key: 'lifestyle.notes', label: 'Ghi chú bổ sung', type: 'textarea' },
  ]},
];

// ---------- Suy luận từ hồ sơ ----------
const GOAL_MAP = { fat_loss: 'fat_loss', muscle_gain: 'muscle_gain', performance: 'performance', health: 'recomp' };

export function deriveGoal(r = {}) {
  const e = Object.entries(r).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, +v]);
  if (!e.length) return null;
  const max = Math.max(...e.map(([, v]) => v));
  const top = e.filter(([, v]) => v === max);
  return top.length === 1 ? GOAL_MAP[top[0][0]] : null; // bằng điểm → Coach chọn
}

export function deriveFlag(h) {
  const reasons = [];
  if (Object.values(h.parq || {}).includes('yes')) reasons.push('Có câu "Có" ở phần sàng lọc an toàn');
  if (h.return_cleared === 'no') reasons.push('Chưa được bác sĩ cho phép vận động lại sau chấn thương/phẫu thuật');
  return reasons;
}

export function suggestActivityFactor(h) {
  const L = h.lifestyle || {}, d = +h.active_days_60min || 0;
  if (L.job_sitting === 'yes') return d >= 4 ? 1.55 : 1.375;
  return d >= 4 ? 1.725 : 1.55;
}

/** Gợi ý cho Coach (file nội dung mục 3) */
export function coachHints(h) {
  const L = h.lifestyle || {}, D = h.diet || {}, out = [];
  if (L.job_sitting === 'yes') out.push('Ngồi lâu → khi OHSA chú ý võng lưng dưới, đổ người trước (gập hông ngắn).');
  if (L.job_heels === 'yes') out.push('Đi giày có gót → chú ý bàn chân xoay ngoài, cổ chân.');
  if (L.job_repetitive === 'yes') out.push('Động tác lặp lại → hỏi thêm, cân bằng mẫu chuyển động ngược chiều.');
  if (L.sleep_rested === 'no' || +L.stress_score >= 7) out.push('Ngủ kém / stress cao → khối lượng vừa phải giai đoạn đầu, ưu tiên ngủ.');
  if ((D.snack_control !== undefined && +D.snack_control <= 4) || D.sugar === 'high') out.push('Khó kiểm soát ăn vặt / đường cao → bữa phụ cố định trong meal plan.');
  if (+D.alcohol_per_week >= 4) out.push('Uống ≥ 4 ly cồn/tuần → trao đổi tuần đầu, tính kcal đồ uống.');
  if (L.smoking === 'yes') out.push('Hút thuốc → tăng cường độ aerobic chậm hơn.');
  if ((+h.active_days_60min || 0) <= 1 && L.experience === 'none') out.push('Mới tập → mẫu "Giảm mỡ – Nền tảng", RPE ≤ 7 tuần 1–2.');
  return out;
}

// ---------- Đọc/ghi giá trị theo key ----------
export function getVal(h, key) {
  const [a, b] = key.split('.');
  return b === undefined ? h[a] : (h[a] || {})[b];
}
export function setVal(h, key, v) {
  const [a, b] = key.split('.');
  if (b === undefined) h[a] = v; else h[a] = { ...(h[a] || {}), [b]: v };
}
