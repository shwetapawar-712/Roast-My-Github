const { analyzeDocumentation } = require('./documentation');
const { analyzeActivity } = require('./activity');
const { analyzeQuality } = require('./quality');
const { analyzePresentation } = require('./presentation');
const { analyzeSecurity } = require('./security');

/**
 * Runs all deterministic analyzers across profile and analyzed repositories.
 */
function runAllAnalyzers(profileData) {
  const { profile, repoDetails } = profileData;

  const docFindings = analyzeDocumentation(repoDetails);
  const actFindings = analyzeActivity(repoDetails);
  const qualFindings = analyzeQuality(repoDetails);
  const presFindings = analyzePresentation(profile);
  const secFindings = analyzeSecurity(repoDetails);

  if (repoDetails.length === 0) {
    qualFindings.push({
      ruleId: 'NO_REPOSITORIES_FOUND',
      category: 'quality',
      severity: 'warning',
      score_impact: 0,
      repository: null,
      message: 'No analyzable public repositories were found.',
      evidence: '0 public original repositories available for deep inspection.',
      why_it_matters: 'Portfolio evaluators and technical audits require public codebases to verify software engineering practices.',
      suggested_fix: 'Add and document at least one public project to create a verifiable portfolio.',
      fix: 'Add and document at least one public project to create a verifiable portfolio.'
    });
  }

  const allFindings = [
    ...presFindings,
    ...docFindings,
    ...actFindings,
    ...qualFindings,
    ...secFindings
  ];

  // Build granular per-repository analysis summaries
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const repositoryAnalyses = repoDetails.map(({ repo, readmeInfo, rootFiles, securityAvailable }) => {
    const repoName = repo.name;
    const repoFindings = allFindings.filter(f => f.repository === repoName);
    
    // Documentation flags
    const docIssues = repoFindings.filter(f => f.category === 'documentation' && f.severity !== 'healthy');
    const hasReadme = readmeInfo.hasReadme;
    const hasSetup = hasReadme && !repoFindings.some(f => f.ruleId === 'SETUP_MISSING');
    const hasDemo = hasReadme && !repoFindings.some(f => f.ruleId === 'DEMO_MISSING');

    // Activity flags
    const lastPushedMs = new Date(repo.pushedAt || repo.updatedAt).getTime();
    const monthsAgo = Math.max(0, Math.round((now - lastPushedMs) / ONE_MONTH_MS));
    let activityStatus = 'active';
    if (monthsAgo > 24) activityStatus = 'stale';
    else if (monthsAgo > 12) activityStatus = 'inactive';

    // Quality flags
    const hasDescription = Boolean(repo.description && repo.description.trim().length > 0);
    const nameOk = !repoFindings.some(f => f.ruleId === 'LOW_INFO_NAME');
    const isEmpty = Boolean(repoFindings.some(f => f.ruleId === 'EMPTY_REPO'));

    // Security flags
    const securityFindings = repoFindings.filter(f => f.category === 'security');

    // Calculate per-repo score (100 - sum of negative impacts on this repo)
    const penalties = repoFindings
      .filter(f => f.score_impact < 0)
      .reduce((sum, f) => sum + Math.abs(f.score_impact), 0);
    const repoScore = Math.max(0, Math.min(100, 100 - penalties));

    // Unique suggested fixes
    const fixes = repoFindings
      .filter(f => f.severity !== 'healthy' && f.fix)
      .map(f => f.fix);

    return {
      repository: repo,
      documentation: {
        readme: hasReadme,
        setup: hasSetup,
        demo: hasDemo
      },
      activity: {
        lastPushed: repo.pushedAt,
        monthsAgo,
        status: activityStatus
      },
      quality: {
        hasDescription,
        nameOk,
        isEmpty
      },
      security: securityFindings,
      securityAvailable,
      score: repoScore,
      findings: repoFindings,
      fixes: Array.from(new Set(fixes))
    };
  });

  return {
    findings: allFindings,
    repositoryAnalyses
  };
}

module.exports = {
  runAllAnalyzers
};
