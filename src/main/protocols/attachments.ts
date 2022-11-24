import { protocol } from "electron";
import {
  ATTACHMENTS_PROTOCOL_REGEX,
  Protocol,
} from "../../shared/domain/protocols";
import path from "path";
import { ATTACHMENTS_DIRECTORY } from "../ipcs/notes";
import fs from "fs";
import { UUID_REGEX } from "../../shared/domain";

const PROTOCOL_SUBSTRING_LENGTH = `${Protocol.Attachments}://`.length;

export function registerAttachmentsProtocol(noteDirectoryPath: string): void {
  protocol.registerFileProtocol(Protocol.Attachments, (req, cb) => {
    if (!ATTACHMENTS_PROTOCOL_REGEX.test(req.url)) {
      throw new Error(`URL ${req.url} doesn't match attachments protocol.`);
    }

    const pathWithQueryString = req.url.slice(PROTOCOL_SUBSTRING_LENGTH);
    const [file, query] = pathWithQueryString.split("?");
    if (file == null || query == null) {
      throw new Error(`Attachments url (${req.url}) was missing portions.`);
    }

    const noteId = query.replace(/noteId=/, "");
    if (!UUID_REGEX.test(noteId)) {
      throw new Error(
        `Note id (${noteId}) passed to attachment protocol is invalid.`,
      );
    }

    // Only absolute paths work in renderer
    const filePath = path.resolve(
      noteDirectoryPath,
      noteId,
      ATTACHMENTS_DIRECTORY,
      file,
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filePath} doesn't exist.`);
    }

    cb(filePath);
  });
}
