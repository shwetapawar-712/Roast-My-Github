/**
 * Scoring Engine
 * Pure mathematical calculation of explainable category scores and weighted overall score.
 * AI NEVER modifies or influences these scores.
 * Principle: Absence of evidence is NOT evidence of good health (No Data !== 100).
 */

const CATEGORY_WEIGHTS = {
  documentation: 0.25,
  activity: 0.20,
  quality: 0.20,
  presentation: 0.15,
  security: 0.20
};

const CATEGORY_DISPLAY_NAMES = {
  documentation: 'Documentation',
  activity: 'Activity & Freshness',
  quality: 'Repository Quality',
  presentation: 'Profile Presentation',
  security: 'Security Hygiene'
};

const NOT_APPLICABLE_REASONS = {
  documentation: 'No repositories available for README documentation analysis.',
  activity: 'No repository commit/push activity available to evaluate.',
  quality: 'No public repositories available for quality & metadata inspection.',
  security: 'No repository files were available for security hygiene analysis.',
  presentation: 'Profile data unavailable.'
};

function getScoreLabel(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return 'N/A — Insufficient repository data';
  }
  if (score >= 90) return 'Clean & Polished';
  if (score >= 75) return 'Solid Engineering';
  if (score >= 60) return 'Needs Work';
  if (score >= 40) return 'Rough Around the Edges';
  return 'Critical Remediation Needed';
}

function calculateScores(findings, repoCount = 0, hasProfile = true) {
  const categories = ['documentation', 'activity', 'quality', 'presentation', 'security'];
  const categoryScores = [];

  let weightedSum = 0;
  let totalWeightUsed = 0;
  let applicableRepoCategoriesCount = 0;

  for (const cat of categories) {
    const isRepoCategory = cat !== 'presentation';
    const catFindings = findings.filter(f => f.category === cat);
    const negativeFindings = catFindings.filter(f => f.score_impact < 0);

    // 1. If 0 repositories were analyzed for repository-dependent categories
    if (isRepoCategory && repoCount === 0) {
      categoryScores.push({
        category: cat,
        name: CATEGORY_DISPLAY_NAMES[cat],
        weight: CATEGORY_WEIGHTS[cat],
        score: null,
        displayScore: 'N/A',
        status: 'not_applicable',
        reason: NOT_APPLICABLE_REASONS[cat],
        reasons: [NOT_APPLICABLE_REASONS[cat]],
        penalties: 0,
        findingsCount: 0
      });
      continue;
    }

    // 2. If profile is missing for presentation category
    if (cat === 'presentation' && !hasProfile) {
      categoryScores.push({
        category: cat,
        name: CATEGORY_DISPLAY_NAMES[cat],
        weight: CATEGORY_WEIGHTS[cat],
        score: null,
        displayScore: 'N/A',
        status: 'not_applicable',
        reason: NOT_APPLICABLE_REASONS[cat],
        reasons: [NOT_APPLICABLE_REASONS[cat]],
        penalties: 0,
        findingsCount: 0
      });
      continue;
    }

    // 3. Real applicable category calculation
    const totalPenalty = negativeFindings.reduce((sum, f) => sum + Math.abs(f.score_impact), 0);
    const score = Math.max(0, 100 - totalPenalty);

    const reasons = negativeFindings.length > 0
      ? negativeFindings.map(f => `${f.message} (${f.score_impact} pts)`)
      : ['No negative findings detected in this category based on inspected evidence.'];

    categoryScores.push({
      category: cat,
      name: CATEGORY_DISPLAY_NAMES[cat],
      weight: CATEGORY_WEIGHTS[cat],
      score,
      displayScore: `${score}/100`,
      status: negativeFindings.length > 0 ? 'warning' : 'healthy',
      reason: reasons[0],
      reasons,
      penalties: totalPenalty,
      findingsCount: catFindings.length
    });

    if (isRepoCategory) {
      applicableRepoCategoriesCount++;
    }

    const weight = CATEGORY_WEIGHTS[cat];
    weightedSum += score * weight;
    totalWeightUsed += weight;
  }

  // 4. Overall score calculation:
  // If 0 repository categories could be evaluated, overallScore MUST be null (N/A)
  let overallScore = null;
  let overallLabel = 'N/A — Insufficient repository data';

  if (repoCount > 0 && totalWeightUsed > 0 && applicableRepoCategoriesCount > 0) {
    overallScore = Math.round(weightedSum / totalWeightUsed);
    overallScore = Math.max(0, Math.min(100, overallScore));
    overallLabel = getScoreLabel(overallScore);
  } else {
    overallScore = null;
    overallLabel = 'N/A — Insufficient repository data';
  }

  return {
    categoryScores,
    overallScore,
    overallLabel,
    displayScore: overallScore !== null ? `${overallScore}/100` : 'N/A',
    status: overallScore !== null ? 'evaluated' : 'insufficient_data',
    weights: CATEGORY_WEIGHTS
  };
}

module.exports = {
  calculateScores,
  getScoreLabel,
  CATEGORY_WEIGHTS,
  CATEGORY_DISPLAY_NAMES
};
