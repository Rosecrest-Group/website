"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type CrmTopBarContextValue = {
  left: ReactNode;
  setLeft: (node: ReactNode) => void;
};

const CrmTopBarContext = createContext<CrmTopBarContextValue | null>(null);

export function CrmTopBarProvider({ children }: { children: ReactNode }) {
  const [left, setLeft] = useState<ReactNode>(null);
  const value = useMemo(() => ({ left, setLeft }), [left]);
  return <CrmTopBarContext.Provider value={value}>{children}</CrmTopBarContext.Provider>;
}

export function useCrmTopBar() {
  const ctx = useContext(CrmTopBarContext);
  if (!ctx) {
    throw new Error("useCrmTopBar must be used within CrmTopBarProvider");
  }
  return ctx;
}
