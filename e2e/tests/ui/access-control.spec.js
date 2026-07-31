const { test, expect } = require('../../fixtures/auth');
const { AdminDashboardPage } = require('../../pages/AdminDashboardPage');

test('ACL-01 logged out users cannot open the admin dashboard', async ({ page }) => {
  await page.goto('/admindashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('ACL-02 logged out users cannot open the member dashboard', async ({ page }) => {
  await page.goto('/memberdashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('ACL-03 a member sent to the admin dashboard lands back on their own', async ({ memberPage }) => {
  await memberPage.goto('/admindashboard');

  await expect(memberPage).toHaveURL(/\/memberdashboard$/);
  await expect(memberPage.getByRole('heading', { name: 'Set Budget' })).toBeHidden();
});

test('ACL-04 an admin sent to the member dashboard lands back on their own', async ({ adminPage }) => {
  await adminPage.goto('/memberdashboard');

  await expect(adminPage).toHaveURL(/\/admindashboard$/);
});

test('ACL-05 editing the saved user must not grant admin access', async ({ page }) => {
  test.fail(true, 'BUG-04 - the role is only checked in the browser');

  // Pretend to be an admin who does not even exist in the database.
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({ id: 9999, username: 'fake', role: 'admin' }));
  });

  await page.goto('/admindashboard');

  await expect(page).toHaveURL(/\/login$/);
});

//const { test, expect } = require('@playwright/test');
const { API } = require('../../fixtures/api');

// These tests are expected to fail today, which means the calls really do go through and really do change things. Put the system back afterwards
test.afterEach(async ({ request }) => {
  await request.post(`${API}/phase/restart`);
});

test('ACL-06 changing the phase must require an admin', async ({ request }) => {
  test.fail(true, 'BUG-02 - no endpoint checks who is calling it');

  const res = await request.post(`${API}/phase/transition`, { data: { phase: 2 } });

  expect(res.status()).toBe(401);
});

test('ACL-07 restarting the system must require an admin', async ({ request }) => {
  test.fail(true, 'BUG-03 - anyone can wipe every proposal and vote');

  const res = await request.post(`${API}/phase/restart`);

  expect(res.status()).toBe(401);
});

test('ACL-08 signing up must not let you pick the admin role', async ({ request }) => {
  test.fail(true, 'BUG-01 - the register endpoint accepts whatever role you send');

  // A new name each run, so a repeat run does not just hit "already exists".
  const res = await request.post(`${API}/auth/register`, {
    data: { username: `sneaky_${Date.now()}`, password: 'Passw0rd!', role: 'admin' },
  });

  expect(res.status()).toBe(400);
});

test('AUTH-06 logging out clears the saved user', async ({ adminPage }) => {
  const dashboard = new AdminDashboardPage(adminPage);

  await dashboard.goto();
  await dashboard.logoutButton.click();

  await expect(adminPage).toHaveURL(/\/login$/);
  const stored = await adminPage.evaluate(() => localStorage.getItem('user'));
  expect(stored).toBeNull();
});

test('AUTH-07 the session survives a page reload', async ({ adminPage }) => {
  const dashboard = new AdminDashboardPage(adminPage);

  await dashboard.goto();
  await adminPage.reload();

  await expect(adminPage).toHaveURL(/\/admindashboard$/);
  await expect(dashboard.welcomeText).toHaveText('Welcome, e2e_admin (Admin)');
});