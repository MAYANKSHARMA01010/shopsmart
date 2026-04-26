# 🐳 Docker & Deployment

ShopSmart is fully containerized for easy deployment and consistent environments.

## 📦 Container Services

The `docker-compose.yml` file defines four services:

1.  **frontend**: The Next.js application.
    *   Builds using a multi-stage `Dockerfile`.
    *   Exposed on port `3000`.
2.  **backend**: The Express API.
    *   Builds using a multi-stage `Dockerfile`.
    *   Exposed on port `5001`.
3.  **db**: PostgreSQL 16 database.
    *   Uses a persistent volume `postgres_data`.
4.  **redis**: Redis 7 cache.
    *   Uses a persistent volume `redis_data`.

---

## 🚀 Commands

### 1. Build and Start
Builds all images and starts the containers in the foreground:
```bash
docker-compose up --build
```

### 2. Run in Background
```bash
docker-compose up -d
```

### 3. Stop and Cleanup
Stops containers but keeps the data:
```bash
docker-compose down
```

Stops containers and **deletes all database data**:
```bash
docker-compose down -v
```

---

## 🏗️ Production Deployment

### Multi-Stage Builds
Our Dockerfiles (in `/client` and `/server`) use multi-stage builds.
*   **Stage 1 (Installer)**: Installs all dependencies.
*   **Stage 2 (Builder)**: Compiles the code (TSC for server, Next Build for client).
*   **Stage 3 (Runner)**: Only copies the necessary production files. This keeps the final image size very small.

### Environment Variables
For production, update the `FRONTEND_SERVER_URL` and `BACKEND_SERVER_URL` in your Docker environment or `.env` files.

---

## 🛠️ Debugging Docker
To see logs for a specific service:
```bash
docker-compose logs -f backend
```

To run a command inside the backend container:
```bash
docker-compose exec backend pnpm db:studio
```
