# Third-party lead webhooks

How to connect **Konnect You (CMM)** (formerly Compare My Move), **Pinlocal**, and **ReallyMoving** to the Rosecrest CRM API.

Production API base URL: `https://api.rosecrestgroupltd.co.uk` (`APP_PUBLIC_URL` on Railway — no trailing slash).

---

## Konnect You (CMM)

Formerly Compare My Move. The intake enum, webhook path, and env secret stay `COMPARE_MY_MOVE` so partner config does not change.

Surveying referrals: home-buyer, building, valuation, and snagging leads all use the **same** webhook URL.

### What you give Konnect You / CMM

| Item | Value |
|------|--------|
| **Webhook URL** | `https://api.rosecrestgroupltd.co.uk/api/v1/intake/leads/COMPARE_MY_MOVE` |
| **Protocol** | HTTPS only |
| **Payload format** | **JSON** (recommended; XML is not handled by our API) |
| **Shared secret** | Optional — you can supply your own key, or ask CMM to generate one |

Configure this in **CMM Lead Manager → Settings → Webhook** (surveying).

### What you get from CMM

| Item | Where it goes |
|------|----------------|
| **Shared webhook secret** | API env: `COMPARE_MY_MOVE_WEBHOOK_SECRET` |

CMM signs each request with:

```
HMAC-SHA256(shared_secret, timestamp + token)
```

The signature is sent in the JSON body as `signature`, alongside `timestamp`, `token`, and `result` (lead details).

### API behaviour

- **Success:** HTTP `200` (required — CMM retries on any other success code)
- **Validation error:** HTTP `400`
- **Cancelled lead (`cancelled: "Yes"`):** HTTP `406` (CMM stops retrying)
- **Server error:** HTTP `500` (CMM retries up to 6 times)
- **Dedup key:** `result.quote_id`

### Checklist

1. Deploy the API with `APP_PUBLIC_URL=https://api.rosecrestgroupltd.co.uk`
2. Set `COMPARE_MY_MOVE_WEBHOOK_SECRET` to the key agreed with CMM
3. Register the webhook URL in CMM Lead Manager
4. Send a test lead from CMM and confirm it appears in **CRM → Leads** (source: Konnect You (CMM))
5. If signature fails, double-check the secret matches exactly — do not use the `token` field as the secret

---

## Pinlocal

### What you give Pinlocal

| Item | Value |
|------|--------|
| **Webhook URL** | `https://api.rosecrestgroupltd.co.uk/api/v1/intake/leads/PINLOCAL` |
| **Protocol** | HTTPS only |

**Important:** The URL registered with Pinlocal must match **character-for-character** what the API uses when verifying signatures. Set it explicitly in env:

```env
PINLOCAL_WEBHOOK_URL=https://api.rosecrestgroupltd.co.uk/api/v1/intake/leads/PINLOCAL
```

If `PINLOCAL_WEBHOOK_URL` is unset, the API derives the URL from `APP_PUBLIC_URL` — that derived value must still match what you registered with Pinlocal.

Pinlocal may send **multipart/form-data** or **JSON**. Both are supported.

### What you get from Pinlocal

| Item | Where it goes |
|------|----------------|
| **Webhook key** | API env: `PINLOCAL_WEBHOOK_SECRET` |

This comes from **Pinlocal partner settings** (not GoHighLevel or any other system).

Pinlocal signs each request with:

- Header: `X-Pinlocal-Signature`
- Algorithm: `HMAC-SHA1(webhook_key, signed_data)` → **base64**
- Signed data: webhook URL + `lead_id` + `lead_code` + `lead_type_id` + sorted `lead_data` fields (format differs slightly for multipart vs JSON)

### API behaviour

- **Success:** HTTP `200` (required — Pinlocal retries on other status codes)
- **Invalid signature:** HTTP `401`
- **Dedup key:** `lead_code` (falls back to `lead_id`)

### Checklist

1. Deploy the API with `APP_PUBLIC_URL=https://api.rosecrestgroupltd.co.uk`
2. Copy the webhook key from Pinlocal partner settings into `PINLOCAL_WEBHOOK_SECRET`
3. Set `PINLOCAL_WEBHOOK_URL` to the **exact** URL you register with Pinlocal
4. Register that same URL in Pinlocal
5. Send a test lead and confirm it appears in **CRM → Leads** (source: Pinlocal)

---

## ReallyMoving

ReallyMoving can **push** leads to your webhook (recommended) or you can **poll** their API (`GET https://api.reallymoving.com/v1/partners/leads`). This CRM intake handles the **webhook** path.

### What you give ReallyMoving

| Item | Value |
|------|--------|
| **Push URL** | `https://api.rosecrestgroupltd.co.uk/api/v1/intake/leads/REALLYMOVING` |
| **Protocol** | HTTPS only (valid SSL certificate) |
| **Send leads to webhook URL?** | **Yes** (partner admin → Notification of leads) |

Optionally restrict inbound API traffic by IP in the ReallyMoving partner admin (your Railway egress IP).

### What you get from ReallyMoving

| Item | Where it goes |
|------|----------------|
| **Partner API key** | API env: `REALLYMOVING_WEBHOOK_SECRET` |

The **same API key** used for REST API calls is used to sign webhooks.

ReallyMoving signs each POST with:

```
HMAC-SHA256(api_key, timestamp + token)
```

Auth fields are posted with the lead: `timestamp`, `token`, `signature`, plus flat lead fields (`MoverId`, `Name`, `Email`, `Property_Address`, `PreferredType`, etc.).

### Field mapping (surveys)

| ReallyMoving | CRM |
|--------------|-----|
| `MoverId` | Dedup key / `sourceRef` |
| `PreferredType: HomeBuyersReport` | RICS survey **Level 2** |
| `PreferredType: BuildingSurvey` | RICS survey **Level 3** |
| `PreferredType: NotSure` | Level 2 (noted in message) |
| `ValuationRequired: true` | Noted in lead message |
| `Quote_*_Total` | `quotedAmount` (based on preferred type) |
| `Comments` | Lead message |

### API behaviour

- **Success:** HTTP `200` (required — ReallyMoving retries on other codes/timeouts)
- **Rejected lead:** HTTP `406` (ReallyMoving stops retrying)
- **Validation error:** HTTP `400`
- **Server error:** HTTP `500` (retries: 10m, 10m, 15m, 30m, 1h, 2h, 4h)
- **Dedup key:** `MoverId`

### Checklist

1. Deploy the API with `APP_PUBLIC_URL=https://api.rosecrestgroupltd.co.uk`
2. Copy your **partner API key** from ReallyMoving partner admin into `REALLYMOVING_WEBHOOK_SECRET`
3. Set **Push URL** on the Notification of leads page and enable webhook delivery
4. Use ReallyMoving’s **Test** button on that page to send a sample lead
5. Confirm the lead appears in **CRM → Leads** (source: ReallyMoving)

### Polling (optional)

If you also want to pull leads via REST instead of (or as well as) webhooks:

```
GET https://api.reallymoving.com/v1/partners/leads?key=<API_KEY>
```

Polling is not required when webhooks are enabled — the intake endpoint above is sufficient for new leads.

---

## Environment variables (summary)

```env
# Public base URL of the API (Railway service URL)
APP_PUBLIC_URL=https://api.rosecrestgroupltd.co.uk

# Konnect You (CMM) — enum/path remain COMPARE_MY_MOVE
COMPARE_MY_MOVE_WEBHOOK_SECRET=<from CMM>

# Pinlocal
PINLOCAL_WEBHOOK_SECRET=<from Pinlocal partner settings>
PINLOCAL_WEBHOOK_URL=https://api.rosecrestgroupltd.co.uk/api/v1/intake/leads/PINLOCAL

# ReallyMoving (partner API key)
REALLYMOVING_WEBHOOK_SECRET=<from ReallyMoving partner admin>
```

In local development, signature verification is skipped when the relevant secret is unset (`NODE_ENV=development`).

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| CMM keeps resending the same lead | API not returning HTTP `200` on success, or signature mismatch |
| Pinlocal keeps resending | Same — must be `200`; or `PINLOCAL_WEBHOOK_URL` does not match the registered URL |
| ReallyMoving keeps resending | Same — must be `200`; or API key mismatch |
| `INVALID_SIGNATURE` in logs | Wrong secret/API key, or (Pinlocal only) webhook URL mismatch |
| Lead missing in CRM | Check **Settings → Integrations** in the CRM for failed webhook events; use replay if needed |

Webhook events are stored for 90 days and can be replayed from the CRM integrations admin.

---

## Generic Third-Party API

For partners not using pre-configured integrations (CMM, Pinlocal, ReallyMoving), we offer a generic API endpoint with API key authentication.

### Endpoint

```
POST https://api.rosecrestgroupltd.co.uk/api/v1/intake/leads/THIRD_PARTY
```

### Authentication

Partners receive a unique API key that must be included in the `X-API-Key` header.

### Registration

1. Admin creates a partner in **CRM → Settings → API Partners**
2. System generates unique API key (`rc_...`)
3. Leads appear in CRM with source `TP-partnername`

### Documentation

Full API documentation including required fields, optional fields, and example requests is available at:
- **CRM**: Settings → API Partners (admin) · public docs at `/crm/documentation`
- **API**: `GET /api/v1/intake/docs/third-party`

### Lead source format

All leads from the generic API appear with source `THIRD_PARTY` and a reference of `TP-{partner-slug}-{lead-id}`.
