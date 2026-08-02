import React from 'react';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange, totalItems = null }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-6 border-t border-outline-variant/40">
      {totalItems !== null && (
        <p className="font-label-caps text-xs text-on-surface-variant">
          Hiển thị trang <strong className="text-primary">{currentPage}</strong> / {totalPages} ({totalItems} kết quả)
        </p>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 border border-outline-variant rounded text-xs font-label-caps font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all cursor-pointer"
        >
          Trang Trước
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded border border-outline-variant text-xs font-bold font-label-caps hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-xs text-on-surface-variant">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded text-xs font-bold font-label-caps transition-all cursor-pointer ${
              p === currentPage
                ? 'bg-primary text-white border border-primary shadow-xs'
                : 'border border-outline-variant hover:bg-primary hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-xs text-on-surface-variant">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded border border-outline-variant text-xs font-bold font-label-caps hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 border border-outline-variant rounded text-xs font-label-caps font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all cursor-pointer"
        >
          Trang Sau
        </button>
      </div>
    </div>
  );
}
