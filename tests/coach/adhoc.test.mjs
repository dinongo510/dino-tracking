import test from 'node:test';
import assert from 'node:assert/strict';
import { dayNoFromDate, defaultAdhocTitle } from '../../coach/js/lib/plan.js';
import { weekStats } from '../../coach/js/lib/checkin.js';
import { last7 } from '../../coach/js/lib/dashboard.js';
import { missedLastWeek } from '../../coach/js/lib/sessionLog.js';

test('dayNoFromDate returns 1 (Mon) to 7 (Sun)', () => {
  assert.equal(dayNoFromDate('2026-11-23'), 1); // Monday
  assert.equal(dayNoFromDate('2026-11-24'), 2); // Tuesday
  assert.equal(dayNoFromDate('2026-11-28'), 6); // Saturday
  assert.equal(dayNoFromDate('2026-11-29'), 7); // Sunday
});

test('defaultAdhocTitle formats "Buổi tự do dd/mm"', () => {
  assert.equal(defaultAdhocTitle('2026-11-28'), 'Buổi tự do 28/11');
  assert.equal(defaultAdhocTitle('2026-05-04'), 'Buổi tự do 04/05');
});

test('weekStats ignores adhoc sessions in sessionsPct calculation', () => {
  const sessions = [
    { id: 's1', scheduled_on: '2026-11-23', adhoc: false },
    { id: 's2', scheduled_on: '2026-11-25', adhoc: false },
    { id: 's_adhoc', scheduled_on: '2026-11-26', adhoc: true }, // adhoc session
  ];
  const doneIds = new Set(['s1', 's_adhoc']); // completed s1 and adhoc, but missed s2

  // With adhoc ignored: 1/2 = 50%
  const res = weekStats({
    sessions,
    doneIds,
    checks: [],
    slotsCount: 0,
    weekStart: '2026-11-23',
    today: '2026-11-29',
  });
  assert.equal(res.sessionsPct, 50);

  // If s2 is done: 2/2 = 100% (adhoc does not lower or skew % denominator)
  const doneAll = new Set(['s1', 's2']);
  const resAll = weekStats({
    sessions,
    doneIds: doneAll,
    checks: [],
    slotsCount: 0,
    weekStart: '2026-11-23',
    today: '2026-11-29',
  });
  assert.equal(resAll.sessionsPct, 100);
});

test('last7 ignores adhoc sessions in trainPct calculation', () => {
  const today = '2026-11-28';
  const sessions = [
    { id: 's1', scheduled_on: '2026-11-24', adhoc: false },
    { id: 's2', scheduled_on: '2026-11-27', adhoc: false },
    { id: 's_adhoc', scheduled_on: '2026-11-28', adhoc: true },
  ];
  const doneIds = new Set(['s1', 's_adhoc']);

  const res = last7({
    sessions,
    doneIds,
    checks: [],
    slotsCount: 0,
    today,
  });
  assert.equal(res.trainPct, 50); // 1/2 scheduled sessions completed
});

test('missedLastWeek ignores adhoc sessions', () => {
  const sessions = [
    { id: 's1', scheduled_on: '2026-11-16', adhoc: false },
    { id: 's_adhoc1', scheduled_on: '2026-11-17', adhoc: true },
    { id: 's_adhoc2', scheduled_on: '2026-11-18', adhoc: true },
  ];
  const doneIds = new Set(['s1']); // completed s1, missed both adhoc sessions

  const alert = missedLastWeek(sessions, doneIds);
  // Should NOT trigger missed alert because only 0 scheduled sessions were missed!
  assert.equal(alert, null);
});
