import { test as setup, expect } from '@playwright/test';
import { config } from '../config/config';
import * as fs from 'fs';
import * as path from 'path';

setup('authenticate', async ({ page }, testInfo) => {
  const browser = testInfo.project.name.replace('setup-', '');
  const authFile = `playwright/.auth/user-${browser}.json`;

  const loginOrigin = process.env.LOGIN_URL || 'https://app.beanhiredev.com';
  await page.goto(`${loginOrigin}/#/auth/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.locator('[formcontrolname="email"]').fill(config.credentials.testUser.email);
  await page.locator('[formcontrolname="password"]').fill(config.credentials.testUser.password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/oorwinlabs\.beanhiredev\.com\/#\/hire\/dashboard/, { timeout: 30_000 });

  const dir = path.dirname(path.resolve(authFile));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.context().storageState({ path: authFile });
  console.log(`[auth.setup] Authenticated as ${config.credentials.testUser.email}`);
  console.log(`[auth.setup] Storage state saved to: ${authFile}`);
});
