const { PLATFORM_PATTERNS } = require('../validators/url.validator');
const { cleanUrl } = require('./url.service');

/**
 * Detects the social media platform based on matching URL regexes.
 * @param {string} url - The input URL
 * @returns {string} - The detected platform string ('tiktok', 'instagram', 'youtube', 'facebook', 'twitter', or 'unknown')
 */
function detectPlatform(url) {
  if (!url) return 'unknown';
  const cleaned = cleanUrl(url);

  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(cleaned)) {
      return platform;
    }
  }
  return 'unknown';
}

module.exports = {
  detectPlatform
};
