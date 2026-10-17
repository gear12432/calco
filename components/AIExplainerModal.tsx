'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Send, HelpCircle, BookOpen } from 'lucide-react';

interface AIExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expression: string;
  result: string;
}

export const AIExplainerModal: React.FC<AIExplainerModalProps> = ({
  isOpen,
  onClose,
  expression,
  result,
}) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'word_problem'>('explain');
  const [wordProblem, setWordProblem] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async (type: 'explain' | 'solve_word_problem', customPrompt?: string) => {
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: type === 'solve_word_problem' ? customPrompt : expression || result,
          result: result || '0',
          type,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch explanation from AI');
      }

      setExplanation(data.explanation);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [expression, result]);

  // Load initial explanation when modal is opened on "Explain Calculation" tab
  const handleInitialExplain = useCallback(() => {
    if (activeTab === 'explain' && (expression || result)) {
      fetchExplanation('explain');
    }
  }, [activeTab, expression, result, fetchExplanation]);

  const handleWordProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordProblem.trim()) return;
    fetchExplanation('solve_word_problem', wordProblem);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Gemini AI Math Explainer</h3>
                  <p className="text-xs text-indigo-300">Step-by-step breakdown & word problem solver</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1">
              <button
                onClick={() => {
                  setActiveTab('explain');
                  setExplanation(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'explain'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Explain Calculation</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('word_problem');
                  setExplanation(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'word_problem'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Solve Word Problem</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 overflow-y-auto no-scrollbar space-y-4">
              {activeTab === 'explain' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-sm text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-sans block mb-1">Target Equation:</span>
                      <div className="text-indigo-400 font-bold">
                        {expression || result} = {result}
                      </div>
                    </div>
                    {!explanation && !loading && (
                      <button
                        onClick={handleInitialExplain}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Generate Explanation
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'word_problem' && (
                <form onSubmit={handleWordProblemSubmit} className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">
                    Type or paste a math question / word problem:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={wordProblem}
                      onChange={(e) => setWordProblem(e.target.value)}
                      placeholder="e.g. If 3 apples cost $4.50, how much do 7 apples cost?"
                      className="flex-1 bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={loading || !wordProblem.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Solve</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Status Display */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p>Gemini is analyzing the mathematical steps...</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {!loading && explanation && (
                <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800/80 text-sm leading-relaxed text-slate-200 whitespace-pre-line font-sans">
                  {explanation}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-500">
              Powered by Google Gemini 2.5 Flash
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
