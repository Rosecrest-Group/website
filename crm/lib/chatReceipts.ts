export type ChatParticipant = {
  userId: string;
  lastReadAt: string | null;
  user: { id: string; fullName: string };
};

export type ReadReceipt = {
  readCount: number;
  total: number;
  allRead: boolean;
  label: string;
};

export function getReadReceipt(
  messageCreatedAt: string,
  participants: ChatParticipant[],
  currentUserId: string | null
): ReadReceipt | null {
  if (!currentUserId) return null;

  const others = participants.filter((p) => p.userId !== currentUserId);
  if (others.length === 0) return null;

  const messageTime = new Date(messageCreatedAt).getTime();
  const readBy = others.filter(
    (p) => p.lastReadAt && new Date(p.lastReadAt).getTime() >= messageTime
  );

  const readCount = readBy.length;
  const total = others.length;
  const allRead = readCount === total;

  let label: string;
  if (total === 1) {
    label = allRead ? "Seen" : "Delivered";
  } else if (allRead) {
    label = `Seen by all`;
  } else if (readCount > 0) {
    label = `Seen by ${readCount} of ${total}`;
  } else {
    label = "Delivered";
  }

  return { readCount, total, allRead, label };
}
