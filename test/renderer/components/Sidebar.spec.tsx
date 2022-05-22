import { createState } from "../../__factories__/state";
import {
  Sidebar,
  SidebarProps,
} from "../../../src/renderer/components/Sidebar";
import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import React, { ReactNode } from "react";
import { Store, useStore } from "../../../src/renderer/store";
import { App, AppProps } from "../../../src/renderer/App";
import { renderHook } from "@testing-library/react-hooks";
import { createNote } from "../../../src/shared/domain/note";

function init(props: SidebarProps): RenderResult {
  return render(<Sidebar {...props} />);
}

test("sidebar.createNote confirm", async () => {
  const { result: store } = renderHook(() => useStore(createState()));
  const res = init({
    store: store.current,
  });

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
  expect(state.ui.sidebar.selected).toEqual([note.id]);
  expect(state.ui.editor).toEqual(
    expect.objectContaining({
      isEditting: true,
      noteId: note.id,
      content: "",
    })
  );
});

test("sidebar.createNote expands parent", async () => {});

test("sidebar.createNote cancel", async () => {
  // Just test it clears out.
});
