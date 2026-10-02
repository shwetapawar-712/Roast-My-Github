import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldAlert, BookOpen, Activity, Code2,
  Users, Shield, Filter, AlertTriangle, CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'activity', label: 'Activity' },
  { id: 'quality', label: 'Quality' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'security', label: 'Security' }
];

const SEVERITIES = [
  { id: 'all', label: 'All Severities' },
  { id: 'critical', label: '🔴 Critical' },
  { id: 'warning', label: '🟠 Warning' },
  { id: 'improvement', label: '🟡 Improvement' },
  { id: 'healthy', label: '✅ Healthy' }
];

function categoryIcon(cat) {
  const map = {
    documentation: BookOpen,
    activity: Activity,
    quality: Code2,
    presentation: Users,
    security: Shield
  };
  return map[cat] || Search;
}

function categoryColor(cat) {
  const map = {
    documentation: 'text-blue-400',
    activity: 'text-emerald-400',
    quality: 'text-violet-400',
    presentation: 'text-pink-400',
    security: 'text-amber-400'
  };
  return map[cat] || 'text-zinc-400';
}

function FindingsList({ findings = [], profileTitle, accentColor }) {
  if (findings.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
        No findings match current filter criteria.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {findings.map((f, idx) => {
        const Icon = categoryIcon(f.category);
        const isNegative = f.score_impact < 0;

        return (
          <motion.div
            key={f.id || idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.4) }}
            className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all text-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                  <Icon className={`w-3.5 h-3.5 ${categoryColor(f.category)}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-white text-xs sm:text-sm">
                      {f.message}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {f.severity}
                    </span>
                    {f.repository && (
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800 truncate max-w-[160px]">
                        {f.repository}
                      </span>
                    )}
                  </div>

                  {/* Evidence */}
                  {f.evidence && (
                    <div className="mt-2 p-2 rounded-lg bg-zinc-950/70 border border-zinc-900 font-mono text-[11px] text-zinc-400">
                      <strong className="text-zinc-500 font-medium">Evidence: </strong>
                      {f.evidence}
                    </div>
                  )}

                  {/* Suggested Fix */}
                  {(f.suggested_fix || f.fix) && f.severity !== 'healthy' && (
                    <div className="mt-2 text-[11px] text-emerald-400/90 leading-relaxed">
                      <strong className="text-emerald-500 font-medium">Suggested Fix: </strong>
                      {f.suggested_fix || f.fix}
                    </div>
                  )}
                </div>
              </div>

              {isNegative && (
                <span className="text-xs font-mono font-bold text-red-400 shrink-0 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                  {f.score_impact} pts
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function FindingsComparison({ audit1, audit2 }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedSev, setSelectedSev] = useState('all');

  const p1 = audit1?.profile || {};
  const p2 = audit2?.profile || {};

  const f1 = audit1?.findings || [];
  const f2 = audit2?.findings || [];

  const filterFn = (f) => {
    if (selectedCat !== 'all' && f.category !== selectedCat) return false;
    if (selectedSev !== 'all' && f.severity !== selectedSev) return false;
    return true;
  };

  const filtered1 = f1.filter(filterFn);
  const filtered2 = f2.filter(filterFn);

  return (
    <section className="mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            <span>🔎 WHAT THE AUDIT FOUND</span>
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Compare verified heuristics, file checks, and code evidence side-by-side.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Severity filter */}
          <select
            value={selectedSev}
            onChange={(e) => setSelectedSev(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-500"
          >
            {SEVERITIES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Two columns: Profile 1 Findings vs Profile 2 Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile 1 Findings */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-orange-500/20 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <h4 className="font-heading font-bold text-sm text-white truncate max-w-[200px]">
                PROFILE 1 FINDINGS ({filtered1.length})
              </h4>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">@{p1.username}</span>
          </div>
          <FindingsList
            findings={filtered1}
            profileTitle={p1.username}
            accentColor="orange"
          />
        </div>

        {/* Profile 2 Findings */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-violet-500/20 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <h4 className="font-heading font-bold text-sm text-white truncate max-w-[200px]">
                PROFILE 2 FINDINGS ({filtered2.length})
              </h4>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">@{p2.username}</span>
          </div>
          <FindingsList
            findings={filtered2}
            profileTitle={p2.username}
            accentColor="violet"
          />
        </div>

      </div>
    </section>
  );
}

export default FindingsComparison;
