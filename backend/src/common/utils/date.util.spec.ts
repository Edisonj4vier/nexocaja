import { startOfEcuadorDay, endOfEcuadorDay, formatEcuadorDateYMD } from './date.util';

describe('date.util (Ecuador Timezone)', () => {
  it('should compute exact start of Ecuador day (05:00:00.000 UTC)', () => {
    const start = startOfEcuadorDay('2026-10-21');
    expect(start.toISOString()).toBe('2026-10-21T05:00:00.000Z');
  });

  it('should compute exact end of Ecuador day (04:59:59.999 UTC of next day)', () => {
    const end = endOfEcuadorDay('2026-10-21');
    expect(end.toISOString()).toBe('2026-10-22T04:59:59.999Z');
  });

  it('should include 8:00 PM (20:00) Ecuador transactions in today query range', () => {
    const start = startOfEcuadorDay('2026-10-21');
    const end = endOfEcuadorDay('2026-10-21');
    
    // 20:00 Ecuador time on Oct 21 = 01:00 UTC on Oct 22
    const eveningTx = new Date('2026-10-22T01:00:00.000Z');
    expect(eveningTx.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(eveningTx.getTime()).toBeLessThanOrEqual(end.getTime());
  });

  it('should format Date to YYYY-MM-DD in Ecuador timezone', () => {
    // 20:00 Ecuador time on Oct 21 is Oct 22 in UTC
    const eveningTx = new Date('2026-10-22T01:00:00.000Z');
    expect(formatEcuadorDateYMD(eveningTx)).toBe('2026-10-21');
  });
});
