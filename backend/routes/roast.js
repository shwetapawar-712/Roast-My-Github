const express = require('express');
const router = express.Router();
const store = require('../store');
const { generateRoast } = require('../services/ai');

router.post('/roast', async (req, res) => {
  try {
    const { username, identifier, intensity = 'brutal' } = req.body;
    const targetKey = identifier || username;

    if (!targetKey) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Identifier or username is required.' });
    }

    const cached = store.get(targetKey);
    if (!cached || !cached.result) {
      return res.status(404).json({
        error: 'SCAN_NOT_FOUND',
        message: `No existing scan found for "${targetKey}". Please run an initial scan first.`
      });
    }

    const result = cached.result;
    const isRepo = result.target?.type === 'repository';
    const targetName = result.target?.cleanIdentifier || result.profile?.username || targetKey;

    const safeFacts = {
      username: result.profile?.username || targetKey,
      targetName,
      targetType: isRepo ? 'repository' : 'profile',
      overall_score: result.overallScore,
      overall_label: result.overallLabel,
      categories: result.categoryScores,
      findings: result.findings.map(f => ({
        category: f.category,
        severity: f.severity,
        repository: f.repository,
        message: f.message,
        evidence: f.evidence,
        score_impact: f.score_impact,
        suggested_fix: f.suggested_fix || f.fix
      })),
      repositories: (result.analyzedRepositories || []).map(r => ({
        name: r.name,
        language: r.language,
        stars: r.stars,
        forks: r.forks,
        lastPushed: r.pushedAt
      })),
      intensity
    };

    const roastData = await generateRoast(safeFacts);

    // Update roast inside cached scanResult
    result.roast = {
      intensity,
      ...roastData
    };
    store.set(targetKey, result);

    return res.json({
      intensity,
      ...roastData
    });
  } catch (err) {
    console.error('[Roast Route Error]', err.message);
    return res.status(500).json({
      error: 'ROAST_GENERATION_FAILED',
      message: 'Failed to regenerate roast with selected intensity.'
    });
  }
});

module.exports = router;
