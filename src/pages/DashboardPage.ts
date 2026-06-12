import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly navigationMenu: Locator;
  readonly dashboardsMenuLink: Locator;
  readonly recruitMenuLink: Locator;
  readonly salesMenuLink: Locator;
  readonly reportsMenuLink: Locator;
  readonly settingsMenuLink: Locator;
  readonly hrMenuLink: Locator;

  readonly searchBar: Locator;
  readonly advancedSearchButton: Locator;
  readonly notificationBell: Locator;
  readonly userProfileButton: Locator;

  readonly mySummaryWidget: Locator;
  readonly dashboardStats: Locator;
  readonly addWidgetButton: Locator;

  readonly myRecruitmentTab: Locator;
  readonly executiveDashboardTab: Locator;

  constructor(page: Page) {
    super(page);

    this.navigationMenu       = page.locator('.aside-menu-items');
    this.dashboardsMenuLink   = page.locator('.menu-item', { hasText: 'Dashboards' });
    this.recruitMenuLink      = page.locator('.menu-item', { hasText: 'Recruit' });
    this.salesMenuLink        = page.locator('.menu-item', { hasText: 'Sales' });
    this.reportsMenuLink      = page.locator('.menu-item', { hasText: 'Reports' });
    this.settingsMenuLink     = page.locator('.menu-item', { hasText: 'Settings' });
    this.hrMenuLink           = page.locator('.menu-item', { hasText: 'HR' });

    this.searchBar            = page.getByPlaceholder('Search...');
    this.advancedSearchButton = page.getByRole('link', { name: 'Advanced Search' });
    this.notificationBell     = page.locator('a.mdc-icon-button', { hasText: 'notifications' });
    this.userProfileButton    = page.locator('div[class*="avatar-wrap"]');

    this.mySummaryWidget  = page.locator('h1.widget-dashboard-title', { hasText: 'My Summary' });
    this.dashboardStats   = page.locator('h1.widget-dashboard-title').first();
    this.addWidgetButton  = page.getByRole('button', { name: /Add Widget/i });

    this.myRecruitmentTab      = page.locator('a[href="#/hire/dashboard"]');
    this.executiveDashboardTab = page.locator('a[href="#/hire/executiveDashboard"]');
  }

  async waitForDashboardReady(): Promise<void> {
    await this.waitForElement(this.navigationMenu);
    await this.waitForElement(this.mySummaryWidget);
  }

  async navigateToRecruit(): Promise<void> {
    await this.click(this.recruitMenuLink);
    await this.waitForNavigation(/\/#\/hire\//);
  }

  async navigateToReports(): Promise<void> {
    await this.click(this.reportsMenuLink);
    await this.waitForNavigation(/\/#\/(reports|hire\/report)/i);
  }

  async navigateToSettings(): Promise<void> {
    await this.click(this.settingsMenuLink);
    await this.waitForNavigation(/\/#\/(settings|admin)/i);
  }

  async search(query: string): Promise<void> {
    await this.fill(this.searchBar, query);
    await this.pressKey('Enter');
  }

  async logout(): Promise<void> {
    await this.click(this.userProfileButton);
    const logoutOption = this.page.locator('button, a', { hasText: /logout|sign out/i });
    await this.waitForElement(logoutOption);
    await this.click(logoutOption);
    await this.waitForNavigation(/app\.beanhiredev\.com\/#\/auth\/login/);
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.page.locator('[class*="badge"], [class*="count"]').first();
    if (!(await badge.isVisible())) return 0;
    return parseInt(await badge.innerText(), 10) || 0;
  }

  async isDashboardLoaded(): Promise<boolean> {
    return (
      (await this.isVisible(this.navigationMenu)) &&
      (await this.isVisible(this.mySummaryWidget))
    );
  }
}
