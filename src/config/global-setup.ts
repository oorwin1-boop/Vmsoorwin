import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig): Promise<void> {
  const requiredDirs = [
    'playwright/.auth',
    'test-results/screenshots',
    'test-results/logs',
    'test-results/traces',
    'allure-results',
  ];

  for (const dir of requiredDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  const env = process.env.TEST_ENV || 'development';
  const baseURL = process.env.BASE_URL || config.projects[0]?.use?.baseURL || 'unknown';

  console.log('\n========================================');
  console.log('  Oorwin AI - Playwright Test Framework');
  console.log('========================================');
  console.log(`  Environment : ${env}`);
  console.log(`  Base URL    : ${baseURL}`);
  console.log(`  Workers     : ${config.workers}`);
  console.log('========================================\n');
}

export default globalSetup;
