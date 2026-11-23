# THE VISA GATE — Database Architecture & Entity Relationship Documentation

This document describes the relational database design for **The Visa Gate**, built on PostgreSQL using Prisma ORM.

## Database Design Principles

1. **UUID Keys**: Every entity uses UUIDs (`@default(uuid())`) to prevent sequence enumeration and simplify horizontal scalability.
2. **Normalized Login Identifiers**:
   - Clients log in with their **Passport Number** (sanitized, normalized to uppercase without spaces).
   - Staff and Administrators log in with their **Email / Username**.
   - The `users.identifier` column enforces uniqueness across all active logins.
3. **Sensitive Identifier Protection**:
   - Client NID and Passport numbers are encrypted at rest with **AES-256-GCM** in `nidEncrypted` and `passportEncrypted`.
   - Masked formats (`nidMasked`, `passportMasked`, e.g. `A012****89`) are stored for safe display in lists and Client Portals.
4. **Referential Integrity**:
   - Foreign key constraints enforce relationship hierarchy.
   - Cascade deletions are restricted to child owned records (such as role permissions, assignments), while critical entities (such as Audit Logs) retain data with `SetNull` to preserve history.
5. **Auditable Step and Payment Changes**:
   - `application_step_history` records previous vs new statuses, change actor, and timestamps.
   - `payment_adjustments` records any corrections, reversals, or adjustments without destructive edits on recorded payments.

---

## 23 Relational Models Specification

| # | Table Name | Purpose | Primary Relations |
|---|---|---|---|
| 1 | `roles` | System roles (ADMIN, STAFF, CLIENT) | `users`, `role_permissions` |
| 2 | `permissions` | Granular permission keys (`clients:view`, etc.) | `role_permissions` |
| 3 | `role_permissions` | Pivot table mapping roles to permissions | `roles`, `permissions` |
| 4 | `users` | Core credentials, authentication state, login security | `roles`, `clients`, `staff_profiles`, `audit_logs` |
| 5 | `clients` | Client profile, masked & encrypted personal info | `users`, `applications`, `documents`, `payments` |
| 6 | `staff_profiles` | Staff internal details, employee ID, assignment tracking | `users`, `application_assignments`, `application_steps` |
| 7 | `countries` | Destination countries (Malaysia, Cyprus, Belarus, etc.) | `visa_categories`, `applications`, `workflow_templates` |
| 8 | `visa_categories` | Visa categories (Work Permit, Student, Tourist, etc.) | `countries`, `applications`, `workflow_templates` |
| 9 | `applications` | Central visa case record with unique code (TVG-2026-XXXX) | `clients`, `countries`, `visa_categories`, `steps`, `documents` |
| 10 | `application_assignments`| Staff assigned to manage specific applications | `applications`, `staff_profiles` |
| 11 | `workflow_templates` | Reusable procedural sequences per destination/category | `countries`, `visa_categories`, `workflow_template_steps` |
| 12 | `workflow_template_steps`| Default steps inside a template | `workflow_templates` |
| 13 | `application_steps` | Dynamic procedural steps belonging to an application | `applications`, `staff_profiles`, `application_step_history` |
| 14 | `application_step_history` | Audit trail of step status transitions | `application_steps` |
| 15 | `document_types` | Catalog of recognized documents (Passport, NID, etc.) | `documents` |
| 16 | `documents` | Uploaded document metadata, private path & verification | `applications`, `clients`, `document_types` |
| 17 | `payments` | Manual payment ledger records with unique receipt # | `applications`, `clients`, `payment_adjustments` |
| 18 | `payment_adjustments` | Non-destructive reversal or adjustment history | `payments` |
| 19 | `notifications` | Internal and client in-app notification alerts | `users` |
| 20 | `notification_preferences`| User delivery channel flags (email, sms, in-app) | `users` |
| 21 | `appointments` | Client face-to-face or embassy appointment schedules | `clients`, `applications` |
| 22 | `client_notes` | Staff internal case notes (hidden from clients) | `clients`, `staff_profiles` |
| 23 | `audit_logs` | Immutable audit trail for all operational actions | `users` |

---

## Sensitive Data Encryption Scheme

```
[Plaintext NID / Passport]
       │
       ▼
AES-256-GCM Encryption (with unique random IV per record)
       │
       ├──► Stored in DB: `nidEncrypted` = `${iv}:${authTag}:${ciphertext}`
       │
       └──► Masked Helper: `passportMasked` = `BG12****89`
```
No plaintext identifiers are ever stored in database columns or exposed in logs or URLs.
