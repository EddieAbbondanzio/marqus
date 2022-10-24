import { createNote } from "../../../src/shared/domain/note";
import { filterOutStaleNoteIds } from "../../../src/shared/ui/app";
import { createState } from "../../__factories__/state";

test("filterOutStaleNoteIds", async () => {
  const note1 = createNote({ id: "1", name: "foo" });
  const note2 = createNote({ id: "2", name: "bar" });
  const nested1 = createNote({ id: "3", name: "baz" });
  note2.children = [nested1];
  nested1.parent = note2.id;

  const ui = createState({
    notes: [note1, note2],
    sidebar: {
      expanded: [note1.id, note2.id],
      selected: [note1.id],
    },
    editor: {
      tabs: [
        { noteId: note1.id },
        { noteId: note2.id },
        { noteId: nested1.id },
        { noteId: "4" },
      ],
      activeTabNoteId: note1.id,
    },
  });

  // Simulate deleting note1
  const filteredUI = filterOutStaleNoteIds(ui, [note2]);
  expect(filteredUI.sidebar.expanded).not.toContain(note1.id);
  expect(filteredUI.sidebar.selected).not.toContain(note1.id);
  expect(filteredUI.editor.tabs).not.toContainEqual({ noteId: note1.id });
  expect(filteredUI.editor.tabs).toContainEqual({ noteId: nested1.id });
  expect(filteredUI.editor.activeTabNoteId).toBe(undefined);
});
