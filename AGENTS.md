# 🤖 AGENTS.md — ShopSmart AI Engineering Standards & System Guide

> **Target Audience:** Autonomous AI Coding Assistants (Antigravity, Cursor, Claude Code, Copilot, Codex) & Human Contributors  
> **Repository:** `shopsmart` (Production Full-Stack E-Commerce Monorepo)  
> **Status:** Active & Enforced  
> **Last Updated:** August 2026

---

## 1. System Identity & Monorepo Topology

**ShopSmart** is an enterprise-grade, high-concurrency e-commerce engine designed to eliminate race conditions (overselling), enforce strict transactional boundaries, provide unified Razorpay payment processing, and deliver sub-millisecond cached responses.

### Monorepo Structure (`pnpm` Workspaces + Turborepo)
```
shopsmart/
├── apps/
│   ├── client/                  # Next.js 16 (App Router) + React 19 + Zustand + React Query + Tailwind
│   │   ├── src/app/             # App Router pages, layouts, error boundaries, and route handlers
│   │   ├── src/features/        # Feature-Driven Domain modules (auth, cart, checkout, orders, products, wishlist, favorites, categories, analytics, users)
│   │   │   └── <feature>/       # components/, hooks/, store/, services/, types/, reducers/, context/
│   │   ├── src/components/      # Shared global presentation UI (Navbar, Footer, Skeleton, OptimizedImage, Logo, ThemeToggle)
│   │   ├── src/context/         # Global application context (UIContext)
│   │   ├── src/hooks/           # Global utility hooks (useDebounce, useLocalStorage, useMediaQuery, useImage, etc.)
│   │   ├── src/lib/             # API client (Axios), environment validation, Razorpay loader
│   │   └── src/providers/       # Application root providers (QueryProvider)

│   └── server/                  # Express 5 + TypeScript + Prisma ORM + BullMQ + Nodemailer
│       ├── prisma/              # schema.prisma, migrations, seed scripts
│       └── src/
│           ├── modules/         # Domain-Driven Design (DDD) feature modules
│           │   ├── address/     # User delivery addresses & validation
│           │   ├── auth/        # PBAC / RBAC authentication & token rotation
│           │   ├── cart/        # Redis & DB cart synchronizers
│           │   ├── category/    # Product taxonomy management
│           │   ├── checkout/    # Concurrency-safe order placement & row-locks
│           │   ├── coupons/     # Promotional discount engines
│           │   ├── orders/      # State machine lifecycle & audit logging
│           │   ├── payment/     # Razorpay gateway adapter & HMAC webhook handler
│           │   ├── products/    # Product catalog, variants & inventory
│           │   ├── reviews/     # Verified buyer reviews & ratings
│           │   ├── upload/      # Secure media upload pipeline
│           │   ├── user/        # Profile & account management
│           │   └── wishlist/    # Customer wishlists
│           ├── shared/          # Middleware, config, logger, utils, types, errors
│           ├── queues/          # BullMQ queue producers (payment webhook queue)
│           └── workers/         # BullMQ queue background consumers & transactional email hooks
├── packages/
│   ├── api-contracts/           # Shared Zod schemas, DTOs & API interfaces
│   ├── config/                  # Shared ESLint, Prettier, and TypeScript configs
│   ├── logger/                  # Shared structured Winston / Pino logger wrapper
│   ├── observability/           # OpenTelemetry & metrics hooks
│   └── shared-utils/            # Currency math, slug generation, date helpers
├── infra/
│   ├── k8s/                     # Kubernetes manifests & deployment specs
│   └── terraform/               # AWS Cloud infrastructure as code (VPC, ECS, RDS, S3)
├── docker/                      # Multi-stage production container definitions
├── docs/                        # Architecture specs, ADRs, sequence flows, guides
├── scripts/                     # Operational automation scripts (EC2, secrets sync, deploy)
│   ├── ec2/                     # Automated Ubuntu 24.04 EC2 provisioner
│   ├── commit_changes.sh        # Senior Engineer granular git commit script
│   ├── deploy.sh                # Idempotent production server deployment script
│   ├── sync-secrets.sh          # Multi-line environment secrets sync to GitHub CLI
│   ├── verify-ssh.sh            # SSH port 22 accessibility & connectivity checker
│   └── ec2Status.sh             # EC2 instance status & security group rule inspector
├── .github/
│   ├── workflows/               # GitHub Actions CI/CD (ci.yml, codeql.yml, deploy.yml, pr-labeler.yml)
│   ├── dependabot.yml           # Grouped Dependabot updates across monorepo packages
│   └── labeler.yml              # Automated path-based PR triaging
├── .coderabbit.yaml             # CodeRabbit AI code review & architecture enforcement rules
└── SECURITY.md                  # Enterprise vulnerability disclosure & security policy
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
* **Subunit Conversions:** Payment provider subunit integers (e.g., paise for INR) must be calculated strictly inside gateway adapters (`Math.round(amount * 100)`), never in domain services.
* **Post-Discount Taxes:** Tax rates (e.g. 10% GST) are computed strictly on taxable net amounts ($Subtotal - Discount$), never on gross pre-discount amounts.
* **Currency Symbol:** The standard currency format across UI components is Indian Rupee (`₹` / `INR`).

### 2.3 Concurrency & Anti-Overselling Strategy
* **PostgreSQL Row-Level Locks (`SELECT ... FOR UPDATE`):** When placing orders or mutating stock, inventory **MUST** be locked within a Prisma transaction (`$transaction`).
* **Deterministic Lock Ordering:** Product UUIDs **MUST be sorted alphabetically** before executing `SELECT ... FOR UPDATE` to prevent circular deadlocks under concurrent checkouts.
* **No Redis-Only Inventory Deductions:** PostgreSQL is the sole source of truth for stock.

### 2.4 State Machine Integrity
* **Strict Order Transitions:** Order status mutations must **NEVER** be updated with arbitrary strings. All state changes must pass through `OrderStateMachine.transition(currentStatus, targetStatus)`:
  $$\text{PENDING} \rightarrow \text{PAYMENT\_PENDING} \rightarrow \text{CONFIRMED} \rightarrow \text{PROCESSING} \rightarrow \text{SHIPPED} \rightarrow \text{DELIVERED}$$
  $$\text{PENDING / CONFIRMED} \rightarrow \text{CANCELLED} \quad | \quad \text{DELIVERED} \rightarrow \text{REFUNDED}$$
* **Order Audit Logging:** Every order transition must append an `OrderAuditLog` record capturing the actor, old state, new state, and metadata within the same transaction.

### 2.5 Payment Gateway (Razorpay Exclusivity) & Webhook Asynchrony
* **Razorpay Exclusivity:** Razorpay is the primary supported payment gateway across server and client.
* **Fast Gateway Ack:** Payment gateway webhooks (`/api/payment/webhook`) must verify HMAC SHA-256 signatures via `express.raw()`, insert the unique `eventId` into `ProcessedWebhook`, push the event to **BullMQ**, and respond `200 OK` in $< 50\text{ms}$.
* **Deduplication:** Repeated webhook deliveries must hit the `ProcessedWebhook` database primary key constraint, return `200 OK` immediately, and skip duplicate processing.
* **Transactional Email Hook:** On `payment.captured`, the webhook worker automatically triggers `emailService.sendOrderConfirmation(...)` to deliver a professional HTML receipt.

### 2.6 Frontend Feature-Driven Design (FDD) & Barrel Exports
* **Strict Feature Colocation:** Domain logic (components, hooks, stores, services, schemas, reducers, contexts) **MUST** live within `apps/client/src/features/<feature_name>/` and be exported through its clean index barrel (`@/features/<feature_name>`).
* **Global vs. Feature Boundaries:**
  - **Feature Modules (`src/features/*`)**: `auth`, `cart`, `checkout`, `orders`, `products`, `wishlist`, `favorites`, `categories`, `analytics`, `users`.
  - **Global Primitives (`src/{components,context,hooks,lib,providers}`)**: Shared UI wrappers (`Navbar`, `Footer`, `Logo`, `ThemeToggle`, `Skeleton`, `OptimizedImage`, `SuspenseBoundary`), root context (`UIContext`), utility hooks (`useDebounce`, `useLocalStorage`, `useMediaQuery`, `useIntersectionObserver`, `useImage`, `useQueryParams`), and API/Razorpay clients.
* **No Cross-Feature Direct File Reaches:** Always import across features using top-level barrel paths (e.g. `import { useCart } from "@/features/cart";`), never relative deep paths into other feature internals.

### 2.7 Universal Skeleton UI & Zero Cumulative Layout Shift (CLS)
* **Zero Raw Text / Blank Spinners:** Asynchronous data loading and mounting states must **NEVER** render unstyled plain text (e.g. `"Loading..."`) or jarring blank white containers.
* **Geometry-Matched Shimmers:** Every asynchronous page and component must render a dedicated, geometry-matched shimmer skeleton from [`@/components/ui/Skeleton`](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/apps/client/src/components/ui/Skeleton.tsx) (`ProductDetailSkeleton`, `HomeHeroSkeleton`, `HomeQuadSkeleton`, `HomeRailSkeleton`, `ProductGridSkeleton`, `CartPageSkeleton`, `OrderListSkeleton`, `OrderDetailSkeleton`, `AddressListSkeleton`, `DashboardStatsSkeleton`, `DashboardTableSkeleton`).
* **Accessible Loading State:** Skeletons must mark containers with `aria-busy="true"` and `aria-hidden="true"` on inner shimmers to preserve accessibility.

### 2.8 Dynamic Auth-Aware UI Rendering
* **Contextual Navigation & CTAs:** Landing pages and global navigation must dynamically reflect authenticated vs. guest states (e.g. personalized greetings, order tracking shortcuts, admin panel links) without requiring page reloads.


---

## 3. Environment & Secret Management

### 3.1 Standardized Secret Naming Conventions
All infrastructure, backend, and frontend environments follow standard enterprise naming:

| Scope | Standard Secret Key | Purpose |
| :--- | :--- | :--- |
| **AWS Cloud** | `AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` | AWS Learner Lab & Cloud credentials |
| **EC2 Server** | `AWS_EC2_HOST`, `AWS_EC2_USER`, `AWS_EC2_INSTANCE_ID`, `AWS_EC2_KEY_NAME`, `AWS_EC2_SSH_KEY` | Ubuntu EC2 deployment target |
| **Database** | `DATABASE_URL`, `TEST_DATABASE_URL` | Neon PostgreSQL (Production pooler & Test DB) |
| **Redis** | `REDIS_LOCAL_URL`, `REDIS_SERVER_URL` | Upstash / local Redis BullMQ queues |
| **Auth** | `JWT_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signature secrets |
| **Razorpay** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Payment API keys & webhook HMAC secret |
| **SMTP Email** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Gmail SMTP transactional emailer |
| **Docker** | `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD` | Container registry deployment |

### 3.2 Automated Secrets Synchronization
* Run [`scripts/sync-secrets.sh`](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/scripts/sync-secrets.sh) to safely synchronize all secrets from `.env` to GitHub repository secrets using GitHub CLI (`gh secret set`).
* Multi-line RSA private keys (`AWS_EC2_SSH_KEY`) and connection URLs are parsed accurately without clipping.

---

## 4. TypeScript & Coding Standards

### 4.1 Strict Type Discipline
* **Zero `any` Policy:** Explicit types must be declared for all function arguments, return values, and DTOs.
* **No `@ts-ignore`:** Use `@ts-expect-error` only with an accompanying code comment explaining why the error occurs and when it will be resolved.
* **Type Narrowing & Guards:** Use Zod schemas or TypeScript type predicates (`val is Type`) instead of unsafe type assertions (`as unknown as Type`).

### 4.2 Consistent API Response Envelope
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

### 4.3 Error Handling & Async Wrappers
* **Centralized `AppError`:** Use `throw new AppError('Descriptive message', statusCode);` for all operational errors.
* **Controller Wrapper:** Every asynchronous controller method must be wrapped with `catchAsync()`.
* **Information Leak Prevention:** Never expose raw database errors (e.g. Prisma `P2002`, `P2025` error codes) or runtime stack traces in client-facing HTTP responses.

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

---

## 6. CI/CD & Developer Automation

### 6.1 GitHub Workflows Topology
* **`ci.yml`:** Comprehensive CI pipeline with matrix linting, TypeScript checking, isolated **Redis 7 test container**, Prisma client generation, Vitest execution, and Next.js 16 production build validation.
* **`codeql.yml`:** Automated static application security testing (SAST) for JavaScript & TypeScript.
* **`deploy.yml`:** Multi-target deployment hooks for Vercel (Frontend) and Render / EC2 (Backend).
* **`pr-labeler.yml`:** Automated path-based pull request labeling.

### 6.2 CodeRabbit AI Integration ([`.coderabbit.yaml`](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/.coderabbit.yaml))
* CodeRabbit automatically reviews all PRs against the architectural invariants defined in this `AGENTS.md` (DDD boundaries, Decimal precision, sorted UUID locks, Razorpay exclusivity).

### 6.3 Git Commit & Push Discipline
* **Granular Commits:** Use [`scripts/commit_changes.sh`](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/scripts/commit_changes.sh) to stage and commit changes atomically with conventional commit scopes (`feat(...)`, `fix(...)`, `chore(...)`, `ci(...)`).
* **Fast Multi-Remote Pushes:** Use `git pushall` to push cleanly to both `origin` and `devops` remotes without local hook delays.

---

## 7. Testing & Quality Assurance

### 7.1 Pre-Flight Quality Checklist
Before concluding an implementation task, run and verify:

```bash
# 1. Run workspace linting & typechecking
pnpm test

# 2. Run backend and frontend test suites
pnpm turbo run test

# 3. Verify production bundle build
pnpm turbo run build
```

---

## 8. Agent Execution Workflow (Step-by-Step)

When tasked with implementing a feature or bug fix:

1. **Understand & Research:** Read relevant architecture specs in `docs/` and examine existing module conventions before modifying code.
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
