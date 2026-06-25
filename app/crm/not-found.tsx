import Link from "next/link";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";

export default function CrmNotFound() {
  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Page not found"
        subtitle="This CRM page doesn't exist, or your account may not have access to it."
      />
      <CrmPanel title="What you can do">
        <ul className="list-disc space-y-2 pl-5 text-sm text-(--color-tc-40)">
          <li>Check the URL is correct.</li>
          <li>Team settings require Admin or Super Admin access.</li>
          <li>Contact a Super Admin if you need access to a section.</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/crm">
            <PrimaryButton type="button" className="w-auto">
              Back to dashboard
            </PrimaryButton>
          </Link>
          <Link
            href="/crm/settings/team"
            className="inline-flex h-[50px] items-center rounded-xl border border-(--color-tc-20) px-6 text-sm font-medium text-(--color-tc-40) hover:bg-(--color-nc-10)"
          >
            Try Team settings
          </Link>
        </div>
      </CrmPanel>
    </CrmPageContent>
  );
}
