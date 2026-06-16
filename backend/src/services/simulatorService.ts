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

export class SimulatorService {
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
    if (toggles.switchEv) {
      simulatedTransport.carType = 'ev';
    }

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
    if (meatlessDays > 0) {
      const currentDiet = baseConsumption?.diet ?? DEFAULT_INPUTS.diet;
      if (currentDiet === 'meat-heavy') {
        if (meatlessDays === 7) {
          simulatedConsumption.diet = 'vegan';
        } else if (meatlessDays >= 3) {
          simulatedConsumption.diet = 'vegetarian';
        } else if (meatlessDays >= 1) {
          simulatedConsumption.diet = 'pescatarian';
        }
      } else if (currentDiet === 'pescatarian') {
        if (meatlessDays === 7) {
          simulatedConsumption.diet = 'vegan';
        } else if (meatlessDays >= 3) {
          simulatedConsumption.diet = 'vegetarian';
        }
      } else if (currentDiet === 'vegetarian') {
        if (meatlessDays >= 4) {
          simulatedConsumption.diet = 'vegan';
        }
      }
    }
  }

  public static simulate(baseInput: AssessmentInput, toggles: SimulationToggles): SimulationResult {
    // 1. Calculate Baseline
    const baseline = CalculatorService.calculate(baseInput);

    // 2. Prepare Simulated Input by cloning/modifying baseInput
    const simulatedInput: AssessmentInput = JSON.parse(JSON.stringify(baseInput));
    if (!simulatedInput.housing) simulatedInput.housing = {};
    if (!simulatedInput.transport) simulatedInput.transport = {};
    if (!simulatedInput.consumption) simulatedInput.consumption = {};

    SimulatorService.applyHousingToggles(simulatedInput.housing, baseInput.housing, toggles);
    SimulatorService.applyTransportToggles(simulatedInput.transport, baseInput.transport, toggles);
    SimulatorService.applyConsumptionToggles(simulatedInput.consumption, baseInput.consumption, toggles);

    // 3. Calculate Simulated Footprint
    const simulated = CalculatorService.calculate(simulatedInput);

    // 4. Calculate savings
    const savingsAnnual = Math.max(0, baseline.grandTotal - simulated.grandTotal);
    const savingsPct = baseline.grandTotal > 0 ? (savingsAnnual / baseline.grandTotal) * 100 : 0;

    // 5. Generate Projections (1 to 5 years cumulative)
    const projections: SimulationProjectionYear[] = [];
    for (let yearIndex = 1; yearIndex <= 5; yearIndex++) {
      projections.push({
        year: yearIndex,
        baselineCumulative: Math.round(baseline.grandTotal * yearIndex),
        simulatedCumulative: Math.round(simulated.grandTotal * yearIndex),
        savingsCumulative: Math.round(savingsAnnual * yearIndex),
      });
    }

    return {
      baseline,
      simulated,
      savingsAnnual,
      savingsPct: Math.round(savingsPct * 10) / 10,
      projections,
    };
  }
}
