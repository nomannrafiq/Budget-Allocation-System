const { test, expect } = require('@playwright/test');

test('admin can log in and reach the admin dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter username').fill('e2e_admin');
  await page.getByPlaceholder('Enter password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/admindashboard$/);
  await expect(page.getByText('Welcome, e2e_admin (Admin)')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Set Budget' })).toBeVisible();
});