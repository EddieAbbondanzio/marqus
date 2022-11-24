export enum Protocol {
  Attachments = "attachments",
}

// Keep end in sync with UUID_REGEX
export const ATTACHMENTS_PROTOCOL_REGEX =
  /^attachments:\/\/.+\?noteId=[a-zA-Z0-9]{10}$/;

export function buildAttachmentUrl(href: string, noteId: string): string {
  if (!href.startsWith(`${Protocol.Attachments}://`)) {
    throw new Error(
      `Attachment href must start with ${Protocol.Attachments}://`,
    );
  }

  return `${href}?noteId=${noteId}`;
}
