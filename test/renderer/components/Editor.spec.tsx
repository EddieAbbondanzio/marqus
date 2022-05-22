import { act, render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { Editor } from "../../../src/renderer/components/Editor";
import { useStore } from "../../../src/renderer/store";
import { createState } from "../../__factories__/state";
import React from "react";
import { when } from "jest-when";

test("editor.loadNote", async () => {
  const { result: store } = renderHook(() => useStore(createState()));
  const res = render(<Editor store={store.current} />);

  // Throws if no id passed
  act(() => {
    expect(store.current.dispatch("editor.loadNote", null!)).rejects.toThrow(
      /No note id to load/
    );
  });

  when((window as any).ipc)
    .calledWith("notes.loadContent", "foo")
    .mockReturnValue("fake note content");

  await act(async () => {
    await store.current.dispatch("editor.loadNote", "foo");
  });

  const { state } = store.current;
  expect(state.ui.editor.noteId).toBe("foo");
  expect(state.ui.editor.content).toBe("fake note content");
});

test("editor.loadSelectedNote", async () => {
  const { result: store } = renderHook(() =>
    useStore(
      createState({
        ui: {
          sidebar: {
            selected: ["foo"],
          },
          editor: {},
          focused: [],
        },
      })
    )
  );
  const res = render(<Editor store={store.current} />);

  when((window as any).ipc)
    .calledWith("notes.loadContent")
    .mockReturnValue("fake note content");

  await act(async () => {
    await store.current.dispatch("editor.loadSelectedNote");
  });

  const { state } = store.current;
  expect(state.ui.editor.noteId).toBe("foo");
  expect(state.ui.editor.content).toBe("fake note content");

  // Enter moves focus
  expect(state.ui.focused).toEqual(["editor"]);
});
