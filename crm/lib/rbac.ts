import { CRM_BASE_PATH, CRM_NAV_SECTIONS, type CrmNavSection } from "@/crm/lib/constants";
import type { UserRole } from "@/crm/types";

export const LEAD_ACCESS_ROLES: UserRole[] = ["OPS", "ADMIN", "SUPER_ADMIN"];

export const CUSTOMER_DIRECTORY_ROLES: UserRole[] = [
  "OPS",
  "ADMIN",
  "SUPER_ADMIN",
  "FINANCE",
  "READ_ONLY",
];

export const WORKFLOW_READ_ROLES: UserRole[] = ["OPS", "ADMIN", "SUPER_ADMIN"];

export const TEMPLATE_READ_ROLES: UserRole[] = ["OPS", "ADMIN", "SUPER_ADMIN"];

export const OPS_DASHBOARD_ROLES: UserRole[] = ["OPS", "ADMIN", "SUPER_ADMIN"];

export const FINANCE_DASHBOARD_ROLES: UserRole[] = [
  "FINANCE",
  "ADMIN",
  "SUPER_ADMIN",
  "OPS",
];

export const ADMIN_SETTINGS_ROLES: UserRole[] = ["ADMIN", "SUPER_ADMIN"];

export const TASKS_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPS",
  "SURVEYOR",
  "TRADE_OPERATIVE",
  "QC",
];

export const SCHEDULE_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPS",
  "SURVEYOR",
  "TRADE_OPERATIVE",
];

export const SLA_DASHBOARD_ROLES: UserRole[] = ["OPS", "ADMIN", "SUPER_ADMIN"];

export function hasExactRole(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

export function canReadLeads(role: UserRole): boolean {
  return hasExactRole(role, LEAD_ACCESS_ROLES);
}

export function canMessageCustomers(role: UserRole): boolean {
  return hasExactRole(role, LEAD_ACCESS_ROLES);
}

export function canMutateLeads(role: UserRole): boolean {
  return hasExactRole(role, LEAD_ACCESS_ROLES);
}

export function canAccessCustomerDirectory(role: UserRole): boolean {
  return hasExactRole(role, CUSTOMER_DIRECTORY_ROLES);
}

export function canAccessAdminSettings(role: UserRole): boolean {
  return hasExactRole(role, ADMIN_SETTINGS_ROLES);
}

export function canViewAuditLog(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

export function isJobScopedRole(role: UserRole): boolean {
  return role === "SURVEYOR" || role === "TRADE_OPERATIVE" || role === "QC";
}

/** Surveyors must not see fees, payment links, or payment history. */
export function canViewJobMoney(role: UserRole): boolean {
  return role !== "SURVEYOR";
}

/** Confirm / request access is ops-owned; surveyors only view confirmed details. */
export function canManageJobAccessDetails(role: UserRole): boolean {
  return hasExactRole(role, LEAD_ACCESS_ROLES);
}

/** Inspection date is set by ops/admin; surveyors see it read-only. */
export function canEditInspectionDate(role: UserRole): boolean {
  return hasExactRole(role, LEAD_ACCESS_ROLES);
}

/** Pre-site ticks are the assigned surveyor’s; ops/admin can view only. */
export function canTickPreSiteCheckpoints(role: UserRole): boolean {
  return role === "SURVEYOR";
}

/** Default home when a role hits a forbidden path. */
export function defaultLandingPath(role: UserRole): string {
  if (role === "SURVEYOR" || role === "TRADE_OPERATIVE" || role === "QC") {
    return `${CRM_BASE_PATH}/jobs`;
  }
  if (role === "FINANCE") {
    return `${CRM_BASE_PATH}/revenue`;
  }
  return CRM_BASE_PATH;
}

function pathAllowed(role: UserRole, pathname: string): boolean {
  if (pathname === CRM_BASE_PATH || pathname === `${CRM_BASE_PATH}/`) return true;
  if (pathname.startsWith(`${CRM_BASE_PATH}/settings/profile`)) return true;
  if (pathname.startsWith(`${CRM_BASE_PATH}/conversations`)) return true;
  if (pathname.startsWith(`${CRM_BASE_PATH}/documentation`)) {
    return canAccessAdminSettings(role);
  }

  if (pathname.startsWith(`${CRM_BASE_PATH}/leads`) || pathname.startsWith(`${CRM_BASE_PATH}/inbox`)) {
    return canReadLeads(role);
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/customers`)) {
    return canAccessCustomerDirectory(role);
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/jobs`) || pathname.startsWith(`${CRM_BASE_PATH}/tasks`)) {
    if (pathname.startsWith(`${CRM_BASE_PATH}/tasks`)) {
      return hasExactRole(role, TASKS_ROLES);
    }
    return true;
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/schedule`)) {
    return hasExactRole(role, SCHEDULE_ROLES);
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/workflows`)) {
    return hasExactRole(role, WORKFLOW_READ_ROLES);
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/templates`)) {
    return hasExactRole(role, TEMPLATE_READ_ROLES);
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/analytics`) || pathname.startsWith(`${CRM_BASE_PATH}/slas`)) {
    return hasExactRole(role, OPS_DASHBOARD_ROLES) || hasExactRole(role, SLA_DASHBOARD_ROLES);
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/revenue`)) {
    return hasExactRole(role, FINANCE_DASHBOARD_ROLES);
  }
  if (pathname.startsWith(`${CRM_BASE_PATH}/settings/audit-log`)) {
    return canViewAuditLog(role);
  }
  if (
    pathname.startsWith(`${CRM_BASE_PATH}/settings/team`) ||
    pathname.startsWith(`${CRM_BASE_PATH}/settings/integrations`) ||
    pathname.startsWith(`${CRM_BASE_PATH}/settings/partners`)
  ) {
    return canAccessAdminSettings(role);
  }
  if (
    pathname.startsWith(`${CRM_BASE_PATH}/data-dump`) ||
    pathname.startsWith(`${CRM_BASE_PATH}/legacy`)
  ) {
    return canAccessAdminSettings(role);
  }

  return true;
}

export function canAccessCrmPath(role: UserRole, pathname: string): boolean {
  return pathAllowed(role, pathname);
}

export function forbiddenRedirect(role: UserRole, pathname: string): string | null {
  if (canAccessCrmPath(role, pathname)) return null;
  return defaultLandingPath(role);
}

/** Filter sidebar sections for the signed-in role. */
export function navSectionsForRole(role: UserRole | null | undefined): CrmNavSection[] {
  if (!role) return CRM_NAV_SECTIONS;

  return CRM_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canAccessCrmPath(role, item.href)),
  })).filter((section) => section.items.length > 0);
}
