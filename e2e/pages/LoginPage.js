import { expect } from '@playwright/test';

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.googleLoginButton = page.locator('button', { hasText: /Google/i });
    this.errorMessage = page.getByRole('status');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password, { waitForDashboard = true } = {}) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    if (waitForDashboard) {
      await expect(this.page).toHaveURL('/dashboard', { timeout: 10000 });
    }
  }

  async getErrorMessage() {
    const status = this.errorMessage;
    try {
      await expect(status).toBeVisible({ timeout: 5000 });
      const text = await status.textContent();
      return text?.trim() || null;
    } catch {
      return null;
    }
  }
}
