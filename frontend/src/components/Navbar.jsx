import React, { useEffect, useState } from 'react';
import { checkApiHealth } from '../services/api';

export default function Navbar({ currentPage, setCurrentPage }) {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    async function getStatus() {
      const status = await checkApiHealth();
      if (status.status === 'ok') {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    }
    getStatus();
    const interval = setInterval(getStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar glass-panel">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => setCurrentPage('home')}>
          <img src="/logo.svg" alt="Master Downloader Logo" className="logo-img" />
          <span className="logo-text">Master<span className="glow-text">Downloader</span></span>
        </div>

        <ul className="nav-links">
          <li className={currentPage === 'home' ? 'active' : ''} onClick={() => setCurrentPage('home')}>
            Home
          </li>
          <li className={currentPage === 'history' ? 'active' : ''} onClick={() => setCurrentPage('history')}>
            History Log
          </li>
          <li className={currentPage === 'about' ? 'active' : ''} onClick={() => setCurrentPage('about')}>
            Scope & About
          </li>
        </ul>

        <div className="nav-status">
          <span className={`status-dot ${apiStatus}`}></span>
          <span className="status-label">API: {apiStatus}</span>
        </div>
      </div>

      <style>{`
        .navbar {
          margin: 20px auto 0 auto;
          max-width: 1200px;
          width: 95%;
          padding: 15px 30px;
          border-radius: 20px;
          z-index: 100;
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 800;
          font-size: 1.25rem;
          font-family: var(--font-heading);
        }
        .logo-img {
          width: 34px;
          height: 34px;
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.5));
          transition: transform 0.3s ease;
        }
        .nav-logo:hover .logo-img {
          transform: scale(1.1) rotate(5deg);
        }
        .logo-text {
          letter-spacing: -0.03em;
        }
        .nav-links {
          display: flex;
          list-style: none;
          gap: 24px;
        }
        .nav-links li {
          cursor: pointer;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: color var(--transition-speed), transform var(--transition-speed);
          position: relative;
          padding: 5px 0;
        }
        .nav-links li:hover {
          color: var(--text-primary);
        }
        .nav-links li.active {
          color: var(--accent-purple);
          font-weight: 600;
        }
        .nav-links li.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
          border-radius: 2px;
          box-shadow: 0 0 10px var(--accent-purple-glow);
        }
        .nav-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 6px 12px;
          border-radius: 30px;
          border: 1px solid var(--border-color);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-dot.checking {
          background-color: #eab308;
          box-shadow: 0 0 8px #eab308;
        }
        .status-dot.online {
          background-color: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }
        .status-dot.offline {
          background-color: #ef4444;
          box-shadow: 0 0 8px #ef4444;
        }
        .status-label {
          text-transform: capitalize;
          color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 15px 20px;
          }
          .nav-links {
            gap: 15px;
          }
          .nav-status {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
