import type { ReactNode } from "react";

export default function PageBody({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-(--color-canvas)">{children}</div>;
}
