'use client';

import React from 'react';
import { motion } from 'motion/react';

interface KeypadProps {
  mode: 'standard' | 'scientific';
  onInput: (val: string) => void;
  onClear: () => void;
  onAllClear: () => void;
  onCalculate: () => void;
  onToggleSign: () => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  soundEnabled: boolean;
  activeKey?: string | null;
}

interface KeyButtonProps {
  label: React.ReactNode;
  value?: string;
  type: 'num' | 'op' | 'func' | 'clear' | 'equals' | 'memory';
  onClick: () => void;
  colSpan?: number;
  activeKey?: string | null;
}

const getButtonClass = (type: 'num' | 'op' | 'func' | 'clear' | 'equals' | 'memory') => {
  switch (type) {
    case 'num':
      return 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/60 active:scale-95 shadow';
    case 'op':
      return 'bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold border border-indigo-500/50 active:scale-95 shadow-md shadow-indigo-950/30';
    case 'func':
      return 'bg-slate-800/60 hover:bg-slate-700/80 text-indigo-300 border border-slate-700/50 active:scale-95 text-xs font-semibold';
    case 'clear':
      return 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 active:scale-95 font-semibold';
    case 'equals':
      return 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold border border-indigo-400/40 active:scale-95 shadow-lg shadow-indigo-500/25';
    case 'memory':
      return 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-xs font-medium';
    default:
      return 'bg-slate-800 text-white';
  }
};

const KeyButton: React.FC<KeyButtonProps> = ({
  label,
  value,
  type,
  onClick,
  colSpan = 1,
  activeKey,
}) => {
  const isKeyPressed = activeKey === (value || label);

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={`relative flex items-center justify-center p-3 md:p-3.5 rounded-xl font-mono text-base md:text-lg transition-all cursor-pointer select-none ${getButtonClass(
        type
      )} ${colSpan > 1 ? `col-span-${colSpan}` : ''} ${
        isKeyPressed ? 'ring-2 ring-indigo-400 bg-indigo-500/30' : ''
      }`}
    >
      {label}
    </motion.button>
  );
};

export const Keypad: React.FC<KeypadProps> = ({
  mode,
  onInput,
  onClear,
  onAllClear,
  onCalculate,
  onToggleSign,
  onMemoryAction,
  activeKey,
}) => {
  return (
    <div className="w-full flex flex-col gap-2.5 mt-3">
      {/* Memory Function Row */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <KeyButton label="MC" type="memory" activeKey={activeKey} onClick={() => onMemoryAction('MC')} />
        <KeyButton label="MR" type="memory" activeKey={activeKey} onClick={() => onMemoryAction('MR')} />
        <KeyButton label="M+" type="memory" activeKey={activeKey} onClick={() => onMemoryAction('M+')} />
        <KeyButton label="M-" type="memory" activeKey={activeKey} onClick={() => onMemoryAction('M-')} />
        <KeyButton label="MS" type="memory" activeKey={activeKey} onClick={() => onMemoryAction('MS')} />
      </div>

      {/* Scientific Row Options if Scientific Mode active */}
      {mode === 'scientific' && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5 md:gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
          <KeyButton label="sin" value="sin(" type="func" activeKey={activeKey} onClick={() => onInput('sin(')} />
          <KeyButton label="cos" value="cos(" type="func" activeKey={activeKey} onClick={() => onInput('cos(')} />
          <KeyButton label="tan" value="tan(" type="func" activeKey={activeKey} onClick={() => onInput('tan(')} />
          <KeyButton label="log" value="log(" type="func" activeKey={activeKey} onClick={() => onInput('log(')} />
          <KeyButton label="ln" value="ln(" type="func" activeKey={activeKey} onClick={() => onInput('ln(')} />
          <KeyButton label="√" value="sqrt(" type="func" activeKey={activeKey} onClick={() => onInput('sqrt(')} />

          <KeyButton label="x²" value="^2" type="func" activeKey={activeKey} onClick={() => onInput('^2')} />
          <KeyButton label="x^y" value="^" type="func" activeKey={activeKey} onClick={() => onInput('^')} />
          <KeyButton label="n!" value="!" type="func" activeKey={activeKey} onClick={() => onInput('!')} />
          <KeyButton label="π" value="π" type="func" activeKey={activeKey} onClick={() => onInput('π')} />
          <KeyButton label="e" value="e" type="func" activeKey={activeKey} onClick={() => onInput('e')} />
          <KeyButton label="abs" value="abs(" type="func" activeKey={activeKey} onClick={() => onInput('abs(')} />
        </div>
      )}

      {/* Primary Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 md:gap-2.5">
        {/* Row 1 */}
        <KeyButton label="AC" type="clear" activeKey={activeKey} onClick={onAllClear} />
        <KeyButton label="C" type="clear" activeKey={activeKey} onClick={onClear} />
        <KeyButton label="(" type="func" activeKey={activeKey} onClick={() => onInput('(')} />
        <KeyButton label=")" type="func" activeKey={activeKey} onClick={() => onInput(')')} />

        {/* Row 2 */}
        <KeyButton label="%" type="func" activeKey={activeKey} onClick={() => onInput('%')} />
        <KeyButton label="÷" value="/" type="op" activeKey={activeKey} onClick={() => onInput('÷')} />
        <KeyButton label="×" value="*" type="op" activeKey={activeKey} onClick={() => onInput('×')} />
        <KeyButton label="−" value="-" type="op" activeKey={activeKey} onClick={() => onInput('−')} />

        {/* Row 3 */}
        <KeyButton label="7" type="num" activeKey={activeKey} onClick={() => onInput('7')} />
        <KeyButton label="8" type="num" activeKey={activeKey} onClick={() => onInput('8')} />
        <KeyButton label="9" type="num" activeKey={activeKey} onClick={() => onInput('9')} />
        <KeyButton label="+" value="+" type="op" activeKey={activeKey} onClick={() => onInput('+')} />

        {/* Row 4 */}
        <KeyButton label="4" type="num" activeKey={activeKey} onClick={() => onInput('4')} />
        <KeyButton label="5" type="num" activeKey={activeKey} onClick={() => onInput('5')} />
        <KeyButton label="6" type="num" activeKey={activeKey} onClick={() => onInput('6')} />
        <KeyButton label="±" type="func" activeKey={activeKey} onClick={onToggleSign} />

        {/* Row 5 */}
        <KeyButton label="1" type="num" activeKey={activeKey} onClick={() => onInput('1')} />
        <KeyButton label="2" type="num" activeKey={activeKey} onClick={() => onInput('2')} />
        <KeyButton label="3" type="num" activeKey={activeKey} onClick={() => onInput('3')} />

        {/* Equals button */}
        <KeyButton label="=" type="equals" activeKey={activeKey} onClick={onCalculate} />

        {/* Row 6 */}
        <KeyButton label="0" colSpan={2} type="num" activeKey={activeKey} onClick={() => onInput('0')} />
        <KeyButton label="." type="num" activeKey={activeKey} onClick={() => onInput('.')} />
      </div>
    </div>
  );
};
