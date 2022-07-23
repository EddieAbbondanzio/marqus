import { EditorTabs } from "../../../src/renderer/components/EditorTabs";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import { createStore } from "../../__factories__/store";
import { createNote } from "../../../src/shared/domain/note";
import { createTab } from "../../__factories__/editor";
import { subHours } from "date-fns";

jest.useFakeTimers();

test("openTab opens selected note by default", async () => {
  const store = createStore({
    notes: [createNote({ id: "1", name: "foo" })],
    sidebar: {
      selected: ["1"],
    },
    editor: {
      activeTabNoteId: undefined,
      tabs: [],
    },
  });
  const r = render(<EditorTabs store={store.current} />);

  await act(async () => {
    store.current.dispatch("editor.openTab", undefined);
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");
  expect(editor.tabs[0]!.lastActive).not.toBe(null);
});

test("openTab opens tabs passed", async () => {
  const store = createStore({
    notes: [
      createNote({ id: "1", name: "foo" }),
      createNote({ id: "2", name: "bar" }),
      createNote({ id: "3", name: "baz" }),
    ],
    editor: {
      tabs: [],
    },
  });
  const r = render(<EditorTabs store={store.current} />);

  await act(async () => {
    store.current.dispatch("editor.openTab", { note: "1" });
  });

  // Test it sets last tab passed as active
  let { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");
  expect(editor.tabs[0]!.noteId).toBe("1");
  expect(editor.tabs[0]!.lastActive).not.toBe(null);
  expect(editor.activeTabNoteId).toBe("1");

  await act(async () => {
    store.current.dispatch("editor.openTab", { note: ["2", "3"], active: "2" });
  });

  // Test it sets active tab passed.
  ({ editor } = store.current.state);
  expect(editor.activeTabNoteId).toBe("2");
  expect(editor.tabs).toHaveLength(3);
});

test("closeTab closes active tab by default", async () => {
  const store = createStore({
    notes: [
      createNote({ id: "1", name: "foo" }),
      createNote({ id: "2", name: "bar" }),
      createNote({ id: "3", name: "baz" }),
    ],
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          noteId: "1",
          noteContent: "",
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          noteId: "2",
          noteContent: "",
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          noteId: "3",
          noteContent: "",
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  const r = render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close active tab
    store.current.dispatch("editor.closeTab", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(2);
  expect(editor.activeTabNoteId).toBe("2");
});

test("closeTab clears out active tab", async () => {
  const store = createStore({
    notes: [createNote({ id: "1", name: "foo" })],
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          noteId: "1",
          noteContent: "",
          lastActive: subHours(new Date(), 1),
        }),
      ],
    },
  });

  const r = render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close active tab
    store.current.dispatch("editor.closeTab", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(0);
  expect(editor.activeTabNoteId).toBe(undefined);
});

test("closeTab closes tab passed", async () => {
  const store = createStore({
    notes: [
      createNote({ id: "1", name: "foo" }),
      createNote({ id: "2", name: "bar" }),
      createNote({ id: "3", name: "baz" }),
    ],
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          noteId: "1",
          noteContent: "",
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          noteId: "2",
          noteContent: "",
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          noteId: "3",
          noteContent: "",
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  const r = render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close active tab
    store.current.dispatch("editor.closeTab", "2");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");
});

test("nextTab", async () => {
  const store = createStore({
    notes: [
      createNote({ id: "1", name: "foo" }),
      createNote({ id: "2", name: "bar" }),
      createNote({ id: "3", name: "baz" }),
    ],
    editor: {
      activeTabNoteId: "2",
      tabs: [
        createTab({
          noteId: "1",
          noteContent: "",
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          noteId: "2",
          noteContent: "",
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          noteId: "3",
          noteContent: "",
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  const r = render(<EditorTabs store={store.current} />);
  await act(async () => {
    store.current.dispatch("editor.nextTab", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("3");
});
test("previousTab", async () => {
  const store = createStore({
    notes: [
      createNote({ id: "1", name: "foo" }),
      createNote({ id: "2", name: "bar" }),
      createNote({ id: "3", name: "baz" }),
    ],
    editor: {
      activeTabNoteId: "2",
      tabs: [
        createTab({
          noteId: "1",
          noteContent: "",
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          noteId: "2",
          noteContent: "",
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          noteId: "3",
          noteContent: "",
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  const r = render(<EditorTabs store={store.current} />);
  await act(async () => {
    store.current.dispatch("editor.previousTab", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");
});

test("updateTabsScroll scrolls tabs", async () => {
  const store = createStore();
  const r = render(<EditorTabs store={store.current} />);

  await act(async () => {
    const scrollable = r.container.querySelector("div div div")!;
    fireEvent.scroll(scrollable, { target: { scrollLeft: 10 } });

    // scrollable uses debounce so we need to time travel to get it to invoke.
    jest.runAllTimers();
  });

  const { editor } = store.current.state;
  expect(editor.tabsScroll).toBe(10);
});
