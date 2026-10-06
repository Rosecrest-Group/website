import type { CustomerType } from "@/crm/types";

export const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: "HOMEBUYER", label: "Homebuyer" },
  { value: "LANDLORD", label: "Landlord" },
  { value: "LEGAL", label: "Legal" },
  { value: "COUNCIL", label: "Council" },
  { value: "TRADE", label: "Trade" },
];
