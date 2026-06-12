export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  baseURL: string;
  apiBaseURL: string;
  timeout: number;
  retries: number;
}

export const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    baseURL: 'https://oorwinlabs.beanhiredev.com',
    apiBaseURL: 'https://api.beanhiredev.com',
    timeout: 30_000,
    retries: 1,
  },
  staging: {
    baseURL: 'https://oorwinlabs.beanhiredev.com',
    apiBaseURL: 'https://api.beanhiredev.com',
    timeout: 45_000,
    retries: 2,
  },
  production: {
    baseURL: 'https://oorwinlabs.beanhiredev.com',
    apiBaseURL: 'https://api.beanhiredev.com',
    timeout: 60_000,
    retries: 3,
  },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = (process.env.TEST_ENV || 'development') as Environment;
  const config = environments[env];
  if (!config) {
    throw new Error(`Unknown environment: "${env}". Valid values: ${Object.keys(environments).join(', ')}`);
  }
  return config;
}
