'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Scale, Ruler, Thermometer, Zap, Database, Gauge } from 'lucide-react';

type Category = 'length' | 'weight' | 'temperature' | 'speed' | 'storage';

interface UnitDefinition {
  label: string;
  ratio: number; // Ratio relative to base unit (m, kg, celsius, m/s, bytes)
}

const UNITS: Record<Category, Record<string, UnitDefinition>> = {
  length: {
    m: { label: 'Meters (m)', ratio: 1 },
    km: { label: 'Kilometers (km)', ratio: 1000 },
    cm: { label: 'Centimeters (cm)', ratio: 0.01 },
    mm: { label: 'Millimeters (mm)', ratio: 0.001 },
    ft: { label: 'Feet (ft)', ratio: 0.3048 },
    in: { label: 'Inches (in)', ratio: 0.0254 },
    mi: { label: 'Miles (mi)', ratio: 1609.34 },
  },
  weight: {
    kg: { label: 'Kilograms (kg)', ratio: 1 },
    g: { label: 'Grams (g)', ratio: 0.001 },
    mg: { label: 'Milligrams (mg)', ratio: 0.000001 },
    lb: { label: 'Pounds (lbs)', ratio: 0.453592 },
    oz: { label: 'Ounces (oz)', ratio: 0.0283495 },
  },
  temperature: {
    c: { label: 'Celsius (°C)', ratio: 1 },
    f: { label: 'Fahrenheit (°F)', ratio: 1 },
    k: { label: 'Kelvin (K)', ratio: 1 },
  },
  speed: {
    kmh: { label: 'km/h', ratio: 0.277778 },
    mph: { label: 'mph', ratio: 0.44704 },
    ms: { label: 'm/s', ratio: 1 },
    knot: { label: 'Knots', ratio: 0.514444 },
  },
  storage: {
    b: { label: 'Bytes (B)', ratio: 1 },
    kb: { label: 'Kilobytes (KB)', ratio: 1024 },
    mb: { label: 'Megabytes (MB)', ratio: 1048576 },
    gb: { label: 'Gigabytes (GB)', ratio: 1073741824 },
    tb: { label: 'Terabytes (TB)', ratio: 1099511627776 },
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [value, setValue] = useState<string>('1');

  // Handle unit swap
  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Perform unit conversion logic
  const calculateResult = (): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';

    if (category === 'temperature') {
      if (fromUnit === toUnit) return num.toString();
      let celsius = num;

      if (fromUnit === 'f') celsius = ((num - 32) * 5) / 9;
      if (fromUnit === 'k') celsius = num - 273.15;

      if (toUnit === 'c') return Math.round(celsius * 10000) / 10000 + '';
      if (toUnit === 'f') return Math.round(((celsius * 9) / 5 + 32) * 10000) / 10000 + '';
      if (toUnit === 'k') return Math.round((celsius + 273.15) * 10000) / 10000 + '';
    }

    const currentCatUnits = UNITS[category];
    const fromRatio = currentCatUnits[fromUnit]?.ratio || 1;
    const toRatio = currentCatUnits[toUnit]?.ratio || 1;

    const baseVal = num * fromRatio;
    const converted = baseVal / toRatio;

    // Clean precision formatting
    return Number(Math.round(Number(converted + 'e8')) + 'e-8').toString();
  };

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    const unitKeys = Object.keys(UNITS[newCat]);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1] || unitKeys[0]);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
      {/* Category selector icons */}
      <div className="flex items-center justify-between gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleCategoryChange('length')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            category === 'length'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Length</span>
        </button>

        <button
          onClick={() => handleCategoryChange('weight')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            category === 'weight'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Weight</span>
        </button>

        <button
          onClick={() => handleCategoryChange('temperature')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            category === 'temperature'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Temp</span>
        </button>

        <button
          onClick={() => handleCategoryChange('speed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            category === 'speed'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Speed</span>
        </button>

        <button
          onClick={() => handleCategoryChange('storage')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            category === 'storage'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data</span>
        </button>
      </div>

      {/* Inputs and Unit Selections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center relative">
        {/* From Section */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            From
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-transparent font-mono text-xl md:text-2xl text-white outline-none"
            placeholder="0"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="mt-1 bg-slate-800 text-slate-200 text-xs rounded-lg p-2 outline-none border border-slate-700 cursor-pointer"
          >
            {Object.entries(UNITS[category]).map(([key, unit]) => (
              <option key={key} value={key}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 self-center p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-slate-900 transition-transform active:rotate-180 cursor-pointer shadow-lg"
          title="Swap units"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* To Section */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
          <label className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
            To
          </label>
          <div className="font-mono text-xl md:text-2xl text-indigo-300 font-bold truncate">
            {calculateResult()}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="mt-1 bg-slate-800 text-slate-200 text-xs rounded-lg p-2 outline-none border border-slate-700 cursor-pointer"
          >
            {Object.entries(UNITS[category]).map(([key, unit]) => (
              <option key={key} value={key}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
