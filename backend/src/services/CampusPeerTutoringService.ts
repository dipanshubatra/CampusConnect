/**
 * Enterprise Campus Peer Tutoring & Academic Mentorship Engine
 * Manages tutor verification, course matching, session scheduling, feedback ratings,
 * subject matter expertise matrix, and academic performance tracking.
 */

export interface AcademicCourseSubject {
  code: string;
  name: string;
  department: string;
  difficultyRating: number;
}

export interface VerifiedPeerTutor {
  tutorId: string;
  fullName: string;
  email: string;
  major: string;
  graduationYear: number;
  gpa: number;
  isVerifiedByRegistrar: boolean;
  subjectsHandled: AcademicCourseSubject[];
  hourlyRateTokens: number;
  overallRating: number;
  totalSessionsCompleted: number;
  availabilitySlots: string[];
  bio: string;
}

export interface TutoringSessionBooking {
  bookingId: string;
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  meetingLink: string;
  notes: string;
  ratingGiven?: number;
  feedbackText?: string;
  createdAt: string;
}

export class CampusPeerTutoringService {
  private static tutors: VerifiedPeerTutor[] = [
    {
      tutorId: 'TUTOR-101',
      fullName: 'Marcus Vance',
      email: 'mvance@campus.edu',
      major: 'Computer Science & Mathematics',
      graduationYear: 2027,
      gpa: 3.94,
      isVerifiedByRegistrar: true,
      subjectsHandled: [
        { code: 'CS-201', name: 'Data Structures & Algorithms', department: 'Computer Science', difficultyRating: 4.5 },
        { code: 'MATH-302', name: 'Linear Algebra & Multivariable Calculus', department: 'Mathematics', difficultyRating: 4.8 },
      ],
      hourlyRateTokens: 25,
      overallRating: 4.9,
      totalSessionsCompleted: 48,
      availabilitySlots: ['Mon 14:00-16:00', 'Wed 10:00-12:00', 'Fri 15:00-18:00'],
      bio: 'Former TA for CS-201. Specialized in algorithm design, graph theory, and proof techniques.',
    },
    {
      tutorId: 'TUTOR-102',
      fullName: 'Elena Rostova',
      email: 'erostova@campus.edu',
      major: 'Bioengineering & Organic Chemistry',
      graduationYear: 2026,
      gpa: 3.98,
      isVerifiedByRegistrar: true,
      subjectsHandled: [
        { code: 'CHEM-210', name: 'Organic Chemistry II', department: 'Chemistry', difficultyRating: 4.9 },
        { code: 'BIO-315', name: 'Molecular Genetics & CRISPR', department: 'Biology', difficultyRating: 4.6 },
      ],
      hourlyRateTokens: 30,
      overallRating: 5.0,
      totalSessionsCompleted: 62,
      availabilitySlots: ['Tue 11:00-13:00', 'Thu 14:00-17:00'],
      bio: 'Undergraduate Researcher in Synthetic Bio Lab. 2x Academic Excellence Award recipient.',
    },
  ];

  private static bookings: TutoringSessionBooking[] = [
    {
      bookingId: 'BOOK-801',
      tutorId: 'TUTOR-101',
      tutorName: 'Marcus Vance',
      studentId: 'STU-502',
      studentName: 'Sophia Lin',
      courseCode: 'CS-201',
      sessionDate: '2026-08-25',
      startTime: '14:00',
      durationMinutes: 60,
      status: 'CONFIRMED',
      meetingLink: 'https://campusconnect.edu/meet/cs201-tutor-vance',
      notes: 'Reviewing Red-Black tree rebalancing algorithms and Big-O proof step-by-steps.',
      createdAt: '2026-08-21 09:30:00',
    },
  ];

  public static getTutors(courseFilter?: string): VerifiedPeerTutor[] {
    if (!courseFilter || courseFilter === 'ALL') {
      return this.tutors;
    }
    return this.tutors.filter((t) =>
      t.subjectsHandled.some((s) => s.code.toLowerCase().includes(courseFilter.toLowerCase()))
    );
  }

  public static getTutorById(id: string): VerifiedPeerTutor | undefined {
    return this.tutors.find((t) => t.tutorId === id);
  }

  public static createBooking(
    tutorId: string,
    studentId: string,
    studentName: string,
    courseCode: string,
    sessionDate: string,
    startTime: string,
    notes: string
  ): TutoringSessionBooking {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) {
      throw new Error(`Tutor with ID ${tutorId} not found.`);
    }

    const booking: TutoringSessionBooking = {
      bookingId: `BOOK-${Date.now()}`,
      tutorId,
      tutorName: tutor.fullName,
      studentId,
      studentName,
      courseCode,
      sessionDate,
      startTime,
      durationMinutes: 60,
      status: 'CONFIRMED',
      meetingLink: `https://campusconnect.edu/meet/${courseCode.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      notes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    this.bookings.unshift(booking);
    tutor.totalSessionsCompleted += 1;
    return booking;
  }

  public static getBookings(studentId?: string): TutoringSessionBooking[] {
    if (studentId) {
      return this.bookings.filter((b) => b.studentId === studentId);
    }
    return this.bookings;
  }

  public static getMetrics() {
    const totalVerifiedTutors = this.tutors.filter((t) => t.isVerifiedByRegistrar).length;
    const totalCompletedSessions = this.tutors.reduce((acc, t) => acc + t.totalSessionsCompleted, 0);
    const avgRating = (
      this.tutors.reduce((acc, t) => acc + t.overallRating, 0) / this.tutors.length
    ).toFixed(2);

    return {
      totalVerifiedTutors,
      totalCompletedSessions,
      avgRating,
      activeBookingsCount: this.bookings.length,
    };
  }
}
