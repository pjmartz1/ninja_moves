import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:3004',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 }, // iPhone SE dimensions
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }, // iPhone SE dimensions
      },
    },
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
      },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      port: 3004,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd backend && python start_server.py',
      port: 8000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});