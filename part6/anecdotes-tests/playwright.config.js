import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  // The backend is shared, mutable state (json-server writes to db.json),
  // so tests must not run concurrently against it.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --port 5173",
      cwd: "../anecdotes",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npx json-server --port 3001 --watch db-test.json",
      cwd: ".",
      url: "http://localhost:3001/anecdotes",
      reuseExistingServer: !process.env.CI,
    },
  ],
})
