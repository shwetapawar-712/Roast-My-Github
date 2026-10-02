const express = require('express');
const router = express.Router();
const store = require('../store');
const { fetchProfileData } = require('../services/github');
const { runAllAnalyzers } = require('../services/analyzer');
const { calculateScores } = require('../services/scoring');
const { generateRoast } = require('../services/ai');

router.post('/rescan', async (req, res) => {
  try {
    const { username, intensity = 'brutal' } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Username is required.' });
    }

    const cleanUsername = username.trim();
    const existingEntry = store.get(cleanUsername);
    const previousScore = existingEntry ? existingEntry.result.overallScore : null;

    // 1. Fresh fetch from GitHub
    const profileData = await fetchProfileData(cleanUsername);

    // 2. Deterministic analysis
    const { findings, repositoryAnalyses } = runAllAnalyzers(profileData);

    // 3. Deterministic scoring
    const { categoryScores, overallScore, overallLabel, weights } = calculateScores(
      findings,
      profileData.analyzedRepositories.length
    );

    // 4. Safe facts for AI
    const safeFacts = {
      username: profileData.profile.username,
      overall_score: overallScore,
      overall_label: overallLabel,
      categories: categoryScores.reduce((acc, cat) => {
        acc[cat.category] = cat.score;
        return acc;
      }, {}),
      findings: findings.map(f => ({
        category: f.category,
        severity: f.severity,
        repository: f.repository,
        message: f.message,
        evidence: f.evidence,
        score_impact: f.score_impact
      })),
      repositories: profileData.analyzedRepositories.map(r => ({
        name: r.name,
        language: r.language,
        stars: r.stars,
        forks: r.forks,
        lastPushed: r.pushedAt
      })),
      intensity
    };

    // 5. Generate AI narration
    const roastData = await generateRoast(safeFacts);

    const delta = previousScore !== null ? overallScore - previousScore : 0;

    // 6. Complete ScanResult
    const scanResult = {
      profile: profileData.profile,
      repositories: profileData.allRepositories,
      analyzedRepositories: profileData.analyzedRepositories,
      archivedRepositories: profileData.archivedRepositories,
      forkRepositories: profileData.forkRepositories,
      categoryScores,
      overallScore,
      overallLabel,
      weights,
      findings,
      repositoryAnalyses,
      roast: {
        intensity,
        ...roastData
      },
      scannedAt: new Date().toISOString(),
      previousScore,
      scoreDelta: delta,
      analysisNote: `Rescanned successfully. Score change: ${delta >= 0 ? `+${delta}` : delta} points.`
    };

    store.set(cleanUsername, scanResult);

    return res.json(scanResult);
  } catch (err) {
    console.error('[Rescan Route Error]', err.message);
    const status = err.status || 500;
    return res.status(status).json({
      error: err.code || 'RESCAN_FAILED',
      message: err.message || 'Failed to rescan GitHub profile.'
    });
  }
});

module.exports = router;
