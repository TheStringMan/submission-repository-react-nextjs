require('dotenv').config()
const express = require('express')
const Phonebook = require('./models/phonebook')
const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)
app.use(express.static('dist'))
app.use(express.json())



// GET INFO
app.get('/api/info', (request, response) => {
  Phonebook.find({}).then(people => {
    response.send('<h1>Phonebook has info for ' + people.length + ' people</h1> ' + new Date())
  })
})

// GET ALL
app.get('/api/persons', (request, response) => {
  Phonebook.find({}).then(people => {
    response.json(people)
  })
})

// GET ID
app.get('/api/persons/:id', (request, response, next) => {
  Phonebook.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// ADD ELEMENT
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Phonebook({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// PUT ELEMENT
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
    
  Phonebook.findById(request.params.id)
    .then(person => {
      if (person) {
        person.number = body.number

        person.save().then(savedPerson => {
          response.json(savedPerson)
        })
          .catch(error => next(error))
      } else {
        const newPerson = new Phonebook({
          name: body.name,
          number: body.number,
        })

        newPerson.save().then(savedPerson => {
          response.json(savedPerson)
        })
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
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

