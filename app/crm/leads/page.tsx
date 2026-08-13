import { Suspense } from "react";
import LeadsList from "@/crm/components/LeadsList";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function LeadsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LeadsList />
    </Suspense>
  );
}
