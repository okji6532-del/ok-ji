import React, { useRef } from 'react';

interface FaceUploaderProps {
  selectedImage: string | null;
  onImageSelect: (base64: string | null) => void;
  disabled?: boolean;
}

export const FaceUploader: React.FC<FaceUploaderProps> = ({
  selectedImage,
  onImageSelect,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full pt-4 border-t border-white/10 mt-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-slate-300">
          Face Swap <span className="text-xs text-primary-400 font-normal ml-1">Beta</span>
        </label>
        <div className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
          Identity Transfer
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {!selectedImage ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={`w-full h-16 border border-dashed rounded-xl flex items-center justify-center gap-3 transition-all duration-200 group
            ${disabled 
              ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed' 
              : 'border-slate-600 bg-white/5 hover:bg-white/10 hover:border-primary-400/50 cursor-pointer'
            }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${disabled ? 'bg-slate-800' : 'bg-white/10 group-hover:bg-primary-500/20'}`}>
             <span className={`material-symbols-rounded text-lg ${disabled ? 'text-slate-600' : 'text-slate-300 group-hover:text-primary-400'}`}>switch_account</span>
          </div>
          <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">Upload Target Face</span>
        </button>
      ) : (
        <div className={`relative w-full p-3 rounded-xl border flex items-center gap-3 overflow-hidden transition-all duration-300
            ${disabled 
                ? 'bg-slate-900/80 border-slate-700 opacity-80' 
                : 'bg-gradient-to-r from-primary-900/30 to-cosmic-900/30 border-primary-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
            }`}>
          
          <div className={`w-10 h-10 rounded-full border-2 overflow-hidden flex-shrink-0 relative flex items-center justify-center 
              ${disabled ? 'border-slate-600 bg-slate-800' : 'border-primary-500 shadow-sm'}`}>
             <img src={selectedImage} alt="Face Target" className={`w-full h-full object-cover ${disabled ? 'grayscale opacity-50' : ''}`} />
             {disabled && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                     <span className="material-symbols-rounded text-white text-sm">lock</span>
                 </div>
             )}
          </div>
          
          <div className="flex-1 min-w-0">
             <p className={`text-sm font-bold truncate ${disabled ? 'text-slate-400' : 'text-white'}`}>
                {disabled ? 'Face Locked' : 'Face Active'}
             </p>
             <p className={`text-[10px] flex items-center gap-1 ${disabled ? 'text-slate-500' : 'text-primary-300'}`}>
                {disabled ? (
                   'Generation in progress...'
                ) : (
                   <>
                     <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                     Ready to swap
                   </>
                )}
             </p>
          </div>
          
          <button
            onClick={handleRemove}
            disabled={disabled}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${disabled 
                    ? 'text-slate-600 cursor-not-allowed bg-slate-800' 
                    : 'bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30'}`}
            title={disabled ? "Locked while generating" : "Remove face"}
          >
            <span className="material-symbols-rounded text-lg">
                {disabled ? 'lock' : 'close'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};