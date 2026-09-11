import { redirect } from "next/navigation";
import { CRM_BASE_PATH } from "@/crm/lib/constants";

export default function ProspectingIndexPage() {
  redirect(`${CRM_BASE_PATH}/prospecting/find-firms`);
}
