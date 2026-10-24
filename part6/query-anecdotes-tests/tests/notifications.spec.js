import { test, expect } from "@playwright/test"

const initialAnecdotes = [
  { content: "Make it work, then make it fast", votes: 0 },
  { content: "There are two hard things in computer science", votes: 3 },
  { content: "Untested code is broken code", votes: 3 },
  { content: "Simplicity is the ultimate sophistication", votes: 5 },
  { content: "Real artists ship code", votes: 7 },
]

// Same reset strategy as anecdotes.spec.js: server.js keeps its data in
// memory and does not watch db-test.json for external changes, so the
// backend must be reset through its own API instead of by rewriting the
// file on disk.
const resetDb = async ({ request }) => {
  const response = await request.get("http://localhost:3001/anecdotes")
  const current = await response.json()

  for (const anecdote of current) {
    await request.delete(`http://localhost:3001/anecdotes/${anecdote.id}`)
  }

  for (const anecdote of initialAnecdotes) {
    const created = await request.post("http://localhost:3001/anecdotes", {
      data: { content: anecdote.content },
    })
    const { id } = await created.json()
    await request.put(`http://localhost:3001/anecdotes/${id}`, {
      data: { id, content: anecdote.content, votes: anecdote.votes },
    })
  }
}

const anecdoteItem = (page, content) => page.getByText(content, { exact: true }).locator("..")

const voteButtonFor = (page, content) => anecdoteItem(page, content).getByRole("button", { name: "vote" })

// Notification.jsx already renders its element with data-testid="notification"
// when it has something to show, so tests key off that rather than fixed text
// for "is a notification showing at all". Where the tests do check wording
// (e.g. /created/i, /voted/i, /too short/i) that's an assumption about the
// message content exercises 6.20/6.21 ask for - adjust the regexes to match
// whatever wording is implemented if it differs.
const notification = (page) => page.getByTestId("notification")

test.describe("Notifications (query-anecdotes)", () => {
  test.beforeEach(async ({ request, page }) => {
    await resetDb({ request })
    await page.goto("/")
    await expect(page.getByText(initialAnecdotes[0].content)).toBeVisible()
  })

  test("no notification is shown before anything is done", async ({ page }) => {
    await expect(notification(page)).toBeHidden()
  })

  test.describe("exercise 6.20: creating and voting show a notification", () => {
    test("creating a new anecdote shows a notification, which disappears after five seconds", async ({ page }) => {
      await page.locator('input[name="anecdote"]').fill("Freshly baked wisdom")
      await page.getByRole("button", { name: "create" }).click()

      await expect(notification(page)).toBeVisible()
      await expect(notification(page)).toContainText(/created/i)

      // Still visible well before the five second timeout...
      await page.waitForTimeout(4000)
      await expect(notification(page)).toBeVisible()

      // ...and gone shortly after it.
      await expect(notification(page)).toBeHidden({ timeout: 3000 })
    })

    test("voting for an anecdote shows a notification, which disappears after five seconds", async ({ page }) => {
      const content = "Make it work, then make it fast"

      await voteButtonFor(page, content).click()

      await expect(notification(page)).toBeVisible()
      await expect(notification(page)).toContainText(/voted/i)

      await page.waitForTimeout(4000)
      await expect(notification(page)).toBeVisible()

      await expect(notification(page)).toBeHidden({ timeout: 3000 })
    })
  })

  test.describe("exercise 6.21: error handling for anecdotes that are too short", () => {
    test("submitting an anecdote shorter than 5 characters shows an error notification", async ({ page }) => {
      await page.locator('input[name="anecdote"]').fill("hey")
      await page.getByRole("button", { name: "create" }).click()

      await expect(notification(page)).toBeVisible()
      // The server rejects the request with "too short anecdote, must have
      // length 5 or more" - the notification is expected to surface that.
      await expect(notification(page)).toContainText(/too short/i)

      await expect(page.getByText("hey", { exact: true })).not.toBeVisible()
    })

    test("the error notification also disappears after five seconds", async ({ page }) => {
      await page.locator('input[name="anecdote"]').fill("hey")
      await page.getByRole("button", { name: "create" }).click()

      await expect(notification(page)).toBeVisible()

      await page.waitForTimeout(4000)
      await expect(notification(page)).toBeVisible()

      await expect(notification(page)).toBeHidden({ timeout: 3000 })
    })
  })
})
