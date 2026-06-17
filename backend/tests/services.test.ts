import { describe, it, expect, vi } from 'vitest';
import { CalculatorService, DEFAULT_INPUTS, EMISSION_FACTORS } from '../src/services/calculatorService';
import { SimulatorService } from '../src/services/simulatorService';
import { PlanService } from '../src/services/planService';

describe('CalculatorService', () => {
  it('should calculate emissions with default inputs when empty input is provided', () => {
    const result = CalculatorService.calculate({});
    expect(result.grandTotal).toBeGreaterThan(0);
  });

  it('should clamp negative values to 0', () => {
    const result = CalculatorService.calculate({
      housing: { electricityKwh: -100, gasTherms: -50, wasteKg: -10, recycleRate: -20 },
      transport: { carKm: -200, transitKm: -50, flightsShort: -2, flightsMedium: -3, flightsLong: -1 },
      consumption: { shoppingSpent: -300 }
    });
    
    expect(result.housing.electricity).toBe(0);
    expect(result.housing.gas).toBe(0);
    expect(result.housing.waste).toBe(0);
    expect(result.housing.total).toBe(0);

    expect(result.transport.car).toBe(0);
    expect(result.transport.transit).toBe(0);
    expect(result.transport.flights).toBe(0);
    expect(result.transport.total).toBe(0);

    expect(result.consumption.shopping).toBe(0);
    expect(result.consumption.diet).toBe(EMISSION_FACTORS.dietMeatHeavy);
    expect(result.grandTotal).toBe(EMISSION_FACTORS.dietMeatHeavy);
  });

  it('should clamp recycleRate to max 100', () => {
    const result = CalculatorService.calculate({
      housing: { wasteKg: 10, recycleRate: 150 }
    });
    const expectedWaste = Math.round(10 * EMISSION_FACTORS.wasteRecycle * 52);
    expect(result.housing.waste).toBe(expectedWaste);
  });

  it('should calculate emissions correctly for different car types', () => {
    const evResult = CalculatorService.calculate({ transport: { carKm: 100, carType: 'ev' } });
    const hybridResult = CalculatorService.calculate({ transport: { carKm: 100, carType: 'hybrid' } });
    const sedanResult = CalculatorService.calculate({ transport: { carKm: 100, carType: 'sedan' } });
    const suvResult = CalculatorService.calculate({ transport: { carKm: 100, carType: 'suv' } });

    expect(evResult.transport.car).toBe(Math.round(100 * 52 * EMISSION_FACTORS.carEv));
    expect(hybridResult.transport.car).toBe(Math.round(100 * 52 * EMISSION_FACTORS.carHybrid));
    expect(sedanResult.transport.car).toBe(Math.round(100 * 52 * EMISSION_FACTORS.carSedan));
    expect(suvResult.transport.car).toBe(Math.round(100 * 52 * EMISSION_FACTORS.carSuv));
  });

  it('should calculate emissions correctly for different diets', () => {
    const vegan = CalculatorService.calculate({ consumption: { diet: 'vegan' } });
    const veg = CalculatorService.calculate({ consumption: { diet: 'vegetarian' } });
    const pescatarian = CalculatorService.calculate({ consumption: { diet: 'pescatarian' } });
    const meat = CalculatorService.calculate({ consumption: { diet: 'meat-heavy' } });

    expect(vegan.consumption.diet).toBe(EMISSION_FACTORS.dietVegan);
    expect(veg.consumption.diet).toBe(EMISSION_FACTORS.dietVegetarian);
    expect(pescatarian.consumption.diet).toBe(EMISSION_FACTORS.dietPescatarian);
    expect(meat.consumption.diet).toBe(EMISSION_FACTORS.dietMeatHeavy);
  });

  it('should memoize calculations and hit the cache on duplicate inputs', () => {
    const input1 = { housing: { electricityKwh: 123 } };
    const input2 = { housing: { electricityKwh: 123 } };
    
    const result1 = CalculatorService.calculate(input1);
    const result2 = CalculatorService.calculate(input2);
    
    expect(result1).toBe(result2); // Strict equality checks cache hit
  });

  it('should evict cache entries when cache grows past capacity', () => {
    const firstResult = CalculatorService.calculate({ housing: { electricityKwh: 9999 } });
    
    // Trigger eviction by inserting unique entries past cache size limit (1000)
    for (let index = 0; index < 1005; index++) {
      CalculatorService.calculate({ housing: { electricityKwh: index } });
    }
    
    const secondResult = CalculatorService.calculate({ housing: { electricityKwh: 9999 } });
    expect(firstResult).not.toBe(secondResult); // Proves firstResult was evicted from cache
  });
});


describe('SimulatorService', () => {
  const baseInput = {
    housing: { electricityKwh: 1000, gasTherms: 100, wasteKg: 20, recycleRate: 30 },
    transport: { carKm: 300, carType: 'sedan' as const, transitKm: 20, flightsShort: 2, flightsMedium: 2, flightsLong: 1 },
    consumption: { diet: 'meat-heavy' as const, shoppingSpent: 500 }
  };

  it('should run simulation with no toggles and output identical baseline and simulated values', () => {
    const result = SimulatorService.simulate(baseInput, {});
    expect(result.simulated.grandTotal).toBe(result.baseline.grandTotal);
  });

  it('should simulate solar panels', () => {
    const result = SimulatorService.simulate(baseInput, { solarPanels: true });
    expect(result.simulated.housing.electricity).toBeLessThan(result.baseline.housing.electricity);
  });

  it('should simulate EV switch', () => {
    const result = SimulatorService.simulate(baseInput, { switchEv: true });
    expect(result.simulated.transport.car).toBeLessThan(result.baseline.transport.car);
  });

  it('should simulate public transit shift', () => {
    const result = SimulatorService.simulate(baseInput, { publicTransitPct: 50 });
    expect(result.simulated.transport.car).toBeLessThan(result.baseline.transport.car);
    expect(result.simulated.transport.transit).toBeGreaterThan(result.baseline.transport.transit);
  });

  it('should simulate flight reductions', () => {
    const result = SimulatorService.simulate(baseInput, { reduceFlightsPct: 100 });
    expect(result.simulated.transport.flights).toBe(0);
  });

  it('should simulate meatless days for meat-heavy diets', () => {
    const res1 = SimulatorService.simulate(baseInput, { meatlessDays: 2 });
    const res2 = SimulatorService.simulate(baseInput, { meatlessDays: 5 });
    const res3 = SimulatorService.simulate(baseInput, { meatlessDays: 7 });

    expect(res1.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietPescatarian);
    expect(res2.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietVegetarian);
    expect(res3.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietVegan);
  });

  it('should simulate meatless days for pescatarian diets', () => {
    const pescatarianInput = {
      ...baseInput,
      consumption: { diet: 'pescatarian' as const }
    };
    const res1 = SimulatorService.simulate(pescatarianInput, { meatlessDays: 2 });
    const res2 = SimulatorService.simulate(pescatarianInput, { meatlessDays: 5 });
    const res3 = SimulatorService.simulate(pescatarianInput, { meatlessDays: 7 });

    expect(res1.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietPescatarian);
    expect(res2.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietVegetarian);
    expect(res3.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietVegan);
  });

  it('should simulate meatless days for vegetarian diets', () => {
    const vegetarianInput = {
      ...baseInput,
      consumption: { diet: 'vegetarian' as const }
    };
    const res1 = SimulatorService.simulate(vegetarianInput, { meatlessDays: 3 });
    const res2 = SimulatorService.simulate(vegetarianInput, { meatlessDays: 5 });

    expect(res1.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietVegetarian);
    expect(res2.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietVegan);
  });

  it('should handle undefined category variables in baseInput simulation', () => {
    const emptyBaseInput = {};
    const result = SimulatorService.simulate(emptyBaseInput, {
      solarPanels: true,
      publicTransitPct: 50,
      reduceFlightsPct: 50
    });
    expect(result.simulated.grandTotal).toBeLessThan(result.baseline.grandTotal);
  });

  it('should handle division by zero in simulator pct calculation when grandTotal is 0', () => {
    const calculateSpy = vi.spyOn(CalculatorService, 'calculate').mockReturnValue({
      housing: { electricity: 0, gas: 0, waste: 0, total: 0 },
      transport: { car: 0, transit: 0, flights: 0, total: 0 },
      consumption: { diet: 0, shopping: 0, total: 0 },
      grandTotal: 0
    });

    const result = SimulatorService.simulate({}, {});
    expect(result.savingsPct).toBe(0);

    calculateSpy.mockRestore();
  });
});

describe('PlanService - Boolean Logic Coverage', () => {
  it('should hit Housing > 3000 branch (Profile A)', () => {
    const result = {
      housing: { electricity: 2000, gas: 1500, waste: 200, total: 3700 },
      transport: { car: 100, transit: 100, flights: 0, total: 200 },
      consumption: { diet: 1000, shopping: 100, total: 1100 },
      grandTotal: 5000
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 'h_act1')).toBeDefined();
  });

  it('should hit Housing <= 3000 but > 1500 and ratio > 0.3 branch (Profile B)', () => {
    const result = {
      housing: { electricity: 1000, gas: 800, waste: 200, total: 2000 },
      transport: { car: 1000, transit: 100, flights: 0, total: 1100 },
      consumption: { diet: 1800, shopping: 100, total: 1900 },
      grandTotal: 5000
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 'h_act1')).toBeDefined();
  });

  it('should hit Housing <= 3000 and > 1500 but ratio <= 0.3 branch (Profile C - hits else)', () => {
    const result = {
      housing: { electricity: 1000, gas: 800, waste: 200, total: 2000 },
      transport: { car: 4000, transit: 500, flights: 1500, total: 6000 },
      consumption: { diet: 1800, shopping: 200, total: 2000 },
      grandTotal: 10000
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 'h_act_led')).toBeDefined();
  });

  it('should hit Housing <= 1500 branch (Profile D - hits else)', () => {
    const result = {
      housing: { electricity: 400, gas: 400, waste: 200, total: 1000 },
      transport: { car: 2000, transit: 100, flights: 0, total: 2100 },
      consumption: { diet: 1800, shopping: 100, total: 1900 },
      grandTotal: 5000
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 'h_act_led')).toBeDefined();
  });

  it('should hit Transport > 3000 branch (Profile A)', () => {
    const result = {
      housing: { electricity: 200, gas: 200, waste: 200, total: 600 },
      transport: { car: 2500, transit: 100, flights: 1000, total: 3600 },
      consumption: { diet: 1000, shopping: 100, total: 1100 },
      grandTotal: 5300
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 't_act1')).toBeDefined();
  });

  it('should hit Transport <= 3000 but > 1500 and ratio > 0.3 branch (Profile B)', () => {
    const result = {
      housing: { electricity: 200, gas: 200, waste: 200, total: 600 },
      transport: { car: 1500, transit: 100, flights: 400, total: 2000 },
      consumption: { diet: 1000, shopping: 100, total: 1100 },
      grandTotal: 3700
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 't_act1')).toBeDefined();
  });

  it('should hit Transport <= 3000 and > 1500 but ratio <= 0.3 branch (Profile C - hits else)', () => {
    const result = {
      housing: { electricity: 2000, gas: 1500, waste: 500, total: 4000 },
      transport: { car: 1500, transit: 100, flights: 400, total: 2000 },
      consumption: { diet: 2800, shopping: 1200, total: 4000 },
      grandTotal: 10000
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.habits.find(h => h.id === 't_hab_eco_drive')).toBeDefined();
  });

  it('should hit Consumption > 2000 branch (Profile A)', () => {
    const result = {
      housing: { electricity: 200, gas: 200, waste: 200, total: 600 },
      transport: { car: 200, transit: 100, flights: 0, total: 300 },
      consumption: { diet: 2800, shopping: 500, total: 3300 },
      grandTotal: 4200
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 'c_act1')).toBeDefined();
  });

  it('should hit Consumption <= 2000 but > 1500 and ratio > 0.3 branch (Profile B)', () => {
    const result = {
      housing: { electricity: 200, gas: 200, waste: 200, total: 600 },
      transport: { car: 200, transit: 100, flights: 0, total: 300 },
      consumption: { diet: 1500, shopping: 200, total: 1700 },
      grandTotal: 2600
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.actions.find(a => a.id === 'c_act1')).toBeDefined();
  });

  it('should hit Consumption <= 2000 and > 1500 but ratio <= 0.3 branch (Profile C - hits else)', () => {
    const result = {
      housing: { electricity: 2000, gas: 1500, waste: 500, total: 4000 },
      transport: { car: 3500, transit: 100, flights: 400, total: 4000 },
      consumption: { diet: 1500, shopping: 200, total: 1700 },
      grandTotal: 9700
    };
    const plan = PlanService.generatePlan(result);
    expect(plan.habits.find(h => h.id === 'c_hab_local')).toBeDefined();
  });
});

describe('CalculatorService - Edge Cases and Extremes', () => {
  it('should handle NaN, Infinity, and -Infinity values gracefully', () => {
    const result = CalculatorService.calculate({
      housing: { electricityKwh: NaN, gasTherms: Infinity, wasteKg: -Infinity, recycleRate: NaN },
      transport: { carKm: NaN, transitKm: Infinity, flightsShort: -Infinity, flightsMedium: NaN, flightsLong: Infinity },
      consumption: { shoppingSpent: NaN }
    });

    // NaN should fall back to default values, Infinity falls back to defaults, -Infinity is clamped to 0 or fallback
    expect(result.housing.electricity).toBe(Math.round(DEFAULT_INPUTS.electricityKwh * 12 * EMISSION_FACTORS.electricity));
    expect(result.housing.gas).toBe(Math.round(DEFAULT_INPUTS.gasTherms * 12 * EMISSION_FACTORS.gas));
    expect(result.housing.waste).toBe(Math.round(DEFAULT_INPUTS.wasteKg * 52 * (EMISSION_FACTORS.wasteLandfill * (1 - DEFAULT_INPUTS.recycleRate / 100) + EMISSION_FACTORS.wasteRecycle * (DEFAULT_INPUTS.recycleRate / 100))));
    
    expect(result.transport.car).toBe(Math.round(DEFAULT_INPUTS.carKm * 52 * EMISSION_FACTORS.carSedan));
    expect(result.transport.transit).toBe(Math.round(DEFAULT_INPUTS.transitKm * 52 * EMISSION_FACTORS.transit));
  });

  it('should handle extremely large numbers without crashing', () => {
    const result = CalculatorService.calculate({
      housing: { electricityKwh: 1e12, gasTherms: 1e12, wasteKg: 1e12 }
    });
    expect(result.grandTotal).toBeGreaterThan(1e12);
  });
});

describe('SimulatorService - Toggle Edge Cases', () => {
  it('should clamp out-of-bounds toggles correctly', () => {
    const baseInput = {
      housing: { electricityKwh: 1000 },
      transport: { carKm: 300, flightsShort: 2 },
      consumption: { diet: 'meat-heavy' as const }
    };
    
    // Test negative publicTransitPct and reduceFlightsPct (should clamp to 0, matching baseline)
    const resultNeg = SimulatorService.simulate(baseInput, {
      publicTransitPct: -50,
      reduceFlightsPct: -20,
      meatlessDays: -2
    });
    expect(resultNeg.simulated.transport.car).toBe(resultNeg.baseline.transport.car);
    expect(resultNeg.simulated.transport.flights).toBe(resultNeg.baseline.transport.flights);
    expect(resultNeg.simulated.consumption.diet).toBe(resultNeg.baseline.consumption.diet);

    // Test excessive publicTransitPct and reduceFlightsPct (should clamp to 100% and 7 meatless days)
    const resultExcess = SimulatorService.simulate(baseInput, {
      publicTransitPct: 150,
      reduceFlightsPct: 150,
      meatlessDays: 12
    });
    expect(resultExcess.simulated.transport.car).toBe(0);
    expect(resultExcess.simulated.transport.flights).toBe(0);
    expect(resultExcess.simulated.consumption.diet).toBe(EMISSION_FACTORS.dietVegan);
  });
});

describe('PlanService - Zero Emissions Edge Case', () => {
  it('should handle 0 total emissions gracefully without division by zero errors', () => {
    const zeroResult = {
      housing: { electricity: 0, gas: 0, waste: 0, total: 0 },
      transport: { car: 0, transit: 0, flights: 0, total: 0 },
      consumption: { diet: 0, shopping: 0, total: 0 },
      grandTotal: 0
    };
    const plan = PlanService.generatePlan(zeroResult);
    expect(plan.actions).toBeDefined();
    expect(plan.actions.length).toBeGreaterThan(0);
    expect(plan.actions[0].estimatedSavingsKg).toBe(150);
  });

  it('should hit PlanService cache on duplicate inputs', () => {
    const resultObj = {
      housing: { electricity: 100, gas: 100, waste: 100, total: 300 },
      transport: { car: 100, transit: 100, flights: 100, total: 300 },
      consumption: { diet: 100, shopping: 100, total: 200 },
      grandTotal: 800
    };
    const plan1 = PlanService.generatePlan(resultObj);
    const plan2 = PlanService.generatePlan(resultObj);
    expect(plan1).toBe(plan2); // strict equality means cache hit
  });
});

describe('CalculatorService - Null inputs', () => {
  it('should handle falsy/null inputs for getCacheKey gracefully', () => {
    // @ts-ignore: testing invalid runtime behavior
    const result = CalculatorService.calculate(null);
    expect(result.grandTotal).toBeGreaterThan(0);
  });
});

describe('SimulatorService - Cache Eviction', () => {
  it('should evict simulator cache when limit is exceeded', () => {
    const baseInput = {
      housing: { electricityKwh: 1000 },
      transport: { carKm: 300 },
      consumption: { diet: 'meat-heavy' as const }
    };
    const firstResult = SimulatorService.simulate(baseInput, { meatlessDays: 1 });
    
    // Trigger eviction by calling simulate 1005 times with unique toggles
    for (let i = 0; i < 1005; i++) {
      // Create unique toggle payloads by dynamically adding fake properties via type assertion
      SimulatorService.simulate(baseInput, { publicTransitPct: i } as any);
    }
    
    const secondResult = SimulatorService.simulate(baseInput, { meatlessDays: 1 });
    // Due to cache eviction, object references should be different
    expect(firstResult).not.toBe(secondResult);
  });
});
