import { CalculationResult } from './calculatorService';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  estimatedSavingsKg: number;
}

export interface HabitItem {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  points: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetPoints: number;
  unlocked: boolean;
}

export interface ActionPlanResult {
  actions: ActionItem[];
  habits: HabitItem[];
  milestones: Milestone[];
}

/**
 * PlanService generates a personalized sustainability action roadmap.
 * It analyzes high-impact areas from a user's baseline and recommends specific actions.
 */
export class PlanService {
  private static readonly cache = new WeakMap<CalculationResult, ActionPlanResult>();

  private static analyzeHousingImpact(result: CalculationResult, actions: ActionItem[], habits: HabitItem[]): void {
    if (result.housing.total > 3000 || (result.housing.total > 1500 && (result.housing.total / result.grandTotal) > 0.3)) {
      actions.push(
        { id: 'h_act1', title: 'Upgrade to Smart Thermostat', description: 'Optimizes heating and cooling schedules.', difficulty: 'medium', impact: 'medium', estimatedSavingsKg: Math.round(result.housing.gas * 0.15) },
        { id: 'h_act2', title: 'Install Home Solar Panels', description: 'Transition to 100% clean residential energy.', difficulty: 'hard', impact: 'high', estimatedSavingsKg: Math.round(result.housing.electricity * 0.8) }
      );
      habits.push(
        { id: 'h_hab1', title: 'Turn down thermostat by 2°C', description: 'Lower heating/cooling temperatures.', frequency: 'daily', points: 10 },
        { id: 'h_hab2', title: 'Unplug Standby Devices', description: 'Turn off phantom loads at the wall.', frequency: 'daily', points: 5 }
      );
    } else {
      actions.push({ id: 'h_act_led', title: 'Switch to 100% LED Bulbs', description: 'Replace incandescent bulbs.', difficulty: 'easy', impact: 'low', estimatedSavingsKg: 150 });
    }
  }

  private static analyzeTransportImpact(result: CalculationResult, actions: ActionItem[], habits: HabitItem[]): void {
    if (result.transport.total > 3000 || (result.transport.total > 1500 && (result.transport.total / result.grandTotal) > 0.3)) {
      actions.push(
        { id: 't_act1', title: 'Transition to Electric Vehicle', description: 'Swap gasoline car for EV.', difficulty: 'hard', impact: 'high', estimatedSavingsKg: Math.round(result.transport.car * 0.8) },
        { id: 't_act2', title: 'Commit to Public Transit', description: 'Shift 3 days of commuting to transit.', difficulty: 'medium', impact: 'high', estimatedSavingsKg: Math.round(result.transport.car * 0.4) }
      );
      habits.push(
        { id: 't_hab1', title: 'Walk or Bike Short Trips (< 3km)', description: 'Replace short drives with active transport.', frequency: 'daily', points: 15 },
        { id: 't_hab2', title: 'Consolidate Weekly Errands', description: 'Combine shopping into a single trip.', frequency: 'weekly', points: 20 }
      );
    } else {
      habits.push({ id: 't_hab_eco_drive', title: 'Practice Eco-Driving', description: 'Maintain steady speeds, cut idling.', frequency: 'daily', points: 5 });
    }
  }

  private static analyzeConsumptionImpact(result: CalculationResult, actions: ActionItem[], habits: HabitItem[]): void {
    if (result.consumption.total > 2000 || (result.consumption.total > 1500 && (result.consumption.total / result.grandTotal) > 0.3)) {
      actions.push(
        { id: 'c_act1', title: 'Adopt a Mid-Week Vegan Diet', description: 'Go meat-free 3 days a week.', difficulty: 'medium', impact: 'medium', estimatedSavingsKg: 600 },
        { id: 'c_act2', title: 'Buy Second-Hand First', description: 'Purchase pre-owned clothing/furniture.', difficulty: 'easy', impact: 'medium', estimatedSavingsKg: Math.round(result.consumption.shopping * 0.3) }
      );
      habits.push(
        { id: 'c_hab1', title: 'Zero Food Waste Day', description: 'Plan meals, utilize leftovers, compost.', frequency: 'daily', points: 10 },
        { id: 'c_hab2', title: 'Bring Reusable Tote & Cup', description: 'Avoid single-use plastics.', frequency: 'daily', points: 5 }
      );
    } else {
      habits.push({ id: 'c_hab_local', title: 'Source Food Locally', description: 'Purchase ingredients within 100 miles.', frequency: 'weekly', points: 15 });
    }
  }

  /**
   * Evaluates the assessment result to compile a targeted list of actions, habits, and milestones.
   * @param result The structured calculation result for the user's footprint.
   * @returns An ActionPlanResult containing tailored recommendations.
   * @remarks Uses a WeakMap cache to prevent recomputing the plan for identical CalculationResult instances.
   */
  public static generatePlan(result: CalculationResult): ActionPlanResult {
    const cached = PlanService.cache.get(result);
    if (cached) return cached;

    const actions: ActionItem[] = [];
    const habits: HabitItem[] = [];
    const milestones: Milestone[] = [
      { id: 'm1', title: 'Eco Starter', description: 'Complete your initial assessment', targetPoints: 0, unlocked: true },
      { id: 'm2', title: 'Carbon Cutter', description: 'Complete 3 daily habits', targetPoints: 30, unlocked: false },
      { id: 'm3', title: 'Green Pioneer', description: 'Complete 10 daily habits and 1 high impact action', targetPoints: 100, unlocked: false },
      { id: 'm4', title: 'Net Zero Champion', description: 'Reach 250 points in habit completions', targetPoints: 250, unlocked: false },
    ];

    PlanService.analyzeHousingImpact(result, actions, habits);
    PlanService.analyzeTransportImpact(result, actions, habits);
    PlanService.analyzeConsumptionImpact(result, actions, habits);

    const plan = { actions, habits, milestones };
    PlanService.cache.set(result, plan);
    return plan;
  }
}
