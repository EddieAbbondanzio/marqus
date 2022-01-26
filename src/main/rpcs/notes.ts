import { Note } from "../../shared/domain/entities";
import { RpcHandler, RpcRegistry } from "../../shared/rpc";
import { isId } from "../../shared/utils";
import {
  createDirectory,
  exists as exists,
  readDirectory,
  readFile,
} from "../fileSystem";
import * as path from "path";
import { noteSchema } from "../../shared/domain/schemas";

export const NOTES_DIRECTORY = "notes";
export const METADATA_FILE_NAME = "metadata.json";
export const CONTENT_FILE_NAME = "content.md";

const getAll: RpcHandler<"notes.getAll"> = async (): Promise<Note[]> => {
  /*
   * Since we can't perform async loads within components we'll build a massive
   * map of every note we can find in the file system and send it over to the
   * renderer. Then we can do our filtering on the front end.
   */

  if (!exists(NOTES_DIRECTORY)) {
    createDirectory(NOTES_DIRECTORY);
    return [];
  }

  let items: Note[] = [];
  const entries = await readDirectory(NOTES_DIRECTORY);
  for (const entry of entries) {
    // We only care about note directoties
    if (!entry.isDirectory() || !isId(entry.name)) {
      continue;
    }

    const metadataPath = path.join(
      NOTES_DIRECTORY,
      entry.name,
      METADATA_FILE_NAME
    );
    const note: Note = await readFile(metadataPath, "json");
    await noteSchema.validate(note);
    items.push(note);
  }

  return items;
};

export const noteRpcs: RpcRegistry = {
  "notes.getAll": getAll,
};
