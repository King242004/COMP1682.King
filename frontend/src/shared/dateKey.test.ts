import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ageOnDate, formatFullDate, monthDateKeys } from './dateKey.ts';

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

test('month of October 2026 has 31 days, from the 1st to the 31st', () => {
  const keys = monthDateKeys('2026-10-15');
  assert.equal(keys.length, 31);
  assert.equal(keys[0], '2026-10-01');
  assert.equal(keys[30], '2026-10-31');
});

test('February of a leap year has 29 days', () => {
  assert.equal(monthDateKeys('2028-02-10').length, 29);
});

test('month of November 2026 has 30 days and starts on the 1st', () => {
  const keys = monthDateKeys('2026-11-03');
  assert.equal(keys.length, 30);
  assert.equal(keys[0], '2026-11-01');
});
