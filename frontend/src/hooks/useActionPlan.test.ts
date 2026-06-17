import { renderHook, act } from '@testing-library/react';
import { useActionPlan } from './useActionPlan';
import { ApiClient } from '../services/api';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

vi.mock('../services/api', () => ({
  ApiClient: {
    getPlans: vi.fn(),
  },
}));

describe('useActionPlan', () => {
  const mockResult = {
    housing: { electricity: 100, gas: 100, waste: 100, total: 300 },
    transport: { car: 100, transit: 100, flights: 100, total: 300 },
    consumption: { diet: 100, shopping: 100, total: 200 },
    grandTotal: 800
  };

  const mockPlan = {
    actions: [],
    habits: [
      { id: 'h1', title: 'Habit 1', description: 'Desc 1', frequency: 'daily' as const, points: 10 },
      { id: 'h2', title: 'Habit 2', description: 'Desc 2', frequency: 'weekly' as const, points: 20 },
    ],
    milestones: [
      { id: 'm1', title: 'M1', description: 'Desc', targetPoints: 15, unlocked: false }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state and empty data', () => {
    (ApiClient.getPlans as Mock).mockImplementation(() => new Promise(() => {})); // pending promise
    const { result } = renderHook(() => useActionPlan(mockResult));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.plan).toBe(null);
    expect(result.current.points).toBe(0);
  });

  it('should load plan successfully and calculate points on toggle', async () => {
    (ApiClient.getPlans as Mock).mockResolvedValue(mockPlan);
    const { result, rerender } = renderHook(() => useActionPlan(mockResult));
    
    // Wait for the effect to complete
    await act(async () => {
      // Allow promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.plan).toEqual(mockPlan);

    // Toggle habit 1
    act(() => {
      result.current.toggleHabit(mockPlan.habits[0]);
    });

    expect(result.current.completedHabits['h1']).toBe(true);
    expect(result.current.points).toBe(10);
    expect(result.current.getMilestoneStatus(mockPlan.milestones[0])).toBe(false);

    // Toggle habit 2
    act(() => {
      result.current.toggleHabit(mockPlan.habits[1]);
    });

    expect(result.current.completedHabits['h2']).toBe(true);
    expect(result.current.points).toBe(30);
    expect(result.current.getMilestoneStatus(mockPlan.milestones[0])).toBe(true);

    // Toggle habit 1 off
    act(() => {
      result.current.toggleHabit(mockPlan.habits[0]);
    });
    expect(result.current.points).toBe(20);
  });

  it('should handle API errors gracefully', async () => {
    (ApiClient.getPlans as Mock).mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useActionPlan(mockResult));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.plan).toBe(null);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
