# THE VISA GATE — Local Setup & Deployment Guide

This guide details running the complete platform locally and deploying to production.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **NPM**: v9.0.0 or higher (with Workspace support)
- **PostgreSQL**: v14.0 or higher (or cloud instances e.g. Supabase, Neon, Render)

---

## 2. Environment Configuration

Copy the template configuration file:

```bash
cp .env.example .env
```

Review and adjust variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/the_visa_gate?schema=public`)
- `JWT_SECRET`: Minimum 32-character high-entropy secret string
- `ENCRYPTION_KEY`: 32 bytes hex string (64 characters) used for AES-256-GCM encryption of NID and Passport numbers
- `STORAGE_PROVIDER`: `local` (or `s3` / `supabase`)
- `INITIAL_ADMIN_EMAIL`: Initial admin login email
- `INITIAL_ADMIN_PASSWORD`: Initial admin password
- `SEED_STAFF_PASSWORD` / `SEED_CLIENT_PASSWORD`: Passwords for the sample staff
  and sample client accounts created by the seed script (no defaults exist)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Outbound email.
  REQUIRED — staff sign-in uses an emailed MFA code and client password reset
  uses an emailed token. Without working SMTP, staff cannot sign in and reset
  tokens cannot be delivered; there is no in-app fallback.

---

## 3. Installation & Building

Install dependencies across the monorepo:

```bash
npm install
```

Build shared packages and applications:

```bash
npm run build
```

---

## 4. Database Setup & Seeding

When connected to a PostgreSQL database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema or run migrations
npm run db:migrate

# Seed with standard roles, permissions, countries, visa categories, workflows & initial admin
npm run db:seed
```

*Note: In development environments where local PostgreSQL is not currently running, the backend automatically utilizes an embedded data store pre-seeded with sample data so all features can be tested immediately.*

---

## 5. Running in Development Mode

Run the backend and frontend simultaneously:

```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:api

# Terminal 2: Frontend Web App (Port 5173)
npm run dev:web
```

---

## 6. Seeded Accounts (No Default Passwords)

The seed script creates three accounts from environment variables only — there
are no default passwords anywhere in the repository:

### System Administrator (Admin)
- **Portal**: Staff & Admin Login
- **Identifier / Email**: `INITIAL_ADMIN_EMAIL`
- **Password**: `INITIAL_ADMIN_PASSWORD`
- **Access**: Full system control, dashboard KPIs, client profiles, dynamic workflow engine, document vault, staff management, payments ledger, audit logs.

### Operations Staff Member
- **Portal**: Staff & Admin Login
- **Identifier / Email**: `staff@thevisagate.com`
- **Password**: `SEED_STAFF_PASSWORD`
- **Access**: Client management, case file processing, step progression, document verification.

### Client (Demo Applicant)
- **Portal**: Client Portal
- **Identifier (Passport Number)**: `A12345678`
- **Password**: `SEED_CLIENT_PASSWORD`
- **Access**: Ultra-clean read-only tracking of personal profile, submitted document verification states, chronological timeline, and next required procedure.

Every seeded account must change its password at first sign-in. If any
credential from an earlier default was ever used on a deployed host, rotate it
before deploying — see `SECURITY_REVIEW.md`.

> **SMTP is required before staff can sign in.** Staff sign-in sends a 6-digit
> MFA code to the registered email address, and client password reset sends a
> token the same way. Configure `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` in
> `.env` first; without working email delivery, staff MFA sign-in fails with a
> clear error instead of falling back to any retrievable code.

---

## 7. Production Deployment Architecture

- **Frontend (`apps/web`)**: Deploy to Vercel, Netlify, or Cloudflare Pages with build command `npm run build:web` and publish directory `apps/web/dist`.
- **Backend API (`apps/api`)**: Deploy to Render, Railway, AWS ECS, or VPS with build command `npm run build:api` and start command `npm run start --workspace=@thevisagate/api`.
- **Database**: PostgreSQL on Supabase, Neon, AWS RDS, or Render PostgreSQL.
- **Documents Storage**: Local persistent disk or AWS S3 / Supabase Private Storage bucket.
