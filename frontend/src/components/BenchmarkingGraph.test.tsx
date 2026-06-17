import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BenchmarkingGraph } from './BenchmarkingGraph';

describe('BenchmarkingGraph Component', () => {
  it('renders benchmark lines', () => {
    render(<BenchmarkingGraph 
      userTons={5.0} 
      usAverageTons={16.0} 
      globalAverageTons={4.5} 
      targetGoalTons={2.0} 
      maxBenchmark={16.0} 
    />);

    expect(screen.getByText('Your Footprint')).toBeInTheDocument();
    expect(screen.getByText('5.0 Tons')).toBeInTheDocument();
    
    expect(screen.getByText('US Average')).toBeInTheDocument();
    expect(screen.getByText('16.0 Tons')).toBeInTheDocument();
    
    expect(screen.getByText('Global Average')).toBeInTheDocument();
    expect(screen.getByText('4.5 Tons')).toBeInTheDocument();
    
    expect(screen.getByText('Net-Zero Paris Goal')).toBeInTheDocument();
    expect(screen.getByText('2.0 Tons')).toBeInTheDocument();
  });
});
