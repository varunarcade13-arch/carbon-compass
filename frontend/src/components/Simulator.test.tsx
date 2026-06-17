import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Simulator } from './Simulator';
import { useSimulator } from '../hooks/useSimulator';

vi.mock('../hooks/useSimulator');
vi.mock('./BadgeSystem', () => ({
  BadgeIcon: () => <div data-testid="badge-icon">BadgeIcon</div>
}));

describe('Simulator Component', () => {
  const mockBaseInput: any = { housing: { electricityKwh: 100 } };
  
  const mockSimResult = {
    savingsAnnual: 1500,
    savingsPct: 20,
    projections: [
      { year: 1, savingsAnnual: 1500, savingsCumulative: 1500 },
      { year: 2, savingsAnnual: 1500, savingsCumulative: 3000 },
      { year: 3, savingsAnnual: 1500, savingsCumulative: 4500 },
      { year: 4, savingsAnnual: 1500, savingsCumulative: 6000 },
      { year: 5, savingsAnnual: 1500, savingsCumulative: 7500 },
    ]
  };

  it('renders loading state initially', () => {
    (useSimulator as any).mockReturnValue({
      toggles: {},
      simResult: null,
      currentBadge: null,
      projectedBadge: null,
      updateToggle: vi.fn()
    });

    render(<Simulator baseInput={mockBaseInput} />);
    expect(screen.getByText('Loading simulation parameters...')).toBeInTheDocument();
  });

  it('renders simulation result and handles toggles', () => {
    const updateToggle = vi.fn();
    (useSimulator as any).mockReturnValue({
      toggles: {
        solarPanels: true,
        meatlessDays: 3
      },
      simResult: mockSimResult,
      currentBadge: { tier: 'gold', title: 'Gold', color: '#fff' },
      projectedBadge: { tier: 'diamond', title: 'Diamond', color: '#fff' },
      updateToggle
    });

    render(<Simulator baseInput={mockBaseInput} />);

    // Assert visual projections
    expect(screen.getByText('1.5 Tons')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('🏆 Projected Rank Up!')).toBeInTheDocument();
    
    // Test toggle interactions
    const solarToggle = screen.getByRole('checkbox', { name: /Install Solar Panels/i });
    expect(solarToggle).toBeChecked();
    
    // Simulate keyboard enter on toggle
    fireEvent.keyDown(solarToggle, { key: 'Enter', code: 'Enter' });
    expect(updateToggle).toHaveBeenCalledWith('solarPanels', false); // Since it was true

    // Simulate click on the actual checkbox
    fireEvent.click(solarToggle);
    expect(updateToggle).toHaveBeenCalledWith('solarPanels', false); // It was true initially, state mock didn't change


    // Test slider interactions
    const meatlessSlider = screen.getByRole('slider', { name: /Meatless Days/i });
    expect(meatlessSlider).toHaveValue('3');
    
    fireEvent.change(meatlessSlider, { target: { value: '4' } });
    expect(updateToggle).toHaveBeenCalledWith('meatlessDays', 4);
  });

  it('renders correctly when maxSavings is 0', () => {
    (useSimulator as any).mockReturnValue({
      toggles: {},
      simResult: {
        savingsAnnual: 0,
        savingsPct: 0,
        projections: [
          { year: 1, savingsAnnual: 0, savingsCumulative: 0 },
          { year: 2, savingsAnnual: 0, savingsCumulative: 0 },
          { year: 3, savingsAnnual: 0, savingsCumulative: 0 },
          { year: 4, savingsAnnual: 0, savingsCumulative: 0 },
          { year: 5, savingsAnnual: 0, savingsCumulative: 0 },
        ]
      },
      currentBadge: { tier: 'gold', title: 'Gold', color: '#fff' },
      projectedBadge: { tier: 'gold', title: 'Gold', color: '#fff' },
      updateToggle: vi.fn()
    });

    render(<Simulator baseInput={mockBaseInput} />);
    expect(screen.getByText('0.0 Tons')).toBeInTheDocument();
  });
});

