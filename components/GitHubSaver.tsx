
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
    if (!token.trim()) {
      setError('لطفاً کد دسترسی را وارد کنید.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // اضافه کردن زمان دقیق به دیتا برای شکستن کش در تمام گوشی‌ها
      const dataToSave = {
        ...data,
        lastUpdated: Date.now()
      };

      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;
      
      // 1. گرفتن SHA فایل قدیمی
      const getRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache'
        }
      });

      let sha = undefined;
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }

      // 2. ارسال دیتای جدید
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(dataToSave, null, 2))));

      const updateRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Update via Card - ${new Date().toLocaleString()}`,
          content: contentBase64,
          sha: sha
        })
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.message || 'خطا در ارتباط با گیت‌هاب');
      }

      if (rememberMe) {
        localStorage.setItem('gh_token', btoa(token));
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
      setStatus('error');
      setError(e.message || 'خطا در ذخیره‌سازی');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="bg-[#2e102d] border border-primary/50 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><i className="fas fa-times"></i></button>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <i className="fas fa-check text-2xl text-green-500"></i>
            </div>
            <h3 className="text-white font-bold">تغییرات ثبت شد</h3>
            <p className="text-xs text-gray-400 mt-2">دیتا در حال انتشار در شبکه است...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <h3 className="text-primary font-bold text-center text-lg">ثبت نهایی تغییرات</h3>
            <div className="space-y-2">
              <input 
                type="password" 
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="کد دسترسی (Token)"
                dir="ltr"
                className="w-full bg-black/40 border border-primary/30 rounded-xl px-4 py-3 text-white text-center text-sm focus:border-primary"
              />
              <div className="flex items-center justify-center gap-2">
                <input 
                  id="rem" type="checkbox" checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-black border-primary/30 text-primary"
                />
                <label htmlFor="rem" className="text-[10px] text-gray-400">ذخیره کد در این مرورگر</label>
              </div>
            </div>
            {error && <p className="text-[10px] text-red-400 text-center">{error}</p>}
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-4 bg-primary text-black font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'تایید و انتشار'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
