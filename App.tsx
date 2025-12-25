
import React, { useState, useEffect, useCallback } from 'react';
import { CardContainer } from './components/CardContainer';
import { Header } from './components/Header';
import { ActionButtons } from './components/ActionButtons';
import { ContactInfo } from './components/ContactInfo';
import { SocialLinks } from './components/SocialLinks';
import { BusinessHours } from './components/BusinessHours';
import { PriceBoard } from './components/PriceBoard';
import { AnnouncementBar } from './components/AnnouncementBar';
import { GitHubSaver } from './components/GitHubSaver'; 
import { LuckyWheel } from './components/LuckyWheel';
import { Toast } from './components/Toast';
import { BusinessData, SocialLinksData, WheelPrize } from './types';

const APP_CONFIG = {
  githubOwner: "omid-aria",
  githubRepo: "saffron-herat", 
  defaultClient: "demo" 
};

const defaultPrizes: WheelPrize[] = [
  { text: '۵٪ تخفیف', color: '#4a1c40', textColor: '#D4AF37' },
  { text: 'ارسال رایگان', color: '#D4AF37', textColor: '#2e102d' },
  { text: '۱ گرم زعفران', color: '#2e102d', textColor: '#D4AF37' },
  { text: 'شانس مجدد', color: '#D4AF37', textColor: '#2e102d' },
  { text: '۱۰٪ تخفیف', color: '#4a1c40', textColor: '#ffffff' },
  { text: 'پک هدیه', color: '#D4AF37', textColor: '#2e102d' },
];

const fallbackData: BusinessData = {
  name: "زعفران فروشی هرات",
  tagline: "عرضه کننده بهترین زعفران قائنات",
  phone: "09123456789",
  website: "saffronherat.com",
  email: "info@saffronherat.com",
  address: "هرات، خیابان اصلی، پلاک ۱۲۳",
  socials: { whatsapp: "", instagram: "", telegram: "", facebook: "" },
  hours: [
    { label: "شنبه تا پنجشنبه", time: "9:00 - 18:00" },
    { label: "جمعه‌ها", time: "تعطیل" }
  ],
  prices: [
    { id: "1", label: "زعفران نگین سوپر", value: "850 AFN" },
    { id: "2", label: "زعفران سرگل صادراتی", value: "720 AFN" }
  ],
  announcement: "",
  logo: "", 
  locationLink: "", 
  cardUrl: "",
  luckyWheelEnabled: true,
  wheelPrizes: defaultPrizes,
  lastUpdated: 0
};

export default function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false); 
  
  const [data, setData] = useState<BusinessData>(fallbackData);
  const [clientId, setClientId] = useState<string>("");
  const [isSaverOpen, setIsSaverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info', action?: { label: string, onClick: () => void }} | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', action?: { label: string, onClick: () => void }) => {
    setToast({ message, type, action });
  }, []);

  const loadData = useCallback(async (isBackground = false) => {
    if (!clientId) return;
    if (!isBackground) setIsLoading(true);
    
    // ۱. بررسی حافظه محلی (برای مشاهده لحظه‌ای مدیر)
    const localMirrorKey = `saffron_mirror_${clientId}`;
    const localMirror = localStorage.getItem(localMirrorKey);
    
    if (localMirror && !isBackground) {
        try {
            const parsedLocal = JSON.parse(localMirror);
            setData(prev => ({ ...prev, ...parsedLocal }));
            if (!isBackground) setIsLoading(false);
            // حتی اگر دیتای محلی داریم، باز هم از سرور چک می‌کنیم که مطمئن شویم
        } catch(e) {}
    }

    let githubPath = "public/data.json";
    if (clientId !== APP_CONFIG.defaultClient) githubPath = `public/clients/${clientId}.json`;
    
    const fetchUrl = `https://raw.githubusercontent.com/${APP_CONFIG.githubOwner}/${APP_CONFIG.githubRepo}/main/${githubPath}?t=${Date.now()}`;

    try {
      const response = await fetch(fetchUrl, { cache: 'no-store' });

      if (response.ok) {
        const cloudData = await response.json();
        const localTsKey = `saffron_last_updated_${clientId}`;
        const localTs = localStorage.getItem(localTsKey);
        
        // اگر دیتای ابری جدیدتر از چیزی است که الان داریم نشان می‌دهیم
        if (!localTs || (cloudData.lastUpdated && parseInt(localTs) < cloudData.lastUpdated)) {
           setData(prev => ({ ...prev, ...cloudData }));
           localStorage.setItem(localTsKey, cloudData.lastUpdated.toString());
           
           // اگر مشتری است و آپدیت کد (فایل‌های سیستمی) هم احتمالا وجود دارد
           if (!isAdmin && localTs) {
              (window as any).forceAppUpdate();
           }
        }
      }
    } catch (e) {
      console.error("Sync error", e);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, [clientId, isAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let targetClientId = APP_CONFIG.defaultClient;
    const urlId = params.get('id');
    const savedId = localStorage.getItem('saffron_last_visited_id');

    if (urlId) {
      targetClientId = urlId;
      localStorage.setItem('saffron_last_visited_id', urlId);
    } else if (savedId) {
      targetClientId = savedId;
    }
    setClientId(targetClientId);

    if (params.has('edit') || params.has('admin') || localStorage.getItem('saffron_admin_access') === 'true') {
      setIsAdmin(true);
      setIsEditMode(true);
    }
  }, []);

  useEffect(() => {
    if (!clientId) return;
    loadData();
    const interval = setInterval(() => {
      if (!isEditMode) loadData(true);
    }, 60000); 
    return () => clearInterval(interval);
  }, [clientId, isEditMode, loadData]);

  const updateField = (field: keyof BusinessData, value: any) => {
    setData(prev => ({ ...prev, [field]: value, lastUpdated: Date.now() }));
  };

  const handleCloudSaveSuccess = () => {
    // نکته طلایی: ذخیره در آینه محلی مدیر برای مشاهده لحظه‌ای
    const localMirrorKey = `saffron_mirror_${clientId}`;
    localStorage.setItem(localMirrorKey, JSON.stringify(data));
    
    localStorage.removeItem('saffron_admin_access');
    setIsEditMode(false);
    setIsAdmin(false);
    
    showToast('تغییرات شما فوراً روی این گوشی اعمال شد و تا لحظاتی دیگر برای همه منتشر می‌شود.', 'success');
  };

  const getSavePath = () => {
      if (!clientId || clientId === APP_CONFIG.defaultClient) return 'public/data.json';
      return `public/clients/${clientId}.json`;
  };

  const handleExitEditMode = () => {
    localStorage.removeItem('saffron_admin_access');
    setIsAdmin(false);
    setIsEditMode(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-primary font-bold animate-pulse">در حال بروزرسانی...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-900 w-full">
      <div className="w-full max-w-md min-h-screen relative bg-saffron-gradient flex flex-col items-center px-6 py-8 shadow-2xl overflow-hidden pt-0 text-right">
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 bg-secondary">
          <img alt="Pattern" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyrP7ZL4Kaly7m3YPjFeQWVwK3IBy2TGpBCFMU9G8zvn55qpyC7D7WYYLh6sP4fvMQGjRClA8OmVNtaX5MRCyrcKYgmljRYmt6vmu73XK7eJ-_jD5xpQYqfFO0sEYTSvg2uLGX09mpsGFXJVuX4Dpk42RTnW7YJcsJGfgHoF7MtNSUcKYcc1bST4WILDSLSbytUeoOKc1zsoZ-kX2FbWkx2XRueW4Uc65h7CNVnc388c41W1x5eyIr3uFh_F9-5HP0NV-q0NPeRySu" />
        </div>

        {toast && <Toast message={toast.message} type={toast.type} action={toast.action} onClose={() => setToast(null)} />}

        {isExitConfirmOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-lg">
            <div className="bg-gradient-to-b from-[#3d1535] to-[#2e102d] border border-primary/40 p-8 rounded-[32px] w-full max-w-xs flex flex-col items-center gap-6 shadow-2xl">
               <h3 className="text-white font-black text-xl">خروج از ویرایش؟</h3>
               <div className="w-full flex flex-col gap-3">
                  <button onClick={handleExitEditMode} className="w-full py-4 bg-red-600 text-white font-extrabold rounded-2xl">بله، خارج شو</button>
                  <button onClick={() => setIsExitConfirmOpen(false)} className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl">انصراف</button>
               </div>
            </div>
          </div>
        )}

        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="bg-secondary/90 border border-primary/40 p-6 rounded-2xl w-full max-w-xs relative flex flex-col items-center gap-4">
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-3 right-3 text-white/40"><i className="fas fa-times"></i></button>
              <h3 className="text-white font-bold text-xl text-center">ورود مدیریت</h3>
              <button onClick={() => { setIsAdmin(true); setIsEditMode(true); setIsLoginModalOpen(false); localStorage.setItem('saffron_admin_access', 'true'); }} className="w-full py-3 bg-primary text-black font-extrabold rounded-xl shadow-lg">تایید هویت</button>
            </div>
          </div>
        )}

        <GitHubSaver 
          isOpen={isSaverOpen} 
          onClose={() => setIsSaverOpen(false)} 
          data={data}
          onSuccess={handleCloudSaveSuccess}
          config={{ owner: APP_CONFIG.githubOwner, repo: APP_CONFIG.githubRepo }}
          filePath={getSavePath()} 
        />

        <LuckyWheel isOpen={isLuckyWheelOpen} onClose={() => setIsLuckyWheelOpen(false)} prizes={data.wheelPrizes || defaultPrizes} />

        <AnnouncementBar text={data.announcement || ""} isEditing={isEditMode && isAdmin} onUpdate={(val) => updateField('announcement', val)} />

        <div className="relative z-10 w-full flex flex-col items-center space-y-6 animate-fadeIn pb-10 pt-28">
          {isEditMode && isAdmin && (
            <div className="w-full bg-black/60 border-2 border-primary/60 p-4 rounded-b-2xl mb-4 text-right backdrop-blur-xl z-50 sticky top-16 shadow-2xl">
               <button onClick={() => setIsSaverOpen(true)} className="w-full bg-primary text-black font-extrabold text-sm py-3 rounded-xl shadow-lg">ثبت و انتشار نهایی</button>
               <button onClick={() => setIsExitConfirmOpen(true)} className="w-full mt-2 text-white/50 text-[10px]">خروج از ویرایش</button>
            </div>
          )}
          
          <div className="mt-2 w-full flex flex-col items-center gap-6">
            <Header name={data.name} tagline={data.tagline} logo={data.logo} isEditing={isEditMode && isAdmin} onUpdate={updateField} />
            <ActionButtons businessData={data} isEditing={isEditMode && isAdmin} onUpdate={updateField} />
            
            <PriceBoard prices={data.prices || []} isEditing={isEditMode && isAdmin} onUpdate={(p) => updateField('prices', p)} phone={data.phone} address={data.address} />
            <CardContainer>
              <ContactInfo phone={data.phone} website={data.website} email={data.email} address={data.address} locationLink={data.locationLink} isEditing={isEditMode && isAdmin} onUpdate={updateField} />
            </CardContainer>
            <SocialLinks links={data.socials} isEditing={isEditMode && isAdmin} onUpdate={(k, v) => {
              setData(prev => ({ ...prev, lastUpdated: Date.now(), socials: { ...prev.socials, [k]: v } }));
            }} />
            <BusinessHours hours={data.hours} isEditing={isEditMode && isAdmin} onUpdate={(i, f, v) => {
                const newHours = [...data.hours];
                newHours[i] = { ...newHours[i], [f]: v };
                updateField('hours', newHours);
            }} />
          </div>

          {!isAdmin && (
            <button onClick={() => setIsLoginModalOpen(true)} className="opacity-20 text-[10px] mt-10">مدیریت کارت</button>
          )}
        </div>

        {!isEditMode && data.luckyWheelEnabled && (
          <button onClick={() => setIsLuckyWheelOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-gold-dark rounded-full shadow-lg flex items-center justify-center z-50 active:scale-90 transition-all animate-bounce">
            <i className="fas fa-gift text-2xl text-secondary"></i>
          </button>
        )}
      </div>
    </div>
  );
}
