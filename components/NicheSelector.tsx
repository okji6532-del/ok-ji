import React from 'react';
import { NicheType } from '../types';
import { NICHE_PRESETS } from '../constants';

interface NicheSelectorProps {
  selectedNiche: NicheType;
  onChange: (niche: NicheType) => void;
  disabled?: boolean;
}

export const NicheSelector: React.FC<NicheSelectorProps> = ({ selectedNiche, onChange, disabled }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-slate-300">
          Niche Intelligence
        </label>
        <div className="text-[10px] text-primary-300 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
          AI Trained
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.entries(NICHE_PRESETS) as [NicheType, typeof NICHE_PRESETS[NicheType]][]).map(([key, preset]) => {
           const isSelected = selectedNiche === key;
           
           return (
            <button
              key={key}
              onClick={() => onChange(key)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                ${isSelected 
                  ? 'bg-gradient-to-b from-primary-600/20 to-primary-900/40 border-primary-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className={`material-symbols-rounded text-2xl mb-1 ${isSelected ? 'text-primary-400' : 'text-slate-500'}`}>
                {preset.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                {preset.label}
              </span>
              
              {isSelected && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse shadow-[0_0_5px_#A78BFA]"></span>
              )}
            </button>
           );
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-2 italic px-1">
        * Applies expert composition, lighting, and style rules for {NICHE_PRESETS[selectedNiche].label} content.
      </p>
    </div>
  );
};