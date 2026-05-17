"use client"

import { useState } from "react";

const PRE_MID = [
  {
    id: "Q1",
    topic: "Git — Staging Area, Branching & PR Workflow",
    marks: 10,
    scenario: "The Secret That Got Committed",
    context: `A junior developer, Aryan, is working on a new feature. He accidentally commits a database password directly into main. He also notices his teammate cannot see his latest changes even though he ran git add and git commit. A third problem: the team has no automated check preventing secrets from being committed in the first place.`,
    code: [
      {
        label: "Aryan's terminal session",
        lang: "bash",
        content: `# Aryan accidentally staged and committed the config file
$ git add config.js        # contains DB_PASSWORD="prod123"
$ git commit -m "add config"
$ git push origin main     # password now in public repo history

# Later — checking his feature branch from his teammate's view:
$ git checkout feature/login
$ git log --oneline
# Teammate cannot see Aryan's latest 3 commits
# Aryan forgot to push his branch`
      },
      {
        label: "config.js (should never be committed)",
        lang: "javascript",
        content: `// config.js
module.exports = {
  DB_HOST: "prod-db.company.com",
  DB_PASSWORD: "SuperSecret123",   // hardcoded secret
  PORT: 3000
};`
      }
    ],
    problems: [
      'DB_PASSWORD is now visible in the public Git history — deleting the file in a new commit does NOT remove it from history',
      'Aryan\'s teammate cannot see the latest commits because git commit only saves to the local repository — the branch was never pushed',
      'There is no automated gate preventing secrets from being committed in the first place'
    ],
    questions: [
      { num: "1.1", marks: 4, text: "Explain the three zones of Git: the Working Directory, the Staging Area, and the Local Repository. Walk through what each of Aryan's commands (git add, git commit, git push) did to the file — which zone did it move through at each step? Why does deleting config.js in a new commit NOT remove the password from Git history?" },
      { num: "1.2", marks: 3, text: "Explain why Aryan's teammate cannot see the latest commits even though git log shows them on Aryan's machine. What is the difference between a local branch and a remote branch? Write the git command Aryan must run to make his feature/login branch and its commits visible to teammates on GitHub." },
      { num: "1.3", marks: 3, text: "Explain what a pre-commit hook is and how it runs automatically before every git commit. Describe how a pre-commit hook could have prevented Aryan's accident — specifically, what pattern would it scan for in staged files? Also explain what a .gitignore file does and show the entry that would have prevented config.js from ever being staged." }
    ]
  },
  {
    id: "Q2",
    topic: "DevOps Philosophy — Waterfall, Agile & DevOps SDLC",
    marks: 10,
    scenario: "The Release That Took Six Months",
    context: `A company called TechCorp uses the Waterfall model. They spend 3 months planning, 3 months developing, 1 month testing, and then release. At the release, integration bugs appear that were never caught during development. The operations team complains that developers throw code "over the wall" and vanish. A consultant recommends moving to a DevOps model.`,
    code: [
      {
        label: "TechCorp current delivery timeline",
        lang: "text",
        content: `Month 1-3:  Requirements & Planning  (no working software)
Month 4-6:  Development               (no testing)
Month 7:    Testing                   (bugs found late — expensive)
Month 8:    Release to Production     (ops team scrambles)

Problems:
- Integration bugs found only at month 7
- Ops team sees code for first time at month 8
- Rollback requires re-releasing the entire 6-month batch`
      },
      {
        label: "DevOps Lifecycle (what the consultant recommends)",
        lang: "text",
        content: `Plan → Code → Build → Test → Release → Deploy → Operate → Monitor
  ↑___________________________________________________|
                    (continuous loop)`
      }
    ],
    problems: [
      'Bugs are found at month 7 — the cost to fix them is exponentially higher than if they had been found at month 4',
      'The "Wall of Confusion" between Dev and Ops means the operations team has no context about what they are deploying'
    ],
    questions: [
      { num: "2.1", marks: 4, text: "Compare the Waterfall model, Agile, and DevOps delivery approaches. For each one, describe: (a) how work is structured (linear vs iterative), (b) how frequently working software is delivered, and (c) one specific risk or limitation. Explain why Waterfall's late integration causes bugs to be more expensive to fix than if the same bug was caught during development." },
      { num: "2.2", marks: 3, text: "Explain the 'Wall of Confusion' between Development and Operations teams. What does each team traditionally care about — and why do their goals conflict? How does the DevOps mindset resolve this conflict? Use the DevOps Lifecycle diagram (Plan → Code → Build → Test → Release → Deploy → Operate → Monitor) to explain how it is a continuous loop rather than a one-time handoff." },
      { num: "2.3", marks: 3, text: "Explain the difference between Continuous Integration, Continuous Delivery, and Continuous Deployment. If TechCorp moves to DevOps, what would CI look like for their team on every code commit? What is the key difference between Continuous Delivery and Continuous Deployment — which one still requires a human approval step before code reaches production?" }
    ]
  }
];

const POST_MID = [
  {
    id: "Q3",
    topic: "Docker — Matrix from Hell & VMs vs Containers",
    marks: 10,
    scenario: "The App That Works on My Machine",
    context: `A startup has four microservices: a Python 2.7 data processor, a Node.js 14 API, a Node.js 18 frontend build tool, and a Ruby 2.6 background job. On Developer A's Mac, everything works. On Developer B's Ubuntu machine, the Python service crashes with a library conflict. On the CI server (CentOS), the Node.js 18 tool fails because the OS ships with Node.js 12 by default.`,
    code: [
      {
        label: "Dependency conflicts across environments",
        lang: "text",
        content: `Service            Needs              Dev A (Mac)  Dev B (Ubuntu)  CI (CentOS)
─────────────────────────────────────────────────────────────────────
data-processor     Python 2.7         Works ✓      Crashes ✗       Works ✓
api                Node.js 14         Works ✓      Works ✓         Crashes ✗
frontend-build     Node.js 18         Works ✓      Works ✓         Crashes ✗
background-job     Ruby 2.6           Works ✓      Crashes ✗       Works ✓

This is the "Matrix from Hell"`
      },
      {
        label: "What the team is considering",
        lang: "text",
        content: `Option A: Virtual Machines — one VM per service
  Each VM: full OS (~2 GB), boots in 2 minutes, hypervisor overhead

Option B: Docker Containers — one container per service
  Each container: shares host OS kernel, starts in seconds, MB not GB`
      }
    ],
    problems: [
      'Every service has different runtime dependencies — installing all on one machine causes conflicts, and "it works on my machine" is not a solution',
      'The team is debating whether to use VMs or containers — they need to understand the architectural difference'
    ],
    questions: [
      { num: "3.1", marks: 3, text: "Explain the 'Matrix from Hell' problem using this scenario. Why does having N applications with M different environments create N×M compatibility problems? How does containerization solve this — what does a Docker container bundle together that eliminates the 'works on my machine' problem?" },
      { num: "3.2", marks: 4, text: "Explain the architectural difference between a Virtual Machine and a Docker container. Draw (in text) the two stack diagrams showing: (a) Physical hardware → Hypervisor → Guest OS → App, and (b) Physical hardware → Host OS → Docker Engine → Container. What does a VM include that a container does not? Why are containers smaller, faster to start, and use less memory?" },
      { num: "3.3", marks: 3, text: "Write a minimal Dockerfile for the Node.js 18 frontend-build service that guarantees it runs with exactly Node.js 18 on any machine — Dev A's Mac, Dev B's Ubuntu, and the CentOS CI server — without any manual runtime installation. Explain how the FROM instruction pins the exact runtime and why this is the core guarantee that containers provide." }
    ]
  },
  {
    id: "Q4",
    topic: "Docker & AWS ECR — Image Registry Workflow",
    marks: 10,
    scenario: "The Image That ECS Could Not Find",
    context: `A developer builds a Docker image locally and confirms it runs fine with docker run. She then creates an ECS task definition pointing to the image. When ECS tries to launch the task, it fails with 'CannotPullContainerError'. The image was never pushed to a registry — it only exists on her laptop.`,
    code: [
      {
        label: "What the developer did",
        lang: "bash",
        content: `# Step 1 — build image locally
docker build -t myapi:v1 .

# Step 2 — confirm it works
docker run -p 4000:4000 myapi:v1
# Works fine on laptop!

# Step 3 — create ECS task definition
# image: "myapi:v1"    ← just the local tag name

# Step 4 — ECS tries to launch task
# Error: CannotPullContainerError: 
#   pull access denied for myapi, repository does not exist`
      },
      {
        label: "ECR repository already created",
        lang: "bash",
        content: `# ECR repo URL:
123456789.dkr.ecr.ap-south-1.amazonaws.com/myapi

# Developer needs to push the image here
# but is unsure of the steps`
      }
    ],
    problems: [
      'ECS runs on AWS infrastructure — it cannot access images that only exist on a developer\'s local machine',
      'The developer does not know the correct sequence of commands to authenticate to ECR, tag, and push the image'
    ],
    questions: [
      { num: "4.1", marks: 3, text: "Explain why ECS cannot pull an image that runs perfectly with docker run on a laptop. What is a container registry and why is one required for ECS to launch tasks? What is the difference between a public registry (like Docker Hub) and a private registry (like AWS ECR) — and why would a production team use a private registry?" },
      { num: "4.2", marks: 4, text: "Write the complete step-by-step sequence of commands to: (a) authenticate Docker to the ECR registry using the AWS CLI, (b) tag the local image myapi:v1 with the full ECR repository URL, and (c) push the tagged image to ECR. Explain what the docker tag command does — why must the image name begin with the ECR registry URL for the push to succeed?" },
      { num: "4.3", marks: 3, text: "After pushing, the developer updates the ECS task definition to point to the full ECR image URL. ECS can now pull it. Explain the full journey of the image: from docker build on the laptop → ECR → ECS task launch. At what point does ECS actually pull the image — when the task definition is registered, or when a task is launched? Where does ECS store the pulled image?" }
    ]
  },
  {
    id: "Q5",
    topic: "Frontend — Build-Time Env Variables & S3 Deployment",
    marks: 10,
    scenario: "The API URL That Refused to Change",
    context: `A team deploys a React app to an S3 static website. The app calls a backend API. In development, the API is at http://localhost:4000. In production, it should be at https://api.mycompany.com. The team sets REACT_APP_API_URL on the EC2 server and redeploys — but the app still calls localhost:4000. A teammate points out that React environment variables work differently from Node.js environment variables.`,
    code: [
      {
        label: "React component making the API call",
        lang: "javascript",
        content: `// src/components/Dashboard.jsx
function Dashboard() {
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(\`\${apiUrl}/users\`)
      .then(r => r.json())
      .then(setUsers);
  }, []);
}`
      },
      {
        label: "What the team did (wrong approach)",
        lang: "bash",
        content: `# On the EC2 server where they serve the React build:
export REACT_APP_API_URL=https://api.mycompany.com

# Re-uploaded the same dist/ folder to S3
aws s3 sync dist/ s3://my-react-app

# Result: app still calls http://localhost:4000
# process.env.REACT_APP_API_URL is undefined in the browser`
      }
    ],
    problems: [
      'Setting REACT_APP_API_URL on the server has no effect — React environment variables are baked into the JavaScript bundle at build time, not read at runtime from the server',
      'The team re-uploaded the same old dist/ folder — the environment variable was never present during npm run build'
    ],
    questions: [
      { num: "5.1", marks: 4, text: "Explain the fundamental difference between a backend (Node.js) environment variable and a frontend (React) environment variable. When does a Node.js app read process.env.DB_HOST — at startup or at build time? When does React read process.env.REACT_APP_API_URL — at runtime in the browser or during npm run build? Explain why setting the variable on the server after the build has no effect on the JavaScript bundle already in dist/." },
      { num: "5.2", marks: 3, text: "Write the correct sequence of commands the team must run to deploy the React app with the production API URL. Show: (a) how to set the environment variable before the build, (b) the npm command that bakes it into the bundle, and (c) the S3 sync command. Explain why the REACT_APP_ prefix is required and what happens to variables without this prefix in a Create React App project." },
      { num: "5.3", marks: 3, text: "Explain why deploying a React app to S3 static hosting is recommended over running it on an EC2 instance with a Node.js server. What does npm run build produce (name the two key output files) and why can those files be served from a plain file storage service with no server-side code? Name one AWS service that can be placed in front of the S3 bucket to add HTTPS and global CDN caching." }
    ]
  },
  {
    id: "Q6",
    topic: "AWS CLI — Configuration, Automation & Key Security",
    marks: 10,
    scenario: "The Key That Was Pushed to GitHub",
    context: `A developer configures AWS CLI access by pasting her access key directly into a shell script that also launches EC2 instances. She commits and pushes this script to a public GitHub repository. Within minutes her AWS account is compromised — attackers use the key to spin up hundreds of EC2 instances for crypto mining. A senior engineer also wants to know how to properly configure CLI access and automate EC2 operations safely.`,
    code: [
      {
        label: "deploy.sh (dangerous — committed to GitHub)",
        lang: "bash",
        content: `#!/bin/bash
# Launches an EC2 instance

AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENGbPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=us-east-1

aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t2.micro \
  --key-name my-keypair \
  --count 1`
      },
      {
        label: "GitHub automated scanner alert (received seconds after push)",
        lang: "text",
        content: `[GitHub Secret Scanning Alert]
Secret type: AWS Access Key
Location:    deploy.sh, line 4-5
Status:      EXPOSED — repository is public
Action:      Rotate this key immediately`
      }
    ],
    problems: [
      'AWS access keys hardcoded in deploy.sh are visible to anyone who views the public repository — GitHub\'s secret scanner detected them in seconds',
      'The team does not know the correct way to configure AWS CLI access or automate EC2 operations without hardcoding credentials'
    ],
    questions: [
      { num: "6.1", marks: 3, text: "Explain why hardcoding AWS credentials in a shell script committed to a public GitHub repository is a critical security failure. What can an attacker do with a leaked AWS access key? GitHub detected the key in seconds — explain what GitHub Secret Scanning is. Write a grep command a DevOps engineer could run locally on their repo before pushing to detect exposed AWS key patterns." },
      { num: "6.2", marks: 4, text: "Explain the correct way to configure AWS CLI access using aws configure. What four values does it prompt for and where does it store them on disk? Show how to rewrite deploy.sh so it contains no hardcoded credentials — the script should use the credentials already configured via aws configure. Also show the .gitignore entry that prevents AWS credential files from being accidentally committed." },
      { num: "6.3", marks: 3, text: "The team wants to run this EC2 automation script from a GitHub Actions workflow. Explain why aws configure is not the right approach inside a CI runner. Show the correct way to make AWS credentials available inside a GitHub Actions job — using GitHub Secrets and the standard environment variables the AWS CLI automatically reads. Show only the relevant YAML snippet." }
    ]
  },
  {
    id: "Q7",
    topic: "Terraform — Providers, Resources & Init Workflow",
    marks: 10,
    scenario: "The Plan That Needed a Plugin",
    context: `A new engineer, Preethi, clones a Terraform repository from GitHub and immediately runs terraform plan. She gets an error about a missing provider. A colleague tells her she skipped a required step. She also does not understand what a provider or resource block actually does, or why the .terraform/ folder is in .gitignore.`,
    code: [
      {
        label: "main.tf",
        lang: "hcl",
        content: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}

resource "aws_s3_bucket" "data" {
  bucket = "mycompany-data-prod"
}`
      },
      {
        label: "Error when Preethi runs terraform plan",
        lang: "bash",
        content: `$ terraform plan

Error: Required plugins are not installed

The working directory does not contain the required plugins.

Run "terraform init" to install the necessary provider plugins.`
      }
    ],
    problems: [
      'Preethi ran terraform plan without first running terraform init — the AWS provider plugin is not downloaded',
      'She does not understand what provider and resource blocks do or why .terraform/ should not be committed to Git'
    ],
    questions: [
      { num: "7.1", marks: 3, text: "Explain what terraform init does. What does it download, where does it store the downloaded files, and why must it be run before any other Terraform command? Explain why the .terraform/ directory should be added to .gitignore — what problems would occur if it were committed to the Git repository?" },
      { num: "7.2", marks: 4, text: "Explain what a Terraform provider is using the AWS provider as an example. What does the provider block configure? Then explain what a resource block declares — using aws_instance.web and aws_s3_bucket.data as examples. For each resource, what is the resource type, the local name, and the configuration arguments? What does Terraform do when you run terraform apply with these two resource blocks?" },
      { num: "7.3", marks: 3, text: "Walk through the correct three-command Terraform workflow in order: terraform init, terraform plan, and terraform apply. For each command state: what it does, what output it produces, and whether it makes any changes to AWS infrastructure. Explain why terraform plan is the critical review step — what information does it show the engineer before any real changes are made?" }
    ]
  },
  {
    id: "Q8",
    topic: "Kubernetes — Architecture & kubectl Interaction",
    marks: 10,
    scenario: "What Actually Happens When You kubectl apply",
    context: `A student applies a Deployment YAML to their minikube cluster. They want to understand what is happening inside Kubernetes — which components receive their command, which components schedule the pod, and which components actually run it on the node. They are also confused about why kubectl sometimes shows a pod as 'Pending' before it becomes 'Running'.`,
    code: [
      {
        label: "Student applies a Deployment",
        lang: "bash",
        content: `$ kubectl apply -f nginx-deployment.yaml
deployment.apps/nginx created

$ kubectl get pods
NAME                     READY   STATUS    RESTARTS
nginx-58f7-abc12         0/1     Pending   0        ← why Pending?

# 10 seconds later:
nginx-58f7-abc12         1/1     Running   0`
      },
      {
        label: "Kubernetes architecture components",
        lang: "text",
        content: `Control Plane (Master Node):
  ├── API Server       — single entry point for all kubectl commands
  ├── Scheduler        — decides which node a pod runs on
  ├── Controller Mgr   — watches desired vs actual state
  └── etcd             — key-value store (cluster's source of truth)

Worker Node:
  ├── kubelet          — runs and monitors containers on this node
  ├── kube-proxy       — handles network routing
  └── Container Runtime (Docker/containerd) — actually runs containers`
      }
    ],
    problems: [
      'The student does not understand which Kubernetes component receives the kubectl apply command and what the chain of events is until the pod runs',
      'The student does not understand why a pod shows Pending before Running — what work is being done during that window'
    ],
    questions: [
      { num: "8.1", marks: 4, text: "Trace the complete journey of kubectl apply -f nginx-deployment.yaml through the Kubernetes architecture. Starting from the kubectl command on the student's laptop, name each component that processes the request in order: API Server → etcd → Controller Manager → Scheduler → kubelet → Container Runtime. Explain what each component does in one sentence at each step." },
      { num: "8.2", marks: 3, text: "Explain why the pod shows Pending before Running. What work is happening during the Pending phase — break it into the two distinct stages: (a) the Scheduler selecting a node, and (b) the kubelet pulling the image and starting the container. What would cause a pod to stay in Pending indefinitely (name two possible reasons)?" },
      { num: "8.3", marks: 3, text: "Explain what etcd is in Kubernetes. What data does it store and why is it called the cluster's 'source of truth'? Explain how the Controller Manager uses etcd — what is the control loop it runs, and how does it relate to the concept of desired-vs-actual state that makes Kubernetes self-healing?" }
    ]
  },
  {
    id: "Q9",
    topic: "Docker Compose — Nginx Reverse Proxy",
    marks: 10,
    scenario: "The Proxy That Returned 502",
    context: `A team adds an Nginx container as a reverse proxy in front of their Node.js API. The goal is for all traffic to hit Nginx on port 80, and Nginx to forward it to the api container on port 4000 internally. After running docker compose up, visiting http://localhost returns a 502 Bad Gateway error.`,
    code: [
      {
        label: "compose.yaml",
        lang: "yaml",
        content: `services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf

  api:
    build: ./api
    ports:
      - "4000:4000"

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret`
      },
      {
        label: "nginx.conf (broken)",
        lang: "text",
        content: `server {
    listen 80;

    location / {
        proxy_pass http://localhost:4000;
    }
}`
      },
      {
        label: "Error in browser",
        lang: "text",
        content: `HTTP 502 Bad Gateway
nginx/1.25.3

# nginx error log:
[error] connect() failed (111: Connection refused) 
while connecting to upstream: http://localhost:4000`
      }
    ],
    problems: [
      'nginx.conf uses http://localhost:4000 — inside the nginx container, localhost refers to the nginx container itself, not the api container',
      'The api service exposes port 4000 to the host with -p 4000:4000 — this is unnecessary since nginx should reach the api container directly on the internal Docker network'
    ],
    questions: [
      { num: "9.1", marks: 4, text: "Explain precisely why http://localhost:4000 inside the nginx container does not reach the api container. What does localhost resolve to inside a container? What hostname should nginx use to reach the api service — and how does Docker Compose make this hostname resolvable? Write the corrected nginx.conf proxy_pass line." },
      { num: "9.2", marks: 3, text: "The api service in compose.yaml has ports: - '4000:4000'. Explain why this port mapping is unnecessary in this architecture — if nginx proxies all traffic to the api container using the internal Docker network hostname, why does port 4000 not need to be exposed to the host? What is the security benefit of removing it?" },
      { num: "9.3", marks: 3, text: "Write the complete corrected compose.yaml with: (a) the correct nginx.conf proxy_pass hostname, (b) the api service with the unnecessary host port mapping removed. Then explain the request flow from a browser on the developer's laptop through nginx to the api container — list every hop the HTTP request makes, including which port is used at each step." }
    ]
  },
  {
    id: "Q10",
    topic: "Kubernetes — Ingress & Path-Based Routing",
    marks: 10,
    scenario: "The Two Services With One Entry Point",
    context: `A team runs two services on minikube: a React frontend (port 3000) and a Node.js API (port 4000). Currently each has its own NodePort Service on a different port. Their manager says production should have a single entry point on port 80 that routes /api requests to the backend and everything else to the frontend. The team does not know what a Kubernetes Ingress is.`,
    code: [
      {
        label: "Current setup — two NodePort services",
        lang: "bash",
        content: `$ kubectl get services
NAME           TYPE       CLUSTER-IP    PORT(S)
frontend-svc   NodePort   10.96.1.10   3000:30300/TCP
api-svc        NodePort   10.96.1.11   4000:30400/TCP

# Users must access:
# Frontend: http://minikube-ip:30300
# API:      http://minikube-ip:30400`
      },
      {
        label: "Desired routing via Ingress",
        lang: "text",
        content: `http://myapp.local/          → frontend-svc (port 3000)
http://myapp.local/api/     → api-svc (port 4000)

# Single entry point on port 80
# One hostname, two services, path-based routing`
      },
      {
        label: "Incomplete Ingress YAML",
        lang: "yaml",
        content: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /api
        pathType: ________
        backend:
          service:
            name: ________
            port:
              number: ________
      - path: /
        pathType: ________
        backend:
          service:
            name: ________
            port:
              number: ________`
      }
    ],
    problems: [
      'Two separate NodePort Services expose two different ports — not suitable for production where a single domain on port 80 is expected',
      'The team does not know what an Ingress Controller is or that it must be installed separately before an Ingress resource works'
    ],
    questions: [
      { num: "10.1", marks: 3, text: "Explain what a Kubernetes Ingress is and what problem it solves compared to using multiple NodePort or LoadBalancer Services. What is an Ingress Controller and why must it be installed separately — Kubernetes does not include one by default? Name the Ingress Controller the team would enable on minikube with a single command and show that command." },
      { num: "10.2", marks: 4, text: "Complete the Ingress YAML above. Fill in all blanks correctly for both the /api path (routing to api-svc on port 4000) and the / path (routing to frontend-svc on port 3000). Explain the difference between pathType: Prefix and pathType: Exact — why is Prefix the correct choice for both routes here? Explain what happens when a request arrives for /api/users — which path rule does the Ingress match it to?" },
      { num: "10.3", marks: 3, text: "After applying the Ingress, the team needs to access http://myapp.local from their laptop browser. Explain why the hostname myapp.local does not resolve by default and what file must be edited on the laptop to make it work. Write the exact entry to add and show the kubectl command to get the minikube IP needed for that entry. Why is this /etc/hosts approach only suitable for local development and not production?" }
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
  const dotBg   = sectionColor === "teal" ? "#E1F5EE" : "#EEEDFE";
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

  const syllabusCoverage = [
    { topic: "1. DevOps Philosophy & SDLC",          q: "Q2", covered: true },
    { topic: "2. Git & Version Control",             q: "Q1", covered: true },
    { topic: "3. Linux & Bash",                      q: "—",  covered: false, note: "covered in Sets 1-5" },
    { topic: "4. CI/CD & GitHub Actions",            q: "—",  covered: false, note: "covered in Sets 1-5" },
    { topic: "5. Frontend Build & REACT_APP_",       q: "Q5", covered: true },
    { topic: "6. AWS CLI & Key Security",            q: "Q6", covered: true },
    { topic: "7. Docker I — Matrix from Hell",       q: "Q3", covered: true },
    { topic: "8. Docker II — ECR & Compose",         q: "Q4, Q9", covered: true },
    { topic: "9. AWS ECS & IAM",                     q: "Q4", covered: true },
    { topic: "11. Terraform — init & providers",     q: "Q7", covered: true },
    { topic: "12. Kubernetes arch & Ingress",        q: "Q8, Q10", covered: true },
  ];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px 40px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>DevOps End-Sem · Practice Paper — Set 6</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>10 New Questions — Syllabus Gaps Covered</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>Fresh topics not in Sets 1–5 · Same exam format · 10 marks each</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 16 }}>
          {syllabusCoverage.map((s, i) => (
            <div key={i} style={{ padding: "8px 12px", background: s.covered ? "#E1F5EE" : "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: s.covered ? "#085041" : "var(--color-text-secondary)" }}>{s.topic}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: s.covered ? "#1D9E75" : "var(--color-text-secondary)", flexShrink: 0 }}>{s.q}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { id: "all",  label: "All 10 Questions" },
          { id: "pre",  label: "Section A — Pre-mid (Q1–Q2, 20%)" },
          { id: "post", label: "Section B — Post-mid (Q3–Q10, 80%)" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", borderRadius: "var(--border-radius-md)", border: "0.5px solid",
            borderColor: tab === t.id ? "#1D9E75" : "var(--color-border-secondary)",
            background:  tab === t.id ? "#E1F5EE"  : "transparent",
            color:       tab === t.id ? "#085041"  : "var(--color-text-secondary)",
            fontWeight:  tab === t.id ? 500 : 400, fontSize: 13, cursor: "pointer"
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "pre"  && <div style={{ background:"#EEEDFE", border:"0.5px solid #AFA9EC", borderRadius:"var(--border-radius-md)", padding:"10px 14px", marginBottom:16, fontSize:13, color:"#3C3489" }}>Q1–Q2 · Topics 1–2 · Git workflow & DevOps philosophy · 20% weightage</div>}
      {tab === "post" && <div style={{ background:"#E1F5EE", border:"0.5px solid #5DCAA5", borderRadius:"var(--border-radius-md)", padding:"10px 14px", marginBottom:16, fontSize:13, color:"#085041" }}>Q3–Q10 · Topics 5–12 · Frontend env vars, AWS CLI, Docker, Terraform, Kubernetes · 80% weightage</div>}

      {display.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i}
          sectionColor={["Q1","Q2"].includes(q.id) ? "purple" : "teal"} />
      ))}
    </div>
  );
}
