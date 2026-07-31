const path = require('node:path');
const { test: setup, expect } = require('@playwright/test');

const API = process.env.API_URL || 'http://localhost:3001/api';

module.exports = { API };
const AUTH_DIR = path.join(__dirname, '..', '.auth');

// Three accounts. The second member is needed later, for the tests that check you cannot edit someone else's proposal or vote on your own.
// Making an admin this way only works because the register endpoint lets you pick any role you like.
const users = [
  { username: 'e2e_admin', password: 'Passw0rd!', role: 'admin' },
  { username: 'e2e_member', password: 'Passw0rd!', role: 'member' },
  { username: 'e2e_member2', password: 'Passw0rd!', role: 'member' },
];

setup('create the accounts', async ({ request }) => {
  for (const user of users) {
    const res = await request.post(`${API}/auth/register`, { data: user });
    expect(res.status(), `registering ${user.username}`).toBe(201);
  }
});

// This app keeps the logged in user in localStorage, not in a cookie. So we log in through the API, put the same user 
// object into localStorage by hand, and save it. Every later test starts already logged in instead of filling the form.
async function saveLogin(page, request, username, file) {
  const res = await request.post(`${API}/auth/login`, {
    data: { username, password: 'Passw0rd!' },
  });
  expect(res.ok(), `logging in as ${username}`).toBeTruthy();
  const { user } = await res.json();

  // We have to be on the site before localStorage can be written to.
  await page.goto('/login');
  await page.evaluate((u) => localStorage.setItem('user', JSON.stringify(u)), user);

  await page.context().storageState({ path: file });
}

setup('save the admin login', async ({ page, request }) => {
  await saveLogin(page, request, 'e2e_admin', path.join(AUTH_DIR, 'admin.json'));
});

setup('save the member login', async ({ page, request }) => {
  await saveLogin(page, request, 'e2e_member', path.join(AUTH_DIR, 'member.json'));
});