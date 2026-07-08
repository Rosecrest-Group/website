# Rosecrest

Marketing site, Sanity blog, and CRM frontend for Rosecrest Group Ltd. The CRM talks to a separate Express API — it never connects to Postgres directly.

## Repositories

| | Frontend (this repo) | Backend API |
|---|---------------------|-------------|
| **GitHub** | [Rosecrest-Group/website](https://github.com/Rosecrest-Group/website) | [Rosecrest-Group/crm-api](https://github.com/Rosecrest-Group/crm-api) |
| **Stack** | Next.js 16, React 19, Tailwind, Sanity | Express, Prisma, Supabase Auth |
| **Hosting** | Netlify | Railway |
| **Local port** | `3000` | `4000` |

The `api/` folder in a local checkout is **not** part of this repo. Clone `crm-api` into `api/` when working on the full stack.

## Branches

Both repos use **`main`** (production) and **`staging`** (pre-production).

| Branch | Use |
|--------|-----|
| `staging` | Push here to deploy to the staging environment (Netlify for the frontend, Railway for the API). Test changes before production. |
| `main` | Production deploys. Merge from `staging` after verification. |

```bash
# Frontend — deploy to staging
git push origin staging

# Backend — deploy to staging (from the api/ checkout)
git push origin staging
```

## Prerequisites

- **Node.js 20+** for the frontend (`website`)
- **Node.js 22+** for the API (`crm-api`)
- npm

## Local setup — frontend

```bash
git clone https://github.com/Rosecrest-Group/website.git
cd website
npm ci
```

Copy environment variables from the example files into `.env.local`:

- `.env.local.example` — Sanity (blog CMS)
- `.env.example` — CRM API URLs and Dialpad

For local CRM development, these are enough to start:

```env
NEXT_PUBLIC_CRM_API_URL=/api/v1
CRM_API_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). CRM routes live under `/crm/*`; API docs at `/crm/documentation`.

## Local setup — backend

Clone the API repo into the `api/` directory alongside the frontend root:

```bash
# from the website repo root
git clone https://github.com/Rosecrest-Group/crm-api.git api
cd api
npm ci
```

Create `api/.env` with database and Supabase credentials (see comments in `.env.example` at the repo root for the variable list). At minimum you need `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, and `CORS_ORIGIN=http://localhost:3000`.

Run migrations and start the API:

```bash
npm run db:migrate   # first time, or after schema changes
npm run dev
```

The API listens on [http://localhost:4000](http://localhost:4000). In dev, Next.js proxies `/api/v1/*` to the backend via `CRM_API_URL` (see `next.config.ts`).

## Running both together

Use two terminals:

```bash
# Terminal 1 — API
cd api && npm run dev

# Terminal 2 — frontend
npm run dev
```

## Useful scripts

**Frontend** (repo root):

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright end-to-end tests |

**Backend** (`api/`):

| Command | Description |
|---------|-------------|
| `npm run dev` | API with hot reload |
| `npm test` | Vitest unit tests |
| `npm run build` | TypeScript compile |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run create-admin` | Create a CRM admin user |

## Deployment

1. **Staging** — push to `staging` on the relevant repo; verify on the staging Netlify / Railway URLs.
2. **Production** — merge `staging` → `main` and push, or push directly to `main` when appropriate.

Rollback: Netlify and Railway both keep deploy history — publish / roll back to a previous build from the dashboard.

## Further reading

- [`docs/Rosecrest-Website-Documentation.md`](docs/Rosecrest-Website-Documentation.md) — hosting, Sanity, DNS, Netlify env vars
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — rollbacks, webhooks, on-call
- [`crm/docs/crm_prd.md`](crm/docs/crm_prd.md) — CRM product requirements
