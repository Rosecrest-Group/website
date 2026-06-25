"use client";

import { isLikelyUkPostcode, UK_POSTCODE_HINT } from "@/lib/ukPostcode";

export default function PostcodeFieldHint({ value }: { value: string }) {
  if (!value.trim() || isLikelyUkPostcode(value)) return null;

  return (
    <p className="text-sm text-red-600 mt-1" role="alert">
      {UK_POSTCODE_HINT}
    </p>
  );
}
