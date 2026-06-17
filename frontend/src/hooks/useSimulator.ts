import { useState, useEffect, useMemo, useCallback } from 'react';
import { AssessmentInput } from '../../../backend/src/services/calculatorService';
import { SimulationToggles, SimulationResult } from '../../../backend/src/services/simulatorService';
import { ApiClient } from '../services/api';
import { getBadgeInfo } from '../components/BadgeSystem';

export interface SimulatorMetrics {
  toggles: SimulationToggles;
  simResult: SimulationResult | null;
  currentBadge: ReturnType<typeof getBadgeInfo> | null;
  projectedBadge: ReturnType<typeof getBadgeInfo> | null;
  updateToggle: (key: keyof SimulationToggles, value: any) => void;
}

/**
 * Custom hook to isolate all state, network calls, and badge computations for the Simulator component.
 * @param baseInput The base assessment input from the user.
 * @returns Fully computed projection states and safe toggle update handlers.
 */
export function useSimulator(baseInput: AssessmentInput): SimulatorMetrics {
  const [toggles, setToggles] = useState<SimulationToggles>({
    switchEv: false,
    solarPanels: false,
    meatlessDays: 0,
    reduceFlightsPct: 0,
    publicTransitPct: 0,
  });

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    let active = true;
    const runSimulation = async (): Promise<void> => {
      try {
        const simulationResponse = await ApiClient.simulate(baseInput, toggles);
        if (active) {
          setSimResult(simulationResponse);
        }
      } catch (error) {
        console.error(error);
      }
    };

    runSimulation();

    return () => {
      active = false;
    };
  }, [baseInput, toggles]);

  const currentBadge = useMemo(() => {
    if (!simResult) return null;
    return getBadgeInfo(simResult.baseline.grandTotal);
  }, [simResult]);

  const projectedBadge = useMemo(() => {
    if (!simResult) return null;
    return getBadgeInfo(simResult.simulated.grandTotal);
  }, [simResult]);

  const updateToggle = useCallback((key: keyof SimulationToggles, value: any): void => {
    setToggles((prev: SimulationToggles) => ({ ...prev, [key]: value }));
  }, []);

  return {
    toggles,
    simResult,
    currentBadge,
    projectedBadge,
    updateToggle,
  };
}
