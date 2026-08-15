import { test, expect } from '@playwright/test';

test.describe('Dashboard Core & Analytics', () => {
  // We mock the auth for dashboard tests or assume they are logged in via global setup.
  // For simplicity, we'll log in before each test in this suite.
  
  test.beforeEach(async ({ page }) => {
    // Quick login to reach dashboard
    await page.goto('/login');
    // Using a known test user seeded in the DB
    await page.fill('input[type="email"]', 'rahul.sharma.test@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Dashboard loads all metric cards', async ({ page }) => {
    await expect(page.locator('text=Total Balance')).toBeVisible();
    await expect(page.locator('text=Total Income')).toBeVisible();
    await expect(page.locator('text=Total Expenses')).toBeVisible();
    await expect(page.locator('text=Total Savings')).toBeVisible();
  });

  test('Charts and Graphs render correctly', async ({ page }) => {
    // Recharts renders SVG elements, so we can check for recharts-wrapper
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible({ timeout: 10000 });
  });
  
  test('AI Insights section is populated', async ({ page }) => {
    await expect(page.locator('text=AI Financial Insights').or(page.locator('text=Insights'))).toBeVisible();
  });
});
