"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Keep a ref pointed at the latest value without assigning during render. */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
