import React, { useState } from 'react';
import DownloadButton from './DownloadButton';
import { getVideoStreamUrl, getVideoDownloadUrl } from '../services/api';

export default function ResultCard({ result }) {
  if (!result) return null;

  const [selectedFormat, setSelectedFormat] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const isImage = result.mediaType === 'image';
  const isGallery = result.mediaType === 'gallery' && result.gallery && result.gallery.length > 0;
  const isAudio = selectedFormat === 'audio_mp3';

  const streamSrc = getVideoStreamUrl(result.mediaId, result.sourceUrl);
  const formats = result.formats && result.formats.length > 0 ? result.formats : [];

  // Determine button text and file extension
  let downloadLabel = '📥 Download Video (Best Quality)';
  let downloadFileName = result.fileName;

  if (isImage) {
    downloadLabel = '📸 Download High-Res Image';
    downloadFileName = result.fileName || 'image.jpg';
  } else if (isAudio) {
    downloadLabel = '🎵 Download MP3 Audio (320 kbps)';
    downloadFileName = result.fileName?.replace(/\.[a-z0-9]+$/i, '.mp3') || 'audio.mp3';
  } else if (selectedFormat) {
    const matchedFmt = formats.find(f => f.formatId === selectedFormat);
    if (matchedFmt) {
      downloadLabel = `📥 Download ${matchedFmt.label}`;
    }
  }

  return (
    <div className="result-card glass-panel animate-slide-in">
      <div className="media-preview-wrapper">
        {isImage ? (
          <div className="image-preview-container">
            <img 
              src={result.thumbnail || streamSrc} 
              alt={result.title} 
              className="result-image"
              loading="lazy"
            />
            <div className="image-overlay-badge">High-Res Image</div>
          </div>
        ) : isGallery ? (
          <div className="gallery-preview-container">
            {result.gallery[activeGalleryIdx] && (
              <img 
                src={result.gallery[activeGalleryIdx].thumbnail || result.gallery[activeGalleryIdx].url} 
                alt={`Item ${activeGalleryIdx + 1}`} 
                className="result-image"
              />
            )}
            <div className="gallery-navigation">
              <span className="gallery-counter">
                {activeGalleryIdx + 1} / {result.gallery.length}
              </span>
              <div className="gallery-buttons">
                <button 
                  type="button"
                  className="gallery-nav-btn"
                  disabled={activeGalleryIdx === 0}
                  onClick={() => setActiveGalleryIdx(prev => Math.max(0, prev - 1))}
                >
                  ◀
                </button>
                <button 
                  type="button"
                  className="gallery-nav-btn"
                  disabled={activeGalleryIdx === result.gallery.length - 1}
                  onClick={() => setActiveGalleryIdx(prev => Math.min(result.gallery.length - 1, prev + 1))}
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="player-wrapper">
            <video 
              key={streamSrc}
              src={streamSrc} 
              poster={result.thumbnail}
              controls 
              className="result-video"
              playsInline
              preload="metadata"
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
            />
            {!videoLoaded && !videoError && (
              <div className="player-loading-overlay">
                <div className="spinner"></div>
                <span>Preparing live preview...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="result-info">
        <div className="result-header">
          <div className="platform-and-tags">
            <span className={`result-platform ${result.platform}`}>
              {(result.platform || 'WEB').toUpperCase()}
            </span>
            {formats.some(f => f.label?.includes('4K') || f.label?.includes('2160p')) && (
              <span className="badge-4k">✨ 4K ULTRA HD</span>
            )}
            {formats.some(f => f.label?.includes('1080p')) && !formats.some(f => f.label?.includes('4K')) && (
              <span className="badge-fhd">💎 FULL HD</span>
            )}
            {formats.some(f => f.label?.includes('60fps')) && (
              <span className="badge-fps">⚡ 60 FPS</span>
            )}
            {isImage && (
              <span className="badge-img">📸 RAW RESOLUTION</span>
            )}
          </div>
          <span className="result-duration">
            {isImage ? '🖼️ Photo' : isGallery ? `📚 ${result.gallery.length} Photos` : `⏱️ ${result.duration}`}
          </span>
        </div>

        <h3 className="result-title">{result.title}</h3>
        {result.uploader && <div className="result-author">👤 {result.uploader}</div>}

        <div className="result-metadata">
          <div className="meta-item">
            <span className="meta-label">Est. File Size</span>
            <span className="meta-value">{result.formattedSize || 'Full HD Stream'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Engine Fidelity</span>
            <span className="meta-value text-green">
              {isImage ? 'Original Uncompressed' : '100% Lossless FFmpeg Merged'}
            </span>
          </div>
        </div>

        {!isImage && formats.length > 0 && (
          <div className="quality-selector-box">
            <div className="format-header-row">
              <label className="format-label">Select Resolution / Format:</label>
              <div className="quick-format-pills">
                <button 
                  type="button" 
                  className={`pill-btn ${selectedFormat === '' ? 'active' : ''}`}
                  onClick={() => setSelectedFormat('')}
                >
                  ✨ Max Quality
                </button>
                {formats.find(f => f.label?.includes('1080p')) && (
                  <button 
                    type="button" 
                    className={`pill-btn ${selectedFormat === formats.find(f => f.label?.includes('1080p'))?.formatId ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(formats.find(f => f.label?.includes('1080p'))?.formatId || '')}
                  >
                    1080p
                  </button>
                )}
                {formats.find(f => f.label?.includes('720p')) && (
                  <button 
                    type="button" 
                    className={`pill-btn ${selectedFormat === formats.find(f => f.label?.includes('720p'))?.formatId ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(formats.find(f => f.label?.includes('720p'))?.formatId || '')}
                  >
                    720p
                  </button>
                )}
                <button 
                  type="button" 
                  className={`pill-btn pill-audio ${selectedFormat === 'audio_mp3' ? 'active' : ''}`}
                  onClick={() => setSelectedFormat('audio_mp3')}
                >
                  🎵 MP3 (320k)
                </button>
              </div>
            </div>
            <select 
              className="format-select"
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="">✨ Best Quality Available (Auto Maximum Resolution)</option>
              {formats.map((fmt, idx) => (
                <option key={idx} value={fmt.formatId}>
                  {fmt.label} {fmt.sizeFormatted !== 'N/A' && fmt.sizeFormatted !== 'Audio' ? `• ${fmt.sizeFormatted}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="action-row">
          <DownloadButton 
            mediaId={result.mediaId}
            sourceUrl={isGallery && result.gallery[activeGalleryIdx] ? result.gallery[activeGalleryIdx].url : result.sourceUrl}
            fileName={downloadFileName}
            title={result.title}
            format={selectedFormat}
          >
            {downloadLabel}
          </DownloadButton>
        </div>
      </div>

      <style>{`
        .result-card {
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
        }
        .media-preview-wrapper {
          position: relative;
          background: #090d16;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 280px;
        }
        .player-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-preview-container, .gallery-preview-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050811;
          padding: 10px;
        }
        .result-image {
          max-width: 100%;
          max-height: 340px;
          object-fit: contain;
          border-radius: 12px;
        }
        .image-overlay-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(16, 185, 129, 0.85);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }
        .gallery-navigation {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(15, 23, 42, 0.85);
          padding: 6px 14px;
          border-radius: 30px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gallery-counter {
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .gallery-buttons {
          display: flex;
          gap: 6px;
        }
        .gallery-nav-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 15px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: background 0.2s;
        }
        .gallery-nav-btn:hover:not(:disabled) {
          background: var(--accent-cyan);
        }
        .gallery-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .result-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: absolute;
          top: 0;
          left: 0;
          background: #000;
        }
        .player-loading-overlay {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          pointer-events: none;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(6, 182, 212, 0.2);
          border-top-color: var(--accent-cyan);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .result-info {
          padding: 26px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
        }
        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .platform-and-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .badge-4k {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
          animation: pulse 2s infinite;
        }
        .badge-fhd {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }
        .badge-fps {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 6px;
        }
        .badge-img {
          background: rgba(168, 85, 247, 0.2);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.4);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 6px;
        }
        .format-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }
        .quick-format-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .pill-btn {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3px 9px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pill-btn:hover {
          background: rgba(6, 182, 212, 0.2);
          color: white;
          border-color: var(--accent-cyan);
        }
        .pill-btn.active {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          color: white;
          border-color: transparent;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
        }
        .pill-audio.active {
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
        }
        .result-platform {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.75rem;
          padding: 5px 12px;
          border-radius: 30px;
          letter-spacing: 0.05em;
        }
        .result-platform.youtube { background: rgba(255, 0, 0, 0.15); color: #ef4444; border: 1px solid rgba(255, 0, 0, 0.2); }
        .result-platform.instagram { background: rgba(225, 48, 108, 0.15); color: #ec4899; border: 1px solid rgba(225, 48, 108, 0.2); }
        .result-platform.tiktok { background: rgba(255, 255, 255, 0.15); color: #f3f4f6; border: 1px solid rgba(255, 255, 255, 0.2); }
        .result-platform.facebook { background: rgba(24, 119, 242, 0.15); color: #3b82f6; border: 1px solid rgba(24, 119, 242, 0.2); }
        .result-platform.twitter { background: rgba(29, 161, 242, 0.15); color: #06b6d4; border: 1px solid rgba(29, 161, 242, 0.2); }
        .result-platform.reddit { background: rgba(255, 69, 0, 0.15); color: #ff4500; border: 1px solid rgba(255, 69, 0, 0.2); }
        .result-platform.web { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.2); }
        
        .result-duration {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .result-title {
          font-size: 1.1rem;
          color: var(--text-primary);
          line-height: 1.4;
          font-weight: 600;
        }
        .result-author {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: -6px;
        }
        .result-metadata {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 10px 0;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .meta-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .meta-value {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .text-green {
          color: #22c55e;
        }
        .quality-selector-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .format-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .format-select {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        .format-select:focus {
          border-color: var(--accent-cyan);
        }
        @media (max-width: 768px) {
          .result-card {
            grid-template-columns: 1fr;
          }
          .media-preview-wrapper, .player-wrapper, .image-preview-container {
            min-height: 220px;
          }
          .result-info {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
