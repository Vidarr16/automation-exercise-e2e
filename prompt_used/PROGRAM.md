# PROGRAM.md: Technical Implementation Guide for E2E Test Suite

## 1. Overview

This document provides the detailed technical architecture for creating an automated E2E test suite using Playwright and TypeScript. The goal is to implement the user flow described in `STEPS.md` in a robust, maintainable, and scalable manner. This guide must be followed precisely.

## 2. Core Utilities

These must be implemented first as they are dependencies for all other parts of the script.

### 2.1. Logger Utility (`src/utils/logger.ts`)

This utility will handle all logging to both the console and a timestamped file.

- Create a file `src/utils/logger.ts`.
- It should export a single object `logger`.
- The logger will be initialized once. It will determine the log file path upon initialization.
- **File Naming:** The log file must be named `test-data/test_[ddmm]_[hhmm].log`, for example `test-data/test_0701_1530.log`.
- It must expose one method: `async log(message: string)`.
  - This method will print the message to the console (`console.log`).
  - It will also append the message with a timestamp to the log file.
  - Use Node.js's `fs/promises` for file operations.

```typescript
// Example structure for src/utils/logger.ts
import fs from 'fs/promises';
import path from 'path';

class Logger {
  private logFilePath: string;

  constructor() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const fileName = `test_${day}${month}_${hours}${minutes}.log`;
    this.logFilePath = path.join('src', 'test-data', fileName);
    // Ensure directory exists
    fs.mkdir(path.dirname(this.logFilePath), { recursive: true });
  }

  async log(message: string) {
    console.log(message);
    const timestamp = new Date().toISOString();
    await fs.appendFile(this.logFilePath, `[${timestamp}] ${message}\n`);
  }
}

export const logger = new Logger();
```

### 2.2. Data Recorder Utility (`src/utils/recorder.ts`)

This utility will manage reading and writing product data to `record_items.json`.

- Create a file `src/utils/recorder.ts`.
- The data file will be `src/test-data/record_items.json`.
- It must export an object `recorder`.
- It must expose two methods:
  - `async writeProducts(products: Product[]): Promise<void>`: Overwrites the JSON file with the provided array of products.
  - `async readProducts(): Promise<Product[]>`: Reads and parses the JSON file, returning the array of products.

## 3. Configuration and Models

### 3.1. `playwright.config.ts`

- **Timeout:** The website is slow. Increase the global timeout to at least 60 seconds to prevent premature test failures.
  `timeout: 60 * 1000,`
- **`testDir`:** Ensure it points to `'./src/tests'`.
- **`globalSetup`**: We will not use `globalSetup` for this version as per `STEPS.md`, which provides credentials directly. The test will start from a fresh browser and log in manually.

### 3.2. Data Model (`src/models/product.ts`)

- Create `src/models/product.ts`.
- Define and export the `Product` interface.

```typescript
export interface Product {
  name: string;
  price: string;
}
```

## 4. Page Object Model (POM) Implementation

### 4.1. Selectors (`src/selectors/`)

Create separate files for selectors for each page. Use specific `data-qa` attributes or other reliable selectors found during manual inspection.

- **`auth.selectors.ts`**:
  - `loginEmailInput`, `loginPasswordInput`, `loginButton`
- **`products.selectors.ts`**:
  - `brandsCategoryPanel`, `poloBrandLink`, `mastAndHarbourBrandLink`, `productItemByName(name)`, `addToCartButton`, `continueShoppingButton`, `viewProductLink`
- **`cart.selectors.ts`**:
  - `cartItem`, `itemName`, `itemPrice`, `removeItemButton`, `proceedToCheckoutButton`
- **`checkout.selectors.ts`**:
  - `placeOrderButton`, `nameOnCardInput`, `cardNumberInput`, `cvcInput`, `expiryMonthInput`, `expiryYearInput`, `payAndConfirmButton`, `orderSuccessContinueButton`

### 4.2. Page Objects (`src/pages/`)

Implement the following classes. Each class should accept a `Page` object in its constructor and use the `logger` utility for every significant action.

#### **`AuthPage.ts`**

- `constructor(page: Page)`
- `async navigate(): Promise<void>`
- `async login(email, password): Promise<void>`: Fills credentials and clicks login. Waits for navigation to complete.

#### **`ProductsPage.ts`**

- `constructor(page: Page)`
- `async filterByBrand(brandName: 'POLO' | 'MAST & HARBOUR'): Promise<void>`: Clicks the correct brand link and waits for the product list to update.
- `async getProductDetails(productName: string): Promise<Product>`: Finds a product by name, extracts its text name and price, and returns it as a `Product` object.
- `async addProductToCart(productName: string): Promise<void>`: Finds a product and clicks its 'Add to cart' button.
- `async clickContinueShopping(): Promise<void>`: Clicks the 'Continue Shopping' button on the success modal.
- `async viewProduct(productName: string): Promise<void>`: Clicks the 'View Product' link for a specific product.
- `async verifyBrandPage(brandName: string): Promise<void>`: Verifies the header (e.g., 'BRANDS - POLO PRODUCTS') is visible.

#### **`CommonPage.ts`** (or on a base page)

- `constructor(page: Page)`
- `async goToCart(): Promise<void>`

#### **`CartPage.ts`**

- `constructor(page: Page)`
- `async getAllItems(): Promise<Product[]>`: Scrapes all items in the cart and returns them as an array of `Product` objects.
- `async verifyItems(expectedProducts: Product[]): Promise<void>`: Compares items in the cart with the expected products. Use `expect` for assertions.
- `async removeFirstItem(): Promise<void>`: Locates the first item in the cart and clicks its 'X' (remove) button. Waits for the item to disappear.
- `async proceedToCheckout(): Promise<void>`

#### **`CheckoutPage.ts`**

- `constructor(page: Page)`
- `async placeOrder(): Promise<void>`
- `async fillPaymentDetails(details: { name; cardNumber; cvc; month; year; }): Promise<void>`
- `async payAndConfirm(): Promise<void>`
- `async continueToHome(): Promise<void>`

## 5. Main Test Script (`src/tests/e2e-flow.spec.ts`)

This file will contain the main test flow, orchestrating the calls to the Page Objects.

- Import `test` and `expect` from `@playwright/test`.
- Import all Page Object classes, the logger, and the recorder.
- Create a single test block: `test('should complete the full e-commerce flow', async ({ page }) => { ... });`
- Instantiate all Page Objects inside the test.
- Follow the `STEPS.md` logic precisely, calling the appropriate Page Object methods.
- Use the `logger.log()` method before each distinct action.
- Use the `recorder` to save and retrieve product data.
- Use `page.goBack()` for step 7.
- Use `expect` from Playwright for all verifications.

### Example Test Flow Snippet:

```typescript
// Inside test block
const authPage = new AuthPage(page);
const productsPage = new ProductsPage(page);
// ... other pages

// Step 3 & 4: Login
await logger.log("Navigating to login page.");
await authPage.navigate();
await logger.log("Attempting to log in.");
await authPage.login('xxyuxdzed@gmail.com', '0xX1yu1XD6');
await expect(page).toHaveURL('https://automationexercise.com/');

// Step 5: Filter and add first item
await logger.log("Filtering by brand 'POLO'.");
await productsPage.filterByBrand('POLO');
const product1 = await productsPage.getProductDetails('Soft Stretch Jeans');
await logger.log(`Found product: ${product1.name} with price ${product1.price}.`);
await recorder.writeProducts([product1]);
await logger.log(