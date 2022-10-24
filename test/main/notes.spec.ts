import {
  buildNoteTree,
  MARKDOWN_FILE_NAME,
  METADATA_FILE_NAME,
  noteIpcs,
  NOTES_DIRECTORY,
} from "../../src/main/notes";
import { createConfig } from "../__factories__/config";
import { createIpcMainTS } from "../__factories__/ipc";
import { createJsonFile } from "../__factories__/json";
import { createLogger } from "../__factories__/logger";
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
import { uuid } from "../../src/shared/domain";
import { loadJson, writeJson } from "../../src/main/json";
import {
  createNote,
  getNoteById,
  NoteSort,
} from "../../src/shared/domain/note";
import { NOTE_SCHEMAS } from "../../src/main/schemas/notes";
import { shell } from "electron";

jest.mock("fs");
jest.mock("fs/promises");
jest.mock("../../src/main/json");

test("init", async () => {
  // Creates note directory if missing
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig({ dataDirectory: "foo" }));

  noteIpcs(ipc, config, createLogger());

  (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
  (fsp.readdir as jest.Mock).mockReturnValueOnce([]);

  await ipc.trigger("init");

  const noteDirPath = path.join("foo", NOTES_DIRECTORY);
  expect(fsp.mkdir).toHaveBeenCalledWith(noteDirPath);

  // Loads notes
  (fsp.readdir as jest.Mock).mockReset();

  (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
  (fsp.readdir as jest.Mock).mockReturnValueOnce([
    { name: uuid(), isDirectory: jest.fn().mockReturnValueOnce(true) },
    // Ignored
    {
      name: "not-a-note-dir",
      isDirectory: jest.fn().mockReturnValueOnce(true),
    },
    // Ignored
    { name: "random-file", isDirectory: jest.fn().mockReturnValueOnce(false) },
  ]);

  const note = createNote({
    id: uuid(),
    name: "foo",
  });

  (loadJson as jest.Mock).mockReturnValueOnce(note);
  await ipc.trigger("init");
  const notes = await ipc.invoke("notes.getAll");
  expect(notes).toHaveLength(1);
  expect(notes).toContainEqual(expect.objectContaining({ id: note.id }));
});

test("notes.create", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  noteIpcs(ipc, config, createLogger());

  (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
  (fsp.open as jest.Mock).mockReturnValueOnce({
    close: jest.fn(),
  });

  const note = await ipc.invoke("notes.create", "foo");
  expect(fsp.mkdir).toHaveBeenCalledWith(`/data/notes/${note.id}`);

  // Creates metadata
  expect(writeJson).toHaveBeenCalledWith(
    `/data/notes/${note.id}/${METADATA_FILE_NAME}`,
    NOTE_SCHEMAS,
    expect.objectContaining({
      id: note.id,
      name: "foo",
    }),
  );

  // Creates markdown
  expect(fsp.open).toHaveBeenLastCalledWith(
    `/data/notes/${note.id}/${MARKDOWN_FILE_NAME}`,
    "w",
  );
});

test("notes.updateMetadata", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  let note = createNote({ name: "foo" });
  noteIpcs(ipc, config, createLogger(), [note]);

  expect(note.dateUpdated).toBe(undefined);

  note = await ipc.invoke("notes.updateMetadata", note.id, {
    name: "bar",
    sort: NoteSort.DateCreated,
  });

  expect(note.name).toBe("bar");
  expect(note.sort).toBe(NoteSort.DateCreated);
  expect(note.dateUpdated).not.toBe(undefined);

  note = await ipc.invoke("notes.updateMetadata", note.id, {
    sort: undefined,
  });
  expect(note.sort).toBe(undefined);
});

test("notes.updateMetadata root -> nested", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  let note = createNote({ name: "foo" });
  const parent = createNote({ name: "bar" });
  noteIpcs(ipc, config, createLogger(), [note, parent]);

  note = await ipc.invoke("notes.updateMetadata", note.id, {
    parent: parent.id,
  });
  expect(note.parent).toBe(parent.id);

  // When a note is moved to a parent, it will be moved to the parents .children
  // and no longer in the root array.
  const rootNotes = await ipc.invoke("notes.getAll");
  expect(rootNotes).not.toContainEqual({ id: note.id });
});

test("notes.updateMetadata nested -> root", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  const parent = createNote({ name: "bar" });
  let note = createNote({ name: "foo", parent: parent.id });
  noteIpcs(ipc, config, createLogger(), [note, parent]);

  let rootNotes = await ipc.invoke("notes.getAll");
  expect(rootNotes).not.toContainEqual({ id: note.id });

  note = await ipc.invoke("notes.updateMetadata", note.id, {
    parent: undefined,
  });
  expect(note.parent).toBe(undefined);

  rootNotes = await ipc.invoke("notes.getAll");
  expect(rootNotes).toContainEqual(expect.objectContaining({ id: note.id }));
});

test("notes.loadContent", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());
  noteIpcs(ipc, config, createLogger());

  (fsp.readFile as jest.Mock).mockReturnValueOnce("foo");
  await ipc.invoke("notes.loadContent", "123");

  expect(fsp.readFile).toHaveBeenCalledWith(
    `/data/notes/123/${MARKDOWN_FILE_NAME}`,
    { encoding: "utf-8" },
  );
});

test("notes.saveContent", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  const note = createNote({ name: "foo" });
  expect(note.dateUpdated).toBe(undefined);
  noteIpcs(ipc, config, createLogger(), [note]);

  await ipc.invoke("notes.saveContent", note.id, "Random content...");

  expect(fsp.writeFile).toHaveBeenCalledWith(
    `/data/notes/${note.id}/${MARKDOWN_FILE_NAME}`,
    "Random content...",
    { encoding: "utf-8" },
  );

  const everyNote = await ipc.invoke("notes.getAll");
  // Sets updated at date.
  const updatedNote = getNoteById(everyNote, note.id);

  expect(updatedNote.dateUpdated).not.toBe(undefined);
});

test("notes.delete", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  const note = createNote({
    name: "foo",
  });
  const child1 = createNote({ name: "bar" });
  const child2 = createNote({ name: "baz" });
  note.children = [child1, child2];
  child1.parent = note.id;
  child2.parent = note.id;

  noteIpcs(ipc, config, createLogger(), [note]);
  await ipc.invoke("notes.delete", note.id);

  expect(fsp.rmdir).toHaveBeenCalledTimes(3);
  expect(fsp.rmdir).toHaveBeenCalledWith(`/data/notes/${note.id}`, {
    recursive: true,
  });
  expect(fsp.rmdir).toHaveBeenCalledWith(
    `/data/notes/${note.children![0].id}`,
    {
      recursive: true,
    },
  );
  expect(fsp.rmdir).toHaveBeenCalledWith(
    `/data/notes/${note.children![1].id}`,
    {
      recursive: true,
    },
  );
});

test("notes.moveToTrash", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(createConfig());

  const note = createNote({
    name: "foo",
  });
  const child1 = createNote({ name: "bar" });
  const child2 = createNote({ name: "baz" });
  note.children = [child1, child2];
  child1.parent = note.id;
  child2.parent = note.id;
  noteIpcs(ipc, config, createLogger(), [note]);

  await ipc.invoke("notes.moveToTrash", note.id);

  expect(shell.trashItem).toBeCalledTimes(3);
  expect(shell.trashItem).toBeCalledWith(`/data/notes/${note.id}`);
  expect(shell.trashItem).toBeCalledWith(`/data/notes/${child1.id}`);
  expect(shell.trashItem).toBeCalledWith(`/data/notes/${child2.id}`);
});

test("buildNoteTree", () => {
  const parent = createNote({ name: "foo" });
  const child = createNote({ name: "bar" });
  child.parent = parent.id;
  parent.children = [child];
  const root = createNote({ name: "baz" });

  const flat = [parent, child, root];
  const roots = buildNoteTree(flat);

  expect(roots).toHaveLength(2);
  expect(roots).not.toContainEqual({ id: child.id });

  const p = getNoteById(roots, parent.id);
  expect(p.children).toHaveLength(1);
  expect(p.children).toContainEqual(expect.objectContaining({ id: child.id }));
});
