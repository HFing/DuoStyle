import React, { useState } from 'react';
import api from '../api/axios';
import {
  buildOrderPayload,
  buildVoucherPreviewRequest,
  calculateCheckoutSubtotal,
  getCheckoutBackDestination,
  resolveCheckoutPricing,
  resolveOrderAction,
  voucherPreviewApplied,
  voucherPreviewFailure,
  voucherPreviewRemoved,
} from '../utils/checkout';
import { formatVND } from '../components/ProductCard';

export default function CheckoutPage({
  checkout,
  user,
  onNavigate,
  onUserUpdate,
  onCheckoutComplete,
}) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherMessage, setVoucherMessage] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);

  const items = checkout?.items || [];
  const subtotal = calculateCheckoutSubtotal(items);
  const pricing = resolveCheckoutPricing({ subtotal, appliedVoucher, orderSnapshot });

  const applyVoucher = async () => {
    if (voucherLoading || submitting) return;
    if (!voucherInput.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá.');
      setVoucherMessage('');
      return;
    }

    setVoucherError('');
    setVoucherMessage('');
    setVoucherLoading(true);
    try {
      const response = await api.post('/vouchers/apply', buildVoucherPreviewRequest({
        enteredCode: voucherInput,
        subtotal,
      }));
      const voucher = response.data?.data;
      if (!voucher?.code || voucher.calculatedDiscount == null) {
        throw new Error('Hệ thống chưa trả về thông tin mã giảm giá hợp lệ.');
      }

      const nextState = voucherPreviewApplied({ enteredCode: voucher.code, appliedVoucher: voucher });
      setVoucherInput(nextState.enteredCode);
      setAppliedVoucher(nextState.appliedVoucher);
      setOrderSnapshot(null);
      setVoucherMessage(`Đã áp dụng mã ${nextState.enteredCode}.`);
    } catch (requestError) {
      const nextState = voucherPreviewFailure({ enteredCode: voucherInput, currentVoucher: appliedVoucher });
      setVoucherInput(nextState.enteredCode);
      setAppliedVoucher(nextState.appliedVoucher);
      setVoucherError(
        requestError.response?.data?.message
          || requestError.message
          || 'Không thể kiểm tra mã giảm giá. Vui lòng thử lại.',
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => {
    const nextState = voucherPreviewRemoved({ subtotal });
    setVoucherInput(nextState.enteredCode);
    setAppliedVoucher(nextState.appliedVoucher);
    setOrderSnapshot(null);
    setVoucherError('');
    setVoucherMessage('Đã gỡ mã giảm giá.');
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (submitting || voucherLoading) return;

    const normalizedPhone = phone.trim();
    const normalizedAddress = address.trim();
    if (!normalizedPhone || !normalizedAddress) {
      setError('Vui lòng nhập đầy đủ số điện thoại và địa chỉ giao hàng.');
      return;
    }
    if (items.length === 0) {
      setError('Không có sản phẩm hợp lệ để thanh toán.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const payload = buildOrderPayload({
        items,
        phone: normalizedPhone,
        address: normalizedAddress,
        paymentMethod,
        checkoutSource: checkout.source,
        voucherCode: appliedVoucher?.code,
      });
      const response = await api.post('/orders', payload);
      const order = response.data?.data;
      if (!order?.orderCode) {
        throw new Error('Order response is missing an order code');
      }
      setOrderSnapshot(order);

      onUserUpdate?.({ ...user, phone: normalizedPhone, address: normalizedAddress });
      const action = resolveOrderAction({ paymentMethod, paymentUrl: order.paymentUrl });

      if (action.type === 'redirect') {
        window.location.assign(action.url);
        return;
      }

      await onCheckoutComplete?.({
        source: checkout.source,
        orderCode: order.orderCode,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || requestError.message
          || 'Không thể tạo đơn hàng. Vui lòng kiểm tra thông tin và thử lại.',
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="mb-10">
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-bold mb-2">
          DuoStyle Checkout
        </p>
        <h1 className="font-headline-md text-headline-md text-primary mb-3">Xác Nhận Đơn Hàng</h1>
        <p className="font-body-md text-on-surface-variant">
          Kiểm tra sản phẩm, thông tin giao hàng và chọn phương thức thanh toán.
        </p>
      </div>

      <form onSubmit={submitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <section className="lg:col-span-7 space-y-8">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded p-6 md:p-8">
            <h2 className="font-headline-sm text-headline-sm mb-6">Thông Tin Giao Hàng</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="checkout-phone" className="font-label-caps text-label-caps uppercase font-bold block mb-2">
                  Số điện thoại
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full bg-white border border-outline-variant rounded px-4 py-3 font-body-md focus:border-primary focus:ring-primary"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label htmlFor="checkout-address" className="font-label-caps text-label-caps uppercase font-bold block mb-2">
                  Địa chỉ giao hàng
                </label>
                <textarea
                  id="checkout-address"
                  required
                  autoComplete="street-address"
                  rows="3"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="w-full bg-white border border-outline-variant rounded px-4 py-3 font-body-md focus:border-primary focus:ring-primary resize-y"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded p-6 md:p-8">
            <h2 className="font-headline-sm text-headline-sm mb-6">Phương Thức Thanh Toán</h2>
            <div className="space-y-3">
              {[
                { value: 'COD', title: 'Thanh toán khi nhận hàng', note: 'Thanh toán trực tiếp khi đơn hàng được giao.' },
                { value: 'VNPAY', title: 'VNPay Sandbox', note: 'Chuyển tới cổng thanh toán VNPay an toàn.' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex gap-4 border rounded p-4 cursor-pointer transition-colors ${
                    paymentMethod === option.value ? 'border-primary bg-surface-container-low' : 'border-outline-variant/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="font-body-md font-bold block">{option.title}</span>
                    <span className="font-body-md text-sm text-on-surface-variant">{option.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-5 bg-surface-container-low border border-outline-variant/40 rounded p-6 md:p-8 lg:sticky lg:top-32">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4 mb-6">
            <h2 className="font-headline-sm text-headline-sm">Đơn Hàng</h2>
            <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
              {checkout?.source === 'BUY_NOW' ? 'Mua ngay' : 'Giỏ hàng'}
            </span>
          </div>

          <div className="space-y-5">
            {items.map((item, index) => (
              <div key={`${item.productVariantId ?? item.variant?.id}-${index}`} className="flex gap-4">
                <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-surface-container rounded">
                  {item.image && <img src={item.image} alt={item.productName || 'Sản phẩm'} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md font-bold text-sm truncate">{item.productName || 'Sản phẩm DuoStyle'}</p>
                  {item.variantDetails && <p className="text-xs text-on-surface-variant mt-1">{item.variantDetails}</p>}
                  <div className="flex justify-between gap-3 mt-2 text-sm">
                    <span className="text-on-surface-variant">Số lượng: {item.quantity}</span>
                    <span className="font-bold">{formatVND((Number(item.price) || 0) * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant/50 mt-6 pt-6">
            <label htmlFor="checkout-voucher" className="font-label-caps text-label-caps uppercase font-bold block mb-2">
              Mã giảm giá
            </label>
            <div className="flex gap-2">
              <input
                id="checkout-voucher"
                type="text"
                value={voucherInput}
                onChange={(event) => setVoucherInput(event.target.value)}
                disabled={voucherLoading || submitting}
                className="min-w-0 flex-1 bg-white border border-outline-variant rounded px-4 py-3 font-body-md uppercase focus:border-primary focus:ring-primary disabled:opacity-50"
                placeholder="Nhập mã voucher"
              />
              <button
                type="button"
                onClick={applyVoucher}
                disabled={voucherLoading || submitting}
                className="border border-primary text-primary px-4 py-3 font-label-caps text-label-caps uppercase font-bold hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 rounded"
              >
                {voucherLoading ? 'Đang áp dụng...' : appliedVoucher ? 'Áp dụng lại' : 'Áp dụng'}
              </button>
            </div>
            {appliedVoucher && (
              <div className="flex items-center justify-between gap-3 mt-3 text-sm">
                <span className="font-bold text-primary">{appliedVoucher.code}</span>
                <button
                  type="button"
                  onClick={removeVoucher}
                  disabled={voucherLoading || submitting}
                  className="text-error underline underline-offset-2 disabled:opacity-50"
                >
                  Gỡ mã
                </button>
              </div>
            )}
            {voucherError && (
              <p role="alert" className="text-error text-sm mt-3">{voucherError}</p>
            )}
            {voucherMessage && !voucherError && (
              <p role="status" className="text-primary text-sm mt-3">{voucherMessage}</p>
            )}
          </div>

          <div className="space-y-3 border-t border-outline-variant/50 mt-6 pt-6">
            <div className="flex justify-between items-end gap-4">
              <span className="font-body-md text-on-surface-variant">Tạm tính</span>
              <span className="font-body-md font-bold">{formatVND(pricing.subtotal)}</span>
            </div>
            <div className="flex justify-between items-end gap-4">
              <span className="font-body-md text-on-surface-variant">Giảm giá</span>
              <span className="font-body-md font-bold text-primary">-{formatVND(pricing.discount)}</span>
            </div>
            <div className="flex justify-between items-end gap-4 border-t border-outline-variant/50 pt-3">
              <span className="font-label-caps text-label-caps uppercase font-bold">Thành tiền</span>
              <span className="font-headline-sm text-headline-sm font-bold">{formatVND(pricing.total)}</span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-2">
            {orderSnapshot
              ? 'Giá trị chính thức đã được xác nhận từ đơn hàng trên hệ thống.'
              : 'Giá trị xem trước sẽ được hệ thống tính lại khi tạo đơn hàng.'}
          </p>

          {error && (
            <div role="alert" className="bg-error-container text-on-error-container border border-error/20 rounded p-4 mt-6 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || voucherLoading || items.length === 0}
            className="w-full bg-primary text-on-primary py-4 mt-6 font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            {submitting ? 'Đang tạo đơn hàng...' : paymentMethod === 'VNPAY' ? 'Thanh Toán Qua VNPay' : 'Đặt Hàng COD'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              const destination = getCheckoutBackDestination(checkout);
              onNavigate?.(destination.page, '', destination.productId);
            }}
            className="w-full border border-primary text-primary py-3 mt-3 font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 rounded"
          >
            Quay Lại
          </button>
        </aside>
      </form>
    </main>
  );
}
