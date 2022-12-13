import {
  EditorToolbar,
  EDITOR_TAB_ATTRIBUTE,
  getEditorTabAttribute,
} from "../../../src/renderer/components/EditorToolbar";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import { createStore } from "../../__factories__/store";
import { createNote } from "../../../src/shared/domain/note";
import { createTab } from "../../__factories__/editor";
import { subHours } from "date-fns";
import { uuid } from "../../../src/shared/domain";

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
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
  render(<EditorToolbar store={store.current} />);

  // Open note without setting as active
  await act(async () => {
    await store.current.dispatch("editor.openTab", { note: "1" });
  });

  let { editor } = store.current.state;
  expect(editor.tabs[0]!.note.id).toBe("1");
  expect(editor.tabs[0]!.lastActive).not.toBe(null);

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

test("openTab works with note paths too", async () => {
  const store = createStore({
    notes: [
      createNote({ id: "1", name: "foo" }),
      createNote({ id: "2", name: "bar" }),
      createNote({
        id: "3",
        name: "baz",
        children: [createNote({ id: "4", name: "Nested" })],
      }),
    ],
    editor: {
      tabs: [],
    },
  });
  render(<EditorToolbar store={store.current} />);

  // Test it can open a note from path
  await act(async () => {
    await store.current.dispatch("editor.openTab", {
      note: "note://foo",
      active: "note://foo",
    });
  });

  let { editor } = store.current.state;
  expect(editor.tabs[0]!.note.id).toBe("1");
  expect(editor.activeTabNoteId).toBe("1");

  // Test it can open note from nested path
  await act(async () => {
    await store.current.dispatch("editor.openTab", {
      note: "note://baz/Nested",
      active: "note://baz/Nested",
    });
  });

  ({ editor } = store.current.state);
  expect(editor.tabs[1]!.note.id).toBe("4");
  expect(editor.activeTabNoteId).toBe("4");
});

test("editor.closeActiveTab", async () => {
  const noteFooId = uuid();
  const noteBarId = uuid();
  const noteBazId = uuid();

  const notes = [
    createNote({ id: noteFooId, name: "foo" }),
    createNote({ id: noteBarId, name: "bar" }),
    createNote({ id: noteBazId, name: "baz" }),
  ];

  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: noteFooId,
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

  // Close Foo
  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.closeActiveTab", undefined);
  });

  const { editor: editorAfterFirstClose } = store.current.state;
  expect(editorAfterFirstClose.tabs).toHaveLength(2);
  expect(editorAfterFirstClose.tabs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        note: expect.objectContaining({ id: noteBarId }),
      }),
      expect.objectContaining({
        note: expect.objectContaining({ id: noteBazId }),
      }),
    ]),
  );
  expect(editorAfterFirstClose.activeTabNoteId).toBe(noteBarId);

  // Close Bar
  await act(async () => {
    await store.current.dispatch("editor.closeActiveTab", undefined);
  });

  const { editor: editorAfterSecondClose } = store.current.state;
  expect(editorAfterSecondClose.tabs).toHaveLength(1);
  expect(editorAfterFirstClose.tabs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        note: expect.objectContaining({ id: noteBazId }),
      }),
    ]),
  );
  expect(editorAfterSecondClose.activeTabNoteId).toBe(noteBazId);

  // Close Baz (last remaining tab)
  await act(async () => {
    await store.current.dispatch("editor.closeActiveTab", undefined);
  });
  const { editor: editorAfterThirdClose } = store.current.state;
  expect(editorAfterThirdClose.tabs).toHaveLength(0);
  expect(editorAfterThirdClose.activeTabNoteId).toBe(undefined);
});

test("editor.closeTab", async () => {
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

  render(<EditorToolbar store={store.current} />);
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

  render(<EditorToolbar store={store.current} />);
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

  render(<EditorToolbar store={store.current} />);
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

  render(<EditorToolbar store={store.current} />);
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

  render(<EditorToolbar store={store.current} />);
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

  render(<EditorToolbar store={store.current} />);
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

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.previousTab");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("3");
});

test("updateTabsScroll scrolls tabs", async () => {
  const store = createStore();
  const r = render(<EditorToolbar store={store.current} />);

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
