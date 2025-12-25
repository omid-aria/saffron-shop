
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

export const GitHubSaver: React.FC<GitHubSaverProps> = ({ data, isOpen, onClose, onSuccess, config, filePath = "data.json" }) => {
  const [token, setToken] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const localToken = localStorage.getItem('gh_token');
    const sessionToken = sessionStorage.getItem('gh_token');
    
    if (localToken) {
      try {
        setToken(atob(localToken));
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem('gh_token');
      }
    } else if (sessionToken) {
      try {
        setToken(atob(sessionToken));
        setRememberMe(false);
      } catch (e) {
        sessionStorage.removeItem('gh_token');
      }
    }
  }, [isOpen]);

  const isDemoMode = config.owner === "YOUR_GITHUB_USERNAME" || config.repo === "YOUR_REPO_NAME";

  const handleSave = async () => {
    if (isDemoMode) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStatus('success');
        setTimeout(() => {
          onSuccess();
          onClose();
          setStatus('idle');
        }, 1500);
      }, 1500);
      return;
    }

    if (!token.trim()) {
      setError('لطفاً کد دسترسی امنیتی را وارد کنید.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;
      const getRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (getRes.status === 401) throw new Error('کد دسترسی نامعتبر است.');

      const fileData = getRes.ok ? await getRes.json() : null;
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

      const updateRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Update ${filePath} via Digital Card`,
          content: contentBase64,
          sha: fileData ? fileData.sha : undefined
        })
      });

      if (!updateRes.ok) throw new Error('خطا در ذخیره‌سازی.');

      const encodedToken = btoa(token);
      if (rememberMe) {
        localStorage.setItem('gh_token', encodedToken);
        sessionStorage.removeItem('gh_token');
      } else {
        sessionStorage.setItem('gh_token', encodedToken);
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
      setError(e.message || 'خطا رخ داد');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-primary/50 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><i className="fas fa-times"></i></button>

        {status === 'success' ? (
          <div className="text-center py-8 animate-fadeIn">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce border border-green-500/50">
                <i className="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">تغییرات ثبت شد!</h3>
            <p className="text-sm text-gray-400">کارت ویزیت شما با موفقیت به‌روزرسانی گردید.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <h3 className="text-primary font-bold text-xl flex items-center justify-center gap-2">
                <i className="fas fa-cloud-upload-alt text-2xl"></i> انتشار و بروزرسانی
              </h3>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-300 block pr-1 font-medium text-right">کد دسترسی امنیتی</label>
              <input 
                type="password" 
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="کد اختصاصی را وارد کنید"
                dir="ltr"
                className="w-full bg-white/5 border border-primary/30 rounded-xl px-4 py-3 text-white text-center text-sm font-mono focus:border-primary placeholder:text-gray-600"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-1">
              <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer">ذخیره کد روی این دستگاه</label>
              <input 
                id="remember"
                type="checkbox" 
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-white/5 text-primary"
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center font-bold">{error}</p>}
            <div className="mt-2 flex gap-3">
               <button 
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 py-4 rounded-xl font-bold text-black ${loading ? 'bg-gray-600' : 'bg-gradient-to-r from-gold-dark to-primary hover:brightness-110'} active:scale-95 transition-all shadow-lg`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-circle-notch fa-spin text-sm"></i>
                    در حال پردازش...
                  </span>
                ) : 'ثبت و انتشار تغییرات'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
