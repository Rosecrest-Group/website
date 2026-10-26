# Feature: Lead attribution (how they found us)
**Class:** feature
**Statement:** Sales staff open a website lead and see where the person came from (ChatGPT, Google, Google Ads, a referring site…), the exact page that link landed on, the pages they read, and which form they submitted on which page — and admins see leads, wins and revenue per channel.
**Primary actor:** Sales / ops staff (OPS, ADMIN, SUPER_ADMIN) working a lead in the CRM.
**Slice 1:** A visitor arrives from chatgpt.com on `/services/damp-mould`, reads two more pages and submits the contact form on `/contact`. Staff open the lead and the "How they found us" panel shows "AI assistant · ChatGPT", the landing link, "Contact form on /contact", and the page journey.
**Spec path:** docs/features/lead-attribution.md

## Analog
| Item | Fill |
|---|---|
| Feature class | Marketing attribution / contact original source + journey |
| Products (named by user, or searched this session) | Atisah "How they found Atisah" (named by user); HubSpot contact traffic-source properties |
| URLs fetched this session | https://knowledge.hubspot.com/properties/understand-traffic-source-properties · https://knowledge.hubspot.com/properties/hubspots-default-contact-properties · https://knowledge.hubspot.com/reports/understand-hubspots-traffic-sources-in-the-traffic-analytics-tool · Atisah source: `apps/marketing/src/lib/session-tracking.ts`, `apps/front/src/app/admin/stores/[id]/page.tsx` (SignupAcquisitionPanel), `apps/api/migrations/041_signup_attribution.sql` |
| Default capabilities | Original source category (incl. "AI Referrals") + drill-down 1 (platform/domain) + drill-down 2 (campaign); first page seen; first referring site; UTM capture; click ids; number of page views; journey steps list; sources report by category; filter records by source |
| Analog flow — Entry | Open a contact / store record (HubSpot contact record; Atisah admin store detail) |
| Analog flow — Land | A "How they found …" panel on the record: first-touch source + time, landing page, referrer, UTM line, and "journey (N steps)" list. Records with no data show "No signup attribution recorded." (Atisah) |
| Analog flow — Next | 1) expand the journey steps; 2) filter the records list by original source; 3) open the Sources report and drill from category (AI Referrals) into platform (chatgpt.com) |

## Design analog
| Region | Analog (not this repo) |
|---|---|
| Chrome | Panel title "How they found …", subtitle "First touch before signup" (Atisah) |
| Columns | Lives in the record's detail column beside other record panels; label/value field grid, landing page + referrer + UTM spanning full width |
| Land canvas | Filled field grid when data exists; single muted line empty state when not |
| Preview | None — journey is an inline expandable list under the fields |
| Density | One compact panel; journey list below the fields |

Placement (user answered "both"): summary panel replaces "Lead origin" on the lead page and the embedded profile; a full **Journey** tab sits beside Messages / Internal notes / Activity on the lead page.

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | CRM: `crm/lib/api.ts` `request()` → Express API `/api/v1/*`. Website: Next route handlers (`app/api/enquiry|booking|party-wall`) → `POST /api/v1/intake/leads/:source` |
| Where new actions are registered | `api/src/routes/*.ts` (leads, dashboard), `api/src/services/leadIntake.ts` |
| UI layer(s) | Marketing site (`app/(marketing)`, `components`, `fragments`); CRM (`crm/**`, `app/crm/**`) |
| Where navigation lives | `crm/components/layout/CrmSidebar`; lead page panes in `crm/components/LeadDetail.tsx` |
| typecheck / lint / build / test commands | root: `npx tsc --noEmit`, `npx eslint <files>`; api: `npx tsc --noEmit -p tsconfig.json`, `npm test` (vitest) |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | Website form proxies | `app/api/enquiry/route.ts`, `app/api/booking/route.ts`, `app/api/party-wall/route.ts` |
| action/route | Public intake | `api/src/routes/intake.ts` → `processLeadIntake` (`api/src/services/leadIntake.ts`) |
| action/route | Lead detail / list | `GET /leads/:id`, `GET /leads` (`api/src/routes/leads.ts`) |
| action/route | Sales dashboard (period + funnelBySource) | `GET /dashboards/sales` (`api/src/routes/dashboard.ts`) |
| table/model | Lead (source enum = channel of intake, not journey) | `api/prisma/schema.prisma` |
| component | "Lead origin" panel | `crm/components/LeadDetail.tsx`, `crm/components/EmbeddedLeadProfile.tsx` |
| component | Pane tabs | `crm/components/ui/SlidingPaneTabs.tsx` |
| component | Analytics page + funnel table | `crm/components/CrmAnalytics.tsx` |
| component | Leads list + filters | `crm/components/LeadsList.tsx` |
| component | AI referral dataLayer push (GA) | `components/analytics/GoogleTagManager.tsx` |
| job | None | |
| notification template | None | |

## Out of scope
- Other devices or browsers — same-browser visits before the enquiry are specified in `docs/features/lead-journey-history.md`.
- Phone-call attribution (needs call-tracking numbers) — different product.
- The prompt a person typed into ChatGPT / Google search terms — not sent by those platforms.
- `NewContactForm` — not wired to any endpoint today (TODO in file).

## Invariants
- Attribution is only recorded for website intake sources (WEBSITE, WEBSITE_CONTACT_FORM, PARTY_WALL_TOOL) — `recordLeadAttribution` domain function in the API.
- At most one attribution row per lead — `@unique` on `lead_attributions.lead_id`.
- First touch never changes after creation; repeat enquiries append a touch — domain function (`appendTouch` only updates `touches`, `page_views`, `last_*`).
- Channel is classified on the server from referrer / UTM / click ids, never trusted from the client — `classifyChannel` in the API.
- Attribution failures never block lead intake — try/catch + log in `processLeadIntake`.
- Payload is bounded (≤50 pages per touch, ≤20 touches, URLs ≤2048 chars) — zod schema in the API.
- Only lead-access roles can read attribution — existing `requireExactRoles(...LEAD_ACCESS_ROLES)` on `/leads`.

## Actors
- Visitor — browses the marketing site and submits a form.
- Sales / ops staff — open a lead in the CRM (lead page, inbox / calls side panel).
- Admin — reads Analytics.
- System — website route handlers forward the payload; API intake classifies and stores it.

## Actor × lifecycle grid
| Stage | Visitor | Staff | Admin | System |
|---|---|---|---|---|
| Create/configure | Arrives; tracker records referrer, landing URL, UTM, click ids in memory | N/A — nothing to configure | N/A — channel rules are code | Channel rules in `classifyChannel` |
| Publish/enable | N/A — always on for marketing pages | N/A | N/A | Tracker mounted in `MarketingSiteChrome` |
| Discover/access | Each page view appended to the in-memory journey | Lead page panel + Journey tab; embedded profile panel; leads list Channel column + filter | Analytics "Leads by channel" table | N/A |
| Act/submit | Submits any of the 4 wired forms; payload rides along | Filter list by channel | Change period | Next route forwards `attribution`; API validates + classifies + stores |
| Confirm/deliver | Existing thank-you / success UI (unchanged) | Panel populated on lead open | Table refreshes with period | Lead activity "Lead created" unchanged |
| Use/fulfil/verify | N/A | Click landing link; open Journey tab | Compare channels / AI tools | N/A |
| Modify/revoke | N/A — no stored client data | N/A — attribution is read-only system data (see skipped) | N/A | Repeat enquiry appends a touch to the existing lead |
| Close/expire | Visits older than 180 days drop, and a successful enquiry clears the browser history (see lead-journey-history.md) | Lead delete cascades attribution | N/A | `onDelete: Cascade` |
| Reconcile/report | N/A | Empty state for leads without data | Leads, won, won £, conv % per channel and per AI tool | N/A |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| LeadAttribution | absent (partner, manual or pre-tracking lead) | Panel empty state ("Lead provider · PinLocal" or "No website journey recorded"); list "—"; analytics "Not tracked"/"Lead providers" | N/A | Journey tab shows empty state |
| LeadAttribution | recorded (1 touch) | Panel + Journey tab + list + analytics | Intake of a new website lead | — |
| LeadAttribution | repeat (≥2 touches) | Panel "Enquired N times"; Journey tab shows each enquiry visit | Duplicate website intake for the same lead | — |

## Table-stakes (build)
- [ ] In-memory journey tracker on marketing pages — Visitor — file: `lib/attribution.ts`, `components/analytics/AttributionTracker.tsx`, `components/layout/MarketingSiteChrome.tsx`
- [ ] All four submitting forms send attribution (contact form ×4 placements, booking form L1/L2/L3, booking modal, party wall generator) — Visitor — files: `components/common/ContactForm.tsx`, `fragments/homebuyer/BookingForm.tsx`, `components/homebuyer/BookingModal.tsx`, `fragments/partywall/PartyWallNoticeForm.tsx`
- [ ] Route handlers forward attribution — System — `app/api/enquiry|booking|party-wall/route.ts`
- [ ] Table + enum + migration — System — `api/prisma/schema.prisma`, `api/prisma/migrations/<ts>_lead_attribution/migration.sql`
- [ ] Server-side channel classifier with tests — System — `api/src/services/attribution/classify.ts` (+ `.test.ts`)
- [ ] Record on new lead, append on repeat enquiry — System — `api/src/services/attribution/record.ts`, `api/src/services/leadIntake.ts`
- [ ] Lead detail returns `attribution` — Staff — `api/src/routes/leads.ts`
- [ ] "How they found us" summary panel (lead page + embedded profile), with empty states — Staff — `crm/components/LeadAttributionPanel.tsx`
- [ ] Journey tab on lead page — Staff — `crm/components/LeadJourney.tsx`, `crm/components/LeadDetail.tsx`
- [ ] Channel labels shared in CRM — `crm/lib/attribution.ts`

## Optional — user answered
- [ ] Leads by channel on Analytics (leads, won, won £, conv %, AI tools broken out) — YES — `api/src/routes/dashboard.ts`, `crm/components/CrmAnalytics.tsx`. Placed on Analytics (which already has the period selector and "Funnel by source"); the Reports page only holds CSV downloads.
- [ ] Channel column + filter on leads list — YES — `api/src/routes/leads.ts`, `crm/components/LeadsList.tsx`
- Consent banner — NO. Same-browser visit history is specified in `docs/features/lead-journey-history.md`
- Placement — BOTH (panel + Journey tab)
- Channel columns in leads CSV export — not asked, easy to add later
- Manually correcting a lead's channel (HubSpot allows) — not asked, easy to add later

## Acceptance walkthrough
### Visitor
1. Open `/services/damp-mould?utm_source=chatgpt.com` with referrer chatgpt.com, click to `/about`, then `/contact`.
2. Submit the contact form → thank-you page as today.

### Staff
1. Open the new lead. "How they found us" shows: AI assistant · ChatGPT; landed on `/services/damp-mould?utm_source=chatgpt.com`; Contact form on `/contact`; "3 pages · enquired N min after arriving".
2. Click "Journey" tab → ChatGPT → damp-mould → about → contact → form submitted, with times.
3. Open a PinLocal lead → panel shows "Lead provider · PinLocal", Journey tab shows empty state.
4. Leads list → Channel filter "AI assistant" → only that lead type; Channel column shows "ChatGPT".

### Admin
1. Analytics → "Leads by channel" shows a ChatGPT row with 1 lead for the period.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| Page-view recorder | `<AttributionTracker` | `components\layout\MarketingSiteChrome.tsx:14: <AttributionTracker />` | Every marketing page |
| Journey payload on submit | `getAttribution(` | `components\common\ContactForm.tsx:90`, `fragments\homebuyer\BookingForm.tsx:176`, `components\homebuyer\BookingModal.tsx:188`, `fragments\partywall\PartyWallNoticeForm.tsx:262` | The four website forms |
| Forward to CRM intake | `attribution: body.attribution` | `app\api\enquiry\route.ts:20`, `app\api\booking\route.ts:37`, `app\api\party-wall\route.ts:41` | Website route handlers to `POST /api/v1/intake/leads/:source` |
| Save journey | `recordLeadAttribution(` | `api/src\services\leadIntake.ts:335` (repeat enquiry), `:386` (new lead) | Intake webhook (non-UI) |
| `GET /leads/:id` → `attribution` | `serializeLeadAttribution(` | `api/src\routes\leads.ts:306` | `crm\components\LeadDetail.tsx:1108 <LeadAttributionPanel`, `:1317 <LeadJourney`, `crm\components\EmbeddedLeadProfile.tsx:355 <LeadAttributionPanel` |
| `GET /leads?channel=` | `params.channel` | `crm\components\LeadsList.tsx:152: if (channel) params.channel = channel;` | Leads list Channel filter (`LeadsList.tsx:327`) and Channel column |
| `GET /dashboard` → `funnelByChannel` | `buildFunnelByChannel(` | `api/src\routes\dashboard.ts:539` | `crm\components\CrmAnalytics.tsx:631 columns={channelColumns}` ("Leads by channel") |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [ ] Every UI action hits a real surface with loading / success / error
- [ ] New controls follow VISUAL_FEEDBACK.md (result on the control, allowed motion only, toast is extra)
- [ ] Analog-flow table filled from fetched URLs or user screenshot (Entry / Land / Next). Discover/access matches it.
- [ ] Design analog table filled. Shipped UI matches those regions.
- [ ] Every status has a screen and a transition (or system-only, documented)
- [ ] Every actor has an entry point
- [ ] Wrong actor is rejected at server/policy on every new surface
- [ ] All table-stakes ticked with paths
- [ ] All YES answers ticked with paths
- [ ] Empty / error / expired / unauthorized states are intentional
- [ ] New tables/migrations, permissions, env, jobs registered where this repo registers them
- [ ] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired
- [ ] Browser walkthrough done, or "could not click: <reason>"

## Intentionally skipped
- Editing a lead's channel by hand — attribution is system-recorded; add later if staff need to correct "Direct" leads they know came from elsewhere.
