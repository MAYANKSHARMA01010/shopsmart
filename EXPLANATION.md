# 🧠 ShopSmart Architecture & Technical Decisions

This document explains the "Why" behind the technical choices made in this project. It's meant for developers who want to understand the inner workings of ShopSmart.

---

## 🏗️ The Architecture

### 1. Monorepo-ish Structure
We use a **pnpm workspace** to manage both the `client` and `server`. 
*   **Why?** It allows us to keep everything in one place while maintaining strict separation. You can share types or configurations easily, and `pnpm` ensures that `node_modules` don't take up 10GB of your hard drive.

### 2. Frontend: Next.js 16 + React 19
We've used the latest cutting-edge React features:
*   **App Router**: Better performance and automatic code splitting.
*   **Server Components**: We fetch data on the server where possible to reduce the "loading spinner" fatigue.
*   **Client Hooks**: Business logic is encapsulated in custom hooks like `useProducts.ts` to keep components clean.

### 3. Backend: Express + TypeScript + Prisma
*   **TypeScript**: Every route and service is strictly typed. This prevents 99% of "undefined is not a function" errors before you even run the code.
*   **Prisma**: This is our ORM. It gives us a type-safe API to talk to PostgreSQL. If you change a column in the database, TypeScript will immediately tell you everywhere your code is broken.
*   **Redis Caching**: We've implemented a "Cache-Aside" pattern.
    *   **How?** When you fetch products, the server checks Redis first. If it's a "hit," you get the data in <10ms. If it's a "miss," it fetches from PostgreSQL and saves it to Redis for the next person.

### 4. Validation: Zod (The Secret Sauce)
We use **Zod** for "End-to-End Type Safety":
*   The **Frontend** uses Zod to validate form inputs.
*   The **Backend** uses the *exact same schema* to validate incoming API requests.
*   This means the Frontend and Backend always speak the same language.

---

## 🚀 DevOps & Deployment

### Docker Orchestration
Our `docker-compose.yml` isn't just a script; it's a complete environment.
*   **Multi-stage Builds**: Our Dockerfiles are optimized to be as small as possible for production.
*   **Persistence**: We use Docker Volumes so that your database data and Redis cache aren't lost when you stop the containers.

### Error Handling
We don't do `console.log(error)`.
*   The backend uses a centralized `errorMiddleware` and a custom `AppError` class.
*   This ensures that the API always returns a clean, helpful JSON response instead of a scary HTML stack trace.

---

## 🛠️ Testing Strategy
*   **Unit Tests**: Testing small functions in isolation.
*   **Integration Tests**: Testing how the API interacts with the database.
*   **E2E Tests**: Using Playwright to literally open a browser and click buttons like a real user would.

---

## 📈 Future Scalability
The project is built to grow:
*   Need to add Payments? Just add a `paymentService.ts`.
*   Need to add Auth? The structure is ready for JWT or NextAuth.
*   Traffic spike? Scale the backend container or increase the Redis TTL.

Happy Engineering! 🛠️
