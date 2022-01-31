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
import { isId, uuid } from "../../shared/domain/id";
import { getNoteSchema, Note } from "../../shared/domain/note";

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
      if (!entry.isDirectory() || !isId(entry.name)) {
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

    const note: Note = {
      id: uuid(),
      type: "note",
      dateCreated: new Date(),
      name,
      tags: [],
      notebooks: [],
    };

    if (notebook != null) {
      note.notebooks!.push(notebook);
    }
    if (tag != null) {
      note.tags!.push(tag);
    }

    await createDirectory(path.join(NOTES_DIRECTORY, note.id));
    await saveMetadata(note);

    return note;
  },
  "notes.update": async (input) => {
    if (!exists(NOTES_DIRECTORY)) {
      await createDirectory(NOTES_DIRECTORY);
    }

    const notePath = path.join(NOTES_DIRECTORY, input.id);
    if (!exists(notePath)) {
      throw new NotFoundError(`Note ${input.id} not found in the file system.`);
    }

    const note = await loadMetadata(input.id);
    note.name = input.name;
    note.dateUpdated = new Date();
    await saveMetadata(note);

    return note;
  },
};

async function saveMetadata(note: Note): Promise<void> {
  const metadataPath = path.join(NOTES_DIRECTORY, note.id, METADATA_FILE_NAME);
  await writeFile(metadataPath, note, "json");
}

async function loadMetadata(noteId: string): Promise<Note> {
  const metadataPath = path.join(NOTES_DIRECTORY, noteId, METADATA_FILE_NAME);
  const note: Note = await readFile(metadataPath, "json");
  await getNoteSchema().validate(note);

  return note;
}
