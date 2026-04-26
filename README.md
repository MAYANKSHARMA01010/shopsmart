# 🛒 ShopSmart - Full-Stack E-Commerce Platform

Welcome to **ShopSmart**! This is a modern, high-performance e-commerce starter kit built with a focus on scalability, speed, and developer experience. Whether you want to run it locally for development or deploy it using Docker, this guide will get you up and running in minutes.

---

## 📁 Folder Structure

We use a monorepo-style structure to keep the frontend and backend organized:

```text
shopsmart/
├── client/             # Frontend (Next.js 16 + React 19)
├── server/             # Backend (Node.js + Express + TypeScript)
├── docker/             # Docker configuration files
├── scripts/            # Deployment and utility scripts
├── docker-compose.yml  # Orchestrates everything (App + DB + Redis)
├── pnpm-workspace.yaml # Manages project dependencies efficiently
└── README.md           # This awesome guide!

---

## 📖 Detailed Documentation

For a deeper dive into specific parts of the project, check out these guides:

*   [**🔌 API Reference**](./docs/API.md) - Endpoints, Request/Response examples.
*   [**🗄️ Database & Cache**](./docs/DATABASE.md) - Schema details, Prisma, and Redis.
*   [**🎨 Frontend Architecture**](./docs/FRONTEND.md) - Components, Styling, and State.
*   [**🐳 Docker & Deployment**](./docs/DOCKER.md) - Containerization and production tips.
*   [**🧪 Testing Guide**](./docs/TESTING.md) - How we ensure everything works.
*   [**🗺️ Future Roadmap**](./docs/ROADMAP.md) - What's next (Terraform, K8s, etc).
*   [**🧠 Tech Explanation**](./EXPLANATION.md) - The "Why" behind our technical choices.
```

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have the following installed:
*   **Node.js** (v18 or higher)
*   **pnpm** (Our preferred package manager)
*   **Docker & Docker Compose** (For easy database and full-stack setup)
*   **PostgreSQL** (If running locally without Docker)
*   **Redis** (Optional but recommended for caching)

### 2. Installation
Clone the repository and install all dependencies from the root:
```bash
pnpm install
```

---

## ⚙️ Environment Setup

You need to set up environment variables for both the frontend and backend. We've provided `.env.example` files to make this easy.

1.  **Backend (`/server`):**
    *   Copy `server/.env.example` to `server/.env`.
    *   Update the `DATABASE_URL` with your PostgreSQL connection string.
    *   Update `REDIS_LOCAL_URL` if you have a local Redis running.

2.  **Frontend (`/client`):**
    *   Copy `client/.env.example` to `client/.env`.
    *   The defaults usually work for local development (connecting to `localhost:5001`).

---

## 🛠️ Running the Project

### Option A: Local Development (Manual)

If you want to run the services individually for faster development:

**Start the Backend:**
```bash
cd server
pnpm db:generate  # Generate the database client
pnpm dev          # Runs with nodemon & ts-node
```

**Start the Frontend:**
```bash
cd client
pnpm dev          # Runs the Next.js dev server
```

---

### Option B: The "Easy Way" (Docker Compose)

The fastest way to see the whole system in action (including Database and Redis) is using Docker:

```bash
docker-compose up --build
```
This will start:
*   **Frontend**: http://localhost:3000
*   **Backend**: http://localhost:5001
*   **PostgreSQL**: `localhost:5432`
*   **Redis**: `localhost:6379`

---

## 🗄️ Database Management (Prisma)

We use **Prisma** to handle all database operations. Here are the essential commands to run inside the `/server` folder:

*   `pnpm db:generate`: Generates the TypeScript types for your database.
*   `pnpm db:push`: Syncs your local schema to the database (best for quick dev).
*   `pnpm db:migrate`: Creates a permanent migration file for production.
*   `pnpm db:studio`: Opens a beautiful web-based UI to explore your data.

---

## 🧪 Testing

We take quality seriously. The project comes with three layers of testing:

1.  **Backend (Mocha + Chai + Supertest):**
    ```bash
    cd server && pnpm test
    ```
2.  **Frontend (Jest + React Testing Library):**
    ```bash
    cd client && pnpm test
    ```
3.  **End-to-End (Playwright):**
    ```bash
    cd client && npx playwright test
    ```

---

## 🏗️ Tech Stack Summary

| Feature | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, Axios, Zod |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Prisma ORM) |
| **Caching** | Redis (ioredis) |
| **Validation** | Zod (End-to-end type safety) |
| **Deployment** | Docker, Docker Compose |

---

## 💡 Pro Tips
*   **Missing Types?** If you see TypeScript errors in the backend, run `pnpm db:generate` to refresh the Prisma types.
*   **Redis Down?** Don't worry! The backend is designed to gracefully fall back to the database if Redis isn't running.
*   **Clean Build?** If you run into weird Docker issues, try `docker-compose down -v` to clear the volumes and restart fresh.

Happy coding! 🚀
