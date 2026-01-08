import { Page, expect } from '@playwright/test';
import { CommonPage } from './CommonPage';
import { productsSelectors } from '../selectors/products.selectors';
import { Product } from '../models/product';
import { logger } from '../utils/logger';

export class ProductsPage extends CommonPage {
  constructor(page: Page) {
    super(page);
  }

  async filterByBrand(brandName: 'POLO' | 'MAST & HARBOUR'): Promise<void> {
    const selector = brandName === 'POLO' 
      ? productsSelectors.poloBrandLink 
      : productsSelectors.mastAndHarbourBrandLink;
    
    // The site displays "Brand - Polo Products" or "Brand - Mast & Harbour Products"
    // We'll match loosely using a regex that looks for the brand name (case-insensitive)
    const expectedTextRegex = new RegExp(brandName === 'POLO' ? 'Polo' : 'Mast & Harbour', 'i');
    
    // Use regex for URL to avoid encoding issues
    const urlRegex = brandName === 'POLO' 
      ? /\/brand_products\/Polo/ 
      : /\/brand_products\/Mast.*Harbour/;

    await this.clickAndRetry(
      `Filter by Brand: ${brandName}`,
      selector,
      async (timeout) => {
        // First wait for URL to change to ensure navigation started/finished
        await this.page.waitForURL(urlRegex, { timeout: timeout / 2, waitUntil: 'domcontentloaded' });
        // Then check the text
        await expect(this.page.locator(productsSelectors.brandPageHeader)).toContainText(expectedTextRegex, { timeout: timeout / 2 });
      },
      60000,
      120000,
      { force: true }
    );
  }

  async getProductDetails(productName: string): Promise<Product> {
    await logger.log(`Getting details for product: ${productName}`);
    const wrapper = this.page.locator(productsSelectors.productWrapper(productName));
    
    // Price is usually in the h2 tag within .productinfo
    const priceText = await wrapper.locator('.productinfo h2').innerText();
    
    return {
      name: productName,
      price: priceText.trim(),
    };
  }

  async addProductToCart(productName: string): Promise<void> {
    const wrapper = this.page.locator(productsSelectors.productWrapper(productName));
    // We need a specific selector string for the click action in common page
    // Since wrapper is a locator, we can construct the selector string if possible, or just use the full selector string.
    // productWrapper returns: .product-image-wrapper:has(...)
    // button is .productinfo a.add-to-cart
    
    // Constructing a robust selector string for the specific button
    const buttonSelector = `${productsSelectors.productWrapper(productName)} .productinfo a.add-to-cart`;

    await this.clickAndRetry(
      `Add to Cart: ${productName}`,
      buttonSelector,
      (timeout) => this.page.waitForSelector('.modal-content', { state: 'visible', timeout }),
      30000,
      60000,
      { force: true }
    );
  }

  async clickContinueShopping(): Promise<void> {
    await this.clickAndRetry(
      'Click Continue Shopping',
      productsSelectors.continueShoppingButton,
      (timeout) => this.page.waitForSelector('.modal-content', { state: 'hidden', timeout }),
      30000,
      60000,
      { force: true }
    );
  }

  async viewProduct(productName: string): Promise<void> {
    const selector = `${productsSelectors.productWrapper(productName)} ${productsSelectors.viewProductLink}`;
    
    await this.clickAndRetry(
      `View Product: ${productName}`,
      selector,
      (timeout) => this.page.waitForSelector('.product-information', { state: 'visible', timeout }),
      30000,
      60000,
      { force: true }
    );
  }

  async verifyBrandPage(brandName: string): Promise<void> {
    await logger.log(`Verifying Brand Page for: ${brandName}`);
    await expect(this.page.locator(productsSelectors.brandPageHeader)).toContainText(brandName, { ignoreCase: true });
  }
}
