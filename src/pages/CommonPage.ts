import { Page } from '@playwright/test';
import { logger } from '../utils/logger';

export class CommonPage {
  constructor(protected page: Page) {}

  async goToCart(): Promise<void> {
    await this.clickAndRetry(
      'Clicking "Cart" navigation',
      '.shop-menu a[href="/view_cart"]',
      (timeout) => this.page.waitForSelector('#cart_info', { state: 'visible', timeout }),
      45000,
      90000,
      { force: true }
    );
  }

  /**
   * Helper to perform a click and wait action with retry logic.
   * Attempt 1: Click and wait with firstTimeout (30s).
   * Attempt 2: If failed, Click again and wait with secondTimeout (180s).
   */
  async clickAndRetry(
    actionDescription: string,
    selector: string,
    waitFunction: (timeout: number) => Promise<any>,
    firstTimeout = 30000,
    secondTimeout = 60000,
    clickOptions?: Parameters<Page['click']>[1]
  ): Promise<void> {
    await logger.log(`Starting Action: ${actionDescription}`);
    try {
      await logger.log(`Attempt 1 (Timeout: ${firstTimeout}ms)...`);
      await this.page.click(selector, { timeout: 10000, ...clickOptions }); // Click usually is fast
      await waitFunction(firstTimeout);
    } catch (error) {
      await logger.log(`Attempt 1 failed. Retrying with longer timeout (${secondTimeout}ms)...`);
      // Retry the click as per instruction, but safely
      try {
        await this.page.click(selector, { timeout: 10000, ...clickOptions });
      } catch (retryClickError) {
        await logger.log(`Retry click failed (likely already navigating or processing). Proceeding to wait. Error: ${retryClickError}`);
      }
      await waitFunction(secondTimeout);
    }
    await logger.log(`Action Completed: ${actionDescription}`);
  }
}
