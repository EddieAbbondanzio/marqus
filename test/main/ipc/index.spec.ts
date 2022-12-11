import { isFunction } from "lodash";
import { initPlugins, AppContext, IpcMainTS } from "../../../src/main/ipc";
import { sleep } from "../../../src/shared/utils";
import { MockedIpcMainTS } from "../../__factories__/ipc";

test("initPlugins", async () => {
  const syncOnDispose = jest.fn();
  const asyncOnDispose = jest.fn().mockImplementation(async () => {
    await sleep(0);
  });

  const plugins = [
    // no onInit, no onDispose
    { "app.inspectElement": jest.fn() },
    // sync onInit, no onDispose
    { onInit: jest.fn() },
    // sync onInit, sync onDispose
    { onInit: jest.fn().mockReturnValue(syncOnDispose) },
    // sync onInit, async onDispose
    { onInit: jest.fn().mockReturnValue(() => asyncOnDispose) },
    // async onInit, no onDispose,
    { onInit: jest.fn().mockResolvedValue(undefined) },
    // async onInit, sync onDispose,
    {
      onInit: jest.fn().mockImplementation(async () => {
        await sleep(0);
        return syncOnDispose;
      }),
    },
    // async onInit, async onDispose,
    {
      onInit: jest.fn().mockImplementation(async () => {
        await sleep(0);
        return asyncOnDispose;
      }),
    },
  ];

  const ipc = new MockedIpcMainTS();

  const onDisposePromise = initPlugins(
    plugins,
    ipc,
    {} as unknown as AppContext,
  );

  jest.runAllTimers();

  const onDispose = await onDisposePromise;
  expect(isFunction(onDispose)).toBe(true);

  expect(plugins[1].onInit).toHaveBeenCalled();
  expect(plugins[2].onInit).toHaveBeenCalled();
  expect(plugins[3].onInit).toHaveBeenCalled();
  expect(plugins[4].onInit).toHaveBeenCalled();
  expect(plugins[5].onInit).toHaveBeenCalled();
  expect(plugins[6].onInit).toHaveBeenCalled();

  expect(syncOnDispose).not.toHaveBeenCalled();
  expect(asyncOnDispose).not.toHaveBeenCalled();

  expect(ipc.handlers["app.inspectElement"]).not.toBe(undefined);

  await onDispose();

  expect(syncOnDispose).toHaveBeenCalled();
  expect(asyncOnDispose).toHaveBeenCalled();

  expect(ipc.handlers["app.inspectElement"]).toBe(undefined);
});
