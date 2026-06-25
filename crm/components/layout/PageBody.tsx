import type { ReactNode } from "react";

export default function PageBody({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#f6f6f6]">{children}</div>;
}

