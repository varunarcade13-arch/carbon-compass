import { renderHook } from '@testing-library/react';
import { useDashboardMetrics } from './useDashboardMetrics';
import { describe, it, expect } from 'vitest';

describe('useDashboardMetrics', () => {
  it('should calculate metrics correctly for low impact', () => {
    const mockResult = {
      housing: { electricity: 0, gas: 0, waste: 0, total: 1000 },
      transport: { car: 0, transit: 0, flights: 0, total: 1000 },
      consumption: { diet: 0, shopping: 0, total: 1000 },
      grandTotal: 3000
    };
    
    const { result } = renderHook(() => useDashboardMetrics(mockResult));
    
    expect(result.current.tons).toBe('3.0');
    expect(result.current.rating).toBe('low');
    expect(result.current.ratingClass).toBe('low');
    expect(result.current.percentageHousing).toBe(100);
    expect(result.current.housingPiePercentage).toBe(33);
  });

  it('should calculate metrics correctly for medium impact', () => {
    const mockResult = {
      housing: { electricity: 0, gas: 0, waste: 0, total: 2000 },
      transport: { car: 0, transit: 0, flights: 0, total: 4000 },
      consumption: { diet: 0, shopping: 0, total: 2000 },
      grandTotal: 8000
    };
    
    const { result } = renderHook(() => useDashboardMetrics(mockResult));
    
    expect(result.current.tons).toBe('8.0');
    expect(result.current.rating).toBe('med');
    expect(result.current.percentageTransport).toBe(100); // 4000 is max
    expect(result.current.percentageHousing).toBe(50); // 2000 / 4000
    expect(result.current.transportPiePercentage).toBe(50); // 4000 / 8000
  });

  it('should calculate metrics correctly for high impact', () => {
    const mockResult = {
      housing: { electricity: 0, gas: 0, waste: 0, total: 5000 },
      transport: { car: 0, transit: 0, flights: 0, total: 5000 },
      consumption: { diet: 0, shopping: 0, total: 5000 },
      grandTotal: 15000
    };
    
    const { result } = renderHook(() => useDashboardMetrics(mockResult));
    
    expect(result.current.tons).toBe('15.0');
    expect(result.current.rating).toBe('high');
    expect(result.current.maxBenchmark).toBe(16.0); // usAverageTons is 16.0
  });

  it('should handle zero emissions gracefully', () => {
    const mockResult = {
      housing: { electricity: 0, gas: 0, waste: 0, total: 0 },
      transport: { car: 0, transit: 0, flights: 0, total: 0 },
      consumption: { diet: 0, shopping: 0, total: 0 },
      grandTotal: 0
    };
    
    const { result } = renderHook(() => useDashboardMetrics(mockResult));
    
    expect(result.current.tons).toBe('0.0');
    expect(result.current.percentageHousing).toBe(0);
    expect(result.current.housingPiePercentage).toBe(0);
  });
});
