# Security Review — 24 November 2026 (`review/ux-security-workflows`)

Review of The Visa Gate as a professional visa consultancy and application
management platform: public site, client portal, admin console, and the API
that serves them. This file records what was fixed in this branch, what is
still open, and what an operator must do before deploying.

## Fixed in this branch

### 1. Hard-coded fallback secrets removed (`apps/api/src/config/index.ts`)
`JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `ENCRYPTION_KEY` and the
bootstrap admin email/password previously fell back to values readable in this
public repository. The server now refuses to start unless every one of them is
set in the environment (`requiredEnv()`), and `.env.example` no longer ships a
usable-looking encryption key or admin password.
**Operator action:** set all six values from `.env.example` before the next
start. **Rotate every value that was ever deployed with a default**, including
the AES key used to encrypt NIDs/passports — data encrypted under the old key
cannot be decrypted with a new one, so plan a re-encryption, not just a swap.

### 2. MFA bypass via retrievable code removed
`POST /api/v1/auth/collect-verification-code` was unauthenticated and returned
the MFA code to anyone presenting the `mfaToken` — which the login response
itself returns to whoever supplied the password. When SMTP was unconfigured
(the default), the code was also parked in `store.pendingVerificationCodes`
and written to the in-app notification inbox, and the code was printed to the
server log (`auth.service.ts`). All of it is removed: the endpoint, the
controller method, `VerificationDeliveryService.collectCode`, the parking map,
the inbox fallback, and the `console.log`. `deliverCode()` now sends email
only and throws HTTP 503 when SMTP is unconfigured or a send fails.
**Operator action:** configure SMTP before staff can sign in (see
`docs/setup-guide.md` §6). Staff MFA login does not work without it, by design.

### 3. NID accepted as a password removed (`apps/api/src/modules/auth/auth.service.ts`)
Login used to accept a client's National ID number in place of the password,
and the login page taught users to do that. The fallback branch is deleted,
the field is labelled "Password *" only, and the shared `LoginSchema` message
no longer mentions NID. **Existing clients who signed in with their NID must
use "Forgot password?" (or ask the office) to set a real password.**

### 4. Session token no longer kept in browser storage
The web app stored the JWT (`tvg_token`) and the user record in
`localStorage` and sent it as a `Bearer` header, which made the httpOnly
cookie pointless for XSS. The app is now cookie-only: `apps/web/src/services/api.ts`
sends no `Authorization` header, `AuthContext` keeps no token and derives the
session from `GET /auth/me`, and the login / verify-MFA responses no longer
include the token in the JSON body (the cookie is still set server-side).
Note: the token is still generated and set by the API; only its exposure to
JavaScript is removed.

### 5. Seeded demo credentials
- `apps/api/prisma/seed.ts`: staff and client passwords now come from
  `SEED_STAFF_PASSWORD` / `SEED_CLIENT_PASSWORD` (seed refuses to run without
  them); the credential `console.log` lines are deleted; all seeded accounts
  get `mustChangePassword: true`.
- `apps/api/src/data/store.ts` (`seedBaselineData`): the plaintext-password
  comments next to the four precomputed bcrypt hashes are deleted, and all
  five seeded users get `mustChangePassword: true`, so the forced-change
  dialog (now rendered — see below) appears at first sign-in.
- `README.md` and `docs/setup-guide.md`: the published demo-credentials
  tables are replaced with env-only instructions.
- `apps/api/src/modules/clients/client.service.ts`: temporary client
  passwords are now random 16-character `base64url` values instead of
  `TVG@` + 6 digits, new clients get `mustChangePassword: true`, and the
  duplicate-passport 409 no longer echoes the submitted passport number.
- The forced-password-change dialog in `LoginPage.tsx` and
  `AdminLoginPage.tsx` was dead code (state was set, never rendered); it is
  now rendered with the server password rules, applies to clients as well as
  staff, and closing it signs the user out.
**Operator action:** the bcrypt hashes still committed in `store.ts` are hashes
of passwords that were previously published in this public repository.
Rotation (new random passwords, new hashes) is still required before any
deployment; `mustChangePassword: true` only forces a change after a first
sign-in with the old password.

### 6. Password-recovery enumeration oracle narrowed
`initiatePasswordRecovery` returned a distinct 400 when the passport existed
but the phone last-4 did not match, confirming the passport. A mismatch now
returns the same generic message as an unknown identifier. The generic
message now says "reset token" (the system delivers a pasted token, never a
link). Residual note: a missing/malformed phone field still returns a
validation error, and a delivery failure while SMTP is down is swallowed with
a server-side warning so as not to confirm the account — the client then
needs office help by phone.

### 7. Bosnia catalogue inconsistency fixed (`apps/api/src/data/store.ts`)
`prog-bih-wp` and `cat-bih-wp` said 45 days while the Bosnia work-permit
workflow template is 9 steps / 120 days in both `seed.ts` and `store.ts`.
Both catalogue values are now 120. Serbia and North Macedonia were already
120; Cyprus hospitality (`prog-cyp-hospitality`, 75 days) is a separate
sector-specific program and was left alone, as was `cat-cyp-wp` (75 days) —
changing advertised Cyprus days is a business decision, not a bug fix.
**Caveat:** `store.ts` `loadFromDisk()` wholesale replaces the catalogue from
`data/db.json` when that file exists, and `seed.ts` category upserts use
`update: {}` — so a persisted database or `db.json` will keep showing 45
until it is re-seeded or the stored row is updated. No live database or
`db.json` was available in this review to verify.

### 8. Auth rate-limit default aligned
`config` defaulted `AUTH_RATE_LIMIT_MAX` to 100 while `.env.example` said 10.
The config default is now 10 per 15 minutes, matching the documented value.

### 9. Small web fixes with security relevance
- The public mobile menu no longer links to `/admin-access` (the staff
  sign-in page), matching `docs/security.md`'s "zero exposed links to
  administrative logins". Staff use the direct URL.
- `SUPER_ADMIN` no longer locks itself out: added to the `/admin/*` route
  guard, the admin-only nested guards, `AdminLayout` and `ClientsPage`
  `isAdmin` checks, and `AdminLoginPage` role checks.
- Payment **Reverse** is now hidden from non-admin staff in the UI (the
  server already rejected them with 403).
- The client portal no longer falls back to the full passport number
  (`user.identifier`) when the masked value is missing, and the reveal toggle
  is labelled honestly ("Show identifiers" / "Hide identifiers").
- `window.alert()` / `alert()` error popups in `PaymentsPage` and
  `ApplicationsPage` are replaced with inline `role="alert"` banners.

## Still open — not fixed in this pass, do not mistake the UI for a fix

### A. Granular RBAC is dead code (HIGH)
`apps/api/src/middleware/rbac.middleware.ts` defines `requirePermission`, but
no route uses it. `clients`, `applications`, `documents` and `payments` routes
allow any `ADMIN`/`STAFF` role, so **any staff member can list, view and
export every client, application, document and payment**, including
`exportCsv` and document `storagePath`/`internalNotes` in
`document.service.ts` (`listByApplication`/`listByClient` do no assignment
check). Only client-delete and payment-reverse are admin-gated server-side.
`docs/security.md` ("STAFF → assigned client cases") and the privacy page's
staff-access wording overstate what is enforced; the privacy page was
softened to match reality. Fixing this means wiring `requirePermission`
per route and adding assignment checks — a larger, route-by-route change
that needs its own verification pass.

### B. Firestore sync ships client PII with unverified rules (MEDIUM)
`client.service.ts` `create()` calls `FirebaseDatabaseService.syncClient()`,
which strips only the encrypted fields — name, date of birth, phone, email,
address, masked IDs and emergency contact still go to Firestore. No
`firestore.rules` file exists in this repository, so Firestore access rules
could not be verified. Confirm the rules restrict reads to the owning
staff/admin before relying on this sync.

### C. Rate limiting behind a proxy (MEDIUM)
`apps/api/src/app.ts` sets no `trust proxy`, so behind Render/Railway (the
documented deployment targets) `express-rate-limit` keys off the proxy IP:
all users share one bucket and one abusive client can lock everyone out of
auth. Set `app.set('trust proxy', 1)` only when the deployment is actually
behind a single trusted proxy; do not set it for direct exposure. The
5-failed-attempts / 15-minute per-account lockout still applies either way.

### D. Content Security Policy is disabled (MEDIUM)
`apps/api/src/app.ts` runs `helmet({ contentSecurityPolicy: false,
crossOriginEmbedderPolicy: false })`. Re-enabling CSP needs an inventory of
the inline styles/fonts the app actually needs; it was not switched on blindly
here. The cookie-only auth change above reduces the impact of XSS, but CSP
remains the missing layer.

### E. Seeded demo PII and the in-memory store
`store.ts` and `seed.ts` seed two demo clients with full names, Bangladeshi
mobile numbers, NID and passport numbers. These are sample records, not real
people — do not treat them as production data, and do not copy them into a
live database. `data/db.json` (git-ignored) persists the in-memory store;
deleting it re-seeds from code.

### F. Upload validation leans on attacker-controlled MIME types
`upload.middleware.ts` filters on `file.mimetype`; `document.service.ts`
`scanFileSecurity` checks extension + MZ/ELF magic bytes with a 15 MB cap.
Documents are stored under random UUID names and are not statically served
(good), but avatars are served unauthenticated via `express.static('/uploads')`
and keep their original extension. Treat avatar uploads as public files.

### G. Document signed URLs are bearer tokens
`getSignedUrl` (HMAC-SHA256, 15-minute expiry, timing-safe compare) does not
verify that the document exists or that the requesting actor may access it,
and `GET /documents/download-signed` is intentionally unauthenticated. This is
acceptable only if signed URLs are treated as bearer tokens and never logged,
emailed in bulk, or shared. `error.middleware.ts` logs full error objects to
server logs — confirm no signed URL or token ever lands in an error object.

### H. No token-refresh endpoint
A JWT refresh secret is configured but no `/refresh` endpoint exists, so the
7-day cookie simply expires and the user signs in again. Fine for now; do not
add a refresh flow without an expiry/revocation design.

## Workflow templates — verified, not duplicated
`apps/api/prisma/seed.ts` and `apps/api/src/data/store.ts` already contain
9-step, 120-day work-permit templates for Serbia, North Macedonia, Bosnia and
Herzegovina, and Cyprus (step durations 2, 25, 10, 2, 30, 5, 15, 10, 21 days).
No new templates were created. Template edits cannot silently rewrite an
active case: `schema.prisma` `Application` has no `workflowTemplateId` foreign
key and the single seeded application (`app-1`, Malaysia) uses custom steps
not copied from any template. There is no separate "Greek Cyprus" destination
or template in the codebase — only Cyprus (CYP).
