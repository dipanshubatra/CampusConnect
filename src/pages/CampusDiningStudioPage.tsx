import React, { useState } from 'react';
import {
  CampusDiningService,
  DiningHallVenue,
  StudentMealPassToken,
} from '../../backend/src/services/CampusDiningService';

export const CampusDiningStudioPage: React.FC = () => {
  const [venues] = useState<DiningHallVenue[]>(
    CampusDiningService.getVenues()
  );
  const [pass, setPass] = useState<StudentMealPassToken>(
    CampusDiningService.getStudentPass('STU-999')
  );

  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const metrics = CampusDiningService.getDiningMetrics();

  const handleRedeemSwipe = (hallId: string) => {
    try {
      const updated = CampusDiningService.redeemSwipe('STU-999', hallId);
      setPass({ ...updated });
      setRedeemSuccess(`Successfully redeemed meal swipe at ${hallId}!`);
      setTimeout(() => setRedeemSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Smart Dining & AI Nutrition
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full font-mono">
              Live Hall Crowd Telemetry
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Smart Dining Hall & AI Nutrition Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Monitor real-time dining hall crowds, redeem digital meal passes, track macro-nutrition, and filter allergen preferences.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meal Swipes Balance</span>
          <div className="text-2xl md:text-3xl font-black text-orange-400 mt-1">
            {pass.remainingMealSwipes} Swipes
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tier: {pass.activeMealPlanTier}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dining Dollars</span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
            ${pass.diningDollarBalanceUsd.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Campus Retail Credit</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Dining Wait</span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">
            {metrics.avgWaitMinutes} Mins
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Live Sensor Queue Tracking</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dietary Filter</span>
          <div className="text-xl md:text-2xl font-black text-sky-400 mt-1">
            {pass.dietaryPreferenceFilter}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Allergen Safety Active</span>
        </div>
      </div>

      {redeemSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs font-bold">
          ✅ {redeemSuccess}
        </div>
      )}

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {venues.map((v) => (
          <div
            key={v.hallId}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-orange-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all space-y-4"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                  {v.status}
                </span>
                <span className="text-xs font-bold text-slate-400">🕒 {v.currentWaitTimeMinutes} Min Wait</span>
              </div>

              <h3 className="text-xl font-black text-white">{v.name}</h3>
              <p className="text-xs text-slate-400 mb-2">📍 {v.locationArea}</p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-orange-400 font-bold block">Today's Chef Special</span>
                <p className="text-white font-bold">{v.todaysSpecial}</p>
                <p className="text-slate-500">Approx. {v.calorieCountApprox} kcal | Vegan & Gluten-Free Options Available</p>
              </div>
            </div>

            <button
              onClick={() => handleRedeemSwipe(v.hallId)}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-orange-500/20"
            >
              Redeem Digital Meal Swipe 🍽️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
