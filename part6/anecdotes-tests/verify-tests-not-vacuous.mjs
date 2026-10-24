import { readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
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

const stripLineComments = (source) => source.replace(/\/\/.*$/gm, "")

const extractItBlocks = (source) => {
  const blocks = []
  const itCallPattern = /\bit(?:\.\w+)?\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g
  let match
  while ((match = itCallPattern.exec(source))) {
    const bodyStart = source.indexOf("{", match.index)
    if (bodyStart === -1) continue
    let depth = 0
    let i = bodyStart
    for (; i < source.length; i++) {
      if (source[i] === "{") depth++
      else if (source[i] === "}") {
        depth--
        if (depth === 0) break
      }
    }
    blocks.push({ name: match[2], body: source.slice(bodyStart, i + 1) })
  }
  return blocks
}

const testFiles = findTestFiles(join(__dirname, "..", "anecdotes", "src"))

const vacuous = []
for (const file of testFiles) {
  const source = stripLineComments(readFileSync(file, "utf-8"))
  for (const { name, body } of extractItBlocks(source)) {
    if (!/\bexpect\(/.test(body)) {
      vacuous.push(`${file}: "${name}"`)
    }
  }
}

if (vacuous.length > 0) {
  console.error("Found test(s) with no expect() assertion:")
  vacuous.forEach((entry) => console.error(`  ${entry}`))
  process.exit(1)
}

console.log("All tests contain at least one expect() assertion.")
