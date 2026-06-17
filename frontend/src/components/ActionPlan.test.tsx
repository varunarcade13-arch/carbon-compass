import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionPlan } from './ActionPlan';
import { useActionPlan } from '../hooks/useActionPlan';

vi.mock('../hooks/useActionPlan');

describe('ActionPlan Component', () => {
  const mockResult: any = { grandTotal: 1000 };

  const mockPlan = {
    actions: [
      { id: 'a1', title: 'Action 1', description: 'Desc', difficulty: 'easy', estimatedSavingsKg: 50 }
    ],
    habits: [
      { id: 'h1', title: 'Habit 1', description: 'Desc 1', frequency: 'daily', points: 10 },
      { id: 'h2', title: 'Habit 2', description: 'Desc 2', frequency: 'weekly', points: 20 }
    ],
    milestones: [
      { id: 'm1', title: 'Milestone 1', description: 'Desc', targetPoints: 10, unlocked: false },
      { id: 'm2', title: 'Milestone 2', description: 'Desc 2', targetPoints: 50, unlocked: false },
      { id: 'm3', title: 'Milestone 3', description: 'Desc 3', targetPoints: 0, unlocked: false }
    ]
  };


  it('renders loading state', () => {
    (useActionPlan as any).mockReturnValue({
      loading: true,
      plan: null,
      completedHabits: {},
      points: 0,
      badgeInfo: { tier: 'diamond', title: 'Diamond', color: '#fff' },
      toggleHabit: vi.fn(),
      getMilestoneStatus: vi.fn().mockReturnValue(false)
    });

    render(<ActionPlan result={mockResult} />);
    expect(screen.getByText('Generating habit list...')).toBeInTheDocument();
    expect(screen.getByText('Generating personalized roadmaps...')).toBeInTheDocument();
    expect(screen.getByText('Loading milestone configurations...')).toBeInTheDocument();
  });

  it('renders plan data and handles habit toggle', () => {
    const toggleHabit = vi.fn();
    (useActionPlan as any).mockReturnValue({
      loading: false,
      plan: mockPlan,
      completedHabits: { h1: true },
      points: 10,
      badgeInfo: { tier: 'diamond', title: 'Diamond', color: '#fff' },
      toggleHabit,
      getMilestoneStatus: vi.fn().mockImplementation((m) => m.id === 'm1') // unlock m1
    });

    render(<ActionPlan result={mockResult} />);

    // Actions
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('-50 kg CO₂e/yr')).toBeInTheDocument();

    // Milestones
    expect(screen.getByText('Milestone 1')).toBeInTheDocument();

    // Habits
    const habitCheck = screen.getByRole('checkbox', { name: /Habit 1/i });
    expect(habitCheck).toBeInTheDocument();
    expect(habitCheck).toHaveAttribute('aria-checked', 'true');

    // Click habit
    fireEvent.click(habitCheck);
    expect(toggleHabit).toHaveBeenCalledWith(mockPlan.habits[0]);

    // Keyboard toggle
    fireEvent.keyDown(habitCheck, { key: 'Enter', code: 'Enter' });
    expect(toggleHabit).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(habitCheck, { key: ' ', code: 'Space' });
    expect(toggleHabit).toHaveBeenCalledTimes(3);
  });

  it('renders empty states when plan has no items', () => {
    (useActionPlan as any).mockReturnValue({
      loading: false,
      plan: { actions: [], habits: [], milestones: [] },
      completedHabits: {},
      points: 0,
      badgeInfo: { tier: 'diamond', title: 'Diamond', color: '#fff' },
      toggleHabit: vi.fn(),
      getMilestoneStatus: vi.fn().mockReturnValue(false)
    });

    render(<ActionPlan result={mockResult} />);
    
    expect(screen.getByText('No habits available.')).toBeInTheDocument();
    expect(screen.getByText('No actions required. Your footprint is optimal!')).toBeInTheDocument();
  });

  it('renders nothing for milestones if plan is null and not loading', () => {
    (useActionPlan as any).mockReturnValue({
      loading: false,
      plan: null,
      completedHabits: {},
      points: 0,
      badgeInfo: { tier: 'diamond', title: 'Diamond', color: '#fff' },
      toggleHabit: vi.fn(),
      getMilestoneStatus: vi.fn().mockReturnValue(false)
    });

    render(<ActionPlan result={mockResult} />);
    
    expect(screen.getByText('No habits available.')).toBeInTheDocument();
  });
});

