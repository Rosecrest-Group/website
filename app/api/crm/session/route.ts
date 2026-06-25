import { NextResponse } from "next/server";

const SESSION_COOKIE = "crm_session";
const isProd = process.env.NODE_ENV === "production";

function sessionCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { rememberMe?: boolean };
  const rememberMe = body.rememberMe ?? true;
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "1", sessionCookieOptions(maxAge));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
