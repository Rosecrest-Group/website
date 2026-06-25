"use client";

import { usePathname } from "next/navigation";
import TopMenu from "./TopMenu";

export default function ConditionalMenu() {
  const pathname = usePathname();
  
  // Hide menu on payment pages (public pages for customers)
  if (pathname?.startsWith('/pay')) {
    return null;
  }
  
  return <TopMenu />;
}
