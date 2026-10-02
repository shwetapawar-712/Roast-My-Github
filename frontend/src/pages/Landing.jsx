import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  Flame, ArrowRight, BookOpen, Activity, Shield,
  Star, GitFork, Code2, Zap, BarChart3, Sparkles, AlertTriangle,
  ChevronRight, Terminal, Eye, Users, ShieldCheck, CheckCircle2, Lock,
  Loader2, CheckCircle, ShieldAlert, Cpu, Swords
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon.jsx';
import { Button } from '../components/ui/Button.jsx';
import { analyzeTarget } from '../api/client.js';
import { useScan } from '../context/ScanContext.jsx';

const WHAT_WE_CHECK = [
  {
    icon: BookOpen,
    title: 'Documentation',
    weight: '25%',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    checks: ['README existence', 'Setup instructions heuristic', 'Live demo & preview detection']
  },
  {
    icon: Activity,
    title: 'Activity & Freshness',
    weight: '20%',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    checks: ['Commit cadence', 'Dormant branches', 'Stale repository detection']
  },
  {
    icon: Code2,
    title: 'Repository Quality',
    weight: '20%',
    color: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
    checks: ['Descriptions set', 'Generic name detection', 'Open-source license presence']
  },
  {
    icon: Users,
    title: 'Profile Presentation',
    weight: '15%',
    color: 'text-pink-400',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/5',
    checks: ['Bio completeness', 'Profile README banner', 'Portfolio / website link']
  },
  {
    icon: Shield,
    title: 'Security Hygiene',
    weight: '20%',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    checks: ['Sensitive .env / key patterns', 'Config exposure without .gitignore', 'Vulnerability audit transparency']
  }
];

const PIPELINE_STEPS = [
  {
    num: '01',
    title: 'Live GitHub API',
    desc: 'Fetches real public metadata, repository files, and commit timestamps.',
    color: 'bg-orange-500/10 text-orange-400'
  },
  {
    num: '02',
    title: 'Rule Engine',
    desc: 'Evaluates 5 deterministic categories with transparent heuristics.',
    color: 'bg-blue-500/10 text-blue-400'
  },
  {
    num: '03',
    title: 'Mathematical Score',
    desc: 'Pure weighted penalty formula (0–100). Zero AI score guessing.',
    color: 'bg-emerald-500/10 text-emerald-400'
  },
  {
    num: '04',
    title: 'AI Narration',
    desc: 'Gemini/Groq writes grounded roast and actionable recommendations.',
    color: 'bg-cyan-500/10 text-cyan-400'
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { setScanResult, intensity } = useScan();
  const [urlInput, setUrlInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null);

  const validate = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return 'Please paste a public GitHub URL (e.g. https://github.com/torvalds).';
    
    // Check foreign domain
    if (trimmed.includes('://') && !trimmed.toLowerCase().includes('github.com')) {
      return 'Only public GitHub URLs are supported (e.g. https://github.com/username).';
    }
    return '';
  };

  const executeScan = async (targetUrl) => {
    const trimmed = (targetUrl || '').trim();
    const err = validate(trimmed);
    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError('');
    setIsScanning(true);

    try {
      const data = await analyzeTarget(trimmed, intensity || 'brutal');
      setScanResult(data);
      const destKey = data.target?.cleanIdentifier || data.profile?.username || trimmed;
      navigate(`/dashboard/${encodeURIComponent(destKey)}`);
    } catch (apiErr) {
      console.error('Scan error:', apiErr);
      setValidationError(apiErr.message || 'Failed to analyze GitHub target. Please check the URL.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isScanning) return;
    executeScan(urlInput);
  };

  const handleChange = (e) => {
    setUrlInput(e.target.value);
    if (validationError) setValidationError('');
  };

  const handleQuickSample = (sampleUrl) => {
    if (isScanning) return;
    setUrlInput(sampleUrl);
    setValidationError('');
    executeScan(sampleUrl);
  };

  // Stable ambient particle effect (does not re-generate coords on input re-renders)
  const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.floor(Math.random() * 92) + 4,
    y: Math.floor(Math.random() * 88) + 6,
    size: Math.random() * 2.5 + 1.5,
    duration: Math.random() * 10 + 14,
    delay: Math.random() * 5,
    color: i % 3 === 0 ? 'bg-orange-500/20' : i % 3 === 1 ? 'bg-amber-400/15' : 'bg-red-500/15'
  })), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-zinc-950 relative overflow-hidden text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200">

        {/* Ambient Background with subtle glowing orbs and drifting particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-orange-600/10 via-red-600/5 to-transparent rounded-full blur-3xl animate-ambient-drift" />
          <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl animate-ambient-drift-rev" />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-orange-600/5 rounded-full blur-3xl animate-ambient-drift" />
          {particles.map(p => (
            <motion.div
              key={p.id}
              className={`absolute rounded-full ${p.color}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              animate={{ y: [-12, 12, -12], x: [-5, 5, -5], opacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Nav */}
          <nav className="flex items-center justify-between py-6">
            <div className="flex items-center gap-2 title-pulse-glow group cursor-default">
              <Flame className="w-6 h-6 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              <span className="font-heading font-bold text-lg text-white tracking-tight">ROAST MY GITHUB</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                GitHub Health & Security Audit
              </span>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="pt-10 pb-16 text-center">
            {/* 1. Hero Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-sm font-medium shadow-sm hover:border-orange-500/35 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              “Your GitHub. Audited. Secured. Roasted.”
            </motion.div>

            {/* 2. Hero Heading (appears slightly before supporting text and input) */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white mb-5"
            >
              GitHub profile & repo audit,{' '}
              <span className="fire-text drop-shadow-[0_2px_12px_rgba(249,115,22,0.3)]">backed by real code.</span>
            </motion.h1>

            {/* 3. Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed mb-10"
            >
              Paste any public GitHub profile or repository URL. Our{' '}
              <span className="text-zinc-200 font-semibold">deterministic rule engine</span>{' '}
              evaluates documentation heuristics, commit activity cadence, code quality, and security hygiene.
              AI only interprets the verified findings.
            </motion.p>

            {/* 4. Input Form & Quick Samples */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Input Form */}
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-4">
                <div className={`
                  relative flex items-center rounded-2xl transition-all duration-300 ease-out
                  glass-panel border p-1.5
                  ${validationError ? 'border-red-500/50 shadow-[0_0_25px_-5px_rgba(239,68,68,0.3)] ring-1 ring-red-500/30' : ''}
                  ${inputFocused && !validationError ? 'border-orange-500/60 shadow-[0_0_35px_-4px_rgba(249,115,22,0.35)] ring-1 ring-orange-500/40' : ''}
                  ${!inputFocused && !validationError ? 'border-zinc-700/50 hover:border-zinc-600/70' : ''}
                `}>
                  <div className="flex items-center pl-4 shrink-0">
                    <Github className="w-5 h-5 text-zinc-400" />
                  </div>
                  <input
                    ref={inputRef}
                    id="github-username-input"
                    type="text"
                    value={urlInput}
                    onChange={handleChange}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    disabled={isScanning}
                    placeholder="https://github.com/username or github @username"
                    autoComplete="off"
                    spellCheck="false"
                    className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm sm:text-base font-mono py-3.5 px-3 outline-none min-w-0"
                    aria-label="Paste a public GitHub URL"
                    aria-describedby={validationError ? 'url-error' : undefined}
                  />
                  <div className="shrink-0">
                    <Button
                      type="submit"
                      size="md"
                      icon={isScanning ? undefined : Flame}
                      id="roast-submit-btn"
                      loading={isScanning}
                      disabled={isScanning || !urlInput.trim()}
                      className="whitespace-nowrap px-5 py-3 font-semibold cursor-pointer active:scale-[0.97] hover:brightness-105 transition-all duration-150"
                    >
                      {isScanning ? 'Scanning GitHub...' : '🔥 Scan GitHub'}
                    </Button>
                  </div>
                </div>

                {/* Validation & Error Message */}
                <AnimatePresence>
                  {validationError && (
                    <motion.div
                      id="url-error"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs mt-3 text-left flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{validationError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
              {/* ⚔️ Compare Profiles — secondary CTA below the scan form */}
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  id="compare-profiles-secondary-btn"
                  onClick={() => navigate('/compare')}
                  disabled={isScanning}
                  className="group flex flex-col sm:flex-row items-center gap-3 px-6 py-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-sm hover:shadow-orange-500/10 hover:shadow-lg"
                  aria-label="Compare two GitHub profiles side-by-side"
                >
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-orange-500 group-hover:text-orange-400 transition-colors" />
                    <span className="font-heading font-bold text-sm text-white group-hover:text-orange-100 transition-colors">
                      ⚔️ Compare Profiles
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors sm:border-l sm:border-zinc-700 sm:pl-3">
                    Compare two GitHub profiles side-by-side
                  </span>
                </button>
              </div>
            </motion.div>
            <p className="text-zinc-500 text-xs mt-3 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3 text-zinc-400" />
                  Public GitHub profiles and repositories only. No GitHub login required.
                </p>
          </section>

          {/* Real Pipeline Explanation Banner with Scroll Reveal */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="pb-16"
          >
            <div className="glass-panel rounded-2xl border border-zinc-800 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-orange-400 uppercase tracking-wider mb-2">
                  <Cpu className="w-3.5 h-3.5" />
                  Architecture & Data Flow
                </div>
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  How Roast My GitHub Audits Your Code
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                {PIPELINE_STEPS.map((step, idx) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:-translate-y-1 hover:border-zinc-700/90 hover:bg-zinc-900/90 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-200 cursor-default"
                  >
                    <div className={`w-7 h-7 rounded-lg font-mono font-bold flex items-center justify-center mx-auto mb-2 text-xs ${step.color}`}>
                      {step.num}
                    </div>
                    <div className="text-xs font-semibold text-white mb-1">{step.title}</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* 5 Weighted Categories Section with Scroll Reveal & Hover Lifts */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="pb-24"
          >
            <div className="text-center mb-10">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-2">
                What We Audit — Deterministic Rule Engine
              </h2>
              <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
                Every score and finding is calculated from verified GitHub data using transparent rules. AI only interprets the verified findings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WHAT_WE_CHECK.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className={`glass-panel rounded-xl p-5 border ${item.border} ${item.bg} hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50 transition-all duration-200 cursor-default`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <h3 className="font-heading font-semibold text-white text-sm">{item.title}</h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-500 font-semibold">{item.weight}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {item.checks.map((check, ci) => (
                        <li key={ci} className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
                          {check}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}

              {/* Recruiter View Card */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel rounded-xl p-5 border border-cyan-500/20 bg-cyan-500/5 flex flex-col justify-between hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-black/50 transition-all duration-200 cursor-default"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-heading font-semibold text-white text-sm">Recruiter Portfolio View</h3>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">Clean Snapshot</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Toggle to a clean, professional recruiter summary highlighting active projects, documentation rigor, activity cadence, strengths, and areas to polish.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Derived from the same verified audit
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Footer */}
          <footer className="py-8 border-t border-zinc-800/60 text-center text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-zinc-400">ROAST MY GITHUB</span>
              <span>·</span>
              <span>Deterministic Rule Engine · AI Narration Layer</span>
            </div>
            <div>Public GitHub profiles and repositories only. No credentials stored.</div>
          </footer>

        </div>
      </div>
    </MotionConfig>
  );
}

