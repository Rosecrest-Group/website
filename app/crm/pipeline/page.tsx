import { Suspense } from "react";
import PipelinePage from "@/crm/components/PipelinePage";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function PipelineRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PipelinePage />
    </Suspense>
  );
}
