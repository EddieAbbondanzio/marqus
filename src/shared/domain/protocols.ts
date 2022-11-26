export enum Protocol {
  Attachments = "attachments",
}

// noteId bit in sync with UUID_REGEX
export const ATTACHMENTS_PROTOCOL_REGEX =
  /^attachments:\/\/.+\?noteId=[a-zA-Z0-9]{10}$/;
