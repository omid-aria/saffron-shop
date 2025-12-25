
import React, { useState, useEffect } from 'react';
import { PriceItem } from '../types';

interface PriceBoardProps {
  prices: PriceItem[];
  isEditing: boolean;
  onUpdate: (newPrices: PriceItem[]) => void;
  phone?: string;
  address?: string;
}

export const PriceBoard: React.FC<PriceBoardProps> = ({ prices, isEditing, onUpdate, phone, address }) => {
  const [dateStr, setDateStr] = useState('');

  const toAfghanMonth = (dateString: string) => {
    const monthsMapping: { [key: string]: string } = {
      "فروردین": "حمل", "اردیبهشت": "ثور", "خرداد": "جوزا", "تیر": "سرطان",
      "مرداد": "اسد", "شهریور": "سنبله", "مهر": "میزان", "آبان": "عقرب",
      "آذر": "قوس", "دی": "جدی", "بهمن": "دلو", "اسفند": "حوت"
    };
    let newString = dateString;
    Object.keys(monthsMapping).forEach(iranianMonth => {
      if (dateString.includes(iranianMonth)) {
        newString = dateString.replace(iranianMonth, monthsMapping[iranianMonth]);
      }
    });
    return newString;
  };

  useEffect(() => {
    const isAfghanContext = () => {
      if (phone) {
        const cleanPhone = phone.replace(/\s/g, '').replace(/-/g, '');
        if (cleanPhone.startsWith('+93') || cleanPhone.startsWith('0093')) return true;
      }
      if (address) {
        const keywords = ['افغانستان', 'afghanistan', 'هرات', 'herat', 'کابل', 'kabul', 'مزار', 'mazar', 'قندهار', 'kandahar'];
        const lowerAddress = address.toLowerCase();
        if (keywords.some(k => lowerAddress.includes(k))) return true;
      }
      return false;
    };

    const updateDate = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        let formattedDate = formatter.format(now);
        if (isAfghanContext()) formattedDate = toAfghanMonth(formattedDate);
        setDateStr(formattedDate);
      } catch (e) {
        setDateStr("تاریخ نامشخص");
      }
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, [phone, address]);

  if (!isEditing && (!prices || prices.length === 0)) {
    return null;
  }

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();
    const newItem: PriceItem = {
      id: `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      label: 'نوع محصول',
      value: 'قیمت'
    };
    onUpdate([...(prices || []), newItem]);
  };

  const handleRemoveItem = (idToRemove: string) => {
    // بستن کیبورد موبایل برای جلوگیری از اختلال در استیت
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // فیلتر کردن بر اساس ID که دقیق‌ترین روش است
    const newPrices = (prices || []).filter(item => item.id !== idToRemove);
    onUpdate(newPrices);
  };

  const handleChange = (id: string, field: keyof PriceItem, value: string) => {
    const newPrices = (prices || []).map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdate(newPrices);
  };

  return (
    <div className="w-full px-1 mb-6 animate-fadeIn">
      <div className="relative w-full bg-gradient-to-b from-black/60 to-secondary/40 border border-primary/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 px-4 py-3 border-b border-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <h3 className="text-primary font-bold text-sm tracking-wide">نرخ روز زعفران</h3>
          </div>
          <div className="bg-black/40 px-2 py-1 rounded-lg border border-primary/10 text-[10px] text-gold-light font-bold">
            <span dir="rtl">{dateStr}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {(prices || []).map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 p-2 rounded-xl transition-all ${isEditing ? 'bg-white/5 border border-white/10 shadow-lg' : 'border-b border-dashed border-white/10 last:border-0'}`}
            >
              {isEditing ? (
                <>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    className="w-11 h-11 shrink-0 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all border border-red-400/20"
                  >
                    <i className="fas fa-trash-alt text-lg"></i>
                  </button>
                  
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleChange(item.id, 'label', e.target.value)}
                      className="w-full bg-black/40 border border-primary/20 rounded-lg text-white text-right text-xs py-2 px-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="نام محصول"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => handleChange(item.id, 'value', e.target.value)}
                      className="w-full bg-black/40 border border-primary/20 rounded-lg text-gold-light text-left font-mono text-sm py-2 px-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="قیمت"
                    />
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center w-full px-1 py-1">
                  <span className="text-gray-200 text-sm font-medium">{item.label}</span>
                  <span className="text-gold-light font-bold font-mono text-lg tracking-wider drop-shadow-md">
                    {item.value}
                  </span>
                </div>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-4 mt-2 border-2 border-dashed border-primary/40 rounded-2xl text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-plus-circle text-lg"></i>
              افزودن ردیف جدید
            </button>
          )}

          {(!prices || prices.length === 0) && isEditing && (
             <p className="text-center text-white/30 text-xs py-8 italic border border-dashed border-white/10 rounded-xl">لیستی برای نمایش وجود ندارد.</p>
          )}
        </div>
      </div>
    </div>
  );
};
