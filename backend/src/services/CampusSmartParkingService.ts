/**
 * Enterprise Campus Smart Parking & IoT Telemetry Service
 * Monitors campus parking garage sensor nodes, real-time stall occupancy,
 * EV charging station status, permit validation, and dynamic pricing.
 */

export interface ParkingGarageZone {
  zoneId: string;
  zoneName: string;
  facilityLocation: string;
  totalCapacityStalls: number;
  occupiedStalls: number;
  availableStalls: number;
  evChargerStallsCount: number;
  evChargersOccupied: number;
  hourlyPermitRateUsd: number;
  isLotFull: boolean;
  sensorHealthStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export interface StudentPermitPass {
  passId: string;
  studentId: string;
  licensePlate: string;
  permitType: 'COMMUTER_RESIDENT' | 'FACULTY_STAFF' | 'EV_CHARGING_PREMIUM' | 'DAILY_VISITOR';
  assignedZoneId: string;
  expirationDate: string;
  isActive: boolean;
}

export class CampusSmartParkingService {
  private static zones: ParkingGarageZone[] = [
    {
      zoneId: 'PARK-ZONE-A',
      zoneName: 'North Campus Multi-Level Parking Garage',
      facilityLocation: 'Engineering & Science Quad',
      totalCapacityStalls: 450,
      occupiedStalls: 382,
      availableStalls: 68,
      evChargerStallsCount: 24,
      evChargersOccupied: 18,
      hourlyPermitRateUsd: 2.5,
      isLotFull: false,
      sensorHealthStatus: 'HEALTHY',
    },
    {
      zoneId: 'PARK-ZONE-B',
      zoneName: 'South Campus Visitor & Athletic Center Lot',
      facilityLocation: 'Stadium & Student Union',
      totalCapacityStalls: 300,
      occupiedStalls: 295,
      availableStalls: 5,
      evChargerStallsCount: 12,
      evChargersOccupied: 12,
      hourlyPermitRateUsd: 4.0,
      isLotFull: false,
      sensorHealthStatus: 'HEALTHY',
    },
  ];

  private static passes: StudentPermitPass[] = [
    {
      passId: 'PASS-701',
      studentId: 'STU-999',
      licensePlate: '7XYZ890',
      permitType: 'COMMUTER_RESIDENT',
      assignedZoneId: 'PARK-ZONE-A',
      expirationDate: '2026-12-31',
      isActive: true,
    },
  ];

  public static getZones(): ParkingGarageZone[] {
    return this.zones;
  }

  public static getZoneById(id: string): ParkingGarageZone | undefined {
    return this.zones.find((z) => z.zoneId === id);
  }

  public static reservePermitPass(
    studentId: string,
    licensePlate: string,
    permitType: 'COMMUTER_RESIDENT' | 'FACULTY_STAFF' | 'EV_CHARGING_PREMIUM' | 'DAILY_VISITOR',
    assignedZoneId: string
  ): StudentPermitPass {
    const zone = this.getZoneById(assignedZoneId);
    if (!zone) {
      throw new Error(`Zone ${assignedZoneId} not found.`);
    }

    if (zone.availableStalls <= 0) {
      throw new Error(`Parking zone ${zone.zoneName} has no remaining stalls available.`);
    }

    zone.occupiedStalls += 1;
    zone.availableStalls -= 1;
    if (zone.availableStalls === 0) {
      zone.isLotFull = true;
    }

    const pass: StudentPermitPass = {
      passId: `PASS-${Date.now()}`,
      studentId,
      licensePlate: licensePlate.toUpperCase(),
      permitType,
      assignedZoneId,
      expirationDate: '2026-12-31',
      isActive: true,
    };

    this.passes.unshift(pass);
    return pass;
  }

  public static getStudentPasses(studentId?: string): StudentPermitPass[] {
    if (studentId) {
      return this.passes.filter((p) => p.studentId === studentId);
    }
    return this.passes;
  }

  public static getMetrics() {
    const totalCapacity = this.zones.reduce((acc, z) => acc + z.totalCapacityStalls, 0);
    const totalOccupied = this.zones.reduce((acc, z) => acc + z.occupiedStalls, 0);
    const totalEvChargers = this.zones.reduce((acc, z) => acc + z.evChargerStallsCount, 0);
    const occupancyRatePct = Number(((totalOccupied / totalCapacity) * 100).toFixed(1));

    return {
      totalCapacity,
      totalOccupied,
      totalEvChargers,
      occupancyRatePct,
    };
  }
}
