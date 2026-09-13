const personsRouter = require('express').Router()
const Person = require('../models/person')

// GET /api/persons -> restituisce l'intero elenco dei contatti in JSON
personsRouter.get('/', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

// GET /api/persons/:id -> restituisce un singolo contatto, 404 se non esiste
personsRouter.get('/:id', (request, response, next) => {
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
personsRouter.delete('/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// POST /api/persons -> aggiunge un nuovo contatto dopo aver validato i dati in ingresso
personsRouter.post('/', (request, response, next) => {
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

personsRouter.put('/:id', (request, response, next) => {
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

module.exports = personsRouter
