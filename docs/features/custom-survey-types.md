# Feature: Custom survey types
**Class:** feature
**Statement:** A CRM ops user adding a lead can create a new survey type; that type is stored on the lead and appears for every future new lead.
**Primary actor:** CRM ops (OPS / ADMIN / SUPER_ADMIN)
**Slice 1:** On New lead, choose Add new type, name it (for example “Snagging”), create the lead with it, open New lead again, and see Snagging listed with Level 1, 2, and 3.
**Spec path:** docs/features/custom-survey-types.md

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | CRM `api` client (`crm/lib/api.ts`) → Express `/api/v1/*` |
| Where new actions are registered | `api/src/app.ts` mounts routers; new `surveyTypesRouter` at `/survey-types` |
| UI layer(s) | CRM web (`/crm/leads/new`, lead list/detail); emails via merge fields |
| Where navigation lives | `crm/lib/constants.ts` sidebar; New lead is `/crm/leads/new` |
| typecheck / lint / build / test commands | website `npx tsc --noEmit`, `npm run lint`; api `npm test --prefix api` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | Create lead (DIRECT intake) | `POST /intake/leads/DIRECT` via `api.createLead` |
| action/route | Update / convert lead | `PATCH /leads/:id`, `POST /leads/:id/convert-to-job` |
| table/model | `Lead.surveyLevel`, `Job.surveyLevel` (Prisma enum) | `api/prisma/schema.prisma` |
| component | New lead survey dropdown | `crm/components/NewLeadForm.tsx` |
| component | Convert survey dropdown | `crm/components/LeadDetail.tsx` |
| constants | Built-in labels Level 1–3 + CPR-35 | `crm/lib/constants.ts` `SURVEY_LEVELS` |
| pattern | Catalog create-or-reuse | `GET/POST /tags` + `crm/components/LeadTags.tsx` |
| merge field | `{{lead.surveyType}}` | `api/src/services/messaging/mergeFields.ts` |
| job | None | |
| notification template | None (reuse existing quote templates; unknown levels fall back) | |

## Out of scope
- Public homebuyer booking stays Level 1–3.
- Partner / portal intake will not create custom types (adapters keep mapping to Level 1–3 / CPR-35).
- No Settings page for survey types (user chose no).
- No Add new on Move to paid (user chose no) — convert still *lists* existing types.
- Workflow “run only for this survey level” stays built-in levels only (user chose no).
- No Flexi-Fee / Stripe price bands for custom types (user chose no); quoted amount is manual.
- No per-type sample reports or SLA tables (unknown levels already fall back).

## Invariants
- Built-in slugs `LEVEL_1`, `LEVEL_2`, `LEVEL_3`, `CPR_35` cannot be renamed or archived — domain function + `isBuiltIn` on the row.
- Custom type labels are unique case-insensitively among all types (including archived); creating a duplicate returns the existing row (and un-archives it if archived) — domain function, same pattern as tags.
- A lead/job `surveyLevel` write must be a catalog slug that is not archived — domain function on intake, PATCH, and convert.
- Archived types stay on existing leads/jobs; they are hidden from New lead and convert pickers — `archivedAt` filter, not a delete.
- Custom types never resolve a Flexi-Fee — `quotedFeeIncVat` / `flexiFeeIncVat` already return null except LEVEL_1/2/3.
- Mutating the catalog requires OPS/ADMIN/SUPER_ADMIN — `requireRole` on POST/PATCH (GET is authenticated so surveyors can resolve labels).

## Actors
- CRM ops — `/crm/leads/new` and lead detail (same roles as create lead).
- Surveyor — job/lead read surfaces; cannot create types.
- Homebuyer — email merge fields only; does not create types.
- System — copies `surveyLevel` onto jobs at convert; partner intake unchanged.

## Actor × lifecycle grid
| Stage (in this feature's terms) | CRM ops | Surveyor | Homebuyer | System |
|---|---|---|---|---|
| Create/configure | Add new type from New lead (name + save) | N/A — cannot create types | N/A — public booking unchanged | N/A — partners do not create catalog rows |
| Publish/enable | Type is live org-wide as soon as created | N/A | N/A | Seed built-ins on migrate |
| Discover/access | New lead lists Level 1–3 + active custom types; convert lists all active catalog types | Sees type label on job/lead | N/A | GET `/survey-types` |
| Act/submit | Create lead with selected type | N/A | N/A | DIRECT intake stores slug; reject unknown/archived |
| Confirm/deliver | Lead list + detail show the label | N/A | N/A | Serialize slug; UI/catalog maps label |
| Use/fulfil/verify | Convert uses listed type; quotes still send | Job shows label | `{{lead.surveyType}}` uses catalog label | Job copies slug; pricing/SLA/sample-report fall back |
| Modify/revoke | Rename custom type; archive / restore from New lead manage | N/A | N/A | PATCH `/survey-types/:id`; built-ins rejected |
| Close/expire | Archive hides from pickers; existing leads keep the slug | N/A — still sees historical label | N/A | `archivedAt` set; no row delete |
| Reconcile/report | Analytics mix already groups by slug; label fallback | N/A | N/A | `bySurveyLevel` keys include custom slugs |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| SurveyType | active (`archivedAt` null) | New lead + convert pickers | Create; restore | — |
| SurveyType | archived | Manage list only; labels on old leads | Archive from manage | Cannot assign to new/updated leads |
| SurveyType | built-in | Pickers (New lead: Level 1–3; convert: all four) | Seed only | Cannot rename or archive |

## Table-stakes (build)
- [x] Add new type on New lead survey control — ops — file: `crm/components/SurveyTypeSelect.tsx`, `crm/components/NewLeadForm.tsx`
- [x] Persist catalog org-wide; next New lead lists it — ops — file: `api/src/routes/surveyTypes.ts`, `api/src/services/surveyTypes.ts`
- [x] Lead stores the slug; list + detail show the label — ops — file: `crm/components/LeadsList.tsx`, `crm/components/LeadDetail.tsx`
- [x] Convert / Move to paid *lists* active custom types (no Add new) — ops — file: `crm/components/LeadDetail.tsx`
- [x] Duplicate name reuses existing; empty name rejected — ops — file: `api/src/services/surveyTypes.ts`
- [x] Level 1–3 remain; custom types skip Flexi-Fee autofill — ops — file: `crm/lib/constants.ts` `flexiFeeIncVat`
- [x] Loading + error on add-type — ops — file: `crm/components/SurveyTypeSelect.tsx`
- [x] Wrong role rejected on create/rename/archive — ops — file: `api/src/routes/surveyTypes.ts` `requireRole("OPS", "ADMIN", "SUPER_ADMIN")`
- [x] Surveyor / emails show catalog label with existing unknown-level fallback — surveyor / homebuyer — file: `api/src/services/messaging/mergeFields.ts` `labelForSurveyLevel`

## Optional — user answered
- [x] Rename and archive (and restore) custom types from New lead, not a Settings page — YES — file: `crm/components/SurveyTypeSelect.tsx` manage modal
- Add new on Move to paid — NO
- Settings page to manage types — NO
- Workflow filters include custom types — NO
- Flexi-Fee / price bands for custom types — NO
- Filter leads list by survey type — not asked, easy to add later
- Analytics dedicated custom-type report — not asked, easy to add later

## Acceptance walkthrough
Write these in Phase 3, before code. Click-through (or command-through) per actor.

### CRM ops
1. Open `/crm/leads/new`. Survey level shows Level 1, 2, 3.
2. Choose Add new type, enter “Snagging”, save. Dropdown selects Snagging. Quoted amount is not auto-filled from Flexi-Fee (enter manually if needed).
3. Create the lead. Lead detail shows Snagging.
4. Open `/crm/leads/new` again. Snagging is in the list. Create another lead with it.
5. On the first lead, Move to paid lists Snagging (and Level 1–3 / CPR-35). Convert succeeds without forcing Level 2.
6. From New lead, open Manage types, rename Snagging to “Snagging survey”. Existing leads show the new label.
7. Archive “Snagging survey”. It disappears from New lead and convert. Existing leads still show the label. Restore brings it back.
8. Try Add new with blank name — rejected. Try “Level 2” — reuses the built-in, does not duplicate.

### Surveyor
1. Open a job whose lead used a custom type. The type label is readable (not a blank).

### Homebuyer
1. A quote/email for that lead renders `{{lead.surveyType}}` as the catalog label (e.g. “Snagging”), not a raw slug.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| GET /survey-types | `api.listSurveyTypes` | `crm/components/SurveyTypeSelect.tsx`: `const result = await api.listSurveyTypes({ includeArchived: true });` — `crm/components/LeadsList.tsx`: `.listSurveyTypes({ includeArchived: true })` — `crm/components/LeadDetail.tsx`: `.listSurveyTypes({ includeArchived: true })` | `SurveyTypeSelect.tsx`, `LeadsList.tsx`, `LeadDetail.tsx` |
| POST /survey-types | `api.createSurveyType` | `crm/components/SurveyTypeSelect.tsx`: `const created = await api.createSurveyType({ label: newLabel });` | `SurveyTypeSelect.tsx` (New lead) |
| PATCH /survey-types/:id | `api.updateSurveyType` | `crm/components/SurveyTypeSelect.tsx`: `await api.updateSurveyType(type.id, { label });` — `await api.updateSurveyType(type.id, { archived });` | `SurveyTypeSelect.tsx` manage modal |
| POST /intake/leads/DIRECT | `api.createLead` | `crm/components/NewLeadForm.tsx`: `const result = await api.createLead(payload);` | `NewLeadForm.tsx` |
| PATCH /leads/:id | `api.updateLead` | existing lead edit; surveyLevel now catalog slug | `EditLeadDetailsModal.tsx` (quote/name; survey via convert) |
| POST /leads/:id/convert-to-job | `api.convertLead` | `crm/components/LeadDetail.tsx`: `const result = await api.convertLead(id, amount, {` | `LeadDetail.tsx` Move to paid |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface
- [x] All table-stakes ticked with paths
- [x] All YES answers ticked with paths
- [x] Empty / error / expired / unauthorized states are intentional
- [x] New tables/migrations, permissions, env, jobs registered where this repo registers them
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired
- [x] Browser walkthrough done, or "could not click: <reason>"

Website `npx tsc --noEmit` fails on pre-existing `crm/components/ui/SlidingPaneTabs.tsx` (unrelated). API `npx tsc -p tsconfig.build.json --noEmit` passed. `npm test --prefix api`: 562 passed. Could not click: CRM/API dev servers were not running in this session.

## Intentionally skipped
- Add new type on Move to paid — user said no
- Settings page — user said no
- Workflow targeting of custom types — user said no
- Custom-type pricing catalogs — user said no
- Partner intake creating catalog rows — out of scope
- Public booking custom types — out of scope
