# DuoStyle Checkout Voucher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one optional voucher to CART and BUY_NOW checkout with backend-authoritative eligibility, discount, stored pricing snapshots, and discounted COD/VNPay payment amounts.

**Architecture:** Extract voucher calculation into `VoucherService` so preview and order creation share the same rules. `OrderServiceImpl` first calculates a database-derived subtotal, asks `VoucherService` for an optional validated discount, persists subtotal/code/discount/final total, and creates Payment/VNPay from the final total. React previews the voucher but sends only its code during order creation.

**Tech Stack:** Java 25, Spring Boot 4.1, Spring Data JPA, JUnit/Mockito; React 19, Axios, Node test runner, Vite 8.

## Global Constraints

- One optional voucher per order; no stacking, quota, per-user usage, reservation, or campaign engine.
- Browser-supplied amounts are preview-only and never authoritative at order creation.
- Backend recalculates subtotal from current database variant prices.
- `totalAmount = max(subtotalAmount - discountAmount, 0)` and Payment/VNPay use `totalAmount`.
- Preserve CART, BUY_NOW, COD, VNPay, stock, delivery-profile, and payment-result behavior.

---

### Task 1: Shared Voucher Calculation Rules

**Files:**
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/response/VoucherCalculation.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/repository/VoucherRepository.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/VoucherService.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/VoucherServiceImpl.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/voucher/VoucherServiceImplTest.java`

**Interfaces:**
- Produces: `VoucherCalculation calculateVoucher(String code, BigDecimal subtotal)` containing normalized code and discount.
- Produces: active listing that excludes expired vouchers.
- Existing `applyVoucher(ApplyVoucherRequest)` delegates to the same calculator.

- [ ] **Step 1: Write failing voucher behavior tests**

```java
@Test
void percentVoucherUsesSubtotalAndMaximumCap() {
    VoucherCalculation result = service.calculateVoucher(" vip20 ", new BigDecimal("4000000"));
    assertEquals("VIP20", result.code());
    assertEquals(new BigDecimal("500000"), result.discountAmount());
}

@Test
void expiredVoucherIsRejected() {
    voucher.setExpiryDate(LocalDateTime.now().minusMinutes(1));
    assertThrows(CustomException.class,
            () -> service.calculateVoucher("OLD", new BigDecimal("1000000")));
}
```

Also cover fixed discount, minimum subtotal, inactive/missing voucher, unsupported type, negative values, and clamping discount to subtotal.

- [ ] **Step 2: Run focused test and verify RED**

Run installed Maven with `-Dtest=VoucherServiceImplTest test`.

Expected: compilation failure because `VoucherCalculation` and `calculateVoucher` do not exist.

- [ ] **Step 3: Implement the shared calculator**

```java
public VoucherCalculation calculateVoucher(String rawCode, BigDecimal subtotal) {
    Voucher voucher = requireUsableVoucher(normalize(rawCode));
    validateSubtotal(voucher, subtotal);
    BigDecimal discount = calculateDiscount(voucher, subtotal).min(subtotal);
    return new VoucherCalculation(voucher.getCode(), discount.setScale(0, RoundingMode.HALF_UP));
}
```

Use `LocalDateTime.now()` consistently for expiry and filter expired rows from the active response list.

- [ ] **Step 4: Run focused and full backend tests**

Expected: voucher tests and existing backend tests PASS.

---

### Task 2: Persist Authoritative Order Pricing Snapshot

**Files:**
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/request/CreateOrderRequest.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/entity/Order.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/response/OrderResponse.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/OrderServiceImpl.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/order/OrderServiceImplTest.java`

**Interfaces:**
- Consumes: Task 1 `calculateVoucher(code, subtotal)`.
- Produces request field `voucherCode`.
- Produces response fields `subtotalAmount`, `voucherCode`, `discountAmount`, and existing `totalAmount`.

- [ ] **Step 1: Write failing order pricing tests**

```java
@Test
void voucherOrderPersistsSnapshotAndCreatesPaymentFromDiscountedTotal() {
    request.setVoucherCode("VIP20");
    when(voucherService.calculateVoucher("VIP20", new BigDecimal("4000000")))
            .thenReturn(new VoucherCalculation("VIP20", new BigDecimal("500000")));

    OrderResponse result = service.createOrder(USER_EMAIL, request, servletRequest);

    assertEquals(new BigDecimal("4000000"), result.getSubtotalAmount());
    assertEquals(new BigDecimal("500000"), result.getDiscountAmount());
    assertEquals(new BigDecimal("3500000"), result.getTotalAmount());
    assertEquals(new BigDecimal("3500000"), savedPayment.getAmount());
}
```

Also test no-code zero discount, blank-code normalization, server subtotal unaffected by browser preview, and VNPay receiving the discounted order total.

- [ ] **Step 2: Run focused tests and verify RED**

Expected: missing snapshot/request fields and voucher dependency.

- [ ] **Step 3: Implement authoritative order calculation**

```java
order.setSubtotalAmount(subtotal);
VoucherCalculation voucher = optionalVoucher(request.getVoucherCode(), subtotal);
order.setVoucherCode(voucher.code());
order.setDiscountAmount(voucher.discountAmount());
order.setTotalAmount(subtotal.subtract(voucher.discountAmount()).max(BigDecimal.ZERO));
```

Build Payment only after final total is set. Ensure response mapping includes every snapshot field.

- [ ] **Step 4: Run focused and full backend tests**

Expected: PASS without changing non-voucher checkout behavior.

---

### Task 3: Frontend Voucher Preview Contract

**Files:**
- Modify: `frontend/src/checkout.js`
- Modify: `frontend/src/checkout.test.js`

**Interfaces:**
- Produces: `buildOrderPayload` optional normalized `voucherCode`.
- Produces: `calculateVoucherSummary(subtotal, appliedVoucher)` returning discount and total for display.

- [ ] **Step 1: Write failing pure tests**

```javascript
test('order payload sends only normalized voucher code', () => {
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
});
```

Also test no voucher, fixed preview discount, clamping, and removal returning the original subtotal.

- [ ] **Step 2: Run `npm.cmd test` and verify RED**

- [ ] **Step 3: Implement minimal pure helpers**

```javascript
export function calculateVoucherSummary(subtotal, appliedVoucher) {
  const discount = Math.min(Number(appliedVoucher?.calculatedDiscount) || 0, subtotal);
  return { subtotal, discount, total: Math.max(subtotal - discount, 0) };
}
```

- [ ] **Step 4: Run frontend tests**

Expected: PASS.

---

### Task 4: Checkout Voucher UI and End-to-End Verification

**Files:**
- Modify: `frontend/src/pages/CheckoutPage.jsx`
- Modify: `frontend/src/checkout.test.js`
- Test/verify existing backend voucher/order/payment tests.

**Interfaces:**
- Consumes: `/vouchers/apply`, Task 3 helpers, and Task 2 order response.
- Produces: applied voucher code passed into `buildOrderPayload` for CART and BUY_NOW.

- [ ] **Step 1: Extend failing tests for apply/remove/error state transitions**

```javascript
test('failed preview preserves the entered code and checkout inputs', () => {
  const state = voucherPreviewFailure({ enteredCode: 'OLD', currentVoucher: null });
  assert.equal(state.enteredCode, 'OLD');
  assert.equal(state.appliedVoucher, null);
});
```

- [ ] **Step 2: Verify RED**

- [ ] **Step 3: Implement Checkout voucher controls**

```jsx
const applyVoucher = async () => {
  const response = await api.post('/vouchers/apply', { code: voucherInput, orderAmount: subtotal });
  setAppliedVoucher(response.data.data);
};
```

Show input/apply/remove, loading, Vietnamese errors, subtotal, discount, and final preview. Preserve all checkout state on failure. Submit only `voucherCode`; after order success trust response snapshot.

- [ ] **Step 4: Run final verification**

```text
Backend focused voucher/order/payment tests
Backend full test suite
Frontend npm.cmd test
Frontend npm.cmd run lint
Frontend npm.cmd run build
```

Expected: all tests/build pass; existing unrelated lint warnings may remain but no lint errors.
