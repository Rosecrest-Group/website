# Feature: FCA Register (mortgage lane)
**Class:** feature
**Statement:** A sales reviewer searches mortgage-lane firms and sees an authorised FRN, status, permissions and appointed-representative count — not a Companies House “finance Ltd” shell.
**Primary actor:** Sales executive (OPS)
**Slice 1:** Find Firms with lane Mortgage lending + a firm name queues a run; the Register search resolves an FRN; standing writes `regulator.fca`; the review card shows an FCA panel.
**Spec path:** docs/features/fca-register.md

## Stack card
| Item | This repo |
|---|---|
| How UI talks to data | CRM `api` client → Express `/api/v1/prospecting/*` |
| Where new actions are registered | `api/src/connectors/fca.ts`, `persistFca.ts`, `runStandingChecks.ts`, `runOrchestrator.ts` |
| UI layer(s) | `/crm/prospecting/find-firms`, `/crm/prospecting/review/[id]`, Administration sources |
| Where navigation lives | `crm/lib/constants.ts` Prospecting section |
| typecheck / lint / build / test | website `npx tsc`; api `npm test` / `npx tsc -p tsconfig.build.json --noEmit` |
| Browser UI? | yes |

## Already exists
| Kind | Name | Path |
|---|---|---|
| source seed | `fca` | `api/src/services/prospecting/seedConfig.ts` |
| stub connector | Search URL, no auth | `api/src/connectors/registers.ts` (replaced) |
| models | `B2bAccount.regulatorIds`, `Network`, `AccountNetwork` | `api/prisma/schema.prisma` |
| standing | `runJsonRegulator("fca")` only if FRN already stored | `runStandingChecks.ts` |
| UI | Find Firms lane `mortgage_lending`; review standing chips | `find-firms/page.tsx`, review `[id]` |
| lane | SIC `641*` / `649*` → `mortgage_lending` | `upsertAccount.ts` |

## Out of scope
- Individuals, funds, passports, waivers, exclusions, controlled functions.
- Disciplinary-history ingest (noisy; not mortgage standing).
- Paid Register Extract Service bulk dump.
- Fetching every AR’s full firm record (rate limit 50/10s). Stub current ARs from `/AR` only (up to 3 pages). Previous/terminated ARs are ignored.
- Individuals / SMF staff ingest.
- Valuation products (hard exclusion stays at service config).

## Invariants
- Live Register calls require `FCA` (API key) and `FCA_EMAIL` (portal signup) — `isProviderConfigured("fca")`.
- A Companies House SIC hit alone cannot mark regulator standing clear for `mortgage_lending` — `shouldCheckFca` + `runFcaStanding`.
- Facts from this connector are authority tier 1; cancelled / no-longer-authorised status is `findings`.
- Search resolve for standing uses exact normalised name match within a cap (same as SRA/charity), not the first Search hit.
- Rate limit: sequential GETs; 429 → retry via existing `withRetries`.

## Actors
- Sales executive — Find Firms / review card
- Administrator — source row already seeded
- System — query discover + standing on CH-ingested mortgage accounts

## Actor × lifecycle grid
| Stage | Sales | Admin | System |
|---|---|---|---|
| Create/configure | N/A — source seeded | Toggle source | Seed `fca` |
| Publish/enable | N/A | Enable/disable | Skip when disabled or env missing |
| Discover/access | Find Firms, lane Mortgage lending | Admin sources | Search `type=firm`; weekly refresh standing |
| Act/submit | Approve/reject existing | N/A | Persist facts, FRN, AR network |
| Confirm/deliver | FCA panel on review card | N/A | `regulatorIds.fca` after match |
| Use/fulfil/verify | Standing check `fca` | N/A | Cancelled status → findings |
| Modify/revoke | N/A | Disable source | Facts supersede on refetch |
| Close/expire | N/A | N/A | TTL via existing fact chips |
| Reconcile/report | N/A | N/A | Run report `fca` count |

## States
| Entity | Status | Shown on | Transitioned by | Blocked while in it |
|---|---|---|---|---|
| Provider | configured / missing email | health | env | discover + standing no-op / `not_checked` |
| Firm status | Authorised vs cancelled | FCA panel | Register fetch | findings blocks green standing |

## Table-stakes (build)
- [x] Auth headers on every Register GET — system — `fca.ts`
- [x] Name→FRN search + Firm + current AR + permission keys + PPOB address — system — `fcaExtract.ts`
- [x] Mortgage-lane discover from Find Firms — sales + system — `runOrchestrator.ts`
- [x] Standing for mortgage accounts without a stored FRN — system — `runStandingChecks.ts`
- [x] Principal→AR network rows (cap 20 stubs) — system — `persistFca.ts`
- [x] FCA panel on review card — sales — review `[id]`
- [x] `FCA` + `FCA_EMAIL` in env schema — system — `env.ts`

## Optional — user answered
- Disciplinary history ingest — not asked, later
- Full AR firm refetch — not asked (rate limit)

## Acceptance walkthrough

### Sales executive
1. Set `FCA` and `FCA_EMAIL` (the email used at [the Register developer portal](https://register.fca.org.uk/Developer/s/)).
2. Find Firms → lane Mortgage lending → search a broker/lender name → start run.
3. Open the prospect card: FCA panel shows FRN, status, AR count; standing checks include `fca`.

### Administrator
1. Prospecting → Administration → source “FCA Register” remains listed.

### System
1. CH-ingested `mortgage_lending` account without FRN still runs Register name resolve on standing.

## Wiring audit
| Surface (action / route / op) | Identifier UI would use | Grep hits (paste lines) | Consumer (UI file or webhook/job) |
|---|---|---|---|
| POST start run | `api.startProspectingRun` | `await api.startProspectingRun("manual", { query: query \|\| undefined, lane: lane \|\| undefined });` | `app/crm/prospecting/find-firms/page.tsx` |
| GET card | `api.getProspectingCard` | `setCard(await api.getProspectingCard(id));` and `{card.fca ? (` | `app/crm/prospecting/review/[id]/page.tsx` |
| weekly/query job | `executeProspectingRun` / `discoverFromQuery` | `cursor.lane === "mortgage_lending"` | `api/src/services/prospecting/runOrchestrator.ts` (job) |

- [x] Every new surface has pasted UI grep hits (or a documented non-UI consumer)
- [x] Hits are not only in the server/API package, tests, or generated types
- [x] Every UI action hits a real surface with loading / success / error
- [x] Every status has a screen and a transition (or system-only, documented)
- [x] Every actor has an entry point
- [x] Wrong actor is rejected at server/policy on every new surface (existing prospecting router auth)
- [x] All table-stakes ticked with paths
- [x] Empty / error / expired / unauthorized states are intentional (`not_checked` when env incomplete)
- [x] typecheck / tests run
- [ ] Browser walkthrough done, or "could not click: <reason>"

## Intentionally skipped
- Individuals (`/Firm/{FRN}/Individuals`) — SMF/staff list is not the mortgage buyer.
- Official Address HTML page (JSON envelope is enough).
- Live Register Firm/122702 with `x-auth-email` / `x-auth-key` from env: HTTP 403, no `Status` field (not 200). Treat as documented skip until the portal accepts `rcms@rosecrestgroupltd.co.uk`.
