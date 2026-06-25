import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";

export default function CrmPlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <CrmPageContent>
      <CrmPageHeader title={title} />
      <p className="max-w-lg text-(--color-tc-30)">
        {description ?? "This module is planned for a later phase of the CRM build."}
      </p>
    </CrmPageContent>
  );
}
