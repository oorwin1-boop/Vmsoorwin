import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { ReportingHelper } from '../utils/reporting-helper';

test.describe('Dashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.navigate('/#/hire/dashboard');
    await dashboard.waitForDashboardReady();
  });

  test.describe('Page Load @smoke @sanity', () => {
    test('dashboard is fully loaded', async ({ page }) => {
      await expect(page).toHaveURL(/oorwinlabs\.beanhiredev\.com\/#\/hire\/dashboard/);
      expect(await dashboard.isDashboardLoaded()).toBe(true);
    });

    test('page title is correct', async ({ page }) => {
      await expect(page).toHaveTitle(/Dashboard/i);
    });

    test('My Summary widget is visible', async () => {
      await expect(dashboard.mySummaryWidget).toBeVisible();
    });

    test('Add Widget button is visible', async () => {
      await expect(dashboard.addWidgetButton).toBeVisible();
    });
  });

  test.describe('Sidebar Navigation @smoke @regression', () => {
    test('navigation menu is visible', async () => {
      await expect(dashboard.navigationMenu).toBeVisible();
    });

    test('all primary sidebar links are present', async () => {
      await expect(dashboard.recruitMenuLink).toBeVisible();
      await expect(dashboard.reportsMenuLink).toBeVisible();
      await expect(dashboard.settingsMenuLink).toBeVisible();
    });

    test('navigates to Recruit section', async ({ page }) => {
      await dashboard.navigateToRecruit();
      await expect(page).toHaveURL(/\/#\/hire\//);
    });
  });

  test.describe('Toolbar @smoke', () => {
    test('search bar is visible and enabled', async () => {
      await expect(dashboard.searchBar).toBeVisible();
      await expect(dashboard.searchBar).toBeEnabled();
    });

    test('Advanced Search button is visible', async () => {
      await expect(dashboard.advancedSearchButton).toBeVisible();
    });

    test('notification bell is visible', async () => {
      await expect(dashboard.notificationBell).toBeVisible();
    });

    test('user profile button is visible', async () => {
      await expect(dashboard.userProfileButton).toBeVisible();
    });
  });

  test.describe('Dashboard Tabs @regression', () => {
    test('MY RECRUITMENT tab is active by default', async () => {
      await expect(dashboard.myRecruitmentTab).toBeVisible();
      const classes = await dashboard.myRecruitmentTab.getAttribute('class');
      expect(classes).toContain('mdc-tab-indicator--active');
    });

    test('EXECUTIVE DASHBOARD tab is visible', async () => {
      await expect(dashboard.executiveDashboardTab).toBeVisible();
    });

    test('switches to Executive Dashboard tab', async ({ page }) => {
      await dashboard.click(dashboard.executiveDashboardTab);
      await expect(page).toHaveURL(/executiveDashboard/);
    });
  });

  test.describe('Search @regression', () => {
    test('typing in search bar works', async () => {
      await dashboard.fill(dashboard.searchBar, 'Software Engineer');
      await expect(dashboard.searchBar).toHaveValue('Software Engineer');
    });
  });

  test('captures full dashboard screenshot @smoke', async ({ page }, testInfo) => {
    const reporter = new ReportingHelper(testInfo);
    const screenshot = await dashboard.takeScreenshot('dashboard-full');
    await reporter.attachScreenshot('Dashboard - Full Page', screenshot);
    reporter.addAnnotation('note', `URL: ${page.url()}`);
  });
});
