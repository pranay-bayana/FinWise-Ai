import { request } from '@playwright/test';

/**
 * Creates a unique test user via API for isolated E2E testing.
 * @param {string} baseURL The base URL of the backend API
 * @returns {Promise<Object>} The user credentials and data
 */
export async function createTestUser(baseURL = 'http://127.0.0.1:5001/api') {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const testUser = {
    fullName: 'Test Automation User',
    email: `auto.user+${uniqueSuffix}@example.com`,
    password: 'Password123!',
    phone: '1234567890'
  };

  const context = await request.newContext();
  const response = await context.post(`${baseURL}/auth/signup`, {
    data: testUser,
  });

  if (!response.ok()) {
    const text = await response.text();
    throw new Error(`Failed to create test user: ${response.status()} ${text}`);
  }

  const { token, user } = await response.json();
  
  return {
    credentials: testUser,
    token,
    user
  };
}

export async function createTransaction(token, payload, baseURL = 'http://127.0.0.1:5001/api') {
  const context = await request.newContext();
  const response = await context.post(`${baseURL}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  });

  if (!response.ok()) {
    const text = await response.text();
    throw new Error(`Failed to create transaction: ${response.status()} ${text}`);
  }

  return response.json();
}
