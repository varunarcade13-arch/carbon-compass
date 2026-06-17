import { AssessmentInput, CalculationResult, CalculatorService, DEFAULT_INPUTS, HousingInput, TransportInput, ConsumptionInput } from './calculatorService';

export interface SimulationToggles {
  switchEv?: boolean | null;
  solarPanels?: boolean | null;
  meatlessDays?: number | null;     // 0 to 7
  reduceFlightsPct?: number | null; // 0 to 100
  publicTransitPct?: number | null; // 0 to 100 (shifts car Km to public transit)
}

export interface SimulationProjectionYear {
  year: number;
  baselineCumulative: number;
  simulatedCumulative: number;
  savingsCumulative: number;
}

export interface SimulationResult {
  baseline: CalculationResult;
  simulated: CalculationResult;
  savingsAnnual: number;
  savingsPct: number;
  projections: SimulationProjectionYear[];
}

/**
 * SimulatorService computes estimated savings by applying lifestyle toggles
 * on top of a user's baseline carbon footprint assessment.
 */
export class SimulatorService {
  private static readonly cache = new Map<string, SimulationResult>();
  private static readonly MAX_CACHE_SIZE = 1000;

  private static applyHousingToggles(
    simulatedHousing: HousingInput,
    baseHousing: HousingInput | null | undefined,
    toggles: SimulationToggles
  ): void {
    if (toggles.solarPanels) {
      const currentElectricity = baseHousing?.electricityKwh ?? DEFAULT_INPUTS.electricityKwh;
      simulatedHousing.electricityKwh = currentElectricity * 0.20;
    }
  }

  private static applyTransportToggles(
    simulatedTransport: TransportInput,
    baseTransport: TransportInput | null | undefined,
    toggles: SimulationToggles
  ): void {
    if (toggles.switchEv) simulatedTransport.carType = 'ev';

    const publicTransitPct = Math.min(100, Math.max(0, toggles.publicTransitPct ?? 0));
    if (publicTransitPct > 0) {
      const baseCarKm = baseTransport?.carKm ?? DEFAULT_INPUTS.carKm;
      const baseTransitKm = baseTransport?.transitKm ?? DEFAULT_INPUTS.transitKm;
      const shiftedKm = baseCarKm * (publicTransitPct / 100);
      simulatedTransport.carKm = Math.max(0, baseCarKm - shiftedKm);
      simulatedTransport.transitKm = baseTransitKm + shiftedKm;
    }

    const reduceFlightsPct = Math.min(100, Math.max(0, toggles.reduceFlightsPct ?? 0));
    if (reduceFlightsPct > 0) {
      const flightsShort = baseTransport?.flightsShort ?? DEFAULT_INPUTS.flightsShort;
      const flightsMedium = baseTransport?.flightsMedium ?? DEFAULT_INPUTS.flightsMedium;
      const flightsLong = baseTransport?.flightsLong ?? DEFAULT_INPUTS.flightsLong;
      simulatedTransport.flightsShort = flightsShort * (1 - reduceFlightsPct / 100);
      simulatedTransport.flightsMedium = flightsMedium * (1 - reduceFlightsPct / 100);
      simulatedTransport.flightsLong = flightsLong * (1 - reduceFlightsPct / 100);
    }
  }

  private static applyConsumptionToggles(
    simulatedConsumption: ConsumptionInput,
    baseConsumption: ConsumptionInput | null | undefined,
    toggles: SimulationToggles
  ): void {
    const meatlessDays = Math.min(7, Math.max(0, toggles.meatlessDays ?? 0));
    if (meatlessDays === 0) return;

    const currentDiet = baseConsumption?.diet ?? DEFAULT_INPUTS.diet;
    if (currentDiet === 'meat-heavy') {
      if (meatlessDays === 7) simulatedConsumption.diet = 'vegan';
      else if (meatlessDays >= 3) simulatedConsumption.diet = 'vegetarian';
      else if (meatlessDays >= 1) simulatedConsumption.diet = 'pescatarian';
    } else if (currentDiet === 'pescatarian') {
      if (meatlessDays === 7) simulatedConsumption.diet = 'vegan';
      else if (meatlessDays >= 3) simulatedConsumption.diet = 'vegetarian';
    } else if (currentDiet === 'vegetarian' && meatlessDays >= 4) {
      simulatedConsumption.diet = 'vegan';
    }
  }

  private static calculateProjections(baselineTotal: number, simulatedTotal: number, savingsAnnual: number): SimulationProjectionYear[] {
    const projections: SimulationProjectionYear[] = [];
    for (let yearIndex = 1; yearIndex <= 5; yearIndex++) {
      projections.push({
        year: yearIndex,
        baselineCumulative: Math.round(baselineTotal * yearIndex),
        simulatedCumulative: Math.round(simulatedTotal * yearIndex),
        savingsCumulative: Math.round(savingsAnnual * yearIndex),
      });
    }
    return projections;
  }

  private static setCache(cacheKey: string, result: SimulationResult): void {
    if (SimulatorService.cache.size >= SimulatorService.MAX_CACHE_SIZE) {
      const firstKey = SimulatorService.cache.keys().next().value;
      if (firstKey !== undefined) SimulatorService.cache.delete(firstKey);
    }
    SimulatorService.cache.set(cacheKey, result);
  }

  /**
   * Generates a comparative carbon footprint projection based on proposed behavioral changes.
   * @param baseInput The base assessment input from the user.
   * @param toggles The set of behavioral adjustments (e.g. EV adoption, solar panels).
   * @returns A SimulationResult containing the baseline vs simulated outputs and savings projections.
   * @remarks Caches results based on stringified base inputs and toggle properties.
   */
  public static simulate(baseInput: AssessmentInput, toggles: SimulationToggles): SimulationResult {
    const baseKey = CalculatorService.getCacheKey(baseInput);
    const togglesKey = `${toggles.switchEv}_${toggles.solarPanels}_${toggles.meatlessDays}_${toggles.reduceFlightsPct}_${toggles.publicTransitPct}`;
    const cacheKey = `${baseKey}|${togglesKey}`;
    
    const cachedResult = SimulatorService.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    const baseline = CalculatorService.calculate(baseInput);
    const simulatedInput: AssessmentInput = {
      housing: { ...(baseInput.housing || {}) },
      transport: { ...(baseInput.transport || {}) },
      consumption: { ...(baseInput.consumption || {}) }
    };

    SimulatorService.applyHousingToggles(simulatedInput.housing!, baseInput.housing, toggles);
    SimulatorService.applyTransportToggles(simulatedInput.transport!, baseInput.transport, toggles);
    SimulatorService.applyConsumptionToggles(simulatedInput.consumption!, baseInput.consumption, toggles);

    const simulated = CalculatorService.calculate(simulatedInput);
    const savingsAnnual = Math.max(0, baseline.grandTotal - simulated.grandTotal);
    const savingsPct = baseline.grandTotal > 0 ? (savingsAnnual / baseline.grandTotal) * 100 : 0;
    const projections = SimulatorService.calculateProjections(baseline.grandTotal, simulated.grandTotal, savingsAnnual);

    const result = { baseline, simulated, savingsAnnual, savingsPct: Math.round(savingsPct * 10) / 10, projections };
    SimulatorService.setCache(cacheKey, result);
    return result;
  }
}
