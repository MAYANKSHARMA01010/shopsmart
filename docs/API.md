# 🔌 ShopSmart REST API Reference

All backend API endpoints are prefixed with `/api/v1`. Every request and response uses JSON formatting.

---

## Standard JSON Response Envelope

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "message": "Error description here",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## Core Endpoints

### 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new customer account | No |
| `POST` | `/api/v1/auth/login` | Login with email/username + password | No |
| `POST` | `/api/v1/auth/refresh` | Refresh an expired access token | No (Uses Refresh Token) |
| `POST` | `/api/v1/auth/logout` | Revoke the active refresh token | Yes |
| `GET` | `/api/v1/auth/me` | Fetch currently logged-in user profile | Yes |
| `PUT` | `/api/v1/auth/profile` | Update profile information | Yes |

---

### 📦 Products & Categories (`/api/v1/products`, `/api/v1/categories`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Search and filter products with pagination | No |
| `GET` | `/api/v1/products/:id` | Fetch product details by UUID | No |
| `POST` | `/api/v1/products` | Create a new product (Vendor / Admin) | Yes (`products:create`) |
| `PUT` | `/api/v1/products/:id` | Update product details (Vendor / Admin) | Yes (`products:update`) |
| `DELETE` | `/api/v1/products/:id` | Delete a product (Admin only) | Yes (`products:delete`) |
| `GET` | `/api/v1/categories` | Retrieve nested category tree | No |
| `POST` | `/api/v1/categories` | Create a category (Admin only) | Yes (`categories:create`) |

---

### 🛒 Cart & Wishlist (`/api/v1/cart`, `/api/v1/wishlist`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cart` | Get current user's active cart | Yes |
| `POST` | `/api/v1/cart/items` | Add an item to cart (`productId`, `quantity`) | Yes |
| `PUT` | `/api/v1/cart/items/:productId` | Update item quantity in cart | Yes |
| `DELETE` | `/api/v1/cart/items/:productId` | Remove an item from cart | Yes |
| `POST` | `/api/v1/cart/merge` | Merge anonymous guest cart into user cart | Yes |
| `GET` | `/api/v1/wishlist` | Get user's saved wishlist products | Yes |
| `POST` | `/api/v1/wishlist/:productId` | Add a product to wishlist | Yes |
| `DELETE` | `/api/v1/wishlist/:productId` | Remove a product from wishlist | Yes |

---

### 💳 Checkout & Payments (`/api/v1/checkout`, `/api/v1/payment`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/checkout/initialize` | Initialize checkout, lock stock & create Razorpay order | Yes |
| `POST` | `/api/v1/checkout/verify` | Verify Razorpay HMAC signature & confirm order | Yes |
| `POST` | `/api/v1/payment/webhook` | Razorpay webhook receiver (`payment.captured`, `payment.failed`) | Webhook HMAC Header |

---

### 📋 Orders (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/orders/my-orders` | List past orders for logged-in customer | Yes |
| `GET` | `/api/v1/orders/:id` | Get details of a single order | Yes |
| `GET` | `/api/v1/orders` | List all orders across platform (Admin only) | Yes (`orders:read`) |
| `PATCH` | `/api/v1/orders/:id/status` | Transition order status (Admin only) | Yes (`orders:update`) |
