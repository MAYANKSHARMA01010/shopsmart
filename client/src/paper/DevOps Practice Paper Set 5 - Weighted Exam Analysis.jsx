import { useState } from "react";

const PRE_MID = [
  {
    id: "Q1",
    topic: "GitHub Actions — Triggers & Job Structure",
    marks: 10,
    scenario: "The Workflow That Never Fired",
    context: `A junior engineer, Rohan, sets up a CI workflow to run tests on every Pull Request. He pushes the workflow file and opens a PR — but the Actions tab shows nothing. No workflow run appears at all. He then notices a second problem: even when the workflow does run manually, the npm test step fails because the repo files are not available.`,
    code: [
      {
        label: "ci.yml (broken)",
        lang: "yaml",
        content: `name: Run Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test`
      }
    ],
    problems: [
      'Opening a Pull Request produces no workflow run — the Actions tab is empty',
      'When triggered manually, npm ci fails immediately: "package.json not found" — the repository files are not present on the runner'
    ],
    questions: [
      { num: "1.1", marks: 3, text: "Explain why opening a Pull Request produces no workflow run. What does the current on: trigger actually listen for, and what trigger must be added so the workflow runs on every Pull Request? Write the corrected on: block." },
      { num: "1.2", marks: 4, text: "Explain why npm ci fails with 'package.json not found' even though the workflow triggered correctly. What is a GitHub Actions runner, and what is its state at the start of every job? Write the missing step that must come before npm ci, name the action it uses, and explain what it does." },
      { num: "1.3", marks: 3, text: "Rohan wants the test job to run only when files inside the src/ directory or the package.json change — not on every PR regardless of what was edited. Show the paths filter he should add to the pull_request trigger and explain what effect it has on workflow execution." }
    ]
  },
  {
    id: "Q2",
    topic: "Linux — Bash Scripting & Idempotency",
    marks: 10,
    scenario: "The Script That Breaks on the Second Run",
    context: `Ananya writes a Bash script to set up a project directory structure on a development server. The script works perfectly the first time. But when a new team member runs it on the same server a second time, it throws errors and exits halfway through. Ananya wants the script to be safe to run any number of times.`,
    code: [
      {
        label: "setup-project.sh (broken)",
        lang: "bash",
        content: `#!/bin/bash
APP_DIR="/var/www/project"

echo "Creating project directory..."
mkdir $APP_DIR

echo "Creating subdirectories..."
mkdir $APP_DIR/logs
mkdir $APP_DIR/uploads
mkdir $APP_DIR/config

echo "Copying default config..."
cp ./defaults/app.config $APP_DIR/config/app.config

echo "Setup complete!"`
      },
      {
        label: "Second run — error output",
        lang: "bash",
        content: `Creating project directory...
mkdir: cannot create directory '/var/www/project': File exists
Creating subdirectories...
mkdir: cannot create directory '/var/www/project/logs': File exists
# Script continues to run after errors — inconsistent state`
      }
    ],
    problems: [
      'Running the script a second time fails — mkdir throws errors because the directories already exist',
      'The script continues running after mkdir errors instead of stopping — it may overwrite config files that were already modified'
    ],
    questions: [
      { num: "2.1", marks: 3, text: "Define idempotency in the context of shell scripting. Why is this script not idempotent? What is the 'Check-Before-Act' pattern, and how does it apply here? Write the corrected mkdir command for APP_DIR that is safe to run multiple times without any error." },
      { num: "2.2", marks: 4, text: "Rewrite the entire setup-project.sh script to be fully idempotent. Use the -d flag to check if each directory exists before creating it, and the -f flag to check if the config file already exists before copying. Add set -e at the top and explain what it does for the second problem." },
      { num: "2.3", marks: 3, text: "Ananya wants the script to accept the project name as a command-line argument so it can be reused for different projects without editing the file. Explain what positional arguments are in Bash, show how to reference the first argument, and add a check that prints a usage message and exits with code 1 if no argument is provided." }
    ]
  },
  {
    id: "Q3",
    topic: "Linux — File Permissions & SSH Keys",
    marks: 10,
    scenario: "The Key That SSH Refused",
    context: `Dev downloads a .pem key pair from the AWS Console to SSH into a new EC2 instance. His first connection attempt is immediately rejected. After fixing the issue and connecting, he needs to create a deployment script that should only be executable by its owner — not readable or runnable by anyone else on the server.`,
    code: [
      {
        label: "SSH attempt and error",
        lang: "bash",
        content: `$ ssh -i ~/Downloads/mykey.pem ec2-user@3.91.24.55

@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!      @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for 'mykey.pem' are too open.
This private key will be ignored.
Permission denied (publickey).`
      },
      {
        label: "ls -l before fix",
        lang: "bash",
        content: `-rw-r--r--  1 dev  staff  1678 Jul 5 10:30 mykey.pem`
      }
    ],
    problems: [
      'SSH rejects the .pem key because the file permissions are too open — other users on the system can read the private key',
      'A deployment script needs permissions set so only the owner can read and execute it — group and others must have no access at all'
    ],
    questions: [
      { num: "3.1", marks: 3, text: "Explain why SSH refuses a private key with permissions 0644 according to Linux security principles. Decode the ls -l output (rw-r--r--) — break it into its three groups (owner, group, others) and state what each group can currently do with the file." },
      { num: "3.2", marks: 4, text: "Write the chmod command that fixes the .pem key so SSH accepts it. Explain what the permission number means by breaking down the three digits using the values 4 (read), 2 (write), and 1 (execute). After your fix, state exactly who can read, write, or execute the file." },
      { num: "3.3", marks: 3, text: "Dev needs deploy.sh to be readable and executable only by its owner — group and others must have zero permissions of any kind. Write the chmod command using numeric notation, decode each digit, and explain how this implements the Principle of Least Privilege." }
    ]
  },
  {
    id: "Q4",
    topic: "CI/CD — GitHub Actions Secrets & Test Isolation",
    marks: 10,
    scenario: "The Test That Passes Locally But Fails in CI",
    context: `A team's React frontend test suite passes on every developer's laptop but consistently fails in the GitHub Actions CI pipeline. The tests call a real backend at http://localhost:5000/api/products. The CI pipeline also has a security problem — an engineer hardcoded an AWS access key directly in the workflow YAML to deploy the built app to S3.`,
    code: [
      {
        label: "ci.yml (excerpt with security issue)",
        lang: "yaml",
        content: `jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      # Fails: Network Error — http://localhost:5000/api/products

  deploy:
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - run: aws s3 sync dist/ s3://my-frontend-prod
        env:
          AWS_ACCESS_KEY_ID: AKIAIOSFODNN7EXAMPLE
          AWS_SECRET_ACCESS_KEY: wJalrXUtnFEMI/K7MDENGbPxRfiCYEXAMPLEKEY`
      }
    ],
    problems: [
      'npm test fails in CI with "Network Error: connection refused" — the React components try to fetch from http://localhost:5000/api/products which does not exist on the runner',
      'AWS credentials are hardcoded in plain text in the YAML file which is committed to the GitHub repository'
    ],
    questions: [
      { num: "4.1", marks: 4, text: "Explain precisely why the tests fail in CI but pass locally. What is a GitHub Actions runner and what services are running on it compared to a developer's laptop? What does this mean for any test that makes real HTTP requests to localhost? Name the testing technique and a specific tool (with its full name) that solves this problem without requiring a real backend." },
      { num: "4.2", marks: 3, text: "Explain the security risk of hardcoded AWS credentials in YAML. What happens the moment this file is pushed to a public GitHub repository? Name the GitHub Actions feature that stores sensitive values securely and show exactly how the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY should be referenced in the deploy step — not their actual values." },
      { num: "4.3", marks: 3, text: "Explain the difference between Continuous Integration, Continuous Delivery, and Continuous Deployment. Looking at this workflow — which of the three does it implement for the deploy job, and what would need to change to implement Continuous Delivery instead of Continuous Deployment?" }
    ]
  }
];

const POST_MID = [
  {
    id: "Q5",
    topic: "Docker — Build Context & Layer Caching",
    marks: 10,
    scenario: "The Build That Sends 800 MB Before Starting",
    context: `Priya is containerizing a Node.js backend for the first time. She notices two problems every time she runs docker build. The terminal hangs for 30 seconds before anything happens, and whenever she edits server.js, the build reinstalls all npm packages from scratch.`,
    code: [
      {
        label: "Project structure",
        lang: "text",
        content: `myapp/
├── Dockerfile
├── package.json
├── package-lock.json
├── server.js
├── src/                  (2 MB)
├── node_modules/         (450 MB)
├── .git/                 (120 MB)
├── test-data/            (200 MB CSVs)
└── docs/                 (PDFs)`
      },
      {
        label: "Dockerfile (broken)",
        lang: "dockerfile",
        content: `FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 4000
CMD ["node", "server.js"]`
      },
      {
        label: "docker build output",
        lang: "bash",
        content: `$ docker build -t myapp .
Sending build context to Docker daemon  782.4MB
Step 1/6 : FROM node:20-alpine
# hangs here for ~30 seconds before continuing`
      }
    ],
    problems: [
      'Docker sends 782 MB to the daemon before the build even starts — the actual source code is only ~2 MB',
      'Every time server.js is edited, RUN npm install executes again from scratch even though package.json did not change'
    ],
    questions: [
      { num: "5.1", marks: 3, text: "Explain what the Docker build context is and why it is sent to the daemon before any Dockerfile instruction runs. Identify the three specific directories from the project structure causing the 782 MB bloat and explain why each one should not be in the build context." },
      { num: "5.2", marks: 3, text: "Explain how Docker layer caching works. Why does changing server.js cause RUN npm install to re-run even though package.json has not changed? Walk through the current Dockerfile instruction by instruction and identify which layer is being invalidated and why." },
      { num: "5.3", marks: 4, text: "Write a .dockerignore file that removes the bloated directories from the build context. Then write a corrected Dockerfile that fixes the caching problem so npm install only re-runs when package.json or package-lock.json changes. Explain in one sentence why the new instruction ordering achieves better caching." }
    ]
  },
  {
    id: "Q6",
    topic: "Docker — Volumes & Data Persistence",
    marks: 10,
    scenario: "The Uploaded Files That Disappeared",
    context: `Nikhil builds a file-sharing server where users upload files that are stored inside the container at /app/uploads. Everything works fine. A week later he rebuilds the image with a bug fix and replaces the container. All uploaded files are gone. A colleague suggests adding a volume flag — but Nikhil needs to understand why his files disappeared before accepting the fix.`,
    code: [
      {
        label: "Original deployment",
        lang: "bash",
        content: `docker run -d --name fileserver -p 4000:4000 fileserver:v1
# Users upload files — everything works for a week`
      },
      {
        label: "Redeployment with bug fix",
        lang: "bash",
        content: `docker stop fileserver
docker rm fileserver
docker run -d --name fileserver -p 4000:4000 fileserver:v2

# Check uploads:
docker exec -it fileserver ls /app/uploads
# (empty — all files gone)`
      },
      {
        label: "Colleague's suggested fix",
        lang: "bash",
        content: `docker run -d --name fileserver -p 4000:4000 \
  -v uploads_data:/app/uploads \
  fileserver:v2`
      }
    ],
    problems: [
      'All uploaded files disappeared after docker rm even though the image is still on disk',
      'The team is planning to migrate to AWS ECS on Fargate — the volume fix may not work there'
    ],
    questions: [
      { num: "6.1", marks: 4, text: "Explain precisely where the uploaded files were stored in the v1 setup and why docker rm deleted them. Use the terms image, container, and writable layer correctly in your answer. Why does the image still being on disk not help recover the files?" },
      { num: "6.2", marks: 3, text: "Explain what -v uploads_data:/app/uploads does. What type of storage is uploads_data, where does Docker physically store it on the host machine, and why do files now survive docker rm and container replacement?" },
      { num: "6.3", marks: 3, text: "Explain why the -v flag solution will stop working when the team moves to AWS ECS on Fargate. What is specific about Fargate's architecture that makes named Docker volumes unsuitable? Name the AWS service that provides a persistent, shared filesystem solution for containerized apps on Fargate." }
    ]
  },
  {
    id: "Q7",
    topic: "Docker Compose — Service Dependencies & Volumes",
    marks: 10,
    scenario: "The API That Crashes on First Start",
    context: `A team writes a Docker Compose file for their web application with three services: a React frontend, a Node.js API, and a PostgreSQL database. Two problems appear every time the team runs docker compose up on a fresh machine.`,
    code: [
      {
        label: "compose.yaml (broken)",
        lang: "yaml",
        content: `services:
  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      API_URL: http://api:4000

  api:
    build: ./api
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgres://admin:pass@db:5432/appdb
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: appdb`
      }
    ],
    problems: [
      '(a) On first docker compose up, the api container exits with connection refused. Restarting it manually five seconds later works perfectly.',
      '(b) After docker compose down and docker compose up, all data entered into the database is gone.'
    ],
    questions: [
      { num: "7.1", marks: 3, text: "Explain in 2–3 sentences how the api container resolves the hostname db without any explicit networks: block in the compose file. What does Docker Compose create automatically, and how does DNS resolution work between services in the same stack?" },
      { num: "7.2", marks: 4, text: "Diagnose precisely why the api crashes on the first run even though depends_on: db is set. What does depends_on actually wait for — container start or service readiness? Show the modified api service snippet that fixes this using a condition that waits for the database to be ready to accept connections. Show the db healthcheck block that makes this possible." },
      { num: "7.3", marks: 3, text: "Explain why all database data is lost after docker compose down. Modify the db service to add a named volume so data survives docker compose down followed by docker compose up. Show the complete modified db service snippet including the volumes: section at the top level." }
    ]
  },
  {
    id: "Q8",
    topic: "AWS ECS — ECR & Task Definitions",
    marks: 10,
    scenario: "The Deployment That Deployed Old Code",
    context: `A team's CI pipeline builds and pushes a Docker image to ECR with the tag latest on every merge to main. It then forces a new ECS deployment. ECS reports the deployment successful. Users report seeing the old behavior. Engineers check the logs inside running tasks and confirm old code is executing.`,
    code: [
      {
        label: "CI pipeline steps",
        lang: "bash",
        content: `# Build and push to ECR
docker build -t myapi .
docker tag myapi:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/myapi:latest
docker push \
  123456789.dkr.ecr.us-east-1.amazonaws.com/myapi:latest

# Force ECS to redeploy
aws ecs update-service \
  --cluster prod \
  --service api \
  --force-new-deployment`
      },
      {
        label: "ECS Task Definition (excerpt)",
        lang: "json",
        content: `{
  "containerDefinitions": [{
    "name": "api",
    "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/myapi:latest"
  }]
}`
      }
    ],
    problems: [
      'ECS reports a successful deployment but running tasks are executing the old code',
      'The team cannot tell which code version is running in production by looking at the task definition'
    ],
    questions: [
      { num: "8.1", marks: 4, text: "Explain the root cause. When ECS launches a new task, how does it resolve the image reference in the task definition? Why does using the latest tag cause ECS to pull stale image bytes even after the image in ECR has been overwritten with new code? What is the specific caching mechanism responsible?" },
      { num: "8.2", marks: 4, text: "Propose a deployment pipeline that prevents this permanently. Explain: (a) how the image should be tagged instead of using latest, (b) why the ECS Task Definition must be updated as part of the deployment (not just the image in ECR), and (c) what the correct sequence of CLI commands is to register a new task definition revision and update the service to use it." },
      { num: "8.3", marks: 2, text: "The task currently passes AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY as environment variables in the task definition to access S3. Name the AWS-native replacement and state one specific security advantage it provides over static access keys." }
    ]
  },
  {
    id: "Q9",
    topic: "Terraform — State & Configuration Drift",
    marks: 10,
    scenario: "The Plan That Wanted to Rebuild Everything",
    context: `Aisha provisions a VPC, an EC2 instance, and an S3 bucket using Terraform from her laptop. The state file is stored locally. A second engineer joins the team, clones the repository, and runs terraform plan — Terraform proposes creating all three resources again. Later, Aisha changes the EC2 instance type manually in the AWS Console. Running terraform plan a week later shows Terraform wants to destroy and recreate the instance.`,
    code: [
      {
        label: "main.tf",
        lang: "hcl",
        content: `provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t2.micro"
}

resource "aws_s3_bucket" "assets" {
  bucket = "shopmart-assets-prod"
}`
      }
    ],
    problems: [
      'Second engineer\'s terraform plan proposes creating all resources as new even though they already exist in AWS',
      'After manually changing the EC2 instance type in the AWS Console, Terraform wants to destroy and recreate the instance'
    ],
    questions: [
      { num: "9.1", marks: 4, text: "Explain what the Terraform state file is and what information it tracks. Why did the second engineer's terraform plan propose creating all resources as new? What are two specific problems that occur when the state file is stored locally on one engineer's laptop? What single architectural change fixes this for the whole team?" },
      { num: "9.2", marks: 3, text: "Explain what happened after Aisha manually changed the EC2 instance type in the AWS Console. What Terraform concept does this demonstrate? Why is Terraform proposing to destroy and recreate the instance rather than leaving it alone? Use the phrase 'source of truth' in your answer." },
      { num: "9.3", marks: 3, text: "Aisha decides the manual change was correct and wants to keep the t3.small instance type without Terraform reverting it. Describe the cleanest one-time fix — show the HCL change needed and name the Terraform workflow command she should run to reconcile state." }
    ]
  },
  {
    id: "Q10",
    topic: "Kubernetes — Deployments & ReplicaSets",
    marks: 10,
    scenario: "The Pod That Kept Coming Back",
    context: `A student applies a Deployment to a minikube cluster and then tries to delete a pod directly to free up resources. The pod disappears for a moment but immediately reappears with a different name. The student is confused — they deleted it, so why is it back?`,
    code: [
      {
        label: "hello-deployment.yaml",
        lang: "yaml",
        content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
      - name: hello
        image: nginx:alpine
        ports:
        - containerPort: 80`
      },
      {
        label: "Student commands and output",
        lang: "bash",
        content: `$ kubectl delete pod hello-58f7c9b4d6-abc12
pod "hello-58f7c9b4d6-abc12" deleted

$ kubectl get pods
NAME                     READY   STATUS    RESTARTS
hello-58f7c9b4d6-xyz99   1/1     Running   0   # new pod!
hello-58f7c9b4d6-def34   1/1     Running   0
hello-58f7c9b4d6-ghi56   1/1     Running   0`
      }
    ],
    problems: [
      'Deleting a pod manually does not remove it permanently — a new pod with a different suffix appears within seconds',
      'The student wants to scale down to 1 replica but is unsure how to do it without manually deleting pods one by one'
    ],
    questions: [
      { num: "10.1", marks: 4, text: "Walk through exactly what happened from the kubectl delete pod command to the new pod appearing. Your answer must explain the role of the Deployment, the ReplicaSet it manages, and the concept of desired-vs-actual state. Which component detected the missing pod and what action did it take?" },
      { num: "10.2", marks: 3, text: "The student runs kubectl get replicasets and sees DESIRED: 3, CURRENT: 3, READY: 3. They then edit the Deployment to set replicas: 1. Without running any kubectl delete command, predict what kubectl get pods will show after a few seconds and explain why — include what happens to the ReplicaSet counts." },
      { num: "10.3", marks: 3, text: "The student wants to reach the hello Deployment from their laptop browser at a stable URL on minikube. Describe the three Service types available (ClusterIP, NodePort, LoadBalancer) and explain which one is appropriate for accessing a service from a laptop browser on minikube. Write the complete Service YAML to expose the hello Deployment." }
    ]
  },
  {
    id: "Q11",
    topic: "Docker — Port Mapping & Container Debugging",
    marks: 10,
    scenario: "The App Running Inside a Black Box",
    context: `Sania runs a Flask API container but cannot reach it from her browser. She also needs to check the application's config file inside the running container and watch live logs to debug a 500 error — but she does not want to stop and restart the container to do any of this.`,
    code: [
      {
        label: "docker run command",
        lang: "bash",
        content: `docker run -d --name flask-api -p 8080:5000 flask-api:v1`
      },
      {
        label: "docker ps output",
        lang: "bash",
        content: `CONTAINER ID  IMAGE         STATUS        PORTS
a3f2b1c09d4e  flask-api:v1  Up 3 minutes  0.0.0.0:8080->5000/tcp`
      },
      {
        label: "Browser attempt",
        lang: "bash",
        content: `# Sania tries:
http://localhost:5000    # connection refused
http://localhost:8080    # works!

# But she typed 5000 in her browser — did not read the docker ps output`
      }
    ],
    problems: [
      'Sania typed localhost:5000 in her browser and got connection refused — she does not understand the port mapping',
      'She needs to read a config file at /app/config.json inside the running container and tail the live logs — without restarting it'
    ],
    questions: [
      { num: "11.1", marks: 3, text: "Explain the port mapping 0.0.0.0:8080->5000/tcp shown in docker ps. Which port is the host port and which is the container port? Who connects on 8080 and who connects on 5000? Why does curl localhost:5000 fail on the host machine while curl localhost:8080 succeeds?" },
      { num: "11.2", marks: 4, text: "Show the docker command Sania should use to open an interactive shell inside the running flask-api container without stopping it. Name the Docker CLI command used for this. Then show the command to read /app/config.json from inside the container using a single docker command without entering an interactive shell." },
      { num: "11.3", marks: 3, text: "Show the docker command to stream live logs from the flask-api container in real time so Sania can watch new log lines appear as requests come in. Then show the command to see only the last 20 lines of logs. Explain what the -f flag does and why it is useful for debugging a live production issue." }
    ]
  },
  {
    id: "Q12",
    topic: "Docker Compose — Environment Variables & Service Communication",
    marks: 10,
    scenario: "The Frontend That Cannot Find the API",
    context: `A team runs a React frontend and a Node.js API using Docker Compose. The frontend makes API calls to http://localhost:4000/api but gets connection refused inside the container. A developer also hardcoded a database password directly in the compose.yaml which is committed to Git.`,
    code: [
      {
        label: "compose.yaml (broken)",
        lang: "yaml",
        content: `services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:4000

  api:
    build: ./api
    ports:
      - "4000:4000"
    environment:
      DB_PASSWORD: SuperSecret123
      NODE_ENV: production`
      }
    ],
    problems: [
      'The frontend container calls http://localhost:4000 but gets connection refused — the API is unreachable from inside the frontend container',
      'The database password is hardcoded in compose.yaml which is version-controlled in a Git repository'
    ],
    questions: [
      { num: "12.1", marks: 4, text: "Explain why http://localhost:4000 does not work inside the frontend container even though the api container is running and port 4000 is mapped on the host. What does localhost mean inside a container versus on the host machine? What is the correct hostname the frontend should use to reach the api service, and how does Docker Compose make this hostname resolvable?" },
      { num: "12.2", marks: 3, text: "Write the corrected compose.yaml with the right API URL for the frontend container. Also explain the REACT_APP_ prefix — at what point is this environment variable baked into the React application (build time or runtime) and what implication does that have for changing the value without rebuilding the image?" },
      { num: "12.3", marks: 3, text: "Explain the security risk of committing DB_PASSWORD in compose.yaml to Git. Show how to move the password to a .env file and reference it from compose.yaml using variable substitution. Write both the .env file and the corrected environment section in compose.yaml. What .gitignore entry must be added?" }
    ]
  },
  {
    id: "Q13",
    topic: "AWS EC2 — Security Groups & Networking",
    marks: 10,
    scenario: "The Server That Times Out From the Internet",
    context: `Dev successfully launches an EC2 instance and starts a Node.js API. The terminal shows 'Server listening on port 3000'. But pasting the EC2 public IP into a browser causes it to load forever and eventually time out. Dev checks three possible causes one by one.`,
    code: [
      {
        label: "EC2 Inbound Security Group Rules",
        lang: "text",
        content: `Type        Protocol  Port   Source
SSH         TCP       22     0.0.0.0/0
HTTP        TCP       80     0.0.0.0/0
HTTPS       TCP       443    0.0.0.0/0
(no rule for port 3000)`
      },
      {
        label: "server.js",
        lang: "javascript",
        content: `const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello'));

// Dev's three versions:
// Version A: app.listen(3000, '127.0.0.1')
// Version B: app.listen(3000, '0.0.0.0')
// Version C: app.listen(3000)  // Node.js default`
      }
    ],
    problems: [
      'Browser requests to http://<EC2-IP>:3000 time out — the server is running but unreachable from the internet',
      'Dev does not understand which combination of Security Group rule and listen address is needed for the app to be reachable'
    ],
    questions: [
      { num: "13.1", marks: 3, text: "Explain how AWS Security Groups work as a virtual firewall. What is their default behavior for inbound traffic? Why does the request from the laptop browser time out instead of getting a connection refused error? Write the Security Group inbound rule that must be added to allow traffic on port 3000 from anywhere." },
      { num: "13.2", marks: 4, text: "Explain what 127.0.0.1 (Version A) means and why binding to it blocks all traffic from the internet. Explain what 0.0.0.0 means and why it allows external traffic. Even if Version A is fixed to Version B, if the Security Group rule for port 3000 is missing, will the app be reachable? Explain why both fixes must be applied together." },
      { num: "13.3", marks: 3, text: "Version C uses app.listen(3000) with no host argument. Explain what address Node.js binds to by default and whether this makes the app reachable from the internet on EC2. How can Dev verify what address and port a process is actually listening on from the EC2 terminal — show the Linux command and explain its output." }
    ]
  },
  {
    id: "Q14",
    topic: "Terraform — Snowflake Servers & IaC Concepts",
    marks: 10,
    scenario: "The Environments That Drifted Apart",
    context: `A startup has three environments — Dev, Staging, and Production — each running on separate EC2 instances configured manually by different engineers via the AWS Console and SSH over six months. When a critical security patch must be applied, Dev succeeds, Staging crashes, and Production breaks with undocumented config changes overwritten.`,
    code: [
      {
        label: "Patch results",
        lang: "text",
        content: `Dev        → Patch applied ✓
Staging    → Crashes (older Nginx version, undocumented)
Production → Breaks (custom config file overwritten)`
      },
      {
        label: "New Terraform config to standardize servers",
        lang: "hcl",
        content: `resource "aws_security_group" "app_sg" {
  name        = "app-sg"
  description = "Allow HTTP traffic"
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "backend" {
  ami                    = "ami-0abcdef1234567890"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  tags = { Name = "Backend" }
}`
      }
    ],
    problems: [
      'Three environments have drifted apart over six months of manual changes — no one knows what is running where',
      'A new engineer wonders if Terraform needs explicit ordering to create the security group before the EC2 instance'
    ],
    questions: [
      { num: "14.1", marks: 3, text: "Identify the DevOps anti-pattern shown in this scenario by name. Explain why manually managing infrastructure through the AWS Console and SSH inevitably leads to this problem over time, even when all engineers have good intentions. What term describes servers that have been uniquely and irreproducibly customized?" },
      { num: "14.2", marks: 4, text: "Explain the difference between imperative and declarative infrastructure management with one concrete example of each. Which model does Terraform use? Explain how declaring the desired state in .tf files prevents the environment drift problem — specifically, what happens when terraform plan detects a difference between declared state and actual AWS state?" },
      { num: "14.3", marks: 3, text: "The aws_instance.backend references aws_security_group.app_sg.id but there is no explicit depends_on anywhere. Will Terraform still create the security group before the EC2 instance? Explain how Terraform determines the correct creation order automatically — name the data structure it builds and how it uses attribute references to infer dependencies." }
    ]
  },
  {
    id: "Q15",
    topic: "Kubernetes — Services & Stable Access",
    marks: 10,
    scenario: "The Pod That Changed Its Address",
    context: `A student has a running nginx Deployment with 3 replicas. They notice that pods get new IP addresses whenever they are restarted. Their frontend application hardcodes a pod IP to make API calls — and breaks every time a pod restarts. A classmate says they need a Kubernetes Service, but the student is unsure which type to use.`,
    code: [
      {
        label: "Current pod IPs (change on restart)",
        lang: "bash",
        content: `$ kubectl get pods -o wide
NAME                   READY  IP
nginx-abc12            1/1    10.244.0.5   ← changes on restart
nginx-def34            1/1    10.244.0.6
nginx-ghi56            1/1    10.244.0.7`
      },
      {
        label: "Incomplete Service YAML",
        lang: "yaml",
        content: `apiVersion: v1
kind: Service
metadata:
  name: ________
spec:
  type: ________
  selector:
    ________: ________
  ports:
  - port: ________
    targetPort: ________`
      }
    ],
    problems: [
      'Pod IP addresses change every time a pod restarts — hardcoding IPs in the frontend breaks the application',
      'The student is not sure which Service type is appropriate for their use case on minikube'
    ],
    questions: [
      { num: "15.1", marks: 3, text: "Explain why pod IP addresses change when pods restart and why hardcoding them is always wrong in Kubernetes. What problem does a Kubernetes Service solve? Explain how a Service uses a label selector to find the right pods — and what happens automatically when one of the 3 pods behind a Service is replaced with a new pod." },
      { num: "15.2", marks: 4, text: "Describe the three Service types: ClusterIP, NodePort, and LoadBalancer. For each one state: what it is used for, who can access it, and one scenario where it is the right choice. Which type is appropriate for internal communication between two services within the same cluster? Which is appropriate for exposing a service to a laptop browser in a minikube environment?" },
      { num: "15.3", marks: 3, text: "Complete the Service YAML to expose the nginx Deployment on port 80 for access within the cluster and from a laptop browser on minikube. Fill all blanks, choose the correct type, and explain what the selector field does — why must the label in the selector exactly match the label on the pods?" }
    ]
  },
  {
    id: "Q16",
    topic: "Docker — Dockerfile Basics & CMD Syntax",
    marks: 10,
    scenario: "The Container That Starts Wrong",
    context: `A junior developer writes a Dockerfile for a Python Flask app. The container builds successfully but fails to start correctly — it ignores the CMD and opens a shell instead. A second bug: the container does not create the /app directory before copying files into it, causing a build error on some base images.`,
    code: [
      {
        label: "Dockerfile (broken)",
        lang: "dockerfile",
        content: `FROM python:3.11-slim

COPY . .

RUN pip install flask

EXPOSE 5000

CMD python app.py`
      },
      {
        label: "docker run output",
        lang: "bash",
        content: `$ docker run myflask
# Container starts but opens /bin/sh instead of running app.py
# In some environments: COPY fails — destination path not set`
      }
    ],
    problems: [
      'CMD python app.py uses shell form — the container PID 1 is /bin/sh, not Python, causing signal handling problems',
      'There is no WORKDIR instruction — COPY . . copies to the filesystem root, making paths unpredictable'
    ],
    questions: [
      { num: "16.1", marks: 3, text: "Explain the purpose of the WORKDIR instruction in a Dockerfile. What happens when WORKDIR is absent and COPY . . is run — where do the files land? What other Dockerfile instructions are affected by WORKDIR (hint: RUN, CMD, ENTRYPOINT) and why is /app a conventional choice?" },
      { num: "16.2", marks: 4, text: "Explain the difference between CMD shell form (CMD python app.py) and CMD exec form (CMD [\"python\", \"app.py\"]). What is PID 1 in each case? Why does shell form cause problems with docker stop — what signal is sent and why does the process not receive it? Rewrite the CMD instruction in the correct exec form." },
      { num: "16.3", marks: 3, text: "Write the fully corrected Dockerfile with all instructions in the correct order: FROM, WORKDIR, COPY, RUN, EXPOSE, CMD. Explain in one sentence why COPY and RUN appear in that order for a Python application (hint: layer caching and requirements.txt). Should COPY copy requirements.txt before or after app.py for best caching?" }
    ]
  },
  {
    id: "Q17",
    topic: "AWS IAM — Users, Roles & Least Privilege",
    marks: 10,
    scenario: "The Developer With Too Much Access",
    context: `A startup has one AWS IAM user called admin-shared that all three developers use with the same credentials. The access key is stored in each developer's ~/.aws/credentials file. One developer accidentally deletes a production S3 bucket and there is no way to tell who did it. A security review demands the team restructure their IAM setup.`,
    code: [
      {
        label: "Current setup",
        lang: "text",
        content: `IAM User: admin-shared
Policy:   AdministratorAccess (full AWS access)
Users sharing this account: Dev1, Dev2, Dev3

Access Key: AKIAIOSFODNN7EXAMPLE (same key on all 3 laptops)
Secret Key: wJalrXUtnFEMI/K7MDENGbPxRfiCYEXAMPLEKEY`
      },
      {
        label: "Required permissions for each developer role",
        lang: "text",
        content: `Frontend Dev:  Read/write to S3 bucket (frontend-assets only)
Backend Dev:   Read/write to ECR, update ECS services
DevOps Lead:   Full EC2 + ECS + S3 access`
      }
    ],
    problems: [
      'All three developers share one IAM user — there is no audit trail showing who deleted the S3 bucket (CloudTrail shows admin-shared for all actions)',
      'All developers have AdministratorAccess — far more permissions than any of them need for their role'
    ],
    questions: [
      { num: "17.1", marks: 3, text: "Explain the two specific problems caused by sharing a single IAM user across multiple developers. Why does CloudTrail fail to identify who deleted the S3 bucket? What is the correct IAM practice for a team of three developers — what should be created for each person and why?" },
      { num: "17.2", marks: 4, text: "Explain the Principle of Least Privilege. Write a minimal IAM policy JSON for the Frontend Developer that allows only s3:GetObject and s3:PutObject on the specific bucket (frontend-assets) and nothing else. Explain the difference between an IAM User, an IAM Group, and an IAM Role — which one should be used to apply the same policy to all future frontend developers easily?" },
      { num: "17.3", marks: 3, text: "The DevOps team also runs automation scripts on an EC2 instance that need to access S3. Currently the script uses hardcoded access keys in an environment variable. Explain the AWS-native replacement — what is an IAM Instance Profile, how does the EC2 instance get temporary credentials, and why is this more secure than hardcoded keys?" }
    ]
  },
  {
    id: "Q18",
    topic: "Terraform — Workflow & State Commands",
    marks: 10,
    scenario: "The Engineer Who Skipped terraform plan",
    context: `A junior engineer, Karan, modifies a Terraform configuration to change an EC2 instance type. He skips terraform plan and runs terraform apply directly. Terraform destroys the production EC2 instance and creates a new one — causing 20 minutes of downtime. His manager asks him to explain the Terraform workflow and how to preview changes before applying them.`,
    code: [
      {
        label: "main.tf change",
        lang: "hcl",
        content: `resource "aws_instance" "web" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t3.medium"  # was t2.micro — forces replacement
}`
      },
      {
        label: "terraform apply output (destructive — not previewed)",
        lang: "text",
        content: `aws_instance.web: Destroying...  # production goes down
aws_instance.web: Destruction complete
aws_instance.web: Creating...
aws_instance.web: Creation complete

Apply complete! Resources: 1 added, 0 changed, 1 destroyed.
# 20 minutes of downtime`
      }
    ],
    problems: [
      'Karan did not run terraform plan first — he had no warning that changing instance_type forces a destroy-and-replace',
      'The team has no understanding of when Terraform will destroy vs update-in-place vs replace a resource'
    ],
    questions: [
      { num: "18.1", marks: 4, text: "Explain the three-step Terraform workflow: terraform init, terraform plan, and terraform apply. What does each command do? Why is terraform plan the critical safety step that Karan skipped? Explain the difference between the three symbols Terraform uses in plan output: + (add), ~ (change in-place), and -/+ (destroy and replace)." },
      { num: "18.2", marks: 3, text: "Explain why changing instance_type on an EC2 instance forces a destroy-and-replace (-/+) rather than an in-place update (~). What determines whether a resource attribute change requires replacement? Show the terraform plan output symbols Karan would have seen if he had run plan first, and explain how he could have avoided the downtime." },
      { num: "18.3", marks: 3, text: "Show how to run terraform plan and save its output to a file, then apply exactly that saved plan — not a fresh plan. Explain why applying a saved plan file is safer than running terraform apply directly in a production environment. Also explain what terraform show does and when it is useful." }
    ]
  },
  {
    id: "Q19",
    topic: "Kubernetes — Image Pull & Deployment Debugging",
    marks: 10,
    scenario: "The Pod Stuck in ImagePullBackOff",
    context: `A student applies a Deployment to minikube. All pods immediately go into ImagePullBackOff status. The student is not sure how to diagnose the problem. A second issue: the image works locally with docker run but fails in Kubernetes.`,
    code: [
      {
        label: "app-deployment.yaml",
        lang: "yaml",
        content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest   # built locally with docker build
        ports:
        - containerPort: 3000`
      },
      {
        label: "kubectl get pods output",
        lang: "bash",
        content: `NAME                     READY   STATUS             RESTARTS
myapp-7f9b8d-abc12       0/1     ImagePullBackOff   0
myapp-7f9b8d-def34       0/1     ImagePullBackOff   0`
      }
    ],
    problems: [
      'Both pods are in ImagePullBackOff — Kubernetes cannot pull the image even though docker run myapp:latest works on the student\'s laptop',
      'The student does not know how to diagnose what is happening inside a failing pod'
    ],
    questions: [
      { num: "19.1", marks: 4, text: "Explain why the image myapp:latest exists on the student's laptop (docker images shows it) but Kubernetes cannot find it. What is the difference between a locally built Docker image and an image that Kubernetes can pull? Where does Kubernetes look for images by default? Explain two ways to fix this for a minikube environment specifically." },
      { num: "19.2", marks: 3, text: "Show the kubectl command the student should run to see the detailed error message explaining why the image pull failed. Name the section in the output that shows the failure event and what information it contains. Also show how to view the logs of a pod that is not yet running — explain why kubectl logs alone may not work for a pod in ImagePullBackOff." },
      { num: "19.3", marks: 3, text: "If the team pushes the image to a private registry (like AWS ECR), Kubernetes needs credentials to pull it. Explain what an imagePullSecret is in Kubernetes. Show how to create a secret of type docker-registry and how to reference it in the Deployment YAML so Kubernetes can authenticate to ECR when pulling the image." }
    ]
  },
  {
    id: "Q20",
    topic: "Docker — VMs vs Containers & Core Concepts",
    marks: 10,
    scenario: "The New Hire Who Thinks Docker is Just a VM",
    context: `A new team member, Arjun, comes from a background of managing Virtual Machines. He is confused about how Docker containers work — he thinks of them as lightweight VMs. His manager asks him to containerize a Node.js microservice for the first time and he makes several conceptual mistakes in the Dockerfile.`,
    code: [
      {
        label: "Arjun's Dockerfile (conceptual mistakes)",
        lang: "dockerfile",
        content: `FROM ubuntu:22.04

# Arjun installs everything like setting up a fresh VM
RUN apt-get update
RUN apt-get install -y nodejs npm curl wget git vim

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3000
CMD ["node", "server.js"]`
      },
      {
        label: "docker images output",
        lang: "bash",
        content: `REPOSITORY  TAG      IMAGE ID       SIZE
myservice   latest   a3f2b1c09d4e   892MB
# A senior engineer says this should be under 200MB`
      }
    ],
    problems: [
      'The image is 892 MB — far larger than necessary — because Arjun installed tools as if setting up a full VM',
      'Multiple RUN apt-get commands each create separate layers — and unnecessary tools like vim, git, curl are included in the production image'
    ],
    questions: [
      { num: "20.1", marks: 4, text: "Explain the key architectural differences between a Virtual Machine and a Docker container. What does a VM include that a container does not? Why is a container much smaller and faster to start? Explain why FROM ubuntu:22.04 is a poor base image for a Node.js app in production — what should Arjun use instead and why is it dramatically smaller?" },
      { num: "20.2", marks: 3, text: "Explain why Arjun has three separate RUN commands for apt-get — what is wrong with this approach in terms of Docker layers? Show how to combine them into a single RUN instruction. Also explain why installing vim, git, wget, and curl in a production container image violates the container best practice of keeping images minimal." },
      { num: "20.3", marks: 3, text: "Rewrite the Dockerfile using the correct minimal base image for Node.js. Combine the RUN instructions, remove unnecessary tools, and ensure only what the application actually needs to run is included. Explain the security benefit of a minimal image — specifically, what attack surface is reduced compared to a full Ubuntu base image." }
    ]
  }
];

function CodeBlock({ content, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderBottom: "none", borderRadius: "var(--border-radius-md) var(--border-radius-md) 0 0", padding: "6px 12px" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{label}</span>
        <button onClick={copy} style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer", borderRadius: 4, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)" }}>
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.6, fontFamily: "var(--font-mono)", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "0 0 var(--border-radius-md) var(--border-radius-md)", overflowX: "auto", color: "var(--color-text-primary)", whiteSpace: "pre" }}>{content}</pre>
    </div>
  );
}

function QuestionCard({ q, index, sectionColor }) {
  const [open, setOpen] = useState(index === 0);
  const dotColor = sectionColor === "teal" ? "#1D9E75" : "#7F77DD";
  const dotBg = sectionColor === "teal" ? "#E1F5EE" : "#EEEDFE";
  return (
    <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", marginBottom: 14, overflow: "hidden", background: "var(--color-background-primary)" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: "50%", background: dotBg, color: dotColor, fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{q.id}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)", marginBottom: 2 }}>{q.scenario}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{q.topic} · {q.marks} marks</div>
        </div>
        <span style={{ fontSize: 18, color: "var(--color-text-secondary)", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 14, marginBottom: 12, lineHeight: 1.6 }}>{q.context}</p>
          {q.code.map((c, i) => <CodeBlock key={i} {...c} />)}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Observed problems</div>
            {q.problems.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#FAECE7", color: "#993C1D", fontWeight: 500, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>!</span>
                <span style={{ fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Questions</div>
          {q.questions.map((qq, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: i < q.questions.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
              <span style={{ flexShrink: 0, minWidth: 32, fontSize: 12, fontWeight: 500, color: dotColor, fontFamily: "var(--font-mono)", paddingTop: 2 }}>{qq.num}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 5px", fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.65 }}>{qq.text}</p>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "2px 7px", borderRadius: 4, border: "0.5px solid var(--color-border-tertiary)" }}>{qq.marks} marks</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("all");

  const all = [...PRE_MID, ...POST_MID];
  const display = tab === "pre" ? PRE_MID : tab === "post" ? POST_MID : all;
  const displayColor = tab === "post" ? "teal" : tab === "pre" ? "purple" : null;

  const topicIndex = [
    { id: "Q1",  label: "GH Actions triggers & checkout",     section: "pre" },
    { id: "Q2",  label: "Bash idempotency & set -e",          section: "pre" },
    { id: "Q3",  label: "SSH key permissions & chmod",        section: "pre" },
    { id: "Q4",  label: "CI secrets, MSW, CI/CD concepts",    section: "pre" },
    { id: "Q5",  label: "Docker build context & caching",     section: "post" },
    { id: "Q6",  label: "Docker volumes & Fargate",           section: "post" },
    { id: "Q7",  label: "Compose depends_on & volumes",       section: "post" },
    { id: "Q8",  label: "ECS latest tag & task definitions",  section: "post" },
    { id: "Q9",  label: "Terraform state & drift",            section: "post" },
    { id: "Q10", label: "K8s Deployments & ReplicaSets",      section: "post" },
    { id: "Q11", label: "Docker port mapping & exec",         section: "post" },
    { id: "Q12", label: "Compose networking & .env files",    section: "post" },
    { id: "Q13", label: "EC2 Security Groups & binding",      section: "post" },
    { id: "Q14", label: "Terraform snowflake & IaC",          section: "post" },
    { id: "Q15", label: "K8s Services & label selectors",     section: "post" },
    { id: "Q16", label: "Dockerfile WORKDIR & CMD form",      section: "post" },
    { id: "Q17", label: "IAM users, roles & least privilege", section: "post" },
    { id: "Q18", label: "Terraform init/plan/apply workflow", section: "post" },
    { id: "Q19", label: "K8s ImagePullBackOff & debugging",   section: "post" },
    { id: "Q20", label: "VMs vs containers & base images",    section: "post" },
  ];

  const tabs = [
    { id: "all",  label: "All 20 Questions" },
    { id: "pre",  label: "Section A — Pre-mid (Q1–Q4, 20%)" },
    { id: "post", label: "Section B — Post-mid (Q5–Q20, 80%)" },
  ];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px 40px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>DevOps End-Sem · Practice Paper — Set 5</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>20 Exam-Style Scenario Questions</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>Matched to your sample paper format · 10 marks each · 3 sub-questions per question</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Total questions", val: "20" },
            { label: "Marks each", val: "10" },
            { label: "Pre-mid (Topics 1–6)", val: "Q1–Q4" },
            { label: "Post-mid (Topics 7–12)", val: "Q5–Q20" },
          ].map((c, i) => (
            <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>{c.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
          {topicIndex.map(t => (
            <div key={t.id} style={{ padding: "7px 10px", background: t.section === "pre" ? "#EEEDFE" : "#E1F5EE", borderRadius: "var(--border-radius-md)" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: t.section === "pre" ? "#7F77DD" : "#1D9E75", marginBottom: 2 }}>{t.id}</div>
              <div style={{ fontSize: 11, color: t.section === "pre" ? "#3C3489" : "#085041", lineHeight: 1.4 }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", borderRadius: "var(--border-radius-md)", border: "0.5px solid",
            borderColor: tab === t.id ? "#1D9E75" : "var(--color-border-secondary)",
            background: tab === t.id ? "#E1F5EE" : "transparent",
            color: tab === t.id ? "#085041" : "var(--color-text-secondary)",
            fontWeight: tab === t.id ? 500 : 400, fontSize: 13, cursor: "pointer"
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "pre" && (
        <div style={{ background: "#EEEDFE", border: "0.5px solid #AFA9EC", borderRadius: "var(--border-radius-md)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#3C3489" }}>
          Q1–Q4 · Topics 1–6 · GitHub Actions, Bash, Linux Permissions, CI/CD · 20% weightage · Attempt all
        </div>
      )}
      {tab === "post" && (
        <div style={{ background: "#E1F5EE", border: "0.5px solid #5DCAA5", borderRadius: "var(--border-radius-md)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#085041" }}>
          Q5–Q20 · Topics 7–12 · Docker, AWS ECS, Terraform, Kubernetes · 80% weightage · Attempt 5 of 16 in exam
        </div>
      )}

      {display.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i} sectionColor={displayColor || (parseInt(q.id.replace("Q","")) <= 4 ? "purple" : "teal")} />
      ))}
    </div>
  );
}
