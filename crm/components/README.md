# CRM component library

Design-system components ported from Remotah (`RemotahMain/web/components`). Use these inside CRM (`/crm/*`) — not shadcn `@/components/ui/*` for new CRM UI.

## Layout (`crm/components/layout/`)

- **`CrmPageContent`**, **`CrmPageHeader`**, **`CrmSidebar`** — use on every CRM page
- `PageBody`, `PageTitle`, `DbPageLayout`, `ConditionalMenu`, `TopMenu`

## UI primitives (`crm/components/ui/`)

- **Containers:** `CurvedContainer`, `CrmPanel`, `Divider`, `VerticalDivider`
- **Forms:** `TextField`, `SelectField`, `SearchInput` (admin)
- **Typography:** `BodyHeading`, `BodySubtext`
- **Buttons:** `PrimaryButton`, `SecondaryButton`, `BackButton`
- **Data:** `Table`, `Pagination`, `StatusPill`, `ActionDropdown`
- **Inputs:** `Toggle`, `CalendarInput`, `BankDropdown`, `CurrencyDropdown`
- **Other:** `Logo`, `ProfileDropdown`

## Admin (`crm/components/admin/`)

- `StatsCard`, `SearchInput`, `AdminSidebar`

## Auth (`crm/components/auth/`)

- `AuthLeftPanel`, `WelcomeModal` (Remotah copy; adapt copy/assets before use)

## Theme

CRM pages render inside `.crm-theme` (`CrmShell`). Tokens: `--color-primary`, `--color-tc-*`, `--color-nc-*` in `app/globals.css`.

## Assets

Status/BackButton icons: `/verify.svg`, `/hour-glass.svg`, `/timer.svg`, `/arrow-left.svg` in `public/`.
