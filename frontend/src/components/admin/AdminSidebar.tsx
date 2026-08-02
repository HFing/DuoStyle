import React from 'react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate?: (page: string) => void;
  user?: any;
  onLogout?: () => void;
  fetchAdminReviews?: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onNavigate,
  user,
  onLogout,
  fetchAdminReviews,
}: AdminSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant flex flex-col py-6 px-4 z-50 shadow-sm">
      <div className="mb-5 px-2">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="font-headline-md text-headline-md text-primary tracking-tight cursor-pointer border-none bg-transparent text-left"
        >
          DuoStyle
        </button>
        <p className="font-label-caps text-label-caps text-on-surface-variant/60 tracking-[0.2em] mt-0.5">
          Management
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 custom-sidebar-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">monitoring</span>
          <span className="font-label-caps text-label-caps text-xs">Thống Kê</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'orders'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">shopping_bag</span>
          <span className="font-label-caps text-label-caps text-xs">Đơn Hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'products'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl text-secondary">inventory_2</span>
          <span className="font-label-caps text-label-caps text-xs">Sản Phẩm & Kho</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'customers'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">group</span>
          <span className="font-label-caps text-label-caps text-xs">Quản Lý Người Dùng</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'categories'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">category</span>
          <span className="font-label-caps text-label-caps text-xs">Danh Mục</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'vouchers'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl text-amber-600">confirmation_number</span>
          <span className="font-label-caps text-label-caps text-xs">Mã Giảm Giá</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'banners'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl text-purple-600">view_carousel</span>
          <span className="font-label-caps text-label-caps text-xs">Quản Lý Banner</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reviews');
            if (fetchAdminReviews) fetchAdminReviews();
          }}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'reviews'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl text-amber-500">rate_review</span>
          <span className="font-label-caps text-label-caps text-xs">Quản Lý Đánh Giá</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-settings')}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors duration-200 cursor-pointer ${
            activeTab === 'ai-settings'
              ? 'text-primary font-bold border-r-4 border-primary bg-primary/5'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-xl">smart_toy</span>
          <span className="font-label-caps text-label-caps text-xs">Cấu Hình AI</span>
        </button>
      </nav>

      {/* Home Button */}
      <div className="pt-3 border-t border-outline-variant/30 mb-2">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="w-full py-2 px-3 bg-primary text-white font-label-caps text-[10px] tracking-widest uppercase hover:bg-secondary transition-colors rounded text-center cursor-pointer font-bold flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">storefront</span>
          Trở Về Cửa Hàng
        </button>
      </div>

      {/* Profile Footer */}
      <div className="mt-auto flex flex-col gap-2.5 pt-3 border-t border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {user?.fullName
              ? user.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()
              : 'AD'}
          </div>
          <div className="flex-grow">
            <p className="font-label-caps text-xs text-primary leading-tight font-bold">
              {user?.fullName || 'DuoStyle Admin'}
            </p>
            <p className="text-[9px] text-secondary font-bold uppercase tracking-widest">
              Super Administrator
            </p>
          </div>
        </div>
        <button
          onClick={() => onLogout && onLogout()}
          className="w-full py-1.5 px-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-colors rounded text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer font-label-caps uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Đăng Xuất
        </button>
      </div>
    </aside>
  );
}
