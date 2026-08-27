# 🛡️ Security Policy — ShopSmart E-Commerce Platform

The **ShopSmart** engineering team takes the security of our platform, user credentials, financial transactions, and customer data seriously. We appreciate the efforts of security researchers and community contributors in identifying and reporting vulnerabilities responsibly.

---

## 1. Supported Versions

We actively maintain and provide security patches for the following versions of the ShopSmart monorepo:

| Version | Supported | Security Patch Status |
| :--- | :---: | :--- |
| `1.x.x` (Current `main`) | ✅ | Active support & immediate security hotfixes |
| `< 1.0.0` | ❌ | End of Life (Upgrade to current `main` required) |

---

## 2. Reporting a Vulnerability

> [!IMPORTANT]
> **Please DO NOT report security vulnerabilities via public GitHub issues, discussions, or pull requests.**

If you believe you have discovered a security vulnerability in ShopSmart (including authentication bypasses, payment tampering, race conditions, remote code execution, SQL injection, or data leakage), please report it via one of the following channels:

### Preferred Channel: GitHub Private Vulnerability Reporting
1. Navigate to the repository's [Security Advisories](https://github.com/MAYANKSHARMA01010/shopsmart/security/advisories/new) tab.
2. Click **"Report a vulnerability"** to open a private advisory draft.
3. Provide full technical details and steps to reproduce.

### Alternative Channel: Security Contact Email
Send an encrypted or detailed report to our dedicated security contact:
- **Email:** `sharmamayank01010@gmail.com`
- **Subject:** `[SECURITY DISCLOSURE] ShopSmart — <Brief Description>`

### What to Include in Your Report
To help us triage and resolve the issue quickly, please include:
- **Summary:** Clear description of the vulnerability and its potential impact.
- **Affected Components:** File paths, API endpoints, or user flows involved (e.g. `/api/checkout`, `apps/server/src/modules/payment/...`).
- **Proof of Concept (PoC):** Step-by-step reproduction instructions, scripts, or HTTP request payloads.
- **Impact Assessment:** Explanation of what an attacker could achieve (e.g., unauthorized data access, privilege escalation, inventory oversell).
- **Suggested Remediation (Optional):** Proposed code fix or configuration change if known.

---

## 3. Response Timelines & SLA

We are committed to timely investigation and remediation:

| Phase | Target SLA |
| :--- | :--- |
| **Initial Acknowledgment** | Within **24 hours** of submission |
| **Triage & Severity Assessment** | Within **48 hours** |
| **Hotfix Implementation & Validation** | Within **3–5 business days** (Critical issues prioritized within 24h) |
| **Coordinated Public Disclosure** | Following mutual agreement after the fix is deployed |

---

## 4. Architectural Security Invariants

ShopSmart is designed with strict defense-in-depth architectural principles:

- **🔐 Policy-Based Access Control (PBAC):** Endpoints enforce permission guards (`requirePermission(...)`) alongside standard RBAC roles (`SUPER_ADMIN`, `ADMIN`, `VENDOR`, `CUSTOMER`).
- **🛡️ Token Security & Rotation:** Access tokens expire in 15 minutes. Refresh tokens are stored strictly as `SHA-256` hashes with JTI rotation to prevent replay attacks.
- **💰 Monetary Precision:** All monetary amounts are handled via PostgreSQL `Decimal(10,2)` via `Prisma.Decimal` to eliminate IEEE-754 floating-point rounding errors.
- **⚡ Anti-Overselling Concurrency:** Inventory reservations and deductions enforce PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) with alphabetically sorted UUIDs to prevent deadlocks and race conditions.
- **🪝 Webhook HMAC Verification:** Payment gateway webhooks require raw-body HMAC SHA-256 signature verification and atomic database deduplication via `ProcessedWebhook`.
- **💉 Injection Defense:** Prisma ORM parameterized queries prevent SQL injection; Zod schema middleware validates and sanitizes all incoming HTTP payloads.

---

## 5. Safe Harbor & Responsible Disclosure

We consider security research conducted under this policy to be authorized. When conducting research:
- **Do not** access, modify, or delete customer or personal data belonging to others.
- **Do not** execute Denial of Service (DoS/DDoS) attacks or degrade system availability.
- **Do not** perform physical attacks or social engineering against team members.
- **Give us reasonable time** to investigate and deploy fixes before publicly discussing findings.

---

*Thank you for helping keep ShopSmart and our community secure.*
