import { Page } from '@playwright/test';
import { CommonPage } from './CommonPage';
import { checkoutSelectors } from '../selectors/checkout.selectors';
import { logger } from '../utils/logger';

export class CheckoutPage extends CommonPage {
  constructor(page: Page) {
    super(page);
  }

  async placeOrder(): Promise<void> {
    await this.clickAndRetry(
      'Place Order',
      checkoutSelectors.placeOrderButton,
      (timeout) => this.page.waitForURL('**/payment', { timeout }),
      30000,
      60000,
      { force: true }
    );
  }

  async fillPaymentDetails(details: { name: string; cardNumber: string; cvc: string; month: string; year: string; }): Promise<void> {
    await logger.log(`Filling payment details for ${details.name}.`);
    await this.page.fill(checkoutSelectors.nameOnCardInput, details.name);
    await this.page.fill(checkoutSelectors.cardNumberInput, details.cardNumber);
    await this.page.fill(checkoutSelectors.cvcInput, details.cvc);
    await this.page.fill(checkoutSelectors.expiryMonthInput, details.month);
    await this.page.fill(checkoutSelectors.expiryYearInput, details.year);
  }

  async payAndConfirm(): Promise<void> {
    await this.clickAndRetry(
      'Pay and Confirm',
      checkoutSelectors.payAndConfirmButton,
      (timeout) => this.page.waitForSelector(checkoutSelectors.orderSuccessContinueButton, { timeout }),
      30000,
      60000,
      { force: true }
    );
  }

  async continueToHome(): Promise<void> {
    await this.clickAndRetry(
      'Continue to Home',
      checkoutSelectors.orderSuccessContinueButton,
      (timeout) => this.page.waitForURL('https://automationexercise.com/', { timeout }),
      30000,
      60000,
      { force: true }
    );
  }
}
