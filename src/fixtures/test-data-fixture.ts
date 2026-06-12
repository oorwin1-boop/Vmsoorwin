import { test as base } from '@playwright/test';
import { DataGenerator, UserData, JobPostingData } from '../utils/data-generator';

export type TestDataFixtures = {
  testUser: UserData;
  testJob: JobPostingData;
  uniqueEmail: string;
  timestamp: number;
};

export const testDataTest = base.extend<TestDataFixtures>({
  testUser: async ({}, use) => {
    await use(DataGenerator.generateUser('testmail.com'));
  },

  testJob: async ({}, use) => {
    await use(DataGenerator.generateJobPosting());
  },

  uniqueEmail: async ({}, use) => {
    await use(DataGenerator.generateEmail('testmail.com'));
  },

  timestamp: async ({}, use) => {
    await use(Date.now());
  },
});
