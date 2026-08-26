# 📚 ShopSmart Documentation Hub

Welcome to the **ShopSmart** documentation! This guide is written in clear, simple English to help developers, contributors, and stakeholders understand, build, and deploy the application quickly.

---

## 🧭 Quick Navigation

| Document | Description |
| :--- | :--- |
| **[🚀 Getting Started](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/docs/GETTING_STARTED.md)** | Step-by-step setup guide: install dependencies, configure `.env`, seed database, and run locally. |
| **[🏗️ System Architecture](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/docs/ARCHITECTURE.md)** | Clear overview of the frontend, backend, database models, Razorpay payments, and email system. |
| **[🔌 API Reference](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/docs/API.md)** | List of all REST API endpoints with request/response examples. |
| **[🧪 Testing Guide](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/docs/TESTING.md)** | How to run frontend and backend automated test suites and maintain 100% test pass rates. |
| **[🚢 Deployment Guide](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/docs/DEPLOYMENT.md)** | How to containerize with Docker and deploy to production (Vercel, Neon Postgres, Redis). |
| **[🤖 Engineering Rules (AGENTS.md)](file:///Users/mayanksharma/Downloads/New_Projects/shopsmart/AGENTS.md)** | Canonical AI coding and engineering standards for the repository. |

---

## 💡 What is ShopSmart?

**ShopSmart** is a modern, high-performance e-commerce platform built as a full-stack TypeScript monorepo:

- **Frontend**: Next.js 16 (App Router), React 19, Zustand for client state, TanStack Query for server state, and responsive modern styling.
- **Backend**: Express 5 on Node.js, Prisma ORM with PostgreSQL, Redis for caching and rate limiting, and BullMQ for background job processing.
- **Payments**: **Razorpay** integrated natively for Indian payment methods (UPI, Cards, NetBanking, and Wallets).
- **Transactional Emails**: **Nodemailer** abstraction supporting free SMTP services (Gmail App Password, Brevo, Resend) with automatic local JSON fallback.

---

## ⚡ 3-Minute Quickstart

```bash
# 1. Install all dependencies
pnpm install

# 2. Setup environment variables
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env

# 3. Generate Prisma client & migrate database
pnpm --filter shopsmart-server db:generate
pnpm --filter shopsmart-server db:migrate

# 4. Start the frontend and backend development servers
pnpm dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
