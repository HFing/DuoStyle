# Admin Order Invoice Print Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a brand-aligned, printable sales invoice modal (`OrderInvoiceModal`) for DuoStyle admin, triggering browser native `window.print()` while hiding extra UI chrome.

**Architecture:** Create `OrderInvoiceModal.tsx` containing print-friendly CSS (`@media print`) and layout for DuoStyle invoices. Wire up "In Hóa Đơn" action buttons in `AdminOrdersTab.tsx` and `OrderDetailModal.tsx`, managed by state in `AdminDashboardPage.tsx`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide / Material Symbols, Vitest / Node Test Runner.

## Global Constraints
- Target: Admin view only (`/admin`).
- Design system: DuoStyle luxury typography & colors (`primary`, `secondary`, `surface-container`, `font-headline-sm`, `font-body-md`).
- Print styling: Use `@media print` CSS rules inside component to format page A4 without backdrop/buttons/sidebar.

---

### Task 1: Create `OrderInvoiceModal.tsx` Component

**Files:**
- Create: `frontend/src/components/admin/OrderInvoiceModal.tsx`
- Test: `frontend/src/__tests__/OrderInvoiceModal.test.jsx`

**Interfaces:**
- Consumes: `/api/v1/orders/{orderCode}` (Axios API GET call)
- Produces: `OrderInvoiceModal` component accepting props:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `orderCode: string | null`

- [ ] **Step 1: Write the failing unit test**

Create `frontend/src/__tests__/OrderInvoiceModal.test.jsx`:
```jsx
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';

test('OrderInvoiceModal exports a valid React component function', async () => {
  const mod = await import('../components/admin/OrderInvoiceModal.tsx');
  assert.equal(typeof mod.default, 'function');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx/esm --test frontend/src/__tests__/OrderInvoiceModal.test.jsx`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Write implementation of `OrderInvoiceModal.tsx`**

Create `frontend/src/components/admin/OrderInvoiceModal.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { resolveProductImage } from '../../utils/product-image';
import { formatVND } from '../ProductCard';

interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string | null;
}

export default function OrderInvoiceModal({
  isOpen,
  onClose,
  orderCode,
}: OrderInvoiceModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

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
          setErrorMsg(err.response?.data?.message || 'Không thể lấy thông tin hóa đơn!');
        });
    }
  }, [isOpen, orderCode]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn no-print-bg">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible !important;
          }
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        id="invoice-print-area"
        className="bg-white border border-outline-variant rounded-xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-on-surface"
      >
        {/* Controls Header (Hidden during print) */}
        <div className="no-print flex justify-between items-center pb-4 border-b border-outline-variant mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">print</span>
            <h3 className="font-bold text-primary text-base">Xem Trước & In Hóa Đơn</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={loading || !!errorMsg || !order}
              className="px-4 py-2 bg-primary text-white text-xs font-bold font-label-caps uppercase rounded hover:bg-secondary transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              In Hóa Đơn
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant text-xs font-bold font-label-caps uppercase rounded hover:bg-surface-container transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-label-caps text-xs text-on-surface-variant font-bold uppercase tracking-widest">Đang tải hóa đơn #{orderCode}...</p>
          </div>
        ) : errorMsg ? (
          <div className="py-12 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-error">error</span>
            <p className="font-body-md text-error font-medium">{errorMsg}</p>
          </div>
        ) : order ? (
          <div className="space-y-6 text-sm font-body-md">
            {/* Invoice Header */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-primary">
              <div>
                <h1 className="font-headline-sm text-2xl font-bold tracking-tight text-primary">DuoStyle</h1>
                <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">The New Elegance</p>
                <p className="text-xs text-on-surface-variant mt-2">Địa chỉ: 512 Nguyễn Thị Thập, P. Tân Quy, Q. 7, TP. HCM</p>
                <p className="text-xs text-on-surface-variant">Hotline: 0930 423 624 | Email: contact@duostyle.com</p>
              </div>
              <div className="text-right">
                <h2 className="font-headline-sm text-xl font-bold text-primary uppercase tracking-wider">HÓA ĐƠN BÁN HÀNG</h2>
                <p className="text-xs font-bold text-secondary mt-1">Mã HĐ: #{order.orderCode}</p>
                <p className="text-xs text-on-surface-variant">
                  Ngày lập: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                </p>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-2 gap-6 bg-surface-container/30 p-4 rounded-lg border border-outline-variant/40 text-xs">
              <div>
                <p className="font-bold text-primary mb-1 uppercase font-label-caps text-[11px]">Thông Tin Khách Hàng</p>
                <p className="font-bold text-on-surface">{order.fullName || 'Khách hàng DuoStyle'}</p>
                <p className="text-on-surface-variant">SĐT: {order.phone || 'Chưa cung cấp'}</p>
                <p className="text-on-surface-variant">Địa chỉ: {order.shippingAddress || 'Địa chỉ mặc định'}</p>
              </div>
              <div>
                <p className="font-bold text-primary mb-1 uppercase font-label-caps text-[11px]">Thanh Toán & Vận Chuyển</p>
                <p className="text-on-surface-variant">
                  Phương thức: <span className="font-bold text-primary">{order.paymentMethod === 'VNPAY' ? 'VNPay' : 'Thanh toán COD'}</span>
                </p>
                <p className="text-on-surface-variant">
                  Trạng thái đơn: <span className="font-bold text-emerald-700">{order.status}</span>
                </p>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container/80 border-b border-outline-variant text-primary font-bold">
                    <th className="p-2.5 text-left">STT</th>
                    <th className="p-2.5 text-left">Sản Phẩm</th>
                    <th className="p-2.5 text-center">Size</th>
                    <th className="p-2.5 text-center">SL</th>
                    <th className="p-2.5 text-right">Đơn Giá</th>
                    <th className="p-2.5 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {order.items?.map((item: any, idx: number) => {
                    const price = item.price || 0;
                    const qty = item.quantity || 1;
                    const total = price * qty;
                    return (
                      <tr key={idx}>
                        <td className="p-2.5 text-on-surface-variant">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-primary">{item.productName || 'Sản phẩm DuoStyle'}</td>
                        <td className="p-2.5 text-center text-on-surface-variant">{item.size || 'M'}</td>
                        <td className="p-2.5 text-center font-bold">{qty}</td>
                        <td className="p-2.5 text-right text-on-surface-variant">{formatVND(price)}</td>
                        <td className="p-2.5 text-right font-bold text-primary">{formatVND(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Breakdown */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-xs border-t border-outline-variant/60 pt-3">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Tạm tính sản phẩm:</span>
                  <span className="font-bold text-primary">{formatVND(order.subtotalAmount || order.totalAmount)}</span>
                </div>
                {order.voucherCode && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Mã giảm giá ({order.voucherCode}):</span>
                    <span>-{formatVND(order.discountAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-emerald-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary pt-2 border-t border-outline-variant">
                  <span>TỔNG THÀNH TIỀN:</span>
                  <span className="text-secondary text-base">{formatVND(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Invoice Signatures */}
            <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-outline-variant/40 text-xs">
              <div>
                <p className="font-bold text-primary uppercase">Khách Hàng</p>
                <p className="text-[11px] text-on-surface-variant italic mt-0.5">(Ký & ghi rõ họ tên)</p>
                <div className="h-16"></div>
              </div>
              <div>
                <p className="font-bold text-primary uppercase">Người Lập Hóa Đơn</p>
                <p className="text-[11px] text-on-surface-variant italic mt-0.5">(Ký & ghi rõ họ tên)</p>
                <div className="h-16"></div>
                <p className="font-bold text-primary">DuoStyle Management</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run unit test to verify it passes**

Run: `node --import tsx/esm --test frontend/src/__tests__/OrderInvoiceModal.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add frontend/src/components/admin/OrderInvoiceModal.tsx frontend/src/__tests__/OrderInvoiceModal.test.jsx
git commit -m "feat(admin): add OrderInvoiceModal component"
```

---

### Task 2: Integrate Print Buttons in `AdminOrdersTab.tsx` and `OrderDetailModal.tsx`

**Files:**
- Modify: `frontend/src/components/admin/AdminOrdersTab.tsx:18-29`, `156-166`
- Modify: `frontend/src/components/OrderDetailModal.tsx:7-17`, `215-223`

**Interfaces:**
- Consumes: `setSelectedInvoiceOrderCode: (code: string) => void`, `setIsInvoiceModalOpen: (open: boolean) => void`
- Produces: Action buttons to open `OrderInvoiceModal`.

- [ ] **Step 1: Update `AdminOrdersTab.tsx` props and table rows**

Add `setSelectedInvoiceOrderCode` and `setIsInvoiceModalOpen` to `AdminOrdersTabProps`.
In the table action column, render an "In Hóa Đơn" button alongside "Xem Chi Tiết":
```tsx
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
```

- [ ] **Step 2: Update `OrderDetailModal.tsx` props and action bar**

Add optional `onPrintInvoice?: (orderCode: string) => void` prop to `OrderDetailModal`.
Inside modal actions footer, add an "In Hóa Đơn" button:
```tsx
{onPrintInvoice && order?.orderCode && (
  <button
    onClick={() => onPrintInvoice(order.orderCode)}
    className="px-4 py-2.5 bg-surface-container text-primary border border-outline-variant text-xs font-label-caps uppercase font-bold rounded hover:bg-outline-variant/30 transition-colors cursor-pointer flex items-center gap-1.5"
  >
    <span className="material-symbols-outlined text-sm">print</span>
    In Hóa Đơn
  </button>
)}
```

- [ ] **Step 3: Commit Task 2**

```bash
git add frontend/src/components/admin/AdminOrdersTab.tsx frontend/src/components/OrderDetailModal.tsx
git commit -m "feat(admin): add print invoice action buttons to order table and detail modal"
```

---

### Task 3: Wire Up State in `AdminDashboardPage.tsx` and Verify Integration

**Files:**
- Modify: `frontend/src/pages/AdminDashboardPage.tsx`

**Interfaces:**
- Consumes: `OrderInvoiceModal` component
- Produces: State `selectedInvoiceOrderCode`, `isInvoiceModalOpen`

- [ ] **Step 1: Add state and modal to `AdminDashboardPage.tsx`**

Import `OrderInvoiceModal` in `AdminDashboardPage.tsx`:
```tsx
import OrderInvoiceModal from '../components/admin/OrderInvoiceModal';
```

Add state:
```tsx
const [selectedInvoiceOrderCode, setSelectedInvoiceOrderCode] = useState<string | null>(null);
const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
```

Pass props to `AdminOrdersTab`:
```tsx
setSelectedInvoiceOrderCode={setSelectedInvoiceOrderCode}
setIsInvoiceModalOpen={setIsInvoiceModalOpen}
```

Pass `onPrintInvoice` to `OrderDetailModal`:
```tsx
onPrintInvoice={(code) => {
  setSelectedInvoiceOrderCode(code);
  setIsInvoiceModalOpen(true);
}}
```

Render `OrderInvoiceModal` alongside `OrderDetailModal`:
```tsx
<OrderInvoiceModal
  orderCode={selectedInvoiceOrderCode}
  isOpen={isInvoiceModalOpen}
  onClose={() => {
    setIsInvoiceModalOpen(false);
    setSelectedInvoiceOrderCode(null);
  }}
/>
```

- [ ] **Step 2: Run all tests to verify non-breakage**

Run: `node --import tsx/esm --test frontend/src/__tests__/admin-orders.test.js frontend/src/__tests__/OrderInvoiceModal.test.jsx`
Expected: ALL PASS

- [ ] **Step 3: Commit Task 3**

```bash
git add frontend/src/pages/AdminDashboardPage.tsx
git commit -m "feat(admin): integrate OrderInvoiceModal into AdminDashboardPage"
```
