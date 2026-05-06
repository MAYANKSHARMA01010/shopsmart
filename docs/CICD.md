# 🚀 ShopSmart CI/CD Pipeline

This document explains how we automatically get code from your computer to the live website. We use **GitHub Actions** to do this.

---

## 1. What is CI/CD?
- **CI (Continuous Integration)**: Every time you save your code and push it to GitHub, we automatically **test** it to make sure nothing is broken.
- **CD (Continuous Deployment)**: If the tests pass, we automatically **deploy** (upload) the new code to our AWS servers.

---

## 2. The 4 Phases of our Pipeline

### 🧪 Phase 1: Testing
GitHub starts a temporary computer and runs all our tests. If a single test fails, the pipeline stops. This prevents us from ever putting broken code on the live website.

### 🏗️ Phase 2: Infrastructure (Terraform)
GitHub uses Terraform to check our AWS setup. If we added a new Load Balancer or a new database in our code, Terraform builds it right now.

### 📦 Phase 3: Build & Store (Docker)
GitHub takes our updated code and packages it into **Docker Images** (shipping containers). It then uploads these images to **AWS ECR** so they are ready to be used.

### 🚢 Phase 4: Deployment (ECS & EKS)
This is the final step! GitHub tells AWS: *"Hey, we have a new version of the app in ECR. Please swap out the old containers for the new ones."*
- It updates the **ECS Fargate** service.
- It updates the **EKS Kubernetes** cluster.

---

## 3. How to use it?
As a developer, you only have to do one thing:
1.  Write your code.
2.  Run `git push origin main`.
3.  Go to the **Actions** tab on your GitHub website and watch the magic happen!

If the pipeline turns **Green**, your changes are live! If it turns **Red**, you can click on the error to see what went wrong.
