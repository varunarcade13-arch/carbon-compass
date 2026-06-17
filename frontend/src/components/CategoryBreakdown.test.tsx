import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBreakdown } from './CategoryBreakdown';

describe('CategoryBreakdown Component', () => {
  const mockResult: any = {
    housing: { total: 1000, electricity: 100, gas: 200, waste: 700 },
    transport: { total: 2000, car: 1000, transit: 500, flights: 500 },
    consumption: { total: 3000, diet: 1500, shopping: 1500 }
  };

  it('renders category totals and sub-breakdowns', () => {
    render(<CategoryBreakdown 
      result={mockResult} 
      percentageHousing={33} 
      percentageTransport={66} 
      percentageConsumption={100} 
    />);

    expect(screen.getByText('1.0 tons')).toBeInTheDocument();
    expect(screen.getByText(/Grid: 100kg/i)).toBeInTheDocument();
    
    expect(screen.getByText('2.0 tons')).toBeInTheDocument();
    expect(screen.getByText(/Car: 1000kg/i)).toBeInTheDocument();
    
    expect(screen.getByText('3.0 tons')).toBeInTheDocument();
    expect(screen.getByText(/Diet: 1500kg/i)).toBeInTheDocument();
  });
});
