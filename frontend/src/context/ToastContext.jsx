import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Claymorphic Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map(toast => {
          let bg = 'bg-white text-[#25233A] border-white';
          let icon = 'info';
          let iconColor = 'text-[#6C63FF]';

          if (toast.type === 'success') {
            bg = 'bg-[#EDFBF4] text-[#1E4620] border-[#B7F4D8]';
            icon = 'check_circle';
            iconColor = 'text-[#55C595]';
          } else if (toast.type === 'error') {
            bg = 'bg-[#FFF2F2] text-[#801414] border-[#FFCDCD]';
            icon = 'error';
            iconColor = 'text-[#BA1A1A]';
          } else if (toast.type === 'warning') {
            bg = 'bg-[#FFF9EC] text-[#7A4B00] border-[#FFE2A4]';
            icon = 'warning';
            iconColor = 'text-[#FFB84D]';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-[8px_12px_24px_rgba(108,99,255,0.14)] border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${bg}`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>
                  {icon}
                </span>
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

