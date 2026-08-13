import { Suspense } from "react";
import CrmJobsList from "@/crm/components/CrmJobsList";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function JobsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CrmJobsList />
    </Suspense>
  );
}
