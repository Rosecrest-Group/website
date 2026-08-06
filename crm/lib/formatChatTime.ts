/** Prefer the carrier send time; fall back to when the CRM recorded the row. */
export function messageTimestamp(message: {
  sentAt?: string | null;
  createdAt: string;
}): string {
  return message.sentAt || message.createdAt;
}

export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatChatDateSeparator(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function initialsFromName(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function shouldGroupMessages(
  current: { authorId: string; createdAt: string },
  previous: { authorId: string; createdAt: string } | undefined
): boolean {
  if (!previous) return false;
  if (current.authorId !== previous.authorId) return false;
  const gap = new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
  return gap < 5 * 60 * 1000;
}
