require('dotenv').config()
const getenv = require('getenv')

const config = {
  API_KEY: getenv('API_KEY'),
  BASE_URL: getenv('BASE_URL'),
  CDN_URL: getenv('CDN_URL'),
  S3_BUCKET: getenv('S3_BUCKET')
}

module.exports = config
