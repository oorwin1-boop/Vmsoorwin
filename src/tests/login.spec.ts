import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { invalidCredentials } from '../data/test-data';

test.describe('Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate('/#/auth/login');
  });

  test.describe('Positive @smoke @regression', () => {
    test('logs in with valid credentials and leaves login page', async ({ page }) => {
      await loginPage.login(
        process.env.TEST_USER_EMAIL!,
        process.env.TEST_USER_PASSWORD!
      );

      await expect(page).toHaveURL(/oorwinlabs\.beanhiredev\.com\/#\/hire\/dashboard/, { timeout: 20_000 });
      const dashboard = new DashboardPage(page);
      await expect(dashboard.mySummaryWidget).toBeVisible();
    });

    test('session persists after page reload @sanity', async ({ page }) => {
      await loginPage.login(
        process.env.TEST_USER_EMAIL!,
        process.env.TEST_USER_PASSWORD!
      );

      await expect(page).toHaveURL(/oorwinlabs\.beanhiredev\.com\/#\/hire\/dashboard/, { timeout: 20_000 });
      await page.reload();
      await expect(page).toHaveURL(/oorwinlabs\.beanhiredev\.com\/#\/hire\/dashboard/, { timeout: 20_000 });
    });
  });

  test.describe('Negative @regression', () => {
    test('shows snackbar error for wrong password', async () => {
      await loginPage.login(process.env.TEST_USER_EMAIL!, 'WrongPassword123!');

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(
        /invalid|not have a valid user account|credentials/i
      );
    });

    test('shows snackbar error for non-existent email', async () => {
      await loginPage.login('nobody@example.com', 'Password123!');

      await expect(loginPage.errorMessage).toBeVisible();
    });

    test('shows mat-error when email is empty', async () => {
      await loginPage.submitForm();

      await expect(loginPage.emailValidationError).toBeVisible();
    });

    test('shows mat-error when password is empty', async () => {
      await loginPage.fillEmail(process.env.TEST_USER_EMAIL!);
      await loginPage.submitForm();

      await expect(loginPage.passwordValidationError).toBeVisible();
    });

    test('shows mat-error for malformed email', async () => {
      await loginPage.fillEmail('not-a-valid-email');
      await loginPage.submitForm();

      await expect(loginPage.emailValidationError).toBeVisible();
    });
  });

  test.describe('Invalid credentials matrix @regression', () => {
    for (const { email, password, description } of invalidCredentials) {
      test(`rejects: ${description}`, async () => {
        test.skip(!email && !password, 'Covered by empty-field validation tests');

        await loginPage.login(email, password);
        await expect(loginPage.errorMessage.or(loginPage.emailValidationError)).toBeVisible();
      });
    }
  });

  test.describe('Navigation @regression', () => {
    test('navigates to Forgot Password page', async ({ page }) => {
      await loginPage.clickForgotPassword();
      await expect(page).toHaveURL(/\/#\/auth\/forgot-password/);
    });

    test('navigates to Sign Up page', async ({ page }) => {
      await loginPage.clickSignUp();
      await expect(page).toHaveURL(/\/#\/signup/);
    });
  });

  test.describe('Role-based login @regression', () => {
    const roles = [
      { role: 'admin',          emailEnv: 'ADMIN_EMAIL',          passEnv: 'ADMIN_PASSWORD' },
      { role: 'recruiter',      emailEnv: 'RECRUITER_EMAIL',      passEnv: 'RECRUITER_PASSWORD' },
      { role: 'hiring manager', emailEnv: 'HIRING_MANAGER_EMAIL', passEnv: 'HIRING_MANAGER_PASSWORD' },
    ] as const;

    for (const { role, emailEnv, passEnv } of roles) {
      test(`logs in as ${role}`, async ({ page }) => {
        const email = process.env[emailEnv];
        const password = process.env[passEnv];
        test.skip(!email || !password, `${role} credentials not configured`);

        await loginPage.login(email!, password!);
        await expect(page).toHaveURL(/oorwinlabs\.beanhiredev\.com\/#\/hire\/dashboard/, { timeout: 20_000 });
      });
    }
  });
});
