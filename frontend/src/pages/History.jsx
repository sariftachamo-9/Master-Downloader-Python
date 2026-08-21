import React, { useState, useEffect } from 'react';
import { getDownloadHistory } from '../services/api';

export default function History() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistoryLogs = async () => {
    setLoading(true);
    const data = await getDownloadHistory();
    setHistoryList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistoryLogs();
  }, []);

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="history-page glass-panel animate-slide-in">
      <div className="history-header">
        <h2 className="history-title">Download Request Logs</h2>
        <button onClick={fetchHistoryLogs} disabled={loading} className="refresh-btn">
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <p className="history-intro">
        This panel displays public media fetch requests successfully recorded in the database.
      </p>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Fetching database records...</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📁</span>
          <p className="empty-title">No history logs recorded yet</p>
          <p className="empty-text">Perform a fetch request from the Home page to populate logs.</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Output File Name</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={`hist-platform-badge ${item.platform}`}>
                      {item.platform}
                    </span>
                  </td>
                  <td className="file-name-cell">{item.file_name}</td>
                  <td className="timestamp-cell">{formatDate(item.created_at)}</td>
                  <td>
                    <span className="status-badge-success">Success</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .history-page {
          width: 100%;
          padding: 30px;
          border-radius: 24px;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .history-title {
          font-size: 1.75rem;
          font-weight: 700;
        }
        .refresh-btn {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.85rem;
          transition: background var(--transition-speed);
        }
        .refresh-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }
        .history-intro {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 25px;
        }
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 40px 0;
          color: var(--text-muted);
        }
        .loader {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(139, 92, 246, 0.2);
          border-top-color: var(--accent-purple);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.01);
          border-radius: 16px;
          border: 1px dashed var(--border-color);
        }
        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 15px;
        }
        .empty-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .empty-text {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .history-table-wrapper {
          overflow-x: auto;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .history-table th, .history-table td {
          padding: 16px 20px;
          font-size: 0.9rem;
        }
        .history-table th {
          font-family: var(--font-heading);
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }
        .history-table td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .hist-platform-badge {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .hist-platform-badge.youtube { background: rgba(255, 0, 0, 0.15); color: #ef4444; }
        .hist-platform-badge.instagram { background: rgba(225, 48, 108, 0.15); color: #ec4899; }
        .hist-platform-badge.tiktok { background: rgba(255, 255, 255, 0.15); color: #f3f4f6; }
        .hist-platform-badge.facebook { background: rgba(24, 119, 242, 0.15); color: #3b82f6; }
        .hist-platform-badge.twitter { background: rgba(29, 161, 242, 0.15); color: #06b6d4; }
        
        .file-name-cell {
          font-family: monospace;
          color: var(--text-primary);
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .timestamp-cell {
          color: var(--text-secondary);
        }
        .status-badge-success {
          color: #22c55e;
          font-weight: 600;
          font-size: 0.85rem;
          background: rgba(34, 197, 94, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
