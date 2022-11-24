import { createNote, Note, NoteSort } from "../../shared/domain/note";
import { UUID_REGEX } from "../../shared/domain";
import { Config } from "../../shared/domain/config";
import { cloneDeep, difference, keyBy, omit, partition } from "lodash";
import { shell } from "electron";
import { IpcMainTS, NoteUpdateParams } from "../../shared/ipc";
import * as fs from "fs";
import * as fsp from "fs/promises";
import { JsonFile, loadJson, writeJson } from "./../json";
import * as p from "path";
import { Logger } from "../../shared/logger";
import { NOTE_SCHEMAS } from "./../schemas/notes";
import { z } from "zod";
import { isDevelopment } from "../../shared/env";

export const ATTACHMENT_DIRECTORY = "attachments";
export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const MARKDOWN_FILE_NAME = "index.md";

const noteUpdateSchema: z.Schema<NoteUpdateParams> = z.object({
  name: z.string().optional(),
  parent: z.string().optional(),
  sort: z.nativeEnum(NoteSort).optional(),
  content: z.string().optional(),
});

export function noteIpcs(
  ipc: IpcMainTS,
  config: JsonFile<Config>,
  log: Logger,
): void {
  const { dataDirectory } = config.content;
  if (dataDirectory == null) {
    log.debug("No data directory specified. Skipping registering note ipcs.");
    return;
  }
  const noteDirectory = p.join(dataDirectory, NOTES_DIRECTORY);

  ipc.on("init", async () => {
    if (!fs.existsSync(noteDirectory)) {
      await fsp.mkdir(noteDirectory);
    }
  });

  ipc.handle("notes.getAll", async () => {
    if (!fs.existsSync(noteDirectory)) {
      return [];
    }

    return await loadNotes(noteDirectory);
  });

  ipc.handle("notes.create", async (_, params) => {
    const note = createNote(params);
    await saveNoteToFS(noteDirectory, note);

    return note;
  });

  ipc.handle("notes.update", async (_, id, props) => {
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
      log.warn(`ipc notes.update does not support keys: ${diff.join(", ")}`);
    }

    note.dateUpdated = new Date();
    await saveNoteToFS(noteDirectory, note);
  });

  ipc.handle("notes.delete", async (_, id) => {
    // Gonna leave this as-is because it might just be pre-optimizing, but this
    // could be a bottle neck down the road having to load in every note before
    // we can delete one if the user has 100s of notes.
    const everyNote = await loadNotes(noteDirectory, true);

    const recursive = async (noteId: string) => {
      const notePath = p.join(noteDirectory, noteId);
      // fsp.rm doesn't exist in 14.10 but typings include it.
      // TODO: switch to rm when we upgrade from Node 14.10.
      await fsp.rmdir(notePath, { recursive: true });

      const children = everyNote.filter(n => n.parent === noteId);
      for (const child of children) {
        await recursive(child.id);
      }
    };
    await recursive(id);
  });

  ipc.handle("notes.moveToTrash", async (_, id) => {
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
  });

  ipc.handle("notes.openAttachments", async (_, noteId) => {
    // shell.openPath doesn't allow relative paths.
    const attachmentDirPath = p.resolve(
      noteDirectory,
      noteId,
      ATTACHMENT_DIRECTORY,
    );
    if (!fs.existsSync(attachmentDirPath)) {
      await fsp.mkdir(attachmentDirPath);
    }

    const err = await shell.openPath(attachmentDirPath);
    if (err) {
      throw new Error(err);
    }
  });
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

  const entries = await fsp.readdir(noteDirectoryPath, { withFileTypes: true });
  const everyNote = (
    await Promise.all(
      entries
        .filter(isNoteEntry)
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
    await fsp.mkdir(notePath);
  }

  const metadataPath = p.join(notePath, METADATA_FILE_NAME);
  const markdownPath = p.join(notePath, MARKDOWN_FILE_NAME);

  const [metadata, content] = splitNoteIntoFiles(note);
  await writeJson(metadataPath, NOTE_SCHEMAS, metadata);

  if (!fs.existsSync(markdownPath)) {
    const s = await fsp.open(markdownPath, "w");
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
  const markdown = await fsp.readFile(markdownPath, { encoding: "utf-8" });

  return {
    ...metadata,
    content: markdown,
  };
}

export function splitNoteIntoFiles(note: NoteFile): [NoteMetadata, string] {
  const metadata: NoteMetadata = omit(note, "content", "children");
  return [metadata, note.content];
}

export function isNoteEntry(entry: fs.Dirent): boolean {
  return entry.isDirectory() && UUID_REGEX.test(entry.name);
}
