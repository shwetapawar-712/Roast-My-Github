/**
 * Documentation Analyzer
 * Deterministic rules for README presence, setup instructions, and demo evidence.
 */

const SETUP_REGEX = /(installation|setup|getting\s*started|usage|how\s*to\s*run|quick\s*start|npm\s*install|pip\s*install|yarn\s*install|pnpm\s*install|cargo\s*build|go\s*(run|build)|composer\s*install|docker-compose|docker\s*run)/i;
const DEMO_REGEX = /(demo|live\s*demo|screenshot|preview|video|gif|loom\.com|youtube\.com|youtu\.be|!\[.*\]\(.*(png|jpg|jpeg|gif|webp|svg).*\)|https?:\/\/[^\s]+\.(vercel\.app|netlify\.app|github\.io|pages\.dev|herokuapp\.com|onrender\.com|fly\.dev|railway\.app|surge\.sh))/i;

function analyzeDocumentation(repoDetails) {
  const findings = [];

  for (const { repo, readmeInfo } of repoDetails) {
    const repoName = repo.name;

    if (!readmeInfo.hasReadme) {
      findings.push({
        id: `doc_missing_readme_${repoName}`,
        rule_id: 'README_RULE_MISSING',
        ruleId: 'README_RULE_MISSING',
        category: 'documentation',
        severity: 'warning',
        repository: repoName,
        evidence: `No README file detected at repository root or docs/ folder.`,
        message: `Missing README in ${repoName}`,
        why_it_matters: `A repository without a README is a black box; developers and recruiters cannot easily understand what it does or how to run it.`,
        whyItMatters: `A repository without a README is a black box; developers and recruiters cannot easily understand what it does or how to run it.`,
        suggested_fix: `Create a README.md covering project purpose, prerequisites, and quickstart commands.`,
        fix: `Create a README.md covering project purpose, prerequisites, and quickstart commands.`,
        score_impact: -10
      });
      continue;
    }

    const content = readmeInfo.readmeContent || '';
    let hasSetup = false;
    let hasDemo = false;

    // Check setup/install instructions
    if (!SETUP_REGEX.test(content)) {
      findings.push({
        id: `doc_missing_setup_${repoName}`,
        rule_id: 'README_RULE_SETUP',
        ruleId: 'README_RULE_SETUP',
        category: 'documentation',
        severity: 'improvement',
        repository: repoName,
        evidence: `README is present (${content.length} chars) but lacks setup/install/usage keywords.`,
        message: `No setup instructions detected by the README heuristic in ${repoName}`,
        why_it_matters: `Without setup or installation steps, collaborators cannot replicate or run your project.`,
        whyItMatters: `Without setup or installation steps, collaborators cannot replicate or run your project.`,
        suggested_fix: `Add an 'Installation' or 'Getting Started' section with exact step-by-step CLI commands.`,
        fix: `Add an 'Installation' or 'Getting Started' section with exact step-by-step CLI commands.`,
        score_impact: -5
      });
    } else {
      hasSetup = true;
    }

    // Check demo / visual evidence
    if (!DEMO_REGEX.test(content)) {
      findings.push({
        id: `doc_missing_demo_${repoName}`,
        rule_id: 'README_RULE_DEMO',
        ruleId: 'README_RULE_DEMO',
        category: 'documentation',
        severity: 'improvement',
        repository: repoName,
        evidence: `No screenshots, GIFs, video links, or preview links detected in README text.`,
        message: `No visual demo detected by the README analysis in ${repoName}`,
        why_it_matters: `Visual proof of work dramatically increases engagement and showcases functionality immediately.`,
        whyItMatters: `Visual proof of work dramatically increases engagement and showcases functionality immediately.`,
        suggested_fix: `Add a screenshot, GIF walk-through, or deployed live demo link to the README.`,
        fix: `Add a screenshot, GIF walk-through, or deployed live demo link to the README.`,
        score_impact: -3
      });
    } else {
      hasDemo = true;
    }

    if (hasSetup && hasDemo) {
      findings.push({
        id: `doc_healthy_${repoName}`,
        rule_id: 'README_RULE_HEALTHY',
        ruleId: 'README_RULE_HEALTHY',
        category: 'documentation',
        severity: 'healthy',
        repository: repoName,
        evidence: `README includes setup instructions and visual/demo references.`,
        message: `Clear documentation detected in ${repoName}`,
        why_it_matters: `Well-structured documentation improves project usability and signals engineering discipline.`,
        whyItMatters: `Well-structured documentation improves project usability and signals engineering discipline.`,
        suggested_fix: `Keep keeping it updated as new features land.`,
        fix: `Keep keeping it updated as new features land.`,
        score_impact: 0
      });
    }
  }

  return findings;
}

module.exports = {
  analyzeDocumentation
};
