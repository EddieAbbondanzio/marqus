import { act } from "@testing-library/react-hooks";
import { Listener } from "../../src/renderer/store";
import { uuid } from "../../src/shared/domain";
import { createNote } from "../../src/shared/domain/note";
import { KeyCode } from "../../src/shared/io/keyCode";
import { Section } from "../../src/shared/ui/appState";
import { createStore } from "../__factories__/store";

// Tests are a bit confusing because we are using the same UI event over and
// over for different purposes.

test("useStore setUI", async () => {
  const r = createStore({
    sidebar: {
      scroll: 10,
    },
  });

  const expandedId = uuid();
  r.current.on("app.toggleSidebar", (ev, ctx) => {
    ctx.setUI({
      sidebar: {
        expanded: [expandedId],
      },
    });
  });

  await act(async () => {
    await r.current.dispatch("app.toggleSidebar");
  });

  expect(r.current.state.sidebar).toMatchObject({
    scroll: 10,
    expanded: [expandedId],
  });
});

test("useStore setShortcuts", async () => {
  const r = createStore({
    shortcuts: [
      {
        name: "app.reload",
        event: "app.reload",
        keys: [KeyCode.Control, KeyCode.LetterR],
      },
    ],
  });

  r.current.on("app.toggleSidebar", (ev, ctx) => {
    ctx.setShortcuts(prev => [
      ...prev,
      {
        name: "app.quit",
        event: "app.quit",
        keys: [KeyCode.Control, KeyCode.LetterQ],
      },
    ]);
  });

  await act(async () => {
    await r.current.dispatch("app.toggleSidebar");
  });

  expect(r.current.state.shortcuts).toEqual([
    {
      name: "app.reload",
      event: "app.reload",
      keys: [KeyCode.Control, KeyCode.LetterR],
    },
    {
      name: "app.quit",
      event: "app.quit",
      keys: [KeyCode.Control, KeyCode.LetterQ],
    },
  ]);
});

test("useStore setNotes", async () => {
  const foo = createNote({ name: "foo" });
  const bar = createNote({ name: "bar" });

  const r = createStore({
    notes: [foo],
  });

  r.current.on("app.toggleSidebar", (ev, ctx) => {
    ctx.setNotes(prev => [...prev, bar]);
  });

  await act(async () => {
    await r.current.dispatch("app.toggleSidebar");
  });

  expect(r.current.state.notes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: foo.id }),
      expect.objectContaining({ id: bar.id }),
    ]),
  );
});

test.each([
  [[], [Section.Editor], false, [Section.Editor]],
  [
    [Section.Sidebar],
    [Section.Editor],
    false,
    [Section.Editor, Section.Sidebar],
  ],
  [[Section.Sidebar], [Section.Editor], true, [Section.Editor]],
  [
    [Section.SidebarInput, Section.Sidebar],
    [Section.Editor],
    false,
    [Section.Editor, Section.SidebarInput],
  ],
])(
  "useStore focus (original: %s new: %s overwrite: %s expected: %s)",
  async (focused, toFocus, overwrite, expected) => {
    const r = createStore({
      focused,
    });

    r.current.on("app.toggleSidebar", (ev, ctx) => {
      ctx.focus(toFocus, { overwrite });
    });

    await act(async () => {
      await r.current.dispatch("app.toggleSidebar");
    });

    expect(r.current.state.focused).toEqual(expected);
  },
);

test("useStore dispatch", async () => {
  const r = createStore();
  const { current: store } = r;
  const listener1 = jest.fn().mockResolvedValue({});
  const listener2 = jest.fn().mockResolvedValue({});

  await act(async () => {
    store.on("app.toggleSidebar", listener1);
    store.on("app.toggleSidebar", listener2);
    await store.dispatch("app.toggleSidebar");
  });

  expect(listener1).toHaveBeenCalled();
  expect(listener2).toHaveBeenCalled();
  listener1.mockReset();
  listener2.mockReset();

  await act(async () => {
    store.off("app.toggleSidebar", listener1);
    store.on("app.toggleSidebar", listener2);
    await store.dispatch("app.toggleSidebar");
  });

  expect(listener1).not.toHaveBeenCalled();
  expect(listener2).toHaveBeenCalled();
});

test("useStore saves UI to file", async () => {
  const r = createStore();
  const { current: store } = r;

  const onToggle: Listener<"app.toggleSidebar"> = (ev, ctx) => {
    ctx.setUI({
      sidebar: {
        hidden: true,
      },
    });
  };

  await act(async () => {
    store.on("app.toggleSidebar", onToggle);
    await store.dispatch("app.toggleSidebar");
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((window as any).ipc).toHaveBeenCalledWith(
    "app.saveAppState",
    expect.objectContaining({
      sidebar: expect.objectContaining({
        hidden: true,
      }),
    }),
  );
});
