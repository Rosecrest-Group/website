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
export default function CrmRoleGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    void prefetchCurrentUser();
    api
      .getMe()
      .then((me) => setRole(me.role))
      .catch(() => setRole(null));
  }, []);

  useEffect(() => {
    if (!role || !pathname) return;
    const target = forbiddenRedirect(role, pathname);
    if (target && target !== pathname) {
      router.replace(target);
    }
  }, [role, pathname, router]);

  return null;
}
