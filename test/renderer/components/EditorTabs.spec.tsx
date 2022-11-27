import {
  EditorTabs,
  EDITOR_TAB_ATTRIBUTE,
  getEditorTabAttribute,
} from "../../../src/renderer/components/EditorTabs";
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
  render(<EditorTabs store={store.current} />);

  await act(async () => {
    await store.current.dispatch("editor.openTab", undefined);
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
  render(<EditorTabs store={store.current} />);

  await act(async () => {
    await store.current.dispatch("editor.openTab", { note: "1" });
  });

  // Test it sets last tab passed as active
  let { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");
  expect(editor.tabs[0]!.note.id).toBe("1");
  expect(editor.tabs[0]!.lastActive).not.toBe(null);
  expect(editor.activeTabNoteId).toBe("1");

  await act(async () => {
    await store.current.dispatch("editor.openTab", {
      note: ["2", "3"],
      active: "2",
    });
  });

  // Test it sets active tab passed.
  ({ editor } = store.current.state);
  expect(editor.activeTabNoteId).toBe("2");
  expect(editor.tabs).toHaveLength(3);
});

test("closeTab closes active tab by default", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];

  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.closeTab", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(2);
  expect(editor.activeTabNoteId).toBe("2");
});

test("closeTab clears out active tab", async () => {
  const notes = [createNote({ id: "1", name: "foo" })];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close active tab
    await store.current.dispatch("editor.closeTab", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(0);
  expect(editor.activeTabNoteId).toBe(undefined);
});

test("closeTab closes tab passed", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close active tab
    await store.current.dispatch("editor.closeTab", "2");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");
});

test("editor.closeAllTabs", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close active tab
    await store.current.dispatch("editor.closeAllTabs");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe(undefined);
  expect(editor.tabs.length).toBe(0);
});

test("editor.closeOtherTabs", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close non active tab
    await store.current.dispatch("editor.closeOtherTabs", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");
  expect(editor.tabs.length).toBe(1);
});

test("editor.closeTabsToRight", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close tabs relative to active tab
    await store.current.dispatch("editor.closeTabsToRight", undefined!);
  });

  const { editor } = store.current.state;

  expect(editor.activeTabNoteId).toBe("1");
  expect(editor.tabs.length).toBe(1);
  expect(editor.tabs[0].note.id).toBe("1");
});

test("editor.closeTabsToLeft", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "2",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    // Default behavior is to close tabs to the left of active tab
    await store.current.dispatch("editor.closeTabsToLeft", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("2");
  expect(editor.tabs.length).toBe(2);
  expect(editor.tabs[0].note.id).toBe("2");
  expect(editor.tabs[1].note.id).toBe("3");
});

test("nextTab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.nextTab", undefined!);
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("2");
});
test("previousTab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
      ],
    },
  });

  render(<EditorTabs store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.previousTab");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("3");
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

test("getEditorTabAttribute", () => {
  // None
  const none = document.createElement("h1");
  expect(getEditorTabAttribute(none)).toBe(null);

  // Direct
  const focusable = document.createElement("div");
  focusable.setAttribute(EDITOR_TAB_ATTRIBUTE, "foo");
  expect(getEditorTabAttribute(focusable)).toBe("foo");

  // Parent
  const child = document.createElement("div");
  const parent = document.createElement("div");
  parent.appendChild(child);
  parent.setAttribute(EDITOR_TAB_ATTRIBUTE, "bar");

  expect(getEditorTabAttribute(child)).toBe("bar");
});
