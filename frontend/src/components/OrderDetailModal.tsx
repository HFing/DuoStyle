import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { resolveProductImage } from '../utils/product-image';
import { formatVND } from './ProductCard';
import WriteReviewModal from './WriteReviewModal';

export default function OrderDetailModal({ isOpen, onClose, orderCode, showToast }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);

  useEffect(() => {
    if (isOpen && orderCode) {
      setLoading(true);
      setErrorMsg('');
      api.get(`/orders/${orderCode}`)
        .then(res => {
          setLoading(false);
          if (res.data?.data) {
            setOrder(res.data.data);
          }
        })
        .catch(err => {
          setLoading(false);
          setErrorMsg(err.response?.data?.message || 'Không thể lấy thông tin chi tiết đơn hàng!');
        });
    }
  }, [isOpen, orderCode]);

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-label-caps">ĐÃ GIAO HÀNG THÀNH CÔNG</span>;
      case 'SHIPPED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold font-label-caps">ĐANG VẬN CHUYỂN</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold font-label-caps">ĐANG XỬ LÝ DỮ LIỆU</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold font-label-caps">ĐÃ HỦY ĐƠN</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold font-label-caps">MỚI ĐẶT (PENDING)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-surface-container hover:bg-outline-variant/40 flex items-center justify-center text-primary transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-label-caps text-xs text-on-surface-variant font-bold uppercase tracking-widest">Đang tải thông tin đơn hàng #{orderCode}...</p>
          </div>
        ) : errorMsg ? (
          <div className="py-12 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-error">error</span>
            <p className="font-body-md text-error font-medium">{errorMsg}</p>
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-white font-label-caps text-xs uppercase rounded cursor-pointer"
            >
              Đóng
            </button>
          </div>
        ) : order ? (
          <div>
            {/* Modal Header */}
            <div className="pb-6 border-b border-outline-variant/60 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <h3 className="font-headline-sm text-2xl font-bold text-primary">Chi Tiết Đơn Hàng #{order.orderCode}</h3>
                {getStatusBadge(order.status)}
              </div>
              <p className="font-body-md text-xs text-on-surface-variant">
                Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
              </p>
            </div>

            {/* Shipping & Payment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-surface-container/40 p-5 rounded-lg border border-outline-variant/40">
              <div>
                <h4 className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">local_shipping</span>
                  Thông Tin Giao Hàng
                </h4>
                <p className="font-body-md text-xs text-primary font-bold mb-1">SĐT: {order.phone || 'Chưa cung cấp'}</p>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Địa chỉ: {order.shippingAddress || 'Địa chỉ mặc định'}
                </p>
              </div>

              <div>
                <h4 className="font-label-caps text-xs text-secondary font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  Thanh Toán
                </h4>
                <p className="font-body-md text-xs text-primary font-bold mb-1">
                  Phương thức: {order.paymentMethod === 'VNPAY' ? 'Thanh toán trực tuyến VNPay' : 'Thanh toán khi nhận hàng (COD)'}
                </p>
                <p className="font-body-md text-xs text-emerald-700 font-bold">
                  Trạng thái thanh toán: {order.status === 'DELIVERED' || order.paymentMethod === 'VNPAY' ? 'Đã Thanh Toán' : 'Chờ Thanh Toán khi nhận hàng'}
                </p>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-8">
              <h4 className="font-label-caps text-xs text-primary font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Sản Phẩm Đã Đặt ({order.items?.length || 0})
              </h4>

              <div className="border border-outline-variant/60 rounded-lg overflow-hidden divide-y divide-outline-variant/40">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const price = item.price || 0;
                    const qty = item.quantity || 1;
                    const total = price * qty;
                    const sizeLabel = item.size === 'FREE_SIZE' ? 'FREE' : item.size || 'M';

                    const itemImage = resolveProductImage(item.imageUrl);

                    return (
                      <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-container/20 transition-colors">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-16 bg-surface-container rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                            <img 
                              src={itemImage} 
                              alt={item.productName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-body-md text-sm font-bold text-primary truncate mb-1">{item.productName || 'Sản Phẩm DuoStyle'}</p>
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label-caps">
                              <span className="bg-primary/10 px-2 py-0.5 rounded text-primary font-bold">Size: {sizeLabel}</span>
                              {item.color && <span>• Màu: {item.color}</span>}
                              <span>• SL: {qty}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-1">
                          <p className="font-body-md text-sm font-bold text-primary">{formatVND(total)}</p>
                          <p className="text-[11px] text-on-surface-variant">{formatVND(price)} / sản phẩm</p>
                          {order.status === 'DELIVERED' && (
                            <button
                              onClick={() => setSelectedProductForReview({
                                id: item.productId || item.productVariantId || item.id,
                                name: item.productName,
                                image: itemImage
                              })}
                              className="mt-1 px-3 py-1 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold rounded-full font-label-caps transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                            >
                              <span className="material-symbols-outlined text-xs">star</span>
                              Đánh Giá
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="p-6 text-center text-xs text-on-surface-variant">Không có thông tin chi tiết sản phẩm</p>
                )}
              </div>
            </div>

            {/* Total Summary Breakdown */}
            <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/40 space-y-3 mb-8">
              <div className="flex justify-between text-xs font-body-md text-on-surface-variant">
                <span>Tạm tính sản phẩm:</span>
                <span className="font-bold text-primary">{formatVND(order.subtotalAmount || order.totalAmount)}</span>
              </div>

              {order.voucherCode && (
                <div className="flex justify-between items-center text-xs font-body-md text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded border border-emerald-200">
                  <span className="flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-base text-emerald-600">confirmation_number</span>
                    Mã giảm giá ({order.voucherCode}):
                  </span>
                  <span className="font-bold text-emerald-700">-{formatVND(order.discountAmount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-body-md text-on-surface-variant">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-sm font-headline-sm pt-3 border-t border-outline-variant/60 font-bold text-primary">
                <span>TỔNG THÀNH TIỀN:</span>
                <span className="text-secondary text-lg">{formatVND(order.totalAmount)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/60">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary text-white text-xs font-label-caps uppercase font-bold rounded hover:bg-secondary transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={Boolean(selectedProductForReview)}
        onClose={() => setSelectedProductForReview(null)}
        product={selectedProductForReview}
        orderId={order?.id}
        onSuccess={() => {
          setSelectedProductForReview(null);
          showToast?.('Đánh giá sản phẩm thành công!', 'success');
        }}
        showToast={showToast}
      />
    </div>
  );
}
