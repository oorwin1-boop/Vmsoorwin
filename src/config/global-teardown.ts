import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('\n[Global Teardown] Test run complete. Artifacts saved to test-results/ and playwright-report/');
}

export default globalTeardown;
