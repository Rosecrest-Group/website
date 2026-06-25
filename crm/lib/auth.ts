"use client";

/**
 * CRM auth preferences only. Tokens live in HttpOnly cookies set by the API.
 */

const REMEMBER_KEY = "rosecrest_crm_remember";

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(REMEMBER_KEY);
  if (stored === null) return true;
  return stored === "1";
}

export function setRememberMe(remember: boolean) {
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

export function clearRememberMe() {
  localStorage.removeItem(REMEMBER_KEY);
}
