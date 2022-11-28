// Do not import any native node modules here.

export enum Protocol {
  Attachments = "attachments",
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
