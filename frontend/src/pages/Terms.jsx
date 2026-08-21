import React from 'react';

export default function Terms({ setCurrentPage }) {
  return (
    <div className="terms-page glass-panel animate-slide-in">
      <div className="page-header">
        <button onClick={() => setCurrentPage('about')} className="back-btn">
          ← Back to About
        </button>
        <h2 className="terms-title">Terms of Service</h2>
      </div>

      <section className="terms-section">
        <h3>1. Permitted Retrieval Policy</h3>
        <p>
          This service is explicitly limited to retrieving public content that the user is authorized to download and that the hosting platform permits for public viewing. Users are prohibited from using this tool to:
        </p>
        <ul>
          <li>Retrieve private media requiring active login or credentials.</li>
          <li>Bypass Digital Rights Management (DRM) or encryption layers.</li>
          <li>Violate copyrights, trademark, or platform distribution rules.</li>
        </ul>
      </section>

      <section className="terms-section">
        <h3>2. Disclaimer of Liability</h3>
        <p>
          This project is an academic prototype provided "as is" for demonstration purposes. The developers make no warranty regarding the uptime, correctness of extraction, or compatibility with changing social network APIs. Users are solely responsible for ensuring they possess intellectual property clearance for any content processed through this tool.
        </p>
      </section>

      <section className="terms-section">
        <h3>3. Acceptable Use Rate Limits</h3>
        <p>
          To prevent denial-of-service and fair usage violations, client sessions are rate-limited. Requests exceeding limits are automatically dropped. Exploiting this demo API for commercial automated scraping is strictly forbidden.
        </p>
      </section>

      <style>{`
        .terms-page {
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
        .terms-title {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .terms-section {
          margin-bottom: 25px;
        }
        .terms-section h3 {
          font-size: 1.1rem;
          margin-bottom: 10px;
          color: var(--text-primary);
        }
        .terms-section p {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .terms-section ul {
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
