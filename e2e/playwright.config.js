import { defineConfig, devices } from '@playwright/test';

/**
 * Enterprise-Grade Playwright Configuration
 * Supports: Cross-Browser, Parallel Execution, Trace Viewer, Videos, HTML Reports.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Enable parallel execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry on failure
  workers: process.env.CI ? 4 : undefined,
  
  // HTML Reporter with traces and screenshots
  reporter: [
    ['html', { outputFolder: 'reports' }],
    ['list'],
    ['junit', { outputFile: 'reports/results.xml' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
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
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }
  ],
  
  // Configure output directory for artifacts
  outputDir: 'test-results/',
});
