import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a clean local Next.js dev server. Clearing `.next` avoids
 * mixing production-build manifests with dev-server output between gates.
 * Wallet flows use an injected mock EIP-1193 provider, not a live extension.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "node -e \"require('fs').rmSync('.next',{recursive:true,force:true})\" && npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
