const express = require('express');
const router = express.Router();
const store = require('../store');
const { parseGitHubUrl } = require('../services/urlParser');
const { fetchProfileData, fetchSingleRepository } = require('../services/github');
const { runAllAnalyzers } = require('../services/analyzer');
const { calculateScores } = require('../services/scoring');
const { generateRoast } = require('../services/ai');

router.post('/analyze', async (req, res) => {
  try {
    const { url, username, intensity = 'brutal' } = req.body;
    const rawInput = url || username;

    if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Please paste a public GitHub URL (e.g. https://github.com/torvalds or https://github.com/torvalds/linux).'
      });
    }

    // 1. Parse GitHub URL
    const parseResult = parseGitHubUrl(rawInput);
    if (parseResult.error) {
      return res.status(400).json({
        error: 'INVALID_URL',
        message: parseResult.error
      });
    }

    let scanResult;

    if (parseResult.type === 'repository') {
      // ──────────────── SINGLE REPOSITORY SCAN ────────────────
      const { owner, repo } = parseResult;
      const repoPayload = await fetchSingleRepository(owner, repo);

      // Deterministic rules
      const { findings, repositoryAnalyses } = runAllAnalyzers(repoPayload);
      const { categoryScores, overallScore, overallLabel, weights } = calculateScores(
        findings,
        repoPayload.analyzedRepositories.length
      );

      // Safe facts for AI
      const safeFacts = {
        username: owner,
        targetName: `${owner}/${repo}`,
        targetType: 'repository',
        overall_score: overallScore,
        overall_label: overallLabel,
        categories: categoryScores,
        findings: findings.map(f => ({
          category: f.category,
          severity: f.severity,
          repository: f.repository,
          message: f.message,
          evidence: f.evidence,
          score_impact: f.score_impact,
          suggested_fix: f.suggested_fix || f.fix
        })),
        repositories: [{
          name: repoPayload.repository.name,
          language: repoPayload.repository.language,
          stars: repoPayload.repository.stars,
          forks: repoPayload.repository.forks,
          lastPushed: repoPayload.repository.pushedAt
        }],
        intensity
      };

      const roastData = await generateRoast(safeFacts);

      scanResult = {
        target: {
          type: 'repository',
          owner,
          repo,
          url: parseResult.url,
          cleanIdentifier: parseResult.cleanIdentifier
        },
        profile: {
          username: owner,
          name: owner,
          avatarUrl: repoPayload.repository.ownerAvatarUrl || '',
          htmlUrl: `https://github.com/${owner}`
        },
        repository: repoPayload.repository,
        repositories: repoPayload.allRepositories,
        analyzedRepositories: repoPayload.analyzedRepositories,
        archivedRepositories: repoPayload.archivedRepositories,
        forkRepositories: repoPayload.forkRepositories,
        excludedRepositories: repoPayload.excludedRepositories || [],
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
        analysisNote: `Deep repository audit of ${owner}/${repo}.`
      };

      store.set(parseResult.cleanIdentifier, scanResult);
      // Also store with sanitized key
      store.set(`${owner}/${repo}`, scanResult);

    } else {
      // ──────────────── PUBLIC PROFILE SCAN ────────────────
      const { owner } = parseResult;
      const profileData = await fetchProfileData(owner);

      // Deterministic rules
      const { findings, repositoryAnalyses } = runAllAnalyzers(profileData);
      const { categoryScores, overallScore, overallLabel, weights } = calculateScores(
        findings,
        profileData.analyzedRepositories.length
      );

      // Safe facts for AI
      const safeFacts = {
        username: profileData.profile.username,
        targetName: profileData.profile.username,
        targetType: 'profile',
        overall_score: overallScore,
        overall_label: overallLabel,
        categories: categoryScores,
        findings: findings.map(f => ({
          category: f.category,
          severity: f.severity,
          repository: f.repository,
          message: f.message,
          evidence: f.evidence,
          score_impact: f.score_impact,
          suggested_fix: f.suggested_fix || f.fix
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

      const roastData = await generateRoast(safeFacts);

      const totalPublic = profileData.allRepositories.length;
      const totalScanned = profileData.analyzedRepositories.length;
      const totalExcluded = (profileData.excludedRepositories || []).length || (totalPublic - totalScanned);

      let analysisNote = '';
      if (totalPublic === 0) {
        analysisNote = '0 public repositories found on this account.';
      } else if (totalScanned === 0) {
        analysisNote = `0 of ${totalPublic} public repositories analyzed (${totalExcluded} excluded: forks or archived).`;
      } else if (totalPublic > totalScanned) {
        analysisNote = `Analyzed ${totalScanned} of ${totalPublic} public repositories (${totalExcluded} excluded: forks or archived).`;
      } else {
        analysisNote = `Analyzed all ${totalScanned} public repositories.`;
      }

      scanResult = {
        target: {
          type: 'profile',
          owner,
          url: parseResult.url,
          cleanIdentifier: parseResult.cleanIdentifier
        },
        profile: profileData.profile,
        repository: null,
        repositories: profileData.allRepositories,
        analyzedRepositories: profileData.analyzedRepositories,
        archivedRepositories: profileData.archivedRepositories,
        forkRepositories: profileData.forkRepositories,
        excludedRepositories: profileData.excludedRepositories || [],
        totalPublic,
        totalScanned,
        totalExcluded,
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
        analysisNote
      };

      store.set(owner, scanResult);
    }

    return res.json(scanResult);
  } catch (err) {
    console.error('Error in /api/analyze:', err.message);
    return res.status(err.status || 500).json({
      error: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred while analyzing the GitHub target.'
    });
  }
});

module.exports = router;
