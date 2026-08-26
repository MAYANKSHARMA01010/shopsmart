# 🤖 AGENTS.md — ShopSmart AI Engineering Standards & System Guide

> **Target Audience:** Autonomous AI Coding Assistants (Antigravity, Cursor, Claude Code, Copilot, Codex) & Human Contributors  
> **Repository:** `shopsmart` (Production Full-Stack E-Commerce Monorepo)  
> **Status:** Active & Enforced  
> **Last Updated:** August 2026

---

## 1. System Identity & Monorepo Topology

**ShopSmart** is an enterprise-grade, high-concurrency e-commerce engine designed to eliminate race conditions (overselling), enforce strict transactional boundaries, provide provider-agnostic payment abstractions, and deliver sub-millisecond cached responses.

### Monorepo Structure (`pnpm` Workspaces + Turborepo)
```
shopsmart/
├── apps/
│   ├── client/                  # Next.js 16 (App Router) + React 19 + Zustand + React Query
│   │   ├── src/app/             # App Router pages, layouts, and route handlers
│   │   ├── src/features/        # Domain features (auth, cart, checkout, products, etc.)
│   │   ├── src/components/      # Shared presentation UI components & layouts
│   │   └── src/lib/             # API client, environment validation, utilities
│   └── server/                  # Express 5 + TypeScript + Prisma ORM + BullMQ
│       ├── prisma/              # schema.prisma, migrations, seed scripts
│       └── src/
│           ├── modules/         # Domain-Driven Design (DDD) feature modules
│           ├── shared/          # Middleware, config, logger, utils, types
│           ├── queues/          # BullMQ queue producers
│           └── workers/         # BullMQ queue background consumers
├── packages/
│   ├── api-contracts/           # Shared Zod schemas, DTOs & API interfaces
│   ├── config/                  # Shared ESLint, Prettier, and TypeScript configs
│   ├── logger/                  # Shared structured Winston / Pino logger wrapper
│   ├── observability/           # OpenTelemetry & metrics hooks
│   └── shared-utils/            # Currency math, slug generation, date helpers
├── docs/                        # Architecture specs, ADRs, sequence flows, guides
├── docker/                      # Multi-stage production container definitions
├── terraform/                   # AWS Cloud infrastructure as code
└── k8s/                         # Kubernetes manifests & deployment specs
```

---

## 2. Core Architectural Invariants (Non-Negotiables)

Every agent operating in this codebase **MUST** uphold these core invariants. Violating any of these rules is considered an architectural regression.

### 2.1 Layered Domain-Driven Backend Architecture
Backend modules under [`apps/server/src/modules/`](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/apps/server/src/modules) must adhere to strict separation of concerns:

$$\text{Routes} \xrightarrow{\text{Zod Validation + PBAC}} \text{Controllers} \xrightarrow{\text{catchAsync}} \text{Services} \xrightarrow{\text{Transactions / Locks}} \text{Repositories / Prisma}$$

* **Controllers must be THIN:** Controllers only extract parameters, call service methods, and return unified JSON envelopes. Zero business logic or database queries inside controllers.
* **Services own Business Logic:** All calculations, validations, authorization checks, state machine transitions, and Redis cache interactions belong exclusively in the service layer.
* **Repositories / Prisma own Data Access:** Never import `prisma` in route files, controllers, or frontend React components.
* **No Direct DB Calls in Routes:** Route files only define endpoint mappings, rate limits, PBAC permission guards, and Zod validator middlewares.

### 2.2 Financial & Monetary Precision
* **`Prisma.Decimal` Everywhere:** Monetary values (`basePrice`, `comparePrice`, `subtotal`, `discountAmount`, `taxAmount`, `shippingAmount`, `totalAmount`) **MUST** use PostgreSQL `Decimal(10,2)` via Prisma.
* **NEVER Use JavaScript `Number` or `Float` for Money:** Floating-point arithmetic causes rounding errors.
* **Subunit Conversions:** Payment provider subunit integers (e.g., paise for INR, cents for USD) must be calculated strictly inside gateway adapters (`Math.round(amount * 100)`), never in domain services.
* **Post-Discount Taxes:** Tax rates (e.g. 10% GST) are computed strictly on taxable net amounts ($Subtotal - Discount$), never on gross pre-discount amounts.

### 2.3 Concurrency & Anti-Overselling Strategy
* **PostgreSQL Row-Level Locks (`SELECT ... FOR UPDATE`):** When placing orders or mutating stock, inventory **MUST** be locked within a Prisma transaction (`$transaction`).
* **Deterministic Lock Ordering:** Product UUIDs **MUST be sorted alphabetically** before executing `SELECT ... FOR UPDATE` to prevent circular deadlocks under concurrent checkouts.
* **No Redis-Only Inventory Deductions:** Redis cache-aside reservations have been deprecated. PostgreSQL is the sole source of truth for stock.

### 2.4 State Machine Integrity
* **Strict Order Transitions:** Order status mutations must **NEVER** be updated with arbitrary strings. All state changes must pass through `OrderStateMachine.transition(currentStatus, targetStatus)`:
  $$\text{PENDING} \rightarrow \text{PAYMENT\_PENDING} \rightarrow \text{CONFIRMED} \rightarrow \text{PROCESSING} \rightarrow \text{SHIPPED} \rightarrow \text{DELIVERED}$$
  $$\text{PENDING / CONFIRMED} \rightarrow \text{CANCELLED} \quad | \quad \text{DELIVERED} \rightarrow \text{REFUNDED}$$
* **Order Audit Logging:** Every order transition must append an `OrderAuditLog` record capturing the actor, old state, new state, and metadata within the same transaction.

### 2.5 Webhook Asynchrony & Idempotency
* **Fast Gateway Ack:** Payment gateway webhooks (`/api/payment/webhook`) must verify HMAC signatures via `express.raw()`, insert the unique `eventId` into `ProcessedWebhook`, push the event to **BullMQ**, and respond `200 OK` in $< 50\text{ms}$.
* **Deduplication:** Repeated webhook deliveries must hit the `ProcessedWebhook` database primary key constraint, return `200 OK` immediately, and skip duplicate processing.

---

## 3. TypeScript & Coding Standards

### 3.1 Strict Type Discipline
* **Zero `any` Policy:** Explicit types must be declared for all function arguments, return values, and DTOs.
* **No `@ts-ignore`:** Use `@ts-expect-error` only with an accompanying code comment explaining why the error occurs and when it will be resolved.
* **Type Narrowing & Guards:** Use Zod schemas or TypeScript type predicates (`val is Type`) instead of unsafe type assertions (`as unknown as Type`).

### 3.2 Consistent API Response Envelope
Every HTTP endpoint must return a standardized JSON structure:

#### Success Response (`200 OK`, `201 Created`)
```typescript
{
  "success": true,
  "data": T,
  "meta"?: {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

#### Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```typescript
{
  "success": false,
  "message": string,
  "errors"?: Array<{
    "field"?: string,
    "message": string
  }>
}
```

### 3.3 Error Handling & Async Wrappers
* **Centralized `AppError`:** Use `throw new AppError('Descriptive message', statusCode);` for all operational errors.
* **Controller Wrapper:** Every asynchronous controller method must be wrapped with `catchAsync()`:
  ```typescript
  export const getProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.id);
    res.status(200).json({ success: true, data: product });
  });
  ```
* **Information Leak Prevention:** Never expose raw database errors (e.g. Prisma `P2002`, `P2025` error codes) or runtime stack traces in client-facing HTTP responses.

---

## 4. Database & Prisma Rules

### 4.1 Schema Conventions
* **Primary Keys:** `id String @id @default(uuid())` for all models. Sequential integer IDs are prohibited.
* **Table & Field Mapping:** Use camelCase in TypeScript models and map to snake_case table names (`@@map("table_name")`).
* **Indexes:** Create B-tree indexes for all foreign keys, lookup slugs, and frequently filtered status flags:
  ```prisma
  @@index([categoryId])
  @@index([status])
  @@index([userId])
  ```
* **Cascade Deletion Boundaries:**
  - `User` $\rightarrow$ `Cascade` deletes `RefreshToken`, `PasswordResetToken`, `Cart`, `Wishlist`, `Address`.
  - `User` $\rightarrow$ `Restrict` deletion if historical `Order` records exist.
  - `Category` $\rightarrow$ `Restrict` deletion if assigned `Product` records exist.

### 4.2 Migration Safety
* **No Blind `db push` in Production:** Production schema changes must have an explicit SQL migration created via `prisma migrate dev`.
* **Zero-Downtime Changes:** When adding non-nullable columns to existing tables, provide default values or seed scripts to populate existing rows safely.

---

## 5. Security & Authorization (PBAC + RBAC)

### 5.1 Authentication Flow
* **Access Tokens:** 15-minute expiration, signed with `JWT_ACCESS_SECRET`. Payload contains `{ sub: userId, role: Role, email: string }`.
* **Refresh Tokens:** 7-day expiration, signed with `JWT_REFRESH_SECRET`. Raw token is sent only once to client; database stores `SHA-256(rawToken)`.
* **Token Rotation:** Every `/api/auth/refresh` invocation revokes the existing refresh token row and issues a new pair with JTI validation.

### 5.2 Policy-Based Access Control (PBAC)
* Use `requirePermission('permission:name')` in router definitions rather than hardcoded role string checks:
  ```typescript
  router.post(
    '/',
    authenticate,
    requirePermission('products:create'),
    validateBody(createProductSchema),
    productController.create
  );
  ```
* Permissions are defined in `apps/server/src/types/auth.ts` and mapped to `SUPER_ADMIN`, `ADMIN`, `VENDOR`, and `CUSTOMER`.

### 5.3 Input Sanitization & Request Validation
* Every write route must enforce Zod validation middlewares: `validateBody(schema)`, `validateParams(schema)`, or `validateQuery(schema)`.
* Never trust client-provided `userId` or prices. Always extract `userId` from `req.user.id` and fetch active product prices directly from the database.

---

## 6. Frontend Architecture & State Management

### 6.1 State Management Division
* **Server State:** Handled exclusively via **TanStack / React Query** (`useQuery`, `useMutation`). Never replicate remote API entities into local component state.
* **Client / UI State:** Handled via **Zustand** stores (`authStore`, `cartStore`, `wishlistStore`, `checkoutStore`).
* **Form State:** Validated using **Zod** + React Hook Form or controlled inputs with real-time schema parsing.

### 6.2 Next.js App Router Discipline
* **Server vs. Client Components:** Default to Server Components (`RSC`). Add `'use client'` only to components requiring browser events, React hooks (`useState`, `useEffect`), or Zustand/Context subscribers.
* **Image Optimization:** Always render product images using `<ProductImage />` or `next/image` with explicit aspect ratios and blur placeholders.

---

## 7. Testing & Quality Assurance

### 7.1 Vitest Standards
* Every service method and Zod schema must have unit tests.
* Critical user journeys (**Auth, Cart, Checkout, Webhooks, Orders**) must have integration test coverage.
* **Database Isolation:** All automated integration tests run against `TEST_DATABASE_URL` only. Tests must never mutate development or production databases.

### 7.2 Pre-Flight Quality Checklist
Before committing any changes or concluding an implementation task, run and verify:

```bash
# 1. Run workspace linting
pnpm turbo run lint

# 2. Run TypeScript typechecking
pnpm turbo run typecheck

# 3. Run complete test suite
pnpm turbo run test

# 4. Verify production bundle build
pnpm turbo run build
```

---

## 8. Agent Execution Workflow (Step-by-Step)

When tasked with implementing a feature or bug fix:

1. **Understand & Research:** Read relevant architecture specs in `docs/` and examine existing module conventions before touching code.
2. **Design First:** For complex or multi-file features, create an implementation plan detailing file changes, API contracts, and schema impacts.
3. **Execute in Dependency Order:**
   - Database schema & migrations $\rightarrow$
   - Shared types / Zod validators $\rightarrow$
   - Repository & Service logic $\rightarrow$
   - Controller & Routes $\rightarrow$
   - Vitest Unit & Integration tests $\rightarrow$
   - Frontend UI & Zustand store integration.
4. **Clean Code Rule:** Remove all `console.log` statements, temporary mock data, and dangling `TODO` comments before submitting code.
5. **Report & Document:** Update relevant documentation, record bugs in `BUG.md`, and verify that all workspace builds pass cleanly.
