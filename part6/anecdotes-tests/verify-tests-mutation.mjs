import { execSync } from "node:child_process"
import { rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const anecdotesDir = join(__dirname, "..", "anecdotes")

const setupFile = join(anecdotesDir, "mutation.setup.mjs")
const configFile = join(anecdotesDir, "mutation.vitest.config.mjs")

// Neuters zustand's set() so no store action can ever change state, no
// matter what the actions or state fields are named.
const setupContent = `import { vi } from "vitest"

vi.mock("zustand", async (importOriginal) => {
  const actual = await importOriginal()
  const noop = () => {}
  const disableSet = (creator) => (_set, get, api) => creator(noop, get, api)
  const create = (creator) =>
    typeof creator === "function"
      ? actual.create(disableSet(creator))
      : (innerCreator) => actual.create(disableSet(innerCreator))
  return { ...actual, create }
})
`

const configContent = `import { defineConfig, mergeConfig } from "vitest/config"
import base from "./vite.config.js"

export default mergeConfig(
  base,
  defineConfig({ test: { setupFiles: ["./mutation.setup.mjs"] } }),
)
`

let testsFailedAsExpected = false

try {
  writeFileSync(setupFile, setupContent)
  writeFileSync(configFile, configContent)
  execSync("npx vitest run --config mutation.vitest.config.mjs", {
    cwd: anecdotesDir,
    stdio: "ignore",
  })
} catch {
  testsFailedAsExpected = true
} finally {
  rmSync(setupFile, { force: true })
  rmSync(configFile, { force: true })
}

if (!testsFailedAsExpected) {
  console.error(
    "Mutation check failed: unit tests still pass even when the store can never change state, so they are not verifying real behavior.",
  )
  process.exit(1)
}

console.log(
  "Mutation check passed: unit tests correctly fail with broken store",
)
