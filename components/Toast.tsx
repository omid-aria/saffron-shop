import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, action, onClose }) => {
  // اگر دکمه اکشن وجود داشته باشد، زمان نمایش را بیشتر کن تا کاربر وقت کافی داشته باشد
  useEffect(() => {
    const duration = action ? 8000 : 3000;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, action]);

  const styles = {
    success: 'bg-green-600/95 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    error: 'bg-red-600/95 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    info: 'bg-blue-600/95 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] ${styles[type]} border backdrop-blur-md rounded-xl px-4 py-4 flex flex-col gap-3 animate-slideDown min-w-[320px] max-w-[90%] shadow-2xl`}>
      <div className="flex items-center justify-between w-full">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
               <i className={`fas ${icons[type]} text-lg`}></i>
            </div>
            <p className="font-bold text-sm text-right leading-relaxed">{message}</p>
         </div>
         <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 w-8 h-8 flex items-center justify-center transition-colors shrink-0">
           <i className="fas fa-times"></i>
         </button>
      </div>

      {action && (
        <div className="w-full flex justify-end border-t border-white/20 pt-2 mt-1">
          <button 
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};