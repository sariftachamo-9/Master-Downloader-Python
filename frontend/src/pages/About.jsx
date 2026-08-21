import React from 'react';

export default function About({ setCurrentPage }) {
  return (
    <div className="about-page glass-panel animate-slide-in">
      <h2 className="about-title">About the Project</h2>
      <p className="about-subtitle">
        Multi-Platform Social Media Media Downloader and Management System
      </p>

      <section className="about-section">
        <h3>Academic Prototype Scope</h3>
        <p>
          This application is designed as a university/academic prototype for processing authorized, publicly downloadable social media media. It is not intended to bypass platform access restrictions, DRM, private-content restrictions, or anti-bot protections.
        </p>
        <div className="alert alert-info">
          <strong>Academic Scope Declaration:</strong> The system is designed as a prototype for processing authorized/publicly downloadable social-media media and is not intended to bypass platform access restrictions or provide unrestricted commercial-scale downloading.
        </div>
      </section>

      <section className="about-section">
        <h3>Architecture Overview</h3>
        <p>
          The system leverages a modern decoupled architecture:
        </p>
        <ul>
          <li><strong>Frontend:</strong> React + Vite client utilizing Vanilla CSS with glassmorphic styling, responsive layout, and client-side URL pre-detection.</li>
          <li><strong>Backend API:</strong> Node.js + Express web service enforcing rate limiting, syntax validation, platform detection, and logging.</li>
          <li><strong>Database Storage:</strong> Supabase PostgreSQL tracking client fetch requests, completed actions, log states, and execution histories.</li>
        </ul>
      </section>

      <section className="about-section flex-row">
        <div className="card" onClick={() => setCurrentPage('terms')}>
          <h4>📜 Terms of Service</h4>
          <p>Read the ethical conditions and legal constraints governing prototype access.</p>
        </div>
        <div className="card" onClick={() => setCurrentPage('privacy')}>
          <h4>🔒 Privacy Policy</h4>
          <p>Learn about how request logs, user data, and system diagnostics are managed.</p>
        </div>
      </section>

      <style>{`
        .about-page {
          width: 100%;
          padding: 40px;
          border-radius: 24px;
        }
        .about-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .about-subtitle {
          font-size: 1rem;
          color: var(--accent-cyan);
          text-shadow: 0 0 10px var(--accent-cyan-glow);
          margin-bottom: 30px;
          font-family: var(--font-heading);
          font-weight: 600;
        }
        .about-section {
          margin-bottom: 30px;
        }
        .about-section h3 {
          font-size: 1.25rem;
          margin-bottom: 12px;
          font-weight: 600;
        }
        .about-section p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 15px;
        }
        .about-section ul {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .alert {
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.15);
          color: var(--text-primary);
          padding: 15px 20px;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-top: 15px;
        }
        .flex-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 40px;
        }
        .card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: 16px;
          cursor: pointer;
          transition: transform 0.2s, border-color var(--transition-speed);
        }
        .card:hover {
          border-color: var(--accent-purple);
          transform: translateY(-3px);
        }
        .card h4 {
          font-size: 1.05rem;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .card p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-bottom: 0;
        }
        @media (max-width: 600px) {
          .flex-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
