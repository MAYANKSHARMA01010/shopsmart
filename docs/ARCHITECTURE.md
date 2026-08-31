# 🏗️ ShopSmart System Architecture

This document explains how **ShopSmart** works under the hood in simple, everyday language.

---

## 1. High-Level Architecture Overview

ShopSmart is structured as a **Turborepo** monorepo with clean separation between the frontend UI, backend API, shared types, and background workers:

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Next.js 16)                    │
│   • App Router Pages (Products, Cart, Checkout)        │
│   • Zustand (Client State) + React Query (Server State)│
│   • Razorpay Checkout SDK integration                 │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTP REST API (JSON)
                          ▼
┌────────────────────────────────────────────────────────┐
│               Backend (Express 5)                      │
│   • Routes & Zod Validation Middleware                 │
│   • Domain Services (Business Logic)                   │
│   • Data Repositories (Prisma ORM)                     │
│   • Rate Limiting & Helmet Security                    │
└────────────┬─────────────────────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌─────────────────────────┐   ┌──────────────────────────┐
│ PostgreSQL (Prisma DB)  │   │     Redis & BullMQ       │
│ • Users, Roles, JWTs    │   │ • API Rate Limiting      │
│ • Products, Inventory   │   │ • Webhook Event Queue    │
│ • Orders, Payments, Logs│   │ • Asynchronous Workers   │
└─────────────────────────┘   └──────────────────────────┘
```

---

## 2. Backend Layered Architecture (DDD)

Each feature in the backend (`apps/server/src/modules/`) follows a strict 4-tier flow:

1. **Routes (`*.routes.ts`)**: Defines endpoint URLs, HTTP methods, rate limits, and permission guards.
2. **Validators (`*.validator.ts`)**: Uses **Zod** to validate request parameters, bodies, and query parameters before reaching logic.
3. **Controllers (`*.controller.ts`)**: Thin layer wrapped in `catchAsync` that receives HTTP requests and returns standardized JSON responses.
4. **Services (`*.service.ts`)**: Contains pure business rules, financial math, state transitions, and orchestrates database transactions.
5. **Repositories (`*.repository.ts`)**: The ONLY place where Prisma database queries are written.

---

## 3. Key Subsystems Explained Simply

### 💳 3.1 Payment Processing (Razorpay Only)
- **Why Razorpay?** Razorpay is the primary payment gateway in India, natively supporting UPI (Google Pay, PhonePe, Paytm), Indian Debit/Credit Cards, NetBanking, and Wallets.
- **How it works**:
  1. User clicks **Pay Now** on Checkout.
  2. Frontend calls `/api/v1/checkout/initialize`.
  3. Backend locks product inventory in PostgreSQL, creates an order record in `PENDING` state, and creates a Razorpay Order ID.
  4. Razorpay checkout modal opens on the client.
  5. Once paid, the payment signature is verified via HMAC SHA-256 (`/api/v1/checkout/verify`) or asynchronously via Webhook (`/api/v1/payment/webhook`).
  6. Order transitions to `CONFIRMED`, payment marked `CAPTURED`, and an order confirmation email is queued.

### 📧 3.2 Transactional Email System (Nodemailer)
- Located in `apps/server/src/modules/email/email.service.ts`.
- **Nodemailer** provides a vendor-neutral abstraction.
- **Free Provider Support**:
  - **Gmail SMTP (Recommended)**: Set `SMTP_HOST=smtp.gmail.com` with a Google App Password (free 500 emails/day).
  - **Brevo / Sendinblue**: Set `SMTP_HOST=smtp-relay.brevo.com` (free 300 emails/day).
  - **Local Development / CI**: If SMTP credentials are not set, it automatically falls back to JSON logging so local tests never fail.

### 🔒 3.3 Authentication & Security
- **Access Tokens**: Short-lived (15 minutes), signed using `JWT_ACCESS_SECRET`.
- **Refresh Tokens**: Long-lived (7 days), signed using `JWT_REFRESH_SECRET`. Stored as a secure SHA-256 hash in the database to prevent database theft reuse.
- **Policy-Based Access Control (PBAC)**: User roles (`SUPER_ADMIN`, `ADMIN`, `VENDOR`, `CUSTOMER`) have granular permissions guarding sensitive endpoints.

### 🛒 3.4 Concurrency & Anti-Overselling Strategy
- Financial values use **`Prisma.Decimal(10,2)`** to prevent floating-point rounding errors.
- Inventory deductions use PostgreSQL row locks (`SELECT ... FOR UPDATE`) in deterministic order to prevent race conditions and overselling when multiple users checkout at the exact same second.

---

## 4. Frontend Feature-Driven Architecture (`apps/client/`)

The frontend is structured into isolated, cohesive domain feature slices rather than monolithic horizontal layers:

```
apps/client/src/
├── app/                         # Next.js 16 App Router pages & server routes
├── features/                    # Domain-Driven Feature Slices
│   ├── auth/                    # AuthContext, authStore, addressService, PBAC guards
│   ├── cart/                    # CartStore, useCart memoized totals, item map
│   ├── checkout/                # Checkout state machine, AddressSelector, PaymentButton
│   ├── orders/                  # OrderService, order state tracking & detail views
│   ├── products/                # ProductCard, filters, QuickViewModal, image gallery
│   ├── wishlist/                # WishlistStore, custom folder collections
│   ├── favorites/               # 1-click liked items store & grid
│   ├── categories/              # Category tree navigation & taxonomy
│   ├── analytics/               # Executive KPIs, Recharts telemetry
│   └── users/                   # Admin user & role management
├── components/                  # Shared presentation UI (Navbar, Footer, Skeleton, Logo)
├── context/                     # Application-wide UI context (Modals, drawers)
├── hooks/                       # Reusable utility hooks (useDebounce, useMediaQuery, useImage)
└── lib/                         # Axios client, env validation, Razorpay SDK loader
```

### 4.1 Skeleton UI & Perceived Performance
- Every data-fetching route implements geometry-matched shimmer skeletons in [`apps/client/src/components/ui/Skeleton.tsx`](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/apps/client/src/components/ui/Skeleton.tsx).
- Prevents Cumulative Layout Shift (CLS) during page hydration and network latency.

### 4.2 State Management Topology
- **Client State (Zustand with persistence)**: `authStore`, `cartStore`, `wishlistStore`, `favoritesStore`, `checkoutStore`.
- **Server Cache State (React Query / Axios)**: Products list, categories tree, orders history, analytics metrics.
- **Local Ephemeral State (Context & Reducers)**: `FilterContext` + `filterReducer`, `UIContext` (drawers, search overlays).
