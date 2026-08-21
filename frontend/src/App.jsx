import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'history':
        return <History />;
      case 'about':
        return <About setCurrentPage={setCurrentPage} />;
      case 'privacy':
        return <Privacy setCurrentPage={setCurrentPage} />;
      case 'terms':
        return <Terms setCurrentPage={setCurrentPage} />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="app-footer glass-panel">
        <div className="footer-content">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Social Media Downloader. Developed as an Academic Demonstration Project.
          </p>
          <div className="footer-links">
            <span onClick={() => setCurrentPage('terms')}>Terms of Service</span>
            <span className="separator">•</span>
            <span onClick={() => setCurrentPage('privacy')}>Privacy Policy</span>
            <span className="separator">•</span>
            <span onClick={() => setCurrentPage('about')}>About</span>
          </div>
        </div>
      </footer>

      <style>{`
        .app-footer {
          margin: 40px auto 20px auto;
          max-width: 1200px;
          width: 95%;
          padding: 20px 30px;
          border-radius: 16px;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        .footer-copyright {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .footer-links span {
          cursor: pointer;
          transition: color var(--transition-speed);
        }
        .footer-links span:hover {
          color: var(--text-primary);
        }
        .separator {
          color: var(--text-muted);
          cursor: default !important;
        }
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
          .footer-links {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
