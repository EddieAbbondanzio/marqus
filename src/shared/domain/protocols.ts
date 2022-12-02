// Do not import any native node modules here.

export enum Protocol {
  Attachments = "attachments",
  // Note links are not a protocol because we don't need to handle them on the
  // main process.
}

// noteId bit in sync with UUID_REGEX
export const ATTACHMENTS_PROTOCOL_REGEX =
  /^attachments:\/\/.+\?noteId=[a-zA-Z0-9]{10}$/;

export interface FileInfo {
  mimeType: string;
  path: string;
  name: string;
}

export interface Attachment {
  type: "file" | "image";
  mimeType: string;
  path: string;
  name: string;
}

const PROTOCOL_REGEX = /^[a-z0-9]+:\/\//;

export function isProtocolUrl(
  protocol: string | Protocol,
  url: string | null,
): boolean {
  if (url == null) {
    return false;
  }

  const match = url.match(PROTOCOL_REGEX);
  if (!match) {
    return false;
  }

  const matchedString = match[0];
  return matchedString.includes(protocol);
}
