# ShopSmart — Enterprise E-Commerce Platform

ShopSmart is a full-stack, enterprise-grade e-commerce monorepo built with Next.js, Express, Prisma, and PostgreSQL. It demonstrates modern architectural patterns including Domain-Driven Design (DDD), the Repository Pattern, strict Type Safety, and robust CI/CD pipelines.

## Features

- **Authentication:** Secure JWT-based registration, login, and token refresh.
- **Product Catalog:** Advanced search, categories, filtering, and pagination.
- **Shopping Cart:** Persistent cart with optimistic UI updates and guest-to-user merging.
- **Checkout & Payment:** Integrated Razorpay checkout flow with webhook-based idempotency.
- **Wishlist:** Add, remove, and manage favorite products.
- **Enterprise Architecture:** Strict separation of concerns via the Repository Pattern (Zero direct Prisma calls in services/controllers).

## Tech Stack

### Frontend
- Next.js (App Router)
- React & Tailwind CSS
- React Query (Data Fetching & Optimistic Updates)
- Axios & Zod

### Backend
- Express.js & TypeScript
- Prisma ORM & PostgreSQL
- Redis (Idempotency & Queues)
- BullMQ (Webhook Processing)

### Infrastructure & DevOps
- Turborepo (Monorepo management)
- Docker & Docker Compose
- Terraform (IaC)
- GitHub Actions (CI/CD)
- Vitest & Supertest (96 Passing Tests)

## Architecture

The backend strictly follows Domain-Driven Design (DDD):
```
src/
  modules/
    cart/
      cart.controller.ts
      cart.service.ts
      cart.repository.ts
      cart.routes.ts
    payment/
    product/
    ...
```
Controllers handle HTTP. Services handle business logic. Repositories handle Prisma/DB interactions. 

## Setup & Local Development

1. **Clone and Install dependencies**
   ```bash
   git clone <repo-url>
   cd shopsmart
   pnpm install
   ```

2. **Environment Variables**
   Copy the example environment files:
   ```bash
   cp apps/server/.env.example apps/server/.env
   cp apps/client/.env.example apps/client/.env
   ```

3. **Start Infrastructure (PostgreSQL & Redis)**
   ```bash
   docker-compose up -d
   ```

4. **Run Migrations**
   ```bash
   pnpm turbo run db:migrate
   ```

5. **Start Development Servers**
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Testing

The project maintains a strict Zero-Warnings policy.
```bash
# Run the entire validation pipeline (Lint, Typecheck, Build, Test)
pnpm turbo run lint typecheck build test
```

## Deployment

The application is configured for deployment across modern cloud providers:
- **Frontend:** Vercel
- **Backend:** Railway / Fly.io
- **Database:** Neon (Serverless Postgres)
- **Cache/Queue:** Upstash (Serverless Redis)

## License

MIT
