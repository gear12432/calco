'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { HistoryPanel } from './HistoryPanel';
import { UnitConverter } from './UnitConverter';
import { AIExplainerModal } from './AIExplainerModal';
import { ThemeSelector, ThemeName } from './ThemeSelector';
import {
  evaluateExpression,
  playClickSound,
  AngleUnit,
  HistoryItem,
} from '@/lib/calculator';
import {
  Calculator as CalcIcon,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeftRight,
  FlaskConical,
  Grid,
} from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  // Calculator Core States
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [memoryValue, setMemoryValue] = useState<number | null>(null);

  // Mode & App Settings
  const [calcMode, setCalcMode] = useState<'standard' | 'scientific'>('standard');
  const [activeTab, setActiveTab] = useState<'calculator' | 'converter'>('calculator');

  // Initialize from localStorage cleanly via state initializers
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      return (localStorage.getItem('calcpulse_theme') as ThemeName) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('calcpulse_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedHist = localStorage.getItem('calcpulse_history');
      return savedHist ? JSON.parse(savedHist) : [];
    } catch {
      return [];
    }
  });

  // UI Panels / Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Compute previewResult declaratively with useMemo
  const previewResult = useMemo(() => {
    if (!expression || expression.trim() === '') {
      return '';
    }
    if (/[\d\)%!eπ]$/.test(expression.trim())) {
      const evalRes = evaluateExpression(expression, angleUnit);
      if (evalRes.success && evalRes.result !== expression) {
        return evalRes.result;
      }
    }
    return '';
  }, [expression, angleUnit]);

  // Save history updates
  const updateHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 50);
      try {
        localStorage.setItem('calcpulse_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('calcpulse_history');
    } catch (e) {}
  };

  // Handle Input append
  const handleInput = useCallback(
    (val: string) => {
      playClickSound(soundEnabled);

      if (result && !['+', '−', '×', '÷', '^', '%'].includes(val)) {
        setExpression(val);
        setResult('');
        return;
      }

      if (result && ['+', '−', '×', '÷', '^', '%'].includes(val)) {
        setExpression(result + val);
        setResult('');
        return;
      }

      setExpression((prev) => prev + val);
    },
    [result, soundEnabled]
  );

  // Handle Clear & All Clear
  const handleClear = useCallback(() => {
    playClickSound(soundEnabled);
    if (expression) {
      setExpression((prev) => prev.slice(0, -1));
    } else {
      setResult('');
    }
  }, [expression, soundEnabled]);

  const handleAllClear = useCallback(() => {
    playClickSound(soundEnabled);
    setExpression('');
    setResult('');
  }, [soundEnabled]);

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    playClickSound(soundEnabled);
    if (result) {
      setResult('');
      return;
    }
    setExpression((prev) => prev.slice(0, -1));
  }, [result, soundEnabled]);

  // Handle Calculation Evaluation (=)
  const handleCalculate = useCallback(() => {
    playClickSound(soundEnabled);
    const targetExpr = expression || result;
    if (!targetExpr) return;

    const evalRes = evaluateExpression(targetExpr, angleUnit);
    if (evalRes.success) {
      setResult(evalRes.result);

      updateHistory({
        id: Date.now().toString(),
        expression: targetExpr,
        result: evalRes.result,
        timestamp: Date.now(),
      });
    } else {
      setResult('Error');
    }
  }, [expression, result, angleUnit, soundEnabled, updateHistory]);

  // Handle Toggle Plus/Minus Sign
  const handleToggleSign = useCallback(() => {
    playClickSound(soundEnabled);
    if (result) {
      if (result.startsWith('-')) {
        setResult(result.substring(1));
      } else {
        setResult('-' + result);
      }
      return;
    }

    if (!expression) return;

    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else {
      setExpression(`-(${expression})`);
    }
  }, [expression, result, soundEnabled]);

  // Handle Memory Operations
  const handleMemoryAction = useCallback(
    (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
      playClickSound(soundEnabled);
      const currentVal = parseFloat(result || previewResult || expression) || 0;

      switch (action) {
        case 'MC':
          setMemoryValue(null);
          break;
        case 'MR':
          if (memoryValue !== null) {
            handleInput(memoryValue.toString());
          }
          break;
        case 'M+':
          setMemoryValue((prev) => (prev || 0) + currentVal);
          break;
        case 'M-':
          setMemoryValue((prev) => (prev || 0) - currentVal);
          break;
        case 'MS':
          setMemoryValue(currentVal);
          break;
      }
    },
    [result, previewResult, expression, memoryValue, handleInput, soundEnabled]
  );

  // Copy Result to Clipboard
  const handleCopy = () => {
    const valToCopy = result || previewResult || expression || '0';
    navigator.clipboard.writeText(valToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key;

      if (key >= '0' && key <= '9') {
        setActiveKey(key);
        handleInput(key);
      } else if (key === '.') {
        setActiveKey('.');
        handleInput('.');
      } else if (key === '+') {
        setActiveKey('+');
        handleInput('+');
      } else if (key === '-') {
        setActiveKey('-');
        handleInput('−');
      } else if (key === '*') {
        setActiveKey('*');
        handleInput('×');
      } else if (key === '/') {
        e.preventDefault();
        setActiveKey('/');
        handleInput('÷');
      } else if (key === '%') {
        setActiveKey('%');
        handleInput('%');
      } else if (key === '^') {
        setActiveKey('^');
        handleInput('^');
      } else if (key === '(' || key === ')') {
        setActiveKey(key);
        handleInput(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        setActiveKey('=');
        handleCalculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        setActiveKey('Backspace');
        handleBackspace();
      } else if (key === 'Escape') {
        setActiveKey('AC');
        handleAllClear();
      }

      setTimeout(() => setActiveKey(null), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleBackspace, handleAllClear]);

  // Dynamic Theme Styling Classes
  const getThemeClass = () => {
    switch (theme) {
      case 'indigo':
        return 'from-indigo-950 via-slate-950 to-slate-900 border-indigo-900/50';
      case 'neon':
        return 'from-black via-zinc-950 to-purple-950/40 border-fuchsia-500/30';
      case 'emerald':
        return 'from-emerald-950 via-slate-950 to-teal-950/40 border-emerald-900/50';
      case 'light':
        return 'from-slate-100 via-slate-200 to-indigo-50/50 border-slate-300 text-slate-900';
      default:
        return 'from-slate-950 via-slate-900 to-slate-950 border-slate-800';
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 transition-colors duration-300">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Bar Header */}
      <header className="w-full max-w-lg mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <CalcIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-white flex items-center gap-2">
              CalcPulse
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Pro
              </span>
            </h1>
          </div>
        </div>

        {/* Audio Toggle & Theme Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextSound = !soundEnabled;
              setSoundEnabled(nextSound);
              localStorage.setItem('calcpulse_sound', String(nextSound));
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Click Sound Enabled' : 'Click Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <ThemeSelector
            currentTheme={theme}
            onSelectTheme={(t) => {
              setTheme(t);
              localStorage.setItem('calcpulse_theme', t);
            }}
          />
        </div>
      </header>

      {/* Main Container Card */}
      <main
        className={`relative w-full max-w-lg bg-gradient-to-b ${getThemeClass()} border rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300`}
      >
        {/* Navigation Mode Bar */}
        <div className="flex items-center justify-between bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 mb-4">
          <div className="flex items-center gap-1 w-full">
            <button
              onClick={() => {
                setActiveTab('calculator');
                setCalcMode('standard');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calculator' && calcMode === 'standard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Standard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('calculator');
                setCalcMode('scientific');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calculator' && calcMode === 'scientific'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Scientific</span>
            </button>

            <button
              onClick={() => setActiveTab('converter')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'converter'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Converter</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Calculator Interface */}
        {activeTab === 'calculator' && (
          <div className="flex flex-col gap-2">
            <Display
              expression={expression}
              result={result}
              previewResult={previewResult}
              angleUnit={angleUnit}
              memoryValue={memoryValue}
              mode={calcMode}
              onToggleAngleUnit={() => setAngleUnit((u) => (u === 'DEG' ? 'RAD' : 'DEG'))}
              onBackspace={handleBackspace}
              onCopy={handleCopy}
              copied={copied}
              onOpenAIExplain={() => setIsAIModalOpen(true)}
              onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
            />

            <Keypad
              mode={calcMode}
              onInput={handleInput}
              onClear={handleClear}
              onAllClear={handleAllClear}
              onCalculate={handleCalculate}
              onToggleSign={handleToggleSign}
              onMemoryAction={handleMemoryAction}
              soundEnabled={soundEnabled}
              activeKey={activeKey}
            />
          </div>
        )}

        {/* Tab 2: Unit Converter Interface */}
        {activeTab === 'converter' && <UnitConverter />}

        {/* Slide-over History Drawer Panel */}
        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectHistory={(item) => {
            setExpression(item.expression);
            setResult(item.result);
            setIsHistoryOpen(false);
          }}
          onClearHistory={handleClearHistory}
        />

        {/* AI Explainer Modal */}
        <AIExplainerModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          expression={expression}
          result={result || previewResult || '0'}
        />
      </main>

      {/* Footer Info */}
      <footer className="mt-4 text-center text-xs text-slate-500 font-mono flex items-center gap-3">
        <span>Keyboard Enabled</span>
        <span>•</span>
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI Math</span>
        </button>
      </footer>
    </div>
  );
};
