import { shell } from "electron";
import { difference, cloneDeep, partition, keyBy, omit } from "lodash";
import { z } from "zod";
import { IpcPlugin, AppContext } from "..";
import { UUID_REGEX } from "../../../shared/domain";
import { NoteSort, createNote, Note } from "../../../shared/domain/note";
import { Attachment } from "../../../shared/domain/protocols";
import { isDevelopment } from "../../../shared/env";
import { NoteUpdateParams } from "../../../shared/ipc";
import { writeJson, loadJson } from "../../json";
import {
  registerAttachmentsProtocol,
  clearAttachmentsProtocol,
  parseAttachmentPath,
} from "../../protocols/attachments";
import { NOTE_SCHEMAS } from "../../schemas/notes";
import { isChildOf, openInBrowser } from "../../utils";
import * as fs from "fs";
import * as p from "path";

export const ATTACHMENTS_DIRECTORY = "attachments";
export const METADATA_FILE_NAME = "metadata.json";
export const MARKDOWN_FILE_NAME = "index.md";

const noteUpdateSchema: z.Schema<NoteUpdateParams> = z.object({
  name: z.string().optional(),
  parent: z.string().optional(),
  sort: z.nativeEnum(NoteSort).optional(),
  content: z.string().optional(),
});

export const noteIpcPlugin: IpcPlugin = {
  onInit: async ({ config, browserWindow }) => {
    const { noteDirectory } = config.content;

    if (noteDirectory) {
      registerAttachmentsProtocol(noteDirectory);
    }

    // Override how all links are open so we can send them off to the user's
    // web browser instead of opening them in the electron app.
    browserWindow.webContents.setWindowOpenHandler(details => {
      void openInBrowser(details.url);
      return { action: "deny" };
    });

    return () => {
      if (noteDirectory) {
        clearAttachmentsProtocol();
      }
    };
  },

  "notes.getAll": async ctx => {
    const noteDirectory = getNoteDirectory(ctx);
    if (!fs.existsSync(noteDirectory)) {
      return [];
    }

    const notes = await loadNotes(noteDirectory);
    return notes;
  },

  "notes.create": async (ctx, params) => {
    const { blockAppFromQuitting } = ctx;
    const noteDirectory = getNoteDirectory(ctx);

    const note = createNote(params);
    await blockAppFromQuitting(async () => {
      await saveNoteToFS(noteDirectory, note);
    });

    return note;
  },

  "notes.update": async (ctx, id, props) => {
    const { blockAppFromQuitting, log } = ctx;

    const noteDirectory = getNoteDirectory(ctx);
    const note: NoteFile = await loadNoteFromFS(noteDirectory, id);
    const update = await noteUpdateSchema.parseAsync(props);

    if (update.name != null) {
      note.name = update.name;
    }

    // Allow unsetting parent
    if ("parent" in update) {
      note.parent = update.parent;
    }

    // Allow unsetting sort
    if ("sort" in update) {
      note.sort = update.sort;
    }

    if (update.content != null) {
      note.content = update.content;
    }

    // Sanity check to ensure no extra props were passed
    if (
      isDevelopment() &&
      Object.keys(props).length > Object.keys(update).length
    ) {
      const diff = difference(Object.keys(props), Object.keys(update));
      await log.warn(
        `ipc notes.update does not support keys: ${diff.join(", ")}`,
      );
    }

    note.dateUpdated = new Date();
    await blockAppFromQuitting(async () => {
      await saveNoteToFS(noteDirectory, note);
    });
  },

  "notes.moveToTrash": async (ctx, id) => {
    const noteDirectory = getNoteDirectory(ctx);

    // Gonna leave this as-is because it might just be pre-optimizing, but this
    // could be a bottle neck down the road having to load in every note before
    // we can delete one if the user has 100s of notes.
    const everyNote = await loadNotes(noteDirectory, true);

    const recursive = async (noteId: string) => {
      const notePath = p.join(noteDirectory, noteId);
      await shell.trashItem(notePath);

      const children = everyNote.filter(n => n.parent === noteId);
      for (const child of children) {
        await recursive(child.id);
      }
    };
    await recursive(id);
  },

  "notes.openAttachments": async (ctx, noteId) => {
    if (!UUID_REGEX.test(noteId)) {
      throw new Error(`Invalid noteId ${noteId}`);
    }

    const noteDirectory = getNoteDirectory(ctx);
    // shell.openPath doesn't allow relative paths.
    const attachmentDirPath = p.resolve(
      noteDirectory,
      noteId,
      ATTACHMENTS_DIRECTORY,
    );
    if (!fs.existsSync(attachmentDirPath)) {
      await fs.promises.mkdir(attachmentDirPath);
    }

    const err = await shell.openPath(attachmentDirPath);
    if (err) {
      throw new Error(err);
    }
  },

  "notes.openAttachmentFile": async (ctx, href) => {
    const noteDirectory = getNoteDirectory(ctx);
    const attachmentPath = parseAttachmentPath(noteDirectory, href);
    if (!fs.existsSync(attachmentPath)) {
      throw new Error(`Attachment ${attachmentPath} doesn't exist.`);
    }

    const err = await shell.openPath(attachmentPath);
    if (err) {
      throw new Error(err);
    }
  },

  "notes.importAttachments": async (ctx, noteId, rawAttachments) => {
    const { log } = ctx;
    const noteDirectory = getNoteDirectory(ctx);
    const noteAttachmentsDirectory = p.join(
      noteDirectory,
      noteId,
      ATTACHMENTS_DIRECTORY,
    );

    if (!fs.existsSync(noteAttachmentsDirectory)) {
      await fs.promises.mkdir(noteAttachmentsDirectory);
    }

    const attachments: Attachment[] = [];

    for (const attachment of rawAttachments) {
      // Don't allow directories to be drag and dropped into notes because if we
      // automatically insert a link for every note to the markdown file it could
      // spam the file with a ton of links.
      if ((await fs.promises.lstat(attachment.path)).isDirectory()) {
        continue;
      }

      // Only copy over the attachment if it was outside of the note's attachment
      // directory. This prevents us from duplicating the file if the user were
      // to drag and drop a file that is already a known attachment.
      if (!isChildOf(noteAttachmentsDirectory, attachment.path)) {
        // Ensure filename is always unique by appending a number to the end of it
        // if we detect the file already exists.
        const parsedFile = p.parse(attachment.name);
        const originalName = parsedFile.name;
        let copyNumber = 1;
        while (
          fs.existsSync(p.join(noteAttachmentsDirectory, attachment.name))
        ) {
          attachment.name = `${originalName}-${copyNumber}${parsedFile.ext}`;
          copyNumber += 1;

          // Prevent infinite loops, and fail softly.
          if (copyNumber > 1000) {
            await log.warn(
              `Tried fixing duplicate attachment name ${attachment.name} but failed 1000 times.`,
            );
            continue;
          }
        }

        await fs.promises.copyFile(
          attachment.path,
          p.join(noteAttachmentsDirectory, attachment.name),
        );
      }

      attachments.push({
        name: attachment.name,
        // Drag-and-drop attachments always go to root directory
        path: attachment.name,
        // Image MIME types always start with "image".
        // https://www.iana.org/assignments/media-types/media-types.xhtml
        type: attachment.mimeType.includes("image") ? "image" : "file",
        mimeType: attachment.mimeType,
      });
    }

    return attachments;
  },
};

export function getNoteDirectory(ctx: AppContext): string {
  const { config } = ctx;

  if (config.content.noteDirectory == null) {
    throw new Error(`No note directory set.`);
  }

  return config.content.noteDirectory;
}

export type NoteMetadata = Omit<Note, "content" | "children">;
export type NoteMarkdown = Pick<Note, "content">;
export type NoteFile = NoteMetadata & NoteMarkdown;

export async function loadNotes(
  noteDirectoryPath: string,
  flatten?: boolean,
): Promise<Note[]> {
  if (!fs.existsSync(noteDirectoryPath)) {
    return [];
  }

  const entries = await fs.promises.readdir(noteDirectoryPath, {
    withFileTypes: true,
  });
  const everyNote = (
    await Promise.all(
      entries
        .filter(e => isNoteSubdirectory(noteDirectoryPath, e))
        .map(p => loadNoteFromFS(noteDirectoryPath, p.name)),
    )
  ).map(n => ({ ...n, children: [] }));

  if (!flatten) {
    return buildNoteTree(everyNote);
  } else {
    return everyNote;
  }
}

export function buildNoteTree(flattened: Note[]): Note[] {
  // We nuke children to prevent duplicates when we rebuild the tree.
  const clonedFlattened = cloneDeep(flattened).map(c => ({
    ...c,
    children: [],
  }));
  const [roots, nested] = partition(clonedFlattened, n => n.parent == null);
  const lookup = keyBy<Note>(clonedFlattened, "id");

  for (const n of nested) {
    const parent = lookup[n.parent!];
    if (parent == null) {
      throw new Error(
        `Couldn't find parent note (id: ${n.parent}) for note (id: ${n.id})`,
      );
    }

    parent.children.push(n);
  }

  return roots;
}

export async function saveNoteToFS(
  noteDirectoryPath: string,
  note: NoteFile,
): Promise<void> {
  const notePath = p.join(noteDirectoryPath, note.id);
  if (!fs.existsSync(notePath)) {
    await fs.promises.mkdir(notePath);
  }

  const metadataPath = p.join(notePath, METADATA_FILE_NAME);
  const markdownPath = p.join(notePath, MARKDOWN_FILE_NAME);

  const [metadata, content] = splitNoteIntoFiles(note);
  await writeJson(metadataPath, NOTE_SCHEMAS, metadata);

  if (!fs.existsSync(markdownPath)) {
    const s = await fs.promises.open(markdownPath, "w");
    await s.write(content, null, "utf-8");
    await s.close();
  } else {
    await fs.promises.writeFile(markdownPath, content, {
      encoding: "utf-8",
    });
  }
}

export async function loadNoteFromFS(
  noteDirectoryPath: string,
  noteId: string,
): Promise<NoteFile> {
  const metadataPath = p.join(noteDirectoryPath, noteId, METADATA_FILE_NAME);
  const metadata = await loadJson<NoteMetadata>(metadataPath, NOTE_SCHEMAS);

  const markdownPath = p.join(noteDirectoryPath, noteId, MARKDOWN_FILE_NAME);
  const markdown = await fs.promises.readFile(markdownPath, {
    encoding: "utf-8",
  });

  return {
    ...metadata,
    content: markdown,
  };
}

export function splitNoteIntoFiles(note: NoteFile): [NoteMetadata, string] {
  const metadata: NoteMetadata = omit(note, "content", "children");
  return [metadata, note.content];
}

export function isNoteSubdirectory(
  noteDirectoryPath: string,
  entry: fs.Dirent,
): boolean {
  const isMatch = entry.isDirectory() && UUID_REGEX.test(entry.name);
  if (!isMatch) {
    return false;
  }

  const metadataPath = p.join(
    noteDirectoryPath,
    entry.name,
    METADATA_FILE_NAME,
  );
  const markdownPath = p.join(
    noteDirectoryPath,
    entry.name,
    MARKDOWN_FILE_NAME,
  );

  // Attachment directory doesn't need to be checked because it'll be re-created
  // the first time the user attempts to add an attachment.

  return fs.existsSync(metadataPath) && fs.existsSync(markdownPath);
}
