import React, { useMemo } from 'react';

/**
 * Calculates compact pagination items with smart ellipsis windowing
 * Prevents overlap when total pages exceed 7 (e.g. 13, 30+ pages).
 * Pattern requested: 1 2 3 4 ... 10 11 (or 1 ... 4 5 6 ... 30)
 */
export function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the beginning: 1 2 3 4 ... (totalPages - 1) totalPages
  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...right', totalPages - 1, totalPages];
  }

  // Near the end: 1 2 ... (totalPages - 3) (totalPages - 2) (totalPages - 1) totalPages
  if (currentPage >= totalPages - 2) {
    return [
      1,
      2,
      '...left',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    ];
  }

  // In the middle: 1 ... (currentPage - 1) currentPage (currentPage + 1) ... totalPages
  return [
    1,
    '...left',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...right',
    totalPages
  ];
}

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, safeTotalPages));

  const items = useMemo(() => {
    return getPaginationItems(safeCurrentPage, safeTotalPages);
  }, [safeCurrentPage, safeTotalPages]);

  const handleEllipsisClick = (type) => {
    if (!onPageChange) return;
    if (type === '...left') {
      onPageChange(Math.max(1, safeCurrentPage - 5));
    } else if (type === '...right') {
      onPageChange(Math.min(safeTotalPages, safeCurrentPage + 5));
    }
  };

  return (
    <div className="flex items-center gap-1.5 select-none" role="navigation" aria-label="Pagination">
      {/* Previous Page Button */}
      <button
        type="button"
        disabled={safeCurrentPage <= 1}
        onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
        className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-[#64748B] dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
        title="Previous Page"
        aria-label="Previous Page"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Number Pills and Smart Ellipsis */}
      {items.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <button
              key={`ellipsis-${item}-${index}`}
              type="button"
              onClick={() => handleEllipsisClick(item)}
              title={item === '...left' ? 'Jump back 5 pages' : 'Jump forward 5 pages'}
              className="w-8 h-8 flex items-center justify-center text-xs font-bold text-[#94A3B8] dark:text-slate-500 hover:text-[#6366F1] dark:hover:text-indigo-400 transition-colors cursor-pointer tracking-widest rounded-xl hover:bg-slate-100/70 dark:hover:bg-white/5"
            >
              •••
            </button>
          );
        }

        const isActive = item === safeCurrentPage;
        return (
          <button
            key={`page-${item}`}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={isActive ? 'page' : undefined}
            className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-[#6366F1] text-white shadow-xs shadow-indigo-600/30 font-extrabold'
                : 'hover:bg-slate-100 dark:hover:bg-white/10 text-[#64748B] dark:text-slate-400'
            }`}
          >
            {item}
          </button>
        );
      })}

      {/* Next Page Button */}
      <button
        type="button"
        disabled={safeCurrentPage >= safeTotalPages}
        onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
        className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-[#64748B] dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
        title="Next Page"
        aria-label="Next Page"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
