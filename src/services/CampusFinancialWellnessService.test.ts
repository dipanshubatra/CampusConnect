import { describe, it, expect } from 'vitest';
import { CampusFinancialWellnessService } from '../../backend/src/services/CampusFinancialWellnessService';

describe('CampusFinancialWellnessService', () => {
  it('should fetch financial profile for student', () => {
    const profile = CampusFinancialWellnessService.getFinancialProfile('STU-999');
    expect(profile.studentId).toBe('STU-999');
    expect(profile.maxMicroLoanLimitUsd).toBeGreaterThan(0);
  });

  it('should apply for emergency micro-loan successfully', () => {
    const loan = CampusFinancialWellnessService.applyForMicroLoan(
      'STU-999',
      200,
      'EMERGENCY_HOUSING',
      'Rent gap coverage',
      3
    );

    expect(loan.loanId).toContain('LOAN-MIC-');
    expect(loan.requestedAmountUsd).toBe(200);
    expect(loan.monthlyRepaymentUsd).toBe(66.67);
  });

  it('should return service impact metrics', () => {
    const metrics = CampusFinancialWellnessService.getMetrics();
    expect(metrics.totalDisbursed).toBeGreaterThan(0);
    expect(metrics.repaymentRatePct).toBeGreaterThan(90);
  });
});
