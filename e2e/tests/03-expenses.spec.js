import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { ExpensesPage } from '../pages/ExpensesPage.js';
import { createTestUser } from '../utils/api-helper.js';

test.describe('Expenses Module CRUD & Interactions', () => {
  let loginPage, expensesPage;

  test.beforeEach(async ({ page, baseURL }) => {
    loginPage = new LoginPage(page);
    expensesPage = new ExpensesPage(page);

    // Dynamically create a test user
    const { credentials } = await createTestUser();
    
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
    
    // Navigate to Expenses module
    await expensesPage.goto();
  });

  test('Create new expense and verify UI state', async ({ page }) => {
    const testAmount = 150;
    const testDesc = 'Monthly Groceries';

    // Verify empty state first
    await expect(page.locator('text=No expenses found')).toBeVisible();

    await expensesPage.addExpense(testAmount, 'Food', testDesc, 'Whole Foods run');
    
    // Verify success toast
    await expect(expensesPage.toastSuccess).toBeVisible();
    
    // Verify it appears in the table
    await expect(page.locator(`text=${testDesc}`)).toBeVisible();

    // Verify empty state disappears
    await expect(page.locator('text=No expenses found')).toBeHidden();
  });

  test('Search filtering on expenses', async ({ page }) => {
    // Add multiple expenses
    await expensesPage.addExpense(50, 'Travel', 'Uber to work');
    await expensesPage.addExpense(120, 'Shopping', 'New Shoes');
    
    // Search
    await expensesPage.searchExpense('Shoes');
    
    // Validate filter
    await expect(page.locator('text=New Shoes')).toBeVisible();
    await expect(page.locator('text=Uber to work')).toBeHidden();
  });
});
