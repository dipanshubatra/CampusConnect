import { describe, it, expect } from 'vitest';
import { CampusCareerFairService } from '../../backend/src/services/CampusCareerFairService';

describe('CampusCareerFairService', () => {
  it('should return active employer booths', () => {
    const booths = CampusCareerFairService.getBooths();
    expect(booths.length).toBeGreaterThan(0);
    expect(booths[0].isBoothLive).toBe(true);
  });

  it('should join virtual booth queue line successfully', () => {
    const ticket = CampusCareerFairService.joinQueue(
      'BOOTH-CR-501',
      'STU-999',
      'Test Student',
      'Computer Science',
      2027
    );

    expect(ticket.ticketId).toContain('TICK-');
    expect(ticket.queuePosition).toBeGreaterThan(0);
  });

  it('should return career fair metrics', () => {
    const metrics = CampusCareerFairService.getCareerFairMetrics();
    expect(metrics.totalBooths).toBeGreaterThan(0);
    expect(metrics.totalOpenRoles).toBeGreaterThan(0);
  });
});
