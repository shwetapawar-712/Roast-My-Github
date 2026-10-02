/**
 * Activity Analyzer
 * Deterministic checks for repository push cadence, stale repositories, and dormant projects.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * ONE_DAY_MS;
const ONE_YEAR_MS = 365 * ONE_DAY_MS;

function analyzeActivity(repoDetails) {
  const findings = [];
  const now = Date.now();

  for (const { repo } of repoDetails) {
    const repoName = repo.name;
    const lastPushed = repo.pushedAt ? new Date(repo.pushedAt).getTime() : 0;
    const ageMs = now - lastPushed;

    if (ageMs > 2 * ONE_YEAR_MS) {
      const yearsAgo = Math.round(ageMs / ONE_YEAR_MS);
      findings.push({
        id: `act_stale_${repoName}`,
        rule_id: 'ACTIVITY_RULE_STALE',
        ruleId: 'ACTIVITY_RULE_STALE',
        category: 'activity',
        severity: 'warning',
        repository: repoName,
        evidence: `Last push was on ${repo.pushedAt ? repo.pushedAt.slice(0, 10) : 'unknown date'} (${yearsAgo} years ago).`,
        message: `Stale repository detected: ${repoName} (last push ${yearsAgo} years ago)`,
        why_it_matters: `Prominently featuring unmaintained repositories gives the impression of abandoned code.`,
        whyItMatters: `Prominently featuring unmaintained repositories gives the impression of abandoned code.`,
        suggested_fix: `Archive this repository or update the README noting its maintenance status.`,
        fix: `Archive this repository or update the README noting its maintenance status.`,
        score_impact: -8
      });
    } else if (ageMs > 6 * ONE_MONTH_MS) {
      const monthsAgo = Math.round(ageMs / ONE_MONTH_MS);
      findings.push({
        id: `act_inactive_${repoName}`,
        rule_id: 'ACTIVITY_RULE_INACTIVE',
        ruleId: 'ACTIVITY_RULE_INACTIVE',
        category: 'activity',
        severity: 'improvement',
        repository: repoName,
        evidence: `Last push was ${monthsAgo} months ago.`,
        message: `Inactive repository detected: ${repoName} (last push ${monthsAgo} months ago)`,
        why_it_matters: `A lack of recent commits in active repositories reduces perceived project health.`,
        whyItMatters: `A lack of recent commits in active repositories reduces perceived project health.`,
        suggested_fix: `Push recent updates or tag a release version.`,
        fix: `Push recent updates or tag a release version.`,
        score_impact: -5
      });
    } else {
      findings.push({
        id: `act_healthy_${repoName}`,
        rule_id: 'ACTIVITY_RULE_HEALTHY',
        ruleId: 'ACTIVITY_RULE_HEALTHY',
        category: 'activity',
        severity: 'healthy',
        repository: repoName,
        evidence: `Recent commit activity within the past 6 months.`,
        message: `Active development cadence in ${repoName}`,
        why_it_matters: `Consistent commits signal active maintenance.`,
        whyItMatters: `Consistent commits signal active maintenance.`,
        suggested_fix: `Continue your regular commit cadence.`,
        fix: `Continue your regular commit cadence.`,
        score_impact: 0
      });
    }
  }

  return findings;
}

module.exports = {
  analyzeActivity
};
