import React, { useState } from 'react';

interface YouTubeRecreatorProps {
  onThumbnailLoaded: (base64: string | null) => void;
  disabled?: boolean;
}

export const YouTubeRecreator: React.FC<YouTubeRecreatorProps> = ({ onThumbnailLoaded, disabled }) => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'LOADED' | 'ERROR'>('IDLE');
  const [preview, setPreview] = useState<string | null>(null);

  const fetchWithFallback = async (targetUrl: string): Promise<Blob> => {
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
    throw new Error("Unable to fetch image. Please check URL or network.");
  };

  const handleLoad = async () => {
    if (!url) return;
    setStatus('LOADING');
    
    // Extract Video ID
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : false;

    if (!videoId) {
      setStatus('ERROR');
      return;
    }

    try {
      const targetUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const blob = await fetchWithFallback(targetUrl);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onThumbnailLoaded(base64);
        setStatus('LOADED');
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
    }
  };

  const handleClear = () => {
    setUrl('');
    setPreview(null);
    setStatus('IDLE');
    onThumbnailLoaded(null);
  };

  return (
    <div className="rounded-2xl mb-2 border border-white/10 bg-black/20 p-5 relative overflow-hidden transition-all duration-300">
      
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-rounded text-red-500">smart_display</span>
        <label className="block text-xs font-bold text-white uppercase tracking-wider">
          YouTube Source
        </label>
      </div>
      
      {status === 'LOADED' && preview ? (
         <div className="relative rounded-lg overflow-hidden border border-primary-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)] animate-fade-in group">
            <img src={preview} alt="YT Source" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-3">
                 <p className="text-xs text-primary-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Ready for Recreation
                 </p>
            </div>
            <button 
                onClick={handleClear}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500/80 transition-colors border border-white/10 backdrop-blur-sm"
            >
                <span className="material-symbols-rounded text-sm block">close</span>
            </button>
         </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Paste YouTube URL..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (status === 'ERROR') setStatus('IDLE');
                }}
                className={`w-full bg-black/30 border rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-colors
                  ${status === 'ERROR' ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary-500/50'}
                `}
                disabled={disabled || status === 'LOADING'}
              />
              {status === 'ERROR' && (
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-sm text-red-500">error</span>
              )}
            </div>
            <button
              onClick={handleLoad}
              disabled={!url || disabled || status === 'LOADING'}
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl px-4 transition-all disabled:opacity-50"
            >
              {status === 'LOADING' ? (
                <span className="material-symbols-rounded text-xl animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-rounded text-xl">download</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};