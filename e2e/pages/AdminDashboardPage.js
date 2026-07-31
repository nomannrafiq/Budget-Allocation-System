class AdminDashboardPage {
  constructor(page) {
    this.page = page;

    this.welcomeText = page.locator('.welcome-text');
    this.logoutButton = page.getByRole('button', { name: 'LOGOUT' });
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-message');

    this.budgetInput = page.getByPlaceholder('Enter budget amount');
    this.setBudgetButton = page.getByRole('button', { name: 'SET BUDGET' });
    this.currentBudget = page.locator('.current-info');

    this.currentPhase = page.locator('.phase-badge');

    this.restartButton = page.getByRole('button', { name: /RESTART SYSTEM/ });
  }

  async goto() {
    await this.page.goto('/admindashboard');
  }

  async setBudget(amount) {
    await this.budgetInput.fill(String(amount));
    await this.setBudgetButton.click();
  }

  async moveToPhase(phase) {
    await this.page.getByRole('button', { name: `Move to Phase ${phase}` }).click();
  }

  // Restarting asks "are you sure" first, so answer that before clicking.
  async restart(confirm = true) {
    this.page.once('dialog', (dialog) => (confirm ? dialog.accept() : dialog.dismiss()));
    await this.restartButton.click();
  }
}

module.exports = { AdminDashboardPage };