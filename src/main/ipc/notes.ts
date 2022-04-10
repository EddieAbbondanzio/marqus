import {
  createDirectory,
  deleteDirectory,
  exists as exists,
  readDirectory,
  readFile,
  touch,
  writeFile,
} from "../fileSystem";
import { NotFoundError } from "../../shared/errors";
import { createNote, getNoteSchema, Note } from "../../shared/domain/note";
import moment from "moment";
import { parseResourceId, UUID_REGEX } from "../../shared/domain";
import { IpcPlugin } from "../types";
import { getPathInDataDirectory } from "../fileHandler";
import { Config } from "../../shared/domain/config";
import { Dictionary, values } from "lodash";

// Messy...

export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const MARKDOWN_FILE_NAME = "index.md";

export const useNoteIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle("notes.getAll", async () => {
    /*
     * Since we can't perform async loads within components we'll build a
     * map of every note we can find in the file system and send it over to the
     * renderer. Then we can do our filtering on the front end.
     */

    const noteDirPath = getPathInDataDirectory(config, NOTES_DIRECTORY);
    if (!exists(noteDirPath)) {
      await createDirectory(noteDirPath);
    }
    const entries = await readDirectory(noteDirPath);
    const noteLookup: Dictionary<Note> = {};

    for (const entry of entries) {
      if (!entry.isDirectory() || !UUID_REGEX.test(entry.name)) {
        continue;
      }

      const note = await loadMetadata(config, entry.name);
      noteLookup[note.id] = note;
    }

    const nested = values(noteLookup).filter((n) => n.parent != null);
    for (const note of nested) {
      const parent = noteLookup[note.parent!];
      parent.children ??= [];
      parent.children.push(note);
    }

    return values(noteLookup).filter((n) => n.parent == null);
  });

  ipc.handle("notes.create", async ({ name, parent: parent }) => {
    const dirPath = getPathInDataDirectory(config, NOTES_DIRECTORY);
    if (!exists(dirPath)) {
      await createDirectory(dirPath);
    }

    const note = createNote({
      name,
      parent,
    });

    await saveToFileSystem(config, note);

    return note;
  });

  ipc.handle("notes.updateMetadata", async (input) => {
    const [, bareId] = parseResourceId(input.id);
    await assertNoteExists(config, input.id);

    const note = await loadMetadata(config, bareId);
    const { id, name, parent, ...others } = input;

    if (name != null) {
      note.name = name;
    }
    // Allow unsetting parent
    // eslint-disable-next-line no-prototype-builtins
    if (input.hasOwnProperty("parent")) {
      note.parent = input.parent;
    }

    // Sanity check
    if (Object.keys(others).length > 0) {
      console.warn(`ipc notes.updateMetadata does not support ${others}`);
    }

    note.dateUpdated = new Date();
    await saveToFileSystem(config, note);

    return note;
  });

  ipc.handle("notes.loadContent", async (id) => {
    const [, bareId] = parseResourceId(id);
    await assertNoteExists(config, id);

    const content = await loadMarkdown(config, bareId);
    return content;
  });

  ipc.handle("notes.saveContent", async ({ id, content }) => {
    const [, bareId] = parseResourceId(id);
    await assertNoteExists(config, id);

    await saveMarkdown(config, bareId, content);
  });

  ipc.handle("notes.delete", async ({ id }) => {
    const [, bareId] = parseResourceId(id);
    const notePath = getPathInDataDirectory(config, NOTES_DIRECTORY, bareId);

    await deleteDirectory(notePath);
  });
};

export async function assertNoteExists(
  config: Config,
  id: string
): Promise<void> {
  const [, bareId] = parseResourceId(id);

  const dirPath = getPathInDataDirectory(config, NOTES_DIRECTORY);
  if (!exists(dirPath)) {
    await createDirectory(dirPath);
  }

  const fullPath = getPathInDataDirectory(config, NOTES_DIRECTORY, bareId);
  if (!exists(fullPath)) {
    throw new NotFoundError(`Note ${id} was not found in the file system.`);
  }
}

export async function saveToFileSystem(
  config: Config,
  note: Note
): Promise<void> {
  const [, rawId] = parseResourceId(note.id);
  const dirPath = getPathInDataDirectory(config, NOTES_DIRECTORY, rawId);
  if (!exists(dirPath)) {
    await createDirectory(dirPath);
  }

  const metadataPath = getPathInDataDirectory(
    config,
    NOTES_DIRECTORY,
    rawId,
    METADATA_FILE_NAME
  );
  const markdownPath = getPathInDataDirectory(
    config,
    NOTES_DIRECTORY,
    rawId,
    MARKDOWN_FILE_NAME
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, ...metadata } = note;

  await writeFile(metadataPath, metadata, "json");
  await touch(markdownPath);
}

export async function loadMetadata(
  config: Config,
  noteId: string
): Promise<Note> {
  const metadataPath = getPathInDataDirectory(
    config,
    NOTES_DIRECTORY,
    noteId,
    METADATA_FILE_NAME
  );
  const { dateCreated, dateUpdated, ...props }: any = await readFile(
    metadataPath,
    "json"
  );

  const note = createNote({
    dateCreated: moment(dateCreated).toDate(),
    ...props,
  });

  if (dateUpdated != null) {
    note.dateUpdated = moment(dateUpdated).toDate();
  }

  await getNoteSchema().validate(note);

  return note;
}

export async function loadMarkdown(
  config: Config,
  noteId: string
): Promise<string | null> {
  const markdownPath = getPathInDataDirectory(
    config,
    NOTES_DIRECTORY,
    noteId,
    MARKDOWN_FILE_NAME
  );
  return (await readFile(markdownPath, "text")) ?? "";
}
export async function saveMarkdown(
  config: Config,
  noteId: string,
  content: string
): Promise<void> {
  const markdownPath = getPathInDataDirectory(
    config,
    NOTES_DIRECTORY,
    noteId,
    MARKDOWN_FILE_NAME
  );

  return await writeFile(markdownPath, content, "text");
}
