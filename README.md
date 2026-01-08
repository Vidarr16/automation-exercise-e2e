# Playwright E2E Automation - Automation Exercise

This project contains an automated end-to-end (E2E) test suite for the [Automation Exercise](https://automationexercise.com/) website, implemented using Playwright and TypeScript.

## Project Overview

The test suite covers a continuous e-commerce flow including:
1.  User Login
2.  Product Filtering (by Brand)
3.  Adding items to the cart
4.  Verifying Cart contents
5.  Checkout and Payment processing

## Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Install Playwright browsers:**
    ```bash
    npx playwright install
    ```

## Running Tests

### Run the E2E Test Suite
To run the complete test flow:
```bash
npx playwright test
```

### Run with UI Mode
To explore the test execution in UI mode:
```bash
npx playwright test --ui
```

### View Report
After the test run, you can view the HTML report:
```bash
npx playwright show-report
```

## Project Structure

```
src/
├── fixtures/       # Test fixtures (if applicable)
├── models/         # TypeScript interfaces (Product, etc.)
├── pages/          # Page Object Model (POM) classes
├── selectors/      # CSS/Text selectors for each page
├── test-data/      # Runtime data logs and records
├── tests/          # Test specifications (*.spec.ts)
└── utils/          # Utilities (Logger, Recorder)
```

## Implementation Details

-   **Page Object Model (POM):** The project strictly follows POM for better maintainability and readability.
-   **Robustness:** 
    -   Custom `clickAndRetry` logic handles flaky interactions.
    -   Ad blocking is enabled to improve stability.
    -   `waitForSelector` and `waitForURL` strategies are optimized for the slow target website.
-   **Logging:** A custom logger records all steps to both the console and a timestamped log file in `src/test-data/`.
-   **Data Recording:** Product details are scraped and verified using `src/utils/recorder.ts`.

## Configuration

The `playwright.config.ts` file is configured with:
-   **Global Timeout:** 10 minutes (to handle slow site performance).
-   **Action Timeout:** 60 seconds.
-   **Reporting:** HTML and List reporters enabled.
-   **Tracing & Screenshots:** Traces on first retry, screenshots on failure.
