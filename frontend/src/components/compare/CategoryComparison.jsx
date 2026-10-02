import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Activity, Code2, Users, Shield,
  Info, AlertCircle, HelpCircle
} from 'lucide-react';

const CATEGORY_META = {
  documentation: {
    icon: BookOpen,
    name: 'Documentation',
    color: 'text-blue-400',
    bar1: 'bg-gradient-to-r from-orange-500 to-amber-500',
    bar2: 'bg-gradient-to-r from-violet-500 to-indigo-500',
    weight: '25%'
  },
  activity: {
    icon: Activity,
    name: 'Activity & Freshness',
    color: 'text-emerald-400',
    bar1: 'bg-gradient-to-r from-orange-500 to-amber-500',
    bar2: 'bg-gradient-to-r from-violet-500 to-indigo-500',
    weight: '20%'
  },
  quality: {
    icon: Code2,
    name: 'Repository Quality',
    color: 'text-violet-400',
    bar1: 'bg-gradient-to-r from-orange-500 to-amber-500',
    bar2: 'bg-gradient-to-r from-violet-500 to-indigo-500',
    weight: '20%'
  },
  presentation: {
    icon: Users,
    name: 'Profile Presentation',
    color: 'text-pink-400',
    bar1: 'bg-gradient-to-r from-orange-500 to-amber-500',
    bar2: 'bg-gradient-to-r from-violet-500 to-indigo-500',
    weight: '15%'
  },
  security: {
    icon: Shield,
    name: 'Security Hygiene',
    color: 'text-amber-400',
    bar1: 'bg-gradient-to-r from-orange-500 to-amber-500',
    bar2: 'bg-gradient-to-r from-violet-500 to-indigo-500',
    weight: '20%'
  }
};

const CATEGORIES_ORDER = ['documentation', 'activity', 'quality', 'presentation', 'security'];

export function CategoryComparison({
  categoryScores1 = [],
  categoryScores2 = [],
  profile1Name = 'Profile 1',
  profile2Name = 'Profile 2'
}) {
  const getCatData = (catScores, key) => {
    return catScores.find(c => c.category === key) || null;
  };

  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <span>📊 Category-by-Category Benchmark</span>
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Deterministic scores derived from verifiable heuristics. Measurable differences in audit data.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            {profile1Name}
          </span>
          <span className="flex items-center gap-1.5 text-violet-400">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            {profile2Name}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {CATEGORIES_ORDER.map((catKey, idx) => {
          const meta = CATEGORY_META[catKey];
          const Icon = meta.icon;

          const c1 = getCatData(categoryScores1, catKey);
          const c2 = getCatData(categoryScores2, catKey);

          const isNA1 = !c1 || c1.score === null || c1.score === undefined || c1.status === 'not_applicable';
          const isNA2 = !c2 || c2.score === null || c2.score === undefined || c2.status === 'not_applicable';

          const score1 = isNA1 ? null : c1.score;
          const score2 = isNA2 ? null : c2.score;

          let diffText = '';
          let diffColor = 'text-zinc-400';

          if (isNA1 || isNA2) {
            diffText = 'N/A (insufficient data)';
            diffColor = 'text-zinc-500';
          } else {
            const diff = Math.abs(score1 - score2);
            if (diff === 0) {
              diffText = 'Equal score (0 pt delta)';
              diffColor = 'text-zinc-400';
            } else {
              diffText = `${diff} point difference`;
              diffColor = 'text-zinc-300';
            }
          }

          return (
            <motion.div
              key={catKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="glass-panel rounded-2xl p-4 sm:p-5 border border-zinc-800/80 hover:border-zinc-700/80 transition-all"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-white text-sm sm:text-base">
                        {meta.name}
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-500 font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {meta.weight} weight
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300">
                    Delta: <strong className={diffColor}>{diffText}</strong>
                  </span>
                </div>
              </div>

              {/* Side-by-Side Visual Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* PROFILE 1 BAR */}
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-orange-400 font-semibold truncate max-w-[180px]">
                      {profile1Name}
                    </span>
                    <span className="font-bold text-sm">
                      {isNA1 ? (
                        <span className="text-zinc-500">N/A</span>
                      ) : (
                        <span className="text-white">{score1}<span className="text-zinc-500 text-xs">/100</span></span>
                      )}
                    </span>
                  </div>

                  {isNA1 ? (
                    <div className="flex items-center gap-1.5 p-2 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>🔍 Insufficient Evidence: Not enough repository data was available to evaluate this category.</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800/80">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(4, score1)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${meta.bar1}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1.5">
                        <span>{c1.penalties > 0 ? `-${c1.penalties} penalty points` : 'No penalties detected'}</span>
                        <span className={c1.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                          {c1.status === 'healthy' ? 'Clean' : 'Needs attention'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* PROFILE 2 BAR */}
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-violet-400 font-semibold truncate max-w-[180px]">
                      {profile2Name}
                    </span>
                    <span className="font-bold text-sm">
                      {isNA2 ? (
                        <span className="text-zinc-500">N/A</span>
                      ) : (
                        <span className="text-white">{score2}<span className="text-zinc-500 text-xs">/100</span></span>
                      )}
                    </span>
                  </div>

                  {isNA2 ? (
                    <div className="flex items-center gap-1.5 p-2 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>🔍 Insufficient Evidence: Not enough repository data was available to evaluate this category.</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800/80">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(4, score2)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${meta.bar2}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1.5">
                        <span>{c2.penalties > 0 ? `-${c2.penalties} penalty points` : 'No penalties detected'}</span>
                        <span className={c2.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                          {c2.status === 'healthy' ? 'Clean' : 'Needs attention'}
                        </span>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryComparison;
