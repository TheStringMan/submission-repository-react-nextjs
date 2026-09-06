require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
// Token custom :body, usato nel formato di log qui sotto per mostrare il body delle POST
morgan.token('body', (request) => JSON.stringify(request.body))
const cors = require('cors')

const Person = require('./models/person')

const app = express()
// Middleware: legge il body JSON delle richieste (es. POST) e lo mette in request.body
app.use(express.json())
app.use(cors())
// Logga ogni richiesta (metodo, url, status, tempo di risposta, body) sulla console;
// va registrato dopo express.json() per poter leggere request.body già parsato
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
)
app.use(express.static('dist'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// GET /api/persons -> restituisce l'intero elenco dei contatti in JSON
app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

// GET /api/persons/:id -> restituisce un singolo contatto, 404 se non esiste
app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

// DELETE /api/persons/:id -> rimuove il contatto, 204 = successo senza contenuto da restituire
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// POST /api/persons -> aggiunge un nuovo contatto dopo aver validato i dati in ingresso
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    // 400 = Bad Request: mancano campi obbligatori
    return response.status(400).json({
      error: 'name or number missing',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
