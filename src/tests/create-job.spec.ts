import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { DashboardPage } from '../pages/DashboardPage';
import { JobsPage } from '../pages/JobsPage';
import { AddJobPage } from '../pages/AddJobPage';
import type { JobFormData } from '../pages/AddJobPage';

function buildJobData(): JobFormData {
  return {
    title: `${faker.person.jobTitle()} - ${faker.string.alphanumeric(5).toUpperCase()}`,
    description: faker.lorem.paragraphs(2),
    location: 'New York',
    state: faker.location.state(),
    minRange: '50',
    maxRange: '100',
    minExperience: '2',
    maxExperience: '5',
    skills: [faker.hacker.noun(), faker.hacker.noun()],
    noOfPositions: String(faker.number.int({ min: 1, max: 5 })),
  };
}

async function navigateToJobsViaSidebar(page: import('@playwright/test').Page): Promise<void> {
  const recruitLink = page.locator('.menu-item', { hasText: 'Recruit' });
  await recruitLink.waitFor({ state: 'visible', timeout: 15_000 });
  await recruitLink.click();

  await page.getByText('Requisitions').first().waitFor({ state: 'visible', timeout: 10_000 });
  await page.getByText('Jobs').first().click();
}

test.describe('Jobs — Create via Manual Entry @smoke @regression', () => {
  let dashboard: DashboardPage;
  let jobsPage: JobsPage;
  let addJobPage: AddJobPage;
  let jobData: JobFormData;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    jobsPage = new JobsPage(page);
    addJobPage = new AddJobPage(page);
    jobData = buildJobData();

    await page.goto('https://oorwinlabs.beanhiredev.com/#/hire/dashboard');
    await expect(page).toHaveURL(/oorwinlabs\.beanhiredev\.com\/#\/hire\/dashboard/, {
      timeout: 20_000,
    });
    await expect(dashboard.navigationMenu).toBeVisible();
  });

  test('creates a new job via manual entry and verifies it in the list', async ({ page }) => {
    await navigateToJobsViaSidebar(page);
    await jobsPage.waitForListLoaded();

    await jobsPage.clickAddJob();
    await addJobPage.selectManual();
    await addJobPage.fillForm(jobData);
    await addJobPage.saveJob();

    const toastText = await addJobPage.waitForSuccessToast();
    expect(toastText).toMatch(/success|created|saved/i);

    const backOnList = await page
      .waitForURL(/\/hire\/job/, { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!backOnList) {
      await jobsPage.gotoJobsList();
    }

    await jobsPage.searchForJob(jobData.title);
    await jobsPage.assertJobInList(jobData.title);
  });

  test('navigates to Jobs module via Recruit sidebar menu @sanity', async ({ page }) => {
    await navigateToJobsViaSidebar(page);
    await expect(jobsPage.addJobButton).toBeVisible({ timeout: 15_000 });
  });

  test('shows Add Job button on the Jobs list page @sanity', async () => {
    await jobsPage.gotoJobsList();
    await expect(jobsPage.addJobButton).toBeVisible();
    await expect(jobsPage.addJobButton).toBeEnabled();
  });
});

test.describe('Jobs — gotoJobsList helper @regression', () => {
  test('loads Jobs list via gotoJobsList helper', async ({ page }) => {
    const jobsPage = new JobsPage(page);
    await jobsPage.gotoJobsList();
    await expect(jobsPage.addJobButton).toBeVisible();
  });

  test('creates job via gotoJobsList helper and verifies creation @regression', async ({
    page,
  }) => {
    const jobsPage = new JobsPage(page);
    const addJobPage = new AddJobPage(page);
    const jobData = buildJobData();

    await jobsPage.gotoJobsList();
    await jobsPage.clickAddJob();
    await addJobPage.selectManual();
    await addJobPage.fillForm(jobData);
    await addJobPage.saveJob();

    const toastText = await addJobPage.waitForSuccessToast();
    expect(toastText).toMatch(/success|created|saved/i);

    const backOnList = await page
      .waitForURL(/\/hire\/job/, { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!backOnList) await jobsPage.gotoJobsList();

    await jobsPage.searchForJob(jobData.title);
    await jobsPage.assertJobInList(jobData.title);
  });
});
