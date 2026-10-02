import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2, GitBranch, Package, BookOpen, Activity,
  Code2, Shield, BarChart3, CheckCircle2, Loader2
} from 'lucide-react';

export const COMPARE_STAGES = [
  { id: 'val1', icon: Link2, label: 'Validating Profile 1', detail: 'Parsing primary profile URL and accessibility' },
  { id: 'val2', icon: Link2, label: 'Validating Profile 2', detail: 'Parsing comparison profile URL and accessibility' },
  { id: 'fetch', icon: GitBranch, label: 'Fetching GitHub data', detail: 'Querying public API for repositories, activity & metadata' },
  { id: 'analyze', icon: Package, label: 'Analyzing repositories', detail: 'Filtering forks and isolating original codebases' },
  { id: 'docs', icon: BookOpen, label: 'Checking documentation', detail: 'Evaluating README presence, setup heuristics & demo links' },
  { id: 'act', icon: Activity, label: 'Checking activity', detail: 'Evaluating commit timestamps, push recency & dormancy' },
  { id: 'qual', icon: Code2, label: 'Checking repository quality', detail: 'Auditing repo descriptions, license files & naming conventions' },
  { id: 'sec', icon: Shield, label: 'Checking security hygiene', detail: 'Checking for credential leaks, .env exposures & hygiene patterns' },
  { id: 'prep', icon: BarChart3, label: 'Preparing comparison', detail: 'Aligning category scores, findings & snapshot metrics' }
];

export function ComparisonLoading({ profile1Name = 'Profile 1', profile2Name = 'Profile 2' }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    // Stage intervals based on typical GitHub API response latency
    const intervals = [350, 350, 600, 500, 500, 450, 450, 400, 400];
    let timer;

    const advance = (idx) => {
      if (idx >= COMPARE_STAGES.length - 1) return;
      timer = setTimeout(() => {
        setCurrentStageIdx(idx + 1);
        advance(idx + 1);
      }, intervals[idx]);
    };

    advance(0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl border border-zinc-800 p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">
                Executing Parallel Audit
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {profile1Name} <span className="text-orange-500 font-bold">VS</span> {profile2Name}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
            Deterministic Scan
          </span>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-3">
          {COMPARE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const isPending = idx > currentStageIdx;

            return (
              <div
                key={stage.id}
                className={`
                  flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs
                  ${isCurrent ? 'bg-orange-500/10 border-orange-500/30 text-white' : ''}
                  ${isCompleted ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-300' : ''}
                  ${isPending ? 'bg-transparent border-transparent text-zinc-600 opacity-60' : ''}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`
                    w-6 h-6 rounded-lg flex items-center justify-center shrink-0
                    ${isCompleted ? 'bg-emerald-500/10 text-emerald-400' : isCurrent ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-900 text-zinc-600'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className={`font-medium ${isCurrent ? 'text-orange-300 font-semibold' : ''}`}>
                      {stage.label}
                    </span>
                    <span className="hidden sm:inline text-zinc-500 text-[11px] ml-2">
                      · {stage.detail}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 font-mono text-[11px]">
                  {isCompleted && <span className="text-emerald-400 font-semibold">Done</span>}
                  {isCurrent && <span className="text-orange-400 animate-pulse">Running...</span>}
                  {isPending && <span className="text-zinc-600">Pending</span>}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-zinc-500 mt-5 font-mono">
          Strict deterministic audit rules applied independently to both targets. Zero synthetic data.
        </p>
      </motion.div>
    </div>
  );
}

export default ComparisonLoading;
