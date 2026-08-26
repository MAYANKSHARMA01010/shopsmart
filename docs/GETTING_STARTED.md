# 🚀 Getting Started with ShopSmart

This guide will walk you through setting up and running **ShopSmart** on your local machine.

---

## 1. Prerequisites

Before you start, make sure you have the following installed:
- **Node.js**: `v20.x` or later (LTS recommended)
- **pnpm**: `v10.x` (`npm install -g pnpm`)
- **PostgreSQL Database**: Local PostgreSQL server, Docker container, or a free cloud database (e.g. [Neon.tech](https://neon.tech))
- **Redis**: Local Redis server or free cloud Redis (e.g. [Upstash](https://upstash.com))

---

## 2. Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/MAYANKSHARMA01010/shopsmart.git
cd shopsmart
pnpm install
```

---

## 3. Environment Configuration

### Backend Environment (`apps/server/.env`)
Copy the example file:
```bash
cp apps/server/.env.example apps/server/.env
```

Fill in your configuration:
```env
NODE_ENV=development
SERVER_PORT=5001

# PostgreSQL Database connection URL
DATABASE_URL="postgresql://user:password@localhost:5432/shopsmart"
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/shopsmart_test"

# Redis
REDIS_LOCAL_URL="redis://localhost:6379"

# JWT Secrets (at least 32 characters each)
JWT_ACCESS_SECRET="your-super-secret-access-token-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-min-32-chars"

# Razorpay Test Credentials (from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID="rzp_test_xxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Email Configuration (Optional: leave blank for local JSON logger fallback)
# Free Gmail SMTP:
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=465
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-16-character-google-app-password"
# SMTP_FROM="ShopSmart <your-email@gmail.com>"
```

### Frontend Environment (`apps/client/.env`)
```bash
cp apps/client/.env.example apps/client/.env
```
Ensure the API URL points to the backend:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api/v1"
```

---

## 4. Database Setup & Seeding

Run database migrations to create tables and relations:
```bash
pnpm --filter shopsmart-server db:migrate
```

*(Optional)* Seed sample products, categories, and an admin user:
```bash
pnpm --filter shopsmart-server db:seed
```

---

## 5. Running the Application

You can run both client and server together:
```bash
pnpm dev
```

Or run them individually:
- **Backend Only**: `pnpm dev:server` (Starts at http://localhost:5001)
- **Frontend Only**: `pnpm dev:client` (Starts at http://localhost:3000)

---

## 6. Useful Commands

| Command | Action |
| :--- | :--- |
| `pnpm test` | Runs linter and TypeScript typecheck across all projects |
| `pnpm --filter shopsmart-server test` | Runs the backend unit and integration test suite |
| `pnpm --filter shopsmart-frontend test` | Runs the frontend React and component tests |
| `pnpm build` | Builds production bundles for Next.js and Express |
| `pnpm --filter shopsmart-server db:studio` | Opens Prisma Studio visual database viewer |
