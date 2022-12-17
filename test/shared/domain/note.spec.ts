import { addDays } from "date-fns";
import { uuid } from "../../../src/shared/domain";
import {
  createNote,
  flatten,
  getFullPath,
  getNoteById,
  getNoteByPath,
  getParents,
  NoteSort,
  sortNotes,
} from "../../../src/shared/domain/note";

test("sortNotes alphanumeric", () => {
  const notes = [
    createNote({ name: "charlie" }),
    createNote({ name: "Echo" }),
    createNote({ name: "1" }),
    createNote({ name: "Delta" }),
    createNote({ name: "bravo" }),
    createNote({ name: "2" }),
    createNote({ name: "3" }),
    createNote({ name: "alpha" }),
  ];

  const sorted = sortNotes(notes, NoteSort.Alphanumeric);

  expect(sorted.map(n => n.name)).toEqual([
    "1",
    "2",
    "3",
    "alpha",
    "bravo",
    "charlie",
    "Delta",
    "Echo",
  ]);
});

test("sortNotes alphanumeric reversed", () => {
  const notes = [
    createNote({ name: "charlie" }),
    createNote({ name: "Echo" }),
    createNote({ name: "1" }),
    createNote({ name: "Delta" }),
    createNote({ name: "bravo" }),
    createNote({ name: "2" }),
    createNote({ name: "3" }),
    createNote({ name: "alpha" }),
  ];

  const sorted = sortNotes(notes, NoteSort.AlphanumericReversed);

  expect(sorted.map(n => n.name)).toEqual([
    "Echo",
    "Delta",
    "charlie",
    "bravo",
    "alpha",
    "3",
    "2",
    "1",
  ]);
});

test("sortNotes date created", () => {
  const notes = [
    createNote({ name: "5", dateCreated: addDays(new Date(), 5) }),
    createNote({ name: "1", dateCreated: addDays(new Date(), 1) }),
    createNote({ name: "3", dateCreated: addDays(new Date(), 3) }),
    createNote({ name: "6", dateCreated: addDays(new Date(), 6) }),
    createNote({ name: "2", dateCreated: addDays(new Date(), 2) }),
    createNote({ name: "4", dateCreated: addDays(new Date(), 4) }),
  ];

  const sorted = sortNotes(notes, NoteSort.DateCreated);
  expect(sorted.map(n => n.name)).toEqual(["6", "5", "4", "3", "2", "1"]);
});

test("sortNotes date created reversed", () => {
  const notes = [
    createNote({ name: "4", dateCreated: addDays(new Date(), 4) }),
    createNote({ name: "5", dateCreated: addDays(new Date(), 5) }),
    createNote({ name: "1", dateCreated: addDays(new Date(), 1) }),
    createNote({ name: "3", dateCreated: addDays(new Date(), 3) }),
    createNote({ name: "6", dateCreated: addDays(new Date(), 6) }),
    createNote({ name: "2", dateCreated: addDays(new Date(), 2) }),
  ];

  const sorted = sortNotes(notes, NoteSort.DateCreatedReversed);
  expect(sorted.map(n => n.name)).toEqual(["1", "2", "3", "4", "5", "6"]);
});

test("sortNotes date updated", () => {
  const notes = [
    createNote({ name: "5", dateUpdated: addDays(new Date(), 5) }),
    createNote({ name: "1", dateUpdated: addDays(new Date(), 1) }),
    createNote({ name: "3", dateUpdated: addDays(new Date(), 3) }),
    createNote({ name: "6", dateUpdated: undefined }),
    createNote({ name: "2", dateUpdated: addDays(new Date(), 2) }),
    createNote({ name: "4", dateUpdated: addDays(new Date(), 4) }),
  ];

  const sorted = sortNotes(notes, NoteSort.DateUpdated);
  expect(sorted.map(n => n.name)).toEqual(["1", "2", "3", "4", "5", "6"]);
});

test("sortNotes date updated reversed", () => {
  const notes = [
    createNote({ name: "5", dateUpdated: addDays(new Date(), 5) }),
    createNote({ name: "1", dateUpdated: addDays(new Date(), 1) }),
    createNote({ name: "3", dateUpdated: addDays(new Date(), 3) }),
    createNote({ name: "6", dateUpdated: undefined }),
    createNote({ name: "2", dateUpdated: addDays(new Date(), 2) }),
    createNote({ name: "4", dateUpdated: addDays(new Date(), 4) }),
  ];

  const sorted = sortNotes(notes, NoteSort.DateUpdatedReversed);
  expect(sorted.map(n => n.name)).toEqual(["6", "5", "4", "3", "2", "1"]);
});

test("sortNotes works recursively", () => {
  const notes = [
    createNote({ name: "alpha" }),
    createNote({ name: "charlie" }),
    createNote({
      name: "beta",
      sort: NoteSort.AlphanumericReversed,
      children: [createNote({ name: "delta" }), createNote({ name: "echo" })],
    }),
  ];

  const sorted = sortNotes(notes, NoteSort.Alphanumeric);
  expect(sorted[0].name).toBe("alpha");
  expect(sorted[1].name).toBe("beta");
  expect(sorted[2].name).toBe("charlie");

  // Ensure it used beta's custom sort
  const beta = sorted[1]!;
  expect(beta.children![0]?.name).toBe("echo");
  expect(beta.children![1]?.name).toBe("delta");
});

test("getNoteById", () => {
  const alphaId = uuid();
  const deltaId = uuid();
  const notes = [
    createNote({ id: alphaId, name: "alpha" }),
    createNote({ name: "charlie" }),
    createNote({
      name: "beta",
      children: [
        createNote({ id: deltaId, name: "delta" }),
        createNote({ name: "echo" }),
      ],
    }),
  ];

  // Get Root
  expect(getNoteById(notes, alphaId).name).toBe("alpha");

  // Get nested
  expect(getNoteById(notes, deltaId).name).toBe("delta");

  // Get required but not found
  expect(() => {
    getNoteById(notes, uuid(), true);
  }).toThrow();

  // Get non-required but not found
  expect(getNoteById(notes, uuid(), false)).toBe(null);
});

test("getNoteByPath", () => {
  const notes = [
    createNote({ name: "alpha" }),
    createNote({ name: "charlie" }),
    createNote({
      name: "beta",
      children: [createNote({ name: "delta" }), createNote({ name: "echo" })],
    }),
  ];

  // Get Root
  expect(getNoteByPath(notes, "alpha").name).toBe("alpha");

  // Get nested
  expect(getNoteByPath(notes, "beta/delta").name).toBe("delta");

  // Get required but not found
  expect(() => {
    getNoteByPath(notes, "alpha/omega", true);
  }).toThrow();

  // Get non-required but not found
  expect(getNoteByPath(notes, "alpha/omega", false)).toBe(null);
});

test("flatten", () => {
  const nested1 = createNote({ name: "Nested 1" });
  const nested2 = createNote({ name: "Nested 2" });
  const middle = createNote({ name: "Middle", children: [nested1, nested2] });
  const outer1 = createNote({ name: "Outer 1", children: [middle] });
  const outer2 = createNote({ name: "Outer 2" });

  const flat = flatten([outer1, outer2]);
  expect(flat).toEqual([outer1, middle, nested1, nested2, outer2]);
});

test("getParents", () => {
  const note = createNote({ name: "Bert" });
  const parent = createNote({ name: "Pa", children: [note] });
  const grandParent = createNote({ name: "Grandpa", children: [parent] });

  const parents = getParents(note, [grandParent]);
  expect(parents).toEqual([parent, grandParent]);
});

test("getFullPath", () => {
  const rootNote = createNote({ name: "root" });
  const rootNote2 = createNote({
    name: "root2",
    children: [
      createNote({
        name: "nested",
        children: [createNote({ name: "super nested" })],
      }),
    ],
  });

  const notes = [rootNote, rootNote2];

  expect(getFullPath(notes, rootNote)).toBe("root");
  expect(getFullPath(notes, rootNote2)).toBe("root2");
  expect(getFullPath(notes, rootNote2.children[0]!)).toBe("root2/nested");
  expect(getFullPath(notes, rootNote2.children[0]!.children[0]!)).toBe(
    "root2/nested/super nested",
  );
});
