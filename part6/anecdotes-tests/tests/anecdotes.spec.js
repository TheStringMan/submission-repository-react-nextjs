import { test, expect } from "@playwright/test"
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, "..", "db-test.json")

// Kept in sync with db.json, deliberately NOT sorted by votes so that
// sorting behaviour actually has something to prove.
const initialAnecdotes = [
  { content: "Make it work, then make it fast", id: "5", votes: 0 },
  { content: "There are two hard things in computer science", id: "4", votes: 1 },
  { content: "Untested code is broken code", id: "3", votes: 3 },
  { content: "Simplicity is the ultimate sophistication", id: "2", votes: 5 },
  { content: "Real artists ship code", id: "1", votes: 7 },
]

// Anecdotes sorted descending by votes, the order the app should display them in.
const sortedContents = [...initialAnecdotes]
  .sort((a, b) => b.votes - a.votes)
  .map((a) => a.content)

// json-server watches db.json and reloads it on change, but the reload is
// async, so poll the API until it reflects the reset data before continuing.
const resetDb = async ({ request }) => {
  writeFileSync(dbPath, JSON.stringify({ anecdotes: initialAnecdotes }, null, 2))

  await expect(async () => {
    const response = await request.get("http://localhost:3001/anecdotes")
    const data = await response.json()
    expect(data).toHaveLength(initialAnecdotes.length)
    expect(data.every((a) => a.votes === initialAnecdotes.find((i) => i.id === a.id)?.votes)).toBe(true)
  }).toPass({ timeout: 10000 })
}

// The block that wraps one anecdote's content and its "has N votes / vote / delete" row.
const anecdoteItem = (page, content) => page.getByText(content, { exact: true }).locator("..")

const voteButtonFor = (page, content) => anecdoteItem(page, content).getByRole("button", { name: "vote" })

const deleteButtonFor = (page, content) => anecdoteItem(page, content).getByRole("button", { name: "delete" })

test.describe("Anecdotes", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDb({ request })
    await page.goto("/")
    await expect(page.getByText(initialAnecdotes[0].content)).toBeVisible()
  })

  test("2 voting increments an anecdote's vote count", async ({ page }) => {
    const content = "Make it work, then make it fast"
    await expect(anecdoteItem(page, content)).toContainText("has 0")

    await voteButtonFor(page, content).click()

    await expect(anecdoteItem(page, content)).toContainText("has 1")
  })

  test("3 a new anecdote can be created via the form", async ({ page }) => {
    await page.locator('input[name="anecdote"]').fill("Freshly baked wisdom")
    await page.getByRole("button", { name: "create" }).click()

    await expect(page.getByText("Freshly baked wisdom", { exact: true })).toBeVisible()
    await expect(anecdoteItem(page, "Freshly baked wisdom")).toContainText("has 0")
  })

  test("4 the list and the form are separate components sharing the anecdote store", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Anecdotes" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "create new" })).toBeVisible()

    const content = "Simplicity is the ultimate sophistication"
    await voteButtonFor(page, content).click()

    // Voting is a list-only action: the (uncontrolled) form input is untouched.
    await expect(page.locator('input[name="anecdote"]')).toHaveValue("")
    await expect(anecdoteItem(page, content)).toContainText("has 6")
  })

  test("5 voting keeps the anecdote list sorted descending by votes, without mutating state", async ({ page }) => {
    const risingContent = "Make it work, then make it fast"
    const previousTopContent = "Real artists ship code"

    let previousTopY = (await anecdoteItem(page, previousTopContent).boundingBox()).y
    let risingY = (await anecdoteItem(page, risingContent).boundingBox()).y
    expect(risingY).toBeGreaterThan(previousTopY)

    for (let i = 0; i < 8; i++) {
      await voteButtonFor(page, risingContent).click()
    }
    await expect(anecdoteItem(page, risingContent)).toContainText("has 8")

    previousTopY = (await anecdoteItem(page, previousTopContent).boundingBox()).y
    risingY = (await anecdoteItem(page, risingContent).boundingBox()).y
    expect(risingY).toBeLessThan(previousTopY)
  })

  test("6 the filter hides anecdotes that don't match the entered text", async ({ page }) => {
    await page.getByTestId("filter").fill("Simplicity")

    await expect(page.getByText("Simplicity is the ultimate sophistication")).toBeVisible()
    await expect(page.getByText("Real artists ship code")).not.toBeVisible()
    await expect(page.getByText("Untested code is broken code")).not.toBeVisible()
  })

  test("7 anecdotes are fetched from the JSON Server backend on startup", async ({ page }) => {
    for (const anecdote of initialAnecdotes) {
      await expect(page.getByText(anecdote.content, { exact: true })).toBeVisible()
    }
    // Sanity check this really is backend data, not the hardcoded default set.
    await expect(page.getByText("If it hurts, do it more often")).not.toBeVisible()
  })

  test("8 a newly created anecdote is persisted to the backend", async ({ page }) => {
    await page.locator('input[name="anecdote"]').fill("Persisted from the form")
    await page.getByRole("button", { name: "create" }).click()
    await expect(page.getByText("Persisted from the form", { exact: true })).toBeVisible()

    await page.reload()

    await expect(page.getByText("Persisted from the form", { exact: true })).toBeVisible()
    await expect(anecdoteItem(page, "Persisted from the form")).toContainText("has 0")
  })

  test("9 a vote is persisted to the backend", async ({ page }) => {
    const content = "Untested code is broken code"
    await voteButtonFor(page, content).click()
    await expect(anecdoteItem(page, content)).toContainText("has 4")

    await page.reload()

    await expect(anecdoteItem(page, content)).toContainText("has 4")
  })

  test("10 voting shows a notification that disappears after five seconds", async ({ page }) => {
    await expect(page.getByTestId("notification")).not.toBeVisible()

    const content = "There are two hard things in computer science"
    await voteButtonFor(page, content).click()

    await expect(page.getByTestId("notification")).toHaveText(`you voted '${content}'`)
    await expect(page.getByTestId("notification")).not.toBeVisible({ timeout: 6000 })
  })

  test("11 an anecdote can only be deleted once it has zero votes", async ({ page }) => {
    const zeroVoteContent = "Make it work, then make it fast"
    const votedContent = "Untested code is broken code"

    await expect(deleteButtonFor(page, zeroVoteContent)).toBeVisible()
    await expect(deleteButtonFor(page, votedContent)).not.toBeVisible()

    await deleteButtonFor(page, zeroVoteContent).click()
    await expect(page.getByText(zeroVoteContent, { exact: true })).not.toBeVisible()

    await page.reload()
    await expect(page.getByText(zeroVoteContent, { exact: true })).not.toBeVisible()
  })

  test("12 state initializes with the exact anecdotes and vote counts from the backend", async ({ page }) => {
    for (const anecdote of initialAnecdotes) {
      await expect(anecdoteItem(page, anecdote.content)).toContainText(`has ${anecdote.votes}`)
    }
  })

  test("13 the anecdote list receives anecdotes already sorted by votes", async ({ page }) => {
    const boxes = []
    for (const content of sortedContents) {
      boxes.push((await anecdoteItem(page, content).boundingBox()).y)
    }

    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i]).toBeGreaterThan(boxes[i - 1])
    }
  })

  test("14 the anecdote list receives a properly filtered, still-sorted set of anecdotes", async ({ page }) => {
    await page.getByTestId("filter").fill("code")

    const matching = ["Real artists ship code", "Untested code is broken code"]
    const nonMatching = initialAnecdotes
      .map((a) => a.content)
      .filter((content) => !matching.includes(content))

    for (const content of nonMatching) {
      await expect(page.getByText(content, { exact: true })).not.toBeVisible()
    }

    const boxes = []
    for (const content of matching) {
      await expect(page.getByText(content, { exact: true })).toBeVisible()
      boxes.push((await anecdoteItem(page, content).boundingBox()).y)
    }
    expect(boxes[1]).toBeGreaterThan(boxes[0])
  })

  test("15 voting repeatedly accumulates the anecdote's vote count in the list", async ({ page }) => {
    const content = "There are two hard things in computer science"
    const unaffected = "Simplicity is the ultimate sophistication"

    await voteButtonFor(page, content).click()
    await voteButtonFor(page, content).click()

    await expect(anecdoteItem(page, content)).toContainText("has 3")
    await expect(anecdoteItem(page, unaffected)).toContainText("has 5")
  })
})
