/**
 * GitHub Public URL Parser
 * Supports:
 * - https://github.com/username
 * - https://github.com/username/repo
 * - http://github.com/username/repo
 * - github.com/username/repo
 * - username/repo
 * - username
 */

const RESERVED_PATHS = new Set([
  'settings', 'explore', 'trending', 'topics', 'collections', 'events',
  'sponsors', 'pricing', 'about', 'contact', 'security', 'features',
  'enterprise', 'readme', 'stars', 'notifications', 'login', 'signup',
  'pulls', 'issues', 'marketplace', 'orgs'
]);

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const REPO_REGEX = /^[a-z\d._-]+$/i;

export function parseGitHubUrl(input) {
  if (!input || typeof input !== 'string') {
    return { error: 'Please provide a valid GitHub URL or username.' };
  }

  let cleaned = input.trim();

  // Remove leading @ if present
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1);
  }

  // Handle full or partial URLs
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^www\./i, '');

  // Check if starts with a foreign domain
  if (cleaned.includes('/') && !cleaned.toLowerCase().startsWith('github.com/') && cleaned.includes('.')) {
    const domain = cleaned.split('/')[0];
    if (domain.includes('.') && !domain.toLowerCase().includes('github.com')) {
      return { error: `Only GitHub URLs are supported (received: ${domain}).` };
    }
  }

  // Strip leading github.com/
  cleaned = cleaned.replace(/^github\.com\/?/i, '');

  // Strip git extension or trailing anchors/queries
  cleaned = cleaned.split('?')[0].split('#')[0];
  cleaned = cleaned.replace(/\.git$/i, '');
  cleaned = cleaned.replace(/\/+$/, ''); // Remove trailing slashes

  const parts = cleaned.split('/').map(p => decodeURIComponent(p).trim()).filter(Boolean);

  if (parts.length === 0) {
    return { error: 'Please enter a GitHub profile or repository URL.' };
  }

  const owner = parts[0];

  if (!USERNAME_REGEX.test(owner) || RESERVED_PATHS.has(owner.toLowerCase())) {
    return { error: `"${owner}" is not a valid public GitHub username or organization.` };
  }

  if (parts.length === 1) {
    return {
      type: 'profile',
      owner,
      url: `https://github.com/${owner}`,
      cleanIdentifier: owner
    };
  }

  if (parts.length >= 2) {
    const repo = parts[1];
    if (!REPO_REGEX.test(repo) || RESERVED_PATHS.has(repo.toLowerCase())) {
      return { error: `"${repo}" is not a valid GitHub repository name.` };
    }

    return {
      type: 'repository',
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}`,
      cleanIdentifier: `${owner}/${repo}`
    };
  }

  return { error: 'Invalid GitHub URL format.' };
}

export default { parseGitHubUrl };
