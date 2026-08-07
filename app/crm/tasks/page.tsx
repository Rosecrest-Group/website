import TasksList from "@/crm/components/TasksList";
import { serverCrmFetch } from "@/crm/lib/serverCrmApi";
import type { Paginated, Task } from "@/crm/types";

export default async function TasksPage() {
  const initialData = await serverCrmFetch<Paginated<Task>>("/tasks?page=1&limit=25");

  return <TasksList initialData={initialData} />;
}
