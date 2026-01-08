import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { logger } from '../utils/logger';
import { recorder } from '../utils/recorder';

test('should complete the full e-commerce flow', async ({ page }) => {
  // Block ads to improve stability and performance
  await page.route('**/*googleads*', route => route.abort());
  await page.route('**/*doubleclick*', route => route.abort());
  await page.route('**/*googlesyndication*', route => route.abort());
  await page.route('**/*ad_status*', route => route.abort());

  const authPage = new AuthPage(page);
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 2: Open browser, go to URL
  await logger.log('Starting Test: Navigating to Homepage.');
  await page.goto('https://automationexercise.com/', { waitUntil: 'domcontentloaded' });

  // Step 3 & 4: Login
  await logger.log('Step 3 & 4: Login process.');
  await authPage.navigate();
  await authPage.login('xxyuxdzed@gmail.com', '0xX1yu1XD6');
  await expect(page).toHaveURL('https://automationexercise.com/');

  // Ensure cart is empty before starting
  await productsPage.goToCart();
  await cartPage.clearCart();
  await page.goto('https://automationexercise.com/');
  await recorder.writeProducts([]);

  // Step 5: Filter POLO, Add 'Soft Stretch Jeans'
  await logger.log('Step 5: Filter POLO and add "Soft Stretch Jeans".');
  await productsPage.filterByBrand('POLO');
  
  const product1Name = 'Soft Stretch Jeans';
  const product1 = await productsPage.getProductDetails(product1Name);
  await logger.log(`Recorded Product 1: ${JSON.stringify(product1)}`);
  
  await recorder.writeProducts([product1]);
  
  await productsPage.addProductToCart(product1Name);
  await productsPage.clickContinueShopping();

  // Step 6: Go to Cart, Verify
  await logger.log('Step 6: Verify Cart.');
  await productsPage.goToCart();
  await cartPage.verifyItems([product1]);

  // Step 7: Back to previous page, Verify Brand
  await logger.log('Step 7: Go back and verify brand page.');
  await page.goBack();
  await productsPage.verifyBrandPage('POLO');

  // Step 8: Filter MAST & HARBOUR, View 'GRAPHIC DESIGN MEN T-SHIRT - BLUE'
  await logger.log('Step 8: Filter MAST & HARBOUR and view product.');
  await productsPage.filterByBrand('MAST & HARBOUR');
  
  const product2Name = 'GRAPHIC DESIGN MEN';
  // Capture details from list *before* clicking view, as per instructions flow (find item... save... click view)
  const product2 = await productsPage.getProductDetails(product2Name);
  await logger.log(`Recorded Product 2: ${JSON.stringify(product2)}`);
  
  // Append to records
  const currentRecords = await recorder.readProducts();
  currentRecords.push(product2);
  await recorder.writeProducts(currentRecords);
  
  await productsPage.viewProduct(product2Name);
  
  // Step 9: Verify details, Add to cart, View Cart, Verify 2 items
  await logger.log('Step 9: Verify details on product page and add to cart.');
  
  // Verify details on the "Product Details" page
  // Note: Selectors here are different.
  const detailsName = await page.locator('.product-information h2').innerText();
  const detailsPrice = await page.locator('.product-information span span').first().innerText(); // usually "Rs. 400" inside span
  
  expect(detailsName.trim()).toContain(product2.name);
  expect(detailsPrice.trim()).toBe(product2.price);
  await logger.log('Product details verified on Details Page.');

  // Click 'Add to cart' on Details Page
  await page.click('button.cart'); // "Add to cart" button on details page
  await page.waitForSelector('.modal-content', { state: 'visible' });
  await logger.log('Added second product to cart.');

  // Click 'View Cart' on the modal
  await page.click('.modal-content a[href="/view_cart"]');
  await page.waitForURL('**/view_cart');
  
  await logger.log('Verifying both items in cart.');
  await cartPage.verifyItems(currentRecords);

  // Step 10: Remove first item
  await logger.log('Step 10: Remove first item.');
  await cartPage.removeFirstItem();
  
  // Verify only one item remains (the second one)
  await cartPage.verifyItems([product2]);

  // Step 11: Checkout flow
  await logger.log('Step 11: Proceed to Checkout.');
  await cartPage.proceedToCheckout();
  
  await checkoutPage.placeOrder();
  
  await checkoutPage.fillPaymentDetails({
    name: 'YYY',
    cardNumber: '144332123',
    cvc: '311',
    month: '11',
    year: '2032'
  });
  
  await checkoutPage.payAndConfirm();
  await checkoutPage.continueToHome();

  await logger.log('Test Completed Successfully.');
});
