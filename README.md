# 🛒 ShopSmart V2

ShopSmart V2 is a modern, full-stack E-Commerce catalog application built for high performance and automated DevOps deployment. It has been entirely refactored from a simple Vite/SQLite structure into an enterprise-ready **pnpm monorepo** featuring **Next.js 14**, **PostgreSQL**, and automated CI/CD pipelines.

---

## 🌟 Features

*   **Next.js 14 App Router**: Server-side rendering and static generation with a premium, responsive glassmorphism aesthetic built in pure CSS.
*   **Express & Prisma Backend**: Modular REST API with PostgreSQL ORM integration.
*   **Fully Automated CI/CD**: GitHub Actions configured to Lint, Test, and automatically push deployments to an AWS EC2 instance.
*   **Comprehensive Testing Suites**: 
    *   **Unit & Integration**: Jest & Supertest test the backend controllers and isolated database instances.
    *   **End-to-End**: Playwright test scripts covering full user browser sessions on the frontend.
*   **Dependabot Integration**: Automated weekly security and version bumps.

---

## 🏗️ Architecture

This project is structured as a **pnpm workspace monorepo**:

```text
shopsmart/
├── client/              # Next.js 14 Frontend (React, TypeScript)
│   ├── e2e/             # Playwright End-to-End browser tests
│   └── src/             # Pages, Components, and Global CSS
├── server/              # Node.js + Express Backend
│   ├── prisma/          # PostgreSQL schema & migrations
│   ├── src/             # Controllers, Routes, Models, and Utils
│   └── tests/           # Jest Unit & Integration tests
├── scripts/             # Idempotent AWS EC2 deployment scripts (.sh)
└── .github/             # CI/CD Workflows (Deploy, Test, Dependabot)
```

For an in-depth dive into the technical challenges, automated workflow decisions, and design choices, please read **[EXPLANATION.md](./EXPLANATION.md)**.

---

### 1. Cloning the Repository
```bash
git clone https://github.com/your-username/shopsmart.git
cd shopsmart
```

### 2. Requirements
*   **Node.js** (v20+)
*   **pnpm** (v9+)
*   **PostgreSQL** Database (Neon or local)

### 3. Environment Variables
Create the following environment files to configure your local development environment.

**`server/.env`**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/shopsmart?sslmode=disable"
PORT=5001

# CORS Allowed Origins (Local)
LOCAL_CLIENT_URL_1=http://localhost:3000
LOCAL_CLIENT_URL_2=http://127.0.0.1:3000
```

**`client/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 3. Installation & Database Sync
Because this is a monorepo, you can install everything from the root folder:

```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Push the Prisma schema to your PostgreSQL database
cd server
pnpm prisma db push
cd ..
```

### 4. Running the App
You can start both the frontend and backend simultaneously from the root directory:

```bash
pnpm dev
```
*   **Frontend**: `http://localhost:3000`
*   **Backend API**: `http://localhost:5001`

---

## 🧪 Testing

The project requires rigid testing enforced by GitHub Actions. You can run these checks locally:

### Backend Integration & Unit Tests (Jest)
```bash
cd server
pnpm test
```

### Frontend End-to-End Tests (Playwright)
*Make sure your local development server is running on port 3000 first!*
```bash
cd client
pnpm exec playwright test
```

---

## 🌍 CI/CD & AWS Deployment

Every push to the `main` branch triggers our GitHub Actions pipeline (`.github/workflows/ci.yml`). 
1.  **Code Check**: Verifies ESLint rules and runs Jest tests.
2.  **Deploy**: If checks pass, `deploy.yml` triggers via SSH.
3.  **EC2 Startup**: The `scripts/deploy.sh` connects to our AWS EC2 box, runs `pnpm build`, safely isolates ports `3000`/`5001` using `lsof`, gracefully shuts down old processes, and starts the newly compiled application.

### Required GitHub Secrets
If you are forking this repository, you must add the following parameters to your Repository Secrets:
*   `DATABASE_URL`
*   `EC2_HOST`
*   `EC2_USER`
*   `EC2_SSH_KEY`
