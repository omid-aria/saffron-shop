import React, { useState } from 'react';
import { SocialLinksData } from '../types';

interface SocialLinksProps {
  links: SocialLinksData;
  isEditing: boolean;
  onUpdate: (key: keyof SocialLinksData, value: string) => void;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ links, isEditing, onUpdate }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleLinkClick = (key: string) => {
    // فعال کردن انیمیشن
    setActiveKey(key);
    
    // بازگشت به حالت عادی بعد از 2 ثانیه
    // این باعث می‌شود وقتی کاربر از واتس‌اپ/اینستاگرام برمی‌گردد، آیکون گیر نکرده باشد
    setTimeout(() => {
      setActiveKey(null);
    }, 2000);
  };

  const socialItems = [
    { 
      key: 'whatsapp' as const, 
      icon: "fab fa-whatsapp", 
      url: links.whatsapp, 
      color: "md:hover:bg-green-500", 
      activeColor: "bg-green-600 border-green-400",
      placeholder: "شماره با کد کشور (مثال: 0098...)" 
    },
    { 
      key: 'instagram' as const, 
      icon: "fab fa-instagram", 
      url: links.instagram, 
      color: "md:hover:bg-pink-600", 
      activeColor: "bg-pink-700 border-pink-400",
      placeholder: "آیدی (@username) یا لینک" 
    },
    { 
      key: 'telegram' as const, 
      icon: "fab fa-telegram-plane", 
      url: links.telegram, 
      color: "md:hover:bg-blue-500", 
      activeColor: "bg-blue-600 border-blue-400",
      placeholder: "آیدی (@username) یا لینک" 
    },
    { 
      key: 'facebook' as const, 
      icon: "fab fa-facebook-f", 
      url: links.facebook, 
      color: "md:hover:bg-blue-700", 
      activeColor: "bg-blue-800 border-blue-400",
      placeholder: "آیدی فیسبوک یا لینک" 
    },
  ];

  // Helper function to generate correct URLs based on input type
  const getSocialLink = (key: string, value: string) => {
    if (!value) return '#';
    let cleanValue = value.trim();

    if (cleanValue.match(/^https?:\/\//)) {
      return cleanValue;
    }

    const isDomain = 
      (key === 'instagram' && cleanValue.includes('instagram.com')) ||
      (key === 'telegram' && (cleanValue.includes('t.me') || cleanValue.includes('telegram.me'))) ||
      (key === 'facebook' && (cleanValue.includes('facebook.com') || cleanValue.includes('fb.com'))) ||
      (key === 'whatsapp' && cleanValue.includes('wa.me'));

    if (isDomain) {
      return `https://${cleanValue}`;
    }

    switch (key) {
      case 'whatsapp':
        let phone = cleanValue.replace(/[^\d]/g, '');
        if (phone.startsWith('00')) {
          phone = phone.substring(2);
        }
        return `https://wa.me/${phone}`;

      case 'instagram':
        cleanValue = cleanValue.replace(/^@/, '').replace(/\/$/, '');
        return `https://instagram.com/${cleanValue}`;

      case 'telegram':
        cleanValue = cleanValue.replace(/^@/, '').replace(/\/$/, '');
        return `https://t.me/${cleanValue}`;

      case 'facebook':
        cleanValue = cleanValue.replace(/\/$/, '');
        return `https://facebook.com/${cleanValue}`;

      default:
        return `https://${cleanValue}`;
    }
  };

  if (isEditing) {
    return (
      <div className="w-full flex flex-col gap-3 py-4 px-1">
        <h4 className="text-primary text-sm font-bold text-right px-2">شبکه‌های اجتماعی</h4>
        {socialItems.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-full border border-primary/50 flex items-center justify-center text-white bg-black/40 shrink-0">
               <i className={`${item.icon} text-lg`}></i>
             </div>
             <input
               type="text"
               value={item.url}
               onChange={(e) => onUpdate(item.key, e.target.value)}
               className="flex-1 bg-white/10 border border-primary/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left ltr placeholder-gray-500"
               placeholder={item.placeholder}
             />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center gap-6 py-4">
      {socialItems.map((item, index) => {
        if (!item.url || item.url === '#' || item.url.trim() === '') return null;
        
        const isActive = activeKey === item.key;
        
        return (
          <a 
            key={index}
            href={getSocialLink(item.key, item.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(item.key)}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-white bg-black/40 md:hover:text-white transition-all duration-300 shadow-lg shadow-gold-glow
              ${isActive 
                ? `animate-breathing z-10 ${item.activeColor} scale-110` 
                : `border-primary transform md:hover:-translate-y-1 ${item.color}`
              }
            `}
          >
            <i className={`${item.icon} text-xl`}></i>
          </a>
        );
      })}
    </div>
  );
};