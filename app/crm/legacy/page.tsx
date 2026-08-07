import { redirect } from "next/navigation";
import { CRM_LEGACY_PATH } from "@/crm/lib/constants";

export default function LegacyPage() {
  redirect(`${CRM_LEGACY_PATH}/contacts`);
}
