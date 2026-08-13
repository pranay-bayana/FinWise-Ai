import { test, expect } from '@playwright/test';
import { createTestUser, createTransaction } from '../utils/api-helper.js';

// Use Playwright's API testing capabilities to hit the backend directly
test.describe('Backend API & Data Integrity', () => {
  const backendUrl = 'http://127.0.0.1:5001/api';
  let authToken = '';

  test.beforeAll(async ({ request }) => {
    const { token } = await createTestUser(backendUrl);
    authToken = token;
    const today = new Date().toISOString().slice(0, 10);
    await createTransaction(authToken, {
      type: 'income',
      amount: 3000,
      category: 'Salary',
      description: 'API Income',
      transactionDate: today,
    }, backendUrl);
    await createTransaction(authToken, {
      type: 'expense',
      amount: 900,
      category: 'Food',
      description: 'API Expense',
      transactionDate: today,
    }, backendUrl);
  });

  test('GET /transactions returns correct data structure', async ({ request }) => {
    test.skip(!authToken, 'Auth token required');
    const response = await request.get(`${backendUrl}/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    expect(Array.isArray(body.transactions)).toBeTruthy();
    if (body.transactions.length > 0) {
      expect(body.transactions[0]).toHaveProperty('id');
      expect(body.transactions[0]).toHaveProperty('amount');
      expect(body.transactions[0]).toHaveProperty('type');
    }
  });
  
  test('Dashboard Analytics endpoints calculate correctly', async ({ request }) => {
    test.skip(!authToken, 'Auth token required');
    const response = await request.get(`${backendUrl}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    // Verify mathematical integrity fields exist
    expect(body).toHaveProperty('totalIncome');
    expect(body).toHaveProperty('totalExpenses');
    expect(body).toHaveProperty('totalSavings');
    expect(body.totalIncome).toBe(3000);
    expect(body.totalExpenses).toBe(900);
    expect(body.totalSavings).toBe(2100);
  });
});
