import { buildNoteSortMenu } from "../../../src/renderer/menus/contextMenu";
import {
  createNote,
  NoteSort,
  NOTE_SORT_LABELS,
} from "../../../src/shared/domain/note";
import { RadioMenu } from "../../../src/shared/ui/menu";

test("buildNoteSortMenu global sort", () => {
  const menu = buildNoteSortMenu(NoteSort.AlphanumericReversed);

  expect(menu.label).toBe("Sort notes by");
  // doesn't add reset option
  expect(menu.children.length).toBe(Object.keys(NoteSort).length);

  // sets .checked on correct option.
  const checked = menu.children.find(
    (c) => c.type === "radio" && c.checked
  ) as RadioMenu;
  expect(checked.label).toBe(NOTE_SORT_LABELS[NoteSort.AlphanumericReversed]);
});

test("buildNoteSortMenu note sort", () => {
  const note = createNote({ name: "A" });
  let menu = buildNoteSortMenu(NoteSort.AlphanumericReversed, note);

  expect(menu.label).toBe("Sort children by");
  // doesn't add reset option if no custom sort.
  expect(menu.children.length).toBe(Object.keys(NoteSort).length);

  note.sort = NoteSort.DateCreated;
  menu = buildNoteSortMenu(NoteSort.AlphanumericReversed, note);
  // sets .checked on correct option.
  const checked = menu.children.find(
    (c) => c.type === "radio" && c.checked
  ) as RadioMenu;
  expect(checked.label).toBe(NOTE_SORT_LABELS[NoteSort.DateCreated]);

  expect(menu.children.length).toBe(Object.keys(NoteSort).length + 1);
});
