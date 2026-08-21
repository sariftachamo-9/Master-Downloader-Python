const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const logger = require('../utils/logger');

// Path to video engine script and media cache
const ENGINE_SCRIPT = path.join(__dirname, 'video_engine.py');
const CACHE_DIR = path.join(__dirname, '..', 'media_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Executes the Python video engine script.
 * @param {'extract'|'download'} command
 * @param {string} url
 * @param {string} [formatId]
 * @returns {Promise<Object>}
 */
function runEngine(command, url, formatId = '') {
  return new Promise((resolve, reject) => {
    const args = [ENGINE_SCRIPT, command, url];
    if (formatId) {
      args.push(formatId);
    }

    const child = spawn('python', args, {
      windowsHide: true
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Video engine [${command}] failed (code ${code}): ${stderrData}`);
        return reject(new Error(stderrData || 'Failed to process media.'));
      }

      try {
        // Extract JSON string from potentially noisy stdout
        const jsonMatch = stdoutData.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON output from engine.');
        }
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.success) {
          return reject(new Error(parsed.error || 'Media processing failed.'));
        }
        resolve(parsed);
      } catch (err) {
        logger.error(`Failed to parse engine output: ${stdoutData}`);
        reject(new Error('Invalid response from media engine.'));
      }
    });

    child.on('error', (err) => {
      logger.error(`Engine spawn error: ${err.message}`);
      reject(new Error(`Failed to start media processing: ${err.message}`));
    });
  });
}

/**
 * Resolves metadata and prepares media sources for web playback and download.
 * 
 * @param {string} url - Validated URL
 * @param {string} platform - Detected platform
 * @returns {Promise<Object>}
 */
async function processMedia(url, platform) {
  logger.info(`Processing media request for platform: ${platform}, URL: ${url}`);

  const extracted = await runEngine('extract', url);
  const mediaId = extracted.mediaId;

  // Background prepare download so preview and download are instant
  runEngine('download', url).catch((err) => {
    logger.warn(`Background media preparation: ${err.message}`);
  });

  const sanitizedTitle = (extracted.title || 'media')
    .replace(/[/\\?%*:|"<>]/g, '')
    .trim()
    .substring(0, 80);

  const isImage = extracted.mediaType === 'image';
  const defaultExt = isImage ? 'jpg' : 'mp4';
  const fileName = `${sanitizedTitle || 'media'}.${defaultExt}`;

  return {
    mediaId: mediaId,
    mediaType: extracted.mediaType || 'video',
    title: extracted.title || `${platform.toUpperCase()} Media`,
    uploader: extracted.uploader || 'Creator',
    thumbnail: extracted.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    sizeBytes: extracted.sizeBytes || 0,
    formattedSize: extracted.formattedSize || 'Standard',
    duration: extracted.duration || (isImage ? 'Image' : 'N/A'),
    platform: platform !== 'unknown' ? platform : (extracted.extractor || 'web'),
    sourceUrl: url,
    fileName: fileName,
    gallery: extracted.gallery || [],
    formats: extracted.formats || []
  };
}

/**
 * Ensures media file is ready on disk and returns its absolute path and extension.
 */
async function ensureMediaFile(url, mediaId, formatId) {
  const isAudio = formatId === 'audio_mp3';
  const baseName = `${mediaId}_${formatId || 'default'}`;

  // Check for any cached files matching baseName
  const candidateExtensions = isAudio ? ['mp3'] : ['mp4', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'webp'];
  for (const ext of candidateExtensions) {
    const candidateFile = path.join(CACHE_DIR, `${baseName}.${ext}`);
    if (fs.existsSync(candidateFile) && fs.statSync(candidateFile).size > 1000) {
      return { filePath: candidateFile, ext };
    }
  }

  // Check default file
  for (const ext of candidateExtensions) {
    const defaultFile = path.join(CACHE_DIR, `${mediaId}.${ext}`);
    if (!formatId && fs.existsSync(defaultFile) && fs.statSync(defaultFile).size > 1000) {
      return { filePath: defaultFile, ext };
    }
  }

  logger.info(`Generating media file on demand for mediaId: ${mediaId} (format: ${formatId || 'default'})`);
  const result = await runEngine('download', url, formatId);
  return { filePath: result.filePath, ext: result.format || 'mp4' };
}

module.exports = {
  processMedia,
  ensureMediaFile,
  CACHE_DIR
};
