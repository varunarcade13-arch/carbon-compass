import { AssessmentInput, CalculationResult, CalculatorService, DEFAULT_INPUTS } from './calculatorService';

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
  public static simulate(baseInput: AssessmentInput, toggles: SimulationToggles): SimulationResult {
    // 1. Calculate Baseline
    const baseline = CalculatorService.calculate(baseInput);

    // 2. Prepare Simulated Input by cloning/modifying baseInput
    const simulatedInput: AssessmentInput = JSON.parse(JSON.stringify(baseInput));
    if (!simulatedInput.housing) simulatedInput.housing = {};
    if (!simulatedInput.transport) simulatedInput.transport = {};
    if (!simulatedInput.consumption) simulatedInput.consumption = {};

    // Apply Solar Panels (reduce electricity by 80%)
    if (toggles.solarPanels) {
      const currentElectricity = baseInput.housing?.electricityKwh ?? DEFAULT_INPUTS.electricityKwh;
      simulatedInput.housing.electricityKwh = currentElectricity * 0.20;
    }

    // Apply EV Switch (force car type to 'ev')
    if (toggles.switchEv) {
      simulatedInput.transport.carType = 'ev';
    }

    // Apply Public Transit Percentage (shift car km to public transit)
    const publicTransitPct = Math.min(100, Math.max(0, toggles.publicTransitPct ?? 0));
    if (publicTransitPct > 0) {
      const baseCarKm = baseInput.transport?.carKm ?? DEFAULT_INPUTS.carKm;
      const baseTransitKm = baseInput.transport?.transitKm ?? DEFAULT_INPUTS.transitKm;
      
      // Shift car km to public transit km
      const shiftedKm = baseCarKm * (publicTransitPct / 100);
      simulatedInput.transport.carKm = Math.max(0, baseCarKm - shiftedKm);
      simulatedInput.transport.transitKm = baseTransitKm + shiftedKm;
    }

    // Apply Flight Reduction Percentage
    const reduceFlightsPct = Math.min(100, Math.max(0, toggles.reduceFlightsPct ?? 0));
    if (reduceFlightsPct > 0) {
      const flightsShort = baseInput.transport?.flightsShort ?? DEFAULT_INPUTS.flightsShort;
      const flightsMedium = baseInput.transport?.flightsMedium ?? DEFAULT_INPUTS.flightsMedium;
      const flightsLong = baseInput.transport?.flightsLong ?? DEFAULT_INPUTS.flightsLong;

      simulatedInput.transport.flightsShort = flightsShort * (1 - reduceFlightsPct / 100);
      simulatedInput.transport.flightsMedium = flightsMedium * (1 - reduceFlightsPct / 100);
      simulatedInput.transport.flightsLong = flightsLong * (1 - reduceFlightsPct / 100);
    }

    // Apply Meatless Days (shifts diet towards vegetarian/vegan)
    const meatlessDays = Math.min(7, Math.max(0, toggles.meatlessDays ?? 0));
    if (meatlessDays > 0) {
      const currentDiet = baseInput.consumption?.diet ?? DEFAULT_INPUTS.diet;
      
      if (currentDiet === 'meat-heavy') {
        // We override calculation diet by mapping it.
        // To achieve this custom diet inside CalculatorService, we can represent it by temporary setting
        // or since CalculatorService has fixed strings, let's inject a custom calculation overrides mechanism.
        // Wait! We can just modify the diet string OR let's add a custom diet field in simulatedInput.
        // Let's check how CalculatorService calculates diet. It uses dietVegan, dietVegetarian, dietPescatarian, dietMeatHeavy.
        // If we want custom blending, let's map it.
        // Wait, to make it clean, if meatlessDays is 7, we can set diet to 'vegetarian'.
        // If meatlessDays is between 1 and 6, we can blend it by adjusting shoppingSpent or just modifying diet.
        // Wait, what if we support a custom blended value or we just map meatlessDays to a diet label?
        // E.g.:
        // 1-2 meatless days: 'pescatarian' (1800)
        // 3-6 meatless days: 'vegetarian' (1500)
        // 7 meatless days: 'vegan' (1000)
        // This maps cleanly to existing CalculatorService categories!
        // Let's check:
        // 'meat-heavy' -> 2800.
        // If meatless days = 1 or 2, map diet to 'pescatarian' (1800).
        // If meatless days = 3, 4, 5, or 6, map diet to 'vegetarian' (1500).
        // If meatless days = 7, map diet to 'vegan' (1000).
        // If the current diet is already 'vegetarian', and they do 7 meatless days (meaning vegan), we map to 'vegan'.
        // This is simple, clean, and maps to the O(1) CalculatorService.
        if (meatlessDays === 7) {
          simulatedInput.consumption.diet = 'vegan';
        } else if (meatlessDays >= 3) {
          simulatedInput.consumption.diet = 'vegetarian';
        } else if (meatlessDays >= 1) {
          simulatedInput.consumption.diet = 'pescatarian';
        }
      } else if (currentDiet === 'pescatarian') {
        if (meatlessDays === 7) {
          simulatedInput.consumption.diet = 'vegan';
        } else if (meatlessDays >= 3) {
          simulatedInput.consumption.diet = 'vegetarian';
        }
      } else if (currentDiet === 'vegetarian') {
        if (meatlessDays >= 4) {
          simulatedInput.consumption.diet = 'vegan';
        }
      }
    }

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
