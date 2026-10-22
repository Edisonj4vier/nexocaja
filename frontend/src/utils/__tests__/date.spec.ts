import { describe, it, expect } from 'vitest';
import { formatEcuadorDateYMD, formatEcuadorDate, formatEcuadorDateTime } from '../date';

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
