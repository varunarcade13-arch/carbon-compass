import dotenv from 'dotenv';
import { Logger } from '../services/logger';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  sessionSecret: string;
  isReady: boolean;
}

let config: AppConfig | null = null;

export function initConfig(): AppConfig {
  if (config && !process.env.VITEST) {
    return config;
  }
  try {
    // Load .env dynamically
    dotenv.config();

    const loadedConfig: AppConfig = {
      port: Number(process.env.PORT) || 8080,
      nodeEnv: process.env.NODE_ENV || 'development',
      sessionSecret: process.env.SESSION_SECRET || 'antigravity-local-secret-12345',
      isReady: true,
    };

    // Validate required configs if any (e.g., Session Secret in production)
    if (loadedConfig.nodeEnv === 'production' && loadedConfig.sessionSecret === 'antigravity-local-secret-12345') {
      Logger.warn('Running in production with default session secret. Ensure SECRETS are mounted in production.');
    }
    
    config = loadedConfig;
    Logger.info('Configuration loaded successfully', {
      port: config.port,
      nodeEnv: config.nodeEnv,
    });
    return config;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('Failed to load configuration', { error: errorMessage });
    config = {
      port: 8080,
      nodeEnv: 'development',
      sessionSecret: 'antigravity-local-secret-12345',
      isReady: false,
    };
    throw error;
  }
}

export function getConfig(): AppConfig {
  if (!config) {
    return initConfig();
  }
  return config;
}
