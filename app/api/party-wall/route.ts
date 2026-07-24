import { config } from "@/config/api";
import {
  buildPartyWallCrmMessage,
  extractUkPostcode,
  splitFullName,
  type PartyWallFormValues,
} from "@/lib/party-wall/schema";
import { NextResponse } from "next/server";

const CRM_INTAKE_URL = `${config.crmApiUrl.replace(/\/$/, "")}/intake/leads/PARTY_WALL_TOOL`;

type PartyWallRequestBody = PartyWallFormValues & {
  landRegistryBase64?: string;
  technicalDrawingsBase64?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PartyWallRequestBody;

    const { firstName, lastName } = splitFullName(body.fullName);
    const primaryAddress = body.propertyAddresses?.[0]?.trim() || "Party Wall Notice";
    const reference = `party-wall-${Date.now()}-${String(body.email ?? "unknown").toLowerCase()}`;

    const message = buildPartyWallCrmMessage(body, {
      landRegistry: body.landRegistryBase64 ? "yes" : undefined,
      technicalDrawings: body.technicalDrawingsBase64 ? "yes" : undefined,
    });

    const payload: Record<string, unknown> = {
      reference,
      firstName,
      lastName,
      email: body.email,
      phone: body.phone?.trim() || undefined,
      propertyAddress: primaryAddress,
      postcode: extractUkPostcode(primaryAddress),
      message,
      marketingOptIn: false,
      consent: {
        timestamp: new Date().toISOString(),
        source: "party_wall_tool",
      },
      documents: {
        landRegistry: body.landRegistryBase64
          ? {
              filename: body.landRegistryFileName,
              mimeType: "application/pdf",
              data: body.landRegistryBase64,
            }
          : undefined,
        technicalDrawings: body.technicalDrawingsBase64
          ? {
              filename: body.technicalDrawingsFileName,
              mimeType: "application/pdf",
              data: body.technicalDrawingsBase64,
            }
          : undefined,
      },
    };

    console.log("📋 Party Wall → CRM payload:", JSON.stringify({ ...payload, documents: "[redacted]" }, null, 2));

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
    console.error("❌ Party Wall CRM intake error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
