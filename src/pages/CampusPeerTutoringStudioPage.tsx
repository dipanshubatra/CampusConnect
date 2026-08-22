import React, { useState } from 'react';
import {
  CampusPeerTutoringService,
  VerifiedPeerTutor,
  TutoringSessionBooking,
} from '../../backend/src/services/CampusPeerTutoringService';

export const CampusPeerTutoringStudioPage: React.FC = () => {
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [tutors, setTutors] = useState<VerifiedPeerTutor[]>(
    CampusPeerTutoringService.getTutors()
  );
  const [bookings, setBookings] = useState<TutoringSessionBooking[]>(
    CampusPeerTutoringService.getBookings()
  );

  const [selectedTutor, setSelectedTutor] = useState<VerifiedPeerTutor | null>(null);
  const [studentName, setStudentName] = useState<string>('Alex Rivera');
  const [courseCode, setCourseCode] = useState<string>('CS-201');
  const [sessionDate, setSessionDate] = useState<string>('2026-08-26');
  const [startTime, setStartTime] = useState<string>('15:00');
  const [notes, setNotes] = useState<string>('Preparing for midterm examination review and problem set 3.');

  const metrics = CampusPeerTutoringService.getMetrics();

  const handleFilterChange = (filter: string) => {
    setCourseFilter(filter);
    setTutors(CampusPeerTutoringService.getTutors(filter));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;

    const newBooking = CampusPeerTutoringService.createBooking(
      selectedTutor.tutorId,
      'STU-999',
      studentName,
      courseCode,
      sessionDate,
      startTime,
      notes
    );

    setBookings([newBooking, ...bookings]);
    setTutors([...CampusPeerTutoringService.getTutors(courseFilter)]);
    setSelectedTutor(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Academic Peer Mentorship
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full font-mono">
              Registrar GPA Verified
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Campus Peer Tutoring & Academic Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Book 1-on-1 tutoring sessions with top-performing verified peer mentors across Computer Science, Engineering, Mathematics, and Life Sciences.
          </p>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Tutors</span>
          <div className="text-2xl md:text-3xl font-black text-indigo-400 mt-1">
            {metrics.totalVerifiedTutors}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">GPA 3.8+ Honor Roll</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</span>
          <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
            {metrics.totalCompletedSessions}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Academic Hours Delivered</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Tutor Rating</span>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">
            ⭐ {metrics.avgRating} / 5.0
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Student Feedback Verified</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Bookings</span>
          <div className="text-2xl md:text-3xl font-black text-blue-400 mt-1">
            {metrics.activeBookingsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Scheduled Sessions</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-between">
        <span className="text-xs font-bold text-slate-300">Filter Tutors by Course:</span>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'CS-201', 'MATH-302', 'CHEM-210', 'BIO-315'].map((code) => (
            <button
              key={code}
              onClick={() => handleFilterChange(code)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                courseFilter === code
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutors.map((tutor) => (
          <div
            key={tutor.tutorId}
            className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
                  GPA: {tutor.gpa}
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  ⭐ {tutor.overallRating} ({tutor.totalSessionsCompleted} sessions)
                </span>
              </div>

              <h3 className="text-xl font-black text-white">{tutor.fullName}</h3>
              <p className="text-xs text-slate-400 mb-2">{tutor.major} • Class of {tutor.graduationYear}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{tutor.bio}</p>

              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Courses Taught</span>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjectsHandled.map((sub) => (
                    <span
                      key={sub.code}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg font-bold"
                    >
                      {sub.code}: {sub.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs space-y-1 text-slate-400">
                <span className="font-bold text-slate-300 block">Available Slots:</span>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.availabilitySlots.map((slot, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-800 text-[11px] px-2 py-0.5 rounded">
                      🕒 {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTutor(tutor)}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              Book Tutoring Session ({tutor.hourlyRateTokens} Tokens/hr)
            </button>
          </div>
        ))}
      </div>

      {/* Bookings Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white">Scheduled Tutoring Sessions</h2>
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.bookingId}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-indigo-400">{b.courseCode}</span>
                  <span className="text-slate-400">• Tutor: {b.tutorName}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    {b.status}
                  </span>
                </div>
                <p className="text-slate-300">Student: {b.studentName} | Date: {b.sessionDate} at {b.startTime}</p>
                <p className="text-slate-500 text-[11px] mt-1">Notes: {b.notes}</p>
              </div>

              <a
                href={b.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-indigo-300 font-bold text-xs rounded-xl"
              >
                Join Video Meeting 🎥
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleBookingSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white">Book Tutoring Session</h2>
            <p className="text-xs text-slate-400">Tutor: {selectedTutor.fullName} ({selectedTutor.major})</p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Student Full Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Course Code</label>
                <select
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                >
                  {selectedTutor.subjectsHandled.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Topic Notes & Goal</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTutor(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Confirm & Reserve Slot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
