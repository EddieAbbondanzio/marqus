import { IpcRegistry } from "../../shared/ipc";
import {
  createDirectory,
  deleteDirectory,
  exists as exists,
  readDirectory,
  readFile,
  touch,
  writeFile,
} from "../fileSystem";
import * as path from "path";
import { NotFoundError } from "../../shared/errors";
import { createNote, getNoteSchema, Note } from "../../shared/domain/note";
import moment from "moment";
import { parseResourceId, UUID_REGEX } from "../../shared/domain/id";
import { getConfig } from "./config";

export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const MARKDOWN_FILE_NAME = "index.md";

export const noteIpcs: IpcRegistry<"notes"> = {
  "notes.getAll": async () => {
    /*
     * Since we can't perform async loads within components we'll build a massive
     * map of every note we can find in the file system and send it over to the
     * renderer. Then we can do our filtering on the front end.
     */

    const { dataDirectory } = await getConfig({ required: true });
    const noteSchema = getNoteSchema();
    let items: Note[] = [];
    const entries = await readDirectory(
      path.join(dataDirectory, NOTES_DIRECTORY)
    );
    for (const entry of entries) {
      // We only care about note directoties
      if (!entry.isDirectory() || !UUID_REGEX.test(entry.name)) {
        continue;
      }

      const note = await loadMetadata(entry.name);
      items.push(note);
    }

    return items;
  },
  "notes.create": async ({ name, notebook, tag }) => {
    const { dataDirectory } = await getConfig({ required: true });

    const dirPath = path.join(dataDirectory, NOTES_DIRECTORY);
    if (!exists(dirPath)) {
      await createDirectory(dirPath);
    }

    const note = createNote({
      name,
    });

    if (notebook != null) {
      note.notebooks ??= [];
      note.notebooks.push(notebook);
    }
    if (tag != null) {
      note.tags ??= [];
      note.tags.push(tag);
    }

    await saveToFileSystem(note);

    return note;
  },
  "notes.rename": async (input) => {
    const [, bareId] = parseResourceId(input.id);
    await assertNoteExists(input.id);

    const note = await loadMetadata(bareId);
    note.name = input.name;
    note.dateUpdated = new Date();
    await saveToFileSystem(note);

    return note;
  },
  "notes.loadContent": async (id) => {
    const [, bareId] = parseResourceId(id);
    await assertNoteExists(id);

    const content = await loadMarkdown(bareId);
    return content;
  },
  "notes.saveContent": async ({ id, content }) => {
    const [, bareId] = parseResourceId(id);
    await assertNoteExists(id);

    await saveMarkdown(bareId, content);
  },
  "notes.delete": async ({ id }) => {
    const [, bareId] = parseResourceId(id);
    const { dataDirectory } = await getConfig({ required: true });
    const noteDir = path.join(dataDirectory, NOTES_DIRECTORY, bareId);

    await deleteDirectory(noteDir);
  },
};

export async function assertNoteExists(id: string): Promise<void> {
  const [, bareId] = parseResourceId(id);
  const { dataDirectory } = await getConfig({ required: true });

  const dirPath = path.join(dataDirectory, NOTES_DIRECTORY);
  if (!exists(dirPath)) {
    await createDirectory(dirPath);
  }

  const fullPath = path.join(dataDirectory, NOTES_DIRECTORY, bareId);
  if (!exists(fullPath)) {
    throw new NotFoundError(`Note ${id} was not found in the file system.`);
  }
}

export async function saveToFileSystem(note: Note): Promise<void> {
  const [, rawId] = parseResourceId(note.id);
  const { dataDirectory } = await getConfig({ required: true });
  const dirPath = path.join(dataDirectory, NOTES_DIRECTORY, rawId);
  if (!exists(dirPath)) {
    await createDirectory(dirPath);
  }

  const metadataPath = path.join(
    dataDirectory,
    NOTES_DIRECTORY,
    rawId,
    METADATA_FILE_NAME
  );
  const markdownPath = path.join(
    dataDirectory,
    NOTES_DIRECTORY,
    rawId,
    MARKDOWN_FILE_NAME
  );
  const { type, ...metadata } = note;

  await writeFile(metadataPath, metadata, "json");
  await touch(markdownPath);
}

export async function loadMetadata(noteId: string): Promise<Note> {
  const { dataDirectory } = await getConfig({ required: true });
  const metadataPath = path.join(
    dataDirectory,
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

export async function loadMarkdown(noteId: string): Promise<string | null> {
  const { dataDirectory } = await getConfig({ required: true });
  const markdownPath = path.join(
    dataDirectory,
    NOTES_DIRECTORY,
    noteId,
    MARKDOWN_FILE_NAME
  );
  return (await readFile(markdownPath, "text")) ?? "";
}
export async function saveMarkdown(
  noteId: string,
  content: string
): Promise<void> {
  const { dataDirectory } = await getConfig({ required: true });
  const markdownPath = path.join(
    dataDirectory,
    NOTES_DIRECTORY,
    noteId,
    MARKDOWN_FILE_NAME
  );

  return await writeFile(markdownPath, content, "text");
}
