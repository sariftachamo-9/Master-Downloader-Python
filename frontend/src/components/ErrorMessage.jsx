import React from 'react';

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="error-card glass-panel animate-slide-in">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">Unable to Process URL</h4>
        <p className="error-text">{message}</p>
      </div>

      <style>{`
        .error-card {
          width: 100%;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.05);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.1);
          display: flex;
          gap: 15px;
          align-items: flex-start;
          margin-bottom: 25px;
        }
        .error-icon {
          font-size: 1.5rem;
        }
        .error-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .error-title {
          font-family: var(--font-heading);
          color: #f87171;
          font-size: 1rem;
          font-weight: 600;
        }
        .error-text {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
