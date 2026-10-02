import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, Loader2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { analyzeTarget } from '../api/client.js';
import { useScan } from '../context/ScanContext.jsx';
import { Button } from '../components/ui/Button.jsx';

const STAGES = [
  { id: 'validating',   label: 'Validating URL',                    detail: 'Parsing target URL and checking public accessibility' },
  { id: 'fetching',     label: 'Fetching GitHub data',              detail: 'Loading metadata, repositories, and root files' },
  { id: 'analyzing',    label: 'Analyzing repositories',            detail: 'Filtering forks and isolating active codebases' },
  { id: 'docs',         label: 'Checking documentation',            detail: 'Evaluating README, setup heuristics, and demo evidence' },
  { id: 'activity',     label: 'Checking activity',                 detail: 'Analyzing commit cadence and stale branches' },
  { id: 'quality',      label: 'Checking repository quality',       detail: 'Auditing descriptions, naming clarity, and licenses' },
  { id: 'security',     label: 'Checking security hygiene',         detail: 'Scanning for potential credential files and .gitignore' },
  { id: 'scoring',      label: 'Calculating score',                 detail: 'Executing 5-category deterministic mathematical weighting' },
  { id: 'roast',        label: 'Generating AI roast',               detail: 'Grounding AI narration strictly in verified audit findings' }
];

const STAGGER_MS = [400, 500, 450, 450, 400, 400, 400, 400, 0]; // last stage waits for real API response

export default function Scanning() {
  const params = useParams();
  const navigate = useNavigate();
  const { setScanResult, setIsLoading, setError, intensity } = useScan();

  const [completedStages, setCompletedStages] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [scanError, setScanError] = useState(null);
  const [done, setDone] = useState(false);

  const rawParam = params.username || params['*'] || '';
  const rawTarget = rawParam ? decodeURIComponent(rawParam) : '';

  // Advance progressive checklist
  useEffect(() => {
    let timeout;
    const advance = (stageIdx) => {
      if (stageIdx >= STAGES.length - 1) return;
      timeout = setTimeout(() => {
        setCompletedStages(prev => [...prev, STAGES[stageIdx].id]);
        setCurrentStageIndex(stageIdx + 1);
        advance(stageIdx + 1);
      }, STAGGER_MS[stageIdx]);
    };
    advance(0);
    return () => clearTimeout(timeout);
  }, []);

  // Actual API call
  useEffect(() => {
    if (!rawTarget) return;
    setIsLoading(true);

    analyzeTarget(rawTarget, intensity || 'brutal')
      .then(data => {
        setCompletedStages(STAGES.map(s => s.id));
        setCurrentStageIndex(STAGES.length);
        setDone(true);
        setScanResult(data);
        setIsLoading(false);

        // Determine destination identifier
        const destKey = data.target?.cleanIdentifier || data.profile?.username || rawTarget;
        setTimeout(() => {
          navigate(`/dashboard/${encodeURIComponent(destKey)}`, { replace: true });
        }, 700);
      })
      .catch(err => {
        setIsLoading(false);
        setScanError(err.message || 'Failed to analyze GitHub target. Please verify the URL.');
        setError(err.message);
      });
  }, [rawTarget, intensity]);

  const handleRetry = () => {
    setScanError(null);
    setCompletedStages([]);
    setCurrentStageIndex(0);
    setDone(false);
    navigate(0); // Reload current scanning route
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-2xl border border-zinc-700/40 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-base sm:text-lg">
                Scanning GitHub...
              </h1>
              <p className="text-zinc-400 text-xs font-mono truncate max-w-xs sm:max-w-sm mt-0.5">
                {rawTarget}
              </p>
            </div>
          </div>

          {/* Stage checklist */}
          <div className="space-y-2.5 mb-6">
            {STAGES.map((stage, i) => {
              const isCompleted = completedStages.includes(stage.id);
              const isCurrent = !isCompleted && i === currentStageIndex && !scanError;
              const isPending = !isCompleted && (i > currentStageIndex || scanError);

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-white'
                      : isCurrent
                      ? 'bg-orange-500/5 border-orange-500/30 text-white'
                      : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                      )}
                    </div>
                    <div>
                      <span className={`text-xs font-medium ${isCompleted ? 'text-zinc-200' : isCurrent ? 'text-orange-300 font-semibold' : 'text-zinc-500'}`}>
                        {stage.label}
                      </span>
                      {isCurrent && (
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-normal">{stage.detail}</p>
                      )}
                    </div>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-mono text-emerald-400/80">Done</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Error display */}
          {scanError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs mb-6"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-300 mb-1">Scan Failed</div>
                  <p className="text-zinc-300 leading-relaxed">{scanError}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {scanError ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Back to URL Input
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={handleRetry}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </>
            ) : (
              <div className="w-full text-center text-xs text-zinc-500 font-mono">
                {done ? '✨ Audit complete! Loading results...' : 'Auditing against 5 deterministic categories...'}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
