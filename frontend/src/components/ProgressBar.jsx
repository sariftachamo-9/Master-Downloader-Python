import React from 'react';

export default function ProgressBar({ progress, statusMessage }) {
  return (
    <div className="progress-container glass-panel animate-slide-in">
      <div className="progress-header">
        <span className="status-message">{statusMessage || 'Processing request...'}</span>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <style>{`
        .progress-container {
          width: 100%;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 25px;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .status-message {
          color: var(--text-secondary);
        }
        .progress-percentage {
          color: var(--accent-cyan);
          text-shadow: 0 0 10px var(--accent-cyan-glow);
        }
        .progress-bar-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
          box-shadow: 0 0 10px var(--accent-cyan-glow);
          border-radius: 4px;
          transition: width 0.3s cubic-bezier(0.1, 0.8, 0.25, 1);
        }
      `}</style>
    </div>
  );
}
