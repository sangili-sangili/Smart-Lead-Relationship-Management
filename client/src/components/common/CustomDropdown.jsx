import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  className = '',
  icon = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 px-3.5 rounded-xl bg-slate-50/80 dark:bg-white/5 border ${
          isOpen
            ? 'border-[#6366F1] ring-2 ring-[#6366F1]/15'
            : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        } text-xs sm:text-sm text-[#1E293B] dark:text-white flex items-center justify-between gap-2.5 transition-all cursor-pointer font-medium select-none shadow-2xs`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {icon}
          {selectedOption.dotColor && (
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: selectedOption.dotColor }}
            />
          )}
          <span className="truncate">{selectedOption.label || placeholder}</span>
        </div>

        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#6366F1]' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu Popup with Clear Dark and Light Styling */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 w-full min-w-[160px] bg-white dark:bg-[#1A1C32] rounded-xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.7)] border border-slate-200/90 dark:border-white/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[260px] overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value || 'all'}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`w-[calc(100%-8px)] mx-1 px-3 py-2 rounded-lg text-xs sm:text-sm text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-500/20 text-[#6366F1] dark:text-indigo-400 font-semibold'
                    : 'text-[#1E293B] dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/5 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {option.dotColor && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: option.dotColor }}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>

                {isSelected && (
                  <svg
                    className="w-4 h-4 text-[#6366F1] dark:text-indigo-400 shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
