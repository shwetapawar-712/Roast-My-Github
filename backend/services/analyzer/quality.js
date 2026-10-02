/**
 * Repository Quality Analyzer
 * Checks descriptions, low-info names, license presence, and empty repos.
 */

const LOW_INFO_NAMES = new Set([
  'test', 'test1', 'test2', 'testing', 'my-app', 'app', 'project',
  'demo', 'sample', 'temp', 'tmp', 'untitled', 'new-project', 'repo',
  'practice', 'lab', 'homework', 'tutorial', 'code'
]);

function analyzeQuality(repoDetails) {
  const findings = [];

  for (const { repo } of repoDetails) {
    const repoName = repo.name;
    const lowerName = repoName.toLowerCase();
    const hasDescription = Boolean(repo.description && repo.description.trim().length > 3);
    const isLowInfoName = LOW_INFO_NAMES.has(lowerName);
    const hasLicense = Boolean(repo.license);

    if (!hasDescription) {
      findings.push({
        id: `qual_no_desc_${repoName}`,
        rule_id: 'DESCRIPTION_RULE_MISSING',
        ruleId: 'DESCRIPTION_RULE_MISSING',
        category: 'quality',
        severity: 'warning',
        repository: repoName,
        evidence: `GitHub repository 'About' description field is empty.`,
        message: `Missing repository description for ${repoName}`,
        why_it_matters: `The repository description is the primary preview text shown on GitHub search and profile overview.`,
        whyItMatters: `The repository description is the primary preview text shown on GitHub search and profile overview.`,
        suggested_fix: `Add a concise 1-line description in the repository's 'About' settings.`,
        fix: `Add a concise 1-line description in the repository's 'About' settings.`,
        score_impact: -6
      });
    }

    if (isLowInfoName) {
      findings.push({
        id: `qual_low_info_${repoName}`,
        rule_id: 'NAMING_RULE_LOW_INFO',
        ruleId: 'NAMING_RULE_LOW_INFO',
        category: 'quality',
        severity: 'improvement',
        repository: repoName,
        evidence: `Repository name '${repoName}' matches generic or placeholder naming patterns.`,
        message: `Generic repository name detected: "${repoName}"`,
        why_it_matters: `Generic names make it difficult to distinguish serious projects from throwaway sandboxes.`,
        whyItMatters: `Generic names make it difficult to distinguish serious projects from throwaway sandboxes.`,
        suggested_fix: `Rename to a domain-specific, self-explanatory name or archive if it was temporary.`,
        fix: `Rename to a domain-specific, self-explanatory name or archive if it was temporary.`,
        score_impact: -4
      });
    }

    if (!hasLicense) {
      findings.push({
        id: `qual_no_license_${repoName}`,
        rule_id: 'LICENSE_RULE_MISSING',
        ruleId: 'LICENSE_RULE_MISSING',
        category: 'quality',
        severity: 'improvement',
        repository: repoName,
        evidence: `No open-source license detected.`,
        message: `No license file detected in ${repoName}`,
        why_it_matters: `Without a license, default copyright laws apply, meaning others cannot legally use or contribute to your code.`,
        whyItMatters: `Without a license, default copyright laws apply, meaning others cannot legally use or contribute to your code.`,
        suggested_fix: `Add an open-source license like MIT or Apache-2.0 via GitHub's Add License template.`,
        fix: `Add an open-source license like MIT or Apache-2.0 via GitHub's Add License template.`,
        score_impact: -2
      });
    }

    if (hasDescription && !isLowInfoName && hasLicense) {
      findings.push({
        id: `qual_healthy_${repoName}`,
        rule_id: 'QUALITY_RULE_HEALTHY',
        ruleId: 'QUALITY_RULE_HEALTHY',
        category: 'quality',
        severity: 'healthy',
        repository: repoName,
        evidence: `Descriptive repository name, custom description, and license present.`,
        message: `High repository metadata quality in ${repoName}`,
        why_it_matters: `Clear metadata enhances discoverability and professional presentation.`,
        whyItMatters: `Clear metadata enhances discoverability and professional presentation.`,
        suggested_fix: `Maintain this metadata standard across all repositories.`,
        fix: `Maintain this metadata standard across all repositories.`,
        score_impact: 0
      });
    }
  }

  return findings;
}

module.exports = {
  analyzeQuality
};
