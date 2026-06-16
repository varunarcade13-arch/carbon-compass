export interface HousingInputs {
  electricityKwh: number | null;
  gasTherms: number | null;
  wasteKg: number | null;
  recycleRate: number | null;
}

export interface TransportInputs {
  carKm: number | null;
  carType: 'ev' | 'hybrid' | 'sedan' | 'suv' | null;
  transitKm: number | null;
  flightsShort: number | null;
  flightsMedium: number | null;
  flightsLong: number | null;
}

export interface ConsumptionInputs {
  diet: 'vegan' | 'vegetarian' | 'pescatarian' | 'meat-heavy' | null;
  shoppingSpent: number | null;
}

export interface WizardInputs {
  housing: HousingInputs;
  transport: TransportInputs;
  consumption: ConsumptionInputs;
}
