import { config } from "@/config/api";
import { NextResponse } from "next/server";

const CRM_INTAKE_URL = `${config.crmApiUrl.replace(/\/$/, "")}/intake/leads/WEBSITE_CONTACT_FORM`;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const reference = `contact-${Date.now()}-${String(body.email ?? "unknown").toLowerCase()}`;

    const payload = {
      reference,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || undefined,
      message: body.message,
      marketingOptIn: false,
    };

    console.log("📩 Contact form → CRM payload:", JSON.stringify(payload, null, 2));

    const res = await fetch(CRM_INTAKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log("📬 CRM intake response:", res.status, responseText);

    if (!res.ok) {
      return NextResponse.json({ success: false }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Contact form CRM intake error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
