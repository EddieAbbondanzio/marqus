import {
  applySearchString,
  Sidebar,
} from "../../../src/renderer/components/Sidebar";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import {
  createNote,
  DEFAULT_NOTE_SORTING_ALGORITHM,
  getNoteById,
} from "../../../src/shared/domain/note";
import * as prompt from "../../../src/renderer/utils/prompt";
import { Section } from "../../../src/shared/ui/app";
import { createStore } from "../../__factories__/store";
import { uuid } from "../../../src/shared/domain";

const promptConfirmAction = jest.spyOn(prompt, "promptConfirmAction");

test("applySearchString", () => {
  const notes = [
    createNote({
      name: "foo",
      content: "Random string lol",
    }),
    createNote({
      name: "bar",
      content: "Some more totally random text",
    }),
    createNote({
      name: "baz",
      content: "qqqqqqqqqqq",
    }),
  ];

  // Search by name
  const matches1 = applySearchString(notes, "f");
  expect(matches1).toHaveLength(1);
  expect(matches1[0].name).toBe("foo");

  // Search by content
  const matches2 = applySearchString(notes, "qqqq");
  expect(matches2).toHaveLength(1);
  expect(matches2[0].name).toBe("baz");
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
    void store.current.dispatch("sidebar.createNote", "parent-note");
  });

  const { state } = store.current;
  expect(state.focused).toEqual(["sidebarInput"]);
  expect(state.sidebar.expanded).toContain("parent-note");
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
  const store = createStore({
    notes: [
      createNote({ id: "a", name: "A" }),
      createNote({ id: "b", name: "B" }),
      createNote({ id: "c", name: "C" }),
    ],
    sidebar: {
      selected: ["b"],
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    editor: {},
    focused: [Section.Editor],
  });

  render(<Sidebar store={store.current} />);

  // Does not remove if cancelled
  promptConfirmAction.mockResolvedValueOnce(false);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteNote", "a");
    expect(store.current.state.notes).toHaveLength(3);
    expect(store.current.state.sidebar.selected).toEqual(["b"]);
  });

  // Removes deleted note once confirmed
  promptConfirmAction.mockResolvedValueOnce(true);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteNote", "a");
    expect(store.current.state.notes).toHaveLength(2);
    expect(store.current.state.sidebar.selected).toEqual(["b"]);
  });
});

test("sidebar.deleteSelectedNote", async () => {
  const store = createStore({
    notes: [
      createNote({ id: "a", name: "A" }),
      createNote({ id: "b", name: "B" }),
      createNote({ id: "c", name: "C" }),
    ],
    sidebar: {
      selected: ["b"],
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    editor: {},
    focused: [Section.Editor],
  });
  render(<Sidebar store={store.current} />);

  // Does not remove if cancelled
  promptConfirmAction.mockResolvedValueOnce(false);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteSelectedNote");
    expect(store.current.state.notes).toHaveLength(3);
    expect(store.current.state.sidebar.selected).toEqual(["b"]);
  });

  // Removes deleted note once confirmed
  promptConfirmAction.mockResolvedValueOnce(true);
  await act(async () => {
    await store.current.dispatch("sidebar.deleteSelectedNote");
    expect(store.current.state.notes).toHaveLength(2);
    expect(store.current.state.sidebar.selected).toEqual([]);
  });
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

test("sidebar.openNoteAttachments", async () => {
  const noteId = uuid();
  const notes = [
    createNote({ id: noteId, name: "foo" }),
    createNote({
      name: "bar",
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
  await act(async () => {
    await store.current.dispatch("sidebar.openNoteAttachments", noteId);
  });

  expect((window as any).ipc).toHaveBeenCalledWith(
    "notes.openAttachments",
    noteId,
  );
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
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({
      id: "2",
      name: "bar",
      children: [
        createNote({
          id: "3",
          name: "baz",
        }),
      ],
    }),
  ];

  const store = createStore({
    notes,
    sidebar: {
      selected: ["1"],
    },
    editor: {
      activeTabNoteId: undefined,
      tabs: [],
    },
  });

  render(<Sidebar store={store.current} />);

  // Opens new tab
  await act(async () => {
    await store.current.dispatch("sidebar.openSelectedNotes");
  });

  let { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(1);
  expect(editor.activeTabNoteId).toBe(undefined);

  // Doesn't open duplicate tab if one already exists
  await act(async () => {
    await store.current.dispatch("sidebar.openSelectedNotes");
  });

  editor = store.current.state.editor;
  expect(editor.tabs).toHaveLength(1);
  expect(editor.activeTabNoteId).toBe(undefined);
});
