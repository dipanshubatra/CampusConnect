import React, { useState } from 'react';
import {
  CampusFinancialWellnessService,
  StudentFinancialProfile,
  EmergencyMicroLoanApplication,
} from '../../backend/src/services/CampusFinancialWellnessService';

export const CampusFinancialWellnessStudioPage: React.FC = () => {
  const [profile] = useState<StudentFinancialProfile>(
    CampusFinancialWellnessService.getFinancialProfile('STU-999')
  );
  const [loans, setLoans] = useState<EmergencyMicroLoanApplication[]>(
    CampusFinancialWellnessService.getLoans('STU-999')
  );

  const [showModal, setShowModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(250);
  const [category, setCategory] = useState<
    'TEXTBOOKS_SUPPLIES' | 'EMERGENCY_HOUSING' | 'FOOD_SECURITY' | 'MEDICAL_EXPENSE' | 'TUITION_GAP'
  >('TEXTBOOKS_SUPPLIES');
  const [termMonths, setTermMonths] = useState<number>(3);
  const [justification, setJustification] = useState<string>(
    'Emergency textbook purchase for mid-term coursework requirements.'
  );

  const metrics = CampusFinancialWellnessService.getMetrics();

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoan = CampusFinancialWellnessService.applyForMicroLoan(
      'STU-999',
      amount,
      category,
      justification,
      termMonths
    );
    setLoans([newLoan, ...loans]);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Campus Financial Literacy & Wellness
            </span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1 rounded-full font-mono">
              0% Interest Emergency Micro-Loans
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Student Micro-Loan & Financial Wellness Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Access zero-interest emergency funding for textbooks, housing gaps, and food security while building long-term campus financial health.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Micro-Loan Limit</span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
            ${profile.maxMicroLoanLimitUsd.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Available Balance: ${(profile.maxMicroLoanLimitUsd - profile.activeLoanBalanceUsd).toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Loan Balance</span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">
            ${profile.activeLoanBalanceUsd.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">0% APR Guaranteed</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Grants Received</span>
          <div className="text-2xl md:text-3xl font-black text-purple-400 mt-1">
            ${profile.totalGrantsReceivedUsd.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Non-repayable Endowment Support</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Literacy Score</span>
          <div className="text-2xl md:text-3xl font-black text-blue-400 mt-1">
            {profile.financialLiteracyScorePct}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Advanced Level Certified</span>
        </div>
      </div>

      {/* Profile Overview & Quick Action */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-white">{profile.fullName} ({profile.email})</h2>
          <p className="text-xs text-slate-400 mt-1">
            Status: {profile.enrollmentStatus} | Internal Credit Integrity: {profile.creditScoreInternal}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-emerald-500/20"
        >
          Apply for Emergency 0% Micro-Loan
        </button>
      </div>

      {/* Loans Application History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white">Your Micro-Loan Applications & Active Disbursals</h2>
        <div className="space-y-3">
          {loans.map((l) => (
            <div
              key={l.loanId}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-400">{l.category}</span>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    {l.status}
                  </span>
                </div>
                <p className="text-slate-300">Justification: {l.justificationText}</p>
                <p className="text-slate-500 text-[11px] mt-1">Disbursed: {l.disbursedAt} | Due Date: {l.dueDate}</p>
              </div>

              <div className="text-right">
                <span className="text-white font-black text-base block">${l.requestedAmountUsd.toLocaleString()}</span>
                <span className="text-slate-400 text-[11px] block">${l.monthlyRepaymentUsd}/mo for {l.repaymentTermMonths} months</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleApplySubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white">Emergency 0% Micro-Loan Application</h2>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Funding Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="TEXTBOOKS_SUPPLIES">Textbooks & Required Lab Supplies</option>
                <option value="EMERGENCY_HOUSING">Emergency Housing Rent Gap</option>
                <option value="FOOD_SECURITY">Campus Food Security Support</option>
                <option value="MEDICAL_EXPENSE">Unforeseen Medical / Dental Expense</option>
                <option value="TUITION_GAP">Tuition Gap Financial Aid Delay</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Requested Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  required
                  max={profile.maxMicroLoanLimitUsd - profile.activeLoanBalanceUsd}
                  min={50}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Repayment Term (Months)</label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Justification Statement</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Submit & Instant Disburse
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
