// Safe evaluation engine for calculator expressions

export type AngleUnit = 'DEG' | 'RAD';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

// Factorial helper
function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // Limit overflow
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

/**
  Evaluates mathematical expressions safely without using arbitrary eval()
*/
export function evaluateExpression(
  expr: string,
  angleUnit: AngleUnit = 'DEG'
): { success: boolean; result: string; error?: string } {
  try {
    if (!expr || expr.trim() === '') {
      return { success: true, result: '0' };
    }

    // Replace display symbols with JS math compatible operators
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'Math.PI')
      .replace(/e(?![a-z])/g, 'Math.E');

    // Handle percentage like 50% -> (50/100) or 100 * 5%
    sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

    // Handle factorial (e.g. 5!)
    sanitized = sanitized.replace(/(\d+)!/g, (_, num) => {
      const val = parseInt(num, 10);
      return factorial(val).toString();
    });

    // Handle trigonometric functions considering angleUnit
    const toRad = (angle: number) => (angleUnit === 'DEG' ? (angle * Math.PI) / 180 : angle);

    // Context functions for safe evaluation
    const mathContext: Record<string, Function> = {
      sin: (x: number) => Math.sin(toRad(x)),
      cos: (x: number) => Math.cos(toRad(x)),
      tan: (x: number) => Math.tan(toRad(x)),
      asin: (x: number) => {
        const val = Math.asin(x);
        return angleUnit === 'DEG' ? (val * 180) / Math.PI : val;
      },
      acos: (x: number) => {
        const val = Math.acos(x);
        return angleUnit === 'DEG' ? (val * 180) / Math.PI : val;
      },
      atan: (x: number) => {
        const val = Math.atan(x);
        return angleUnit === 'DEG' ? (val * 180) / Math.PI : val;
      },
      sqrt: (x: number) => Math.sqrt(x),
      cbrt: (x: number) => Math.cbrt(x),
      log: (x: number) => Math.log10(x),
      ln: (x: number) => Math.log(x),
      abs: (x: number) => Math.abs(x),
      exp: (x: number) => Math.exp(x),
      pow: (x: number, y: number) => Math.pow(x, y),
    };

    // Replace function calls e.g., sin( -> mathContext.sin(
    // Handle power x^y -> Math.pow(x, y)
    sanitized = transformPowers(sanitized);

    // Transform math functions
    const funcNames = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'cbrt', 'log', 'ln', 'abs', 'exp'];
    for (const fn of funcNames) {
      const reg = new RegExp(`\\b${fn}\\(`, 'g');
      sanitized = sanitized.replace(reg, `__ctx__.${fn}(`);
    }

    // Construct safe function execution context
    const evaluator = new Function('__ctx__', `
      "use strict";
      try {
        const Math = undefined; // Prevent native Math access bypass
        return ${sanitized};
      } catch (e) {
        return NaN;
      }
    `);

    const rawResult = evaluator(mathContext);

    if (rawResult === undefined || rawResult === null || isNaN(rawResult)) {
      return { success: false, result: 'Error', error: 'Invalid expression' };
    }

    if (!isFinite(rawResult)) {
      return { success: false, result: 'Infinity', error: 'Division by zero or overflow' };
    }

    // Format output cleanly (avoid float imprecision e.g. 0.1 + 0.2 = 0.30000000000000004)
    const rounded = Number(Math.round(Number(rawResult + 'e12')) + 'e-12');
    return { success: true, result: rounded.toString() };
  } catch (err: any) {
    return { success: false, result: 'Error', error: err?.message || 'Invalid calculation' };
  }
}

/**
 Helper to transform power expressions like 2^3 or (1+2)^(3+4) into Math.pow
*/
function transformPowers(expr: string): string {
  while (expr.includes('^')) {
    const caretIdx = expr.indexOf('^');
    if (caretIdx === -1) break;

    // Find base before '^'
    let baseStart = caretIdx - 1;
    if (expr[baseStart] === ')') {
      let depth = 1;
      baseStart--;
      while (baseStart >= 0 && depth > 0) {
        if (expr[baseStart] === ')') depth++;
        if (expr[baseStart] === '(') depth--;
        baseStart--;
      }
      baseStart++;
    } else {
      while (baseStart >= 0 && /[\d.\w]/.test(expr[baseStart])) {
        baseStart--;
      }
      baseStart++;
    }

    // Find exponent after '^'
    let expEnd = caretIdx + 1;
    if (expr[expEnd] === '(') {
      let depth = 1;
      expEnd++;
      while (expEnd < expr.length && depth > 0) {
        if (expr[expEnd] === '(') depth++;
        if (expr[expEnd] === ')') depth--;
        expEnd++;
      }
    } else {
      while (expEnd < expr.length && /[\d.\w]/.test(expr[expEnd])) {
        expEnd++;
      }
    }

    const base = expr.substring(baseStart, caretIdx);
    const exponent = expr.substring(caretIdx + 1, expEnd);

    if (!base || !exponent) break;

    const replacement = `__ctx__.pow(${base},${exponent})`;
    expr = expr.substring(0, baseStart) + replacement + expr.substring(expEnd);
  }
  return expr;
}

// Play subtle tactile audio beep using Web Audio API
export function playClickSound(enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Ignore audio errors on unsupported browsers
  }
}
