# 🐳 ShopSmart Docker Guide

This document explains how we use **Docker** to make sure our application runs perfectly on any computer.

---

## 1. What is Docker?
Think of Docker as a **"Shipping Container"** for code. 
In the old days, a developer would say: *"It works on my machine!"*—but then it would break on the server. Docker fixes this. We pack our code, its settings, and its tools into a container. This container will run exactly the same way on your laptop, on your friend's Windows PC, and on the AWS cloud.

---

## 2. Our Containers
We have two main containers in ShopSmart:
1.  **Frontend (Client)**: Contains our React and Next.js website.
2.  **Backend (Server)**: Contains our Node.js API and the connection to the database.

---

## 3. Useful Commands for Beginners
If you have Docker installed on your computer, you can run the whole project with one command:

```bash
# Start everything (Frontend, Backend, Database, and Redis)
docker-compose up --build
```

### Why use this?
- You don't have to install Node.js, Postgres, or Redis manually.
- Docker starts everything for you in its own "bubble."
- When you are done, you can just stop the containers and your computer stays clean!

---

## 4. How it works in the Cloud
When we "Deploy" the app, GitHub builds these containers and sends them to **AWS ECR**. Then, **ECS** or **EKS** pulls those containers and runs them on the internet.
