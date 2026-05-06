# 🏗️ ShopSmart System Architecture

This document explains how the ShopSmart project is built and how all the pieces connect. It is written in simple English so that beginners can easily understand how a modern web application works.

---

## 1. The Big Picture

At a high level, ShopSmart is divided into three main parts:
1. **Frontend (The Website)**: What the user sees and interacts with.
2. **Backend (The Brain)**: The server that processes requests and handles logic.
3. **Database & Cache (The Memory)**: Where information (like products and users) is saved.

Here is how data flows when a user visits the website:

1. A user opens the website on their browser.
2. The **Frontend** asks the **Backend** for data (like a list of products).
3. The **Backend** checks the **Redis Cache** (temporary fast memory) to see if it already knows the answer.
4. If not, the **Backend** asks the **PostgreSQL Database** (permanent memory).
5. The data is sent back to the user's screen.

---

## 2. The Code Structure

Our code is split into two main folders:

### `client/` (Frontend)
- Built with **React** and **Next.js**.
- This is where all the buttons, pages, and visual designs live.
- It talks to the backend to get data to show to the user.

### `server/` (Backend)
- Built with **Node.js** and **Express**.
- This is the API. It listens for requests from the frontend, processes them, and securely talks to the database using a tool called **Prisma**.

---

## 3. How We Run the Code (Docker)

To make sure the code runs perfectly on every computer (whether it's a Mac, Windows, or a server in the cloud), we use **Docker**. 

Think of Docker as shipping containers. We pack the Frontend into one container and the Backend into another. This way, we don't have to worry about what software is installed on the computer running it—the container has everything it needs inside!

---

## 4. The Cloud Infrastructure (AWS)

When we put the app on the real internet, we use **Amazon Web Services (AWS)**. We manage this using a tool called **Terraform**, which lets us write our server setup as code.

Here is where our code lives in the cloud:
- **ECR (Elastic Container Registry)**: This is a storage room for our Docker containers.
- **ECS (Elastic Container Service)**: A service that runs our Docker containers without us needing to manage the underlying computers.
- **EKS (Elastic Kubernetes Service)**: An advanced system that automatically manages and scales our containers based on how many people are using the app.

*(Note: We use both ECS and EKS for learning purposes. In a real-world project, you would usually just pick one!)*

---

## 5. Automated Deployments (CI/CD)

We use **GitHub Actions** so that nobody has to manually copy code to the server. 

When a developer finishes writing code and "pushes" it to GitHub:
1. **Testing**: GitHub automatically runs tests to make sure the new code didn't break anything.
2. **Infrastructure**: GitHub updates our AWS servers if needed.
3. **Build**: GitHub creates new Docker containers with the fresh code.
4. **Deploy**: GitHub automatically swaps out the old containers on AWS for the new ones.

This means deploying a new feature is as simple as clicking "Save" and sending it to GitHub!
