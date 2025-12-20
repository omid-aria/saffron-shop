
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
      setError('لطفاً کد دسترسی (Token) را وارد کنید.');
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
      
      // ۱. مرحله دریافت اطلاعات فایل موجود برای داشتن SHA
      let sha = undefined;
      try {
        const getRes = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Cache-Control': 'no-cache'
          }
        });

        if (getRes.ok) {
          const fileInfo = await getRes.json();
          sha = fileInfo.sha;
        } else if (getRes.status === 401 || getRes.status === 403) {
          throw new Error('کد دسترسی (Token) نامعتبر است یا دسترسی لازم را ندارد.');
        }
      } catch (getErr: any) {
        if (getErr.message.includes('Failed to fetch')) {
          throw new Error('ارتباط با سرور گیت‌هاب برقرار نشد. احتمالاً نیاز به VPN دارید.');
        }
        if (getErr.message.includes('Token')) throw getErr;
      }

      // ۲. مرحله ارسال و ذخیره دیتای جدید
      const jsonStr = JSON.stringify(dataToSave, null, 2);
      const contentBase64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));

      const updateRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Update via Digital Card - ${new Date().toISOString()}`,
          content: contentBase64,
          sha: sha
        })
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.message || 'خطا در ثبت تغییرات');
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
      setError(e.message || 'خطای غیرمنتظره در ارتباط با شبکه');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="bg-[#2e102d] border border-primary/50 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-all"><i className="fas fa-times"></i></button>

        {status === 'success' ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <i className="fas fa-check text-2xl text-green-500"></i>
            </div>
            <h3 className="text-white font-bold">تغییرات با موفقیت ثبت شد</h3>
            <p className="text-[10px] text-gray-400 mt-2">دیتا در مخزن گیت‌هاب شما بروزرسانی شد.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="text-center space-y-1">
               <h3 className="text-primary font-bold text-lg">ثبت نهایی تغییرات</h3>
               <p className="text-[10px] text-white/40">تغییرات شما در فایل اصلی ذخیره خواهد شد.</p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input 
                  type="password" 
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="کد دسترسی (GitHub Token)"
                  dir="ltr"
                  className="w-full bg-black/40 border border-primary/30 rounded-xl px-4 py-4 text-white text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                />
              </div>
              
              <div className="flex items-center justify-center gap-2 cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-primary border-primary' : 'bg-black/40 border-primary/30'}`}>
                   {rememberMe && <i className="fas fa-check text-[10px] text-secondary"></i>}
                </div>
                <span className="text-[10px] text-gray-400">ذخیره کد دسترسی در این مرورگر</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg animate-shake">
                <p className="text-[10px] text-red-400 text-center leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-4 bg-primary text-black font-black rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>در حال ذخیره‌سازی...</span>
                </div>
              ) : 'تایید و انتشار آنلاین'}
            </button>
            
            <p className="text-[9px] text-white/20 text-center px-4 leading-relaxed">
              نکته: در صورت بروز خطای شبکه، حتماً VPN خود را بررسی کنید.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
