# Feature: List import
**Class:** feature
**Statement:** A prospector on a list opens Import, brings in a spreadsheet of people, and those people (or their existing company, when the contact already belongs to one) show up on that list.
**Primary actor:** OPS, ADMIN, or SUPER_ADMIN (prospecting roles)
**Slice 1:** On a list, click Import, drop a CSV or paste rows, confirm the column map against the sample headers, complete the import, and see the new members on the list plus counts for added, already on the list, and rejected rows.
**Spec path:** docs/features/list-import.md

## Analog
| Item | Fill |
|---|---|
| Feature class | Import contacts into an existing static list |
| Products (named by user, or searched this session) | Mailchimp contact import. HubSpot single-object import and past imports. The user did not name a product. |
| URLs fetched this session | https://mailchimp.com/help/import-contacts-mailchimp/ . https://knowledge.hubspot.com/import-and-export/understand-the-import-tool . https://knowledge.hubspot.com/import-and-export/import-records-for-a-single-object . https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports |
| Default capabilities | File upload. Paste from a spreadsheet. Sample file so columns are obvious. Required identifier. Auto-match columns. Skip unmatched columns. Preview of cell values. Do not blank existing fields. Duplicate rows do not double-add. Finish review with added, already there, and errors. Error rows you can download. Undo the memberships that import added. A history of imports for this list. |
| Analog flow — Entry | Mailchimp: Audience, then Add contacts, then Import contacts, while you are already in that audience. Cite https://mailchimp.com/help/import-contacts-mailchimp/ |
| Analog flow — Land | An empty dropzone for this list only. Other lists, campaigns, and Find Firms are not on this screen. Cite the same Mailchimp article (Upload a file, drag and drop). |
| Analog flow — Next | Upload CSV/TXT or paste. Map columns, with the first values visible. Confirm. Complete. The summary shows added, already on the list, and errors. Cite https://mailchimp.com/help/import-contacts-mailchimp/ and https://knowledge.hubspot.com/import-and-export/import-records-for-a-single-object |

## Design analog
Required when Browser UI is yes. Fill from DESIGN.md. Map analog structure onto this repo's theme tokens.

| Region | Analog (not this repo) |
|---|---|
| Chrome | Back to the list, title Import, primary Complete import, secondary Cancel / Sample CSV. On the list page, Import sits in the header beside Export. Cite Mailchimp import steps and HubSpot Finish import. |
| Columns | One work column. Match step is a full-width table (file column, preview values, field dropdown including Don't import). Not a stacked card of text fields. Cite HubSpot map-columns table. |
| Land canvas | Empty dropzone until a file or paste exists. After complete, a summary of counts and an errors table. |
| Preview | The first values of each column stay visible on the match step. Not a toolbar toggle. Cite HubSpot Preview Information. |
| Density | One primary column, stepped. The map is a table. |

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | HTTP `api` client in `crm/lib/api.ts` |
| Where new actions are registered | `api/src/routes/prospecting.ts` |
| UI layer(s) | CRM web app (`app/crm`, `crm/`) |
| Where navigation lives | List detail header. Import route `app/crm/email-campaigns/lists/[id]/import/page.tsx`. Lists nav already in `crm/lib/constants.ts`. |
| typecheck / lint / build / test commands | `npx tsc --noEmit` (root + `api/`); `npm run lint`; `npm test --prefix api` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | List detail, export, members | `app/crm/email-campaigns/lists/[id]/page.tsx`, `api/src/routes/prospecting.ts` |
| action/route | Add person or their company; skip with no email and no phone | `api/src/services/prospecting/contactLists.ts` |
| table/model | ContactList, ContactListMember, Customer | `api/prisma/schema.prisma` |
| component | CrmPageHeader, Table, PrimaryButton, SecondaryButton, ConfirmModal | `crm/components/` |
| job | None | |
| notification template | None | |

## Out of scope
- A CRM-wide importer (Contacts index, Companies index, or a Data Integration home)
- Creating companies, or looking them up on Companies House, from the file
- Overwriting contact fields that already have a value
- XLSX. Paste covers sheets. Mailchimp’s file import is CSV or TXT
- Tags, groups, SMS, subscription-status management, and connected apps
- An email when the import finishes
- Active or smart lists

## Invariants
- A contact or company is a member of a list at most once — existing unique `(listId, customerId)` and `(listId, accountId)`
- A row with no usable email and no phone never becomes a member — `collapseImportRows` in `listImport.ts`
- Import does not blank or replace existing customer name, phone, or company — fill-blank updates in `importContactsToList`
- Undo deletes only membership rows recorded for that import — `ContactListImportMember`, not a customer delete
- Only prospecting roles can import or undo — `requireExactRoles` on `prospectingRouter`
- Submitting the same people twice does not create a second membership — those unique constraints
- Complete import requires `expectEmail: true` — request schema on `POST /lists/:id/import`

## Actors
- OPS/ADMIN/SUPER_ADMIN — Import on the list they already have open
- FINANCE/READ_ONLY — cannot open email campaigns; server still rejects the routes
- End consumer / field operator — N/A: office CRM
- System — N/A: no job. Campaign send already reads list members

## Actor × lifecycle grid
| Stage (in this feature's terms) | Prospector | Directory reader | System |
|---|---|---|---|
| Create/configure | Choose a file or paste, map columns, confirm consent | N/A — cannot open the screen | N/A |
| Publish/enable | Complete import | N/A | N/A |
| Discover/access | Import on the list header; empty dropzone for this list only | N/A — path blocked | N/A |
| Act/submit | Complete import sends mapped rows | N/A | N/A |
| Confirm/deliver | Button shows Imported; summary counts; toast | N/A | N/A |
| Use/fulfil/verify | Open the list and see the new members | N/A | Send already uses members |
| Modify/revoke | Undo removes memberships this import added | N/A | N/A |
| Close/expire | N/A — an import does not expire | N/A | N/A |
| Reconcile/report | Past imports: added, already on list, errors, error file | N/A | N/A |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Import screen | empty | Dropzone, no map table | File or paste with rows | Complete import |
| Import screen | mapped | Match table and preview | Complete import | A second complete until the file or map changes |
| ContactListImport | completed | Summary and past imports | POST import | Undo still available |
| ContactListImport | undone | Past imports shows Undone | Undo | Undo again is a no-op |
| Row | rejected | Errors table and error CSV | No email and no phone, or a directory address with no phone | Not a member |

## Table-stakes (build)
- [x] Import on the list header — prospector — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- [x] Import screen with empty dropzone, file, and paste — prospector — file: `crm/components/email-campaigns/ListImport.tsx`
- [x] Sample CSV with First name, Last name, Email, Phone, Company — prospector — file: `crm/lib/listImportFile.ts`
- [x] Auto-match, remap, Don't import, preview values — prospector — file: `crm/components/email-campaigns/ListImport.tsx`
- [x] Consent checkbox required — prospector — file: `ListImport.tsx`, `api/src/routes/prospecting.ts`
- [x] Commit rows, match existing contacts, fill blanks only, company membership when the contact already has one — prospector — file: `api/src/services/prospecting/listImport.ts`
- [x] Summary, error download, past imports, undo — prospector — file: `ListImport.tsx`, `listImport.ts`
- [x] Empty, too large, wrong file type, unauthorized — all — file: `listImportFile.ts`, `app.integration.test.ts`

## Optional — user answered
- [x] Sample CSV — YES (asked before build) — file: `crm/lib/listImportFile.ts`
- XLSX, CRM-wide import, overwrite existing values, email when finished — not asked, easy to add later

## Acceptance walkthrough
### Prospector
1. Open a list and click Import. The screen is an empty dropzone for that list.
2. Click Sample CSV. A file downloads with First name, Last name, Email, Phone, and Company.
3. Drop that file (or paste the rows). The match table shows those columns and the sample values, already mapped.
4. Check the consent box and click Complete import. The button shows Importing, then Imported, and the summary counts appear.
5. Open the list. The imported contact is on it.
6. Import the same file again. The summary says they were already on the list.
7. Undo the first import. The membership it added is gone. The contact remains in the CRM.

### Wrong actor
1. Unauthenticated POST `/api/v1/prospecting/lists/:id/import` is 401.
2. Unauthenticated POST undo is 401.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| POST /prospecting/lists/:id/import | `api.importContactList` | `crm/components/email-campaigns/ListImport.tsx`: `const importedRow = await api.importContactList(id, {` | List import screen |
| GET /prospecting/lists/:id/imports | `api.listContactListImports` | `crm/components/email-campaigns/ListImport.tsx`: `api.listContactListImports(id)` | List import screen |
| POST /prospecting/lists/:id/imports/:importId/undo | `api.undoContactListImport` | `crm/components/email-campaigns/ListImport.tsx`: `const outcome = await api.undoContactListImport(id, undoTarget.id);` | List import screen |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error
- [x] New controls follow VISUAL_FEEDBACK.md (result on the control, allowed motion only, toast is extra)
- [x] Analog-flow table filled from fetched URLs or user screenshot (Entry / Land / Next). Discover/access matches it. Not an in-repo dump page the analog does not use for this class.
- [x] Design analog table filled (chrome, columns, land canvas, preview, density). Shipped UI matches those regions. Fail if analog is multi-column / always-on preview / empty canvas and code is a stacked form or a toolbar preview toggle.
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface
- [x] All table-stakes ticked with paths
- [x] All YES answers ticked with paths
- [x] Empty / error / expired / unauthorized states are intentional
- [x] New tables/migrations, permissions, env, jobs registered where this repo registers them
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired. API and root `tsc` passed. `listImport.test.ts` and `app.integration.test.ts` passed (25). ESLint on the touched files: 0 errors. Full `npm run build` not run.
- [x] Browser walkthrough done, or "could not click: CRM was not running, and the list page requires sign-in. Sample CSV parse was checked with tsx: headers auto-map to First name, Last name, Email, Phone, Company."

## Intentionally skipped
- XLSX — paste and CSV/TXT cover the analog file import
- Creating B2B accounts from the file — a different product from adding people to this list
- Overwriting existing contact fields — fill blanks only
- Email when the import finishes — the summary is on the screen
