import { mergeTests } from '@playwright/test';
import { authenticatedTest } from './authenticated-fixture';
import { testDataTest } from './test-data-fixture';

export const test = mergeTests(authenticatedTest, testDataTest);
export { expect } from '@playwright/test';

export type { AuthenticatedFixtures } from './authenticated-fixture';
export type { TestDataFixtures } from './test-data-fixture';
