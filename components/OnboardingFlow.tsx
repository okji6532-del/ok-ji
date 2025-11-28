import React, { useState, useEffect } from 'react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  // Auto-advance splash screen
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const nextStep = () => setStep(prev => prev + 1);

  // --- Components ---

  const Splash = () => (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>
      
      <div className="relative z-10 mb-8 animate-float">
         <img 
            src="/logo.png" 
            alt="SnapGenius AI" 
            className="h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            onError={(e) => {
               // Fallback if logo not found
               e.currentTarget.style.display = 'none';
               document.getElementById('fallback-splash')?.classList.remove('hidden');
            }}
         />
         <div id="fallback-splash" className="hidden flex-col items-center">
            <div className="w-28 h-28 bg-gradient-to-tr from-primary-500 to-magenta-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.4)] mb-8">
               <span className="material-symbols-rounded text-6xl text-white">auto_fix</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-magenta-200 mb-4 tracking-tight text-center">
               SnapGenius AI
            </h1>
         </div>
      </div>
      
      <p className="text-primary-300/70 text-sm font-medium tracking-[0.3em] uppercase">Create Anything. Instantly.</p>
    </div>
  );

  const Welcome = () => (
    <div className="h-full flex flex-col md:flex-row items-center justify-center animate-slide-up max-w-6xl mx-auto px-6 gap-12">
      <div className="md:w-1/2 relative flex justify-center">
           <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-teal-500 rounded-full blur-[100px] opacity-30 animate-pulse-slow"></div>
           <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl border border-white/10 overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl">
              <div className="h-10 bg-cosmic-900/80 border-b border-white/10 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-500/40"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
              </div>
              <div className="aspect-[4/3] bg-cosmic-950/50 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
                 <span className="material-symbols-rounded text-9xl text-white/10">wallpaper</span>
                 
                 {/* Floating Notification */}
                 <div className="absolute bottom-6 left-6 right-6 glass-panel p-3 rounded-xl border border-white/10 flex items-center gap-3 animate-slide-up" style={{animationDelay: '0.5s'}}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                       <span className="material-symbols-rounded text-white text-sm">check</span>
                    </div>
                    <div>
                       <div className="text-white text-sm font-bold">Masterpiece Created</div>
                       <div className="text-[10px] text-teal-300">0.4s generation time</div>
                    </div>
                 </div>
              </div>
           </div>
      </div>
      
      <div className="md:w-1/2 text-center md:text-left">
        <div className="inline-block px-4 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider mb-6">
           Version 2.0 Now Live
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1] font-display">
          Welcome to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-magenta-500">SnapGenius AI</span>
        </h2>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg">
          The premium creative partner for thumbnails, posters, and cinematic visuals. 
          Turn simple text into professional assets.
        </p>
        <button 
          onClick={nextStep}
          className="group relative px-10 py-4 rounded-full bg-white text-cosmic-950 font-bold text-lg overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
        >
          <span className="relative z-10">Start Creating</span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-primary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );

  const InterestSelection = () => {
     const [selected, setSelected] = useState<string[]>([]);
     const interests = [
        { id: 'yt', label: 'Thumbnails', icon: 'play_arrow' },
        { id: 'prod', label: 'Product', icon: 'inventory_2' },
        { id: 'art', label: 'Concept Art', icon: 'palette' },
        { id: 'social', label: 'Social Ads', icon: 'campaign' },
        { id: 'doc', label: 'Posters', icon: 'movie' },
        { id: '3d', label: '3D Renders', icon: 'view_in_ar' },
     ];

     const toggle = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
     };

     return (
        <div className="max-w-2xl mx-auto w-full animate-slide-up text-center">
           <h2 className="text-3xl font-bold font-display text-white mb-3">Your Creative Focus</h2>
           <p className="text-slate-400 mb-10">Select your primary goals to calibrate the AI.</p>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {interests.map(item => (
                 <button 
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 group overflow-hidden
                       ${selected.includes(item.id) 
                          ? 'bg-primary-900/40 border-primary-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]' 
                          : 'glass-panel border-white/5 hover:border-white/20 hover:bg-white/5'
                       }
                    `}
                 >
                    <span className={`material-symbols-rounded text-4xl transition-colors ${selected.includes(item.id) ? 'text-primary-400' : 'text-slate-600 group-hover:text-slate-300'}`}>{item.icon}</span>
                    <span className={`font-medium text-sm ${selected.includes(item.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{item.label}</span>
                 </button>
              ))}
           </div>
           
           <button 
              onClick={nextStep} 
              className={`px-12 py-4 rounded-full font-bold transition-all ${selected.length > 0 ? 'bg-white text-cosmic-950 hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              disabled={selected.length === 0}
           >
              Continue
           </button>
        </div>
     );
  };

  const FinalScreen = () => (
     <div className="text-center animate-slide-up max-w-2xl mx-auto">
         {/* Floating particles */}
         <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
               <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-float" 
                    style={{
                       left: `${Math.random() * 100}%`, 
                       top: `${Math.random() * 100}%`,
                       opacity: Math.random() * 0.5 + 0.2,
                       animationDuration: `${Math.random() * 3 + 3}s`
                    }}></div>
            ))}
         </div>

         <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-magenta-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(192,38,211,0.4)] animate-float">
            <span className="material-symbols-rounded text-5xl text-white">rocket_launch</span>
         </div>
         
         <h2 className="text-5xl font-bold font-display text-white mb-6">You're All Set!</h2>
         <p className="text-xl text-slate-400 mb-12">Your studio is calibrated. Let's create something impossible.</p>
         
         <button 
            onClick={onComplete}
            className="bg-gradient-to-r from-primary-500 via-magenta-500 to-accent-500 text-white font-bold text-lg py-5 px-16 rounded-full hover:scale-105 transition-transform shadow-xl shadow-magenta-900/40"
         >
            Launch Workspace
         </button>
     </div>
  );

  // Simplified router for the example
  const renderStep = () => {
     switch(step) {
        case 0: return <Splash />;
        case 1: return <Welcome />;
        case 2: return <InterestSelection />;
        case 3: return <FinalScreen />;
        default: return <FinalScreen />;
     }
  };

  return (
    <div className="fixed inset-0 bg-cosmic-950 text-white overflow-hidden font-sans">
       {/* Progress Bar */}
       {step > 0 && step < 4 && (
          <div className="fixed top-0 left-0 w-full p-6 z-50">
             <div className="max-w-xl mx-auto flex gap-2">
                {[1,2,3].map(i => (
                   <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-500 ${i <= step ? 'bg-primary-500 shadow-[0_0_10px_#8B5CF6]' : 'bg-white/10'}`}></div>
                ))}
             </div>
          </div>
       )}

       <div className="w-full h-full overflow-y-auto flex items-center justify-center p-6">
          {renderStep()}
       </div>
    </div>
  );
};