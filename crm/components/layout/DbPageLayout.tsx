"use client";

import type { ReactNode } from "react";
import PageTitle from "@/crm/components/layout/PageTitle";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";

export interface DbPageLayoutProps {
  /** Page heading (e.g. "Messages", "Payments") */
  title: string;
  /** Page content. When wrapped=true (default), content is inside CurvedContainer with standard inner padding (p-4 sm:p-8). */
  children: ReactNode;
  /** If true (default), wrap content in CurvedContainer with standard padding to match payments/settings layout. */
  wrapped?: boolean;
}

/**
 * Standard layout for /db/* pages: consistent spacing between page title and content, and standard side padding.
 * - Outer container: max-width, side padding (px-4 sm:px-6 md:px-14). Gap below title comes from PageTitle only (same as Payments).
 * - When wrapped=true, content is inside CurvedContainer with p-4 sm:p-8 (e.g. Payments). When wrapped=false, content is direct (e.g. Messages).
 */
export default function DbPageLayout({
  title,
  children,
  wrapped = true,
}: DbPageLayoutProps) {
  return (
    <>
      <PageTitle>{title}</PageTitle>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pb-10 md:px-14 font-sans">
        {wrapped ? (
          <CurvedContainer showBorderAndShadow={false}>
            <div className="p-4 sm:p-8">{children}</div>
          </CurvedContainer>
        ) : (
          children
        )}
      </div>
    </>
  );
}
