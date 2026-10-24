const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const customMiddleware = require('./utils/middleware')

// Token custom :body, usato nel formato di log qui sotto per mostrare il body delle POST
morgan.token('body', (request) => JSON.stringify(request.body))

const app = express()

// Middleware: legge il body JSON delle richieste (es. POST) e lo mette in request.body
app.use(customMiddleware.tokenExtractor)
app.use(express.json())
app.use(cors())
// Logga ogni richiesta (metodo, url, status, tempo di risposta, body) sulla console;
// va registrato dopo express.json() per poter leggere request.body già parsato
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// attiva solo in modalità test: nessun rischio che qualcuno azzeri
// il database vero (sviluppo/produzione) chiamando questa route per errore
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// serve the built Vite frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

app.use(customMiddleware.unknownEndpoint)
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(customMiddleware.errorHandler)

module.exports = app