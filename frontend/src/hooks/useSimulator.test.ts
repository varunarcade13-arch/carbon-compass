import { renderHook, act } from '@testing-library/react';
import { useSimulator } from './useSimulator';
import { ApiClient } from '../services/api';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

vi.mock('../services/api', () => ({
  ApiClient: {
    simulate: vi.fn(),
  },
}));

describe('useSimulator', () => {
  const mockInput = {
    housing: { electricityKwh: 100 },
    transport: { carKm: 20 },
  };

  const mockSimResult = {
    baseline: { housing: { total: 100 }, transport: { total: 100 }, consumption: { total: 100 }, grandTotal: 3000 },
    simulated: { housing: { total: 50 }, transport: { total: 50 }, consumption: { total: 50 }, grandTotal: 1500 },
    savingsAnnual: 1500,
    projections: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default toggles and run simulation', async () => {
    (ApiClient.simulate as Mock).mockResolvedValue(mockSimResult);
    
    const { result } = renderHook(() => useSimulator(mockInput));
    
    expect(result.current.toggles.switchEv).toBe(false);
    expect(result.current.simResult).toBe(null);
    expect(result.current.currentBadge).toBe(null);
    expect(result.current.projectedBadge).toBe(null);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(ApiClient.simulate).toHaveBeenCalledWith(mockInput, result.current.toggles);
    expect(result.current.simResult).toEqual(mockSimResult);
    expect(result.current.currentBadge?.title).toBeDefined();
    expect(result.current.projectedBadge?.title).toBeDefined();
  });

  it('should handle toggle updates and re-run simulation', async () => {
    (ApiClient.simulate as Mock).mockResolvedValue(mockSimResult);
    
    const { result } = renderHook(() => useSimulator(mockInput));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    (ApiClient.simulate as Mock).mockClear();

    act(() => {
      result.current.updateToggle('switchEv', true);
    });

    expect(result.current.toggles.switchEv).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(ApiClient.simulate).toHaveBeenCalledWith(mockInput, {
      ...result.current.toggles,
      switchEv: true
    });
  });

  it('should handle API errors gracefully', async () => {
    (ApiClient.simulate as Mock).mockRejectedValue(new Error('Sim error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useSimulator(mockInput));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.simResult).toBe(null);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
