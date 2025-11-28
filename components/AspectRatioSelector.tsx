import React from 'react';
import { AspectRatio } from '../types';
import { ASPECT_RATIO_OPTIONS } from '../constants';

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
  disabled?: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-3">
        Aspect Ratio
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ASPECT_RATIO_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative overflow-hidden group
              ${
                value === option.value
                  ? 'bg-primary-500/20 border-primary-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
            `}
          >
            <span className="material-symbols-rounded text-2xl mb-1">{option.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">{option.label}</span>
            
            {/* Active Glow Effect */}
            {value === option.value && (
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-transparent pointer-events-none"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};