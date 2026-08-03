# Design Document: Admin Order Invoice Print Feature

**Date:** 2026-08-03  
**Status:** Approved  
**Author:** DuoStyle Engineering Team & Antigravity AI  

---

## 1. Overview
The Admin Order Invoice Print feature enables administrators of the DuoStyle platform to generate and print printable physical/digital invoices directly from the Admin Dashboard using browser-native printing (`window.print()`).

## 2. Requirements & User Stories
- As an **Admin**, I want to click an "In Hóa Đơn" (Print Invoice) button from either the order list table or the order details modal.
- As an **Admin**, I want a preview of a professional, brand-aligned sales invoice (A4 / Thermal format styling).
- When triggering print, the browser's print dialog must open, hiding irrelevant UI elements (admin sidebar, navigation, action buttons, backdrops) and leaving only the clean invoice template.

## 3. UI/UX & Component Architecture

### Components Involved
1. **`OrderInvoiceModal.tsx`** (New Component):
   - Modal displaying the styled DuoStyle sales invoice.
   - Includes "In Hóa Đơn" (triggers `window.print()`) and "Đóng" (closes modal) buttons.
   - Includes print-specific CSS rules (`@media print`) so that only the invoice area prints.

2. **`AdminOrdersTab.tsx`** (Updated Component):
   - Adds an "In Hóa Đơn" action button next to "Xem Chi Tiết" in each order row.
   - Opens the `OrderInvoiceModal` for the selected order.

3. **`OrderDetailModal.tsx`** (Updated Component):
   - Adds an "In Hóa Đơn" button inside the modal header/footer for convenience.

4. **`AdminDashboardPage.tsx`** (Updated Component):
   - Integrates state and handlers for opening/closing the `OrderInvoiceModal`.

## 4. Invoice Structure & Layout
The invoice template rendered inside `OrderInvoiceModal` contains:
- **Header**: DuoStyle branding ("DuoStyle - The New Elegance"), company address/phone, invoice title ("HÓA ĐƠN BÁN HÀNG").
- **Order Info Grid**: Order Code (`#DS-XXXXXX`), Date, Customer Phone, Shipping Address, Payment Method, Payment Status.
- **Line Items Table**: Product Name, Variant Details (Size, Color), Quantity, Unit Price, Total Price.
- **Summary**: Subtotal, Voucher Discount code & amount (if applied), Shipping Fee, Grand Total (`TỔNG THÀNH TIỀN`).
- **Footer**: Thank you message, signature spaces for Invoice Issuer and Customer.

## 5. Print Styling (`@media print`)
```css
@media print {
  body * {
    visibility: hidden;
  }
  #printable-invoice, #printable-invoice * {
    visibility: visible;
  }
  #printable-invoice {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  .no-print {
    display: none !important;
  }
}
```

## 6. Verification Plan
- Verify rendering of order details, item quantities, discounts, and total calculation.
- Verify opening `OrderInvoiceModal` from both `AdminOrdersTab` table action button and `OrderDetailModal`.
- Verify `window.print()` triggers browser print dialog cleanly without showing admin navigation or modal backdrop elements.
