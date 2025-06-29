const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// GET INFO
app.get('/api/info', (request, response) => {
  response.send("<h1>Phonebook has info for " + persons.length + " people</h1> " + new Date())
})

// GET ALL
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// GET ID
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(note => note.id === id)
  
  if (person)
    response.json(person)
  else
    response.status(404).end()
})

// DELETE
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

// PUT ELEMENT
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  else if(persons.find((x) => x.name == body.name))
  {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  

  const person = {
    name: body.name,
    number: body.number,
    id: Math.random().toString(16).slice(2),
  }

  persons = persons.concat(person)

  response.json(persons)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

