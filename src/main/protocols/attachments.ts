import { protocol } from "electron";
import {
  ATTACHMENTS_PROTOCOL_REGEX,
  Protocol,
} from "../../shared/domain/protocols";
import path from "path";
import fs from "fs";
import { UUID_REGEX } from "../../shared/domain";
import { ATTACHMENTS_DIRECTORY } from "../ipcs/notes";

export function registerAttachmentsProtocol(noteDirectoryPath: string): void {
  protocol.registerFileProtocol(Protocol.Attachments, (req, cb) => {
    const filePath = parseAttachmentPath(noteDirectoryPath, req.url);

    if (!fs.existsSync(filePath)) {
      cb({ statusCode: 404 });
    }

    cb(filePath);
  });
}

export function parseAttachmentPath(
  noteDirectoryPath: string,
  url: string,
): string {
  if (!ATTACHMENTS_PROTOCOL_REGEX.test(url)) {
    throw new Error(`URL ${url} doesn't match attachments protocol.`);
  }

  const parsedUrl = new URL(url);
  const parsedSearchParams = new URLSearchParams(parsedUrl.search);

  // Parsed protocol includes the ':'
  if (parsedUrl.protocol !== `${Protocol.Attachments}:`) {
    throw new Error(`Invalid attachments protocol: ${parsedUrl.protocol}`);
  }

  const noteId = parsedSearchParams.get("noteId");
  // TODO: Pull optional image height / width from search params.
  if (noteId == null || !UUID_REGEX.test(noteId)) {
    throw new Error(`Invalid note id (${noteId}) in attachment path.`);
  }

  let filePath = parsedUrl.host;
  if (parsedUrl.pathname) {
    filePath = `${filePath}/${parsedUrl.pathname}`;
  }

  const attachmentsPath = path.join(
    noteDirectoryPath,
    noteId,
    ATTACHMENTS_DIRECTORY,
  );

  const attachmentFile = path.join(attachmentsPath, filePath);

  if (path.relative(attachmentsPath, attachmentFile).startsWith("..")) {
    throw new Error(
      `${attachmentFile} is outside of attachment directory for ${noteId}, and cannot be loaded.`,
    );
  }

  // Only absolute paths work in renderer
  return path.resolve(attachmentFile);
}
