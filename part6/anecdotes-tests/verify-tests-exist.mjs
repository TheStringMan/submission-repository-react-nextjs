import { readdirSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const testFilePattern = /\.(test|spec)\.[jt]sx?$/

const findTestFiles = (dir) => {
  const found = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      found.push(...findTestFiles(fullPath))
    } else if (testFilePattern.test(entry)) {
      found.push(fullPath)
    }
  }
  return found
}

const testFiles = findTestFiles(join(__dirname, "..", "anecdotes", "src"))

if (testFiles.length === 0) {
  console.error("No test files found under anecdotes/src")
  process.exit(1)
}

console.log(`Found ${testFiles.length} test file(s):`)
testFiles.forEach((file) => console.log(`  ${file}`))
