import assert from 'node:assert/strict';
import test from 'node:test';

import { buildOrderPayload, readPaymentResult } from '../services/checkoutService.ts';
import * as checkout from '../services/checkoutService.ts';

test('cart checkout total equals the database variant subtotal without voucher or VAT adjustments', () => {
  assert.equal(typeof checkout.calculateCheckoutSubtotal, 'function');
  assert.equal(checkout.calculateCheckoutSubtotal([
    { price: 400000, quantity: 2 },
    { price: 250000, quantity: 1 },
  ]), 1050000);
});

test('buildOrderPayload emits only variant IDs and quantities for cart items', () => {
  const payload = buildOrderPayload({
    items: [
      { id: 501, productVariantId: 10, price: 400000, quantity: 2 },
      { id: 502, productVariantId: 20, price: 250000, quantity: 1 },
    ],
    phone: ' 0901234567 ',
    address: ' 1 Nguyen Hue ',
    paymentMethod: 'COD',
    checkoutSource: 'CART',
  });

  assert.deepEqual(payload, {
    shippingAddress: '1 Nguyen Hue',
    phone: '0901234567',
    paymentMethod: 'COD',
    checkoutSource: 'CART',
    items: [
      { productVariantId: 10, quantity: 2 },
      { productVariantId: 20, quantity: 1 },
    ],
  });
});

test('buildOrderPayload sends only an uppercase trimmed voucher code', () => {
  const payload = buildOrderPayload({
    items: [{ productVariantId: 12, quantity: 1 }],
    phone: '0901234567',
    address: '1 Nguyen Hue',
    paymentMethod: 'COD',
    checkoutSource: 'CART',
    voucherCode: ' vip20 ',
  });

  assert.equal(payload.voucherCode, 'VIP20');
  assert.equal(payload.discountAmount, undefined);
  assert.equal(payload.totalAmount, undefined);
});

test('buildOrderPayload omits an empty voucher code', () => {
  const payload = buildOrderPayload({
    items: [{ productVariantId: 12, quantity: 1 }],
    phone: '0901234567',
    address: '1 Nguyen Hue',
    paymentMethod: 'COD',
    checkoutSource: 'CART',
    voucherCode: '   ',
  });

  assert.equal('voucherCode' in payload, false);
});

test('calculateVoucherSummary previews a fixed discount', () => {
  assert.equal(typeof checkout.calculateVoucherSummary, 'function');
  assert.deepEqual(
    checkout.calculateVoucherSummary(1000000, { calculatedDiscount: 150000 }),
    { subtotal: 1000000, discount: 150000, total: 850000 },
  );
});

test('calculateVoucherSummary clamps invalid inputs and discount to the subtotal', () => {
  assert.deepEqual(
    checkout.calculateVoucherSummary(100000, { calculatedDiscount: 125000 }),
    { subtotal: 100000, discount: 100000, total: 0 },
  );
  assert.deepEqual(
    checkout.calculateVoucherSummary(-1, { calculatedDiscount: -500 }),
    { subtotal: 0, discount: 0, total: 0 },
  );
});

test('voucher preview helpers preserve inputs on failure and restore the original subtotal after removal', () => {
  assert.equal(typeof checkout.voucherPreviewFailure, 'function');
  assert.equal(typeof checkout.voucherPreviewApplied, 'function');
  assert.equal(typeof checkout.voucherPreviewRemoved, 'function');

  const applied = { code: 'VIP20', calculatedDiscount: 150000 };
  assert.deepEqual(
    checkout.voucherPreviewApplied({ enteredCode: ' vip20 ', appliedVoucher: applied }),
    { enteredCode: 'VIP20', appliedVoucher: applied },
  );
  assert.deepEqual(
    checkout.voucherPreviewFailure({ enteredCode: 'OLD', currentVoucher: applied }),
    { enteredCode: 'OLD', appliedVoucher: applied },
  );
  assert.deepEqual(
    checkout.voucherPreviewRemoved({ subtotal: 1000000 }),
    { enteredCode: '', appliedVoucher: null, summary: { subtotal: 1000000, discount: 0, total: 1000000 } },
  );
});

test('voucher preview request sends the entered code with the current display subtotal', () => {
  assert.equal(typeof checkout.buildVoucherPreviewRequest, 'function');
  assert.deepEqual(
    checkout.buildVoucherPreviewRequest({ enteredCode: ' vip20 ', subtotal: 1000000 }),
    { code: ' vip20 ', orderAmount: 1000000 },
  );
});

test('successful order response replaces the browser voucher preview with backend pricing snapshots', () => {
  assert.equal(typeof checkout.resolveCheckoutPricing, 'function');
  assert.deepEqual(
    checkout.resolveCheckoutPricing({
      subtotal: 1000000,
      appliedVoucher: { code: 'VIP20', calculatedDiscount: 150000 },
      orderSnapshot: {
        subtotalAmount: 1100000,
        voucherCode: 'VIP20',
        discountAmount: 100000,
        totalAmount: 1000000,
      },
    }),
    { subtotal: 1100000, discount: 100000, total: 1000000 },
  );
});

test('buildOrderPayload normalizes a buy-now variant shape', () => {
  const payload = buildOrderPayload({
    items: [{ variant: { id: 41 }, quantity: 1, price: 800000 }],
    phone: '0901234567',
    address: '1 Nguyen Hue',
    paymentMethod: 'VNPAY',
    checkoutSource: 'BUY_NOW',
  });

  assert.deepEqual(payload.items, [{ productVariantId: 41, quantity: 1 }]);
});

test('buildOrderPayload keeps buy-now isolated from stale cart items', () => {
  const payload = buildOrderPayload({
    items: [
      { variant: { id: 41 }, quantity: 2, price: 800000 },
      { productVariantId: 99, quantity: 4, price: 120000 },
    ],
    phone: '0901234567',
    address: '1 Nguyen Hue',
    paymentMethod: 'COD',
    checkoutSource: 'BUY_NOW',
  });

  assert.deepEqual(payload.items, [{ productVariantId: 41, quantity: 2 }]);
});

test('buildOrderPayload rejects a cart item whose mapped variant ID was dropped', () => {
  assert.throws(
    () => buildOrderPayload({
      items: [{ id: 501, productVariantId: undefined, quantity: 2 }],
      phone: '0901234567',
      address: '1 Nguyen Hue',
      paymentMethod: 'COD',
      checkoutSource: 'CART',
    }),
    /product variant ID/,
  );
});

test('readPaymentResult preserves a cancelled VNPay return', () => {
  assert.deepEqual(readPaymentResult('?outcome=cancelled&orderCode=DS-123'), {
    outcome: 'cancelled',
    orderCode: 'DS-123',
  });
});

test('readPaymentResult safely falls back for unsupported or missing outcomes', () => {
  assert.deepEqual(readPaymentResult('?outcome=unexpected&orderCode=DS-123'), {
    outcome: 'failed',
    orderCode: 'DS-123',
  });
  assert.deepEqual(readPaymentResult(''), { outcome: 'failed', orderCode: '' });
});

test('VNPay checkout rejects a response without a nonblank hosted URL', () => {
  assert.equal(typeof checkout.resolveOrderAction, 'function');
  assert.throws(
    () => checkout.resolveOrderAction({ paymentMethod: 'VNPAY', paymentUrl: '   ' }),
    /hosted payment URL/i,
  );
});

test('only COD checkout completes locally', () => {
  assert.equal(typeof checkout.resolveOrderAction, 'function');
  assert.deepEqual(
    checkout.resolveOrderAction({ paymentMethod: 'COD', paymentUrl: null }),
    { type: 'complete' },
  );
  assert.deepEqual(
    checkout.resolveOrderAction({ paymentMethod: 'VNPAY', paymentUrl: ' https://sandbox.vnpayment.vn/pay ' }),
    { type: 'redirect', url: 'https://sandbox.vnpayment.vn/pay' },
  );
});

test('COD success is classified as an order placed for payment on delivery', () => {
  assert.equal(typeof checkout.classifyPaymentResult, 'function');
  assert.equal(
    checkout.classifyPaymentResult({ outcome: 'success', paymentMethod: 'COD' }),
    'order-placed',
  );
  assert.equal(
    checkout.classifyPaymentResult({ outcome: 'success' }),
    'payment-success',
  );
});

test('buy-now checkout keeps only its safe product origin for back navigation', () => {
  assert.equal(typeof checkout.createCheckoutHistoryState, 'function');
  assert.equal(typeof checkout.getCheckoutBackDestination, 'function');

  assert.deepEqual(checkout.createCheckoutHistoryState({
    source: 'BUY_NOW',
    originProductId: 17,
    items: [{ productVariantId: 81, quantity: 2 }],
    phone: '0901234567',
  }), { page: 'checkout', checkoutSource: 'BUY_NOW', originProductId: 17 });
  assert.deepEqual(checkout.getCheckoutBackDestination({
    source: 'BUY_NOW',
    originProductId: 17,
  }), { page: 'product-detail', productId: 17 });
  assert.deepEqual(checkout.getCheckoutBackDestination({ source: 'CART' }), {
    page: 'cart',
    productId: null,
  });
});

test('refreshing an in-memory buy-now checkout recovers to catalog with an explanation', () => {
  assert.equal(typeof checkout.resolveInitialNavigation, 'function');
  assert.deepEqual(checkout.resolveInitialNavigation('', {
    page: 'checkout',
    checkoutSource: 'BUY_NOW',
    originProductId: 17,
  }), {
    page: 'collections',
    recoveryMessage: 'Phiên Mua ngay đã hết sau khi tải lại trang. Vui lòng chọn lại sản phẩm.',
  });
});

test('payment results link to Home and the actual order-history tab for every outcome', () => {
  assert.equal(typeof checkout.getPaymentResultActions, 'function');
  assert.equal(typeof checkout.resolveProfileTabIntent, 'function');

  for (const outcome of ['success', 'cancelled', 'failed']) {
    assert.deepEqual(checkout.getPaymentResultActions(outcome), {
      primary: { page: 'home' },
      secondary: { page: 'profile', profileTab: 'orders' },
    });
  }
  assert.equal(checkout.resolveProfileTabIntent({ profileTab: 'orders' }), 'orders');
  assert.equal(checkout.resolveProfileTabIntent({ profileTab: 'unknown' }), 'profile');
});

test('App owns post-login navigation and safely resumes checkout intent', () => {
  assert.equal(typeof checkout.resolvePostLoginNavigation, 'function');
  const buyNow = {
    source: 'BUY_NOW',
    originProductId: 17,
    items: [{ productVariantId: 81, quantity: 1 }],
  };

  assert.deepEqual(checkout.resolvePostLoginNavigation({
    isAdmin: false,
    pendingCheckout: buyNow,
    authenticatedCartItems: [],
  }), { page: 'checkout', checkout: buyNow, message: '' });
  assert.deepEqual(checkout.resolvePostLoginNavigation({
    isAdmin: false,
    pendingCheckout: { source: 'CART' },
    authenticatedCartItems: [{ productVariantId: 91, quantity: 2 }],
  }), {
    page: 'checkout',
    checkout: { source: 'CART', items: [{ productVariantId: 91, quantity: 2 }] },
    message: '',
  });
  assert.deepEqual(checkout.resolvePostLoginNavigation({
    isAdmin: true,
    pendingCheckout: buyNow,
    authenticatedCartItems: [],
  }), { page: 'admin', checkout: null, message: '' });
});

test('admin navigation can authorize with the freshly logged-in user before React state catches up', () => {
  assert.equal(typeof checkout.resolveAccessControlledPage, 'function');
  const admin = { roles: ['ROLE_ADMIN'] };

  assert.equal(checkout.resolveAccessControlledPage({
    requestedPage: 'admin',
    user: admin,
    isAdmin: true,
  }), 'admin');
  assert.equal(checkout.resolveAccessControlledPage({
    requestedPage: 'admin',
    user: null,
    isAdmin: false,
  }), 'not-found');
});
