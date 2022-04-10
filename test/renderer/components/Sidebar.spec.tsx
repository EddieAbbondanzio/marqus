import { act } from "react-test-renderer";
import {
  deleteNote,
  dragNote,
  resizeWidth,
} from "../../../src/renderer/components/Sidebar";
import { px } from "../../../src/renderer/utils/dom";
import { createNote, getNoteById, Note } from "../../../src/shared/domain/note";
import { renderStoreHook } from "../../_mocks/store";
import { promptConfirmAction } from "../../../src/renderer/utils/prompt";

jest.mock("../../../src/renderer/utils/prompt", () => ({
  promptConfirmAction: jest.fn().mockImplementation(() => ({ text: "Yes" })),
}));

test("sidebar.resizeWidth", () => {
  const { result } = renderStoreHook({ ui: { sidebar: { width: px(100) } } });
  act(() => {
    const store = result.current;
    store.on("sidebar.resizeWidth", resizeWidth);
  });
  /*  */
  act(() => {
    const store = result.current;
    store.dispatch("sidebar.resizeWidth", px(250));
  });

  const { state } = result.current;
  expect(state.ui.sidebar.width).toBe(px(250));
});

test("sidebar.deleteNote root note", async () => {
  const { result } = renderStoreHook({
    notes: [
      createNote({ id: "note-to-delete", name: "foo" }),
      createNote({ name: "bar" }),
    ],
  });
  act(() => {
    const store = result.current;
    store.on("sidebar.deleteNote", deleteNote);
  });

  await act(async () => {
    const store = result.current;
    await store.dispatch("sidebar.deleteNote", "note-to-delete");
  });

  act(() => {
    const { state } = result.current;
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].id).not.toBe("note-to-delete");
  });
});

test("sidebar.deleteNote nested note", async () => {
  const { result } = renderStoreHook({
    notes: [
      createNote({ name: "foo" }),
      createNote({
        name: "bar",
        children: [createNote({ id: "note-to-delete", name: "baz" })],
      }),
    ],
  });
  act(() => {
    const store = result.current;
    store.on("sidebar.deleteNote", deleteNote);
  });

  await act(async () => {
    const store = result.current;
    await store.dispatch("sidebar.deleteNote", "note-to-delete");
  });

  act(() => {
    const { state } = result.current;
    expect(state.notes[1].children).toHaveLength(0);
  });
});

test("sidebar.dragNote moves nested to root", async () => {
  const { result } = renderStoreHook({
    notes: [
      createNote({
        id: "og-parent",
        name: "bar",
        children: [createNote({ id: "note-to-move", name: "baz" })],
      }),
    ],
  });
  act(() => {
    const store = result.current;
    store.on("sidebar.dragNote", dragNote);
  });

  // mock ipc notes.updateMetadata return value
  ((window as any).ipc as jest.Mock).mockImplementationOnce(() => ({
    id: "note-to-move",
    parent: undefined,
  }));

  await act(async () => {
    const store = result.current;
    await store.dispatch("sidebar.dragNote", {
      note: "note-to-move",
      newParent: undefined,
    });
  });

  act(() => {
    const { state } = result.current;
    const note = getNoteById(state.notes, "note-to-move");
    expect(note.parent).toBe(undefined);
    const ogParent = getNoteById(state.notes, "og-parent");
    expect(ogParent.children).toHaveLength(0);
  });
});

test("sidebar.dragNote moves root to nested", async () => {
  const { result } = renderStoreHook({
    notes: [
      createNote({
        id: "new-parent",
        name: "bar",
        children: [],
      }),
      createNote({ id: "note-to-move", name: "baz" }),
    ],
  });
  act(() => {
    const store = result.current;
    store.on("sidebar.dragNote", dragNote);
  });

  // mock ipc notes.updateMetadata return value
  ((window as any).ipc as jest.Mock).mockImplementationOnce(() => ({
    id: "note-to-move",
    parent: "new-parent",
  }));

  await act(async () => {
    const store = result.current;
    await store.dispatch("sidebar.dragNote", {
      note: "note-to-move",
      newParent: "new-parent",
    });
  });

  act(() => {
    const { state } = result.current;
    const note = getNoteById(state.notes, "note-to-move");
    expect(note.parent).toBe("new-parent");
    const ogParent = getNoteById(state.notes, "new-parent");
    expect(ogParent.children).toHaveLength(1);
  });
});

test("sidebar.dragNote does not allow moving note to child", async () => {
  const { result } = renderStoreHook({
    notes: [
      createNote({
        id: "note-to-move",
        name: "baz",
        children: [
          createNote({
            id: "new-parent",
            name: "bar",
            children: [],
          }),
        ],
      }),
    ],
  });
  act(() => {
    const store = result.current;
    store.on("sidebar.dragNote", dragNote);
  });

  // mock ipc notes.updateMetadata return value
  ((window as any).ipc as jest.Mock).mockImplementationOnce(() => ({
    id: "note-to-move",
    parent: "new-parent",
  }));

  await act(async () => {
    const store = result.current;
    await store.dispatch("sidebar.dragNote", {
      note: "note-to-move",
      newParent: "new-parent",
    });
  });

  act(() => {
    const { state } = result.current;
    const note = getNoteById(state.notes, "note-to-move");
    expect(note.parent).not.toBe("new-parent");
    const ogParent = getNoteById(state.notes, "new-parent");
    expect(ogParent.children).toHaveLength(0);
  });
});

test("sidebar.dragNote doesn't allow moving note to be child of itself", async () => {
  const { result } = renderStoreHook({
    notes: [
      createNote({
        id: "note-to-move",
        name: "baz",
      }),
    ],
  });
  act(() => {
    const store = result.current;
    store.on("sidebar.dragNote", dragNote);
  });

  // mock ipc notes.updateMetadata return value
  ((window as any).ipc as jest.Mock).mockImplementationOnce(() => ({
    id: "note-to-move",
    parent: "note-to-move",
  }));

  await act(async () => {
    const store = result.current;
    await store.dispatch("sidebar.dragNote", {
      note: "note-to-move",
      newParent: "note-to-move",
    });
  });

  act(() => {
    const { state } = result.current;
    const note = getNoteById(state.notes, "note-to-move");
    expect(note.parent).not.toBe("note-to-move");
  });
});
