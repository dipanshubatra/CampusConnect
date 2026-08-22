import { describe, it, expect } from 'vitest';
import { CampusPeerTutoringService } from '../../backend/src/services/CampusPeerTutoringService';

describe('CampusPeerTutoringService', () => {
  it('should fetch all verified tutors', () => {
    const tutors = CampusPeerTutoringService.getTutors();
    expect(tutors.length).toBeGreaterThan(0);
    expect(tutors[0].isVerifiedByRegistrar).toBe(true);
  });

  it('should filter tutors by course code', () => {
    const csTutors = CampusPeerTutoringService.getTutors('CS-201');
    expect(csTutors.length).toBe(1);
    expect(csTutors[0].fullName).toBe('Marcus Vance');
  });

  it('should create session booking successfully', () => {
    const booking = CampusPeerTutoringService.createBooking(
      'TUTOR-101',
      'STU-999',
      'Test Student',
      'CS-201',
      '2026-08-30',
      '10:00',
      'Recursion review'
    );

    expect(booking.bookingId).toContain('BOOK-');
    expect(booking.status).toBe('CONFIRMED');
  });

  it('should return service impact metrics', () => {
    const metrics = CampusPeerTutoringService.getMetrics();
    expect(metrics.totalVerifiedTutors).toBeGreaterThan(0);
  });
});
