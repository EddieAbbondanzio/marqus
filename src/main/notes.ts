import {
  createNote,
  getNoteById,
  Note,
  NOTE_SCHEMA,
} from "../shared/domain/note";
import { UUID_REGEX } from "../shared/domain";
import { Config } from "../shared/domain/config";
import { keyBy, partition } from "lodash";
import { shell } from "electron";
import { parseJSON } from "date-fns";
import { IpcMainTS } from "../shared/ipc";
import * as fs from "fs";
import * as fsp from "fs/promises";
import { JsonFile, loadJson } from "./json";
import * as p from "path";
import { Logger } from "../shared/logger";

export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const MARKDOWN_FILE_NAME = "index.md";

export function noteIpcs(
  ipc: IpcMainTS,
  config: JsonFile<Config>,
  log: Logger
): void {
  let notes: Note[] = [];

  ipc.on("init", async () => {
    const noteDirectory = p.join(
      config.content.dataDirectory!,
      NOTES_DIRECTORY
    );
    if (!fs.existsSync(noteDirectory)) {
      await fsp.mkdir(noteDirectory);
    }

    const entries = await fsp.readdir(noteDirectory, { withFileTypes: true });
    const everyNote: Note[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !UUID_REGEX.test(entry.name)) {
        continue;
      }

      const path = p.join(noteDirectory, entry.name, METADATA_FILE_NAME);
      const json = await loadJson<Note>(path, {});

      // The order notes are loaded in is not guaranteed so we store them in a flat
      // array until we've loaded every last one before we start to rebuild their
      // family trees.
      everyNote.push(json);
    }

    const lookup = keyBy(everyNote, "id");
    const [roots, children] = partition(everyNote, (n) => n.parent == null);
    for (const child of children) {
      const parent = lookup[child.parent!];
      if (parent == null) {
        log.warn(
          `WARNING: Note ${child.id} is an orphan. No parent ${child.parent} found. Did you mean to delete it?`
        );

        continue;
      }

      parent.children ??= [];
      parent.children.push(child);
    }

    notes = roots;
  });

  ipc.handle("notes.getAll", async () => {
    return notes;
  });

  ipc.handle("notes.create", async (_, name, parentId) => {
    const note = createNote({
      name,
      parent: parentId,
    });

    await saveToFileSystem(config.content.dataDirectory!, note);

    // TODO: Clean this up when we refactor to a repo.
    // Bust the cache

    if (parentId == null) {
      notes.push(note);
    } else {
      const parentNote = getNoteById(notes, parentId);
      parentNote.children ??= [];
      parentNote.children.push(parentNote);
    }

    return note;
  });

  ipc.handle("notes.updateMetadata", async (_, id, props) => {
    await assertNoteExists(config.content.dataDirectory!, id);

    const metadataPath = buildNotePath(
      config.content.dataDirectory!,
      id,
      "metadata"
    );
    const rawContent = await fsp.readFile(metadataPath, { encoding: "utf-8" });
    const meta = JSON.parse(rawContent);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, parent, sort, ...others } = props;

    if (name != null) {
      meta.name = name;
    }
    // Allow unsetting parent
    if ("parent" in props) {
      meta.parent = parent;
    }

    // Allow unsetting sort
    if ("sort" in props) {
      meta.sort = props.sort;
    }

    // Sanity check to ensure no extra props were passed
    if (Object.keys(others).length > 0) {
      console.warn(
        `ipc notes.updateMetadata does not support keys: ${Object.keys(others)}`
      );
    }

    meta.dateUpdated = new Date();
    delete meta.children;

    await saveToFileSystem(config.content.dataDirectory!, meta);
    return getNoteById(notes, meta.id);
  });

  ipc.handle("notes.loadContent", async (_, id) => {
    await assertNoteExists(config.content.dataDirectory!, id);

    const content = await loadMarkdown(config.content.dataDirectory!, id);
    return content;
  });

  ipc.handle("notes.saveContent", async (_, id, content) => {
    await assertNoteExists(config.content.dataDirectory!, id);
    await saveMarkdown(config.content.dataDirectory!, id, content);
  });

  ipc.handle("notes.delete", async (_, id) => {
    const note = getNoteById(notes, id);

    const recursive = async (n: Note) => {
      const notePath = buildNotePath(config.content.dataDirectory!, n.id);
      await fsp.rm(notePath, { recursive: true });

      for (const child of n.children ?? []) {
        await recursive(child);
      }
    };
    recursive(note);

    if (note.parent == null) {
      notes = notes.filter((n) => n.id !== note.id);
    } else {
      const parentNote = getNoteById(notes, note.parent);
      if (parentNote != null && parentNote.children != null) {
        parentNote.children = parentNote.children.filter(
          (c) => c.id !== note.id
        );
      }
    }
  });

  ipc.handle("notes.moveToTrash", async (_, id) => {
    const note = getNoteById(notes, id);

    const recursive = async (n: Note) => {
      const notePath = buildNotePath(config.content.dataDirectory!, n.id);
      await shell.trashItem(notePath);

      for (const child of n.children ?? []) {
        await recursive(child);
      }
    };

    recursive(note);

    if (note.parent == null) {
      notes = notes.filter((n) => n.id !== note.id);
    } else {
      const parentNote = getNoteById(notes, note.parent);
      if (parentNote != null && parentNote.children != null) {
        parentNote.children = parentNote.children.filter(
          (c) => c.id !== note.id
        );
      }
    }
  });
}

export async function loadNotes(dataDirectory: string): Promise<Note[]> {
  const noteDirPath = p.join(dataDirectory, NOTES_DIRECTORY);
  if (!fs.existsSync(noteDirPath)) {
    await fsp.mkdir(noteDirPath);

    // No directory means no notes
    return [];
  }

  const entries = await fsp.readdir(noteDirPath, { withFileTypes: true });
  const notes: Note[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !UUID_REGEX.test(entry.name)) {
      continue;
    }

    const metadataPath = buildNotePath(dataDirectory, entry.name, "metadata");
    const rawContent = await fsp.readFile(metadataPath, { encoding: "utf-8" });
    const meta = JSON.parse(rawContent);

    const { dateCreated, dateUpdated, ...remainder } = meta;

    const note = createNote({
      dateCreated: parseJSON(dateCreated),
      dateUpdated: dateUpdated != null ? parseJSON(dateUpdated) : undefined,
      ...remainder,
    });
    await NOTE_SCHEMA.parseAsync(note);

    // We don't add children until every note has been loaded because there's a
    // chance children will be loaded before their parent.
    notes.push(note);
  }

  const lookup = keyBy(notes, "id");
  const [roots, children] = partition(notes, (n) => n.parent == null);
  for (const child of children) {
    const parent = lookup[child.parent!];
    if (parent == null) {
      console.warn(
        `WARNING: Note ${child.id} is an orphan. No parent ${child.parent} found. Did you mean to delete it?`
      );

      continue;
    }

    (parent.children ??= []).push(child);
  }

  return roots;
}

export async function assertNoteExists(
  dataDirectory: string,
  id: string
): Promise<void> {
  const fullPath = p.join(dataDirectory, NOTES_DIRECTORY, id);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Note ${id} was not found in the file system.`);
  }
}

export async function saveToFileSystem(
  dataDirectory: string,
  note: Note
): Promise<void> {
  const dirPath = p.join(dataDirectory, NOTES_DIRECTORY, note.id);
  if (!fs.existsSync(dirPath)) {
    await fsp.mkdir(dirPath);
  }

  const metadataPath = buildNotePath(dataDirectory, note.id, "metadata");
  const markdownPath = buildNotePath(dataDirectory, note.id, "markdown");

  await fsp.writeFile(metadataPath, JSON.stringify(note), {
    encoding: "utf-8",
  });

  const s = await fsp.open(markdownPath, "w");
  await s.close();
}

export async function loadMarkdown(
  dataDirectory: string,
  noteId: string
): Promise<string | null> {
  const markdownPath = buildNotePath(dataDirectory, noteId, "markdown");
  return (await fsp.readFile(markdownPath, { encoding: "utf-8" })) ?? "";
}
export async function saveMarkdown(
  dataDirectory: string,
  noteId: string,
  content: string
): Promise<void> {
  const markdownPath = buildNotePath(dataDirectory, noteId, "markdown");
  await fsp.writeFile(markdownPath, content, { encoding: "utf-8" });
}

export function buildNotePath(
  dataDirectory: string,
  noteId: string,
  file?: "markdown" | "metadata"
): string {
  if (file == null) {
    return p.join(dataDirectory, NOTES_DIRECTORY, noteId);
  }

  switch (file) {
    case "markdown":
      return p.join(dataDirectory, NOTES_DIRECTORY, noteId, MARKDOWN_FILE_NAME);
    case "metadata":
      return p.join(dataDirectory, NOTES_DIRECTORY, noteId, METADATA_FILE_NAME);

    default:
      throw new Error(`Can't build path for ${file}`);
  }
}
