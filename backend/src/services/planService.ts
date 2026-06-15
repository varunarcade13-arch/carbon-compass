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

export class PlanService {
  public static generatePlan(result: CalculationResult): ActionPlanResult {
    const actions: ActionItem[] = [];
    const habits: HabitItem[] = [];
    const milestones: Milestone[] = [
      { id: 'm1', title: 'Eco Starter', description: 'Complete your initial assessment', targetPoints: 0, unlocked: true },
      { id: 'm2', title: 'Carbon Cutter', description: 'Complete 3 daily habits', targetPoints: 30, unlocked: false },
      { id: 'm3', title: 'Green Pioneer', description: 'Complete 10 daily habits and 1 high impact action', targetPoints: 100, unlocked: false },
      { id: 'm4', title: 'Net Zero Champion', description: 'Reach 250 points in habit completions', targetPoints: 250, unlocked: false },
    ];

    // 1. Analyze Housing
    if (result.housing.total > 3000 || (result.housing.total > 1500 && (result.housing.total / result.grandTotal) > 0.3)) {
      actions.push(
        {
          id: 'h_act1',
          title: 'Upgrade to Smart Thermostat',
          description: 'Optimizes heating and cooling schedules, reducing energy waste by up to 15%.',
          difficulty: 'medium',
          impact: 'medium',
          estimatedSavingsKg: Math.round(result.housing.gas * 0.15),
        },
        {
          id: 'h_act2',
          title: 'Install Home Solar Panels',
          description: 'Transition to 100% clean residential energy and lower grid electricity reliance.',
          difficulty: 'hard',
          impact: 'high',
          estimatedSavingsKg: Math.round(result.housing.electricity * 0.8),
        }
      );
      habits.push(
        {
          id: 'h_hab1',
          title: 'Turn down thermostat by 2°C',
          description: 'Lower heating/cooling temperatures when sleeping or away.',
          frequency: 'daily',
          points: 10,
        },
        {
          id: 'h_hab2',
          title: 'Unplug Standby Devices',
          description: 'Turn off phantom loads (TVs, chargers, gaming consoles) at the wall.',
          frequency: 'daily',
          points: 5,
        }
      );
    } else {
      // Default lower-impact actions for efficient housing
      actions.push({
        id: 'h_act_led',
        title: 'Switch to 100% LED Bulbs',
        description: 'Replace remaining incandescent bulbs with energy-efficient LEDs.',
        difficulty: 'easy',
        impact: 'low',
        estimatedSavingsKg: 150,
      });
    }

    // 2. Analyze Transport
    if (result.transport.total > 3000 || (result.transport.total > 1500 && (result.transport.total / result.grandTotal) > 0.3)) {
      actions.push(
        {
          id: 't_act1',
          title: 'Transition to Electric Vehicle',
          description: 'Swap your gasoline car for an EV to slash commuting emissions by over 80%.',
          difficulty: 'hard',
          impact: 'high',
          estimatedSavingsKg: Math.round(result.transport.car * 0.8),
        },
        {
          id: 't_act2',
          title: 'Commit to Public Transit Comuting',
          description: 'Shift at least 3 days of weekly commuting from driving to bus/train transit.',
          difficulty: 'medium',
          impact: 'high',
          estimatedSavingsKg: Math.round(result.transport.car * 0.4),
        }
      );
      habits.push(
        {
          id: 't_hab1',
          title: 'Walk or Bike Short Trips (< 3km)',
          description: 'Replace short car drives with clean, active transport.',
          frequency: 'daily',
          points: 15,
        },
        {
          id: 't_hab2',
          title: 'Consolidate Weekly Errands',
          description: 'Combine shopping and grocery runs into a single round trip to minimize driving.',
          frequency: 'weekly',
          points: 20,
        }
      );
    } else {
      habits.push({
        id: 't_hab_eco_drive',
        title: 'Practice Eco-Driving',
        description: 'Maintain steady speeds, avoid hard accelerations, and cut idling.',
        frequency: 'daily',
        points: 5,
      });
    }

    // 3. Analyze Consumption
    if (result.consumption.total > 2000 || (result.consumption.total > 1500 && (result.consumption.total / result.grandTotal) > 0.3)) {
      actions.push(
        {
          id: 'c_act1',
          title: 'Adopt a Mid-Week Vegan Diet',
          description: 'Go meat-free and dairy-free 3 days a week to lower food supply chain impact.',
          difficulty: 'medium',
          impact: 'medium',
          estimatedSavingsKg: 600,
        },
        {
          id: 'c_act2',
          title: 'Buy Second-Hand First',
          description: 'Pledge to purchase clothing, furniture, and books pre-owned for the next 6 months.',
          difficulty: 'easy',
          impact: 'medium',
          estimatedSavingsKg: Math.round(result.consumption.shopping * 0.3),
        }
      );
      habits.push(
        {
          id: 'c_hab1',
          title: 'Zero Food Waste Day',
          description: 'Plan meals, utilize leftovers, and compost food scraps completely.',
          frequency: 'daily',
          points: 10,
        },
        {
          id: 'c_hab2',
          title: 'Bring Reusable Tote & Cup',
          description: 'Avoid single-use plastics and disposable items during consumption.',
          frequency: 'daily',
          points: 5,
        }
      );
    } else {
      habits.push({
        id: 'c_hab_local',
        title: 'Source Food Locally',
        description: 'Purchase ingredients grown within 100 miles to reduce food miles.',
        frequency: 'weekly',
        points: 15,
      });
    }

    return {
      actions,
      habits,
      milestones,
    };
  }
}
