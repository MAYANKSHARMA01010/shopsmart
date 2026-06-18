# 🚀 ShopSmart Deployment Guide

This document explains how to put your code live on the internet! 

---

## 1. Local Deployment (Testing on your computer)
Before you put your app on the real internet, you should test it on your own machine.
1.  Open your terminal.
2.  Run `docker-compose up --build`.
3.  Open `http://localhost:3000` in your browser.
If everything looks good, you are ready to deploy!

---

## 2. Cloud Deployment (The "Real" Internet)
We have made this super easy! You don't have to manually upload any files.

### Step 1: Push your code
Just send your latest changes to GitHub:
```bash
git add .
git commit -m "My new feature"
git push origin main
```

### Step 2: Watch the Pipeline
Go to the **Actions** tab on your GitHub repository. You will see a job running. It will:
- Run tests.
- Build your servers.
- Update your containers.

### Step 3: Get your link
Once the pipeline finishes (turns green), you can find your live website link:
1.  Click on the successful "Phase 2 - Terraform Provisioning" step in GitHub.
2.  Look for a line that says `ecs_alb_dns_name`.
3.  Copy that link and share it with the world!

---

## 3. Important Tips for Beginners
- **Database Secrets**: If you change your database password, you must update the `DATABASE_URL` in your GitHub Secrets.
- **Wait Time**: Cloud deployments take about **5 to 10 minutes**. Don't worry if it's slow—AWS is building a lot of things for you!
- **Errors**: If the deployment fails, don't panic. Check the "Actions" logs to see if a test failed or if an AWS permission was missing.
