# Church Members

Member directory, monthly subscription tracking, and PDF payment receipts for a
church office. Everything that can change data lives behind an admin password.

## Stack

- Next.js 16 (App Router, Server Actions)
- PostgreSQL via Prisma ORM 7 (works great with Neon's free tier)
- Admin auth: single shared password (bcrypt hash) + signed session cookie (JWT via `jose`)
- Receipts: generated as PDFs on demand with `pdf-lib`

## Features

- Member directory with search, each member's phone/email/address
- Date of birth, wedding, baptism, and confirmation dates per member
- Monthly subscription amount per member
- Record a payment for a given month/year (cash/check/online/other), one payment per member per month
- Download a PDF receipt for any recorded payment
- Edit or deactivate members, delete members or individual payments
- Everything above requires an admin session; the public site only shows a sign-in link

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Get a Postgres database

Easiest free option: [Neon](https://neon.tech) — sign up, create a project, and copy
the **pooled** connection string (the host name ends in `-pooler`; that's the one
that works well with serverless functions on Vercel).

For local-only testing you can instead run Postgres in Docker:

```bash
docker run -d --name church_app_db -e POSTGRES_PASSWORD=localdevpass -e POSTGRES_DB=church -p 55432:5432 postgres:16-alpine
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — your Postgres connection string
- `SESSION_SECRET` — any random 16+ character string, e.g.
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_PASSWORD_HASH` — generate with:
  ```bash
  npm run hash-password -- "your-chosen-password"
  ```
  Copy the printed hash into `.env`. The plaintext password is never stored.
- `CHURCH_NAME` — shown on receipts

### 4. Create the database schema

```bash
npm run db:migrate
```

### 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`, click **Admin sign in**, and log in with the
password you hashed in step 3.

## Deploying to Vercel (free)

1. **Push this project to a GitHub repo.**
2. **Create a free Neon Postgres database** (if you haven't already) at
   [neon.tech](https://neon.tech) and copy its pooled connection string.
3. **Import the repo into Vercel** ([vercel.com/new](https://vercel.com/new)) —
   it auto-detects Next.js, no config needed.
4. **Set environment variables** in the Vercel project (Settings → Environment
   Variables), matching your `.env`:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD_HASH`
   - `CHURCH_NAME`
5. **Apply the database schema** to your production database once, from your
   machine, pointing at the same `DATABASE_URL` Vercel uses:
   ```bash
   npm run db:deploy
   ```
6. **Deploy.** Vercel builds and deploys automatically on push. `npm install`
   runs `prisma generate` via the `postinstall` script, so no extra build
   configuration is needed.

After that, every push to your main branch redeploys automatically. Run
`npm run db:deploy` again any time you change `prisma/schema.prisma` and want
to apply a new migration to production.

## Admin password

There is one shared admin password for the whole app (simple by design — this
is meant for a small church office, not a multi-user system). To change it,
regenerate the hash and update `ADMIN_PASSWORD_HASH` wherever the app runs:

```bash
npm run hash-password -- "new-password"
```

## Project structure

- `app/admin` — admin dashboard, member detail/edit page, and the server
  actions (`actions.ts`) that do all the writing (create/update/delete member,
  record/delete payment)
- `app/login` — admin sign-in page and its server actions
- `app/api/receipts/[paymentId]` — generates and streams a payment's PDF receipt
- `lib/auth.ts` — session cookie creation/verification
- `lib/prisma.ts` — Prisma client singleton
- `lib/receipt.ts` — PDF receipt layout
- `proxy.ts` — gates `/admin/*` and `/api/receipts/*` behind a valid admin session
