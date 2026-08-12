import { Suspense } from "react";
import TasksList from "@/crm/components/TasksList";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

export default function TasksPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TasksList />
    </Suspense>
  );
}
