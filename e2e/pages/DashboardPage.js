export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.menuButton = page.locator('button[aria-label="Open menu"]');
    this.signOutButton = page.locator('button:has-text("Sign Out")');
    this.financialHealthTitle = page.locator('text=Financial Health').first();
  }

  async logout() {
    await this.menuButton.click();
    await this.signOutButton.waitFor({ state: 'visible' });
    await this.signOutButton.click();
  }

  async isLoaded() {
    await this.financialHealthTitle.waitFor({ state: 'visible', timeout: 10000 });
    return await this.financialHealthTitle.isVisible();
  }
}
