// @flow
const config = require('../config')
const AWS = require('aws-sdk')
const sharp = require('sharp')
const uuidv4 = require('uuid/v4')
const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

const s3 = new AWS.S3({
  httpOptions: {
    timeout: 240000,
    maxRetries: 2
  }
})

const saveToS3 = async (image, uuid, type, options) => {
  let mimeType
  let extension
  const subfolder = options.subfolder || 'asset-upload'
  const subfolderID = options.subfolderID || 'temp'
  if (type === 'png') {
    mimeType = 'image/png'
    extension = 'png'
  } else if (type === 'jpg') {
    mimeType = 'image/jpeg'
    extension = 'jpg'
  } else if (type === 'webp') {
    mimeType = 'image/webp'
    extension = 'webp'
  }
  const key = `asset-upload/${subfolder}/${subfolderID}/${uuid}.${extension}`
  log.info(`saving to s3: ${key}`)
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: config.S3_BUCKET,
      Key: key,
      Body: image,
      ContentType: mimeType
    },
    (error, data) => {
      if (error) reject(error)
      log.info(`saved ${key}`)
      resolve()
    }
    )
  })
}

module.exports = function (app: any) {
  app.post('/image/upload', async (req: any, res: any) => {
    const defaultOptions = {
      subfolder: 'asset-upload',
      subfolderID: 'temp'
    }
    const { image, options } = req.body
    const currentOptions = Object.assign(defaultOptions, options)
    const { subfolder, subfolderID } = currentOptions
    try {
      const dataArr = image.split(',')
      // const dataInfoArr = dataArr[0].split(':')[1].split(';')
      // const dataType = dataInfoArr[0]
      const data = dataArr[1]
      const buff = Buffer.from(data, 'base64')
      const sharpImage = sharp(buff)
      const metadata = await sharpImage.metadata()
      console.log(metadata)

      const imageUUID = uuidv4()

      // create a JPEG
      try {
        const jpgFile = await sharpImage.jpeg().toBuffer()
        await saveToS3(jpgFile, imageUUID, 'jpg', options)
      } catch (error) {
        log.error('failed to save JPG')
        throw error
      }

      // create a WEBP
      try {
        const webpFile = await sharpImage.webp().toBuffer()
        await saveToS3(webpFile, imageUUID, 'webp', options)
      } catch (error) {
        log.error('failed to save WEBP')
        throw error
      }

      const result = {
        success: true,
        uuid: imageUUID,
        webpcheckURL: `${config.BASE_URL}/img?id=${imageUUID}&subfolder=${subfolder}&subfolderID=${subfolderID}&format=jpg`,
        metadata,
        options
      }
      console.log(result)

      res.status(200).send(result)
    } catch (error) {
      console.error(error)
      log.error(error.message)
      res.status(500).send({ error })
    }
  })
}
