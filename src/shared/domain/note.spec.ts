import { Note, getNotesForTag } from "./note";
import { Tag } from "./tag";

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

  const matches = getNotesForTag([n1, n2, n3], { id: "tag-a" } as Tag);
  expect(matches).toHaveLength(2);
  expect(matches).toEqual([n1, n3]);
});
