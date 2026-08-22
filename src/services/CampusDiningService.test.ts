import { describe, it, expect } from 'vitest';
import { CampusDiningService } from '../../backend/src/services/CampusDiningService';

describe('CampusDiningService', () => {
  it('should fetch dining venues', () => {
    const venues = CampusDiningService.getVenues();
    expect(venues.length).toBeGreaterThan(0);
    expect(venues[0].calorieCountApprox).toBeGreaterThan(0);
  });

  it('should redeem meal swipe successfully', () => {
    const pass = CampusDiningService.redeemSwipe('STU-999', 'HALL-NORTH-01');
    expect(pass.remainingMealSwipes).toBe(41);
  });

  it('should return dining metrics', () => {
    const metrics = CampusDiningService.getDiningMetrics();
    expect(metrics.totalVenuesOpen).toBeGreaterThan(0);
    expect(metrics.telemetryStatus).toBe('LIVE_SENSOR_GRID_OK');
  });
});
