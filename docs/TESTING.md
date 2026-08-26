# 🧪 Testing Guide — ShopSmart

ShopSmart uses **[Vitest](https://vitest.dev/)** and **Supertest** for fast, reliable unit and integration testing across both the frontend React client and the Express backend.

---

## 🎯 Test Commands Overview

```bash
# 1. Run all tests and validation checks (Lint + Typecheck)
pnpm test

# 2. Run Backend Unit & Integration Tests
pnpm --filter shopsmart-server test

# 3. Run Frontend React & Component Tests
pnpm --filter shopsmart-frontend test

# 4. Run tests with coverage reports
pnpm turbo run test:coverage
```

---

## 🏗️ How Backend Tests Work

- **Database Isolation**: Backend integration tests run against `TEST_DATABASE_URL` (e.g. a dedicated test PostgreSQL instance or Neon branch). Tests never mutate the development database.
- **Worker Isolation**: Webhook workers and long-lived queue consumers are disabled during test mode to ensure tests exit cleanly.
- **Payment & Email Mocks**: Gateway calls (Razorpay SDK) and external SMTP networks are mocked or use in-memory JSON fallback during test runs.

---

## 🧪 Writing a New Test

### Backend Test Example (`apps/server/tests/myFeature.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('My Feature API', () => {
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

### Frontend Test Example (`apps/client/src/features/.../MyComponent.test.tsx`)
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="ShopSmart" />);
    expect(screen.getByText('ShopSmart')).toBeInTheDocument();
  });
});
```

---

## 🛡️ Pre-Flight Verification Checklist

Before pushing code or opening a PR, always make sure the following pass:

```bash
pnpm turbo run lint       # Zero ESLint warnings or errors
pnpm turbo run typecheck  # Zero TypeScript compiler errors
pnpm turbo run test       # 100% test pass rate
pnpm turbo run build      # Clean Next.js and Express build
```
