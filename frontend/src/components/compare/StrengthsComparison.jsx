import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

function extractStrengthsAndOpportunities(audit) {
  if (!audit) return { strengths: [], opportunities: [] };

  const findings = audit.findings || [];
  const catScores = audit.categoryScores || [];

  // Verified strengths from healthy findings and high category scores (>= 80)
  const healthyFindings = findings.filter(f => f.severity === 'healthy');
  const highCategories = catScores.filter(c => c.score !== null && c.score >= 80);

  const strengths = [];
  highCategories.forEach(cat => {
    strengths.push({
      type: 'category',
      title: `${cat.name} (${cat.score}/100)`,
      desc: cat.penalties === 0 ? 'Zero heuristic penalties detected across verified repositories.' : `Strong baseline with minimal penalties (-${cat.penalties} pts).`
    });
  });

  healthyFindings.slice(0, 4).forEach(hf => {
    strengths.push({
      type: 'finding',
      title: hf.message,
      desc: hf.evidence || 'Verified by code inspection.'
    });
  });

  // Areas for improvement from findings with negative score impact
  const negativeFindings = findings
    .filter(f => f.score_impact < 0)
    .sort((a, b) => a.score_impact - b.score_impact); // most severe first

  const opportunities = negativeFindings.slice(0, 5).map(nf => ({
    category: nf.category,
    message: nf.message,
    impact: nf.score_impact,
    fix: nf.suggested_fix || nf.fix,
    evidence: nf.evidence,
    repo: nf.repository
  }));

  return { strengths: strengths.slice(0, 5), opportunities };
}

export function StrengthsComparison({ audit1, audit2 }) {
  const p1 = audit1?.profile || {};
  const p2 = audit2?.profile || {};

  const d1 = extractStrengthsAndOpportunities(audit1);
  const d2 = extractStrengthsAndOpportunities(audit2);

  return (
    <section className="mb-10">
      <div className="mb-6">
        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
          <span>🎯 Strengths & Improvement Opportunities</span>
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
          Objective evaluation of observed engineering practices. No subjective winner declarations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PROFILE 1 COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-500/20">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <h4 className="font-heading font-bold text-white text-base">
              {p1.name || p1.username}
            </h4>
            <span className="text-xs font-mono text-zinc-500">(@{p1.username})</span>
          </div>

          {/* Verified Strengths */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 text-emerald-400 font-heading font-semibold text-xs sm:text-sm mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Technical Strengths</span>
            </div>
            {d1.strengths.length > 0 ? (
              <ul className="space-y-2.5 text-xs">
                {d1.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                    <div>
                      <span className="text-white font-medium">{s.title}</span>
                      {s.desc && <p className="text-zinc-400 text-[11px] mt-0.5">{s.desc}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-400 text-xs italic">
                No high-scoring categories or verified healthy findings detected.
              </p>
            )}
          </div>

          {/* Areas with detected improvement opportunities */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-400 font-heading font-semibold text-xs sm:text-sm mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Areas with Detected Improvement Opportunities</span>
            </div>
            {d1.opportunities.length > 0 ? (
              <ul className="space-y-2.5 text-xs">
                {d1.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-zinc-200 font-medium">{opp.message}</span>
                        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                          {opp.impact} pts
                        </span>
                      </div>
                      {opp.fix && (
                        <p className="text-emerald-400/90 text-[11px] mt-0.5">
                          <strong className="text-emerald-500">Fix: </strong>{opp.fix}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-400 text-xs">
                No critical remediation areas detected across evaluated categories.
              </p>
            )}
          </div>
        </div>

        {/* PROFILE 2 COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-violet-500/20">
            <span className="w-3 h-3 rounded-full bg-violet-500" />
            <h4 className="font-heading font-bold text-white text-base">
              {p2.name || p2.username}
            </h4>
            <span className="text-xs font-mono text-zinc-500">(@{p2.username})</span>
          </div>

          {/* Verified Strengths */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 text-emerald-400 font-heading font-semibold text-xs sm:text-sm mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Technical Strengths</span>
            </div>
            {d2.strengths.length > 0 ? (
              <ul className="space-y-2.5 text-xs">
                {d2.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                    <div>
                      <span className="text-white font-medium">{s.title}</span>
                      {s.desc && <p className="text-zinc-400 text-[11px] mt-0.5">{s.desc}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-400 text-xs italic">
                No high-scoring categories or verified healthy findings detected.
              </p>
            )}
          </div>

          {/* Areas with detected improvement opportunities */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 text-amber-400 font-heading font-semibold text-xs sm:text-sm mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Areas with Detected Improvement Opportunities</span>
            </div>
            {d2.opportunities.length > 0 ? (
              <ul className="space-y-2.5 text-xs">
                {d2.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-zinc-200 font-medium">{opp.message}</span>
                        <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                          {opp.impact} pts
                        </span>
                      </div>
                      {opp.fix && (
                        <p className="text-emerald-400/90 text-[11px] mt-0.5">
                          <strong className="text-emerald-500">Fix: </strong>{opp.fix}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-400 text-xs">
                No critical remediation areas detected across evaluated categories.
              </p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

export default StrengthsComparison;
