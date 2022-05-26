import { addDays } from "date-fns";
import {
  createNote,
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

  expect(sorted.map((n) => n.name)).toEqual([
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

  expect(sorted.map((n) => n.name)).toEqual([
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
  expect(sorted.map((n) => n.name)).toEqual(["1", "2", "3", "4", "5", "6"]);
});

test("sortNotes date created reversed", () => {
  const notes = [
    createNote({ name: "5", dateCreated: addDays(new Date(), 5) }),
    createNote({ name: "1", dateCreated: addDays(new Date(), 1) }),
    createNote({ name: "3", dateCreated: addDays(new Date(), 3) }),
    createNote({ name: "6", dateCreated: addDays(new Date(), 6) }),
    createNote({ name: "2", dateCreated: addDays(new Date(), 2) }),
    createNote({ name: "4", dateCreated: addDays(new Date(), 4) }),
  ];

  const sorted = sortNotes(notes, NoteSort.DateCreatedReversed);
  expect(sorted.map((n) => n.name)).toEqual(["6", "5", "4", "3", "2", "1"]);
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
  expect(sorted.map((n) => n.name)).toEqual(["1", "2", "3", "4", "5", "6"]);
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
  expect(sorted.map((n) => n.name)).toEqual(["6", "5", "4", "3", "2", "1"]);
});

test("sortNotes manual", () => {
  const notes = [
    createNote({ name: "5", sortIndex: 5 }),
    createNote({ name: "1", sortIndex: 1 }),
    createNote({ name: "3", sortIndex: 3 }),
    createNote({ name: "4", sortIndex: 4 }),
    createNote({ name: "2", sortIndex: 2 }),
    createNote({ name: "6", sortIndex: 6 }),
  ];

  const sorted = sortNotes(notes, NoteSort.Manual);
  expect(sorted.map((n) => n.name)).toEqual(["1", "2", "3", "4", "5", "6"]);
});

test("getParents", () => {
  const note = createNote({ name: "Bert" });
  const parent = createNote({ name: "Pa", children: [note] });
  const grandParent = createNote({ name: "Grandpa", children: [parent] });

  const parents = getParents(note, [grandParent]);
  expect(parents).toEqual([parent, grandParent]);
});
