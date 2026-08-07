import CustomersList from "@/crm/components/CustomersList";
import { serverCrmFetch } from "@/crm/lib/serverCrmApi";
import type { Customer, Paginated } from "@/crm/types";

export default async function CustomersPage() {
  const initialData = await serverCrmFetch<Paginated<Customer>>("/customers?page=1&limit=25");

  return <CustomersList initialData={initialData} />;
}
