import React from 'react';

export default function Privacy({ setCurrentPage }) {
  return (
    <div className="privacy-page glass-panel animate-slide-in">
      <div className="page-header">
        <button onClick={() => setCurrentPage('about')} className="back-btn">
          ← Back to About
        </button>
        <h2 className="privacy-title">Privacy Policy</h2>
      </div>

      <section className="privacy-section">
        <h3>1. Data We Record</h3>
        <p>
          As an academic demonstration platform, this downloader records request parameters in a database to analyze usage logs and system performance:
        </p>
        <ul>
          <li><strong>Submitted URLs:</strong> Kept in database logs (`download_requests`) to trace platform distribution.</li>
          <li><strong>IP Addresses:</strong> Processed in-memory by Express rate-limiters to prevent denial-of-service, but never logged permanently.</li>
          <li><strong>Download History:</strong> Successfully processed items are indexed in `download_history` with filenames and completion intervals.</li>
        </ul>
      </section>

      <section className="privacy-section">
        <h3>2. Ephemeral Storage Design</h3>
        <p>
          We do not store target videos on our servers. Media URLs are parsed, validated, and returned directly to the browser Client as redirect headers or stream targets. No user assets are cached permanently on Render's local drives, respecting third-party platform copyright terms.
        </p>
      </section>

      <section className="privacy-section">
        <h3>3. Data Deletion</h3>
        <p>
          Since this is a college prototype, all records are stored in the database's free tier and are cleared periodically. Users can contact the developer team to delete specific url logs.
        </p>
      </section>

      <style>{`
        .privacy-page {
          width: 100%;
          padding: 40px;
          border-radius: 24px;
        }
        .page-header {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }
        .back-btn {
          align-self: flex-start;
          background: transparent;
          border: none;
          color: var(--accent-purple);
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
          transition: transform var(--transition-speed);
        }
        .back-btn:hover {
          transform: translateX(-4px);
        }
        .privacy-title {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .privacy-section {
          margin-bottom: 25px;
        }
        .privacy-section h3 {
          font-size: 1.1rem;
          margin-bottom: 10px;
          color: var(--text-primary);
        }
        .privacy-section p {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .privacy-section ul {
          color: var(--text-secondary);
          font-size: 0.92rem;
          margin-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}
