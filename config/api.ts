/** Backend origin for Next.js rewrites (`next.config.ts`). */
export function crmApiOrigin(): string {
    const raw =
        process.env.CRM_API_URL ||
        process.env.NEXT_PUBLIC_CRM_API_URL ||
        "http://localhost:4000/api/v1";

    if (raw.startsWith("/")) {
        return "http://localhost:4000";
    }

    const trimmed = raw.replace(/\/$/, "");
    return trimmed.replace(/\/api\/v1$/, "") || "http://localhost:4000";
}

/**
 * Full `/api/v1` base for server-side route handlers (booking, enquiry, etc.).
 * In dev, `CRM_API_URL` is often the backend origin only (`http://localhost:4000`)
 * while `NEXT_PUBLIC_CRM_API_URL` is the browser proxy path (`/api/v1`).
 */
export function crmApiV1Url(): string {
    const publicUrl = process.env.NEXT_PUBLIC_CRM_API_URL;
    const origin = crmApiOrigin();

    if (publicUrl?.startsWith("/")) {
        return `${origin}${publicUrl}`.replace(/\/$/, "");
    }

    const candidate =
        process.env.CRM_API_URL ||
        publicUrl ||
        "http://localhost:4000/api/v1";

    if (candidate.startsWith("/")) {
        return `${origin}${candidate}`.replace(/\/$/, "");
    }

    const trimmed = candidate.replace(/\/$/, "");
    return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

export const config = {
    enquiryWebhook: process.env.ENQUIRY_WEBHOOK_URL,
    crmApiUrl: crmApiV1Url(),
    wordpressGraphQL: process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL,
};