import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalculationResult } from '../../../backend/src/services/calculatorService';
import { ActionPlanResult, HabitItem, Milestone } from '../../../backend/src/services/planService';
import { ApiClient } from '../services/api';
import { getBadgeInfo } from '../components/BadgeSystem';

export interface ActionPlanMetrics {
  plan: ActionPlanResult | null;
  completedHabits: Record<string, boolean>;
  loading: boolean;
  points: number;
  badgeInfo: ReturnType<typeof getBadgeInfo>;
  toggleHabit: (habit: HabitItem) => void;
  getMilestoneStatus: (milestone: Milestone) => boolean;
}

/**
 * Custom hook to isolate all state storage, network fetching, and calculation logic for the ActionPlan component.
 * @param result The core footprint calculation result from the backend.
 * @returns Fully computed presentation metrics and bounded callbacks ready for pure rendering.
 */
export function useActionPlan(result: CalculationResult): ActionPlanMetrics {
  const [plan, setPlan] = useState<ActionPlanResult | null>(null);
  const [completedHabits, setCompletedHabits] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Derive points dynamically from the plan and completion state to prevent duplicate state bugs
  const points = useMemo(() => {
    if (!plan) return 0;
    return plan.habits.reduce((sum: number, habit: HabitItem) => sum + (completedHabits[habit.id] ? habit.points : 0), 0);
  }, [plan, completedHabits]);

  // Get active badge based on emissions
  const badgeInfo = useMemo(() => getBadgeInfo(result.grandTotal), [result.grandTotal]);

  // Fetch plan from backend on result mount
  useEffect(() => {
    let active = true;
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const res = await ApiClient.getPlans(result);
        if (active) {
          setPlan(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchPlan();
    return () => {
      active = false;
    };
  }, [result]);

  const toggleHabit = useCallback((habit: HabitItem): void => {
    setCompletedHabits((prev) => ({
      ...prev,
      [habit.id]: !prev[habit.id]
    }));
  }, []);

  const getMilestoneStatus = useCallback((milestone: Milestone): boolean => {
    return points >= milestone.targetPoints;
  }, [points]);

  return {
    plan,
    completedHabits,
    loading,
    points,
    badgeInfo,
    toggleHabit,
    getMilestoneStatus,
  };
}
