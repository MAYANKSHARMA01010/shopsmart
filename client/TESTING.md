# Testing Guide

This project uses **Vitest** for testing and **MSW (Mock Service Worker)** for mocking API requests.

## Running Tests

To run all tests:
```bash
npm test
# or
npm test -- run
```

## How It Works

### Integration Tests
Integration tests (in `src/__tests__/integration`) test how components interact with "real" data. However, instead of hitting a real backend server, we intercept requests using MSW.

The MSW server is configured in `src/setupTests.js` and `src/mocks/server.js`. It uses handlers defined in `src/mocks/handlers.js`.

### Adding New Tests

1.  Create a test file `MyComponent.integration.test.jsx`.
2.  Render your component.
3.  MSW will automatically intercept any `fetch` calls.
4.  Assert that your component displays the data returned by `handlers.js`.

### Overriding Mocks
If a specific test needs a different response (e.g., an error), you can override the handler *inside the test*:

```javascript
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'

it('shows error message', () => {
  server.use(
    http.get('*/api/endpoint', () => {
      return HttpResponse.error()
    })
  )
  render(<MyComponent />)
  // ... assertions
})
```
