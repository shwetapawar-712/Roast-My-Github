import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Code, Star, GitFork, Clock, BookOpen,
  Globe, Info, ChevronDown, ChevronUp, CheckCircle2, XCircle
} from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return 'No recent push';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (24 * 3600 * 1000));
  if (days <= 0) return 'Today';
  if (days < 30) return `${days}d ago`;
  const m = Math.floor(days / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

function computeAggregates(audit) {
  if (!audit) return { totalStars: 0, totalForks: 0, languages: [], latestPush: null };

  const repos = audit.analyzedRepositories || [];
  let totalStars = 0;
  let totalForks = 0;
  const langCount = {};
  let latestPush = null;

  repos.forEach(r => {
    totalStars += (r.stars || 0);
    totalForks += (r.forks || 0);
    if (r.language) {
      langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
    if (r.pushedAt) {
      const pTime = new Date(r.pushedAt).getTime();
      if (!latestPush || pTime > new Date(latestPush).getTime()) {
        latestPush = r.pushedAt;
      }
    }
  });

  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([lang]) => lang);

  return { totalStars, totalForks, languages: topLanguages, latestPush };
}

export function ProfileSnapshot({ audit1, audit2 }) {
  const [showExcluded1, setShowExcluded1] = useState(false);
  const [showExcluded2, setShowExcluded2] = useState(false);

  const p1 = audit1?.profile || {};
  const p2 = audit2?.profile || {};

  const agg1 = computeAggregates(audit1);
  const agg2 = computeAggregates(audit2);

  const excluded1 = audit1?.excludedRepositories || [];
  const excluded2 = audit2?.excludedRepositories || [];

  const publicRepos1 = audit1?.totalPublic ?? p1.publicRepos ?? 0;
  const publicRepos2 = audit2?.totalPublic ?? p2.publicRepos ?? 0;

  const scanned1 = audit1?.totalScanned ?? (audit1?.analyzedRepositories?.length || 0);
  const scanned2 = audit2?.totalScanned ?? (audit2?.analyzedRepositories?.length || 0);

  // Profile README presence check from presentation findings or profile data
  const hasProfileReadme1 = audit1?.findings?.some(f => f.category === 'presentation' && f.message?.toLowerCase().includes('profile readme') && f.severity === 'healthy');
  const hasProfileReadme2 = audit2?.findings?.some(f => f.category === 'presentation' && f.message?.toLowerCase().includes('profile readme') && f.severity === 'healthy');

  return (
    <section className="mb-10">
      <div className="mb-6">
        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
          <span>📋 Factual GitHub Snapshot</span>
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
          Side-by-side public metadata directly retrieved from the GitHub REST API.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 font-mono text-[11px] text-zinc-400">
                <th className="py-3 px-4 font-semibold w-1/3">METRIC</th>
                <th className="py-3 px-4 font-semibold text-orange-400 w-1/3 truncate">
                  👤 {p1.name || p1.username || 'Profile 1'}
                </th>
                <th className="py-3 px-4 font-semibold text-violet-400 w-1/3 truncate">
                  👤 {p2.name || p2.username || 'Profile 2'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">

              {/* Public Repos */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Public Repositories</td>
                <td className="py-3 px-4 text-white font-bold">{publicRepos1}</td>
                <td className="py-3 px-4 text-white font-bold">{publicRepos2}</td>
              </tr>

              {/* Analyzed Repositories */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Repositories Analyzed</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{scanned1}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{scanned2}</td>
              </tr>

              {/* Excluded Repositories */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Excluded Repositories</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{excluded1.length}</span>
                    {excluded1.length > 0 && (
                      <button
                        onClick={() => setShowExcluded1(!showExcluded1)}
                        className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        {showExcluded1 ? 'Hide' : 'Why?'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{excluded2.length}</span>
                    {excluded2.length > 0 && (
                      <button
                        onClick={() => setShowExcluded2(!showExcluded2)}
                        className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        {showExcluded2 ? 'Hide' : 'Why?'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>

              {/* Primary Languages */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Primary Languages</td>
                <td className="py-3 px-4 text-zinc-300">
                  {agg1.languages.length > 0 ? agg1.languages.join(', ') : <span className="text-zinc-500">None detected</span>}
                </td>
                <td className="py-3 px-4 text-zinc-300">
                  {agg2.languages.length > 0 ? agg2.languages.join(', ') : <span className="text-zinc-500">None detected</span>}
                </td>
              </tr>

              {/* Stars Sample */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Stars (Analyzed Repos)</td>
                <td className="py-3 px-4 text-amber-400 font-bold">★ {agg1.totalStars.toLocaleString()}</td>
                <td className="py-3 px-4 text-amber-400 font-bold">★ {agg2.totalForks.toLocaleString()}</td>
              </tr>

              {/* Forks Sample */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Forks (Analyzed Repos)</td>
                <td className="py-3 px-4 text-zinc-300">{agg1.totalForks.toLocaleString()}</td>
                <td className="py-3 px-4 text-zinc-300">{agg2.totalForks.toLocaleString()}</td>
              </tr>

              {/* Recent Activity */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Recent Push Activity</td>
                <td className="py-3 px-4 text-zinc-300">{timeAgo(agg1.latestPush)}</td>
                <td className="py-3 px-4 text-zinc-300">{timeAgo(agg2.latestPush)}</td>
              </tr>

              {/* Profile README */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Profile README Banner</td>
                <td className="py-3 px-4">
                  {hasProfileReadme1 ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Detected
                    </span>
                  ) : (
                    <span className="text-zinc-500">Not configured</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {hasProfileReadme2 ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Detected
                    </span>
                  ) : (
                    <span className="text-zinc-500">Not configured</span>
                  )}
                </td>
              </tr>

              {/* Website */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Website / Portfolio</td>
                <td className="py-3 px-4 text-zinc-300 truncate max-w-[200px]">
                  {p1.websiteUrl ? (
                    <a href={p1.websiteUrl.startsWith('http') ? p1.websiteUrl : `https://${p1.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                      {p1.websiteUrl}
                    </a>
                  ) : (
                    <span className="text-zinc-600">None provided</span>
                  )}
                </td>
                <td className="py-3 px-4 text-zinc-300 truncate max-w-[200px]">
                  {p2.websiteUrl ? (
                    <a href={p2.websiteUrl.startsWith('http') ? p2.websiteUrl : `https://${p2.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                      {p2.websiteUrl}
                    </a>
                  ) : (
                    <span className="text-zinc-600">None provided</span>
                  )}
                </td>
              </tr>

              {/* Bio */}
              <tr className="hover:bg-zinc-900/30 transition-colors">
                <td className="py-3 px-4 text-zinc-300 font-medium">Bio Description</td>
                <td className="py-3 px-4 text-zinc-400 font-sans text-xs italic">
                  {p1.bio ? `"${p1.bio}"` : <span className="text-zinc-600 font-mono">No bio</span>}
                </td>
                <td className="py-3 px-4 text-zinc-400 font-sans text-xs italic">
                  {p2.bio ? `"${p2.bio}"` : <span className="text-zinc-600 font-mono">No bio</span>}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Excluded repos details drawers */}
        <AnimatePresence>
          {(showExcluded1 || showExcluded2) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-zinc-950/80 border-t border-zinc-800 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showExcluded1 && (
                  <div>
                    <h5 className="font-mono font-bold text-orange-400 mb-2">
                      Profile 1 Excluded Repos ({excluded1.length})
                    </h5>
                    <ul className="space-y-1 text-zinc-400 font-mono text-[11px]">
                      {excluded1.map((ex, i) => (
                        <li key={i} className="flex justify-between gap-2 p-1.5 rounded bg-zinc-900/70">
                          <span className="text-zinc-200">{ex.name}</span>
                          <span className="text-zinc-500">{ex.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {showExcluded2 && (
                  <div>
                    <h5 className="font-mono font-bold text-violet-400 mb-2">
                      Profile 2 Excluded Repos ({excluded2.length})
                    </h5>
                    <ul className="space-y-1 text-zinc-400 font-mono text-[11px]">
                      {excluded2.map((ex, i) => (
                        <li key={i} className="flex justify-between gap-2 p-1.5 rounded bg-zinc-900/70">
                          <span className="text-zinc-200">{ex.name}</span>
                          <span className="text-zinc-500">{ex.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default ProfileSnapshot;
