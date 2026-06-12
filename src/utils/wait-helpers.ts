import { Page, Locator, expect } from '@playwright/test';
import { logger } from './logger';

export class WaitHelpers {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForNetworkIdle(timeout = 30_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async waitForDOMReady(timeout = 30_000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  async waitForURL(urlPattern: string | RegExp, timeout = 30_000): Promise<void> {
    logger.debug(`Waiting for URL: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  async waitForVisible(locator: Locator, timeout = 30_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForHidden(locator: Locator, timeout = 30_000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  async waitForEnabled(locator: Locator, timeout = 30_000): Promise<void> {
    await expect(locator).toBeEnabled({ timeout });
  }

  async waitForText(locator: Locator, text: string, timeout = 30_000): Promise<void> {
    await expect(locator).toContainText(text, { timeout });
  }

  async waitForCount(locator: Locator, count: number, timeout = 30_000): Promise<void> {
    await expect(locator).toHaveCount(count, { timeout });
  }

  async waitForAPIResponse(urlPattern: string | RegExp, timeout = 30_000): Promise<void> {
    await this.page.waitForResponse(urlPattern, { timeout });
  }

  async waitForToastToDisappear(toastLocator: Locator, timeout = 10_000): Promise<void> {
    if (await toastLocator.isVisible()) {
      await toastLocator.waitFor({ state: 'hidden', timeout });
    }
  }

  async waitForCondition(
    condition: () => Promise<boolean>,
    timeout = 30_000,
    interval = 500
  ): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await condition()) return;
      await this.page.waitForTimeout(interval);
    }
    throw new Error(`Custom condition not met within ${timeout}ms`);
  }
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError!: Error;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err as Error;
      logger.warn(`Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
      }
    }
  }
  throw lastError;
}
