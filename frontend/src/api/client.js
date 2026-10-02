/**
 * API Client for Roast My GitHub backend
 */

const API_BASE = '/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.code = data.error;
    throw error;
  }
  return data;
}

export async function analyzeTarget(urlOrUsername, intensity = 'brutal') {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: urlOrUsername, intensity })
  });
  return handleResponse(res);
}

// Alias for backward compatibility
export const analyzeProfile = analyzeTarget;

export async function getCachedScan(identifier) {
  const res = await fetch(`${API_BASE}/scan/${encodeURIComponent(identifier)}`);
  return handleResponse(res);
}

export async function getRepositoryAnalysis(username, repo) {
  const res = await fetch(`${API_BASE}/repository/${encodeURIComponent(username)}/${encodeURIComponent(repo)}`);
  return handleResponse(res);
}

export async function regenerateRoast(identifier, intensity) {
  const res = await fetch(`${API_BASE}/roast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, intensity })
  });
  return handleResponse(res);
}

export async function rescanProfile(identifier, intensity = 'brutal') {
  const res = await fetch(`${API_BASE}/rescan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, intensity })
  });
  return handleResponse(res);
}
