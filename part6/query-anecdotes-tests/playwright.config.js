import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  // The backend is shared, mutable state (server.js writes to db-test.json),
  // so tests must not run concurrently against it.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5174",
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
      command: "npm run dev -- --port 5174",
      cwd: "../query-anecdotes",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "node ../query-anecdotes/server.js",
      cwd: ".",
      env: { DB_FILE: "db-test.json" },
      url: "http://localhost:3001/anecdotes",
      reuseExistingServer: !process.env.CI,
    },
  ],
})
