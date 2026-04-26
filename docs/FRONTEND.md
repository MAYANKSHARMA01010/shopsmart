# 🎨 Frontend Documentation

The ShopSmart frontend is built with **Next.js 16** and **React 19**, focusing on a clean UI and efficient data handling.

## 🏗️ Project Structure
Located in the `/client` directory:
*   `src/app`: Next.js App Router (Layouts, Global CSS).
*   `src/pages`: Individual page components (HomePage, ProductsPage).
*   `src/components`: Reusable UI elements (ProductCard, Navbar).
*   `src/hooks`: Custom React hooks for business logic.
*   `src/services`: API client and data fetching logic.
*   `src/schemas`: Zod validation schemas shared between components.

---

## 🚦 State Management
We keep state management simple and effective:
1.  **Local State**: `useState` for UI-specific toggles and form inputs.
2.  **Custom Hooks**: `useProducts.ts` handles all data fetching, loading states, and error handling for the product catalog.
3.  **Form Validation**: **Zod** handles real-time validation for the "Add Product" form.

---

## 💅 Styling
*   **Vanilla CSS**: We use a custom design system defined in `src/app/globals.css`.
*   **Responsive Design**: The layout uses Flexbox and CSS Grid to ensure it looks great on mobile, tablet, and desktop.
*   **Themes**: High-contrast colors and smooth transitions are used for a premium feel.

---

## 🛠️ Key Components

### `ProductCard.tsx`
Displays product info, price, and category emojis. Includes a delete action with loading state.

### `ProductForm.tsx`
A fully validated form using Zod. Handles type conversion (strings to numbers) and displays inline error messages.

### `Navbar.tsx`
Clean navigation with active state tracking.

---

## 📡 Data Fetching
We use **Axios** with a centralized `apiClient.ts` that automatically handles the Base URL depending on whether you are in `development` or `production`.

Example usage in a hook:
```typescript
const products = await productService.getAll();
```
