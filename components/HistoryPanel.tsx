'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryItem } from '@/lib/calculator';
import { Trash2, Copy, ArrowLeftRight, Clock, X } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Clock className="w-4 h-4" />
              <span>Calculation History</span>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Clear all history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2.5 my-1">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12 text-center">
                <Clock className="w-8 h-8 stroke-1 text-slate-600 mb-2 opacity-50" />
                <p>No calculation history yet.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Evaluated equations will appear here automatically.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectHistory(item)}
                  className="group p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col gap-1 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="truncate max-w-[200px]">{item.expression}</span>
                    <button
                      onClick={(e) => handleCopy(item.id, item.result, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                      title="Copy result"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between font-mono font-bold text-slate-100 text-lg">
                    <span>= {item.result}</span>
                    <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 flex items-center gap-1 font-sans font-normal">
                      <ArrowLeftRight className="w-3 h-3" />
                      Use
                    </span>
                  </div>

                  {copiedId === item.id && (
                    <span className="absolute top-1 right-2 text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      Copied!
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Click any equation above to load it into the calculator.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
