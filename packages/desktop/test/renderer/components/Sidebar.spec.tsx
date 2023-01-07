import { Sidebar } from "../../../src/renderer/components/Sidebar";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import {
  createNote,
  DEFAULT_NOTE_SORTING_ALGORITHM,
  getNoteById,
  NoteSort,
} from "../../../src/shared/domain/note";
import * as prompt from "../../../src/renderer/utils/prompt";
import { Section } from "../../../src/shared/ui/app";
import { createStore } from "../../__factories__/store";
import { uuid } from "../../../src/shared/domain";

const promptConfirmAction = jest.spyOn(prompt, "promptConfirmAction");

test("sidebar.clearSelection", async () => {
  const noteFooId = uuid();
  const noteBarId = uuid();

  const store = createStore({
    notes: [
      createNote({ id: noteFooId, name: "foo" }),
      createNote({ id: noteBarId, name: "bar" }),
    ],
    sidebar: {
      selected: [noteFooId, noteBarId],
    },
  });
  render(<Sidebar store={store.current} />);

  await act(async () => {
    await store.current.dispatch("sidebar.clearSelection");
  });

  const {
    state: { sidebar },
  } = store.current;
  expect(sidebar.selected).toBe(undefined);
});

test("sidebar.setSelection", async () => {
  const noteFooId = uuid();
  const noteBarId = uuid();

  const store = createStore({
    notes: [
      createNote({ id: noteFooId, name: "foo" }),
      createNote({ id: noteBarId, name: "bar" }),
    ],
    sidebar: {
      selected: [],
    },
  });
  render(<Sidebar store={store.current} />);

  await act(async () => {
    await store.current.dispatch("sidebar.setSelection", [noteFooId]);
  });

  expect(store.current.state.sidebar.selected).toEqual([noteFooId]);

  await act(async () => {
    await store.current.dispatch("sidebar.setSelection", [noteBarId]);
  });

  expect(store.current.state.sidebar.selected).toEqual([noteBarId]);
});

test("sidebar.moveSelectionDown no notes", async () => {
  const store = createStore({
    notes: [],
    sidebar: {
      selected: [],
    },
  });
  render(<Sidebar store={store.current} />);

  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionDown");
  });

  expect(store.current.state.sidebar.selected).toEqual([]);
});

test.each(["sidebar.moveSelectionDown", "sidebar.moveSelectionUp"])(
  "%s defaults to topmost note",
  async ev => {
    const note1Id = uuid();
    const note2Id = uuid();
    const note3Id = uuid();

    const store = createStore({
      notes: [
        createNote({ id: note1Id, name: "alpha" }),
        createNote({ id: note2Id, name: "beta" }),
        createNote({ id: note3Id, name: "charlie" }),
      ],
      sidebar: {
        selected: [],
        sort: NoteSort.Alphanumeric,
      },
    });
    const r = render(<Sidebar store={store.current} />);

    await act(async () => {
      await store.current.dispatch(ev as any);
    });
    r.rerender(<Sidebar store={store.current} />);
    expect(store.current.state.sidebar.selected).toEqual([note1Id]);
  },
);

test("sidebar.moveSelectionDown", async () => {
  const note1Id = uuid();
  const note2Id = uuid();
  const note3Id = uuid();

  const store = createStore({
    notes: [
      createNote({ id: note1Id, name: "alpha" }),
      createNote({ id: note2Id, name: "beta" }),
      createNote({ id: note3Id, name: "charlie" }),
    ],
    sidebar: {
      selected: [note1Id],
      sort: NoteSort.Alphanumeric,
    },
  });
  const r = render(<Sidebar store={store.current} />);

  // Moves down one
  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionDown");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.selected).toEqual([note2Id]);

  // Moves down one
  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionDown");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.selected).toEqual([note3Id]);

  // Stops when no more notes to move down
  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionDown");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.selected).toEqual([note3Id]);
});

test("sidebar.moveSelectionUp no notes", async () => {
  const store = createStore({
    notes: [],
    sidebar: {
      selected: [],
    },
  });
  render(<Sidebar store={store.current} />);

  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionUp");
  });

  expect(store.current.state.sidebar.selected).toEqual([]);
});

test("sidebar.moveSelectionUp", async () => {
  const note1Id = uuid();
  const note2Id = uuid();
  const note3Id = uuid();

  const store = createStore({
    notes: [
      createNote({ id: note1Id, name: "alpha" }),
      createNote({ id: note2Id, name: "beta" }),
      createNote({ id: note3Id, name: "charlie" }),
    ],
    sidebar: {
      selected: [note3Id],
      sort: NoteSort.Alphanumeric,
    },
  });
  const r = render(<Sidebar store={store.current} />);

  // Moves up one
  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionUp");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.selected).toEqual([note2Id]);

  // Moves up one
  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionUp");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.selected).toEqual([note1Id]);

  // Stops when no more notes to move up
  await act(async () => {
    await store.current.dispatch("sidebar.moveSelectionUp");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.selected).toEqual([note1Id]);
});

test("sidebar.toggleNoteExpanded", async () => {
  const note1Id = uuid();
  const note2Id = uuid();
  const note3Id = uuid();
  const nestedId = uuid();

  const store = createStore({
    notes: [
      createNote({ id: note1Id, name: "alpha" }),
      createNote({ id: note2Id, name: "beta" }),
      createNote({
        id: note3Id,
        name: "charlie",
        children: [createNote({ id: nestedId, name: "delta" })],
      }),
    ],
    sidebar: {
      selected: [],
      sort: NoteSort.Alphanumeric,
    },
  });
  const r = render(<Sidebar store={store.current} />);

  // Expand note
  await act(async () => {
    await store.current.dispatch("sidebar.toggleNoteExpanded", note3Id);
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.expanded).toEqual([note3Id]);

  // Set nested note as selected.
  await act(async () => {
    await store.current.dispatch("sidebar.setSelection", [nestedId]);
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.selected).toEqual([nestedId]);

  // Un-expand note
  await act(async () => {
    await store.current.dispatch("sidebar.toggleNoteExpanded", note3Id);
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.expanded).toEqual([]);
  expect(store.current.state.sidebar.selected).toEqual([]);

  // Attempt to expand note without children
  await act(async () => {
    await store.current.dispatch("sidebar.toggleNoteExpanded", note2Id);
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.expanded).toEqual([]);
});

test("sidebar.toggleSelectedNoteExpanded", async () => {
  const note1Id = uuid();
  const note2Id = uuid();
  const note3Id = uuid();
  const nestedId = uuid();

  const store = createStore({
    notes: [
      createNote({ id: note1Id, name: "alpha" }),
      createNote({ id: note2Id, name: "beta" }),
      createNote({
        id: note3Id,
        name: "charlie",
        children: [createNote({ id: nestedId, name: "delta" })],
      }),
    ],
    sidebar: {
      selected: [note3Id],
      sort: NoteSort.Alphanumeric,
    },
  });
  const r = render(<Sidebar store={store.current} />);

  // Expand note
  await act(async () => {
    await store.current.dispatch("sidebar.toggleSelectedNoteExpanded");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.expanded).toEqual([note3Id]);

  // Un-expand note
  await act(async () => {
    await store.current.dispatch("sidebar.toggleSelectedNoteExpanded");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.expanded).toEqual([]);

  await act(async () => {
    await store.current.dispatch("sidebar.setSelection", [note2Id]);
  });
  r.rerender(<Sidebar store={store.current} />);

  // Attempt to expand note without children
  await act(async () => {
    await store.current.dispatch("sidebar.toggleSelectedNoteExpanded");
  });
  r.rerender(<Sidebar store={store.current} />);
  expect(store.current.state.sidebar.expanded).toEqual([]);
});

test("sidebar.createNote confirm", async () => {
  const store = createStore();
  const res = render(<Sidebar store={store.current} />);

  // Start
  let dispatchPromise: Promise<unknown>;
  act(() => {
    dispatchPromise = store.current.dispatch("sidebar.createNote", null);
  });
  expect(store.current.state.focused).toEqual(["sidebarInput"]);

  // Populate input
  res.rerender(<Sidebar store={store.current} />);
  fireEvent.change(res.getByTestId("sidebar-input"), {
    target: { value: "foo" },
  });
  expect(store.current.state.sidebar.input?.value).toBe("foo");

  // Mock return value of window.ipc("notes.create", ...)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((window as any).ipc as jest.Mock).mockReturnValue(
    createNote({
      name: "foo",
    }),
  );

  // Trigger confirm
  await act(async () => {
    fireEvent.keyDown(res.getByTestId("sidebar-input"), { code: "Enter" });
    await dispatchPromise;
  });

  const { state } = store.current;
  const note = state.notes[0];
  expect(note).toEqual(
    expect.objectContaining({
      name: "foo",
    }),
  );
  expect(state.focused).toEqual(["editor"]);
  expect(state.sidebar.selected).toEqual([note.id]);
  expect(state.editor).toEqual(
    expect.objectContaining({
      isEditing: true,
      activeTabNoteId: note.id,
      tabs: expect.arrayContaining([
        expect.objectContaining({
          note,
        }),
      ]),
    }),
  );
});

test("sidebar.createNote expands parent", async () => {
  const store = createStore({
    notes: [createNote({ id: "parent-note", name: "parent" })],
  });
  render(<Sidebar store={store.current} />);

  await act(async () => {
    void store.current.dispatch("sidebar.createNote", {
      parent: "parent-note",
    });
  });

  const { state } = store.current;
  expect(state.focused).toEqual(["sidebarInput"]);
  expect(state.sidebar.expanded).toContain("parent-note");
});

test("sidebar.createNote uses selected as parent", async () => {
  const store = createStore({
    notes: [createNote({ id: "parent-note", name: "parent" })],
    sidebar: {
      selected: ["parent-note"],
    },
  });
  render(<Sidebar store={store.current} />);

  await act(async () => {
    void store.current.dispatch("sidebar.createNote", undefined);
  });

  const { state } = store.current;
  expect(state.focused).toEqual(["sidebarInput"]);
  expect(state.sidebar.expanded).toContain("parent-note");
});

test("sidebar.createNote respects root flag", async () => {
  const store = createStore({
    notes: [createNote({ id: "parent-note", name: "parent" })],
    sidebar: {
      selected: ["parent-note"],
    },
  });
  render(<Sidebar store={store.current} />);

  await act(async () => {
    void store.current.dispatch("sidebar.createNote", { root: true });
  });

  const { state } = store.current;
  expect(state.focused).toEqual(["sidebarInput"]);
  expect(state.sidebar.input.parentId).toBe(undefined);
});

test("sidebar.createNote escape cancels", async () => {
  const store = createStore();
  const res = render(<Sidebar store={store.current} />);

  // Start
  let dispatchPromise: Promise<unknown>;
  act(() => {
    dispatchPromise = store.current.dispatch("sidebar.createNote", null);
  });
  expect(store.current.state.focused).toEqual([Section.SidebarInput]);

  // Populate input
  res.rerender(<Sidebar store={store.current} />);
  fireEvent.change(res.getByTestId("sidebar-input"), {
    target: { value: "foo" },
  });
  expect(store.current.state.sidebar.input?.value).toBe("foo");

  // Trigger cancel
  await act(async () => {
    fireEvent.keyDown(res.getByTestId("sidebar-input"), { code: "Escape" });
    await dispatchPromise;
  });

  const { state } = store.current;
  expect(state.notes).toHaveLength(0);
  expect(state.sidebar.input).toBe(undefined);
});

test.each(["cancel", "confirm"])("sidebar.renameNote (%s)", async action => {
  const noteAId = uuid();
  const noteBId = uuid();

  const store = createStore({
    notes: [
      createNote({ id: noteAId, name: "A" }),
      createNote({ id: noteBId, name: "B" }),
    ],
    sidebar: {
      selected: [noteBId],
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    focused: [Section.Sidebar],
  });

  const r = render(<Sidebar store={store.current} />);

  let dispatchPromise: Promise<void>;
  act(() => {
    dispatchPromise = store.current.dispatch("sidebar.renameNote", noteAId);
  });

  const { state: initialState } = store.current;
  expect(initialState.focused).toEqual([Section.SidebarInput, Section.Sidebar]);
  expect(initialState.sidebar.input).toMatchObject({
    id: noteAId,
    value: "A",
  });

  // Simulate user typing into input
  r.rerender(<Sidebar store={store.current} />);
  const sidebarInput = r.getByTestId("sidebar-input");

  await act(async () => {
    fireEvent.change(sidebarInput, { target: { value: "Alpha" } });
  });

  const { state: changedState } = store.current;
  expect(changedState.sidebar.input.value).toBe("Alpha");

  if (action === "confirm") {
    await act(async () => {
      fireEvent.keyDown(sidebarInput, { code: "Enter" });
      await dispatchPromise;
    });

    const { state: finalState } = store.current;
    expect(finalState.sidebar.input).toBe(undefined);
    const renamedNote = finalState.notes.find(n => n.id === noteAId);
    expect(renamedNote).toMatchObject({
      id: noteAId,
      name: "Alpha",
    });

    const untouchedNote = finalState.notes.find(n => n.id === noteBId);
    expect(untouchedNote.name).toBe("B");
  } else {
    await act(async () => {
      fireEvent.keyDown(sidebarInput, { code: "Escape" });
      await dispatchPromise;
    });

    const { state: finalState } = store.current;
    expect(finalState.sidebar.input).toBe(undefined);
    const renamedNote = finalState.notes.find(n => n.id === noteAId);
    expect(renamedNote).toMatchObject({
      id: noteAId,
      name: "A",
    });

    const untouchedNote = finalState.notes.find(n => n.id === noteBId);
    expect(untouchedNote.name).toBe("B");
  }
});

test.each(["cancel", "confirm"])(
  "sidebar.renameSelectedNote (%s)",
  async action => {
    const noteAId = uuid();
    const noteBId = uuid();

    const store = createStore({
      notes: [
        createNote({ id: noteAId, name: "A" }),
        createNote({ id: noteBId, name: "B" }),
      ],
      sidebar: {
        selected: [noteBId],
        sort: DEFAULT_NOTE_SORTING_ALGORITHM,
      },
      focused: [Section.Sidebar],
    });

    const r = render(<Sidebar store={store.current} />);

    let dispatchPromise: Promise<void>;
    act(() => {
      dispatchPromise = store.current.dispatch("sidebar.renameSelectedNote");
    });

    const { state: initialState } = store.current;
    expect(initialState.focused).toEqual([
      Section.SidebarInput,
      Section.Sidebar,
    ]);
    expect(initialState.sidebar.input).toMatchObject({
      id: noteBId,
      value: "B",
    });

    // Simulate user typing into input
    r.rerender(<Sidebar store={store.current} />);
    const sidebarInput = r.getByTestId("sidebar-input");

    await act(async () => {
      fireEvent.change(sidebarInput, { target: { value: "Beta" } });
    });

    const { state: changedState } = store.current;
    expect(changedState.sidebar.input.value).toBe("Beta");

    if (action === "confirm") {
      await act(async () => {
        fireEvent.keyDown(sidebarInput, { code: "Enter" });
        await dispatchPromise;
      });

      const { state: finalState } = store.current;
      expect(finalState.sidebar.input).toBe(undefined);
      const renamedNote = finalState.notes.find(n => n.id === noteBId);
      expect(renamedNote).toMatchObject({
        id: noteBId,
        name: "Beta",
      });

      const untouchedNote = finalState.notes.find(n => n.id === noteAId);
      expect(untouchedNote.name).toBe("A");
    } else {
      await act(async () => {
        fireEvent.keyDown(sidebarInput, { code: "Escape" });
        await dispatchPromise;
      });

      const { state: finalState } = store.current;
      expect(finalState.sidebar.input).toBe(undefined);
      const renamedNote = finalState.notes.find(n => n.id === noteBId);
      expect(renamedNote).toMatchObject({
        id: noteBId,
        name: "B",
      });

      const untouchedNote = finalState.notes.find(n => n.id === noteAId);
      expect(untouchedNote.name).toBe("A");
    }
  },
);

test("sidebar.deleteNote", async () => {
  const noteAId = uuid();
  const noteBId = uuid();
  const noteCId = uuid();
  const noteDId = uuid();

  const store = createStore({
    notes: [
      createNote({
        id: noteAId,
        name: "A",
        children: [createNote({ id: noteDId, name: "D" })],
      }),
      createNote({ id: noteBId, name: "B" }),
      createNote({ id: noteCId, name: "C" }),
    ],
    sidebar: {
      selected: [noteBId],
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    editor: {},
    focused: [Section.Editor],
  });

  render(<Sidebar store={store.current} />);

  // Does not remove if cancelled
  promptConfirmAction.mockResolvedValueOnce(false);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteNote", noteAId);
    expect(store.current.state.notes).toHaveLength(3);
    expect(store.current.state.sidebar.selected).toEqual([noteBId]);
  });

  // Removes deleted note once confirmed
  promptConfirmAction.mockResolvedValueOnce(true);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteNote", noteAId);
    expect(store.current.state.notes).toHaveLength(2);
    expect(store.current.state.sidebar.selected).toEqual([noteBId]);
  });

  const { notes } = store.current.state;
  expect(notes).toContainEqual(expect.objectContaining({ id: noteBId }));
  expect(notes).toContainEqual(expect.objectContaining({ id: noteCId }));

  // Note D was a child of deleted note A
  expect(notes).not.toContainEqual(expect.objectContaining({ id: noteAId }));
  expect(notes).not.toContainEqual(expect.objectContaining({ id: noteDId }));
});

test("sidebar.deleteSelectedNote", async () => {
  const noteAId = uuid();
  const noteBId = uuid();
  const noteCId = uuid();

  const store = createStore({
    notes: [
      createNote({ id: noteAId, name: "A" }),
      createNote({ id: noteBId, name: "B" }),
      createNote({ id: noteCId, name: "C" }),
    ],
    sidebar: {
      selected: [noteBId],
    },
    focused: [Section.Editor],
  });
  render(<Sidebar store={store.current} />);

  // Does not remove if cancelled
  promptConfirmAction.mockResolvedValueOnce(false);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteSelectedNote");
    expect(store.current.state.notes).toHaveLength(3);
    expect(store.current.state.sidebar.selected).toEqual([noteBId]);
  });

  // Removes deleted note once confirmed
  promptConfirmAction.mockResolvedValueOnce(true);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteSelectedNote");
    expect(store.current.state.notes).toHaveLength(2);
    expect(store.current.state.sidebar.selected).toEqual([]);
  });

  const { notes } = store.current.state;
  expect(notes).toContainEqual(expect.objectContaining({ id: noteAId }));
  expect(notes).not.toContainEqual(expect.objectContaining({ id: noteBId }));
  expect(notes).toContainEqual(expect.objectContaining({ id: noteCId }));
});

test("sidebar.collapseAll", async () => {
  const notes = [
    createNote({
      id: "1",
      name: "bar",
      children: [
        createNote({
          id: "2",
          name: "baz",
          children: [createNote({ id: "3", name: "nested-2" })],
        }),
      ],
    }),
    createNote({ id: "4", name: "foo" }),
  ];

  const store = createStore({
    notes,
    sidebar: {
      selected: ["1"],
      expanded: ["1", "2"],
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    editor: {},
    focused: [],
  });

  render(<Sidebar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("sidebar.collapseAll");
  });

  const { state } = store.current;

  expect(state.sidebar.expanded).toEqual([]);
  expect(state.sidebar.selected).toBe(undefined);
});

test("sidebar.expandAll", async () => {
  const notes = [
    createNote({
      name: "bar",
      children: [
        createNote({
          name: "baz",
          children: [createNote({ name: "nested-2" })],
        }),
      ],
    }),
    createNote({ name: "foo" }),
  ];

  const store = createStore({
    notes,
    sidebar: {
      expanded: [],
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    editor: {},
    focused: [],
  });

  render(<Sidebar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("sidebar.expandAll");
  });

  const { state } = store.current;
  const expanded = [notes[0]!.id, notes?.[0].children?.[0].id];

  expect(state.sidebar.expanded).toEqual(expanded);
});

test("sidebar.dragNote", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({
      id: "2",
      name: "bar",
      children: [
        createNote({
          id: "3",
          name: "baz",
          children: [createNote({ id: "4", name: "nested-2" })],
        }),
      ],
    }),
  ];

  const store = createStore({
    notes,
    sidebar: {
      expanded: [],
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    editor: {},
    focused: [],
  });

  render(<Sidebar store={store.current} />);

  // Notes can't be their own parent.
  const foo = store.current.state.notes.find(n => n.name === "foo")!;
  await act(async () => {
    await store.current.dispatch("sidebar.dragNote", {
      note: foo.id,
      newParent: foo.id,
    });
  });
  expect(foo.parent).toBe(undefined);

  // Dont allow infinite loops
  const bar = store.current.state.notes.find(n => n.name === "bar")!;
  await act(async () => {
    await store.current.dispatch("sidebar.dragNote", {
      note: bar.id,
      newParent: bar.children![0].id,
    });
  });
  expect(bar.parent).toBe(undefined);

  // Don't update parent if it's the same (nested note)
  const baz = bar.children![0];
  await act(async () => {
    await store.current.dispatch("sidebar.dragNote", {
      note: baz.id,
      newParent: baz.parent,
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((window as any).ipc).not.toBeCalledWith(
    "notes.updateMetadata",
    baz.id,
    {
      parent: baz.parent!,
    },
  );

  // Don't update parent if it's the same (root note)
  await act(async () => {
    await store.current.dispatch("sidebar.dragNote", {
      note: foo.id,
      newParent: undefined,
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((window as any).ipc).not.toBeCalledWith(
    "notes.updateMetadata",
    foo.id,
    {
      parent: undefined,
    },
  );

  // Move from root to nested
  await act(async () => {
    await store.current.dispatch("sidebar.dragNote", {
      note: "1",
      newParent: "2",
    });
  });
  const updatedFoo = getNoteById(store.current.state.notes, "1");
  expect(updatedFoo.parent).toBe("2");
  expect(bar.children).toContainEqual(expect.objectContaining({ id: "1" }));
  expect(store.current.state.notes).not.toContainEqual(
    expect.objectContaining({ id: "1" }),
  );

  // Move from nested to root
  await act(async () => {
    await store.current.dispatch("sidebar.dragNote", {
      note: "1",
      newParent: undefined,
    });
  });
  const updatedFoo2 = getNoteById(store.current.state.notes, "1");
  expect(updatedFoo2.parent).toBe(undefined);
  expect(bar.children).not.toContainEqual(expect.objectContaining({ id: "1" }));
  expect(store.current.state.notes).toContainEqual(
    expect.objectContaining({ id: "1" }),
  );
});

test("sidebar.openSelectedNotes", async () => {
  const noteFooId = uuid();
  const noteBarId = uuid();
  const noteBazId = uuid();

  const notes = [
    createNote({ id: noteFooId, name: "foo" }),
    createNote({
      id: noteBarId,
      name: "bar",
      children: [
        createNote({
          id: noteBazId,
          name: "baz",
        }),
      ],
    }),
  ];

  const store = createStore({
    notes,
    sidebar: {
      selected: [noteFooId],
    },
    editor: {
      activeTabNoteId: undefined,
      tabs: [],
    },
    focused: [Section.Sidebar],
  });

  render(<Sidebar store={store.current} />);

  // Opens new tab
  await act(async () => {
    await store.current.dispatch("sidebar.openSelectedNotes");
  });

  let { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(1);
  expect(store.current.state.focused).toEqual([Section.Sidebar]);
  expect(editor.activeTabNoteId).toBe(noteFooId);

  // Doesn't open duplicate tab if one already exists
  await act(async () => {
    await store.current.dispatch("sidebar.openSelectedNotes");
  });

  editor = store.current.state.editor;
  expect(editor.tabs).toHaveLength(1);
  expect(store.current.state.focused).toEqual([Section.Sidebar]);
  expect(editor.activeTabNoteId).toBe(noteFooId);
});
