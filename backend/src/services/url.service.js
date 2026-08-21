const { GENERAL_URL_REGEX } = require('../validators/url.validator');

/**
 * Normalizes input URL by trimming and ensuring it has a protocol.
 * @param {string} url - The raw URL string
 * @returns {string} - Cleaned URL
 */
function cleanUrl(url) {
  if (!url) return '';
  let cleaned = url.trim();
  
  // If protocol is missing, default to https
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

/**
 * Validates syntax of a URL.
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidUrl(url) {
  if (!url) return false;
  const cleaned = cleanUrl(url);
  try {
    // Basic regex syntax validation
    if (!GENERAL_URL_REGEX.test(cleaned)) {
      return false;
    }
    // Also verify via URL API constructor to verify format
    new URL(cleaned);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  cleanUrl,
  isValidUrl
};
