import { createNote, flatten, getNoteById, Note } from "../shared/domain/note";
import { UUID_REGEX } from "../shared/domain";
import { Config } from "../shared/domain/config";
import { cloneDeep, keyBy, omit, partition } from "lodash";
import { shell } from "electron";
import { IpcMainTS } from "../shared/ipc";
import * as fs from "fs";
import * as fsp from "fs/promises";
import { JsonFile, loadJson, writeJson } from "./json";
import * as p from "path";
import { Logger } from "../shared/logger";
import { NOTE_SCHEMAS } from "./schemas/notes";

export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const MARKDOWN_FILE_NAME = "index.md";

export function noteIpcs(
  ipc: IpcMainTS,
  config: JsonFile<Config>,
  log: Logger,
  // Only use this for testing.
  _notes: Note[] = [],
): void {
  const { dataDirectory } = config.content;
  if (dataDirectory == null) {
    return;
  }

  let notes: Note[] = _notes;

  ipc.on("init", async () => {
    const noteDirectory = p.join(dataDirectory, NOTES_DIRECTORY);
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
      const json = await loadJson<Note>(path, NOTE_SCHEMAS);

      // The order notes are loaded in is not guaranteed so we store them in a flat
      // array until we've loaded every last one before we start to rebuild their
      // family trees.
      everyNote.push(json);
    }

    notes = buildNoteTree(everyNote);
  });

  ipc.handle("notes.getAll", async () => {
    return notes;
  });

  ipc.handle("notes.create", async (_, name, parentId) => {
    const note = createNote({
      name,
      parent: parentId,
    });

    const dirPath = p.join(dataDirectory, NOTES_DIRECTORY, note.id);
    if (!fs.existsSync(dirPath)) {
      await fsp.mkdir(dirPath);
    }

    const metadataPath = p.join(
      dataDirectory,
      NOTES_DIRECTORY,
      note.id,
      METADATA_FILE_NAME,
    );
    const markdownPath = p.join(
      dataDirectory,
      NOTES_DIRECTORY,
      note.id,
      MARKDOWN_FILE_NAME,
    );

    await writeJson(metadataPath, NOTE_SCHEMAS, note);

    const s = await fsp.open(markdownPath, "w");
    await s.close();

    // TODO: Clean this up when we refactor
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
    const note = getNoteById(notes, id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, parent, sort, ...others } = props;

    if (name != null) {
      note.name = name;
    }

    // Allow unsetting parent
    if ("parent" in props) {
      note.parent = parent;

      // Bust the cache on parent change
      const flattened = flatten(notes);
      notes = buildNoteTree(flattened);
    }

    // Allow unsetting sort
    if ("sort" in props) {
      note.sort = props.sort;
    }

    // Sanity check to ensure no extra props were passed
    if (Object.keys(others).length > 0) {
      console.warn(
        `ipc notes.updateMetadata does not support keys: ${Object.keys(
          others,
        )}`,
      );
    }

    note.dateUpdated = new Date();
    const meta = omit(note, "children");
    const path = p.join(dataDirectory, NOTES_DIRECTORY, id, METADATA_FILE_NAME);
    writeJson(path, NOTE_SCHEMAS, meta);

    return note;
  });

  ipc.handle("notes.loadContent", async (_, id) => {
    const markdownPath = p.join(
      dataDirectory,
      NOTES_DIRECTORY,
      id,
      MARKDOWN_FILE_NAME,
    );
    return (await fsp.readFile(markdownPath, { encoding: "utf-8" })) ?? "";
  });

  ipc.handle("notes.saveContent", async (_, id, content) => {
    const markdownPath = p.join(
      dataDirectory,
      NOTES_DIRECTORY,
      id,
      MARKDOWN_FILE_NAME,
    );
    await fsp.writeFile(markdownPath, content, { encoding: "utf-8" });

    const note = getNoteById(notes, id);
    note.dateUpdated = new Date();
    const metaDataPath = p.join(
      dataDirectory,
      NOTES_DIRECTORY,
      id,
      METADATA_FILE_NAME,
    );
    writeJson(metaDataPath, NOTE_SCHEMAS, note);
  });

  ipc.handle("notes.delete", async (_, id) => {
    const note = getNoteById(notes, id);

    const recursive = async (n: Note) => {
      const notePath = p.join(dataDirectory, NOTES_DIRECTORY, n.id);
      // N.B. fsp.rm doesn't exist in 14.10 but typings include it.
      await fsp.rmdir(notePath, { recursive: true });

      for (const child of n.children ?? []) {
        await recursive(child);
      }
    };
    await recursive(note);

    if (note.parent == null) {
      notes = notes.filter(n => n.id !== note.id);
    } else {
      const parentNote = getNoteById(notes, note.parent);
      if (parentNote != null && parentNote.children != null) {
        parentNote.children = parentNote.children.filter(c => c.id !== note.id);
      }
    }
  });

  ipc.handle("notes.moveToTrash", async (_, id) => {
    const note = getNoteById(notes, id);

    const recursive = async (n: Note) => {
      const notePath = p.join(dataDirectory, NOTES_DIRECTORY, n.id);
      await shell.trashItem(notePath);

      for (const child of n.children ?? []) {
        await recursive(child);
      }
    };

    await recursive(note);

    if (note.parent == null) {
      notes = notes.filter(n => n.id !== note.id);
    } else {
      const parentNote = getNoteById(notes, note.parent);
      if (parentNote != null && parentNote.children != null) {
        parentNote.children = parentNote.children.filter(c => c.id !== note.id);
      }
    }
  });
}

export function buildNoteTree(flattened: Note[]): Note[] {
  const clonedFlattened = cloneDeep(flattened);

  // We nuke children to prevent duplicates when we rebuild the tree.
  for (const clone of clonedFlattened) {
    clone.children = [];
  }

  const lookup = keyBy(clonedFlattened, "id");

  const [roots, nested] = partition(clonedFlattened, n => n.parent == null);
  for (const n of nested) {
    const parent = lookup[n.parent!];
    if (parent == null) {
      throw new Error(
        `Couldn't find parent note (id: ${n.parent}) for note (id: ${n.id})`,
      );
    }

    parent.children ??= [];
    parent.children.push(n);
  }

  return roots;
}
