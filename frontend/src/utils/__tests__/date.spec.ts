import { describe, it, expect } from 'vitest';
import {
  formatEcuadorDateYMD,
  formatEcuadorDate,
  formatEcuadorDateTime,
  maskDateInput,
} from '../date';

describe('formatEcuadorDateYMD', () => {
  it('should correctly format date in Ecuador timezone even for late evening timestamps', () => {
    // 21:45 in Ecuador on Oct 21 = 02:45 UTC on Oct 22
    const eveningDate = new Date('2026-10-22T02:45:00.000Z');
    expect(formatEcuadorDateYMD(eveningDate)).toBe('2026-10-21');
  });

  it('should format calendar date without 1-day rollback', () => {
    const morningDate = new Date('2026-10-21T14:30:00.000Z');
    expect(formatEcuadorDateYMD(morningDate)).toBe('2026-10-21');
  });

  it('should format local display date correctly', () => {
    const eveningDate = new Date('2026-10-22T02:45:00.000Z');
    expect(formatEcuadorDate(eveningDate)).toBe('21/10/2026');
  });
});

describe('maskDateInput', () => {
  it('formats continuous digits without slashes', () => {
    expect(maskDateInput('21102026')).toBe('21/10/2026');
    expect(maskDateInput('2110')).toBe('21/10');
    expect(maskDateInput('21')).toBe('21');
  });

  it('preserves year and month when user edits day in place', () => {
    // When user deletes a digit of the day
    expect(maskDateInput('1/10/2026')).toBe('1/10/2026');
    expect(maskDateInput('/10/2026')).toBe('/10/2026');
    // When user replaces day with 15
    expect(maskDateInput('15/10/2026')).toBe('15/10/2026');
    // When user types in day without selecting, it does not bleed into month or cut off the year
    expect(maskDateInput('121/10/2026')).toBe('12/10/2026');
  });

  it('preserves day and year when user edits month in place', () => {
    expect(maskDateInput('21/0/2026')).toBe('21/0/2026');
    expect(maskDateInput('21/02/2026')).toBe('21/02/2026');
    expect(maskDateInput('21//2026')).toBe('21//2026');
  });

  it('preserves day and month when user edits year in place', () => {
    expect(maskDateInput('21/10/2025')).toBe('21/10/2025');
    expect(maskDateInput('21/10/20')).toBe('21/10/20');
  });
});

