import { describe, it, expect } from 'vitest';
import { CampusSmartParkingService } from '../../backend/src/services/CampusSmartParkingService';

describe('CampusSmartParkingService', () => {
  it('should fetch parking zones', () => {
    const zones = CampusSmartParkingService.getZones();
    expect(zones.length).toBeGreaterThan(0);
    expect(zones[0].totalCapacityStalls).toBeGreaterThan(0);
  });

  it('should reserve parking permit pass', () => {
    const pass = CampusSmartParkingService.reservePermitPass(
      'STU-999',
      '8XYZ999',
      'COMMUTER_RESIDENT',
      'PARK-ZONE-A'
    );

    expect(pass.passId).toContain('PASS-');
    expect(pass.licensePlate).toBe('8XYZ999');
  });

  it('should return service impact metrics', () => {
    const metrics = CampusSmartParkingService.getMetrics();
    expect(metrics.totalCapacity).toBeGreaterThan(0);
    expect(metrics.occupancyRatePct).toBeGreaterThan(0);
  });
});
