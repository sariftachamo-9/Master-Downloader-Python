// Resolve backend API URL from environment variables, fallback to local default
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

/**
 * Verifies backend API server state.
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) return { status: 'error', database: 'unknown' };
    return await response.json();
  } catch (err) {
    return { status: 'error', database: 'offline', message: err.message };
  }
}

/**
 * Submits download request for social media or web video link.
 * @param {string} url - Social or web video link
 * @returns {Promise<Object>} - Media payload on success
 */
export async function submitDownloadRequest(url) {
  const response = await fetch(`${API_URL}/api/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve media. Please make sure the URL is public and supported.');
  }

  return result.data;
}

/**
 * Generates stream playback URL for in-website video player
 */
export function getVideoStreamUrl(mediaId, sourceUrl) {
  return `${API_URL}/api/download/stream?mediaId=${mediaId || ''}&url=${encodeURIComponent(sourceUrl || '')}`;
}

/**
 * Generates direct attachment download URL
 */
export function getVideoDownloadUrl(mediaId, sourceUrl, title, format = '') {
  let url = `${API_URL}/api/download/file?mediaId=${mediaId || ''}&url=${encodeURIComponent(sourceUrl || '')}&title=${encodeURIComponent(title || 'video')}`;
  if (format) {
    url += `&format=${encodeURIComponent(format)}`;
  }
  return url;
}

/**
 * Fetches recent download logs.
 * @returns {Promise<Array>} - List of past requests
 */
export async function getDownloadHistory() {
  try {
    const response = await fetch(`${API_URL}/api/history`);
    if (!response.ok) throw new Error('Server returned error status code.');
    const result = await response.json();
    return result.data || [];
  } catch (err) {
    console.error('Failed to get download history:', err);
    return [];
  }
}


