import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { getConfig } from './config/secrets';
import { validateCalculateInput, validateSimulateInput } from './middleware/validator';
import { calculateFootprint } from './controllers/calculator';
import { simulateFootprint } from './controllers/simulator';
import { getActionPlan } from './controllers/plan';

const app = express();

// Secure headers with Helmet (with relaxed CSP for fonts/styles if running in SPA)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(cors());
app.use(express.json());

// Probes for GCP Cloud Run
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/ready', (req, res) => {
  const config = getConfig();
  if (config.isReady) {
    res.status(200).send('Ready');
  } else {
    res.status(503).send('Not Ready');
  }
});

// API Endpoints
app.post('/api/calculate', validateCalculateInput, calculateFootprint);
app.post('/api/simulate', validateSimulateInput, simulateFootprint);
app.post('/api/plans', getActionPlan);

// Serve Static Frontend Assets (compiled in Docker/Build step)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Fallback for Single Page App client-side routing
app.get('*', (req, res) => {
  // Only serve index.html if it exists, otherwise fall back to 404
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

export default app;
