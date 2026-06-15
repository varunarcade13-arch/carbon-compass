import { Request, Response } from 'express';
import { PlanService } from '../services/planService';
import { CalculatorService } from '../services/calculatorService';
import { Logger } from '../services/logger';

export function getActionPlan(req: Request, res: Response): void {
  try {
    Logger.info('Generating personalized carbon roadmap request received');
    let calcResult = req.body;
    
    // If the input is not a calculation result, run calculations first
    if (!calcResult || typeof calcResult.grandTotal !== 'number') {
      calcResult = CalculatorService.calculate(req.body);
    }
    
    const result = PlanService.generatePlan(calcResult);
    res.json(result);
  } catch (error: any) {
    Logger.error('Error in getActionPlan controller', { error: error?.message });
    res.status(500).json({ error: 'Internal Server Error', message: error?.message });
  }
}
