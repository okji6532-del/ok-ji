import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedImage } from '../types';

interface ThumbnailDisplayProps {
  image: GeneratedImage | null;
  isLoading: boolean;
  loadingLabel?: string;
  onDownload: () => void;
}

const STAGES = [
  { label: 'Prompt Analysis', subtext: 'Decoding semantic context' },
  { label: 'Concept Generation', subtext: 'Forming composition & structure' },
  { label: 'Image Synthesis', subtext: 'Rendering high-fidelity pixels' },
  { label: 'Style Application', subtext: 'Injecting aesthetic rules' },
  { label: 'Final Polish', subtext: 'Enhancing lighting & details' },
];

export const ThumbnailDisplay: React.FC<ThumbnailDisplayProps> = ({ 
  image, 
  isLoading, 
  loadingLabel = "Processing...", 
  onDownload 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }
    setProgress(0);
    
    // Simulate progress: faster at start, slower at end
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        
        let jump = 0.5;
        if (prev < 30) jump = Math.random() * 2 + 0.5;
        else if (prev < 60) jump = Math.random() * 1.5;
        else if (prev < 85) jump = Math.random() * 0.5;
        else jump = Math.random() * 0.2; // Very slow at the end
        
        return Math.min(prev + jump, 99);
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isLoading]);

  // Determine active stage based on progress milestones
  const activeStageIndex = useMemo(() => {
      // 0-20, 20-40, 40-60, 60-80, 80-100
      const calculatedIndex = Math.floor(progress / 20);
      return Math.min(calculatedIndex, STAGES.length - 1);
  }, [progress]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>

         <div className="relative z-10 w-full max-w-sm">
             {/* Header Section */}
             <div className="text-center mb-8">
                 <div className="w-16 h-16 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative">
                     <div className="absolute inset-0 rounded-2xl border border-primary-500/30 animate-ping opacity-20"></div>
                     <span className="material-symbols-rounded text-3xl text-primary-400 animate-spin" style={{animationDuration: '3s'}}>
                         donut_large
                     </span>
                 </div>
                 <h3 className="text-xl font-bold text-white font-display tracking-wide">{loadingLabel}</h3>
                 <p className="text-slate-400 text-xs font-mono mt-2 tracking-widest">{Math.round(progress)}% COMPLETE</p>
             </div>

             {/* Staged Progress List */}
             <div className="space-y-3 bg-slate-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                 {STAGES.map((stage, idx) => {
                     const isActive = idx === activeStageIndex;
                     const isCompleted = idx < activeStageIndex;
                     const isPending = idx > activeStageIndex;
                     
                     return (
                         <div key={idx} className={`flex items-center gap-4 transition-all duration-300 ${isPending ? 'opacity-30 blur-[0.5px]' : 'opacity-100'}`}>
                             {/* Icon Indicator */}
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0
                                 ${isCompleted ? 'bg-green-500/20 border-green-500 text-green-500' : ''}
                                 ${isActive ? 'bg-primary-500/20 border-primary-500 text-primary-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : ''}
                                 ${isPending ? 'bg-slate-800/50 border-slate-700 text-slate-600' : ''}
                             `}>
                                 {isCompleted ? (
                                     <span className="material-symbols-rounded text-sm font-bold">check</span>
                                 ) : isActive ? (
                                     <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-ping"></div>
                                 ) : (
                                     <span className="text-[10px] font-mono">{idx + 1}</span>
                                 )}
                             </div>
                             
                             {/* Stage Info */}
                             <div className="flex-1 min-w-0 flex justify-between items-center">
                                 <div>
                                    <div className={`text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                        {stage.label}
                                    </div>
                                    {isActive && (
                                        <div className="text-[10px] text-primary-300/80 font-mono animate-fade-in truncate mt-0.5">
                                            {stage.subtext}
                                        </div>
                                    )}
                                 </div>
                                 {isActive && (
                                    <span className="material-symbols-rounded text-primary-500 text-base animate-spin">
                                        progress_activity
                                    </span>
                                 )}
                             </div>
                         </div>
                     );
                 })}
             </div>

             {/* Global Progress Bar */}
             <div className="w-full h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-teal-500 via-primary-500 to-magenta-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                ></div>
             </div>
         </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
          <span className="material-symbols-rounded text-4xl text-slate-500">image</span>
        </div>
        <h3 className="text-xl font-medium text-slate-300 mb-2">Ready to Visualize</h3>
        <p className="text-slate-500 max-w-xs">
          Enter your prompt on the left to generate high-fidelity visuals using SnapGenius AI.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      <img
        src={image.url}
        alt={image.prompt}
        className="w-full h-full object-contain transition-transform duration-700"
      />
      
      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
         <button
            onClick={onDownload}
            className="bg-white text-cosmic-950 font-bold py-3 px-6 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
         >
            <span className="material-symbols-rounded">download</span> Download
         </button>
         <button className="bg-white/10 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 border border-white/20 backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:bg-white/20">
            <span className="material-symbols-rounded">share</span> Share
         </button>
      </div>
    </div>
  );
};