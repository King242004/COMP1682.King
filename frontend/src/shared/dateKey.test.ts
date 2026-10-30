import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ageOnDate, formatFullDate } from './dateKey.ts';

test('age from birth date: subtract 1 before this year\'s birthday', () => {
  assert.equal(ageOnDate('2004-11-24', '2026-11-23'), 21);
  assert.equal(ageOnDate('2004-11-24', '2026-11-24'), 22);
  assert.equal(ageOnDate('2004-02-29', '2026-02-28'), 21);
  assert.equal(ageOnDate('2004-02-29', '2026-03-01'), 22);
});

test('full date written day/month/year with two digits', () => {
  assert.equal(formatFullDate('2004-01-05'), '05/01/2004');
  assert.equal(formatFullDate('2004-11-24'), '24/11/2004');
});
