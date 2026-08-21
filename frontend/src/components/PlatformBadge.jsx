import React from 'react';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#ff0000', glow: 'rgba(255, 0, 0, 0.4)' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#e1306c', glow: 'rgba(225, 48, 108, 0.4)' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#ff0050', glow: 'rgba(255, 0, 80, 0.4)' },
  { id: 'facebook', name: 'Facebook', icon: '👥', color: '#1877f2', glow: 'rgba(24, 119, 242, 0.4)' },
  { id: 'twitter', name: 'Twitter / X', icon: '🐦', color: '#1da1f2', glow: 'rgba(29, 161, 242, 0.4)' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', color: '#ff4500', glow: 'rgba(255, 69, 0, 0.4)' },
  { id: 'vimeo', name: 'Vimeo', icon: '▶️', color: '#1ab7ea', glow: 'rgba(26, 183, 234, 0.4)' },
  { id: 'twitch', name: 'Twitch', icon: '🎮', color: '#9146ff', glow: 'rgba(145, 70, 255, 0.4)' },
  { id: 'web', name: '1000+ Sites', icon: '🌐', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' }
];

export default function PlatformBadge({ detectedPlatform }) {
  return (
    <div className="platforms-container">
      <div className="platforms-label">Supported Platforms:</div>
      <div className="badges-list">
        {PLATFORMS.map((platform) => {
          const isActive = detectedPlatform === platform.id;
          return (
            <div
              key={platform.id}
              className={`platform-badge ${isActive ? 'active' : ''}`}
              style={{
                '--platform-color': platform.color,
                '--platform-glow': platform.glow
              }}
            >
              <span className="badge-icon">{platform.icon}</span>
              <span className="badge-name">{platform.name}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        .platforms-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          margin-bottom: 25px;
          width: 100%;
        }
        .platforms-label {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .badges-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }
        .platform-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 30px;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: default;
        }
        .platform-badge.active {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--platform-color);
          color: var(--text-primary);
          box-shadow: 0 0 15px var(--platform-glow);
          transform: translateY(-2px) scale(1.05);
        }
        .badge-icon {
          font-size: 1rem;
        }
        @media (max-width: 480px) {
          .badges-list {
            gap: 8px;
          }
          .platform-badge {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
