import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const currentDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(currentDir, '../..');

export const loadBackendEnv = () => {
  dotenv.config({ path: resolve(backendRoot, '.env') });
};
