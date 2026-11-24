import { config } from "@/config/api";
import { NextResponse } from "next/server";

const CRM_CALL_CLICK_URL = `${config.crmApiUrl.replace(/\/$/, "")}/intake/website/call-click`;
const MAX_BODY_BYTES = 64 * 1024;

/**
 * A visitor pressed a phone number. Forwarded to the CRM, which links it to the Dialpad call
 * that follows. The visitor's browser has usually moved on to the dialer, so the answer is ignored.
 */
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const userAgent = req.headers.get("user-agent") ?? "";

  try {
    const res = await fetch(CRM_CALL_CLICK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        device: /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop",
      }),
    });
    if (!res.ok) {
      console.error("Call click → CRM failed:", res.status, await res.text());
      return new NextResponse(null, { status: 502 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Call click → CRM error:", error);
    return new NextResponse(null, { status: 502 });
  }
}
