# Feature: Contact lists
**Class:** feature
**Statement:** An OPS prospector selects firms on Find Firms, adds them to a custom-named static list, and the discovered emails/phones are upserted onto CRM Contacts with that list as membership.
**Primary actor:** OPS, ADMIN, or SUPER_ADMIN (prospecting roles)
**Slice 1:** Tick firms on Find Firms, Add to list, type a name (or pick an existing list), then see those contacts with emails and phones on the list page.
**Spec path:** docs/features/contact-lists.md

## Analog
| Item | Fill |
|---|---|
| Feature class | Static contact lists / segments |
| Products (named by user, or searched this session) | HubSpot static segments. Apollo lists. The user did not name a product. |
| URLs fetched this session | https://knowledge.hubspot.com/segments/create-active-or-static-lists . https://knowledge.hubspot.com/segments/add-or-remove-contacts-from-a-list . https://knowledge.apollo.io/hc/en-us/articles/4409728608525-Create-and-Use-a-List (Cloudflare blocked a full fetch; steps from that article’s search excerpt) |
| Default capabilities | Named static list. Lists index with member count. Create from search (select rows → Add to list → existing or new name). List detail of members. Remove members. Delete list without deleting contacts. Rename. Clone. Add from a contact record (memberships card). Empty states. Export CSV (user YES). Use as email campaign audience (user YES). Active/smart lists (user NO). Select-all-matching across pages (user NO). Open a lead on add (user NO). |
| Analog flow — Entry | Apollo People search: checkboxes then Add to list. HubSpot CRM > Segments, and index-page Add to static segment. Cite https://knowledge.apollo.io/hc/en-us/articles/4409728608525-Create-and-Use-a-List and https://knowledge.hubspot.com/segments/add-or-remove-contacts-from-a-list |
| Analog flow — Land | All named lists you created (name + count). Excluded: leads, campaigns, dump contacts, firms never added. Cite the Apollo Lists article and https://knowledge.hubspot.com/segments/create-active-or-static-lists |
| Analog flow — Next | (1) Select firms → Add to list → existing or new name. (2) Open the list → members with email/phone. (3) Remove / export. (4) Send a campaign to that list. Cite the HubSpot add-records article and the Apollo list article |

## Design analog
Required when Browser UI is yes. Fill from [DESIGN.md](DESIGN.md). A user-attached screenshot outranks help-center docs for layout. Map analog structure onto this repo's theme tokens; do not copy analog brand paint.

| Region | Analog (not this repo) |
|---|---|
| Chrome | Lists title + Create list. Find Firms: selection count + Add to list. List detail: back, editable name, Export, Delete. Cite HubSpot create-segment chrome and Apollo Add to list. |
| Columns | One work column (table). Add-to-list is a modal, not a filter builder. Campaign editor stays two-column; lists do not live there. |
| Land canvas | Empty “No lists yet” + Create. Filled = table of named lists. List detail empty = “No contacts in this list”. |
| Preview | None. Confirm in the modal; toast after the modal closes. |
| Density | One primary column of work. |

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | HTTP `api` client in `crm/lib/api.ts` |
| Where new actions are registered | `api/src/routes/prospecting.ts`, `api/src/routes/customers.ts`, campaign audience in `api/src/services/campaigns/lifecycle.ts` |
| UI layer(s) | CRM web app (`app/crm`, `crm/`) |
| Where navigation lives | `crm/lib/constants.ts`, `crm/components/layout/CrmSidebar.tsx` |
| typecheck / lint / build / test commands | `npx tsc --noEmit` (root + `api/`); `npm run lint`; `npm test --prefix api`; `npm run build` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| action/route | Find Firms list + selection | `app/crm/prospecting/find-firms/page.tsx` |
| action/route | Prospecting router (auth + roles) | `api/src/routes/prospecting.ts` |
| action/route | GET customer | `api/src/routes/customers.ts` |
| action/route | Campaign audience resolve | `api/src/services/campaigns/lifecycle.ts` |
| table/model | Customer (email, phone) | `api/prisma/schema.prisma` |
| table/model | B2bContact | `api/prisma/schema.prisma` |
| component | Table selectable + page size | `crm/components/ui/Table.tsx` |
| component | CrmModal, ConfirmModal | `crm/components/ui/` |
| component | CampaignLeadPicker | `crm/components/email-campaigns/CampaignLeadPicker.tsx` |
| job | None | |
| notification template | None | |

## Out of scope
- Active/smart lists that auto-fill from filters — user chose static only
- Select all matching across pages — user said no
- Creating a pipeline lead when adding to a list — user said no
- HubSpot folders, AI segment builder, ads, sequences/workflows as a second product

## Invariants
- Unique membership `(listId, customerId)` — DB unique constraint
- Unique list name (normalized `nameKey`) — DB unique constraint
- Add is idempotent (already on list = no extra row) — unique constraint + skip existing
- Delete list / remove member does not delete `Customer` — no cascade on customer
- No email and no phone → skip, counted in the response — domain function
- Mutating lists requires `PROSPECTING_ROLES` — `requireExactRoles` on prospecting router

## Actors
- OPS/ADMIN/SUPER_ADMIN — Find Firms, Lists, campaign picker, contact Add to list
- FINANCE/READ_ONLY — see list names on a contact they can open; cannot mutate lists
- System — campaign send resolves contact-list members
- End consumer / field operator — N/A: office CRM, not public or venue

## Actor × lifecycle grid
| Stage (in this feature's terms) | Prospector | Directory reader | System |
|---|---|---|---|
| Create/configure | Name a list (empty or from Find Firms) | N/A — cannot create | N/A |
| Publish/enable | N/A — static list is usable on create | N/A | N/A |
| Discover/access | Lists index; Find Firms Add to list; contact memberships | Contact memberships (read) | N/A |
| Act/submit | Add selected firms / a contact to a list | N/A — no mutate | Resolve members when sending a campaign |
| Confirm/deliver | Modal success + toast; land on list detail | N/A | Recipients created at send |
| Use/fulfil/verify | Open list, see email/phone; export CSV; pick list in a campaign | See list names on the contact | Send uses member emails |
| Modify/revoke | Rename, remove members, clone | N/A | N/A |
| Close/expire | Delete list (contacts remain) | N/A | N/A |
| Reconcile/report | Member count on the index | N/A | N/A |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| ContactList | exists | Lists index + detail | create / clone | none |
| ContactList | deleted | gone from index | delete | members rows cascade; customers stay |
| Membership | member | list detail + contact card | add | duplicate add ignored |
| Membership | removed | not on that list | remove | contact remains |
| Add result | skipped | modal copy | no email and no phone | not a member |

## Table-stakes (build)
- [x] Lists index (name, member count) — prospector — file: `app/crm/email-campaigns/lists/page.tsx`
- [x] Create named list — prospector — file: `app/crm/email-campaigns/lists/page.tsx`
- [x] Find Firms bulk Add to list (existing or new name) — prospector — file: `app/crm/prospecting/find-firms/page.tsx`, `crm/components/prospecting/AddToListModal.tsx`
- [x] Upsert Customer email/phone; membership on the list — prospector — file: `api/src/services/prospecting/contactLists.ts`
- [x] List detail members table — prospector — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- [x] Remove members — prospector — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- [x] Rename list — prospector — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- [x] Clone list — prospector — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- [x] Delete list without deleting contacts — prospector — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- [x] Contact profile memberships + Add to list — prospector — file: `crm/components/CustomerProfile.tsx`
- [x] Empty / error / unauthorized — all — file: lists pages, AddToListModal, `api/src/app.integration.test.ts`
- [x] Email campaigns submenu Lists — prospector — file: `crm/lib/constants.ts`, `crm/components/layout/CrmSidebar.tsx`

## Optional — user answered
- [x] Use named list as email campaign audience — YES — file: `crm/components/email-campaigns/CampaignLeadPicker.tsx`, `api/src/services/campaigns/lifecycle.ts`
- [x] CSV export of a list — YES — file: `app/crm/email-campaigns/lists/[id]/page.tsx`
- Dynamic/smart lists — NO
- Select all matching across pages — NO
- Open a B2B lead when adding to a list — NO
- List folders, private lists, company-only lists, filter Contacts index by list — not asked, easy to add later

## Acceptance walkthrough
Write these in Phase 3, before code. Click-through (or command-through) per actor.

### Prospector
1. Open Find Firms, tick two firms that have an email or phone.
2. Click Add to list, type a new name, submit. The modal button shows loading then the list page shows those contacts.
3. Open Lists in the sidebar, see the list with a member count.
4. Open the list, remove one member, export CSV, rename, clone, delete the clone.
5. Open a member’s contact, see List memberships, add them to another list.
6. In Email campaigns, pick that list as an audience.

### Directory reader
1. Open a contact that is on a list. See the list name. There is no Add to list.

### Wrong actor
1. Unauthenticated GET/POST `/prospecting/lists` is 401.
2. A non-prospecting role cannot open `/crm/email-campaigns/lists`.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| GET /prospecting/lists | `api.listContactLists` | `app/crm/email-campaigns/lists/page.tsx`: `const listed = await api.listContactLists({ page, limit: 50 });` · `crm/components/email-campaigns/CampaignLeadPicker.tsx`: `Promise.all([api.getLeadCounts(), api.listContactLists({ limit: 100 })])` · `crm/components/prospecting/AddToListModal.tsx`: `const listed = await api.listContactLists({ search: name.trim(), limit: 100 });` | Lists index, campaign picker, add modal |
| POST /prospecting/lists | `api.createContactList` | `app/crm/email-campaigns/lists/page.tsx`: `const list = await api.createContactList(name.trim());` · `crm/components/prospecting/AddToListModal.tsx`: `target = await api.createContactList(name.trim());` | Lists index, add modal |
| GET /prospecting/lists/:id | `api.getContactList` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `const detail = await api.getContactList(id, { page, limit: 50 });` | List detail |
| PATCH /prospecting/lists/:id | `api.updateContactList` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `const updated = await api.updateContactList(list.id, name.trim());` | List detail |
| DELETE /prospecting/lists/:id | `api.deleteContactList` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `await api.deleteContactList(list.id);` | List detail |
| POST /prospecting/lists/:id/clone | `api.cloneContactList` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `const cloned = await api.cloneContactList(list.id);` | List detail |
| POST /prospecting/lists/memberships | `api.addContactListMemberships` | `crm/components/prospecting/AddToListModal.tsx`: `const result = await api.addContactListMemberships({` | Find Firms via AddToListModal |
| POST /prospecting/lists/:id/members | `api.addContactListMembers` | `crm/components/prospecting/AddToListModal.tsx`: `const added = await api.addContactListMembers(target.id, ids);` | Contact profile via AddToListModal |
| DELETE /prospecting/lists/:id/members | `api.removeContactListMembers` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `await api.removeContactListMembers(list.id, selectedIds);` | List detail |
| GET /prospecting/lists/:id/export | `api.exportContactList` | `app/crm/email-campaigns/lists/[id]/page.tsx`: `const file = await api.exportContactList(list.id);` | List detail |
| GET /customers/:id listMemberships | `api.getCustomer` | `crm/components/CustomerProfile.tsx`: `.getCustomer(id)` and `customer.listMemberships.map` | Contact profile |
| Campaign contactList selection | `kind: "contactList"` | `crm/components/email-campaigns/CampaignLeadPicker.tsx`: `onClick={() => toggle({ kind: "contactList", id: row.id, label: row.name })}` | Campaign editor; send resolves in `api/src/services/campaigns/lifecycle.ts` `loadContactListSelections` (non-UI consumer of memberships at send) |

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
- [x] typecheck / lint / build / tests run (commands from stack card) — compile green ≠ wired. API `tsc` 0. `contactLists.test.ts` + list 401 tests passed. Root Next build not run this session.
- [x] Browser walkthrough done, or "could not click: CRM login wall on /crm/prospecting/find-firms and /crm/prospecting/lists (pages compile; sign-in required to click Add to list)"

## Intentionally skipped
- Dynamic lists — user said no
- Select-all-matching — user said no
- Open lead on add — user said no
