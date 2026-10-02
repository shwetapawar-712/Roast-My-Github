/**
 * Security Hygiene Audit Analyzer
 * Scans root filenames only for hygiene red flags like exposed environment/credential files.
 * Note: Scoped strictly as a Security Hygiene Audit, not a full SAST/vulnerability scanner.
 */

const SENSITIVE_FILENAME_PATTERNS = [
  /^\.env(\.(local|production|development|staging|test|backup))?$/i,
  /^(credentials|secrets|serviceAccountKey|firebase-adminsdk|auth_config)\.json$/i,
  /\.(pem|key|pkcs12|pfx|p12|keystore)$/i,
  /^(id_rsa|id_dsa|id_ecdsa|id_ed25519)(\.pub)?$/i,
  /^(wp-config\.php|server\.key|jwtSecret\.json)$/i
];

const CONFIG_FILENAMES = [
  'config.json',
  'settings.py',
  'database.yml',
  'db.config.js',
  'parameters.yml'
];

function analyzeSecurity(repoDetails) {
  const findings = [];

  for (const { repo, rootFiles, securityAvailable } of repoDetails) {
    const repoName = repo.name;

    if (!securityAvailable) {
      findings.push({
        id: `sec_unavailable_${repoName}`,
        rule_id: 'SECURITY_RULE_UNAVAILABLE',
        ruleId: 'SECURITY_RULE_UNAVAILABLE',
        category: 'security',
        severity: 'warning',
        repository: repoName,
        confidence: 'unavailable',
        evidence: `Root file contents could not be retrieved from GitHub API for this repository.`,
        message: `Security hygiene scan unavailable for ${repoName}`,
        why_it_matters: `GitHub API rate limit or access constraints prevented scanning root directory files.`,
        whyItMatters: `GitHub API rate limit or access constraints prevented scanning root directory files.`,
        suggested_fix: `Check back after rate limit resets or ensure repository files are accessible.`,
        fix: `Check back after rate limit resets or ensure repository files are accessible.`,
        score_impact: 0
      });
      continue;
    }

    const fileNames = rootFiles.map(f => f.name);
    const hasGitignore = fileNames.some(f => f.toLowerCase() === '.gitignore');

    let triggeredSecrets = [];
    let triggeredConfigs = [];

    for (const file of fileNames) {
      // Check sensitive files (only storing filenames, never secret values)
      for (const pattern of SENSITIVE_FILENAME_PATTERNS) {
        if (pattern.test(file)) {
          triggeredSecrets.push(file);
          break;
        }
      }

      // Check config exposure without gitignore
      if (!hasGitignore && CONFIG_FILENAMES.includes(file.toLowerCase())) {
        triggeredConfigs.push(file);
      }
    }

    // Critical secret file finding
    if (triggeredSecrets.length > 0) {
      findings.push({
        id: `sec_secret_${repoName}`,
        rule_id: 'SECURITY_RULE_CREDENTIAL_PATTERN',
        ruleId: 'SECURITY_RULE_CREDENTIAL_PATTERN',
        category: 'security',
        severity: 'critical',
        repository: repoName,
        confidence: 'potential',
        evidence: `Potential sensitive file pattern(s) detected at repository root: ${triggeredSecrets.join(', ')}`,
        message: `Potential credential exposure detected in ${repoName}`,
        why_it_matters: `Committing .env or key files publicly risks exposing sensitive API tokens, database credentials, or secret keys.`,
        whyItMatters: `Committing .env or key files publicly risks exposing sensitive API tokens, database credentials, or secret keys.`,
        suggested_fix: `Remove the sensitive file(s) from git tracking, add them to .gitignore, and rotate any credentials that may have been committed.`,
        fix: `Remove the sensitive file(s) from git tracking, add them to .gitignore, and rotate any credentials that may have been committed.`,
        score_impact: -15
      });
    }

    // Warning config exposure finding
    if (triggeredConfigs.length > 0) {
      findings.push({
        id: `sec_config_${repoName}`,
        rule_id: 'SECURITY_RULE_CONFIG_EXPOSURE',
        ruleId: 'SECURITY_RULE_CONFIG_EXPOSURE',
        category: 'security',
        severity: 'warning',
        repository: repoName,
        confidence: 'potential',
        evidence: `Config file(s) (${triggeredConfigs.join(', ')}) found without a .gitignore file in repository root.`,
        message: `Potential config exposure without .gitignore in ${repoName}`,
        why_it_matters: `Missing .gitignore increases the risk of accidentally committing local environment variables or database parameters.`,
        whyItMatters: `Missing .gitignore increases the risk of accidentally committing local environment variables or database parameters.`,
        suggested_fix: `Add a standard .gitignore file matching your language/framework stack.`,
        fix: `Add a standard .gitignore file matching your language/framework stack.`,
        score_impact: -8
      });
    }

    // Healthy finding (never claim "Repository is secure", say "No obvious security hygiene issues detected in the scanned files.")
    if (triggeredSecrets.length === 0 && triggeredConfigs.length === 0) {
      findings.push({
        id: `sec_healthy_${repoName}`,
        rule_id: 'SECURITY_RULE_HEALTHY',
        ruleId: 'SECURITY_RULE_HEALTHY',
        category: 'security',
        severity: 'healthy',
        repository: repoName,
        confidence: 'verified',
        evidence: `Scanned ${fileNames.length} root files. No sensitive filename patterns detected.`,
        message: `No obvious security hygiene issues detected in the scanned files for ${repoName}`,
        why_it_matters: `Clean repository roots and .gitignore practices prevent accidental credential leaks.`,
        whyItMatters: `Clean repository roots and .gitignore practices prevent accidental credential leaks.`,
        suggested_fix: `Continue maintaining proactive .gitignore rules and automated secret scanning.`,
        fix: `Continue maintaining proactive .gitignore rules and automated secret scanning.`,
        score_impact: 0
      });
    }

    // Dependency vulnerability check note:
    // Only report verified vulnerabilities if a reliable DB is queried; otherwise show explicit status
    findings.push({
      id: `sec_dep_${repoName}`,
      rule_id: 'DEPENDENCY_RULE_STATUS',
      ruleId: 'DEPENDENCY_RULE_STATUS',
      category: 'security',
      severity: 'healthy',
      repository: repoName,
      confidence: 'informational',
      evidence: `External vulnerability database verification is not configured for this scan.`,
      message: `Dependency vulnerability verification unavailable.`,
      why_it_matters: `Deterministic dependency audits require external CVE databases (e.g. GitHub Advisory Database, OSV, Snyk).`,
      whyItMatters: `Deterministic dependency audits require external CVE databases (e.g. GitHub Advisory Database, OSV, Snyk).`,
      suggested_fix: `Run 'npm audit' or 'pip audit' locally or enable Dependabot in repository settings.`,
      fix: `Run 'npm audit' or 'pip audit' locally or enable Dependabot in repository settings.`,
      score_impact: 0
    });
  }

  return findings;
}

module.exports = {
  analyzeSecurity
};
