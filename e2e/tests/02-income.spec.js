import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { IncomePage } from '../pages/IncomePage.js';
import { createTestUser } from '../utils/api-helper.js';

test.describe('Income Module CRUD & Interactions', () => {
  let loginPage, incomePage;

  test.beforeEach(async ({ page, baseURL }) => {
    loginPage = new LoginPage(page);
    incomePage = new IncomePage(page);

    // Dynamically create a test user to ensure clean state
    const { credentials } = await createTestUser();
    
    // Login as the dynamically created user
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
    
    // Navigate to Income module
    await incomePage.goto();
  });

  test('Create new income and verify persistence', async ({ page }) => {
    const testAmount = 5000;
    const testDesc = 'Freelance Project';

    await incomePage.addIncome(testAmount, 'Salary', testDesc, 'Web development work');
    
    // Verify success toast
    await expect(incomePage.toastSuccess).toBeVisible();
    
    // Verify it appears in the table
    await expect(page.locator(`text=${testDesc}`)).toBeVisible();
    await expect(page.getByText('₹5,000').first()).toBeVisible();

    // Verify DB persistence by refreshing
    await page.reload();
    await expect(page.locator(`text=${testDesc}`)).toBeVisible();
  });

  test('Search and filter income', async ({ page }) => {
    // Add two distinct income entries
    await incomePage.addIncome(1000, 'Dividend', 'Dividend Yield');
    await incomePage.addIncome(2000, 'Other', 'Garage Sale');
    
    // Ensure both are visible
    await expect(page.locator('text=Dividend Yield')).toBeVisible();
    await expect(page.locator('text=Garage Sale')).toBeVisible();

    // Search for specific entry
    await incomePage.searchIncome('Dividend');
    
    // Validate filter results
    await expect(page.locator('text=Dividend Yield')).toBeVisible();
    await expect(page.locator('text=Garage Sale')).toBeHidden();
  });
});
