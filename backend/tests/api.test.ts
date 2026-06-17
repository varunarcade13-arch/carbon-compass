import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { initConfig, getConfig } from '../src/config/secrets';
import { Logger } from '../src/services/logger';
import { CalculatorService } from '../src/services/calculatorService';
import { SimulatorService } from '../src/services/simulatorService';
import { PlanService } from '../src/services/planService';

beforeAll(() => {
  initConfig();
});

describe('Health and Readiness Probes', () => {
  it('GET /healthz should return 200 OK', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });

  it('GET /ready should return 200 Ready if loaded', async () => {
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Ready');
  });

  it('GET /ready should return 503 if not loaded', async () => {
    const config = getConfig();
    const originalReady = config.isReady;
    
    // Simulate unready state
    config.isReady = false;
    const response = await request(app).get('/ready');
    expect(response.status).toBe(503);
    expect(response.text).toBe('Not Ready');

    // Restore ready state
    config.isReady = originalReady;
  });
});

describe('Validator Middleware & Calculator Endpoint', () => {
  it('POST /api/calculate should return 200 with correct format for valid data', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({
        housing: { electricityKwh: 500, gasTherms: 30, wasteKg: 10, recycleRate: 40 },
        transport: { carKm: 150, carType: 'hybrid', transitKm: 30, flightsShort: 1, flightsMedium: 0, flightsLong: 1 },
        consumption: { diet: 'vegetarian', shoppingSpent: 200 }
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('housing');
    expect(response.body).toHaveProperty('grandTotal');
    expect(response.body.grandTotal).toBeGreaterThan(0);
  });

  it('POST /api/calculate should return 400 for invalid data types', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({
        housing: { electricityKwh: 'invalid-string', gasTherms: 'str', wasteKg: 'str', recycleRate: 'not-a-number' },
        transport: { carType: 'unsupported-car-type', carKm: 'invalid-km', transitKm: 'str', flightsShort: 'str', flightsMedium: 'str', flightsLong: 'str' },
        consumption: { diet: 'meat-lover', shoppingSpent: 'str' }
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
    expect(response.body.details).toContain('housing.electricityKwh must be a number');
    expect(response.body.details).toContain('housing.gasTherms must be a number');
    expect(response.body.details).toContain('housing.wasteKg must be a number');
    expect(response.body.details).toContain('housing.recycleRate must be a number');
    
    expect(response.body.details).toContain('transport.carKm must be a number');
    expect(response.body.details).toContain('transport.carType must be one of: ev, hybrid, sedan, suv');
    expect(response.body.details).toContain('transport.transitKm must be a number');
    expect(response.body.details).toContain('transport.flightsShort must be a number');
    expect(response.body.details).toContain('transport.flightsMedium must be a number');
    expect(response.body.details).toContain('transport.flightsLong must be a number');

    expect(response.body.details).toContain('consumption.diet must be one of: vegan, vegetarian, pescatarian, meat-heavy');
    expect(response.body.details).toContain('consumption.shoppingSpent must be a number');
  });

  it('POST /api/calculate should return 400 if categories are not objects', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({
        housing: 'not-an-object',
        transport: 1234,
        consumption: true
      });

    expect(response.status).toBe(400);
    expect(response.body.details).toContain('housing must be an object');
    expect(response.body.details).toContain('transport must be an object');
    expect(response.body.details).toContain('consumption must be an object');
  });

  it('POST /api/calculate should return 400 if recycleRate is out of range', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({
        housing: { recycleRate: 150 }
      });
    expect(response.status).toBe(400);
    expect(response.body.details).toContain('housing.recycleRate must be between 0 and 100');
  });

  it('POST /api/calculate should accept null values or missing categories', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({
        housing: { electricityKwh: null, gasTherms: null, wasteKg: null, recycleRate: null },
        transport: { carKm: null, carType: null, transitKm: null, flightsShort: null, flightsMedium: null, flightsLong: null },
        consumption: { diet: null, shoppingSpent: null }
      });
    expect(response.status).toBe(200);
  });
});

describe('Simulator Endpoint', () => {
  const validPayload = {
    baseInput: {
      housing: { electricityKwh: 400 },
      transport: { carKm: 100 }
    },
    toggles: {
      switchEv: true,
      solarPanels: false,
      meatlessDays: 3,
      reduceFlightsPct: 50,
      publicTransitPct: 30
    }
  };

  it('POST /api/simulate should run simulation successfully', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .send(validPayload);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('baseline');
    expect(response.body).toHaveProperty('simulated');
    expect(response.body).toHaveProperty('savingsAnnual');
    expect(response.body.projections).toHaveLength(5);
  });

  it('POST /api/simulate should fail with 400 if baseInput or toggles is missing', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .send({ toggles: {} });
    
    expect(response.status).toBe(400);
    expect(response.body.details).toContain('baseInput is required and must be an object');
  });

  it('POST /api/simulate should fail with 400 if toggles are of wrong type', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .send({
        baseInput: {},
        toggles: {
          switchEv: 'not-a-boolean',
          solarPanels: 123,
          meatlessDays: 10,
          reduceFlightsPct: -5,
          publicTransitPct: 150
        }
      });
    
    expect(response.status).toBe(400);
    expect(response.body.details).toContain('toggles.switchEv must be a boolean');
    expect(response.body.details).toContain('toggles.solarPanels must be a boolean');
    expect(response.body.details).toContain('toggles.meatlessDays must be between 0 and 7');
    expect(response.body.details).toContain('toggles.reduceFlightsPct must be between 0 and 100');
    expect(response.body.details).toContain('toggles.publicTransitPct must be between 0 and 100');
  });

  it('POST /api/simulate should fail with 400 if toggles is not an object', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .send({
        baseInput: {},
        toggles: 'not-an-object'
      });
    expect(response.status).toBe(400);
    expect(response.body.details).toContain('toggles is required and must be an object');
  });

  it('POST /api/simulate should fail with 400 if toggles numeric properties are strings', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .send({
        baseInput: {},
        toggles: {
          meatlessDays: 'string-instead-of-number',
          reduceFlightsPct: 'string-instead-of-number',
          publicTransitPct: 'string-instead-of-number'
        }
      });
    expect(response.status).toBe(400);
    expect(response.body.details).toContain('toggles.meatlessDays must be a number');
    expect(response.body.details).toContain('toggles.reduceFlightsPct must be a number');
    expect(response.body.details).toContain('toggles.publicTransitPct must be a number');
  });

  it('POST /api/simulate should accept null and undefined toggles', async () => {
    const response = await request(app)
      .post('/api/simulate')
      .send({
        baseInput: {},
        toggles: {
          switchEv: null,
          solarPanels: null,
          meatlessDays: null,
          reduceFlightsPct: null,
          publicTransitPct: null
        }
      });
    expect(response.status).toBe(200);
  });
});

describe('Action Plan Endpoint', () => {
  it('POST /api/plans should accept pre-calculated results', async () => {
    const calcResult = {
      housing: { electricity: 1000, gas: 500, waste: 200, total: 1700 },
      transport: { car: 3000, transit: 100, flights: 1000, total: 4100 },
      consumption: { diet: 2800, shopping: 400, total: 3200 },
      grandTotal: 9000
    };

    const response = await request(app)
      .post('/api/plans')
      .send(calcResult);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('actions');
    expect(response.body).toHaveProperty('habits');
    expect(response.body).toHaveProperty('milestones');
  });

  it('POST /api/plans should accept raw inputs and calculate footprint internally', async () => {
    const response = await request(app)
      .post('/api/plans')
      .send({
        housing: { electricityKwh: 100 },
        transport: { carKm: 20 }
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('actions');
  });

  it('POST /api/plans should handle completely malformed or empty payloads gracefully', async () => {
    const response = await request(app)
      .post('/api/plans')
      .send({
        housing: 'not-an-object-should-fallback-to-default-calculates',
        transport: { carKm: NaN }
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('actions');
  });
});

describe('Config and Secrets Loader', () => {
  it('should validate production security warnings and default values', () => {
    const originalPort = process.env.PORT;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalSessionSecret = process.env.SESSION_SECRET;

    // Test production warning
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'antigravity-local-secret-12345';
    
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    initConfig();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();

    // Test production custom secret does not warn
    process.env.SESSION_SECRET = 'custom-production-secret-99999';
    const consoleWarnSpy2 = vi.spyOn(console, 'warn').mockImplementation(() => {});
    initConfig();
    expect(consoleWarnSpy2).not.toHaveBeenCalled();
    consoleWarnSpy2.mockRestore();

    // Test default fallback values
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.SESSION_SECRET;

    initConfig();
    const config = getConfig();
    expect(config.port).toBe(8080);
    expect(config.nodeEnv).toBe('development');
    expect(config.sessionSecret).toBe('antigravity-local-secret-12345');
    
    // Clean up
    if (originalPort) process.env.PORT = originalPort;
    if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
    if (originalSessionSecret) process.env.SESSION_SECRET = originalSessionSecret;
    initConfig();
  });

  it('should handle config load errors gracefully', () => {
    const dotenvSpy = vi.spyOn(require('dotenv'), 'config').mockImplementation(() => {
      throw new Error('Dotenv Failure Mock');
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => initConfig()).toThrow('Dotenv Failure Mock');
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Clean up
    dotenvSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // Re-init config to restore valid state
    initConfig();
  });

  it('should lazy load and cache config when requested', async () => {
    // Test early return when config is already initialized and VITEST is not set
    const originalVitest = process.env.VITEST;
    delete process.env.VITEST;
    try {
      const config1 = initConfig();
      const config2 = initConfig();
      expect(config1).toBe(config2);
    } finally {
      process.env.VITEST = originalVitest;
    }

    // Test lazy loading of getConfig when config is null
    vi.resetModules();
    const { getConfig: getCleanConfig } = await import('../src/config/secrets');
    const cleanConfig = getCleanConfig();
    expect(cleanConfig.isReady).toBe(true);
  });
});

describe('Structured Logger Service', () => {
  it('should log structured info, warning, and error formats', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Logger.info('info message', { val: 123 });
    Logger.warn('warn message', { val: 456 });
    Logger.error('error message', { val: 789 });

    expect(logSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    const loggedObject = JSON.parse(logSpy.mock.calls[0][0]);
    expect(loggedObject.message).toBe('info message');
    expect(loggedObject.severity).toBe('INFO');
    expect(loggedObject.val).toBe(123);

    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

describe('Controller Catch Blocks', () => {
  it('POST /api/calculate should return 500 when service fails', async () => {
    const spy = vi.spyOn(CalculatorService, 'calculate').mockImplementation(() => {
      throw new Error('Calc Error Mock');
    });
    const response = await request(app).post('/api/calculate').send({});
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
    spy.mockRestore();
  });

  it('POST /api/calculate should handle non-Error objects', async () => {
    const spy = vi.spyOn(CalculatorService, 'calculate').mockImplementation(() => {
      throw 'Calc String Error';
    });
    const response = await request(app).post('/api/calculate').send({});
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unknown error');
    spy.mockRestore();
  });

  it('POST /api/simulate should return 500 when service fails', async () => {
    const spy = vi.spyOn(SimulatorService, 'simulate').mockImplementation(() => {
      throw new Error('Sim Error Mock');
    });
    const response = await request(app).post('/api/simulate').send({ baseInput: {}, toggles: {} });
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
    spy.mockRestore();
  });

  it('POST /api/simulate should handle non-Error objects', async () => {
    const spy = vi.spyOn(SimulatorService, 'simulate').mockImplementation(() => {
      throw 'Sim String Error';
    });
    const response = await request(app).post('/api/simulate').send({ baseInput: {}, toggles: {} });
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unknown error');
    spy.mockRestore();
  });

  it('POST /api/plans should return 500 when service fails', async () => {
    const spy = vi.spyOn(PlanService, 'generatePlan').mockImplementation(() => {
      throw new Error('Plan Error Mock');
    });
    const response = await request(app).post('/api/plans').send({ grandTotal: 5000 });
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
    spy.mockRestore();
  });

  it('POST /api/plans should handle non-Error objects', async () => {
    const spy = vi.spyOn(PlanService, 'generatePlan').mockImplementation(() => {
      throw 'Plan String Error';
    });
    const response = await request(app).post('/api/plans').send({ grandTotal: 5000 });
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Unknown error');
    spy.mockRestore();
  });
});

describe('Static File Fallback Handler', () => {
  it('GET /some-random-route should return 200 or 404 depending on public build presence', async () => {
    const response = await request(app).get('/some-non-existent-web-page-route');
    expect([200, 404]).toContain(response.status);
  });

  it('GET /some-random-route should handle sendFile error branches', async () => {
    const express = require('express');
    const sendFileSpy = vi.spyOn(express.response, 'sendFile').mockImplementation(function(this: any, filePath: string, options: any, callback?: any) {
      const cb = typeof options === 'function' ? options : callback;
      if (cb) {
        cb(new Error('Mock SendFile Error'));
      }
      return this;
    });

    const response = await request(app).get('/some-non-existent-web-page-route');
    expect(response.status).toBe(404);

    sendFileSpy.mockRestore();
  });
});
