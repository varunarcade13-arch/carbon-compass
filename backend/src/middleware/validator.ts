import { Request, Response, NextFunction } from 'express';

const ALLOWED_CAR_TYPES = new Set<string>(['ev', 'hybrid', 'sedan', 'suv']);
const ALLOWED_DIETS = new Set<string>(['vegan', 'vegetarian', 'pescatarian', 'meat-heavy']);

export function validateCalculateInput(req: Request, res: Response, next: NextFunction): void {
  const { housing, transport, consumption } = req.body;
  const errors: string[] = [];

  // 1. Validate Housing if present
  if (housing !== undefined && housing !== null) {
    if (typeof housing !== 'object') {
      errors.push('housing must be an object');
    } else {
      const { electricityKwh, gasTherms, wasteKg, recycleRate } = housing;
      if (electricityKwh !== undefined && electricityKwh !== null && typeof electricityKwh !== 'number') {
        errors.push('housing.electricityKwh must be a number');
      }
      if (gasTherms !== undefined && gasTherms !== null && typeof gasTherms !== 'number') {
        errors.push('housing.gasTherms must be a number');
      }
      if (wasteKg !== undefined && wasteKg !== null && typeof wasteKg !== 'number') {
        errors.push('housing.wasteKg must be a number');
      }
      if (recycleRate !== undefined && recycleRate !== null) {
        if (typeof recycleRate !== 'number') {
          errors.push('housing.recycleRate must be a number');
        } else if (recycleRate < 0 || recycleRate > 100) {
          errors.push('housing.recycleRate must be between 0 and 100');
        }
      }
    }
  }

  // 2. Validate Transport if present
  if (transport !== undefined && transport !== null) {
    if (typeof transport !== 'object') {
      errors.push('transport must be an object');
    } else {
      const { carKm, carType, transitKm, flightsShort, flightsMedium, flightsLong } = transport;
      if (carKm !== undefined && carKm !== null && typeof carKm !== 'number') {
        errors.push('transport.carKm must be a number');
      }
      if (carType !== undefined && carType !== null) {
        if (typeof carType !== 'string' || !ALLOWED_CAR_TYPES.has(carType)) {
          errors.push('transport.carType must be one of: ev, hybrid, sedan, suv');
        }
      }

      if (transitKm !== undefined && transitKm !== null && typeof transitKm !== 'number') {
        errors.push('transport.transitKm must be a number');
      }
      if (flightsShort !== undefined && flightsShort !== null && typeof flightsShort !== 'number') {
        errors.push('transport.flightsShort must be a number');
      }
      if (flightsMedium !== undefined && flightsMedium !== null && typeof flightsMedium !== 'number') {
        errors.push('transport.flightsMedium must be a number');
      }
      if (flightsLong !== undefined && flightsLong !== null && typeof flightsLong !== 'number') {
        errors.push('transport.flightsLong must be a number');
      }
    }
  }

  // 3. Validate Consumption if present
  if (consumption !== undefined && consumption !== null) {
    if (typeof consumption !== 'object') {
      errors.push('consumption must be an object');
    } else {
      const { diet, shoppingSpent } = consumption;
      if (diet !== undefined && diet !== null) {
        if (typeof diet !== 'string' || !ALLOWED_DIETS.has(diet)) {
          errors.push('consumption.diet must be one of: vegan, vegetarian, pescatarian, meat-heavy');
        }
      }

      if (shoppingSpent !== undefined && shoppingSpent !== null && typeof shoppingSpent !== 'number') {
        errors.push('consumption.shoppingSpent must be a number');
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation Error', details: errors });
    return;
  }

  next();
}

export function validateSimulateInput(req: Request, res: Response, next: NextFunction): void {
  const { baseInput, toggles } = req.body;
  const errors: string[] = [];

  if (!baseInput || typeof baseInput !== 'object') {
    errors.push('baseInput is required and must be an object');
  }

  if (!toggles || typeof toggles !== 'object') {
    errors.push('toggles is required and must be an object');
  } else {
    const { switchEv, solarPanels, meatlessDays, reduceFlightsPct, publicTransitPct } = toggles;
    if (switchEv !== undefined && switchEv !== null && typeof switchEv !== 'boolean') {
      errors.push('toggles.switchEv must be a boolean');
    }
    if (solarPanels !== undefined && solarPanels !== null && typeof solarPanels !== 'boolean') {
      errors.push('toggles.solarPanels must be a boolean');
    }
    if (meatlessDays !== undefined && meatlessDays !== null) {
      if (typeof meatlessDays !== 'number') {
        errors.push('toggles.meatlessDays must be a number');
      } else if (meatlessDays < 0 || meatlessDays > 7) {
        errors.push('toggles.meatlessDays must be between 0 and 7');
      }
    }
    if (reduceFlightsPct !== undefined && reduceFlightsPct !== null) {
      if (typeof reduceFlightsPct !== 'number') {
        errors.push('toggles.reduceFlightsPct must be a number');
      } else if (reduceFlightsPct < 0 || reduceFlightsPct > 100) {
        errors.push('toggles.reduceFlightsPct must be between 0 and 100');
      }
    }
    if (publicTransitPct !== undefined && publicTransitPct !== null) {
      if (typeof publicTransitPct !== 'number') {
        errors.push('toggles.publicTransitPct must be a number');
      } else if (publicTransitPct < 0 || publicTransitPct > 100) {
        errors.push('toggles.publicTransitPct must be between 0 and 100');
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation Error', details: errors });
    return;
  }

  next();
}
