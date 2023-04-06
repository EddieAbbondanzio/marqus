import { EditorToolbar } from "../../../src/renderer/components/EditorToolbar";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import { createStore } from "../../__factories__/store";
import { createNote } from "../../../src/shared/domain/note";
import { createTab } from "../../__factories__/editor";
import { subHours } from "date-fns";
import { uuid } from "../../../src/shared/domain";
import { mockStore } from "../../__mocks__/store";
import { MouseButton } from "../../../src/renderer/io/mouse";

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

test("editor.openTab opens tabs passed", async () => {
  const store = createStore({
    sidebar: {
      selected: [],
    },
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

  let { sidebar, editor } = store.current.state;
  expect(editor.tabs[0]!.note.id).toBe("1");
  expect(editor.tabs[0]!.lastActive).not.toBe(null);

  await act(async () => {
    await store.current.dispatch("editor.openTab", {
      note: ["2", "3"],
      active: "2",
    });
  });

  // Test it sets active tab passed.
  ({ sidebar, editor } = store.current.state);
  expect(editor.activeTabNoteId).toBe("2");
  expect(editor.tabs).toHaveLength(3);
  expect(sidebar.selected).toEqual(["2"]);
});

test("editor.openTab works with note paths too", async () => {
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
  expect(editor.tabs[0]!.note.id).toBe("4");
  expect(editor.activeTabNoteId).toBe("4");
});

test("editor.openTab removes tabs from closedTab", async () => {
  const store = createStore(
    {
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
    },
    {
      closedTabs: [{ noteId: "1", previousIndex: 0 }],
    },
  );
  render(<EditorToolbar store={store.current} />);

  await act(async () => {
    await store.current.dispatch("editor.openTab", { note: "1" });
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(1);
  expect(editor.tabs).toEqual([
    expect.objectContaining({ note: expect.objectContaining({ id: "1" }) }),
  ]);

  expect(store.current.cache.closedTabs).toEqual([]);
});

test("editor.reopenClosedTab", async () => {
  const store = createStore(
    {
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
    },
    {
      closedTabs: [{ noteId: "1", previousIndex: 0 }],
    },
  );
  render(<EditorToolbar store={store.current} />);

  await act(async () => {
    await store.current.dispatch("editor.reopenClosedTab");
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toHaveLength(1);
  expect(editor.tabs).toEqual([
    expect.objectContaining({ note: expect.objectContaining({ id: "1" }) }),
  ]);
  expect(editor.activeTabNoteId).toBe("1");
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
    await store.current.dispatch("editor.closeActiveTab", undefined!);
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

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: noteFooId, previousIndex: 0 },
  ]);

  // Close Bar
  await act(async () => {
    await store.current.dispatch("editor.closeActiveTab", undefined!);
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

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: noteBarId, previousIndex: 0 },
    { noteId: noteFooId, previousIndex: 0 },
  ]);

  // Close Baz (last remaining tab)
  await act(async () => {
    await store.current.dispatch("editor.closeActiveTab", undefined!);
  });
  const { editor: editorAfterThirdClose } = store.current.state;
  expect(editorAfterThirdClose.tabs).toHaveLength(0);
  expect(editorAfterThirdClose.activeTabNoteId).toBe(undefined);

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: noteBazId, previousIndex: 0 },
    { noteId: noteBarId, previousIndex: 0 },
    { noteId: noteFooId, previousIndex: 0 },
  ]);
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
    await store.current.dispatch("editor.closeTab", "2");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: "2", previousIndex: 1 },
  ]);
});

test("editor.closeTab prevents duplicates in closedTab cache", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore(
    {
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
    },
    {
      closedTabs: [{ noteId: "2", previousIndex: 2 }],
    },
  );

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.closeTab", "2");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("1");

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: "2", previousIndex: 1 },
  ]);
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
          isPinned: true,
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
    await store.current.dispatch("editor.closeAllTabs");
  });

  const { editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe(undefined);
  expect(editor.tabs.length).toBe(1);
  expect(editor.tabs[0].note.id).toBe("1");

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: "2", previousIndex: 1 },
    { noteId: "3", previousIndex: 2 },
  ]);
});

test("editor.closeOtherTabs", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "2",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
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
  expect(editor.activeTabNoteId).toBe("2");
  expect(editor.tabs.length).toBe(2);
  expect(editor.tabs[0].note.id).toBe("1");
  expect(editor.tabs[1].note.id).toBe("2");

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: "3", previousIndex: 2 },
    { noteId: "4", previousIndex: 3 },
  ]);
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

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: "2", previousIndex: 1 },
    { noteId: "3", previousIndex: 2 },
  ]);
});

test("editor.closeTabsToRight with pinned tabs to right", async () => {
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
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
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
  expect(editor.tabs.length).toBe(2);
  expect(editor.tabs[0].note.id).toBe("1");
  expect(editor.tabs[1].note.id).toBe("2");

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: "3", previousIndex: 2 },
  ]);
});

test("editor.closeTabsToLeft", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "3",
      tabs: [
        // Pinned tab won't be closed.
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
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
  expect(editor.activeTabNoteId).toBe("3");
  expect(editor.tabs.length).toBe(3);
  expect(editor.tabs[0].note.id).toBe("1");
  expect(editor.tabs[1].note.id).toBe("3");
  expect(editor.tabs[2].note.id).toBe("4");

  expect(store.current.cache.closedTabs).toEqual([
    { noteId: "2", previousIndex: 1 },
  ]);
});

test("editor.closeTabsToLeft pinned notes", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    editor: {
      activeTabNoteId: "2",
      tabs: [
        // Pinned tab won't be closed.
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
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
  expect(editor.tabs.length).toBe(4);

  expect(store.current.cache.closedTabs).toEqual([]);
});

test("editor.nextTab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
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

  const { sidebar, editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("2");
  expect(sidebar.selected).toEqual(["2"]);
});

test("editor.nextTab mouse shortcut", async () => {
  const store = mockStore();
  render(<EditorToolbar store={store} />);
  await act(async () => {
    const backEvent = new MouseEvent("mouseup", {
      button: MouseButton.Back,
    });

    fireEvent(window, backEvent);
  });

  expect(store.dispatch).toHaveBeenCalledWith("editor.nextTab");
});

test("editor.previousTab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
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

  const { sidebar, editor } = store.current.state;
  expect(editor.activeTabNoteId).toBe("3");
  expect(sidebar.selected).toEqual(["3"]);
});

test("editor.previousTab mouse shortcut", async () => {
  const store = mockStore();
  render(<EditorToolbar store={store} />);
  await act(async () => {
    const forwardEvent = new MouseEvent("mouseup", {
      button: MouseButton.Forward,
    });

    fireEvent(window, forwardEvent);
  });

  expect(store.dispatch).toHaveBeenCalledWith("editor.previousTab");
});

test("editor.updateTabsScroll scrolls tabs", async () => {
  const store = createStore();
  const r = render(<EditorToolbar store={store.current} />);
  const scrollable = r.container.querySelector("[orientation=horizontal]")!;

  await act(async () => {
    fireEvent.scroll(scrollable, { target: { scrollLeft: 10 } });

    // scrollable uses debounce so we need to time travel to get it to invoke.
    jest.runAllTimers();
  });

  const { editor } = store.current.state;
  expect(editor.tabsScroll).toBe(10);
});

test("editor.pinTab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
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
    await store.current.dispatch("editor.pinTab", "2");
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toEqual([
    expect.objectContaining({
      note: expect.objectContaining({ id: "2" }),
      isPinned: true,
    }),
    expect.objectContaining({ note: expect.objectContaining({ id: "1" }) }),
    expect.objectContaining({ note: expect.objectContaining({ id: "3" }) }),
  ]);
});

test("editor.unpinTab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
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
    await store.current.dispatch("editor.unpinTab", "1");
  });

  const { editor } = store.current.state;
  expect(editor.tabs).toEqual([
    expect.objectContaining({
      note: expect.objectContaining({ id: "2" }),
      isPinned: true,
    }),
    expect.objectContaining({ note: expect.objectContaining({ id: "1" }) }),
    expect.objectContaining({ note: expect.objectContaining({ id: "3" }) }),
  ]);
});

test("editor.moveTab regular tab to right of another", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
        }),
      ],
    },
  });

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.moveTab", {
      noteId: notes[2].id,
      newIndex: 3,
    });
  });

  const { editor } = store.current.state;
  expect(editor.tabs[0].note.id).toBe(notes[0].id);
  expect(editor.tabs[1].note.id).toBe(notes[1].id);
  expect(editor.tabs[2].note.id).toBe(notes[3].id);
  expect(editor.tabs[3].note.id).toBe(notes[2].id);
});

test("editor.moveTab regular tab to left of another", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
        }),
      ],
    },
  });

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.moveTab", {
      noteId: notes[3].id,
      newIndex: 1,
    });
  });

  const { editor } = store.current.state;
  expect(editor.tabs[0].note.id).toBe(notes[0].id);
  expect(editor.tabs[1].note.id).toBe(notes[3].id);
  expect(editor.tabs[2].note.id).toBe(notes[1].id);
  expect(editor.tabs[3].note.id).toBe(notes[2].id);
});

test("editor.moveTab attempt to move regular tab before pinned tab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
        }),
      ],
    },
  });

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.moveTab", {
      noteId: notes[3].id,
      newIndex: 0,
    });
  });

  const { editor } = store.current.state;
  expect(editor.tabs[0].note.id).toBe(notes[0].id);
  expect(editor.tabs[1].note.id).toBe(notes[1].id);
  expect(editor.tabs[2].note.id).toBe(notes[3].id);
  expect(editor.tabs[3].note.id).toBe(notes[2].id);
});

test("editor.moveNote move pinned tab to right", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
        }),
      ],
    },
  });

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.moveTab", {
      noteId: notes[0].id,
      newIndex: 1,
    });
  });

  const { editor } = store.current.state;
  expect(editor.tabs[0].note.id).toBe(notes[1].id);
  expect(editor.tabs[1].note.id).toBe(notes[0].id);
  expect(editor.tabs[2].note.id).toBe(notes[2].id);
  expect(editor.tabs[3].note.id).toBe(notes[3].id);
});

test("editor.moveNote move pinned tab to left", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
        }),
      ],
    },
  });

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.moveTab", {
      noteId: notes[1].id,
      newIndex: 0,
    });
  });

  const { editor } = store.current.state;
  expect(editor.tabs[0].note.id).toBe(notes[1].id);
  expect(editor.tabs[1].note.id).toBe(notes[0].id);
  expect(editor.tabs[2].note.id).toBe(notes[2].id);
  expect(editor.tabs[3].note.id).toBe(notes[3].id);
});

test("editor.moveTab try to move pinned tab past regular tab", async () => {
  const notes = [
    createNote({ id: "1", name: "foo" }),
    createNote({ id: "2", name: "bar" }),
    createNote({ id: "3", name: "baz" }),
    createNote({ id: "4", name: "baq" }),
  ];
  const store = createStore({
    notes,
    sidebar: {
      selected: [],
    },
    editor: {
      activeTabNoteId: "1",
      tabs: [
        createTab({
          note: notes[0],
          lastActive: subHours(new Date(), 1),
          isPinned: true,
        }),
        createTab({
          note: notes[1],
          lastActive: subHours(new Date(), 2),
          isPinned: true,
        }),
        createTab({
          note: notes[2],
          lastActive: subHours(new Date(), 3),
        }),
        createTab({
          note: notes[3],
          lastActive: subHours(new Date(), 4),
        }),
      ],
    },
  });

  render(<EditorToolbar store={store.current} />);
  await act(async () => {
    await store.current.dispatch("editor.moveTab", {
      noteId: notes[0].id,
      newIndex: 3,
    });
  });

  const { editor } = store.current.state;
  expect(editor.tabs[0].note.id).toBe(notes[1].id);
  expect(editor.tabs[1].note.id).toBe(notes[0].id);
  expect(editor.tabs[2].note.id).toBe(notes[2].id);
  expect(editor.tabs[3].note.id).toBe(notes[3].id);
});
