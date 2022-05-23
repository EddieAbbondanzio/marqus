import { createState } from "../../__factories__/state";
import { Sidebar } from "../../../src/renderer/components/Sidebar";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import { useStore } from "../../../src/renderer/store";
import { renderHook } from "@testing-library/react-hooks";
import { createNote, flatten } from "../../../src/shared/domain/note";

test("sidebar.createNote confirm", async () => {
  const { result: store } = renderHook(() => useStore(createState()));
  const res = render(<Sidebar store={store.current} />);

  // Start
  let dispatchPromise: Promise<unknown>;
  act(() => {
    dispatchPromise = store.current.dispatch("sidebar.createNote", null);
  });
  expect(store.current.state.ui.focused).toEqual(["sidebarInput"]);

  // Populate input
  res.rerender(<Sidebar store={store.current} />);
  fireEvent.change(res.getByTestId("sidebar-input"), {
    target: { value: "foo" },
  });
  expect(store.current.state.ui.sidebar.input?.value).toBe("foo");

  // Mock return value of window.ipc("notes.create", ...)
  ((window as any).ipc as jest.Mock).mockReturnValue(
    createNote({
      name: "foo",
    })
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
    })
  );
  expect(state.ui.focused).toEqual(["editor"]);
  expect(state.ui.sidebar.selected).toEqual([note.id]);
  expect(state.ui.editor).toEqual(
    expect.objectContaining({
      isEditting: true,
      noteId: note.id,
      content: "",
    })
  );
});

test("sidebar.createNote expands parent", async () => {
  const { result: store } = renderHook(() =>
    useStore(
      createState({
        notes: [createNote({ id: "parent-note", name: "parent" })],
      })
    )
  );
  const res = render(<Sidebar store={store.current} />);

  act(() => {
    store.current.dispatch("sidebar.createNote", "parent-note");
  });

  const { state } = store.current;
  expect(state.ui.focused).toEqual(["sidebarInput"]);
  expect(state.ui.sidebar.expanded).toContain("parent-note");
});

test("sidebar.createNote escape cancels", async () => {
  const { result: store } = renderHook(() => useStore(createState()));
  const res = render(<Sidebar store={store.current} />);

  // Start
  let dispatchPromise: Promise<unknown>;
  act(() => {
    dispatchPromise = store.current.dispatch("sidebar.createNote", null);
  });
  expect(store.current.state.ui.focused).toEqual(["sidebarInput"]);

  // Populate input
  res.rerender(<Sidebar store={store.current} />);
  fireEvent.change(res.getByTestId("sidebar-input"), {
    target: { value: "foo" },
  });
  expect(store.current.state.ui.sidebar.input?.value).toBe("foo");

  // Trigger cancel
  await act(async () => {
    fireEvent.keyDown(res.getByTestId("sidebar-input"), { code: "Escape" });
    await dispatchPromise;
  });

  const { state } = store.current;
  expect(state.notes).toHaveLength(0);
  expect(state.ui.sidebar.input).toBe(undefined);
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

  const { result: store } = renderHook(() =>
    useStore(
      createState({
        notes,
        ui: {
          sidebar: {
            expanded: ["1", "2"],
          },
          editor: {},
          focused: [],
        },
      })
    )
  );

  const res = render(<Sidebar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("sidebar.collapseAll");
  });

  const { state } = store.current;

  expect(state.ui.sidebar.expanded).toEqual([]);
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

  const { result: store } = renderHook(() =>
    useStore(
      createState({
        notes,
        ui: {
          sidebar: {
            expanded: [],
          },
          editor: {},
          focused: [],
        },
      })
    )
  );

  const res = render(<Sidebar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("sidebar.expandAll");
  });

  const { state } = store.current;
  const expanded = [notes[0]!.id, notes?.[0].children?.[0].id];

  expect(state.ui.sidebar.expanded).toEqual(expanded);
});
