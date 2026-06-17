import { Request, Response } from 'express';
import { CalculatorService } from '../services/calculatorService';
import { Logger } from '../services/logger';

export async function calculateFootprint(req: Request, res: Response): Promise<void> {
  try {
    Logger.info('Calculating carbon footprint request received');
    
    // Decouple heavy calculations from the main execution thread using a lightweight background promise
    const result = await new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          resolve(CalculatorService.calculate(req.body));
        } catch (error) {
          reject(error);
        }
      });
    });

    res.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Error in calculateFootprint controller', { error: errorMessage });
    res.status(500).json({ error: 'Internal Server Error', message: errorMessage });
  }
}
