import { act } from "react-test-renderer";
import {
  deleteNote,
  resizeWidth,
} from "../../../src/renderer/components/Sidebar";
import { px } from "../../../src/renderer/utils/dom";
import { createNote, Note } from "../../../src/shared/domain/note";
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
