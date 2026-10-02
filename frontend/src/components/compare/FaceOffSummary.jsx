import React from 'react';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle, BarChart3, Swords, CheckCircle } from 'lucide-react';

function getProfileHighlights(audit) {
  if (!audit) return { strongest: null, improvement: null, evaluatedCount: 0, totalCategories: 5 };

  const catScores = audit.categoryScores || [];
  const validScores = catScores.filter(c => c.score !== null && c.score !== undefined && c.status !== 'not_applicable');
  const evaluatedCount = validScores.length;

  let strongest = null;
  if (validScores.length > 0) {
    strongest = [...validScores].sort((a, b) => b.score - a.score)[0];
  }

  // Lowest scoring category among evaluated categories or category with highest penalties
  let improvement = null;
  const categoriesWithPenalties = catScores.filter(c => c.penalties > 0);
  if (categoriesWithPenalties.length > 0) {
    improvement = [...categoriesWithPenalties].sort((a, b) => b.penalties - a.penalties)[0];
  } else if (validScores.length > 0) {
    // If no penalties, check lowest score if any
    const lowest = [...validScores].sort((a, b) => a.score - b.score)[0];
    if (lowest && lowest.score < 100) {
      improvement = lowest;
    }
  }

  return {
    strongest,
    improvement,
    evaluatedCount,
    totalCategories: catScores.length || 5,
    naCategories: catScores.filter(c => c.status === 'not_applicable' || c.score === null)
  };
}

export function FaceOffSummary({ audit1, audit2 }) {
  const p1 = audit1?.profile || {};
  const p2 = audit2?.profile || {};

  const h1 = getProfileHighlights(audit1);
  const h2 = getProfileHighlights(audit2);

  return (
    <section className="mb-10">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold mb-2">
          <Swords className="w-3.5 h-3.5" />
          <span>BENCHMARK HIGHLIGHTS</span>
        </div>
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
          ⚔️ GITHUB FACE-OFF
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          “Different profiles. Different strengths. Different areas to improve.”
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* PROFILE 1 CARD */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel rounded-2xl p-5 sm:p-6 border border-orange-500/20 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80 mb-4">
            <img
              src={p1.avatarUrl}
              alt={p1.username}
              className="w-12 h-12 rounded-xl ring-2 ring-orange-500/30 object-cover bg-zinc-900"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  PROFILE 1
                </span>
                <h3 className="font-heading font-bold text-white text-base truncate">{p1.name || p1.username}</h3>
              </div>
              <p className="text-zinc-500 text-xs font-mono">@{p1.username}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Strongest observed area */}
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>🔥 Strongest observed area</span>
              </div>
              {h1.strongest ? (
                <div className="text-zinc-200">
                  <strong className="text-white">{h1.strongest.name}</strong> ({h1.strongest.score}/100) —{' '}
                  <span className="text-zinc-400">
                    {h1.strongest.penalties === 0 ? 'No negative heuristics detected.' : `Only -${h1.strongest.penalties} penalty points.`}
                  </span>
                </div>
              ) : (
                <div className="text-zinc-400 italic">No evaluated categories with sufficient repository evidence.</div>
              )}
            </div>

            {/* Main improvement area */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>⚠️ Main improvement area</span>
              </div>
              {h1.improvement ? (
                <div className="text-zinc-200">
                  <strong className="text-white">{h1.improvement.name}</strong>{' '}
                  {h1.improvement.penalties > 0 && <span className="text-amber-400 font-mono">(-{h1.improvement.penalties} pts)</span>}
                  <p className="text-zinc-400 mt-1 line-clamp-2">{h1.improvement.reason}</p>
                </div>
              ) : (
                <div className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  All evaluated categories achieved clean baseline scores.
                </div>
              )}
            </div>

            {/* Categories with available evidence */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300">
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>📊 Categories with available evidence</span>
                </span>
                <span className="text-cyan-400 font-bold">{h1.evaluatedCount} of {h1.totalCategories}</span>
              </div>
              {h1.naCategories.length > 0 && (
                <p className="text-[11px] text-zinc-500 font-mono mt-1">
                  Excluded from scoring (N/A): {h1.naCategories.map(c => c.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* PROFILE 2 CARD */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-panel rounded-2xl p-5 sm:p-6 border border-violet-500/20 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80 mb-4">
            <img
              src={p2.avatarUrl}
              alt={p2.username}
              className="w-12 h-12 rounded-xl ring-2 ring-violet-500/30 object-cover bg-zinc-900"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  PROFILE 2
                </span>
                <h3 className="font-heading font-bold text-white text-base truncate">{p2.name || p2.username}</h3>
              </div>
              <p className="text-zinc-500 text-xs font-mono">@{p2.username}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Strongest observed area */}
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>🔥 Strongest observed area</span>
              </div>
              {h2.strongest ? (
                <div className="text-zinc-200">
                  <strong className="text-white">{h2.strongest.name}</strong> ({h2.strongest.score}/100) —{' '}
                  <span className="text-zinc-400">
                    {h2.strongest.penalties === 0 ? 'No negative heuristics detected.' : `Only -${h2.strongest.penalties} penalty points.`}
                  </span>
                </div>
              ) : (
                <div className="text-zinc-400 italic">No evaluated categories with sufficient repository evidence.</div>
              )}
            </div>

            {/* Main improvement area */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>⚠️ Main improvement area</span>
              </div>
              {h2.improvement ? (
                <div className="text-zinc-200">
                  <strong className="text-white">{h2.improvement.name}</strong>{' '}
                  {h2.improvement.penalties > 0 && <span className="text-amber-400 font-mono">(-{h2.improvement.penalties} pts)</span>}
                  <p className="text-zinc-400 mt-1 line-clamp-2">{h2.improvement.reason}</p>
                </div>
              ) : (
                <div className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  All evaluated categories achieved clean baseline scores.
                </div>
              )}
            </div>

            {/* Categories with available evidence */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300">
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>📊 Categories with available evidence</span>
                </span>
                <span className="text-cyan-400 font-bold">{h2.evaluatedCount} of {h2.totalCategories}</span>
              </div>
              {h2.naCategories.length > 0 && (
                <p className="text-[11px] text-zinc-500 font-mono mt-1">
                  Excluded from scoring (N/A): {h2.naCategories.map(c => c.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default FaceOffSummary;
