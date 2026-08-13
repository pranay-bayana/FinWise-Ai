import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { IncomePage } from '../pages/IncomePage.js';
import { ExpensesPage } from '../pages/ExpensesPage.js';
import { createTestUser } from '../utils/api-helper.js';

test.describe('Income and Expenses CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const { credentials } = await createTestUser();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
  });

  test('Create, Read, Update, Delete an Expense', async ({ page }) => {
    const expensesPage = new ExpensesPage(page);
    await expensesPage.goto();
    await expect(page).toHaveURL(/.*expenses/);

    await expensesPage.addExpense(620, 'Food', 'Dinner', 'Swiggy order');

    await expect(page.locator('text=Dinner').first()).toBeVisible();
    await expect(page.locator('text=₹620').first()).toBeVisible();

    await page.locator('tbody tr').filter({ hasText: 'Dinner' }).locator('button').first().click();
    await page.locator('form input[type="number"]').fill('700');
    await page.getByRole('button', { name: 'Update Expense' }).click();
    await expect(page.locator('text=₹700').first()).toBeVisible();

    page.on('dialog', dialog => dialog.accept());
    await page.locator('tbody tr').filter({ hasText: 'Dinner' }).locator('button').nth(1).click();
    await expect(page.locator('text=Dinner')).not.toBeVisible();
  });

  test('Create Income', async ({ page }) => {
    const incomePage = new IncomePage(page);
    await incomePage.goto();
    await expect(page).toHaveURL(/.*income/);

    await incomePage.addIncome(85000, 'Salary', 'Monthly Salary');

    await expect(page.locator('text=Monthly Salary').first()).toBeVisible();
    await expect(page.locator('text=₹85,000').first()).toBeVisible();
  });
});
