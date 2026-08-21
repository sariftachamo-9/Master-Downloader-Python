const { isValidUrl } = require('../services/url.service');

/**
 * Validates request body structure for media downloads.
 */
function validateDownloadRequest(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'A valid "url" field is required in the request body.'
    });
  }

  if (!isValidUrl(url)) {
    return res.status(422).json({
      status: 'error',
      code: 422,
      message: 'The URL provided does not have a valid syntax structure.'
    });
  }

  next();
}

module.exports = {
  validateDownloadRequest
};
