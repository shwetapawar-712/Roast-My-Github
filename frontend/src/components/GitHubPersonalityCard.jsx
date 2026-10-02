import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Flame, Search, BookOpen, Activity, Code2, Users, Shield, Zap } from 'lucide-react';

// ─── Category metadata (mirrors Dashboard.jsx palette) ───────────────────────
const CAT_META = {
  documentation: { label: 'Documentation', color: '#60a5fa', track: '#1e3a5f', Icon: BookOpen },
  activity:      { label: 'Activity',       color: '#34d399', track: '#0d3327', Icon: Activity },
  quality:       { label: 'Quality',        color: '#a78bfa', track: '#2d1f5e', Icon: Code2   },
  presentation:  { label: 'Presentation',   color: '#f472b6', track: '#3d1535', Icon: Users   },
  security:      { label: 'Security',       color: '#fbbf24', track: '#3d2e00', Icon: Shield  },
};

// ─── Personality definitions ──────────────────────────────────────────────────
const PERSONALITIES = {
  unknown: {
    emoji: '🔍',
    title: 'THE UNKNOWN BUILDER',
    tagline: 'Not enough evidence was available to determine your GitHub personality.',
    glowColor: 'rgba(113,113,122,0.35)',
    borderColor: 'rgba(113,113,122,0.22)',
    gradientFrom: 'rgba(39,39,42,0.92)',
    textAccent: '#a1a1aa',
  },
  chaotic_builder: {
    emoji: '🔥',
    title: 'THE CHAOTIC BUILDER',
    tagline: "You clearly know how to build things. Explaining them? That's another story.",
    glowColor: 'rgba(249,115,22,0.4)',
    borderColor: 'rgba(249,115,22,0.28)',
    gradientFrom: 'rgba(30,15,5,0.95)',
    textAccent: '#fb923c',
  },
  ghost_developer: {
    emoji: '👻',
    title: 'THE GHOST DEVELOPER',
    tagline: "Your repositories remember you. Your recent commits don't.",
    glowColor: 'rgba(139,92,246,0.4)',
    borderColor: 'rgba(139,92,246,0.28)',
    gradientFrom: 'rgba(15,10,30,0.95)',
    textAccent: '#a78bfa',
  },
  experimental_hacker: {
    emoji: '🧪',
    title: 'THE EXPERIMENTAL HACKER',
    tagline: 'Many experiments, few explanations. The lab is always open.',
    glowColor: 'rgba(52,211,153,0.35)',
    borderColor: 'rgba(52,211,153,0.22)',
    gradientFrom: 'rgba(5,20,15,0.95)',
    textAccent: '#34d399',
  },
  documentation_nerd: {
    emoji: '📚',
    title: 'THE DOCUMENTATION NERD',
    tagline: 'Your READMEs have READMEs. Other developers silently thank you.',
    glowColor: 'rgba(96,165,250,0.4)',
    borderColor: 'rgba(96,165,250,0.28)',
    gradientFrom: 'rgba(5,10,30,0.95)',
    textAccent: '#60a5fa',
  },
  polished_portfolio: {
    emoji: '✨',
    title: 'THE POLISHED PORTFOLIO',
    tagline: "Clean code. Clear docs. Active commits. A recruiter's dream.",
    glowColor: 'rgba(251,191,36,0.4)',
    borderColor: 'rgba(251,191,36,0.28)',
    gradientFrom: 'rgba(25,20,5,0.95)',
    textAccent: '#fbbf24',
  },
  silent_builder: {
    emoji: '🛠️',
    title: 'THE SILENT BUILDER',
    tagline: "The repositories are real. The about page is a mystery.",
    glowColor: 'rgba(244,114,182,0.35)',
    borderColor: 'rgba(244,114,182,0.22)',
    gradientFrom: 'rgba(25,5,20,0.95)',
    textAccent: '#f472b6',
  },
};

// ─── Score helpers ────────────────────────────────────────────────────────────
function getScore(categoryScores, key) {
  const cat = categoryScores.find(c => c.category === key);
  if (!cat || cat.score === null || cat.score === undefined || cat.status === 'not_applicable') return null;
  return cat.score;
}

// ─── Personality classification (fully deterministic) ─────────────────────────
function classifyPersonality(categoryScores, findings, analyzedCount) {
  if (!analyzedCount || analyzedCount === 0) return 'unknown';

  const doc  = getScore(categoryScores, 'documentation');
  const act  = getScore(categoryScores, 'activity');
  const qual = getScore(categoryScores, 'quality');
  const pres = getScore(categoryScores, 'presentation');

  const known = [doc, act, qual, pres].filter(v => v !== null);
  if (known.length < 2) return 'unknown';

  const negFindings    = findings.filter(f => f.score_impact < 0);
  const docNegCount    = negFindings.filter(f => f.category === 'documentation').length;
  const actNegCount    = negFindings.filter(f => f.category === 'activity').length;

  const avg = s => (s !== null ? s : 50);

  // Polished Portfolio: strong across the board, few issues
  if (
    doc  !== null && doc  >= 75 &&
    act  !== null && act  >= 70 &&
    pres !== null && pres >= 70 &&
    negFindings.length <= 3
  ) return 'polished_portfolio';

  // Documentation Nerd: doc is the clear leader
  if (
    doc !== null && doc >= 80 &&
    (act === null || doc >= avg(act) + 15) &&
    (qual === null || doc >= avg(qual))
  ) return 'documentation_nerd';

  // Ghost Developer: activity is the dominant weak signal
  if (act !== null && act < 45 && actNegCount >= 1) return 'ghost_developer';

  // Chaotic Builder: active or quality ok but documentation is weak
  if (
    (act !== null && act >= 60 || qual !== null && qual >= 60) &&
    (doc === null || doc < 60) &&
    docNegCount >= 1
  ) return 'chaotic_builder';

  // Silent Builder: solid quality/activity but poor presentation
  if (
    (qual !== null && qual >= 65 || act !== null && act >= 65) &&
    pres !== null && pres < 60
  ) return 'silent_builder';

  // Experimental Hacker: many repos, inconsistent doc/quality
  if (
    analyzedCount >= 3 &&
    (doc === null || doc < 70) &&
    (qual === null || qual < 70)
  ) return 'experimental_hacker';

  return 'unknown';
}

// ─── Witty lines (uses REAL finding data) ────────────────────────────────────
function generateWittyLines(personalityKey, categoryScores, findings, analyzedCount) {
  if (personalityKey === 'unknown') return [];
  const lines = [];
  const neg    = cat => findings.filter(f => f.category === cat && f.score_impact < 0);
  const doc    = getScore(categoryScores, 'documentation');
  const act    = getScore(categoryScores, 'activity');
  const qual   = getScore(categoryScores, 'quality');
  const pres   = getScore(categoryScores, 'presentation');

  switch (personalityKey) {
    case 'chaotic_builder': {
      const df = neg('documentation');
      if (df.length > 0) lines.push(`${df.length} documentation gap${df.length > 1 ? 's' : ''} detected across your repositories.`);
      if (act !== null && act >= 60) lines.push(`Activity is solid at ${act}/100 — the commits keep coming.`);
      if (df[0]?.repository) lines.push(`"${df[0].repository}" could use some README love.`);
      if (lines.length < 2) lines.push('The code showed up. The README sometimes did not.');
      break;
    }
    case 'ghost_developer': {
      const af = neg('activity');
      if (af.length > 0) lines.push(`${af.length} stale or inactive repositor${af.length > 1 ? 'ies' : 'y'} flagged.`);
      if (act !== null) lines.push(`Activity score: ${act}/100. The cobwebs are showing.`);
      if (af[0]?.repository) lines.push(`"${af[0].repository}" hasn't seen a commit in a while.`);
      if (lines.length < 2) lines.push('The commit graph tells a story of a developer who used to be here.');
      break;
    }
    case 'experimental_hacker': {
      const qf = neg('quality');
      const df = neg('documentation');
      lines.push(`${analyzedCount} repositories analyzed — you clearly love starting new things.`);
      if (qf.length > 0) lines.push(`Quality inconsistencies found in ${qf.length} area${qf.length > 1 ? 's' : ''}.`);
      if (df.length > 0) lines.push(`Documentation coverage could be stronger across your projects.`);
      break;
    }
    case 'documentation_nerd': {
      if (doc !== null) lines.push(`Documentation scored ${doc}/100 — leading all categories.`);
      if (neg('documentation').length === 0) lines.push('Zero documentation gaps detected. Impressive discipline.');
      if (qual !== null && qual >= 70) lines.push(`Repository quality is backing you up at ${qual}/100.`);
      break;
    }
    case 'polished_portfolio': {
      if (doc  !== null) lines.push(`Documentation: ${doc}/100. Clean and readable.`);
      if (act  !== null) lines.push(`Activity: ${act}/100. Consistent commit cadence.`);
      if (pres !== null) lines.push(`Profile presentation at ${pres}/100. Recruiter-ready.`);
      break;
    }
    case 'silent_builder': {
      const pf = neg('presentation');
      if (qual !== null && neg('quality').length === 0) lines.push(`Repository quality holds at ${qual}/100 — the work is solid.`);
      if (pf.length > 0) lines.push(`${pf.length} presentation gap${pf.length > 1 ? 's' : ''} keep your profile from shining.`);
      if (pres !== null) lines.push(`Profile presentation: ${pres}/100. The work is there, the spotlight isn't.`);
      if (lines.length < 2) lines.push("Great code, low visibility. The world doesn't know yet.");
      break;
    }
    default: break;
  }
  return lines.slice(0, 3);
}

// ─── Mini category bar ────────────────────────────────────────────────────────
function CategoryBar({ category, score }) {
  const meta = CAT_META[category] || { label: category, color: '#71717a', track: '#27272a', Icon: Zap };
  const isNA = score === null || score === undefined;
  const pct  = isNA ? 0 : Math.max(0, Math.min(100, score));

  return (
    <div className="flex items-center gap-3" role="group" aria-label={`${meta.label}: ${isNA ? 'N/A' : score + ' out of 100'}`}>
      <meta.Icon style={{ color: isNA ? '#52525b' : meta.color }} className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="text-xs text-zinc-400 w-28 shrink-0 select-none">{meta.label}</span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: meta.track }}
        role="progressbar"
        aria-valuenow={isNA ? 0 : score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ background: isNA ? '#3f3f46' : meta.color }}
          className="h-full rounded-full"
        />
      </div>
      <span className="text-xs font-mono w-10 text-right shrink-0" style={{ color: isNA ? '#52525b' : meta.color }}>
        {isNA ? 'N/A' : score}
      </span>
    </div>
  );
}

// ─── Finding row in the Why panel ────────────────────────────────────────────
function FindingRow({ finding }) {
  const meta = CAT_META[finding.category] || { label: finding.category, color: '#a1a1aa', Icon: Zap };
  return (
    <div className="rounded-xl p-3 border border-zinc-800/80 bg-zinc-900/60 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <meta.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
          {meta.label}
        </span>
        {finding.repository && (
          <code className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {finding.repository}
          </code>
        )}
        {finding.score_impact && (
          <span className="ml-auto text-[10px] font-mono text-red-400 shrink-0">
            Impact: {finding.score_impact}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">{finding.message}</p>
      {finding.evidence && (
        <p className="text-[10px] text-zinc-500 font-mono truncate">Evidence: {finding.evidence}</p>
      )}
      {(finding.suggested_fix || finding.fix) && (
        <p className="text-[10px] text-zinc-400 italic">Fix: {finding.suggested_fix || finding.fix}</p>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function GitHubPersonalityCard({ categoryScores = [], findings = [], analyzedCount = 0, roastSectionRef }) {
  const [whyOpen, setWhyOpen] = useState(false);

  const personalityKey = useMemo(
    () => classifyPersonality(categoryScores, findings, analyzedCount),
    [categoryScores, findings, analyzedCount]
  );
  const persona    = PERSONALITIES[personalityKey];
  const wittyLines = useMemo(
    () => generateWittyLines(personalityKey, categoryScores, findings, analyzedCount),
    [personalityKey, categoryScores, findings, analyzedCount]
  );

  // Relevant findings that drove this classification
  const relevantFindings = useMemo(() => {
    if (personalityKey === 'unknown') return [];
    const catMap = {
      chaotic_builder:     ['documentation'],
      ghost_developer:     ['activity'],
      experimental_hacker: ['documentation', 'quality'],
      documentation_nerd:  ['documentation'],
      polished_portfolio:  ['documentation', 'activity', 'presentation'],
      silent_builder:      ['presentation', 'quality'],
    };
    const cats = catMap[personalityKey] || [];
    return findings.filter(f => f.score_impact < 0 && cats.includes(f.category)).slice(0, 6);
  }, [personalityKey, findings]);

  const DISPLAY_CATS = ['documentation', 'activity', 'quality', 'presentation', 'security'];

  const handleRoastMe = () => {
    if (roastSectionRef?.current) {
      roastSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6"
    >
      {/* Section divider label */}
      <div className="flex items-center gap-3 mb-5" aria-hidden="true">
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #3f3f46)' }} />
        <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 select-none whitespace-nowrap">
          If Your GitHub Were a Person…
        </span>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #3f3f46)' }} />
      </div>

      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${persona.gradientFrom}, rgba(9,9,11,0.97))`,
          border: `1px solid ${persona.borderColor}`,
          boxShadow: `0 0 48px -8px ${persona.glowColor}, 0 24px 64px -24px rgba(0,0,0,0.65)`,
        }}
        aria-label={`GitHub Personality: ${persona.title}`}
      >
        {/* Scanline texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)',
            backgroundSize: '100% 3px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 p-6 sm:p-8">

          {/* Hero: emoji + title + tagline */}
          <div className="text-center mb-8">
            {/* Floating emoji avatar */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block mb-5 relative"
              aria-hidden="true"
            >
              {/* Soft halo */}
              <div
                className="absolute rounded-full blur-3xl"
                style={{
                  inset: '-30%',
                  background: persona.glowColor,
                  opacity: 0.55,
                }}
              />
              {/* Avatar circle */}
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-5xl sm:text-6xl select-none"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${persona.gradientFrom}, rgba(9,9,11,0.92))`,
                  border: `2px solid ${persona.borderColor}`,
                  boxShadow: `0 0 36px ${persona.glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                {persona.emoji}
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-heading font-black text-2xl sm:text-3xl tracking-tight mb-3"
              style={{ color: persona.textAccent }}
            >
              {persona.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-zinc-300 text-sm sm:text-base italic max-w-md mx-auto leading-relaxed"
            >
              "{persona.tagline}"
            </motion.p>
          </div>

          {/* Witty evidence lines */}
          {wittyLines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mb-7 max-w-lg mx-auto space-y-2"
              aria-label="Evidence highlights"
            >
              {wittyLines.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                  <span className="font-mono mt-0.5 shrink-0 text-sm" style={{ color: persona.textAccent }} aria-hidden="true">›</span>
                  <span>{line}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Category bars */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="rounded-xl p-4 mb-6 space-y-3"
            style={{
              background: 'rgba(9,9,11,0.55)',
              border: '1px solid rgba(255,255,255,0.055)',
            }}
            role="list"
            aria-label="Category scores"
          >
            {DISPLAY_CATS.map(key => {
              const cat   = categoryScores.find(c => c.category === key);
              const score = (cat && cat.score !== null && cat.score !== undefined && cat.status !== 'not_applicable')
                ? cat.score
                : null;
              return (
                <div key={key} role="listitem">
                  <CategoryBar category={key} score={score} />
                </div>
              );
            })}
          </motion.div>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* See Why */}
            <button
              onClick={() => setWhyOpen(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${persona.borderColor}`,
                color: persona.textAccent,
              }}
              aria-expanded={whyOpen}
              aria-controls="personality-why-panel"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              See Why
              {whyOpen
                ? <ChevronUp  className="w-3.5 h-3.5" aria-hidden="true" />
                : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            {/* Roast Me */}
            <button
              onClick={handleRoastMe}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                color: '#fff',
                boxShadow: '0 4px 22px -5px rgba(249,115,22,0.55)',
              }}
              aria-label="Scroll to AI Roast section"
            >
              <Flame className="w-4 h-4" aria-hidden="true" />
              Roast Me
            </button>
          </motion.div>

          {/* ── Why panel ── */}
          <AnimatePresence>
            {whyOpen && (
              <motion.div
                id="personality-why-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
                role="region"
                aria-label="Why you got this personality"
              >
                <div
                  className="mt-7 pt-6 border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <h3
                    className="font-heading font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"
                    style={{ color: persona.textAccent }}
                  >
                    <Search className="w-3.5 h-3.5" aria-hidden="true" />
                    Why You Got This Personality
                  </h3>

                  {personalityKey === 'unknown' ? (
                    <p className="text-xs text-zinc-500 italic">
                      Insufficient analyzable data. Scan a profile with at least one public original repository to see evidence here.
                    </p>
                  ) : relevantFindings.length > 0 ? (
                    <div className="space-y-2.5">
                      {relevantFindings.map((f, i) => (
                        <FindingRow key={i} finding={f} />
                      ))}
                    </div>
                  ) : (
                    /* Fallback: show category scores as supporting evidence */
                    <div className="space-y-2">
                      {DISPLAY_CATS
                        .map(key => categoryScores.find(c => c.category === key))
                        .filter(Boolean)
                        .map((cat, i) => {
                          const meta  = CAT_META[cat.category];
                          const isNA  = cat.score === null || cat.score === undefined || cat.status === 'not_applicable';
                          return (
                            <div key={i} className="flex items-center gap-3 text-xs text-zinc-400 py-1">
                              {meta && <meta.Icon className="w-3 h-3 shrink-0" style={{ color: meta.color }} aria-hidden="true" />}
                              <span>{cat.name || cat.category}</span>
                              <span className="ml-auto font-mono" style={{ color: isNA ? '#52525b' : meta?.color }}>
                                {isNA ? 'N/A' : `${cat.score}/100`}
                              </span>
                            </div>
                          );
                        })}
                      <p className="text-[10px] text-zinc-600 mt-2 italic">
                        No individual findings drove this classification — category score distribution was the determining factor.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
