import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, RefreshCw, Share2, BookOpen, Activity, Code2, Users, Shield,
  AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, ChevronRight,
  ExternalLink, Globe, Star, GitFork, Clock, ArrowUp, ArrowDown,
  Minus, Zap, Eye, EyeOff, Copy, Download, X, FlameKindling,
  Thermometer, Siren, Info, GitBranch, Lock, Calendar, Package,
  Check, FileText, AlertCircle, HelpCircle, ArrowLeft, Layers,
  Award, Briefcase, TrendingUp, CheckCircle, Compass, Swords
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon.jsx';
import { useScan } from '../context/ScanContext.jsx';
import { ProgressRing } from '../components/ui/ProgressRing.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { GitHubAwards } from '../components/GitHubAwards.jsx';
import { GitHubPersonalityCard } from '../components/GitHubPersonalityCard.jsx';
import { regenerateRoast, rescanProfile } from '../api/client.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / (30 * 24 * 3600 * 1000));
  if (m <= 0) return 'This month';
  if (m < 12) return `${m}mo ago`;
  return `${Math.round(m / 12)}y ago`;
}

function categoryIcon(cat) {
  const map = { documentation: BookOpen, activity: Activity, quality: Code2, presentation: Users, security: Shield };
  return map[cat] || Zap;
}
function categoryColor(cat) {
  const map = { documentation: 'text-blue-400', activity: 'text-emerald-400', quality: 'text-violet-400', presentation: 'text-pink-400', security: 'text-amber-400' };
  return map[cat] || 'text-zinc-400';
}
function categoryBg(cat) {
  const map = { documentation: 'bg-blue-500/10 border-blue-500/20', activity: 'bg-emerald-500/10 border-emerald-500/20', quality: 'bg-violet-500/10 border-violet-500/20', presentation: 'bg-pink-500/10 border-pink-500/20', security: 'bg-amber-500/10 border-amber-500/20' };
  return map[cat] || 'bg-zinc-800 border-zinc-700';
}

const INTENSITY_OPTIONS = [
  { id: 'friendly', icon: FlameKindling, label: 'Friendly', desc: 'Constructive & Supportive', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
  { id: 'brutal',   icon: Flame,        label: 'Brutal',   desc: 'Classic Savage Roaster',   color: 'text-orange-400 border-orange-500/30 bg-orange-500/5' },
  { id: 'nuclear',  icon: Siren,        label: 'Nuclear',  desc: 'Ruthless Code Smasher',    color: 'text-red-400 border-red-500/30 bg-red-500/5' }
];

// ═════════════════════════════════════════════════════════════════════════════
// DEVELOPER VIEW SUB-COMPONENTS (Technical Audit & Remediation)
// ═════════════════════════════════════════════════════════════════════════════

function ProfileHeader({ profile, scannedAt, analysisNote, totalPublic, totalScanned, excludedCount }) {
  return (
    <Card className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <img
          src={profile.avatarUrl}
          alt={profile.username}
          className="w-20 h-20 rounded-2xl ring-2 ring-orange-500/30 shrink-0 bg-zinc-900"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-2xl text-white">{profile.name || profile.username}</h1>
            <a href={profile.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Technical Audit
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-0.5 font-mono">@{profile.username}</p>
          {profile.bio && <p className="text-zinc-300 text-sm mt-2 max-w-xl">{profile.bio}</p>}
          <div className="flex items-center flex-wrap gap-4 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{profile.followers?.toLocaleString() || 0} followers</span>
            {profile.websiteUrl && (
              <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                <Globe className="w-3 h-3" />{profile.websiteUrl}
              </a>
            )}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Scanned {timeAgo(scannedAt)}</span>
          </div>
        </div>
      </div>

      {/* Repos stats */}
      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Total Public Repos: <strong className="text-white font-mono">{totalPublic || profile.publicRepos || 0}</strong></span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">Analyzed Sample: <strong className="text-emerald-400 font-mono">{totalScanned || 0}</strong></span>
          {excludedCount > 0 && (
            <>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">Excluded (forks/archived): <strong className="text-amber-400 font-mono">{excludedCount}</strong></span>
            </>
          )}
        </div>
      </div>

      {analysisNote && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-orange-500/5 border border-orange-500/15 text-xs text-orange-300">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
          {analysisNote}
        </div>
      )}
    </Card>
  );
}

function RepositoryHeader({ repository, scannedAt, analysisNote }) {
  return (
    <Card className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400 shrink-0">
          <Package className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-2xl text-white">{repository.name}</h1>
            <a href={repository.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Single Repository Audit
            </span>
            {repository.archived && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Archived
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm mt-0.5 font-mono">Owner: @{repository.owner}</p>
          {repository.description && <p className="text-zinc-300 text-sm mt-2 max-w-2xl">{repository.description}</p>}
          
          <div className="flex items-center flex-wrap gap-4 mt-3 text-xs text-zinc-500">
            {repository.language && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" />{repository.language}</span>}
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" />{repository.stars?.toLocaleString() || 0} stars</span>
            <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />{repository.forks?.toLocaleString() || 0} forks</span>
            {repository.license && <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-zinc-400" />{repository.license}</span>}
            <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" />{repository.defaultBranch || 'main'}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Last pushed {timeAgo(repository.pushedAt)}</span>
          </div>

          {repository.topics && repository.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {repository.topics.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {analysisNote && (
        <div className="mt-4 flex items-start gap-2 px-3 py-2 rounded-xl bg-orange-500/5 border border-orange-500/15 text-xs text-orange-300">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
          {analysisNote}
        </div>
      )}
    </Card>
  );
}

function OverallScoreCard({ overallScore, overallLabel, categoryScores, isRepository = false }) {
  const isOverallNA = overallScore === null || overallScore === undefined;

  return (
    <Card className="mb-6 border border-orange-500/15 neon-glow-orange">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="text-center shrink-0">
          <ProgressRing score={overallScore} size={140} strokeWidth={12} animate label={overallLabel} />
          <p className="text-zinc-500 text-xs mt-2">{isRepository ? 'Repository Score' : 'Overall Profile Score'}</p>
        </div>
        <div className="flex-1 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoryScores.map((cat, i) => {
              const IconComp = categoryIcon(cat.category);
              const isNA = cat.score === null || cat.score === undefined || cat.status === 'not_applicable';
              const isWarning = cat.status === 'warning';
              const isHealthy = cat.status === 'healthy';

              const statusColor = isNA
                ? 'text-zinc-500'
                : isHealthy
                ? 'text-emerald-400'
                : 'text-amber-400';

              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`rounded-xl p-3 border ${categoryBg(cat.category)} text-center flex flex-col justify-between`}
                  title={cat.reason || (isNA ? 'No data available for this category' : `${cat.score}/100`)}
                >
                  <div>
                    <IconComp className={`w-4 h-4 mx-auto mb-1.5 ${isNA ? 'text-zinc-500' : categoryColor(cat.category)}`} />
                    <div className={`font-heading font-bold text-xl ${statusColor}`}>
                      {isNA ? 'N/A' : `${cat.score}`}
                    </div>
                    <div className="text-zinc-300 text-[10px] font-medium mt-0.5 leading-tight">{cat.name}</div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                    <span>{Math.round(cat.weight * 100)}%</span>
                    <span className={isNA ? 'text-zinc-500' : isHealthy ? 'text-emerald-500' : 'text-amber-500'}>
                      {isNA ? 'N/A' : isHealthy ? 'Healthy' : `-${cat.penalties}pts`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ExcludedRepositoriesCard({ excludedRepositories = [] }) {
  const [open, setOpen] = useState(false);
  if (!excludedRepositories || excludedRepositories.length === 0) return null;

  return (
    <Card className="mb-6 border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">
            Repositories Excluded from Main Score ({excludedRepositories.length})
          </span>
        </div>
        <span className="text-xs text-orange-400 font-mono hover:underline">
          {open ? 'Hide details' : 'Show why excluded'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-zinc-800"
          >
            <p className="text-xs text-zinc-400 mb-3">
              Forks and archived repositories are excluded from penalizing your main engineering score, ensuring your score reflects original, active codebases.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {excludedRepositories.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs flex items-center justify-between gap-2">
                  <span className="font-mono text-zinc-200 truncate">{item.name}</span>
                  <span className="text-[11px] text-zinc-500 shrink-0">{item.reason}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function FindingsCenter({ findings = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSeverity, setActiveSeverity] = useState('all');

  const severityBadge = {
    critical: '🔴 Critical',
    warning: '🟠 Warning',
    improvement: '🟡 Improvement',
    healthy: '✅ Healthy'
  };

  const filtered = findings.filter(f => {
    if (activeCategory !== 'all' && f.category !== activeCategory) return false;
    if (activeSeverity !== 'all' && f.severity !== activeSeverity) return false;
    return true;
  });

  return (
    <Card className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-heading font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            Detailed Findings Center
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Calculated by rule engine with transparent heuristic evidence</p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'critical', 'warning', 'improvement', 'healthy'].map(sev => (
            <button
              key={sev}
              onClick={() => setActiveSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeSeverity === sev
                  ? 'bg-orange-500 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {sev === 'all' ? 'All Severities' : severityBadge[sev]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No findings match the selected filter.
          </div>
        ) : (
          filtered.map((f, i) => {
            const Icon = categoryIcon(f.category);
            const isNegative = f.score_impact < 0;

            return (
              <motion.div
                key={f.id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${categoryBg(f.category)} shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${categoryColor(f.category)}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{f.message}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                          {f.severity}
                        </span>
                        {f.repository && (
                          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {f.repository}
                          </span>
                        )}
                      </div>

                      {/* Evidence */}
                      {f.evidence && (
                        <div className="mt-2 text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900 font-mono">
                          <strong className="text-zinc-500 font-semibold">Evidence:</strong> {f.evidence}
                        </div>
                      )}

                      {/* Why it matters & Suggested Fix */}
                      <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {(f.why_it_matters || f.whyItMatters) && (
                          <div className="text-zinc-400">
                            <span className="text-zinc-500 font-medium">Why it matters: </span>
                            {f.why_it_matters || f.whyItMatters}
                          </div>
                        )}
                        {(f.suggested_fix || f.fix) && f.severity !== 'healthy' && (
                          <div className="text-emerald-400/90">
                            <span className="text-emerald-500/70 font-medium">Suggested Fix: </span>
                            {f.suggested_fix || f.fix}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isNegative && (
                    <span className="text-xs font-mono font-bold text-red-400 shrink-0 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                      {f.score_impact} pts
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}

function SingleRepoDeepAudit({ repositoryAnalysis }) {
  if (!repositoryAnalysis) return null;
  const { documentation, quality, activity } = repositoryAnalysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Documentation Card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h3 className="font-heading font-semibold text-white text-sm">README Heuristic Breakdown</h3>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60">
            <span className="text-zinc-300">README Presence:</span>
            <span className={documentation.readme ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {documentation.readme ? '✓ Detected' : '✗ Missing'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60">
            <span className="text-zinc-300">Setup Instructions Heuristic:</span>
            <span className={documentation.setup ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {documentation.setup ? '✓ Detected' : '✗ Not detected in text'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60">
            <span className="text-zinc-300">Visual Demo / Preview Links:</span>
            <span className={documentation.demo ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {documentation.demo ? '✓ Detected' : '✗ None found in README'}
            </span>
          </div>
        </div>
      </Card>

      {/* Security Hygiene Card */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-semibold text-white text-sm">Security Hygiene Audit</h3>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded bg-zinc-900/60 text-zinc-300">
            <div className="font-semibold text-white mb-1">Credential Exposure Check</div>
            <p className="text-zinc-400">
              Scanned root directory for sensitive key patterns. Actual secret values are never displayed.
            </p>
          </div>
          <div className="p-2.5 rounded bg-zinc-900/60 text-zinc-400">
            <div className="font-semibold text-zinc-300 mb-0.5">Dependency Vulnerability Verification</div>
            <p className="text-zinc-500 text-[11px]">
              Dependency vulnerability verification unavailable (external CVE databases not queried).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RepositoryExplorer({ username, analyzedRepositories = [], repositoryAnalyses = [] }) {
  const [selectedRepo, setSelectedRepo] = useState(null);

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-semibold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" />
            Analyzed Repository Explorer ({analyzedRepositories.length})
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Click any repository to inspect its individual audit breakdown</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {analyzedRepositories.map((repo) => {
          const analysis = repositoryAnalyses.find(a => a.repository?.name === repo.name);
          const score = analysis?.score ?? 100;
          const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';

          return (
            <div
              key={repo.name}
              onClick={() => setSelectedRepo(selectedRepo?.name === repo.name ? null : repo)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedRepo?.name === repo.name
                  ? 'bg-zinc-800 border-orange-500/50 shadow-md'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-heading font-semibold text-white text-sm truncate">{repo.name}</span>
                <span className={`font-mono text-xs font-bold ${scoreColor}`}>{score}/100</span>
              </div>
              {repo.description ? (
                <p className="text-zinc-400 text-xs line-clamp-2 mb-2">{repo.description}</p>
              ) : (
                <p className="text-zinc-600 text-xs italic mb-2">No description provided</p>
              )}
              <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                {repo.language && <span>{repo.language}</span>}
                <span>★ {repo.stars}</span>
                <span>{timeAgo(repo.pushedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedRepo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-zinc-800"
          >
            {(() => {
              const analysis = repositoryAnalyses.find(a => a.repository?.name === selectedRepo.name);
              if (!analysis) return null;
              return <SingleRepoDeepAudit repositoryAnalysis={analysis} />;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function RoastSection({ scanResult, intensity, onIntensityChange, targetIdentifier }) {
  const [loadingIntensity, setLoadingIntensity] = useState(false);
  const roast = scanResult?.roast || {};

  const handleSelectIntensity = async (newIntensity) => {
    if (newIntensity === intensity || loadingIntensity) return;
    setLoadingIntensity(true);
    try {
      const data = await regenerateRoast(targetIdentifier, newIntensity);
      onIntensityChange(newIntensity, data);
    } catch (e) {
      console.error('Failed to change intensity:', e);
    } finally {
      setLoadingIntensity(false);
    }
  };

  return (
    <Card className="mb-6 border-orange-500/20 bg-orange-500/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-orange-500/15">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="font-heading font-bold text-lg text-white">AI Roast & Narration</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Grounded entirely in pre-computed deterministic facts. Changing intensity only changes tone.
          </p>
        </div>

        {/* Intensity Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          {INTENSITY_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isSelected = intensity === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectIntensity(opt.id)}
                disabled={loadingIntensity}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {roast.aiUnavailable && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>AI narration service ({roast.provider || 'configured provider'}) unavailable. Displaying deterministic template roast grounded in verified audit findings.</span>
          </div>
        )}

        <p className="text-zinc-200 text-sm sm:text-base leading-relaxed italic bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
          "{roast.roast || 'Roast narration ready.'}"
        </p>

        {roast.summary && (
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
            <strong className="text-orange-400 font-semibold">Audit Summary: </strong>
            {roast.summary}
          </div>
        )}
      </div>
    </Card>
  );
}

function FixCenter({ roast = {}, findings = [] }) {
  const [completed, setCompleted] = useState({});

  const priorityActions = (roast.priority_actions || [])
    .filter(item => typeof item === 'string' && item.trim().length > 0 && !item.toLowerCase().includes('undefined') && !item.toLowerCase().includes('null'));

  const recommendations = (roast.recommendations || [])
    .filter(item => typeof item === 'string' && item.trim().length > 0 && !item.toLowerCase().includes('undefined') && !item.toLowerCase().includes('null'));

  const displayActions = priorityActions.length > 0
    ? priorityActions
    : findings.filter(f => f.score_impact < 0).slice(0, 4).map((f, i) => `${i + 1}. [${f.category.toUpperCase()}] ${f.suggested_fix || f.fix || f.message}`);

  const displayRecs = recommendations.length > 0
    ? recommendations
    : ['Ensure all repositories have README documentation.', 'Archive dormant repositories.', 'Keep topic tags and descriptions updated.'];

  const toggleFix = (key) => {
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <Card className="mb-6 border-emerald-500/20 bg-emerald-500/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Fix Center & Actionable Roadmap
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Check off prioritized remediation items as you resolve them</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold">
          {completedCount}/{displayActions.length} resolved
        </span>
      </div>

      <div className="space-y-2.5">
        {displayActions.map((action, idx) => {
          const isDone = Boolean(completed[idx]);
          return (
            <div
              key={idx}
              onClick={() => toggleFix(idx)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                isDone
                  ? 'bg-zinc-950/60 border-zinc-800 text-zinc-500 line-through'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-emerald-500/40 text-zinc-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                isDone ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700 bg-zinc-950'
              }`}>
                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs leading-relaxed font-medium">{action}</span>
            </div>
          );
        })}
      </div>

      {displayRecs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-emerald-500/15">
          <div className="text-xs font-semibold text-zinc-400 mb-2">Recommended Best Practices:</div>
          <ul className="space-y-1 text-xs text-zinc-400">
            {displayRecs.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// RECRUITER VIEW (Clean Public Portfolio Summary)
// ═════════════════════════════════════════════════════════════════════════════

function RecruiterView({
  profile,
  repository,
  overallScore,
  overallLabel,
  categoryScores = [],
  analyzedRepositories = [],
  repositoryAnalyses = [],
  findings = [],
  totalScanned = 0
}) {
  const isRepo = Boolean(repository);
  const targetName = isRepo ? repository.name : profile?.name || profile?.username;

  // Derive active projects (pushed within last 180 days)
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const activeProjectsCount = isRepo
    ? (repository.pushedAt && (now - new Date(repository.pushedAt).getTime()) < 180 * ONE_DAY_MS ? 1 : 0)
    : analyzedRepositories.filter(r => r.pushedAt && (now - new Date(r.pushedAt).getTime()) < 180 * ONE_DAY_MS).length;

  const docCat = categoryScores.find(c => c.category === 'documentation');
  const actCat = categoryScores.find(c => c.category === 'activity');
  const secCat = categoryScores.find(c => c.category === 'security');
  const presCat = categoryScores.find(c => c.category === 'presentation');

  const docDisplay = docCat?.score !== null && docCat?.score !== undefined ? `${docCat.score}/100` : 'N/A';
  const actDisplay = actCat?.score !== null && actCat?.score !== undefined ? `${actCat.score}/100` : 'N/A';
  const secDisplay = secCat?.score !== null && secCat?.score !== undefined ? `${secCat.score}/100` : 'N/A';
  const presDisplay = presCat?.score !== null && presCat?.score !== undefined ? `${presCat.score}/100` : 'N/A';

  // Filter positive/healthy indicators for Strengths
  const healthyFindings = findings.filter(f => f.severity === 'healthy');
  const negativeFindings = findings.filter(f => f.score_impact < 0);

  // Top featured projects for showcase
  const topProjects = isRepo ? [repository] : analyzedRepositories.slice(0, 4);

  return (
    <div className="space-y-6">

      {/* Recruiter Header Banner */}
      <Card className="border-cyan-500/25 bg-gradient-to-br from-cyan-950/30 via-zinc-900 to-zinc-950">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={profile?.avatarUrl || repository?.ownerAvatarUrl}
              alt={targetName}
              className="w-20 h-20 rounded-2xl ring-2 ring-cyan-500/30 bg-zinc-900 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-bold text-2xl text-white">{targetName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Public Candidate Portfolio
                </span>
              </div>
              <p className="text-cyan-400 text-sm font-mono mt-0.5">
                {isRepo ? `Repository: ${repository.name}` : `@${profile?.username}`}
              </p>
              {profile?.bio && <p className="text-zinc-300 text-sm mt-2 max-w-xl">{profile.bio}</p>}
              
              <div className="flex items-center flex-wrap gap-4 mt-3 text-xs text-zinc-400">
                {profile?.followers !== undefined && (
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-zinc-500" />{profile.followers.toLocaleString()} GitHub followers</span>
                )}
                {profile?.websiteUrl && (
                  <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                    <Globe className="w-3.5 h-3.5" />{profile.websiteUrl}
                  </a>
                )}
                <a
                  href={isRepo ? repository.htmlUrl : profile?.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />View on GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Clean Quality Badge */}
          <div className="flex flex-col items-center sm:items-end p-4 rounded-2xl bg-zinc-900/90 border border-cyan-500/20 text-center sm:text-right shrink-0">
            <div className="text-xs text-zinc-400 font-medium">Engineering Quality</div>
            <div className="font-heading font-black text-3xl text-cyan-300 mt-1">
              {overallScore !== null && overallScore !== undefined ? `${overallScore}/100` : 'N/A'}
            </div>
            <div className="text-xs font-semibold text-cyan-400 mt-0.5">{overallLabel}</div>
          </div>
        </div>
      </Card>

      {/* Portfolio Snapshot Metrics Grid */}
      <div>
        <h2 className="font-heading font-semibold text-white text-base mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          Portfolio Snapshot
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[11px] font-medium">Projects Evaluated</div>
            <div className="font-heading font-bold text-2xl text-white mt-1">
              {isRepo ? 1 : analyzedRepositories.length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[11px] font-medium">Active Codebases</div>
            <div className="font-heading font-bold text-2xl text-emerald-400 mt-1">
              {activeProjectsCount}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[11px] font-medium">Documentation</div>
            <div className="font-heading font-bold text-2xl text-blue-400 mt-1">
              {docDisplay}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[11px] font-medium">Activity Cadence</div>
            <div className="font-heading font-bold text-2xl text-emerald-400 mt-1">
              {actDisplay}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[11px] font-medium">Security Hygiene</div>
            <div className="font-heading font-bold text-2xl text-amber-400 mt-1">
              {secDisplay}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div className="text-zinc-500 text-[11px] font-medium">Presentation</div>
            <div className="font-heading font-bold text-2xl text-pink-400 mt-1">
              {presDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 GitHub Awards Showcase */}
      <GitHubAwards
        categoryScores={categoryScores}
        findings={findings}
        analyzedRepositories={analyzedRepositories}
        repositoryAnalyses={repositoryAnalyses}
        repository={repository}
        totalScanned={totalScanned}
      />

      {/* Project Highlights Showcase */}
      <Card className="border-zinc-800">
        <h2 className="font-heading font-semibold text-white text-base mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Project Highlights & Featured Repositories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topProjects.map(repo => (
            <div
              key={repo.name}
              className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-heading font-bold text-white text-sm">{repo.name}</span>
                  <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {repo.description ? (
                  <p className="text-zinc-300 text-xs line-clamp-2 mb-3">{repo.description}</p>
                ) : (
                  <p className="text-zinc-500 text-xs italic mb-3">No description provided</p>
                )}
              </div>

              <div className="flex items-center flex-wrap justify-between gap-2 pt-2.5 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  {repo.language || 'Plain Text'}
                </span>
                <span>★ {repo.stars?.toLocaleString() || 0}</span>
                <span>{repo.license || 'No License'}</span>
                <span className="text-zinc-500">{timeAgo(repo.pushedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Profile Strengths vs Areas to Improve */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Verified Technical Strengths */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Verified Technical Strengths
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {healthyFindings.length > 0 ? (
              healthyFindings.slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span className="leading-relaxed">{f.message}</span>
                </li>
              ))
            ) : (
              <li className="text-zinc-400">Demonstrates consistent technical foundations across verified repositories.</li>
            )}
          </ul>
        </Card>

        {/* Recommended Professional Polish */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Areas for Professional Polish
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {negativeFindings.length > 0 ? (
              negativeFindings.slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{f.suggested_fix || f.fix || f.message}</span>
                </li>
              ))
            ) : (
              <li className="text-emerald-400">No critical remediation areas detected. Portfolio presentation is solid.</li>
            )}
          </ul>
        </Card>
      </div>

    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD CONTAINER
// ═════════════════════════════════════════════════════════════════════════════

export default function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();
  const {
    scanResult, setScanResult, intensity, setIntensity,
    updateRoast, recruiterMode, setRecruiterMode, clearScan
  } = useScan();

  const [rescanning, setRescanning] = useState(false);
  const [rescanDelta, setRescanDelta] = useState(null);
  const roastSectionRef = useRef(null);

  // If no scan in context, redirect to scanning with current route param
  React.useEffect(() => {
    if (!scanResult && username) {
      navigate(`/scanning/${encodeURIComponent(username)}`, { replace: true });
    }
  }, [scanResult, username, navigate]);

  if (!scanResult) return null;

  const isRepository = scanResult.target?.type === 'repository';
  const targetIdentifier = scanResult.target?.cleanIdentifier || scanResult.profile?.username || username;

  const {
    profile, repository, categoryScores = [], overallScore = 70, overallLabel = 'Solid Engineering',
    findings = [], repositoryAnalyses = [], analyzedRepositories = [], archivedRepositories = [],
    forkRepositories = [], excludedRepositories = [], roast = {}, scannedAt, analysisNote
  } = scanResult;

  const handleBackToHome = () => {
    clearScan();
    navigate('/');
  };

  const handleNewScan = () => {
    clearScan();
    navigate('/');
  };

  const handleRescan = async () => {
    setRescanning(true);
    try {
      const data = await rescanProfile(targetIdentifier, intensity);
      setScanResult(data);
      if (data.scoreDelta !== undefined) setRescanDelta(data.scoreDelta);
    } catch (e) {
      console.error('Rescan failed:', e);
    } finally {
      setRescanning(false);
    }
  };

  const handleIntensityChange = (newIntensity, newRoastData) => {
    setIntensity(newIntensity);
    updateRoast({ intensity: newIntensity, ...newRoastData });
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative text-zinc-100 pb-16">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] rounded-full blur-3xl transition-colors duration-500 ${
          recruiterMode ? 'bg-cyan-600/5' : 'bg-orange-600/5'
        }`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Topbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            {/* Clearly Visible Back to Home Button */}
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Return to home and clear scan state"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <button onClick={handleBackToHome} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors cursor-pointer">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-heading font-bold text-base">ROAST MY GITHUB</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher: Developer View | Recruiter View */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setRecruiterMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !recruiterMode
                    ? 'bg-orange-500 text-black font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Developer View
              </button>
              <button
                onClick={() => setRecruiterMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  recruiterMode
                    ? 'bg-cyan-500 text-black font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Recruiter View
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={rescanning}
              onClick={handleRescan}
              id="rescan-btn"
            >
              Rescan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Swords}
              onClick={() => navigate(profile?.username ? `/compare?u1=${encodeURIComponent(profile.username)}` : '/compare')}
              className="text-xs"
              title="Compare this profile with another GitHub user"
            >
              Compare
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Flame}
              onClick={handleNewScan}
            >
              New Scan
            </Button>
          </div>
        </div>

        {/* Score Delta Banner */}
        <AnimatePresence>
          {rescanDelta !== null && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 px-4 py-3 rounded-xl border flex items-center gap-3 ${
                rescanDelta > 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : rescanDelta < 0
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {rescanDelta > 0 ? <ArrowUp className="w-4 h-4" /> : rescanDelta < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              <span className="text-sm font-semibold">
                Score {rescanDelta > 0 ? `improved by +${rescanDelta}` : rescanDelta < 0 ? `decreased by ${rescanDelta}` : `unchanged`} since previous scan
              </span>
              <button onClick={() => setRescanDelta(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════════════
            CONDITIONAL VIEW SWITCHING: DEVELOPER VIEW vs RECRUITER VIEW
        ═══════════════════════════════════════════════════════════════════════ */}
        {recruiterMode ? (
          /* 👔 RECRUITER VIEW (Clean Public Portfolio Summary) */
          <RecruiterView
            profile={profile}
            repository={repository}
            overallScore={overallScore}
            overallLabel={overallLabel}
            categoryScores={categoryScores}
            analyzedRepositories={analyzedRepositories}
            repositoryAnalyses={repositoryAnalyses}
            findings={findings}
            totalScanned={scanResult.totalScanned ?? analyzedRepositories.length}
          />
        ) : (
          /* 🛠️ DEVELOPER VIEW (Detailed Technical Audit & Remediation) */
          <>
            {/* Target Header Banner */}
            {isRepository && repository ? (
              <RepositoryHeader
                repository={repository}
                scannedAt={scannedAt}
                analysisNote={analysisNote}
              />
            ) : (
              <ProfileHeader
                profile={profile || { username: targetIdentifier }}
                scannedAt={scannedAt}
                analysisNote={analysisNote}
                totalPublic={scanResult.totalPublic ?? scanResult.repositories?.length ?? profile?.publicRepos ?? 0}
                totalScanned={scanResult.totalScanned ?? scanResult.analyzedRepositories?.length ?? 0}
                excludedCount={scanResult.totalExcluded ?? scanResult.excludedRepositories?.length ?? 0}
              />
            )}

            {/* Overall Score Card */}
            <OverallScoreCard
              overallScore={overallScore}
              overallLabel={overallLabel}
              categoryScores={categoryScores}
              isRepository={isRepository}
            />

            {/* Zero analyzable repositories callout */}
            {!isRepository && analyzedRepositories.length === 0 && (
              <Card className="mb-6 border-zinc-800 bg-zinc-900/40">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading font-semibold text-white text-sm">Repository Analysis Unavailable</h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      {(scanResult.totalPublic ?? scanResult.repositories?.length ?? 0) === 0
                        ? 'No public repositories were found on this account.'
                        : `No original public repositories available for inspection (${scanResult.totalExcluded ?? scanResult.excludedRepositories?.length ?? 0} excluded: forks or archived).`}
                    </p>
                    <p className="text-zinc-500 text-xs mt-2">
                      Repository-dependent categories (Documentation, Activity, Repository Quality, Security Hygiene) require analyzed repositories and are marked as N/A.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* 🏆 GitHub Awards */}
            <GitHubAwards
              categoryScores={categoryScores}
              findings={findings}
              analyzedRepositories={analyzedRepositories}
              repositoryAnalyses={repositoryAnalyses}
              repository={repository}
              totalScanned={scanResult.totalScanned ?? analyzedRepositories.length}
            />

            {/* 👤 GitHub Personality Card */}
            <GitHubPersonalityCard
              categoryScores={categoryScores}
              findings={findings}
              analyzedCount={scanResult.totalScanned ?? analyzedRepositories.length}
              roastSectionRef={roastSectionRef}
            />

            {/* Excluded Repositories accordion if profile scan */}
            {!isRepository && excludedRepositories.length > 0 && (
              <ExcludedRepositoriesCard excludedRepositories={excludedRepositories} />
            )}

            {/* If Single Repository Scan, show Deep Audit Cards */}
            {isRepository && repositoryAnalyses.length > 0 && (
              <SingleRepoDeepAudit repositoryAnalysis={repositoryAnalyses[0]} />
            )}

            {/* Detailed Findings Center */}
            <FindingsCenter findings={findings} />

            {/* If Profile Scan, show Repository Explorer */}
            {!isRepository && analyzedRepositories.length > 0 && (
              <RepositoryExplorer
                username={profile?.username || targetIdentifier}
                analyzedRepositories={analyzedRepositories}
                repositoryAnalyses={repositoryAnalyses}
              />
            )}

            {/* AI Roast Narration */}
            <div ref={roastSectionRef}>
              <RoastSection
                scanResult={scanResult}
                intensity={intensity}
                onIntensityChange={handleIntensityChange}
                targetIdentifier={targetIdentifier}
              />
            </div>

            {/* Fix Center Roadmap */}
            <FixCenter roast={roast} findings={findings} />
          </>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-zinc-600 py-6 border-t border-zinc-800/60 mt-8">
          <p>“Your GitHub. Audited. Secured. Roasted.” · All scores computed by deterministic rule engine</p>
        </div>

      </div>
    </div>
  );
}
