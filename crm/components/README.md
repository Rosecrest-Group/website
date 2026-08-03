# CRM component library

Design system for `/crm/*`, matched to **MullrBank** (`MullrNew` locally). Use these inside CRM — not shadcn `@/components/ui/*` for new CRM UI.

## Layout (`crm/components/layout/`)

- **`CrmPageContent`**, **`CrmPageHeader`**, **`CrmSidebar`** — use on every CRM page
- `PageBody`, `PageTitle`, `DbPageLayout`, `ConditionalMenu`, `TopMenu`

## UI primitives (`crm/components/ui/`)

- **Containers:** `CurvedContainer`, `CrmPanel`, `Divider`, `VerticalDivider`
- **Forms:** `TextField`, `SelectField`, `SearchInput` (admin)
- **Typography:** `BodyHeading`, `BodySubtext`
- **Buttons:** `PrimaryButton`, `SecondaryButton`, `BackButton`
- **Data:** `Table`, `Pagination`, `StatusPill`, `ActionDropdown`
- **Other:** `Logo`, `ProfileDropdown`

## Admin (`crm/components/admin/`)

- `StatsCard`, `SearchInput`, `AdminSidebar`

## Theme

Tokens in `app/crm/crm.css` via Tailwind `@theme` (same as Mullr `apps/web/src/theme/tokens.css`):

- Brand: `bg-brand` / `text-brand` (`#6d28d9`)
- Ink: `text-ink`, `text-ink-muted`, `text-ink-subtle`
- Surfaces: `bg-surface`, `bg-sidebar` (`#f5f5f7`), `bg-canvas`
- Lines: `border-line`
- Font: Inter

Prefer Mullr utility names (`bg-brand`) over legacy `bg-(--color-primary)`.

## Sizing conventions

- Primary button: `rounded-lg px-4 py-1.5 text-sm`
- Panels / tables: `rounded-xl border border-line bg-surface`
- Table headers: `text-xs font-normal text-ink-subtle` (not filled navy)
- Badges / pagination: `rounded-full`
- Nav active: white chip + hairline shadow; icon in brand-muted tile
