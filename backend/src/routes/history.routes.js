const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/history.controller');

// GET /api/history - Retrieve list of successfully processed media files
router.get('/', getHistory);

module.exports = router;
