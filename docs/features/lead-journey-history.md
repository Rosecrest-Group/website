# Feature: Lead journey history
**Class:** feature
**Statement:** A visitor who reads the site and comes back later still has every visit on the enquiry, and sales staff see the earliest source plus each visit.
**Primary actor:** Sales / ops staff (OPS, ADMIN, SUPER_ADMIN) working a lead in the CRM.
**Slice 1:** Someone arrives from Google on Monday, reads two pages, and leaves. On Friday they return and submit the contact form. Staff open the lead: "How they found us" says Organic search · Google and the Monday landing page. The Journey tab lists Monday's visit and Friday's visit, with the form on Friday.
**Spec path:** docs/features/lead-journey-history.md

## Analog
| Item | Fill |
|---|---|
| Feature class | Multi-session website attribution on a contact record |
| Products (named by user, or searched this session) | HubSpot (searched this session). The earlier attribution feature also named Atisah; this slice follows HubSpot's original-source-plus-sessions model. |
| URLs fetched this session | https://knowledge.hubspot.com/records/update-and-filter-contacts-using-traffic-source-properties · https://knowledge.hubspot.com/account/how-does-hubspot-track-visitors · https://knowledge.hubspot.com/records/work-with-records · https://knowledge.hubspot.com/properties/hubspots-default-contact-properties · https://knowledge.hubspot.com/properties/understand-traffic-source-properties |
| Default capabilities | Tracking cookie remembers the visitor before they are a contact; page views from earlier sessions attach when they submit a form; Original source is the earliest visit, not the converting one; Latest source is the most recent visit; First page seen and first referring site stay on the earliest visit; Number of sessions and number of page views cover every session; contact timeline groups page views into sessions; deleting cookies or switching browser starts a new visitor; no journey for people who never identify themselves |
| Analog flow — Entry | Open the contact from CRM > Contacts. https://knowledge.hubspot.com/records/work-with-records |
| Analog flow — Land | Left sidebar shows original source properties (original traffic source, first page, first referrer). Middle column Activities lists website sessions, each rolled up from its page views, plus the form submission. Anonymous visitors who never submit are excluded. https://knowledge.hubspot.com/records/update-and-filter-contacts-using-traffic-source-properties · https://knowledge.hubspot.com/records/work-with-records |
| Analog flow — Next | 1) Read original source (the March Google visit in HubSpot's example, not the September form). 2) Open the session list and see each visit's pages. 3) Read latest source when a later visit arrived differently. 4) A second form submission adds another session without changing original source. https://knowledge.hubspot.com/records/update-and-filter-contacts-using-traffic-source-properties |

## Design analog
| Region | Analog (not this repo) |
|---|---|
| Chrome | Contact record title (the person's name). Activities tab is the timeline. No separate save action — the history is recorded by the system. https://knowledge.hubspot.com/records/work-with-records |
| Columns | Three: left properties (original source, first page, first referrer, latest source, session and page counts), middle timeline (one block per session, pages inside it, form submission on the converting session), right associations. Marketing traffic of people who never became contacts is excluded from this record. |
| Land canvas | Filled timeline when the contact has sessions. One line empty state when the record has no website activity. |
| Preview | None. The timeline is the record itself, not a preview of another document. |
| Density | One session block per visit in the middle column, not a single undifferentiated page list. |

This repo already has the lead page: summary panel in the detail column, Journey tab in the middle. Sessions land in that Journey tab. Original source stays on the existing "How they found us" panel. No new screen.

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | Website forms `POST` to Next route handlers, which forward `attribution` to `POST /api/v1/intake/leads/:source`. CRM reads `GET /leads/:id`. |
| Where new actions are registered | No new route. `api/src/services/attribution/record.ts` stores the payload. `lib/attribution.ts` records visits in the browser. |
| UI layer(s) | Marketing site (`components`, `fragments`); CRM lead page (`crm/components`) |
| Where navigation lives | Lead panes in `crm/components/LeadDetail.tsx` (Journey tab already exists) |
| typecheck / lint / build / test commands | root: `npx tsc --noEmit`, `npx eslint <files>`; api: `npx tsc --noEmit -p tsconfig.json`, `npm test` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | Website form proxies | `app/api/enquiry/route.ts`, `app/api/booking/route.ts`, `app/api/party-wall/route.ts` |
| action/route | Intake stores attribution | `api/src/services/leadIntake.ts` → `recordLeadAttribution` |
| table/model | `LeadAttribution` (one row per lead, touches JSON) | `api/prisma/schema.prisma` |
| component | Page-view tracker | `components/analytics/AttributionTracker.tsx` |
| component | "How they found us" panel | `crm/components/LeadAttributionPanel.tsx` |
| component | Journey tab | `crm/components/LeadJourney.tsx` |
| job | None | |
| notification template | None | |

## Out of scope
- Other devices or browsers. HubSpot treats a missing cookie as a new visitor. Clearing site data starts a new history.
- A report of people who browsed and never enquired. HubSpot keeps that anonymous until a form or tracked email identifies them. That traffic report is a different product.
- Filling history for leads already stored. Those enquiries never sent earlier visits.
- A consent banner. User chose to store the journey for every visitor.
- Phone-call attribution, the search query, and the prompt typed into an AI assistant.

## Invariants
- Original channel, referrer, landing URL, and first-seen time are taken from the earliest visit and are not updated when the same lead enquires again — `recordLeadAttribution` writes those columns only on create.
- Each visit's channel is classified on the server from that visit's referrer and landing URL — `classifyChannel`.
- A stored journey is at most 20 visits, 50 pages, and 180 days — `applyPageView` in the browser and `buildIncomingTouch` in the API.
- A visit already stored on the lead is not counted again — `buildIncomingTouch` drops a repeat `startedAt` + landing URL.
- The same form submission (`name`, `path`, `submittedAt`) is stored once — `buildIncomingTouch`.
- A bad attribution payload never blocks the lead — try/catch in `recordLeadAttribution`.
- Only website intake sources get a journey — `WEBSITE`, `WEBSITE_CONTACT_FORM`, `PARTY_WALL_TOOL`.
- Reading a lead's journey uses the existing lead-access roles on `GET /leads/:id`. No new route.

## Actors
- Visitor — browses the marketing site and submits a form.
- Sales / ops staff — open the lead, read the panel, open the Journey tab.
- Admin — reads the existing channel report. Original source now means the earliest visit.
- System — browser stores visits; intake classifies and stores them.

## Actor × lifecycle grid
| Stage | Visitor | Staff | Admin | System |
|---|---|---|---|---|
| Create/configure | Each page view is appended to the visit history in this browser | N/A — nothing to configure | N/A | Session gap is 30 minutes; a new external referrer or campaign on a fresh load starts a visit |
| Publish/enable | Always on for marketing pages | N/A | N/A | Tracker already mounted in `MarketingSiteChrome` |
| Discover/access | N/A — visitors do not see their own log | Panel shows original source, page count, visit count when there was an earlier visit, and latest source when it differs. Journey tab lists each visit | Channel report uses the earliest visit's channel | N/A |
| Act/submit | Submits a wired form. The payload includes every stored visit | N/A | N/A | Next route forwards `attribution`. API validates, classifies, stores |
| Confirm/deliver | Existing thank-you / success UI | Panel and Journey show Monday and Friday | N/A | After a successful submit the browser history is cleared so the next enquiry records only what happens next |
| Use/fulfil/verify | N/A | Open a landing link from a visit. Compare original and latest | Compare channels. A Monday Google visit counts as organic search even if Friday was direct | N/A |
| Modify/revoke | Clearing site data drops the history that has not been submitted | N/A — staff cannot edit the journey | N/A | Repeat enquiry appends a touch and does not change original source |
| Close/expire | Visits older than 180 days are dropped. History is cleared after a successful enquiry | Lead delete still cascades attribution | N/A | `onDelete: Cascade` unchanged |
| Reconcile/report | N/A | Leads with no payload still show the existing empty state | Existing "Leads by channel" table. No new report | N/A |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Browser history | empty | Nothing until the next page view | First `recordPageView`, or `clearAttribution` after a successful submit | N/A |
| Browser history | recording | Not shown to the visitor | Page views append; a 30-minute gap or a new external arrival starts a visit | N/A |
| Browser history | expired | Those visits are gone | `applyPageView` drops visits older than 180 days | N/A |
| LeadAttribution | absent | Existing empty state on the panel and Journey tab | Partner, manual, or a payload the API rejected | Journey lists nothing |
| LeadAttribution | one visit | Panel without a visits row. Journey is a single visit, as before | Enquiry whose history is only the current visit | N/A |
| LeadAttribution | several visits | Panel "Visits" when there are more visits than enquiries. "Latest visit" when that source differs. Journey lists each visit; the form sits on the last visit of that enquiry | Intake of a payload with more than one visit | N/A |
| LeadAttribution | repeat enquiry | Panel "Enquiries". Journey groups visits under Enquiry 1, Enquiry 2 | Another website intake for the same lead | Original columns stay |

## Table-stakes (build)
- [x] Browser keeps every visit (referrer, landing URL, pages, times) across reloads, tabs, and later days — Visitor — `lib/attribution-session.ts`, `lib/attribution.ts`
- [x] A new visit starts after 30 minutes away, or when a fresh page load arrives from a different external site or campaign — Visitor — `lib/attribution-session.ts`
- [x] History is capped at 20 visits, 50 pages, and 180 days, and the earliest landing page is kept — Visitor and System — `lib/attribution-session.ts`, `api/src/services/attribution/record.ts`
- [x] All four forms send the full history and clear it only after the enquiry is accepted — Visitor — `components/common/ContactForm.tsx`, `fragments/homebuyer/BookingForm.tsx`, `components/homebuyer/BookingModal.tsx`, `fragments/partywall/PartyWallNoticeForm.tsx`
- [x] API accepts the visit list and the previous single-visit payload — System — `api/src/services/attribution/record.ts`
- [x] Original source columns come from the earliest visit and stay fixed — System — `api/src/services/attribution/record.ts`
- [x] Panel shows visit count and latest source — Staff — `crm/components/LeadAttributionPanel.tsx`
- [x] Journey lists each visit, with the form on the visit that submitted it — Staff — `crm/components/LeadJourney.tsx`
- [x] Cookie policy names the `rc_journey` browser store — Visitor — `app/(marketing)/cookie-policy/CookiePolicyClient.tsx`

## Optional — user answered
- Consent banner — NO. Store the journey for every visitor.
- A count on Analytics of leads who visited more than once before enquiring — not asked, easy to add later
- Letting staff correct the original source by hand — not asked, easy to add later

## Acceptance walkthrough
### Visitor
1. Open a marketing page from an external referrer. Reload, then open another page on the site. The browser store `rc_journey` contains one visit and both pages.
2. With a visit whose last page is older than 30 minutes already in `rc_journey`, load the site again. The store contains two visits. The first visit's referrer is unchanged.
3. Submit a wired form and get the existing success state. `rc_journey` is cleared. A failed submit leaves the history in place.

### Staff
1. Open a lead created from a Monday Google visit and a Friday direct enquiry. "How they found us" shows Organic search · Google, Monday's landing page, Visits 2, and Latest visit Direct.
2. Open Journey. Monday's pages are listed under the Google visit. Friday's pages and the form are listed under the direct visit.
3. Open a lead with one visit. The panel has no Visits row. Journey is a single visit.
4. Open a PinLocal lead. The panel still says there is no website journey.

### Admin
1. Analytics "Leads by channel" counts the lead under the earliest visit's channel.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| Page-view recorder | `recordPageView(` | `components/analytics/AttributionTracker.tsx:11` `recordPageView();` mounted from `components/layout/MarketingSiteChrome.tsx:14` `<AttributionTracker />` | Every marketing page |
| Journey payload on submit | `getAttribution(` | `components/common/ContactForm.tsx:90`, `fragments/homebuyer/BookingForm.tsx:176`, `components/homebuyer/BookingModal.tsx:188`, `fragments/partywall/PartyWallNoticeForm.tsx:262` | The four website forms |
| Clear history after success | `clearAttribution(` | `ContactForm.tsx:94`, `BookingForm.tsx:184`, `BookingModal.tsx:196`, `PartyWallNoticeForm.tsx:267` | The four website forms, only after `res.ok` |
| Save journey | `recordLeadAttribution(` | `api/src/services/leadIntake.ts:335` (repeat enquiry), `:386` (new lead) | Intake (non-UI). No new route |
| Visit count and latest source | `attribution.visitCount` / `attribution.latestChannel` | `crm/components/LeadAttributionPanel.tsx:80`, `:83` | Lead page `LeadDetail.tsx:1108` and embedded profile `EmbeddedLeadProfile.tsx:355` |
| Per-visit journey | `<LeadJourney` | `crm/components/LeadDetail.tsx:1317` | Journey tab. `LeadJourney.tsx` reads `touch.visits` |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error — no new control. Existing submit buttons still show their own success and error. History is cleared only after `res.ok`.
- [x] New controls follow VISUAL_FEEDBACK.md — no new control. The journey is read-only.
- [x] Analog-flow table filled from fetched URLs or user screenshot (Entry / Land / Next). Discover/access matches it. Not an in-repo dump page the analog does not use for this class.
- [x] Design analog table filled (chrome, columns, land canvas, preview, density). Shipped UI matches those regions. Summary stays on the existing panel; each visit is its own block on the Journey tab.
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface — no new route. `GET /leads/:id` keeps the existing lead-access roles. The public forms are the existing intake sources.
- [x] All table-stakes ticked with paths
- [x] All YES answers ticked with paths — the only optional answer was no consent banner
- [x] Empty / error / expired / unauthorized states are intentional
- [x] New tables/migrations, permissions, env, jobs registered where this repo registers them — none. Visits live in the existing `touches` JSON.
- [x] typecheck / lint / build / tests run (commands from stack card) — `npx tsc --noEmit` at the repo root and in `api/` passed. eslint on the edited files passed. `npx vitest run src/services/attribution/record.test.ts` passed (9). `npx tsx --test lib/attribution-session.test.ts` passed (10).
- [x] Browser walkthrough done for the visitor store on `http://localhost:3005`: one visit gained a second page on `/contact`; a stored Monday Google visit stayed, and a later load of `/contact` became a second visit. Cookie policy shows `rc_journey`. Could not click the CRM Journey tab: that needs a lead created by a real enquiry, and submitting the form would write a production lead.

## Intentionally skipped
- Analytics breakdown of multi-visit leads — the lead record is the place staff read the history. A report can be added later.
- Manual correction of original source — unchanged from the attribution feature.
