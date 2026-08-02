const PAYMENT_OUTCOMES = new Set(['success', 'cancelled', 'failed']);
const BUY_NOW_RECOVERY_MESSAGE = 'Phiên Mua ngay đã hết sau khi tải lại trang. Vui lòng chọn lại sản phẩm.';

export function calculateCheckoutSubtotal(items: any[] = []): number {
  return items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
}

export function buildOrderPayload({ items, phone, address, paymentMethod, checkoutSource, voucherCode }: any) {
  const checkoutItems = checkoutSource === 'BUY_NOW' ? items.slice(0, 1) : items;
  const normalizedVoucherCode = String(voucherCode ?? '').trim().toUpperCase();

  return {
    shippingAddress: String(address ?? '').trim(),
    phone: String(phone ?? '').trim(),
    paymentMethod,
    checkoutSource,
    items: checkoutItems.map((item: any) => {
      const productVariantId = item.productVariantId ?? item.variant?.id;
      if (productVariantId == null) {
        throw new Error('Checkout item is missing a product variant ID');
      }

      return { productVariantId, quantity: item.quantity };
    }),
    ...(normalizedVoucherCode ? { voucherCode: normalizedVoucherCode } : {}),
  };
}

export function calculateVoucherSummary(subtotal: number, appliedVoucher?: any) {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const requestedDiscount = Math.max(Number(appliedVoucher?.calculatedDiscount) || 0, 0);
  const discount = Math.min(requestedDiscount, normalizedSubtotal);

  return {
    subtotal: normalizedSubtotal,
    discount,
    total: Math.max(normalizedSubtotal - discount, 0),
  };
}

export function buildVoucherPreviewRequest({ enteredCode, subtotal }: any) {
  return {
    code: String(enteredCode ?? ''),
    orderAmount: calculateVoucherSummary(subtotal, null).subtotal,
  };
}

export function resolveCheckoutPricing({ subtotal, appliedVoucher, orderSnapshot }: any) {
  if (orderSnapshot) {
    const snapshot = {
      subtotal: Number(orderSnapshot.subtotalAmount),
      discount: Number(orderSnapshot.discountAmount),
      total: Number(orderSnapshot.totalAmount),
    };
    const hasCompleteSnapshot = [
      orderSnapshot.subtotalAmount,
      orderSnapshot.discountAmount,
      orderSnapshot.totalAmount,
    ].every((amount) => amount != null)
      && Object.values(snapshot).every(Number.isFinite);

    if (hasCompleteSnapshot) return snapshot;
  }

  return calculateVoucherSummary(subtotal, appliedVoucher);
}

export function voucherPreviewApplied({ enteredCode, appliedVoucher }: any) {
  return {
    enteredCode: String(enteredCode ?? '').trim().toUpperCase(),
    appliedVoucher,
  };
}

export function voucherPreviewFailure({ enteredCode, currentVoucher }: any) {
  return { enteredCode, appliedVoucher: currentVoucher };
}

export function voucherPreviewRemoved({ subtotal }: { subtotal: number }) {
  return {
    enteredCode: '',
    appliedVoucher: null,
    summary: calculateVoucherSummary(subtotal, null),
  };
}

export function readPaymentResult(search: string) {
  const params = new URLSearchParams(search);
  const outcome = params.get('outcome');

  return {
    outcome: PAYMENT_OUTCOMES.has(outcome || '') ? outcome : 'failed',
    orderCode: params.get('orderCode') || '',
  };
}

export function resolveOrderAction({ paymentMethod, paymentUrl }: any) {
  if (paymentMethod === 'VNPAY') {
    const hostedUrl = typeof paymentUrl === 'string' ? paymentUrl.trim() : '';
    if (!hostedUrl) {
      throw new Error('VNPay chưa trả về hosted payment URL hợp lệ. Vui lòng thử lại.');
    }
    return { type: 'redirect', url: hostedUrl };
  }
  if (paymentMethod === 'COD') {
    return { type: 'complete' };
  }
  throw new Error('Unsupported payment method');
}

export function classifyPaymentResult({ outcome, paymentMethod }: any) {
  if (outcome === 'success') {
    return paymentMethod === 'COD' ? 'order-placed' : 'payment-success';
  }
  return outcome === 'cancelled' ? 'payment-cancelled' : 'payment-failed';
}

export function createCheckoutHistoryState({ source, originProductId }: any) {
  const normalizedProductId = Number(originProductId);
  return {
    page: 'checkout',
    checkoutSource: source,
    ...(source === 'BUY_NOW' && Number.isInteger(normalizedProductId) && normalizedProductId > 0
      ? { originProductId: normalizedProductId }
      : {}),
  };
}

export function getCheckoutBackDestination({ source, originProductId }: any = {}) {
  const normalizedProductId = Number(originProductId);
  if (source === 'BUY_NOW' && Number.isInteger(normalizedProductId) && normalizedProductId > 0) {
    return { page: 'product-detail', productId: normalizedProductId };
  }
  return { page: 'cart', productId: null };
}

export function getPaymentOutcomeToast(outcome?: string | null, orderCode?: string | null) {
  const code = orderCode ? ` #${orderCode}` : '';
  if (outcome === 'success') {
    return { message: `Thanh toán VNPay đơn hàng${code} thành công!`, type: 'success' as const };
  }
  if (outcome === 'cancelled') {
    return { message: `Đã hủy thanh toán VNPay cho đơn hàng${code}.`, type: 'error' as const };
  }
  return { message: `Thanh toán VNPay cho đơn hàng${code} thất bại.`, type: 'error' as const };
}

export function resolveInitialNavigation(search: string, historyState: any) {
  const params = new URLSearchParams(search);
  if (params.get('page') === 'payment-result') {
    const outcome = params.get('outcome') || 'success';
    const orderCode = params.get('orderCode') || '';
    const toastInfo = getPaymentOutcomeToast(outcome, orderCode);

    return {
      page: 'profile',
      profileTab: 'orders',
      autoOpenOrderCode: orderCode,
      recoveryMessage: '',
      toastMessage: toastInfo.message,
      toastType: toastInfo.type,
    };
  }
  if (historyState?.page === 'checkout' && historyState.checkoutSource === 'BUY_NOW') {
    return { page: 'collections', recoveryMessage: BUY_NOW_RECOVERY_MESSAGE };
  }
  return { page: 'home', recoveryMessage: '' };
}

export function getPaymentResultActions() {
  return {
    primary: { page: 'home' },
    secondary: { page: 'profile', profileTab: 'orders' },
  };
}

export function resolveProfileTabIntent(intent: any) {
  return intent?.profileTab === 'orders' ? 'orders' : 'profile';
}

export function resolvePostLoginNavigation({ isAdmin, pendingCheckout, authenticatedCartItems = [] }: any) {
  if (isAdmin) {
    return { page: 'admin', checkout: null, message: '' };
  }
  if (pendingCheckout?.source === 'BUY_NOW' && pendingCheckout.items?.length) {
    return { page: 'checkout', checkout: pendingCheckout, message: '' };
  }
  if (pendingCheckout?.source === 'CART') {
    if (authenticatedCartItems.length) {
      return {
        page: 'checkout',
        checkout: { source: 'CART', items: authenticatedCartItems },
        message: '',
      };
    }
    return {
      page: 'cart',
      checkout: null,
      message: 'Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán.',
    };
  }
  return { page: 'profile', checkout: null, message: '' };
}

export function resolveAccessControlledPage({ requestedPage, user, isAdmin }: any) {
  if (requestedPage === 'admin' && (!user || !isAdmin)) return 'not-found';
  if (requestedPage === 'profile') {
    if (!user) return 'login';
    if (isAdmin) return 'admin';
  }
  return requestedPage;
}
