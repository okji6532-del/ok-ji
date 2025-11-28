import React, { useState, useCallback, useEffect } from 'react';
import { DEFAULT_ASPECT_RATIO } from '../constants';
import { AspectRatio, GeneratedImage, AppState, NicheType } from '../types';
import { generateThumbnailImage, editThumbnailImage } from '../services/geminiService';
import { AspectRatioSelector } from './AspectRatioSelector';
import { ThumbnailDisplay } from './ThumbnailDisplay';
import { FaceUploader } from './FaceUploader';
import { NicheSelector } from './NicheSelector';
import { StyleTrainer } from './StyleTrainer';

const STORAGE_KEY = 'snapgenius_history_v1';
const AD_CLICK_KEY = 'snapgenius_ad_clicks';
const AD_LINK = "https://www.effectivegatecpm.com/wst4smng?key=7d57326940b191b5dc5aad419f7e12e6";

type TabMode = 'PROMPT' | 'EDIT';
type ExpandedSetting = 'NONE' | 'FACE' | 'STYLE' | 'RATIO';

export const MainInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [selectedNiche, setSelectedNiche] = useState<NicheType>('NONE');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  
  // New State for Style Training
  const [learnedStyle, setLearnedStyle] = useState<string | undefined>(undefined);
  
  // UI States
  const [activeTab, setActiveTab] = useState<TabMode>('PROMPT');
  const [expandedSetting, setExpandedSetting] = useState<ExpandedSetting>('NONE');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // History State Management
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to load history from local storage", e);
      return [];
    }
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed.length - 1 : -1;
    } catch {
      return -1;
    }
  });
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const isWorking = appState === AppState.GENERATING || appState === AppState.EDITING;
  const currentImage = (currentIndex >= 0 && currentIndex < history.length) ? history[currentIndex] : null;
  const canUndo = currentIndex > 0 && !isWorking;
  const canRedo = currentIndex < history.length - 1 && !isWorking;

  // Persist history
  useEffect(() => {
    const saveToStorage = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          const trimmedHistory = [...history];
          while (trimmedHistory.length > 0) {
            trimmedHistory.shift(); 
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
              return;
            } catch (retryError) {
              continue; 
            }
          }
        }
      }
    };
    const timeoutId = setTimeout(saveToStorage, 800);
    return () => clearTimeout(timeoutId);
  }, [history]);

  // Handle Tab Switch
  const handleTabChange = (mode: TabMode) => {
      setActiveTab(mode);
      setExpandedSetting('NONE');
  };

  const toggleSetting = (setting: ExpandedSetting) => {
      setExpandedSetting(prev => prev === setting ? 'NONE' : setting);
  };

  // Undo/Redo Handlers
  const handleUndo = useCallback(() => {
    if (canUndo) setCurrentIndex(prev => prev - 1);
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) setCurrentIndex(prev => prev + 1);
  }, [canRedo]);

  // History Management
  const handleLoadHistory = (index: number) => {
    setCurrentIndex(index);
    setIsHistoryOpen(false);
  };

  const handleDeleteHistory = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    
    // Adjust current index
    if (index === currentIndex) {
        // If we deleted the current one, go to the previous one, or -1 if empty
        setCurrentIndex(Math.max(-1, index - 1));
    } else if (index < currentIndex) {
        // If we deleted one before the current one, shift current index down
        setCurrentIndex(currentIndex - 1);
    }
    // If we deleted one after, currentIndex stays same
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
        e.preventDefault();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        handleRedo();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Generation Logic
  const handleGenerate = useCallback(async () => {
    // --- AD LOGIC START ---
    try {
      const storedClicks = parseInt(localStorage.getItem(AD_CLICK_KEY) || '0', 10);
      const nextClickCount = storedClicks + 1;
      localStorage.setItem(AD_CLICK_KEY, nextClickCount.toString());

      if (nextClickCount === 1 || nextClickCount === 5) {
        window.open(AD_LINK, '_blank');
      }
    } catch (e) {
      console.warn("Ad logic blocked", e);
    }
    // --- AD LOGIC END ---

    const promptToUse = activeTab === 'EDIT' ? editPrompt : prompt;
    if (!promptToUse.trim()) return;

    if (activeTab === 'EDIT') {
        if (!currentImage) return;
        setAppState(AppState.EDITING);
        setError(null);
        try {
            // Pass faceImage as reference if available
            const newImageUrl = await editThumbnailImage(currentImage.url, promptToUse, faceImage);
            const newImage: GeneratedImage = {
                ...currentImage,
                id: crypto.randomUUID(),
                url: newImageUrl,
                prompt: currentImage.prompt + " + " + promptToUse,
                timestamp: Date.now(),
            };
            setHistory(prev => [...prev.slice(0, currentIndex + 1), newImage]);
            setCurrentIndex(prev => prev + 1);
            setEditPrompt('');
        } catch (err: any) {
            setError(err.message || "Failed to edit image.");
        } finally {
            setAppState(AppState.IDLE);
        }
    } else {
        // PROMPT
        setAppState(AppState.GENERATING);
        setError(null);
        try {
            const imageUrl = await generateThumbnailImage(
                prompt, 
                aspectRatio, 
                selectedNiche, 
                faceImage, 
                learnedStyle
            );
            const newImage: GeneratedImage = {
                id: crypto.randomUUID(),
                url: imageUrl,
                prompt: prompt,
                timestamp: Date.now(),
                aspectRatio: aspectRatio,
                niche: selectedNiche,
            };
            setHistory(prev => [...prev.slice(0, currentIndex + 1), newImage]);
            setCurrentIndex(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || "Failed to generate image.");
        } finally {
            setAppState(AppState.IDLE);
        }
    }
  }, [prompt, editPrompt, activeTab, aspectRatio, selectedNiche, faceImage, learnedStyle, currentImage, currentIndex]);


  return (
    <div className="min-h-screen pb-12 overflow-x-hidden">
      
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cosmic-950/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-6">
         <div className="flex items-center gap-2">
            <img 
               src="/logo.png" 
               alt="SnapGenius" 
               className="h-9 w-auto object-contain" 
               onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  document.getElementById('fallback-logo')?.classList.remove('hidden');
                  document.getElementById('fallback-logo')?.classList.add('flex');
               }}
            />
            {/* Hidden fallback in case image fails */}
            <div id="fallback-logo" className="hidden items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-magenta-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  <span className="material-symbols-rounded text-white text-xl">auto_fix</span>
               </div>
               <span className="text-lg font-bold font-display text-white">SnapGenius</span>
            </div>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 border border-white/5">PRO</span>
         </div>
         <div className="ml-auto flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Systems Operational
             </div>
         </div>
      </header>

      <main className="pt-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
          
          {/* LEFT COLUMN: CONTROL WIDGET */}
          <div className="lg:col-span-4 flex flex-col gap-4">
             
             {/* THE CREATION CARD */}
             <div className="glass-panel rounded-[2rem] p-1 flex flex-col relative group overflow-visible animate-slide-up" style={{animationDelay: '0.1s'}}>
                 {/* Top Glow */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50 blur-[2px]"></div>
                 
                 {/* Card Header & Tabs */}
                 <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-primary-400 font-bold font-display tracking-wide text-sm uppercase">Get Started</h2>
                    
                    {/* Mode Tabs */}
                    <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                       {(['PROMPT', 'EDIT'] as TabMode[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => handleTabChange(m)}
                            disabled={isWorking}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 tracking-wide ${
                                activeTab === m 
                                ? 'bg-white/10 text-white shadow-sm border border-white/10' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {m.charAt(0) + m.slice(1).toLowerCase()}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="p-6 pt-3 flex flex-col gap-0">
                    
                    {/* MAIN INPUT AREA WRAPPER */}
                    <div className="relative z-10">
                        <div className={`relative bg-black/40 rounded-3xl border border-white/10 transition-all duration-300 group-focus-within:border-primary-500/30 group-focus-within:shadow-[0_0_20px_rgba(249,115,22,0.1)] flex flex-col
                            ${activeTab === 'EDIT' && !currentImage ? 'opacity-50 pointer-events-none' : ''}
                        `}>
                            <div className="relative">
                                <textarea 
                                    value={activeTab === 'EDIT' ? editPrompt : prompt}
                                    onChange={(e) => activeTab === 'EDIT' ? setEditPrompt(e.target.value) : setPrompt(e.target.value)}
                                    placeholder={
                                        activeTab === 'EDIT' ? "What should we change? (e.g., 'Add neon lights', 'Swap face with reference')..." :
                                        "Describe your vision... (e.g., 'Cyberpunk city, flying cars')..."
                                    }
                                    className="w-full bg-transparent p-6 pb-24 min-h-[240px] text-base text-white placeholder-slate-600 outline-none resize-none font-medium leading-relaxed"
                                    disabled={isWorking}
                                />
                                
                                {/* Toolbar Buttons inside Input */}
                                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between pointer-events-none">
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        
                                        <button 
                                            onClick={() => toggleSetting('FACE')}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all
                                                ${expandedSetting === 'FACE' || faceImage ? 'bg-primary-500/20 border-primary-500/50 text-primary-300 shadow-lg shadow-primary-900/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                                            `}
                                        >
                                            <span className="material-symbols-rounded text-lg">face</span>
                                            {faceImage ? 'Active' : 'Personas'}
                                        </button>
                                        
                                        {activeTab !== 'EDIT' && (
                                            <button 
                                                onClick={() => toggleSetting('STYLE')}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all
                                                    ${expandedSetting === 'STYLE' || learnedStyle || selectedNiche !== 'NONE' ? 'bg-magenta-500/20 border-magenta-500/50 text-magenta-300 shadow-lg shadow-magenta-900/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                                                `}
                                            >
                                                <span className="material-symbols-rounded text-lg">palette</span>
                                                Styles
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => toggleSetting('RATIO')}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all
                                                ${expandedSetting === 'RATIO' ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-lg shadow-teal-900/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'}
                                            `}
                                        >
                                            <span className="material-symbols-rounded text-lg">aspect_ratio</span>
                                            Size
                                        </button>
                                    </div>

                                    {/* Generate Button integrated here - Icon Only */}
                                    <div className="pointer-events-auto pl-2">
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isWorking || (activeTab === 'EDIT' && !currentImage) || (!prompt && !editPrompt)}
                                            className="group flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-magenta-600 hover:from-primary-500 hover:to-magenta-500 text-white rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:shadow-none active:scale-95 border border-white/10"
                                            title="Generate"
                                        >
                                            <span className={`material-symbols-rounded text-3xl ${isWorking ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
                                                {isWorking ? 'progress_activity' : 'auto_awesome'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EXPANDED SETTINGS AREA */}
                    <div className={`space-y-4 transition-all duration-500 ease-in-out ${expandedSetting !== 'NONE' ? 'opacity-100 translate-y-0 mt-8' : 'opacity-0 -translate-y-4 hidden mt-0'}`}>
                        
                        {expandedSetting === 'FACE' && (
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 animate-fade-in">
                                <FaceUploader selectedImage={faceImage} onImageSelect={setFaceImage} disabled={isWorking} />
                            </div>
                        )}

                        {expandedSetting === 'STYLE' && activeTab !== 'EDIT' && (
                            <div className="space-y-4 animate-fade-in">
                                <StyleTrainer onStyleLearned={setLearnedStyle} disabled={isWorking} />
                                <NicheSelector selectedNiche={selectedNiche} onChange={setSelectedNiche} disabled={isWorking || !!learnedStyle} />
                            </div>
                        )}

                        {expandedSetting === 'RATIO' && (
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 animate-fade-in">
                                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} disabled={isWorking} />
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Disclaimer / Info */}
                 <div className="mt-auto p-6 pt-4 text-center">
                    <p className="text-[10px] text-slate-600 font-medium">
                        {history.length} assets generated this session. <br/>
                        AI-generated content may be inaccurate.
                    </p>
                 </div>
             </div>

          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className="lg:col-span-8 flex flex-col h-full animate-slide-up" style={{animationDelay: '0.2s'}}>
             <div className="glass-panel rounded-[2rem] flex-1 flex flex-col relative overflow-hidden border-white/10">
                
                {/* Preview Toolbar */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cosmic-900/80 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
                            <span className="material-symbols-rounded text-primary-400">image</span>
                        </div>
                        <div>
                           <h3 className="text-white font-bold text-sm shadow-black drop-shadow-md">Canvas Preview</h3>
                           <p className="text-[10px] text-slate-300 opacity-80">High Definition Output</p>
                        </div>
                    </div>

                    <div className="pointer-events-auto flex gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                        {history.length > 0 && (
                            <>
                                <button onClick={handleUndo} disabled={!canUndo} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30">
                                    <span className="material-symbols-rounded text-lg">undo</span>
                                </button>
                                <div className="flex items-center px-2 text-xs font-mono text-slate-500 border-x border-white/5">
                                    {currentIndex + 1}/{history.length}
                                </div>
                                <button onClick={handleRedo} disabled={!canRedo} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30">
                                    <span className="material-symbols-rounded text-lg">redo</span>
                                </button>
                                <div className="w-[1px] h-full bg-white/5 mx-1"></div>
                            </>
                        )}
                        <button 
                            onClick={() => setIsHistoryOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg text-primary-400 hover:text-primary-300 transition-colors"
                            title="History"
                        >
                            <span className="material-symbols-rounded text-lg">history</span>
                        </button>
                    </div>
                </div>
                
                {/* Error Notification */}
                {error && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-full backdrop-blur-md flex items-center gap-2 animate-fade-in shadow-xl">
                        <span className="material-symbols-rounded">error</span>
                        <span className="text-sm font-medium">{error}</span>
                        <button onClick={() => setError(null)} className="ml-2 hover:text-white"><span className="material-symbols-rounded text-sm">close</span></button>
                    </div>
                )}

                {/* Main Canvas Area */}
                <div className="flex-1 w-full h-full bg-cosmic-950/50 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-20" 
                        style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px'}}>
                    </div>
                    
                    <div className="w-full h-full p-4 md:p-12 pb-20 md:pb-12 flex items-center justify-center">
                        <ThumbnailDisplay 
                            image={currentImage} 
                            isLoading={isWorking} 
                            loadingLabel={appState === AppState.EDITING ? "Enhancing Details..." : "Synthesizing Artwork..."}
                            onDownload={() => {
                                if (!currentImage) return;
                                const link = document.createElement('a');
                                link.href = currentImage.url;
                                link.download = `snap-genius-${currentImage.id}.png`;
                                link.click();
                            }}
                        />
                    </div>
                </div>

             </div>
          </div>

        </div>

        {/* HISTORY SIDEBAR */}
        {isHistoryOpen && (
            <div className="fixed inset-0 z-[100] flex justify-end">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsHistoryOpen(false)}></div>
                
                {/* Sidebar Drawer */}
                <div className="relative w-full max-w-md h-full bg-cosmic-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col animate-slide-left">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                                <span className="material-symbols-rounded text-primary-400">history</span>
                            </div>
                            <h2 className="text-xl font-bold text-white font-display">History</h2>
                        </div>
                        <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                        {history.length === 0 ? (
                            <div className="text-center mt-20 opacity-50">
                                <span className="material-symbols-rounded text-6xl text-slate-600 mb-4">image_not_supported</span>
                                <p className="text-slate-400">No images generated yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {history.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer aspect-video
                                            ${index === currentIndex ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-white/10 hover:border-white/30'}
                                        `}
                                        onClick={() => handleLoadHistory(index)}
                                    >
                                        <img src={item.url} alt="History" className="w-full h-full object-cover" />
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm"
                                                title="Load"
                                            >
                                                <span className="material-symbols-rounded text-sm">visibility</span>
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteHistory(e, index)}
                                                className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-200 backdrop-blur-sm"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-rounded text-sm">delete</span>
                                            </button>
                                        </div>
                                        
                                        {/* Date Badge */}
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-slate-300 backdrop-blur-sm">
                                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 border-t border-white/5 text-center">
                        <button 
                            onClick={() => {
                                if(window.confirm('Clear all history? This cannot be undone.')) {
                                    setHistory([]);
                                    setCurrentIndex(-1);
                                }
                            }}
                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                            Clear All History
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};