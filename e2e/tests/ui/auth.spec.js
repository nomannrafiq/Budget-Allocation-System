const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { AdminDashboardPage } = require('../../pages/AdminDashboardPage');

const ADMIN = { username: 'e2e_admin', password: 'Passw0rd!' };
const MEMBER = { username: 'e2e_member', password: 'Passw0rd!' };

test('AUTH-01 admin can log in and reach the admin dashboard', async ({ page }) => {
  const login = new LoginPage(page);
  const dashboard = new AdminDashboardPage(page);

  await login.goto();
  await login.login(ADMIN.username, ADMIN.password);

  await expect(page).toHaveURL(/\/admindashboard$/);
  await expect(dashboard.welcomeText).toHaveText('Welcome, e2e_admin (Admin)');
});

test('AUTH-02 member can log in and reach the member dashboard', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login(MEMBER.username, MEMBER.password);

  await expect(page).toHaveURL(/\/memberdashboard$/);
});

test('AUTH-03 wrong password is refused', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login(ADMIN.username, 'wrong-password');

  await expect(login.errorMessage).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('AUTH-04 unknown username is refused', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login('nobody_here', 'Passw0rd!');

  await expect(login.errorMessage).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('AUTH-05 empty form does not submit', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.submitButton.click();

  // The browser blocks this itself, so we should still be sat on the login page with no error from the server
  await expect(page).toHaveURL(/\/login$/);
  await expect(login.errorMessage).toBeHidden();
});