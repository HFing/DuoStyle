import React from 'react';
import Pagination from '../Pagination';

interface AdminReviewsTabProps {
  adminReviews?: any[];
  adminReviewSearch: string;
  setAdminReviewSearch: (search: string) => void;
  adminReviewRatingFilter: string;
  setAdminReviewRatingFilter: (filter: string) => void;
  reviewsPage: number;
  setReviewsPage: (page: number) => void;
  totalReviewsPages: number;
  handleToggleReviewActive: (review: any) => void;
  setReplyingReview: (review: any) => void;
  setReplyText: (text: string) => void;
}

export default function AdminReviewsTab({
  adminReviews = [],
  adminReviewSearch,
  setAdminReviewSearch,
  adminReviewRatingFilter,
  setAdminReviewRatingFilter,
  reviewsPage,
  setReviewsPage,
  totalReviewsPages,
  handleToggleReviewActive,
  setReplyingReview,
  setReplyText,
}: AdminReviewsTabProps) {
  const safeReviews = Array.isArray(adminReviews) ? adminReviews : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
        <div>
          <span className="font-label-caps text-label-caps text-secondary mb-1 block uppercase tracking-widest font-bold">
            CUSTOMER REVIEWS & FEEDBACK CONTROL
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">Quản Lý Đánh Giá & Phản Hồi</h2>
          <p className="font-body-md text-on-surface-variant/60 text-sm">
            Xem xét nhận xét của khách hàng, phản hồi chính thức từ Admin và duy trì chất lượng trải nghiệm dịch vụ.
          </p>
        </div>
      </div>

      {/* Search Bar & Rating Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-md">
        <div className="relative flex-grow max-w-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng hoặc nội dung nhận xét..."
            value={adminReviewSearch}
            onChange={(e) => {
              setAdminReviewSearch(e.target.value);
              setReviewsPage(1);
            }}
            className="w-full py-2 pl-9 pr-8 border border-outline-variant rounded text-xs outline-none bg-white font-body-md"
          />
          {adminReviewSearch && (
            <button
              onClick={() => {
                setAdminReviewSearch('');
                setReviewsPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary cursor-pointer text-xs"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-primary mr-1">Lọc theo sao:</span>
          <button
            onClick={() => {
              setAdminReviewRatingFilter('');
              setReviewsPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors border ${
              adminReviewRatingFilter === ''
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'
            }`}
          >
            Tất Cả
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => {
                setAdminReviewRatingFilter(String(star));
                setReviewsPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 border ${
                adminReviewRatingFilter === String(star)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              <span>{star}</span>
              <span className="material-symbols-outlined text-xs fill-1 text-amber-400">star</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/60 border-b border-outline-variant">
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Khách Hàng</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">Đánh Giá</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Nội Dung Nhận Xét</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Phản Hồi Admin</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">Trạng Thái</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-xs">
            {safeReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant font-medium">
                  Không tìm thấy đánh giá nào phù hợp
                </td>
              </tr>
            ) : (
              safeReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-primary">{rev.userFullName}</p>
                    <p className="text-[10px] text-on-surface-variant">Product ID: #{rev.productId}</p>
                    <p className="text-[10px] text-on-surface-variant/70">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}
                    </p>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-sm ${
                            i < rev.rating ? 'fill-1 text-amber-500' : 'text-outline-variant'
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-primary mt-0.5 block">
                      {rev.rating}/5
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-body-md text-on-surface line-clamp-3">
                      "{rev.comment || 'Khách hàng không để lại nhận xét chữ.'}"
                    </p>
                  </td>
                  <td className="p-4">
                    {rev.adminReply ? (
                      <div className="bg-surface-container/50 p-2.5 rounded border border-outline-variant/60 text-xs">
                        <p className="font-bold text-primary text-[11px] mb-0.5">DuoStyle Replying:</p>
                        <p className="text-on-surface-variant italic line-clamp-2">{rev.adminReply}</p>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant/50 italic">Chưa có phản hồi</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-label-caps font-bold border ${
                        rev.active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {rev.active ? 'HIỂN THỊ' : 'ĐÃ ẨN'}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleReviewActive(rev)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                          rev.active
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {rev.active ? 'Ẩn' : 'Hiện'}
                      </button>
                      <button
                        onClick={() => {
                          setReplyingReview(rev);
                          setReplyText(rev.adminReply || '');
                        }}
                        className="px-3 py-1.5 bg-secondary text-primary border border-secondary rounded text-xs font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        Phản Hồi
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reviews Pagination */}
      <Pagination
        currentPage={reviewsPage}
        totalPages={totalReviewsPages}
        totalItems={safeReviews.length * totalReviewsPages}
        onPageChange={(p) => setReviewsPage(p)}
      />
    </div>
  );
}
