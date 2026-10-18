import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Card Item Component
const ToastItem = ({ toast, onDismiss }) => {
  const { id, type = 'info', title, message, duration = 4000, action } = toast;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (duration <= 0 || isPaused) return;

    const intervalTime = 40;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [id, duration, isPaused, onDismiss]);

  // Visual configuration based on Figma brand palette
  const typeConfig = {
    success: {
      borderColor: 'border-emerald-200/90 hover:border-emerald-300',
      shadowColor: 'shadow-[0_16px_36px_-6px_rgba(16,185,129,0.22)]',
      iconBg: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25',
      progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      borderColor: 'border-red-200/90 hover:border-red-300',
      shadowColor: 'shadow-[0_16px_36px_-6px_rgba(239,68,68,0.22)]',
      iconBg: 'bg-red-500 text-white shadow-md shadow-red-500/25',
      progressBar: 'bg-gradient-to-r from-red-400 to-rose-500',
      badgeText: 'text-red-700 bg-red-50 border-red-200/60',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      borderColor: 'border-amber-200/90 hover:border-amber-300',
      shadowColor: 'shadow-[0_16px_36px_-6px_rgba(245,158,11,0.22)]',
      iconBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/25',
      progressBar: 'bg-gradient-to-r from-amber-400 to-orange-500',
      badgeText: 'text-amber-700 bg-amber-50 border-amber-200/60',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      borderColor: 'border-indigo-200/90 hover:border-indigo-300',
      shadowColor: 'shadow-[0_16px_36px_-6px_rgba(99,102,241,0.22)]',
      iconBg: 'bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white shadow-md shadow-indigo-500/25',
      progressBar: 'bg-gradient-to-r from-indigo-400 to-purple-500',
      badgeText: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border ${current.borderColor} ${current.shadowColor} p-4 transition-all duration-300 animate-toast-in select-none group pointer-events-auto`}
    >
      <div className="flex items-start gap-3.5">
        {/* Left Icon Badge */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${current.iconBg} group-hover:scale-105 transition-transform duration-200`}>
          {current.icon}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-[#1E293B] tracking-tight">
              {title}
            </h4>
          </div>
          {message && (
            <p className="text-xs text-[#64748B] leading-relaxed break-words">
              {message}
            </p>
          )}

          {/* Optional Action Button */}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onDismiss(id);
              }}
              className="mt-2 text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] hover:underline cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(id)}
          className="text-[#94A3B8] hover:text-[#1E293B] hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Dismiss notification"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Auto-Dismiss Animated Bottom Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/60">
          <div
            className={`h-full ${current.progressBar} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const toast = {
    success: (title, message, options = {}) =>
      addToast({ type: 'success', title, message, ...options }),
    error: (title, message, options = {}) =>
      addToast({ type: 'error', title, message, ...options }),
    warning: (title, message, options = {}) =>
      addToast({ type: 'warning', title, message, ...options }),
    info: (title, message, options = {}) =>
      addToast({ type: 'info', title, message, ...options }),
    dismiss,
    clear: () => setToasts([])
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Responsive Toaster Container */}
      <div
        className="fixed top-4 sm:top-6 right-0 sm:right-6 left-4 sm:left-auto sm:w-[380px] z-[9999] pointer-events-none flex flex-col gap-2.5 sm:gap-3"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
