const db = require('../database/supabase');

function log(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  // Print to stdout/stderr
  if (level === 'error') {
    console.error(`[${timestamp}] [${level.toUpperCase()}]: ${message}`, context);
  } else if (level === 'warn') {
    console.warn(`[${timestamp}] [${level.toUpperCase()}]: ${message}`, context);
  } else {
    console.log(`[${timestamp}] [${level.toUpperCase()}]: ${message}`, context);
  }

  // Attempt database logging
  db.insertLog(level, message, context).catch(() => {
    // Suppress errors to prevent endless logging loop or crashing
  });
}

module.exports = {
  info: (message, context) => log('info', message, context),
  warn: (message, context) => log('warn', message, context),
  error: (message, context) => log('error', message, context),
  debug: (message, context) => log('debug', message, context)
};
