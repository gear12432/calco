'use client';

import React from 'react';
import { Palette } from 'lucide-react';

export type ThemeName = 'dark' | 'neon' | 'indigo' | 'emerald' | 'light';

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSelectTheme }) => {
  const themes: { id: ThemeName; label: string; bg: string; border: string }[] = [
    { id: 'dark', label: 'Dark Slate', bg: 'bg-slate-900', border: 'border-slate-700' },
    { id: 'indigo', label: 'Electric Indigo', bg: 'bg-indigo-950', border: 'border-indigo-500' },
    { id: 'neon', label: 'Cyberpunk Neon', bg: 'bg-black', border: 'border-fuchsia-500' },
    { id: 'emerald', label: 'Emerald Glass', bg: 'bg-emerald-950', border: 'border-emerald-500' },
    { id: 'light', label: 'Clean Light', bg: 'bg-slate-100 text-slate-900', border: 'border-slate-300' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
      <Palette className="w-4 h-4 text-slate-400 ml-2 mr-1" />
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              currentTheme === t.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${t.bg} border ${t.border}`} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
