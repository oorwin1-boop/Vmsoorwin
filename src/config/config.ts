import * as dotenv from 'dotenv';
import * as path from 'path';
import { getEnvironmentConfig, EnvironmentConfig, Environment } from './environments';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface TestConfig {
  environment: Environment;
  envConfig: EnvironmentConfig;
  credentials: {
    testUser: { email: string; password: string };
    adminUser: { email: string; password: string };
    recruiterUser: { email: string; password: string };
    hiringManagerUser: { email: string; password: string };
  };
  timeouts: {
    default: number;
    navigation: number;
    element: number;
    api: number;
  };
  paths: {
    screenshots: string;
    videos: string;
    traces: string;
    reports: string;
    authState: string;
  };
}

function buildConfig(): TestConfig {
  const environment = (process.env.TEST_ENV || 'development') as Environment;
  const envConfig = getEnvironmentConfig();
  // Override baseURL from .env if explicitly set
  if (process.env.BASE_URL) envConfig.baseURL = process.env.BASE_URL;

  return {
    environment,
    envConfig,
    credentials: {
      testUser: {
        email: process.env.TEST_USER_EMAIL || 'pavant+ui@oorwin.com',
        password: process.env.TEST_USER_PASSWORD || 'Oorwin@3214',
      },
      adminUser: {
        email: process.env.ADMIN_EMAIL || 'pavant+ui@oorwin.com',
        password: process.env.ADMIN_PASSWORD || 'Oorwin@3214',
      },
      recruiterUser: {
        email: process.env.RECRUITER_EMAIL || 'pavant+ui@oorwin.com',
        password: process.env.RECRUITER_PASSWORD || 'Oorwin@3214',
      },
      hiringManagerUser: {
        email: process.env.HIRING_MANAGER_EMAIL || 'pavant+ui@oorwin.com',
        password: process.env.HIRING_MANAGER_PASSWORD || 'Oorwin@3214',
      },
    },
    timeouts: {
      default: envConfig.timeout,
      navigation: 30_000,
      element: 15_000,
      api: 20_000,
    },
    paths: {
      screenshots: 'test-results/screenshots',
      videos: 'test-results/videos',
      traces: 'test-results/traces',
      reports: 'playwright-report',
      authState: 'playwright/.auth/user-chromium.json',
    },
  };
}

export const config = buildConfig();
