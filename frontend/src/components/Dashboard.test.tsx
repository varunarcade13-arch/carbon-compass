import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

vi.mock('../hooks/useDashboardMetrics');
vi.mock('./BadgeSystem', () => ({
  BadgeIcon: () => <div data-testid="badge-icon">BadgeIcon</div>,
  BadgeGallery: () => <div data-testid="badge-gallery">BadgeGallery</div>
}));
vi.mock('./CategoryBreakdown', () => ({
  CategoryBreakdown: () => <div data-testid="category-breakdown">CategoryBreakdown</div>
}));
vi.mock('./BenchmarkingGraph', () => ({
  BenchmarkingGraph: () => <div data-testid="benchmarking-graph">BenchmarkingGraph</div>
}));

describe('Dashboard Component', () => {
  const mockResult: any = {
    housing: { total: 1000 },
    transport: { total: 1000 },
    consumption: { total: 1000 },
    grandTotal: 3000
  };

  it('renders low impact dashboard', () => {
    (useDashboardMetrics as any).mockReturnValue({
      tons: '3.0',
      badgeInfo: { tier: 'diamond', title: 'Diamond', color: '#fff' },
      rating: 'low',
      ratingLabel: 'Low Impact (Eco Friendly)',
      ratingClass: 'low',
      percentageHousing: 33,
      percentageTransport: 33,
      percentageConsumption: 33,
      housingPiePercentage: 33,
      transportPiePercentage: 33,
      consumptionPiePercentage: 33,
      userTons: 3,
      usAverageTons: 16,
      globalAverageTons: 4.5,
      targetGoalTons: 2,
      maxBenchmark: 16
    });

    const onRecalculate = vi.fn();
    render(<Dashboard result={mockResult} onRecalculate={onRecalculate} />);

    expect(screen.getByText('3.0')).toBeInTheDocument();
    expect(screen.getByText('Low Impact (Eco Friendly)')).toBeInTheDocument();
    expect(screen.getByText(/Excellent!/i)).toBeInTheDocument();

    const recalcBtn = screen.getByText('Adjust Assessment');
    fireEvent.click(recalcBtn);
    expect(onRecalculate).toHaveBeenCalled();

    expect(screen.getByTestId('badge-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('category-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('benchmarking-graph')).toBeInTheDocument();
  });

  it('renders med impact description', () => {
    (useDashboardMetrics as any).mockReturnValue({
      tons: '8.0',
      badgeInfo: { tier: 'silver', title: 'Silver', color: '#fff' },
      rating: 'med',
      ratingLabel: 'Average Impact',
      ratingClass: 'med',
      housingPiePercentage: 33,
      transportPiePercentage: 33,
      consumptionPiePercentage: 33,
    });

    render(<Dashboard result={mockResult} onRecalculate={vi.fn()} />);
    expect(screen.getByText(/Your footprint matches typical averages/i)).toBeInTheDocument();
  });

  it('renders high impact description', () => {
    (useDashboardMetrics as any).mockReturnValue({
      tons: '15.0',
      badgeInfo: { tier: 'bronze', title: 'Bronze', color: '#fff' },
      rating: 'high',
      ratingLabel: 'High Impact (Action Needed)',
      ratingClass: 'high',
      housingPiePercentage: 33,
      transportPiePercentage: 33,
      consumptionPiePercentage: 33,
    });

    render(<Dashboard result={mockResult} onRecalculate={vi.fn()} />);
    expect(screen.getByText(/Your footprint is high/i)).toBeInTheDocument();
  });
});
