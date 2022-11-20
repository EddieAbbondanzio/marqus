import {
  buildNoteTree,
  loadNoteFromFS,
  MARKDOWN_FILE_NAME,
  METADATA_FILE_NAME,
  NoteFile,
  noteIpcs,
  NoteMetadata,
  NOTES_DIRECTORY,
  saveNoteToFS,
  splitNoteIntoFiles,
} from "../../src/main/notes";
import { createConfig } from "../__factories__/config";
import { createIpcMainTS } from "../__factories__/ipc";
import { createJsonFile } from "../__factories__/json";
import { createLogger } from "../__factories__/logger";
import { uuid } from "../../src/shared/domain";
import mockFS, { load } from "mock-fs";
import { omit } from "lodash";
import {
  createNote,
  CreateNoteParams,
  getNoteById,
  NoteSort,
} from "../../src/shared/domain/note";
import { NOTE_SCHEMAS } from "../../src/main/schemas/notes";
import { getLatestSchemaVersion } from "../../src/main/schemas/utils";
import * as fs from "fs";
import * as path from "path";
import { loadJson } from "../../src/main/json";
import { IpcType } from "../../src/shared/ipc";

afterAll(() => {
  mockFS.restore();
});

function createMetadata(props?: Partial<NoteMetadata>): NoteMetadata {
  props ??= {};
  props.name ??= `test-note-${uuid()}`;
  props.version ??= getLatestSchemaVersion(NOTE_SCHEMAS);

  const metadata: NoteMetadata = omit(
    createNote(props as CreateNoteParams),
    "children",
  );
  return metadata;
}

const FAKE_DATA_DIRECTORY = "fake-data-dir";

test("init", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({ dataDirectory: FAKE_DATA_DIRECTORY }),
  );
  noteIpcs(ipc, config, createLogger());

  mockFS({
    [FAKE_DATA_DIRECTORY]: {},
  });

  await ipc.trigger("init");

  expect(fs.existsSync(path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY))).toBe(
    true,
  );
});

test("notes.getAll", async () => {
  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({ dataDirectory: FAKE_DATA_DIRECTORY }),
  );
  noteIpcs(ipc, config, createLogger());

  const noteId = uuid();
  mockFS({
    [FAKE_DATA_DIRECTORY]: {
      [NOTES_DIRECTORY]: {
        [noteId]: {
          [METADATA_FILE_NAME]: JSON.stringify(createMetadata({ id: noteId })),
          [MARKDOWN_FILE_NAME]: "fizzbuzz",
        },
        // Ignored
        "not-a-note-dir": {},
        // Ignored
        "random-file": "lol",
      },
    },
  });

  const notes = await ipc.invoke("notes.getAll");

  expect(notes).toHaveLength(1);
  expect(notes).toContainEqual(expect.objectContaining({ id: noteId }));
});

test("notes.create", async () => {
  mockFS({
    [FAKE_DATA_DIRECTORY]: {
      [NOTES_DIRECTORY]: {},
    },
  });

  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({ dataDirectory: FAKE_DATA_DIRECTORY }),
  );
  noteIpcs(ipc, config, createLogger());

  const note = await ipc.invoke("notes.create", {
    name: "foo",
    parent: uuid(),
  });

  const noteFromFS = await loadNoteFromFS(
    path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY),
    note.id,
  );

  expect(note).toEqual(omit(noteFromFS, "version"));
});

test("notes.update", async () => {
  mockFS({
    [FAKE_DATA_DIRECTORY]: {
      [NOTES_DIRECTORY]: {},
    },
  });
  const noteDirectory = path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY);

  const ipc = createIpcMainTS();
  const config = createJsonFile(
    createConfig({ dataDirectory: FAKE_DATA_DIRECTORY }),
  );
  noteIpcs(ipc, config, createLogger());

  let note: NoteFile = createNote({
    name: "foo",
    sort: NoteSort.Alphanumeric,
    content: "og-content",
    parent: undefined,
  });
  expect(note.dateUpdated).toBe(undefined);
  await saveNoteToFS(noteDirectory, note);

  // Rename
  await ipc.invoke("notes.update", note.id, { name: "bar" });
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.name).toBe("bar");
  expect(note.dateUpdated).not.toBe(undefined);

  // Update sort
  await ipc.invoke("notes.update", note.id, { sort: NoteSort.DateCreated });
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.sort).toBe(NoteSort.DateCreated);

  // No-op. Prevent accidental unsetting.
  await ipc.invoke("notes.update", note.id, {});
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.sort).toBe(NoteSort.DateCreated);

  // Reset sort to default
  await ipc.invoke("notes.update", note.id, { sort: undefined });
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.sort).toBe(undefined);

  // Update content
  await ipc.invoke("notes.update", note.id, { content: "updated-text" });
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.content).toBe("updated-text");

  // Change parent
  const parent = uuid();
  await ipc.invoke("notes.update", note.id, { parent });
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.parent).toBe(parent);

  // No-op. Prevent accidentally unsetting parent if omitted.
  await ipc.invoke("notes.update", note.id, {});
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.parent).toBe(parent);

  // Unset parent
  await ipc.invoke("notes.update", note.id, { parent: undefined });
  note = await loadNoteFromFS(noteDirectory, note.id);
  expect(note.parent).toBe(undefined);
});

test.each(["notes.delete", "notes.moveToTrash"])(
  "%s no children",
  async ipcType => {
    const note = createNote({ name: "foo" });
    const [metadata, content] = splitNoteIntoFiles(note);
    mockFS({
      [FAKE_DATA_DIRECTORY]: {
        [NOTES_DIRECTORY]: {
          [note.id]: {
            [MARKDOWN_FILE_NAME]: JSON.stringify(metadata),
            [METADATA_FILE_NAME]: content,
          },
        },
      },
    });
    const noteDirectory = path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY);

    const ipc = createIpcMainTS();
    const config = createJsonFile(
      createConfig({ dataDirectory: FAKE_DATA_DIRECTORY }),
    );
    noteIpcs(ipc, config, createLogger());

    await ipc.invoke(ipcType as IpcType, note.id);
    expect(await fs.existsSync(path.join(noteDirectory, note.id))).toBe(false);
  },
);

test.each(["notes.delete", "notes.moveToTrash"])(
  "%s note has children",
  async ipcType => {
    const parentId = uuid();
    const child1Id = uuid();
    const child2Id = uuid();
    const grandchildId = uuid();

    mockFS({
      [FAKE_DATA_DIRECTORY]: {
        [NOTES_DIRECTORY]: {
          [parentId]: {
            [METADATA_FILE_NAME]: JSON.stringify(
              createMetadata({ id: parentId }),
            ),
            [MARKDOWN_FILE_NAME]: "",
          },
          [child1Id]: {
            [METADATA_FILE_NAME]: JSON.stringify(
              createMetadata({ id: child1Id, parent: parentId }),
            ),
            [MARKDOWN_FILE_NAME]: "",
          },
          [child2Id]: {
            [METADATA_FILE_NAME]: JSON.stringify(
              createMetadata({ id: child2Id, parent: parentId }),
            ),
            [MARKDOWN_FILE_NAME]: "",
          },
          [grandchildId]: {
            [METADATA_FILE_NAME]: JSON.stringify(
              createMetadata({ id: grandchildId, parent: child1Id }),
            ),
            [MARKDOWN_FILE_NAME]: "",
          },
        },
      },
    });
    const noteDirectory = path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY);

    const ipc = createIpcMainTS();
    const config = createJsonFile(
      createConfig({ dataDirectory: FAKE_DATA_DIRECTORY }),
    );
    noteIpcs(ipc, config, createLogger());

    // TODO: REMOVE once we figure out relationship table alternative
    await ipc.invoke("notes.getAll");

    await ipc.invoke(ipcType as IpcType, parentId);
    expect(await fs.existsSync(path.join(noteDirectory, parentId))).toBe(false);
    expect(await fs.existsSync(path.join(noteDirectory, child1Id))).toBe(false);
    expect(await fs.existsSync(path.join(noteDirectory, child2Id))).toBe(false);
    expect(await fs.existsSync(path.join(noteDirectory, grandchildId))).toBe(
      false,
    );
  },
);

test("buildNoteTree", () => {
  const parent = createNote({ name: "foo" });
  const child = createNote({ name: "bar" });
  child.parent = parent.id;
  parent.children = [child];
  const root = createNote({ name: "baz" });

  const flat = [parent, child, root];
  const [roots, relationships] = buildNoteTree(flat);

  expect(roots).toHaveLength(2);
  expect(roots).not.toContainEqual({ id: child.id });

  const p = getNoteById(roots, parent.id);
  expect(p.children).toHaveLength(1);
  expect(p.children).toContainEqual(expect.objectContaining({ id: child.id }));

  expect(relationships).toHaveLength(1);
  expect(relationships[0]).toEqual([parent.id, child.id]);
});

test("saveNoteToFS new note", async () => {
  mockFS({
    [FAKE_DATA_DIRECTORY]: {
      [NOTES_DIRECTORY]: {},
    },
  });
  const noteDirectoryPath = path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY);

  const note = createNote({
    name: "fizz",
    content: "buzz",
  });

  await saveNoteToFS(noteDirectoryPath, note);
  const notePath = path.join(noteDirectoryPath, note.id);

  expect(fs.existsSync(notePath)).toBe(true);

  const metadataPath = path.join(notePath, METADATA_FILE_NAME);
  const metadata = await loadJson(metadataPath, NOTE_SCHEMAS);
  const [originalMetadata] = splitNoteIntoFiles(note);

  const markdownPath = path.join(notePath, MARKDOWN_FILE_NAME);
  const markdown = await fs.promises.readFile(markdownPath, {
    encoding: "utf-8",
  });

  expect(omit(metadata, "version")).toEqual(originalMetadata);
  expect(markdown).toBe(note.content);
});

test("saveNoteToFS existing note", async () => {
  const existingNote = await createNote({ name: "existing" });
  const [expectedMetadata, expectedContent] = splitNoteIntoFiles(existingNote);

  mockFS({
    [FAKE_DATA_DIRECTORY]: {
      [NOTES_DIRECTORY]: {
        [existingNote.id]: {
          [METADATA_FILE_NAME]: JSON.stringify(expectedMetadata),
          [MARKDOWN_FILE_NAME]: expectedContent,
        },
      },
    },
  });
  const noteDirectoryPath = path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY);
  const notePath = path.join(noteDirectoryPath, existingNote.id);

  await saveNoteToFS(noteDirectoryPath, existingNote);

  expect(fs.existsSync(notePath)).toBe(true);

  const existingMetadataPath = path.join(notePath, METADATA_FILE_NAME);
  const existingMetadata = await loadJson(existingMetadataPath, NOTE_SCHEMAS);

  const existingMarkdownPath = path.join(notePath, MARKDOWN_FILE_NAME);
  const existingMarkdown = await fs.promises.readFile(existingMarkdownPath, {
    encoding: "utf-8",
  });

  expect(existingMetadata).toEqual(expectedMetadata);
  expect(existingMarkdown).toBe(existingNote.content);
});

test("loadNoteFromFS", async () => {
  const existingNote = await createNote({ name: "existing", version: 1 });
  const [expectedMetadata, expectedContent] = splitNoteIntoFiles(existingNote);

  mockFS({
    [FAKE_DATA_DIRECTORY]: {
      [NOTES_DIRECTORY]: {
        [existingNote.id]: {
          [METADATA_FILE_NAME]: JSON.stringify(expectedMetadata),
          [MARKDOWN_FILE_NAME]: expectedContent,
        },
      },
    },
  });

  const loadedNote = await loadNoteFromFS(
    path.join(FAKE_DATA_DIRECTORY, NOTES_DIRECTORY),
    existingNote.id,
  );

  expect(loadedNote).toEqual(omit(existingNote, "children"));
});

test("splitNoteIntoFiles", async () => {
  const note = createNote({ name: "foo", content: "bar", children: [] });
  const [metadata, content] = splitNoteIntoFiles(note);

  expect(metadata).toEqual(omit(note, "children", "content"));
  expect(metadata).not.toHaveProperty("children");
  expect(metadata).not.toHaveProperty("content");

  expect(content).toBe("bar");
});
