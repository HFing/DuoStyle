import React, { useEffect } from 'react';

export default function ToastNotification({ message, type = 'success', onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-24 right-6 z-[9999] animate-bounce-in max-w-md w-full px-4">
      <div className={`p-5 flex items-center justify-between shadow-2xl border transition-all duration-500 ${
        type === 'error' 
          ? 'bg-error-container text-on-error-container border-error/30' 
          : 'bg-primary text-white border-secondary/40'
      }`}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-2xl">
            {type === 'error' ? 'error' : 'check_circle'}
          </span>
          <div>
            <h4 className="font-label-caps text-label-caps uppercase tracking-widest text-[11px] opacity-80 mb-0.5">
              {type === 'error' ? 'Thông Báo Lỗi' : 'DuoStyle Notification'}
            </h4>
            <p className="font-body-md text-sm font-medium leading-snug">
              {message}
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="ml-4 hover:opacity-70 transition-opacity text-white border-none bg-transparent cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
