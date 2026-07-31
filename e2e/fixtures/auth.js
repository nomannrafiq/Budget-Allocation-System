const path = require('node:path');
const base = require('@playwright/test');

const AUTH_DIR = path.join(__dirname, '..', '.auth');

// Gives tests a page that is already logged in as admin or as a member.
// baseURL has to be passed in by hand here, because a context made this way does not pick up the settings from the config file.
const test = base.test.extend({
  adminPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({
      baseURL,
      storageState: path.join(AUTH_DIR, 'admin.json'),
    });
    await use(await context.newPage());
    await context.close();
  },

  memberPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({
      baseURL,
      storageState: path.join(AUTH_DIR, 'member.json'),
    });
    await use(await context.newPage());
    await context.close();
  },
});

module.exports = { test, expect: base.expect };