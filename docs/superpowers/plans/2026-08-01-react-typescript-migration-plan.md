# React + TypeScript Clean Architecture Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the frontend to React + TypeScript with strict types, moving utilities to `src/utils/`, creating `src/types/`, and converting `.jsx` files to `.tsx`.

**Architecture:** Setup `tsconfig.json`, define domain interfaces in `src/types/`, relocate & convert helpers in `src/utils/`, and convert all components and pages to `.tsx`.

**Tech Stack:** React 19, TypeScript 5, Vite 8, Tailwind CSS, Axios.

## Global Constraints

- Do not break existing UI, routes, state behavior, or backend API integration.
- Ensure `cmd /c npm run build` compiles cleanly with zero TypeScript or Vite errors.
- Preserve test files and ensure `npm test` passes.

---

### Task 1: TypeScript Dependencies & Caching Setup

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/package.json`
- Create: `c:/Study/CayThue/DuoStyle/frontend/tsconfig.json`
- Create: `c:/Study/CayThue/DuoStyle/frontend/tsconfig.node.json`

- [ ] **Step 1: Install `typescript` devDependency**

Run: `cmd /c npm install -D typescript` in `frontend/`

- [ ] **Step 2: Create `tsconfig.json` and `tsconfig.node.json`**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Commit TS setup files**

```bash
git add frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/tsconfig.node.json
git commit -m "chore: add typescript dependency and tsconfig configuration"
```

---

### Task 2: Create Type Definitions in `src/types/`

**Files:**
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/types/user.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/types/product.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/types/order.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/types/cart.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/types/common.ts`

- [ ] **Step 1: Write type files in `src/types/`**

`src/types/user.ts`:
```ts
export interface Role {
  id?: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  address?: string;
  enabled?: boolean;
  roles?: (string | Role)[];
}
```

`src/types/product.ts`:
```ts
export interface ProductVariant {
  id: number;
  size: string;
  color?: string;
  sku?: string;
  price?: number;
  stockQuantity: number;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  price?: number;
  thumbnailUrl?: string;
  image?: string;
  images?: (string | { imageUrl: string })[];
  genderTarget?: string;
  categoryName?: string;
  categoryId?: number;
  color?: string;
  sku?: string;
  material?: string;
  variants?: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  genderTarget?: string;
  parentId?: number | null;
  parentName?: string;
  children?: Category[];
}
```

`src/types/order.ts`:
```ts
export interface OrderItem {
  id?: number;
  productVariantId?: number;
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderCode: string;
  createdAt?: string;
  status: string;
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  voucherCode?: string;
  phone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  items?: OrderItem[];
}
```

`src/types/cart.ts`:
```ts
export interface CartItem {
  id: number;
  productVariantId: number;
  productName: string;
  variantDetails?: string;
  price: number;
  quantity: number;
  image?: string;
  stockQuantity?: number;
}
```

`src/types/common.ts`:
```ts
export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}
```

- [ ] **Step 2: Commit `src/types/`**

```bash
git add frontend/src/types/
git commit -m "feat: add domain type definitions in src/types/"
```

---

### Task 3: Relocate & Convert Utilities to `src/utils/`

**Files:**
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/utils/checkout.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/utils/cart-mutations.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/utils/home-products.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/utils/product-detail.ts`
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/utils/google-auth.ts`
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/*.test.js` (update import paths)

- [ ] **Step 1: Move and type helper files to `src/utils/*.ts`**
- [ ] **Step 2: Delete old root `.js` helper files and update imports in `.test.js`**
- [ ] **Step 3: Run `npm test` to verify utility tests pass**
- [ ] **Step 4: Commit `src/utils/` migration**

```bash
git add frontend/src/utils/ frontend/src/*.test.js
git commit -m "refactor: relocate and type utility helpers into src/utils/"
```

---

### Task 4: Convert Components to `.tsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/components/*.jsx` -> `.tsx`

- [ ] **Step 1: Convert `Navbar`, `Footer`, `ToastNotification`, `Pagination`, `OrderDetailModal`, `LoadingSpinner` to `.tsx`**
- [ ] **Step 2: Convert `Hero`, `CategorySelection`, `ProductSection`, `ProductCard`, `Editorial`, `Newsletter` to `.tsx`**
- [ ] **Step 3: Commit converted components**

```bash
git add frontend/src/components/
git commit -m "refactor: convert all UI components to React TypeScript (.tsx)"
```

---

### Task 5: Convert Pages & Entry Points to `.tsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/main.jsx` -> `main.tsx`
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/App.jsx` -> `App.tsx`
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/pages/*.jsx` -> `.tsx`

- [ ] **Step 1: Convert pages (`CollectionsPage`, `ProductDetailPage`, `ProfilePage`, `AdminDashboardPage`, `CartPage`, `CheckoutPage`, `LoginPage`, `RegisterPage`, `PaymentResultPage`, `NotFoundPage`) to `.tsx`**
- [ ] **Step 2: Convert `main.jsx` and `App.jsx` to `main.tsx` and `App.tsx`**
- [ ] **Step 3: Update `index.html` script tag pointing to `src/main.tsx`**
- [ ] **Step 4: Commit converted pages and entry points**

```bash
git add frontend/src/pages/ frontend/src/App.tsx frontend/src/main.tsx frontend/index.html
git commit -m "refactor: convert all pages and main entry point to React TypeScript (.tsx)"
```

---

### Task 6: Build Verification & Test Run

- [ ] **Step 1: Execute `cmd /c npm run build` to verify Vite + TS build succeeds**
- [ ] **Step 2: Execute `npm test` to verify unit tests pass**
