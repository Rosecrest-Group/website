import { cookies } from "next/headers";
import { cache } from "react";
import { crmApiV1Url } from "@/config/api";
import type { ApiUser } from "@/crm/types";

const ACCESS_TOKEN_COOKIE = "crm_access_token";
const REFRESH_TOKEN_COOKIE = "crm_refresh_token";

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

/** Authenticated CRM API fetch from a Next.js server component / route. */
export async function serverCrmFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!access) return null;

  const refresh = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const cookieHeader = [
    `${ACCESS_TOKEN_COOKIE}=${access}`,
    refresh ? `${REFRESH_TOKEN_COOKIE}=${refresh}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  const url = `${crmApiV1Url()}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as ApiResult<T>;
    if (!json.ok) return null;
    return json.data;
  } catch {
    return null;
  }
}

/** Deduped within a single RSC request (layout + page). */
export const getServerCrmUser = cache(() => serverCrmFetch<ApiUser>("/auth/me"));
