export interface HousingInput {
  electricityKwh?: number | null;
  gasTherms?: number | null;
  wasteKg?: number | null;
  recycleRate?: number | null; // 0 to 100
}

export interface TransportInput {
  carKm?: number | null;
  carType?: 'ev' | 'hybrid' | 'sedan' | 'suv' | null;
  transitKm?: number | null;
  flightsShort?: number | null;
  flightsMedium?: number | null;
  flightsLong?: number | null;
}

export interface ConsumptionInput {
  diet?: 'vegan' | 'vegetarian' | 'pescatarian' | 'meat-heavy' | null;
  shoppingSpent?: number | null; // USD/month
}

export interface AssessmentInput {
  housing?: HousingInput | null;
  transport?: TransportInput | null;
  consumption?: ConsumptionInput | null;
}

export interface CategoryBreakdown {
  electricity: number;
  gas: number;
  waste: number;
  total: number;
}

export interface TransportBreakdown {
  car: number;
  transit: number;
  flights: number;
  total: number;
}

export interface ConsumptionBreakdown {
  diet: number;
  shopping: number;
  total: number;
}

export interface CalculationResult {
  housing: CategoryBreakdown;
  transport: TransportBreakdown;
  consumption: ConsumptionBreakdown;
  grandTotal: number;
}

// Static Emission Factors
export const EMISSION_FACTORS = {
  // Housing (kg CO2e per unit)
  electricity: 0.40, // per kWh
  gas: 5.30,         // per therm
  wasteLandfill: 0.50, // per kg
  wasteRecycle: 0.10,  // per kg
  
  // Transport (kg CO2e per km / per segment)
  carEv: 0.05,
  carHybrid: 0.12,
  carSedan: 0.18,
  carSuv: 0.25,
  transit: 0.06,
  flightShort: 150,   // flat per flight
  flightMedium: 350,  // flat per flight
  flightLong: 800,    // flat per flight

  // Consumption (kg CO2e per year / per USD)
  dietVegan: 1000,
  dietVegetarian: 1500,
  dietPescatarian: 1800,
  dietMeatHeavy: 2800,
  shopping: 0.12,     // per USD
};

// Default Values for null/missing inputs
export const DEFAULT_INPUTS = {
  electricityKwh: 900,
  gasTherms: 50,
  wasteKg: 20,
  recycleRate: 30,
  carKm: 200,
  carType: 'sedan' as const,
  transitKm: 50,
  flightsShort: 1,
  flightsMedium: 1,
  flightsLong: 0,
  diet: 'meat-heavy' as const,
  shoppingSpent: 300,
};

/**
 * CalculatorService handles all core business logic for computing a user's carbon footprint.
 * It strictly separates calculation logic from state presentation.
 */
export class CalculatorService {
  private static readonly cache = new Map<string, CalculationResult>();
  private static readonly MAX_CACHE_SIZE = 1000;

  private static sanitizeNumber(val: any, defaultVal: number): number {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      return defaultVal;
    }
    return Math.max(0, val);
  }

  private static sanitizeRecycleRate(val: any, defaultVal: number): number {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      return defaultVal;
    }
    return Math.min(100, Math.max(0, val));
  }

  private static calculateHousing(housingInput: HousingInput | null | undefined): CategoryBreakdown {
    const electricityKwh = CalculatorService.sanitizeNumber(housingInput?.electricityKwh, DEFAULT_INPUTS.electricityKwh);
    const gasTherms = CalculatorService.sanitizeNumber(housingInput?.gasTherms, DEFAULT_INPUTS.gasTherms);
    const wasteKg = CalculatorService.sanitizeNumber(housingInput?.wasteKg, DEFAULT_INPUTS.wasteKg);
    const recycleRate = CalculatorService.sanitizeRecycleRate(housingInput?.recycleRate, DEFAULT_INPUTS.recycleRate);

    const annualElectricity = electricityKwh * 12 * EMISSION_FACTORS.electricity;
    const annualGas = gasTherms * 12 * EMISSION_FACTORS.gas;
    
    const recycledWaste = wasteKg * (recycleRate / 100);
    const landfillWaste = wasteKg - recycledWaste;
    const annualWaste = (landfillWaste * EMISSION_FACTORS.wasteLandfill + recycledWaste * EMISSION_FACTORS.wasteRecycle) * 52;

    const total = annualElectricity + annualGas + annualWaste;

    return {
      electricity: Math.round(annualElectricity),
      gas: Math.round(annualGas),
      waste: Math.round(annualWaste),
      total: Math.round(total),
    };
  }

  private static getCarEmissionFactor(carType: string): number {
    if (carType === 'ev') return EMISSION_FACTORS.carEv;
    if (carType === 'hybrid') return EMISSION_FACTORS.carHybrid;
    if (carType === 'suv') return EMISSION_FACTORS.carSuv;
    return EMISSION_FACTORS.carSedan;
  }

  private static calculateTransport(transportInput: TransportInput | null | undefined): TransportBreakdown {
    const carKm = CalculatorService.sanitizeNumber(transportInput?.carKm, DEFAULT_INPUTS.carKm);
    const carType = transportInput?.carType ?? DEFAULT_INPUTS.carType;
    const transitKm = CalculatorService.sanitizeNumber(transportInput?.transitKm, DEFAULT_INPUTS.transitKm);
    const flightsShort = Math.round(CalculatorService.sanitizeNumber(transportInput?.flightsShort, DEFAULT_INPUTS.flightsShort));
    const flightsMedium = Math.round(CalculatorService.sanitizeNumber(transportInput?.flightsMedium, DEFAULT_INPUTS.flightsMedium));
    const flightsLong = Math.round(CalculatorService.sanitizeNumber(transportInput?.flightsLong, DEFAULT_INPUTS.flightsLong));

    const carFactor = CalculatorService.getCarEmissionFactor(carType);
    const annualCar = carKm * 52 * carFactor;
    const annualTransit = transitKm * 52 * EMISSION_FACTORS.transit;
    const annualFlights = (flightsShort * EMISSION_FACTORS.flightShort) +
                          (flightsMedium * EMISSION_FACTORS.flightMedium) +
                          (flightsLong * EMISSION_FACTORS.flightLong);

    const total = annualCar + annualTransit + annualFlights;

    return {
      car: Math.round(annualCar),
      transit: Math.round(annualTransit),
      flights: Math.round(annualFlights),
      total: Math.round(total),
    };
  }

  private static getDietEmissionFactor(diet: string): number {
    if (diet === 'vegan') return EMISSION_FACTORS.dietVegan;
    if (diet === 'vegetarian') return EMISSION_FACTORS.dietVegetarian;
    if (diet === 'pescatarian') return EMISSION_FACTORS.dietPescatarian;
    return EMISSION_FACTORS.dietMeatHeavy;
  }

  private static calculateConsumption(consumptionInput: ConsumptionInput | null | undefined): ConsumptionBreakdown {
    const diet = consumptionInput?.diet ?? DEFAULT_INPUTS.diet;
    const shoppingSpent = CalculatorService.sanitizeNumber(consumptionInput?.shoppingSpent, DEFAULT_INPUTS.shoppingSpent);

    const dietEmissions = CalculatorService.getDietEmissionFactor(diet);
    const annualShopping = shoppingSpent * 12 * EMISSION_FACTORS.shopping;
    const total = dietEmissions + annualShopping;

    return {
      diet: Math.round(dietEmissions),
      shopping: Math.round(annualShopping),
      total: Math.round(total),
    };
  }

  public static getCacheKey(input?: AssessmentInput | null): string {
    if (!input) return 'empty';
    return `${input.housing?.electricityKwh}_${input.housing?.gasTherms}_${input.housing?.wasteKg}_${input.housing?.recycleRate}_` +
           `${input.transport?.carKm}_${input.transport?.carType}_${input.transport?.transitKm}_${input.transport?.flightsShort}_${input.transport?.flightsMedium}_${input.transport?.flightsLong}_` +
           `${input.consumption?.diet}_${input.consumption?.shoppingSpent}`;
  }

  private static setCache(cacheKey: string, result: CalculationResult): void {
    if (CalculatorService.cache.size >= CalculatorService.MAX_CACHE_SIZE) {
      const firstKey = CalculatorService.cache.keys().next().value;
      if (firstKey !== undefined) {
        CalculatorService.cache.delete(firstKey);
      }
    }
    CalculatorService.cache.set(cacheKey, result);
  }

  /**
   * Calculates the full carbon footprint breakdown and totals.
   * @param input The raw assessment input object from the client.
   * @returns A structured CalculationResult with individual sector breakdowns and grand total.
   * @remarks Uses LRU caching bounded by MAX_CACHE_SIZE to prevent redundant heavy computations.
   */
  public static calculate(input?: AssessmentInput | null): CalculationResult {
    const cacheKey = CalculatorService.getCacheKey(input);
    const cachedResult = CalculatorService.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    const housing = CalculatorService.calculateHousing(input?.housing);
    const transport = CalculatorService.calculateTransport(input?.transport);
    const consumption = CalculatorService.calculateConsumption(input?.consumption);
    const grandTotal = housing.total + transport.total + consumption.total;

    const result: CalculationResult = { housing, transport, consumption, grandTotal };
    CalculatorService.setCache(cacheKey, result);
    return result;
  }
}

