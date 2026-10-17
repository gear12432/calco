'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Sparkles, Delete, History } from 'lucide-react';
import { AngleUnit } from '@/lib/calculator';

interface DisplayProps {
  expression: string;
  result: string;
  previewResult: string;
  angleUnit: AngleUnit;
  memoryValue: number | null;
  mode: 'standard' | 'scientific';
  onToggleAngleUnit: () => void;
  onBackspace: () => void;
  onCopy: () => void;
  copied: boolean;
  onOpenAIExplain: () => void;
  onToggleHistory: () => void;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  previewResult,
  angleUnit,
  memoryValue,
  mode,
  onToggleAngleUnit,
  onBackspace,
  onCopy,
  copied,
  onOpenAIExplain,
  onToggleHistory,
}) => {
  const activeValue = result || previewResult || '0';

  return (
    <div className="relative w-full p-4 md:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner flex flex-col justify-between overflow-hidden min-h-[160px] md:min-h-[190px]">
      {/* Top Header Indicators */}
      <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-400 gap-2 mb-2">
        <div className="flex items-center gap-2">
          {mode === 'scientific' && (
            <button
              onClick={onToggleAngleUnit}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-400 transition-colors cursor-pointer border border-slate-700/60"
              title="Toggle DEG / RAD"
            >
              {angleUnit}
            </button>
          )}

          {memoryValue !== null && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[11px]">
              M = {memoryValue}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAIExplain}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition-all text-xs font-medium cursor-pointer"
            title="Explain with Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Explain</span>
          </button>

          <button
            onClick={onToggleHistory}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Toggle History Log"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={onCopy}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Copy Result"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onBackspace}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 transition-colors cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex flex-col items-end justify-end mt-auto w-full overflow-x-auto no-scrollbar py-1">
        {/* Expression string */}
        <div className="text-sm md:text-base text-slate-400 font-mono tracking-wide break-all text-right min-h-[24px]">
          {expression || '\u00A0'}
        </div>

        {/* Live / Final Calculated Result */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeValue}
            initial={{ opacity: 0.8, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className={`font-mono font-bold tracking-tight text-right w-full break-all ${
              activeValue.length > 12
                ? 'text-2xl md:text-3xl text-indigo-200'
                : 'text-4xl md:text-5xl text-white'
            }`}
          >
            {activeValue}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
