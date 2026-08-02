import React from 'react';
import { formatVND } from '../ProductCard';

interface AdminVouchersTabProps {
  adminVouchers?: any[];
  isAddVoucherModalOpen: boolean;
  setIsAddVoucherModalOpen: (open: boolean) => void;
  newVoucherCode: string;
  setNewVoucherCode: (val: string) => void;
  newVoucherTitle: string;
  setNewVoucherTitle: (val: string) => void;
  newVoucherDesc: string;
  setNewVoucherDesc: (val: string) => void;
  newVoucherDiscountType: string;
  setNewVoucherDiscountType: (val: string) => void;
  newVoucherDiscountValue: string;
  setNewVoucherDiscountValue: (val: string) => void;
  newVoucherMinOrder: string;
  setNewVoucherMinOrder: (val: string) => void;
  newVoucherMaxDiscount: string;
  setNewVoucherMaxDiscount: (val: string) => void;
  newVoucherExpiry: string;
  setNewVoucherExpiry: (val: string) => void;
  handleCreateVoucherSubmit: (e: React.FormEvent) => void;
  handleToggleVoucherStatus: (id: number) => void;
  handleDeleteVoucher: (id: number, code: string) => void;
}

export default function AdminVouchersTab({
  adminVouchers = [],
  isAddVoucherModalOpen,
  setIsAddVoucherModalOpen,
  newVoucherCode,
  setNewVoucherCode,
  newVoucherTitle,
  setNewVoucherTitle,
  newVoucherDesc,
  setNewVoucherDesc,
  newVoucherDiscountType,
  setNewVoucherDiscountType,
  newVoucherDiscountValue,
  setNewVoucherDiscountValue,
  newVoucherMinOrder,
  setNewVoucherMinOrder,
  newVoucherMaxDiscount,
  setNewVoucherMaxDiscount,
  newVoucherExpiry,
  setNewVoucherExpiry,
  handleCreateVoucherSubmit,
  handleToggleVoucherStatus,
  handleDeleteVoucher,
}: AdminVouchersTabProps) {
  const safeVouchers = Array.isArray(adminVouchers) ? adminVouchers : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
        <div>
          <span className="font-label-caps text-label-caps text-secondary mb-1 block uppercase tracking-widest font-bold">
            PROMOTION & DISCOUNT CAMPAIGNS
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">Quản Lý Mã Giảm Giá (Vouchers)</h2>
          <p className="font-body-md text-on-surface-variant/60 text-sm">
            Tạo và quản lý các chương trình ưu đãi, voucher giảm giá cho khách hàng DuoStyle.
          </p>
        </div>
        <button
          onClick={() => setIsAddVoucherModalOpen(true)}
          className="bg-primary text-white font-label-caps text-xs px-5 py-3 rounded hover:bg-secondary transition-colors cursor-pointer flex items-center gap-2 font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">confirmation_number</span>
          Tạo Voucher Mới
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/60 border-b border-outline-variant">
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Mã Code</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Tên Chương Trình</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Mức Giảm</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Điều Kiện Đơn Hàng</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Hạn Sử Dụng</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">Trạng Thái</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-xs">
            {safeVouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-on-surface-variant font-medium">
                  Chưa có Voucher nào trong hệ thống
                </td>
              </tr>
            ) : (
              safeVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-primary text-sm">
                    <span className="px-2.5 py-1 bg-surface-container rounded border border-outline-variant">
                      {v.code}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-primary">{v.title || v.code}</p>
                    <p className="text-[11px] text-on-surface-variant/70 truncate max-w-xs">
                      {v.description || 'Không có mô tả'}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-secondary">
                    {v.discountType === 'PERCENT'
                      ? `${v.discountValue}% ${v.maxDiscountAmount ? `(Tối đa ${formatVND(v.maxDiscountAmount)})` : ''}`
                      : formatVND(v.discountValue)}
                  </td>
                  <td className="p-4 text-on-surface-variant">
                    Từ {formatVND(v.minOrderAmount || 0)}
                  </td>
                  <td className="p-4 text-on-surface-variant whitespace-nowrap">
                    {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-label-caps font-bold border ${
                        v.active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {v.active ? 'ĐANG KÍCH HOẠT' : 'ĐÃ TẮT'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleVoucherStatus(v.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                          v.active
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {v.active ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(v.id, v.code)}
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

      {/* CREATE VOUCHER MODAL */}
      {isAddVoucherModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <h4 className="font-headline-sm text-lg font-bold text-primary">Tạo Voucher Ưu Đãi Mới</h4>
                <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                  Thiết lập Mã Code & Điều Kiện Áp Dụng
                </p>
              </div>
              <button
                onClick={() => setIsAddVoucherModalOpen(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateVoucherSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Mã Voucher (Code) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: DUOSTYLE100K, ELEGANCE20"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border border-outline-variant rounded font-mono font-bold text-xs uppercase"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Tên Chương Trình / Tiêu Đề
                </label>
                <input
                  type="text"
                  placeholder="VD: Giảm 100K cho đơn từ 500K"
                  value={newVoucherTitle}
                  onChange={(e) => setNewVoucherTitle(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded text-xs"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                  Mô Tả Ưu Đãi
                </label>
                <input
                  type="text"
                  placeholder="VD: Áp dụng cho toàn bộ đơn hàng dịp Khai Trương"
                  value={newVoucherDesc}
                  onChange={(e) => setNewVoucherDesc(e.target.value)}
                  className="w-full p-2.5 border border-outline-variant rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Loại Giảm Giá *
                  </label>
                  <select
                    value={newVoucherDiscountType}
                    onChange={(e) => setNewVoucherDiscountType(e.target.value)}
                    className="w-full p-2.5 border border-outline-variant rounded font-bold text-xs bg-white"
                  >
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                    <option value="PERCENT">Phần trăm (%)</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Giá Trị Giảm *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={newVoucherDiscountType === 'FIXED' ? 'VD: 100000' : 'VD: 15'}
                    value={newVoucherDiscountValue}
                    onChange={(e) => setNewVoucherDiscountValue(e.target.value)}
                    className="w-full p-2.5 border border-outline-variant rounded font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Đơn Hàng Tối Thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 500000"
                    value={newVoucherMinOrder}
                    onChange={(e) => setNewVoucherMinOrder(e.target.value)}
                    className="w-full p-2.5 border border-outline-variant rounded text-xs font-bold"
                  />
                </div>

                {newVoucherDiscountType === 'PERCENT' ? (
                  <div>
                    <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                      Giảm Tối Đa (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 200000"
                      value={newVoucherMaxDiscount}
                      onChange={(e) => setNewVoucherMaxDiscount(e.target.value)}
                      className="w-full p-2.5 border border-outline-variant rounded text-xs font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                      Ngày Hết Hạn
                    </label>
                    <input
                      type="date"
                      value={newVoucherExpiry}
                      onChange={(e) => setNewVoucherExpiry(e.target.value)}
                      className="w-full p-2.5 border border-outline-variant rounded text-xs"
                    />
                  </div>
                )}
              </div>

              {newVoucherDiscountType === 'PERCENT' && (
                <div>
                  <label className="font-label-caps text-xs text-primary font-bold block mb-1">
                    Ngày Hết Hạn
                  </label>
                  <input
                    type="date"
                    value={newVoucherExpiry}
                    onChange={(e) => setNewVoucherExpiry(e.target.value)}
                    className="w-full p-2.5 border border-outline-variant rounded text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsAddVoucherModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant font-label-caps uppercase rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white font-label-caps uppercase rounded font-bold hover:bg-secondary transition-colors cursor-pointer"
                >
                  + Tạo Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
