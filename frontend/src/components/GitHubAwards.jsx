import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import { Card } from './ui/Card.jsx';

/**
 * Evaluates deterministic awards strictly from verified audit findings and scores.
 * No random assignment, no fake data, no AI hallucination.
 */
export function evaluateAwards({
  categoryScores = [],
  findings = [],
  analyzedRepositories = [],
  repositoryAnalyses = [],
  repository = null,
  totalScanned = 0
}) {
  const repoCount = repository ? 1 : (analyzedRepositories?.length || totalScanned || 0);
  if (repoCount === 0) {
    return []; // No repository data available to award repo badges
  }

  const docCat = categoryScores.find(c => c.category === 'documentation');
  const actCat = categoryScores.find(c => c.category === 'activity');
  const qualCat = categoryScores.find(c => c.category === 'quality');
  const secCat = categoryScores.find(c => c.category === 'security');

  const docScore = docCat?.score;
  const actScore = actCat?.score;
  const qualScore = qualCat?.score;
  const secScore = secCat?.score;

  const awards = [];

  // 1. 🏆 README Warrior
  const hasStrongReadmeCoverage = (docScore !== null && docScore >= 80) ||
    (repositoryAnalyses.length > 0 && repositoryAnalyses.every(r => r.documentation?.readme));
  if (hasStrongReadmeCoverage) {
    awards.push({
      id: 'readme-warrior',
      emoji: '🏆',
      title: 'README Warrior',
      reason: 'Strong documentation coverage across inspected repositories.',
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      tag: 'Documentation'
    });
  }

  // 2. ⚡ Active Coder
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const hasRecentActivity = (actScore !== null && actScore >= 80) ||
    analyzedRepositories.some(r => r.pushedAt && (now - new Date(r.pushedAt).getTime()) < 30 * ONE_DAY_MS) ||
    (repository?.pushedAt && (now - new Date(repository.pushedAt).getTime()) < 30 * ONE_DAY_MS);
  if (hasRecentActivity) {
    awards.push({
      id: 'active-coder',
      emoji: '⚡',
      title: 'Active Coder',
      reason: 'Consistent development cadence with recent commits and pushes.',
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      tag: 'Activity'
    });
  }

  // 3. 🧹 Clean Repo Champion
  const hasEmptyFinding = findings.some(f => f.ruleId === 'EMPTY_REPO');
  const isHighQuality = qualScore !== null && qualScore >= 85 && !hasEmptyFinding;
  if (isHighQuality) {
    awards.push({
      id: 'clean-repo-champion',
      emoji: '🧹',
      title: 'Clean Repo Champion',
      reason: 'Structured repositories with clear naming, descriptions, and zero empty projects.',
      badgeColor: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
      tag: 'Quality'
    });
  }

  // 4. 🛡️ Security Conscious
  const hasSecurityEvaluated = secScore !== null && secCat?.status === 'healthy';
  const hasNoSecretLeaks = !findings.some(f => f.category === 'security' && f.severity === 'critical');
  if (hasSecurityEvaluated && hasNoSecretLeaks) {
    awards.push({
      id: 'security-conscious',
      emoji: '🛡️',
      title: 'Security Conscious',
      reason: 'Clean root hygiene with zero detected credential leaks or exposed secrets.',
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      tag: 'Security'
    });
  }

  // 5. 📚 Documentation Pro
  const isDocPro = docScore !== null && docScore >= 90 && !findings.some(f => f.ruleId === 'SETUP_MISSING' || f.ruleId === 'DEMO_MISSING');
  if (isDocPro) {
    awards.push({
      id: 'doc-pro',
      emoji: '📚',
      title: 'Documentation Pro',
      reason: 'Gold-standard documentation complete with setup instructions and preview demos.',
      badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
      tag: 'Excellence'
    });
  }

  // 6. 🦥 Stale Repo Survivor
  const hasStale = (actScore !== null && actScore < 60) ||
    findings.some(f => f.ruleId === 'STALE_REPO' || f.ruleId === 'INACTIVE_REPO');
  if (hasStale) {
    awards.push({
      id: 'stale-repo-survivor',
      emoji: '🦥',
      title: 'Stale Repo Survivor',
      reason: 'Preserving codebases that have been quietly dormant for over 12 months.',
      badgeColor: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
      tag: 'Nostalgia'
    });
  }

  // 7. 🚨 Documentation Wanted
  const hasMissingDocIssues = (docScore !== null && docScore < 60) ||
    findings.some(f => f.ruleId === 'README_MISSING' || f.ruleId === 'SETUP_MISSING');
  if (hasMissingDocIssues) {
    awards.push({
      id: 'documentation-wanted',
      emoji: '🚨',
      title: 'Documentation Wanted',
      reason: 'Missing README or setup instructions detected in inspected repositories.',
      badgeColor: 'border-red-500/30 bg-red-500/10 text-red-300',
      tag: 'Attention'
    });
  }

  return awards;
}

export function GitHubAwards({
  categoryScores = [],
  findings = [],
  analyzedRepositories = [],
  repositoryAnalyses = [],
  repository = null,
  totalScanned = 0
}) {
  const awards = evaluateAwards({
    categoryScores,
    findings,
    analyzedRepositories,
    repositoryAnalyses,
    repository,
    totalScanned
  });

  return (
    <Card className="mb-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-zinc-900 to-zinc-950">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            🏆 GitHub Awards
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated achievement badges unlocked from verified audit metrics and repository evidence
          </p>
        </div>
        <span className="text-xs font-mono text-amber-400/90 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
          {awards.length} Unlocked
        </span>
      </div>

      {awards.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-xl bg-zinc-900/40 border border-zinc-800/60">
          <Sparkles className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-400">No awards yet — improve your GitHub and scan again!</p>
          <p className="text-xs text-zinc-600 mt-1">
            Publish original repositories with README documentation and active commits to earn badges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {awards.map((award, i) => (
            <motion.div
              key={award.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`p-3.5 rounded-xl border ${award.badgeColor} bg-zinc-900/80 flex items-start gap-3 transition-all duration-200 shadow-sm`}
            >
              <div className="text-2xl select-none shrink-0 mt-0.5">{award.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-sm text-white truncate">{award.title}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-400 shrink-0">
                    {award.tag}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{award.reason}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
