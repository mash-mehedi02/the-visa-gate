# THE VISA GATE — REST API Documentation (v1)

Base URL: `/api/v1`

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user (Passport # for clients, Email for Admin/Staff) | No (Rate Limited) |
| `POST` | `/api/v1/auth/logout` | Clears authentication cookies | Yes |
| `GET` | `/api/v1/auth/me` | Returns authenticated user profile, roles, and permissions | Yes |
| `POST` | `/api/v1/auth/change-password` | Update user password | Yes |

---

## 2. Clients (`/api/v1/clients`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/clients` | List clients with search (name, passport, code, phone) | ADMIN, STAFF |
| `GET` | `/api/v1/clients/:id` | Get detailed client profile, applications & history | ADMIN, STAFF |
| `POST` | `/api/v1/clients` | Register new client (encrypts NID/Passport, generates temporary login) | ADMIN, STAFF |
| `PATCH` | `/api/v1/clients/:id` | Update client profile | ADMIN, STAFF |

---

## 3. Applications (`/api/v1/applications`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/applications` | List active & past visa cases with search & status filters | ADMIN, STAFF |
| `GET` | `/api/v1/applications/:id` | Get application details, assigned staff, dynamic steps, docs | ADMIN, STAFF |
| `POST` | `/api/v1/applications` | Create application & instantiate workflow steps | ADMIN, STAFF |
| `PATCH` | `/api/v1/applications/:id` | Update case status or notes | ADMIN, STAFF |

---

## 4. Dynamic Visa Workflows (`/api/v1/workflows`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/workflows/templates` | List reusable workflow templates | ADMIN, STAFF |
| `POST` | `/api/v1/workflows/templates` | Create reusable workflow template | ADMIN |
| `GET` | `/api/v1/workflows/applications/:appId/steps` | List steps for specific application | ADMIN, STAFF |
| `POST` | `/api/v1/workflows/applications/:appId/steps` | Append custom step to application | ADMIN, STAFF |
| `POST` | `/api/v1/workflows/applications/:appId/steps/reorder` | Reorder sequential procedural steps | ADMIN, STAFF |
| `PATCH` | `/api/v1/workflows/steps/:id` | Update step status (COMPLETED, IN_PROGRESS), dates & client notice | ADMIN, STAFF |

---

## 5. Document Management Vault (`/api/v1/documents`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/documents/types` | List standard document types (Passport, NID, Medical, etc.) | ADMIN, STAFF |
| `GET` | `/api/v1/documents/application/:appId` | List documents for a case | ADMIN, STAFF |
| `POST` | `/api/v1/documents/upload` | Multipart file upload to private vault | ADMIN, STAFF |
| `PATCH` | `/api/v1/documents/:id/status` | Update verification status (VERIFIED, REJECTED, etc.) | ADMIN, STAFF |
| `GET` | `/api/v1/documents/:id/download` | Secure authenticated file stream | ADMIN, STAFF |

---

## 6. Manual Payments & Receipts (`/api/v1/payments`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/payments` | Ledger list of transactions and receipts | ADMIN, STAFF |
| `POST` | `/api/v1/payments` | Record manual payment (Cash, Bank, bKash, Nagad) & issue receipt | ADMIN, STAFF |
| `POST` | `/api/v1/payments/:id/reverse` | Auditable payment reversal with mandatory reason | ADMIN |

---

## 7. Client Application Tracking Portal (`/api/v1/client`)

*Strictly scoped to authenticated client entity derived from session/token.*

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/client/profile` | Client masked personal profile (Name, DOB, Masked NID, Masked Passport) | CLIENT |
| `GET` | `/api/v1/client/applications` | Active visa applications with progress percentage | CLIENT |
| `GET` | `/api/v1/client/applications/:id/progress` | Dynamic procedural milestone timeline & next procedure | CLIENT |
| `GET` | `/api/v1/client/documents` | Submitted document names and verification statuses (Read-only) | CLIENT |

---

## 8. Reports & Analytics (`/api/v1/reports`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/reports/dashboard` | Calculated KPI counts, country breakdown, recent cases | ADMIN, STAFF |

---

## 9. System Audit Logs (`/api/v1/audit-logs`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/audit-logs` | Immutable chronological stream of security and operational actions | ADMIN |
