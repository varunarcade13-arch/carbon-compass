import { AssessmentInput, CalculationResult } from '../../../backend/src/services/calculatorService';
import { SimulationToggles, SimulationResult } from '../../../backend/src/services/simulatorService';
import { ActionPlanResult } from '../../../backend/src/services/planService';

// Relative URLs so that they are routed correctly in both local dev (via Vite proxy) and production
const API_BASE = '/api';

export class ApiClient {
  public static async calculate(input: AssessmentInput): Promise<CalculationResult> {
    const response = await fetch(`${API_BASE}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Calculation failed: ${response.statusText}`);
    }
    return response.json();
  }

  public static async simulate(baseInput: AssessmentInput, toggles: SimulationToggles): Promise<SimulationResult> {
    const response = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ baseInput, toggles }),
    });
    if (!response.ok) {
      throw new Error(`Simulation failed: ${response.statusText}`);
    }
    return response.json();
  }

  public static async getPlans(calcResult: CalculationResult | AssessmentInput): Promise<ActionPlanResult> {
    const response = await fetch(`${API_BASE}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calcResult),
    });
    if (!response.ok) {
      throw new Error(`Roadmap generation failed: ${response.statusText}`);
    }
    return response.json();
  }
}
