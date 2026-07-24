import { redirect } from "next/navigation";
import { CRM_DATA_DUMP_PATH } from "@/crm/lib/constants";

export default function DataDumpPage() {
  redirect(`${CRM_DATA_DUMP_PATH}/contacts`);
}
