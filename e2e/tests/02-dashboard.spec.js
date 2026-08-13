import { test, expect } from '@playwright/test';
import { createTestUser, createTransaction } from '../utils/api-helper.js';
import { LoginPage } from '../pages/LoginPage.js';

test.describe('Dashboard Core & Analytics', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    // Dynamically create a test user via backend API to avoid DB collisions
    const { credentials } = await createTestUser();
    
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
    await expect(page).toHaveURL('/dashboard');
  });

  test('Dashboard loads all metric cards', async ({ page }) => {
    await expect(page.getByText('Financial Health')).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: 'Income' })).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: 'Expenses' })).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: 'Savings' })).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: 'Investments' })).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: 'Loans' })).toBeVisible();
  });

  test('Charts and Graphs render correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Spending Breakdown' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Monthly Trends' })).toBeVisible();
    await expect(page.getByText('No spending data yet')).toBeVisible();
    await expect(page.getByText('No data available yet. Start adding transactions to see analytics.')).toBeVisible();
  });
  
  test('Charts render with real persisted data', async ({ page }) => {
    const { token } = await createTestUser();
    const today = new Date().toISOString().slice(0, 10);
    await createTransaction(token, {
      type: 'income',
      amount: 5000,
      category: 'Salary',
      description: 'Dashboard Income',
      transactionDate: today,
    });
    await createTransaction(token, {
      type: 'expense',
      amount: 1200,
      category: 'Food',
      description: 'Dashboard Expense',
      transactionDate: today,
    });

    await page.evaluate(({ token: authToken }) => {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify({ id: 'dashboard-chart-user', email: 'dashboard@example.com' }));
    }, { token });
    await page.goto('/dashboard');

    await expect(page.locator('.recharts-wrapper').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('₹5,000')).toBeVisible();
    await expect(page.getByText('₹1,200')).toBeVisible();
  });
});
