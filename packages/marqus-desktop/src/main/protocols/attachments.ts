import { protocol } from "electron";
import { isProtocolUrl, Protocol } from "../../shared/domain/protocols";
import path from "path";
import fs from "fs";
import { UUID_REGEX } from "../../shared/domain";
import { ATTACHMENTS_DIRECTORY } from "../ipc/plugins/notes";
import { isChildOf } from "../utils";

export function registerAttachmentsProtocol(noteDirectoryPath: string): void {
  protocol.registerFileProtocol(Protocol.Attachment, (req, cb) => {
    const filePath = parseAttachmentPath(noteDirectoryPath, req.url);

    // Soft error if file isn't found.
    if (!fs.existsSync(filePath)) {
      cb({ statusCode: 404 });
    } else {
      cb(filePath);
    }
  });
}

export function clearAttachmentsProtocol(): void {
  const success = protocol.unregisterProtocol(Protocol.Attachment);
  if (!success) {
    throw new Error(`Failed to unregister protocol ${Protocol.Attachment}`);
  }
}

export function parseAttachmentPath(
  noteDirectoryPath: string,
  url: string,
): string {
  if (!isProtocolUrl(Protocol.Attachment, url)) {
    throw new Error(`URL ${url} is not a valid attachments url.`);
  }

  const parsedUrl = new URL(url);
  const parsedSearchParams = new URLSearchParams(parsedUrl.search);

  const noteId = parsedSearchParams.get("noteId");
  if (noteId == null || !UUID_REGEX.test(noteId)) {
    throw new Error(`Invalid note id (${noteId}) in attachment path.`);
  }

  let filePath = parsedUrl.hostname;
  if (parsedUrl.pathname) {
    filePath = path.join(filePath, parsedUrl.pathname);
  }
  filePath = decodeURI(filePath);

  const attachmentsPath = path.join(
    noteDirectoryPath,
    noteId,
    ATTACHMENTS_DIRECTORY,
  );

  const attachmentFile = path.join(attachmentsPath, filePath);

  if (!isChildOf(attachmentsPath, attachmentFile)) {
    throw new Error(
      `${attachmentFile} is outside of attachment directory for ${noteId}, and cannot be loaded.`,
    );
  }

  // Only absolute paths work in renderer
  return path.resolve(attachmentFile);
}
