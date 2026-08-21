import React, { useState } from 'react';
import { getVideoDownloadUrl } from '../services/api';

export default function DownloadButton({ mediaId, sourceUrl, fileName, title, format, children }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);

    try {
      const targetUrl = getVideoDownloadUrl(mediaId, sourceUrl, title || fileName, format);

      if (!targetUrl) return;

      const link = document.createElement('a');
      link.href = targetUrl;
      link.setAttribute('download', fileName || 'video.mp4');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 2500);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      className="download-action-btn"
      disabled={downloading}
    >
      <span className="btn-icon">{downloading ? '⏳' : '⬇️'}</span>
      <span className="btn-label">{downloading ? 'Starting Download...' : (children || 'Save / Download MP4 Video')}</span>

      <style>{`
        .download-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          transition: transform 0.2s, box-shadow var(--transition-speed);
          box-shadow: 0 4px 15px var(--accent-cyan-glow);
          width: 100%;
        }
        .download-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
        }
        .download-action-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .download-action-btn:active {
          transform: translateY(0);
        }
        .btn-icon {
          font-size: 1.1rem;
        }
      `}</style>
    </button>
  );
}


