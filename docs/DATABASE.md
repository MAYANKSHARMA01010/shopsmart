# 🗄️ Database & Schema

ShopSmart uses **PostgreSQL** as the primary data store and **Prisma** as the Object-Relational Mapper (ORM).

## 📊 Schema (Prisma)

The schema is defined in `server/prisma/schema.prisma`. 

### `Product` Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Int` | Primary Key (Auto-increment) |
| `name` | `String` | Name of the product |
| `description`| `String?` | Optional detailed description |
| `price` | `Float` | Price in USD |
| `stock` | `Int` | Inventory count (default: 0) |
| `category` | `String?` | Optional product category |
| `imageUrl` | `String?` | Optional link to product image |
| `createdAt` | `DateTime` | Auto-generated timestamp |
| `updatedAt` | `DateTime` | Auto-updated timestamp |

---

## 🚀 Prisma Workflow

### 1. Generating the Client
Whenever you change the `schema.prisma` file, you must regenerate the TypeScript client:
```bash
pnpm db:generate
```

### 2. Pushing Changes (Development)
To quickly update your local database without creating migration files:
```bash
pnpm db:push
```

### 3. Migrations (Production)
To create a history of changes for production:
```bash
pnpm db:migrate
```

### 4. Exploring Data
Open a web UI to view and edit your data:
```bash
pnpm db:studio
```

---

## ⚡ Redis Caching
We use Redis to store the results of the `GET /products` endpoint to reduce database load.
*   **Key**: `products:all`
*   **TTL**: 3600 seconds (1 hour)
*   **Invalidation**: The cache is automatically deleted whenever a product is **created**, **updated**, or **deleted**.

---

## 🛠️ Local PostgreSQL Setup
If you aren't using Docker, you can run PostgreSQL locally and update your `DATABASE_URL` in `.env`:
```text
DATABASE_URL="postgresql://user:password@localhost:5432/shopsmart"
```
