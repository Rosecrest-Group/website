"use client";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export async function markCrmSession(rememberMe = true) {
  await fetch("/api/crm/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rememberMe }),
  });
}

export async function clearCrmSession() {
  await fetch("/api/crm/session", {
    method: "DELETE",
    credentials: "include",
  });
}

export { SESSION_MAX_AGE };
