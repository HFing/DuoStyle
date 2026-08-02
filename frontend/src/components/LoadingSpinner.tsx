import React from 'react';

export default function LoadingSpinner({ fullScreen = false, text = 'Đang tải dữ liệu...' }) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-secondary/20 animate-ping opacity-25"></div>
        
        {/* Main rotating arc */}
        <div className="w-14 h-14 rounded-full border-2 border-outline-variant border-t-primary border-r-secondary animate-spin"></div>
        
        {/* Inner brand monogram */}
        <span className="absolute font-headline-sm text-xs font-bold tracking-tighter text-primary">
          DS
        </span>
      </div>
      {text && (
        <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase text-[11px] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
