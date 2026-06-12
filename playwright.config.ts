import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env, then fall back to base .env
const env = process.env.TEST_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL || 'https://oorwinlabs.beanhiredev.com';

export default defineConfig({
  testDir: './src/tests',
  outputDir: './test-results',

  /* Timeouts */
  timeout: 120_000,
  expect: { timeout: 15_000 },

  /* Parallel execution */
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,

  /* Retry flaky tests in CI */
  retries: process.env.CI ? 2 : 0,

  /* Reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github'] as ['github']] : []),
  ],

  use: {
    baseURL: BASE_URL,

    /* Capture artifacts only on failure to reduce storage */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    /* Per-action timeouts */
    navigationTimeout: 45_000,
    actionTimeout: 20_000,

    /* Viewport */
    viewport: { width: 1280, height: 720 },

    /* Skip TLS errors in non-prod environments */
    ignoreHTTPSErrors: env !== 'production',

    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  globalSetup: require.resolve('./src/config/global-setup'),
  globalTeardown: require.resolve('./src/config/global-teardown'),

  projects: [
    /* Per-browser auth setup — each browser saves its own session file */
    {
      name: 'setup-chromium',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup-firefox',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'setup-webkit',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Safari'] },
    },

    /* Desktop browsers — each depends on and reuses its own auth session */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user-chromium.json',
      },
      dependencies: ['setup-chromium'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user-firefox.json',
      },
      dependencies: ['setup-firefox'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user-webkit.json',
      },
      dependencies: ['setup-webkit'],
    },

    /* Mobile browsers */
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/user-chromium.json',
      },
      dependencies: ['setup-chromium'],
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        storageState: 'playwright/.auth/user-webkit.json',
      },
      dependencies: ['setup-webkit'],
    },
  ],
});
