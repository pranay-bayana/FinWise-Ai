import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { createTestUser } from '../utils/api-helper.js';

test.describe('Additional Modules (Budgets, Goals, Loans)', () => {
  test.beforeEach(async ({ page }) => {
    const { credentials } = await createTestUser();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
  });

  test('Savings Goals rendering', async ({ page }) => {
    await page.goto('/savings-goals');
    await expect(page).toHaveURL(/.*savings/);
    
    // Ensure the page loaded successfully
    await expect(page.locator('h1, h2').filter({ hasText: /Savings/i }).first()).toBeVisible();
  });

  test('Budgets rendering and warnings', async ({ page }) => {
    await page.goto('/budgets');
    await expect(page).toHaveURL(/.*budget/);
    
    await expect(page.locator('h1, h2').filter({ hasText: /Budget/i }).first()).toBeVisible();
  });

  test('Loans Dashboard rendering', async ({ page }) => {
    await page.goto('/loans');
    await expect(page).toHaveURL(/.*loan/);
    
    await expect(page.locator('h1, h2').filter({ hasText: /Loan/i }).first()).toBeVisible();
  });
});
