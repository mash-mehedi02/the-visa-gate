# THE VISA GATE
### Corporate Website & Visa Management System + Client Application Tracking Portal

**Tagline:** YOUR JOURNEY. OUR GUIDANCE.  
**Architecture:** Modular Monolith (Express REST API + React Vite SPA + Shared TypeScript Package)  
**Security:** Role-Based Access Control (RBAC), AES-256-GCM Sensitive ID Encryption, Zero-Trust Document Storage, Rate Limiting & System Audit Trail  

---

## System Overview

**THE VISA GATE** is a full-featured, production-ready corporate website and visa management platform. It combines a public-facing corporate website, an operations management console for Administrators and Staff, and an ultra-clean, mobile-first Application Tracking Portal for Clients.

### Key Capabilities

1. **Public Corporate Website**:
   - Modern, premium corporate aesthetic built around brand colors (Navy `#102440`, Gold `#D6B66E`, White `#FFFFFF`, Background `#F4F6FA`).
   - Detailed service pages for Work Permit, Student Visa, Tourist/Business Visa, Europe/Schengen, Malaysia, Cyprus, Belarus, and Other visas.
   - Interactive destination catalog and dynamic inquiry intake.
   - Fast-track direct portal links.

2. **Client Application Tracking Portal**:
   - **Passport Number Login**: Clients log in using their normalized Passport Number as their username.
   - **Sensitive Data Protection**: Passwords are never derived from NIDs or Passwords; NIDs are encrypted at rest with AES-256-GCM; identifiers are masked (`A123****78`).
   - **Hyper-Focused Read-Only Experience**:
     - *Who am I?* (Profile picture, full name, DOB, masked NID & Passport).
     - *What documents have I submitted?* (Document name and verification status badge: Verified, Received, Under Review, Correction Required, etc.).
     - *What is the progress of my visa?* (Dynamic chronological step timeline with scheduled dates, deadlines, and next required procedure).
   - Zero administrative controls or document uploads for clients.

3. **Admin & Staff Management Console**:
   - **Real-Time KPIs**: Live calculated stats (Total Clients, Active/Completed Cases, Pending Documents, Overdue Tasks, Payments Received).
   - **Client Management**: Search by name/passport/code, view case history, register client and auto-generate temporary credentials.
   - **Case Management**: Create applications, assign responsible staff members, update case status.
   - **Dynamic Visa Workflow Engine**: Build custom sequential steps, mark milestones complete (triggering history logs and client alerts), set appointment dates, and publish client instructions.
   - **Document Vault**: Upload sensitive client papers, review files, update verification states with audit notes.
   - **Manual Payments Ledger**: Record payments (Cash, Bank Transfer, bKash, Nagad), auto-issue formatted receipts, and execute auditable reversals.
   - **Staff Management & RBAC**: Configure granular permissions per staff member.
   - **Immutable Audit Trail**: Chronological log capturing actor, action, entity, timestamp, and IP address.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v6, TanStack Query, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT, bcryptjs, Helmet, Multer |
| **Monorepo** | NPM Workspaces (`apps/web`, `apps/api`, `packages/shared`) |
| **Testing** | Vitest (Automated Security, Encryption, RBAC, Workflow, and Payment tests) |

---

## Quick Start

### 1. Install & Build
```bash
npm install
npm run build
```

### 2. Run Test Suite
```bash
npm run test
```

### 3. Launch Development Servers
```bash
# Backend (Port 5000)
npm run dev:api

# Frontend (Port 5173)
npm run dev:web
```

---

## Seeded Accounts

No default passwords are shipped in this repository. The seed script creates the
bootstrap admin, a sample staff account and a sample client account from
environment variables only (`INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`,
`SEED_STAFF_PASSWORD`, `SEED_CLIENT_PASSWORD`). Every seeded account must change
its password at first sign-in. Rotate any credential that was ever published
with a previous default before deploying — see `SECURITY_REVIEW.md`.

---

## Documentation Index

- [Architecture Specification](docs/architecture.md)
- [Database Schema & ERD](docs/database.md)
- [Security & Compliance](docs/security.md)
- [REST API Reference](docs/api-documentation.md)
- [Setup & Deployment Guide](docs/setup-guide.md)
- [Development Progress Checklist](PROJECT_PROGRESS.md)
