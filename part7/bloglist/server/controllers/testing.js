const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

// route usata solo dai test end-to-end per riportare il database a uno stato noto
// prima di ogni test, esattamente come fa beforeEach nei test del backend/frontend
testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter
