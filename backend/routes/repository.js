const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/repository/:username/:repo', (req, res) => {
  const { username, repo } = req.params;

  if (!username || !repo) {
    return res.status(400).json({ error: 'INVALID_PARAMETERS', message: 'Both username and repo parameters are required.' });
  }

  const cached = store.get(username);
  if (!cached || !cached.result) {
    return res.status(404).json({
      error: 'SCAN_NOT_FOUND',
      message: `No active scan result found for @${username}. Please run a profile scan first.`
    });
  }

  const analysis = cached.result.repositoryAnalyses.find(
    r => r.repository.name.toLowerCase() === repo.toLowerCase()
  );

  if (!analysis) {
    // Check if it exists in allRepositories (e.g., fork or archived)
    const rawRepo = cached.result.repositories.find(
      r => r.name.toLowerCase() === repo.toLowerCase()
    );

    if (rawRepo) {
      return res.json({
        repository: rawRepo,
        isExcludedFromMainScore: rawRepo.isFork || rawRepo.archived,
        exclusionReason: rawRepo.isFork ? 'Fork repository' : (rawRepo.archived ? 'Archived repository' : 'Not in top active list'),
        documentation: { readme: false, setup: false, demo: false },
        activity: { lastPushed: rawRepo.pushedAt, status: rawRepo.archived ? 'archived' : 'inactive' },
        quality: { hasDescription: Boolean(rawRepo.description), nameOk: true, isEmpty: false },
        security: [],
        securityAvailable: false,
        score: 100,
        findings: [],
        fixes: []
      });
    }

    return res.status(404).json({
      error: 'REPO_NOT_FOUND',
      message: `Repository '${repo}' was not found in the scan results for @${username}.`
    });
  }

  return res.json({
    ...analysis,
    username: cached.result.profile.username,
    userAvatar: cached.result.profile.avatarUrl
  });
});

module.exports = router;
