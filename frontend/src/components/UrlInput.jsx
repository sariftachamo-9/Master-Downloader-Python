import React from 'react';

export default function UrlInput({ url, setUrl, onSubmit, isLoading }) {
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.warn('Clipboard read permission denied. Please paste manually.', err);
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit();
    }
  };

  return (
    <form className="url-form glass-panel animate-slide-in" onSubmit={handleSubmit}>
      <div className="input-group">
        <div className="input-icon-wrapper">
          <span className="input-icon">🔗</span>
        </div>
        
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste social media video link here (TikTok, Instagram, YouTube...)"
          disabled={isLoading}
          className="media-input"
        />

        {url && !isLoading && (
          <button type="button" onClick={handleClear} className="clear-btn" title="Clear input">
            ✕
          </button>
        )}

        <button type="button" onClick={handlePaste} className="paste-btn" title="Paste from clipboard">
          📋 Paste
        </button>
      </div>

      <button type="submit" disabled={!url.trim() || isLoading} className="submit-btn">
        {isLoading ? (
          <span className="spinner-wrapper">
            <span className="spinner"></span>
            Analyzing Content...
          </span>
        ) : (
          <span>Fetch Media ⚡</span>
        )}
      </button>

      <style>{`
        .url-form {
          width: 100%;
          padding: 30px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 5px 10px;
          transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
        }
        .input-group:focus-within {
          border-color: var(--accent-purple);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
        }
        .input-icon-wrapper {
          padding: 10px;
          display: flex;
          align-items: center;
        }
        .input-icon {
          font-size: 1.2rem;
          color: var(--text-secondary);
        }
        .media-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          padding: 12px 10px;
          outline: none;
          min-width: 0;
        }
        .media-input::placeholder {
          color: var(--text-muted);
        }
        .clear-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.9rem;
          padding: 8px;
          border-radius: 50%;
          transition: color var(--transition-speed), background var(--transition-speed);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 5px;
        }
        .clear-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .paste-btn {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: var(--text-primary);
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.85rem;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: background var(--transition-speed), border-color var(--transition-speed);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .paste-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.3);
        }
        .submit-btn {
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
          color: white;
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 600;
          padding: 14px 28px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow var(--transition-speed);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.25);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(139, 92, 246, 0.4);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        .spinner-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
