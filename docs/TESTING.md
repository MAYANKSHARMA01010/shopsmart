# 🧪 Testing Guide

We use a multi-layered testing strategy to ensure reliability.

## 1. Backend Testing (Mocha + Chai + Supertest)
*   **Location**: `server/tests/`
*   **Command**: `cd server && pnpm test`
*   **Focus**: API endpoint validation, database interactions, and error handling.

---

## 2. Frontend Unit Testing (Jest + RTL)
*   **Location**: `client/src/components/__tests__/`
*   **Command**: `cd client && pnpm test`
*   **Focus**: Component rendering, user interactions (clicks, form inputs), and mock data handling.

---

## 3. End-to-End (E2E) Testing (Playwright)
*   **Location**: `client/e2e/`
*   **Command**: `cd client && npx playwright test`
*   **Interactive Mode**: `npx playwright test --ui`
*   **Focus**: Full user flows (landing on home page, navigating to products, adding a new product).

### Prerequisites for E2E:
1.  Ensure the **Backend** and **PostgreSQL** are running.
2.  Install Playwright browsers:
    ```bash
    npx playwright install
    ```

---

## 🏗️ Best Practices
1.  **Mocking**: Use mocks for external APIs in Unit tests.
2.  **Clean Database**: E2E tests should ideally run against a test database to avoid polluting your production data.
3.  **Naming**: Name test files as `*.test.ts` or `*.spec.ts`.
