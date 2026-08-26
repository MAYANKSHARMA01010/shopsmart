# 🚢 ShopSmart Deployment Guide

This guide describes how to deploy **ShopSmart** to production or staging environments simply and reliably.

---

## 1. Recommended Production Architecture

| Component | Recommended Host | Free / Low-Cost Tier Available? |
| :--- | :--- | :--- |
| **Frontend (Next.js 16)** | [Vercel](https://vercel.com) | ✅ Free hobby tier |
| **Backend (Express 5)** | [Render](https://render.com) / [Railway](https://railway.app) / [Fly.io](https://fly.io) | ✅ Free / Low-cost starter |
| **PostgreSQL Database** | [Neon Serverless Postgres](https://neon.tech) | ✅ Generous free tier |
| **Redis & BullMQ Queue** | [Upstash Redis](https://upstash.com) | ✅ 10,000 commands/day free |
| **Transactional Email** | [Gmail App Password](https://myaccount.google.com/apppasswords) / [Brevo](https://brevo.com) | ✅ 300 - 500 emails/day free |
| **Payment Gateway** | [Razorpay](https://razorpay.com) | ✅ Free test mode / standard txn fee |

---

## 2. Deploying with Docker

The repository includes production Dockerfiles for both services.

### Build and Run with Docker Compose
```bash
docker-compose -f docker/docker-compose.yml up --build -d
```

### Environment Variables Checklist for Production
Ensure all of the following are set in your production dashboard:

```env
NODE_ENV="production"
SERVER_PORT=5001

# Production Database & Redis
DATABASE_URL="postgresql://user:pass@ep-host.neon.tech/shopsmart_prod?sslmode=require"
REDIS_SERVER_URL="rediss://default:token@host.upstash.io:6379"

# Security & Secrets
JWT_ACCESS_SECRET="generate-a-strong-random-64-character-secret"
JWT_REFRESH_SECRET="generate-another-strong-random-64-character-secret"

# Live Razorpay Credentials
RAZORPAY_KEY_ID="rzp_live_xxxxxx"
RAZORPAY_KEY_SECRET="live_secret_from_razorpay_dashboard"
RAZORPAY_WEBHOOK_SECRET="secret_configured_in_razorpay_webhook_dashboard"

# Email SMTP Credentials (e.g. Gmail App Password or Brevo)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="your-store@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="ShopSmart <your-store@gmail.com>"

# Domains
FRONTEND_SERVER_URL="https://shopsmart.yourdomain.com"
BACKEND_SERVER_URL="https://api.shopsmart.yourdomain.com"
```

---

## 3. Database Migration in Production

Before routing live traffic, run Prisma migrations on your production database:

```bash
pnpm --filter shopsmart-server prisma migrate deploy
```
*(Never run `prisma db push` on a live production database with active customer data).*
