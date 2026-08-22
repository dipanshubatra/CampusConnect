import React, { useState } from 'react';
import {
  CampusSmartParkingService,
  ParkingGarageZone,
  StudentPermitPass,
} from '../../backend/src/services/CampusSmartParkingService';

export const CampusSmartParkingStudioPage: React.FC = () => {
  const [zones, setZones] = useState<ParkingGarageZone[]>(
    CampusSmartParkingService.getZones()
  );
  const [passes, setPasses] = useState<StudentPermitPass[]>(
    CampusSmartParkingService.getStudentPasses('STU-999')
  );

  const [selectedZone, setSelectedZone] = useState<ParkingGarageZone | null>(null);
  const [licensePlate, setLicensePlate] = useState<string>('9ABC123');
  const [permitType, setPermitType] = useState<
    'COMMUTER_RESIDENT' | 'FACULTY_STAFF' | 'EV_CHARGING_PREMIUM' | 'DAILY_VISITOR'
  >('COMMUTER_RESIDENT');

  const metrics = CampusSmartParkingService.getMetrics();

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) return;

    const newPass = CampusSmartParkingService.reservePermitPass(
      'STU-999',
      licensePlate,
      permitType,
      selectedZone.zoneId
    );

    setPasses([newPass, ...passes]);
    setZones([...CampusSmartParkingService.getZones()]);
    setSelectedZone(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Smart Parking & IoT Telemetry
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full font-mono">
              EV Charging & Real-Time Sensor Grid
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Campus Smart Parking Telemetry Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Monitor campus garage occupancy, EV charger station status, and reserve digital parking permit passes in real time.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Campus Capacity</span>
          <div className="text-2xl md:text-3xl font-black text-sky-400 mt-1">
            {metrics.totalCapacity} Stalls
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Monitored Garages</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Occupancy Rate</span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">
            {metrics.occupancyRatePct}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">{metrics.totalOccupied} Stalls Occupied</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">EV Fast Chargers</span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
            {metrics.totalEvChargers} Ports
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Level 2 & DC Fast Active</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sensor Grid Status</span>
          <div className="text-2xl md:text-3xl font-black text-blue-400 mt-1">
            100% Online
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Telemetry Sync OK</span>
        </div>
      </div>

      {/* Parking Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => {
          const occPct = Math.round((zone.occupiedStalls / zone.totalCapacityStalls) * 100);
          return (
            <div
              key={zone.zoneId}
              className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full">
                    {zone.zoneId}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    ${zone.hourlyPermitRateUsd.toFixed(2)}/hr
                  </span>
                </div>

                <h3 className="text-xl font-black text-white">{zone.zoneName}</h3>
                <p className="text-xs text-slate-400 mb-3">{zone.facilityLocation}</p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-sky-400">{zone.availableStalls} Stalls Free</span>
                    <span className="text-slate-400">{occPct}% Full</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${occPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex justify-between">
                  <span>⚡ EV Chargers: {zone.evChargersOccupied} / {zone.evChargerStallsCount} Occupied</span>
                  <span className="text-emerald-400 font-bold">Status: {zone.sensorHealthStatus}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedZone(zone)}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-sky-500/20"
              >
                Reserve Digital Parking Pass
              </button>
            </div>
          );
        })}
      </div>

      {/* Student Active Passes */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white">Your Active Parking Passes</h2>
        <div className="space-y-3">
          {passes.map((p) => (
            <div
              key={p.passId}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sky-400">Plate: {p.licensePlate}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    {p.permitType}
                  </span>
                </div>
                <p className="text-slate-300">Pass ID: {p.passId} | Zone: {p.assignedZoneId}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Valid through {p.expirationDate}</p>
              </div>

              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                Active Permit Validated 🅿️
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleReserveSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white">Reserve Parking Pass: {selectedZone.zoneName}</h2>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Vehicle License Plate</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500 uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Permit Type</label>
              <select
                value={permitType}
                onChange={(e) => setPermitType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
              >
                <option value="COMMUTER_RESIDENT">Commuter / Resident Student Permit</option>
                <option value="EV_CHARGING_PREMIUM">EV Charging Reserved Spot Pass</option>
                <option value="DAILY_VISITOR">Daily Guest Pass</option>
                <option value="FACULTY_STAFF">Faculty / Staff Preferred</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedZone(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
              >
                Confirm & Issue Digital Pass
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
