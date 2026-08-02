# DuoStyle Order Checkout, VNPay, and Database Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a local end-to-end COD/VNPay checkout for cart and buy-now purchases, persist delivery details, show payment cancellation, and load Home products exclusively from MySQL.

**Architecture:** Spring Boot remains authoritative for users, variants, totals, inventory, orders, payments, and VNPay verification. React adds a shared Checkout page plus a Payment Result page within the existing state-based navigation; cart and buy-now provide different item sources to the same order API.

**Tech Stack:** Java 25, Spring Boot 4.1, Spring MVC/Security/Data JPA, MySQL, JUnit/Mockito; React 19, Axios, Vite 8, Node built-in test runner.

## Global Constraints

- Local development only; do not add idempotency, webhook/IPN, retry, reservation expiry, or production payment infrastructure.
- Use VNPay Sandbox hosted payment and redirect back to `http://localhost:5173`.
- Never accept item prices or totals from the browser.
- Save checkout phone/address to both the order snapshot and the user's default profile.
- Clear the cart only after successful cart-source checkout.
- Home must not substitute hard-coded product data when API requests fail or return no products.

---

## File Structure

- `backend/src/main/java/com/DuoStyle/DuoStyle/enums/CheckoutSource.java`: identifies CART versus BUY_NOW behavior.
- `backend/src/main/java/com/DuoStyle/DuoStyle/enums/PaymentStatus.java`: type-safe payment lifecycle used by order and callback logic.
- `backend/src/main/java/com/DuoStyle/DuoStyle/dto/request/CreateOrderRequest.java`: delivery, payment, source, and line items.
- `backend/src/main/java/com/DuoStyle/DuoStyle/repository/PaymentRepository.java`: payment lookup by order and VNPay transaction reference.
- `backend/src/main/java/com/DuoStyle/DuoStyle/repository/OrderRepository.java`: authenticated-user ownership queries.
- `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/OrderServiceImpl.java`: order validation, pricing, profile updates, COD inventory, and source-aware cart cleanup.
- `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/PaymentServiceImpl.java`: signed VNPay URL creation and verified return processing.
- `backend/src/main/java/com/DuoStyle/DuoStyle/controller/PaymentController.java`: browser redirect endpoint only.
- `frontend/src/checkout.js`: pure payload/result helpers, independently testable without rendering.
- `frontend/src/pages/CheckoutPage.jsx`: shared delivery and payment UI.
- `frontend/src/pages/PaymentResultPage.jsx`: success/cancellation/failure UI.
- `frontend/src/App.jsx`: navigation state, authenticated cart synchronization, and database-only Home loading.

---

### Task 1: Checkout Contract and Persistence Queries

**Files:**
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/enums/CheckoutSource.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/enums/PaymentStatus.java`
- Create: `backend/src/main/java/com/DuoStyle/DuoStyle/repository/PaymentRepository.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/entity/Payment.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/request/CreateOrderRequest.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/repository/OrderRepository.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/order/CheckoutContractTest.java`

**Interfaces:**
- Produces: `CheckoutSource { CART, BUY_NOW }`, `PaymentStatus { PENDING, SUCCESS, CANCELLED, FAILED }`.
- Produces: `PaymentRepository.findByOrderId(Long)` and `OrderRepository.findByOrderCodeIgnoreCaseAndUserEmail(String,String)`.
- Produces request fields `shippingAddress`, `phone`, `paymentMethod`, `checkoutSource`, `items`.

- [ ] **Step 1: Write a failing contract test**

```java
@Test
void createOrderRequestCarriesCheckoutSource() {
    CreateOrderRequest request = new CreateOrderRequest();
    request.setCheckoutSource(CheckoutSource.CART);
    assertEquals(CheckoutSource.CART, request.getCheckoutSource());
}
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `backend\mvnw.cmd -f backend\pom.xml -Dtest=CheckoutContractTest test`

Expected: compilation fails because `CheckoutSource` and its accessors do not exist.

- [ ] **Step 3: Add the minimal enums, typed payment status, and repositories**

```java
public enum CheckoutSource { CART, BUY_NOW }
public enum PaymentStatus { PENDING, SUCCESS, CANCELLED, FAILED }

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
}
```

Add `CheckoutSource checkoutSource` to `CreateOrderRequest`, replace `Payment.status` string with `@Enumerated(EnumType.STRING) PaymentStatus status`, and add the owned order query.

- [ ] **Step 4: Run the focused test and full backend baseline**

Run: `backend\mvnw.cmd -f backend\pom.xml -Dtest=CheckoutContractTest test`

Expected: PASS.

- [ ] **Step 5: Commit if Git becomes available**

```text
feat: define checkout and payment contracts
```

---

### Task 2: Order Creation, Delivery Details, Inventory, and Cart Semantics

**Files:**
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/OrderService.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/OrderServiceImpl.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/repository/OrderRepository.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/dto/response/OrderResponse.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/controller/OrderController.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/order/OrderServiceImplTest.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/order/OrderControllerTest.java`

**Interfaces:**
- Consumes: Task 1 checkout/payment enums and repositories.
- Produces: `OrderResponse createOrder(String email, CreateOrderRequest request, HttpServletRequest request)`.
- Produces: owned `getUserOrders` and `getOrderByCode` behavior.
- Produces: a VNPay order with `PENDING` states and payment URL; a COD order with `PROCESSING` and reduced stock.

- [ ] **Step 1: Write failing service tests for the business behaviors**

```java
@Test
void codCartOrderUsesDatabasePricesSavesProfileDecrementsStockAndClearsCart() {
    CreateOrderRequest request = request(CART, COD, item(11L, 2), item(22L, 1));
    OrderResponse result = service.createOrder("user@duostyle.local", request, servletRequest);
    assertEquals(new BigDecimal("750000"), result.getTotalAmount());
    assertEquals(OrderStatus.PROCESSING, result.getStatus());
    assertEquals("0901234567", user.getPhone());
    assertTrue(cart.getItems().isEmpty());
    assertEquals(3, firstVariant.getStockQuantity());
}

@Test
void buyNowDoesNotClearExistingCart() {
    int originalSize = cart.getItems().size();
    service.createOrder("user@duostyle.local", request(BUY_NOW, COD, item(11L, 1)), servletRequest);
    assertEquals(originalSize, cart.getItems().size());
}

@Test
void vnpayOrderKeepsStockAndCartPendingUntilReturn() {
    int originalStock = firstVariant.getStockQuantity();
    OrderResponse result = service.createOrder(
            "user@duostyle.local", request(CART, VNPAY, item(11L, 1)), servletRequest);
    assertEquals(OrderStatus.PENDING, result.getStatus());
    assertNotNull(result.getPaymentUrl());
    assertEquals(originalStock, firstVariant.getStockQuantity());
    assertFalse(cart.getItems().isEmpty());
}
```

Also test empty items, blank delivery fields, quantity zero, missing variant, insufficient stock, and another user's order lookup.

- [ ] **Step 2: Run tests and verify RED**

Run: `backend\mvnw.cmd -f backend\pom.xml -Dtest=OrderServiceImplTest,OrderControllerTest test`

Expected: failures for missing validation, source-aware cart handling, typed payment persistence, ownership filters, and status rules.

- [ ] **Step 3: Implement minimal transactional order creation**

```java
@Transactional
public OrderResponse createOrder(String email, CreateOrderRequest request, HttpServletRequest servletRequest) {
    User user = requireUser(email);
    validateDeliveryAndItems(request);
    user.setPhone(request.getPhone().trim());
    user.setAddress(request.getShippingAddress().trim());
    Order order = buildOrderFromDatabaseVariants(user, request);
    Payment payment = createPendingPayment(order, request.getPaymentMethod());
    if (request.getPaymentMethod() == PaymentMethod.COD) {
        decrementStock(order.getItems());
        order.setStatus(OrderStatus.PROCESSING);
        clearCartOnlyWhenSourceIsCart(user, request.getCheckoutSource());
    }
    return responseWithOptionalVnPayUrl(order, payment, servletRequest);
}
```

Use repository ownership queries in both order-history methods, reject null authentication/request bodies at the controller boundary, and move email invocation outside the critical success path or catch mail failures explicitly.

- [ ] **Step 4: Run focused and full backend tests**

Run focused tests above, then `backend\mvnw.cmd -f backend\pom.xml test`.

Expected: PASS with no compilation errors.

- [ ] **Step 5: Commit if Git becomes available**

```text
feat: create validated cart and buy-now orders
```

---

### Task 3: Verified VNPay Hosted Payment and Frontend Redirect

**Files:**
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/PaymentService.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/service/impl/PaymentServiceImpl.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/controller/PaymentController.java`
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/config/SecurityConfig.java`
- Modify: `backend/src/main/resources/application.yaml`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/payment/PaymentServiceImplTest.java`
- Test: `backend/src/test/java/com/DuoStyle/DuoStyle/payment/PaymentControllerTest.java`

**Interfaces:**
- Consumes: persisted Order/Payment and `CheckoutSource`.
- Produces: `String createVnPayPaymentUrl(Order order, HttpServletRequest request)`.
- Produces: `PaymentReturnResult processVnPayReturn(Map<String,String> params)` containing `orderCode` and `outcome` (`success`, `cancelled`, `failed`).
- Produces public `GET /api/v1/payments/vnpay-return` redirecting to `http://localhost:5173/?page=payment-result&outcome={outcome}&orderCode={orderCode}`.

- [ ] **Step 1: Write failing signature and state-transition tests**

```java
@Test
void validSuccessfulReturnMarksPaymentSuccessProcessesOrderAndClearsCart() {
    PaymentReturnResult result = service.processVnPayReturn(signedParams("00", storedAmount));
    assertEquals("success", result.outcome());
    assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
    assertEquals(OrderStatus.PROCESSING, order.getStatus());
}

@Test
void validCancellationMarksOrderCancelledWithoutClearingCart() {
    PaymentReturnResult result = service.processVnPayReturn(signedParams("24", storedAmount));
    assertEquals("cancelled", result.outcome());
    assertEquals(PaymentStatus.CANCELLED, payment.getStatus());
    assertEquals(OrderStatus.CANCELLED, order.getStatus());
    assertFalse(cart.getItems().isEmpty());
}

@Test
void invalidSignatureNeverMarksOrderSuccessful() {
    Map<String, String> params = signedParams("00", storedAmount);
    params.put("vnp_SecureHash", "invalid");
    assertEquals("failed", service.processVnPayReturn(params).outcome());
    assertNotEquals(PaymentStatus.SUCCESS, payment.getStatus());
}

@Test
void amountMismatchNeverMarksOrderSuccessful() {
    PaymentReturnResult result = service.processVnPayReturn(signedParams("00", storedAmount + 10000));
    assertEquals("failed", result.outcome());
    assertNotEquals(PaymentStatus.SUCCESS, payment.getStatus());
}
```

- [ ] **Step 2: Run tests and verify RED**

Run: `backend\mvnw.cmd -f backend\pom.xml -Dtest=PaymentServiceImplTest,PaymentControllerTest test`

Expected: failures because return verification and payment transitions do not exist.

- [ ] **Step 3: Implement canonical hashing, verification, transitions, and redirect**

```java
public PaymentReturnResult processVnPayReturn(Map<String, String> params) {
    String receivedHash = params.get("vnp_SecureHash");
    String canonical = canonicalize(params, Set.of("vnp_SecureHash", "vnp_SecureHashType"));
    if (!constantTimeEquals(hmacSHA512(secret, canonical), receivedHash)) {
        return failWithoutSuccess(params);
    }
    Order order = requireOrderFromTxnRef(params.get("vnp_TxnRef"));
    verifyAmount(order, params.get("vnp_Amount"));
    return "00".equals(params.get("vnp_ResponseCode"))
            ? completeSuccessfulPayment(order, params)
            : cancelPayment(order, params);
}
```

Remove the insecure endpoint that accepts browser-provided `orderId` and `amount`. Configure `vnpay.return-url` to the backend return endpoint and add `app.frontend-url` with local default.

- [ ] **Step 4: Run focused tests and full backend suite**

Run the focused command, then the complete Maven test suite.

Expected: PASS; redirect tests assert correct encoded query parameters for all outcomes.

- [ ] **Step 5: Commit if Git becomes available**

```text
feat: verify vnpay returns and redirect to storefront
```

---

### Task 4: Pure Frontend Checkout Helpers

**Files:**
- Create: `frontend/src/checkout.js`
- Create: `frontend/src/checkout.test.js`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `buildOrderPayload({items, phone, address, paymentMethod, checkoutSource})`.
- Produces: `readPaymentResult(search)` returning `{ outcome, orderCode }`.

- [ ] **Step 1: Write failing Node tests**

```javascript
test('builds a multi-item cart order using variant ids', () => {
  assert.deepEqual(buildOrderPayload(input), {
    shippingAddress: '1 Nguyen Hue', phone: '0901234567', paymentMethod: 'COD',
    checkoutSource: 'CART', items: [
      { productVariantId: 10, quantity: 2 },
      { productVariantId: 20, quantity: 1 },
    ],
  });
});

test('reads cancelled VNPay return', () => {
  assert.deepEqual(readPaymentResult('?outcome=cancelled&orderCode=DS-123'),
    { outcome: 'cancelled', orderCode: 'DS-123' });
});
```

- [ ] **Step 2: Run `npm test` and verify RED**

Expected: module-not-found because `checkout.js` does not exist.

- [ ] **Step 3: Implement the minimal pure helpers**

```javascript
export function readPaymentResult(search) {
  const params = new URLSearchParams(search);
  return { outcome: params.get('outcome') || 'failed', orderCode: params.get('orderCode') || '' };
}
```

Add `"test": "node --test src/**/*.test.js"` to scripts.

- [ ] **Step 4: Run `npm test` and `npm run lint`**

Expected: PASS.

- [ ] **Step 5: Commit if Git becomes available**

```text
test: define checkout browser contracts
```

---

### Task 5: Checkout and Payment Result Pages

**Files:**
- Create: `frontend/src/pages/CheckoutPage.jsx`
- Create: `frontend/src/pages/PaymentResultPage.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/pages/CartPage.jsx`
- Modify: `frontend/src/pages/ProductDetailPage.jsx`
- Test: `frontend/src/checkout.test.js`

**Interfaces:**
- Consumes: Task 4 helpers and existing `api` client.
- Produces: `onCheckout({ source, items })` app navigation callback.
- Produces: `onBuyNow({product, variant, quantity})` callback.
- Produces: `onCheckoutComplete()` callback that reloads the server cart.

- [ ] **Step 1: Extend failing helper tests for cart and buy-now normalization**

```javascript
test('buy now payload contains only its selected variant', () => {
  const payload = buildOrderPayload({ checkoutSource: 'BUY_NOW', items: [selectedItem], ...delivery });
  assert.deepEqual(payload.items, [{ productVariantId: 41, quantity: 1 }]);
});
```

- [ ] **Step 2: Run tests and verify RED for the missing normalization**

Run: `npm test` in `frontend`.

- [ ] **Step 3: Implement shared checkout navigation and pages**

```jsx
const submitOrder = async () => {
  const payload = buildOrderPayload({ items, phone, address, paymentMethod, checkoutSource: source });
  const { data } = await api.post('/orders', payload);
  if (data.data.paymentUrl) window.location.assign(data.data.paymentUrl);
  else onSuccess(data.data.orderCode);
};
```

Checkout must load values from `user`, show line items/total, keep data on API errors, disable duplicate clicks while submitting, and update `user` locally with saved phone/address after success. Payment Result renders distinct Vietnamese copy for success, cancelled, and failed.

Wire Cart checkout to source `CART`; wire Product Detail Buy Now using the exact `currentVariant.id`, selected quantity, product name/image, and variant price. If unauthenticated, navigate to Login with a checkout-required message.

- [ ] **Step 4: Run frontend tests, lint, and production build**

Run: `npm test`, `npm run lint`, `npm run build` in `frontend`.

Expected: all pass and Vite produces `dist` without unresolved imports.

- [ ] **Step 5: Commit if Git becomes available**

```text
feat: add shared checkout and payment result pages
```

---

### Task 6: Database-Only Home and Reliable Cart Synchronization

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/ProductSection.jsx`
- Test: `frontend/src/home-products.test.js`
- Create: `frontend/src/home-products.js`

**Interfaces:**
- Produces: `mapHomeProduct(ProductResponse)` and `loadHomeSections(api)`.
- Produces UI states `loading`, `error`, or database results for MEN, WOMEN, and new arrivals.
- Produces `reloadCart()` that preserves `productVariantId` needed by checkout.

- [ ] **Step 1: Write failing mapping and database-section tests**

```javascript
test('maps database product without sample fallback', () => {
  assert.deepEqual(mapHomeProduct(apiProduct), {
    id: 7, category: 'Ao khoac', name: 'Duo Jacket', price: 990000, image: null,
  });
});

test('empty database response remains empty', async () => {
  const sections = await loadHomeSections(fakeApiReturningEmptyPages);
  assert.deepEqual(sections.newArrivals, []);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test` in `frontend`.

Expected: module-not-found for `home-products.js`.

- [ ] **Step 3: Implement database-only loading and visible states**

```javascript
export const mapHomeProduct = p => ({
  id: p.id,
  category: p.categoryName || '',
  name: p.name,
  price: Number(p.basePrice),
  image: p.thumbnailUrl || null,
});
```

Fetch MEN, WOMEN, and `sortBy=createdAt&sortDir=desc`; set empty arrays on empty responses and explicit error state on failures. ProductSection renders loading skeletons, a Vietnamese empty message, or a retry control. Remove Unsplash and hard-coded price/variant fallbacks from Home/cart checkout paths. Ensure `reloadCart()` retains `productVariantId` from `CartItemResponse` and runs after login and successful cart-source checkout.

- [ ] **Step 4: Run frontend verification**

Run: `npm test`, `npm run lint`, and `npm run build`.

Expected: PASS with Home displaying only API-derived product objects.

- [ ] **Step 5: Commit if Git becomes available**

```text
feat: render home products from database
```

---

### Task 7: End-to-End Local Verification

**Files:**
- Modify only if verification exposes a defect; every fix starts with a failing automated regression test.

**Interfaces:**
- Consumes all tasks above.
- Produces a verified local user flow and documented environment prerequisites.

- [ ] **Step 1: Run all automated checks from a clean process state**

```text
backend\mvnw.cmd -f backend\pom.xml test
cd frontend
npm test
npm run lint
npm run build
```

- [ ] **Step 2: Start MySQL/backend/frontend using existing local configuration**

Confirm `/api/v1/products` returns database rows, authentication establishes `JSESSIONID`, and the browser has no fatal console errors.

- [ ] **Step 3: Smoke-test COD paths**

Verify multi-item cart COD creates one order, saves profile defaults, reduces stock, clears cart, and appears only in that user's history. Verify buy-now COD creates one item and leaves the cart unchanged.

- [ ] **Step 4: Smoke-test VNPay Sandbox paths**

With real `VNP_TMN_CODE` and `VNP_HASH_SECRET` supplied via environment, verify hosted-page navigation, successful return, and customer cancellation return. Confirm success reduces stock/clears a cart-source cart; cancellation shows “Đã hủy thanh toán”, keeps stock and cart, and records `CANCELLED`.

- [ ] **Step 5: Smoke-test database Home**

Create/update a product through existing admin/database flow, reload Home, and confirm its API-backed sections reflect the database. Stop the backend and confirm Home shows an error/retry state rather than sample products.

- [ ] **Step 6: Record final evidence**

Report exact commands, pass/fail counts, any skipped VNPay Sandbox step caused by missing credentials, and remaining local-only limitations. Do not claim hosted VNPay success unless it was exercised with valid Sandbox credentials.
