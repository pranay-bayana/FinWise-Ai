// src/app.js
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import 'express-async-errors';
import authRoutes from './routes/authRoutes.js';
import webauthnRoutes from './routes/webauthnRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { runMigrations } from './services/dbMigrate.js';
import { fileURLToPath } from 'url';
import { loadBackendEnv } from './services/env.js';

loadBackendEnv();

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(compression());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const error = new Error('Not allowed by CORS');
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/webauthn', webauthnRoutes);

const healthHandler = (req, res) => {
  res.json({ status: 'ok', message: 'Finance Tracker API is running' });
};

app.get('/', healthHandler);
app.get('/api/health', healthHandler);

app.use('/api/transactions', transactionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', moduleRoutes);
app.use('/api', financeRoutes);

app.use(errorHandler);

export const startServer = async () => {
  const PORT = process.env.PORT || 5001;
  const HOST = process.env.HOST || '0.0.0.0';

  await runMigrations();

  return app.listen(PORT, HOST, () => {
    console.log(`🚀 Backend server running on http://${HOST}:${PORT}`);
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  });
}

export default app;
