import type { TextAnchor } from "./anchor";

const API_BASE = process.env.NEXT_PUBLIC_CRM_API_URL ?? "/api/v1";

export const MAX_COMMENT_WORDS = 1000;

export type ReviewUser = { id: string; fullName: string };

type ReviewAuthor = { id: string; fullName: string; avatarUrl: string | null };

export type ReviewReply = { id: string; body: string; author: ReviewAuthor; createdAt: string };

export type ReviewThread = TextAnchor & {
  id: string;
  pagePath: string;
  body: string;
  author: ReviewAuthor;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  replies: ReviewReply[];
};

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

function send(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * The CRM client sends anyone signed out to the login page, which would be wrong here: these
 * calls run on public-looking pages for every visitor, so a signed-out response is just an answer.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await send(path, init);
  if (res.status === 401) {
    const refreshed = await send("/auth/refresh", { method: "POST", body: "{}" });
    if (refreshed.ok) res = await send(path, init);
  }
  const json = (await res.json()) as ApiResult<T>;
  if (!json.ok) {
    const error = new Error(json.error.message) as Error & { code: string };
    error.code = json.error.code;
    throw error;
  }
  return json.data;
}

export async function fetchReviewUser(): Promise<ReviewUser | null> {
  try {
    return await request<ReviewUser>("/auth/me");
  } catch {
    return null;
  }
}

export async function fetchThreads(pagePath: string) {
  const query = new URLSearchParams({ pagePath });
  const data = await request<{ items: ReviewThread[] }>(`/review-comments?${query}`);
  return data.items;
}

export function createThread(pagePath: string, anchor: TextAnchor, body: string) {
  return request<ReviewThread>("/review-comments", {
    method: "POST",
    body: JSON.stringify({ pagePath, ...anchor, body }),
  });
}

export function addReply(threadId: string, body: string) {
  return request<ReviewThread>(`/review-comments/${threadId}/replies`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function setResolved(threadId: string, resolved: boolean) {
  return request<ReviewThread>(`/review-comments/${threadId}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved }),
  });
}
