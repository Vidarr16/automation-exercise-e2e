import { Page, expect } from '@playwright/test';
import { CommonPage } from './CommonPage';
import { cartSelectors } from '../selectors/cart.selectors';
import { Product } from '../models/product';
import { logger } from '../utils/logger';

export class CartPage extends CommonPage {
  constructor(page: Page) {
    super(page);
  }

  async getAllItems(): Promise<Product[]> {
    await logger.log('Retrieving all items from the cart.');
    const rows = this.page.locator(cartSelectors.cartItem);
    const count = await rows.count();
    const items: Product[] = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const name = await row.locator(cartSelectors.itemName).innerText();
      const price = await row.locator(cartSelectors.itemPrice).innerText();
      items.push({ name: name.trim(), price: price.trim() });
    }
    return items;
  }

  async verifyItems(expectedProducts: Product[]): Promise<void> {
    await logger.log('Verifying cart items against expected products.');
    const actualItems = await this.getAllItems();
    
    expect(actualItems.length).toBe(expectedProducts.length);
    
    // Assuming order is preserved (FIFO usually)
    for (let i = 0; i < expectedProducts.length; i++) {
      await logger.log(`Verifying item ${i + 1}: ${expectedProducts[i].name}`);
      expect(actualItems[i].name).toContain(expectedProducts[i].name);
      expect(actualItems[i].price).toBe(expectedProducts[i].price);
    }
  }

  async removeFirstItem(): Promise<void> {
    const rows = this.page.locator(cartSelectors.cartItem);
    const initialCount = await rows.count();
    if (initialCount === 0) throw new Error('No items to remove.');

    // We need to click the *first* remove button. 
    // Since clickAndRetry takes a string selector, we need a CSS selector that targets the first one.
    // .cart_quantity_delete is the class. We can use nth=0 logic in CSS or just pass the locator strategy if we supported locators.
    // But our utility supports string selectors. 
    // We can use a CSS selector like `#cart_info_table tbody tr:first-child .cart_quantity_delete`
    const firstRemoveBtnSelector = '#cart_info_table tbody tr:first-child .cart_quantity_delete';

    await this.clickAndRetry(
      'Remove first item',
      firstRemoveBtnSelector,
      async (timeout) => {
        // Wait for count to be initialCount - 1
        await expect(async () => {
             const newCount = await this.page.locator(cartSelectors.cartItem).count();
             expect(newCount).toBe(initialCount - 1);
        }).toPass({ timeout });
      }
    );
  }

  async proceedToCheckout(): Promise<void> {
    await this.clickAndRetry(
      'Proceed to Checkout',
      cartSelectors.proceedToCheckoutButton,
      (timeout) => this.page.waitForURL('**/checkout', { timeout })
    );
  }

  async clearCart(): Promise<void> {
    await logger.log('Clearing cart...');
    let count = await this.page.locator(cartSelectors.cartItem).count();
    while (count > 0) {
      await logger.log(`Removing item. Remaining: ${count}`);
      await this.removeFirstItem();
      count = await this.page.locator(cartSelectors.cartItem).count();
    }
    await logger.log('Cart cleared.');
  }
}
