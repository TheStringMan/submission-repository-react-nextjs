const app = require('./app') // the actual Express application
const config = require('./utils/config')
const logger = require('./utils/logger')

// The contents of the index.js file used for starting the application gets simplified as follows:
// The index.js file only imports the actual application from the app.js file and then starts the application.
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})