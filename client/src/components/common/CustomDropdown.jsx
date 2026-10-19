import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  className = '',
  icon = null,
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 200,
    placement: 'bottom'
  });

  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Recalculate menu position relative to the viewport so it never clips outside or overlaps
  const updateMenuPosition = useCallback(() => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();

    // If trigger is out of screen viewport, close it
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false);
      return;
    }

    const estimatedHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip upwards if space below is too tight (< 260px) and space above has more room
    const openUp = spaceBelow < 260 && spaceAbove > spaceBelow;

    // Width should match trigger button or at least 200px
    const width = Math.max(rect.width, 200);

    // Ensure menu stays within screen viewport horizontally
    const margin = 12;
    let left = rect.left;
    if (left + width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - width - margin);
    }
    if (left < margin) {
      left = margin;
    }

    if (openUp) {
      setMenuPosition({
        top: 0,
        bottom: window.innerHeight - rect.top + 6,
        left,
        width,
        placement: 'top'
      });
    } else {
      setMenuPosition({
        top: rect.bottom + 6,
        bottom: 0,
        left,
        width,
        placement: 'bottom'
      });
    }
  }, []);

  // Update position on open, scroll (including parent modals), or resize
  useLayoutEffect(() => {
    if (isOpen) {
      updateMenuPosition();
    }
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (e) => {
      // Don't re-calculate if scrolling inside the dropdown's own options list
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      updateMenuPosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updateMenuPosition);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

  // Close on outside click (checking both trigger button and portaled menu)
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      const isClickInsideTrigger = dropdownRef.current && dropdownRef.current.contains(e.target);
      const isClickInsideMenu = menuRef.current && menuRef.current.contains(e.target);

      if (!isClickInsideTrigger && !isClickInsideMenu) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateMenuPosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const labelMatch = (opt.label || '').toLowerCase().includes(query);
    const valueMatch = (opt.value || '').toLowerCase().includes(query);
    return labelMatch || valueMatch;
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
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

      {/* Dropdown Menu Popup via Portal: floats outside all modals/cards so it's NEVER hidden or clipped */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              ...(menuPosition.placement === 'top'
                ? { bottom: `${menuPosition.bottom}px` }
                : { top: `${menuPosition.top}px` }),
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              zIndex: 99999
            }}
            className={`bg-white dark:bg-[#1A1C32] rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4),0_0_0_1px_rgba(99,102,241,0.15)] dark:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.15)] border border-slate-200/90 dark:border-white/10 overflow-hidden animate-in fade-in duration-150 ${
              menuPosition.placement === 'top' ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            {searchable && (
              <div className="p-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03]">
                <div className="relative">
                  <svg
                    className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8] pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full h-8.5 pl-8 pr-7 rounded-lg bg-white dark:bg-[#15172A] border border-slate-200 dark:border-white/10 text-xs text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/25 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-2.5 text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="py-1 max-h-[220px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-6 px-3 text-center text-xs text-[#94A3B8] dark:text-slate-400">
                  No matching results found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value || 'all'}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option.value)}
                      className={`w-[calc(100%-8px)] mx-1 px-3 py-2 rounded-xl text-xs sm:text-sm text-left flex items-center justify-between transition-colors cursor-pointer ${
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
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomDropdown;
