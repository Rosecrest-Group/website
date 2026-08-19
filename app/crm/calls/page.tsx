import { Suspense } from "react";
import CallsView from "@/crm/components/CallsView";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function CallsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CallsView />
    </Suspense>
  );
}
