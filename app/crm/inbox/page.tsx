import { Suspense } from "react";
import InboxView from "@/crm/components/InboxView";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function InboxPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InboxView />
    </Suspense>
  );
}
