import { Page } from '@playwright/test';
import { CommonPage } from './CommonPage';
import { authSelectors } from '../selectors/auth.selectors';
import { logger } from '../utils/logger';

export class AuthPage extends CommonPage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await logger.log('Navigate to Login Page (using goto for robustness)');
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.page.locator(authSelectors.loginEmailInput).waitFor({ state: 'visible' });
  }

  async login(email: string, pass: string): Promise<void> {
    await logger.log(`Logging in with email: ${email}`);
    await this.page.fill(authSelectors.loginEmailInput, email);
    await this.page.fill(authSelectors.loginPasswordInput, pass);
    
    await this.clickAndRetry(
      'Click Login Button',
      authSelectors.loginButton,
      (timeout) => this.page.waitForSelector('li a:has-text("Logged in as")', { state: 'visible', timeout }),
      30000,
      60000,
      { force: true }
    );
  }
}
