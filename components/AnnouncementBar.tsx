import React, { useState } from 'react';

interface AnnouncementBarProps {
  text: string;
  isEditing: boolean;
  onUpdate: (val: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ text, isEditing, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(true);

  // اگر کاربر بستش و در حالت ویرایش نیستیم، نشان نده
  if (!isVisible && !isEditing) return null;

  // اگر متن خالی است و در حالت ویرایش نیستیم، نشان نده
  if (!text && !isEditing) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    // Container: Absolutely positioned, Centered horizontally, Top spaced
    // Changed top-2 to top-1 to move it even higher
    // Increased z-index to z-[60] to sit above sticky headers
    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-[60] w-[85%] max-w-[280px] animate-slideDown">
      
      {isEditing ? (
        // --- حالت ویرایش ---
        <div className="w-full bg-black/80 border border-primary/50 rounded-2xl p-3 backdrop-blur-xl shadow-2xl">
           <div className="flex items-center justify-center gap-2 mb-2">
             <i className="fas fa-edit text-primary animate-pulse"></i>
             <label className="text-[10px] text-white font-bold">
               ویرایش متن نوار اعلان
             </label>
           </div>
           
           <input
             type="text"
             value={text || ''}
             onChange={(e) => onUpdate(e.target.value)}
             className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary text-center placeholder-white/30 transition-all font-medium"
             placeholder="متن خود را بنویسید..."
             dir="rtl"
           />
        </div>
      ) : (
        // --- حالت نمایش (کپسول شیشه‌ای فشرده) ---
        <div 
          className="relative w-full h-10 bg-black/40 backdrop-blur-md border border-gold-light/30 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center overflow-hidden group"
        >
          {/* آیکون زنگ (ثابت در راست) */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary to-gold-dark rounded-full shadow-lg z-20 border border-white/10">
             <i className="fas fa-bell text-black text-xs animate-swing"></i>
          </div>

          {/* فضای انیمیشن متن */}
          {/* mr-10 برای اینکه متن زیر دکمه زنگ نرود */}
          {/* ml-8 برای اینکه متن زیر دکمه بستن نرود */}
          <div className="flex-1 h-full relative overflow-hidden mr-10 ml-8 mask-fade-sides">
             <div className="absolute top-0 bottom-0 flex items-center whitespace-nowrap animate-street-ticker">
               <span className="text-white text-xs font-bold tracking-wide drop-shadow-md px-1">
                 {text}
               </span>
             </div>
          </div>
          
          {/* دکمه بستن (ثابت در چپ) */}
          <button 
            onClick={handleDismiss}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 rounded-full transition-all z-20 active:scale-90"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      )}
      
      <style>{`
        /* انیمیشن تابلوی خیابانی: ورود از چپ (خارج کادر) و خروج از راست */
        @keyframes street-ticker {
           0% { transform: translateX(-150%); } /* شروع از بیرون سمت چپ */
           100% { transform: translateX(280px); } /* خروج کامل از سمت راست */
        }
        
        .animate-street-ticker {
            animation: street-ticker 10s linear infinite;
            /* جهت را LTR می‌کنیم تا محاسبات transform دقیق باشد */
            direction: ltr; 
            will-change: transform;
        }

        .animate-swing {
          animation: swing 3s ease-in-out infinite;
          transform-origin: top center;
        }
        
        @keyframes swing {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }

        .mask-fade-sides {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};