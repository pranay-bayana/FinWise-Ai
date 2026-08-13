import { loadBackendEnv } from './env.js';

loadBackendEnv();

const fallbackSecret = 'supersecretfallback';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production');
}

if (!process.env.JWT_SECRET) {
  console.warn('[setup] JWT_SECRET is not configured. Using development-only fallback.');
}

export const JWT_SECRET = process.env.JWT_SECRET || fallbackSecret;
