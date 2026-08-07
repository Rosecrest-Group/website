"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import { prefetchCurrentUser } from "@/crm/lib/currentUserCache";
import { forbiddenRedirect } from "@/crm/lib/rbac";
import type { UserRole } from "@/crm/types";

/**
 * Redirects away from CRM paths the signed-in role cannot access
 * (e.g. Surveyor on /crm/leads). API remains the authority.
 */
export default function CrmRoleGuard({
  initialRole = null,
}: {
  initialRole?: UserRole | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(initialRole);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
      return;
    }
    void prefetchCurrentUser();
    api
      .getMe()
      .then((me) => setRole(me.role))
      .catch(() => setRole(null));
  }, [initialRole]);

  useEffect(() => {
    if (!role || !pathname) return;
    const target = forbiddenRedirect(role, pathname);
    if (target && target !== pathname) {
      router.replace(target);
    }
  }, [role, pathname, router]);

  return null;
}
