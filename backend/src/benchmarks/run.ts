import { CalculatorService, DEFAULT_INPUTS, EMISSION_FACTORS } from '../services/calculatorService';
import { SimulatorService } from '../services/simulatorService';
import { PlanService } from '../services/planService';
import { performance } from 'perf_hooks';

function getMemoryUsage(): number {
  const mem = process.memoryUsage();
  return mem.heapUsed / 1024 / 1024; // MB
}

console.log('\x1b[36m==================================================\x1b[0m');
console.log('\x1b[1m\x1b[32m       CarbonCompass Performance Benchmarks        \x1b[0m');
console.log('\x1b[36m==================================================\x1b[0m');

// Warm up
const warmupInput = {
  housing: { electricityKwh: 300, gasTherms: 20 },
  transport: { carKm: 100, carType: 'ev' as const },
  consumption: { diet: 'vegan' as const }
};
for (let i = 0; i < 1000; i++) {
  CalculatorService.calculate(warmupInput);
}

// 1. Calculator Cache Hits vs Misses
console.log('\n\x1b[1m1. Calculator Cache Benchmarks (100,000 iterations)\x1b[0m');
const initialMem = getMemoryUsage();

// Cache Hit Performance
const hitStart = performance.now();
for (let i = 0; i < 100000; i++) {
  CalculatorService.calculate(warmupInput);
}
const hitDuration = performance.now() - hitStart;
const hitOpsSec = Math.round(100000 / (hitDuration / 1000));
console.log(`  \x1b[32m✔ Cache Hits:\x1b[0m ${hitDuration.toFixed(2)} ms (${hitOpsSec.toLocaleString()} ops/sec)`);

// Cache Miss Performance (unique inputs)
// Note: We generate unique keys to force cache misses.
const missStart = performance.now();
for (let i = 0; i < 100000; i++) {
  CalculatorService.calculate({
    housing: { electricityKwh: i % 1000, gasTherms: 20 },
    transport: { carKm: 100, carType: 'ev' as const },
    consumption: { diet: 'vegan' as const }
  });
}
const missDuration = performance.now() - missStart;
const missOpsSec = Math.round(100000 / (missDuration / 1000));
console.log(`  \x1b[33m✔ Cache Misses (Unique):\x1b[0m ${missDuration.toFixed(2)} ms (${missOpsSec.toLocaleString()} ops/sec)`);

const cacheSpeedup = (missDuration / hitDuration).toFixed(1);
console.log(`  \x1b[35m➔ Speedup Ratio:\x1b[0m ${cacheSpeedup}x faster with cache`);

// 2. SimulatorService Benchmarks
console.log('\n\x1b[1m2. SimulatorService Benchmarks (50,000 iterations)\x1b[0m');
const baseInput = {
  housing: { electricityKwh: 500, gasTherms: 30, wasteKg: 10, recycleRate: 40 },
  transport: { carKm: 150, carType: 'hybrid' as const, transitKm: 30, flightsShort: 1, flightsMedium: 0, flightsLong: 1 },
  consumption: { diet: 'vegetarian' as const, shoppingSpent: 200 }
};
const toggles = {
  switchEv: true,
  solarPanels: true,
  meatlessDays: 3,
  reduceFlightsPct: 50,
  publicTransitPct: 30
};

const simStart = performance.now();
for (let i = 0; i < 50000; i++) {
  SimulatorService.simulate(baseInput, toggles);
}
const simDuration = performance.now() - simStart;
const simOpsSec = Math.round(50000 / (simDuration / 1000));
console.log(`  \x1b[32m✔ Simulations:\x1b[0m ${simDuration.toFixed(2)} ms (${simOpsSec.toLocaleString()} ops/sec)`);

// 3. PlanService Benchmarks
console.log('\n\x1b[1m3. PlanService Benchmarks (50,000 iterations)\x1b[0m');
const calcResult = CalculatorService.calculate(baseInput);

const planStart = performance.now();
for (let i = 0; i < 50000; i++) {
  PlanService.generatePlan(calcResult);
}
const planDuration = performance.now() - planStart;
const planOpsSec = Math.round(50000 / (planDuration / 1000));
console.log(`  \x1b[32m✔ Action Plans:\x1b[0m ${planDuration.toFixed(2)} ms (${planOpsSec.toLocaleString()} ops/sec)`);

// 4. Memory Profiling
const finalMem = getMemoryUsage();
const deltaMem = finalMem - initialMem;
console.log('\n\x1b[1m4. Memory Profiling\x1b[0m');
console.log(`  ➔ Initial Heap Used: ${initialMem.toFixed(2)} MB`);
console.log(`  ➔ Final Heap Used:   ${finalMem.toFixed(2)} MB`);
console.log(`  ➔ Heap Used Delta:   ${deltaMem >= 0 ? '+' : ''}${deltaMem.toFixed(2)} MB`);
console.log('\x1b[36m==================================================\x1b[0m\n');
