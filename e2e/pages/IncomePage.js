export class IncomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.addIncomeButton = page.locator('main').getByRole('button', { name: 'Add Income' });
    this.amountInput = page.locator('form input[type="number"]');
    this.categorySelect = page.locator('form select').first();
    this.descriptionInput = page.locator('form input[placeholder="Source of income"]');
    this.notesTextarea = page.locator('form textarea');
    this.submitButton = page.locator('form button[type="submit"]');
    
    this.searchBox = page.locator('input[placeholder="Search income..."]');
    this.tableRows = page.locator('tbody tr');
    
    this.toastSuccess = page.getByRole('status').filter({ hasText: /successfully/i });
  }

  async goto() {
    await this.page.goto('/income');
  }

  async addIncome(amount, category, description, notes = '') {
    await this.addIncomeButton.click();
    await this.amountInput.fill(amount.toString());
    await this.categorySelect.selectOption(category);
    await this.descriptionInput.fill(description);
    if (notes) await this.notesTextarea.fill(notes);
    await this.submitButton.click();
    await this.page.locator('form').waitFor({ state: 'detached', timeout: 10000 });
  }

  async searchIncome(term) {
    await this.searchBox.fill(term);
  }
}
