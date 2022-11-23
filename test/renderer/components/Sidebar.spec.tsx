import { Sidebar } from "../../../src/renderer/components/Sidebar";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import {
  createNote,
  DEFAULT_NOTE_SORTING_ALGORITHM,
  getNoteById,
} from "../../../src/shared/domain/note";
import * as prompt from "../../../src/renderer/utils/prompt";
import { when } from "jest-when";
import { Section } from "../../../src/shared/ui/app";
import { createStore } from "../../__factories__/store";

// TODO: Rewrite these test to use fireEvent to be more like how the code is
// actually ran.

const promptConfirmAction = jest.spyOn(prompt, "promptConfirmAction");

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

  act(() => {
    store.current.dispatch("sidebar.createNote", "parent-note");
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
  expect(store.current.state.focused).toEqual(["sidebarInput"]);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  when((window as any).ipc).calledWith("notes.updateMetadata", "1", {
    parent: "2",
  });

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  when((window as any).ipc).calledWith("notes.updateMetadata", "1", {
    parent: undefined,
  });

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
