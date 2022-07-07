import { createNote } from "../../../../src/shared/domain/note";
import { filterOutStaleNoteIds } from "../../../../src/shared/domain/ui/sections";
import { createState } from "../../../__factories__/state";

test("filterOutStateNoteIds", () => {
  const deleted = createNote({ name: "foo" });
  const notes = [createNote({ name: "bar" }), createNote({ name: "baz" })];
  let state = createState({
    notes,
    sidebar: {
      selected: [deleted.id],
      expanded: [notes[0].id, deleted.id],
    },
    editor: {
      // content: "stale note content",
      isEditting: true,
      // noteId: deleted.id,
      scroll: 0,
    },
  });

  // state = {
  //   ...filterOutStaleNoteIds(state, notes),
  // };

  // expect(state.editor.content).toBe(undefined);
  // expect(state.editor.scroll).toBe(0);
  // expect(state.editor.noteId).toBe(undefined);
  // expect(state.editor.isEditting).toBe(false);

  // expect(ui.sidebar.selected).not.toContain(deleted.id);
  // expect(ui.sidebar.expanded).not.toContain(deleted.id);
});
