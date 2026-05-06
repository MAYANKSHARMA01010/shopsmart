# ☁️ ShopSmart Infrastructure (AWS)

This document explains the "Cloud House" we built for ShopSmart on Amazon Web Services (AWS). We use a tool called **Terraform** to build this automatically.

---

## 1. What is Infrastructure as Code (Terraform)?
Imagine if you could write a list of instructions like "Build a 2-story house with 3 windows," and a robot instantly built it for you. That is **Terraform**. Instead of clicking buttons on the AWS website, we write code, and Terraform builds our servers, databases, and networks exactly the same way every time.

---

## 2. The Main Components

### 🌐 The Network (VPC)
The **VPC (Virtual Private Cloud)** is like a private fence around our servers. It keeps our application safe from the public internet and ensures only the right traffic gets in.

### 🏠 The Container Runners (ECS & EKS)
We have two ways to run our application:
1.  **ECS (Elastic Container Service)**: A simple and fast way to run Docker containers. We use "Fargate," which means AWS manages the computers for us—we just provide the code.
2.  **EKS (Elastic Kubernetes Service)**: A more powerful system used by big companies. It automatically manages multiple copies of our app and "heals" itself if a container crashes.

### 📦 The Storage (S3 & ECR)
1.  **S3 (Simple Storage Service)**: Think of this as a giant hard drive in the sky. We use it to store our "Terraform State" (the memory of what we built).
2.  **ECR (Elastic Container Registry)**: A private storage room for our Docker images. When we build our app, we "park" the images here so ECS and EKS can find them.

### 🚦 The Traffic Controller (Load Balancer)
We use an **Application Load Balancer (ALB)**. Think of it as a helpful security guard at the front gate. When a user visits the site, the guard looks at the request:
- If the user wants data (starts with `/api/`), they are sent to the **Backend**.
- Otherwise, they are sent to the **Frontend**.

---

## 3. Why is this good for a Beginner?
- **It's Automated**: You don't have to manually set up servers.
- **It's Safe**: Everything is protected by "Security Groups" (digital firewalls).
- **It's Scalable**: If 1,000 people visit your site tomorrow, this infrastructure can grow to handle them!
