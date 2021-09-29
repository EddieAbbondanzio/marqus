import { persist } from "@/store/plugins/persist/persist";
import { Commit, createComposable, Module } from "vuex-smart-module";
import { NoteActions } from "@/store/modules/notes/actions";
import { NoteMutations } from "@/store/modules/notes/mutations";
import { NoteGetters } from "@/store/modules/notes/getters";
import { Note, NoteState } from "@/store/modules/notes/state";
import { fileSystem } from "@/utils/file-system";
import moment from "moment";
import path from "path";
import { MutationPayload } from "vuex";
import { isId } from "@/utils";

export const NOTE_DIRECTORY = "notes";
export const NOTE_CONTENT_FILE_NAME = "index.md";

export async function loadNoteContent(noteId: string) {
  return await fileSystem.readText(path.join(NOTE_DIRECTORY, noteId, NOTE_CONTENT_FILE_NAME), { root: true });
}

export async function saveNoteContent(noteId: string, content: string) {
  await fileSystem.writeText(path.join(NOTE_DIRECTORY, noteId, NOTE_CONTENT_FILE_NAME), content);
}

export async function serialize(
  s: NoteState,
  { rootState, mutationPayload, commit }: { rootState: any; mutationPayload: MutationPayload; commit: Commit<any> }
) {
  switch (mutationPayload.type as `notes/${keyof NoteMutations}`) {
  // id was passed
  case "notes/CREATE":
    await saveNoteToFileSystem(rootState, mutationPayload.payload.value);
    break;

  case "notes/DELETE":
    await fileSystem.deleteDirectory(path.join(NOTE_DIRECTORY, mutationPayload.payload.value));
    break;

  case "notes/EMPTY_TRASH":
    throw Error("Not implemented");

  case "notes/MARK_ALL_NOTES_SAVED":
    // Don't remove! Prevents infinite loop
    break;

    // Catch-all so we don't have to keep explicitly adding new cases
  default:
    await saveChangedNotes(rootState, commit);
    break;
  }
}

export async function deserialize() {
  if (!fileSystem.exists(NOTE_DIRECTORY)) {
    fileSystem.createDirectory(NOTE_DIRECTORY);
  }

  const noteDirectories = await fileSystem.readDirectory(NOTE_DIRECTORY);
  const notes = [];

  for (let i = 0; i < noteDirectories.length; i++) {
    const noteId = noteDirectories[i];

    // Regex test what we found to ensure it's actually a note. This is not a catch all...
    if (isId(noteId)) {
      const metaData = await fileSystem.readJSON(path.join(NOTE_DIRECTORY, noteId, "metadata.json"));

      const note: Note = {
        id: noteId,
        name: metaData.name,
        created: moment(metaData.created).toDate(),
        modified: moment(metaData.modified).toDate(),
        notebooks: metaData.notebooks ?? [],
        tags: metaData.tags ?? [],
        trashed: metaData.trashed,
        favorited: metaData.favorited
      };

      notes.push(note);
    }
  }

  return {
    values: notes
  };
}

export async function saveChangedNotes(rootState: any, commit: Commit<any>) {
  const notes = rootState.notes.values.filter((n: any) => n.hasUnsavedChanges);

  if (notes.length === 0) {
    return;
  }

  for (const note of notes) {
    await saveNoteToFileSystem(rootState, note);
  }

  commit("notes/MARK_ALL_NOTES_SAVED");
}

export async function saveNoteToFileSystem(rootState: any, noteOrId: Note | string) {
  let note: Note;

  if (noteOrId == null) {
    throw Error("No note or id passed");
  }

  if (typeof noteOrId === "string") {
    note = rootState.notes.values.find((n: any) => n.id === noteOrId)!;
  } else {
    note = noteOrId;
  }

  const directoryPath = path.join(NOTE_DIRECTORY, note.id);

  // Create parent directory if needed
  if (!fileSystem.exists(directoryPath)) {
    await fileSystem.createDirectory(directoryPath);
  }

  // Create empty attachment directory if needed
  const attachmentPath = path.join(directoryPath, "attachments");
  if (!fileSystem.exists(attachmentPath)) {
    await fileSystem.createDirectory(attachmentPath);
  }

  // Create empty index.md if needed.
  const indexPath = path.join(directoryPath, "index.md");
  if (!fileSystem.exists(indexPath)) {
    await fileSystem.writeText(indexPath, "");
  }

  const json = {
    name: note.name,
    created: note.created,
    modified: note.modified,
    notebooks: note.notebooks,
    tags: note.tags,
    trashed: note.trashed,
    favorited: note.favorited
  };

  await fileSystem.writeJSON(path.join(directoryPath, "metadata.json"), json);
}

export const notes = new Module({
  namespaced: true,
  actions: NoteActions,
  mutations: NoteMutations,
  getters: NoteGetters,
  state: NoteState
});

export const useNotes = createComposable(notes);

persist.register({
  namespace: "notes",
  setStateAction: "setState",
  serialize,
  deserialize
});
