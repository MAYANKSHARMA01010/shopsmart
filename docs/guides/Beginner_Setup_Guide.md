# 🛍️ ShopSmart - Comprehensive Setup Guide

Welcome to **ShopSmart**! This guide is designed to help anyone—even complete beginners—get this project up and running smoothly. 

ShopSmart is a modern full-stack e-commerce application. It has a **Frontend** built with React and Next.js, a **Backend** powered by Node.js and Express, and uses **PostgreSQL** (for storing data) and **Redis** (for fast caching). 

Don't worry if these terms sound complex right now; we'll walk through the setup step-by-step!

---

## 🛠️ 1. Prerequisites

Before starting, you'll need to install a few tools on your computer. If you already have these, you can skip to the next section.

- **Node.js (Version 20 or higher)**: The environment that runs our JavaScript code. [Download here](https://nodejs.org/).
- **pnpm**: A fast package manager (much faster than npm). Once Node is installed, open your terminal and run this command to install it: 
  ```bash
  npm install -g pnpm
  ```
- **Docker & Docker Compose**: The absolute easiest way to run databases and apps without installing complex software directly on your computer. [Download Docker Desktop](https://www.docker.com/products/docker-desktop/).
- **Git**: To download the project source code. [Download here](https://git-scm.com/).

---

## ⚙️ 2. Initial Setup & Configuration

First, let's get the code and configure the necessary environment variables (these are secret settings like database passwords).

### Step 2.1: Get the Code
Open your terminal, navigate to where you want to store the project, and clone the repository:
```bash
git clone <repository-url>
cd shopsmart
```

### Step 2.2: Install Dependencies
We use a "workspace", meaning one command installs all the required packages for both the frontend and backend at the same time. Run:
```bash
pnpm install
```

### Step 2.3: Set Up Environment Variables (`.env` files)
The project requires `.env` files to know how to connect to the database and other services. We have provided safe templates named `.env.example`.

You need to copy these templates to create your actual `.env` files.

**For Mac/Linux:**
```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**For Windows (Command Prompt):**
```cmd
copy .env.example .env
copy server\.env.example server\.env
copy client\.env.example client\.env
```

> **Note:** Open `server/.env` and ensure `DATABASE_URL` and `REDIS_LOCAL_URL` are set. If you are using Docker to run the app (which we recommend below), the default values in the example file will work perfectly right out of the box!

---

## 🚀 3. How to Run the Project

You have two choices for running the project. **Option A** is the easiest for complete beginners. **Option B** is better if you want to actively write code and see your changes update instantly on the screen.

### Option A: The "One-Click" Docker Method (Recommended)
This method uses Docker to automatically set up the frontend, backend, database, and cache all at once inside isolated containers.

1. Ensure **Docker Desktop** is open and running on your computer.
2. In your terminal, make sure you are in the root of the `shopsmart` folder, and run:
   ```bash
   docker compose up --build
   ```
3. Wait a minute or two for everything to download and start. Once the terminal stops rapidly printing text, your app is running!

**Where to view the app in your browser:**
- Frontend (The Website): [http://localhost:3000](http://localhost:3000)
- Backend API (Data): [http://localhost:5001](http://localhost:5001)

To stop the app, press `Ctrl + C` in the terminal, or run `docker compose down`.

---

### Option B: The Developer Method (Manual Setup)
If you want to edit code and see changes in real-time without restarting everything, use this method. You will still need Docker just to run the database.

**Terminal 1: Start the Database & Cache**
```bash
docker compose up db redis -d
```
*(The `-d` flag runs them silently in the background).*

**Terminal 2: Start the Backend (Server)**
Open a new terminal tab, and run:
```bash
cd server
pnpm db:push    # This creates the necessary database tables
pnpm dev        # Starts the backend server
```
*(The backend is now running at http://localhost:5001)*

**Terminal 3: Start the Frontend (Client)**
Open a third terminal tab, and run:
```bash
cd client
pnpm dev        # Starts the frontend website
```
*(The frontend is now running at http://localhost:3000)*

---

## ☁️ 4. Deploying to the Cloud (Advanced)

If you want to put your app on the real internet, this project comes with a fully automated AWS Cloud deployment pipeline using **GitHub Actions** and **Terraform**.

1. Create an AWS Account and get your Access Keys.
2. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
3. Add the following repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (Only required if using an AWS Academy Learner Lab)
   - `AWS_REGION` (e.g., `us-east-1`)
   - `DATABASE_URL` (A production database URL, like Neon, Supabase, or AWS RDS)
4. Once secrets are set, any time you push code to the `main` branch, GitHub will automatically build your app, spin up servers, and deploy it to AWS!

---

## 🛑 5. Troubleshooting & FAQs

- **"I get a Prisma Client error when starting the backend!"**
  Run `cd server && pnpm db:generate`. This tells the database tool to rebuild its local configuration files.
  
- **"Port is already in use error"**
  This means another app is already using port 3000, 5001, 5432 (Postgres), or 6379 (Redis). Run `docker compose down -v` to kill any stuck background containers, or close other apps using those ports.

- **"Changes I make to the code aren't showing up on the website!"**
  If you are running the app using **Option A (Docker)**, you need to rebuild the containers to see new code changes. Stop the containers (`Ctrl + C`) and run `docker compose up --build` again. For live, instant updates while coding, you should use **Option B** instead.

---

🎉 **Congratulations!** You've successfully set up ShopSmart. Happy coding!
