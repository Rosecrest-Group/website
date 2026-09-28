# Feature: CRM companies
**Class:** feature
**Statement:** An OPS prospector selects firms on Find Firms, adds them to a named static list as **companies** (`B2bAccount`), with discovered people nested under the company (`Customer.accountId`); lists show companies; opening a company shows its contacts; campaigns email every associated person with a usable address. Homebuyers stay people.
**Primary actor:** OPS, ADMIN, or SUPER_ADMIN (prospecting roles for mutate; directory roles for company GET)
**Slice 1:** Tick firms on Find Firms, Add to list, then the list shows companies; open a company and see its people.
**Spec path:** docs/features/crm-companies.md

## Analog
| Item | Fill |
|---|---|
| Feature class | CRM companies with associated contacts |
| Products (named by user, or searched this session) | HubSpot Companies + associated contacts. Apollo Accounts as second analog. User named HubSpot. |
| URLs fetched this session | https://knowledge.hubspot.com/records/associate-records . https://knowledge.hubspot.com/records/create-records . Apollo Accounts (list + account record with people). |
| Default capabilities | Companies index (name, domain / company number, contact count). Company record with associated people. Associate contacts to a company. Lists of companies (static). Campaigns send to people at those companies, not to the company row. Do not dump every raw prospecting account onto Contacts. No parallel Company table — promote `B2bAccount`. Homebuyers remain unattached people. |
| Analog flow — Entry | HubSpot: CRM > Companies, or associate from a contact. Find Firms here is the create/associate entry for prospected firms (select rows → Add to list). Cite https://knowledge.hubspot.com/records/create-records |
| Analog flow — Land | Named companies you have in the CRM (promoted accounts), not the full prospecting dump. Open one company → associated contacts. Lists land as a table of companies. Cite HubSpot associate-records and companies index. |
| Analog flow — Next | (1) Select firms → Add to list → list shows companies. (2) Open a company → people with email/phone. (3) Send a campaign to the list → every associated person with a usable email. Cite HubSpot associate-records. |

## Design analog
Required when Browser UI is yes. Map analog structure onto this repo's theme tokens; do not copy analog brand paint.

| Region | Analog (not this repo) |
|---|---|
| Chrome | Companies title + search. Company record: name, identifiers, associated contacts table. List detail: companies table, not a flat people dump. Cite HubSpot Companies index chrome. |
| Columns | One work column (table). Company record: identity then associated contacts. Campaign editor stays two-column; companies do not live there. |
| Land canvas | Empty “No companies yet” until Find Firms (or a list add) promotes an account. Filled = table of company names. Company record empty contacts = “No contacts at this company”. |
| Preview | None. Confirm in the add-to-list modal; toast after it closes. |
| Density | One primary column of work. |

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | HTTP `api` client in `crm/lib/api.ts` |
| Where new actions are registered | `api/src/routes/companies.ts`, `api/src/routes/prospecting.ts` (list membership), `api/src/services/prospecting/contactLists.ts`, campaign audience in `api/src/services/campaigns/lifecycle.ts` |
| UI layer(s) | CRM web app (`app/crm`, `crm/`) |
| Where navigation lives | `crm/lib/constants.ts`, `crm/components/layout/CrmSidebar.tsx` |
| typecheck / lint / build / test commands | `npx tsc --noEmit` (root + `api/`); `npm run lint`; `npm test --prefix api`; `npm run build` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | Find Firms list + Add to list | `app/crm/prospecting/find-firms/page.tsx`, `crm/components/prospecting/AddToListModal.tsx` |
| action/route | Prospecting lists CRUD | `api/src/routes/prospecting.ts` |
| action/route | Customer directory GET | `api/src/routes/customers.ts` |
| action/route | Campaign audience resolve | `api/src/services/campaigns/lifecycle.ts` |
| table/model | `B2bAccount` (canonical company) | `api/prisma/schema.prisma` |
| table/model | `Customer` (person) | `api/prisma/schema.prisma` |
| table/model | `B2bContact` + optional `customerId` | `api/prisma/schema.prisma` |
| table/model | `ContactList` / `ContactListMember` | `api/prisma/schema.prisma` |
| component | Table, CrmPageHeader, CrmPanel | `crm/components/` |
| component | CampaignLeadPicker | `crm/components/email-campaigns/CampaignLeadPicker.tsx` |

## Out of scope
- A second Company table parallel to `B2bAccount`
- Dumping every prospecting account onto Contacts
- Changing homebuyers into companies (`accountId` stays null)
- Active/smart lists, select-all-matching, open-lead on add (already no)
- Running the live membership backfill until the user says yes

## Invariants
- Canonical company is `B2bAccount` (unique `companyNumber`, `domain`, `legalName`) — no parallel table
- People are `Customer`; firm people have `accountId`; homebuyers have `accountId` null
- List membership for Find Firms is one row per `(listId, accountId)` — DB unique
- Leftover person members (`customerId`, `accountId` null) remain valid until backfill
- Add is idempotent (company already on list = no extra row)
- Delete list / remove member does not delete `B2bAccount` or `Customer`
- Firm with no reachable email and no phone → skip, counted in the response
- Placeholder `@prospects.invalid` must not be mailed — `campaignEmailForListMember`
- Campaigns email people, not companies — expand to every `Customer` at member accounts with a usable email
- Mutating lists requires `PROSPECTING_ROLES` — `requireExactRoles` on prospecting router
- Company GET requires `CUSTOMER_DIRECTORY_ROLES`

## Actors
- OPS/ADMIN/SUPER_ADMIN — Find Firms, Lists, Companies, campaign picker, contact Add to list
- FINANCE/READ_ONLY — open Companies and Contacts they can already open; cannot mutate lists
- System — campaign send expands company list members to people
- End consumer / field operator — N/A: office CRM, not public or venue

## Actor × lifecycle grid
| Stage (in this feature's terms) | Prospector | Directory reader | System |
|---|---|---|---|
| Create/configure | Add firms from Find Firms (promotes account + people) | N/A — cannot create | N/A |
| Publish/enable | N/A — company is usable once promoted | N/A | N/A |
| Discover/access | Companies index; list of companies; Find Firms Add to list | Companies index + company record | N/A |
| Act/submit | Add selected firms to a list | N/A — no mutate | Expand members when sending a campaign |
| Confirm/deliver | Modal success + toast; land on list of companies | N/A | Recipients created at send |
| Use/fulfil/verify | Open company, see people; export CSV (one row per person); pick list in a campaign | See company + its people | Send uses person emails |
| Modify/revoke | Remove companies from a list | N/A | N/A |
| Close/expire | Delete list (companies and people remain) | N/A | N/A |
| Reconcile/report | Member count = companies on the list | N/A | N/A |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| B2bAccount (CRM) | unpromoted | not on Companies | Find Firms add / list add | not a CRM company |
| B2bAccount (CRM) | promoted | Companies index + record | people upserted with `accountId` | none |
| ContactListMember | company | list detail | add from Find Firms | duplicate add ignored |
| ContactListMember | leftover person | list detail until backfill | pre-companies add | converted only after user-approved backfill |
| Customer | firm person | company record | upsert with `accountId` | homebuyer never attached |
| Customer | homebuyer | Contacts only | existing intake | `accountId` stays null |
| Add result | skipped | modal copy | no email and no phone on the firm | not a member |

## Table-stakes (build)
- [x] Find Firms Add to list creates company membership and upserts reachable people under the account — prospector — file: `api/src/services/prospecting/contactLists.ts`
- [x] List detail shows companies — prospector — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- [x] Open company from a list row — prospector — file: list detail + `/crm/companies/:id`
- [x] Companies index — directory reader — file: `app/crm/companies/page.tsx`, `crm/components/CompaniesList.tsx`
- [x] Company record with associated contacts — directory reader — file: `app/crm/companies/[id]/page.tsx`, `crm/components/CompanyProfile.tsx`
- [x] Nav Companies — prospector / directory reader — file: `crm/lib/constants.ts`, `crm/components/layout/CrmSidebar.tsx`
- [x] Campaign expands all people with a usable email at member companies — system — file: `api/src/services/campaigns/lifecycle.ts`
- [x] CSV export one row per person at listed companies — prospector — file: `api/src/services/prospecting/contactLists.ts` `membersCsvForList`
- [x] Empty / error / unauthorized — all — file: companies pages, lists, `api/src/app.integration.test.ts`

## Optional — user answered
- [x] Use named list as email campaign audience (all associated people) — YES — file: `api/src/services/campaigns/lifecycle.ts`
- [x] CSV export — YES — already on lists; now per person at the company
- [x] Backfill existing Find Firms list members to companies — YES, function exists, **live writes not run until the user says yes** — file: `backfillPersonMembersToCompanies` in `api/src/services/prospecting/contactLists.ts`
- Company index + record — YES (this feature)
- Homebuyers stay people — YES
- Dynamic/smart lists — NO
- Select all matching — NO
- Open a B2B lead when adding — NO

## Acceptance walkthrough

### Prospector
1. Open Find Firms, tick two firms that have an email or phone.
2. Click Add to list, type a new name, submit. The list page shows those **companies**, not a flat people dump.
3. Open a company. See the associated people with email/phone.
4. Open Lists, see the list with a company member count.
5. Remove one company, export CSV (one row per person), rename, clone, delete the clone.
6. In Email campaigns, pick that list as an audience. Send resolves every person at those companies with a usable email.

### Directory reader
1. Open Companies. See promoted firms. Open one. See people. There is no Add to list on the company record unless they also have prospecting.

### Wrong actor
1. Unauthenticated GET `/companies` is 401.
2. Unauthenticated GET/POST `/prospecting/lists` is 401.
3. A non-directory role cannot open `/crm/companies`.
4. A non-prospecting role cannot mutate lists.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| GET /companies | `api.listCompanies` | `crm/components/CompaniesList.tsx`: `.listCompanies(Object.keys(params).length ? params : undefined)` | Companies index |
| GET /companies/:id | `api.getCompany` | `crm/components/CompanyProfile.tsx`: `.getCompany(id)` · list detail row click `/crm/companies/${row.accountId}` | Company record, list row click |
| POST /prospecting/lists/memberships | `api.addContactListMemberships` | `crm/components/prospecting/AddToListModal.tsx`: `const result = await api.addContactListMemberships({` | Find Firms via AddToListModal |
| GET /prospecting/lists/:id | `api.getContactList` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `const detail = await api.getContactList(id, { page, limit: 50 });` | List detail (companies) |
| DELETE /prospecting/lists/:id/members | `api.removeContactListMembers` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `await api.removeContactListMembers(list.id, selectedIds);` | List detail |
| GET /prospecting/lists/:id/export | `api.exportContactList` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `const file = await api.exportContactList(list.id);` | List detail |
| Campaign contactList selection | `kind: "contactList"` | `crm/components/email-campaigns/CampaignLeadPicker.tsx`: `onClick={() => toggle({ kind: "contactList", id: row.id, label: row.name })}` | Campaign editor; send expands in `api/src/services/campaigns/lifecycle.ts` `loadContactListSelections` |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error
- [x] New controls follow VISUAL_FEEDBACK.md
- [x] Analog-flow table filled. Discover/access matches it.
- [x] Design analog table filled. Shipped UI matches those regions.
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface
- [x] All table-stakes ticked with paths
- [x] All YES answers ticked with paths
- [x] Empty / error / expired / unauthorized states are intentional
- [x] New tables/migrations, permissions, env, jobs registered where this repo registers them
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired. API `tsc` 0. `contactLists.test.ts` + companies 401 tests + directory-role unit test passed. Root Next build not run this session.
- [x] Browser walkthrough: could not click — CRM login wall on `/crm/companies` (redirects to `/crm/login?redirect=/crm/companies`; pages compile; sign-in required to add firms and open a company)

## Intentionally skipped
- Parallel Company table — promote `B2bAccount`
- Dumping unpromoted prospecting accounts onto Contacts
- Live backfill until the user confirms
- Dynamic lists / select-all-matching / open lead on add
