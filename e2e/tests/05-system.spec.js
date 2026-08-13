import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { createTestUser } from '../utils/api-helper.js';

test.describe('System Settings and Persistence', () => {
  test.beforeEach(async ({ page }) => {
    const { credentials } = await createTestUser();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
  });

  test('Dark Mode Toggle', async ({ page }) => {
    const before = await page.locator('html').evaluate((html) => html.classList.contains('dark'));
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    
    await expect(page.locator('html')).toHaveClass(before ? /^(?!.*\bdark\b).*$/ : /dark/);
    
    await page.reload();
    await expect(page.locator('html')).toHaveClass(before ? /^(?!.*\bdark\b).*$/ : /dark/);
  });
});
