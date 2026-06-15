import dotenv from 'dotenv';
import { Logger } from '../services/logger';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  sessionSecret: string;
  isReady: boolean;
}

const config: AppConfig = {
  port: 8080,
  nodeEnv: 'development',
  sessionSecret: 'antigravity-local-secret-12345',
  isReady: false,
};

export function initConfig(): AppConfig {
  try {
    // Load .env dynamically
    dotenv.config();

    config.port = Number(process.env.PORT) || 8080;
    config.nodeEnv = process.env.NODE_ENV || 'development';
    config.sessionSecret = process.env.SESSION_SECRET || 'antigravity-local-secret-12345';

    // Validate required configs if any (e.g., Session Secret in production)
    if (config.nodeEnv === 'production' && config.sessionSecret === 'antigravity-local-secret-12345') {
      Logger.warn('Running in production with default session secret. Ensure SECRETS are mounted in production.');
    }
    
    config.isReady = true;
    Logger.info('Configuration loaded successfully', {
      port: config.port,
      nodeEnv: config.nodeEnv,
    });
    return config;
  } catch (error: any) {
    Logger.error('Failed to load configuration', { error: error?.message });
    config.isReady = false;
    throw error;
  }
}

export function getConfig(): AppConfig {
  return config;
}
