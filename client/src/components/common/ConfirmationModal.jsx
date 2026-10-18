import React from 'react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  itemName = '',
  itemBadge = '',
  isLoading = false,
  closeOnBgClick = false
}) => {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      accentGlow: 'bg-red-500/10',
      iconBg: 'bg-red-50 border-red-200/70 text-red-600 shadow-red-500/10',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
    warning: {
      accentGlow: 'bg-amber-500/10',
      iconBg: 'bg-amber-50 border-amber-200/70 text-amber-600 shadow-amber-500/10',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      accentGlow: 'bg-indigo-500/10',
      iconBg: 'bg-indigo-50 border-indigo-200/70 text-[#6366F1] shadow-indigo-500/10',
      confirmBtn: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-md shadow-indigo-500/25',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const current = variantConfig[type] || variantConfig.danger;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop: clicking outside does NOT close modal unless closeOnBgClick=true */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeOnBgClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Confirmation Dialog Card */}
      <div
        className="relative w-full max-w-[460px] bg-white dark:bg-[#15172A] rounded-[26px] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(27,25,60,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden z-10 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Decorative Glow */}
        <div
          className={`absolute -top-12 -right-12 w-36 h-36 rounded-full ${current.accentGlow} blur-2xl pointer-events-none`}
        />

        {/* Top Header Row with Icon & Close Button */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 border ${current.iconBg} shadow-sm`}>
            {current.icon}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#64748B] dark:text-slate-300 hover:text-[#1E293B] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close dialog"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title and Message */}
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-white tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
            {message}
          </p>

          {/* Optional Item Highlight Pill */}
          {itemName && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E293B] dark:text-white truncate">
                {itemName}
              </span>
              {itemBadge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-2xs">
                  {itemBadge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-6 pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs sm:text-sm font-semibold text-[#475569] dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 h-11 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${current.confirmBtn} ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
