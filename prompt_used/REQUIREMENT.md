Technical Requirements 
• This is ONE continuous test flow, covering end-to-end user interactions. 
• Use Playwright Test with TypeScript (strict mode). 
• Implement Page Object Model (POM). 
• Maintain selectors in dedicated files (not inside Page Objects). 
• Define models/interfaces where appropriate (e.g., Product, CartItem). 
• Use fixtures for authenticated sessions where relevant. 
• Ensure robust waits (avoid hard sleeps). 
• Use Prettier for formatting. 
• A readable HTML report is required: clear test names, meaningful assertions, 
traces on retry, screenshots on failure. 
• You may edit the provided playwright.config.ts to meet the requirements. 
• Provide a README.md following the template provided. 
• For any steps that need you to do verification, you may either 
o Extract product details at runtime, or 
o Use test data files to store and retrieve inputs (e.g., product names).