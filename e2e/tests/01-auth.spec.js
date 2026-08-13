import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { createTestUser } from '../utils/api-helper.js';

test.describe('Authentication Flow', () => {
  let loginPage, registerPage, dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('Signup creates a new user and persists session', async ({ page }) => {
    await registerPage.goto();
    const uniqueSuffix = Date.now();
    await registerPage.register(
      'Test User',
      `auto.signup+${uniqueSuffix}@example.com`,
      'Password123!'
    );

    expect(await dashboardPage.isLoaded()).toBeTruthy();
    
    // Check session persistence
    await page.reload();
    expect(await dashboardPage.isLoaded()).toBeTruthy();
  });

  test('Logout and Login', async ({ page, baseURL }) => {
    // Dynamically create a test user via backend API to avoid DB collisions
    const { credentials } = await createTestUser();
    
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
    
    expect(await dashboardPage.isLoaded()).toBeTruthy();
    
    // Test Logout
    await dashboardPage.logout();
    await expect(page).toHaveURL('/login');
  });

  test('Invalid credentials show error toast', async () => {
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'WrongPass!', { waitForDashboard: false });
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.toLowerCase()).toContain('invalid');
  });
});
