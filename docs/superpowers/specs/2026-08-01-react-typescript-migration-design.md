# React + TypeScript Clean Architecture Migration Spec

## Goal
Standardize the frontend codebase to React 19 + TypeScript, organizing components, pages, utils, and types into a production-grade Clean Architecture.

## Requirements

### 1. TypeScript & Compiler Setup
- Install `typescript` as a dev dependency.
- Create `tsconfig.json` and `tsconfig.node.json` configured for Vite + React 19 (ESNext, JSX react-jsx, strict checks, moduleResolution bundler).

### 2. Type Definitions (`src/types/`)
- Create core TypeScript interface files:
  - `src/types/user.ts` (`User`, `Role`, `UserForm`)
  - `src/types/product.ts` (`Product`, `ProductVariant`, `Category`, `ProductSection`)
  - `src/types/order.ts` (`Order`, `OrderItem`, `OrderStatus`, `PaymentMethod`, `PaymentResult`)
  - `src/types/cart.ts` (`CartItem`, `CartResponse`)
  - `src/types/common.ts` (`ApiResponse<T>`, `ToastState`, `NavigationIntent`)

### 3. Utility & Logic Migration (`src/utils/`)
- Move and convert root `.js` helper files to typed `.ts` files inside `src/utils/`:
  - `checkout.js` -> `src/utils/checkout.ts`
  - `cart-mutations.js` -> `src/utils/cart-mutations.ts`
  - `home-products.js` -> `src/utils/home-products.ts`
  - `product-detail.js` -> `src/utils/product-detail.ts`
  - `google-auth.js` -> `src/utils/google-auth.ts`
- Update all corresponding `.test.js` test import paths.

### 4. Components & Pages Migration (`.jsx` -> `.tsx`)
- Convert `main.jsx` and `App.jsx` to `main.tsx` and `App.tsx`.
- Convert all components in `src/components/` to `.tsx` with typed Props.
- Convert all pages in `src/pages/` to `.tsx` with typed Props.

## Verification Plan
- Execute `cmd /c npm run build` to verify TypeScript compilation and Vite bundling without errors.
- Run `npm test` to verify logic utility tests pass cleanly.
