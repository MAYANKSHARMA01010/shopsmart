# 🔌 ShopSmart API Documentation

The ShopSmart Backend provides a RESTful API for managing products and checking system health.

## Base URL
*   **Local**: `http://localhost:5001/api`
*   **Production**: `https://api.shopsmart.example.com/api`

---

## 🏥 System Health
Check if the server and database are running correctly.

### GET `/health`
*   **Description**: Returns the health status of the backend and Redis connection.
*   **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "message": "ShopSmart Backend is running",
      "timestamp": "2026-04-26T17:00:00.000Z",
      "database": "PostgreSQL",
      "redis": "connected"
    }
    ```

---

## 📦 Products
Endpoints for managing the product catalog.

### 1. List All Products
*   **Endpoint**: `GET /products`
*   **Query Parameters**:
    *   `category` (optional): Filter by category (e.g., `electronics`, `clothing`).
    *   `search` (optional): Search by name or description.
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "name": "Mechanical Keyboard",
        "description": "RGB Backlit, Brown Switches",
        "price": 89.99,
        "stock": 45,
        "category": "electronics",
        "imageUrl": "https://example.com/kb.jpg",
        "createdAt": "2026-04-26T...",
        "updatedAt": "2026-04-26T..."
      }
    ]
    ```

### 2. Get Product by ID
*   **Endpoint**: `GET /products/:id`
*   **Response (200 OK)**: A single product object.
*   **Response (404 Not Found)**: `{"message": "Product not found"}`

### 3. Create Product
*   **Endpoint**: `POST /products`
*   **Body**:
    ```json
    {
      "name": "New Product",
      "price": 29.99,
      "category": "sports",
      "stock": 100
    }
    ```
*   **Response (201 Created)**: The created product object.

### 4. Update Product
*   **Endpoint**: `PUT /products/:id`
*   **Body**: Partial product object.
*   **Response (200 OK)**: The updated product object.

### 5. Delete Product
*   **Endpoint**: `DELETE /products/:id`
*   **Response (200 OK)**: `{"message": "Product deleted successfully"}`

---

## 🛠️ Error Handling
The API uses standard HTTP status codes:
*   `200`: Success
*   `201`: Created
*   `400`: Bad Request (Validation failed)
*   `404`: Not Found
*   `500`: Internal Server Error

**Error Response Body**:
```json
{
  "status": "error",
  "message": "Detailed error message here"
}
```
