import { ApiClient } from './api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculate', () => {
    it('should calculate footprint successfully', async () => {
      const mockResult = { grandTotal: 1000 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const res = await ApiClient.calculate({} as any);
      expect(res).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith('/api/calculate', expect.any(Object));
    });

    it('should throw error on failed calculation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(ApiClient.calculate({} as any)).rejects.toThrow('Calculation failed: Internal Server Error');
    });
  });

  describe('simulate', () => {
    it('should simulate footprint successfully', async () => {
      const mockResult = { savingsAnnual: 500 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const res = await ApiClient.simulate({} as any, {} as any);
      expect(res).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith('/api/simulate', expect.any(Object));
    });

    it('should throw error on failed simulation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request'
      });

      await expect(ApiClient.simulate({} as any, {} as any)).rejects.toThrow('Simulation failed: Bad Request');
    });
  });

  describe('getPlans', () => {
    it('should get action plans successfully', async () => {
      const mockResult = { actions: [] };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const res = await ApiClient.getPlans({} as any);
      expect(res).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith('/api/plans', expect.any(Object));
    });

    it('should throw error on failed plan generation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(ApiClient.getPlans({} as any)).rejects.toThrow('Roadmap generation failed: Not Found');
    });
  });
});
