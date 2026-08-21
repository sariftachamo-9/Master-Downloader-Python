const db = require('../database/supabase');
const logger = require('../utils/logger');

/**
 * Retrieves public download history from the database.
 */
async function getHistory(req, res) {
  try {
    const history = await db.getHistory();
    return res.status(200).json({
      status: 'success',
      results: history.length,
      data: history
    });
  } catch (error) {
    logger.error(`Error retrieving history logs: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Could not fetch download history logs at this time.'
    });
  }
}

module.exports = {
  getHistory
};
