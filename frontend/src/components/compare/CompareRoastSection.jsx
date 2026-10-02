import React from 'react';
import { motion } from 'framer-motion';
import { Flame, AlertCircle, Quote } from 'lucide-react';

export function CompareRoastSection({ audit1, audit2 }) {
  const p1 = audit1?.profile || {};
  const p2 = audit2?.profile || {};

  const r1 = audit1?.roast || {};
  const r2 = audit2?.roast || {};

  const roastText1 = r1.roast || r1.summary || 'Audit roast summary generated from deterministic findings.';
  const roastText2 = r2.roast || r2.summary || 'Audit roast summary generated from deterministic findings.';

  return (
    <section className="mb-10">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold mb-2">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>AI NARRATION BENCHMARK</span>
        </div>
        <h3 className="font-heading font-black text-2xl sm:text-3xl text-white">
          🔥 HEAD-TO-HEAD ROASTS
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
          AI communicates and interprets the verified deterministic audit findings. Zero invented facts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PROFILE 1 ROAST */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-orange-500/20 bg-orange-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-orange-500/15 mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <h4 className="font-heading font-bold text-sm text-orange-400 uppercase tracking-wide">
                  🔥 PROFILE 1 ROAST
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">@{p1.username}</span>
            </div>

            {r1.aiUnavailable && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Deterministic fallback roast grounded in verified heuristics.</span>
              </div>
            )}

            <div className="relative p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 text-zinc-200 text-xs sm:text-sm leading-relaxed italic">
              <Quote className="w-4 h-4 text-orange-500/40 absolute top-2 left-2 -translate-x-1 -translate-y-1" />
              <p className="relative z-10 pl-2">
                "{roastText1}"
              </p>
            </div>
          </div>

          {r1.summary && (
            <div className="mt-3 p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <strong className="text-orange-400 font-semibold">Takeaway: </strong>{r1.summary}
            </div>
          )}
        </div>

        {/* PROFILE 2 ROAST */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-violet-500/20 bg-violet-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-violet-500/15 mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-violet-400" />
                <h4 className="font-heading font-bold text-sm text-violet-400 uppercase tracking-wide">
                  🔥 PROFILE 2 ROAST
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">@{p2.username}</span>
            </div>

            {r2.aiUnavailable && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Deterministic fallback roast grounded in verified heuristics.</span>
              </div>
            )}

            <div className="relative p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 text-zinc-200 text-xs sm:text-sm leading-relaxed italic">
              <Quote className="w-4 h-4 text-violet-500/40 absolute top-2 left-2 -translate-x-1 -translate-y-1" />
              <p className="relative z-10 pl-2">
                "{roastText2}"
              </p>
            </div>
          </div>

          {r2.summary && (
            <div className="mt-3 p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <strong className="text-violet-400 font-semibold">Takeaway: </strong>{r2.summary}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default CompareRoastSection;
