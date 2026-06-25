import { Suspense } from "react";
import NewLeadForm from "@/crm/components/NewLeadForm";

export default function NewLeadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#908D85]">Loading…</div>}>
      <NewLeadForm />
    </Suspense>
  );
}
