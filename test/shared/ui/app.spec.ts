import { createNote } from "../../../src/shared/domain/note";
import { filterOutStaleNoteIds } from "../../../src/shared/ui/app";
import { createState } from "../../__factories__/state";

test("filterOutStaleNoteIds", async () => {
  const note1 = createNote({ id: " 1", name: "foo" });
  const note2 = createNote({ id: " 2", name: "bar" });

  const ui = createState({
    notes: [note1, note2],
    sidebar: {
      expanded: [note1.id, note2.id],
      selected: [note1.id],
    },
    editor: {
      tabs: [{ noteId: note1.id }, { noteId: note2.id }],
      activeTabNoteId: note1.id,
    },
  });

  // Simulate deleting note1
  const filteredUI = filterOutStaleNoteIds(ui, [note2]);
  expect(filteredUI.sidebar.expanded).not.toContain(note1.id);
  expect(filteredUI.sidebar.selected).not.toContain(note1.id);
  expect(filteredUI.editor.tabs).not.toContain(
    expect.objectContaining({ noteId: note1.id })
  );
  expect(filteredUI.editor.activeTabNoteId).toBe(undefined);
});
