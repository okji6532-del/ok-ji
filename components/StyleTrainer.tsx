import React, { useRef, useState } from 'react';
import { extractStyleFromReferences } from '../services/geminiService';
import { ActionButton } from './ActionButton';

interface StyleTrainerProps {
  onStyleLearned: (styleDescription: string) => void;
  disabled?: boolean;
}

export const StyleTrainer: React.FC<StyleTrainerProps> = ({ onStyleLearned, disabled }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  
  // YouTube Import State
  const [ytUrl, setYtUrl] = useState('');
  const [loadingYt, setLoadingYt] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (files.length + images.length > 5) {
      alert("Maximum 5 reference images allowed.");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
        setIsTrained(false); // Reset training if new images added
      };
      reader.readAsDataURL(file as Blob);
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fetchWithFallback = async (targetUrl: string): Promise<Blob> => {
    // List of proxies to try in order
    const proxies = [
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
    ];

    for (const proxyGenerator of proxies) {
        try {
            const res = await fetch(proxyGenerator(targetUrl));
            if (res.ok) return await res.blob();
        } catch (e) {
            console.warn("Proxy attempt failed, trying next...");
        }
    }
    throw new Error("Unable to fetch image. Please check your internet connection or try a different video.");
  };

  const handleYoutubeFetch = async () => {
    if (!ytUrl.trim()) return;
    if (images.length >= 5) {
        alert("Maximum 5 reference images allowed.");
        return;
    }
    
    setLoadingYt(true);
    try {
        // Extract Video ID
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = ytUrl.match(regExp);
        const videoId = (match && match[7].length === 11) ? match[7] : false;

        if (!videoId) throw new Error("Invalid YouTube URL");

        // Use maxresdefault for best quality, fallback to hqdefault if needed logic could be added here
        const targetUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        const blob = await fetchWithFallback(targetUrl);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImages(prev => [...prev, reader.result as string]);
            setIsTrained(false);
            setYtUrl('');
        };
        reader.readAsDataURL(blob);
    } catch (error: any) {
        alert(error.message || "Could not load YouTube thumbnail. Please check the URL.");
        console.error(error);
    } finally {
        setLoadingYt(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setIsTrained(false);
  };

  const handleTrain = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    try {
      const styleDesc = await extractStyleFromReferences(images);
      onStyleLearned(styleDesc);
      setIsTrained(true);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze style.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl mb-6 border border-primary-500/20 bg-primary-900/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-primary-400">psychology</span>
            <label className="block text-sm font-bold text-white">
            Style Training
            </label>
        </div>
        {isTrained && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">Active</span>}
      </div>
      
      <p className="text-xs text-slate-400 mb-3">
        Import thumbnails from creators like MrBeast or PewDiePie. The AI will learn their exact visual formula.
      </p>

      {/* Image Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
            <img src={img} alt="Ref" className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <span className="material-symbols-rounded text-white text-sm">close</span>
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isAnalyzing}
            className="aspect-square rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Upload Image File"
          >
            <span className="material-symbols-rounded text-slate-400">add</span>
          </button>
        )}
      </div>
      
      {/* YouTube Import Input */}
      {images.length < 5 && (
        <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleYoutubeFetch()}
                    placeholder="Paste YouTube Video URL to analyze..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-500/50 transition-colors"
                    disabled={loadingYt || disabled}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     <span className="material-symbols-rounded text-slate-600 text-sm">link</span>
                </div>
            </div>
            <button
                onClick={handleYoutubeFetch}
                disabled={!ytUrl || loadingYt || disabled}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg px-3 flex items-center justify-center transition-all disabled:opacity-50"
                title="Import from YouTube"
            >
                {loadingYt ? (
                    <span className="material-symbols-rounded text-sm animate-spin">progress_activity</span>
                ) : (
                    <span className="material-symbols-rounded text-sm">download</span>
                )}
            </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {images.length > 0 && !isTrained && (
        <ActionButton
          onClick={handleTrain}
          isLoading={isAnalyzing}
          disabled={disabled}
          variant="secondary"
          className="w-full py-2 text-xs !bg-primary-600/20 !border-primary-500/30 hover:!bg-primary-600/30"
          icon="model_training"
        >
          {isAnalyzing ? "Analyzing Visual DNA..." : "Train AI on Style"}
        </ActionButton>
      )}
      
      {isTrained && (
          <div className="text-center">
             <p className="text-[10px] text-green-400 font-mono flex items-center justify-center gap-1">
                <span className="material-symbols-rounded text-sm">check_circle</span>
                Style profile loaded
             </p>
          </div>
      )}
    </div>
  );
};