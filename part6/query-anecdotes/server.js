import { randomUUID } from "node:crypto"
import { App } from "@tinyhttp/app"
import { cors } from "@tinyhttp/cors"
import { json } from "milliparsec"
import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"
import { createApp } from "json-server/lib/app.js"

const dbFile = process.env.DB_FILE || "db.json"
const db = new Low(new JSONFile(dbFile), { anecdotes: [] })
await db.read()

const app = new App()

app.use(cors())
app.options("*", cors())

// Handled separately (instead of letting json-server's generic POST route
// create the anecdote) so a too-short anecdote can be rejected with a 400
// before it is written to the db.
app.post("/anecdotes", json(), async (req, res) => {
  const { content } = req.body ?? {}

  if (!content || content.length < 5) {
    return res.status(400).json({
      error: "too short anecdote, must have length 5 or more",
    })
  }

  const anecdote = { content, votes: 0, id: randomUUID() }
  db.data.anecdotes.push(anecdote)
  await db.write()

  res.status(201).json(anecdote)
})

app.use(createApp(db))

app.listen(3001, () => {
  console.log("JSON Server is running")
})
