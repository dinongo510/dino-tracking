import { themePickerHtml, bindThemePicker } from '../../lib/theme.js';
import { render, $ } from '../../ui.js';
import { renderBody } from '../shared/body.js';
import { renderPhotos } from '../shared/photos.js';
import { clientTabs } from './home.js';
import { loadIntake } from './intake.js';
import { esc } from '../../ui.js';
import { STEPS, getVal } from '../../lib/intake.js';

export async function clientBodyView({ profile }) {
  clientTabs();
  render(`<h1>Cơ thể</h1><a class="btn btn--primary btn--block" href="#/client/dash" style="margin:6px 0 10px">Xem biểu đồ tiến độ →</a><p class="muted small">Cân vào buổi sáng, sau khi đi vệ sinh, trước khi ăn. Đo vòng eo ngang rốn.</p><div id="body"></div><div id="photos"></div>`);
  await renderBody($('#body'), profile.id, profile.id);
  await renderPhotos($('#photos'), profile.id, profile.id);
}

export async function clientProfileView({ profile }) {
  clientTabs();
  const h = await loadIntake(profile.id);
  const show = (f) => {
    let v = getVal({ ...h, profile }, f.key);
    if (v == null || v === '') return '';
    if (f.options) v = (f.options.find(([k]) => k === String(v)) || [, v])[1];
    return `<li style="display:block"><div class="small muted">${esc(f.label)}</div><div>${esc(v)}</div></li>`;
  };
  render(`<h1>Hồ sơ của bạn</h1>
    ${themePickerHtml()}
    ${h ? STEPS.map((s, i) => `<div class="row row--between"><h2>${esc(s.title)}</h2><a class="btn btn--ghost small" href="#/client/intake/${i}">Sửa</a></div>
      <div class="card"><ul class="list">${s.fields.filter((f) => f.key && !f.key.startsWith('parq.') && !f.key.startsWith('measure.')).map(show).join('') || '<li class="muted small">—</li>'}</ul></div>`).join('')
      : '<div class="card"><p>Bạn chưa điền hồ sơ.</p><a class="btn btn--primary" href="#/client/intake">Điền hồ sơ</a></div>'}`);
  bindThemePicker();
}
