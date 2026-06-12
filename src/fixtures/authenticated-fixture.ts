import { test as base, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export type AuthenticatedFixtures = {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
};

export const authenticatedTest = base.extend<AuthenticatedFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await loginPage.login(
      config.credentials.testUser.email,
      config.credentials.testUser.password
    );

    logger.info('Fixture: browser context authenticated');

    await use(context);
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
    await page.close();
  },
});
