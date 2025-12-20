
import React, { useState, useEffect } from 'react';
import { BusinessData } from '../types';

interface GitHubSaverProps {
  data: BusinessData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: { owner: string; repo: string };
  filePath?: string;
}

export const GitHubSaver: React.FC<GitHubSaverProps> = ({ data, isOpen, onClose, onSuccess, config, filePath = "public/data.json" }) => {
  const [token, setToken] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const localToken = localStorage.getItem('gh_token');
    if (localToken) {
      try {
        setToken(atob(localToken));
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem('gh_token');
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    const cleanToken = token.trim();
    
    if (!cleanToken) {
      setError('لطفاً کد دسترسی (GitHub Token) را وارد کنید.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const dataToSave = {
        ...data,
        lastUpdated: Date.now()
      };

      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;
      
      // ۱. دریافت مشخصات فایل (برای گرفتن SHA)
      // اضافه کردن پارامتر رندوم برای جلوگیری از کش شدن توسط VPN یا ISP
      const getRes = await fetch(`${url}?nocache=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      let sha = undefined;
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      } else if (getRes.status === 401 || getRes.status === 403) {
        throw new Error('توکن نامعتبر است یا دسترسی منقضی شده.');
      }

      // ۲. آماده‌سازی محتوا
      const jsonStr = JSON.stringify(dataToSave, null, 2);
      // استفاده از روش ایمن برای کار با حروف فارسی در Base64
      const bytes = new TextEncoder().encode(jsonStr);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
      const contentBase64 = btoa(binString);

      // ۳. ارسال آپدیت
      const updateRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${cleanToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Update Business Data: ${new Date().toLocaleString('fa-IR')}`,
          content: contentBase64,
          sha: sha
        })
      });

      if (!updateRes.ok) {
        const errInfo = await updateRes.json();
        throw new Error(errInfo.message || 'خطا در ثبت نهایی');
      }

      if (rememberMe) {
        localStorage.setItem('gh_token', btoa(cleanToken));
      } else {
        localStorage.removeItem('gh_token');
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
      }, 1500);

    } catch (e: any) {
      console.error("Save Error:", e);
      setStatus('error');
      // اگر خطا "Failed to fetch" بود، پیام راهنما بدهیم
      if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
        setError('خطای اتصال به گیت‌هاب! اگر VPN روشن است، لطفاً سرور آن را تغییر دهید (مثلاً روی آلمان یا انگلیس) یا از VPN دیگری استفاده کنید.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" onClick={onClose}>
      <div className="bg-[#2e102d] border border-primary/40 w-full max-w-xs rounded-[32px] p-6 shadow-2xl relative animate-fadeIn" onClick={e => e.stopPropagation()}>
        
        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <i className="fas fa-check text-2xl text-green-500"></i>
            </div>
            <h3 className="text-white font-bold">ذخیره شد!</h3>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="text-center">
               <h3 className="text-primary font-black text-xl mb-1">تایید انتشار</h3>
               <p className="text-[10px] text-white/40">تغییرات در سرور گیت‌هاب ثبت خواهد شد.</p>
            </div>

            <input 
              type="password" 
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="GitHub Classic Token"
              dir="ltr"
              className="w-full bg-black/40 border border-primary/30 rounded-2xl px-4 py-4 text-white text-center text-xs focus:border-primary transition-all outline-none placeholder:text-white/20"
            />

            <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`w-4 h-4 rounded border ${rememberMe ? 'bg-primary border-primary' : 'border-white/20'}`}>
                 {rememberMe && <i className="fas fa-check text-[8px] text-black flex items-center justify-center h-full"></i>}
              </div>
              <span className="text-[10px] text-white/40">ذخیره کد در این مرورگر</span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <p className="text-[9px] text-red-400 text-center leading-relaxed font-bold">{error}</p>
              </div>
            )}

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-4 bg-primary text-black font-extrabold rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'تایید و بروزرسانی آنلاین'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
