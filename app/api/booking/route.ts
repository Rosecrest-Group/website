import { config } from "@/config/api";
import { NextResponse } from "next/server";

const BOOKING_WEBHOOK = config.bookingWebhook || "";

const LEAD_TYPE: Record<string, number> = {
  "level-1": 90,
  "level-2": 90,
  "level-3": 92,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payload = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      altPhone: body.phone,
      postCode: body.jobPostcode,
      addressLine1: body.jobAddress,
      addressLine2: "",
      city: body.jobTown,
      state: "",
      country: "",
      propertyValue: body.propertyValue,
      propertyType: body.propertyType,
      surveyingFees: body.surveyingFees,
      numberBedrooms: body.bedrooms,
      surveyRequirements: body.helpWith || body.surveyType,
      timeScale: body.timeline,
      yearConstructed: "",
      leadType: LEAD_TYPE[body.surveyType] ?? 90,
    };

    console.log("📋 Booking payload:", JSON.stringify(payload, null, 2));

    const res = await fetch(BOOKING_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log("📬 Booking webhook response:", res.status, responseText);

    if (!res.ok) {
      return NextResponse.json({ success: false }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Booking webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
