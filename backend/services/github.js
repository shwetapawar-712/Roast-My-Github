const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

function getHeaders() {
  const headers = {
    'User-Agent': 'RoastMyGitHub-App/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

/**
 * Normalizes Axios errors into standard human-readable exceptions
 */
function handleApiError(err, targetName, type = 'profile') {
  if (err.response) {
    if (err.response.status === 404) {
      const msg = type === 'profile'
        ? `We couldn't find public GitHub profile @${targetName}. Check spelling or access.`
        : `Repository "${targetName}" was not found or is private. Only public repositories can be audited.`;
      const error = new Error(msg);
      error.code = 'NOT_FOUND';
      error.status = 404;
      return error;
    }
    if (err.response.status === 403 || err.response.status === 429) {
      const error = new Error('GitHub API rate limit reached. Please configure GITHUB_TOKEN in your .env file or try again later.');
      error.code = 'RATE_LIMITED';
      error.status = 429;
      return error;
    }
  }
  const error = new Error(`GitHub API connection error: ${err.message}`);
  error.code = 'API_ERROR';
  error.status = 502;
  return error;
}

/**
 * Fetch a single repository in depth
 */
async function fetchSingleRepository(owner, repo) {
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const headers = getHeaders();

  let repoRes;
  try {
    repoRes = await axios.get(`${GITHUB_API_BASE}/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}`, {
      headers,
      timeout: 10000
    });
  } catch (err) {
    throw handleApiError(err, `${cleanOwner}/${cleanRepo}`, 'repository');
  }

  const r = repoRes.data;
  const repoData = {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner?.login || cleanOwner,
    ownerAvatarUrl: r.owner?.avatar_url || '',
    description: r.description || '',
    language: r.language || 'Plain Text',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    openIssues: r.open_issues_count || 0,
    topics: Array.isArray(r.topics) ? r.topics : [],
    license: r.license ? r.license.spdx_id || r.license.name : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at || r.updated_at,
    archived: Boolean(r.archived),
    isFork: Boolean(r.fork),
    defaultBranch: r.default_branch || 'main',
    htmlUrl: r.html_url,
    size: r.size || 0
  };

  // Fetch README content
  let readmeInfo = { hasReadme: false, readmeContent: '' };
  try {
    const readmeRes = await axios.get(`${GITHUB_API_BASE}/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/readme`, {
      headers: {
        ...headers,
        'Accept': 'application/vnd.github.v3.raw'
      },
      timeout: 6000,
      transformResponse: [(data) => data]
    });
    if (readmeRes.status === 200 && typeof readmeRes.data === 'string') {
      readmeInfo = {
        hasReadme: true,
        readmeContent: readmeRes.data.slice(0, 12000)
      };
    }
  } catch (err) {
    readmeInfo = { hasReadme: false, readmeContent: '' };
  }

  // Fetch Root Contents listing
  let rootFiles = [];
  let securityAvailable = true;
  try {
    const contentsRes = await axios.get(`${GITHUB_API_BASE}/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/contents/`, {
      headers,
      timeout: 6000
    });
    if (Array.isArray(contentsRes.data)) {
      rootFiles = contentsRes.data.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size || 0
      }));
    }
  } catch (err) {
    if (err.response && err.response.status === 403) {
      securityAvailable = false;
    }
    rootFiles = [];
  }

  return {
    target: {
      type: 'repository',
      owner: cleanOwner,
      repo: cleanRepo,
      url: `https://github.com/${cleanOwner}/${cleanRepo}`
    },
    repository: repoData,
    repoDetails: [
      {
        repo: repoData,
        readmeInfo,
        rootFiles,
        securityAvailable
      }
    ],
    allRepositories: [repoData],
    analyzedRepositories: [repoData],
    archivedRepositories: repoData.archived ? [repoData] : [],
    forkRepositories: repoData.isFork ? [repoData] : [],
    excludedRepositories: [],
    totalPublic: 1,
    totalScanned: 1
  };
}

/**
 * Fetches user profile, repository list, and lightweight repo metadata
 * strictly limited to 10-12 non-fork, non-archived active repositories.
 */
async function fetchProfileData(username) {
  const cleanUsername = username.trim();
  const headers = getHeaders();

  // 1. Fetch User Profile
  let userRes;
  try {
    userRes = await axios.get(`${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUsername)}`, {
      headers,
      timeout: 10000
    });
  } catch (err) {
    throw handleApiError(err, cleanUsername, 'profile');
  }

  const u = userRes.data;
  const profile = {
    username: u.login,
    name: u.name || u.login,
    avatarUrl: u.avatar_url,
    bio: u.bio || '',
    websiteUrl: u.blog || '',
    company: u.company || '',
    location: u.location || '',
    twitterUsername: u.twitter_username || '',
    followers: u.followers || 0,
    following: u.following || 0,
    publicRepos: u.public_repos || 0,
    createdAt: u.created_at,
    htmlUrl: u.html_url
  };

  // 2. Fetch Repositories (up to 100 to get a full overview)
  let reposRes;
  try {
    reposRes = await axios.get(`${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=pushed`, {
      headers,
      timeout: 10000
    });
  } catch (err) {
    reposRes = { data: [] };
  }

  const rawRepos = Array.isArray(reposRes.data) ? reposRes.data : [];

  const allRepositories = rawRepos.map(r => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description || '',
    language: r.language || 'Plain Text',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    openIssues: r.open_issues_count || 0,
    topics: Array.isArray(r.topics) ? r.topics : [],
    license: r.license ? r.license.spdx_id || r.license.name : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at || r.updated_at,
    archived: Boolean(r.archived),
    isFork: Boolean(r.fork),
    defaultBranch: r.default_branch || 'main',
    htmlUrl: r.html_url,
    size: r.size || 0
  }));

  const forkRepositories = allRepositories.filter(r => r.isFork);
  const archivedRepositories = allRepositories.filter(r => !r.isFork && r.archived);
  
  // Cap at 10-12 non-fork, non-archived repositories sorted by pushed_at descending
  const candidateRepos = allRepositories.filter(r => !r.isFork && !r.archived);
  const analyzedRepositories = candidateRepos.slice(0, 12);
  const overflowRepositories = candidateRepos.slice(12);

  // List of excluded repositories with explicit reasons
  const excludedRepositories = [
    ...forkRepositories.map(r => ({ name: r.name, reason: 'Forked repository excluded from primary score' })),
    ...archivedRepositories.map(r => ({ name: r.name, reason: 'Archived repository' })),
    ...overflowRepositories.map(r => ({ name: r.name, reason: 'Beyond top 12 active repositories sample' }))
  ];

  // 3. Check for Profile README ({username}/{username})
  let hasProfileReadme = false;
  const profileRepo = rawRepos.find(r => r.name.toLowerCase() === cleanUsername.toLowerCase());
  if (profileRepo) {
    try {
      const pReadme = await axios.get(`${GITHUB_API_BASE}/repos/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(profileRepo.name)}/readme`, {
        headers,
        timeout: 4000
      });
      if (pReadme.status === 200) {
        hasProfileReadme = true;
      }
    } catch (e) {
      hasProfileReadme = false;
    }
  }

  // 4. Fetch README and root files for analyzed repos
  const repoDetails = await Promise.all(
    analyzedRepositories.map(async (repo) => {
      let readmeInfo = { hasReadme: false, readmeContent: '' };
      let rootFiles = [];
      let securityAvailable = true;

      try {
        const readmeRes = await axios.get(`${GITHUB_API_BASE}/repos/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(repo.name)}/readme`, {
          headers: {
            ...headers,
            'Accept': 'application/vnd.github.v3.raw'
          },
          timeout: 5000,
          transformResponse: [(data) => data]
        });
        if (readmeRes.status === 200 && typeof readmeRes.data === 'string') {
          readmeInfo = {
            hasReadme: true,
            readmeContent: readmeRes.data.slice(0, 8000)
          };
        }
      } catch (err) {
        readmeInfo = { hasReadme: false, readmeContent: '' };
      }

      try {
        const contentsRes = await axios.get(`${GITHUB_API_BASE}/repos/${encodeURIComponent(cleanUsername)}/${encodeURIComponent(repo.name)}/contents/`, {
          headers,
          timeout: 5000
        });
        if (Array.isArray(contentsRes.data)) {
          rootFiles = contentsRes.data.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size || 0
          }));
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          securityAvailable = false;
        }
        rootFiles = [];
      }

      return {
        repo,
        readmeInfo,
        rootFiles,
        securityAvailable
      };
    })
  );

  return {
    target: {
      type: 'profile',
      owner: cleanUsername,
      url: `https://github.com/${cleanUsername}`
    },
    profile: {
      ...profile,
      hasProfileReadme
    },
    allRepositories,
    analyzedRepositories,
    archivedRepositories,
    forkRepositories,
    excludedRepositories,
    repoDetails,
    totalScanned: analyzedRepositories.length,
    totalPublic: allRepositories.length
  };
}

module.exports = {
  fetchProfileData,
  fetchSingleRepository
};
