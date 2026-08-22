/**
 * Enterprise Campus Smart Dining Hall & AI Nutrition Service
 * Manages dining hall crowd telemetry, meal plan token balances,
 * dietary allergen filtering (Vegan, Gluten-Free, Halal, Kosher), and macro tracking.
 */

export interface DiningHallVenue {
  hallId: string;
  name: string;
  locationArea: string;
  crowdOccupancyPct: number;
  currentWaitTimeMinutes: number;
  status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
  todaysSpecial: string;
  calorieCountApprox: number;
}

export interface StudentMealPassToken {
  passId: string;
  studentId: string;
  remainingMealSwipes: number;
  diningDollarBalanceUsd: number;
  dietaryPreferenceFilter: 'VEGAN' | 'VEGETARIAN' | 'GLUTEN_FREE' | 'HALAL' | 'KOSHER' | 'NONE';
  activeMealPlanTier: 'UNLIMITED_VIP' | 'WEEKLY_14' | 'COMMUTER_COMMUNITY';
}

export class CampusDiningService {
  private static venues: DiningHallVenue[] = [
    {
      hallId: 'HALL-NORTH-01',
      name: 'North Quad Commons & International Grill',
      locationArea: 'North Campus Residential District',
      crowdOccupancyPct: 78,
      currentWaitTimeMinutes: 8,
      status: 'OPEN',
      todaysSpecial: 'Organic Tofu Teriyaki Bowl & Wild Harvest Rice',
      calorieCountApprox: 540,
    },
    {
      hallId: 'HALL-SOUTH-02',
      name: 'South Student Union Artisanal Buffet',
      locationArea: 'South Campus Quad',
      crowdOccupancyPct: 92,
      currentWaitTimeMinutes: 18,
      status: 'OPEN',
      todaysSpecial: 'Grass-Fed Mediterranean Steak & Quinoa Salad',
      calorieCountApprox: 680,
    },
  ];

  private static passes: Dict<string, StudentMealPassToken> = {
    'STU-999': {
      passId: 'PASS-DINING-701',
      studentId: 'STU-999',
      remainingMealSwipes: 42,
      diningDollarBalanceUsd: 185.5,
      dietaryPreferenceFilter: 'VEGAN',
      activeMealPlanTier: 'WEEKLY_14',
    },
  };

  public static getVenues(): DiningHallVenue[] {
    return this.venues;
  }

  public static getStudentPass(studentId: string): StudentMealPassToken {
    if (!this.passes[studentId]) {
      this.passes[studentId] = {
        passId: `PASS-${Date.now()}`,
        studentId,
        remainingMealSwipes: 14,
        diningDollarBalanceUsd: 50.0,
        dietaryPreferenceFilter: 'NONE',
        activeMealPlanTier: 'COMMUTER_COMMUNITY',
      };
    }
    return this.passes[studentId];
  }

  public static redeemSwipe(studentId: string, hallId: string): StudentMealPassToken {
    const pass = this.getStudentPass(studentId);
    if (pass.remainingMealSwipes <= 0) {
      throw new Error('Meal swipe balance exhausted. Please add Dining Dollars.');
    }

    pass.remainingMealSwipes -= 1;
    return pass;
  }

  public static getDiningMetrics() {
    const totalVenuesOpen = this.venues.filter((v) => v.status === 'OPEN').length;
    const avgWaitMinutes = Math.round(
      this.venues.reduce((acc, v) => acc + v.currentWaitTimeMinutes, 0) / (this.venues.length || 1)
    );

    return {
      totalVenuesOpen,
      avgWaitMinutes,
      telemetryStatus: 'LIVE_SENSOR_GRID_OK',
    };
  }
}

interface Dict<K extends string, V> {
  [key: string]: V;
}
