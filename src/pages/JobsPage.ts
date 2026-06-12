import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class JobsPage extends BasePage {
  readonly addJobButton: Locator;
  readonly searchInput: Locator;
  readonly jobListContainer: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);

    this.addJobButton = page.getByRole('button', { name: /add job/i });

    this.searchInput = page
      .locator('input[placeholder*="Search" i], input[placeholder*="search" i]')
      .first();

    this.jobListContainer = page.locator(
      'mat-table, .jobs-list, .job-list-container, table[class*="job"]',
    );

    this.successToast = page.locator('mat-snack-bar-container');
  }

  async gotoJobsList(): Promise<void> {
    await this.navigate('/#/hire/dashboard');
    await this.waitForElement(this.page.locator('.aside-menu-items'));

    await this.click(this.page.locator('.menu-item', { hasText: 'Recruit' }));

    await this.page.getByText('Requisitions').first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.getByText('Jobs').first().click();

    await this.waitForElement(this.addJobButton);
  }

  async clickAddJob(): Promise<void> {
    await this.click(this.addJobButton);
  }

  async searchForJob(title: string): Promise<void> {
    const listSearch = this.page
      .locator('input:not([readonly]):not([type="hidden"])')
      .filter({ hasText: '' })
      .first();

    const searchTargets = [
      this.page.locator('input[placeholder*="Job" i]').first(),
      this.page.locator('input[placeholder*="Search" i]:not([readonly])').first(),
      listSearch,
    ];

    let filled = false;
    for (const target of searchTargets) {
      if (await target.count() > 0 && !(await target.evaluate((el: HTMLInputElement) => el.readOnly))) {
        await target.scrollIntoViewIfNeeded();
        await target.fill(title);
        await this.page.keyboard.press('Enter');
        filled = true;
        break;
      }
    }

    if (!filled) {
      // Search input not found — just wait and the job should appear in the list
    }
    await this.page.waitForTimeout(2_000);
  }

  async getJobRowByTitle(title: string): Promise<Locator> {
    return this.page.locator('mat-row, tr, .job-item, .job-card', { hasText: title }).first();
  }

  async isJobVisible(title: string): Promise<boolean> {
    const row = await this.getJobRowByTitle(title);
    return row.isVisible();
  }

  async waitForListLoaded(): Promise<void> {
    await this.waitForElement(this.addJobButton);
  }

  async assertJobInList(title: string): Promise<void> {
    const row = await this.getJobRowByTitle(title);
    await expect(row).toBeVisible({ timeout: 15_000 });
  }
}
