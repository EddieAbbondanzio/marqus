import { Note } from "./entities";
import {
  uuid,
  ID_LENGTH,
  isId,
  globalId,
  parseGlobalId,
  getNotesForTag,
} from "./utils";

test("uuid()", () => {
  const a = uuid();
  const b = uuid();
  expect(a).toHaveLength(ID_LENGTH);
  expect(b).toHaveLength(ID_LENGTH);
  expect(a).not.toEqual(b);
});

test("isId()", () => {
  const id = uuid();
  const notId = "12345##@6";
  expect(isId(id)).toBe(true);
  expect(isId(notId)).toBe(false);
});

test("fullyQualifyId()", () => {
  const id = uuid();
  const fullyQualified = globalId("tag", id);
  expect(fullyQualified).toBe(`tag.${id}`);
});

test("parseGlobalId() works", () => {
  const id = uuid();
  const fullyQualified = globalId("tag", id);
  const split = parseGlobalId(fullyQualified);

  expect(split).toHaveLength(2);
  expect(split[0]).toBe("tag");
  expect(split[1]).toBe(id);
});

test("parseGlobalId() throws on invalid type", () => {
  const id = uuid();
  const fq = `foo.${id}`;
  expect(() => {
    parseGlobalId(fq);
  }).toThrow();
});

test("getNotesForTag() returns notes", () => {
  const n1 = {
    id: "1",
    tags: ["tag-a"],
  } as Note;
  const n2 = {
    id: "2",
    tags: ["tag-b"],
  } as Note;
  const n3 = {
    id: "3",
    tags: ["tag-a", "tag-b"],
  } as Note;

  const matches = getNotesForTag([n1, n2, n3], "tag-a");
  expect(matches).toHaveLength(2);
  expect(matches).toEqual([n1, n3]);
});
