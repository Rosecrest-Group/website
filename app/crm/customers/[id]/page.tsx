import CustomerProfile from "@/crm/components/CustomerProfile";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerProfile id={id} />;
}
