import { config } from "@/config/api";
import { NextResponse } from "next/server";

const CRM_INTAKE_URL = `${config.crmApiUrl.replace(/\/$/, "")}/intake/leads/WEBSITE`;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const reference = `web-booking-${Date.now()}-${String(body.email ?? "unknown").toLowerCase()}`;
    const propertyAddress = [body.jobAddress, body.jobTown]
      .filter(Boolean)
      .join(", ");

    const quotedAmount =
      typeof body.surveyingFees === "number"
        ? body.surveyingFees
        : body.surveyingFees != null
          ? Number(body.surveyingFees)
          : undefined;

    const payload = {
      reference,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      propertyAddress,
      postcode: body.jobPostcode,
      surveyLevel: body.surveyType,
      bedrooms: body.bedrooms,
      quotedAmount:
        quotedAmount != null && !Number.isNaN(quotedAmount)
          ? quotedAmount
          : undefined,
      isExpressTurnaround: body.isExpressTurnaround === true,
    };

    console.log("📋 Booking → CRM payload:", JSON.stringify(payload, null, 2));

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
    console.error("❌ Booking CRM intake error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
