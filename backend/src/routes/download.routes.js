const express = require('express');
const router = express.Router();
const { handleDownload, streamMedia, downloadFile } = require('../controllers/download.controller');
const { validateDownloadRequest } = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimit');

// POST /api/download - Processes video url requests and metadata
router.post('/', rateLimiter, validateDownloadRequest, handleDownload);

// GET /api/download/stream - Streams playable MP4 to website video player with HTTP Range support
router.get('/stream', streamMedia);

// GET /api/download/file - Downloads full high-quality MP4 file attachment
router.get('/file', downloadFile);

module.exports = router;


