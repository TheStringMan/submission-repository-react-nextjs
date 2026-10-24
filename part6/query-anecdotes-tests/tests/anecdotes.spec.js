import { test, expect } from "@playwright/test"

const initialAnecdotes = [
  { content: "Make it work, then make it fast", votes: 0 },
  { content: "There are two hard things in computer science", votes: 3 },
  { content: "Untested code is broken code", votes: 3 },
  { content: "Simplicity is the ultimate sophistication", votes: 5 },
  { content: "Real artists ship code", votes: 7 },
]

// Unlike plain json-server, server.js keeps its data in memory and does not
// watch db-test.json for external changes, so the backend must be reset
// through its own API instead of by rewriting the file on disk.
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

// The block that wraps one anecdote's content and its "has N votes" row.
const anecdoteItem = (page, content) => page.getByText(content, { exact: true }).locator("..")

const voteButtonFor = (page, content) => anecdoteItem(page, content).getByRole("button", { name: "vote" })

// Requests to the backend fail (and never resolve), simulating the server
// being unreachable, as in exercise 6.16.
const blockBackend = (page) =>
  page.route("**/anecdotes", async (route) => {
    if (route.request().method() === "GET") {
      await route.abort("failed")
    } else {
      await route.continue()
    }
  })

test.describe("Anecdotes (query-anecdotes)", () => {
  test.beforeEach(async ({ request }) => {
    await resetDb({ request })
  })

  test.describe("fetching anecdotes with TanStack Query", () => {
    test("all anecdotes from the backend are rendered", async ({ page }) => {
      await page.goto("/")

      for (const anecdote of initialAnecdotes) {
        await expect(anecdoteItem(page, anecdote.content)).toContainText(`has ${anecdote.votes}`)
      }
    })

    test("only an error message is shown when the server cannot be reached", async ({ page }) => {
      await blockBackend(page)
      await page.goto("/")

      await expect(
        page.getByText("anecdote service not available due to problems in server")
      ).toBeVisible({ timeout: 10000 })

      // Nothing else from the normal view should be rendered.
      await expect(page.getByRole("heading", { name: "Anecdote app" })).not.toBeVisible()
      await expect(page.locator('input[name="anecdote"]')).toHaveCount(0)
      for (const anecdote of initialAnecdotes) {
        await expect(page.getByText(anecdote.content, { exact: true })).not.toBeVisible()
      }
    })
  })

  test.describe("creating anecdotes with TanStack Query", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/")
      await expect(page.getByText(initialAnecdotes[0].content)).toBeVisible()
    })

    test("a new anecdote is rendered immediately, without reloading the page", async ({ page }) => {
      await page.locator('input[name="anecdote"]').fill("Freshly baked wisdom")
      await page.getByRole("button", { name: "create" }).click()

      await expect(page.getByText("Freshly baked wisdom", { exact: true })).toBeVisible()
      await expect(anecdoteItem(page, "Freshly baked wisdom")).toContainText("has 0")
    })

    test("the form is cleared after a successful submit", async ({ page }) => {
      await page.locator('input[name="anecdote"]').fill("Freshly baked wisdom")
      await page.getByRole("button", { name: "create" }).click()

      await expect(page.getByText("Freshly baked wisdom", { exact: true })).toBeVisible()
      await expect(page.locator('input[name="anecdote"]')).toHaveValue("")
    })

    test("a newly created anecdote is persisted to the backend", async ({ page }) => {
      await page.locator('input[name="anecdote"]').fill("Persisted from the form")
      await page.getByRole("button", { name: "create" }).click()
      await expect(page.getByText("Persisted from the form", { exact: true })).toBeVisible()

      await page.reload()

      await expect(page.getByText("Persisted from the form", { exact: true })).toBeVisible()
      await expect(anecdoteItem(page, "Persisted from the form")).toContainText("has 0")
    })
  })

  test.describe("voting for anecdotes with TanStack Query", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/")
      await expect(page.getByText(initialAnecdotes[0].content)).toBeVisible()
    })

    test("voting increases the anecdote's vote count immediately, without reloading", async ({ page }) => {
      const content = "Make it work, then make it fast"
      await expect(anecdoteItem(page, content)).toContainText("has 0")

      await voteButtonFor(page, content).click()

      await expect(anecdoteItem(page, content)).toContainText("has 1")
    })

    test("voting repeatedly accumulates the vote count", async ({ page }) => {
      const content = "There are two hard things in computer science"
      const unaffected = "Simplicity is the ultimate sophistication"

      await voteButtonFor(page, content).click()
      await voteButtonFor(page, content).click()

      await expect(anecdoteItem(page, content)).toContainText("has 5")
      await expect(anecdoteItem(page, unaffected)).toContainText("has 5")
    })

    test("a vote is persisted to the backend", async ({ page }) => {
      const content = "Untested code is broken code"

      await voteButtonFor(page, content).click()
      await expect(anecdoteItem(page, content)).toContainText("has 4")

      await page.reload()

      await expect(anecdoteItem(page, content)).toContainText("has 4")
    })
  })
})
