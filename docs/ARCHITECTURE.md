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
