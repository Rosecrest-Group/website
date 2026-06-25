# Rosecrest Group Website — Technical & Operations Documentation

This document describes how **rosecrestgroupltd.co.uk** is built, hosted, and operated. It is intended for stakeholders, developers, and anyone managing CMS, DNS, or integrations.

**Security note:** Do not store live passwords or API secrets in shared documents or repositories. Use a company password manager and restrict API tokens to named individuals or automation roles.

---

## 1. Website architecture and tech stack

### High-level architecture

- **Frontend / application:** [Next.js](https://nextjs.org/) (App Router) — React 19, TypeScript.
- **Content for the blog:** [Sanity](https://www.sanity.io/) — headless CMS; editors use **Sanity Studio** embedded at `/studio` on the public site.
- **Hosting / CDN / builds:** [Netlify](https://www.netlify.com/) with the official **Next.js** adapter (`@netlify/plugin-nextjs`).
- **Legacy CMS (partial):** WordPress remains on **`cms.rosecrestgroupltd.co.uk`** for some assets and the **Party Wall Notice Generator** (embedded iframe). Blog content has been migrated toward Sanity; migration tooling exists in-repo (see [Automations](#7-existing-automations-and-workflows)).

### Key libraries (representative)

| Area | Technology |
|------|------------|
| Styling | Tailwind CSS v4, Radix UI / shadcn-style components |
| Blog rich text | `@portabletext/react`, Sanity image URLs |
| CMS SDK | `next-sanity`, `sanity` |
| Forms | React Hook Form, Zod validation |
| Analytics | Google Tag Manager (loads tags such as GA4 / Google Ads per container config) |

### Repository

| Item | Detail |
|------|--------|
| Remote | `https://github.com/Rosecrest-Group/website` |
| Primary branch | Confirm in GitHub (typically `main`) |

---

## 2. CMS access and guidance

### Sanity (blog)

| Item | Detail |
|------|--------|
| Studio URL | `https://www.rosecrestgroupltd.co.uk/studio` |
| Management | [sanity.io/manage](https://www.sanity.io/manage) — project settings, API tokens, datasets |
| Dataset | Configured via `NEXT_PUBLIC_SANITY_DATASET` (default in code: `production`) |
| Content model | Defined under `sanity/schemas` in the repository |

**Editor workflow (summary):**

1. Sign in to Studio at `/studio`.
2. Create or open a **Post** document.
3. Complete title, slug (use **Generate** from title where available), author, hero image, categories/tags, published date, excerpt, and body.
4. **Publish** when ready. Unpublish from the publish control if the post should leave the live site.

**Technical tokens (developers / CI only):**

| Purpose | Environment variable |
|---------|----------------------|
| Public reads | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` |
| Private dataset reads (server) | `SANITY_API_READ_TOKEN` — optional; see `.env.local.example` |
| Webhook verification | `SANITY_REVALIDATE_SECRET` — must match Sanity webhook configuration |
| Migration / write scripts | `SANITY_API_WRITE_TOKEN` — Editor token from Sanity manage |

Reference template: `.env.local.example` in the repository root.

### WordPress (`cms` subdomain)

Used for legacy media paths (see image remote patterns in `next.config.ts`), WPGraphQL-based migration scripts, and the Party Wall generator page iframe. Access and credentials are separate from Sanity; confirm ownership with whoever administers WordPress.

---

## 3. Hosting details and access

| Item | Detail |
|------|--------|
| Platform | Netlify |
| Dashboard | [app.netlify.com](https://app.netlify.com/) |
| Build command | `next build` (see `netlify.toml`) |
| Publish directory | `.next` (Next.js on Netlify plugin handles output) |

**Typical Netlify responsibilities**

- View deploy logs and build failures.
- Environment variables for production (must mirror required Next.js / Sanity / webhook / form URLs).
- Domain aliases (apex vs `www`), HTTPS certificates (usually automatic).

**Account access**

- Store Netlify login in a password manager; use **team invites** for additional users rather than sharing one password.

---

## 4. Domain / DNS configuration

**Canonical site URL in application config:** `https://www.rosecrestgroupltd.co.uk` (see `lib/page-metadata.ts` — `siteConfig.url`).

**Authoritative DNS**

- Actual **A/CNAME** records and registrar login live at your **DNS provider** (often the domain registrar or Cloudflare). Netlify’s UI shows the exact targets Netlify expects for apex and `www`.
- **Action for stakeholders:** In Netlify → **Domain management**, confirm which domain is primary and whether apex redirects to `www` (or the reverse). Align DNS at the registrar with Netlify’s documented records.

**Related hostnames**

| Hostname | Role |
|----------|------|
| `www.rosecrestgroupltd.co.uk` | Primary public site |
| `cms.rosecrestgroupltd.co.uk` | Legacy WordPress / generator iframe |

---

## 5. Logins and ownership / access information

**Do not distribute passwords in documentation.** Maintain a secure register (e.g. password manager vault + spreadsheet with **account name, URL, owner, billing contact** only).

| System | Typical roles | Notes |
|--------|----------------|-------|
| GitHub `Rosecrest-Group/website` | Org owners, developers | Source code, PRs, branch protection |
| Netlify | Deploy visibility, env vars | Linked to GitHub deploys |
| Sanity | Editors, project admins | Studio + sanity.io/manage |
| Domain / DNS registrar | DNS admins | Point records at Netlify |
| Google Tag Manager | Marketing / analytics | Container ID is embedded in code (see [SEO & analytics](#10-seo-related-setup-and-configuration)) |
| WordPress (`cms`) | Legacy admin | Generator + media; confirm with hosting provider |

**Ownership:** Legal ownership of domain and vendor contracts should be recorded outside this repo (company register + vendor invoices).

---

## 6. Third-party integrations and how they function

### Sanity → Next.js (blog)

- Pages under `/blog` fetch posts via Sanity client helpers (`sanity/lib/client.ts`).
- **ISR:** Blog routes use `revalidate = 60` (seconds), so pages refresh periodically without a full redeploy.

### Sanity webhook → on-demand revalidation

- **Endpoint (implemented):** `POST /api/revalidate`
- Verifies signature using `SANITY_REVALIDATE_SECRET` and calls Next.js `revalidatePath` for `/blog` and individual `/blog/[slug]` when applicable (`app/api/revalidate/route.ts`).
- Configure the webhook URL in Sanity to hit the **production** site:  
  `https://www.rosecrestgroupltd.co.uk/api/revalidate`  
  (exact URL should match your Netlify primary domain and HTTPS.)

### Enquiry form → outbound webhook

- **Route:** `POST /api/enquiry`
- Reads JSON from the contact form and forwards to **`ENQUIRY_WEBHOOK_URL`** (`config/api.ts`, `app/api/enquiry/route.ts`).
- The destination can be Zapier, Make, an email service, CRM middleware, etc. **Confirm the live URL in Netlify environment variables** — it is not hard-coded in the repo.

### Booking / inspection request → outbound webhook

- **Route:** `POST /api/booking`
- Maps form fields to a structured payload (including `leadType` IDs for survey levels) and POSTs to **`BOOKING_WEBHOOK_URL`** (`app/api/booking/route.ts`).
- Again, the **real endpoint is whatever is configured in Netlify** for production.

### Google Tag Manager

- Container **`GTM-KWX4BX6S`** is loaded in `components/analytics/GoogleTagManager.tsx` and `app/layout.tsx` (including noscript iframe).
- Tags for GA4, Google Ads, conversions, etc. are controlled inside the GTM UI, not in code.

### Party Wall Notice Generator (iframe)

- The Next.js page `/services/party-wall/notice-generator` embeds:  
  `https://cms.rosecrestgroupltd.co.uk/party-wall-notice-generator/?embedded=1`
- Submission behaviour (email delivery, storage) is determined by the **WordPress-side** implementation, not by this Next.js repo.

### Salesforce

- **There is no direct Salesforce SDK or API module in this codebase.**  
- If leads ultimately reach Salesforce, that path is likely via the **configured webhook URLs** (`ENQUIRY_WEBHOOK_URL`, `BOOKING_WEBHOOK_URL`) or another middleware. **Migration status** (e.g. parity with a legacy Salesforce workflow) must be confirmed with whoever owns CRM operations and the webhook endpoints.

---

## 7. Existing automations and workflows

| Workflow | Mechanism |
|----------|-----------|
| **Deploy on git push** | Netlify builds from GitHub (typical); verify branch → production mapping in Netlify |
| **Blog refresh after CMS publish** | Sanity webhook → `/api/revalidate` → cache revalidation |
| **Periodic blog staleness** | `revalidate = 60` on blog pages as a fallback |
| **WordPress → Sanity migration** | Script `npm run migrate:wordpress` — `scripts/migrate-wordpress-to-sanity.ts` (requires WP GraphQL + Sanity write token) |

---

## 8. Form integrations (Party Wall & Salesforce)

| Form / surface | Implementation status |
|------------------|------------------------|
| **Contact / quotation (`ContactForm`)** | Submits to **`/api/enquiry`** → `ENQUIRY_WEBHOOK_URL`. Production behaviour depends on Netlify env. |
| **Homebuyer booking (`BookingForm`)** | Submits to **`/api/booking`** → `BOOKING_WEBHOOK_URL`. |
| **`NewContactForm`** | **Not fully wired:** contains a TODO to connect Gravity Forms API or email handler; currently logs/simulates locally (`components/common/NewContactForm.tsx`). Confirm whether this component is used in production. |
| **Party Wall Notice Generator** | **Not a Next.js API form** — iframe to WordPress on `cms.rosecrestgroupltd.co.uk`. |
| **Salesforce** | **No in-repo Salesforce connector.** Trace leads via webhook destinations and CRM docs. |

---

## 9. File structure and repository access (overview)

| Path | Purpose |
|------|---------|
| `app/` | Routes, layouts, API routes (`app/api/*`), Studio route (`app/studio/`) |
| `components/`, `fragments/` | UI components and page sections |
| `sanity/` | Studio config, schemas, GROQ queries, Sanity client |
| `lib/` | Metadata, SEO helpers, schema.org JSON-LD |
| `config/api.ts` | Webhook URL wiring from environment variables |
| `netlify.toml` | Netlify build and plugin config |
| `scripts/migrate-wordpress-to-sanity.ts` | Optional content migration |

Clone with Git and follow `.env.local.example` for local development.

---

## 10. SEO-related setup and configuration

| Mechanism | Location / behaviour |
|-----------|----------------------|
| **Global metadata** | `app/layout.tsx` — default title template and description |
| **Per-page titles & descriptions** | `lib/page-metadata.ts` — central map `pageMetadata` |
| **Structured data (JSON-LD)** | `lib/schema.ts`, `components/common/JsonLd.tsx` — Organization, WebSite, and route-specific schemas |
| **Sitemap** | `app/sitemap.ts` — static list of URLs (`https://rosecrestgroupltd.co.uk` base in file; align with canonical `www` in `siteConfig` if consolidating) |
| **Redirects (legacy URLs)** | `next.config.ts` — permanent redirects from old paths (e.g. WordPress-style blog slugs, `/service/*`) |
| **Analytics / conversions** | GTM `GTM-KWX4BX6S`; thank-you page routing noted for conversion tracking (`ContactForm` comments) |

**Gap to be aware of:** The static `sitemap.ts` does not appear to enumerate individual **blog post** URLs from Sanity; search engines still discover posts via links and indexing, but a dynamic sitemap generation from Sanity is an optional improvement.

---

## 11. Deployment and update process

1. **Change code** locally or via PR on GitHub `Rosecrest-Group/website`.
2. **Merge** to the branch Netlify deploys from (commonly `main`).
3. Netlify runs **`next build`** and publishes via the Next.js plugin.
4. **Content-only blog updates:** Publish in Sanity; webhook revalidation updates `/blog` without redeploy; ISR provides backup refresh.

**Rollback:** Use Netlify deploy history to **publish a previous successful deploy**.

---

## 12. Backup and recovery

| Asset | Recovery approach |
|-------|-------------------|
| **Source code** | Git history on GitHub; restore via revert or redeploy |
| **Sanity content** | Sanity project backups / dataset history (see [Sanity documentation](https://www.sanity.io/docs)); export if required |
| **Netlify** | Redeploy prior build; env vars backed up securely outside Netlify |
| **WordPress (`cms`)** | Dependent on hosting backups — confirm with WP host |

---

## 13. Dependencies, subscriptions, and external services

| Service | Typical billing / subscription |
|---------|-------------------------------|
| Netlify | Plan tied to team account |
| Sanity | Usage/plan per Sanity project |
| GitHub | Org billing if private repos / advanced features |
| Domain registrar | Annual domain renewal |
| Google Tag Manager | Free; linked Google Ads / GA may have their own billing |
| WordPress hosting (`cms`) | Whatever hosts `cms.rosecrestgroupltd.co.uk` |
| Webhook targets | Depends on vendor (Zapier, Make, email API, etc.) |

Maintain a single **vendor list** with renewal dates and **named billing owners**.

---

## 14. Environment variables (checklist for Netlify & local)

Copy from `.env.local.example` and document internally who owns each secret:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN` (if needed)
- `SANITY_REVALIDATE_SECRET` + Sanity webhook configuration
- `ENQUIRY_WEBHOOK_URL`, `BOOKING_WEBHOOK_URL`
- `SANITY_API_WRITE_TOKEN` / `WORDPRESS_GRAPHQL_URL` — only for migration scripts or server tooling

---

## Quick reference URLs

| Purpose | URL |
|---------|-----|
| Live site | `https://www.rosecrestgroupltd.co.uk` |
| Blog | `https://www.rosecrestgroupltd.co.uk/blog` |
| Sanity Studio | `https://www.rosecrestgroupltd.co.uk/studio` |
| Netlify | `https://app.netlify.com/` |
| Sanity manage | `https://www.sanity.io/manage` |
| Repository | `https://github.com/Rosecrest-Group/website` |

---

*Last updated to reflect the state of the repository and configuration patterns described above. Confirm DNS, webhook URLs, and CRM routing against production Netlify and vendor dashboards.*
