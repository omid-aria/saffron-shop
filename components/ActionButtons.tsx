
import React, { useState } from 'react';
import { BusinessData } from '../types';

interface ActionButtonsProps {
  businessData: BusinessData;
  isEditing: boolean;
  onUpdate: (field: keyof BusinessData, value: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ businessData, isEditing, onUpdate }) => {
  const [showQR, setShowQR] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [isDownloading, setIsDownloading] = useState(false);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const getAbsoluteUrl = () => {
    if (typeof window === 'undefined') return '';
    const currentUrl = window.location.href;
    try {
      const url = new URL(currentUrl);
      if (!url.protocol.startsWith('http')) {
        return ''; 
      }
      url.searchParams.delete('edit');
      url.searchParams.delete('admin');
      url.searchParams.delete('token');
      return url.toString().replace(/\?$/, '');
    } catch (e) { 
      return currentUrl.startsWith('http') ? currentUrl : ''; 
    }
  };

  const targetUrl = (businessData.cardUrl && businessData.cardUrl.trim() !== "") 
    ? (businessData.cardUrl.startsWith('http') ? businessData.cardUrl : `https://${businessData.cardUrl}`)
    : getAbsoluteUrl();

  const handleShare = async () => {
    triggerHaptic();
    
    const shareTitle = businessData.name || 'کارت ویزیت دیجیتال';
    const shareText = `اطلاعات تماس و کارت ویزیت هوشمند: ${businessData.name}`;
    const shareUrl = targetUrl;

    if (navigator.share && shareUrl && shareUrl.startsWith('http')) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error("Share failed", err);
      }
    }

    try {
      const clipboardText = `${shareText}\n${shareUrl}`;
      await navigator.clipboard.writeText(clipboardText);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 3000); 
    } catch (err) {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const handleSaveContact = () => {
    triggerHaptic();
    const vcardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN;CHARSET=UTF-8:${businessData.name}`,
      `TEL;TYPE=CELL,VOICE:${businessData.phone}`,
      `URL:${targetUrl}`,
      `NOTE;CHARSET=UTF-8:Saffron Shop Card`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vcardContent], { type: 'text/x-vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contact_${businessData.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&margin=40&color=2e102d&bgcolor=ffffff&data=${encodeURIComponent(targetUrl || window.location.href)}`;

  const downloadQR = async () => {
    setIsDownloading(true);
    triggerHaptic();
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      
      qrImg.onload = () => {
        const qrSize = 1000;
        const padding = 100;
        const headerHeight = 220; 
        const footerHeight = 160; 
        
        canvas.width = qrSize + (padding * 2);
        canvas.height = qrSize + headerHeight + footerHeight;

        // Clean White Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- Shop Name ---
        ctx.fillStyle = '#4a1c40'; // Deep Saffron Purple
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 100px Vazirmatn, Tahoma, Arial';
        
        // Premium shadow
        ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        const shopName = businessData.name || 'فروشگاه زعفران';
        ctx.fillText(shopName, canvas.width / 2, headerHeight / 2 + 20);
        
        // Reset shadow for QR
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // --- Draw QR Code ---
        ctx.drawImage(qrImg, padding, headerHeight, qrSize, qrSize);

        // --- Footer Text ---
        ctx.fillStyle = '#666666'; // Subtle gray for footer
        ctx.font = 'bold 44px Vazirmatn, Tahoma, Arial';
        ctx.fillText('اسکن کنید تا به صفحه ما هدایت شوید', canvas.width / 2, canvas.height - (footerHeight / 2));

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `QR_${shopName.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
      };

      qrImg.onerror = () => {
        throw new Error("Failed to load QR image");
      };

      qrImg.src = qrUrl;

    } catch (error) {
      console.error("Download failed", error);
      setIsDownloading(false);
      window.open(qrUrl, '_blank');
    }
  };

  return (
    <div className={`w-full flex flex-col items-center gap-3 mb-2 animate-slideInUp relative ${showQR ? 'z-[200]' : 'z-10'}`}>
      <button 
        onClick={handleSaveContact}
        className="w-full bg-gradient-to-r from-gold-dark via-primary to-gold-dark text-black font-extrabold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <i className="fas fa-user-plus text-xl"></i>
        <span className="text-lg">ذخیره در مخاطبین</span>
      </button>

      <div className="w-full flex gap-3">
        <button 
          onClick={handleShare}
          className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg
            ${shareStatus === 'copied' ? 'bg-green-600 border-green-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          `}
        >
           <i className={`fas ${shareStatus === 'copied' ? 'fa-check' : 'fa-share-alt'} text-lg`}></i>
           <span className="text-sm font-medium">{shareStatus === 'copied' ? 'لینک کپی شد' : 'اشتراک‌گذاری'}</span>
        </button>

        <button 
           onClick={() => setShowQR(true)}
           className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
        >
           <i className="fas fa-qrcode text-lg"></i>
           <span className="text-sm font-medium">کیوآر کد</span>
        </button>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fadeIn" onClick={() => setShowQR(false)}>
          <div className="bg-white p-6 rounded-3xl w-full max-w-xs flex flex-col items-center gap-4 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
               <i className="fas fa-times text-xl"></i>
             </button>
             
             <div className="flex flex-col items-center gap-1 mt-2">
               <h3 className="text-secondary font-black text-xl text-center leading-tight">
                 {businessData.name || 'نام فروشگاه'}
               </h3>
               <span className="text-[10px] text-gray-400 font-medium">QR کد اختصاصی کارت ویزیت</span>
             </div>

             <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-100 p-2 shadow-inner">
                <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain mix-blend-multiply" />
             </div>
             
             <div className="w-full flex flex-col gap-2">
                <button 
                  onClick={downloadQR}
                  disabled={isDownloading}
                  className="w-full py-3 bg-secondary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  {isDownloading ? (
                    <i className="fas fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fas fa-download"></i>
                  )}
                  <span>دانلود تصویر کد</span>
                </button>
                <p className="text-[9px] text-gray-400 text-center px-4 leading-relaxed">
                  با اسکن این کد، مشتریان مستقیماً به صفحه شما هدایت می‌شوند.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
