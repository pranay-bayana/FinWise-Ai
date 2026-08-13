# FinWise AI Enterprise Automation Framework

This repository contains two professional-grade automation frameworks for FinWise AI:
1. **Playwright (JavaScript)**
2. **Selenium WebDriver (Java/TestNG)**

Both frameworks are implemented using the **Page Object Model (POM)** pattern and feature dynamic test data generation to execute flawlessly against a real backend database without data collisions.

## 1. Playwright Framework (`e2e/`)

### Setup
```bash
npm install
npx playwright install
```

### Execution
Run all tests across Chromium, Firefox, and WebKit:
```bash
npm run test:e2e
```
Run with UI mode for debugging:
```bash
npx playwright test --ui
```

### Architecture
- **Pages**: `e2e/pages/` - Contains all Page Objects (locators and actions).
- **Utils**: `e2e/utils/` - Contains API helpers to seed test users dynamically.
- **Tests**: `e2e/tests/` - The actual test specs.
- **Config**: `playwright.config.js` - Defines retries, video recording, and parallel workers.

## 2. Selenium Framework (`selenium/`)

### Setup
You must have Java (JDK 11+) and Maven installed.

### Execution
Execute the TestNG suite via Maven:
```bash
cd selenium
mvn test
```
To run headless:
```bash
mvn test -Dheadless=true
```

### Architecture
- **Base**: `src/main/java/base/` - `BaseTest` (WebDriver initialization) and `BasePage` (explicit waits).
- **Pages**: `src/main/java/pages/` - Page Object Model implementations.
- **Utils**: `src/main/java/utilities/` - RestAssured API helpers for data generation.
- **Tests**: `src/test/java/tests/` - TestNG test classes.
- **Dependencies**: Managed via `pom.xml` (Selenium 4, ExtentReports, WebDriverManager).

## Extending the Framework
To add a new module (e.g., `Income`):
1. Create `IncomePage` in the respective `pages/` directory.
2. Add locators and CRUD methods.
3. Create `IncomeTest` in the `tests/` directory.
4. Use the API helper to register a new dynamic user so your test starts with a clean slate in the production database.
