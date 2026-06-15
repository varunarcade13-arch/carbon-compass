import { Request, Response } from 'express';
import { CalculatorService } from '../services/calculatorService';
import { Logger } from '../services/logger';

export function calculateFootprint(req: Request, res: Response): void {
  try {
    Logger.info('Calculating carbon footprint request received');
    const result = CalculatorService.calculate(req.body);
    res.json(result);
  } catch (error: any) {
    Logger.error('Error in calculateFootprint controller', { error: error?.message });
    res.status(500).json({ error: 'Internal Server Error', message: error?.message });
  }
}
