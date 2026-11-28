// DINO-018 — Unit tests: Thương hiệu DINOMET & Theme (hue, presets, clamp, manifest)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_HUE, PRESETS, clampHue } from '../../coach/js/lib/theme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

test('DEFAULT_HUE = 355 (Đỏ DINOMET)', () => {
  assert.equal(DEFAULT_HUE, 355);
});

test('PRESETS có 6 màu, đứng đầu là Đỏ DINOMET (355)', () => {
  assert.equal(PRESETS.length, 6);
  assert.deepEqual(PRESETS[0], ['Đỏ DINOMET', 355]);
});

test('clampHue chuẩn hóa góc 0-359', () => {
  assert.equal(clampHue(0), 0);
  assert.equal(clampHue(355), 355);
  assert.equal(clampHue(360), 0);
  assert.equal(clampHue(715), 355);
  assert.equal(clampHue(-5), 355);
});

test('coach/manifest.json có tên DINOMET và 3 icons', () => {
  const mfPath = path.join(ROOT, 'coach/manifest.json');
  const mf = JSON.parse(fs.readFileSync(mfPath, 'utf-8'));
  assert.equal(mf.name, 'DINOMET');
  assert.equal(mf.short_name, 'DINOMET');
  assert.equal(mf.theme_color, '#7a0c16');
  assert.equal(mf.background_color, '#120306');
  assert.equal(mf.icons.length, 3);
  const any192 = mf.icons.find((i) => i.sizes === '192x192' && i.purpose === 'any');
  const any512 = mf.icons.find((i) => i.sizes === '512x512' && i.purpose === 'any');
  const mask512 = mf.icons.find((i) => i.sizes === '512x512' && i.purpose === 'maskable');
  assert.ok(any192, 'icon 192 any');
  assert.ok(any512, 'icon 512 any');
  assert.ok(mask512, 'icon 512 maskable');
});

test('Tất cả icon và logo DINOMET tồn tại trên đĩa', () => {
  const icons = [
    'coach/icons/icon-192.png',
    'coach/icons/icon-512.png',
    'coach/icons/icon-maskable-512.png',
    'coach/icons/apple-touch-icon.png',
    'coach/icons/favicon-32.png',
    'coach/icons/logo-mark.png',
    'coach/icons/logo-wordmark.png',
    'coach/icons/logo-full.png',
  ];
  for (const ic of icons) {
    const p = path.join(ROOT, ic);
    assert.ok(fs.existsSync(p), `File ${ic} phải tồn tại`);
    assert.ok(fs.statSync(p).size > 0, `File ${ic} không được rỗng`);
  }
});
