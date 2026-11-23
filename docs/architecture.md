# THE VISA GATE — Architecture Specification

## Overview

**The Visa Gate** is engineered as a **Modular Monolith** designed for high security, operational resilience, and maintainability. It cleanly segregates:
1. **Public Corporate Website:** Brand introduction, services catalog, dynamic inquiry intake with cascading continent/country selection, and localized contact details.
2. **Administrative Back-Office:** Executive dashboard, KPI reporting, staff delegation, countries/categories management, dynamic workflow engine, and audit logs.
3. **Staff Processing Pipeline:** Assigned client cases, step-by-step procedure advancement, document verification, and payment recording.
4. **Client Application Tracking Portal:** Ultra-simplified, strictly read-only portal authenticated via Passport Number with masked personal identifiers and live procedure tracking.

```
                           ┌────────────────────────────┐
                           │      Internet / CDN        │
                           └─────────────┬──────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
         ┌─────────▼────────┐                        ┌─────────▼────────┐
         │ Public Corporate │                        │  Authenticated   │
         │ Website & Portal │                        │ Admin / Staff    │
         │   (Vite React)   │                        │   (Vite React)   │
         └─────────┬────────┘                        └─────────┬────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         │
                                   HTTPS / JSON
                                         │
                           ┌─────────────▼──────────────┐
                           │    Express API Gateway     │
                           │   (Helmet, Rate-Limiting,  │
                           │     JWT & Cookie Auth)     │
                           └─────────────┬──────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
  ┌─────────▼──────────┐       ┌─────────▼──────────┐       ┌─────────▼──────────┐
  │  Core Management   │       │   Dynamic Visa     │       │ Document & Payment │
  │ (Auth, RBAC, Users │       │ Workflow Engine &  │       │  Vault & Auditing  │
  │ Clients & Staff)   │       │ Application Steps  │       │      Services      │
  └─────────┬──────────┘       └─────────┬──────────┘       └─────────┬──────────┘
            │                            │                            │
            └────────────────────────────┼────────────────────────────┘
                                         │
                       ┌─────────────────┴─────────────────┐
                       │                                   │
             ┌─────────▼─────────┐               ┌─────────▼─────────┐
             │    Prisma ORM     │               │  Storage Adapter  │
             │(PostgreSQL/Memory)│               │ (Private Disk/S3) │
             └───────────────────┘               └───────────────────┘
```

---

## Directory Structure

```
the-visa-gate/
├── apps/
│   ├── web/                     # Vite + React 18 + Tailwind CSS frontend
│   │   ├── src/
│   │   │   ├── components/      # UI components & shared widgets
│   │   │   ├── context/         # AuthContext with token handling
│   │   │   ├── data/            # Localized continent & country datasets
│   │   │   ├── layouts/         # PublicLayout, AdminLayout, ClientLayout
│   │   │   ├── pages/
│   │   │   │   ├── public/      # Home, About, Services, Contact, FAQ, Countries, Login
│   │   │   │   ├── admin/       # Dashboard, Clients, Apps, Workflows, Staff, Payments, etc.
│   │   │   │   └── client/      # Simple read-only tracking & profile portal
│   │   │   ├── routes/          # Role-based protected routing (AppRoutes.tsx)
│   │   │   └── services/        # Axios API clients
│   │   ├── package.json
│   │   └── vite.config.ts       # Path aliases, proxy, bundling configuration
│   └── api/                     # Node.js + Express + Prisma REST API
│       ├── prisma/              # schema.prisma (23 tables), seed.ts
│       └── src/
│           ├── config/          # Environment variables & constants
│           ├── data/            # store.ts (Resilient in-memory fallback store)
│           ├── middleware/      # Auth, RBAC, Error, Rate limiting, Uploads
│           ├── modules/         # Modular business logic:
│           │   ├── auth/        # Login, password reset, token generation
│           │   ├── clients/     # Client profiles, NID/Passport encryption
│           │   ├── applications/# Case management & lifecycle
│           │   ├── workflows/   # Dynamic workflow & step engine
│           │   ├── documents/   # Secure private document uploads & verification
│           │   ├── payments/    # Manual payment ledger & receipts
│           │   ├── staff/       # Staff management & permissions
│           │   ├── client-portal/# Scoped read-only endpoints for clients
│           │   ├── reports/     # Real-time operational statistics & metrics
│           │   ├── inquiries/   # Public lead intake
│           │   └── audit-logs/  # Immutable audit recording
│           └── utils/           # Encryption (AES-256-GCM), masking, tokens, response formatting
└── packages/
    └── shared/                  # Common TypeScript interfaces, Zod schemas, constants, enums
```

---

## Core Architectural Guardrails

1. **Client Read-Only Isolation:**  
   Clients are restricted to endpoints scoped under `/api/v1/client-portal/`. The backend strictly enforces authorization using the verified client's ID. There are no client-accessible endpoints for editing profiles, creating steps, uploading documents, or altering statuses.

2. **Cryptographic Protection of Sensitive Identifiers:**  
   National ID numbers and Passport numbers are encrypted at rest using AES-256-GCM. Unmasked values are never transmitted to unauthorized endpoints or logged in audit records. Masked variants (`A123****`, `1992********`) are provided for user identification.

3. **Resilient Dual-Mode Data Access:**  
   The application leverages Prisma ORM against PostgreSQL. In the event of a missing database connection or local offline development, the API gateway automatically switches to an internal, pre-seeded in-memory store (`store.ts`) that mirrors all 23 database tables, ensuring zero downtime and continuous developer agility.

4. **Storage Abstraction:**  
   File management is shielded behind a generic `StorageService` interface. Documents are stored in private local disk vaults or AWS S3 / Supabase private buckets. Pre-signed or authenticated streaming is enforced; direct public file URLs are prohibited.

5. **Auditable Financial Ledger:**  
   All payments are recorded manually by authorized staff with unique receipt codes (`TVG-REC-2026-XXXX`). Any reversals or adjustments trigger immutable audit log entries, maintaining zero financial discrepancy.
