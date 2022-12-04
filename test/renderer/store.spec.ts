import { act } from "@testing-library/react-hooks";
import { Listener } from "../../src/renderer/store";
import { Section } from "../../src/shared/ui/app";
import { createStore } from "../__factories__/store";

test("useStore listeners are added and removed", async () => {
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
