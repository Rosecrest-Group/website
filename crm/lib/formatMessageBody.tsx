import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]'"])/g;

export function linkifyText(text: string, linkClassName: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    const url = match[0];
    parts.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {url}
      </a>
    );
    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
