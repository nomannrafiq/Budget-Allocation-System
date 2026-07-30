const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  // One test at a time. The app has a single budget and a single phase,
  // so tests running together would change each other's data.
  workers: 1,
  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  // Retry on the build server only. On my machine a failure should stay a failure.
  retries: process.env.CI ? 2 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Runs first and creates the accounts the other tests log in with.
    { name: 'seed', testMatch: /seed\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['seed'],
    },
  ],

  webServer: [
    {
      // Clear the old database first, then start the API. This has to happen before the server opens the file.
      command: 'node ../e2e/scripts/reset-db.mjs && npm start',
      cwd: '../server',
      url: 'http://localhost:3001/api/health',
      env: { DB_FILE: 'budget.test.db' },

      // Never reuse a server that is already running. It would be holding the old database and the tests would pass for the wrong reason.
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev',
      cwd: '../client',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});