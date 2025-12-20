
import React, { useState, useEffect } from 'react';
import { WheelPrize } from '../types';

interface LuckyWheelProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: WheelPrize[];
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({ isOpen, onClose, prizes }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const activePrizes = prizes && prizes.length > 0 ? prizes : [
    { text: '۵٪ تخفیف', color: '#4a1c40', textColor: '#D4AF37' },
    { text: 'ارسال رایگان', color: '#D4AF37', textColor: '#2e102d' },
    { text: '۱ گرم زعفران', color: '#2e102d', textColor: '#D4AF37' },
    { text: 'شانس مجدد', color: '#D4AF37', textColor: '#2e102d' },
    { text: '۱۰٪ تخفیف', color: '#4a1c40', textColor: '#ffffff' },
    { text: 'پک هدیه', color: '#D4AF37', textColor: '#2e102d' },
  ];

  const numSegments = activePrizes.length;
  const segmentAngle = 360 / numSegments;

  useEffect(() => {
    const lastSpin = localStorage.getItem('saffron_last_spin');
    if (lastSpin) {
      const lastSpinDate = new Date(parseInt(lastSpin));
      const today = new Date();
      if (lastSpinDate.toDateString() === today.toDateString()) {
        setHasSpun(true);
      }
    }
  }, [isOpen]);

  const spinWheel = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setResult(null);

    // چرخش استاندارد: حداقل ۸ دور کامل + زاویه تصادفی
    // استفاده از یک عدد بزرگ برای اطمینان از چرخش ساعت‌گرد روان
    const randomExtra = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * 8) + randomExtra;
    
    setRotation(newRotation);

    // زمان چرخش استاندارد ۵ ثانیه با فیزیک سنگین
    setTimeout(() => {
      setIsSpinning(false);
      
      // محاسبه دقیق برنده:
      // چون عقربه در بالا (زاویه ۰) است، باید ببینیم چه زاویه‌ای از دایره در موقعیت ۰ قرار گرفته
      const finalAngle = newRotation % 360;
      // زاویه معکوس برای پیدا کردن ایندکس سگمنت زیر عقربه
      const prizeIndex = Math.floor((360 - finalAngle) / segmentAngle) % numSegments;
      const winner = activePrizes[prizeIndex].text;
      
      setResult(winner);
      
      if (winner.trim() === 'شانس مجدد') {
        setHasSpun(false);
      } else {
        setHasSpun(true);
        localStorage.setItem('saffron_last_spin', Date.now().toString());
      }
    }, 5000);
  };

  if (!isOpen) return null;

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="bg-gradient-to-b from-[#2e102d] to-black border border-primary/20 p-8 rounded-[50px] w-full max-w-sm relative flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(212,175,55,0.15)]" onClick={(e) => e.stopPropagation()}>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-white/20 hover:text-white transition-all active:scale-90"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>

        <div className="text-center space-y-1">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-[11px] text-primary font-black mb-1 shadow-inner">هدیه خاص</div>
          <h2 className="text-primary font-extrabold text-2xl drop-shadow-lg">گردونه شانس زعفرانی</h2>
          <p className="text-white/40 text-[10px] max-w-[220px] mx-auto leading-relaxed">با هر بار چرخاندن، شانس خود را برای دریافت جوایز ویژه امتحان کنید!</p>
        </div>

        <div className="relative w-72 h-72 my-4 select-none">
          
          {/* Pointer Indicator */}
          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 z-50 text-primary drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] ${isSpinning ? 'animate-wiggle' : ''}`}>
            <svg width="45" height="45" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 40L35 10H5L20 40Z" fill="url(#pointerGradient)" stroke="#000" strokeWidth="1" />
              <defs>
                <linearGradient id="pointerGradient" x1="20" y1="10" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E5C564" />
                  <stop offset="1" stopColor="#B89426" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* The Wheel */}
          <div 
            className="w-full h-full shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-full relative"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.1, 0, 0, 1)' : 'none'
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
              {/* Outer Decorative Pins */}
              {Array.from({ length: 12 }).map((_, i) => (
                <circle 
                  key={i} 
                  cx={100 + 96 * Math.cos((i * 30 * Math.PI) / 180)} 
                  cy={100 + 96 * Math.sin((i * 30 * Math.PI) / 180)} 
                  r="2" 
                  fill="#D4AF37" 
                />
              ))}

              <circle cx="100" cy="100" r="98" fill="none" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.3" />
              
              {activePrizes.map((prize, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = (i + 1) * segmentAngle;
                const textAngle = startAngle + (segmentAngle / 2);
                
                return (
                  <g key={i}>
                    <path 
                      d={describeArc(100, 100, 95, startAngle, endAngle)} 
                      fill={prize.color}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth="0.5"
                    />
                    <g transform={`rotate(${textAngle}, 100, 100)`}>
                      <text 
                        x="100" 
                        y="45" 
                        fill={prize.textColor} 
                        textAnchor="middle" 
                        fontSize="8.5" 
                        fontWeight="900" 
                        fontFamily="Vazirmatn"
                        style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}
                      >
                        {prize.text}
                      </text>
                    </g>
                  </g>
                );
              })}

              <circle cx="100" cy="100" r="95" fill="none" stroke="#D4AF37" strokeWidth="3" strokeOpacity="0.8" />
              <circle cx="100" cy="100" r="28" fill="#2e102d" stroke="#D4AF37" strokeWidth="2" />
              <circle cx="100" cy="100" r="22" fill="url(#centerGradient)" />
              
              <defs>
                <linearGradient id="centerGradient" x1="100" y1="78" x2="100" y2="122" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E5C564" />
                  <stop offset="1" stopColor="#B89426" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <button 
            onClick={spinWheel}
            disabled={isSpinning || hasSpun}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full z-50 transition-all flex items-center justify-center group active:scale-90
              ${isSpinning || (hasSpun && result !== 'شانس مجدد') ? 'opacity-0 pointer-events-none' : 'hover:scale-105'}
            `}
          >
            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center border-2 border-white/20 shadow-[0_0_20px_rgba(212,175,55,0.6)]">
              <span className="text-secondary font-black text-[11px] animate-pulse">بچرخون!</span>
            </div>
          </button>
        </div>

        <div className="h-20 flex flex-col items-center justify-center w-full">
          {isSpinning && (
            <div className="flex flex-col items-center gap-2 animate-pulse">
               <div className="flex gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"></span>
                 <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                 <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
               </div>
               <span className="text-primary/70 text-[10px] font-bold tracking-widest">در حال تعیین شانس شما...</span>
            </div>
          )}
          
          {result && !isSpinning && (
            <div className="animate-slideInUp flex flex-col items-center text-center">
              <span className="text-white/40 text-[10px] mb-2 font-medium">
                {result.trim() === 'شانس مجدد' ? '🔄 اوپس! شانس دوباره:' : '✨ تبریک! شانس با شما یار بود:'}
              </span>
              <div className="bg-primary/20 border border-primary/50 px-8 py-3 rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                <span className="text-primary font-black text-2xl tracking-wide drop-shadow-md">
                  {result}
                </span>
              </div>
              <p className="text-[9px] text-white/30 mt-4 font-light leading-relaxed">
                 {result.trim() === 'شانس مجدد' 
                   ? 'یک بار دیگر گردونه را بچرخانید!' 
                   : 'جهت دریافت جایزه، لطفاً از این صفحه اسکرین‌شات بگیرید.'}
              </p>
            </div>
          )}
          
          {hasSpun && !result && !isSpinning && (
             <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-center max-w-[240px] shadow-lg">
               <span className="text-white/40 text-[11px] italic leading-relaxed block">
                 شما شانس امروز خود را استفاده کرده‌اید. فردا دوباره منتظر شما هستیم!
               </span>
             </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-50%) rotate(-5deg); }
          75% { transform: translateX(-50%) rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
