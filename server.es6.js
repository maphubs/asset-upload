const express = require('express')
const cors = require('cors')
const imageUpload = require('./lib/imageUpload')
const imageRedirect = require('./lib/imageRedirect')
const bodyParser = require('body-parser')
const config = require('./config')

const PORT = 4012

const app = express()
app.enable('trust proxy')
app.disable('x-powered-by')
app.use('*', cors({ origin: '*' }))
app.use(bodyParser.json({ limit: '250mb' }))

imageRedirect(app) // auth not required

// check if API key is present
app.use((request, response, next) => {
  if (request.headers.authorization) {
    const authParts = request.headers.authorization.split(' ')
    if (authParts && authParts.length === 2 &&
      authParts[0] === 'Bearer' &&
      authParts[1] === config.API_KEY) {
      next()
      return true
    }
  }
  response.status(401).send('API key required')
})

imageUpload(app)

app.use((error, request, response, next) => {
  const statusCode = error.status || 500
  if (request.accepts('json')) {
    response.status(statusCode).send({
      error: error.message,
      url: request.url
    })
  } else {
    response.status(statusCode).send(error.message)
  }
})

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
