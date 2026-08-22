function givenName(fullName: string): string {
  const trimmed = fullName.trim();
  return trimmed.split(/\s+/)[0] || "Unknown";
}

function memberLabels(fullNames: string[]): string[] {
  const names = fullNames.map((n) => n.trim()).filter(Boolean);
  const given = names.map(givenName);
  return names.map((full, i) => {
    const first = given[i];
    const clash = given.filter((g) => g.toLowerCase() === first.toLowerCase()).length > 1;
    return clash ? full : first;
  });
}

export function formatUnnamedGroupTitle(otherFullNames: string[]): string {
  const labels = memberLabels(otherFullNames);
  if (labels.length === 0) return "Group chat";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  const rest = labels.length - 2;
  return `${labels[0]}, ${labels[1]} and ${rest} ${rest === 1 ? "other" : "others"}`;
}

function isCustomGroupTitle(title: string | null | undefined, otherFullNames: string[]): boolean {
  const trimmed = title?.trim() ?? "";
  if (!trimmed || /^(group chat|direct message|new chat)$/i.test(trimmed)) return false;

  const memberTokens = new Set(
    otherFullNames.flatMap((n) => {
      const full = n.trim().toLowerCase();
      if (!full) return [];
      return [full, givenName(n).toLowerCase()];
    })
  );

  const parts = trimmed.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (parts.length > 0 && parts.every((p) => memberTokens.has(p))) return false;

  const andOthers = trimmed.match(/^(.*?)\s+and\s+(?:\d+\s+others?|others)$/i);
  if (andOthers?.[1]) {
    const nameParts = andOthers[1]
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (nameParts.length > 0 && nameParts.every((p) => memberTokens.has(p))) return false;
  }

  return true;
}

export function conversationDisplayTitle(
  conversation: {
    kind: string;
    title: string;
    participants: Array<{ userId: string; user: { fullName: string } }>;
  },
  currentUserId?: string | null
): string {
  if (!currentUserId) return conversation.title;

  const others = conversation.participants
    .filter((p) => p.userId !== currentUserId)
    .map((p) => p.user.fullName.trim())
    .filter(Boolean);

  if (conversation.kind === "GROUP" || others.length >= 2) {
    if (isCustomGroupTitle(conversation.title, others)) return conversation.title;
    return formatUnnamedGroupTitle(others);
  }

  return conversation.title;
}
