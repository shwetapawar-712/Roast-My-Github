/**
 * Presentation Analyzer
 * Evaluates bio, personal portfolio/website, profile README, and topics.
 */

function analyzePresentation(profile, repoDetails = []) {
  const findings = [];

  if (!profile) {
    // If auditing single repo, check topics and description presentation
    const firstRepo = repoDetails[0]?.repo;
    if (firstRepo) {
      if (!firstRepo.topics || firstRepo.topics.length === 0) {
        findings.push({
          id: `pres_no_topics_${firstRepo.name}`,
          rule_id: 'TOPICS_RULE_MISSING',
          ruleId: 'TOPICS_RULE_MISSING',
          category: 'presentation',
          severity: 'improvement',
          repository: firstRepo.name,
          evidence: `Repository has 0 tags/topics attached.`,
          message: `No repository topics tagged on ${firstRepo.name}`,
          why_it_matters: `Topics help GitHub search index your project and allow developers with similar interests to discover it.`,
          whyItMatters: `Topics help GitHub search index your project and allow developers with similar interests to discover it.`,
          suggested_fix: `Add 3-5 relevant topic tags (e.g. 'react', 'fastapi', 'typescript') in the repository settings.`,
          fix: `Add 3-5 relevant topic tags (e.g. 'react', 'fastapi', 'typescript') in the repository settings.`,
          score_impact: -4
        });
      } else {
        findings.push({
          id: `pres_healthy_topics_${firstRepo.name}`,
          rule_id: 'TOPICS_RULE_HEALTHY',
          ruleId: 'TOPICS_RULE_HEALTHY',
          category: 'presentation',
          severity: 'healthy',
          repository: firstRepo.name,
          evidence: `Repository has ${firstRepo.topics.length} topic tags: ${firstRepo.topics.join(', ')}.`,
          message: `Topics tagged on ${firstRepo.name}`,
          why_it_matters: `Improves discoverability and contextual categorisation.`,
          whyItMatters: `Improves discoverability and contextual categorisation.`,
          suggested_fix: `Maintain updated topic tags.`,
          fix: `Maintain updated topic tags.`,
          score_impact: 0
        });
      }
    }
    return findings;
  }

  const username = profile.username;

  // 1. Profile Bio Check
  if (!profile.bio || profile.bio.trim().length < 5) {
    findings.push({
      id: `pres_no_bio_${username}`,
      rule_id: 'PROFILE_RULE_NO_BIO',
      ruleId: 'PROFILE_RULE_NO_BIO',
      category: 'presentation',
      severity: 'improvement',
      repository: null,
      evidence: `Profile bio is empty or shorter than 5 characters.`,
      message: `No profile bio set for @${username}`,
      why_it_matters: `Your bio is the first snippet viewed by anyone visiting your profile, offering a fast summary of your domain focus.`,
      whyItMatters: `Your bio is the first snippet viewed by anyone visiting your profile, offering a fast summary of your domain focus.`,
      suggested_fix: `Add a crisp 1-line bio describing your current focus, tech stack, or role.`,
      fix: `Add a crisp 1-line bio describing your current focus, tech stack, or role.`,
      score_impact: -5
    });
  }

  // 2. Profile README Check
  if (!profile.hasProfileReadme) {
    findings.push({
      id: `pres_no_readme_${username}`,
      rule_id: 'PROFILE_RULE_NO_README',
      ruleId: 'PROFILE_RULE_NO_README',
      category: 'presentation',
      severity: 'improvement',
      repository: null,
      evidence: `Special repository ${username}/${username} not found or lacks a README.md.`,
      message: `No custom profile README detected for @${username}`,
      why_it_matters: `A profile README lets you pin featured projects, display GitHub stats, and introduce your background dynamically.`,
      whyItMatters: `A profile README lets you pin featured projects, display GitHub stats, and introduce your background dynamically.`,
      suggested_fix: `Create a public repository named '${username}' with a README.md to display a custom profile banner.`,
      fix: `Create a public repository named '${username}' with a README.md to display a custom profile banner.`,
      score_impact: -5
    });
  }

  // 3. Website/Portfolio Link Check
  if (!profile.websiteUrl || profile.websiteUrl.trim().length < 4) {
    findings.push({
      id: `pres_no_website_${username}`,
      rule_id: 'PROFILE_RULE_NO_WEBSITE',
      ruleId: 'PROFILE_RULE_NO_WEBSITE',
      category: 'presentation',
      severity: 'improvement',
      repository: null,
      evidence: `Website / blog field on profile is blank.`,
      message: `No website or portfolio link provided`,
      why_it_matters: `Linking to a personal website, portfolio, or LinkedIn provides recruiters a direct path to learn more.`,
      whyItMatters: `Linking to a personal website, portfolio, or LinkedIn provides recruiters a direct path to learn more.`,
      suggested_fix: `Add your portfolio URL, blog, or LinkedIn profile to your GitHub profile settings.`,
      fix: `Add your portfolio URL, blog, or LinkedIn profile to your GitHub profile settings.`,
      score_impact: -3
    });
  }

  // 4. Healthy presentation check
  if (profile.bio && profile.hasProfileReadme && profile.websiteUrl) {
    findings.push({
      id: `pres_healthy_${username}`,
      rule_id: 'PROFILE_RULE_HEALTHY',
      ruleId: 'PROFILE_RULE_HEALTHY',
      category: 'presentation',
      severity: 'healthy',
      repository: null,
      evidence: `Profile bio, custom profile README, and personal website link are all present.`,
      message: `Comprehensive public profile presentation for @${username}`,
      why_it_matters: `A polished GitHub profile creates a strong first impression for peers and recruiters.`,
      whyItMatters: `A polished GitHub profile creates a strong first impression for peers and recruiters.`,
      suggested_fix: `Keep your pinned repositories and links refreshed.`,
      fix: `Keep your pinned repositories and links refreshed.`,
      score_impact: 0
    });
  }

  return findings;
}

module.exports = {
  analyzePresentation
};
