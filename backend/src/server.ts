import app from './app';
import { initConfig } from './config/secrets';
import { Logger } from './services/logger';

// Initialize configuration
const config = initConfig();

const server = app.listen(config.port, () => {
  Logger.info(`CarbonCompass server started`, {
    port: config.port,
    env: config.nodeEnv,
  });
});

// Graceful shutdown handler for Cloud Run scaling events
const shutdown = (signal: string) => {
  Logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    Logger.info('Http server closed.');
    process.exit(0);
  });

  // Force close after 10s if connections linger
  setTimeout(() => {
    Logger.warn('Forcing server shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
