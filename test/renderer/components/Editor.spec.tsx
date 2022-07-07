import { act, render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { Editor } from "../../../src/renderer/components/Editor";
import { useStore } from "../../../src/renderer/store";
import { createState } from "../../__factories__/state";
import React from "react";
import { when } from "jest-when";

test("editor.openTab", async () => {
  const { result: store } = renderHook(() => useStore(createState()));
  const res = render(<Editor store={store.current} />);

  when((window as any).ipc)
    .calledWith("notes.loadContent", "foo")
    .mockReturnValue("fake note content");

  await act(async () => {
    await store.current.dispatch("editor.openTab", "foo");
  });

  const { state } = store.current;
  // expect(state.editor.noteId).toBe("foo");
  // expect(state.editor.content).toBe("fake note content");
});

test("editor.openTab", async () => {
  const { result: store } = renderHook(() =>
    useStore(
      createState({
        sidebar: {
          selected: ["foo"],
        },
        editor: {},
        focused: [],
      })
    )
  );
  const res = render(<Editor store={store.current} />);

  when((window as any).ipc)
    .calledWith("notes.loadContent")
    .mockReturnValue("fake note content");

  await act(async () => {
    await store.current.dispatch("editor.openTab", null);
  });

  const { state } = store.current;
  // expect(state.editor.noteId).toBe("foo");
  // expect(state.editor.content).toBe("fake note content");

  // Enter moves focus
  expect(state.focused).toEqual(["editor"]);
});
