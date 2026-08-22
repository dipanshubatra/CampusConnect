/**
 * Enterprise Campus Alumni Career Fair & Virtual Lobby Engine
 * Manages employer booth registration, student queue wait times, live 1-on-1 interview video rooms,
 * resume drop telemetry, and recruiter hiring pipeline analytics.
 */

export interface EmployerBooth {
  boothId: string;
  companyName: string;
  industrySector: 'SOFTWARE_ENGINEERING' | 'BIOTECH_PHARMA' | 'FINANCIAL_SERVICES' | 'CLEANTECH' | 'CONSULTING';
  headquarters: string;
  openRolesCount: number;
  featuredRoles: string[];
  boothTier: 'PLATINUM_SPONSOR' | 'GOLD' | 'STANDARD';
  currentQueueLength: number;
  estimatedWaitMinutes: number;
  recruitersActive: number;
  totalResumesDropped: number;
  virtualLobbyMeetingUrl: string;
  isBoothLive: boolean;
}

export interface StudentBoothQueueTicket {
  ticketId: string;
  boothId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  major: string;
  graduationYear: number;
  queuePosition: number;
  status: 'WAITING' | 'IN_SESSION' | 'COMPLETED' | 'SKIPPED';
  joinedAt: string;
  interviewRoomUrl?: string;
}

export class CampusCareerFairService {
  private static booths: EmployerBooth[] = [
    {
      boothId: 'BOOTH-CR-501',
      companyName: 'Apex Quantum AI Systems',
      industrySector: 'SOFTWARE_ENGINEERING',
      headquarters: 'Palo Alto, CA',
      openRolesCount: 14,
      featuredRoles: ['Quantum Software Engineer Intern', 'AI Systems Research Fellow', 'Full Stack React Engineer'],
      boothTier: 'PLATINUM_SPONSOR',
      currentQueueLength: 8,
      estimatedWaitMinutes: 12,
      recruitersActive: 4,
      totalResumesDropped: 142,
      virtualLobbyMeetingUrl: 'https://campusconnect.edu/lobby/apex-quantum',
      isBoothLive: true,
    },
    {
      boothId: 'BOOTH-CR-502',
      companyName: 'BioHealth Genomics International',
      industrySector: 'BIOTECH_PHARMA',
      headquarters: 'Boston, MA',
      openRolesCount: 8,
      featuredRoles: ['Bioinformatics Analyst', 'CRISPR Lab Technician', 'Clinical Data Manager'],
      boothTier: 'GOLD',
      currentQueueLength: 3,
      estimatedWaitMinutes: 5,
      recruitersActive: 2,
      totalResumesDropped: 89,
      virtualLobbyMeetingUrl: 'https://campusconnect.edu/lobby/biohealth-genomics',
      isBoothLive: true,
    },
  ];

  private static tickets: StudentBoothQueueTicket[] = [
    {
      ticketId: 'TICK-901',
      boothId: 'BOOTH-CR-501',
      companyName: 'Apex Quantum AI Systems',
      studentId: 'STU-999',
      studentName: 'Alex Rivera',
      major: 'Computer Science & AI',
      graduationYear: 2027,
      queuePosition: 1,
      status: 'WAITING',
      joinedAt: '2026-08-22 10:15:00',
    },
  ];

  public static getBooths(sectorFilter?: string): EmployerBooth[] {
    if (!sectorFilter || sectorFilter === 'ALL') {
      return this.booths;
    }
    return this.booths.filter((b) => b.industrySector === sectorFilter);
  }

  public static getBoothById(id: string): EmployerBooth | undefined {
    return this.booths.find((b) => b.boothId === id);
  }

  public static joinQueue(
    boothId: string,
    studentId: string,
    studentName: string,
    major: string,
    gradYear: number
  ): StudentBoothQueueTicket {
    const booth = this.getBoothById(boothId);
    if (!booth) {
      throw new Error(`Booth with ID ${boothId} not found.`);
    }

    booth.currentQueueLength += 1;
    booth.totalResumesDropped += 1;
    booth.estimatedWaitMinutes = Math.ceil((booth.currentQueueLength * 5) / Math.max(1, booth.recruitersActive));

    const ticket: StudentBoothQueueTicket = {
      ticketId: `TICK-${Date.now()}`,
      boothId,
      companyName: booth.companyName,
      studentId,
      studentName,
      major,
      graduationYear: gradYear,
      queuePosition: booth.currentQueueLength,
      status: 'WAITING',
      joinedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      interviewRoomUrl: `${booth.virtualLobbyMeetingUrl}/room-${Date.now().toString().slice(-4)}`,
    };

    this.tickets.unshift(ticket);
    return ticket;
  }

  public static getStudentTickets(studentId?: string): StudentBoothQueueTicket[] {
    if (studentId) {
      return this.tickets.filter((t) => t.studentId === studentId);
    }
    return this.tickets;
  }

  public static getCareerFairMetrics() {
    const totalBooths = this.booths.length;
    const totalOpenRoles = this.booths.reduce((acc, b) => acc + b.openRolesCount, 0);
    const totalResumesDropped = this.booths.reduce((acc, b) => acc + b.totalResumesDropped, 0);
    const activeRecruiters = this.booths.reduce((acc, b) => acc + b.recruitersActive, 0);

    return {
      totalBooths,
      totalOpenRoles,
      totalResumesDropped,
      activeRecruiters,
    };
  }
}
