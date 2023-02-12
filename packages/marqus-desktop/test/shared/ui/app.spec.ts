import { subMinutes } from "date-fns";
import { createNote } from "../../../src/shared/domain/note";
import { filterOutStaleNoteIds } from "../../../src/shared/ui/appState";
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
        { note: note1 },
        { note: note2, lastActive: subMinutes(new Date(), 10) },
        { note: nested1, lastActive: subMinutes(new Date(), 3) },
        { note: createNote({ name: "stale-note" }) },
      ],
      activeTabNoteId: note1.id,
    },
  });

  // Simulate deleting note1
  const filteredUI = filterOutStaleNoteIds(ui, [note2]);
  expect(filteredUI.sidebar.expanded).not.toContain(note1.id);
  expect(filteredUI.sidebar.selected).not.toContain(note1.id);
  expect(filteredUI.editor.tabs).not.toContainEqual({ note: note1 });
  expect(filteredUI.editor.tabs).toContainEqual(
    expect.objectContaining({ note: nested1 }),
  );

  // New active note should be set to previously most recently opened tab
  expect(filteredUI.editor.activeTabNoteId).toBe(nested1.id);
});
