import { Request, Response } from 'express';
import { PlanService } from '../services/planService';
import { CalculatorService } from '../services/calculatorService';
import { Logger } from '../services/logger';

export async function getActionPlan(req: Request, res: Response): Promise<void> {
  try {
    Logger.info('Generating personalized carbon roadmap request received');
    
    // Decouple heavy calculations from the main execution thread using a lightweight background promise
    const result = await new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          let calcResult = req.body;
          
          // If the input is not a calculation result, run calculations first
          if (!calcResult || typeof calcResult.grandTotal !== 'number') {
            calcResult = CalculatorService.calculate(req.body);
          }
          
          resolve(PlanService.generatePlan(calcResult));
        } catch (error) {
          reject(error);
        }
      });
    });

    res.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Error in getActionPlan controller', { error: errorMessage });
    res.status(500).json({ error: 'Internal Server Error', message: errorMessage });
  }
}
