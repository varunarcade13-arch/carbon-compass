import { Request, Response } from 'express';
import { SimulatorService } from '../services/simulatorService';
import { Logger } from '../services/logger';

export function simulateFootprint(req: Request, res: Response): void {
  try {
    Logger.info('Simulating footprint scenario request received');
    const { baseInput, toggles } = req.body;
    const result = SimulatorService.simulate(baseInput, toggles);
    res.json(result);
  } catch (error: any) {
    Logger.error('Error in simulateFootprint controller', { error: error?.message });
    res.status(500).json({ error: 'Internal Server Error', message: error?.message });
  }
}
