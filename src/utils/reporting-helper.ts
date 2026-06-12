import { TestInfo } from '@playwright/test';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

export class ReportingHelper {
  private readonly testInfo: TestInfo;

  constructor(testInfo: TestInfo) {
    this.testInfo = testInfo;
  }

  async attachScreenshot(name: string, screenshot: Buffer): Promise<void> {
    await this.testInfo.attach(name, {
      body: screenshot,
      contentType: 'image/png',
    });
    logger.info(`Screenshot attached: ${name}`);
  }

  async attachText(name: string, content: string): Promise<void> {
    await this.testInfo.attach(name, {
      body: content,
      contentType: 'text/plain',
    });
  }

  async attachJSON(name: string, data: unknown): Promise<void> {
    await this.testInfo.attach(name, {
      body: JSON.stringify(data, null, 2),
      contentType: 'application/json',
    });
  }

  async attachFile(name: string, filePath: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found for attachment: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.html': 'text/html',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    await this.testInfo.attach(name, { body: content, contentType });
  }

  addAnnotation(type: 'issue' | 'note' | string, description: string): void {
    this.testInfo.annotations.push({ type, description });
    logger.info(`Annotation: [${type}] ${description}`);
  }

  logStep(stepDescription: string): void {
    logger.info(`[${this.testInfo.title}] ${stepDescription}`);
  }

  isTestFailed(): boolean {
    return this.testInfo.status === 'failed';
  }

  getTestStatus(): string {
    return this.testInfo.status ?? 'unknown';
  }

  getDuration(): number {
    return this.testInfo.duration;
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}
