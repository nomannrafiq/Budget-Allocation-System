const { test: setup, expect } = require('@playwright/test');

const API = 'http://localhost:3001/api';

// Three accounts. The second member is needed later, for the tests that check
// you cannot edit someone else's proposal or vote on your own.

// Making an admin this way only works because the register endpoint lets you pick any role you like. That is bug 01. Once it is fixed, 
// add the admin straight to the database instead.
const users = [
  { username: 'e2e_admin', password: 'Passw0rd!', role: 'admin' },
  { username: 'e2e_member', password: 'Passw0rd!', role: 'member' },
  { username: 'e2e_member2', password: 'Passw0rd!', role: 'member' },
];

setup('seed baseline users', async ({ request }) => {
  for (const user of users) {
    const res = await request.post(`${API}/auth/register`, { data: user });
    expect(res.status(), `registering ${user.username}`).toBe(201);
  }
});