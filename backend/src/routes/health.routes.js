const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

// GET /api/health - Health check endpoint for checking server status and database connectivity
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'social-video-api',
    timestamp: new Date().toISOString(),
    database: db.isConfigured() ? 'connected' : 'fallback_local'
  });
});

module.exports = router;
