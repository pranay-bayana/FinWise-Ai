import { defineConfig, devices } from '@playwright/test';

/**
 * Enterprise-Grade Playwright Configuration
 * Supports: Cross-Browser, Parallel Execution, Trace Viewer, Videos, HTML Reports.
 */
const FRONTEND_PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: './e2e/tests', // Correctly pointing to the e2e/tests directory from the root
  fullyParallel: true, // Enable parallel execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry on failure
  workers: process.env.CI ? 4 : undefined,
  
  // HTML Reporter with traces and screenshots
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  use: {
    baseURL: BASE_URL,
    // Trace capturing on failure for debugging
    trace: 'retain-on-failure',
    // Video recording on failure
    video: 'retain-on-failure',
    // Screenshots on failure
    screenshot: 'only-on-failure',
    // Set viewport
    viewport: { width: 1280, height: 720 },
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Web server configuration to start the frontend automatically
  // webServer: {
  //   command: 'npm run frontend',
  //   url: BASE_URL,
  //   reuseExistingServer: true, // Reuses the already running server
  //   timeout: 120 * 1000,
  // },
  
  // Cross Browser Support
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }
  ],
  
  // Configure output directory for artifacts
  outputDir: 'test-results/',
});
