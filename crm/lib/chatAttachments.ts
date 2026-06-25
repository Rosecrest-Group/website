export const MAX_CHAT_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_CHAT_ATTACHMENTS = 5;

export const ALLOWED_CHAT_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export function validateChatAttachmentFile(file: File): string | null {
  if (!ALLOWED_CHAT_ATTACHMENT_TYPES.has(file.type)) {
    return `${file.name}: file type is not supported`;
  }
  if (file.size <= 0 || file.size > MAX_CHAT_ATTACHMENT_BYTES) {
    return `${file.name}: must be 10 MB or smaller`;
  }
  return null;
}
