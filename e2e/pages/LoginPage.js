class LoginPage {
  constructor(page) {
    this.page = page;

    // The labels on this form are not linked to their inputs, so we find the boxes by their placeholder text
    this.username = page.getByPlaceholder('Enter username');
    this.password = page.getByPlaceholder('Enter password');
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.error-message');
    this.signupLink = page.getByRole('button', { name: 'Sign up here' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username, password) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}

module.exports = { LoginPage };