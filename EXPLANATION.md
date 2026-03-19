# ShopSmart V2: Project Explanation

This document provides a comprehensive overview of the ShopSmart V2 application, fulfilling the project evaluation requirements.

## 1. Architecture
The application is structured as a Monorepo using **pnpm workspaces**, separating the frontend, backend, and shared configurations.
*   **Frontend (`client/`)**: A modern React application built with **Next.js 14** (App Router) and **TypeScript**. It utilizes server-side rendering (SSR) where appropriate and client-side interactions for dynamic forms.
*   **Backend (`server/`)**: A modular REST API built with **Express.js** (JavaScript). 
    *   **Layered Architecture**: Requests hit `server.js` $\rightarrow$ `productRoutes.js` $\rightarrow$ `productController.js` $\rightarrow$ `prismaClient.js`. 
    *   **Middlewares**: A centralized `errorMiddleware.js` handles all global errors uniformly.
*   **Database**: **PostgreSQL** hosted on Neon, managed entirely through the **Prisma ORM**.

## 2. Workflow (CI/CD)
We implemented a robust automated DevOps workflow utilizing **GitHub Actions**:
1.  **Continuous Integration (`ci.yml`)**: On every `push` and `pull_request` to the `main` branch, the pipeline:
    *   Installs dependencies using `pnpm` (with aggressive caching).
    *   Runs **ESLint** to verify frontend code quality.
    *   Runs **Jest** backend unit and integration tests (using Supertest isolated from the network).
2.  **Continuous Deployment (`deploy.yml`)**: Upon a successful merge to `main`, an automated SSH action connects securely to the AWS EC2 instance.
    *   It pulls the latest code and executes the idempotent `scripts/deploy.sh` script, building the React static files and gracefully restarting the Node backend with zero downtime.
3.  **Dependabot**: Configured in `.github/dependabot.yml` to run weekly security and version checks on all `pnpm` workspace packages.

## 3. Design Decisions
*   **Monorepo Strategy**: We chose a `pnpm` monorepo over separate repositories for frontend/backend to easily share configurations (like Prettier/ESLint) and streamline local development using a single `pnpm dev` command.
*   **UI/UX Aesthetic**: The Next.js frontend employs a premium, dark-mode Glassmorphism design system in pure CSS. Rather than relying on heavy component libraries, we built lightweight, reusable functional components (`Navbar`, `ProductCard`, `ProductForm`).
*   **Idempotent Deployment**: Our `deploy.sh` script employs idempotent designs (e.g., `mkdir -p`, and graceful `lsof` process tree checking) rather than blind `kill -9`, ensuring the server can be restarted safely infinite times.

## 4. Challenges & Solutions
1.  **EADDRINUSE during Integration Tests**: 
    *   *Challenge*: Jest tests were crashing because requiring `server.js` attempted to start the HTTP server multiple times on port 5001.
    *   *Solution*: Refactored `server.js` to conditionally call `app.listen` only if `require.main === module`, simply exporting the Express `app` otherwise for Supertest to use dynamically.
2.  **Prisma Client Generation Scopes**: 
    *   *Challenge*: Relying on a custom output directory for the Prisma client caused module resolution issues between environments.
    *   *Solution*: Reverted to standard `node_modules/@prisma/client` generation natively integrated with `pnpm` workspaces for seamless hoisting.
3.  **Database Migration to PostgreSQL**:
    *   *Challenge*: The legacy system used SQLite. Migrating to remote PostgreSQL required careful schema transformations and ensuring the Neon DB connection strings were securely passed dynamically in CI without exposing credentials.
