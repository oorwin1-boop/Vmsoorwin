import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly errorMessage: Locator;
  readonly emailValidationError: Locator;
  readonly passwordValidationError: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput    = page.locator('[formcontrolname="email"]');
    this.passwordInput = page.locator('[formcontrolname="password"]');
    this.submitButton  = page.locator('button[type="submit"]');

    this.forgotPasswordLink = page.locator('a', { hasText: 'Forgot Password?' });
    this.signUpLink         = page.locator('a[href="#/signup"]');

    this.errorMessage = page.locator('mat-snack-bar-container');

    this.emailValidationError    = page.locator('mat-form-field:has([formcontrolname="email"]) mat-error');
    this.passwordValidationError = page.locator('mat-form-field:has([formcontrolname="password"]) mat-error');

    this.pageHeading = page.getByRole('heading', { name: 'Sign In' });
  }

  async fillEmail(email: string): Promise<void> {
    await this.fill(this.emailInput, email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  async submitForm(): Promise<void> {
    await this.click(this.submitButton);
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitForm();
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  async clickSignUp(): Promise<void> {
    await this.click(this.signUpLink);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isLoginFormVisible(): Promise<boolean> {
    return (
      (await this.isVisible(this.emailInput)) &&
      (await this.isVisible(this.passwordInput)) &&
      (await this.isVisible(this.submitButton))
    );
  }

  async gotoLoginPage(): Promise<void> {
    await this.navigate('/#/auth/login');
  }
}
