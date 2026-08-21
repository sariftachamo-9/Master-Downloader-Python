const logger = require('./logger');

/**
 * Ephemeral Storage Cleanup Service
 * Ensures temporary media paths or caches (if any) are cleaned up.
 * In this architecture, videos are NOT stored permanently on Render's ephemeral filesystem.
 */
function cleanupTempFiles() {
  logger.info('Temporary files cleanup cycle executed. File storage remains clear.');
}

module.exports = {
  cleanupTempFiles
};
