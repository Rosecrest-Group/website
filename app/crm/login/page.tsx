import { Suspense } from "react";
import CrmLoginForm from "@/crm/components/CrmLoginForm";

export default function CrmLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#FAFAF7]">
          Loading…
        </div>
      }
    >
      <CrmLoginForm />
    </Suspense>
  );
}
