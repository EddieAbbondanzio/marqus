import { RpcRegistry } from "../../shared/rpc";
import {
  createDirectory,
  exists as exists,
  readDirectory,
  readFile,
  writeFile,
} from "../fileSystem";
import * as path from "path";
import { NotFoundError } from "../../shared/errors";
import { createNote, getNoteSchema, Note } from "../../shared/domain/note";
import moment from "moment";
import {
  isResourceId,
  parseResourceId,
  resourceId,
  UUID_REGEX,
} from "../../shared/domain/id";

export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const CONTENT_FILE_NAME = "content.md";

export const noteRpcs: RpcRegistry<"notes"> = {
  "notes.getAll": async () => {
    /*
     * Since we can't perform async loads within components we'll build a massive
     * map of every note we can find in the file system and send it over to the
     * renderer. Then we can do our filtering on the front end.
     */

    if (!exists(NOTES_DIRECTORY)) {
      await createDirectory(NOTES_DIRECTORY);
      return [];
    }

    const noteSchema = getNoteSchema();
    let items: Note[] = [];
    const entries = await readDirectory(NOTES_DIRECTORY);
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
    if (!exists(NOTES_DIRECTORY)) {
      await createDirectory(NOTES_DIRECTORY);
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

    await saveMetadata(note);

    return note;
  },
  "notes.rename": async (input) => {
    if (!exists(NOTES_DIRECTORY)) {
      await createDirectory(NOTES_DIRECTORY);
    }

    const [, bareId] = parseResourceId(input.id);
    const notePath = path.join(NOTES_DIRECTORY, bareId);
    if (!exists(notePath)) {
      throw new NotFoundError(`Note ${input.id} not found in the file system.`);
    }

    const note = await loadMetadata(bareId);
    note.name = input.name;
    note.dateUpdated = new Date();
    await saveMetadata(note);

    return note;
  },
};

export async function saveMetadata(note: Note): Promise<void> {
  const [, rawId] = parseResourceId(note.id);
  const dirPath = path.join(NOTES_DIRECTORY, rawId);
  if (!exists(dirPath)) {
    await createDirectory(dirPath);
  }

  const metadataPath = path.join(NOTES_DIRECTORY, rawId, METADATA_FILE_NAME);
  const { type, ...metadata } = note;

  await writeFile(metadataPath, metadata, "json");
}

export async function loadMetadata(noteId: string): Promise<Note> {
  const metadataPath = path.join(NOTES_DIRECTORY, noteId, METADATA_FILE_NAME);
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
