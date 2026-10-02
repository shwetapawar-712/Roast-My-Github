import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Activity, Code2, Shield, ExternalLink,
  CheckCircle2, XCircle, AlertTriangle, Clock, Star, GitFork,
  Eye, Info, Flame, Calendar, Package
} from 'lucide-react';
import { useScan } from '../context/ScanContext.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';

function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / (30 * 24 * 3600 * 1000));
  if (m <= 0) return 'This month';
  if (m < 12) return `${m}mo ago`;
  return `${Math.round(m / 12)}yr ago`;
}

function BoolIndicator({ value, trueLabel = 'Present', falseLabel = 'Missing' }) {
  return value ? (
    <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
      <CheckCircle2 className="w-4 h-4 shrink-0" /> {trueLabel}
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
      <XCircle className="w-4 h-4 shrink-0" /> {falseLabel}
    </span>
  );
}

function Panel({ title, icon: Icon, children, className = '' }) {
  return (
    <Card className={`${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-orange-400" />
        </div>
        <h3 className="font-heading font-semibold text-white">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

export default function RepositoryDetail() {
  const { username, repo } = useParams();
  const navigate = useNavigate();
  const { scanResult } = useScan();

  // Find the repository analysis in context
  const analysis = scanResult?.repositoryAnalyses?.find(
    ra => ra.repository.name.toLowerCase() === decodeURIComponent(repo).toLowerCase()
  );
  const repository = analysis?.repository;

  // If no context, redirect to dashboard
  useEffect(() => {
    if (!scanResult) {
      navigate(`/scanning/${encodeURIComponent(username)}`, { replace: true });
    }
  }, [scanResult]);

  if (!scanResult || !analysis) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        <div className="text-center space-y-4">
          <p>Repository analysis not found in current scan.</p>
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(`/dashboard/${username}`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const score = analysis.score;
  const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  const activityStatus = analysis.activity?.status;
  const statusStyles = {
    active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    inactive: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    stale: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Topbar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/dashboard/${encodeURIComponent(username)}`)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400 text-sm font-mono">{repository.name}</span>
        </div>

        {/* Repo Meta Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="border border-orange-500/15">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-heading font-bold text-2xl text-white">{repository.name}</h1>
                  <a href={repository.htmlUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-zinc-400 hover:text-orange-400 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
                  </a>
                </div>
                {repository.description && (
                  <p className="text-zinc-300 text-sm mt-2 max-w-2xl">{repository.description}</p>
                )}
                <div className="flex items-center flex-wrap gap-4 mt-3 text-xs text-zinc-500">
                  {repository.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />{repository.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" />{repository.stars}</span>
                  <span className="flex items-center gap-1.5"><GitFork className="w-3.5 h-3.5" />{repository.forks}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Last push {timeAgo(repository.pushedAt)}</span>
                </div>
                {repository.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {repository.topics.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-center shrink-0">
                <div className={`font-heading font-black text-4xl ${scoreColor}`}>{score}</div>
                <div className="text-zinc-500 text-xs mt-1">Repo Score</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Panels Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">

          {/* Documentation Panel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Panel title="Documentation" icon={BookOpen}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">README</span>
                  <BoolIndicator value={analysis.documentation.readme} trueLabel="Present" falseLabel="Missing" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Setup Instructions</span>
                  <BoolIndicator value={analysis.documentation.setup} trueLabel="Found" falseLabel="Missing" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Demo / Preview</span>
                  <BoolIndicator value={analysis.documentation.demo} trueLabel="Found" falseLabel="Missing" />
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* Activity Panel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Panel title="Activity & Freshness" icon={Activity}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Last Push</span>
                  <span className="text-zinc-200 text-sm font-mono">{timeAgo(analysis.activity.lastPushed)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusStyles[activityStatus] || statusStyles.inactive}`}>
                    {activityStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Months ago</span>
                  <span className="text-zinc-200 text-sm">{analysis.activity.monthsAgo} months</span>
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* Quality Panel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Panel title="Repository Quality" icon={Code2}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Description</span>
                  <BoolIndicator value={analysis.quality.hasDescription} trueLabel="Set" falseLabel="Missing" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Repo Name</span>
                  <BoolIndicator value={analysis.quality.nameOk} trueLabel="Meaningful" falseLabel="Generic" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Has Files</span>
                  <BoolIndicator value={!analysis.quality.isEmpty} trueLabel="Yes" falseLabel="Empty" />
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* Security Hygiene Panel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Panel title="Security Hygiene Audit" icon={Shield}>
              {!analysis.securityAvailable ? (
                <div className="flex items-start gap-2 text-zinc-400 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  Security scan unavailable for this repository
                </div>
              ) : analysis.security?.filter(f => f.severity !== 'healthy').length === 0 ? (
                <div className="flex items-start gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  No hygiene issues detected in this scan
                </div>
              ) : (
                <div className="space-y-2">
                  {analysis.security.filter(f => f.severity !== 'healthy').map((sec, i) => (
                    <div key={i} className="rounded-xl p-3 bg-red-500/5 border border-red-500/20">
                      <div className="flex items-start gap-2">
                        <Badge severity={sec.severity} size="xs" />
                        <span className="text-xs text-zinc-300 font-mono">{sec.evidence}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2">{sec.fix}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-zinc-700 mt-4 flex items-start gap-1.5">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                Hygiene audit only — not a SAST or vulnerability scanner. Findings labeled "potential."
              </p>
            </Panel>
          </motion.div>
        </div>

        {/* How To Fix */}
        {analysis.fixes?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <h3 className="font-heading font-semibold text-white flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-orange-400" />
                How to Fix — {repository.name}
              </h3>
              <div className="space-y-2">
                {analysis.fixes.map((fix, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center font-bold shrink-0">{i+1}</span>
                    <p className="text-zinc-300 text-sm">{fix}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* All findings */}
        {analysis.findings?.filter(f => f.score_impact < 0).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
            <Card>
              <h3 className="font-heading font-semibold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                All Findings for {repository.name}
              </h3>
              <div className="space-y-2">
                {analysis.findings.filter(f => f.score_impact < 0).map(f => (
                  <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
                    <Badge severity={f.severity} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm">{f.message}</p>
                      {f.evidence && <p className="text-zinc-500 text-xs mt-1 font-mono">{f.evidence}</p>}
                    </div>
                    <span className="text-red-400 text-xs font-mono font-bold shrink-0">{f.score_impact}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
