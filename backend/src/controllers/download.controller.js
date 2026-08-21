const path = require('path');
const fs = require('fs');
const db = require('../database/supabase');
const { detectPlatform } = require('../services/platform.service');
const { processMedia, ensureMediaFile } = require('../services/media.service');
const logger = require('../utils/logger');

function getMimeType(ext) {
  switch ((ext || '').toLowerCase()) {
    case 'mp3': return 'audio/mpeg';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'webm': return 'video/webm';
    case 'mkv': return 'video/x-matroska';
    default: return 'video/mp4';
  }
}

/**
 * Handles incoming media extraction & download request logic.
 */
async function handleDownload(req, res, next) {
  const { url } = req.body;
  const userId = req.body.userId || null;
  
  let dbRequest = null;
  let detectedPlatform = 'unknown';

  try {
    // 1. Detect platform from URL
    detectedPlatform = detectPlatform(url);
    if (detectedPlatform === 'unknown') {
      detectedPlatform = 'web';
    }

    // 2. Insert initial pending download request in database
    dbRequest = await db.insertRequest({
      userId,
      sourceUrl: url,
      platform: detectedPlatform,
      status: 'pending'
    });

    // 3. Mark request status as processing
    await db.updateRequest(dbRequest.id, { status: 'processing' });

    // 4. Process/retrieve the media metadata (supports 4K video, audio, full-res images, galleries)
    const mediaResult = await processMedia(url, detectedPlatform);

    // 5. Complete requests logs in database
    await db.updateRequest(dbRequest.id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });

    // 6. Add request to download history table
    await db.insertHistory({
      userId,
      requestId: dbRequest.id,
      platform: mediaResult.platform || detectedPlatform,
      fileName: mediaResult.fileName
    });

    // Return the streamable media result with dedicated backend streaming and download routes
    return res.status(200).json({
      status: 'success',
      data: {
        id: dbRequest.id,
        mediaId: mediaResult.mediaId,
        mediaType: mediaResult.mediaType || 'video',
        title: mediaResult.title,
        uploader: mediaResult.uploader || 'Creator',
        thumbnail: mediaResult.thumbnail,
        duration: mediaResult.duration,
        formattedSize: mediaResult.formattedSize,
        sizeBytes: mediaResult.sizeBytes,
        platform: mediaResult.platform,
        sourceUrl: url,
        fileName: mediaResult.fileName,
        gallery: mediaResult.gallery || [],
        streamUrl: `/api/download/stream?mediaId=${mediaResult.mediaId}&url=${encodeURIComponent(url)}`,
        downloadUrl: `/api/download/file?mediaId=${mediaResult.mediaId}&url=${encodeURIComponent(url)}&title=${encodeURIComponent(mediaResult.title)}`,
        formats: mediaResult.formats || []
      }
    });

  } catch (error) {
    logger.error(`Failed to download media: ${error.message}`, { url, platform: detectedPlatform });

    if (dbRequest) {
      await db.updateRequest(dbRequest.id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      }).catch(dbErr => logger.error(`Failed to update request error status: ${dbErr.message}`));
    }

    return res.status(500).json({
      status: 'error',
      code: 500,
      message: error.message || 'Failed to process media request. Ensure the link is public and accessible.'
    });
  }
}

/**
 * Streams media file to browser player with full HTTP Range support
 */
async function streamMedia(req, res) {
  const { mediaId, url, format } = req.query;

  if (!url && !mediaId) {
    return res.status(400).send('Missing url or mediaId parameter');
  }

  try {
    const mediaObj = await ensureMediaFile(url, mediaId, format);
    const filePath = typeof mediaObj === 'string' ? mediaObj : mediaObj.filePath;
    const ext = (typeof mediaObj === 'object' && mediaObj.ext) || 'mp4';

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Media file not found.');
    }

    const contentType = getMimeType(ext);

    res.sendFile(filePath, {
      headers: {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      }
    });
  } catch (err) {
    logger.error(`Error streaming media: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).send('Failed to stream media.');
    }
  }
}

/**
 * Triggers native browser download as an attachment file
 */
async function downloadFile(req, res) {
  const { mediaId, url, title, format } = req.query;

  if (!url && !mediaId) {
    return res.status(400).send('Missing url or mediaId parameter');
  }

  try {
    const mediaObj = await ensureMediaFile(url, mediaId, format);
    const filePath = typeof mediaObj === 'string' ? mediaObj : mediaObj.filePath;
    const ext = (typeof mediaObj === 'object' && mediaObj.ext) || 'mp4';

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Media file not found.');
    }

    const safeTitle = (title || 'media')
      .replace(/[/\\?%*:|"<>]/g, '')
      .trim()
      .substring(0, 100) || 'media';

    res.download(filePath, `${safeTitle}.${ext}`, (err) => {
      if (err && !res.headersSent) {
        logger.error(`Download error: ${err.message}`);
      }
    });
  } catch (err) {
    logger.error(`Error delivering download file: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).send('Failed to download media file.');
    }
  }
}

module.exports = {
  handleDownload,
  streamMedia,
  downloadFile
};
