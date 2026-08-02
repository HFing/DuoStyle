import React from 'react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <main className="min-h-[70vh] pt-36 pb-section-gap px-margin-mobile md:px-margin-desktop flex items-center justify-center">
      <section className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 md:p-14 text-center shadow-sm">
        <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">
          search_off
        </span>
        <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold mb-2 block">
          404 ERROR
        </span>
        <h1 className="font-headline-md text-headline-md text-primary mb-4">
          Trang Không Tồn Tại
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-md mx-auto mb-8">
          Trang bạn đang tìm kiếm không tồn tại, đã bị di chuyển hoặc bạn không có quyền truy cập.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-secondary transition-colors rounded cursor-pointer"
          >
            Quay Về Trang Chủ
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('collections')}
            className="border border-primary text-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-primary hover:text-on-primary transition-colors rounded cursor-pointer"
          >
            Xem Sản Phẩm
          </button>
        </div>
      </section>
    </main>
  );
}
