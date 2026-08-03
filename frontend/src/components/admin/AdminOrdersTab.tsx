import React from 'react';
import { formatVND } from '../ProductCard';
import Pagination from '../Pagination';

interface AdminOrdersTabProps {
  adminOrders?: any[];
  adminOrderSearch: string;
  setAdminOrderSearch: (search: string) => void;
  adminOrderFilter: string;
  setAdminOrderFilter: (filter: string) => void;
  ordersPage: number;
  setOrdersPage: (page: number) => void;
  handleUpdateOrderStatus: (orderId: number, status: string) => void;
  setSelectedOrderCode: (code: string) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  setSelectedInvoiceOrderCode?: (code: string) => void;
  setIsInvoiceModalOpen?: (open: boolean) => void;
}

export default function AdminOrdersTab({
  adminOrders = [],
  adminOrderSearch,
  setAdminOrderSearch,
  adminOrderFilter,
  setAdminOrderFilter,
  ordersPage,
  setOrdersPage,
  handleUpdateOrderStatus,
  setSelectedOrderCode,
  setIsDetailModalOpen,
  setSelectedInvoiceOrderCode,
  setIsInvoiceModalOpen,
}: AdminOrdersTabProps) {
  const safeOrders = Array.isArray(adminOrders) ? adminOrders : [];
  const filtered = safeOrders.filter((o) => {
    const matchesSearch =
      !adminOrderSearch ||
      o?.orderCode?.toLowerCase().includes(adminOrderSearch.toLowerCase()) ||
      o?.phone?.includes(adminOrderSearch);
    const matchesStatus =
      adminOrderFilter === 'ALL' || o?.status === adminOrderFilter;
    return matchesSearch && matchesStatus;
  });
  const pageSize = 10;
  const paginated = filtered.slice((ordersPage - 1) * pageSize, ordersPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
        <div>
          <span className="font-label-caps text-label-caps text-secondary mb-1 block uppercase tracking-widest font-bold">
            ORDER FULFILLMENT & MANAGEMENT
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">Quản Lý Đơn Hàng Khách Hàng</h2>
          <p className="font-body-md text-on-surface-variant/60 text-sm">
            Theo dõi tất cả đơn hàng, cập nhật trạng thái xử lý và vận chuyển toàn hệ thống DuoStyle.
          </p>
        </div>
      </div>

      {/* Order Status Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-md">
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng hoặc SĐT khách hàng..."
            value={adminOrderSearch}
            onChange={(e) => setAdminOrderSearch(e.target.value)}
            className="w-full py-2 pl-9 pr-3 border border-outline-variant rounded text-xs outline-none bg-white font-body-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 font-label-caps text-xs">
          <span className="text-on-surface-variant font-bold">Trạng thái:</span>
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setAdminOrderFilter(status)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-all font-bold ${
                adminOrderFilter === status
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {status === 'ALL' ? 'Tất Cả' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Orders Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/60 border-b border-outline-variant">
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Mã Đơn Hàng</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Ngày Đặt</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Giao Hàng & SĐT</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Thanh Toán</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">
                Trạng Thái Đơn
              </th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-right">Tổng Tiền</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-right">
                Thao Tác Admin
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-on-surface-variant font-medium">
                  Chưa có đơn hàng nào phù hợp
                </td>
              </tr>
            ) : (
              paginated.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4 font-bold text-primary">#{o.orderCode}</td>
                  <td className="p-4 text-on-surface-variant font-medium whitespace-nowrap">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-primary">{o.phone || 'Chưa SĐT'}</p>
                    <p className="text-[11px] text-on-surface-variant truncate max-w-xs">
                      {o.shippingAddress || 'Địa chỉ mặc định'}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-label-caps font-bold ${
                        o.paymentMethod === 'VNPAY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      className="py-1 px-2 border border-outline-variant rounded text-xs font-bold bg-white text-primary cursor-pointer shadow-2xs"
                    >
                      <option value="PENDING">PENDING (Chờ xác nhận)</option>
                      <option value="PROCESSING">PROCESSING (Đang xử lý)</option>
                      <option value="SHIPPED">SHIPPED (Đang vận chuyển)</option>
                      <option value="DELIVERED">DELIVERED (Đã giao hàng)</option>
                      <option value="CANCELLED">CANCELLED (Hủy đơn)</option>
                    </select>
                  </td>
                  <td className="p-4 text-right font-bold text-primary font-body-md text-sm">
                    {formatVND(o.totalAmount)}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrderCode(o.orderCode);
                          setIsDetailModalOpen(true);
                        }}
                        className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-secondary transition-colors cursor-pointer font-label-caps font-bold"
                      >
                        Xem Chi Tiết
                      </button>
                      <button
                        onClick={() => {
                          if (setSelectedInvoiceOrderCode && setIsInvoiceModalOpen) {
                            setSelectedInvoiceOrderCode(o.orderCode);
                            setIsInvoiceModalOpen(true);
                          }
                        }}
                        className="bg-surface-container text-primary border border-outline-variant hover:bg-outline-variant/30 text-xs px-2.5 py-1.5 rounded transition-colors cursor-pointer font-label-caps font-bold flex items-center gap-1"
                        title="In Hóa Đơn"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        In Hóa Đơn
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Orders Pagination */}
      <Pagination
        currentPage={ordersPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={(p) => setOrdersPage(p)}
      />
    </div>
  );
}
