import { act, renderHook } from "@testing-library/react-hooks";
import { DeepPartial } from "tsdef";
import { Listener, State, useStore } from "../../src/renderer/store";
import { createState } from "../__factories__/state";

test("useStore listeners are added and removed", async () => {
  const r = renderStoreHook();
  const {
    result: { current: store },
  } = r;
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
  const r = renderStoreHook();
  const {
    result: { current: store },
  } = r;

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
    })
  );
});

function renderStoreHook(state?: DeepPartial<State>) {
  return renderHook(() => useStore(createState(state)));
}
