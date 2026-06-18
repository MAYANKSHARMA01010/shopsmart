# 🧪 ShopSmart Testing Guide

This document explains why and how we test our code to make sure it's perfect!

---

## 1. Why do we test?
Imagine you are building a car. Before you drive it on the highway, you want to make sure the brakes work, right?
**Testing** is the same thing for code. We write small programs that "check" our main application to make sure it works correctly. This prevents us from accidentally breaking the website for our users.

---

## 2. Types of Tests we use
1.  **Unit Tests**: We check tiny pieces of code (like a single button or a mathematical function).
2.  **Integration Tests**: We check if two pieces work well together (like "Can the backend talk to the database?").
3.  **End-to-End (E2E) Tests**: We pretend to be a real user clicking on the website to see if everything flows correctly.

---

## 3. How to run tests yourself
You can run the tests on your own computer anytime!

```bash
# To test the Backend
cd server
pnpm test

# To test the Frontend
cd client
pnpm test
```

---

## 4. Automatic Testing
Every time you push code to GitHub, our **CI/CD Pipeline** automatically runs these tests. If any test fails, the pipeline stops and **will not deploy** your code. This is our safety net!
