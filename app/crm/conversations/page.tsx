import { Suspense } from "react";
import ConversationsView from "@/crm/components/ConversationsView";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function ConversationsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ConversationsView />
    </Suspense>
  );
}
