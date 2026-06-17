import { Request, Response } from 'express';
import { SimulatorService } from '../services/simulatorService';
import { Logger } from '../services/logger';

export async function simulateFootprint(req: Request, res: Response): Promise<void> {
  try {
    Logger.info('Simulating footprint scenario request received');
    const { baseInput, toggles } = req.body;
    
    // Decouple heavy calculations from the main execution thread using a lightweight background promise
    const result = await new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          resolve(SimulatorService.simulate(baseInput, toggles));
        } catch (error) {
          reject(error);
        }
      });
    });

    res.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Error in simulateFootprint controller', { error: errorMessage });
    res.status(500).json({ error: 'Internal Server Error', message: errorMessage });
  }
}
