import { test as base } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

// Declare the types of your fixtures.
type MyFixtures = {
  authPage: AuthPage;
};

// Extend the base test type with your fixtures.
export const test = base.extend<MyFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await authPage.navigate();
    await authPage.login('xxyuxdzed@gmail.com', '0xX1yu1XD6');
    await use(authPage);
  },
});
