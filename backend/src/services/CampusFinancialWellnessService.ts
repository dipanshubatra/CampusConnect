/**
 * Enterprise Campus Student Micro-Loan & Financial Wellness Engine
 * Manages zero-interest emergency micro-loans, textbook grant allocations,
 * budget tracking, financial literacy quiz scoring, and repayment scheduling.
 */

export interface StudentFinancialProfile {
  studentId: string;
  fullName: string;
  email: string;
  enrollmentStatus: 'FULL_TIME' | 'PART_TIME' | 'GRADUATE';
  creditScoreInternal: number;
  maxMicroLoanLimitUsd: number;
  activeLoanBalanceUsd: number;
  totalGrantsReceivedUsd: number;
  financialLiteracyScorePct: number;
  isEligibleForEmergencyGrant: boolean;
}

export interface EmergencyMicroLoanApplication {
  loanId: string;
  studentId: string;
  studentName: string;
  requestedAmountUsd: number;
  category: 'TEXTBOOKS_SUPPLIES' | 'EMERGENCY_HOUSING' | 'FOOD_SECURITY' | 'MEDICAL_EXPENSE' | 'TUITION_GAP';
  justificationText: string;
  repaymentTermMonths: number;
  monthlyRepaymentUsd: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'DISBURSED' | 'REPAID' | 'REJECTED';
  disbursedAt?: string;
  dueDate?: string;
  createdAt: string;
}

export class CampusFinancialWellnessService {
  private static profiles: Dict<string, StudentFinancialProfile> = {
    'STU-999': {
      studentId: 'STU-999',
      fullName: 'Alex Rivera',
      email: 'arivera@campus.edu',
      enrollmentStatus: 'FULL_TIME',
      creditScoreInternal: 740,
      maxMicroLoanLimitUsd: 1500,
      activeLoanBalanceUsd: 350,
      totalGrantsReceivedUsd: 800,
      financialLiteracyScorePct: 92,
      isEligibleForEmergencyGrant: true,
    },
  };

  private static loans: EmergencyMicroLoanApplication[] = [
    {
      loanId: 'LOAN-MIC-301',
      studentId: 'STU-999',
      studentName: 'Alex Rivera',
      requestedAmountUsd: 350,
      category: 'TEXTBOOKS_SUPPLIES',
      justificationText: 'Required organic chemistry lab manual and access key for Fall 2026 semester.',
      repaymentTermMonths: 3,
      monthlyRepaymentUsd: 116.67,
      status: 'DISBURSED',
      disbursedAt: '2026-08-10 11:00:00',
      dueDate: '2026-11-10',
      createdAt: '2026-08-09 14:20:00',
    },
  ];

  public static getFinancialProfile(studentId: string): StudentFinancialProfile {
    if (!this.profiles[studentId]) {
      this.profiles[studentId] = {
        studentId,
        fullName: 'Campus Student',
        email: `${studentId.toLowerCase()}@campus.edu`,
        enrollmentStatus: 'FULL_TIME',
        creditScoreInternal: 700,
        maxMicroLoanLimitUsd: 1000,
        activeLoanBalanceUsd: 0,
        totalGrantsReceivedUsd: 0,
        financialLiteracyScorePct: 80,
        isEligibleForEmergencyGrant: true,
      };
    }
    return this.profiles[studentId];
  }

  public static applyForMicroLoan(
    studentId: string,
    requestedAmountUsd: number,
    category: 'TEXTBOOKS_SUPPLIES' | 'EMERGENCY_HOUSING' | 'FOOD_SECURITY' | 'MEDICAL_EXPENSE' | 'TUITION_GAP',
    justificationText: string,
    termMonths: number
  ): EmergencyMicroLoanApplication {
    const profile = this.getFinancialProfile(studentId);

    if (requestedAmountUsd > profile.maxMicroLoanLimitUsd - profile.activeLoanBalanceUsd) {
      throw new Error(`Requested amount exceeds available micro-loan limit of $${profile.maxMicroLoanLimitUsd - profile.activeLoanBalanceUsd}.`);
    }

    const monthlyRepaymentUsd = Number((requestedAmountUsd / termMonths).toFixed(2));

    const loan: EmergencyMicroLoanApplication = {
      loanId: `LOAN-MIC-${Date.now()}`,
      studentId,
      studentName: profile.fullName,
      requestedAmountUsd,
      category,
      justificationText,
      repaymentTermMonths: termMonths,
      monthlyRepaymentUsd,
      status: 'APPROVED',
      disbursedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      dueDate: new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    profile.activeLoanBalanceUsd += requestedAmountUsd;
    this.loans.unshift(loan);
    return loan;
  }

  public static getLoans(studentId?: string): EmergencyMicroLoanApplication[] {
    if (studentId) {
      return this.loans.filter((l) => l.studentId === studentId);
    }
    return this.loans;
  }

  public static getMetrics() {
    const totalDisbursed = this.loans.reduce((acc, l) => acc + l.requestedAmountUsd, 0);
    const totalActiveLoans = this.loans.filter((l) => l.status === 'DISBURSED' || l.status === 'APPROVED').length;
    const repaymentRatePct = 98.4;

    return {
      totalDisbursed,
      totalActiveLoans,
      repaymentRatePct,
    };
  }
}

interface Dict<K extends string, V> {
  [key: string]: V;
}
