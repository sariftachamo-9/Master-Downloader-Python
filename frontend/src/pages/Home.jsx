import React, { useState, useEffect } from 'react';
import UrlInput from '../components/UrlInput';
import PlatformBadge from '../components/PlatformBadge';
import ProgressBar from '../components/ProgressBar';
import ResultCard from '../components/ResultCard';
import ErrorMessage from '../components/ErrorMessage';
import { submitDownloadRequest } from '../services/api';

const LOCAL_PATTERNS = {
  tiktok: /tiktok\.com/i,
  instagram: /instagram\.com/i,
  youtube: /(youtube\.com|youtu\.be)/i,
  facebook: /(facebook\.com|fb\.watch|fb\.com)/i,
  twitter: /(twitter\.com|x\.com)/i
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Monitor URL typing to detect platform instantly on the client side
  useEffect(() => {
    let platformFound = 'unknown';
    if (url.trim()) {
      for (const [platform, pattern] of Object.entries(LOCAL_PATTERNS)) {
        if (pattern.test(url)) {
          platformFound = platform;
          break;
        }
      }
    }
    setDetectedPlatform(platformFound);
  }, [url]);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setProgressMsg('Analyzing URL structure...');

    // Progress simulation steps
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 20) {
          setProgressMsg('Verifying URL compliance...');
          return prev + 2;
        } else if (prev < 50) {
          setProgressMsg('Contacting platform servers...');
          return prev + 3;
        } else if (prev < 80) {
          setProgressMsg('Checking resource access rights...');
          return prev + 2;
        } else if (prev < 95) {
          setProgressMsg('Compiling direct stream link...');
          return prev + 1.5;
        }
        return prev;
      });
    }, 100);

    try {
      // Execute actual API call in parallel
      const data = await submitDownloadRequest(url);
      
      clearInterval(interval);
      setProgress(100);
      setProgressMsg('Media ready!');
      
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setIsLoading(false);
      setError(err.message || 'An error occurred while fetching media.');
    }
  };

  return (
    <div className="home-page animate-slide-in">
      <div className="hero-section">
        <h1 className="hero-title">
          Master <span className="glow-text">Downloader</span>
        </h1>
        <p className="hero-subtitle">
          Download ultra high-definition 4K/1080p videos, 320kbps MP3 audio, and full-resolution images from YouTube, Instagram, TikTok, Facebook, Twitter/X, Reddit, and 1000+ platforms.
        </p>
      </div>

      <UrlInput 
        url={url} 
        setUrl={setUrl} 
        onSubmit={handleFetch} 
        isLoading={isLoading} 
      />

      <PlatformBadge detectedPlatform={detectedPlatform} />

      {isLoading && (
        <ProgressBar progress={progress} statusMessage={progressMsg} />
      )}

      {error && <ErrorMessage message={error} />}

      {result && <ResultCard result={result} />}

      <style>{`
        .home-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-section {
          text-align: center;
          margin-bottom: 40px;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 15px;
          line-height: 1.1;
          letter-spacing: -0.04em;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.2rem;
          }
          .hero-subtitle {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
