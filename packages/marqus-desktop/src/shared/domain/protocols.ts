// Do not import any native node modules here.

export enum Protocol {
  Attachment = "attachment",
  // Note links are not a protocol because we don't need to handle them on the
  // main process.
}

export interface FileInfo {
  mimeType: string;
  /**
   * Full path of the attachment including file name and extension.
   */
  path: string;
  /**
   * File name including extension. Ex: "foo.txt"
   */
  name: string;
}

export interface Attachment {
  type: "file" | "image";
  mimeType: string;
  path: string;
  name: string;
}

const PROTOCOL_REGEX = /^[a-z0-9]+:\/\//;

export function getProtocol(url: string | null): string | null {
  if (url == null) {
    return null;
  }

  const match = url.match(PROTOCOL_REGEX);
  if (!match) {
    return null;
  }

  return match[0];
}

export function isProtocolUrl(
  protocol: string | Protocol,
  url: string | null,
): boolean {
  return getProtocol(url)?.includes(protocol) ?? false;
}
