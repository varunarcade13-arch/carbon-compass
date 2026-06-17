import { useMemo } from 'react';
import { CalculationResult } from '../../../backend/src/services/calculatorService';
import { getBadgeInfo } from '../components/BadgeSystem';

export interface DashboardMetrics {
  tons: string;
  totalVal: number;
  badgeInfo: ReturnType<typeof getBadgeInfo>;
  ratingClass: string;
  ratingLabel: string;
  rating: 'low' | 'med' | 'high';
  percentageHousing: number;
  percentageTransport: number;
  percentageConsumption: number;
  housingPiePercentage: number;
  transportPiePercentage: number;
  consumptionPiePercentage: number;
  userTons: number;
  usAverageTons: number;
  globalAverageTons: number;
  targetGoalTons: number;
  maxBenchmark: number;
}

/**
 * Custom hook to isolate all calculation logic and state derivations for the Dashboard component.
 * @param result The core footprint calculation result from the backend.
 * @returns Fully computed presentation metrics ready for pure rendering.
 */
export function useDashboardMetrics(result: CalculationResult): DashboardMetrics {
  const tons = useMemo(() => (result.grandTotal / 1000).toFixed(1), [result.grandTotal]);
  const totalVal = result.grandTotal;

  // Determine Badge Information
  const badgeInfo = useMemo(() => getBadgeInfo(totalVal), [totalVal]);

  // Determine Impact Rating
  const ratingDetails = useMemo(() => {
    let rating: 'low' | 'med' | 'high' = 'med';
    let ratingLabel = 'Average Impact';
    let ratingClass = 'med';
    if (totalVal < 4000) {
      rating = 'low';
      ratingLabel = 'Low Impact (Eco Friendly)';
      ratingClass = 'low';
    } else if (totalVal > 12000) {
      rating = 'high';
      ratingLabel = 'High Impact (Action Needed)';
      ratingClass = 'high';
    }
    return { rating, ratingLabel, ratingClass };
  }, [totalVal]);

  // Percentages for breakdown bars (relative to max category)
  const breakdownPercentages = useMemo(() => {
    const maxCategory = Math.max(result.housing.total, result.transport.total, result.consumption.total, 1);
    return {
      percentageHousing: (result.housing.total / maxCategory) * 100,
      percentageTransport: (result.transport.total / maxCategory) * 100,
      percentageConsumption: (result.consumption.total / maxCategory) * 100,
    };
  }, [result.housing.total, result.transport.total, result.consumption.total]);

  // Donut Piechart calculations (absolute percentages out of total)
  const donutPercentages = useMemo(() => {
    const totalEmissions = Math.max(result.grandTotal, 1);
    const housingPiePercentage = Math.round((result.housing.total / totalEmissions) * 100);
    const transportPiePercentage = Math.round((result.transport.total / totalEmissions) * 100);
    const consumptionPiePercentage = 100 - housingPiePercentage - transportPiePercentage;
    return { housingPiePercentage, transportPiePercentage, consumptionPiePercentage };
  }, [result.grandTotal, result.housing.total, result.transport.total]);

  // Benchmarking scores (in Tons)
  const benchmarkDetails = useMemo(() => {
    const userTons = Number(tons);
    const usAverageTons = 16.0;
    const globalAverageTons = 4.5;
    const targetGoalTons = 2.0;
    const maxBenchmark = Math.max(userTons, usAverageTons, globalAverageTons, targetGoalTons, 1);
    return { userTons, usAverageTons, globalAverageTons, targetGoalTons, maxBenchmark };
  }, [tons]);

  return {
    tons,
    totalVal,
    badgeInfo,
    ...ratingDetails,
    ...breakdownPercentages,
    ...donutPercentages,
    ...benchmarkDetails,
  };
}
