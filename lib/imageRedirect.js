// @flow
const config = require('../config')

module.exports = function (app: any) {
  app.get('/img', async (req, res) => {
    const id = req.query.id
    const subfolder = req.query.subfolder
    const subfolderID = req.query.subfolderID
    let format = req.query.format
    if (!id || !subfolder || !subfolderID || !format) {
      res.status(404).send('missing required parameters')
      return
    }

    // eslint-disable-next-line unicorn/prefer-includes
    if (req.headers.accept && req.headers.accept.indexOf('image/webp') !== -1) {
      format = 'webp'
    }
    res.redirect(302, `${config.CDN_URL}/asset-upload/${subfolder}/${subfolderID}/${id}.${format}`)
  })
}
