import React, { useState } from 'react';
import {
  CampusCareerFairService,
  EmployerBooth,
  StudentBoothQueueTicket,
} from '../../backend/src/services/CampusCareerFairService';

export const CampusCareerFairStudioPage: React.FC = () => {
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [booths, setBooths] = useState<EmployerBooth[]>(
    CampusCareerFairService.getBooths()
  );
  const [tickets, setTickets] = useState<StudentBoothQueueTicket[]>(
    CampusCareerFairService.getStudentTickets('STU-999')
  );

  const [selectedBooth, setSelectedBooth] = useState<EmployerBooth | null>(null);
  const [studentName, setStudentName] = useState<string>('Alex Rivera');
  const [major, setMajor] = useState<string>('Computer Science');
  const [gradYear, setGradYear] = useState<number>(2027);

  const metrics = CampusCareerFairService.getCareerFairMetrics();

  const handleFilterChange = (sector: string) => {
    setSectorFilter(sector);
    setBooths(CampusCareerFairService.getBooths(sector));
  };

  const handleJoinQueueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooth) return;

    const newTicket = CampusCareerFairService.joinQueue(
      selectedBooth.boothId,
      'STU-999',
      studentName,
      major,
      gradYear
    );

    setTickets([newTicket, ...tickets]);
    setBooths([...CampusCareerFairService.getBooths(sectorFilter)]);
    setSelectedBooth(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Virtual Career Fair & Virtual Lobby
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full font-mono">
              Live 1-on-1 Video Interview Rooms
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Campus Career Fair & Virtual Lobby Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Connect directly with enterprise corporate recruiters, drop your verified digital resume, and enter live queue lines for virtual interviews.
          </p>
        </div>
      </div>

      {/* Top Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Employer Booths</span>
          <div className="text-2xl md:text-3xl font-black text-cyan-400 mt-1">
            {metrics.totalBooths} Booths
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active Sponsors & Employers</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Positions</span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
            {metrics.totalOpenRoles} Roles
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Internships & Full-Time</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Resumes Dropped</span>
          <div className="text-2xl md:text-3xl font-black text-purple-400 mt-1">
            {metrics.totalResumesDropped}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified Student Submissions</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Corporate Recruiters</span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">
            {metrics.activeRecruiters} Recruiters
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Conducting Live Video Rooms</span>
        </div>
      </div>

      {/* Sector Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-between">
        <span className="text-xs font-bold text-slate-300">Filter Employer Booths by Industry:</span>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'SOFTWARE_ENGINEERING', 'BIOTECH_PHARMA', 'FINANCIAL_SERVICES', 'CLEANTECH'].map((sec) => (
            <button
              key={sec}
              onClick={() => handleFilterChange(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sectorFilter === sec
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sec.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Employer Booths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {booths.map((booth) => (
          <div
            key={booth.boothId}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
                  {booth.boothTier}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  🟢 {booth.recruitersActive} Recruiters Online
                </span>
              </div>

              <h3 className="text-xl font-black text-white">{booth.companyName}</h3>
              <p className="text-xs text-slate-400 mb-3">{booth.industrySector.replace('_', ' ')} • HQ: {booth.headquarters}</p>

              <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl mb-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block uppercase">Featured Open Positions ({booth.openRolesCount})</span>
                <ul className="space-y-1">
                  {booth.featuredRoles.map((role, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">💼</span> {role}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[11px] block">Current Queue</span>
                  <span className="font-bold text-amber-400">{booth.currentQueueLength} Students</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Est. Wait Time</span>
                  <span className="font-bold text-cyan-400">~{booth.estimatedWaitMinutes} Mins</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooth(booth)}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              Drop Resume & Enter Virtual Lobby Queue
            </button>
          </div>
        ))}
      </div>

      {/* Student Queue Tickets */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white">Your Active Virtual Lobby Queue Tickets</h2>
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.ticketId}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-cyan-400">{t.companyName}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    Position in Line: #{t.queuePosition}
                  </span>
                </div>
                <p className="text-slate-300">Candidate: {t.studentName} ({t.major}, {t.graduationYear})</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Joined at {t.joinedAt}</p>
              </div>

              {t.interviewRoomUrl && (
                <a
                  href={t.interviewRoomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Enter Recruiter Video Room 📹
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Queue Modal */}
      {selectedBooth && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleJoinQueueSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white">Join Virtual Queue: {selectedBooth.companyName}</h2>
            <p className="text-xs text-slate-400">HQ: {selectedBooth.headquarters} | Est. Wait: ~{selectedBooth.estimatedWaitMinutes} mins</p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Candidate Full Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Academic Major</label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Graduation Year</label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              📄 Your verified student resume will be automatically dropped into the recruiter's candidate portal upon entering queue line.
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBooth(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Confirm Queue Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
