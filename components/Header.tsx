
import React, { useRef } from 'react';
import { BusinessData } from '../types';

interface HeaderProps {
  name: string;
  tagline: string;
  logo?: string;
  isEditing: boolean;
  onUpdate: (field: keyof BusinessData, value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ name, tagline, logo, isEditing, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("حجم تصویر زیاد است. لطفا تصویری با حجم کمتر از ۲ مگابایت انتخاب کنید.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleDeleteLogo = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdate('logo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasLogo = !!(logo && logo.trim() !== "");

  return (
    <>
      <div className="relative group">
        {/* Static Background Glow */}
        <div 
          className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-50" 
        ></div>
        
        {/* Fixed Outer Circle */}
        <div 
          className={`relative w-32 h-32 rounded-full border-[3px] border-primary p-1 bg-secondary shadow-xl flex items-center justify-center overflow-hidden transition-all duration-500 ${isEditing ? 'scale-105' : ''}`}
        >
          {/* Inner Animated Container (Brightness/Glow) */}
          <div className={`w-full h-full rounded-full bg-black flex flex-col items-center justify-center overflow-hidden relative ${!isEditing ? 'animate-breathing' : ''}`}>
            {hasLogo ? (
              <img 
                src={logo} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center animate-fadeIn">
                <i className="fas fa-spa text-primary text-4xl mb-1"></i>
                <span className="text-primary text-[10px] tracking-widest font-light">SAFFRON SHOP</span>
              </div>
            )}

            {isEditing && (
              <div className="absolute inset-0 flex flex-col z-[80] animate-fadeIn rounded-full overflow-hidden">
                {hasLogo ? (
                  <>
                    <button 
                      type="button"
                      onClick={triggerFileInput}
                      className="flex-[1.5] w-full bg-black/60 backdrop-blur-sm hover:bg-black/70 flex flex-col items-center justify-center transition-all group/cam"
                    >
                      <i className="fas fa-camera text-white/90 group-hover/cam:scale-110 transition-all text-xl mt-2"></i>
                      <span className="text-[10px] text-white/80 mt-1 font-bold">تغییر عکس</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={handleDeleteLogo}
                      className="h-12 w-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center border-t border-white/20 transition-all group/del z-[100]"
                    >
                      <div className="flex flex-col items-center">
                        <i className="fas fa-trash-alt text-sm"></i>
                        <span className="text-[8px] mt-0.5 font-bold">حذف لوگو</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-black/60 backdrop-blur-sm hover:bg-black/40 transition-all group/upload"
                  >
                    <i className="fas fa-cloud-upload-alt text-white/90 group-hover/upload:text-primary text-3xl mb-1 transition-all group-hover/upload:scale-110"></i>
                    <span className="text-white/90 group-hover/upload:text-primary text-[10px] font-black tracking-widest">انتخاب لوگو</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />
      </div>
      
      <div className="text-center space-y-2 w-full z-10">
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full px-8">
            <input
              type="text"
              value={name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="w-full bg-white/10 border border-primary/50 rounded-lg px-3 py-2 text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary placeholder-white/30"
              placeholder="نام فروشگاه"
            />
            <input
              type="text"
              value={tagline}
              onChange={(e) => onUpdate('tagline', e.target.value)}
              className="w-full bg-white/10 border border-primary/50 rounded-lg px-3 py-2 text-gray-200 text-sm text-center font-light focus:outline-none focus:ring-2 focus:ring-primary placeholder-white/30"
              placeholder="توضیحات کوتاه"
            />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-primary drop-shadow-lg">{name}</h1>
            <p className="text-gray-300 text-sm font-light tracking-wide">{tagline}</p>
          </>
        )}
      </div>
    </>
  );
};
