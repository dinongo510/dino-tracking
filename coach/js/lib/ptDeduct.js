// DINO-014 — Coach hoàn thành buổi PT tại chỗ → trừ 1 buổi trong gói phù hợp (mỗi buổi chỉ trừ 1 lần)
import { loadPackages, addUse } from './packageStore.js';
import { packageForPT, pkgStatus, pkgLine, autoName } from './packages.js';
import { todayISO } from './plan.js';

export async function deductForSession(s) {
  const today = todayISO();
  const { packages, usedById, uses } = await loadPackages(s.client_id);
  if (uses.some((u) => u.session_id === s.id)) return 'Đã lưu. Buổi này đã được trừ gói trước đó.';
  const p = packageForPT(packages, usedById, today);
  if (!p) return 'Đã lưu. Khách chưa có gói còn hiệu lực — chưa trừ buổi.';
  await addUse({ client_id: s.client_id, package_id: p.id, session_id: s.id, used_on: s.scheduled_on && s.scheduled_on <= today ? s.scheduled_on : today });
  const st = pkgStatus(p, (usedById[p.id] || 0) + 1, today);
  return `Đã lưu và trừ 1 buổi — ${p.name || autoName(p)}: ${pkgLine(p, st)}.`;
}
