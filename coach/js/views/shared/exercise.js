// DINO-008 — Chi tiết bài tập (khách + coach): ảnh, nhóm cơ, cue, video
import { render, esc } from '../../ui.js';
import { loadExercises, CATEGORY_VI, MUSCLE_VI, EQUIP_VI, STEP_VI, vi, youtubeEmbed } from '../../lib/exercises.js';
import { coachTabs } from '../coach/home.js';
import { clientTabs } from '../client/home.js';

export async function exerciseView({ params, profile }) {
  profile.role === 'coach' ? coachTabs() : clientTabs();
  const list = await loadExercises();
  const e = list.find((x) => x.id === params.id);
  if (!e) { render('<div class="card"><p>Không tìm thấy bài tập.</p><a href="javascript:history.back()">← Quay lại</a></div>'); return; }
  const embed = youtubeEmbed(e.video_url);
  const imgs = e.image_urls || [];
  render(`
    <p class="small"><a href="javascript:history.back()">← Quay lại</a></p>
    <h1>${esc(e.name_vi)}</h1>
    <p class="muted small">${esc(e.name_en || '')}</p>
    ${imgs.length ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(imgs.length, 2)},1fr);gap:8px;margin:12px 0">
      ${imgs.map((u, i) => `<img src="${esc(u)}" alt="${esc(e.name_vi)} ${i + 1}" loading="lazy" style="width:100%;border-radius:10px;background:#fff">`).join('')}</div>` : ''}
    <div class="card">
      <div class="row" style="flex-wrap:wrap;gap:6px">
        ${e.category ? `<span class="badge">${esc(vi(CATEGORY_VI, e.category))}</span>` : ''}
        ${e.corrective_step ? `<span class="badge">${esc(vi(STEP_VI, e.corrective_step))}</span>` : ''}
        ${(e.primary_muscles || []).map((m) => `<span class="badge badge--ok">${esc(vi(MUSCLE_VI, m))}</span>`).join('')}
        ${(e.equipment || []).map((m) => `<span class="badge">${esc(vi(EQUIP_VI, m))}</span>`).join('')}
      </div>
      ${(e.secondary_muscles || []).length ? `<p class="small muted" style="margin-top:8px">Cơ phụ: ${esc(e.secondary_muscles.map((m) => vi(MUSCLE_VI, m)).join(', '))}</p>` : ''}
    </div>
    ${e.cues ? `<h2>Lưu ý kỹ thuật</h2><div class="card"><p>${esc(e.cues).replace(/\n/g, '<br>')}</p></div>` : ''}
    ${embed ? `<h2>Video</h2><div style="position:relative;padding-top:56.25%;border-radius:12px;overflow:hidden;background:#000">
        <iframe src="${esc(embed)}" title="${esc(e.name_vi)}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      : e.video_url ? `<p><a class="btn" href="${esc(e.video_url)}" target="_blank" rel="noopener">Tìm video trên YouTube ↗</a></p>` : ''}
    ${profile.role === 'coach' ? `<p class="small" style="margin-top:16px"><a href="#/coach/library?edit=${esc(e.id)}">Sửa bài này</a></p>` : ''}`);
}

