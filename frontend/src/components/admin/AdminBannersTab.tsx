import React from 'react';
import { BannerData } from '../AdminBannerModal';

interface AdminBannersTabProps {
  adminBanners?: BannerData[];
  handleOpenAddBanner: () => void;
  handleOpenEditBanner: (banner: BannerData) => void;
  handleToggleBannerActive: (banner: BannerData) => void;
  handleDeleteBanner: (banner: BannerData) => void;
}

export default function AdminBannersTab({
  adminBanners = [],
  handleOpenAddBanner,
  handleOpenEditBanner,
  handleToggleBannerActive,
  handleDeleteBanner,
}: AdminBannersTabProps) {
  const safeBanners = (Array.isArray(adminBanners) ? adminBanners : [])
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
        <div>
          <span className="font-label-caps text-label-caps text-secondary mb-1 block uppercase tracking-widest font-bold">
            HOMEPAGE HERO BANNER CONTROL
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">Quản Lý Banner Trang Chủ</h2>
          <p className="font-body-md text-on-surface-variant/60 text-sm">
            Tùy chỉnh các hình ảnh, tiêu đề và nút kêu gọi hành động (CTA) trên Slider Banner chính.
          </p>
        </div>
        <button
          onClick={handleOpenAddBanner}
          className="bg-primary text-white font-label-caps text-xs px-5 py-3 rounded hover:bg-secondary transition-colors cursor-pointer flex items-center gap-2 font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
          Thêm Banner Mới
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/60 border-b border-outline-variant">
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Hình Ảnh Banner</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Tiêu Đề & Phụ Đề</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Nút Liên Kết (CTA)</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">Thứ Tự</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">Trạng Thái</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-xs">
            {safeBanners.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant font-medium">
                  Chưa có Banner nào trong hệ thống
                </td>
              </tr>
            ) : (
              safeBanners.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4">
                    <img
                      src={b.imageUrl}
                      alt={b.title || 'Banner'}
                      className="w-32 h-16 object-cover rounded border border-outline-variant shadow-2xs"
                    />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-primary text-sm">{b.title || 'Không có tiêu đề'}</p>
                    <p className="text-[11px] text-on-surface-variant/70 truncate max-w-xs">
                      {b.subtitle || 'Không có phụ đề'}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-surface-container rounded text-[11px] font-bold border border-outline-variant">
                      {b.linkUrl || '#products'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-primary font-mono text-sm">
                    #{b.displayOrder ?? 1}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-label-caps font-bold border ${
                        b.active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {b.active ? 'ĐANG HIỂN THỊ' : 'ĐÃ ẨN'}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleBannerActive(b)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                          b.active
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {b.active ? 'Ẩn Banner' : 'Hiện Banner'}
                      </button>
                      <button
                        onClick={() => handleOpenEditBanner(b)}
                        className="px-3 py-1.5 bg-secondary text-primary border border-secondary rounded text-xs font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
