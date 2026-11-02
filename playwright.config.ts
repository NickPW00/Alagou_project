import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'celular', testIgnore: /pwa\.spec\.ts/, use: { ...devices['Pixel 7'], browserName: 'chromium' } },
    { name: 'desktop', testIgnore: /pwa\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    // A3: o service worker só existe na versão de produção.
    { name: 'pwa', testMatch: /pwa\.spec\.ts/, use: { ...devices['Pixel 7'], browserName: 'chromium', baseURL: 'http://localhost:4174' } },
  ],
  webServer: [
    {
      command: 'npx vite --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      env: { VITE_DATA_MODE: 'demo' },
    },
    {
      command: 'npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port 4174 --strictPort',
      url: 'http://localhost:4174',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
      env: { VITE_DATA_MODE: 'demo' },
    },
  ],
});
